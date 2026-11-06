#!/usr/bin/env node
// Provenance for a tools/field_eval.mjs output directory run with --keep-bots: hashes of the
// kept variant release binaries, opponent release binaries, maps, cambc binary, plus the
// release compiler command/build type. Writes <dir>/provenance.json (refuses to overwrite).
//   node tools/provenance.mjs <fieldEvalDir> [--note "text"]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const WS = path.join(ROOT, 'workspace'), BOTS = path.join(WS, 'bots');
const args = process.argv.slice(2); const dir = path.resolve(args[0]);
const note = args.includes('--note') ? args[args.indexOf('--note') + 1] : null;
const out = path.join(dir, 'provenance.json'); if (fs.existsSync(out)) { console.error('exists: ' + out); process.exit(2); }
const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const aggr = (h) => crypto.createHash('sha256').update(Object.keys(h).sort().map((k) => k + ':' + h[k]).join('\n')).digest('hex');
const hashDir = (d) => { const o = {}; const walk = (x) => { for (const e of fs.readdirSync(x, { withFileTypes: true })) { const p = path.join(x, e.name); if (e.isDirectory()) walk(p); else o[path.relative(d, p)] = sha(p); } }; walk(d); return o; };
const binaries = (botDir) => { const r = path.join(botDir, '.cambc', 'build-release'); const o = {}; for (const f of ['bot.wasm', 'bot-injected.wasm']) if (fs.existsSync(path.join(r, f))) o[f] = sha(path.join(r, f)); return o; };
const compiler = (botDir) => { try { const c = JSON.parse(fs.readFileSync(path.join(botDir, '.cambc', 'build-release', 'compile_commands.json'), 'utf8')); const e = c.find((x) => /main\.cpp$/.test(x.file)) || c[0];
  const cache = fs.readFileSync(path.join(botDir, '.cambc', 'build-release', 'CMakeCache.txt'), 'utf8'); const bt = (cache.match(/CMAKE_BUILD_TYPE:STRING=(.*)/) || [])[1];
  return { buildType: bt, command: e.command.replace(/\s-I\S+/g, '').replace(/\s-o\s\S+/, '').replace(/\s-c\s\S+$/, '') }; } catch (e) { return { error: e.message }; } };
const res = JSON.parse(fs.readFileSync(path.join(dir, 'results.json'), 'utf8'));
const tag = 'fe' + crypto.createHash('sha1').update(dir).digest('hex').slice(0, 6);
const variants = {};
for (const v of Object.keys(res.variants)) { const bd = path.join(BOTS, `${tag}-${v}`); variants[v] = fs.existsSync(bd) ? { botDir: path.relative(ROOT, bd), sourceAggregate: aggr(hashDir(path.join(bd, 'src'))), binaries: binaries(bd), compiler: compiler(bd) } : { missing: 'variant bot dir not kept' }; }
const opponents = Object.fromEntries(res.opponents.map((o) => [o, { sourceAggregate: aggr(hashDir(path.join(BOTS, o, 'src'))), binaries: binaries(path.join(BOTS, o)) }]));
const maps = Object.fromEntries(res.maps.map((m) => [m, sha(path.join(WS, 'maps', m + '.map26a'))]));
const cli = path.join(ROOT, '.venv', 'bin', 'cambc');
const prov = { created: new Date().toISOString(), note, fieldEvalDir: path.relative(ROOT, dir), base: res.base, fh: res.fh, baseSnapshotAggregate: aggr(res.snapshotHash),
  engine: [...new Set(res.rows.map((r) => r.engine))], runner: { cambcVersion: execFileSync(cli, ['--version']).toString().trim(), cambcBinarySha256: sha(fs.realpathSync(cli)), flags: '--release --fuel-quantum 100000 --log-limit 0', runnerExit: res.runnerExit, seconds: res.seconds },
  sourceChangedDuringTest: res.sourceChangedDuringTest, variants, opponents, maps, mapsAggregate: aggr(maps),
  games: res.rows.length, errors: res.rows.filter((r) => r.error).map((r) => ({ key: `${r.variant}|${r.opponent}|${r.map}|${r.side}`, error: r.error })) };
fs.writeFileSync(out, JSON.stringify(prov, null, 1));
console.log(`provenance -> ${path.relative(ROOT, out)}: variants ${Object.entries(variants).map(([k, v]) => k + ' bin ' + (v.binaries?.['bot-injected.wasm'] || 'missing').slice(0, 12)).join(', ')}; maps ${Object.keys(maps).length} (${prov.mapsAggregate.slice(0, 12)}); engine ${prov.engine}; ${prov.runner.cambcVersion}`);
