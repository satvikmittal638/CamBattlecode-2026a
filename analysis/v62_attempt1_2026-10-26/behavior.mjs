// Behavioural glitch scan of our champions in every attempt-1 replay (engine 2.0.0, tools/replay_dump.mjs):
//   idle      alive, not stunned, not channelling (recall 5 turns, tribute until "Gems submitted", teleport 3), off our
//             spawn, and no action of any kind that round (move/attack/cast/shop/ward/recall/submit/...);
//   spawnIdle alive on our own spawn at full HP with no action;
//   oscillation 10-round windows with <= 2 distinct tiles, >= 4 moves, no attack or cast;
//   blocked   "Movement blocked" steps; recalls started vs arrivals on spawn; gold carried (unspent).
// Writes behavior.json (per game + per episode) and prints totals.   node behavior.mjs [--limit N]
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';

const dir = import.meta.dirname;
const args = process.argv.slice(2);
const limit = args.includes('--limit') ? +args[args.indexOf('--limit') + 1] : 1e9;
const index = JSON.parse(fs.readFileSync(path.join(dir, 'games/index.json'), 'utf8')).slice(0, limit);
const ACTIONS = new Set(['Move', 'Attack', 'Cast ability', 'Recall', 'Submit gems', 'Shop', 'Place ward', 'Consumable', 'Cancel channel',
  'Teleport channel', 'Movement blocked', 'Place altar lock', 'Sell item']);
const out = [];
const inRect = (p, r) => p && p[0] >= r.minX && p[0] <= r.maxX && p[1] >= r.minY && p[1] <= r.maxY;

for (const g of index) {
  let d;
  try { d = await dumpReplay(path.join(dir, 'games', g.file), { snapshots: 'round', mapInfo: true }); }
  catch (e) { out.push({ matchId: g.matchId, error: e.message }); continue; }
  const team = g.side === "a" ? 0 : 1, spawn = d.meta.mapInfo.spawn[team];
  const ours = d.meta.finalChampions.filter((c) => c.team === team).map((c) => c.id);
  const acted = new Map(), channel = new Map(), counts = { blocked: 0, recalls: 0, cancels: 0 };
  const key = (id, r) => id + ':' + r;
  for (const e of d.events) {
    if (e.actor?.kind !== 1 || !ours.includes(e.actor.index)) continue;
    const id = e.actor.index;
    if (ACTIONS.has(e.kind)) acted.set(key(id, e.round), (acted.get(key(id, e.round)) || '') + e.kind[0]);
    if (e.kind === 'Movement blocked') counts.blocked++;
    if (e.kind === 'Recall') { counts.recalls++; for (let r = e.round; r <= e.round + 5; r++) channel.set(key(id, r), 'R'); }
    if (e.kind === 'Teleport channel') for (let r = e.round; r <= e.round + 3; r++) channel.set(key(id, r), 'T');
    if (e.kind === 'Cancel channel') counts.cancels++;
    if (e.kind === 'Submit gems') {
      const done = d.events.find((x) => x.kind === 'Gems submitted' && x.actor?.index === id && x.round >= e.round);
      for (let r = e.round; r <= (done ? done.round : e.round + 12); r++) channel.set(key(id, r), 'S');
    }
  }
  // Camp spawn tiles: every camp position seen in the first round that has camps (camps never move).
  const campTiles = new Set();
  for (const s of d.snapshots) { if (s.camps.length) { for (const c of s.camps) campTiles.add(c.pos.join(',')); if (s.round > 1) break; } }
  const nearCamp = (p) => { if (!p) return false; for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) if (campTiles.has((p[0] + dx) + ',' + (p[1] + dy))) return true; return false; };
  const per = {};
  for (const id of ours) per[id] = { idleCamp: 0, idleNearCamp: 0, idleEnemy: 0, idleOther: 0, idle: 0, idleRun: 0, maxIdleRun: 0, spawnIdle: 0, alive: 0, goldSum: 0, arrivals: 0, episodes: [] };
  const hist = new Map(ours.map((id) => [id, []]));
  let prev = null;
  for (const s of d.snapshots) {
    const live = new Set(s.camps.filter((x) => x.hp > 0).map((x) => x.pos.join(',')));
    const nearLive = (p) => { if (!p) return false; for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) if (live.has((p[0] + dx) + ',' + (p[1] + dy))) return true; return false; };
    for (const c of s.champions) {
      if (!ours.includes(c.id)) continue;
      const p = per[c.id], k = key(c.id, s.round), did = acted.get(k);
      if (!c.alive) { p.idleRun = 0; continue; }
      p.alive++; p.goldSum += c.gold;
      const before = prev?.champions.find((x) => x.id === c.id);
      if (before?.alive && !inRect(before.pos, spawn) && inRect(c.pos, spawn)) p.arrivals++;
      const onSpawn = inRect(c.pos, spawn), busy = c.stunned || channel.has(k);
      if (!did && !busy && !onSpawn) {
        p.idle++; p.idleRun++;
        const enemyNear = s.champions.some((o) => o.team !== team && o.alive && o.pos && c.pos && Math.max(Math.abs(o.pos[0] - c.pos[0]), Math.abs(o.pos[1] - c.pos[1])) <= 8);
        if (campTiles.has(c.pos?.join(','))) p.idleCamp++; else if (nearLive(c.pos)) { p.idleNearLive = (p.idleNearLive || 0) + 1; p.nlRun = (p.nlRun || 0) + 1; if (p.nlRun === 6) p.episodes.push({ kind: 'idleNearLiveCamp', round: s.round - 5, pos: c.pos, hp: c.hp, maxHp: c.maxHp, type: c.type, enemyNear }); } else if (nearCamp(c.pos)) p.idleNearCamp++; else if (enemyNear) p.idleEnemy++; else { p.idleOther++; p.otherRun = (p.otherRun || 0) + 1; if (p.otherRun === 8) p.episodes.push({ kind: 'idleOther', round: s.round - 7, pos: c.pos, hp: c.hp, maxHp: c.maxHp, gems: c.gems, type: c.type }); }
        if (p.idleRun === 8) p.episodes.push({ kind: 'idle', round: s.round - 7, pos: c.pos, hp: c.hp, maxHp: c.maxHp, gems: c.gems, type: c.type });
      } else p.idleRun = 0;
      if (did || busy || onSpawn || campTiles.has(c.pos?.join(',')) || nearCamp(c.pos)) p.otherRun = 0;
      if (did || busy || onSpawn || !nearLive(c.pos)) p.nlRun = 0;
      p.maxIdleRun = Math.max(p.maxIdleRun, p.idleRun);
      if (!did && onSpawn && c.hp >= c.maxHp) p.spawnIdle++;
      const h = hist.get(c.id);
      h.push({ r: s.round, pos: c.pos?.join(','), mv: (did || '').includes('M'), fight: /[AC]/.test(did || '') });
      if (h.length > 10) h.shift();
      if (h.length === 10 && new Set(h.map((x) => x.pos)).size <= 2 && h.filter((x) => x.mv).length >= 4 && !h.some((x) => x.fight)) {
        const last = p.episodes.at(-1);
        if (!(last?.kind === 'oscillation' && s.round - last.round < 10)) p.episodes.push({ kind: 'oscillation', round: s.round - 9, pos: c.pos, type: c.type, gems: c.gems });
      }
    }
    prev = s;
  }
  const champs = Object.entries(per).map(([id, p]) => ({ id: +id, type: d.meta.finalChampions.find((c) => c.id === +id)?.type, idle: p.idle, idleCamp: p.idleCamp, idleNearLive: p.idleNearLive || 0, idleNearCamp: p.idleNearCamp, idleEnemy: p.idleEnemy, idleOther: p.idleOther, maxIdleRun: p.maxIdleRun,
    spawnIdle: p.spawnIdle, alive: p.alive, meanGold: Math.round(p.goldSum / Math.max(1, p.alive)), arrivals: p.arrivals, episodes: p.episodes }));
  out.push({ matchId: g.matchId, pool: g.pool, map: g.map, result: g.result, margin: g.score - g.oppScore, rounds: d.meta.finalRound, ...counts, champs });
  if (out.length % 25 === 0) console.log(out.length, '/', index.length);
}
fs.writeFileSync(path.join(dir, 'behavior.json'), JSON.stringify(out));
const ok = out.filter((x) => !x.error), all = ok.flatMap((x) => x.champs);
const sum = (f) => all.reduce((a, c) => a + f(c), 0);
console.log(`games ${ok.length} (errors ${out.length - ok.length}); champion-rounds alive ${sum((c) => c.alive)}`);
console.log(`idle rounds ${sum((c) => c.idle)} (${(100 * sum((c) => c.idle) / sum((c) => c.alive)).toFixed(2)}% of alive), idle episodes >=8 rounds ${sum((c) => c.episodes.filter((e) => e.kind === 'idle').length)}`);
console.log(`idle split: on camp tile ${sum((c) => c.idleCamp)}, next to a LIVE camp unit ${sum((c) => c.idleNearLive)} (episodes >=6 ${sum((c) => c.episodes.filter((e) => e.kind === 'idleNearLiveCamp').length)}), next to empty camp tiles ${sum((c) => c.idleNearCamp)}, enemy within 8 ${sum((c) => c.idleEnemy)}, other ${sum((c) => c.idleOther)} (episodes >=8 ${sum((c) => c.episodes.filter((e) => e.kind === 'idleOther').length)})`);
console.log(`spawn idle at full HP ${sum((c) => c.spawnIdle)} rounds; oscillation episodes ${sum((c) => c.episodes.filter((e) => e.kind === 'oscillation').length)}`);
console.log(`movement blocked ${ok.reduce((a, x) => a + x.blocked, 0)}, recalls ${ok.reduce((a, x) => a + x.recalls, 0)}, arrivals ${sum((c) => c.arrivals)}, cancels ${ok.reduce((a, x) => a + x.cancels, 0)}`);
console.log(`max idle run: ${Math.max(...all.map((c) => c.maxIdleRun))}; mean unspent gold ${Math.round(sum((c) => c.meanGold * c.alive) / sum((c) => c.alive))}`);
