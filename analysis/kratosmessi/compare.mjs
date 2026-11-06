// Side-by-side comparison of two deep.mjs aggregates (reference = KratosMessi, test = mimic).
import fs from 'node:fs';
const [refF, testF] = process.argv.slice(2);
const A = JSON.parse(fs.readFileSync(refF, 'utf8')), B = JSON.parse(fs.readFileSync(testF, 'utf8'));
const keys = ['matches','winRate','avgRounds','gemsFor','gemsAgainst','captures','oppCaptures','firstCapture','capturesPer100','capturersAtCapture','tributes','tributesPer100','gemsPerTribute','gemsPerTributeMedian','firstTribute','recalls','recallsPer100','recallHpFrac','recallGold','recallGems','kills','deaths','wards','prio','altarLockBuys','altarLocksPlaced','enemyHalfFrac','nearAllies'];
const row = (k, a, b) => { const d = (typeof a === 'number' && typeof b === 'number' && a !== 0) ? ((b - a) / Math.abs(a) * 100).toFixed(0) + '%' : ''; const flag = d && Math.abs(parseFloat(d)) > 20 ? ' <<' : ''; console.log(k.padEnd(28), String(a).padStart(9), String(b).padStart(9), d.padStart(6) + flag); };
console.log('metric'.padEnd(28), 'KM'.padStart(9), 'mimic'.padStart(9), 'diff');
for (const k of keys) row(k, A[k], B[k]);
const tot = (o) => Object.values(o).reduce((s, x) => s + x, 0);
const am = A.attackMix, bm = B.attackMix;
row('atk champ share', +(am.champion / tot(am)).toFixed(3), +(bm.champion / tot(bm)).toFixed(3));
row('atk per game', +tot(am).toFixed(0), +tot(bm).toFixed(0));
for (const t of ['Wolf', 'Elk', 'GemCluster', 'GoldCluster']) row('campAtk ' + t, A.campAttackTypes[t] ?? 0, B.campAttackTypes[t] ?? 0);
for (const t of new Set([...Object.keys(A.capturesByType), ...Object.keys(B.capturesByType)])) row('cap ' + t, A.capturesByType[t] ?? 0, B.capturesByType[t] ?? 0);
for (const k of Object.keys(A.recallHpBuckets || {})) row('recallHp ' + k, +(A.recallHpBuckets[k] / tot(A.recallHpBuckets)).toFixed(2), +((B.recallHpBuckets[k] || 0) / tot(B.recallHpBuckets)).toFixed(2));
for (const k of Object.keys(A.tributeGemBuckets || {}).sort()) row('tribGems ' + k, +(A.tributeGemBuckets[k] / tot(A.tributeGemBuckets)).toFixed(2), +((B.tributeGemBuckets[k] || 0) / tot(B.tributeGemBuckets)).toFixed(2));
for (const t of Object.keys(A.perChamp)) {
  const a = A.perChamp[t], b = B.perChamp[t] || {};
  console.log('--', t);
  for (const k of ['attCampPer100', 'attChampPer100', 'recalls', 'deaths', 'kills', 'tributes', 'gemsTrib', 'hpAtRecall', 'altarLockShare']) row('  ' + k, a[k], b[k]);
  const ab = new Set([...Object.keys(a.abilPer100 || {}), ...Object.keys(b.abilPer100 || {})]);
  for (const k of ab) row('  ' + k, a.abilPer100?.[k] ?? 0, b.abilPer100?.[k] ?? 0);
  console.log('   KM builds   ', JSON.stringify(a.builds).slice(0, 150));
  console.log('   mimic builds', JSON.stringify(b.builds).slice(0, 150));
}
