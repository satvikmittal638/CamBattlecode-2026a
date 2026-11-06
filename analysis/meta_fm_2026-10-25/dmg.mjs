// Damage dealt to enemy champions (from HP drops attributed to the hitting team via hit events), rounds 1..TO.
// Per side: damage dealt per champion-contact-round, hits per contact round, share of damage from spells.
//   node dmg.mjs <index.json> <out.jsonl> [--sets ..] [--shard i/n] [--to 150]
import fs from 'node:fs';
import { dumpReplay, CHAMPION_TYPES } from '../../tools/replay_dump.mjs';
const args = process.argv.slice(2);
const [idxFile, outFile] = args;
const opt = (k, d) => (args.includes('--' + k) ? args[args.indexOf('--' + k) + 1] : d);
const sh = opt('shard', '0/1').split('/').map(Number);
const sets = opt('sets', '') ? new Set(opt('sets').split(',')) : null;
const TO = +opt('to', 150);
const games = JSON.parse(fs.readFileSync(idxFile, 'utf8')).filter((g) => !sets || sets.has(g.set)).filter((_, i) => i % sh[1] === sh[0]);
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
for (const g of games) {
  const A = [0, 1].map(() => ({ contact: 0, dmg: 0, spellDmg: 0, hits: 0, byType: {} }));
  let prevHp = new Map(), last = -1;
  try {
    await dumpReplay(g.file, { snapshots: 'none', onStep(st, ev) {
      if (st.round > TO) return;
      if (st.round !== last) {
        last = st.round;
        const live = st.champions.filter((c) => c.alive && c.position);
        for (const c of live) if (live.some((o) => o.team !== c.team && cheb(o.position, c.position) <= 6)) A[c.team === g.us ? 0 : 1].contact++;
      }
      if (ev && ev.actor?.kind === 1 && (ev.kind === 'Attack' || ev.kind === 'Cast ability') && ev.target?.kind === 'champion' && ev.target.team !== ev.team) {
        const before = prevHp.get(ev.target.id), now = st.champions.find((c) => c.entity.index === ev.target.id);
        const d = before !== undefined && now ? Math.max(0, before - (now.alive ? now.health : 0)) : 0;
        const a = A[ev.team === g.us ? 0 : 1]; a.hits++; a.dmg += d; if (ev.kind !== 'Attack') a.spellDmg += d;
        a.byType[ev.champ] = (a.byType[ev.champ] || 0) + d;
      }
      prevHp = new Map(st.champions.map((c) => [c.entity.index, c.alive ? c.health : 0]));
    } });
  } catch (e) { console.error(g.file, e.message); continue; }
  fs.appendFileSync(outFile, JSON.stringify({ set: g.set, result: g.result, us: A[0], them: A[1] }) + '\n');
}
