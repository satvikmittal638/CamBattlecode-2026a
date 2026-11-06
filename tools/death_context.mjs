#!/usr/bin/env node
// Death context for both sides across platform index files: victim type, gems carried, killer
// (champion type whose kill count rose that step, else "camp/other"), allies vs enemies within 6
// tiles of the victim, own/enemy half (by walking-free Chebyshev distance to the spawn areas),
// round window. Prints aggregates for OUR deaths and for OUR KILLS (enemy deaths).
//   node tools/death_context.mjs <index.json> [more.json ...] [--jobs 6] [--out deaths.jsonl]
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import { dumpReplay, CHAMPION_TYPES } from './replay_dump.mjs';
const SELF = fileURLToPath(import.meta.url);
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
const rectDist = (r, p) => Math.max(Math.max(r.minX - p.x, 0, p.x - r.maxX), Math.max(r.minY - p.y, 0, p.y - r.maxY));
async function one(file, us, meta) {
  const out = []; let spawn = null;
  await dumpReplay(file, { snapshots: 'none', mapInfo: true, onStart({ mapInfo }) { spawn = mapInfo.spawn; }, onStep(st, ev, prev) {
    if (!prev) return;
    for (const c of st.champions) {
      const b = prev.find((x) => x.entity.index === c.entity.index); if (!b || !(b.alive && !c.alive)) continue;
      const pos = b.position; if (!pos) continue;
      let killer = 'camp/other';
      for (const k of st.champions) { if (k.team === c.team) continue; const kb = prev.find((x) => x.entity.index === k.entity.index); if (kb && k.kills > kb.kills) { killer = CHAMPION_TYPES[k.type]; break; } }
      const near = (team) => prev.filter((x) => x.team === team && x.alive && x.entity.index !== c.entity.index && x.position && cheb(x.position, pos) <= 6).length;
      const own = rectDist(spawn[c.team], pos), enemy = rectDist(spawn[1 - c.team], pos);
      out.push({ ...meta, side: c.team === us ? 'us' : 'them', round: st.round, victim: CHAMPION_TYPES[c.type], gems: b.gems, hp0: b.health, killer, allies: near(c.team), enemies: near(1 - c.team), half: own <= enemy ? 'own' : 'enemy' });
    }
  } });
  return out;
}
if (isMainThread) {
  const args = process.argv.slice(2); const opt = (k, d) => { const j = args.indexOf('--' + k); return j >= 0 ? args[j + 1] : d; };
  const jobs = +opt('jobs', Math.max(1, os.cpus().length - 2));
  const rows = args.filter((a) => a.endsWith('.json')).flatMap((f) => JSON.parse(fs.readFileSync(f, 'utf8')).map((x) => ({ path: path.join(path.dirname(f), x.file), us: x.side === 'a' ? 0 : 1, meta: { map: x.map, label: x.label, result: x.result } })));
  const chunks = Array.from({ length: jobs }, (_, j) => rows.filter((_, k) => k % jobs === j)); const D = [];
  await Promise.all(chunks.map((c) => new Promise((res) => { const w = new Worker(SELF, { workerData: c }); w.on('message', (m) => D.push(...m)); w.on('exit', res); })));
  if (opt('out')) fs.writeFileSync(opt('out'), D.map((d) => JSON.stringify(d)).join('\n') + '\n');
  const games = rows.length;
  const agg = (L, key) => { const m = {}; for (const d of L) { const k = key(d); m[k] = (m[k] || 0) + 1; } return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${(v / games).toFixed(2)}`).join(' | '); };
  for (const side of ['us', 'them']) {
    const L = D.filter((d) => d.side === side);
    console.log(`\n== ${side === 'us' ? 'OUR DEATHS' : 'OUR KILLS (enemy deaths)'}: ${(L.length / games).toFixed(1)}/game, gems dropped ${(L.reduce((s, d) => s + d.gems, 0) / games).toFixed(0)}/game`);
    console.log('victim  ', agg(L, (d) => d.victim));
    console.log('killer  ', agg(L, (d) => d.killer));
    console.log('numbers ', agg(L, (d) => { const diff = d.enemies - d.allies; return diff >= 2 ? 'outnumbered2+' : diff === 1 ? 'outnumbered1' : diff === 0 ? 'even' : 'outnumbering'; }));
    console.log('half    ', agg(L, (d) => d.half));
    console.log('window  ', agg(L, (d) => d.round < 300 ? '<300' : d.round < 800 ? '300-800' : d.round < 1300 ? '800-1300' : '1300+'));
    console.log('alone   ', agg(L, (d) => d.allies === 0 ? 'no ally within 6' : 'with ally'));
  }
} else {
  const res = []; for (const r of workerData) { try { res.push(...await one(r.path, r.us, r.meta)); } catch (e) {} } parentPort.postMessage(res);
}
