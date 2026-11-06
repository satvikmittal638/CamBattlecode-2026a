import { openAtTurn } from './replay_state.mjs';
const [file, round, team, type] = [process.argv[2], +process.argv[3], +process.argv[4], process.argv[5]];
const s = await openAtTurn(file, { round, team, type });
const { eng, game, champion } = s; const E = eng.exp, V = () => eng.view;
const persp = E.Engine_Malloc(64), out = E.Engine_Malloc(8192), meta = E.Engine_Malloc(64);
V().setUint32(persp, team, true); V().setUint32(persp + 4, champion.entity.index, true);
for (const n of [1, 4, 8, 16]) { const c = E.Game_API_ReadSharedMemory(game, persp, 0, out, n); console.log('shared n', n, c, Array.from(new Uint8Array(E.memory.buffer, out, n)).join(',')); }
for (const n of [8, 64, 1024]) { const c = E.Game_API_ReadDraftMemory(game, persp, 0, out, n); console.log('draft n', n, c, Array.from(new Uint8Array(E.memory.buffer, out, Math.min(n, 24))).join(',')); }
E.Game_GetBitboardMetadata(game, meta);
for (const f of ['Bitboard_GetRawBufferSize', 'Bitboard_GetLinearBufferSize', 'DistanceField_GetRawBufferSize', 'DistanceField_GetLinearBufferSize']) { const c = E[f](meta, out); console.log(f, c, V().getUint32(out, true)); }
// compare Map_GetWallBitboard with Game_GetWallBuffer
E.Bitboard_GetRawBufferSize(meta, out); const bb = V().getUint32(out, true);
new Uint8Array(E.memory.buffer, out, 8192).fill(0xcd);
console.log('wallbb', E.Game_API_Map_GetWallBitboard(game, persp, out));
const a = Array.from(new Uint8Array(E.memory.buffer, out, bb + 16));
E.Game_GetWallBuffer(game, meta + 32); const p = V().getUint32(meta + 32, true);
const b = Array.from(new Uint8Array(E.memory.buffer, p, bb));
console.log('rawbytes', bb, 'equal', a.slice(0, bb).every((x, i) => x === b[i]), 'tail', a.slice(bb, bb + 16).join(','));
