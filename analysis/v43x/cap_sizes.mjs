// Capture size profile for both sides on selected maps: captures per game by gems captured (0, 1-14, 15-29, 30-59,
// 60+), and first capture round of a 30+ gem group.   node analysis/v43x/cap_sizes.mjs <index.json> <mapRegex>
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
const idxFile = process.argv[2]; const re = new RegExp(process.argv[3] || '.');
const idx = JSON.parse(fs.readFileSync(idxFile, 'utf8')).filter((g) => re.test(g.map));
const B = (g) => g <= 0 ? '0' : g < 15 ? '1-14' : g < 30 ? '15-29' : g < 60 ? '30-59' : '60+';
const S = { us: {}, them: {} }, first = { us: [], them: [] };
for (const g of idx) {
  const us = g.side === 'a' ? 0 : 1; const f = { us: null, them: null };
  await dumpReplay(path.join(path.dirname(idxFile), g.file), { snapshots: 'none', onStep(st, ev, prev) {
    if (!ev || ev.kind !== 'Capture' || !prev) return;
    for (const c of st.champions) { const b = prev.find((x) => x.entity.index === c.entity.index); if (!b || !(c.gems > b.gems || c.gold > b.gold)) continue;
      const side = c.team === us ? 'us' : 'them'; const k = B(c.gems - b.gems); S[side][k] = (S[side][k] || 0) + 1; if (c.gems - b.gems >= 30 && f[side] == null) f[side] = st.round; } } });
  for (const s of ['us', 'them']) first[s].push(f[s] ?? 2000);
}
const med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
for (const s of ['us', 'them']) console.log(`${s.padEnd(4)} captures/game by gems: ` + ['0', '1-14', '15-29', '30-59', '60+'].map((k) => `${k}: ${((S[s][k] || 0) / idx.length).toFixed(1)}`).join(', ') + `; median first 30+ capture r${med(first[s])}`);
