// Per-game features for both teams of games against Fish / Mite (or any opponent).
//   node features.mjs <index.json> <out.jsonl> [--shard i/n]
// index entries: { set, file (absolute), us (0|1), map, side, result, score, oppScore, opp }
// Output: one JSON line per game with feats.us / feats.them.
import fs from 'node:fs';
import { dumpReplay, CHAMPION_TYPES } from '../../tools/replay_dump.mjs';

const args = process.argv.slice(2);
const [idxFile, outFile] = args;
const sh = args.includes('--shard') ? args[args.indexOf('--shard') + 1].split('/').map(Number) : [0, 1];
const games = JSON.parse(fs.readFileSync(idxFile, 'utf8')).filter((_, i) => i % sh[1] === sh[0]);
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
const rectDist = (r, p) => Math.max(Math.max(r.minX - p.x, 0, p.x - r.maxX), Math.max(r.minY - p.y, 0, p.y - r.maxY));
const BUCKETS = [100, 200, 300, 500, 800, 2001];
const bucket = (r) => BUCKETS.findIndex((b) => r <= b);

const done = new Set(fs.existsSync(outFile) ? fs.readFileSync(outFile, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l).file) : []);
for (const g of games) {
  if (done.has(g.file)) continue;
  const T = [0, 1].map(() => ({
    draft: [], capGems: BUCKETS.map(() => 0), capGold: 0, caps: 0, firstGemCap: null, deaths: BUCKETS.map(() => 0), bagLost: 0, bigBagDeaths: 0,
    banks: 0, bankGems: 0, bankMax: 0, locks: 0, wards: 0, recalls: 0, campHits: 0, champHits: 0,
    near: 0, alone: 0, nPos: 0, cluster: 0, nClu: 0, enemyHalf: 0, nHalf: 0, midGems: 0, score: {},
    deathsAlone: 0, deathsOutnum: 0, killsOutnum: 0, carryPeak: 0,
  }));
  let spawn = null, prev = null, lastRound = -1, rounds = 0;
  const lastBank = [0, 0];
  try {
    await dumpReplay(g.file, {
      snapshots: 'none', mapInfo: true,
      onStart(s) { spawn = s.mapInfo.spawn; },
      onStep(st, ev) {
        rounds = st.round;
        if (ev && ev.actor?.kind === 1 && ev.team !== undefined && T[ev.team]) {
          const t = T[ev.team];
          if (ev.kind === 'Place altar lock') t.locks++;
          if (ev.kind === 'Place ward') t.wards++;
          if (ev.kind === 'Recall') t.recalls++;
          if ((ev.kind === 'Attack' || ev.kind === 'Cast ability') && ev.target?.kind === 'camp') t.campHits++;
          if ((ev.kind === 'Attack' || ev.kind === 'Cast ability') && ev.target?.kind === 'champion') t.champHits++;
        }
        for (const team of [0, 1]) {
          const d = st.submittedGems[team] - lastBank[team];
          if (d > 0) { T[team].banks++; T[team].bankGems += d; T[team].bankMax = Math.max(T[team].bankMax, d); }
          lastBank[team] = st.submittedGems[team];
        }
        if (prev && st.step.kind === 2) {
          for (const ch of st.champions) {
            const b = prev.champions.find((p) => p.entity.index === ch.entity.index);
            if (!b || !ch.position || ch.gems <= b.gems) continue;
            const t = T[ch.team], gems = ch.gems - b.gems;
            t.capGems[bucket(st.round)] += gems; t.caps++;
            if (t.firstGemCap === null) t.firstGemCap = st.round;
            const m = rectDist(spawn[ch.team], ch.position) - rectDist(spawn[1 - ch.team], ch.position);
            if (Math.abs(m) < 2 && st.round <= 300) t.midGems += gems;
          }
        }
        if (prev) for (const ch of st.champions) {
          const b = prev.champions.find((p) => p.entity.index === ch.entity.index);
          if (!b || !b.alive || ch.alive || !b.position) continue;
          const t = T[ch.team];
          t.deaths[bucket(st.round)]++; t.bagLost += b.gems; if (b.gems >= 30) t.bigBagDeaths++;
          const allies = prev.champions.filter((o) => o.team === ch.team && o.alive && o.position && o.entity.index !== ch.entity.index && cheb(o.position, b.position) <= 6).length;
          const enemies = prev.champions.filter((o) => o.team !== ch.team && o.alive && o.position && cheb(o.position, b.position) <= 6).length;
          if (allies === 0) t.deathsAlone++;
          if (enemies > allies + 1) { t.deathsOutnum++; T[1 - ch.team].killsOutnum++; }
        }
        if (st.round !== lastRound) {
          lastRound = st.round;
          for (const team of [0, 1]) {
            const t = T[team];
            if (!t.draft.length && st.champions.length) t.draft = st.champions.filter((c) => c.team === team).map((c) => CHAMPION_TYPES[c.type]);
            for (const c of st.champions) if (c.team === team) t.carryPeak = Math.max(t.carryPeak, c.gems);
            if ([100, 200, 300, 500].includes(st.round)) t.score[st.round] = st.submittedGems[team] + st.champions.filter((c) => c.team === team).reduce((a, c) => a + c.gems, 0);
            if (st.round < 20 || st.round > 300 || st.round % 5) continue;
            const live = st.champions.filter((c) => c.team === team && c.alive && c.position);
            for (const p of live) {
              if (live.length > 1) { const d = Math.min(...live.filter((q) => q !== p).map((q) => cheb(p.position, q.position))); t.near += d; t.nPos++; if (d > 4) t.alone++; }
              t.nHalf++; if (rectDist(spawn[1 - team], p.position) < rectDist(spawn[team], p.position)) t.enemyHalf++;
            }
            if (live.length) { t.cluster += Math.max(...live.map((p) => live.filter((q) => cheb(p.position, q.position) <= 3).length)) / live.length; t.nClu++; }
          }
        }
        prev = st;
      },
    });
  } catch (e) { console.error(g.file, e.message); continue; }
  const fin = (t) => ({
    draft: t.draft, capGems: t.capGems, campGems: t.capGems.reduce((a, b) => a + b, 0), caps: t.caps, firstGemCap: t.firstGemCap, midGems300: t.midGems,
    deaths: t.deaths, deathsTotal: t.deaths.reduce((a, b) => a + b, 0), bagLost: t.bagLost, bigBagDeaths: t.bigBagDeaths, deathsAlone: t.deathsAlone, deathsOutnum: t.deathsOutnum, killsOutnum: t.killsOutnum,
    banks: t.banks, bankMean: t.banks ? t.bankGems / t.banks : 0, bankMax: t.bankMax, carryPeak: t.carryPeak, locks: t.locks, wards: t.wards, recalls: t.recalls, campHits: t.campHits, champHits: t.champHits,
    nearMate: t.nPos ? t.near / t.nPos : null, alone: t.nPos ? t.alone / t.nPos : null, clusterShare: t.nClu ? t.cluster / t.nClu : null, enemyHalf: t.nHalf ? t.enemyHalf / t.nHalf : null, score: t.score,
  });
  fs.appendFileSync(outFile, JSON.stringify({ ...g, rounds, feats: { us: fin(T[g.us]), them: fin(T[1 - g.us]) } }) + '\n');
}
