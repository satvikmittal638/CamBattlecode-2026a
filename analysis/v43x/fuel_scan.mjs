// Per-map fuel profile of our side from platform replay bundles (team-<side>.fuel: 77-byte header,
// then one u64 per draft pick and per own End-turn step; values treated as fuel spent per turn).
//   node analysis/v43x/fuel_scan.mjs <index.json>
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const idxFile = process.argv[2]; const idx = JSON.parse(fs.readFileSync(idxFile, 'utf8'));
const by = {};
for (const g of idx) {
  const f = path.join(path.dirname(idxFile), g.file); let buf;
  try { buf = execFileSync('unzip', ['-p', f, `team-${g.side}.fuel`], { maxBuffer: 1 << 28 }); } catch { continue; }
  if (buf.length < 85) continue;
  const n = Math.floor((buf.length - 77) / 8); const v = []; for (let i = 0; i < n; i++) v.push(Number(buf.readBigUInt64LE(77 + 8 * i)));
  const turns = v.slice(5); const hi = turns.filter((x) => x >= 60000).length;
  const b = by[g.map] = by[g.map] || { games: 0, turns: 0, hi: 0, sum: 0, res: [] }; b.games++; b.turns += turns.length; b.hi += hi; b.sum += turns.reduce((s, x) => s + x, 0); b.res.push(g.result[0]);
}
for (const [m, b] of Object.entries(by).sort((a, c) => c[1].sum / c[1].turns - a[1].sum / a[1].turns)) console.log(m.padEnd(22), 'mean/turn', (b.sum / b.turns / 1000).toFixed(1) + 'k', '>=60k', (100 * b.hi / b.turns).toFixed(0) + '%', b.res.join(''));
