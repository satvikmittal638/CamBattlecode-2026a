// Probe: what the engine's bot API reveals at a replay position (shared/draft memory, cooldowns...).
import { Engine, readReplayBytes, replayEngineVersion } from './replay_dump.mjs';
const file = process.argv[2]; const target = +(process.argv[3] || 300);
const bytes = readReplayBytes(file);
const eng = await Engine.create(replayEngineVersion(bytes));
const p = eng.exp.Engine_Malloc(bytes.length);
new Uint8Array(eng.exp.memory.buffer, p, bytes.length).set(bytes);
eng.check(eng.exp.Game_FromReplayFileBytes(p, bytes.length, eng.outBuf));
const game = eng.outHandle;
eng.check(eng.exp.Game_Visualiser_Timeline_GetMain(game, eng.outBuf));
const main = eng.outHandle;
eng.check(eng.exp.Game_Visualiser_Timeline_Seek(game, main, 0, 0));
const buf = eng.exp.Engine_Malloc(4096), persp = eng.exp.Engine_Malloc(16);
const V = () => eng.view;
const round = () => { eng.check(eng.exp.Game_API_GetRoundNumber(game, buf)); return V().getUint32(buf, true); };
let n = 0;
while (round() < target) { try { eng.check(eng.exp.Game_Visualiser_Timeline_ReplayNext(game, 1)); } catch (e) { console.log('end', e.message); break; } n++; }
console.log('round', round(), 'steps', n);
const tryCall = (name, ...a) => { try { const r = eng.exp[name](game, ...a); return r === 0 ? 'ok' : 'err ' + r + ' ' + eng.cstr(eng.exp.GetLastErrorMsg()); } catch (e) { return 'throw ' + e.message; } };
for (const team of [0, 1]) for (const champ of [0, 1, 2, 6, 7, 0xffffffff]) {
  V().setUint32(persp, team, true); V().setUint32(persp + 4, champ >>> 0, true);
  new Uint8Array(eng.exp.memory.buffer, buf, 64).fill(0xee);
  const r1 = tryCall('Game_API_ReadSharedMemory', persp, 0, buf, 8);
  const sm = Array.from(new Uint8Array(eng.exp.memory.buffer, buf, 8));
  new Uint8Array(eng.exp.memory.buffer, buf, 64).fill(0xee);
  const r2 = tryCall('Game_API_ReadDraftMemory', persp, 0, buf, 32);
  const dm = Array.from(new Uint8Array(eng.exp.memory.buffer, buf, 32));
  console.log(`team ${team} champ ${champ}: shared ${r1} [${sm}]  draft ${r2} [${dm.slice(0, 24)}]`);
}
// champion info / cooldowns / channel / priority from team 0 champion 0 perspective
V().setUint32(persp, 0, true); V().setUint32(persp + 4, 0, true);
for (let c = 0; c < 12; c++) {
  const a = tryCall('Game_API_Champion_Get', persp, c, buf);
  const info = a === 'ok' ? [0, 1, 2, 3].map((i) => V().getInt32(buf + i * 4, true)).concat([4, 5, 6, 7].map((i) => +V().getFloat32(buf + i * 4, true).toFixed(1))).concat([8, 9, 10].map((i) => V().getInt32(buf + i * 4, true))) : a;
  const cds = [0, 1].map((s) => { const r = tryCall('Game_API_Champion_GetCooldown', persp, c, s, buf); return r === 'ok' ? V().getInt32(buf, true) : r; });
  const ch = tryCall('Game_API_Champion_GetChannelTime', persp, c, buf); const chv = ch === 'ok' ? V().getInt32(buf, true) : ch;
  const pr = tryCall('Game_API_Champion_GetPriority', persp, c, 0, buf); const prv = pr === 'ok' ? V().getInt32(buf, true) : pr;
  console.log('champ', c, JSON.stringify(info), 'cd', JSON.stringify(cds), 'channel', chv, 'prio', prv);
}
V().setUint32(persp, 0, true); V().setUint32(persp + 4, 0, true);
console.log('shared msg', tryCall('Game_API_ReadSharedMemory', persp, 0, buf, 8), '| size', tryCall('Game_API_GetSharedMemorySize', persp, buf), V().getUint32(buf, true));
console.log('draft size', tryCall('Game_API_GetDraftMemorySize', persp, buf), V().getUint32(buf, true));
for (const off of [0]) { const r = tryCall('Game_API_ReadDraftMemory', persp, 0, buf, 8); console.log('draft read 8', r); }
// visualiser shared memory export
for (const fn of ['Game_Visualiser_GetSharedMemory', 'Game_Visualiser_GetDraftMemory']) {
  for (const team of [0, 1]) { try { const r = eng.exp[fn](game, team, buf); console.log(fn, team, r, r === 0 ? Array.from(new Uint8Array(eng.exp.memory.buffer, buf, 16)) : eng.cstr(eng.exp.GetLastErrorMsg()), V().getUint32(buf, true), V().getUint32(buf + 4, true)); } catch (e) { console.log(fn, 'throw', e.message); } }
}
console.log('--- visualiser memory, 5-arg forms');
for (const fn of ['Game_Visualiser_GetSharedMemory', 'Game_Visualiser_GetDraftMemory']) for (const team of [0, 1]) {
  for (const [label, args] of [['(team,0,buf,8)', [team, 0, buf, 8]], ['(team,buf,8,0)', [team, buf, 8, 0]], ['(team,buf,0,8)', [team, buf, 0, 8]]]) {
    new Uint8Array(eng.exp.memory.buffer, buf, 64).fill(0xee);
    let r; try { r = eng.exp[fn](game, ...args); } catch (e) { r = 'throw ' + e.message; }
    console.log(fn.replace('Game_Visualiser_', ''), team, label, r, r === 0 ? JSON.stringify(Array.from(new Uint8Array(eng.exp.memory.buffer, buf, 24))) : eng.cstr(eng.exp.GetLastErrorMsg()));
  }
}
