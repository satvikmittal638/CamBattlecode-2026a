// Support at contact: for each champion-round with an enemy champion within 6, allies within 4 (support) and
// enemies within 6; by window. Also overall allies-within-4 (cohesion) by window.
//   node contact.mjs <index.json> <out.jsonl> [--sets ..] [--shard i/n]
import fs from 'node:fs';
import { dumpReplay } from '../../tools/replay_dump.mjs';
const args = process.argv.slice(2);
const [idxFile, outFile] = args;
const opt = (k, d) => (args.includes('--' + k) ? args[args.indexOf('--' + k) + 1] : d);
const sh = opt('shard', '0/1').split('/').map(Number);
const sets = opt('sets', '') ? new Set(opt('sets').split(',')) : null;
const W = [[1, 60], [61, 150], [151, 300], [301, 600]];
const games = JSON.parse(fs.readFileSync(idxFile, 'utf8')).filter((g) => !sets || sets.has(g.set)).filter((_, i) => i % sh[1] === sh[0]);
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
for (const g of games) {
  const acc = [0, 1].map(() => W.map(() => ({ n: 0, coh: 0, cn: 0, sup: 0, en: 0, hpR: 0 })));
  let last = -1;
  try {
    await dumpReplay(g.file, { snapshots: 'none', onStep(st) {
      if (st.round === last || st.round > 600) return; last = st.round;
      const w = W.findIndex(([a, b]) => st.round >= a && st.round <= b); if (w < 0) return;
      const live = st.champions.filter((c) => c.alive && c.position);
      for (const c of live) {
        const a = acc[c.team === g.us ? 0 : 1][w];
        const allies4 = live.filter((o) => o !== c && o.team === c.team && cheb(o.position, c.position) <= 4);
        const en6 = live.filter((o) => o.team !== c.team && cheb(o.position, c.position) <= 6);
        a.n++; a.coh += allies4.length;
        if (en6.length) {
          a.cn++; a.sup += allies4.length; a.en += en6.length;
          const myHp = c.health + allies4.reduce((s, o) => s + o.health, 0), thHp = en6.reduce((s, o) => s + o.health, 0);
          a.hpR += myHp / (myHp + thHp);
        }
      }
    } });
  } catch (e) { console.error(g.file, e.message); continue; }
  fs.appendFileSync(outFile, JSON.stringify({ set: g.set, result: g.result, map: g.map, side: g.side, acc }) + '\n');
}
