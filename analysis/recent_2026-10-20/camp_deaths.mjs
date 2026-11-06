// Who dies to camps, to which camp, with how much help, on which map.
//   node analysis/recent_2026-10-20/camp_deaths.mjs <teamDir> [limit]
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay, CHAMPION_TYPES, CAMP_TYPES } from '../../tools/replay_dump.mjs';

const dir = process.argv[2], limit = Number(process.argv[3] || 1e9);
const rows = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8')).slice(0, limit);
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
const agg = { victim: {}, camp: {}, map: {}, alliesNear: {}, engagedType: {}, n: 0, games: 0 };
const inc = (o, k) => { o[k] = (o[k] || 0) + 1; };
const campHits = { us: {}, games: 0 };   // which camp types we attack, and with how many allies near
for (const r of rows) {
  const me = r.side === 'b' ? 1 : 0;
  const lastCampHit = new Map();
  agg.games++;
  await dumpReplay(path.join(dir, r.file), {
    snapshots: 'none',
    onStep(st, ev, prev) {
      if (ev && ev.actor?.kind === 2 && ev.kind === 'Attack' && ev.target?.kind === 'champion') {
        const camp = st.camps.find((c) => c.entity.index === ev.actor.index);
        lastCampHit.set(ev.target.id, { round: st.round, type: CAMP_TYPES[camp?.type] ?? '?' });
      }
      if (ev && ev.actor?.kind === 1 && ev.kind === 'Attack' && ev.target?.kind === 'camp' && ev.team === me) {
        const a = st.champions.find((c) => c.entity.index === ev.actor.index);
        const allies = a?.position ? st.champions.filter((c) => c.team === me && c.alive && c.position && c !== a && cheb(c.position, a.position) <= 3).length : 0;
        inc(campHits.us, `${ev.target.type}:${Math.min(allies, 3)}allies`);
      }
      if (!prev) return;
      for (const c of st.champions) {
        if (c.team !== me) continue;
        const b = prev.find((x) => x.entity.index === c.entity.index);
        if (!b || !b.alive || c.alive) continue;
        const h = lastCampHit.get(c.entity.index);
        if (!h || st.round - h.round > 1) continue;
        agg.n++;
        inc(agg.victim, CHAMPION_TYPES[c.type]); inc(agg.camp, h.type); inc(agg.map, r.map);
        const allies = b.position ? prev.filter((x) => x.team === me && x.alive && x.position && x.entity.index !== c.entity.index && cheb(x.position, b.position) <= 3).length : 0;
        inc(agg.alliesNear, allies);
      }
    },
  });
}
const per = (o) => Object.fromEntries(Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, +(v / agg.games).toFixed(2)]));
console.log(JSON.stringify({ dir, games: agg.games, campDeathsPerGame: +(agg.n / agg.games).toFixed(2), byVictim: per(agg.victim), byCamp: per(agg.camp), byMap: per(agg.map), alliesWithin3AtDeath: per(agg.alliesNear), ourCampAttacksPerGame: per(campHits.us) }, null, 1));
