// Branch states for big-bag deaths: for each of our deaths while carrying >= 30 gems in heavy losses, the first turn in
// the K rounds before it where the carrier had an enemy within 6 (from a turnhost --detail shadow run).
//   node select_bag_states.mjs <shadow dir> <out.json> [--k 5] [--min 30]
import fs from 'node:fs';
import path from 'node:path';
const [dir, outFile] = process.argv.slice(2);
const opt = (k, d) => (process.argv.includes('--' + k) ? +process.argv[process.argv.indexOf('--' + k) + 1] : d);
const K = opt('k', 5), MIN = opt('min', 30);
const special = /contest|boss_battle/;
const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
const summary = JSON.parse(fs.readFileSync(path.join(dir, 'summary.json'), 'utf8'));
const states = [];
for (const g of summary) {
  if (g.result === 'win' || special.test(g.map) || g.oppScore - g.score < 500) continue;
  const lim = g.firstDrift > 0 ? g.firstDrift : 1e9;
  const rows = fs.readFileSync(path.join(dir, g.out), 'utf8').trim().split('\n').map((l) => JSON.parse(l)).filter((x) => x.r !== undefined && x.r < lim);
  const by = new Map();
  for (const x of rows) { if (!by.has(x.id)) by.set(x.id, []); by.get(x.id).push(x); }
  for (const list of by.values()) for (let i = 1; i < list.length; i++) {
    if (!(list[i - 1].alive && !list[i].alive) || list[i - 1].gems < MIN) continue;
    const death = list[i].r;
    const s = list.find((x) => x.r >= death - K && x.r < death && x.alive && x.pos && x.ctx && x.gems >= MIN && x.ctx.enemies.some((e) => cheb(x.pos, [e[2], e[3]]) <= 6));
    if (s) states.push({ map: g.map, file: g.file, side: g.side, team: g.side === 'a' ? 0 : 1, round: s.r, champ: s.id, type: s.type, gems: s.gems, hp: `${s.hp}/${s.mhp}`, death });
  }
}
fs.writeFileSync(outFile, JSON.stringify(states, null, 1));
console.log(`${states.length} big-bag pre-death states, ${states.reduce((a, s) => a + s.gems, 0)} gems carried`);
