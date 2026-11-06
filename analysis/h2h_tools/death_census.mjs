#!/usr/bin/env node
// Every death of each side: who dealt the last damage within 2 rounds (enemy champion, camp,
// both) or none (linked Cassi/Issac death), plus gems lost and round.
//   node analysis/h2h_tools/death_census.mjs <gamesDir>
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay, CHAMPION_TYPES, CAMP_TYPES } from '../../tools/replay_dump.mjs';
const dir = process.argv[2];
const rows = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'));
const agg = { us: {}, them: {} }; const byType = { us: {}, them: {} }; const gemsLost = { us: 0, them: 0 };
for (const r of rows) {
  const me = r.side === 'b' ? 1 : 0;
  const lastHit = new Map(); // champ id -> {champRound, campRound, campType}
  await dumpReplay(path.join(dir, r.file), { snapshots: 'none', onStep(st, ev, prev) {
    if (ev && (ev.kind === 'Attack' || ev.kind === 'Cast ability') && ev.target?.kind === 'champion') {
      const h = lastHit.get(ev.target.id) || {}; lastHit.set(ev.target.id, h);
      if (ev.actor?.kind === 1) h.champ = st.round; else if (ev.actor?.kind === 2) { h.camp = st.round; }
    }
    if (!prev) return;
    for (const c of st.champions) {
      const b = prev.find((x) => x.entity.index === c.entity.index);
      if (!b || !b.alive || c.alive) continue;
      const side = c.team === me ? 'us' : 'them';
      const h = lastHit.get(c.entity.index) || {};
      const ch = h.champ != null && st.round - h.champ <= 2, ca = h.camp != null && st.round - h.camp <= 2;
      const k = ch && ca ? 'champ+camp' : ch ? 'champ' : ca ? 'camp' : 'other';
      agg[side][k] = (agg[side][k] || 0) + 1;
      const t = CHAMPION_TYPES[c.type]; const o = (byType[side][t] ??= {}); o[k] = (o[k] || 0) + 1;
      gemsLost[side] += b.gems;
    }
  } });
}
const G = rows.length;
for (const s of ['us', 'them']) {
  console.log(`${s}: deaths/game by cause ${JSON.stringify(Object.fromEntries(Object.entries(agg[s]).map(([k, v]) => [k, +(v / G).toFixed(2)])))}  gems lost/game ${Math.round(gemsLost[s] / G)}`);
  for (const [t, o] of Object.entries(byType[s])) console.log(`    ${t.padEnd(9)} ${JSON.stringify(Object.fromEntries(Object.entries(o).map(([k, v]) => [k, +(v / G).toFixed(2)])))}`);
}
