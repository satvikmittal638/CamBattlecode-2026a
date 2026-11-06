#!/usr/bin/env node
// Play one bot against a field of opponents on every pool map, both sides (local matches are
// deterministic, so each map/side/opponent is played once).
//   node tools/gauntlet.mjs <bot> [--opps v21,mimic-mite,...] [--out dir] [--jobs 7] [--quiet]
// Prints per-opponent and total win%, avg gem diff, and per-map totals.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const bot = args[0];
const opps = opt('opps', 'v21,mimic-mite,mimic-kratosmessi,mimic-whim,mimic-shink').split(',');
const outRoot = path.resolve(opt('out', path.join(ROOT, 'local_eval', 'gauntlet', bot)));
const jobs = opt('jobs', '7');
let W = 0, G = 0, GD = 0; const perMap = {}; const lines = [];
for (const o of opps) {
  const out = path.join(outRoot, o);
  execFileSync('node', [path.join(ROOT, 'tools', 'local_eval.mjs'), bot, o, out, '--jobs', jobs], { stdio: ['ignore', 'ignore', 'ignore'] });
  const rows = JSON.parse(fs.readFileSync(path.join(out, 'index.json'), 'utf8'));
  let w = 0, gd = 0;
  for (const r of rows) { const won = r.result === 'win'; w += won; gd += r.score - r.oppScore; const pm = (perMap[r.map] ??= { w: 0, n: 0 }); pm.n++; pm.w += won; }
  W += w; G += rows.length; GD += gd;
  lines.push(`${o.padEnd(18)} ${String(Math.round(100 * w / rows.length)).padStart(3)}%  (${w}/${rows.length})  gemDiff ${Math.round(gd / rows.length)}`);
}
const summary = { bot, winPct: Math.round(100 * W / G), wins: W, games: G, gemDiff: Math.round(GD / G), perOpponent: lines, perMap };
fs.mkdirSync(outRoot, { recursive: true });
fs.writeFileSync(path.join(outRoot, 'summary.json'), JSON.stringify(summary, null, 1));
if (!args.includes('--quiet')) {
  for (const l of lines) console.log('  ' + l);
  console.log(`${bot}: TOTAL ${summary.winPct}% (${W}/${G}) gemDiff ${summary.gemDiff}`);
  console.log('  per map: ' + Object.entries(perMap).map(([m, v]) => `${m}:${v.w}/${v.n}`).join(' '));
} else console.log(JSON.stringify({ winPct: summary.winPct, wins: W, games: G, gemDiff: summary.gemDiff }));
