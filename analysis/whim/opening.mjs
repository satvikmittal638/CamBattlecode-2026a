// Opening: first 3 camp groups per champion, with BFS distance from own spawn, per map/side.
import { dumpReplay, loadIndex, loadMap, bfs, groupDist, spawnTiles } from './lib.mjs';
const N = +(process.argv[2] || 60); const only = process.argv[3];
const rows = loadIndex().slice(0, N).filter((r) => !only || r.map === only);
const seen = {};
for (const r of rows) {
  const M = loadMap(r.map); const me = r.side === 'b' ? 1 : 0;
  // probe output was produced as team A; 'S' = team A spawn
  const sp = spawnTiles(M, me); const df = bfs(M, sp);
  const d = await dumpReplay(r.path, { snapshots: 'none' });
  const ids = d.meta.finalChampions.filter((c) => c.team === me);
  const campGroup = {};
  const s1 = (await dumpReplay(r.path, { snapshots: 'round' })).snapshots[1];
  for (const c of s1.camps) campGroup[c.id] = M.campAt.get(c.pos.join(','));
  const parts = [];
  for (const c of ids) {
    const seq = []; let firstR = null;
    for (const e of d.events) if (e.actor?.index === c.id && e.actor.kind === 1 && (e.kind === 'Attack' || e.kind === 'Cast ability') && e.target?.kind === 'camp') { const g = campGroup[e.target.id]; if (seq.at(-1)?.g !== g) seq.push({ g, r: e.round }); if (seq.length > 3) break; }
    parts.push(`${c.type.slice(0, 4)}: ` + seq.slice(0, 3).map((s) => `g${s.g}${M.groups[s.g].label}(d${groupDist(M, df, M.groups[s.g])},r${s.r})`).join(' > '));
  }
  const key = r.map + ' ' + r.side;
  (seen[key] ??= []).push(parts.join(' | '));
}
for (const [k, v] of Object.entries(seen).sort()) { console.log('### ' + k); for (const x of v.slice(0, 3)) console.log('  ' + x); }
