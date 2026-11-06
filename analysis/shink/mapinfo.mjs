// Load a .map26a with the engine wasm and print an ASCII map + altars/spawns/camps.
import fs from 'node:fs';
import { Engine } from '../../tools/replay_dump.mjs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
export async function loadMap(file) {
  const eng = await Engine.create();
  const bytes = fs.readFileSync(file);
  const p = eng.exp.Engine_Malloc(bytes.length);
  new Uint8Array(eng.exp.memory.buffer, p, bytes.length).set(bytes);
  eng.check(eng.exp.Game_FromMapFileBytes(p, bytes.length, eng.outBuf));
  const game = eng.outHandle;
  eng.check(eng.exp.Game_GetBitboardMetadata(game, eng.outBuf));
  const W = eng.view.getInt32(eng.outBuf, true), H = eng.view.getInt32(eng.outBuf + 4, true);
  const get = (fn, x, y) => { const c = eng.exp[fn](game, x, y, eng.outBuf); if (c !== 0) return null; return eng.view.getUint8(eng.outBuf); };
  const grid = [];
  for (let y = 0; y < H; y++) { const row = []; for (let x = 0; x < W; x++) { let ch = '.'; if (get('Game_GetWall', x, y)) ch = '#'; else if (get('Game_GetHole', x, y)) ch = 'o'; else if (get('Game_GetAltar', x, y)) ch = 'A'; else if (get('Game_GetBush', x, y)) ch = '"'; row.push(ch); } grid.push(row); }
  let nc = null; try { const c = eng.exp.Game_GetNumChampsPerTeam(game, eng.outBuf); nc = c === 0 ? eng.view.getUint32(eng.outBuf, true) : 'err' + c; } catch (e) { nc = e.message; }
  return { eng, game, W, H, grid, champsPerTeam: nc };
}
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]) && process.argv[2]) {
  const m = await loadMap(process.argv[2]);
  console.log(m.W, m.H, 'champs', m.champsPerTeam);
  for (let y = m.H - 1; y >= 0; y--) console.log(m.grid[y].join(''));
}
