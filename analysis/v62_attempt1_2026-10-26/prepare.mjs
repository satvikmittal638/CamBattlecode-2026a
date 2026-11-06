// Attempt-1 plan: 50 challenges for v62, one per distinct opponent: 25 closest to our rank, 25 closest to rank/2
// (rank/2 pool chosen first, no opponent in both pools). Maps rotate over the whole current challenge pool; each
// challenge alternates sides (a,b,a,b,a or b,a,b,a,b), and the two patterns alternate within each pool.
//   node prepare.mjs   (after preflight.mjs; refuses to overwrite a plan that already has accepted challenges)
import fs from 'node:fs'; import assert from 'node:assert/strict';
const dir = import.meta.dirname, read = (n) => JSON.parse(fs.readFileSync(dir + '/' + n + '.json'));
if (fs.existsSync(dir + '/receipts.json') && read('receipts').length) throw Error('Refusing to replace a plan with accepted requests.');
const q = read('challenges'), teams = read('ladder').teams, subs = read('submissions'), rank = q.requesterRank;
assert.equal(subs.active?.version, 62, 'v62 must be the active submission');
const eligible = teams.filter((t) => t.hasBot && t.teamId !== q.team.id);
const used = new Set(), pools = {};
for (const pool of ['half', 'near']) {
  const center = pool === 'half' ? rank / 2 : rank;
  pools[pool] = eligible.filter((t) => !used.has(t.teamId)).sort((a, b) => Math.abs(a.rank - center) - Math.abs(b.rank - center) || a.rank - b.rank).slice(0, 25).sort((a, b) => a.rank - b.rank);
  assert.equal(pools[pool].length, 25);
  for (const t of pools[pool]) used.add(t.teamId);
}
const maps = q.maps.map((m) => m.name).sort(), M = maps.length;
const specs = [];
for (let i = 0; i < 25; ++i) for (const pool of ['near', 'half']) {
  const c = specs.length, t = pools[pool][i];
  const s = { label: `${pool}_r${t.rank}_${i + 1}`, pool, rank: t.rank, teamId: t.teamId, opponent: t.name, maps: [], sides: [] };
  for (let j = 0; j < 5; ++j) {
    const k = 5 * c + j;                       // global slot: consecutive slots are distinct maps (M >= 5)
    s.maps.push(maps[k % M]);
    s.sides.push(((Math.floor(k / M) + k) % 2) ? 'b' : 'a');
  }
  specs.push(s);
}
const sideCount = (p) => specs.filter((s) => s.pool === p).flatMap((s) => s.sides).reduce((o, x) => (o[x]++, o), { a: 0, b: 0 });
const mapUse = {}; for (const s of specs) for (const m of s.maps) mapUse[m] = (mapUse[m] || 0) + 1;
const plan = { createdAt: new Date().toISOString(), version: 62, submissionId: subs.active.id, rank, halfRank: rank / 2,
  samplingDesign: '50 distinct opponents: 25 nearest our rank, 25 nearest rank/2 (half pool first); maps rotate over the pool; sides alternate',
  pools, maps, specs, sides: { near: sideCount('near'), half: sideCount('half') }, mapUse };
fs.writeFileSync(dir + '/plan.json', JSON.stringify(plan, null, 2));
console.log(JSON.stringify({ rank, halfRank: rank / 2, challenges: specs.length, distinctOpponents: used.size,
  rankRanges: Object.fromEntries(Object.entries(pools).map(([p, t]) => [p, [t[0].rank, t.at(-1).rank]])), maps: M,
  mapUseRange: [Math.min(...Object.values(mapUse)), Math.max(...Object.values(mapUse))], sides: plan.sides }));
