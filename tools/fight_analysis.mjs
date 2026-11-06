#!/usr/bin/env node
// Champion-vs-champion fight analysis for one team across its replays.
//
//   node tools/fight_analysis.mjs <teamDir> [--out summary.json] [--fights fights.jsonl]
//        [--map name] [--limit N] [--jobs 6]
//
// <teamDir> must contain index.json rows {file (relative to teamDir), side: a|b, map}
// (as written by tools/download_recent.mjs). "us" = that team, "them" = the opponent;
// every per-fight pair below is [us, them].
//
// A fight is a cluster of champion->enemy-champion attacks/casts (an AoE cast counts when an
// enemy stands within radius 1 of the impact tile). An event joins an open fight if it is
// within 3 rounds of the fight's last event and 8 tiles of its centroid.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { dumpReplay, CHAMPION_TYPES } from './replay_dump.mjs';

const SELF = fileURLToPath(import.meta.url);
const RANGED = new Set(['VesperVale', 'Cassi', 'Stellar', 'Prism', 'Willow', 'Tavi']);
const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
const P = (p) => (p ? [p.x, p.y] : null);
const rectCenter = (r) => [(r.minX + r.maxX) / 2, (r.minY + r.maxY) / 2];
const avg = (a) => { const v = a.filter((x) => x != null && !Number.isNaN(x)); return v.length ? +(v.reduce((s, x) => s + x, 0) / v.length).toFixed(3) : null; };
const hpf = (c) => c.health / Math.max(1, c.maxHealth);

export async function analyseReplay(file, me) {
  const them = 1 - me;
  const info = new Map();                 // champion id -> {team, type}
  let map = null;
  const fights = [], open = [];
  const lastHitOn = new Map();            // victim id -> {round, team, kind, loc}
  const channel = new Map();              // champion id -> {type, round}
  const campTiles = [];
  let prevRound = -1, roundStart = null, campsSeen = false;
  const deathsByCamp = [0, 0];
  const campDeathCtx = [[], []];          // per team: {afterChampFight, campHpAtEngage}
  const firstDamage = new Map();          // victim id -> round of first enemy-champion hit since last death/heal
  const ttk = [[], []];                   // kills by team: rounds from first hit to death
  const campEngage = new Map();           // champion id -> {round, hpf} when it last started hitting camps
  const champHitRound = new Map();        // champion id -> last round hit by an enemy champion
  let champDamageEvents = 0;

  const fightFor = (round, loc) => open.find((f) => round - f.lastRound <= 3 && cheb(loc, f.centroid) <= 8) || null;
  const zoneOf = (loc) => {
    const dOwn = cheb(loc, rectCenter(map.spawn[me])), dOpp = cheb(loc, rectCenter(map.spawn[them])), tot = Math.max(1, dOwn + dOpp);
    return dOwn / tot < 0.35 ? 'own' : dOpp / tot < 0.35 ? 'enemy' : 'mid';
  };
  const inBush = (p) => !!p && map.bushes[p[1] * map.width + p[0]] === 1;
  const nearAltar = (p) => map.altars.some((a) => cheb(a, p) <= 2);
  const nearCamp = (p) => campTiles.some((t) => cheb(t, p) <= 3);
  const inSpawn = (p, t) => { const r = map.spawn[t]; return p && p[0] >= r.minX - 1 && p[0] <= r.maxX + 1 && p[1] >= r.minY - 1 && p[1] <= r.maxY + 1; };

  function newFight(round, loc) {
    const f = {
      startRound: round, lastRound: round, centroid: loc.slice(), n: 0,
      zone: zoneOf(loc), nearAltar: nearAltar(loc), nearCamp: nearCamp(loc), atSpawn: inSpawn(loc, me) ? 'ours' : inSpawn(loc, them) ? 'theirs' : null,
      participants: [new Set(), new Set()], kills: [0, 0], gemsLost: [0, 0], hpLost: [0, 0],
      firstTeam: null, firstAction: null, firstTargetChannel: null, firstAttackerInBush: false, firstTargetGems: 0,
      abilities: [{}, {}], targetChoice: [[], []], dashes: [{ engage: 0, escape: 0 }, { engage: 0, escape: 0 }],
      support: [0, 0], recallHp: [[], []], lastActHp: [new Map(), new Map()], focus: new Map(), bushHits: [0, 0], hits: [0, 0],
      startState: (roundStart || []).filter((c) => c.alive).map((c) => ({ id: c.entity.index, team: c.team, hpf: hpf(c), gems: c.gems })),
    };
    open.push(f);
    return f;
  }

  function finalize(f) {
    const focus = [[], []];
    for (const { team, perTarget } of f.focus.values()) {
      const total = [...perTarget.values()].reduce((s, set) => s + set.size, 0);
      if (total >= 2) focus[team].push(Math.max(...[...perTarget.values()].map((s) => s.size)) / total);
    }
    const tc = (a) => (a.length ? { n: a.length, lowestHp: avg(a.map((x) => +x.lowestHp)), mostGems: avg(a.map((x) => +x.mostGems)), ranged: avg(a.map((x) => +x.ranged)) } : null);
    const start = (t) => avg(f.startState.filter((c) => c.team === t && f.participants[t].has(c.id)).map((c) => c.hpf));
    const carried = (t) => f.startState.filter((c) => c.team === t && f.participants[t].has(c.id)).reduce((s, c) => s + c.gems, 0);
    fights.push({
      startRound: f.startRound, duration: f.lastRound - f.startRound + 1, centroid: f.centroid.map(Math.round), zone: f.zone, atSpawn: f.atSpawn,
      nearAltar: f.nearAltar, nearCamp: f.nearCamp, size: [f.participants[me].size, f.participants[them].size],
      initiatedByUs: f.firstTeam === me, firstAction: f.firstAction, firstActor: f.firstActor, firstTargetChannel: f.firstTargetChannel, firstAttackerInBush: f.firstAttackerInBush, firstTargetGems: f.firstTargetGems,
      kills: [f.kills[me], f.kills[them]], gemsStolen: [f.gemsLost[them], f.gemsLost[me]], gemsCarried: [carried(me), carried(them)],
      hpLost: [Math.round(f.hpLost[me]), Math.round(f.hpLost[them])], startHp: [start(me), start(them)],
      abilities: [f.abilities[me], f.abilities[them]], dashes: [f.dashes[me], f.dashes[them]], support: [f.support[me], f.support[them]],
      focus: [avg(focus[me]), avg(focus[them])], targetChoice: [tc(f.targetChoice[me]), tc(f.targetChoice[them])],
      lastActHp: [avg([...f.lastActHp[me].values()]), avg([...f.lastActHp[them].values()])], recallHp: [avg(f.recallHp[me]), avg(f.recallHp[them])],
      bushHitFrac: [f.hits[me] ? +(f.bushHits[me] / f.hits[me]).toFixed(2) : null, f.hits[them] ? +(f.bushHits[them] / f.hits[them]).toFixed(2) : null],
      composition: [[...f.participants[me]].map((id) => info.get(id)?.type), [...f.participants[them]].map((id) => info.get(id)?.type)],
    });
  }
  const closeOld = (round) => { for (let i = open.length - 1; i >= 0; i--) if (round - open[i].lastRound > 3) { finalize(open[i]); open.splice(i, 1); } };

  const res = await dumpReplay(file, {
    snapshots: 'none', mapInfo: true,
    onStart({ mapInfo }) { map = mapInfo; },
    onStep(st, ev, prevChamps) {
      for (const c of st.champions) if (!info.has(c.entity.index)) info.set(c.entity.index, { team: c.team, type: CHAMPION_TYPES[c.type] });
      if (!campsSeen && st.camps.length) { for (const c of st.camps) campTiles.push([c.position.x, c.position.y]); campsSeen = true; }
      if (st.round !== prevRound) { roundStart = st.champions; prevRound = st.round; closeOld(st.round); }
      if (prevChamps) {
        for (const c of st.champions) {
          const b = prevChamps.find((x) => x.entity.index === c.entity.index);
          if (!b || !b.alive) continue;
          const drop = b.health - (c.alive ? c.health : 0);
          if (drop > 0.5) for (const f of open) if (f.participants[c.team].has(c.entity.index)) f.hpLost[c.team] += drop;
          if (!c.alive) {
            const hit = lastHitOn.get(c.entity.index);
            if (hit && hit.kind === 'champ' && st.round - hit.round <= 4) {
              const f = open.find((x) => x.participants[c.team].has(c.entity.index)) || (hit.loc && fightFor(st.round, hit.loc));
              if (f) { f.kills[hit.team]++; f.gemsLost[c.team] += b.gems; }
              const fd = firstDamage.get(c.entity.index); if (fd != null) ttk[hit.team].push(st.round - fd);
            } else {
              deathsByCamp[c.team]++;
              const ce = campEngage.get(c.entity.index), hr = champHitRound.get(c.entity.index);
              campDeathCtx[c.team].push({ afterChampFight: hr != null && st.round - hr <= 8, hpfAtEngage: ce ? +ce.hpf.toFixed(2) : null, roundsSinceEngage: ce ? st.round - ce.round : null });
            }
            firstDamage.delete(c.entity.index); campEngage.delete(c.entity.index);
            channel.delete(c.entity.index);
          }
        }
      }
      if (!ev || !ev.actor) return;
      if (ev.actor.kind === 2 && ev.kind === 'Attack' && ev.target?.kind === 'champion') { lastHitOn.set(ev.target.id, { round: st.round, kind: 'camp' }); return; }
      if (ev.actor.kind !== 1) return;
      const actorNow = st.champions.find((x) => x.entity.index === ev.actor.index);
      const actorBefore = prevChamps?.find((x) => x.entity.index === ev.actor.index);
      if (!actorNow) return;
      const team = actorNow.team, id = actorNow.entity.index;
      const apos = P(actorBefore?.position) || P(actorNow.position);
      if ((ev.kind === 'Attack' || ev.kind === 'Cast ability') && ev.target?.kind === 'camp') {
        const ce = campEngage.get(id);
        if (!ce || st.round - ce.round > 6) campEngage.set(id, { round: st.round, hpf: hpf(actorBefore || actorNow) });
        else ce.round = st.round;
      }
      if (ev.kind === 'Submit gems') channel.set(id, { type: 'tribute', round: st.round });
      if (ev.kind === 'Recall') {
        channel.set(id, { type: 'recall', round: st.round });
        for (const f of open) if (f.participants[team].has(id)) { f.recallHp[team].push(hpf(actorNow)); }
      }
      if (ev.kind === 'Gems submitted' || ev.kind === 'Cancel channel') channel.delete(id);
      if (ev.kind === 'Move' && channel.get(id)?.type === 'recall') channel.delete(id);
      if (ev.kind === 'Cast ability' && (ev.abilityType === 'Heal' || ev.abilityType === 'Shield')) {
        for (const f of open) if (f.participants[team].has(id)) { f.support[team]++; f.abilities[team][ev.abilityType] = (f.abilities[team][ev.abilityType] || 0) + 1; }
      }
      if (ev.kind === 'Cast ability' && ev.abilityType === 'Dash' && prevChamps && apos) {
        const enemies = prevChamps.filter((c) => c.alive && c.team !== team && c.position).map((c) => P(c.position));
        if (enemies.length) {
          const before = Math.min(...enemies.map((e) => cheb(e, apos))), after = Math.min(...enemies.map((e) => cheb(e, ev.to)));
          for (const f of open) if (f.participants[team].has(id) || cheb(apos, f.centroid) <= 8) f.dashes[team][after < before ? 'engage' : 'escape']++;
        }
      }
      let victims = [];
      if ((ev.kind === 'Attack' || ev.kind === 'Cast ability') && ev.target?.kind === 'champion' && ev.target.team !== team) victims = [ev.target.id];
      else if (ev.kind === 'Cast ability' && ev.abilityType === 'AoeDamage' && prevChamps) victims = prevChamps.filter((c) => c.alive && c.team !== team && c.position && cheb(P(c.position), ev.to) <= 1).map((c) => c.entity.index);
      if (!victims.length) return;
      champDamageEvents++;
      for (const vid of victims) {
        const vic = prevChamps?.find((x) => x.entity.index === vid);
        if (!vic) continue;
        const vpos = P(vic.position) || ev.to;
        const loc = apos ? [(apos[0] + vpos[0]) / 2, (apos[1] + vpos[1]) / 2] : vpos;
        let f = fightFor(st.round, loc);
        if (!f) {
          f = newFight(st.round, loc);
          f.firstTeam = team;
          f.firstAction = ev.kind === 'Attack' ? 'Attack' : `Cast:${ev.abilityType}`;
          f.firstActor = info.get(id)?.type;
          const ch = channel.get(vid);
          f.firstTargetChannel = ch ? ch.type : (vic.position && campTiles.some((t) => t[0] === vic.position.x && t[1] === vic.position.y) ? 'capture-tile' : null);
          f.firstAttackerInBush = inBush(apos);
          f.firstTargetGems = vic.gems;
        }
        f.n++; f.lastRound = st.round;
        f.centroid = [(f.centroid[0] * (f.n - 1) + loc[0]) / f.n, (f.centroid[1] * (f.n - 1) + loc[1]) / f.n];
        f.participants[team].add(id); f.participants[1 - team].add(vid);
        const key = ev.kind === 'Cast ability' ? ev.abilityType : 'Attack';
        f.abilities[team][key] = (f.abilities[team][key] || 0) + 1;
        f.hits[team]++; if (inBush(apos)) f.bushHits[team]++;
        f.lastActHp[team].set(id, hpf(actorBefore || actorNow));
        lastHitOn.set(vid, { round: st.round, team, kind: 'champ', loc: vpos });
        if (!firstDamage.has(vid) || st.round - (champHitRound.get(vid) ?? -99) > 6) firstDamage.set(vid, st.round);
        champHitRound.set(vid, st.round);
        const fk = `${st.round}:${team}`;
        if (!f.focus.has(fk)) f.focus.set(fk, { team, perTarget: new Map() });
        const pt = f.focus.get(fk).perTarget;
        if (!pt.has(vid)) pt.set(vid, new Set());
        pt.get(vid).add(id);
        if (apos && prevChamps) {
          const reach = ev.kind === 'Attack' ? (RANGED.has(info.get(id)?.type) ? 3 : 1) : 4;
          const cands = prevChamps.filter((c) => c.alive && c.team !== team && c.position && cheb(P(c.position), apos) <= reach);
          if (cands.length >= 2) {
            const minHp = Math.min(...cands.map((c) => c.health)), maxGems = Math.max(...cands.map((c) => c.gems));
            f.targetChoice[team].push({ lowestHp: vic.health <= minHp + 1, mostGems: maxGems > 0 && vic.gems >= maxGems, ranged: RANGED.has(info.get(vid)?.type) });
          }
        }
      }
    },
  });
  for (const f of open) finalize(f);
  const m = res.meta;
  return {
    file: m.file, map: null, width: m.width, height: m.height, rounds: m.finalRound,
    won: m.outcome === (me === 0 ? 'teamA' : 'teamB'), gems: [m.submittedGems[me], m.submittedGems[them]],
    draft: [m.draft[me], m.draft[them]], campDeaths: [deathsByCamp[me], deathsByCamp[them]], campDeathCtx: [campDeathCtx[me], campDeathCtx[them]], ttk: [ttk[me], ttk[them]],
    mapFeatures: { altars: m.mapInfo.altars.length, bushTiles: m.mapInfo.bushes.reduce((s, x) => s + x, 0), wallTiles: m.mapInfo.walls.reduce((s, x) => s + x, 0), symmetry: m.mapInfo.symmetry },
    fights,
  };
}

// ---------------------------------------------------------------- aggregation
function aggregate(games) {
  const fights = games.flatMap((g) => g.fights.map((f) => ({ ...f, map: g.map })));
  const R = games.reduce((s, g) => s + g.rounds, 0);
  const share = (pred, arr = fights) => (arr.length ? +(arr.filter(pred).length / arr.length).toFixed(2) : null);
  const sum = (fn, arr = fights) => arr.reduce((s, f) => s + fn(f), 0);
  const big = fights.filter((f) => f.kills[0] + f.kills[1] > 0 || f.duration >= 3);
  const abil = [{}, {}];
  for (const f of fights) for (const t of [0, 1]) for (const [k, v] of Object.entries(f.abilities[t])) abil[t][k] = (abil[t][k] || 0) + v;
  const per = (o) => Object.fromEntries(Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, +(v / Math.max(1, fights.length)).toFixed(2)]));
  const firstActs = {}; for (const f of fights.filter((x) => x.initiatedByUs)) firstActs[f.firstAction] = (firstActs[f.firstAction] || 0) + 1;
  const theirFirst = {}; for (const f of fights.filter((x) => !x.initiatedByUs)) theirFirst[f.firstAction] = (theirFirst[f.firstAction] || 0) + 1;
  const tcAvg = (t, k) => avg(fights.map((f) => f.targetChoice[t]?.[k]).filter((x) => x != null));
  const dash = [0, 1].map((t) => ({ engage: sum((f) => f.dashes[t].engage), escape: sum((f) => f.dashes[t].escape) }));
  const sizes = {}; for (const f of big) { const k = `${f.size[0]}v${f.size[1]}`; sizes[k] = (sizes[k] || 0) + 1; }
  return {
    games: games.length, winRate: +(games.filter((g) => g.won).length / Math.max(1, games.length)).toFixed(2),
    fights: fights.length, fightsPer100Rounds: +(100 * fights.length / Math.max(1, R)).toFixed(2), significantFights: big.length,
    initiatedByUs: share((f) => f.initiatedByUs),
    kills: [sum((f) => f.kills[0]), sum((f) => f.kills[1])], killsPerGame: [+(sum((f) => f.kills[0]) / games.length).toFixed(2), +(sum((f) => f.kills[1]) / games.length).toFixed(2)],
    campDeathsPerGame: [+(games.reduce((s, g) => s + g.campDeaths[0], 0) / games.length).toFixed(2), +(games.reduce((s, g) => s + g.campDeaths[1], 0) / games.length).toFixed(2)],
    fightWinRate: big.length ? +(big.filter((f) => f.kills[0] > f.kills[1] || (f.kills[0] === f.kills[1] && f.hpLost[1] > f.hpLost[0])).length / big.length).toFixed(2) : null,
    killTradeWhenWeInitiate: [sum((f) => f.kills[0], fights.filter((f) => f.initiatedByUs)), sum((f) => f.kills[1], fights.filter((f) => f.initiatedByUs))],
    killTradeWhenTheyInitiate: [sum((f) => f.kills[0], fights.filter((f) => !f.initiatedByUs)), sum((f) => f.kills[1], fights.filter((f) => !f.initiatedByUs))],
    gemsStolenPerGame: [+(sum((f) => f.gemsStolen[0]) / games.length).toFixed(1), +(sum((f) => f.gemsStolen[1]) / games.length).toFixed(1)],
    hpTraded: [sum((f) => f.hpLost[0]), sum((f) => f.hpLost[1])],
    avgDuration: avg(fights.map((f) => f.duration)), avgSize: [avg(fights.map((f) => f.size[0])), avg(fights.map((f) => f.size[1]))], sizeDist: sizes,
    zone: { own: share((f) => f.zone === 'own'), mid: share((f) => f.zone === 'mid'), enemy: share((f) => f.zone === 'enemy') },
    atOurSpawn: share((f) => f.atSpawn === 'ours'), atTheirSpawn: share((f) => f.atSpawn === 'theirs'),
    nearAltar: share((f) => f.nearAltar), nearCamp: share((f) => f.nearCamp),
    weInitiateOnChannel: share((f) => !!f.firstTargetChannel, fights.filter((f) => f.initiatedByUs)),
    channelTypesWhenWeInitiate: Object.fromEntries(['tribute', 'recall', 'capture-tile'].map((k) => [k, fights.filter((f) => f.initiatedByUs && f.firstTargetChannel === k).length])),
    weInitiateOnCarrier: share((f) => f.firstTargetGems > 0, fights.filter((f) => f.initiatedByUs)), avgFirstTargetGemsWhenWeInitiate: avg(fights.filter((f) => f.initiatedByUs).map((f) => f.firstTargetGems)),
    weInitiateFromBush: share((f) => f.firstAttackerInBush, fights.filter((f) => f.initiatedByUs)), bushHitFrac: [avg(fights.map((f) => f.bushHitFrac[0])), avg(fights.map((f) => f.bushHitFrac[1]))],
    firstActionsWhenWeInitiate: firstActs, firstActionsWhenTheyInitiate: theirFirst,
    startHpWhenWeInitiate: [avg(fights.filter((f) => f.initiatedByUs).map((f) => f.startHp[0])), avg(fights.filter((f) => f.initiatedByUs).map((f) => f.startHp[1]))],
    abilitiesPerFight: [per(abil[0]), per(abil[1])], supportPerFight: [avg(fights.map((f) => f.support[0])), avg(fights.map((f) => f.support[1]))],
    dashes: dash, focus: [avg(fights.map((f) => f.focus[0])), avg(fights.map((f) => f.focus[1]))],
    targetChoice: [0, 1].map((t) => ({ lowestHp: tcAvg(t, 'lowestHp'), mostGems: tcAvg(t, 'mostGems'), ranged: tcAvg(t, 'ranged') })),
    openerTypeWhenWeInitiate: count(fights.filter((f) => f.initiatedByUs).map((f) => `${f.firstActor}:${f.firstAction}`), 8),
    killConversionWhenWeInitiateOnRecall: (() => { const a = fights.filter((f) => f.initiatedByUs && f.firstTargetChannel === 'recall'); return a.length ? +(a.filter((f) => f.kills[0] > 0).length / a.length).toFixed(2) : null; })(),
    killConversionWhenWeInitiate: share((f) => f.kills[0] > 0, fights.filter((f) => f.initiatedByUs)),
    timeToKillRounds: [avg(games.flatMap((g) => g.ttk[0])), avg(games.flatMap((g) => g.ttk[1]))],
    campDeathContext: [0, 1].map((t) => { const a = games.flatMap((g) => g.campDeathCtx[t]); return { n: a.length, afterChampFight: a.length ? +(a.filter((x) => x.afterChampFight).length / a.length).toFixed(2) : null, hpfAtEngage: avg(a.map((x) => x.hpfAtEngage)), lowHpEngage: a.length ? +(a.filter((x) => x.hpfAtEngage != null && x.hpfAtEngage < 0.5).length / a.length).toFixed(2) : null }; }),
    lastActHp: [avg(fights.map((f) => f.lastActHp[0])), avg(fights.map((f) => f.lastActHp[1]))], recallHpInFight: [avg(fights.map((f) => f.recallHp[0])), avg(fights.map((f) => f.recallHp[1]))],
  };
}

// ---------------------------------------------------------------- CLI
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };

if (args[0] === '--worker') {
  // node fight_analysis.mjs --worker <jobs.json> <out.jsonl>
  const jobs = JSON.parse(fs.readFileSync(args[1], 'utf8'));
  for (const j of jobs) {
    try {
      const r = await analyseReplay(j.path, j.side === 'b' ? 1 : 0);
      r.map = j.map; r.opponent = j.opponent; r.kind = j.kind; r.createdAt = j.createdAt;
      fs.appendFileSync(args[2], JSON.stringify(r) + '\n');
    } catch (e) { fs.appendFileSync(args[2], JSON.stringify({ file: j.path, error: e.message }) + '\n'); }
  }
  process.exit(0);
} else if (process.argv[1] && path.resolve(process.argv[1]) === SELF) {
  const dir = args[0];
  if (!dir) { console.error('usage: fight_analysis.mjs <teamDir> [--out f.json] [--fights f.jsonl] [--map m] [--limit N] [--jobs N]'); process.exit(2); }
  let rows = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'));
  if (opt('map')) rows = rows.filter((r) => r.map === opt('map'));
  rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  if (opt('limit')) rows = rows.slice(0, Number(opt('limit')));
  rows = rows.map((r) => ({ ...r, path: path.join(dir, r.file) })).filter((r) => fs.existsSync(r.path));
  const jobsN = Math.min(Number(opt('jobs', Math.max(2, os.cpus().length - 2))), rows.length || 1);
  const tmp = path.join(dir, '.fight_work'); fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp, { recursive: true });
  const chunks = Array.from({ length: jobsN }, () => []);
  rows.forEach((r, i) => chunks[i % jobsN].push(r));
  await Promise.all(chunks.map((c, i) => new Promise((res) => {
    const jf = path.join(tmp, `jobs${i}.json`); fs.writeFileSync(jf, JSON.stringify(c));
    spawn(process.execPath, [SELF, '--worker', jf, path.join(tmp, `out${i}.jsonl`)], { stdio: 'inherit' }).on('exit', res);
  })));
  const games = [];
  for (let i = 0; i < jobsN; i++) {
    const f = path.join(tmp, `out${i}.jsonl`);
    if (!fs.existsSync(f)) continue;
    for (const line of fs.readFileSync(f, 'utf8').split('\n')) if (line.trim()) { const g = JSON.parse(line); if (g.error) console.error('skip', g.file, g.error); else games.push(g); }
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  const byMap = {};
  for (const g of games) (byMap[g.map] ??= []).push(g);
  const summary = { dir, overall: aggregate(games), byMap: Object.fromEntries(Object.entries(byMap).sort().map(([m, gs]) => [m, { ...aggregate(gs), mapFeatures: gs[0].mapFeatures, size: `${gs[0].width}x${gs[0].height}`, drafts: count(gs.map((g) => (g.draft[0] || []).join('/'))) }])) };
  if (opt('fights')) fs.writeFileSync(opt('fights'), games.map((g) => JSON.stringify({ file: g.file, map: g.map, opponent: g.opponent, won: g.won, gems: g.gems, draft: g.draft, fights: g.fights })).join('\n') + '\n');
  const json = JSON.stringify(summary, null, 1);
  if (opt('out')) fs.writeFileSync(opt('out'), json);
  console.log(JSON.stringify(summary.overall, null, 1));
}
function count(a, n = 1e9) { const o = {}; for (const x of a) o[x] = (o[x] || 0) + 1; return Object.fromEntries(Object.entries(o).sort((x, y) => y[1] - x[1]).slice(0, n)); }
