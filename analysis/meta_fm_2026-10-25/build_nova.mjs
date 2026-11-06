// Build v62m switch variants (release wasm).
//   node build_v62m.mjs name=FLAG:VALUE,FLAG:VALUE ...   (flags from m62_flags.h or fishx_features.h)
// Each variant becomes workspace/bots/v62m_<name> and analysis/meta_fm_2026-10-25/variants/<name>.wasm.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const HERE = import.meta.dirname;
const ROOT = path.resolve(HERE, '../..');
const src = path.join(ROOT, 'workspace/bots/nova/src');
for (const spec of process.argv.slice(2)) {
  const [name, flags] = spec.split('=');
  const dir = path.join(ROOT, 'workspace/bots', `nova_${name}`);
  fs.rmSync(path.join(dir, 'src'), { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  fs.cpSync(src, path.join(dir, 'src'), { recursive: true });
  for (const kv of (flags || '').split(',').filter(Boolean)) {
    const [k, v] = kv.split(':');
    let done = false;
    for (const f of ['nova_flags.h', 'm62_flags.h', 'fishx_features.h']) {
      const fp = path.join(dir, 'src', f);
      const h = fs.readFileSync(fp, 'utf8');
      const re = new RegExp(`(constexpr (?:bool|int|float) ${k} = )[^;]+;`);
      if (re.test(h)) { fs.writeFileSync(fp, h.replace(re, `$1${v};`)); done = true; break; }
    }
    if (!done) throw new Error(`unknown flag ${k}`);
  }
  fs.writeFileSync(path.join(dir, 'VARIANT.txt'), `${name}: ${flags || 'defaults'}\n`);
  const out = execFileSync(path.join(ROOT, '.venv/bin/cambc'), ['build', `nova_${name}`, '--release'], { cwd: path.join(ROOT, 'workspace'), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const wasm = path.join(dir, '.cambc/build-release/bot-injected.wasm');
  if (!fs.existsSync(wasm)) throw new Error(`build failed for ${name}: ${out.slice(-500)}`);
  fs.copyFileSync(wasm, path.join(HERE, 'variants', `${name}.wasm`));
  console.log(`built ${name} (${flags || 'defaults'})`);
}
