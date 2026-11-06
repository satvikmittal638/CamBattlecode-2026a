// Contact policy table: for each champion-round with an enemy within 6 (rounds 1..TO), the state bucket
// (own HP fraction, local HP share, nearest enemy distance) and the action (hit champion / hit camp / step away /
// step closer / sidestep / still). Output: counts per side and bucket.
//   node policy.mjs <index.json> <out.jsonl> [--sets ..] [--shard i/n] [--to 600]
import fs from 'node:fs';
import { dumpReplay } from '../../tools/replay_dump.mjs';
const args = process.argv.slice(2);
const [idxFile, outFile] = args;
const opt = (k, d) => (args.includes('--' + k) ? args[args.indexOf('--' + k) + 1] : d);
const sh = opt('shard', '0/1').split('/').map(Number);
const sets = opt('sets', '') ? new Set(opt('sets').split(',')) : null;
const TO = +opt('to', 600);
const games = JSON.parse(fs.readFileSync(idxFile, 'utf8')).filter((g) => !sets || sets.has(g.set)).filter((_, i) => i % sh[1] === sh[0]);
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
const hb = (f) => (f < 0.3 ? 0 : f < 0.5 ? 1 : f < 0.7 ? 2 : 3);
const sb = (s) => (s < 0.35 ? 0 : s < 0.5 ? 1 : s < 0.65 ? 2 : 3);
const db = (d) => (d <= 1 ? 0 : d <= 3 ? 1 : 2);
for (const g of games) {
  const T = [{}, {}];
  let snap = null, last = -1; const acts = new Map();
  const close = (st) => {
    if (!snap) return;
    const live = snap.filter((c) => c.alive && c.position);
    for (const c of live) {
      const en = live.filter((o) => o.team !== c.team && cheb(o.position, c.position) <= 6);
      if (!en.length) continue;
      const al = live.filter((o) => o !== c && o.team === c.team && cheb(o.position, c.position) <= 4);
      const my = c.health + al.reduce((s, o) => s + o.health, 0), th = en.reduce((s, o) => s + o.health, 0);
      const dNow = Math.min(...en.map((o) => cheb(o.position, c.position)));
      const now = st.champions.find((x) => x.entity.index === c.entity.index);
      const d = acts.get(c.entity.index) || {};
      let act;
      if (d.champ) act = 'hit'; else if (d.camp) act = 'camp';
      else if (now && now.alive && now.position && (now.position.x !== c.position.x || now.position.y !== c.position.y)) {
        const dNext = Math.min(...en.map((o) => cheb(o.position, now.position)));
        act = dNext > dNow ? 'away' : dNext < dNow ? 'closer' : 'side';
      } else act = 'still';
      const key = `${hb(c.health / c.maxHealth)}${sb(my / (my + th))}${db(dNow)}`;
      const side = c.team === g.us ? 0 : 1;
      (T[side][key] ||= {})[act] = (T[side][key][act] || 0) + 1;
    }
  };
  try {
    await dumpReplay(g.file, { snapshots: 'none', onStep(st, ev) {
      if (st.round > TO + 1) return;
      if (st.round !== last) { close(st); snap = st.champions.map((c) => ({ ...c })); acts.clear(); last = st.round; }
      if (ev && ev.actor?.kind === 1) {
        const d = acts.get(ev.actor.index) || {};
        if ((ev.kind === 'Attack' || ev.kind === 'Cast ability') && ev.target?.kind === 'champion' && ev.target.team !== ev.team) d.champ = true;
        if ((ev.kind === 'Attack' || ev.kind === 'Cast ability') && ev.target?.kind === 'camp') d.camp = true;
        acts.set(ev.actor.index, d);
      }
    } });
  } catch (e) { console.error(g.file, e.message); continue; }
  fs.appendFileSync(outFile, JSON.stringify({ set: g.set, result: g.result, us: T[0], them: T[1] }) + '\n');
}
