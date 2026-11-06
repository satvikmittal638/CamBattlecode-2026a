// Fine-grained fight mechanics for one team's side of its replays.
//   node analysis/recent_2026-10-20/combo.mjs <teamDir> [limit]
// - spell targets: Cc / Damage / AoeDamage casts on champions vs camps vs ground
// - same-round combos: an enemy champion stunned by us and then hit by another of our champions
//   in the same round; stun chains (same target re-stunned within 2 rounds)
// - opening range: Chebyshev distance attacker->target of the first hit in each new engagement
// - numbers: allies vs enemies within 4 tiles of our attacker on each champion hit
// - priority values set per champion type; wards / altar locks / consumables per game
// - first PvP hit round per game; PvP hits per game phase
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay, CHAMPION_TYPES } from '../../tools/replay_dump.mjs';

const dir = process.argv[2], limit = Number(process.argv[3] || 1e9);
const rows = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8')).slice(0, limit);
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
const inc = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };
const A = { games: 0, spellTargets: {}, stunRounds: 0, stunFollowedSameRound: 0, stunChains: 0, openRange: {}, numbers: { ahead: 0, even: 0, behind: 0 },
  priority: {}, wards: 0, altarLocks: 0, consumables: 0, teleports: 0, firstPvpRound: [], phaseHits: { early: 0, mid: 0, late: 0 }, pvpHits: 0, rounds: 0,
  gemsAtTribute: [], tributes: 0, captures: 0, recalls: 0 };
for (const r of rows) {
  const me = r.side === 'b' ? 1 : 0;
  A.games++;
  const stunnedThisRound = new Map(); // target -> {round, by}
  const lastStun = new Map();
  const lastPvp = new Map();          // attacker id -> round of last PvP hit
  let first = null, rounds = 0;
  await dumpReplay(path.join(dir, r.file), {
    snapshots: 'none',
    onStep(st, ev, prev) {
      rounds = st.round;
      if (!ev || ev.actor?.kind !== 1 || ev.team !== me) {
        if (ev && ev.kind === 'Capture' && ev.team === me) A.captures++;
        return;
      }
      const a = prev?.find((c) => c.entity.index === ev.actor.index) || st.champions.find((c) => c.entity.index === ev.actor.index);
      const type = CHAMPION_TYPES[a?.type];
      if (ev.kind === 'Set priority') inc(A.priority, `${type}:${ev.priority > 100 ? '>100' : ev.priority}`);
      if (ev.kind === 'Place ward') A.wards++;
      if (ev.kind === 'Place altar lock') A.altarLocks++;
      if (ev.kind === 'Consumable') A.consumables++;
      if (ev.kind === 'Teleport channel') A.teleports++;
      if (ev.kind === 'Recall') A.recalls++;
      if (ev.kind === 'Submit gems') { A.tributes++; if (ev.gemsCarried != null) A.gemsAtTribute.push(ev.gemsCarried); }
      if (ev.kind === 'Cast ability' && ['Cc', 'Damage', 'AoeDamage'].includes(ev.abilityType)) {
        const tk = ev.target?.kind === 'champion' ? (ev.target.team !== me ? 'enemy' : 'ally') : ev.target?.kind === 'camp' ? 'camp' : 'ground';
        inc(A.spellTargets, `${type}:${ev.abilityType}->${tk}`);
      }
      const pvp = (ev.kind === 'Attack' || ev.kind === 'Cast ability') && ev.target?.kind === 'champion' && ev.target.team !== me;
      if (!pvp) return;
      A.pvpHits++;
      const phase = st.round < 300 ? 'early' : st.round < 900 ? 'mid' : 'late'; A.phaseHits[phase]++;
      if (first === null) first = st.round;
      const vid = ev.target.id;
      const vic = prev?.find((c) => c.entity.index === vid);
      // opening range: attacker had no PvP hit in the previous 4 rounds
      if (a?.position && vic?.position && (lastPvp.get(a.entity.index) ?? -99) < st.round - 4) inc(A.openRange, `${type}:${ev.kind === 'Attack' ? 'atk' : ev.abilityType}@${cheb(a.position, vic.position)}`);
      lastPvp.set(a.entity.index, st.round);
      // numbers around the attacker
      if (a?.position && prev) {
        const allies = prev.filter((c) => c.team === me && c.alive && c.position && cheb(c.position, a.position) <= 4).length;
        const enemies = prev.filter((c) => c.team !== me && c.alive && c.position && cheb(c.position, a.position) <= 4).length;
        A.numbers[allies > enemies ? 'ahead' : allies === enemies ? 'even' : 'behind']++;
      }
      // stun bookkeeping
      if (ev.kind === 'Cast ability' && ev.abilityType === 'Cc') {
        const ls = lastStun.get(vid);
        if (ls != null && st.round - ls <= 2) A.stunChains++;
        lastStun.set(vid, st.round);
        A.stunRounds++;
        stunnedThisRound.set(vid, { round: st.round, by: a?.entity.index, followed: false });
      } else {
        const s = stunnedThisRound.get(vid);
        if (s && s.round === st.round && s.by !== a?.entity.index && !s.followed) { s.followed = true; A.stunFollowedSameRound++; }
      }
    },
  });
  A.rounds += rounds;
  if (first !== null) A.firstPvpRound.push(first);
}
const avg = (a) => (a.length ? +(a.reduce((s, x) => s + x, 0) / a.length).toFixed(1) : null);
const top = (o, n, div = 1) => Object.fromEntries(Object.entries(o).sort((x, y) => y[1] - x[1]).slice(0, n).map(([k, v]) => [k, +(v / div).toFixed(2)]));
const tot = A.numbers.ahead + A.numbers.even + A.numbers.behind;
console.log(JSON.stringify({
  dir, games: A.games, avgRounds: +(A.rounds / A.games).toFixed(0),
  spellTargetsPerGame: top(A.spellTargets, 20, A.games),
  stunsOnChampionsPerGame: +(A.stunRounds / A.games).toFixed(2), stunFollowUpSameRound: +(A.stunFollowedSameRound / Math.max(1, A.stunRounds)).toFixed(2), stunChainRate: +(A.stunChains / Math.max(1, A.stunRounds)).toFixed(2),
  openingRange: top(A.openRange, 16, A.games),
  numbersOnPvpHits: { ahead: +(A.numbers.ahead / tot).toFixed(2), even: +(A.numbers.even / tot).toFixed(2), behind: +(A.numbers.behind / tot).toFixed(2) },
  pvpHitsPerGame: +(A.pvpHits / A.games).toFixed(1), pvpHitsByPhase: A.phaseHits, firstPvpRound: avg(A.firstPvpRound),
  priorityValues: top(A.priority, 14), perGame: { wards: +(A.wards / A.games).toFixed(1), altarLocks: +(A.altarLocks / A.games).toFixed(2), consumables: +(A.consumables / A.games).toFixed(2), teleports: +(A.teleports / A.games).toFixed(2), recalls: +(A.recalls / A.games).toFixed(1), tributes: +(A.tributes / A.games).toFixed(1), captures: +(A.captures / A.games).toFixed(1) },
  gemsPerTribute: avg(A.gemsAtTribute),
}, null, 1));
