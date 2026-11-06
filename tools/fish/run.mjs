#!/usr/bin/env node
// Parallel extractor runner over a team corpus (index.json rows with file + side).
//   node tools/fish/run.mjs <corpusDir> <extractor.mjs> <outPrefix> [--jobs 8] [--limit N] [--maps a,b] [--side us|them]
// The extractor module exports:
//   init(ctx)                  -> per-game state (ctx: {row, team, start}) ; called on the start record
//   turn(state, t)             -> optional rows: array of objects (written to <outPrefix>.jsonl)
//   end(state)                 -> optional rows at game end
//   summarize?(rows)           -> printed (run in the parent after all workers finish)
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { traceReplay } from '../turn_trace.mjs';

const SELF = fileURLToPath(import.meta.url);
if (isMainThread) {
  const args = process.argv.slice(2);
  const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
  const [dir, extractor, outPrefix] = args;
  let rows = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'));
  if (opt('maps')) { const ms = new Set(opt('maps').split(',')); rows = rows.filter((r) => ms.has(r.map)); }
  rows = rows.slice(0, +opt('limit', 1e9));
  const jobs = Math.min(+opt('jobs', Math.max(1, os.cpus().length - 1)), rows.length || 1);
  const out = fs.createWriteStream(outPrefix + '.jsonl');
  let done = 0, nRows = 0; const t0 = Date.now(); const errors = [];
  const chunks = Array.from({ length: jobs }, (_, j) => rows.filter((_, i) => i % jobs === j));
  await Promise.all(chunks.map((chunk) => new Promise((resolve) => {
    const w = new Worker(SELF, { workerData: { dir, extractor: path.resolve(extractor), rows: chunk, side: opt('side', 'us') } });
    w.on('message', (m) => {
      if (m.rows) for (const r of m.rows) { out.write(JSON.stringify(r) + '\n'); nRows++; }
      if (m.done) { done++; if (done % 25 === 0) process.stderr.write(`  ${done}/${rows.length} games, ${nRows} rows, ${Math.round((Date.now() - t0) / 1000)}s\n`); }
      if (m.error) errors.push(m.error);
    });
    w.on('exit', resolve); w.on('error', (e) => { errors.push(String(e)); resolve(); });
  })));
  await new Promise((r) => out.end(r));
  console.error(`done ${done} games, ${nRows} rows -> ${outPrefix}.jsonl in ${Math.round((Date.now() - t0) / 1000)}s; errors ${errors.length}`);
  if (errors.length) console.error(errors.slice(0, 5).join('\n'));
  const mod = await import(pathToFileURL(path.resolve(extractor)).href);
  if (mod.summarize) {
    const all = fs.readFileSync(outPrefix + '.jsonl', 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
    const s = await mod.summarize(all);
    if (s !== undefined) { const txt = typeof s === 'string' ? s : JSON.stringify(s, null, 1); fs.writeFileSync(outPrefix + '.summary.txt', txt); console.log(txt); }
  }
} else {
  const { dir, extractor, rows, side } = workerData;
  const mod = await import(pathToFileURL(extractor).href);
  for (const row of rows) {
    try {
      const us = row.side === 'b' ? 1 : 0; const team = side === 'us' ? us : 1 - us;
      let state = null; const buf = [];
      await traceReplay(path.join(dir, row.file), team, { onTurn: (t) => {
        if (t.start) { state = mod.init({ row, team, start: t }); return; }
        const r = mod.turn(state, t); if (r && r.length) buf.push(...r);
        if (buf.length > 2000) parentPort.postMessage({ rows: buf.splice(0) });
      } });
      const e = mod.end ? mod.end(state) : null; if (e && e.length) buf.push(...e);
      parentPort.postMessage({ rows: buf, done: true });
    } catch (e) { parentPort.postMessage({ error: `${row.file}: ${e.message}`, done: true }); }
  }
}
