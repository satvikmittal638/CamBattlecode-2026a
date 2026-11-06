// Ward placements: who, when, where relative to camps/altars/self, context.
import { dumpReplay } from '../../tools/replay_dump.mjs';
import { listRows, campGroups } from './lib.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const rows = listRows(args[0], { recent: +opt('recent', 20), side: opt('side'), teamName: opt('team', 'Agentic Loop Builders') });
const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
const inc = (o, k) => (o[k] = (o[k] || 0) + 1);
const st = { n: 0, champ: {}, round: {}, campDist: {}, selfDist: {}, foeNear: 0, ctx: {}, perMap: {} , ex: []};
for (const r of rows) {
  const d = await dumpReplay(r.path, { snapshots: 'round' });
  const at = new Map(); for (const s of d.snapshots) if (!at.has(s.round)) at.set(s.round, s);
  const s0 = d.snapshots.find((s) => s.champions.length && s.champions.every((c) => c.pos));
  const { groups } = campGroups(s0);
  for (const e of d.events.filter((x) => x.kind === 'Place ward' && x.team === r.me && x.actor?.kind === 1)) {
    const s = at.get(e.round); const c = s?.champions.find((x) => x.id === e.actor.index); if (!c?.pos) continue;
    st.n++; inc(st.champ, c.type); inc(st.round, Math.min(400, Math.floor(e.round / 50) * 50)); inc(st.perMap, r.map);
    const w = e.to;
    const cd = Math.min(...groups.map((g) => Math.min(...g.tiles.map((t) => cheb(t, w)))));
    inc(st.campDist, Math.min(10, cd));
    inc(st.selfDist, cheb(w, c.pos));
    const foe = s.champions.some((f) => f.team !== r.me && f.alive && f.pos && cheb(f.pos, c.pos) <= 8);
    if (foe) st.foeNear++;
    const prev = d.events.filter((x) => x.actor?.kind === 1 && x.actor.index === c.id && x.round >= e.round - 3 && x.round <= e.round && x.kind !== 'Move' && x.kind !== 'Place ward').map((x) => x.kind + (x.target ? ':' + x.target.kind : '')).slice(-1)[0] || 'move';
    inc(st.ctx, prev);
    if (st.ex.length < 12) st.ex.push(`${r.map} r${e.round} ${c.type} at ${c.pos} ward ${w} campDist ${cd} gems ${c.gems} hp ${Math.round(100 * c.hp / c.maxHp)} foe ${foe}`);
  }
}
const ex = st.ex; delete st.ex;
console.log(JSON.stringify(st)); console.log(ex.join('\n'));
