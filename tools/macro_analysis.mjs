#!/usr/bin/env node
// Macro / economy analysis of one team's side of its replays.
//   node tools/macro_analysis.mjs <teamDir> [--out f.json] [--map name] [--limit N] [--jobs 6]
// <teamDir> needs index.json rows {file, side, map} (download_recent.mjs / local_eval.mjs).
// Per game: tributed gems at rounds 100..1000, captures and capture gem value per 100 rounds,
// first capture / tribute round, per-champion round activity (farm, fight, walk, channel,
// idle, dead), grouping (allies within 4), roaming (share of time nearer the enemy spawn),
// net worth (gold + 30 per shard owned) at rounds 150/300/500.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { dumpReplay, CHAMPION_TYPES, CAMP_TYPES, ITEM_NAMES } from './replay_dump.mjs';

const SELF = fileURLToPath(import.meta.url);
const CHECK = [100, 200, 300, 400, 500, 700, 1000];
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
const shardValue = ITEM_NAMES.map((n) => (n.includes('Emblem') ? (n.startsWith('Power') ? 180 : 150) : 30));

export async function analyse(file, me) {
  const them = 1 - me;
  let map = null, prevRound = -1, roundState = null;
  const act = new Map(); // champion id -> activity flags this round
  const activity = {}; const grouping = []; let enemySide = 0, aliveSamples = 0;
  const tributedAt = {}, worthAt = {};
  let firstCapture = null, firstTribute = null, captures = 0, captureGems = 0, captureGold = 0;
  const capturesByType = {};
  const ownCenter = () => { const r = map.spawn[me]; return { x: (r.minX + r.maxX) / 2, y: (r.minY + r.maxY) / 2 }; };
  const oppCenter = () => { const r = map.spawn[them]; return { x: (r.minX + r.maxX) / 2, y: (r.minY + r.maxY) / 2 }; };
  const channel = new Map();

  function closeRound(st) {
    if (!roundState) return;
    const mine = roundState.filter((c) => c.team === me);
    for (const c of mine) {
      const id = c.entity.index, f = act.get(id) || {};
      let k;
      if (!c.alive) k = 'dead';
      else if (f.fight) k = 'fight';
      else if (f.farm) k = 'farm';
      else if (channel.get(id) === 'tribute') k = 'tribute';
      else if (channel.get(id) === 'recall') k = 'recall';
      else if (f.capture) k = 'capture';
      else if (f.move) k = 'walk';
      else k = 'idle';
      const t = CHAMPION_TYPES[c.type];
      (activity[t] ??= {})[k] = ((activity[t] ??= {})[k] || 0) + 1;
      (activity._all ??= {})[k] = (activity._all[k] || 0) + 1;
      if (c.alive && c.position) {
        aliveSamples++;
        const o = ownCenter(), e = oppCenter();
        if (cheb(c.position, e) < cheb(c.position, o)) enemySide++;
        grouping.push(mine.filter((x) => x !== c && x.alive && x.position && cheb(x.position, c.position) <= 4).length);
      }
    }
    act.clear();
  }

  const res = await dumpReplay(file, {
    snapshots: 'none', mapInfo: true,
    onStart({ mapInfo }) { map = mapInfo; },
    onStep(st, ev, prev) {
      if (st.round !== prevRound) {
        closeRound(st);
        prevRound = st.round; roundState = st.champions;
        for (const r of CHECK) if (st.round >= r && tributedAt[r] == null) tributedAt[r] = st.submittedGems[me] - 0;
        for (const r of [150, 300, 500]) if (st.round >= r && worthAt[r] == null) {
          worthAt[r] = st.champions.filter((c) => c.team === me).reduce((s, c) => s + c.gold + c.items.reduce((a, n, i) => a + n * shardValue[i], 0), 0);
        }
      }
      if (!ev) return;
      if (ev.kind === 'Capture' && ev.team === me && prev) {
        // Reward arrives as carried gems/gold on our champions in this step.
        let dg = 0, dgold = 0;
        for (const c of st.champions) { if (c.team !== me) continue; const b = prev.find((x) => x.entity.index === c.entity.index); if (b) { dg += Math.max(0, c.gems - b.gems); dgold += Math.max(0, c.gold - b.gold); } }
        captures++; captureGems += dg; captureGold += dgold;
        if (firstCapture == null) firstCapture = st.round;
        const k = dg > 0 && dgold > 0 ? 'gems+gold' : dg > 0 ? 'gems' : 'gold';
        capturesByType[k] = (capturesByType[k] || 0) + 1;
      }
      if (ev.actor?.kind !== 1 || ev.team !== me) return;
      const id = ev.actor.index; const f = act.get(id) || {}; act.set(id, f);
      if (ev.kind === 'Move') { f.move = true; if (channel.get(id) === 'recall') channel.delete(id); }
      if ((ev.kind === 'Attack' || ev.kind === 'Cast ability') && ev.target?.kind === 'camp') f.farm = true;
      if ((ev.kind === 'Attack' || ev.kind === 'Cast ability') && ev.target?.kind === 'champion' && ev.target.team !== me) f.fight = true;
      if (ev.kind === 'Submit gems') { channel.set(id, 'tribute'); if (firstTribute == null) firstTribute = st.round; }
      if (ev.kind === 'Gems submitted' || ev.kind === 'Cancel channel') channel.delete(id);
      if (ev.kind === 'Recall') channel.set(id, 'recall');
      if (ev.kind === 'Respawn') channel.delete(id);
    },
  });
  closeRound(null);
  const m = res.meta;
  const R = Math.max(1, m.finalRound);
  for (const r of CHECK) if (tributedAt[r] == null) tributedAt[r] = m.submittedGems[me];
  return {
    file: m.file, rounds: m.finalRound, won: m.outcome === (me === 0 ? 'teamA' : 'teamB'), gems: [m.submittedGems[me], m.submittedGems[them]],
    tributedAt, worthAt, firstCapture, firstTribute, capturesPer100: +(100 * captures / R).toFixed(2), gemsPerCapture: captures ? +(captureGems / captures).toFixed(1) : null,
    goldPerCapture: captures ? +(captureGold / captures).toFixed(1) : null, capturesByType, activity, grouping: grouping.length ? +(grouping.reduce((s, x) => s + x, 0) / grouping.length).toFixed(2) : null,
    enemySideFrac: aliveSamples ? +(enemySide / aliveSamples).toFixed(3) : null,
  };
}

function aggregate(games) {
  const avg = (a) => { const v = a.filter((x) => x != null); return v.length ? +(v.reduce((s, x) => s + x, 0) / v.length).toFixed(1) : null; };
  const act = {};
  for (const g of games) for (const [t, o] of Object.entries(g.activity)) for (const [k, v] of Object.entries(o)) ((act[t] ??= {})[k] = (act[t][k] || 0) + v);
  const actPct = Object.fromEntries(Object.entries(act).map(([t, o]) => { const tot = Object.values(o).reduce((s, x) => s + x, 0); return [t, Object.fromEntries(Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, +(v / tot).toFixed(3)]))]; }));
  return {
    games: games.length, winRate: +(games.filter((g) => g.won).length / Math.max(1, games.length)).toFixed(2), avgRounds: avg(games.map((g) => g.rounds)),
    tributedAt: Object.fromEntries(CHECK.map((r) => [r, avg(games.map((g) => g.tributedAt[r]))])),
    netWorthAt: Object.fromEntries([150, 300, 500].map((r) => [r, avg(games.map((g) => g.worthAt[r]))])),
    firstCapture: avg(games.map((g) => g.firstCapture)), firstTribute: avg(games.map((g) => g.firstTribute)),
    capturesPer100: avg(games.map((g) => g.capturesPer100)), gemsPerCapture: avg(games.map((g) => g.gemsPerCapture)), goldPerCapture: avg(games.map((g) => g.goldPerCapture)),
    grouping: avg(games.map((g) => g.grouping)), enemySideFrac: avg(games.map((g) => g.enemySideFrac)), activity: actPct,
  };
}

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
if (args[0] === '--worker') {
  for (const j of JSON.parse(fs.readFileSync(args[1], 'utf8'))) {
    try { const r = await analyse(j.path, j.side === 'b' ? 1 : 0); r.map = j.map; fs.appendFileSync(args[2], JSON.stringify(r) + '\n'); }
    catch (e) { fs.appendFileSync(args[2], JSON.stringify({ file: j.path, error: e.message }) + '\n'); }
  }
  process.exit(0);
} else if (process.argv[1] && path.resolve(process.argv[1]) === SELF) {
  const dir = args[0];
  let rows = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'));
  if (opt('map')) rows = rows.filter((r) => r.map === opt('map'));
  if (opt('limit')) rows = rows.slice(0, Number(opt('limit')));
  rows = rows.map((r) => ({ ...r, path: path.join(dir, r.file) })).filter((r) => fs.existsSync(r.path));
  const n = Math.min(Number(opt('jobs', Math.max(2, os.cpus().length - 1))), rows.length || 1);
  const tmp = path.join(dir, '.macro_work'); fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp, { recursive: true });
  const chunks = Array.from({ length: n }, () => []); rows.forEach((r, i) => chunks[i % n].push(r));
  await Promise.all(chunks.map((c, i) => new Promise((res) => {
    const jf = path.join(tmp, `j${i}.json`); fs.writeFileSync(jf, JSON.stringify(c));
    spawn(process.execPath, [SELF, '--worker', jf, path.join(tmp, `o${i}.jsonl`)], { stdio: 'inherit' }).on('exit', res);
  })));
  const games = [];
  for (let i = 0; i < n; i++) { const f = path.join(tmp, `o${i}.jsonl`); if (!fs.existsSync(f)) continue; for (const l of fs.readFileSync(f, 'utf8').split('\n')) if (l.trim()) { const g = JSON.parse(l); if (g.error) console.error('skip', g.file, g.error); else games.push(g); } }
  fs.rmSync(tmp, { recursive: true, force: true });
  const byMap = {}; for (const g of games) (byMap[g.map] ??= []).push(g);
  const summary = { dir, overall: aggregate(games), byMap: Object.fromEntries(Object.entries(byMap).sort().map(([m, gs]) => [m, aggregate(gs)])) };
  if (opt('out')) fs.writeFileSync(opt('out'), JSON.stringify(summary, null, 1));
  console.log(JSON.stringify(summary.overall, null, 1));
}
