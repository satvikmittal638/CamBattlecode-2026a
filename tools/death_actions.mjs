#!/usr/bin/env node
// What victims did in the 4 rounds before dying (both sides): HP% four rounds before, stunned in
// that window, recall attempts, moves, attacks/casts, number of distinct enemy champions that hit
// them, and whether they moved away from the nearest enemy on average.
//   node tools/death_actions.mjs <index.json> [--jobs 6]
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import { dumpReplay } from './replay_dump.mjs';
const SELF = fileURLToPath(import.meta.url);
async function one(file, us) {
  const hist = new Map(); // idx -> [{round, hp, max, stunned, pos}]
  const acts = new Map(); // idx -> [{round, kind, target}]
  const out = []; let last = -1;
  await dumpReplay(file, { snapshots: 'none', onStep(st, ev, prev) {
    if (st.round !== last) { last = st.round; for (const c of st.champions) { const h = hist.get(c.entity.index) || []; h.push({ round: st.round, hp: c.health, max: c.maxHealth, stunned: !!c.stunned, pos: c.position, alive: c.alive }); if (h.length > 8) h.shift(); hist.set(c.entity.index, h); } }
    if (ev && ev.actor?.kind === 1) { const a = acts.get(ev.actor.index) || []; a.push({ round: st.round, kind: ev.kind, target: ev.target }); if (a.length > 40) a.shift(); acts.set(ev.actor.index, a);
      if ((ev.kind === 'Attack' || ev.kind === 'Cast ability') && ev.target?.kind === 'champion' && ev.actor.kind === 1) { const t = ev.target.id; const k = 'hitby' + t; const b = acts.get(k) || []; b.push({ round: st.round, by: ev.actor.index }); if (b.length > 40) b.shift(); acts.set(k, b); } }
    if (!prev) return;
    for (const c of st.champions) { const b = prev.find((x) => x.entity.index === c.entity.index); if (!b || !(b.alive && !c.alive)) continue;
      const h = (hist.get(c.entity.index) || []).filter((x) => x.round >= st.round - 4 && x.alive); const a = (acts.get(c.entity.index) || []).filter((x) => x.round >= st.round - 4);
      const hits = (acts.get('hitby' + c.entity.index) || []).filter((x) => x.round >= st.round - 4);
      out.push({ side: c.team === us ? 'us' : 'them', hp4: h.length ? h[0].hp / h[0].max : null, stunned: h.some((x) => x.stunned), recall: a.filter((x) => x.kind === 'Recall').length, moves: a.filter((x) => x.kind === 'Move').length, attacks: a.filter((x) => x.kind === 'Attack' || x.kind === 'Cast ability').length, hitters: new Set(hits.map((x) => x.by)).size });
    } } });
  return out;
}
if (isMainThread) {
  const args = process.argv.slice(2); const jobs = Math.max(1, os.cpus().length - 2);
  const rows = args.filter((a) => a.endsWith('.json')).flatMap((f) => JSON.parse(fs.readFileSync(f, 'utf8')).map((x) => ({ path: path.join(path.dirname(f), x.file), us: x.side === 'a' ? 0 : 1 })));
  const chunks = Array.from({ length: jobs }, (_, j) => rows.filter((_, k) => k % jobs === j)); const D = [];
  await Promise.all(chunks.map((c) => new Promise((res) => { const w = new Worker(SELF, { workerData: c }); w.on('message', (m) => D.push(...m)); w.on('exit', res); })));
  for (const s of ['us', 'them']) { const L = D.filter((d) => d.side === s); const f = (p) => (100 * L.filter(p).length / L.length).toFixed(0) + '%';
    console.log(`${s === 'us' ? 'OUR deaths  ' : 'THEIR deaths'} n=${L.length}: from >60% hp in 4 rounds ${f((d) => d.hp4 > 0.6)}, stunned ${f((d) => d.stunned)}, tried recall ${f((d) => d.recall > 0)}, moved ${f((d) => d.moves > 0)}, fought back ${f((d) => d.attacks > 0)}, idle(no move/attack) ${f((d) => d.moves === 0 && d.attacks === 0 && d.recall === 0)}, hit by 2+ champs ${f((d) => d.hitters >= 2)}, by 3+ ${f((d) => d.hitters >= 3)}`); }
} else { const res = []; for (const r of workerData) { try { res.push(...await one(r.path, r.us)); } catch (e) {} } parentPort.postMessage(res); }
