#!/usr/bin/env node
// Feature ablation of workspace/bots/edge (flags in src/features.h) against an opponent bot.
//   node tools/ablate.mjs [--opp v21] [--reps 2] [--mode add|remove|both] [--only F_A,F_B] [--base F_X,F_Y] [--jobs 7]
// --base: features always on in 'add' mode (greedy forward selection).
// add:    base (all off) + one feature at a time      remove: all on - one feature at a time
// Prints win% and avg gem diff per variant; full rows in local_eval/ablation/summary.json.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const BOTS = path.join(ROOT, 'workspace', 'bots');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const opp = opt('opp', 'v21'), reps = opt('reps', '2'), mode = opt('mode', 'both'), jobs = opt('jobs', '7');
const src = fs.readFileSync(path.join(BOTS, 'edge', 'src', 'features.h'), 'utf8');
const all = [...src.matchAll(/constexpr bool (F_[A-Z0-9]+) =/g)].map((m) => m[1]).filter((f) => !opt('only') || opt('only').split(',').includes(f));
const variants = [];
const baseOn = opt('base') ? opt('base').split(',') : [];
if (mode !== 'remove') { variants.push({ name: baseOn.length ? 'base[' + baseOn.join('+').replace(/F_/g, '') + ']' : 'base', on: baseOn }); for (const f of all) if (!baseOn.includes(f)) variants.push({ name: `+${f}`, on: [...baseOn, f] }); }
if (mode !== 'add') { variants.push({ name: 'all', on: all }); for (const f of all) variants.push({ name: `-${f}`, on: all.filter((x) => x !== f) }); }

const results = [];
for (const v of variants) {
  const name = 'abl-' + v.name.replace(/[^a-zA-Z0-9]/g, '_');
  const dir = path.join(BOTS, name);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.cpSync(path.join(BOTS, 'edge', 'src'), path.join(dir, 'src'), { recursive: true });
  let h = src.replace(/constexpr bool (F_[A-Z0-9]+) = [^;]+;/g, (m, f) => `constexpr bool ${f} = ${v.on.includes(f) ? 'true' : 'false'};`);
  fs.writeFileSync(path.join(dir, 'src', 'features.h'), h);
  const out = execFileSync('node', [path.join(ROOT, 'tools', 'local_eval.mjs'), name, opp, path.join(ROOT, 'local_eval', 'ablation', v.name.replace(/[^a-zA-Z0-9+-]/g, '_')), '--reps', reps, '--jobs', jobs], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  const line = out.split('\n').find((l) => l.includes(' wins ('));
  const m = line && line.match(/(\d+)\/(\d+) wins \((\d+)%\), avg gem diff (-?\d+)/);
  const r = { variant: v.name, wins: m ? +m[1] : null, games: m ? +m[2] : null, pct: m ? +m[3] : null, gemDiff: m ? +m[4] : null, perMap: out.split('\n').find((l) => l.includes(':') && l.includes('/') && !l.includes('wins')) };
  results.push(r);
  console.log(`${v.name.padEnd(16)} ${String(r.pct).padStart(3)}%  (${r.wins}/${r.games})  gemDiff ${r.gemDiff}`);
  fs.rmSync(dir, { recursive: true, force: true });
}
fs.mkdirSync(path.join(ROOT, 'local_eval', 'ablation'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'local_eval', 'ablation', 'summary.json'), JSON.stringify(results, null, 1));
