#!/usr/bin/env node
// Per-champion farming decisions of one team.
//   node tools/decision_patterns.mjs <teamDir> [--out f.json] [--limit N] [--jobs 6]
// - next target: after a champion captures (or respawns / arrives from recall), which camp
//   group does it hit next? distance from where it decided, rank by distance among groups
//   that were alive then, and whether a nearer alive group was skipped (and its type)
// - tribute: gems carried when a tribute starts, captures by that champion since its last
//   tribute, and Chebyshev distance to the altar from where it captured last
// - recall: hp fraction and gold when a recall starts; whether it followed a tribute within
//   3 rounds; whether the champion was on the way home anyway
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { dumpReplay, CAMP_TYPES, CHAMPION_TYPES } from './replay_dump.mjs';

const SELF = fileURLToPath(import.meta.url);
const WANT_CANDIDATES = process.env.DECISION_CANDIDATES === '1';
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

export async function analyse(file, me) {
  let comps = null, campComp = null;
  const decide = new Map();   // champion id -> {pos, round}
  const sinceTribute = new Map();
  const lastCapturePos = new Map();
  const lastTributeRound = new Map();
  const out = { next: [], tribute: [], recall: [], cands: [] };
  await dumpReplay(file, {
    snapshots: 'none',
    onStep(st, ev, prev) {
      if (!comps && st.camps.length) {
        const pos = st.camps.map((c) => c.position), n = pos.length, compOf = new Array(n).fill(-1); comps = [];
        for (let i = 0; i < n; i++) {
          if (compOf[i] >= 0) continue;
          const id = comps.length, members = [i]; compOf[i] = id;
          for (let k = 0; k < members.length; k++) { const p = pos[members[k]]; for (let j = 0; j < n; j++) if (compOf[j] < 0 && Math.abs(pos[j].x - p.x) + Math.abs(pos[j].y - p.y) === 1) { compOf[j] = id; members.push(j); } }
          const types = {}; for (const m of members) { const t = CAMP_TYPES[st.camps[m].type]; types[t] = (types[t] || 0) + 1; }
          comps.push({ members, tiles: members.map((m) => pos[m]), label: Object.entries(types).sort().map(([t, c]) => `${t}${c}`).join('+'), gems: members.some((m) => ['Wolf', 'Elk', 'GemCluster', 'Monolith'].includes(CAMP_TYPES[st.camps[m].type])) });
        }
        campComp = compOf;
        for (const c of st.champions) if (c.team === me && c.position) decide.set(c.entity.index, { pos: c.position, round: st.round });
      }
      if (!comps || !ev) return;
      const isMine = ev.actor?.kind === 1 && ev.team === me;
      if (ev.kind === 'Capture' && ev.team === me) {
        for (const c of st.champions) {
          if (c.team !== me || !c.alive || !c.position) continue;
          const on = comps.findIndex((g) => g.tiles.some((t) => t.x === c.position.x && t.y === c.position.y));
          if (on >= 0) { decide.set(c.entity.index, { pos: c.position, round: st.round }); sinceTribute.set(c.entity.index, (sinceTribute.get(c.entity.index) || 0) + 1); lastCapturePos.set(c.entity.index, c.position); }
        }
      }
      if (ev.kind === 'Respawn' && ev.actor?.kind === 1) {
        const c = st.champions.find((x) => x.entity.index === ev.actor.index);
        if (c && c.team === me && c.position) decide.set(c.entity.index, { pos: c.position, round: st.round });
      }
      if (!isMine) return;
      const id = ev.actor.index, me0 = st.champions.find((x) => x.entity.index === id), type = CHAMPION_TYPES[me0?.type];
      if ((ev.kind === 'Attack' || ev.kind === 'Cast ability') && ev.target?.kind === 'camp' && decide.has(id)) {
        const d = decide.get(id); decide.delete(id);
        const ci = campComp[ev.target.id];
        const alive = comps.map((g, gi) => ({ gi, alive: g.members.some((m) => st.camps[m].health > 0), dist: Math.min(...g.tiles.map((t) => cheb(t, d.pos))) })).filter((g) => g.alive);
        alive.sort((a, b) => a.dist - b.dist);
        const rank = alive.findIndex((g) => g.gi === ci);
        const chosen = alive[rank];
        if (chosen) {
          out.next.push({ type, rank, dist: chosen.dist, nearest: alive[0].dist, label: comps[ci].label, nearestLabel: comps[alive[0].gi].label, delay: st.round - d.round });
          if (WANT_CANDIDATES) {
            // Candidate groups at decision time, with whether an ally was already within 2 tiles of them.
            const allies = st.champions.filter((c) => c.team === me && c.alive && c.position && c.entity.index !== id);
            const enemies = st.champions.filter((c) => c.team !== me && c.alive && c.position);
            out.cands.push({ type, chosen: ci, cands: alive.slice(0, 25).map((g) => ({ gi: g.gi, dist: g.dist, label: comps[g.gi].label,
              hp: comps[g.gi].members.reduce((s, m) => s + Math.max(0, st.camps[m].health), 0),
              ally: allies.some((a) => comps[g.gi].tiles.some((t) => cheb(t, a.position) <= 2)),
              enemy: enemies.some((e) => comps[g.gi].tiles.some((t) => cheb(t, e.position) <= 4)) })) });
          }
        }
      }
      if (ev.kind === 'Submit gems') {
        out.tribute.push({ type, gems: ev.gemsCarried, captures: sinceTribute.get(id) || 0, round: st.round, sinceLast: lastTributeRound.has(id) ? st.round - lastTributeRound.get(id) : null });
        sinceTribute.set(id, 0); lastTributeRound.set(id, st.round);
      }
      if (ev.kind === 'Recall' && me0) {
        out.recall.push({ type, hpf: +(me0.health / Math.max(1, me0.maxHealth)).toFixed(2), gold: me0.gold, gems: me0.gems, afterTribute: lastTributeRound.has(id) && st.round - lastTributeRound.get(id) <= 3 });
      }
    },
  });
  return out;
}

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
if (args[0] === '--worker') {
  for (const j of JSON.parse(fs.readFileSync(args[1], 'utf8'))) {
    try { fs.appendFileSync(args[2], JSON.stringify({ map: j.map, ...(await analyse(j.path, j.side === 'b' ? 1 : 0)) }) + '\n'); }
    catch (e) { fs.appendFileSync(args[2], JSON.stringify({ file: j.path, error: e.message }) + '\n'); }
  }
  process.exit(0);
} else if (process.argv[1] && path.resolve(process.argv[1]) === SELF) {
  const dir = args[0];
  let rows = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'));
  if (opt('limit')) rows = rows.slice(0, Number(opt('limit')));
  rows = rows.map((r) => ({ ...r, path: path.join(dir, r.file) })).filter((r) => fs.existsSync(r.path));
  const n = Math.min(Number(opt('jobs', Math.max(2, os.cpus().length - 1))), rows.length || 1);
  const tmp = path.join(dir, '.dec_work'); fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp, { recursive: true });
  const chunks = Array.from({ length: n }, () => []); rows.forEach((r, i) => chunks[i % n].push(r));
  await Promise.all(chunks.map((c, i) => new Promise((res) => { const jf = path.join(tmp, `j${i}.json`); fs.writeFileSync(jf, JSON.stringify(c)); spawn(process.execPath, [SELF, '--worker', jf, path.join(tmp, `o${i}.jsonl`)], { stdio: 'inherit' }).on('exit', res); })));
  const games = [];
  for (let i = 0; i < n; i++) { const f = path.join(tmp, `o${i}.jsonl`); if (!fs.existsSync(f)) continue; for (const l of fs.readFileSync(f, 'utf8').split('\n')) if (l.trim()) { const g = JSON.parse(l); if (!g.error) games.push(g); } }
  fs.rmSync(tmp, { recursive: true, force: true });
  const avg = (a) => { const v = a.filter((x) => x != null); return v.length ? +(v.reduce((s, x) => s + x, 0) / v.length).toFixed(2) : null; };
  const pct = (a, q) => { const v = a.filter((x) => x != null).sort((x, y) => x - y); return v.length ? v[Math.min(v.length - 1, Math.floor(q * v.length))] : null; };
  const next = games.flatMap((g) => g.next), trib = games.flatMap((g) => g.tribute), rec = games.flatMap((g) => g.recall);
  const skipped = {}; for (const x of next) if (x.rank > 0) { const k = `${x.nearestLabel} -> ${x.label}`; skipped[k] = (skipped[k] || 0) + 1; }
  const summary = {
    dir, games: games.length,
    nextTarget: { n: next.length, nearestShare: +(next.filter((x) => x.rank === 0).length / Math.max(1, next.length)).toFixed(2), top2Share: +(next.filter((x) => x.rank <= 1).length / Math.max(1, next.length)).toFixed(2), avgDist: avg(next.map((x) => x.dist)), avgNearest: avg(next.map((x) => x.nearest)), avgDelay: avg(next.map((x) => x.delay)), extraDist: avg(next.map((x) => x.dist - x.nearest)), commonSkips: Object.fromEntries(Object.entries(skipped).sort((a, b) => b[1] - a[1]).slice(0, 8)) },
    tribute: { perGame: +(trib.length / Math.max(1, games.length)).toFixed(1), gemsAvg: avg(trib.map((x) => x.gems)), gemsP25: pct(trib.map((x) => x.gems), 0.25), gemsP50: pct(trib.map((x) => x.gems), 0.5), gemsP75: pct(trib.map((x) => x.gems), 0.75), capturesBetween: avg(trib.map((x) => x.captures)), roundsBetween: avg(trib.map((x) => x.sinceLast)) },
    recall: { perGame: +(rec.length / Math.max(1, games.length)).toFixed(1), hpfAvg: avg(rec.map((x) => x.hpf)), hpfP50: pct(rec.map((x) => x.hpf), 0.5), goldAvg: avg(rec.map((x) => x.gold)), afterTributeShare: +(rec.filter((x) => x.afterTribute).length / Math.max(1, rec.length)).toFixed(2), healthyRecallShare: +(rec.filter((x) => x.hpf >= 0.7).length / Math.max(1, rec.length)).toFixed(2), carryingGemsShare: +(rec.filter((x) => x.gems > 0).length / Math.max(1, rec.length)).toFixed(2) },
  };
  if (opt('candidates')) fs.writeFileSync(opt('candidates'), games.flatMap((g) => g.cands.map((c) => JSON.stringify({ map: g.map, ...c }))).join('\n') + '\n');
  if (opt('out')) fs.writeFileSync(opt('out'), JSON.stringify(summary, null, 1));
  console.log(JSON.stringify(summary, null, 1));
}
