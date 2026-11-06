// Build v58x flag variants as release wasm files (analysis only; never submitted).
//   node build_variants.mjs name=FLAG:VALUE,FLAG:VALUE ... [--src workspace/bots/v58x]
// Each variant becomes workspace/bots/v58x_<name> (source copy with overridden flag defaults) and
// harness/variants/<name>.wasm.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const args = process.argv.slice(2);
const srcIdx = args.indexOf('--src');
const src = path.join(ROOT, srcIdx >= 0 ? args[srcIdx + 1] : 'workspace/bots/v58x');
const specs = args.filter((a, i) => a.includes('=') && (srcIdx < 0 || i !== srcIdx + 1));
fs.mkdirSync(path.join(HERE, 'variants'), { recursive: true });
for (const spec of specs) {
  const [name, flags] = spec.split('=');
  const dir = path.join(ROOT, 'workspace/bots', `v58x_${name}`);
  fs.rmSync(path.join(dir, 'src'), { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  fs.cpSync(path.join(src, 'src'), path.join(dir, 'src'), { recursive: true });
  const fp = path.join(dir, 'src', 'v58x_flags.h');
  let h = fs.readFileSync(fp, 'utf8');
  for (const kv of (flags || '').split(',').filter(Boolean)) {
    const [k, v] = kv.split(':');
    const re = new RegExp(`(constexpr (?:bool|int|float) ${k} = )[^;]+;`);
    if (!re.test(h)) throw new Error(`unknown flag ${k}`);
    h = h.replace(re, `$1${v};`);
  }
  fs.writeFileSync(fp, h);
  const out = execFileSync(path.join(ROOT, '.venv/bin/cambc'), ['build', `v58x_${name}`, '--release'], { cwd: path.join(ROOT, 'workspace'), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const wasm = path.join(dir, '.cambc/build-release/bot-injected.wasm');
  if (!fs.existsSync(wasm)) throw new Error(`build failed for ${name}: ${out.slice(-500)}`);
  fs.copyFileSync(wasm, path.join(HERE, 'variants', `${name}.wasm`));
  console.log(`built ${name} (${flags || 'defaults'})`);
}
