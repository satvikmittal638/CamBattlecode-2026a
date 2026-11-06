// Fight outcomes conditioned on local HP share: for each champion-round with an enemy within 6 (rounds 1..TO),
// bucket by share = (own + allies within 4 HP) / (that + enemies within 6 HP); record whether this champion dies within
// the next 10 rounds and whether any of those enemies dies within the next 10 rounds.
//   node fightodds.mjs <index.json> <out.jsonl> [--sets ..] [--shard i/n] [--to 400]
import fs from 'node:fs';
import { dumpReplay } from '../../tools/replay_dump.mjs';
const args = process.argv.slice(2);
const [idxFile, outFile] = args;
const opt = (k, d) => (args.includes('--' + k) ? args[args.indexOf('--' + k) + 1] : d);
const sh = opt('shard', '0/1').split('/').map(Number);
const sets = opt('sets', '') ? new Set(opt('sets').split(',')) : null;
const TO = +opt('to', 400);
const B = [0.3, 0.42, 0.5, 0.58, 0.7, 2];
const games = JSON.parse(fs.readFileSync(idxFile, 'utf8')).filter((g) => !sets || sets.has(g.set)).filter((_, i) => i % sh[1] === sh[0]);
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
for (const g of games) {
  const samples = []; const deathRound = new Map(); // id -> list of death rounds
  let last = -1, prev = null;
  try {
    await dumpReplay(g.file, { snapshots: 'none', onStep(st) {
      if (prev) for (const c of st.champions) { const b = prev.find((p) => p.entity.index === c.entity.index); if (b && b.alive && !c.alive) { const l = deathRound.get(c.entity.index) || []; l.push(st.round); deathRound.set(c.entity.index, l); } }
      prev = st.champions.map((c) => ({ entity: c.entity, alive: c.alive }));
      if (st.round === last || st.round > TO) return; last = st.round;
      const live = st.champions.filter((c) => c.alive && c.position);
      for (const c of live) {
        const en = live.filter((o) => o.team !== c.team && cheb(o.position, c.position) <= 6);
        if (!en.length) continue;
        const al = live.filter((o) => o !== c && o.team === c.team && cheb(o.position, c.position) <= 4);
        const my = c.health + al.reduce((s, o) => s + o.health, 0), th = en.reduce((s, o) => s + o.health, 0);
        samples.push({ r: st.round, side: c.team === g.us ? 0 : 1, id: c.entity.index, en: en.map((o) => o.entity.index), share: my / (my + th) });
      }
    } });
  } catch (e) { console.error(g.file, e.message); continue; }
  const dies = (id, r) => (deathRound.get(id) || []).some((d) => d > r && d <= r + 10);
  const acc = [0, 1].map(() => B.map(() => ({ n: 0, die: 0, kill: 0 })));
  for (const s of samples) { const b = B.findIndex((x) => s.share < x); const a = acc[s.side][b]; a.n++; if (dies(s.id, s.r)) a.die++; if (s.en.some((e) => dies(e, s.r))) a.kill++; }
  fs.appendFileSync(outFile, JSON.stringify({ set: g.set, result: g.result, acc }) + '\n');
}
