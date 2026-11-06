// Champion-time allocation, rounds 1..TO, per side: dead / on own spawn / hit a champion / hit a camp / moved / still
// (still = no move, attack or cast; includes capture waits and channels).
//   node timeuse.mjs <index.json> <out.jsonl> [--sets ..] [--shard i/n] [--to 600]
import fs from 'node:fs';
import { dumpReplay } from '../../tools/replay_dump.mjs';
const args = process.argv.slice(2);
const [idxFile, outFile] = args;
const opt = (k, d) => (args.includes('--' + k) ? args[args.indexOf('--' + k) + 1] : d);
const sh = opt('shard', '0/1').split('/').map(Number);
const sets = opt('sets', '') ? new Set(opt('sets').split(',')) : null;
const TO = +opt('to', 600);
const games = JSON.parse(fs.readFileSync(idxFile, 'utf8')).filter((g) => !sets || sets.has(g.set)).filter((_, i) => i % sh[1] === sh[0]);
const rectDist = (r, p) => Math.max(Math.max(r.minX - p.x, 0, p.x - r.maxX), Math.max(r.minY - p.y, 0, p.y - r.maxY));
for (const g of games) {
  const A = [0, 1].map(() => ({ n: 0, dead: 0, spawn: 0, champ: 0, camp: 0, move: 0, still: 0, stillCarry: 0 }));
  let spawn = null, snap = null, last = -1; const acts = new Map();
  const close = () => {
    if (!snap) return;
    for (const c of snap) {
      const a = A[c.team === g.us ? 0 : 1]; a.n++;
      if (!c.alive || !c.position) { a.dead++; continue; }
      const d = acts.get(c.entity.index) || {};
      if (rectDist(spawn[c.team], c.position) === 0) a.spawn++;
      else if (d.champ) a.champ++; else if (d.camp) a.camp++; else if (d.move) a.move++; else { a.still++; if (c.gems > 0) a.stillCarry++; }
    }
  };
  try {
    await dumpReplay(g.file, { snapshots: 'none', mapInfo: true, onStart(s) { spawn = s.mapInfo.spawn; }, onStep(st, ev) {
      if (st.round > TO + 1) return;
      if (st.round !== last) { close(); snap = st.champions.map((c) => ({ ...c })); acts.clear(); last = st.round; }
      if (ev && ev.actor?.kind === 1) {
        const d = acts.get(ev.actor.index) || {};
        if ((ev.kind === 'Attack' || ev.kind === 'Cast ability') && ev.target?.kind === 'champion') d.champ = true;
        if ((ev.kind === 'Attack' || ev.kind === 'Cast ability') && ev.target?.kind === 'camp') d.camp = true;
        if (ev.kind === 'Move') d.move = true;
        acts.set(ev.actor.index, d);
      }
    } });
  } catch (e) { console.error(g.file, e.message); continue; }
  fs.appendFileSync(outFile, JSON.stringify({ set: g.set, result: g.result, us: A[0], them: A[1] }) + '\n');
}
