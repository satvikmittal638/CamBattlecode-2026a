#!/usr/bin/env node
// Aggregate KratosMessi-style metrics over a set of replays.
//   node analysis/kratosmessi/deep.mjs top_replays/2_KratosMessi --recent 60 [--kind ranked] [--map m] [--opp name] [--since ISO]
//   node analysis/kratosmessi/deep.mjs <folder of .repl26a> --side a|b|auto:<teamName>   (map from filename prefix or group json)
//   --json out.json  writes the aggregate; --per-match prints one line per match
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
import { analyzeMatch, mean, median } from './lib.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const flag = (k) => args.includes('--' + k);
const dir = args[0];
const CACHE = path.join(path.dirname(new URL(import.meta.url).pathname), 'cache');
fs.mkdirSync(CACHE, { recursive: true });
const MAPS = ['collision', 'corners', 'elkring', 'expanse', 'interlock', 'lanes', 'monolith', 'packs', 'rows'];

let rows;
const idxPath = path.join(dir, 'index.json');
if (fs.existsSync(idxPath)) {
  rows = JSON.parse(fs.readFileSync(idxPath, 'utf8')).map((r) => ({ ...r, path: path.join(dir, 'replays', r.file), me: r.side === 'b' ? 1 : 0 }));
} else {
  // folder mode
  const side = opt('side', 'a');
  const files = [];
  const walk = (p) => { for (const f of fs.readdirSync(p)) { const q = path.join(p, f); if (fs.statSync(q).isDirectory()) walk(q); else if (f.endsWith('.repl26a')) files.push(q); } };
  walk(dir);
  rows = [];
  for (const f of files) {
    const base = path.basename(f);
    const map = MAPS.find((mm) => base === mm + '.repl26a' || base.startsWith(mm + '_') || base.startsWith(mm + '-')) || MAPS.find((mm) => base.includes('_' + mm + '_')) || opt('map');
    let me = side === 'b' ? 1 : 0;
    if (side === 'dir') me = path.basename(path.dirname(f)) === 'b' ? 1 : 0;
    let opponent = '';
    if (side.startsWith('auto:')) {
      // platform group: read group json in same folder
      const gj = fs.readdirSync(path.dirname(f)).find((x) => x.startsWith('group_') && x.endsWith('.json'));
      if (gj) {
        const g = JSON.parse(fs.readFileSync(path.join(path.dirname(f), gj), 'utf8'));
        const want = side.slice(5).toLowerCase();
        const mid = base.replace(/\.repl26a$/, '').split('_').pop();
        const match = g.matches.find((x) => x.id === mid);
        // sides: which group side is the team; match may swap a/b per map
        const sideRec = g.group.sides.find((s) => (s.teamName || '').toLowerCase().includes(want));
        if (sideRec) {
          me = sideRec.side === 'a' ? 0 : 1;   // replay team 0 = group side a
          opponent = g.group.sides.find((s) => s !== sideRec)?.teamName || '';
        }
      }
    }
    rows.push({ file: base, path: f, map, me, createdAt: fs.statSync(f).mtime.toISOString(), kind: 'local', opponent });
  }
}
if (opt('kind')) rows = rows.filter((r) => r.kind === opt('kind'));
if (opt('map')) rows = rows.filter((r) => r.map === opt('map'));
if (opt('opp')) rows = rows.filter((r) => (r.opponent || '').toLowerCase().includes(opt('opp').toLowerCase()));
if (opt('since')) rows = rows.filter((r) => r.createdAt >= opt('since'));
if (opt('until')) rows = rows.filter((r) => r.createdAt < opt('until'));
rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
if (opt('per-map')) { const cap = +opt('per-map'); const cnt = {}; rows = rows.filter((r) => { cnt[r.map] = (cnt[r.map] || 0) + 1; return cnt[r.map] <= cap; }); }
rows = rows.slice(0, Number(opt('recent', 60)));

const res = [];
for (const r of rows) {
  const ck = path.join(CACHE, (r.path.includes('top_replays') ? r.file : path.relative('.', r.path).replace(/[\/]/g, '__')).replace(/\.repl26a$/, '') + `_${r.me}.json`);
  let a;
  if (fs.existsSync(ck) && !flag('nocache') && fs.statSync(ck).mtimeMs > fs.statSync(r.path).mtimeMs) a = JSON.parse(fs.readFileSync(ck, 'utf8'));
  else {
    try { const d = await dumpReplay(r.path, { snapshots: 'round' }); a = analyzeMatch(d, r.me, r.map); } catch (e) { console.error('skip', r.file, e.message); continue; }
    fs.writeFileSync(ck, JSON.stringify(a));
  }
  a.opponent = r.opponent; a.kind = r.kind; a.file = r.file; a.createdAt = r.createdAt;
  res.push(a);
}

const inc = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };
const r2 = (x) => (x === null || x === undefined ? null : +x.toFixed(2));
const N = res.length;
const agg = {
  matches: N, winRate: r2(res.filter((a) => a.won).length / Math.max(1, N)), avgRounds: r2(mean(res.map((a) => a.rounds))),
  gemsFor: r2(mean(res.map((a) => a.gems[0]))), gemsAgainst: r2(mean(res.map((a) => a.gems[1]))),
  draft: {}, captures: r2(mean(res.map((a) => a.captures))), oppCaptures: r2(mean(res.map((a) => a.oppCaptures))), firstCapture: r2(mean(res.map((a) => a.firstCapture).filter((x) => x !== null))),
  capturesPer100: r2(mean(res.map((a) => (100 * a.captures) / a.rounds))),
  capturersAtCapture: r2(mean(res.flatMap((a) => a.capturersAtCapture))),
  capturesByType: {},
  tributes: r2(mean(res.map((a) => a.tributes.length))), tributesPer100: r2(mean(res.map((a) => (100 * a.tributes.length) / a.rounds))),
  gemsPerTribute: r2(mean(res.flatMap((a) => a.tributes.map((t) => t.gems)))), gemsPerTributeMedian: median(res.flatMap((a) => a.tributes.map((t) => t.gems))),
  firstTribute: r2(mean(res.map((a) => a.tributes[0]?.r).filter((x) => x !== undefined))),
  tributeGemBuckets: {},
  recalls: r2(mean(res.map((a) => a.recalls.length))), recallsPer100: r2(mean(res.map((a) => (100 * a.recalls.length) / a.rounds))),
  recallHpFrac: r2(mean(res.flatMap((a) => a.recalls.map((x) => x.hpf)).filter((x) => x !== null))),
  recallHpBuckets: {}, recallGold: r2(mean(res.flatMap((a) => a.recalls.map((x) => x.gold)).filter((x) => x != null))), recallGems: r2(mean(res.flatMap((a) => a.recalls.map((x) => x.gems)).filter((x) => x != null))),
  recallDistSpawn: r2(mean(res.flatMap((a) => a.recalls.map((x) => x.distSpawn)).filter((x) => x != null))),
  kills: r2(mean(res.map((a) => a.kills))), deaths: r2(mean(res.map((a) => a.deaths))),
  wards: r2(mean(res.map((a) => a.wards))), prio: r2(mean(res.map((a) => a.prio))), altarLocksPlaced: r2(mean(res.map((a) => a.altarLocksPlaced))), altarLockBuys: r2(mean(res.map((a) => a.altarLockBuys))),
  attackMix: {}, campAttackTypes: {},
  enemyHalfFrac: r2(mean(res.map((a) => a.enemyHalf / Math.max(1, a.aliveSamples)))), nearAllies: r2(mean(res.map((a) => a.nearAllies))),
  pairClose: {}, perChamp: {},
};
for (const a of res) {
  inc(agg.draft, a.draft.join(','));
  for (const [k, v] of Object.entries(a.capturesByType)) inc(agg.capturesByType, k, v / N);
  for (const t of a.tributes) inc(agg.tributeGemBuckets, t.gems <= 10 ? '1-10' : t.gems <= 25 ? '11-25' : t.gems <= 45 ? '26-45' : t.gems <= 70 ? '46-70' : t.gems <= 110 ? '71-110' : '111+');
  for (const x of a.recalls) if (x.hpf !== null) inc(agg.recallHpBuckets, x.hpf < 0.2 ? '<20%' : x.hpf < 0.35 ? '20-35%' : x.hpf < 0.5 ? '35-50%' : x.hpf < 0.75 ? '50-75%' : '>=75%');
  for (const [k, v] of Object.entries(a.attacks)) inc(agg.attackMix, k, v);
  for (const [k, v] of Object.entries(a.campAttackTypes)) inc(agg.campAttackTypes, k, v);
  for (const [k, v] of Object.entries(a.pairClose)) inc(agg.pairClose, k, v / a.pairSamples / N);
  for (const [t, c] of Object.entries(a.perChamp)) {
    const p = (agg.perChamp[t] ??= { games: 0, attCampPer100: [], attChampPer100: [], abilPer100: {}, recalls: [], deaths: [], kills: [], tributes: [], gemsTrib: [], hpAtRecall: [], builds: {}, firstShop: {}, altarLockShare: 0 });
    p.games++;
    p.attCampPer100.push((100 * c.attacksCamp) / a.rounds); p.attChampPer100.push((100 * c.attacksChamp) / a.rounds);
    for (const [k, v] of Object.entries(c.abil)) inc(p.abilPer100, k, (100 * v) / a.rounds);
    p.recalls.push(c.recalls); p.deaths.push(c.deaths); p.kills.push(c.kills); p.tributes.push(c.tributes); p.gemsTrib.push(c.gemsTributed); p.hpAtRecall.push(...c.hpAtRecall);
    inc(p.builds, c.build.slice(0, 5).join(' > ') || '(none)');
    const fs1 = c.shops.filter((x) => !x.it.endsWith('*E')).slice(0, 3).map((x) => x.it).join(','); inc(p.firstShop, fs1 || '(none)');
    if (c.shops.some((x) => x.it === 'AltarLock')) p.altarLockShare++;
  }
}
for (const k of Object.keys(agg.attackMix)) agg.attackMix[k] = r2(agg.attackMix[k] / N);
for (const k of Object.keys(agg.campAttackTypes)) agg.campAttackTypes[k] = r2(agg.campAttackTypes[k] / N);
for (const k of Object.keys(agg.capturesByType)) agg.capturesByType[k] = r2(agg.capturesByType[k]);
for (const k of Object.keys(agg.pairClose)) agg.pairClose[k] = r2(agg.pairClose[k]);
const top = (o, n = 4) => Object.fromEntries(Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n));
for (const [t, p] of Object.entries(agg.perChamp)) {
  agg.perChamp[t] = {
    games: p.games, attCampPer100: r2(mean(p.attCampPer100)), attChampPer100: r2(mean(p.attChampPer100)),
    abilPer100: Object.fromEntries(Object.entries(p.abilPer100).map(([k, v]) => [k, r2(v / p.games)]).sort((a, b) => b[1] - a[1])),
    recalls: r2(mean(p.recalls)), deaths: r2(mean(p.deaths)), kills: r2(mean(p.kills)), tributes: r2(mean(p.tributes)), gemsTrib: r2(mean(p.gemsTrib)),
    hpAtRecall: r2(mean(p.hpAtRecall)), builds: top(p.builds, 4), firstShop: top(p.firstShop, 3), altarLockShare: r2(p.altarLockShare / p.games),
  };
}
if (flag('per-match')) for (const a of res) console.log(`${a.createdAt?.slice(5, 16)} ${a.map.padEnd(9)} ${a.won ? 'W' : 'L'} ${a.gems[0]}-${a.gems[1]} r${a.rounds} cap ${a.captures}/${a.oppCaptures} trib ${a.tributes.length} gpt ${r2(mean(a.tributes.map((t) => t.gems)))} rec ${a.recalls.length} k${a.kills}/d${a.deaths} ${a.opponent || ''} [${a.draft.join(',')}] vs [${a.oppDraft.join(',')}]`);
if (opt('json')) fs.writeFileSync(opt('json'), JSON.stringify(agg, null, 1));
if (!flag('quiet')) console.log(JSON.stringify(agg, null, 1));
