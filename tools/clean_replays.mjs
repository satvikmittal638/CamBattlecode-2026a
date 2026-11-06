#!/usr/bin/env node
// Delete replay files (*.repl26a) of finished, already-summarised runs that are older than
// --hours (default 6). Summaries (results.json, index.json, reports, logs) are kept.
// Protected: platform/ (paired platform comparisons), corpus_fish/ (rank-1 games), analysis/,
// reviewer folders (claude_review*), and any run directory listed with --keep.
//   node tools/clean_replays.mjs [--hours 6] [--keep dir1,dir2] [--dry]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const hours = +opt('hours', 6), dry = args.includes('--dry');
const keep = (opt('keep', '') || '').split(',').filter(Boolean).map((d) => path.resolve(ROOT, d));
const TARGETS = ['local_eval', 'top_replays', 'workspace/replays', 'replays_recent', 'replays_week2', 'corpus_w2'];
const PROTECT = [/claude_review/];
const cutoff = Date.now() - hours * 3600e3;
let n = 0, bytes = 0; const perDir = {};
function walk(dir) {
  if (PROTECT.some((re) => re.test(dir)) || keep.some((k) => dir === k || dir.startsWith(k + path.sep))) return;
  let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of ents) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    if (!e.name.endsWith('.repl26a')) continue;
    const st = fs.statSync(p); if (st.mtimeMs > cutoff) continue;
    n++; bytes += st.size; const top = path.relative(ROOT, p).split(path.sep).slice(0, 2).join('/'); perDir[top] = (perDir[top] || 0) + 1;
    if (!dry) fs.rmSync(p);
  }
}
for (const t of TARGETS) walk(path.join(ROOT, t));
const line = `${new Date().toISOString()} ${dry ? 'DRY ' : ''}removed ${n} replays (${(bytes / 1048576).toFixed(0)} MB) older than ${hours}h: ${JSON.stringify(perDir)}`;
console.log(line);
if (!dry) fs.appendFileSync(path.join(ROOT, 'analysis', 'replay_cleanup.log'), line + '\n');
