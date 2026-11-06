#!/usr/bin/env node
// Side-by-side profile: Mite (top_replays, recent N) vs the mimic on local / platform replays.
//   node analysis/mite/compare.mjs <mimicDir with a/ and b/ subfolders | platform dir> [--recent 60] [--mite-opponent name]
// For a platform group folder (contains replays/ + side info in names), pass --side a|b instead.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const prof = (dir, extra) => JSON.parse(execFileSync('node', [path.join(ROOT, 'tools/profile_team.mjs'), dir, ...extra], { encoding: 'utf8', maxBuffer: 1 << 28 }));

const miteArgs = ['--recent', opt('recent', '60')];
if (opt('mite-opponent')) miteArgs.push('--opponent', opt('mite-opponent'));
if (opt('mite-map')) miteArgs.push('--map', opt('mite-map'));
const mite = prof(path.join(ROOT, 'top_replays/1_Mite'), miteArgs);

const parts = [];
const dir = args[0];
for (const s of ['a', 'b']) {
  const d = path.join(dir, s);
  if (fs.existsSync(d) && fs.readdirSync(d).some((f) => f.endsWith('.repl26a'))) parts.push(prof(d, ['--side', s, '--recent', '500']));
}
if (!parts.length && opt('side')) parts.push(prof(dir, ['--side', opt('side'), '--recent', '500']));

// merge profiles weighted by matches
const merge = (ps) => {
  const n = ps.reduce((s, p) => s + p.matches, 0);
  const w = (f) => ps.reduce((s, p) => s + (f(p) ?? 0) * p.matches, 0) / Math.max(1, n);
  const out = { matches: n, winRate: w((p) => p.winRate), avgRounds: w((p) => p.avgRounds), perGame: {}, spatial: {}, attackTargets: {}, perChampion: {} };
  for (const k of Object.keys(ps[0].perGame)) out.perGame[k] = w((p) => p.perGame[k]);
  for (const k of Object.keys(ps[0].spatial)) out.spatial[k] = w((p) => p.spatial[k]);
  for (const p of ps) for (const [k, v] of Object.entries(p.attackTargets)) out.attackTargets[k] = (out.attackTargets[k] || 0) + v;
  for (const p of ps) for (const [t, c] of Object.entries(p.perChampion)) {
    const o = (out.perChampion[t] ??= { games: 0, acc: {} }); o.games += c.games;
    for (const k of ['attacksPer100Rounds', 'killsPerGame', 'deathsPerGame', 'gemsTributedPerGame', 'recallsPerGame']) o.acc[k] = (o.acc[k] || 0) + c[k] * c.games;
    o.abil = { ...(o.abil || {}), ...c.abilities };
    o.build = Object.keys(c.topBuildOrders)[0];
  }
  for (const c of Object.values(out.perChampion)) for (const k of Object.keys(c.acc)) c[k] = c.acc[k] / c.games;
  return out;
};
const me = merge(parts);
const champFrac = (p) => { const a = p.attackTargets; return (a.champion || 0) / Math.max(1, (a.champion || 0) + (a.camp || 0)); };
const row = (name, a, b) => {
  const r = a && b ? b / a : NaN;
  const flag = isFinite(r) ? (Math.abs(r - 1) <= 0.2 ? 'ok' : r > 1 ? 'HIGH' : 'LOW') : '';
  console.log(name.padEnd(22), String(+(+a).toFixed(2)).padStart(8), String(+(+b).toFixed(2)).padStart(8), isFinite(r) ? r.toFixed(2).padStart(6) : '      ', flag);
};
console.log('metric'.padEnd(22), '    mite', '   mimic', ' ratio');
row('matches', mite.matches, me.matches);
row('winRate', mite.winRate, me.winRate);
row('avgRounds', mite.avgRounds, me.avgRounds);
for (const k of Object.keys(mite.perGame)) row(k, mite.perGame[k], me.perGame[k]);
row('champAttackFrac', champFrac(mite), champFrac(me));
for (const k of Object.keys(mite.spatial)) row(k, mite.spatial[k], me.spatial[k]);
const mc = mite.perChampion;
for (const t of Object.keys(mc)) {
  const x = mc[t], y = me.perChampion[t];
  if (!y) continue;
  console.log('--', t, 'games', x.games, '/', y.games);
  for (const k of ['attacksPer100Rounds', 'killsPerGame', 'deathsPerGame', 'gemsTributedPerGame', 'recallsPerGame']) row('  ' + k, x[k], y[k]);
  console.log('   abil mite ', JSON.stringify(x.abilities));
  console.log('   abil mimic', JSON.stringify(y.abil));
  console.log('   build mite ', Object.keys(x.topBuildOrders)[0]);
  console.log('   build mimic', y.build);
}
