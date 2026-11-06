// Path distances between spawns and from spawn to camp groups (8-connected BFS, walls/holes/altars blocked).
import { getMap } from './lib.mjs';
export function bfs(m, roots) {
  const D = new Map(); const q = [];
  for (const r of roots) { D.set(r[0] + ',' + r[1], 0); q.push(r); }
  while (q.length) {
    const [x, y] = q.shift(); const d = D.get(x + ',' + y);
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
      if (nx < 0 || ny < 0 || nx >= m.W || ny >= m.H || D.has(k) || m.wall.has(k) || m.hole.has(k) || m.altars.some((a) => a[0] === nx && a[1] === ny)) continue;
      D.set(k, d + 1); q.push([nx, ny]);
    }
  }
  return D;
}
if (process.argv[1].endsWith('mapinfo.mjs')) {
  for (const n of ['collision', 'corners', 'elkring', 'expanse', 'interlock', 'lanes', 'monolith', 'packs', 'rows']) {
    const m = getMap(n); const DA = bfs(m, m.spawnA);
    const dB = Math.min(...m.spawnB.map((p) => DA.get(p[0] + ',' + p[1]) ?? 1e9));
    console.log(n.padEnd(10), `${m.W}x${m.H}`, 'spawn-spawn path', dB, 'cheb', Math.max(Math.abs(m.spawnAc[0] - m.spawnBc[0]), Math.abs(m.spawnAc[1] - m.spawnBc[1])), 'groups', m.groups.length, 'altars', m.altars.length, 'bush', m.bush.size);
  }
}
