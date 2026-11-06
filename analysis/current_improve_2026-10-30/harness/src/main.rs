// turnhost: run a compiled CAMBC bot (wasm) inside an exact re-simulation of a recorded match.
//
// The match is rebuilt in a live engine game from its map: the recorded draft, then every champion turn in
// recorded order. One team's champions are played by the bot under test, with Wasmtime fuel sliced like the
// official runner. Two modes:
//   shadow (rounds before --live-from): the bot acts on the live game (engine-validated), its actions are
//          recorded, then undone and replaced by the recorded actions, so the game never leaves the replay.
//          The bot keeps its internal state warm and every decision is checked against what was played.
//   live   (from --live-from): the bot's actions stand. Every other champion replays its recorded actions
//          for that (round, champion) where the engine still accepts them. This is a counterfactual
//          rollout from the exact recorded state.
//
//   turnhost --engine tools/engines/v1_0_3.wasm --map maps/x.map26a --replay game.repl26a --bot bot.wasm --team 1
//            [--live-from R] [--to R] [--quantum 100000] [--out turns.jsonl] [--log BYTES] [--observe]
mod eng;
mod host;
mod replay;

use anyhow::{anyhow, bail, Result};
use eng::{Eng, CHAMPION_TYPES};
use host::{add_env, Bot, BotState, Ctl};
use replay::{apply, record, RTurn, Recorded};
use std::collections::HashMap;
use std::io::Write;
use std::sync::{Arc, Mutex};
use wasmtime::*;

fn jstr(s: &str) -> String {
    let mut o = String::with_capacity(s.len() + 2);
    o.push('"');
    for ch in s.chars() {
        match ch {
            '"' => o.push_str("\\\""),
            '\\' => o.push_str("\\\\"),
            '\n' => o.push_str("\\n"),
            c if (c as u32) < 0x20 => o.push_str(&format!("\\u{:04x}", c as u32)),
            c => o.push(c),
        }
    }
    o.push('"');
    o
}
fn jarr(v: &[String]) -> String { format!("[{}]", v.iter().map(|s| jstr(s)).collect::<Vec<_>>().join(",")) }

fn read_replay(path: &str) -> Result<Vec<u8>> {
    let b = std::fs::read(path).map_err(|e| anyhow!("read {path}: {e}"))?;
    if b.len() > 2 && b[0] == 0x50 && b[1] == 0x4b {
        let out = std::process::Command::new("unzip").args(["-p", path, "replay.repl26a"]).output()?;
        if !out.status.success() { bail!("unzip {path}"); }
        return Ok(out.stdout);
    }
    Ok(b)
}

// Step the live game to the next champion input boundary: Some((team, round, champion)), None when finished.
fn boundary(e: &mut Eng) -> Result<Option<(u32, u32, u32)>> {
    let dbg = std::env::var("TURNHOST_DEBUG").is_ok();
    for k in 0..1_000_000 {
        let (phase, team, round, champ) = e.runner();
        if dbg && k < 20 { eprintln!("runner {phase} {team} {round} {champ}"); }
        if k % 4096 == 4095 {
            let g = e.game;
            let st = e.state_of(g);
            if st.phase == 11 || st.outcome != 0 { return Ok(None); }
        }
        if phase == 1 && champ >= 0 { return Ok(Some((team, round, champ as u32))); }
        let g = e.game;
        let rc = e.try_call("Game_Runner_Step", &[Val::I64(g)])?;
        if rc != 0 {
            let st = e.state_of(g);
            if st.phase == 11 || st.outcome != 0 { return Ok(None); }
            bail!("Game_Runner_Step: {rc} {}", e.err_msg());
        }
    }
    bail!("no input boundary")
}

fn end_turn(e: &mut Eng, reason: i32) -> Result<()> {
    let g = e.game;
    let rc = e.try_call("Game_Runner_EndTurn", &[Val::I64(g), Val::I32(reason)])?;
    if rc != 0 { bail!("EndTurn: {rc} {}", e.err_msg()); }
    Ok(())
}

fn live_draft(e: &mut Eng, drafts: &[Vec<i32>; 2]) -> Result<()> {
    for _ in 0..20 {
        let (phase, team, round, _) = e.runner();
        if phase != 0 { return Ok(()); }
        let pick = *drafts[team as usize].get(round as usize).ok_or_else(|| anyhow!("no recorded pick {team}/{round}"))?;
        let g = e.game;
        let rc = e.call("Game_Action_Draft", &[Val::I64(g), Val::I32(pick)]);
        if rc != 0 { bail!("draft {pick}: {rc} {}", e.err_msg()); }
        end_turn(e, 0)?;
    }
    bail!("draft did not finish")
}

fn apply_turn(e: &mut Eng, t: &RTurn) -> Result<u32> {
    let mut rejected = 0;
    for a in &t.acts {
        let rc = apply(e, t.champ, a)?;
        if rc != 0 {
            rejected += 1;
            if std::env::var("TURNHOST_REJECTS").is_ok() { let m = e.err_msg(); eprintln!("rejected r{} champ {} {:?}: {rc} {m}", t.round, t.champ, a); }
        }
    }
    Ok(rejected)
}

// Rebuild the live game after an engine trap: replay recorded turns [0, upto) and stop at turn `upto`.
fn rebuild(engine_wasm: &str, rbytes: &[u8], map: &[u8], rec: &Recorded, upto: usize) -> Result<Eng> {
    let mut e = Eng::new(engine_wasm, rbytes, map)?;
    let g = e.game;
    e.call("Game_Runner_Init", &[Val::I64(g)]);
    live_draft(&mut e, &rec.drafts)?;
    for t in &rec.turns[..upto] {
        boundary(&mut e)?.ok_or_else(|| anyhow!("rebuild ended early"))?;
        apply_turn(&mut e, t)?;
        end_turn(&mut e, t.reason)?;
    }
    Ok(e)
}

// Board context of a champion turn as its team sees it: self (hp, cooldowns, state bits), visible allies and
// enemies, and camps within 8 tiles. Used by decision audits.
fn context(e: &mut Eng, st: &eng::St, team: u32, champ: u32) -> String {
    let g = e.game;
    let s = e.slots[6];
    let mut cd = [-1i32; 2];
    e.set_persp(team, champ as i32);
    let p = e.persp;
    for slot in 0..2 {
        if e.call("Game_API_Champion_GetCooldown", &[Val::I64(g), Val::I32(p), Val::I32(champ as i32), Val::I32(slot), Val::I32(s)]) == 0 { cd[slot as usize] = e.r32(s) as i32; }
    }
    let mut state = 0u32;
    if e.call("Game_API_Champion_Get", &[Val::I64(g), Val::I32(p), Val::I32(champ as i32), Val::I32(s)]) == 0 { state = e.r32(s + 40); }
    let me = st.ch.iter().find(|c| c.idx == champ);
    let mp = me.and_then(|c| c.pos);
    let mut allies = vec![];
    let mut enemies = vec![];
    for c in &st.ch {
        if c.idx == champ || !c.alive { continue; }
        let Some(pos) = c.pos else { continue };
        // Visible from this champion's perspective?
        let vis = e.call("Game_API_Champion_Get", &[Val::I64(g), Val::I32(p), Val::I32(c.idx as i32), Val::I32(s)]) == 0;
        if !vis { continue; }
        let mut ccd = [-1i32; 2];
        for slot in 0..2 {
            if e.call("Game_API_Champion_GetCooldown", &[Val::I64(g), Val::I32(p), Val::I32(c.idx as i32), Val::I32(slot), Val::I32(s)]) == 0 { ccd[slot as usize] = e.r32(s) as i32; }
        }
        let row = format!("[{},{},{},{},{},{},{},{},{}]", jstr(CHAMPION_TYPES.get(c.typ as usize).copied().unwrap_or("?")), c.idx, pos.0, pos.1, c.hp.round(), c.mhp.round(), c.gems, ccd[0], ccd[1]);
        if c.team == team { allies.push(row) } else { enemies.push(row) }
    }
    let mut camps = vec![];
    if let Some((x, y)) = mp {
        for cp in &st.camps {
            if cp.hp <= 0.0 || (cp.pos.0 - x).abs().max((cp.pos.1 - y).abs()) > 8 { continue; }
            let vis = e.call("Game_API_Camp_Get", &[Val::I64(g), Val::I32(p), Val::I32(cp.idx as i32), Val::I32(s)]) == 0;
            if !vis { continue; }
            let mut cs = 0u32;
            if e.call("Game_API_Camp_GetState", &[Val::I64(g), Val::I32(p), Val::I32(cp.idx as i32), Val::I32(s)]) == 0 { cs = e.r32(s); }
            camps.push(format!("[{},{},{},{},{},{}]", cp.idx, cp.typ, cp.pos.0, cp.pos.1, cp.hp.round(), cs));
        }
    }
    format!("{{\"cd\":[{},{}],\"state\":{state},\"allies\":[{}],\"enemies\":[{}],\"camps\":[{}],\"sub\":[{},{}]}}",
            cd[0], cd[1], allies.join(","), enemies.join(","), camps.join(","), st.submitted[0], st.submitted[1])
}

fn main() -> Result<()> {
    let args: Vec<String> = std::env::args().collect();
    let opt = |k: &str| args.iter().position(|a| a == k).and_then(|i| args.get(i + 1)).cloned();
    let engine_wasm = opt("--engine").ok_or_else(|| anyhow!("--engine"))?;
    let bot_wasm = opt("--bot").ok_or_else(|| anyhow!("--bot"))?;
    let replay_path = opt("--replay").ok_or_else(|| anyhow!("--replay"))?;
    let map_path = opt("--map").ok_or_else(|| anyhow!("--map"))?;
    let team: u32 = opt("--team").ok_or_else(|| anyhow!("--team"))?.parse()?;
    let live_from: u32 = opt("--live-from").map(|s| s.parse()).transpose()?.unwrap_or(u32::MAX);
    // With --opp-bot: the opponent bot stays in shadow (recorded actions applied) until this round, then acts.
    let opp_from: u32 = opt("--opp-from").map(|s| s.parse()).transpose()?.unwrap_or(0);
    let to: u32 = opt("--to").map(|s| s.parse()).transpose()?.unwrap_or(u32::MAX);
    let q: u64 = opt("--quantum").map(|s| s.parse()).transpose()?.unwrap_or(100_000);
    let host_charges = !args.iter().any(|a| a == "--no-host-charges");
    let log_bytes: usize = opt("--log").map(|s| s.parse()).transpose()?.unwrap_or(600);
    let mut out: Box<dyn Write> = match opt("--out") { Some(p) => Box::new(std::io::BufWriter::new(std::fs::File::create(p)?)), None => Box::new(std::io::stdout()) };
    let t0 = std::time::Instant::now();

    let rbytes = read_replay(&replay_path)?;
    let map = std::fs::read(&map_path)?;
    let mut e0 = Eng::new(&engine_wasm, &rbytes, &map)?;
    e0.self_test()?;
    let rec = record(&mut e0);
    let by_key: HashMap<(u32, u32), usize> = rec.turns.iter().enumerate().map(|(i, t)| ((t.round, t.champ), i)).collect();
    eprintln!("recorded {} turns, final round {}, submitted {:?}, draft {:?}", rec.turns.len(), rec.final_round, rec.submitted, rec.drafts);
    let eng = Arc::new(Mutex::new(e0));

    let mut cfg = Config::new();
    cfg.consume_fuel(true);
    // The official runner's per-operator fuel table (extracted from its compile cache by probe_cache).
    let costs = opt("--costs").unwrap_or_else(|| format!("{}/../fuel_costs_cli.postcard", env!("CARGO_MANIFEST_DIR")));
    if let Ok(b) = std::fs::read(&costs) {
        let table: wasmtime::OperatorCost = postcard::from_bytes(&b)?;
        if args.iter().any(|a| a == "--dump-costs") {
            println!("{table:#?}");
            return Ok(());
        }
        cfg.operator_cost(table);
    } else {
        eprintln!("warning: no operator cost table at {costs}; using wasmtime defaults");
    }
    cfg.wasm_exceptions(true);
    cfg.max_wasm_stack(4 << 20);
    cfg.async_stack_size(64 << 20);
    let bengine = Engine::new(&cfg)?;
    let mut linker: Linker<BotState> = Linker::new(&bengine);
    eng::add_wasi(&mut linker, |st: &mut BotState, _fd, b| {
        let mut k = st.ctl.lock().unwrap();
        if k.out.len() < 1 << 16 { k.out.push_str(&String::from_utf8_lossy(b)); }
    })?;
    add_env(&mut linker)?;
    // Bot per team: ours always, the opponent's only with --opp-bot (otherwise it replays its recorded actions).
    let mut modules: [Option<Module>; 2] = [None, None];
    modules[team as usize] = Some(eng::load_module(&bengine, &bot_wasm)?);
    if let Some(p) = opt("--opp-bot") { modules[1 - team as usize] = Some(eng::load_module(&bengine, &p)?); }
    for m in modules.iter().flatten() { linker.define_unknown_imports_as_traps(m)?; }
    let detail = args.iter().any(|a| a == "--detail");

    let shared = [Arc::new(Mutex::new(vec![0u8; 8])), Arc::new(Mutex::new(vec![0u8; 8]))];
    let draft = [Arc::new(Mutex::new(vec![0u8; 1024])), Arc::new(Mutex::new(vec![0u8; 1024]))];
    let mk = |t: u32, champ: i32| BotState { eng: eng.clone(), ctl: Arc::new(Mutex::new(Ctl { champ, team: t, ..Default::default() })), shared: shared[t as usize].clone(), draft: draft[t as usize].clone() };

    // --observe: no re-simulation. A second engine instance steps the recorded replay itself; at each turn start of
    // --team the bot runs with its SDK calls answered by the replay state from that champion's perspective (exactly
    // what the original bot saw). Bot actions are not applied; each line carries the bot log and the recorded actions.
    if args.iter().any(|a| a == "--observe") {
        let mut eo = Eng::new(&engine_wasm, &rbytes, &map)?;
        eo.game = eo.replay;
        let oeng = Arc::new(Mutex::new(eo));
        let m = modules[team as usize].as_ref().ok_or_else(|| anyhow!("no bot module"))?;
        let mut obots: HashMap<u32, Bot> = HashMap::new();
        let mut n = 0u64;
        loop {
            let s = { let mut e = oeng.lock().unwrap(); if !e.replay_next() { break; } let r = e.replay; e.state_of(r) };
            if s.round > to { break; }
            if !(s.kind == 3 && s.sphase == 14 && s.phase == 10) { continue; }
            let Some(c) = s.ch.iter().find(|c| c.idx == s.cur).cloned() else { continue };
            if c.team != team { continue; }
            let first = !obots.contains_key(&c.idx);
            if first {
                let st = BotState { eng: oeng.clone(), ctl: Arc::new(Mutex::new(Ctl { champ: c.idx as i32, team, ..Default::default() })), shared: shared[team as usize].clone(), draft: draft[team as usize].clone() };
                obots.insert(c.idx, Bot::new(&bengine, m, &linker, st, q, host_charges)?);
            }
            let bot = obots.get_mut(&c.idx).unwrap();
            let r = bot.turn(if first { 2 } else { 1 });
            if let Some(why) = &bot.ended { if r.ended_now { eprintln!("observe: bot for champion {} ended at round {}: {}", c.idx, s.round, why); } }
            let mut log = bot.ctl.lock().unwrap().out.clone();
            if log.len() > log_bytes { let mut cut = log_bytes; while !log.is_char_boundary(cut) { cut -= 1; } log.truncate(cut); }
            let rep = by_key.get(&(s.round, c.idx)).map(|&i| rec.turns[i].names.clone()).unwrap_or_default();
            writeln!(out, "{{\"r\":{},\"id\":{},\"type\":{},\"pos\":[{},{}],\"hp\":{},\"mhp\":{},\"gems\":{},\"fuel\":{},\"rep\":{},\"log\":{}}}",
                s.round, c.idx, jstr(CHAMPION_TYPES.get(c.typ as usize).copied().unwrap_or("?")), c.pos.map(|p| p.0).unwrap_or(-1), c.pos.map(|p| p.1).unwrap_or(-1),
                c.hp.round(), c.mhp.round(), c.gems, r.fuel, jarr(&rep), jstr(&log))?;
            n += 1;
        }
        out.flush()?;
        eprintln!("observe: {n} turns of team {team}, {:.1}s", t0.elapsed().as_secs_f64());
        return Ok(());
    }

    // Live game: initialise, let each bot's draft instance write its team draft memory, draft the recorded picks.
    {
        let mut e = eng.lock().unwrap();
        let g = e.game;
        e.call("Game_Runner_Init", &[Val::I64(g)]);
    }
    for t in 0..2u32 {
        let Some(m) = &modules[t as usize] else { continue };
        let mut d = Bot::new(&bengine, m, &linker, mk(t, -1), q, host_charges)?;
        for k in 0..6 {
            d.turn(if k == 0 { 10 } else { 1 });
            if d.ctl.lock().unwrap().draft_submitted || d.ended.is_some() { break; }
        }
        let k = d.ctl.lock().unwrap();
        eprintln!("team {t} draft instance: memory submitted={} ended={:?}", k.draft_submitted, d.ended);
    }
    live_draft(&mut eng.lock().unwrap(), &rec.drafts)?;

    let mut bots: HashMap<u32, Bot> = HashMap::new();
    let (mut ti, mut lockstep) = (0usize, true);
    let (mut turns, mut same, mut undos, mut rebuilds, mut drift, mut opp_turns, mut opp_same) = (0u64, 0u64, 0u64, 0u64, 0u64, 0u64, 0u64);
    let mut last_state_round = u32::MAX;
    let mut first_drift: Option<u32> = None;
    loop {
        let b = { let mut e = eng.lock().unwrap(); boundary(&mut e)? };
        let Some((cur_team, round, champ)) = b else { break };
        if round > to { break; }
        let mode_live = round >= live_from;
        let expected = by_key.get(&(round, champ)).copied();
        if lockstep {
            if expected != Some(ti) {
                eprintln!("turn order left the replay at round {round} champion {champ} (expected turn {ti})");
                lockstep = false;
            } else if !mode_live {
                // The live game must equal the recorded state at every shadow boundary.
                let mut e = eng.lock().unwrap();
                let g = e.game;
                let st = e.state_of(g);
                if let Some(f) = &rec.turns[ti].full {
                    // Deep check: first differing field per category.
                    let mut diffs = vec![];
                    for (a, b) in f.ch.iter().zip(st.ch.iter()) {
                        if a.gold != b.gold { diffs.push(format!("gold c{} rec {} live {}", a.idx, a.gold, b.gold)); }
                        if a.gems != b.gems { diffs.push(format!("gems c{} rec {} live {}", a.idx, a.gems, b.gems)); }
                        if a.items != b.items { diffs.push(format!("items c{}", a.idx)); }
                        if a.cons != b.cons { diffs.push(format!("cons c{} rec {:?} live {:?}", a.idx, a.cons, b.cons)); }
                        if a.alive != b.alive { diffs.push(format!("alive c{}", a.idx)); }
                    }
                    for (a, b) in f.camps.iter().zip(st.camps.iter()) {
                        if (a.hp - b.hp).abs() > 0.01 || a.pos != b.pos { diffs.push(format!("camp {} rec {:?} {} live {:?} {}", a.idx, a.pos, a.hp, b.pos, b.hp)); }
                    }
                    if f.camps.len() != st.camps.len() { diffs.push(format!("camp count rec {} live {}", f.camps.len(), st.camps.len())); }
                    if f.wards != st.wards { diffs.push(format!("wards rec {:?} live {:?}", f.wards, st.wards)); }
                    if f.submitted != st.submitted { diffs.push(format!("submitted rec {:?} live {:?}", f.submitted, st.submitted)); }
                    if !diffs.is_empty() && drift < 3 { drift += 1; eprintln!("deep diff at round {round} (turn {ti} champ {champ}): {}", diffs.into_iter().take(4).collect::<Vec<_>>().join("; ")); }
                }
                for (cid, pos, hp) in &rec.turns[ti].start {
                    let l = st.ch.iter().find(|c| c.idx == *cid);
                    let ok = match l { Some(c) => c.pos == *pos && (c.hp - hp).abs() < 0.01, None => pos.is_none() };
                    if !ok { drift += 1; first_drift.get_or_insert(round); if drift < 5 { eprintln!("drift at round {round}: champion {cid} live {:?} recorded {:?} {hp}", l.map(|c| (c.pos, c.hp)), pos); } }
                }
            }
        }
        if mode_live && round != last_state_round {
            // One state line per live round for rollout evaluation.
            let mut e = eng.lock().unwrap();
            let g = e.game;
            let st = e.state_of(g);
            // [idx, team, type, x, y, hp, alive, gems, kills, gold, item shards (emblem = 5, Power emblem = 6)]
            let shards = |items: &Vec<u32>| -> u32 { items.iter().enumerate().map(|(i, n)| n * if i % 2 == 1 { if (i / 6) == 1 { 6 } else { 5 } } else { 1 }).sum() };
            let ch: Vec<String> = st.ch.iter().map(|c| format!("[{},{},{},{},{},{},{},{},{},{},{}]", c.idx, c.team, jstr(CHAMPION_TYPES.get(c.typ as usize).copied().unwrap_or("?")),
                c.pos.map(|p| p.0).unwrap_or(-1), c.pos.map(|p| p.1).unwrap_or(-1), c.hp.round(), c.alive, c.gems, c.kills, c.gold, shards(&c.items))).collect();
            writeln!(out, "{{\"state\":{round},\"sub\":[{},{}],\"champs\":[{}]}}", st.submitted[0], st.submitted[1], ch.join(","))?;
            last_state_round = round;
        }
        let rturn = expected.map(|i| rec.turns[i].clone());
        if let Some(m) = &modules[cur_team as usize] {
            let ours = cur_team == team;
            let mode_live = mode_live && (ours || round >= opp_from);
            let first = !bots.contains_key(&champ);
            if first { bots.insert(champ, Bot::new(&bengine, m, &linker, mk(cur_team, champ as i32), q, host_charges)?); }
            let (me, ctx) = {
                let mut e = eng.lock().unwrap();
                let g = e.game;
                let st = e.state_of(g);
                let ctx = if detail && ours { context(&mut e, &st, cur_team, champ) } else { String::new() };
                (st.ch.iter().find(|c| c.idx == champ).cloned(), ctx)
            };
            let bot = bots.get_mut(&champ).unwrap();
            let r = bot.turn(if first { 2 } else { 1 });
            let (acts, failed, firstp, log, calls) = { let k = bot.ctl.lock().unwrap(); (k.acts.clone(), k.failed.clone(), k.first, k.out.clone(), k.calls) };
            let rep_names = rturn.as_ref().map(|t| t.names.clone()).unwrap_or_default();
            let norm = |v: &[String]| -> Vec<String> { v.iter().filter(|a| !a.starts_with("prio") && !a.starts_with("buy") && !a.starts_with("sell") && !a.starts_with("blocked")).cloned().collect() };
            let m = norm(&acts) == norm(&rep_names);
            if ours { turns += 1; if m { same += 1; } } else { opp_turns += 1; if m { opp_same += 1; } }
            let reason;
            if !mode_live {
                // Shadow: undo the bot's actions, play the recorded ones.
                if let Some((tl, pos, sub)) = firstp {
                    undos += 1;
                    let res = { let mut e = eng.lock().unwrap(); let g = e.game; e.try_call("Game_Visualiser_Timeline_DeleteAction", &[Val::I64(g), Val::I64(tl as i64), Val::I32(pos as i32), Val::I32(sub as i32)]) };
                    if !matches!(res, Ok(0)) {
                        rebuilds += 1;
                        let ne = rebuild(&engine_wasm, &rbytes, &map, &rec, ti)?;
                        *eng.lock().unwrap() = ne;
                        let bnd = { let mut e = eng.lock().unwrap(); boundary(&mut e)? };
                        if bnd != Some((cur_team, round, champ)) { bail!("rebuild reached {bnd:?}, wanted round {round} champion {champ}"); }
                    }
                }
                if let Some(t) = &rturn { apply_turn(&mut eng.lock().unwrap(), t)?; }
                reason = rturn.as_ref().map(|t| t.reason).unwrap_or(0);
            } else {
                reason = if r.preempted { 1 } else if r.ended_now || bot.ended.is_some() { 2 } else { 0 };
            }
            end_turn(&mut eng.lock().unwrap(), reason)?;
            if ours {
                let mut log = log;
                if log.len() > log_bytes { let mut cut = log_bytes; while !log.is_char_boundary(cut) { cut -= 1; } log.truncate(cut); }
                let me_s = me.map(|c| format!("\"type\":{},\"pos\":{},\"hp\":{},\"mhp\":{},\"gems\":{},\"alive\":{}", jstr(CHAMPION_TYPES.get(c.typ as usize).copied().unwrap_or("?")),
                    c.pos.map(|p| format!("[{},{}]", p.0, p.1)).unwrap_or("null".into()), c.hp.round(), c.mhp.round(), c.gems, c.alive)).unwrap_or("\"type\":null".into());
                writeln!(out, "{{\"r\":{round},\"id\":{champ},{me_s},\"mode\":\"{}\",\"fuel\":{},\"calls\":{calls},\"pre\":{},\"match\":{m},\"bot\":{},\"failed\":{},\"rep\":{},\"log\":{}{}{}}}",
                         if mode_live { "live" } else { "shadow" }, r.fuel, r.preempted, jarr(&acts), jarr(&failed), jarr(&rep_names), jstr(&log),
                         if ctx.is_empty() { String::new() } else { format!(",\"ctx\":{ctx}") },
                         bot.ended.as_ref().map(|e| format!(",\"ended\":{}", jstr(e))).unwrap_or_default())?;
            }
        } else {
            let reason = match &rturn {
                Some(t) => { apply_turn(&mut eng.lock().unwrap(), t)?; if lockstep { t.reason } else { 0 } }
                None => 0,
            };
            end_turn(&mut eng.lock().unwrap(), reason)?;
        }
        if lockstep { ti += 1; }
    }
    {
        let mut e = eng.lock().unwrap();
        let g = e.game;
        let final_st = e.state_of(g);
        writeln!(out, "{{\"final\":true,\"round\":{},\"outcome\":{},\"submitted\":[{},{}]}}", final_st.round, final_st.outcome, final_st.submitted[0], final_st.submitted[1])?;
    }
    out.flush()?;
    eprintln!("bot turns {turns}, identical to recorded {same} ({:.1}%), opponent bot turns {opp_turns} identical {opp_same}, undos {undos}, rebuilds {rebuilds}, state drift {drift}, first drift round {}, {:.1}s",
              100.0 * same as f64 / turns.max(1) as f64, first_drift.map(|r| r as i64).unwrap_or(-1), t0.elapsed().as_secs_f64());
    Ok(())
}
