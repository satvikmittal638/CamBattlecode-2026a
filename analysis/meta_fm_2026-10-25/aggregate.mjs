// Mean features by set/result for both sides (us = the non-Fish/Mite side).
//   node aggregate.mjs feats.jsonl [--by set|set+result] [--draft]
import fs from 'node:fs';
const args = process.argv.slice(2);
const rows = fs.readFileSync(args[0], 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
const by = args.includes('--by') ? args[args.indexOf('--by') + 1] : 'set+result';
const key = (r) => (by === 'set' ? r.set : `${r.set}/${r.result}`);
const groups = {};
for (const r of rows) (groups[key(r)] ||= []).push(r);
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN);
const f = (v, d = 1) => (Number.isFinite(v) ? v.toFixed(d) : '-');
const cols = [
  ['n', (g) => g.length, 0],
  ['margin', (g) => mean(g.map((r) => r.score - r.oppScore)), 0],
  ['camp', (g, s) => mean(g.map((r) => r.feats[s].campGems)), 0],
  ['camp200', (g, s) => mean(g.map((r) => r.feats[s].capGems[0] + r.feats[s].capGems[1])), 0],
  ['mid300', (g, s) => mean(g.map((r) => r.feats[s].midGems300)), 0],
  ['1stGem', (g, s) => mean(g.map((r) => r.feats[s].firstGemCap ?? 400)), 0],
  ['deaths', (g, s) => mean(g.map((r) => r.feats[s].deathsTotal)), 1],
  ['d200', (g, s) => mean(g.map((r) => r.feats[s].deaths[0] + r.feats[s].deaths[1])), 1],
  ['bagLost', (g, s) => mean(g.map((r) => r.feats[s].bagLost)), 0],
  ['alone%', (g, s) => 100 * mean(g.map((r) => r.feats[s].deathsAlone / Math.max(1, r.feats[s].deathsTotal))), 0],
  ['outnum%', (g, s) => 100 * mean(g.map((r) => r.feats[s].deathsOutnum / Math.max(1, r.feats[s].deathsTotal))), 0],
  ['banks', (g, s) => mean(g.map((r) => r.feats[s].banks)), 1],
  ['bankAvg', (g, s) => mean(g.map((r) => r.feats[s].bankMean)), 0],
  ['peakBag', (g, s) => mean(g.map((r) => r.feats[s].carryPeak)), 0],
  ['locks', (g, s) => mean(g.map((r) => r.feats[s].locks)), 1],
  ['wards', (g, s) => mean(g.map((r) => r.feats[s].wards)), 0],
  ['recalls', (g, s) => mean(g.map((r) => r.feats[s].recalls)), 0],
  ['mate', (g, s) => mean(g.map((r) => r.feats[s].nearMate).filter(Number.isFinite)), 1],
  ['alone4%', (g, s) => 100 * mean(g.map((r) => r.feats[s].alone).filter(Number.isFinite)), 0],
  ['clus%', (g, s) => 100 * mean(g.map((r) => r.feats[s].clusterShare).filter(Number.isFinite)), 0],
  ['eHalf%', (g, s) => 100 * mean(g.map((r) => r.feats[s].enemyHalf).filter(Number.isFinite)), 0],
  ['s200', (g, s) => mean(g.map((r) => r.feats[s].score[200]).filter(Number.isFinite)), 0],
  ['s500', (g, s) => mean(g.map((r) => r.feats[s].score[500]).filter(Number.isFinite)), 0],
];
for (const side of ['us', 'them']) {
  console.log(`\n== ${side === 'us' ? 'our side (reference winner / our bot)' : 'opponent (Fish / Mite)'}`);
  console.log('group'.padEnd(22) + cols.map(([n]) => n.padStart(8)).join(''));
  for (const k of Object.keys(groups).sort()) console.log(k.padEnd(22) + cols.map(([, fn, d]) => f(fn(groups[k], side), d).padStart(8)).join(''));
}
if (args.includes('--draft')) {
  for (const k of Object.keys(groups).sort()) {
    const c = {}, o = {};
    for (const r of groups[k]) { const a = r.feats.us.draft.join(','); c[a] = (c[a] || 0) + 1; const b = r.feats.them.draft.join(','); o[b] = (o[b] || 0) + 1; }
    console.log(`\n${k}: our drafts`, Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([a, n]) => `${n}x ${a}`).join(' | '));
    console.log(`${k}: opp drafts`, Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([a, n]) => `${n}x ${a}`).join(' | '));
  }
}
