// Captured group label by champion and map (from deep.mjs cache).
import fs from 'node:fs';
import { listRows } from './lib.mjs';
const dir = process.argv[2] || 'top_replays/4_SHINK-AI-6500';
const rows = listRows(dir, { recent: +(process.argv[3] || 30), teamName: process.argv[4] || 'Agentic Loop Builders' });
const byMap = {};
for (const r of rows) {
  const cf = `analysis/shink/cache/${r.file.replace('.repl26a', '')}_${r.me}.json`;
  if (!fs.existsSync(cf)) continue;
  const m = JSON.parse(fs.readFileSync(cf, 'utf8'));
  const o = (byMap[r.map] ??= { n: 0, c: {} }); o.n++;
  for (const c of m.captures) { const k = c.champ; (o.c[k] ??= {}); o.c[k][c.label + (c.share > 1 ? '(sh)' : '')] = (o.c[k][c.label + (c.share > 1 ? '(sh)' : '')] || 0) + 1; }
}
for (const [mp, o] of Object.entries(byMap)) {
  console.log('==', mp, 'games', o.n);
  for (const [ch, t] of Object.entries(o.c)) console.log('   ', ch.padEnd(9), Object.entries(t).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${(v / o.n).toFixed(1)}`).join(' '));
}
