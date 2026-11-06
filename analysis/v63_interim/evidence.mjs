// Event-level evidence for the opening claims (rounds 1-200), from our side of each game:
//  - every camp capture: capturing team, gems, tile, which half (nearer spawn), and whether OUR team attacked a camp
//    within 2 tiles of that tile in the previous 30 rounds (an opponent capture of such a camp = steal after our work);
//  - every death of our champions: tile, nearest ally / enemies within 6, whether the victim attacked a camp in its last
//    3 rounds, which enemy champions damaged it in the last 5 rounds.
//   node evidence.mjs <games/index.json> [--filter heavy|win|loss|all] [--out evidence.json] [--print N]
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay, CHAMPION_TYPES } from '../../tools/replay_dump.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const idxFile = args[0];
const filter = opt('filter', 'heavy');
const special = /contest|boss_battle/;
const cat = (g) => (g.result === 'win' ? 'win' : !special.test(g.map) && g.oppScore - g.score >= 500 ? 'heavy' : 'loss');
const games = JSON.parse(fs.readFileSync(idxFile, 'utf8')).filter((g) => filter === 'all' || cat(g) === filter);
const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
const rectDist = (r, x, y) => Math.max(Math.max(r.minX - x, 0, x - r.maxX), Math.max(r.minY - y, 0, y - r.maxY));
const out = [];
for (const g of games) {
  const us = g.side === 'a' ? 0 : 1;
  let spawn = null, prev = null;
  const campHits = []; // {r, team, pos}
  const dmgBy = new Map(); // victim id -> [{r, src}]
  const lastCampAttack = new Map(); // champion id -> round
  const caps = [], deaths = [];
  await dumpReplay(path.join(path.dirname(idxFile), g.file), {
    snapshots: 'none', mapInfo: true,
    onStart(s) { spawn = s.mapInfo.spawn; },
    onStep(st, ev, pc) {
      if (st.round > 200) { prev = st; return; }
      const half = (x, y) => (rectDist(spawn[us], x, y) <= rectDist(spawn[1 - us], x, y) ? 'ours' : 'theirs');
      if (ev && (ev.kind === 'Attack' || ev.kind === 'Cast ability') && ev.actor.kind === 1 && ev.target?.kind === 'camp') {
        campHits.push({ r: st.round, team: ev.team, pos: ev.to });
        lastCampAttack.set(ev.actor.index, st.round);
      }
      if (ev && (ev.kind === 'Attack' || ev.kind === 'Cast ability') && ev.actor.kind === 1 && ev.target?.kind === 'champion') {
        const l = dmgBy.get(ev.target.id) || []; l.push({ r: st.round, src: ev.champ }); dmgBy.set(ev.target.id, l);
      }
      if (prev && st.step.kind === 2) {
        for (const ch of st.champions) {
          const b = prev.champions.find((p) => p.entity.index === ch.entity.index);
          if (!b || !ch.position || ch.gems <= b.gems) continue;
          const pos = [ch.position.x, ch.position.y];
          const ourWork = campHits.some((h) => h.team === us && st.round - h.r <= 30 && cheb(h.pos, pos) <= 2);
          const theirWork = campHits.some((h) => h.team !== us && st.round - h.r <= 30 && cheb(h.pos, pos) <= 2);
          caps.push({ r: st.round, team: ch.team === us ? 'us' : 'them', type: CHAMPION_TYPES[ch.type], gems: ch.gems - b.gems, pos, half: half(...pos), depth: rectDist(spawn[1 - us], ...pos) - rectDist(spawn[us], ...pos), ourWork, theirWork,
            ourNearest: Math.min(99, ...st.champions.filter((o) => o.team === us && o.alive && o.position).map((o) => cheb(pos, [o.position.x, o.position.y]))),
            ours6: st.champions.filter((o) => o.team === us && o.alive && o.position && cheb(pos, [o.position.x, o.position.y]) <= 6).length,
            theirs6: st.champions.filter((o) => o.team !== us && o.alive && o.position && cheb(pos, [o.position.x, o.position.y]) <= 6).length,
            ourDead: st.champions.filter((o) => o.team === us && !o.alive).length });
        }
      }
      if (prev) for (const ch of st.champions) {
        const b = prev.champions.find((p) => p.entity.index === ch.entity.index);
        if (!b || !b.alive || ch.alive || ch.team !== us || !b.position) continue;
        const pos = [b.position.x, b.position.y];
        const allies = prev.champions.filter((o) => o.team === us && o.alive && o.position && o.entity.index !== ch.entity.index).map((o) => cheb(pos, [o.position.x, o.position.y]));
        const enemies = prev.champions.filter((o) => o.team !== us && o.alive && o.position && cheb(pos, [o.position.x, o.position.y]) <= 6).map((o) => CHAMPION_TYPES[o.type]);
        const hitters = [...new Set((dmgBy.get(ch.entity.index) || []).filter((d) => st.round - d.r <= 5).map((d) => d.src))];
        deaths.push({ r: st.round, victim: CHAMPION_TYPES[ch.type], gems: b.gems, pos, half: half(...pos), depth: rectDist(spawn[1 - us], ...pos) - rectDist(spawn[us], ...pos), nearestAlly: allies.length ? Math.min(...allies) : null,
          enemiesWithin6: enemies, campFighting: (st.round - (lastCampAttack.get(ch.entity.index) ?? -99)) <= 3, killers: hitters });
      }
      prev = st;
    },
  });
  out.push({ map: g.map, file: g.file, opponent: g.opponent, score: `${g.score}-${g.oppScore}`, cat: cat(g), caps, deaths });
}
if (opt('out')) fs.writeFileSync(opt('out'), JSON.stringify(out, null, 1));
// Aggregate.
const agg = { games: out.length, capsThemOurHalf: 0, gemsThemOurHalf: 0, stolenAfterOurWork: 0, gemsStolenAfterOurWork: 0, capsUsOurHalf: 0, gemsUsOurHalf: 0,
  deaths: 0, deathsAlone: 0, deathsCampFighting: 0, deathsOutnumbered: 0, deathsOurHalf: 0, gemsLost: 0 };
for (const o of out) {
  for (const c of o.caps) {
    if (c.team === 'them' && c.half === 'ours') { agg.capsThemOurHalf++; agg.gemsThemOurHalf += c.gems; if (c.ourWork) { agg.stolenAfterOurWork++; agg.gemsStolenAfterOurWork += c.gems; } }
    if (c.team === 'us' && c.half === 'ours') { agg.capsUsOurHalf++; agg.gemsUsOurHalf += c.gems; }
  }
  for (const d of o.deaths) {
    agg.deaths++; agg.gemsLost += d.gems;
    if (d.nearestAlly === null || d.nearestAlly > 6) agg.deathsAlone++;
    if (d.campFighting) agg.deathsCampFighting++;
    if (d.killers.length >= 2) agg.deathsOutnumbered++;
    if (d.half === 'ours') agg.deathsOurHalf++;
  }
}
console.log(JSON.stringify(agg));
const N = +opt('print', 0);
for (const o of out.slice(0, N)) {
  console.log(`\n## ${o.map} vs ${o.opponent} ${o.score} (${o.file})`);
  for (const c of o.caps.filter((c) => c.half === 'ours' || c.team === 'us')) console.log(`  r${c.r} capture ${c.team} ${c.type} +${c.gems} gems at ${c.pos} (${c.half} half)${c.ourWork ? ' [we attacked this camp in the last 30 rounds]' : ''}${c.theirWork ? ' [they attacked it]' : ''}`);
  for (const d of o.deaths) console.log(`  r${d.r} DEATH ${d.victim} at ${d.pos} (${d.half} half) carrying ${d.gems}; nearest ally ${d.nearestAlly}; enemies within 6: ${d.enemiesWithin6.join(',') || '-'}; hit by ${d.killers.join(',') || 'camps only'}${d.campFighting ? '; was attacking a camp' : ''}`);
}
