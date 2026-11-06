// Team earned gold at rounds R from field_eval statistics (championTimelines earnedGold), per variant.
//   node localgold.mjs <field_eval dir> [rounds...]
import fs from 'node:fs';
import path from 'node:path';
const dir = process.argv[2];
const R = process.argv.slice(3).map(Number); if (!R.length) R.push(100, 200, 400);
const at = (runs, r) => { let t = 0, v = 0; for (const x of runs) { if (t + x.duration > r) return v; t += x.duration; v = Number(x.value); } return v; };
for (const v of fs.readdirSync(path.join(dir, 'games'))) {
  const sums = R.map(() => 0); let n = 0;
  const walk = (d) => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (f.endsWith('.json')) {
    try { const s = JSON.parse(fs.readFileSync(p, 'utf8')); const me = f.startsWith('a') ? 'teamA' : 'teamB';
      const tl = (s.championTimelines || []).filter((t) => t.metric === 'earnedGold' && t.owner?.team === me); if (!tl.length) return;
      R.forEach((r, i) => { sums[i] += tl.reduce((a, t) => a + at(t.runs, r), 0); }); n++; } catch {} } } };
  walk(path.join(dir, 'games', v));
  console.log(v.padEnd(10), `games ${n}`, R.map((r, i) => `r${r} ${(sums[i] / Math.max(1, n)).toFixed(0)}`).join('  '));
}
