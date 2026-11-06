#!/usr/bin/env node
// Aggregate a team's play style across downloaded replays (decoded in memory, nothing
// large written to disk).
//
//   node tools/profile_team.mjs <teamDir> [--recent 60] [--kind ranked|unranked|all]
//        [--map name] [--opponent name] [--per-match] [--out profile.json]
//
// <teamDir> is a folder produced by the replay downloader (index.json + replays/), e.g.
// top_replays/1_Mite. Only the team's own side of each match is profiled. Also works on
// any folder of .repl26a files with --side a|b (then index.json is not needed).
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay, ITEM_NAMES } from './replay_dump.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const flag = (k) => args.includes('--' + k);
const dir = args[0];
if (!dir) { console.error('usage: profile_team.mjs <teamDir> [--recent N] [--kind ranked|all] [--map m] [--opponent o] [--per-match] [--out f]'); process.exit(2); }

let rows;
const indexPath = path.join(dir, 'index.json');
if (fs.existsSync(indexPath)) {
  rows = JSON.parse(fs.readFileSync(indexPath, 'utf8')).map((r) => ({ ...r, path: path.join(dir, 'replays', r.file) }));
} else {
  const side = opt('side'); if (!side) { console.error('no index.json: pass --side a|b'); process.exit(2); }
  rows = fs.readdirSync(dir).filter((f) => f.endsWith('.repl26a')).map((f) => ({ file: f, path: path.join(dir, f), side, createdAt: fs.statSync(path.join(dir, f)).mtime.toISOString(), kind: 'local', map: f.split('_')[0] }));
}
const kind = opt('kind', 'all');
if (kind !== 'all') rows = rows.filter((r) => r.kind === kind);
if (opt('map')) rows = rows.filter((r) => r.map === opt('map'));
if (opt('opponent')) rows = rows.filter((r) => (r.opponent || '').toLowerCase().includes(opt('opponent').toLowerCase()));
rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
rows = rows.slice(0, Number(opt('recent', 60)));

const inc = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };
const agg = {
  matches: 0, wins: 0, byMap: {}, draft: {}, draftOrder: {}, rounds: [], gemDiff: [],
  perChampion: {}, captures: [], firstCapture: [], tributes: [], gemsPerTribute: [], firstTribute: [],
  recalls: [], wards: [], altarLocks: [], consumablesUsed: [], kills: [], deaths: [], attacks: { champion: 0, camp: 0, other: 0 },
  campTargets: {}, enemyHalfFrac: [], spawnDist: [], groupedFrac: [], priorityChanges: [],
};
const perMatch = [];

function champAgg(t) {
  return (agg.perChampion[t] ??= { games: 0, buildOrders: {}, finalItems: {}, abilities: {}, attacksPer100: [], deaths: 0, kills: [], gemsTributed: [], recalls: 0 });
}

for (const r of rows) {
  let d;
  try { d = await dumpReplay(r.path, { snapshots: 'round' }); } catch (e) { console.error('skip', r.file, e.message); continue; }
  const me = r.side === 'b' ? 1 : 0;
  const m = d.meta;
  const won = m.outcome === (me === 0 ? 'teamA' : 'teamB');
  agg.matches++; if (won) agg.wins++;
  const bm = (agg.byMap[r.map] ??= { games: 0, wins: 0 }); bm.games++; if (won) bm.wins++;
  const myDraft = m.draft[me] || [];
  myDraft.forEach((c, i) => { inc(agg.draft, c); inc(agg.draftOrder, `${i + 1}:${c}`); });
  agg.rounds.push(m.finalRound);
  agg.gemDiff.push(m.submittedGems[me] - m.submittedGems[1 - me]);

  const myIds = new Set(m.finalChampions.filter((c) => c.team === me).map((c) => c.id));
  const typeOf = Object.fromEntries(m.finalChampions.map((c) => [c.id, c.type]));
  const ev = d.events.filter((e) => e.actor?.kind === 1 && myIds.has(e.actor.index));
  const teamEv = d.events.filter((e) => e.team === me);
  const caps = d.events.filter((e) => e.kind === 'Capture' && e.team === me);
  agg.captures.push(caps.length); if (caps.length) agg.firstCapture.push(caps[0].round);
  const subs = ev.filter((e) => e.kind === 'Submit gems');
  agg.tributes.push(subs.length); subs.forEach((e) => e.gemsCarried != null && agg.gemsPerTribute.push(e.gemsCarried));
  if (subs.length) agg.firstTribute.push(subs[0].round);
  agg.recalls.push(ev.filter((e) => e.kind === 'Recall').length);
  agg.wards.push(ev.filter((e) => e.kind === 'Place ward').length);
  agg.altarLocks.push(ev.filter((e) => e.kind === 'Place altar lock').length);
  agg.consumablesUsed.push(ev.filter((e) => e.kind === 'Consumable').length);
  agg.priorityChanges.push(ev.filter((e) => e.kind === 'Set priority').length);
  for (const e of ev.filter((x) => x.kind === 'Attack')) {
    const k = e.target?.kind || 'other'; agg.attacks[k] = (agg.attacks[k] || 0) + 1;
    if (k === 'camp') inc(agg.campTargets, e.target.type);
  }
  const fin = m.finalChampions.filter((c) => c.team === me);
  agg.kills.push(fin.reduce((s, c) => s + c.kills, 0));
  const deaths = d.events.filter((e) => e.kind === 'Respawn' && e.actor?.kind === 1 && myIds.has(e.actor.index)).length;
  agg.deaths.push(deaths);

  for (const id of myIds) {
    const t = typeOf[id]; const ca = champAgg(t); ca.games++;
    const mine = ev.filter((e) => e.actor.index === id);
    const order = [];
    for (const e of mine.filter((x) => x.kind === 'Shop')) for (const [it, n] of Object.entries(e.items || {})) if (n > 0 && !it.includes('Emblem')) order.push(it.replace(' Shard of ', ':'));
    const key = order.slice(0, 10).join(' > ') || '(none)';
    inc(ca.buildOrders, key);
    const f = fin.find((c) => c.id === id); for (const [it, n] of Object.entries(f?.items || {})) inc(ca.finalItems, it, n);
    for (const e of mine.filter((x) => x.kind === 'Cast ability')) inc(ca.abilities, `${e.abilityType}->${e.target?.kind || 'tile'}`);
    ca.attacksPer100.push(+(100 * mine.filter((x) => x.kind === 'Attack').length / Math.max(1, m.finalRound)).toFixed(1));
    ca.kills.push(f?.kills || 0);
    ca.deaths += d.events.filter((e) => e.kind === 'Respawn' && e.actor?.kind === 1 && e.actor.index === id).length;
    ca.gemsTributed.push(mine.filter((x) => x.kind === 'Submit gems').reduce((s, x) => s + (x.gemsCarried || 0), 0));
    ca.recalls += mine.filter((x) => x.kind === 'Recall').length;
  }

  // Spatial habits from per-round snapshots.
  const s0 = d.snapshots.find((s) => s.champions.length && s.champions.every((c) => c.pos));
  if (s0) {
    const mine0 = s0.champions.filter((c) => c.team === me);
    const sx = mine0.reduce((s, c) => s + c.pos[0], 0) / mine0.length, sy = mine0.reduce((s, c) => s + c.pos[1], 0) / mine0.length;
    const theirs0 = s0.champions.filter((c) => c.team !== me);
    const ex = theirs0.reduce((s, c) => s + c.pos[0], 0) / theirs0.length, ey = theirs0.reduce((s, c) => s + c.pos[1], 0) / theirs0.length;
    const W = m.width, H = m.height, diag = Math.max(W, H);
    let enemyHalf = 0, alive = 0, dist = 0, grouped = 0, groupSamples = 0;
    for (const s of d.snapshots) {
      const cs = s.champions.filter((c) => c.team === me && c.alive && c.pos);
      for (const c of cs) {
        alive++;
        const dd = Math.max(Math.abs(c.pos[0] - sx), Math.abs(c.pos[1] - sy)); dist += dd / diag;
        // "Enemy half": closer to the enemy spawn than to our own.
        const de = Math.max(Math.abs(c.pos[0] - ex), Math.abs(c.pos[1] - ey));
        if (de < dd) enemyHalf++;
      }
      if (cs.length >= 2) {
        groupSamples++;
        let close = 0; for (const a of cs) if (cs.some((b) => b !== a && Math.max(Math.abs(a.pos[0] - b.pos[0]), Math.abs(a.pos[1] - b.pos[1])) <= 4)) close++;
        grouped += close / cs.length;
      }
    }
    if (alive) { agg.enemyHalfFrac.push(enemyHalf / alive); agg.spawnDist.push(dist / alive); }
    if (groupSamples) agg.groupedFrac.push(grouped / groupSamples);
  }
  if (flag('per-match')) perMatch.push({ file: r.file, map: r.map, opponent: r.opponent, kind: r.kind, won, rounds: m.finalRound, gems: [m.submittedGems[me], m.submittedGems[1 - me]], draft: myDraft, oppDraft: m.draft[1 - me], captures: caps.length, tributes: subs.length, kills: agg.kills.at(-1), deaths });
}

const mean = (a) => (a.length ? +(a.reduce((s, x) => s + x, 0) / a.length).toFixed(2) : null);
const top = (o, n = 8) => Object.fromEntries(Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n));
const summary = {
  dir, matches: agg.matches, winRate: +(agg.wins / Math.max(1, agg.matches)).toFixed(3), byMap: agg.byMap,
  draftPickRate: Object.fromEntries(Object.entries(agg.draft).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, +(v / agg.matches).toFixed(2)])),
  draftOrderTop: top(agg.draftOrder, 15),
  avgRounds: mean(agg.rounds), avgGemDiff: mean(agg.gemDiff),
  perGame: {
    captures: mean(agg.captures), firstCaptureRound: mean(agg.firstCapture), tributes: mean(agg.tributes), gemsPerTribute: mean(agg.gemsPerTribute),
    firstTributeRound: mean(agg.firstTribute), recalls: mean(agg.recalls), wards: mean(agg.wards), altarLocks: mean(agg.altarLocks), consumablesUsed: mean(agg.consumablesUsed),
    kills: mean(agg.kills), deaths: mean(agg.deaths), prioritySets: mean(agg.priorityChanges),
  },
  attackTargets: agg.attacks, campTargets: agg.campTargets,
  spatial: { enemyHalfFrac: mean(agg.enemyHalfFrac), meanSpawnDistFrac: mean(agg.spawnDist), groupedFrac: mean(agg.groupedFrac) },
  perChampion: Object.fromEntries(Object.entries(agg.perChampion).map(([t, c]) => [t, {
    games: c.games, topBuildOrders: top(c.buildOrders, 3), avgFinalItems: Object.fromEntries(Object.entries(c.finalItems).map(([k, v]) => [k, +(v / c.games).toFixed(1)])),
    abilities: top(c.abilities, 8), attacksPer100Rounds: mean(c.attacksPer100), killsPerGame: mean(c.kills), deathsPerGame: +(c.deaths / c.games).toFixed(2),
    gemsTributedPerGame: mean(c.gemsTributed), recallsPerGame: +(c.recalls / c.games).toFixed(2),
  }])),
  ...(flag('per-match') ? { perMatch } : {}),
};
const json = JSON.stringify(summary, null, 1);
if (opt('out')) fs.writeFileSync(opt('out'), json);
console.log(json);
