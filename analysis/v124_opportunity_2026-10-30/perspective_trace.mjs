#!/usr/bin/env node
// Turn-level trace of one team's champions from a replay, using the engine's own bot API with
// that team's perspective (exactly what its bots could observe at the start of each turn), plus
// the actions each champion took during that turn. For behaviour cloning / meta analysis.
//   node tools/turn_trace.mjs <replay> <team 0|1> [--out f.jsonl] [--every 1]
//   import { traceReplay } from './turn_trace.mjs'
// Record per champion turn (alive or dead):
//   r round, c champion id, t type, self {x,y,hp,mhp,str,foc,mv,rng,st,gold,gems,items,cons,cd,chg,
//   ch(channel rounds left, -1 none),prio,wch,wcd,wards}, al/en visible allies/enemies {c,t,x,y,hp,mhp,
//   str,foc,gems,items?,cd,ch}, cp visible camps {id,ty,x,y,hp,mhp,str,awake}, gs group states,
//   sub [ours, theirs], acts [{k, ...}].
import fs from 'node:fs';
import { dumpReplay, CHAMPION_TYPES, CAMP_TYPES, ITEM_NAMES, ABILITY_TYPES } from '../../tools/replay_dump.mjs';

export async function traceReplay(file, team, { onTurn, onObserve = null, every = 1, withItems = true } = {}) {
  let eng, game, buf, persp, nGroups = 0;
  let cur = null; // current turn record of a focus champion
  const hits = []; // recent champion->champion hits by either team: {r, a, at, tg, tt, x, y}
  const finish = () => { if (cur) { onTurn(cur); cur = null; } };
  const V = () => eng.view;
  const ok = (code) => code === 0;
  const i32 = (o) => V().getInt32(buf + o, true), u32 = (o) => V().getUint32(buf + o, true), f32 = (o) => V().getFloat32(buf + o, true);
  const champInfo = (c) => {
    if (!ok(eng.exp.Game_API_Champion_Get(game, persp, c, buf))) return null;
    return { team: i32(0), t: CHAMPION_TYPES[i32(4)] ?? i32(4), x: i32(8), y: i32(12), hp: Math.round(f32(16)), mhp: Math.round(f32(20)), str: +f32(24).toFixed(1), foc: +f32(28).toFixed(1), mv: i32(32), rng: i32(36), st: i32(40) };
  };
  const one = (fn, ...a) => (ok(eng.exp[fn](game, persp, ...a, buf)) ? i32(0) : null);
  const items = (c) => {
    if (!ok(eng.exp.Game_API_Champion_GetItems(game, persp, c, buf, ITEM_NAMES.length))) return null;
    const o = {}; for (let i = 0; i < ITEM_NAMES.length; i++) { const n = u32(i * 4); if (n) o[i] = n; } return o;
  };
  const cds = (c) => [0, 1].map((s) => (ok(eng.exp.Game_API_Champion_GetCooldown(game, persp, c, s, buf)) ? i32(0) : null));
  const list = (fn, cap = 64) => {
    const cnt = buf + 2048;
    if (!ok(eng.exp[fn](game, persp, buf, cap, cnt))) return [];
    const n = V().getUint32(cnt, true); const a = []; for (let i = 0; i < Math.min(n, cap); i++) a.push(u32(i * 4)); return a;
  };
  const observe = (st, c) => {
    V().setUint32(persp, team, true); V().setUint32(persp + 4, c, true);
    const me = champInfo(c);
    const self = me ? { ...me } : { dead: 1 };
    self.gold = one('Game_API_Champion_GetGold', c); self.gems = one('Game_API_Champion_GetGems', c);
    if (withItems) self.items = items(c);
    self.cd = cds(c);
    self.ch = one('Game_API_Champion_GetChannelTime', c) ?? -1;
    self.prio = ok(eng.exp.Game_API_Champion_GetPriority(game, persp, c, 0, buf)) ? i32(0) : null;
    if (ok(eng.exp.Game_API_Champion_GetWards(game, persp, c, buf))) { self.wch = u32(0); self.wcd = i32(4); }
    const al = [], en = [];
    const vis = (x, y) => ok(eng.exp.Game_API_InVision(game, persp, x, y, buf)) && u32(0) !== 0;
    for (const o of st.champions) {
      const h = o.entity.index;
      if (h === c || !o.alive || !o.position) continue;
      if (o.team !== team && !vis(o.position.x, o.position.y)) continue;
      const ci = champInfo(h); if (!ci) continue;
      const rec = { c: h, t: ci.t, x: ci.x, y: ci.y, hp: ci.hp, mhp: ci.mhp, str: ci.str, foc: ci.foc, st: ci.st, gems: one('Game_API_Champion_GetGems', h), cd: cds(h) };
      if (withItems) rec.items = items(h);
      rec.ch = one('Game_API_Champion_GetChannelTime', h) ?? -1;
      (ci.team === team ? al : en).push(rec);
    }
    const cp = [];
    for (const o of st.camps) {
      if (!(o.health > 0) || !vis(o.position.x, o.position.y)) continue;
      const h = o.entity.index;
      if (!ok(eng.exp.Game_API_Camp_Get(game, persp, h, buf))) continue;
      const rec = { id: h, ty: CAMP_TYPES[o.type] ?? o.type, x: i32(0), y: i32(4), hp: Math.round(f32(8)), mhp: Math.round(f32(12)), str: f32(16) };
      if (ok(eng.exp.Game_API_Camp_GetState(game, persp, h, buf))) rec.awake = u32(0);
      cp.push(rec);
    }
    const gs = [];
    for (let g = 0; g < nGroups; g++) gs.push(ok(eng.exp.Game_API_CampGroup_GetState(game, persp, g, buf)) ? u32(0) : -1);
    const sub = [team, 1 - team].map((tm) => (ok(eng.exp.Game_API_GetSubmittedGemCount(game, tm, buf)) ? u32(0) : null));
    while (hits.length && hits[0].r < st.round - 4) hits.shift();
    const record={ r: st.round, c, t: CHAMPION_TYPES[st.champions.find((x) => x.entity.index === c)?.type], self, al, en, cp, gs, sub, hits: hits.slice(), acts: [] };if(onObserve)onObserve(record,{eng,game,persp,buf});return record;
  };
  await dumpReplay(file, { snapshots: 'none', mapInfo: true,
    onStart(s) {
      eng = s.eng; game = s.game; buf = eng.exp.Engine_Malloc(4096); persp = eng.exp.Engine_Malloc(16);
      eng.check(eng.exp.Game_API_Map_GetNumCampGroups(game, buf)); nGroups = V().getUint32(buf, true);
      if (onTurn) onTurn({ start: true, eng, game, mapInfo: s.mapInfo, width: s.width, height: s.height, engine: s.engineVersion, nGroups });
    },
    onStep(st, ev) {
      const s = st.step;
      // turn start: the ChampionStartTurn tick has been applied, the champion is about to act
      if (s.kind === 3 && s.phase === 14 && st.phase === 10) {
        finish();
        const c = st.currentChampion;
        const ch = st.champions.find((x) => x.entity.index === c);
        if (ch && ch.team === team && st.round % every === 0) cur = observe(st, c);
        return;
      }
      if (ev && ev.actor?.kind === 1 && (ev.kind === 'Attack' || ev.kind === 'Cast ability') && ev.target?.kind === 'champion' && ev.target.team !== ev.team)
        hits.push({ r: st.round, a: ev.actor.index, at: ev.team, tg: ev.target.id, tt: ev.target.team, x: ev.to[0], y: ev.to[1], ab: ev.abilityType });
      if (!cur || !ev || ev.actor?.kind !== 1 || ev.actor.index !== cur.c) return;
      const a = { k: ev.kind };
      if (ev.kind === 'Move') a.to = ev.to;
      if (ev.kind === 'Attack' || ev.kind === 'Cast ability') { a.to = ev.to; if (ev.target) { a.tk = ev.target.kind; a.tid = ev.target.id; a.tt = ev.target.type; if (ev.target.team !== undefined) a.tteam = ev.target.team; } }
      if (ev.kind === 'Cast ability') { a.slot = ev.slot; a.ab = ev.abilityType; }
      if (ev.kind === 'Shop' || ev.kind === 'Sell item') { a.items = ev.items; a.goldAfter = ev.goldAfter; }
      if (ev.kind === 'Place ward' || ev.kind === 'Consumable' || ev.kind === 'Place altar lock' || ev.kind === 'Submit gems') a.to = ev.to;
      if (ev.kind === 'Set priority') a.v = ev.priority;
      cur.acts.push(a);
    } });
  finish();
}

if (process.argv[1] && process.argv[1].endsWith('turn_trace.mjs')) {
  const [file, team] = process.argv.slice(2);
  const args = process.argv.slice(2);
  const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
  const out = opt('out') ? fs.createWriteStream(opt('out')) : null;
  let n = 0;
  await traceReplay(file, +team, { every: +opt('every', 1), onTurn: (t) => { n++; if (out) out.write(JSON.stringify(t) + '\n'); else if (n < 6 || (t.r === 120)) console.log(JSON.stringify(t).slice(0, 1500)); } });
  if (out) out.end();
  console.error('turns', n);
}
