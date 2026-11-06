#!/usr/bin/env node
// Screen 2: 10 challenges (50 games), fresh opponents (5 near rank, 5 near rank/2, excluding screen 1's), 70/30 weak/strong
// maps from the fixed map_split.json, sides balanced. Writes autoresearch/online_plan2.json. Reads only.
import fs from 'node:fs';
import { api } from '../tools/bclib.mjs';
const split = JSON.parse(fs.readFileSync('autoresearch/map_split.json'));
const used = new Set(JSON.parse(fs.readFileSync('autoresearch/online_plan.json')).specs.map((s) => s.teamId));
const opts = await api('GET', '/challenges'); const rank = opts.requesterRank;
let teams = []; for (let p = 1; p <= 4; p++) { const l = await api('GET', `/ladder?page=${p}&pageSize=100&category=all`); if (!l.teams?.length) break; teams.push(...l.teams); }
const eligible = teams.filter((t) => t.hasBot !== false && t.name !== 'Agentic Loop Builders' && !used.has(t.teamId));
const pickN = (c, n) => { const r = eligible.filter((t) => !used.has(t.teamId)).sort((a, b) => Math.abs(a.rank - c) - Math.abs(b.rank - c) || a.rank - b.rank).slice(0, n); r.forEach((t) => used.add(t.teamId)); return r; };
const near = pickN(rank, 5), half = pickN(rank / 2, 5);
const weak = split.weak.map((r) => r.map), strong = split.strong.map((r) => r.map);
let wi = 7, si = 4; const specs = []; // offsets so screen 2 starts on maps screen 1 used least
[...near.map((t) => ['near', t]), ...half.map((t) => ['half', t])].forEach(([pool, t], i) => {
  const nStrong = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2][i];
  const maps = []; while (maps.length < 5 - nStrong) { const m = weak[wi++ % weak.length]; if (!maps.includes(m)) maps.push(m); }
  while (maps.length < 5) { const m = strong[si++ % strong.length]; if (!maps.includes(m)) maps.push(m); }
  specs.push({ label: `s2_${pool}_r${t.rank}_${i + 1}`, pool, rank: t.rank, teamId: t.teamId, opponent: t.name, maps, sides: maps.map((_, j) => ((i + j) % 2 ? 'b' : 'a')), cls: maps.map((m) => (strong.includes(m) ? 'strong' : 'weak')) });
});
const cls = specs.flatMap((s) => s.cls), sides = specs.flatMap((s) => s.sides);
fs.writeFileSync('autoresearch/online_plan2.json', JSON.stringify({ rank, specs }, null, 1));
console.log(`rank ${rank}; weak ${cls.filter((c) => c === 'weak').length} strong ${cls.filter((c) => c === 'strong').length}; side a ${sides.filter((s) => s === 'a').length}`);
for (const s of specs) console.log(' ', s.label, s.opponent, s.maps.join(','));
