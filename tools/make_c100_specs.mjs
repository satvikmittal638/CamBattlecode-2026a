#!/usr/bin/env node
// Build the standard 100-challenge evaluation specs: 100 distinct opponents with bots, the 50 closest to our
// current rank and the 50 closest to rank/2 (half pool allocated first, no repeats), maps balanced so every
// map is played equally often from each side (same design as analysis/v57_eval_2026-10-23/prepare.mjs).
//   node tools/make_c100_specs.mjs <out specs.json>
// Reads only: /challenges (our rank, map pool) and /ladder. Sends nothing.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { api } from './bclib.mjs';

const out = process.argv[2];
if (!out) { console.error('usage: make_c100_specs.mjs <out specs.json>'); process.exit(2); }
const q = await api('GET', '/challenges');
const rank = q.requesterRank;
const ourId = q.team?.id;
let teams = [];
for (let page = 1; page <= 10 && teams.length < 400; page++) {
  const l = await api('GET', `/ladder?page=${page}&pageSize=100&category=all`);
  if (!l.teams?.length) break;
  teams.push(...l.teams);
}
const eligible = teams.filter((t) => t.hasBot !== false && t.teamId !== ourId);
assert(eligible.length >= 100, `only ${eligible.length} eligible teams`);
const used = new Set(), pools = {};
for (const pool of ['half', 'near']) {
  const center = pool === 'half' ? rank / 2 : rank;
  pools[pool] = eligible.filter((t) => !used.has(t.teamId)).sort((a, b) => Math.abs(a.rank - center) - Math.abs(b.rank - center) || a.rank - b.rank).slice(0, 50).sort((a, b) => a.rank - b.rank);
  assert.equal(pools[pool].length, 50);
  for (const t of pools[pool]) used.add(t.teamId);
}
const maps = q.maps.map((m) => m.name).sort();
assert.equal(maps.length, 40, `map pool has ${maps.length} maps`);
const need = Object.fromEntries(maps.map((m, i) => [m, { a: i < 10 ? 7 : 6, b: i < 10 ? 7 : 6 }]));
const specs = [];
for (let i = 0; i < 50; ++i) for (const pool of ['near', 'half']) {
  const t = pools[pool][i];
  const s = { label: `${pool}_r${t.rank}_unique${i + 1}`, pool, rank: t.rank, teamId: t.teamId, opponent: t.name, maps: [], sides: [] };
  const g = specs.length;
  for (let j = 0; j < 5; ++j) {
    const side = (i + j) % 2 ? 'b' : 'a';
    const options = maps.filter((m) => !s.maps.includes(m) && need[m][side] > 0).sort((a, b) => need[b][side] - need[a][side] || (need[b].a + need[b].b) - (need[a].a + need[a].b) || ((maps.indexOf(a) - g * 7 + 4000) % 40) - ((maps.indexOf(b) - g * 7 + 4000) % 40));
    assert(options.length);
    s.maps.push(options[0]); s.sides.push(side); need[options[0]][side]--;
  }
  specs.push(s);
}
for (const n of Object.values(need)) assert.deepEqual(n, { a: 0, b: 0 });
fs.writeFileSync(out, JSON.stringify(specs, null, 1));
console.log(JSON.stringify({ rank, halfRank: rank / 2, challenges: specs.length, distinct: used.size, near: [pools.near[0].rank, pools.near.at(-1).rank], half: [pools.half[0].rank, pools.half.at(-1).rank] }));
