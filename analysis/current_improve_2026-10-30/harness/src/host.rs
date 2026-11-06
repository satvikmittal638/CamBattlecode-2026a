// Bot side: the env imports of a CAMBC bot module bridged to the live game, Wasmtime fuel sliced like the
// official runner (one quantum per turn, 2x on a champion's first turn, preemption resumes next turn).
use crate::eng::{mem_of, rd32, wr32, Eng, ITEM_TYPES};
use anyhow::Result;
use std::future::Future;
use std::pin::Pin;
use std::sync::{Arc, Mutex};
use std::task::{Context, Poll, Waker};
use wasmtime::*;

// Total fuel poured into a bot store once; turns are metered by a ledger, not by refills.
pub const FUEL_POOL: u64 = 1 << 60;
// The store yields every CHECK units of wasm fuel so the driver can end over-budget turns.
pub const CHECK: u64 = 1000;

#[derive(Default)]
pub struct Ctl {
    pub champ: i32,
    pub team: u32,
    pub q: u64,
    pub budget: u64,
    pub base_total: u64,
    pub charges: u64,
    pub host_charges: bool,
    // Fuel total when a debug_block free window started (fuel_pause), if one is open.
    pub paused_at: Option<u64>,
    pub yielded: bool,
    pub used: Option<u64>,
    pub acts: Vec<String>,
    pub failed: Vec<String>,
    pub first: Option<(u64, u32, u32)>,
    pub out: String,
    pub draft_submitted: bool,
    pub initialized: bool,
    pub calls: u64,
    pub bytes: u64,
    pub expansions: u64,
    pub reach: u64,
}

pub struct BotState {
    pub eng: Arc<Mutex<Eng>>,
    pub ctl: Arc<Mutex<Ctl>>,
    pub shared: Arc<Mutex<Vec<u8>>>,
    pub draft: Arc<Mutex<Vec<u8>>>,
}

struct YieldOnce(bool);
impl Future for YieldOnce {
    type Output = ();
    fn poll(mut self: Pin<&mut Self>, _: &mut Context<'_>) -> Poll<()> {
        if self.0 { Poll::Ready(()) } else { self.0 = true; Poll::Pending }
    }
}

#[derive(Clone, Copy)]
enum A { G, P, I(i32), F(f32), S(usize), M }
#[derive(Clone, Copy, PartialEq)]
enum D { In, Out, InOut }
#[derive(Clone, Copy)]
struct Cp { slot: usize, ptr: i32, len: usize, d: D }
fn cp(slot: usize, ptr: i32, len: usize, d: D) -> Cp { Cp { slot, ptr, len, d } }

fn who(c: &Caller<'_, BotState>) -> (u32, i32) {
    let k = c.data().ctl.lock().unwrap();
    (k.team, k.champ)
}

// Copy guest buffers into engine scratch slots, call the engine export, copy outputs back on success.
fn bridge(c: &mut Caller<'_, BotState>, name: &str, args: &[A], cps: &[Cp]) -> i32 {
    let (team, champ) = who(c);
    { let mut k = c.data().ctl.lock().unwrap(); k.bytes += cps.iter().map(|x| x.len as u64).sum::<u64>(); }
    let eng = c.data().eng.clone();
    let mut e = eng.lock().unwrap();
    let mem = mem_of(c);
    let size = mem.data_size(&*c);
    if cps.iter().any(|k| k.ptr < 0 || k.ptr as usize + k.len > size || k.len > e.slot_size) {
        e.last_err = "guest buffer out of bounds".into();
        return 5;
    }
    for k in cps {
        if k.d != D::Out && k.len > 0 && k.ptr != 0 {
            let src = mem.data(&*c)[k.ptr as usize..k.ptr as usize + k.len].to_vec();
            let dst = e.slots[k.slot];
            e.write(dst, &src);
        }
    }
    e.set_persp(team, champ);
    let vals: Vec<Val> = args.iter().map(|a| match *a {
        A::G => Val::I64(e.game),
        A::P => Val::I32(e.persp),
        A::I(v) => Val::I32(v),
        A::F(v) => Val::F32(v.to_bits()),
        A::S(k) => Val::I32(e.slots[k]),
        A::M => Val::I32(e.meta),
    }).collect();
    let rc = match e.try_call(name, &vals) {
        Ok(rc) => rc,
        Err(err) => { e.last_err = format!("{err}"); e.traps += 1; return 5; }
    };
    if rc != 0 {
        e.last_err = e.err_msg();
        return rc;
    }
    for k in cps {
        if k.d != D::In && k.len > 0 && k.ptr != 0 {
            let sp = e.slots[k.slot];
            let b = e.read(sp, k.len);
            mem.data_mut(&mut *c)[k.ptr as usize..k.ptr as usize + k.len].copy_from_slice(&b);
        }
    }
    rc
}

// List outputs: the engine writes a count; copy only the returned elements.
fn bridge_list(c: &mut Caller<'_, BotState>, name: &str, pre: &[A], buf: i32, cap: i32, cnt: i32, elem: usize) -> i32 {
    let (team, champ) = who(c);
    let eng = c.data().eng.clone();
    let mut e = eng.lock().unwrap();
    let capc = (cap.max(0) as usize).min(e.slot_size / elem) as i32;
    e.set_persp(team, champ);
    let mut vals: Vec<Val> = pre.iter().map(|a| match *a {
        A::G => Val::I64(e.game),
        A::P => Val::I32(e.persp),
        A::I(v) => Val::I32(v),
        _ => unreachable!(),
    }).collect();
    vals.push(Val::I32(if buf == 0 { 0 } else { e.slots[0] }));
    vals.push(Val::I32(capc));
    vals.push(Val::I32(e.slots[1]));
    let rc = match e.try_call(name, &vals) {
        Ok(rc) => rc,
        Err(err) => { e.last_err = format!("{err}"); e.traps += 1; return 5; }
    };
    if rc != 0 {
        e.last_err = e.err_msg();
        return rc;
    }
    let (s0, s1) = (e.slots[0], e.slots[1]);
    let n = e.r32(s1);
    let take = (n as usize).min(capc as usize);
    let b = e.read(s0, take * elem);
    drop(e);
    let mem = mem_of(c);
    let d = mem.data_mut(&mut *c);
    if buf != 0 && take > 0 { d[buf as usize..buf as usize + take * elem].copy_from_slice(&b); }
    if cnt != 0 { wr32(d, cnt as usize, n); }
    rc
}

fn put32(c: &mut Caller<'_, BotState>, p: i32, v: u32) {
    let mem = mem_of(c);
    wr32(mem.data_mut(&mut *c), p as usize, v);
}

// Position of a champion (kind 1) or camp (kind 2) handle, for naming targets like the replay does.
fn target_pos(e: &mut Eng, team: u32, champ: i32, kind: i32, handle: i32) -> Option<(i32, i32)> {
    e.set_persp(team, champ);
    let (g, p, s) = (e.game, e.persp, e.slots[7]);
    let rc = match kind {
        1 => e.call("Game_API_Champion_Get", &[Val::I64(g), Val::I32(p), Val::I32(handle), Val::I32(s)]),
        2 => e.call("Game_API_Camp_Get", &[Val::I64(g), Val::I32(p), Val::I32(handle), Val::I32(s)]),
        6 => {
            let cnt=e.slots[6];
            if e.call("Game_API_GetAltarLocks", &[Val::I64(g),Val::I32(p),Val::I32(s),Val::I32(64),Val::I32(cnt)]) != 0 {return None;}
            for i in 0..e.r32(cnt).min(64) {let at=s+24*i as i32;if e.r32(at+4)==handle as u32{return Some((e.r32(at+12) as i32,e.r32(at+16) as i32));}}
            return None;
        }
        _ => -1,
    };
    if rc != 0 { return None; }
    let off = if kind == 1 { 8 } else { 0 };
    Some((e.r32(s + off) as i32, e.r32(s + off + 4) as i32))
}

// Perform an action on the live game and record it (with the engine code when rejected).
fn action(c: &mut Caller<'_, BotState>, name: String, f: impl FnOnce(&mut Eng) -> i32, out: Option<i32>) -> i32 {
    let eng = c.data().eng.clone();
    let ctl = c.data().ctl.clone();
    let (rc, res, point) = {
        let mut e = eng.lock().unwrap();
        let rc = f(&mut e);
        if rc != 0 { e.last_err = e.err_msg(); }
        let o = e.out;
        let res = e.r32(o);
        let point = if rc == 0 { Some(e.point()) } else { None };
        (rc, res, point)
    };
    {
        let mut k = ctl.lock().unwrap();
        if rc == 0 {
            k.acts.push(if out.is_some() && res == 0 { format!("blocked {name}") } else { name });
            if k.first.is_none() { k.first = point; }
        } else {
            k.failed.push(format!("{name} !{rc}"));
        }
    }
    if rc == 0 { if let Some(p) = out { put32(c, p, res); } }
    rc
}

// Fuel used this turn: wasm fuel since the turn started plus host-call charges.
fn fuel_used(c: &Caller<'_, BotState>) -> u64 {
    let k = c.data().ctl.lock().unwrap();
    let now = k.paused_at.unwrap_or_else(|| c.get_fuel().unwrap_or(0));
    k.base_total.saturating_sub(now) + k.charges
}
fn fuel_left(c: &Caller<'_, BotState>) -> u64 {
    let used = fuel_used(c);
    c.data().ctl.lock().unwrap().budget.saturating_sub(used)
}

// Host-call fuel charges measured against the official runner (workspace/bots/fuelcal); c = map chunks.
fn charge(c: &Caller<'_, BotState>, n: u64) {
    let mut k = c.data().ctl.lock().unwrap();
    if k.host_charges && k.paused_at.is_none() { k.charges += n; }
}
fn chunks(c: &Caller<'_, BotState>) -> u64 {
    let e = c.data().eng.lock().unwrap();
    (e.cw as u64) * (e.meta_bytes[12] as u64 | (e.meta_bytes[13] as u64) << 8)
}

pub fn add_env(l: &mut Linker<BotState>) -> Result<()> {
    use A::*;
    use D::*;
    let e = "env";
    macro_rules! bbsz { ($c:expr) => { $c.data().eng.lock().unwrap().bb } }
    macro_rules! dfsz { ($c:expr) => { $c.data().eng.lock().unwrap().df } }

    // --- settings, memories, identity
    l.func_wrap(e, "game_settings", |mut c: Caller<'_, BotState>, out: i32| -> i32 { bridge(&mut c, "Game_API_GetSettings", &[S(0)], &[cp(0, out, 120, Out)]) })?;
    l.func_wrap(e, "shared_memory_size", |mut c: Caller<'_, BotState>, out: i32| -> i32 { let n = c.data().shared.lock().unwrap().len() as u32; put32(&mut c, out, n); 0 })?;
    l.func_wrap(e, "draft_memory_size", |mut c: Caller<'_, BotState>, out: i32| -> i32 { let n = c.data().draft.lock().unwrap().len() as u32; put32(&mut c, out, n); 0 })?;
    l.func_wrap(e, "read_shared_memory", |mut c: Caller<'_, BotState>, off: i32, buf: i32, n: i32| -> i32 {
        charge(&c, (n.max(0) as u64 + 7) / 8);
        let sh = c.data().shared.lock().unwrap().clone();
        if off < 0 || n < 0 || (off + n) as usize > sh.len() { return 19; }
        let mem = mem_of(&mut c);
        mem.data_mut(&mut c)[buf as usize..(buf + n) as usize].copy_from_slice(&sh[off as usize..(off + n) as usize]);
        0
    })?;
    l.func_wrap(e, "write_shared_memory", |mut c: Caller<'_, BotState>, off: i32, buf: i32, n: i32| -> i32 {
        charge(&c, (n.max(0) as u64 + 7) / 8);
        let mem = mem_of(&mut c);
        let src = mem.data(&c)[buf as usize..(buf + n.max(0)) as usize].to_vec();
        let mut sh = c.data().shared.lock().unwrap();
        if off < 0 || n < 0 || (off + n) as usize > sh.len() { return 19; }
        sh[off as usize..(off + n) as usize].copy_from_slice(&src);
        0
    })?;
    l.func_wrap(e, "read_draft_memory", |mut c: Caller<'_, BotState>, off: i32, buf: i32, n: i32| -> i32 {
        charge(&c, (n.max(0) as u64 + 7) / 8);
        let dm = c.data().draft.lock().unwrap().clone();
        if off < 0 || n < 0 || (off + n) as usize > dm.len() { return 19; }
        let mem = mem_of(&mut c);
        mem.data_mut(&mut c)[buf as usize..(buf + n) as usize].copy_from_slice(&dm[off as usize..(off + n) as usize]);
        0
    })?;
    l.func_wrap(e, "bc_submit_draft_memory", |mut c: Caller<'_, BotState>, buf: i32, n: i32| -> i32 {
        let mem = mem_of(&mut c);
        let src = mem.data(&c)[buf as usize..(buf + n.max(0)) as usize].to_vec();
        let mut dm = c.data().draft.lock().unwrap();
        let m = src.len().min(dm.len());
        dm[..m].copy_from_slice(&src[..m]);
        c.data().ctl.lock().unwrap().draft_submitted = true;
        0
    })?;
    l.func_wrap(e, "bc_metadata", |mut c: Caller<'_, BotState>, out: i32| -> i32 {
        let mb = c.data().eng.lock().unwrap().meta_bytes;
        let mem = mem_of(&mut c);
        mem.data_mut(&mut c)[out as usize..out as usize + 28].copy_from_slice(&mb);
        0
    })?;
    l.func_wrap(e, "my_champion", |c: Caller<'_, BotState>| -> i32 { c.data().ctl.lock().unwrap().champ })?;
    l.func_wrap(e, "my_team", |c: Caller<'_, BotState>| -> i32 { c.data().ctl.lock().unwrap().team as i32 })?;
    l.func_wrap(e, "fuel_remaining", |c: Caller<'_, BotState>| -> i64 { fuel_left(&c) as i64 })?;
    // debug_block free windows (debug builds): wasm fuel spent between pause and resume is not charged.
    l.func_wrap(e, "fuel_pause", |c: Caller<'_, BotState>| -> i32 {
        let t = c.get_fuel().unwrap_or(0);
        let mut k = c.data().ctl.lock().unwrap();
        if k.paused_at.is_some() { return 0; }
        k.paused_at = Some(t);
        1
    })?;
    l.func_wrap(e, "fuel_resume", |c: Caller<'_, BotState>| {
        let t = c.get_fuel().unwrap_or(0);
        let mut k = c.data().ctl.lock().unwrap();
        if let Some(p) = k.paused_at.take() { k.base_total = k.base_total.saturating_sub(p.saturating_sub(t)); }
    })?;
    l.func_wrap(e, "fuel_adjust", |c: Caller<'_, BotState>, d: i64| {
        let mut k = c.data().ctl.lock().unwrap();
        k.charges = if d >= 0 { k.charges + d as u64 } else { k.charges.saturating_sub(d.unsigned_abs()) };
    })?;
    l.func_wrap(e, "bc_get_last_error", |mut c: Caller<'_, BotState>, buf: i32, n: i32| -> i32 {
        let msg = c.data().eng.lock().unwrap().last_err.clone();
        if n <= 0 { return 0; }
        let mut b = msg.into_bytes();
        b.truncate(n as usize - 1);
        b.push(0);
        let mem = mem_of(&mut c);
        mem.data_mut(&mut c)[buf as usize..buf as usize + b.len()].copy_from_slice(&b);
        0
    })?;
    l.func_wrap(e, "consumable_info", |mut c: Caller<'_, BotState>, id: i32, out: i32| -> i32 { bridge(&mut c, "Game_API_GetConsumableInfo", &[I(id), S(0)], &[cp(0, out, 8, Out)]) })?;
    l.func_wrap(e, "item_info", |mut c: Caller<'_, BotState>, id: i32, out: i32| -> i32 { bridge(&mut c, "Game_API_GetItemInfo", &[I(id), S(0)], &[cp(0, out, 40, Out)]) })?;
    l.func_wrap(e, "champion_design", |mut c: Caller<'_, BotState>, t: i32, out: i32| -> i32 { bridge(&mut c, "Game_API_Champion_Design", &[G, I(t), S(0)], &[cp(0, out, 128, Out)]) })?;
    l.func_wrap(e, "camp_design", |mut c: Caller<'_, BotState>, t: i32, out: i32| -> i32 { bridge(&mut c, "Game_API_Camp_Design", &[G, I(t), S(0)], &[cp(0, out, 124, Out)]) })?;
    l.func_wrap(e, "bc_map_symmetry", |mut c: Caller<'_, BotState>, out: i32| -> i32 { bridge(&mut c, "Game_API_Map_GetSymmetry", &[G, S(0)], &[cp(0, out, 4, Out)]) })?;
    l.func_wrap(e, "bc_round_number", |mut c: Caller<'_, BotState>, out: i32| -> i32 { bridge(&mut c, "Game_API_GetRoundNumber", &[G, S(0)], &[cp(0, out, 4, Out)]) })?;
    l.func_wrap(e, "spawn_region", |mut c: Caller<'_, BotState>, t: i32, out: i32| -> i32 { bridge(&mut c, "Game_API_GetSpawnRegion", &[G, I(t), S(0)], &[cp(0, out, 16, Out)]) })?;
    l.func_wrap(e, "bc_submitted_gems", |mut c: Caller<'_, BotState>, t: i32, out: i32| -> i32 { bridge(&mut c, "Game_API_GetSubmittedGemCount", &[G, I(t), S(0)], &[cp(0, out, 4, Out)]) })?;
    l.func_wrap(e, "bc_map_mask", |mut c: Caller<'_, BotState>, kind: i32, out: i32| -> i32 {
        let name = match kind { 0 => "Game_GetWallBuffer", 1 => "Game_GetBushBuffer", 2 => "Game_GetHoleBuffer", 3 => "Game_GetAltarBuffer", _ => return 5 };
        let k = chunks(&c);
        charge(&c, k);
        let eng = c.data().eng.clone();
        let b = {
            let mut e = eng.lock().unwrap();
            let (g, o) = (e.game, e.out);
            let rc = e.call(name, &[Val::I64(g), Val::I32(o)]);
            if rc != 0 { return rc; }
            let p = e.r32(o) as i32;
            let n = e.bb;
            e.read(p, n)
        };
        let mem = mem_of(&mut c);
        mem.data_mut(&mut c)[out as usize..out as usize + b.len()].copy_from_slice(&b);
        0
    })?;
    l.func_wrap(e, "map_camp_layout", |mut c: Caller<'_, BotState>, buf: i32, cap: i32, cnt: i32| -> i32 {
        let words = c.data().eng.lock().unwrap().camp_layout();
        let take = words.len().min(cap.max(0) as usize);
        let mem = mem_of(&mut c);
        let d = mem.data_mut(&mut c);
        for (k, w) in words[..take].iter().enumerate() { wr32(d, buf as usize + 4 * k, *w); }
        wr32(d, cnt as usize, words.len() as u32);
        0
    })?;
    l.func_wrap(e, "map_camp_info", |mut c: Caller<'_, BotState>, id: i32, out: i32| -> i32 { bridge(&mut c, "Game_API_Map_CampInfo_Get", &[G, I(id), S(0)], &[cp(0, out, 12, Out)]) })?;
    l.func_wrap(e, "map_camp_group_of", |mut c: Caller<'_, BotState>, id: i32, out: i32| -> i32 { bridge(&mut c, "Game_API_Map_CampInfo_GetGroup", &[G, I(id), S(0)], &[cp(0, out, 4, Out)]) })?;

    // --- draft (picks are recorded only; the live game drafts the recorded picks)
    l.func_wrap(e, "draft_num_rounds", |mut c: Caller<'_, BotState>, out: i32| -> i32 {
        let eng = c.data().eng.clone();
        let v = {
            let mut e = eng.lock().unwrap();
            let (g, s) = (e.game, e.slots[0]);
            e.write(s, &[0, 0, 0, 0]);
            let rc = e.call("Game_API_Draft_GetNumRounds", &[Val::I64(g), Val::I32(s)]);
            if rc != 0 { e.last_err = e.err_msg(); return rc; }
            e.read(s, 1)[0]
        };
        let mem = mem_of(&mut c);
        mem.data_mut(&mut c)[out as usize] = v;
        0
    })?;
    l.func_wrap(e, "draft_get", |mut c: Caller<'_, BotState>, t: i32, r: i32, out: i32| -> i32 { bridge(&mut c, "Game_API_Draft_Get", &[G, I(t), I(r), S(0)], &[cp(0, out, 4, Out)]) })?;
    l.func_wrap(e, "draft_champion", |c: Caller<'_, BotState>, pick: i32| -> i32 { c.data().ctl.lock().unwrap().acts.push(format!("draft {pick}")); 0 })?;

    // --- champions
    l.func_wrap(e, "champion", |mut c: Caller<'_, BotState>, id: i32, out: i32| -> i32 { bridge(&mut c, "Game_API_Champion_Get", &[G, P, I(id), S(0)], &[cp(0, out, 44, Out)]) })?;
    l.func_wrap(e, "champion_at", |mut c: Caller<'_, BotState>, x: i32, y: i32, out: i32| -> i32 { bridge(&mut c, "Game_API_GetChampion", &[G, P, I(x), I(y), S(0)], &[cp(0, out, 4, Out)]) })?;
    l.func_wrap(e, "champion_identity", |mut c: Caller<'_, BotState>, id: i32, out: i32| -> i32 { bridge(&mut c, "Game_API_Champion_GetIdentity", &[G, P, I(id), S(0)], &[cp(0, out, 8, Out)]) })?;
    l.func_wrap(e, "champion_is_alive", |mut c: Caller<'_, BotState>, id: i32, out: i32| -> i32 { bridge(&mut c, "Game_API_Champion_IsAlive", &[G, I(id), S(0)], &[cp(0, out, 4, Out)]) })?;
    l.func_wrap(e, "champion_gems", |mut c: Caller<'_, BotState>, id: i32, out: i32| -> i32 { bridge(&mut c, "Game_API_Champion_GetGems", &[G, P, I(id), S(0)], &[cp(0, out, 4, Out)]) })?;
    l.func_wrap(e, "champion_gold", |mut c: Caller<'_, BotState>, id: i32, out: i32| -> i32 { bridge(&mut c, "Game_API_Champion_GetGold", &[G, P, I(id), S(0)], &[cp(0, out, 4, Out)]) })?;
    l.func_wrap(e, "bc_champion_channel_time", |mut c: Caller<'_, BotState>, id: i32, out: i32| -> i32 { bridge(&mut c, "Game_API_Champion_GetChannelTime", &[G, P, I(id), S(0)], &[cp(0, out, 4, Out)]) })?;
    l.func_wrap(e, "champion_items", |mut c: Caller<'_, BotState>, id: i32, out: i32| -> i32 { bridge(&mut c, "Game_API_Champion_GetItems", &[G, P, I(id), S(0), I(ITEM_TYPES as i32)], &[cp(0, out, ITEM_TYPES * 4, Out)]) })?;
    l.func_wrap(e, "champion_consumables", |mut c: Caller<'_, BotState>, id: i32, out: i32| -> i32 { bridge(&mut c, "Game_API_Champion_GetConsumables", &[G, P, I(id), S(0)], &[cp(0, out, 16, Out)]) })?;
    l.func_wrap(e, "champion_can_shop", |mut c: Caller<'_, BotState>, id: i32, flag: i32, out: i32| -> i32 { bridge(&mut c, "Game_API_Champion_CanShop", &[G, P, I(id), I(flag), S(0)], &[cp(0, out, 4, Out)]) })?;
    l.func_wrap(e, "champion_restrictions", |mut c: Caller<'_, BotState>, id: i32, out: i32| -> i32 { bridge(&mut c, "Game_API_Champion_GetRestrictions", &[G, P, I(id), S(0)], &[cp(0, out, 1, Out)]) })?;
    l.func_wrap(e, "champion_wards", |mut c: Caller<'_, BotState>, id: i32, out: i32| -> i32 { bridge(&mut c, "Game_API_Champion_GetWards", &[G, P, I(id), S(0)], &[cp(0, out, 8, Out)]) })?;
    l.func_wrap(e, "champion_cooldown", |mut c: Caller<'_, BotState>, id: i32, slot: i32, out: i32| -> i32 { bridge(&mut c, "Game_API_Champion_GetCooldown", &[G, P, I(id), I(slot), S(0)], &[cp(0, out, 4, Out)]) })?;
    l.func_wrap(e, "champion_ability_props", |mut c: Caller<'_, BotState>, id: i32, slot: i32, out: i32| -> i32 { bridge(&mut c, "Game_API_Champion_GetAbilityProps", &[G, P, I(id), I(slot), S(0)], &[cp(0, out, 36, Out)]) })?;
    l.func_wrap(e, "champion_ability_damage", |mut c: Caller<'_, BotState>, id: i32, slot: i32, out: i32| -> i32 { bridge(&mut c, "Game_API_Champion_GetAbilityDamage", &[G, P, I(id), I(slot), S(0)], &[cp(0, out, 4, Out)]) })?;
    l.func_wrap(e, "bc_champion_priority", |mut c: Caller<'_, BotState>, id: i32, next: i32, out: i32| -> i32 { bridge(&mut c, "Game_API_Champion_GetPriority", &[G, P, I(id), I(next), S(0)], &[cp(0, out, 4, Out)]) })?;
    l.func_wrap(e, "num_allies", |mut c: Caller<'_, BotState>, out: i32| -> i32 { bridge(&mut c, "Game_API_Champion_GetNumAllies", &[G, P, S(0)], &[cp(0, out, 4, Out)]) })?;
    l.func_wrap(e, "num_enemies", |mut c: Caller<'_, BotState>, out: i32| -> i32 { bridge(&mut c, "Game_API_Champion_GetNumEnemies", &[G, P, S(0)], &[cp(0, out, 4, Out)]) })?;
    l.func_wrap(e, "allies", |mut c: Caller<'_, BotState>, buf: i32, cap: i32, cnt: i32| -> i32 { bridge_list(&mut c, "Game_API_Champion_GetAllies", &[G, P], buf, cap, cnt, 4) })?;
    l.func_wrap(e, "enemies", |mut c: Caller<'_, BotState>, buf: i32, cap: i32, cnt: i32| -> i32 { bridge_list(&mut c, "Game_API_Champion_GetEnemies", &[G, P], buf, cap, cnt, 4) })?;
    l.func_wrap(e, "champion_buff_data", |mut c: Caller<'_, BotState>, id: i32, buf: i32, cap: i32, cnt: i32| -> i32 { bridge_list(&mut c, "Game_API_Champion_GetBuffData", &[G, P, I(id)], buf, cap, cnt, 12) })?;
    l.func_wrap(e, "bc_champion_ward_positions", |mut c: Caller<'_, BotState>, id: i32, buf: i32, cap: i32, cnt: i32| -> i32 { bridge_list(&mut c, "Game_API_Champion_GetWardPositions", &[G, P, I(id)], buf, cap, cnt, 8) })?;
    l.func_wrap(e, "altar_lock", |mut c: Caller<'_, BotState>, x:i32,y:i32,t:i32,out:i32| -> i32 {bridge(&mut c, "Game_API_GetAltarLock", &[G,P,I(x),I(y),I(t),S(0)], &[cp(0,out,24,Out)])})?;
    l.func_wrap(e, "altar_locks", |mut c: Caller<'_, BotState>, buf: i32, cap: i32, cnt: i32| -> i32 { bridge_list(&mut c, "Game_API_GetAltarLocks", &[G, P], buf, cap, cnt, 24) })?;

    // --- camps
    l.func_wrap(e, "camp", |mut c: Caller<'_, BotState>, id: i32, out: i32| -> i32 { bridge(&mut c, "Game_API_Camp_Get", &[G, P, I(id), S(0)], &[cp(0, out, 32, Out)]) })?;
    l.func_wrap(e, "camp_state", |mut c: Caller<'_, BotState>, id: i32, out: i32| -> i32 { bridge(&mut c, "Game_API_Camp_GetState", &[G, P, I(id), S(0)], &[cp(0, out, 4, Out)]) })?;
    l.func_wrap(e, "camp_at", |mut c: Caller<'_, BotState>, x: i32, y: i32, out: i32| -> i32 { bridge(&mut c, "Game_API_GetCamp", &[G, P, I(x), I(y), S(0)], &[cp(0, out, 4, Out)]) })?;
    l.func_wrap(e, "camp_group_state", |mut c: Caller<'_, BotState>, g: i32, out: i32| -> i32 { bridge(&mut c, "Game_API_CampGroup_GetState", &[G, P, I(g), S(0)], &[cp(0, out, 4, Out)]) })?;
    l.func_wrap(e, "camp_group_capture_state", |mut c: Caller<'_, BotState>, g: i32, out: i32| -> i32 { bridge(&mut c, "Game_API_CampGroup_GetCaptureState", &[G, P, I(g), S(0)], &[cp(0, out, 8, Out)]) })?;
    l.func_wrap(e, "camp_group_cooldown", |mut c: Caller<'_, BotState>, g: i32, out: i32| -> i32 { bridge(&mut c, "Game_API_CampGroup_GetCooldown", &[G, P, I(g), S(0)], &[cp(0, out, 4, Out)]) })?;
    l.func_wrap(e, "camp_buffs", |mut c: Caller<'_, BotState>, id: i32, buf: i32, cap: i32, cnt: i32| -> i32 { bridge_list(&mut c, "Game_API_Camp_GetBuffs", &[G, P, I(id)], buf, cap, cnt, 12) })?;

    // --- boards
    for (imp, exp) in [("board_camp_occupancy", "Game_API_GetCampOccupancy"), ("board_vision", "Game_API_GetVision"), ("board_ally_ward_occupancy", "Game_API_GetAllyWardOccupancy"),
                       ("board_teleport_occupancy", "Game_API_GetTeleportOccupancy"), ("board_enemy_occupancy", "Game_API_GetEnemyOccupancy"),
                       ("board_enemy_altar_lock_occupancy", "Game_API_GetEnemyAltarLockOccupancy"), ("board_ally_altar_lock_occupancy", "Game_API_GetAllyAltarLockOccupancy"), ("board_ally_occupancy", "Game_API_GetAllyOccupancy")] {
        l.func_wrap(e, imp, move |mut c: Caller<'_, BotState>, out: i32| -> i32 { let n = bbsz!(c); let k = chunks(&c); charge(&c, k); bridge(&mut c, exp, &[G, P, S(0)], &[cp(0, out, n, Out)]) })?;
    }

    // --- bitboards (forwarded with the engine's metadata pointer; hot accessors native)
    l.func_wrap(e, "bc_Bitboard_Zero", |mut c: Caller<'_, BotState>, buf: i32| -> i32 {
        let n = bbsz!(c);
        { let k = chunks(&c); charge(&c, k); }
        let mem = mem_of(&mut c);
        mem.data_mut(&mut c)[buf as usize..buf as usize + n].fill(0);
        0
    })?;
    l.func_wrap(e, "bc_Bitboard_Set", |mut c: Caller<'_, BotState>, buf: i32, x: i32, y: i32, v: i32| -> i32 {
        let (inb, (o, b), n) = { let e = c.data().eng.lock().unwrap(); (e.inb(x, y), if e.inb(x, y) { e.bit(x, y) } else { (0, 0) }, e.bb) };
        if !inb { return bridge(&mut c, "Bitboard_Set", &[M, S(0), I(x), I(y), I(v)], &[cp(0, buf, n, InOut)]); }
        let mem = mem_of(&mut c);
        let d = mem.data_mut(&mut c);
        if v != 0 { d[buf as usize + o] |= 1 << b; } else { d[buf as usize + o] &= !(1 << b); }
        0
    })?;
    l.func_wrap(e, "bc_Bitboard_Test", |mut c: Caller<'_, BotState>, buf: i32, x: i32, y: i32, out: i32| -> i32 {
        let (inb, (o, b), n) = { let e = c.data().eng.lock().unwrap(); (e.inb(x, y), if e.inb(x, y) { e.bit(x, y) } else { (0, 0) }, e.bb) };
        if !inb { return bridge(&mut c, "Bitboard_Test", &[M, S(0), I(x), I(y), S(1)], &[cp(0, buf, n, In), cp(1, out, 4, Out)]); }
        let mem = mem_of(&mut c);
        let d = mem.data_mut(&mut c);
        let v = (d[buf as usize + o] >> b) & 1;
        wr32(d, out as usize, v as u32);
        0
    })?;
    l.func_wrap(e, "bc_Bitboard_Union", |mut c: Caller<'_, BotState>, a: i32, b: i32, r: i32| -> i32 {
        let n = bbsz!(c);
        { let k = chunks(&c); charge(&c, k); }
        let mem = mem_of(&mut c);
        let d = mem.data_mut(&mut c);
        for k in 0..n { d[r as usize + k] = d[a as usize + k] | d[b as usize + k]; }
        0
    })?;
    l.func_wrap(e, "bc_Bitboard_Intersect", |mut c: Caller<'_, BotState>, a: i32, b: i32, r: i32| -> i32 {
        let n = bbsz!(c);
        { let k = chunks(&c); charge(&c, k); }
        let mem = mem_of(&mut c);
        let d = mem.data_mut(&mut c);
        for k in 0..n { d[r as usize + k] = d[a as usize + k] & d[b as usize + k]; }
        0
    })?;
    l.func_wrap(e, "bc_Bitboard_IsZero", |mut c: Caller<'_, BotState>, a: i32, out: i32| -> i32 {
        let n = bbsz!(c);
        { let k = chunks(&c); charge(&c, k); }
        let mem = mem_of(&mut c);
        let d = mem.data_mut(&mut c);
        let z = d[a as usize..a as usize + n].iter().all(|&x| x == 0);
        wr32(d, out as usize, z as u32);
        0
    })?;
    l.func_wrap(e, "bc_Bitboard_IsEqual", |mut c: Caller<'_, BotState>, a: i32, b: i32, out: i32| -> i32 {
        let n = bbsz!(c);
        { let k = chunks(&c); charge(&c, k); }
        let mem = mem_of(&mut c);
        let d = mem.data_mut(&mut c);
        let z = d[a as usize..a as usize + n] == d[b as usize..b as usize + n];
        wr32(d, out as usize, z as u32);
        0
    })?;
    l.func_wrap(e, "bc_Bitboard_Not", |mut c: Caller<'_, BotState>, a: i32, r: i32| -> i32 { let n = bbsz!(c); { let k = chunks(&c); charge(&c, k); } bridge(&mut c, "Bitboard_Not", &[M, S(0), S(1)], &[cp(0, a, n, In), cp(1, r, n, Out)]) })?;
    l.func_wrap(e, "bc_Bitboard_NumSetBits", |mut c: Caller<'_, BotState>, a: i32, out: i32| -> i32 { let n = bbsz!(c); { let k = chunks(&c); charge(&c, k); } bridge(&mut c, "Bitboard_NumSetBits", &[M, S(0), S(1)], &[cp(0, a, n, In), cp(1, out, 4, Out)]) })?;
    l.func_wrap(e, "bc_Bitboard_GetSetBits", |mut c: Caller<'_, BotState>, a: i32, pos: i32, cap: i32, cnt: i32| -> i32 {
        let eng = c.data().eng.clone();
        let mem = mem_of(&mut c);
        let src = { let n = eng.lock().unwrap().bb; mem.data(&c)[a as usize..a as usize + n].to_vec() };
        let mut e = eng.lock().unwrap();
        let capc = (cap.max(0) as usize).min(e.slot_size / 8) as i32;
        let (m, s0, s1, s2) = (e.meta, e.slots[0], e.slots[1], e.slots[2]);
        e.write(s0, &src);
        let rc = e.call("Bitboard_GetSetBits", &[Val::I32(m), Val::I32(s0), Val::I32(s1), Val::I32(capc), Val::I32(s2)]);
        if rc != 0 { e.last_err = e.err_msg(); return rc; }
        let n = e.r32(s2);
        let take = (n as usize).min(capc as usize);
        let b = e.read(s1, take * 8);
        drop(e);
        { let k = chunks(&c); charge(&c, k + take as u64); }
        let d = mem.data_mut(&mut c);
        if take > 0 { d[pos as usize..pos as usize + take * 8].copy_from_slice(&b); }
        if cnt != 0 { wr32(d, cnt as usize, n); }
        0
    })?;
    l.func_wrap(e, "bc_Bitboard_ImportRawBuffer", |mut c: Caller<'_, BotState>, buf: i32, bytes: i32, size: i32| -> i32 { let n = bbsz!(c); { let k = chunks(&c); charge(&c, k); } bridge(&mut c, "Bitboard_ImportRawBuffer", &[M, S(0), S(1), I(size)], &[cp(1, bytes, size as usize, In), cp(0, buf, n, Out)]) })?;
    l.func_wrap(e, "bc_Bitboard_ExportLinearBuffer", |mut c: Caller<'_, BotState>, buf: i32, bytes: i32, size: i32| -> i32 { let n = bbsz!(c); { let k = chunks(&c); charge(&c, k); } bridge(&mut c, "Bitboard_ExportLinearBuffer", &[M, S(0), S(1), I(size)], &[cp(0, buf, n, In), cp(1, bytes, size as usize, Out)]) })?;
    l.func_wrap(e, "bc_Bitboard_DrawChebyshev", |mut c: Caller<'_, BotState>, buf: i32, x: i32, y: i32, r: f32| -> i32 { let n = bbsz!(c); charge(&c, if r < 4.0 { 1 } else { 4 }); bridge(&mut c, "Bitboard_DrawChebyshev", &[M, S(0), I(x), I(y), F(r)], &[cp(0, buf, n, InOut)]) })?;
    l.func_wrap(e, "bc_Bitboard_ShiftRight", |mut c: Caller<'_, BotState>, a: i32, r: i32, k: i32| -> i32 { let n = bbsz!(c); { let k = chunks(&c); charge(&c, k); } bridge(&mut c, "Bitboard_ShiftRight", &[M, S(0), S(1), I(k)], &[cp(0, a, n, In), cp(1, r, n, Out)]) })?;
    l.func_wrap(e, "bc_Bitboard_ShiftUp", |mut c: Caller<'_, BotState>, a: i32, r: i32, k: i32| -> i32 { let n = bbsz!(c); { let k = chunks(&c); charge(&c, k); } bridge(&mut c, "Bitboard_ShiftUp", &[M, S(0), S(1), I(k)], &[cp(0, a, n, In), cp(1, r, n, Out)]) })?;
    l.func_wrap(e, "bc_Bitboard_ReachableMask", |mut c: Caller<'_, BotState>, w: i32, x: i32, y: i32, r: i32, dist: i32| -> i32 {
        let n = bbsz!(c);
        let rc = bridge(&mut c, "Bitboard_ReachableMaskWithExpansionCount", &[M, S(0), I(x), I(y), S(1), I(dist), S(2)], &[cp(0, w, n, In), cp(1, r, n, Out)]);
        if rc == 0 {
            let v = { let mut e = c.data().eng.lock().unwrap(); let s = e.slots[2]; e.r32(s) };
            if std::env::var("TURNHOST_REACHDBG").is_ok() { eprintln!("reach dist {dist} count {v}"); }
            c.data().ctl.lock().unwrap().reach += v as u64;
            let area = if dist >= 8 {
                let mem = mem_of(&mut c);
                let d = mem.data(&c);
                d[r as usize..r as usize + n].iter().map(|b| b.count_ones() as u64).sum::<u64>()
            } else { 0 };
            let k = chunks(&c);
            charge(&c, k + 2 + dist.max(0) as u64 + area * dist.max(0) as u64 / 42);
        }
        rc
    })?;
    l.func_wrap(e, "bc_DistanceField_Get", |mut c: Caller<'_, BotState>, df: i32, x: i32, y: i32, out: i32| -> i32 {
        let (inb, off, n) = { let e = c.data().eng.lock().unwrap(); (e.inb(x, y), if e.inb(x, y) { e.df_off(x, y) } else { 0 }, e.df) };
        if !inb { return bridge(&mut c, "DistanceField_Get", &[M, S(0), I(x), I(y), S(1)], &[cp(0, df, n, In), cp(1, out, 2, Out)]); }
        let mem = mem_of(&mut c);
        let d = mem.data_mut(&mut c);
        let v = [d[df as usize + off], d[df as usize + off + 1]];
        d[out as usize..out as usize + 2].copy_from_slice(&v);
        0
    })?;
    l.func_wrap(e, "bc_DistanceField_ExportLinearBuffer", |mut c: Caller<'_, BotState>, df: i32, bytes: i32, size: i32| -> i32 { let n = dfsz!(c); charge(&c, size.max(0) as u64 / 8); bridge(&mut c, "DistanceField_ExportLinearBuffer", &[M, S(0), S(1), I(size)], &[cp(0, df, n, In), cp(1, bytes, size as usize, Out)]) })?;
    l.func_wrap(e, "bc_DistanceField_ComputeWithExpansionCount", |mut c: Caller<'_, BotState>, w: i32, roots: i32, vis: i32, dist: i32, max: i32, cnt: i32| -> i32 {
        let (n, f) = { let e = c.data().eng.lock().unwrap(); (e.bb, e.df) };
        let rc = bridge(&mut c, "DistanceField_ComputeWithExpansionCount", &[M, S(0), S(1), S(2), S(3), I(max), S(4)],
               &[cp(0, w, n, In), cp(1, roots, n, In), cp(2, vis, n, InOut), cp(3, dist, f, InOut), cp(4, cnt, 2, Out)]);
        if rc == 0 {
            let x = { let mut e = c.data().eng.lock().unwrap(); let s = e.slots[4]; e.r32(s) & 0xffff };
            c.data().ctl.lock().unwrap().expansions += x as u64;
            let k = chunks(&c);
            charge(&c, f as u64 / 8 + k * x as u64);
        }
        rc
    })?;
    l.func_wrap(e, "bc_DistanceField_ComputeToWithExpansionCount", |mut c: Caller<'_, BotState>, w: i32, roots: i32, dests: i32, vis: i32, dist: i32, max: i32, cnt: i32| -> i32 {
        let (n, f) = { let e = c.data().eng.lock().unwrap(); (e.bb, e.df) };
        let rc = bridge(&mut c, "DistanceField_ComputeToWithExpansionCount", &[M, S(0), S(1), S(2), S(3), S(4), I(max), S(5)],
               &[cp(0, w, n, In), cp(1, roots, n, In), cp(2, dests, n, In), cp(3, vis, n, InOut), cp(4, dist, f, InOut), cp(5, cnt, 2, Out)]);
        if rc == 0 {
            let x = { let mut e = c.data().eng.lock().unwrap(); let s = e.slots[5]; e.r32(s) & 0xffff };
            c.data().ctl.lock().unwrap().expansions += x as u64;
            let k = chunks(&c);
            charge(&c, f as u64 / 8 + k * x as u64);
        }
        rc
    })?;

    // --- actions on the live game
    l.func_wrap(e, "move_to_with_result", |mut c: Caller<'_, BotState>, x: i32, y: i32, out: i32| -> i32 {
        action(&mut c, format!("move {x},{y}"), |e| { let (g, o) = (e.game, e.out); e.call("Game_Action_Move", &[Val::I64(g), Val::I32(x), Val::I32(y), Val::I32(o)]) }, Some(out))
    })?;
    l.func_wrap(e, "attack", |mut c: Caller<'_, BotState>, kind: i32, handle: i32| -> i32 {
        let (team, champ) = who(&c);
        let name = { let eng = c.data().eng.clone(); let mut e = eng.lock().unwrap(); match target_pos(&mut e, team, champ, kind, handle) { Some((x, y)) => format!("attack {x},{y}"), None => format!("attack ?{kind}:{handle}") } };
        action(&mut c, name, |e| { let g = e.game; let p = e.ent(kind as u32, handle as u32); e.call("Game_Action_Attack", &[Val::I64(g), Val::I32(p)]) }, None)
    })?;
    l.func_wrap(e, "cast_with_result", |mut c: Caller<'_, BotState>, slot: i32, kind: i32, handle: i32, x: i32, y: i32, out: i32| -> i32 {
        let (team, champ) = who(&c);
        let name = {
            let eng = c.data().eng.clone();
            let mut e = eng.lock().unwrap();
            let p = if kind != 0 { target_pos(&mut e, team, champ, kind, handle) } else if x < 0 || y < 0 { target_pos(&mut e, team, champ, 1, champ) } else { Some((x, y)) };
            match p { Some((tx, ty)) => format!("cast{slot} {tx},{ty}"), None => format!("cast{slot} ?{kind}:{handle}") }
        };
        action(&mut c, name, |e| {
            let (g, o) = (e.game, e.out);
            let pe = e.ent(kind as u32, handle as u32);
            let pp = e.pos(x, y);
            e.call("Game_Action_Cast", &[Val::I64(g), Val::I32(slot), Val::I32(pe), Val::I32(pp), Val::I32(o)])
        }, Some(out))
    })?;
    l.func_wrap(e, "recall", |mut c: Caller<'_, BotState>| -> i32 { action(&mut c, "recall".into(), |e| { let g = e.game; e.call("Game_Action_Recall", &[Val::I64(g)]) }, None) })?;
    l.func_wrap(e, "cancel_channel", |mut c: Caller<'_, BotState>| -> i32 { action(&mut c, "cancel".into(), |e| { let g = e.game; e.call("Game_Action_CancelChannel", &[Val::I64(g)]) }, None) })?;
    l.func_wrap(e, "submit_gems", |mut c: Caller<'_, BotState>, x: i32, y: i32| -> i32 {
        action(&mut c, format!("submit {x},{y}"), |e| { let g = e.game; let pp = e.pos(x, y); e.call("Game_Action_SubmitGems", &[Val::I64(g), Val::I32(pp)]) }, None)
    })?;
    l.func_wrap(e, "set_priority", |mut c: Caller<'_, BotState>, p: i32| -> i32 { action(&mut c, format!("prio {p}"), |e| { let g = e.game; e.call("Game_Action_SetPriority", &[Val::I64(g), Val::I32(p)]) }, None) })?;
    l.func_wrap(e, "buy_item", |mut c: Caller<'_, BotState>, t: i32, n: i32| -> i32 { action(&mut c, format!("buy {t}x{n}"), |e| { let g = e.game; e.call("Game_Action_BuyItem", &[Val::I64(g), Val::I32(t), Val::I32(n)]) }, None) })?;
    l.func_wrap(e, "sell", |mut c: Caller<'_, BotState>, t: i32| -> i32 { action(&mut c, format!("sell {t}"), |e| { let g = e.game; e.call("Game_Action_Sell", &[Val::I64(g), Val::I32(t)]) }, None) })?;
    // SDK consumable types (0 tp crystal, 1 altar lock) map to engine ids 0 and 2.
    l.func_wrap(e, "buy_consumable", |mut c: Caller<'_, BotState>, t: i32| -> i32 { let id = if t == 1 { 2 } else { t }; action(&mut c, format!("buycons {t}"), |e| { let g = e.game; e.call("Game_Action_BuyConsumable", &[Val::I64(g), Val::I32(id)]) }, None) })?;
    l.func_wrap(e, "use_consumable_with_result", |mut c: Caller<'_, BotState>, t: i32, x: i32, y: i32, out: i32| -> i32 {
        let id = if t == 1 { 2 } else { t };
        action(&mut c, format!("consumable{t} {x},{y}"), |e| { let (g, o) = (e.game, e.out); let pp = e.pos(x, y); e.call("Game_Action_UseConsumable", &[Val::I64(g), Val::I32(id), Val::I32(pp), Val::I32(o)]) }, Some(out))
    })?;
    l.func_wrap(e, "place_ward_with_result", |mut c: Caller<'_, BotState>, x: i32, y: i32, out: i32| -> i32 {
        action(&mut c, format!("ward {x},{y}"), |e| { let (g, o) = (e.game, e.out); let pp = e.pos(x, y); e.call("Game_Action_PlaceWard", &[Val::I64(g), Val::I32(pp), Val::I32(o)]) }, Some(out))
    })?;

    l.func_wrap_async(e, "yield", |c: Caller<'_, BotState>, (): ()| {
        Box::new(async move {
            let used = fuel_used(&c);
            {
                let mut k = c.data().ctl.lock().unwrap();
                k.yielded = true;
                k.used = Some(used);
            }
            YieldOnce(false).await;
        })
    })?;
    let _ = rd32;
    Ok(())
}

pub struct Bot {
    fut: Pin<Box<dyn Future<Output = Result<()>> + Send>>,
    store: *mut Store<BotState>,
    pub ctl: Arc<Mutex<Ctl>>,
    pub ended: Option<String>,
}

struct SendPtr(*mut Store<BotState>);
unsafe impl Send for SendPtr {}

pub struct TurnResult { pub fuel: u64, pub preempted: bool, pub ended_now: bool }

impl Bot {
    pub fn new(engine: &Engine, module: &Module, linker: &Linker<BotState>, st: BotState, q: u64, host_charges: bool) -> Result<Bot> {
        let ctl = st.ctl.clone();
        {
            let mut k = ctl.lock().unwrap();
            k.q = q;
            k.host_charges = host_charges;
        }
        let mut store = Box::new(Store::new(engine, st));
        store.call_hook(|ctx, kind| {
            if let CallHook::CallingHost = kind { ctx.data().ctl.lock().unwrap().calls += 1; }
            Ok(())
        });
        store.fuel_async_yield_interval(Some(CHECK))?;
        store.set_fuel(FUEL_POOL)?;
        // The store lives as long as the bot; the future borrows it through a raw pointer so the driver
        // can read the fuel counter while the guest is suspended between polls.
        let raw: *mut Store<BotState> = Box::into_raw(store);
        let sp = SendPtr(raw);
        let module = module.clone();
        let linker = linker.clone();
        let ctl2 = ctl.clone();
        let fut = Box::pin(async move {
            let sp = sp;
            let store: &mut Store<BotState> = unsafe { &mut *sp.0 };
            let inst = linker.instantiate_async(&mut *store, &module).await?;
            // Instantiation (data segments) is not charged to the first turn.
            { let mut k=ctl2.lock().unwrap(); k.base_total = store.get_fuel()?; k.initialized=true; }
            let start = inst.get_typed_func::<(), ()>(&mut *store, "_start")?;
            start.call_async(&mut *store, ()).await?;
            Ok(())
        });
        Ok(Bot { fut, store: raw, ctl, ended: None })
    }
    fn total(&self) -> u64 { unsafe { (*self.store).get_fuel().unwrap_or(0) } }
    // Run one turn with a budget of `k_turn` quanta; the turn ends when the bot yields or its ledger is spent.
    pub fn turn(&mut self, k_turn: u64) -> TurnResult {
        let base = self.total();
        {
            let mut k = self.ctl.lock().unwrap();
            k.yielded = false;
            k.used = None;
            k.budget = k_turn * k.q;
            k.base_total = base;
            k.charges = 0;
            k.paused_at = None;
            k.acts.clear();
            k.failed.clear();
            k.first = None;
            k.out.clear();
            k.calls = 0;
            k.bytes = 0;
            k.expansions = 0;
            k.reach = 0;
        }
        if self.ended.is_some() { return TurnResult { fuel: 0, preempted: false, ended_now: false }; }
        let mut cx = Context::from_waker(Waker::noop());
        loop {
            match self.fut.as_mut().poll(&mut cx) {
                Poll::Ready(r) => {
                    self.ended = Some(match r { Ok(()) => "exited".into(), Err(e) => format!("{e:#}") });
                    return TurnResult { fuel: 0, preempted: false, ended_now: true };
                }
                Poll::Pending => {
                    let k = self.ctl.lock().unwrap();
                    if !k.initialized { continue; }
                    if k.yielded { return TurnResult { fuel: k.used.unwrap_or(0), preempted: false, ended_now: false }; }
                    let now = k.paused_at.unwrap_or_else(|| self.total());
                    let used = k.base_total.saturating_sub(now) + k.charges;
                    if used >= k.budget { return TurnResult { fuel: used, preempted: true, ended_now: false }; }
                }
            }
        }
    }
}
