// Compare the fuel calibration bot's measurements under the official CLI and under turnhost.
//   node fuelcal_compare.mjs <cli team stdout> <turnhost jsonl>
import fs from 'node:fs';
const parse = (t) => { const m = []; for (const l of t.replace(/\0/g, '').split('\n')) { const a = l.trim().match(/^t (\S+) (-?\d+) (-?\d+) (-?\d+)$/); if (a) m.push({ n: a[1] + '(' + a[2] + ')', c: +a[3], aux: +a[4] }); } return m; };
const real = parse(fs.readFileSync(process.argv[2], 'utf8'));
const L = fs.readFileSync(process.argv[3], 'utf8').trim().split('\n').map(JSON.parse).filter((x) => x.r !== undefined);
const h = parse(L.map((x) => x.log).join('\n'));
const used = new Set();
for (const r of real) {
  const j = h.findIndex((x, k) => x.n === r.n && !used.has(k));
  if (j < 0) { console.log(r.n, 'missing in harness'); continue; }
  used.add(j);
  const q = h[j];
  console.log(r.n.padEnd(18), 'cli', String(r.c).padStart(7), 'harness', String(q.c).padStart(7), 'diff', String(r.c - q.c).padStart(7), 'aux', r.aux, q.aux);
}
