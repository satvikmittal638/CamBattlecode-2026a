// Inspect "other" recalls (hp >= 50%, not on capture tile, gold < 30): context and what follows.
import { dumpReplay } from '../../tools/replay_dump.mjs';
import { listRows } from './lib.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const rows = listRows(args[0], { recent: +opt('recent', 20), side: opt('side'), teamName: opt('team', 'Agentic Loop Builders') });
const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
const inc = (o, k) => (o[k] = (o[k] || 0) + 1);
const st = { n: 0, gems: {}, distSpawn: {}, foeNear: 0, round: {}, champ: {}, prevEvent: {} };
for (const r of rows) {
  const d = await dumpReplay(r.path, { snapshots: 'round' });
  const at = new Map(); for (const s of d.snapshots) if (!at.has(s.round)) at.set(s.round, s);
  const s0 = d.snapshots.find((s) => s.champions.length && s.champions.every((c) => c.pos));
  const sp = s0.champions.filter((c) => c.team === r.me).map((c) => c.pos);
  const spC = [sp.reduce((a, p) => a + p[0], 0) / sp.length, sp.reduce((a, p) => a + p[1], 0) / sp.length];
  const camps = new Set(s0.camps.map((c) => c.pos.join(',')));
  for (const e of d.events.filter((x) => x.kind === 'Recall' && x.team === r.me && x.actor?.kind === 1)) {
    const s = at.get(e.round); const c = s?.champions.find((x) => x.id === e.actor.index); if (!c?.pos) continue;
    const hp = c.hp / c.maxHp; if (hp < 0.5 || c.gold >= 30 || camps.has(c.pos.join(','))) continue;
    st.n++;
    inc(st.gems, c.gems >= 25 ? '25+' : c.gems > 0 ? '1-24' : '0');
    inc(st.distSpawn, Math.min(40, Math.floor(cheb(c.pos, spC) / 10) * 10));
    if (s.champions.some((f) => f.team !== r.me && f.alive && f.pos && cheb(f.pos, c.pos) <= 8)) st.foeNear++;
    inc(st.round, Math.min(400, Math.floor(e.round / 100) * 100));
    inc(st.champ, c.type);
    const prev = d.events.filter((x) => x.actor?.kind === 1 && x.actor.index === c.id && x.round < e.round && x.round >= e.round - 5 && x.kind !== 'Move').map((x) => x.kind + (x.target ? ':' + x.target.kind : '')).slice(-1)[0] || 'move';
    inc(st.prevEvent, prev);
  }
}
console.log(JSON.stringify(st, null, 0));
