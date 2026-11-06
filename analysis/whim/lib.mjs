// Shared helpers for WHIM analysis scripts (decode in memory, keep only summaries).
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
export { dumpReplay };
const HERE = path.dirname(new URL(import.meta.url).pathname);

// Parse analysis/whim/maps/<map>.txt (produced by the draft-phase probe bot).
export function loadMap(name) {
  const f = path.join(HERE, 'maps', name + '.txt');
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  const [, W, H] = lines[0].match(/MAP (\d+)x(\d+)/).map(Number);
  const teamSize = +lines[0].match(/teamsize=(\d+)/)[1];
  const groups = [];
  const grid = [];
  for (const l of lines.slice(1)) {
    if (l.startsWith('GROUP')) {
      const m = l.match(/GROUP (\d+) gold=(\d+) gems=(\d+) respawn=(\d+) camps:(.*)/);
      const camps = [...m[5].matchAll(/([WKGDM])\((\d+),(\d+)\)/g)].map((x) => ({ k: x[1], x: +x[2], y: +x[3] }));
      const comp = {}; for (const c of camps) comp[c.k] = (comp[c.k] || 0) + 1;
      const label = Object.entries(comp).sort().map(([k, n]) => k + n).join('');
      const cx = camps.reduce((s, c) => s + c.x, 0) / camps.length, cy = camps.reduce((s, c) => s + c.y, 0) / camps.length;
      groups.push({ id: +m[1], gold: +m[2], gems: +m[3], respawn: +m[4], camps, label, cx, cy });
    } else if (grid.length < H && l.length >= W && !l.startsWith('CONST') && !l.startsWith('MAP')) grid.push(l);
  }
  grid.reverse(); // grid[y][x]
  const altars = [], spawnA = [], spawnB = [];
  for (let y = 0; y < grid.length; y++) for (let x = 0; x < W; x++) {
    const c = grid[y][x]; if (c === 'A') altars.push([x, y]);
  }
  const campAt = new Map();
  for (const g of groups) for (const c of g.camps) campAt.set(c.x + ',' + c.y, g.id);
  return { name, W, H, teamSize, groups, grid, altars, campAt };
}
export const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));

export function loadIndex(dir = 'top_replays/3_WHIM') {
  const rows = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8')).map((r) => ({ ...r, path: path.join(dir, 'replays', r.file) }));
  rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return rows;
}
export const mean = (a) => (a.length ? +(a.reduce((s, x) => s + x, 0) / a.length).toFixed(2) : null);
export const median = (a) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
export const pct = (a, p) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * p))]; };
export const hist = (a, bins) => { const h = {}; for (const x of a) { let b = bins.findLast((v) => x >= v); h[b] = (h[b] || 0) + 1; } return h; };

// BFS (8-neighbour) distance from a set of source tiles on a parsed map. Blocked: walls, holes, altars, camp tiles.
export function bfs(M, sources, { blockCamps = true } = {}) {
  const { W, H, grid } = M;
  const dist = new Int32Array(W * H).fill(-1);
  const blocked = (x, y) => { const c = grid[y][x]; if (c === '#' || c === 'o' || c === 'A') return true; if (blockCamps && 'WKGDM'.includes(c)) return true; return false; };
  const q = [];
  for (const [x, y] of sources) { if (dist[y * W + x] < 0) { dist[y * W + x] = 0; q.push(x, y); } }
  for (let i = 0; i < q.length; i += 2) {
    const x = q[i], y = q[i + 1], d0 = dist[y * W + x];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      if (dist[ny * W + nx] >= 0 || blocked(nx, ny)) continue;
      dist[ny * W + nx] = d0 + 1; q.push(nx, ny);
    }
  }
  return (x, y) => dist[y * W + x];
}
// Distance from a source set to a group = min over tiles adjacent (Chebyshev 1) to any camp tile of the group.
export function groupDist(M, distFn, g) {
  let best = 1e9;
  for (const c of g.camps) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const x = c.x + dx, y = c.y + dy; if (x < 0 || y < 0 || x >= M.W || y >= M.H) continue; const d = distFn(x, y); if (d >= 0 && d < best) best = d;
  }
  return best;
}
export function spawnTiles(M, side) { const ch = side === 0 ? 'S' : 'E'; const t = []; for (let y = 0; y < M.H; y++) for (let x = 0; x < M.W; x++) if (M.grid[y][x] === ch) t.push([x, y]); return t; }
