// When >=2 enemy champions are in attack range, which one does the team attack? Also camp target choice within a group.
import { dumpReplay } from '../../tools/replay_dump.mjs';
import { listRows } from './lib.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const rows = listRows(args[0], { recent: +opt('recent', 20), side: opt('side'), teamName: opt('team', 'Agentic Loop Builders') });
const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
const RANGED = new Set(['Cassi', 'VesperVale', 'Stellar', 'Prism', 'Willow', 'Tavi']);
const st = { n: 0, lowestHp: 0, lowestFrac: 0, nearest: 0 }, cs = { n: 0, lowestHp: 0, nearest: 0, highestHp: 0 };
for (const r of rows) {
  const d = await dumpReplay(r.path, { snapshots: 'round' });
  const at = new Map(); for (const s of d.snapshots) if (!at.has(s.round)) at.set(s.round, s);
  const seen = new Set();
  for (const e of d.events) {
    if (e.kind !== 'Attack' || e.team !== r.me || e.actor?.kind !== 1) continue;
    const k = e.round + ':' + e.actor.index; if (seen.has(k)) continue; seen.add(k);
    const s = at.get(e.round); if (!s) continue;
    const me = s.champions.find((c) => c.id === e.actor.index); if (!me?.pos) continue;
    const rng = RANGED.has(me.type) ? 3 : 1;
    if (e.target?.kind === 'champion') {
      const foes = s.champions.filter((c) => c.team !== r.me && c.alive && c.pos && cheb(c.pos, me.pos) <= rng + 1);
      if (foes.length < 2) continue;
      const t = foes.find((c) => c.id === e.target.id); if (!t) continue;
      st.n++;
      if (t.hp === Math.min(...foes.map((c) => c.hp))) st.lowestHp++;
      if (t.hp / t.maxHp === Math.min(...foes.map((c) => c.hp / c.maxHp))) st.lowestFrac++;
      if (cheb(t.pos, me.pos) === Math.min(...foes.map((c) => cheb(c.pos, me.pos)))) st.nearest++;
    } else if (e.target?.kind === 'camp') {
      const camps = s.camps.filter((c) => c.hp > 0 && c.pos[0] >= 0 && cheb(c.pos, me.pos) <= rng + 1);
      if (camps.length < 2) continue;
      const t = camps.find((c) => c.id === e.target.id); if (!t) continue;
      cs.n++;
      if (t.hp === Math.min(...camps.map((c) => c.hp))) cs.lowestHp++;
      if (t.hp === Math.max(...camps.map((c) => c.hp))) cs.highestHp++;
      if (cheb(t.pos, me.pos) === Math.min(...camps.map((c) => cheb(c.pos, me.pos)))) cs.nearest++;
    }
  }
}
console.log('champ target among >=2:', st.n, 'lowestHp', (st.lowestHp / st.n).toFixed(2), 'lowestFrac', (st.lowestFrac / st.n).toFixed(2), 'nearest', (st.nearest / st.n).toFixed(2));
console.log('camp target among >=2:', cs.n, 'lowestHp', (cs.lowestHp / cs.n).toFixed(2), 'highestHp', (cs.highestHp / cs.n).toFixed(2), 'nearest', (cs.nearest / cs.n).toFixed(2));
