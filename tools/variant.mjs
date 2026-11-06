#!/usr/bin/env node
// Copy workspace/bots/edge to a variant with flag overrides in features.h, then play it locally.
//   node tools/variant.mjs <name> <F_A=false,G_B=0.2,...> [--opp v27 | --opps a,b,c] [--jobs 7] [--keep] [--base edge] [--fh features.h]
// Prints the local_eval summary line and per-map line; results in local_eval/variants/<name>.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const BOTS = path.join(ROOT, 'workspace', 'bots');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const name = args[0]; const spec = args[1] && !args[1].startsWith('--') ? args[1] : '';
const dir = path.join(BOTS, 'var-' + name);
fs.rmSync(dir, { recursive: true, force: true });
fs.cpSync(path.join(BOTS, opt('base', 'edge'), 'src'), path.join(dir, 'src'), { recursive: true });
const FH = opt('fh', 'features.h');
let h = fs.readFileSync(path.join(dir, 'src', FH), 'utf8');
for (const kv of spec.split(',').filter(Boolean)) {
  const [k, v] = kv.split('=');
  const re = new RegExp(`(constexpr (?:bool|int|float) ${k} = )[^;]+;`);
  if (!re.test(h)) throw new Error('no flag ' + k);
  h = h.replace(re, `$1${v};`);
}
fs.writeFileSync(path.join(dir, 'src', FH), h);
if (opt('opps')) {
  // multi-opponent field via tools/gauntlet.mjs (both sides, every pool map, per opponent)
  const out = execFileSync('node', [path.join(ROOT, 'tools', 'gauntlet.mjs'), 'var-' + name, '--opps', opt('opps'), '--out', path.join(ROOT, 'local_eval', 'variants', name), '--jobs', opt('jobs', '7')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  console.log(`[${name}] ${spec}\n` + out.trimEnd());
} else {
  const out = execFileSync('node', [path.join(ROOT, 'tools', 'local_eval.mjs'), 'var-' + name, opt('opp', 'v27'), path.join(ROOT, 'local_eval', 'variants', name), '--jobs', opt('jobs', '7')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  const lines = out.split('\n');
  const i = lines.findIndex((l) => l.includes(' wins ('));
  console.log(`[${name}] ${spec}\n  ${lines[i]}\n  ${lines[i + 1]}`);
}
if (!args.includes('--keep')) fs.rmSync(dir, { recursive: true, force: true });
