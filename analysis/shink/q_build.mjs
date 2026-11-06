// Per match (newest first): first items per champion; uses cache from deep.mjs
import fs from 'node:fs';
import { listRows } from './lib.mjs';
const rows = listRows('top_replays/4_SHINK-AI-6500', { recent: +(process.argv[2] || 60) });
for (const r of rows) {
  const cf = `analysis/shink/cache/${r.file.replace('.repl26a', '')}_${r.me}.json`;
  if (!fs.existsSync(cf)) continue;
  const m = JSON.parse(fs.readFileSync(cf, 'utf8'));
  const seq = {};
  for (const s of m.shops) for (const [it, n] of Object.entries(s.items || {})) if (n > 0 && it.includes('Emblem')) (seq[s.champ] ??= []).push(it.replace(' Emblem of ', '*').replace('Strength', 'Str').replace('Health', 'Hp').replace('Focus', 'Foc'));
  console.log(r.createdAt.slice(11, 16), r.map.padEnd(9), (r.opponent || '').slice(0, 10).padEnd(10), m.won ? 'W' : 'L', Object.entries(seq).map(([c, s]) => `${c.slice(0, 4)}:${s.join(',')}`).join(' | '));
}
