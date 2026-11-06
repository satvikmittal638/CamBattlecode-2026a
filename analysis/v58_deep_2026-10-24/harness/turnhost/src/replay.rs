// Recorded turns: every champion turn of the replay with its actions (targets resolved against the state
// before each step) and how it ended, plus the champions' state at its start for lockstep checks.
use crate::eng::{Eng, St, ITEM_TYPES};
use wasmtime::Val;

#[derive(Clone, Debug)]
pub enum RAct {
    Move(i32, i32),
    // A move the recorded game reported as blocked by a hidden unit (which it revealed).
    Blocked(i32, i32),
    // Champion/camp target, or None for an altar lock looked up by tile at apply time.
    Attack(Option<(u32, u32)>, i32, i32),
    Cast(u32, Option<(u32, u32)>, i32, i32),
    Prio(i32),
    Recall,
    Cancel,
    Submit(i32, i32),
    // Recorded inventory, consumable delta, items before the step and gold after the step.
    Shop(Vec<u32>, [i32; 4], Vec<u32>, u32),
    Sell(Vec<u32>),
    Ward(i32, i32),
    UseCons(u32, i32, i32),
}

#[derive(Clone, Debug)]
pub struct RTurn {
    pub round: u32,
    pub champ: u32,
    pub team: u32,
    pub acts: Vec<RAct>,
    pub names: Vec<String>,
    pub reason: i32,
    pub start: Vec<(u32, Option<(i32, i32)>, f32)>,
    pub full: Option<St>,
}

pub struct Recorded {
    pub drafts: [Vec<i32>; 2],
    pub turns: Vec<RTurn>,
    pub final_round: u32,
    pub submitted: [u64; 2],
}

fn unit_at(b: &St, x: i32, y: i32) -> Option<(u32, u32)> {
    if let Some(c) = b.ch.iter().find(|c| c.alive && c.pos == Some((x, y))) { return Some((1, c.idx)); }
    if let Some(c) = b.camps.iter().find(|c| c.pos == (x, y) && c.hp > 0.0) { return Some((2, c.idx)); }
    None
}

pub fn record(e: &mut Eng) -> Recorded {
    let mut turns: Vec<RTurn> = Vec::new();
    let mut cur: Option<usize> = None;
    let mut drafts = [vec![], vec![]];
    let rg = e.replay;
    let mut before = e.state_of(rg);
    let mut last = before.clone();
    while e.replay_next() {
        let s = e.state_of(rg);
        if drafts[0].is_empty() && s.phase != 12 && s.round >= 1 { drafts = s.drafts.clone(); }
        if s.kind == 3 && s.sphase == 14 && s.phase == 10 {
            if let Some(c) = s.ch.iter().find(|c| c.idx == s.cur) {
                let full = if std::env::var("TURNHOST_DEEPCHECK").is_ok() { Some(s.clone()) } else { None };
                turns.push(RTurn { round: s.round, champ: c.idx, team: c.team, acts: vec![], names: vec![], reason: 0, start: s.ch.iter().map(|c| (c.idx, c.pos, c.hp)).collect(), full });
                cur = Some(turns.len() - 1);
            }
        } else if let Some(ti) = cur {
            let cid = turns[ti].champ;
            if s.actor_kind == 1 && s.actor == cid {
                let to = s.to;
                let mine = |st: &St| st.ch.iter().find(|c| c.idx == cid).cloned();
                let a = match s.kind {
                    8 | 26 | 27 => {
                        turns[ti].reason = match s.kind { 8 => 0, 26 => 1, _ => 2 };
                        cur = None;
                        None
                    }
                    4 => Some((RAct::Move(to.0, to.1), format!("move {},{}", to.0, to.1))),
                    5 => Some((RAct::Attack(unit_at(&before, to.0, to.1), to.0, to.1), format!("attack {},{}", to.0, to.1))),
                    6 => {
                        let slot = s.slot.unwrap_or(0);
                        Some((RAct::Cast(slot, unit_at(&before, to.0, to.1), to.0, to.1), format!("cast{slot} {},{}", to.0, to.1)))
                    }
                    9 => Some((RAct::Prio(s.prio), format!("prio {}", s.prio))),
                    11 => Some((RAct::Recall, "recall".into())),
                    12 => Some((RAct::Submit(to.0, to.1), format!("submit {},{}", to.0, to.1))),
                    13 => {
                        let (a, z) = (mine(&before), mine(&s));
                        match (a, z) {
                            (Some(a), Some(z)) => {
                                let mut d = [0i32; 4];
                                for q in 0..4 { d[q] = z.cons[q] as i32 - a.cons[q] as i32; }
                                Some((RAct::Shop(z.items.clone(), d, a.items.clone(), z.gold), "buy".into()))
                            }
                            _ => None,
                        }
                    }
                    25 => mine(&s).map(|z| (RAct::Sell(z.items.clone()), "sell".into())),
                    14 => Some((RAct::Ward(to.0, to.1), format!("ward {},{}", to.0, to.1))),
                    15 | 20 | 21 => {
                        let id = match s.kind {
                            20 => 2,
                            21 => 0,
                            _ => match (mine(&before), mine(&s)) {
                                (Some(a), Some(z)) => (0..4).find(|&q| z.cons[q] < a.cons[q]).unwrap_or(0) as u32,
                                _ => 0,
                            },
                        };
                        Some((RAct::UseCons(id, to.0, to.1), format!("consumable{id} {},{}", to.0, to.1)))
                    }
                    16 => Some((RAct::Cancel, "cancel".into())),
                    23 => Some((RAct::Blocked(to.0, to.1), "blocked".into())),
                    _ => None,
                };
                if let Some((a, n)) = a {
                    turns[ti].acts.push(a);
                    turns[ti].names.push(n);
                }
            }
        }
        before = s.clone();
        last = s;
        if last.phase == 11 { break; }
    }
    Recorded { drafts, turns, final_round: last.round, submitted: last.submitted }
}

// Item counts of a champion in the live game (spectator perspective).
pub fn live_items(e: &mut Eng, cid: u32) -> Vec<u32> {
    e.set_persp(2, -1);
    let (g, p, s) = (e.game, e.persp, e.slots[6]);
    if e.call("Game_API_Champion_GetItems", &[Val::I64(g), Val::I32(p), Val::I32(cid as i32), Val::I32(s), Val::I32(ITEM_TYPES as i32)]) != 0 { return vec![0; ITEM_TYPES]; }
    (0..ITEM_TYPES).map(|q| e.r32(s + 4 * q as i32)).collect()
}

// Handle of the altar lock on a tile, as seen by the acting champion.
fn lock_at(e: &mut Eng, cid: u32, x: i32, y: i32) -> Option<u32> {
    let team = { let g = e.game; let s = e.slots[6]; e.set_persp(2, -1); let p = e.persp;
        if e.call("Game_API_Champion_GetIdentity", &[Val::I64(g), Val::I32(p), Val::I32(cid as i32), Val::I32(s)]) != 0 { return None; } e.r32(s) };
    e.set_persp(team, cid as i32);
    let (g, p, s0, s1) = (e.game, e.persp, e.slots[6], e.slots[7]);
    if e.call("Game_API_GetAltarLocks", &[Val::I64(g), Val::I32(p), Val::I32(s0), Val::I32(64), Val::I32(s1)]) != 0 { return None; }
    let n = e.r32(s1).min(64) as i32;
    (0..n).find_map(|k| {
        let b = s0 + 24 * k;
        (e.r32(b + 12) as i32 == x && e.r32(b + 16) as i32 == y).then(|| e.r32(b + 4))
    })
}

// Apply one recorded action to the live game; returns the engine code (0 = accepted).
pub fn apply(e: &mut Eng, cid: u32, a: &RAct) -> anyhow::Result<i32> {
    let g = e.game;
    let o = e.out;
    Ok(match a {
        RAct::Move(x, y) => e.try_call("Game_Action_Move", &[Val::I64(g), Val::I32(*x), Val::I32(*y), Val::I32(o)])?,
        RAct::Blocked(x, y) => {
            // Replay the attempt for its reveal; if the live engine actually moves, take the move back.
            let rc = e.try_call("Game_Action_Move", &[Val::I64(g), Val::I32(*x), Val::I32(*y), Val::I32(o)])?;
            if rc == 0 && e.r32(o) != 0 {
                let (tl, pos, sub) = e.point();
                e.try_call("Game_Visualiser_Timeline_DeleteAction", &[Val::I64(g), Val::I64(tl as i64), Val::I32(pos as i32), Val::I32(sub as i32)])?;
            }
            0
        }
        RAct::Attack(t, x, y) => {
            let (k, i) = match t {
                Some(t) => *t,
                None => match lock_at(e, cid, *x, *y) { Some(h) => (6, h), None => return Ok(-1) },
            };
            let p = e.ent(k, i);
            e.try_call("Game_Action_Attack", &[Val::I64(g), Val::I32(p)])?
        }
        RAct::Cast(slot, t, x, y) => {
            let (k, i) = t.unwrap_or((0, 0));
            let pe = e.ent(k, i);
            let pp = e.pos(*x, *y);
            let mut rc = e.try_call("Game_Action_Cast", &[Val::I64(g), Val::I32(*slot as i32), Val::I32(pe), Val::I32(pp), Val::I32(o)])?;
            if rc != 0 && t.is_some() {
                let pe = e.ent(0, 0);
                let pp = e.pos(*x, *y);
                rc = e.try_call("Game_Action_Cast", &[Val::I64(g), Val::I32(*slot as i32), Val::I32(pe), Val::I32(pp), Val::I32(o)])?;
            }
            rc
        }
        RAct::Prio(p) => e.try_call("Game_Action_SetPriority", &[Val::I64(g), Val::I32(*p)])?,
        RAct::Recall => e.try_call("Game_Action_Recall", &[Val::I64(g)])?,
        RAct::Cancel => e.try_call("Game_Action_CancelChannel", &[Val::I64(g)])?,
        RAct::Submit(x, y) => {
            let pp = e.pos(*x, *y);
            e.try_call("Game_Action_SubmitGems", &[Val::I64(g), Val::I32(pp)])?
        }
        RAct::Shop(target, cons, before, gold) => {
            // One recorded shop step is one purchase call. Consumables: buy the slot that grew (engine ids are
            // replay slots: 0 tp crystal, 2 altar lock). Items: the engine's shard/emblem accounting is not
            // modelled, so try candidate (item, count) purchases and keep the one whose inventory and gold
            // match the recording, deleting wrong guesses from the live timeline.
            if let Some(q) = (0..4).find(|&q| cons[q] > 0) {
                return Ok(e.try_call("Game_Action_BuyConsumable", &[Val::I64(g), Val::I32(q as i32)])?);
            }
            // First guess: shards bought = growth in shard-equivalents of the family (5 shards per emblem).
            let mut cands: Vec<(i32, i32)> = vec![];
            for f in (0..ITEM_TYPES).step_by(2) {
                let eq = |v: &Vec<u32>| v[f] as i32 + 5 * v[f + 1] as i32;
                let n = eq(target) - eq(before);
                if n > 0 { cands.push((f as i32, n)); }
            }
            for q in 0..ITEM_TYPES {
                if target[q] == before[q] { continue; }
                for item in [q as i32, if q % 2 == 1 { q as i32 - 1 } else { q as i32 + 1 }] {
                    for n in 1..=30 {
                        if !cands.contains(&(item, n)) { cands.push((item, n)); }
                    }
                }
            }
            let mut last = -1;
            for (item, n) in cands {
                let rc = e.try_call("Game_Action_BuyItem", &[Val::I64(g), Val::I32(item), Val::I32(n)])?;
                last = rc;
                if rc != 0 { continue; }
                let st = e.state_of(g);
                let me = st.ch.iter().find(|c| c.idx == cid);
                if me.is_some_and(|c| c.items == *target && c.gold == *gold) { return Ok(0); }
                let (tl, pos, sub) = e.point();
                if e.try_call("Game_Visualiser_Timeline_DeleteAction", &[Val::I64(g), Val::I64(tl as i64), Val::I32(pos as i32), Val::I32(sub as i32)])? != 0 { return Ok(-2); }
            }
            if std::env::var("TURNHOST_REJECTS").is_ok() { eprintln!("shop: no purchase reproduces champ {cid} target gold {gold}"); }
            last
        }
        RAct::Sell(target) => {
            let mut rc = 0;
            for _ in 0..12 {
                let have = live_items(e, cid);
                let Some(i) = (0..ITEM_TYPES).find(|&q| target[q] < have[q]) else { break };
                rc = e.try_call("Game_Action_Sell", &[Val::I64(g), Val::I32(i as i32)])?;
                if rc != 0 { break; }
            }
            rc
        }
        RAct::Ward(x, y) => {
            let pp = e.pos(*x, *y);
            e.try_call("Game_Action_PlaceWard", &[Val::I64(g), Val::I32(pp), Val::I32(o)])?
        }
        RAct::UseCons(id, x, y) => {
            let pp = e.pos(*x, *y);
            e.try_call("Game_Action_UseConsumable", &[Val::I64(g), Val::I32(*id as i32), Val::I32(pp), Val::I32(o)])?
        }
    })
}
