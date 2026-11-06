// Pick branch states for counterfactual rollouts: for each of our deaths in heavy losses, the earliest turn in the
// K rounds before it where the dying champion was in a flagged risky situation (enemy within 2, low HP with a threat,
// or inside an awake camp's range). One state per death, before the first replay drift.
//   node select_states.mjs <shadow runs dir> <out.json> [--k 5]
import fs from 'node:fs';
import path from 'node:path';
const [dir, outFile] = process.argv.slice(2);
const K = +(process.argv.includes('--k') ? process.argv[process.argv.indexOf('--k') + 1] : 5);
const special = /contest|boss_battle/;
const CAMP = ['Wolf', 'Elk', 'GemCluster', 'GoldCluster', 'Monolith', 'Golem'];
const RANGE = { Wolf: 3, Elk: 4, Golem: 4, Monolith: 5 };
const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
const summary = JSON.parse(fs.readFileSync(path.join(dir, 'summary.json'), 'utf8'));
const states = [];
for (const g of summary) {
  if (g.result === 'win' || special.test(g.map) || g.oppScore - g.score < 500) continue;
  const lim = g.firstDrift > 0 ? g.firstDrift : 1e9;
  const rows = fs.readFileSync(path.join(dir, g.out), 'utf8').trim().split('\n').map((l) => JSON.parse(l)).filter((x) => x.r !== undefined && x.r < lim);
  const by = new Map();
  for (const x of rows) { if (!by.has(x.id)) by.set(x.id, []); by.get(x.id).push(x); }
  for (const list of by.values()) {
    for (let i = 1; i < list.length; i++) {
      if (!(list[i - 1].alive && !list[i].alive)) continue;
      const death = list[i].r;
      const risky = list.filter((x) => x.r >= death - K && x.r < death && x.alive && x.ctx && x.pos).find((x) => {
        const hpf = x.hp / Math.max(1, x.mhp);
        const e2 = x.ctx.enemies.some((e) => cheb(x.pos, [e[2], e[3]]) <= 2);
        const e4 = x.ctx.enemies.some((e) => cheb(x.pos, [e[2], e[3]]) <= 4);
        const camp = x.ctx.camps.some((k) => k[5] === 1 && RANGE[CAMP[k[1]]] && cheb(x.pos, [k[2], k[3]]) <= RANGE[CAMP[k[1]]]);
        return e2 || (hpf < 0.4 && (e4 || camp)) || camp;
      });
      if (risky) states.push({ map: g.map, file: g.file, side: g.side, team: g.side === 'a' ? 0 : 1, round: risky.r, champ: risky.id, type: risky.type, hp: `${risky.hp}/${risky.mhp}`, death });
    }
  }
}
fs.writeFileSync(outFile, JSON.stringify(states, null, 1));
console.log(`${states.length} states from ${new Set(states.map((s) => s.file)).size} games`);
