#!/usr/bin/env node
// Economy profile of each variant in a tools/field_eval.mjs output directory (our side only):
// captures, capture gold/gems, worth (gold + 30/shard) at r150/300/500, kills, deaths, first
// capture, plus paired per-game deltas against the 'base' variant. Decodes replays in parallel.
//   node tools/field_profile.mjs <fieldEvalDir> [--variants a,b] [--opps x,y] [--jobs 7] [--maps m1,m2]
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import { dumpReplay, ITEM_NAMES } from './replay_dump.mjs';

const SELF = fileURLToPath(import.meta.url);
const ROOT = path.dirname(path.dirname(SELF));
const CK = [150, 300, 500];
const shards = (it) => it.reduce((s, n, i) => s + n * (ITEM_NAMES[i].includes('Emblem') ? (ITEM_NAMES[i].startsWith('Power') ? 6 : 5) : 1), 0);

async function profile(file, us) {
  const P = { captures: 0, capGold: 0, capGems: 0, kills: 0, deaths: 0, firstCap: null, worth: {} };
  let last = -1;
  await dumpReplay(file, { snapshots: 'none', onStep(st, ev, prev) {
    if (st.round !== last) { last = st.round; if (CK.includes(st.round)) P.worth[st.round] = st.champions.filter((c) => c.team === us).reduce((s, c) => s + c.gold + 30 * shards(c.items), 0); }
    if (!prev) return;
    for (const c of st.champions) {
      if (c.team !== us) continue;
      const b = prev.find((x) => x.entity.index === c.entity.index); if (!b) continue;
      if (b.alive && !c.alive) P.deaths++;
      if (c.kills > b.kills) P.kills += c.kills - b.kills;
    }
    if (ev && ev.kind === 'Capture' && ev.team === us) {
      let any = false;
      for (const c of st.champions) { if (c.team !== us) continue; const b = prev.find((x) => x.entity.index === c.entity.index); if (!b) continue; const dg = c.gems - b.gems, dd = c.gold - b.gold; if (dg > 0 || dd > 0) { P.capGems += Math.max(0, dg); P.capGold += Math.max(0, dd); any = true; } }
      if (any) { P.captures++; if (P.firstCap === null) P.firstCap = st.round; }
    }
  } });
  return P;
}

if (isMainThread) {
  const args = process.argv.slice(2);
  const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
  const dir = path.resolve(args[0]);
  const res = JSON.parse(fs.readFileSync(path.join(dir, 'results.json'), 'utf8'));
  const vs = opt('variants') ? opt('variants').split(',') : Object.keys(res.variants);
  const os_ = opt('opps') ? new Set(opt('opps').split(',')) : null;
  const ms = opt('maps') ? new Set(opt('maps').split(',')) : null;
  const rows = res.rows.filter((r) => !r.error && vs.includes(r.variant) && (!os_ || os_.has(r.opponent)) && (!ms || ms.has(r.map)));
  const jobs = Math.min(+opt('jobs', Math.max(1, os.cpus().length - 1)), rows.length);
  const chunks = Array.from({ length: jobs }, (_, j) => rows.filter((_, i) => i % jobs === j));
  const out = [];
  await Promise.all(chunks.map((c) => new Promise((resolve) => { const w = new Worker(SELF, { workerData: { rows: c } }); w.on('message', (m) => out.push(m)); w.on('exit', resolve); })));
  const key = (r) => `${r.opponent}|${r.map}|${r.side}`;
  const base = new Map(out.filter((r) => r.variant === 'base').map((r) => [key(r), r]));
  const M = [['captures', (p) => p.captures], ['capGold', (p) => p.capGold], ['capGems', (p) => p.capGems], ['worth150', (p) => p.worth[150] ?? 0], ['worth300', (p) => p.worth[300] ?? 0], ['worth500', (p) => p.worth[500] ?? 0], ['kills', (p) => p.kills], ['deaths', (p) => p.deaths], ['firstCap', (p) => p.firstCap ?? 0]];
  console.log('variant'.padEnd(14) + 'games ' + M.map(([n]) => n.padStart(9)).join('') + '   (paired delta vs base)');
  const summary = {};
  for (const v of vs) {
    const R = out.filter((r) => r.variant === v); if (!R.length) continue;
    const avg = (g) => R.reduce((q, r) => q + g(r.p), 0) / R.length;
    const pd = (g) => { let s = 0, n = 0; for (const r of R) { const b = base.get(key(r)); if (!b) continue; s += g(r.p) - g(b.p); n++; } return n ? s / n : NaN; };
    summary[v] = Object.fromEntries(M.map(([n, g]) => [n, { mean: +avg(g).toFixed(1), delta: +pd(g).toFixed(1) }]));
    console.log(v.padEnd(14) + String(R.length).padStart(5) + ' ' + M.map(([n, g]) => avg(g).toFixed(0).padStart(9)).join('') + (v === 'base' ? '' : '   ' + M.map(([n, g]) => { const d = pd(g); return (d >= 0 ? '+' : '') + d.toFixed(0); }).join(' ')));
  }
  fs.writeFileSync(path.join(dir, 'profile.json'), JSON.stringify({ summary, rows: out }, null, 1));
} else {
  for (const r of workerData.rows) {
    try { const p = await profile(path.join(ROOT, r.replay), r.side === 'a' ? 0 : 1); parentPort.postMessage({ variant: r.variant, opponent: r.opponent, map: r.map, side: r.side, win: r.win, p }); }
    catch (e) { /* skip unreadable replay */ }
  }
}
