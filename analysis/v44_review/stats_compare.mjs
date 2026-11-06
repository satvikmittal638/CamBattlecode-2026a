// Engine-authoritative comparison of v44 field1 variants from official full statistics JSON
// (champions[].metrics final totals; events[] kind/owner/entries). Sums over OUR champions.
//   node analysis/v44_review/stats_compare.mjs analysis/v44_rules_fix/field1/results.json
import fs from 'node:fs';
const R = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')).rows;
const grp = (m) => m === '00contest' ? 'contest(boss-only)' : m === '01boss-battle' ? 'boss-battle' : m === '00monolith' ? 'monolith' : 'other32';
const M = ['deaths', 'kills', 'monsterDamageTaken', 'championDamageTaken', 'collectedGems', 'submittedGems', 'earnedGold'];
const agg = {}; let missing = 0;
for (const r of R) {
  let d; try { d = JSON.parse(fs.readFileSync(r.stats, 'utf8')); } catch (e) { missing++; continue; }
  const me = r.side === 'a' ? 'teamA' : 'teamB'; const ours = d.champions.filter((c) => c.team === me).map((c) => c.id);
  const k = `${r.variant}|${grp(r.map)}`; const a = (agg[k] ||= { n: 0, wins: 0, score: 0, opp: 0, fuelEx: 0, gemLossN: 0, gemLossAmt: 0, subN: 0 }); a.n++; if (r.win) a.wins++; a.score += r.score; a.opp += r.oppScore;
  for (const c of d.champions.filter((c) => c.team === me)) for (const m of M) a[m] = (a[m] || 0) + Number(c.metrics[m] || 0);
  for (const e of d.events) { if (!e.owner || !ours.includes(e.owner.id) || e.owner.team !== me) continue;
    if (e.kind === 'fuelExhausted') a.fuelEx += e.entries.length; if (e.kind === 'gemLoss') { a.gemLossN += e.entries.length; a.gemLossAmt += e.entries.reduce((s, x) => s + Number(x.value || x.amount || 0), 0); } if (e.kind === 'gemSubmission') a.subN += e.entries.length; }
}
console.log(`rows ${R.length}, missing/unreadable stats ${missing}`);
console.log('group                variant n  wins  score-opp | per game: deaths kills monDmgTaken champDmgTaken collected submitted earnedGold | fuelExhausted gemLossEvents(amount) submissions');
for (const g of ['contest(boss-only)', 'boss-battle', 'monolith', 'other32']) for (const v of ['base', 'fix']) { const a = agg[`${v}|${g}`]; if (!a) continue; const p = (x) => (x / a.n).toFixed(1);
  console.log(`${g.padEnd(20)} ${v.padEnd(4)} ${String(a.n).padStart(3)} ${String(a.wins).padStart(4)}  ${p(a.score)}-${p(a.opp)} | ${p(a.deaths)} ${p(a.kills)} ${(a.monsterDamageTaken / a.n / 1000).toFixed(1)}k ${(a.championDamageTaken / a.n / 1000).toFixed(1)}k ${p(a.collectedGems)} ${p(a.submittedGems)} ${p(a.earnedGold)} | ${p(a.fuelEx)} ${p(a.gemLossN)}(${p(a.gemLossAmt)}) ${p(a.subN)}`); }
