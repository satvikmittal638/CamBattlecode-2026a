#!/usr/bin/env node
// Which camp groups a team captures, how fast, with how many champions, and where.
//   node tools/capture_patterns.mjs <teamDir> [--out f.json] [--limit N] [--jobs 6]
// Camp groups are rebuilt from initial camp positions (cardinally connected = one group).
// For each capture by "us": composition (e.g. "Elk2+GoldCluster1"), capturers on the group's
// tiles, clear time (our first hit on the group -> all its camps dead), wait (all dead ->
// capture), side of the map, and the round. Also the first three captures (opening).
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { dumpReplay, CAMP_TYPES } from './replay_dump.mjs';

const SELF = fileURLToPath(import.meta.url);
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

export async function analyse(file, me) {
  let comps = null, campComp = null, map = null;
  const firstHit = new Map(), allDeadAt = new Map();
  const caps = [], theirCaps = [];
  await dumpReplay(file, {
    snapshots: 'none', mapInfo: true,
    onStart({ mapInfo }) { map = mapInfo; },
    onStep(st, ev, prev) {
      if (!comps && st.camps.length) {
        const pos = st.camps.map((c) => c.position), n = pos.length, compOf = new Array(n).fill(-1);
        comps = [];
        for (let i = 0; i < n; i++) {
          if (compOf[i] >= 0) continue;
          const id = comps.length, members = [i]; compOf[i] = id;
          for (let k = 0; k < members.length; k++) {
            const p = pos[members[k]];
            for (let j = 0; j < n; j++) if (compOf[j] < 0 && Math.abs(pos[j].x - p.x) + Math.abs(pos[j].y - p.y) === 1) { compOf[j] = id; members.push(j); }
          }
          const types = {}; for (const m of members) { const t = CAMP_TYPES[st.camps[m].type]; types[t] = (types[t] || 0) + 1; }
          comps.push({ members, tiles: members.map((m) => pos[m]), label: Object.entries(types).sort().map(([t, c]) => `${t}${c}`).join('+') });
        }
        campComp = compOf;
      }
      if (!comps) return;
      for (let ci = 0; ci < comps.length; ci++) {
        const dead = comps[ci].members.every((m) => st.camps[m].health <= 0);
        if (dead && !allDeadAt.has(ci)) allDeadAt.set(ci, st.round);
        if (!dead && allDeadAt.has(ci)) { allDeadAt.delete(ci); firstHit.delete(ci); }
      }
      if (!ev) return;
      if (ev.actor?.kind === 1 && ev.team === me && (ev.kind === 'Attack' || ev.kind === 'Cast ability') && ev.target?.kind === 'camp') {
        const ci = campComp[ev.target.id]; if (ci != null && ci >= 0 && !firstHit.has(ci)) firstHit.set(ci, st.round);
      }
      if (ev.kind === 'Capture') {
        const team = ev.team;
        let best = -1, bestN = 0;
        for (let ci = 0; ci < comps.length; ci++) {
          if (!allDeadAt.has(ci)) continue;
          const n = st.champions.filter((c) => c.team === team && c.alive && c.position && comps[ci].tiles.some((t) => t.x === c.position.x && t.y === c.position.y)).length;
          if (n > bestN) { bestN = n; best = ci; }
        }
        if (best < 0) return;
        const c = comps[best], center = c.tiles[0];
        const own = map.spawn[team], opp = map.spawn[1 - team];
        const oc = { x: (own.minX + own.maxX) / 2, y: (own.minY + own.maxY) / 2 }, ec = { x: (opp.minX + opp.maxX) / 2, y: (opp.minY + opp.maxY) / 2 };
        const rec = { round: st.round, label: c.label, capturers: bestN, enemySide: cheb(center, ec) < cheb(center, oc),
          clear: team === me && firstHit.has(best) ? allDeadAt.get(best) - firstHit.get(best) : null, wait: st.round - allDeadAt.get(best) };
        (team === me ? caps : theirCaps).push(rec);
        firstHit.delete(best); allDeadAt.delete(best);
      }
    },
  });
  return { caps, theirCaps };
}

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
if (args[0] === '--worker') {
  for (const j of JSON.parse(fs.readFileSync(args[1], 'utf8'))) {
    try { const r = await analyse(j.path, j.side === 'b' ? 1 : 0); fs.appendFileSync(args[2], JSON.stringify({ map: j.map, ...r }) + '\n'); }
    catch (e) { fs.appendFileSync(args[2], JSON.stringify({ file: j.path, error: e.message }) + '\n'); }
  }
  process.exit(0);
} else if (process.argv[1] && path.resolve(process.argv[1]) === SELF) {
  const dir = args[0];
  let rows = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'));
  if (opt('limit')) rows = rows.slice(0, Number(opt('limit')));
  rows = rows.map((r) => ({ ...r, path: path.join(dir, r.file) })).filter((r) => fs.existsSync(r.path));
  const n = Math.min(Number(opt('jobs', Math.max(2, os.cpus().length - 1))), rows.length || 1);
  const tmp = path.join(dir, '.cap_work'); fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp, { recursive: true });
  const chunks = Array.from({ length: n }, () => []); rows.forEach((r, i) => chunks[i % n].push(r));
  await Promise.all(chunks.map((c, i) => new Promise((res) => {
    const jf = path.join(tmp, `j${i}.json`); fs.writeFileSync(jf, JSON.stringify(c));
    spawn(process.execPath, [SELF, '--worker', jf, path.join(tmp, `o${i}.jsonl`)], { stdio: 'inherit' }).on('exit', res);
  })));
  const games = [];
  for (let i = 0; i < n; i++) { const f = path.join(tmp, `o${i}.jsonl`); if (!fs.existsSync(f)) continue; for (const l of fs.readFileSync(f, 'utf8').split('\n')) if (l.trim()) { const g = JSON.parse(l); if (!g.error) games.push(g); } }
  fs.rmSync(tmp, { recursive: true, force: true });
  const avg = (a) => { const v = a.filter((x) => x != null); return v.length ? +(v.reduce((s, x) => s + x, 0) / v.length).toFixed(1) : null; };
  const summarise = (gs) => {
    const all = gs.flatMap((g) => g.caps), theirs = gs.flatMap((g) => g.theirCaps);
    const byLabel = {};
    for (const c of all) { const b = (byLabel[c.label] ??= { n: 0, clear: [], capturers: [], wait: [] }); b.n++; b.clear.push(c.clear); b.capturers.push(c.capturers); b.wait.push(c.wait); }
    const opening = {};
    for (const g of gs) { const k = g.caps.slice(0, 3).map((c) => `${c.label}@${c.round}`).join(' > '); opening[k] = (opening[k] || 0) + 1; }
    return {
      games: gs.length, capturesPerGame: +(all.length / Math.max(1, gs.length)).toFixed(1), theirCapturesPerGame: +(theirs.length / Math.max(1, gs.length)).toFixed(1),
      avgCapturers: avg(all.map((c) => c.capturers)), avgClear: avg(all.map((c) => c.clear)), avgWait: avg(all.map((c) => c.wait)), enemySideShare: +(all.filter((c) => c.enemySide).length / Math.max(1, all.length)).toFixed(2),
      byGroup: Object.fromEntries(Object.entries(byLabel).sort((a, b) => b[1].n - a[1].n).slice(0, 12).map(([k, b]) => [k, { perGame: +(b.n / gs.length).toFixed(2), clear: avg(b.clear), capturers: avg(b.capturers), wait: avg(b.wait) }])),
      openings: Object.fromEntries(Object.entries(opening).sort((a, b) => b[1] - a[1]).slice(0, 3)),
    };
  };
  const byMap = {}; for (const g of games) (byMap[g.map] ??= []).push(g);
  const out = { dir, overall: summarise(games), byMap: Object.fromEntries(Object.entries(byMap).sort().map(([m, gs]) => [m, summarise(gs)])) };
  if (opt('out')) fs.writeFileSync(opt('out'), JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out.overall, null, 1));
}
