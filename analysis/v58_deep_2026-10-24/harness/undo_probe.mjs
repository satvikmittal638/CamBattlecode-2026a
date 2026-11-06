import fs from 'node:fs';
import { Engine } from '../../../tools/replay_dump.mjs';
import { decodeTimeline } from '../../../tools/replay_dump.mjs';
const eng = await Engine.create('v1_0_3'); const E = eng.exp; const V = () => eng.view;
const mapBytes = fs.readFileSync(process.argv[2]);
const mp = E.Engine_Malloc(mapBytes.length); new Uint8Array(E.memory.buffer, mp, mapBytes.length).set(mapBytes);
eng.check(E.Game_FromMapFileBytes(mp, mapBytes.length, eng.outBuf, 0)); const L = eng.outHandle;
const outb = E.Engine_Malloc(64), snap = E.Engine_Malloc(40152), persp = E.Engine_Malloc(16);
const err = (c) => (c === 0 ? 'ok' : `${c} ${eng.cstr(E.GetLastErrorMsg())}`);
const rs = () => { eng.check(E.Game_Runner_GetState(L, outb)); return { phase: V().getUint32(outb, true), team: V().getUint32(outb + 4, true), round: V().getUint32(outb + 8, true), champ: V().getInt32(outb + 12, true) }; };
const tl = () => { eng.check(E.Game_Visualiser_ReadTimelineState(L, snap)); const v = V(); return { tl: v.getBigUint64(snap + 48, true), inputPos: v.getUint32(snap + 56, true), awaiting: v.getUint32(snap + 20, true), stepPos: v.getUint32(snap + 100, true), sub: v.getUint32(snap + 104, true), kind: v.getUint32(snap + 68, true), round: v.getUint32(snap + 8, true) }; };
console.log('checkpoints', err(E.Game_Runner_SetCheckpointsEnabled(L, 1)));
eng.check(E.Game_Runner_Init(L));
const picks = [[11, 2, 0, 6, 1], [11, 1, 0, 6, 2]];
while (rs().phase === 0) { const r = rs(); eng.check(E.Game_Action_Draft(L, picks[r.team][r.round])); eng.check(E.Game_Runner_EndTurn(L, 0)); }
for (let k = 0; k < 10000 && rs().champ < 0; k++) eng.check(E.Game_Runner_Step(L));
const r = rs(); console.log('turn', r, tl());
V().setUint32(persp, 2, true); V().setUint32(persp + 4, 0xffffffff, true);
eng.check(E.Game_API_Champion_Get(L, persp, r.champ, outb)); const x = V().getInt32(outb + 8, true), y = V().getInt32(outb + 12, true);
console.log('champ at', x, y);
for (const [dx, dy] of [[-1, 0], [1, 0], [0, 1], [0, -1], [-1, -1], [1, 1], [-1, 1], [1, -1]]) { const c = E.Game_Action_Move(L, x + dx, y + dy, outb); if (c === 0) { console.log('moved', dx, dy); break; } }
const after = tl(); console.log('after move', after);
eng.check(E.Game_API_Champion_Get(L, persp, r.champ, outb)); console.log('pos now', V().getInt32(outb + 8, true), V().getInt32(outb + 12, true));
for (const [p, s] of [[after.stepPos, after.sub], [after.inputPos, after.sub], [after.stepPos, 0]]) {
  let c; try { c = E.Game_Visualiser_Timeline_DeleteAction(L, after.tl, p, s); } catch (e) { c = 'trap ' + e.message; }
  console.log('delete', p, s, typeof c === 'number' ? err(c) : c);
  if (c === 0) break;
}
eng.check(E.Game_API_Champion_Get(L, persp, r.champ, outb)); console.log('pos after delete', V().getInt32(outb + 8, true), V().getInt32(outb + 12, true), rs(), tl());
console.log('endturn', err(E.Game_Runner_EndTurn(L, 0)));
