#!/usr/bin/env node
// Merge several corpus dirs (each with index.json) into one index under <outDir>, deduplicated by
// matchId, with file paths relative to <outDir>.
//   node tools/fish/merge_index.mjs <outDir> <dir1> <dir2> ...
import fs from 'node:fs';
import path from 'node:path';
const [out, ...dirs] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const seen = new Set(); const rows = [];
for (const d of dirs) {
  const p = path.join(d, 'index.json'); if (!fs.existsSync(p)) continue;
  for (const r of JSON.parse(fs.readFileSync(p, 'utf8'))) {
    if (seen.has(r.matchId)) continue;
    const abs = path.join(d, r.file); if (!fs.existsSync(abs)) continue;
    seen.add(r.matchId); rows.push({ ...r, file: path.relative(out, abs) });
  }
}
fs.writeFileSync(path.join(out, 'index.json'), JSON.stringify(rows, null, 1));
const maps = {}; for (const r of rows) maps[r.map] = (maps[r.map] || 0) + 1;
console.log(rows.length, 'games', JSON.stringify(maps));
