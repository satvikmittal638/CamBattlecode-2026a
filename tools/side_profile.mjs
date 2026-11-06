#!/usr/bin/env node
// Both-sides economy profile for one replay: per team captures (gem/gold), capture gems/gold,
// kills, deaths, submitted gems by round checkpoints, per-champion type gems captured.
//   node tools/side_profile.mjs <replay.repl26a> [--ck 100,200,300,400]
import { dumpReplay, CHAMPION_TYPES } from './replay_dump.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const CK = opt('ck', '50,100,150,200,300,400').split(',').map(Number);
const T = [0, 1].map(() => ({ caps: 0, capGems: 0, capGold: 0, kills: 0, deaths: 0, byType: {}, ck: {} }));
let last = -1;
await dumpReplay(args[0], { snapshots: 'none', onStep(st, ev, prev) {
  if (st.round !== last) { last = st.round; if (CK.includes(st.round)) for (const t of [0, 1]) { const C = st.champions.filter((c) => c.team === t); T[t].ck[st.round] = { gems: C.reduce((s, c) => s + c.gems, 0), gold: C.reduce((s, c) => s + c.gold, 0), alive: C.filter((c) => c.alive).length }; } }
  if (!prev) return;
  for (const c of st.champions) {
    const b = prev.find((x) => x.entity.index === c.entity.index); if (!b) continue;
    if (b.alive && !c.alive) T[c.team].deaths++;
    if (c.kills > b.kills) T[c.team].kills += c.kills - b.kills;
    if (ev && ev.kind === 'Capture') { const dg = c.gems - b.gems, dd = c.gold - b.gold; if (dg > 0 || dd > 0) { const k = CHAMPION_TYPES[c.type]; const o = (T[c.team].byType[k] ||= { gems: 0, gold: 0, n: 0 }); o.gems += Math.max(0, dg); o.gold += Math.max(0, dd); o.n++; T[c.team].capGems += Math.max(0, dg); T[c.team].capGold += Math.max(0, dd); } }
  }
  if (ev && ev.kind === 'Capture') T[ev.team].caps++;
} });
for (const t of [0, 1]) {
  const x = T[t];
  console.log(`team ${t}: caps ${x.caps} capGems ${x.capGems} capGold ${x.capGold} kills ${x.kills} deaths ${x.deaths}`);
  console.log('  ck ' + CK.map((r) => `${r}:${x.ck[r] ? `${x.ck[r].gems}g/${x.ck[r].gold}$/${x.ck[r].alive}a` : '-'}`).join(' '));
  console.log('  byType ' + Object.entries(x.byType).map(([k, v]) => `${k} ${v.gems}g ${v.gold}$ n${v.n}`).join(' | '));
}
