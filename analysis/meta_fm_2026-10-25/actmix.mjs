// Action mix per champion turn when an enemy champion is within 6 (rounds 1..TO), by side, plus what happens to
// distance to the nearest enemy (approach / hold / retreat) and to the nearest ally.
//   node actmix.mjs <index.json> <out.jsonl> [--sets ..] [--shard i/n] [--to 300]
import fs from 'node:fs';
import { dumpReplay } from '../../tools/replay_dump.mjs';
const args = process.argv.slice(2);
const [idxFile, outFile] = args;
const opt = (k, d) => (args.includes('--' + k) ? args[args.indexOf('--' + k) + 1] : d);
const sh = opt('shard', '0/1').split('/').map(Number);
const sets = opt('sets', '') ? new Set(opt('sets').split(',')) : null;
const TO = +opt('to', 300);
const games = JSON.parse(fs.readFileSync(idxFile, 'utf8')).filter((g) => !sets || sets.has(g.set)).filter((_, i) => i % sh[1] === sh[0]);
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
for (const g of games) {
  const A = [0, 1].map(() => ({ n: 0, champ: 0, camp: 0, move: 0, none: 0, closer: 0, farther: 0, allyCloser: 0, allyFarther: 0, adv: 0, advChamp: 0, dis: 0, disChamp: 0, disAway: 0 }));
  let snap = null; const acts = new Map();
  const close = (st) => {
    if (!snap) return;
    const live = snap.filter((c) => c.alive && c.position);
    for (const c of live) {
      const en = live.filter((o) => o.team !== c.team && cheb(o.position, c.position) <= 6);
      if (!en.length) continue;
      const a = A[c.team === g.us ? 0 : 1];
      const did = acts.get(c.entity.index) || {};
      a.n++;
      if (did.champ) a.champ++; else if (did.camp) a.camp++; else if (did.move) a.move++; else a.none++;
      const now = st.champions.find((x) => x.entity.index === c.entity.index);
      const allies = live.filter((o) => o !== c && o.team === c.team && cheb(o.position, c.position) <= 4);
      const myHp = c.health + allies.reduce((s, o) => s + o.health, 0), thHp = en.reduce((s, o) => s + o.health, 0);
      const share = myHp / (myHp + thHp);
      const dNow = Math.min(...en.map((o) => cheb(o.position, c.position)));
      let dNext = dNow;
      if (now && now.alive && now.position) dNext = Math.min(...en.map((o) => cheb(o.position, now.position)));
      if (dNext < dNow) a.closer++; else if (dNext > dNow) a.farther++;
      if (share >= 0.55) { a.adv++; if (did.champ) a.advChamp++; }
      if (share <= 0.42) { a.dis++; if (did.champ) a.disChamp++; if (dNext > dNow) a.disAway++; }
    }
  };
  let last = -1;
  try {
    await dumpReplay(g.file, { snapshots: 'none', onStep(st, ev) {
      if (st.round > TO + 1) return;
      if (st.round !== last) { if (snap) close(st); snap = st.champions.map((c) => ({ ...c })); acts.clear(); last = st.round; }
      if (ev && ev.actor?.kind === 1) {
        const d = acts.get(ev.actor.index) || {};
        if ((ev.kind === 'Attack' || ev.kind === 'Cast ability') && ev.target?.kind === 'champion' && ev.target.team !== ev.team) d.champ = true;
        if ((ev.kind === 'Attack' || ev.kind === 'Cast ability') && ev.target?.kind === 'camp') d.camp = true;
        if (ev.kind === 'Move') d.move = true;
        acts.set(ev.actor.index, d);
      }
    } });
  } catch (e) { console.error(g.file, e.message); continue; }
  fs.appendFileSync(outFile, JSON.stringify({ set: g.set, result: g.result, us: A[0], them: A[1] }) + '\n');
}
