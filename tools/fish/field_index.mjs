#!/usr/bin/env node
// Build an index.json (rows usable by tools/fish/run.mjs) for one variant/opponent of a
// tools/field_eval.mjs output directory.
//   node tools/fish/field_index.mjs <fieldEvalDir> <variant> <opponent>
import fs from 'node:fs';
import path from 'node:path';
const [dir, variant, opp] = process.argv.slice(2);
const res = JSON.parse(fs.readFileSync(path.join(dir, 'results.json'), 'utf8'));
const out = path.join(dir, 'games', variant, opp);
const rows = res.rows.filter((r) => r.variant === variant && r.opponent === opp && !r.error).map((r) => ({
  matchId: `${variant}/${opp}/${r.map}/${r.side}`, map: r.map, side: r.side, result: r.win ? 'win' : 'loss', score: r.score, oppScore: r.oppScore, rounds: r.rounds,
  file: path.join(r.map, r.side + '.repl26a') }));
fs.writeFileSync(path.join(out, 'index.json'), JSON.stringify(rows, null, 1));
console.log(out, rows.length);
