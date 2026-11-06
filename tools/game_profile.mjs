#!/usr/bin/env node
// Per-game profile of both sides for a games dir (index.json rows with file, side = our side):
// tributed gems at checkpoints, kills / deaths, gems carried away by deaths, capture gems/gold,
// net worth (gold + 30/shard) at checkpoints, first capture/tribute round, time dead share.
//   node tools/game_profile.mjs <gamesDir> [--out rows.jsonl]
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay, ITEM_NAMES } from './replay_dump.mjs';
const args = process.argv.slice(2);
const dir = args[0];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const rows = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'));
const CK = [150, 300, 500, 800, 1200];
const shards = (it) => it.reduce((s, n, i) => s + n * (ITEM_NAMES[i].includes('Emblem') ? (ITEM_NAMES[i].startsWith('Power') ? 6 : 5) : 1), 0);
const out = [];
for (const r of rows) {
  const us = r.side === 'b' ? 1 : 0;
  const P = [0, 1].map(() => ({ kills: 0, deaths: 0, gemsLostOnDeath: 0, capGems: 0, capGold: 0, captures: 0, trib: {}, worth: {}, firstCap: null, firstTrib: null, deadTurns: 0, turns: 0, tributes: 0, recalls: 0 }));
  let lastRound = -1;
  await dumpReplay(path.join(dir, r.file), { snapshots: 'none', onStep(st, ev, prev) {
    if (st.round !== lastRound) {
      lastRound = st.round;
      for (const c of st.champions) { P[c.team].turns++; if (!c.alive) P[c.team].deadTurns++; }
      if (CK.includes(st.round)) for (const t of [0, 1]) {
        P[t].trib[st.round] = st.submittedGems[t];
        P[t].worth[st.round] = st.champions.filter((c) => c.team === t).reduce((s, c) => s + c.gold + 30 * shards(c.items), 0);
      }
    }
    if (!prev) return;
    for (const c of st.champions) {
      const b = prev.find((x) => x.entity.index === c.entity.index); if (!b) continue;
      if (b.alive && !c.alive) { P[c.team].deaths++; P[c.team].gemsLostOnDeath += b.gems; }
      if (c.kills > b.kills) P[c.team].kills += c.kills - b.kills;
    }
    if (ev && ev.kind === 'Capture') {
      const T = ev.team; let any = false;
      for (const c of st.champions) { const b = prev.find((x) => x.entity.index === c.entity.index); if (!b || c.team !== T) continue; const dg = c.gems - b.gems, dd = c.gold - b.gold; if (dg > 0 || dd > 0) { P[T].capGems += Math.max(0, dg); P[T].capGold += Math.max(0, dd); any = true; } }
      if (any) { P[T].captures++; if (P[T].firstCap === null) P[T].firstCap = st.round; }
    }
    if (ev && ev.kind === 'Gems submitted') { const t = ev.team; P[t].tributes++; if (P[t].firstTrib === null) P[t].firstTrib = st.round; }
    if (ev && ev.kind === 'Recall') P[ev.team].recalls++;
  } });
  const f = (p) => ({ ...p, deadShare: +(p.deadTurns / Math.max(1, p.turns)).toFixed(3) });
  out.push({ matchId: r.matchId, map: r.map, opponent: r.opponent, result: r.result, score: r.score, oppScore: r.oppScore, rounds: r.rounds, us: f(P[us]), them: f(P[1 - us]), oppDraft: r.oppDraft, myDraft: r.myDraft });
}
if (opt('out')) fs.writeFileSync(opt('out'), out.map((x) => JSON.stringify(x)).join('\n') + '\n');
const avg = (S, g) => (S.length ? S.reduce((q, x) => q + g(x), 0) / S.length : NaN);
for (const res of ['win', 'loss']) {
  const S = out.filter((x) => x.result === res && !/contest|boss/.test(x.map));
  if (!S.length) continue;
  console.log(`== ${res} (${S.length} games, boss maps excluded): us | them`);
  for (const [lab, g] of [['kills', (p) => p.kills], ['deaths', (p) => p.deaths], ['gems lost on death', (p) => p.gemsLostOnDeath], ['captures', (p) => p.captures], ['capture gems', (p) => p.capGems], ['capture gold', (p) => p.capGold],
    ['dead share', (p) => p.deadShare], ['tributes', (p) => p.tributes], ['recalls', (p) => p.recalls], ['first capture', (p) => p.firstCap ?? 0], ['tributed@300', (p) => p.trib[300] ?? 0], ['tributed@800', (p) => p.trib[800] ?? p.trib[500] ?? 0], ['worth@300', (p) => p.worth[300] ?? 0], ['worth@800', (p) => p.worth[800] ?? 0]])
    console.log(`  ${lab.padEnd(20)} ${avg(S, (x) => g(x.us)).toFixed(1).padStart(8)} | ${avg(S, (x) => g(x.them)).toFixed(1).padStart(8)}`);
}
