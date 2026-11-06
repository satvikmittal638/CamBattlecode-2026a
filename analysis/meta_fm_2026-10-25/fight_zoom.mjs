// Print the rounds before a death: every champion's position/HP/bag for both teams.
//   node fight_zoom.mjs <traj.json> <deathIndex|all-early> [--before 8] [--team 0|1]
import fs from 'node:fs';
const [file, which] = process.argv.slice(2);
const before = process.argv.includes('--before') ? +process.argv[process.argv.indexOf('--before') + 1] : 8;
const g = JSON.parse(fs.readFileSync(file, 'utf8'));
const list = which === 'all-early' ? g.deaths.filter((d) => d[0] <= 300) : [g.deaths[+which]];
const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
for (const d of list) {
  const [r, t, x, y, bag, typ] = d;
  console.log(`\n=== r${r} ${t === 0 ? 'OUR' : 'OPP'} ${typ} dies at (${x},${y}) bag ${bag}`);
  for (const R of g.rounds.filter((q) => q.r >= r - before && q.r <= r)) {
    const near = R.c.filter((c) => c[3] >= 0 && cheb([c[3], c[4]], [x, y]) <= 8).map((c) => `${c[0] === 0 ? 'u' : 'o'}:${c[2].slice(0, 4)}(${c[3]},${c[4]})${c[6]}`);
    console.log(`  r${R.r}: ${near.join(' ')}`);
  }
}
