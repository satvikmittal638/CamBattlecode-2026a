// Re-simulate a replay in a live engine game built from the map: draft the recorded picks, then feed every
// champion turn's recorded actions back through Game_Action_*. Reports the first round where the live state
// (champion positions / HP / gems) differs from the replay, which validates deterministic reconstruction.
//   node resim.mjs <replay> <map.map26a> [--to R] [--verbose]
import fs from 'node:fs';
import { openReplay, isTurnStart } from './replay_state.mjs';
import { STEP_KINDS, CHAMPION_TYPES, decodeTimeline } from '../../../tools/replay_dump.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const [replayFile, mapFile] = args;
const toRound = +opt('to', 1e9), verbose = args.includes('--verbose');

const R = await openReplay(replayFile);
const { eng } = R; const E = eng.exp;
const V = () => eng.view;
// Live game from the map, in the same engine instance.
const mapBytes = fs.readFileSync(mapFile);
const mp = E.Engine_Malloc(mapBytes.length);
new Uint8Array(E.memory.buffer, mp, mapBytes.length).set(mapBytes);
eng.check(E.Game_FromMapFileBytes(mp, mapBytes.length, eng.outBuf, 0));
const L = eng.outHandle;
E.Engine_Free(mp);
const args8 = E.Engine_Malloc(128), outb = E.Engine_Malloc(64);
const ent = (kind, index) => { V().setUint32(args8, kind, true); V().setUint32(args8 + 4, index, true); return args8; };
const pos = (x, y) => { V().setInt32(args8 + 32, x, true); V().setInt32(args8 + 36, y, true); return args8 + 32; };
const rs = () => { eng.check(E.Game_Runner_GetState(L, outb)); return { phase: V().getUint32(outb, true), team: V().getUint32(outb + 4, true), round: V().getUint32(outb + 8, true), champ: V().getInt32(outb + 12, true) }; };
const err = (c) => (c === 0 ? null : `${c} ${eng.cstr(E.GetLastErrorMsg())}`);

// Stream the replay. The live game is drafted once the replay leaves the draft phase.
const persp = E.Engine_Malloc(16);
const champInfo = (game, id) => {
  V().setUint32(persp, 2, true); V().setUint32(persp + 4, 0xffffffff, true);
  const c = E.Game_API_Champion_Get(game, persp, id, outb);
  if (c) return null;
  const x = V().getInt32(outb + 8, true), y = V().getInt32(outb + 12, true);
  if (x < 0 || y < 0) return null;
  return { x, y, hp: V().getFloat32(outb + 16, true) };
};
const advanceTo = (champ) => {
  for (let k = 0; k < 100000; k++) {
    const r = rs();
    if (r.phase !== 0 && r.champ === champ) return r;
    const c = E.Game_Runner_Step(L);
    if (c) { console.log('step error', err(c), r); return null; }
  }
  return null;
};
let undos = 0, drafted = false, diverged = null, turns = 0, actionErrors = 0, cur = null, before = R.read();
const unitAt = (b, x, y) => {
  const ch = b.champions.find((o) => o.position && o.position.x === x && o.position.y === y && o.alive);
  if (ch) return [1, ch.entity.index];
  const cp = b.camps.find((o) => o.position.x === x && o.position.y === y && o.health > 0);
  if (cp) return [2, cp.entity.index];
  return null;
};
for (let s = R.next(); s; before = s, s = R.next()) {
  if (s.round > toRound || s.phase === 11) break;
  if (!drafted && s.phase !== 12 && s.round >= 1) {
    const drafts = s.drafts.map((d, t) => d.slice(0, s.draftCounts[t]));
    eng.check(E.Game_Runner_SetCheckpointsEnabled(L, 1));
    eng.check(E.Game_Runner_Init(L));
    for (let g = 0; rs().phase === 0 && g < 50; g++) {
      const r = rs();
      const c = E.Game_Action_Draft(L, drafts[r.team][r.round]);
      if (c) { console.log('draft error', err(c), r); break; }
      eng.check(E.Game_Runner_EndTurn(L, 0));
    }
    console.log('draft', JSON.stringify(drafts), 'live state', rs());
    drafted = true;
  }
  if (!drafted) continue;
  if (isTurnStart(s)) {
    const cid = s.currentChampion;
    const r = advanceTo(cid);
    if (!r) { console.log('live game did not reach turn of', cid, 'round', s.round); break; }
    if (r.round !== s.round) { console.log('round mismatch live', r.round, 'replay', s.round, 'champ', cid); diverged = s.round; break; }
    for (const c of s.champions) {
      const lc = champInfo(L, c.entity.index), rp = c.position;
      if (!lc && !rp) continue;
      if (!lc || !rp || lc.x !== rp.x || lc.y !== rp.y || Math.abs(lc.hp - c.health) > 0.01) {
        diverged = s.round;
        console.log(`DIVERGED round ${s.round} champ ${c.entity.index} ${CHAMPION_TYPES[c.type]} replay ${rp ? rp.x + ',' + rp.y : '-'} hp ${c.health} live ${lc ? lc.x + ',' + lc.y : '-'} hp ${lc?.hp}`);
        break;
      }
    }
    if (diverged) break;
    if (args.includes('--undo')) {
      // Apply bogus moves, then delete them from the live timeline (the visualiser's undo).
      const snapL = E.Engine_Malloc(40152);
      const me = s.champions.find((o) => o.entity.index === cid);
      let first = null;
      if (me && me.position) {
        for (const dx of [1, -1]) {
          const mc = E.Game_Action_Move(L, me.position.x + dx, me.position.y, outb);
          if (s.round === 142 && cid === 8) { eng.check(E.Game_Visualiser_ReadTimelineState(L, snapL)); const t = decodeTimeline(V(), snapL); console.log('dbg move', dx, err(mc), 'moved', V().getInt32(outb, true), 'step', STEP_KINDS[t.step.kind], V().getUint32(snapL + 100, true), V().getUint32(snapL + 104, true), 'inputPos', V().getUint32(snapL + 56, true), 'me', JSON.stringify(me.position), me.health, me.stunned); }
          if (mc === 0 && !first) { eng.check(E.Game_Visualiser_ReadTimelineState(L, snapL)); first = { tl: V().getBigUint64(snapL + 48, true), pos: V().getUint32(snapL + 100, true), sub: V().getUint32(snapL + 104, true) }; }
        }
      }
      E.Engine_Free(snapL);
      if (first) { let dc; try { dc = E.Game_Visualiser_Timeline_DeleteAction(L, first.tl, first.pos, first.sub); } catch (ex) { console.log("TRAP", s.round, cid, JSON.stringify(first, (k, v) => typeof v === "bigint" ? Number(v) : v)); break; } if (dc) { console.log("delete error", err(dc)); break; } }
      const back = champInfo(L, cid);
      if (me && me.position && back && (back.x !== me.position.x || back.y !== me.position.y)) { console.log('undo failed', s.round, cid, back, me.position); break; }
      const r2 = rs(); if (r2.champ !== cid) { console.log('runner state after seek', r2); break; }
      undos++;
    }
    cur = cid;
    continue;
  }
  if (cur === null || s.step.actor.kind !== 1 || s.step.actor.index !== cur) continue;
  const k = s.step.kind, to = s.step.to, cid = cur, b = before;
  if (k === 8 || k === 26 || k === 27) {
    const c = E.Game_Runner_EndTurn(L, k === 8 ? 0 : k === 26 ? 1 : 2);
    if (c) { console.log('EndTurn error', err(c)); break; }
    turns++; cur = null; continue;
  }
  let c = 0;
  if (k === 4) c = E.Game_Action_Move(L, to.x, to.y, outb);
  else if (k === 5) { const u = unitAt(b, to.x, to.y); c = u ? E.Game_Action_Attack(L, ent(u[0], u[1])) : -1; }
  else if (k === 6) {
    const u = unitAt(b, to.x, to.y);
    c = E.Game_Action_Cast(L, s.step.abilitySlot, u ? ent(u[0], u[1]) : ent(0, 0), pos(to.x, to.y), outb);
    if (c && u) c = E.Game_Action_Cast(L, s.step.abilitySlot, ent(0, 0), pos(to.x, to.y), outb);
  }
  else if (k === 9) c = E.Game_Action_SetPriority(L, s.step.priority);
  else if (k === 11) c = E.Game_Action_Recall(L);
  else if (k === 12) c = E.Game_Action_SubmitGems(L, pos(to.x, to.y));
  else if (k === 13 || k === 25) {
    // Buy (or sell) until the live inventory equals the recorded one; shards combine into emblems.
    const z = s.champions.find((o) => o.entity.index === cid);
    const items = () => { V().setUint32(persp, 2, true); V().setUint32(persp + 4, 0xffffffff, true); E.Game_API_Champion_GetItems(L, persp, cid, args8 + 64, 42) || 0; return Array.from({ length: 42 }, (_, q) => V().getUint32(args8 + 64 + 4 * q, true)); };
    for (let g = 0; g < 12; g++) {
      const have = items();
      const i = z.items.findIndex((n, q) => n !== have[q] && (k === 25 ? n < have[q] : n > have[q]));
      if (i < 0) break;
      if (k === 25) { c = E.Game_Action_Sell(L, i); }
      else { c = E.Game_Action_BuyItem(L, i, 1); if (c && i % 2 === 1) c = E.Game_Action_BuyItem(L, i - 1, 1); }
      if (c) break;
    }
    if (k === 13) {
      const a = b.champions.find((o) => o.entity.index === cid);
      z.consumables.forEach((n, it) => { for (let q = 0; q < n - a.consumables[it]; q++) c ||= E.Game_Action_BuyConsumable(L, it); });
    }
  }
  else if (k === 14) c = E.Game_Action_PlaceWard(L, pos(to.x, to.y), outb);
  else if (k === 15 || k === 20 || k === 21) {
    const a = b.champions.find((o) => o.entity.index === cid), z = s.champions.find((o) => o.entity.index === cid);
    const id = k === 20 ? 1 : k === 21 ? 0 : z.consumables.findIndex((n, it) => n < a.consumables[it]);
    c = E.Game_Action_UseConsumable(L, Math.max(0, id), pos(to.x, to.y), outb);
  }
  else if (k === 16) c = E.Game_Action_CancelChannel(L);
  else continue;
  if (c) { actionErrors++; if (verbose || actionErrors < 15) console.log(`action error r${s.round} champ ${cid} ${STEP_KINDS[k]} to ${to.x},${to.y}: ${err(c)}`); }
}
console.log(`undos ${undos}`); console.log(`turns replayed ${turns}, action errors ${actionErrors}, ${diverged ? 'diverged at round ' + diverged : 'no divergence'}`);
