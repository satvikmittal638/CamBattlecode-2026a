// Camp layout of a map from one local replay: every camp at its first appearance (type, position, HP), clustered into
// groups by adjacency (Chebyshev <= 2), plus both spawns.   node mapcamps.mjs <replay.repl26a>
import { dumpReplay } from '../../tools/replay_dump.mjs';
const d = await dumpReplay(process.argv[2], { snapshots: 'round', mapInfo: true });
const s = d.snapshots.find((x) => x.camps.length);
const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
const camps = s.camps.map((c) => ({ ...c })), seen = new Set(), groups = [];
for (const c of camps) {
  if (seen.has(c.id)) continue;
  const g = [c]; seen.add(c.id);
  for (let i = 0; i < g.length; i++) for (const o of camps) if (!seen.has(o.id) && cheb(o.pos, g[i].pos) <= 2) { seen.add(o.id); g.push(o); }
  groups.push(g);
}
const sp = d.meta.mapInfo.spawn;
console.log('map', d.meta.width, 'x', d.meta.height, 'spawn A', JSON.stringify(sp[0]), 'spawn B', JSON.stringify(sp[1]));
const center = (r) => [(r.minX + r.maxX) / 2, (r.minY + r.maxY) / 2];
for (const g of groups.sort((a, b) => b.reduce((t, c) => t + c.hp, 0) - a.reduce((t, c) => t + c.hp, 0))) {
  const hp = g.reduce((t, c) => t + c.hp, 0), p = g[0].pos;
  console.log(`${String(hp).padStart(6)} hp  ${g.map((c) => c.type).join('+').padEnd(30)} at ${p}  dA ${cheb(p, center(sp[0]))} dB ${cheb(p, center(sp[1]))}`);
}
