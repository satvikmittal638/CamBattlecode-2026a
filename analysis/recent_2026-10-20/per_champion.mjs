// Per champion type: PvP kills/deaths per game, camp deaths, and ranged "kiting" (after a PvP
// hit, does the champion's next move within the same or next round increase its distance to
// the nearest enemy?).
//   node analysis/recent_2026-10-20/per_champion.mjs <teamDir>
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay, CHAMPION_TYPES, CAMP_TYPES } from '../../tools/replay_dump.mjs';

const dir = process.argv[2];
const rows = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'));
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
const T = {};
const get = (t) => (T[t] ??= { games: 0, kills: 0, pvpDeaths: 0, campDeaths: 0, linkedDeaths: 0, hits: 0, kiteMoves: 0, kiteAway: 0 });
for (const r of rows) {
  const me = r.side === 'b' ? 1 : 0;
  const lastChamp = new Map(), lastCamp = new Map(), pendingKite = new Map(), counted = new Set();
  await dumpReplay(path.join(dir, r.file), {
    snapshots: 'none',
    onStep(st, ev, prev) {
      for (const c of st.champions) if (c.team === me && !counted.has(c.entity.index)) { counted.add(c.entity.index); get(CHAMPION_TYPES[c.type]).games++; }
      if (ev && (ev.kind === 'Attack' || ev.kind === 'Cast ability') && ev.target?.kind === 'champion') {
        if (ev.actor.kind === 1) lastChamp.set(ev.target.id, { round: st.round, by: ev.actor.index });
        if (ev.actor.kind === 2) lastCamp.set(ev.target.id, st.round);
        if (ev.actor.kind === 1 && ev.team === me && ev.target.team !== me) {
          const a = st.champions.find((c) => c.entity.index === ev.actor.index);
          get(CHAMPION_TYPES[a.type]).hits++;
          pendingKite.set(a.entity.index, st.round);
        }
      }
      if (ev && ev.kind === 'Move' && ev.actor.kind === 1 && ev.team === me && pendingKite.has(ev.actor.index)) {
        const r0 = pendingKite.get(ev.actor.index); pendingKite.delete(ev.actor.index);
        if (st.round - r0 <= 1 && prev) {
          const en = prev.filter((c) => c.team !== me && c.alive && c.position);
          if (en.length) {
            const from = { x: ev.from[0], y: ev.from[1] }, to = { x: ev.to[0], y: ev.to[1] };
            const d0 = Math.min(...en.map((e) => cheb(e.position, from))), d1 = Math.min(...en.map((e) => cheb(e.position, to)));
            const a = st.champions.find((c) => c.entity.index === ev.actor.index); const t = get(CHAMPION_TYPES[a.type]);
            t.kiteMoves++; if (d1 > d0) t.kiteAway++;
          }
        }
      }
      if (!prev) return;
      for (const c of st.champions) {
        const b = prev.find((x) => x.entity.index === c.entity.index);
        if (!b || !b.alive || c.alive) continue;
        const lc = lastChamp.get(c.entity.index), lk = lastCamp.get(c.entity.index);
        const byChamp = lc && st.round - lc.round <= 1, byCamp = lk != null && st.round - lk <= 1;
        if (c.team === me) {
          const t = get(CHAMPION_TYPES[c.type]);
          if (byCamp && !byChamp) t.campDeaths++; else if (byChamp) t.pvpDeaths++; else t.linkedDeaths++;
        } else if (byChamp) {
          const k = st.champions.find((x) => x.entity.index === lc.by);
          if (k && k.team === me) get(CHAMPION_TYPES[k.type]).kills++;
        }
      }
    },
  });
}
const out = {};
for (const [t, v] of Object.entries(T)) out[t] = { games: v.games, killsPerGame: +(v.kills / v.games).toFixed(2), pvpDeathsPerGame: +(v.pvpDeaths / v.games).toFixed(2), campDeathsPerGame: +(v.campDeaths / v.games).toFixed(2), linkedOrOtherDeathsPerGame: +(v.linkedDeaths / v.games).toFixed(2), pvpHitsPerGame: +(v.hits / v.games).toFixed(1), moveAwayAfterHit: v.kiteMoves ? +(v.kiteAway / v.kiteMoves).toFixed(2) : null };
console.log(JSON.stringify({ dir, perChampion: out }, null, 1));
