#!/usr/bin/env node
// Context of deaths to enemy champions for one side. At the first enemy hit of the fatal
// sequence: victim hp fraction, allies / enemies within 5, victim hitting camps in the previous
// 3 rounds, rounds the nearest enemy had already been within 8 (time to react), sequence length,
// shard advantage of the enemies within 5 over the victim + allies within 5.
//   node analysis/h2h_tools/kill_context.mjs <gamesDir> [--side us|them]
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
const args = process.argv.slice(2);
const dir = args[0];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const want = opt('side', 'us');
const rows = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'));
const cheb = (a, b) => (a && b ? Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)) : 99);
const ITEMS = (await import('../../tools/replay_dump.mjs')).ITEM_NAMES;
const shards = (c) => c.items.reduce((s, n, i) => s + n * (ITEMS[i].includes('Emblem') ? (ITEMS[i].startsWith('Power') ? 6 : 5) : 1), 0);
const S = [];
for (const r of rows) {
  const me = r.side === 'b' ? 1 : 0; const VT = want === 'us' ? me : 1 - me;
  const hist = []; let curRound = -1;
  const seq = new Map(); const campBusy = new Map();
  await dumpReplay(path.join(dir, r.file), { snapshots: 'none', onStep(st, ev, prev) {
    if (st.round !== curRound) { curRound = st.round; hist.push({ round: st.round, champs: st.champions.map((c) => ({ id: c.entity.index, team: c.team, pos: c.position, alive: c.alive })) }); if (hist.length > 40) hist.shift(); }
    if (!ev) return;
    const hit = ev.actor?.kind === 1 && (ev.kind === 'Attack' || ev.kind === 'Cast ability');
    if (hit && ev.target?.kind === 'camp') campBusy.set(ev.actor.index, st.round);
    if (hit && ev.target?.kind === 'champion' && ev.target.team === VT && prev) {
      const s = seq.get(ev.target.id);
      if (!s || st.round - s.last > 4) seq.set(ev.target.id, { first: st.round, last: st.round, snap: prev });
      else s.last = st.round;
    }
    if (!prev) return;
    for (const c of st.champions) {
      if (c.team !== VT) continue;
      const b = prev.find((x) => x.entity.index === c.entity.index);
      if (!b || !b.alive || c.alive) continue;
      const s = seq.get(c.entity.index);
      if (!s || st.round - s.last > 2) continue;
      const v = s.snap.find((x) => x.entity.index === c.entity.index); if (!v || !v.alive) continue;
      const near = (x) => x.alive && cheb(x.position, v.position) <= 5 && x.entity.index !== v.entity.index;
      const allies = s.snap.filter((x) => x.team === VT && near(x)), enemies = s.snap.filter((x) => x.team !== VT && near(x));
      let warn = 0;
      for (let k = hist.length - 1; k >= 0 && warn < 30; k--) {
        const h = hist[k]; if (h.round >= s.first) continue;
        const vv = h.champs.find((x) => x.id === v.entity.index); if (!vv || !vv.alive) break;
        if (h.champs.some((x) => x.team !== VT && x.alive && cheb(x.pos, vv.pos) <= 8)) warn++; else break;
      }
      const cb = campBusy.get(c.entity.index);
      const sum = (a) => a.reduce((t, x) => t + shards(x), 0);
      S.push({ hpf: v.health / v.maxHealth, allies: allies.length, enemies: enemies.length, busy: cb != null && s.first - cb <= 3, warn, len: st.round - s.first + 1, adv: sum(enemies) - sum(allies) - shards(v), gems: v.gems });
    }
  } });
}
const n = S.length, G = rows.length;
const avg = (f) => (S.reduce((t, x) => t + f(x), 0) / Math.max(1, n));
const dist = (f) => { const o = {}; for (const x of S) { const k = f(x); o[k] = (o[k] || 0) + 1; } return Object.fromEntries(Object.entries(o).sort((a, b) => (+a[0]) - (+b[0])).map(([k, v]) => [k, +(v / n).toFixed(2)])); };
console.log(`${dir} side=${want}: ${n} champion kills (${(n / G).toFixed(1)}/game)`);
console.log(`  victim hp at first hit ${avg((x) => x.hpf).toFixed(2)}; hitting camps just before ${avg((x) => x.busy).toFixed(2)}; sequence ${avg((x) => x.len).toFixed(1)} rounds; gems carried ${avg((x) => x.gems).toFixed(1)}`);
console.log(`  allies within 5: ${JSON.stringify(dist((x) => Math.min(x.allies, 4)))}`);
console.log(`  enemies within 5: ${JSON.stringify(dist((x) => Math.min(x.enemies, 5)))}`);
console.log(`  enemies - allies: ${JSON.stringify(dist((x) => Math.max(-2, Math.min(4, x.enemies - x.allies))))}`);
console.log(`  rounds enemy already within 8 before first hit: ${JSON.stringify(dist((x) => (x.warn >= 10 ? 10 : x.warn >= 5 ? 5 : x.warn >= 2 ? 2 : x.warn)))}`);
console.log(`  enemy shard advantage: avg ${avg((x) => x.adv).toFixed(1)}  ${JSON.stringify(dist((x) => (x.adv <= -10 ? -10 : x.adv <= 0 ? 0 : x.adv <= 10 ? 10 : x.adv <= 25 ? 25 : 50)))}`);
