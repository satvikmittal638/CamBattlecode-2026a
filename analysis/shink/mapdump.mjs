// Write ASCII maps with camps + team-A spawn (from a SHINK replay) to analysis/shink/maps/<map>.txt
import fs from 'node:fs';
import { loadMap } from './mapinfo.mjs';
import { dumpReplay } from '../../tools/replay_dump.mjs';
const idx = JSON.parse(fs.readFileSync('top_replays/4_SHINK-AI-6500/index.json', 'utf8'));
fs.mkdirSync('analysis/shink/maps', { recursive: true });
const CH = { Wolf: 'W', Elk: 'E', GemCluster: 'g', GoldCluster: '$', Monolith: 'M' };
for (const f of fs.readdirSync('workspace/maps')) {
  const name = f.replace('.map26a', '');
  const m = await loadMap('workspace/maps/' + f);
  const r = idx.find((x) => x.map === name);
  const d = await dumpReplay('top_replays/4_SHINK-AI-6500/replays/' + r.file, { snapshots: 'round' });
  const s = d.snapshots.find((s) => s.champions.length && s.champions.every((c) => c.pos));
  const g = m.grid.map((row) => row.slice());
  for (const c of s.camps) g[c.pos[1]][c.pos[0]] = CH[c.type] || '?';
  for (const c of s.champions) g[c.pos[1]][c.pos[0]] = c.team === 0 ? 'a' : 'b';
  const counts = {}; for (const c of s.camps) counts[c.type] = (counts[c.type] || 0) + 1;
  let out = `${name} ${m.W}x${m.H} champs/team=${m.champsPerTeam} camps=${JSON.stringify(counts)} altars=${m.grid.flat().filter((x) => x === 'A').length}\n`;
  out += '   ' + Array.from({ length: m.W }, (_, x) => (x % 10)).join('') + '\n';
  for (let y = m.H - 1; y >= 0; y--) out += String(y).padStart(3) + g[y].join('') + '\n';
  fs.writeFileSync(`analysis/shink/maps/${name}.txt`, out);
  console.log(out.split('\n')[0]);
}
