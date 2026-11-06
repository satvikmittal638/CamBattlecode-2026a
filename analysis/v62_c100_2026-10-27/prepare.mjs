// 100-challenge plan for v62: 50 distinct opponents nearest our rank, 50 distinct nearest rank/2 (half pool chosen
// first, no opponent in both pools). 500 games over the 70-map pool: every map 7-8 times with sides balanced per map
// (10 maps 4a+4b, 30 maps 4a+3b, 30 maps 3a+4b); inside a challenge sides alternate (a,b,a,b,a / b,a,b,a,b), the two
// patterns alternate within each pool, so each pool plays 125 games per side.
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
  pools[pool] = eligible.filter((t) => !used.has(t.teamId)).sort((a, b) => Math.abs(a.rank - center) - Math.abs(b.rank - center) || a.rank - b.rank).slice(0, 50).sort((a, b) => a.rank - b.rank);
  assert.equal(pools[pool].length, 50);
  for (const t of pools[pool]) used.add(t.teamId);
}
const maps = q.maps.map((m) => m.name).sort(), M = maps.length;
assert.equal(M, 70);
const need = Object.fromEntries(maps.map((m, i) => [m, i < 10 ? { a: 4, b: 4 } : i < 40 ? { a: 4, b: 3 } : { a: 3, b: 4 }]));
const specs = [];
for (let i = 0; i < 50; ++i) for (const pool of ['near', 'half']) {
  const t = pools[pool][i], g = specs.length;
  const s = { label: `${pool}_r${t.rank}_${i + 1}`, pool, rank: t.rank, teamId: t.teamId, opponent: t.name, maps: [], sides: [] };
  for (let j = 0; j < 5; ++j) {
    const side = (i + j) % 2 ? 'b' : 'a';
    // most-needed map for this side first; ties rotate through the pool so consecutive challenges see different maps
    const options = maps.filter((m) => !s.maps.includes(m) && need[m][side] > 0).sort((a, b) => need[b][side] - need[a][side] || (need[b].a + need[b].b) - (need[a].a + need[a].b) || ((maps.indexOf(a) - g * 11 + 7000) % M) - ((maps.indexOf(b) - g * 11 + 7000) % M));
    assert(options.length, 'no map left for ' + s.label);
    s.maps.push(options[0]); s.sides.push(side); need[options[0]][side]--;
  }
  specs.push(s);
}
for (const n of Object.values(need)) assert.deepEqual(n, { a: 0, b: 0 });
const sideCount = (p) => specs.filter((s) => s.pool === p).flatMap((s) => s.sides).reduce((o, x) => (o[x]++, o), { a: 0, b: 0 });
const mapUse = {}; for (const s of specs) for (const m of s.maps) mapUse[m] = (mapUse[m] || 0) + 1;
const plan = { createdAt: new Date().toISOString(), version: 62, submissionId: subs.active.id, rank, halfRank: rank / 2,
  samplingDesign: '100 distinct opponents: 50 nearest our rank, 50 nearest rank/2 (half pool first); maps balanced per side over the 70-map pool; sides alternate',
  pools, maps, specs, sides: { near: sideCount('near'), half: sideCount('half') }, mapUse };
fs.writeFileSync(dir + '/plan.json', JSON.stringify(plan, null, 2));
console.log(JSON.stringify({ rank, halfRank: rank / 2, challenges: specs.length, distinctOpponents: used.size,
  rankRanges: Object.fromEntries(Object.entries(pools).map(([p, t]) => [p, [t[0].rank, t.at(-1).rank]])), maps: M,
  mapUseRange: [Math.min(...Object.values(mapUse)), Math.max(...Object.values(mapUse))], sides: plan.sides }));
