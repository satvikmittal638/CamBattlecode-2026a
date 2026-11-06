#!/usr/bin/env node
// Field evaluation of switchable bot variants with official engine match statistics.
//   node tools/field_eval.mjs <outDir> --base fishx --fh fishx_features.h
//        --variants "base:,prio:X_PRIO=true,both:X_PRIO=true|X_BANK=true"
//        --opps tm30,v27,v21 [--maps a,b] [--jobs 7] [--timeout 120] [--keep-full-stats]
// - Freezes the base bot's source once (outDir/snapshot) and builds every variant from that
//   snapshot (flags in --fh overridden per variant; '|' separates several overrides), so
//   edits to the live base directory during the batch cannot leak into the results.
// - Plays every variant against every opponent on every map from both sides in ONE
//   run-batch manifest (release mode, fuel quantum 100000, logs disabled), with per-match
//   --statistics JSON. Outcomes, scores, rounds and bot faults come from those statistics.
// - Checks opponent and variant sources are unchanged after the batch, reports missing
//   statistics, non-winning outcomes and faults, and pairs every game with the 'base'
//   variant's game (same opponent/map/side) to count flips.
// Writes outDir/results.json and prints a summary table. Refuses to overwrite outDir.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const WS = path.join(ROOT, 'workspace');
const BOTS = path.join(WS, 'bots');
const CLI = path.join(ROOT, '.venv', 'bin', 'cambc');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const outDir = path.resolve(args[0]);
const base = opt('base'), FH = opt('fh', 'features.h');
const opps = opt('opps', '').split(',').filter(Boolean);
const maps = opt('maps') ? opt('maps').split(',') : JSON.parse(fs.readFileSync(path.join(WS, 'maps', 'pool.json'), 'utf8')).map((m) => m.name);
const variants = opt('variants', 'base:').split(',').filter(Boolean).map((v) => { const i = v.indexOf(':'); return { name: v.slice(0, i), spec: v.slice(i + 1) }; });
const jobs = opt('jobs', '7'), timeout = opt('timeout', '120');
if (!base || !opps.length) { console.error('need --base and --opps'); process.exit(2); }
if (fs.existsSync(outDir)) { console.error('refusing to overwrite ' + outDir); process.exit(2); }
for (const n of [base, ...opps]) if (!/^[A-Za-z0-9_-]+$/.test(n) || !fs.existsSync(path.join(BOTS, n, 'src'))) { console.error('missing bot ' + n); process.exit(2); }
for (const m of maps) if (!fs.existsSync(path.join(WS, 'maps', m + '.map26a'))) { console.error('missing map ' + m); process.exit(2); }
fs.mkdirSync(outDir, { recursive: true });

const hashDir = (dir) => {
  const out = {};
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else out[path.relative(dir, p)] = crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'); } };
  walk(dir); return out;
};
// 1) frozen snapshot of the base source
const snap = path.join(outDir, 'snapshot', 'src');
fs.cpSync(path.join(BOTS, base, 'src'), snap, { recursive: true });
const snapHash = hashDir(snap);
const oppHash = Object.fromEntries(opps.map((o) => [o, hashDir(path.join(BOTS, o, 'src'))]));
// 2) variant bot directories from the snapshot
const tag = 'fe' + crypto.createHash('sha1').update(outDir).digest('hex').slice(0, 6);
const vdirs = {};
for (const v of variants) {
  if (!/^[A-Za-z0-9_]+$/.test(v.name)) { console.error('bad variant name ' + v.name); process.exit(2); }
  const botName = `${tag}-${v.name}`;
  const dir = path.join(BOTS, botName);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.cpSync(snap, path.join(dir, 'src'), { recursive: true });
  let h = fs.readFileSync(path.join(dir, 'src', FH), 'utf8');
  for (const kv of v.spec.split('|').filter(Boolean)) {
    const [k, val] = kv.split('=');
    const re = new RegExp(`(constexpr (?:bool|int|float) ${k} = )[^;]+;`);
    if (!re.test(h)) { console.error(`variant ${v.name}: no flag ${k}`); process.exit(2); }
    h = h.replace(re, `$1${val};`);
  }
  fs.writeFileSync(path.join(dir, 'src', FH), h);
  fs.mkdirSync(path.join(outDir, 'variants'), { recursive: true });
  fs.writeFileSync(path.join(outDir, 'variants', `${v.name}.${FH}`), h);
  vdirs[v.name] = { botName, dir, hash: hashDir(path.join(dir, 'src')) };
}
// 3) build everything once
for (const b of [...variants.map((v) => vdirs[v.name].botName), ...opps]) {
  const r = spawnSync(CLI, ['build', b], { cwd: WS, encoding: 'utf8' });
  if (r.status !== 0) { console.error(`build ${b} failed:\n${r.stdout}\n${r.stderr}`); process.exit(1); }
}
// 4) one manifest
const rows = [], lines = [];
for (const v of variants) for (const o of opps) for (const m of maps) for (const side of ['a', 'b']) {
  // map names may be paths relative to workspace/maps (e.g. ../maps_holdout/x): keep one output dir per map
  const dir = path.join(outDir, 'games', v.name, o, m.replace(/[\/.]+/g, '_')); fs.mkdirSync(dir, { recursive: true });
  const A = side === 'a' ? vdirs[v.name].dir : path.join(BOTS, o), B = side === 'a' ? path.join(BOTS, o) : vdirs[v.name].dir;
  const replay = path.join(dir, side + '.repl26a'), stats = path.join(dir, side + '.json');
  rows.push({ variant: v.name, opponent: o, map: m, side, replay: path.relative(ROOT, replay), stats });
  lines.push(`${A} ${B} ${path.join(WS, 'maps', m + '.map26a')} ${replay} --statistics ${stats} --json`);
}
fs.writeFileSync(path.join(outDir, 'matches.txt'), lines.join('\n') + '\n');
const t0 = Date.now();
const run = spawnSync(CLI, ['run-batch', path.join(outDir, 'matches.txt'), '--jobs', jobs, '--release', '--fuel-quantum', '100000', '--log-limit', '0', '--timeout', timeout, '--color', 'never'],
  { cwd: WS, encoding: 'utf8', maxBuffer: 1 << 30 });
fs.writeFileSync(path.join(outDir, 'runner.log'), (run.stdout || '') + (run.stderr || ''));
const secs = Math.round((Date.now() - t0) / 1000);
// 5) parse statistics (compact copies kept unless --keep-full-stats)
for (const r of rows) {
  if (!fs.existsSync(r.stats)) { r.error = 'missing statistics'; continue; }
  let d; try { d = JSON.parse(fs.readFileSync(r.stats, 'utf8')); } catch (e) { r.error = 'bad statistics: ' + e.message; continue; }
  const me = r.side === 'a' ? 'teamA' : 'teamB', them = me === 'teamA' ? 'teamB' : 'teamA';
  const sc = Object.fromEntries(d.teams.map((t) => [t.team, Number(t.submittedGems)]));
  Object.assign(r, { outcome: d.match.outcome, win: d.match.outcome === me, score: sc[me], oppScore: sc[them], rounds: d.match.roundsStarted,
    myFaults: d.diagnostics.botFaults?.[me] ?? null, oppFaults: d.diagnostics.botFaults?.[them] ?? null, codes: d.diagnostics.codes || [], engine: d.match.engineVersion });
  if (!['teamA', 'teamB'].includes(d.match.outcome)) r.error = 'non-winning outcome ' + d.match.outcome;
  if (!args.includes('--keep-full-stats')) fs.writeFileSync(r.stats, JSON.stringify({ match: d.match, teams: d.teams, diagnostics: d.diagnostics }));
  r.stats = path.relative(ROOT, r.stats);
}
// 6) source stability
const changed = [];
for (const o of opps) { const now = hashDir(path.join(BOTS, o, 'src')); for (const [f, h] of Object.entries(oppHash[o])) if (now[f] !== h) changed.push(`${o}/${f}`); }
for (const v of variants) { const now = hashDir(path.join(vdirs[v.name].dir, 'src')); for (const [f, h] of Object.entries(vdirs[v.name].hash)) if (now[f] !== h) changed.push(`${vdirs[v.name].botName}/${f}`); }
// 7) summaries, paired against 'base'
const agg = (items) => {
  const ok = items.filter((r) => !r.error);
  return { games: items.length, finished: ok.length, wins: ok.filter((r) => r.win).length, gemDiff: ok.length ? +(ok.reduce((q, r) => q + r.score - r.oppScore, 0) / ok.length).toFixed(1) : null,
    myFaults: ok.reduce((q, r) => q + (r.myFaults || 0), 0), oppFaults: ok.reduce((q, r) => q + (r.oppFaults || 0), 0), errors: items.filter((r) => r.error).length };
};
const key = (r) => `${r.opponent}|${r.map}|${r.side}`;
const baseRows = new Map(rows.filter((r) => r.variant === 'base').map((r) => [key(r), r]));
const summary = {};
for (const v of variants) {
  const R = rows.filter((r) => r.variant === v.name);
  const s = { spec: v.spec, overall: agg(R), perOpponent: Object.fromEntries(opps.map((o) => [o, agg(R.filter((r) => r.opponent === o))])),
    perMap: Object.fromEntries(maps.map((m) => [m, agg(R.filter((r) => r.map === m))])) };
  if (baseRows.size && v.name !== 'base') {
    let gained = 0, lost = 0, dSum = 0, n = 0;
    for (const r of R) { const b = baseRows.get(key(r)); if (!b || b.error || r.error) continue; n++; if (r.win && !b.win) gained++; if (!r.win && b.win) lost++; dSum += (r.score - r.oppScore) - (b.score - b.oppScore); }
    s.vsBase = { paired: n, gained, lost, net: gained - lost, gemDiffDelta: n ? +(dSum / n).toFixed(1) : null };
  }
  summary[v.name] = s;
}
const report = { base, fh: FH, snapshotHash: snapHash, opponents: opps, maps, runnerExit: run.status, seconds: secs, sourceChangedDuringTest: changed, variants: summary, rows };
fs.writeFileSync(path.join(outDir, 'results.json'), JSON.stringify(report, null, 1));
// 8) print
console.log(`field_eval ${path.relative(ROOT, outDir)}: ${rows.length} games in ${secs}s, runner exit ${run.status}, source changes ${changed.length}`);
const head = ['variant'.padEnd(14), 'wins'.padStart(9), 'gemDiff'.padStart(8), ...opps.map((o) => o.slice(0, 10).padStart(11)), '  vsBase(+/-/net, dGem)', ' faults', ' err'].join('');
console.log(head);
for (const v of variants) {
  const s = summary[v.name];
  const per = opps.map((o) => `${s.perOpponent[o].wins}/${s.perOpponent[o].games}`.padStart(11)).join('');
  const vb = s.vsBase ? `  +${s.vsBase.gained}/-${s.vsBase.lost}/${s.vsBase.net >= 0 ? '+' : ''}${s.vsBase.net}, ${s.vsBase.gemDiffDelta}` : '  -';
  console.log(`${v.name.padEnd(14)}${(`${s.overall.wins}/${s.overall.games}`).padStart(9)}${String(s.overall.gemDiff).padStart(8)}${per}${vb.padEnd(24)} ${String(s.overall.myFaults).padStart(6)} ${String(s.overall.errors).padStart(4)}`);
}
// 9) remove the temporary variant bot directories (sources are kept in outDir/variants + snapshot)
if (!args.includes('--keep-bots')) for (const v of variants) fs.rmSync(vdirs[v.name].dir, { recursive: true, force: true });
if (run.status || changed.length || rows.some((r) => r.error)) process.exit(1);
