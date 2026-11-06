#!/usr/bin/env node
// Per-champion-type stats for our side across a platform index.json: games, gems/gold captured,
// kills, deaths, gems lost on death, casts, attacks, moves, alive-turn idle share (rounds <= 2000).
//   node tools/champ_stats.mjs <index.json> [--jobs 6]
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import { dumpReplay, CHAMPION_TYPES } from './replay_dump.mjs';
const SELF = fileURLToPath(import.meta.url);
async function one(file, us) {
  const S = {}; const get = (t) => (S[t] ||= { games: 0, gems: 0, gold: 0, kills: 0, deaths: 0, lost: 0, casts: 0, attacks: 0, moves: 0, alive: 0, idle: 0 });
  const acted = new Set(); let lastRound = -1; const aliveNow = new Map();
  const typeOf = new Map();
  await dumpReplay(file, { snapshots: 'none', onStep(st, ev, prev) {
    if (st.round !== lastRound) {
      for (const [idx, a] of aliveNow) if (a) { const s = get(typeOf.get(idx)); s.alive++; if (!acted.has(idx)) s.idle++; }
      acted.clear(); aliveNow.clear(); lastRound = st.round;
      for (const c of st.champions) if (c.team === us) { typeOf.set(c.entity.index, CHAMPION_TYPES[c.type]); aliveNow.set(c.entity.index, c.alive && st.round >= 5); }
    }
    if (ev && ev.actor?.kind === 1) { const c = st.champions.find((x) => x.entity.index === ev.actor.index); if (c && c.team === us) { const s = get(CHAMPION_TYPES[c.type]);
      if (ev.kind === 'Cast ability') s.casts++; else if (ev.kind === 'Attack') s.attacks++; else if (ev.kind === 'Move') s.moves++;
      if (['Move', 'Attack', 'Cast ability', 'Recall', 'Submit gems', 'Shop', 'Place ward'].includes(ev.kind)) acted.add(ev.actor.index); } }
    if (!prev) return;
    for (const c of st.champions) { if (c.team !== us) continue; const b = prev.find((x) => x.entity.index === c.entity.index); if (!b) continue; const s = get(CHAMPION_TYPES[c.type]);
      if (b.alive && !c.alive) { s.deaths++; s.lost += b.gems; }
      if (c.kills > b.kills) s.kills += c.kills - b.kills;
      if (ev && ev.kind === 'Capture') { s.gems += Math.max(0, c.gems - b.gems); s.gold += Math.max(0, c.gold - b.gold); } }
  } });
  for (const s of Object.values(S)) s.games = 1;
  return S;
}
if (isMainThread) {
  const args = process.argv.slice(2);
  const idx = JSON.parse(fs.readFileSync(args[0], 'utf8')); const dir = path.dirname(args[0]);
  const jobs = +(args[args.indexOf('--jobs') + 1] || 0) || Math.max(1, os.cpus().length - 2);
  const rows = idx.map((x) => ({ file: path.join(dir, x.file), us: x.side === 'a' ? 0 : 1, win: x.result === 'win' }));
  const chunks = Array.from({ length: jobs }, (_, j) => rows.filter((_, i) => i % jobs === j));
  const tot = {}; let n = 0;
  await Promise.all(chunks.map((c) => new Promise((res) => { const w = new Worker(SELF, { workerData: c }); w.on('message', (S) => { n++; for (const [t, s] of Object.entries(S)) { const T = (tot[t] ||= {}); for (const [k, v] of Object.entries(s)) T[k] = (T[k] || 0) + v; } }); w.on('exit', res); })));
  console.log(`games ${n}`);
  console.log('champion      games  gems/g gold/g kills/g deaths/g lost/g casts/g atk/g idle%');
  for (const [t, s] of Object.entries(tot).sort((a, b) => b[1].games - a[1].games)) { const g = s.games;
    console.log(t.padEnd(13), String(g).padStart(5), (s.gems / g).toFixed(0).padStart(7), (s.gold / g).toFixed(0).padStart(6), (s.kills / g).toFixed(2).padStart(7), (s.deaths / g).toFixed(2).padStart(8), (s.lost / g).toFixed(0).padStart(6), (s.casts / g).toFixed(0).padStart(7), (s.attacks / g).toFixed(0).padStart(5), (100 * s.idle / Math.max(1, s.alive)).toFixed(0).padStart(5)); }
} else {
  for (const r of workerData) { try { parentPort.postMessage(await one(r.file, r.us)); } catch (e) { /* skip */ } }
}
