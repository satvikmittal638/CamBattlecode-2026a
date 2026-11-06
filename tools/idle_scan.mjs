#!/usr/bin/env node
// Our-side idle share (rounds 5..--max) for every game of platform index files, in parallel.
//   node tools/idle_scan.mjs <index.json> [index2.json ...] [--max 1200] [--jobs 6]
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import { dumpReplay } from './replay_dump.mjs';
const SELF = fileURLToPath(import.meta.url);
const ACT = new Set(['Move', 'Attack', 'Cast ability', 'Recall', 'Submit gems', 'Shop', 'Place ward']);
async function idle(file, us, MAX) {
  const alive = new Map(), act = new Set(), team = new Map();
  await dumpReplay(file, { snapshots: 'none', onStep(st, ev) { if (st.round > MAX) return;
    for (const c of st.champions) { team.set(c.entity.index, c.team); alive.set(st.round + '|' + c.entity.index, c.alive); }
    if (ev && ev.actor?.kind === 1 && ACT.has(ev.kind)) act.add(st.round + '|' + ev.actor.index); } });
  const n = [0, 0], i = [0, 0];
  for (const [k, a] of alive) { const [r, c] = k.split('|'); if (+r < 5 || !a) continue; const t = team.get(+c); n[t]++; if (!act.has(k)) i[t]++; }
  return { us: i[us] / Math.max(1, n[us]), opp: i[1 - us] / Math.max(1, n[1 - us]) };
}
if (isMainThread) {
  const args = process.argv.slice(2); const opt = (k, d) => { const j = args.indexOf('--' + k); return j >= 0 ? args[j + 1] : d; };
  const MAX = +opt('max', 1200), jobs = +opt('jobs', Math.max(1, os.cpus().length - 2));
  const rows = args.filter((a) => a.endsWith('.json')).flatMap((f) => JSON.parse(fs.readFileSync(f, 'utf8')).map((x) => ({ ...x, path: path.join(path.dirname(f), x.file) })));
  const chunks = Array.from({ length: jobs }, (_, j) => rows.filter((_, k) => k % jobs === j)); const out = [];
  await Promise.all(chunks.map((c) => new Promise((res) => { const w = new Worker(SELF, { workerData: { c, MAX } }); w.on('message', (m) => out.push(m)); w.on('exit', res); })));
  out.sort((a, b) => b.us - a.us);
  for (const r of out.filter((r) => r.us > 0.35)) console.log(`${(100 * r.us).toFixed(0).padStart(3)}% idle (opp ${(100 * r.opp).toFixed(0)}%) ${r.map.padEnd(22)} ${r.label.padEnd(22)} ${r.side} ${r.result} ${r.score}-${r.oppScore}`);
  const m = out.reduce((s, r) => s + r.us, 0) / out.length; console.log(`games ${out.length}, mean idle ${(100 * m).toFixed(1)}%, >35%: ${out.filter((r) => r.us > 0.35).length}`);
} else {
  for (const r of workerData.c) { try { const v = await idle(r.path, r.side === 'a' ? 0 : 1, workerData.MAX); parentPort.postMessage({ ...v, map: r.map, label: r.label, side: r.side, result: r.result, score: r.score, oppScore: r.oppScore }); } catch (e) {} }
}
