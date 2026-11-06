// Stage distribution from a trace-build shadow run, joined with traj positions (enemy proximity, deaths).
//   node stages.mjs <shadowDir> <trajDir> <trajSetPrefix> [--to 300]
import fs from 'node:fs';
import path from 'node:path';
const [sd, td, prefix] = process.argv.slice(2);
const TO = process.argv.includes('--to') ? +process.argv[process.argv.indexOf('--to') + 1] : 300;
const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
const all = {}, near = {}, preDeath = {}, idleNear = {};
let nAll = 0, nNear = 0, nPre = 0;
for (const f of fs.readdirSync(sd).filter((f) => f.endsWith('.jsonl'))) {
  const stem = f.split('__')[1].replace('.jsonl', '').slice(-8);
  const tf = fs.readdirSync(td).find((x) => x.startsWith(prefix) && x.includes(stem));
  if (!tf) continue;
  const T = JSON.parse(fs.readFileSync(path.join(td, tf), 'utf8'));
  const byR = new Map(T.rounds.map((r) => [r.r, r]));
  const ourDeaths = T.deaths.filter((d) => d[1] === 0);
  for (const line of fs.readFileSync(path.join(sd, f), 'utf8').split('\n').filter(Boolean)) {
    const t = JSON.parse(line);
    if (t.r > TO || !t.alive) continue;
    const m = /decision \d+ \d+ (\S+)/.exec(t.log || '');
    const st = m ? m[1] : (t.bot.length ? 'nolog' : 'nolog-idle');
    all[st] = (all[st] || 0) + 1; nAll++;
    const R = byR.get(t.r);
    const en = R ? R.c.filter((c) => c[0] === 1 && c[3] >= 0 && cheb([c[3], c[4]], t.pos) <= 6).length : 0;
    if (en) { near[st] = (near[st] || 0) + 1; nNear++; }
    if (ourDeaths.some((d) => d[0] - t.r >= 0 && d[0] - t.r <= 6 && cheb([d[2], d[3]], t.pos) <= 3)) { preDeath[st] = (preDeath[st] || 0) + 1; nPre++; }
  }
}
const show = (o, n, k = 14) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, k).map(([s, c]) => `${s} ${(100 * c / n).toFixed(1)}%`).join(', ');
console.log(`all turns (r<=${TO}) ${nAll}: ${show(all, nAll)}`);
console.log(`\nenemy within 6 (${nNear}): ${show(near, nNear)}`);
console.log(`\nlast 6 rounds before own death (${nPre}): ${show(preDeath, nPre)}`);
