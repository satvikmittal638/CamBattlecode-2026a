#!/usr/bin/env node
// Play botA vs botB locally on every pool map from both sides, then summarise.
//   node tools/local_eval.mjs <botA> <botB> <outDir> [--maps m1,m2] [--jobs 6] [--reps 1]
// Bots are names in workspace/bots. Writes <outDir>/<map>/*.repl26a, <outDir>/index.json
// (rows from botA's perspective, usable by tools/fight_analysis.mjs) and prints per-map
// results plus a fight summary for botA.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dumpReplay } from './replay_dump.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(HERE), WS = path.join(ROOT, 'workspace'), CAMBC = path.join(ROOT, '.venv', 'bin', 'cambc');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const [A, B, outRel] = args;
if (!A || !B || !outRel) { console.error('usage: local_eval.mjs <botA> <botB> <outDir> [--maps a,b] [--jobs N] [--reps N]'); process.exit(2); }
const out = path.resolve(outRel);
const maps = opt('maps') ? opt('maps').split(',') : JSON.parse(fs.readFileSync(path.join(WS, 'maps', 'pool.json'), 'utf8')).map((m) => m.name);
const reps = Number(opt('reps', 1)), jobs = Number(opt('jobs', 6));
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

// Build both bots once (run-batch would otherwise race to build them in parallel).
for (const b of new Set([A, B])) execFileSync(CAMBC, ['build', b], { cwd: WS, stdio: ['ignore', 'ignore', 'inherit'] });

const rows = [], lines = [];
for (const m of maps) for (let r = 0; r < reps; r++) for (const side of ['a', 'b']) {
  fs.mkdirSync(path.join(out, m), { recursive: true });
  const file = path.join(m, `${side}_${r}.repl26a`);
  const [x, y] = side === 'a' ? [A, B] : [B, A];
  lines.push(`${path.join(WS, 'bots', x)} ${path.join(WS, 'bots', y)} ${path.join(WS, 'maps', m + '.map26a')} ${path.join(out, file)}`);
  rows.push({ file, side, map: m, opponent: B, kind: 'local', createdAt: new Date().toISOString() });
}
const manifest = path.join(out, 'matches.txt');
fs.writeFileSync(manifest, lines.join('\n') + '\n');
const t0 = Date.now();
const res = spawnSync(CAMBC, ['run-batch', manifest, '--jobs', String(jobs), '--release', '--log-limit', '0', '--color', 'never'], { cwd: WS, encoding: 'utf8', maxBuffer: 1 << 28 });
if (res.status !== 0) console.error(res.stdout.slice(-2000), res.stderr.slice(-2000));
console.error(`ran ${lines.length} matches in ${((Date.now() - t0) / 1000).toFixed(0)}s`);

const perMap = {};
let wins = 0, games = 0, gemDiff = 0;
for (const r of rows) {
  const f = path.join(out, r.file);
  if (!fs.existsSync(f)) { console.error('missing', r.file); continue; }
  const d = await dumpReplay(f, { snapshots: 'none' });
  const me = r.side === 'b' ? 1 : 0;
  const won = d.meta.outcome === (me === 0 ? 'teamA' : 'teamB');
  r.result = won ? 'win' : 'loss'; r.score = d.meta.submittedGems[me]; r.oppScore = d.meta.submittedGems[1 - me]; r.rounds = d.meta.finalRound;
  const pm = (perMap[r.map] ??= { w: 0, n: 0, gd: 0 });
  pm.n++; pm.w += won; pm.gd += r.score - r.oppScore;
  games++; wins += won; gemDiff += r.score - r.oppScore;
}
fs.writeFileSync(path.join(out, 'index.json'), JSON.stringify(rows.filter((r) => r.result), null, 1));
console.log(`${A} vs ${B}: ${wins}/${games} wins (${(100 * wins / Math.max(1, games)).toFixed(0)}%), avg gem diff ${(gemDiff / Math.max(1, games)).toFixed(0)}`);
console.log(Object.entries(perMap).map(([m, v]) => `${m}:${v.w}/${v.n}(${v.gd > 0 ? '+' : ''}${Math.round(v.gd / v.n)})`).join('  '));
