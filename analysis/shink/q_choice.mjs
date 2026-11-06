// Target-choice study: each time a champion starts attacking a new camp group, compare the chosen
// group with the alternatives alive at the decision time under several scoring hypotheses.
//   node analysis/shink/q_choice.mjs <dir> [--recent N] [--team name] [--side a|b] [--map m] [--examples K]
import { dumpReplay } from '../../tools/replay_dump.mjs';
import { listRows, campGroups } from './lib.mjs';
import { loadMap } from './mapinfo.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const rows = listRows(args[0], { recent: +opt('recent', 30), side: opt('side'), teamName: opt('team', 'Agentic Loop Builders'), map: opt('map') });
const EX = +opt('examples', 0);
const maps = {};
async function grid(name) {
  if (!maps[name]) { const m = await loadMap(`workspace/maps/${name}.map26a`); maps[name] = m; }
  return maps[name];
}
function bfs(m, src) {
  const { W, H, grid } = m; const D = new Int32Array(W * H).fill(-1);
  const q = [src[0] + src[1] * W]; D[q[0]] = 0;
  for (let h = 0; h < q.length; h++) {
    const i = q[h], x = i % W, y = (i / W) | 0;
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      const nx = x + dx, ny = y + dy; if (!dx && !dy) continue;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const j = nx + ny * W; if (D[j] >= 0) continue;
      const c = grid[ny][nx]; if (c === '#' || c === 'o' || c === 'A') continue;
      D[j] = D[i] + 1; q.push(j);
    }
  }
  return D;
}
const HP = { Wolf: 1350, Elk: 2400, GemCluster: 500, GoldCluster: 500, Monolith: 20000 };
const hyps = {
  nearest: (c) => -c.dist,
  gemsPerDist: (c) => c.gems / (c.dist + 5),
  gemsPerTime: (c) => c.gems / (c.dist + c.hp / 80 + 1),
  gemsPerTimeAltar: (c) => c.gems / (c.dist + c.hp / 80 + c.altarDist + 1),
  valPerTime: (c) => (c.gems + c.gold / 4) / (c.dist + c.hp / 80 + 1),
  valPerTimeAltar: (c) => (c.gems + c.gold / 4) / (c.dist + c.hp / 80 + c.altarDist + 1),
  gemsOnlyPerTimeAltar: (c) => (c.gems > 0 ? c.gems : -1e9 + c.gems) / (c.dist + c.hp / 80 + c.altarDist + 1),
};
const score = Object.fromEntries(Object.keys(hyps).map((k) => [k, { top1: 0, rankSum: 0 }]));
let n = 0, examples = 0;
const decisions = [];
const chosenStats = { dist: [], rank: [] };
for (const r of rows) {
  const d = await dumpReplay(r.path, { snapshots: 'round' });
  const m = await grid(r.map);
  const snaps = d.snapshots.filter((s) => s.champions.length);
  const s0 = snaps.find((s) => s.champions.every((c) => c.pos));
  const { groups } = campGroups(s0);
  const groupOfCamp = new Map(); groups.forEach((g) => g.camps.forEach((c) => groupOfCamp.set(c, g)));
  const altars = []; m.grid.forEach((row, y) => row.forEach((ch, x) => ch === 'A' && altars.push([x, y])));
  // altar distance per group (BFS from altar neighbourhood)
  const aD = new Map();
  const altarFields = altars.map((a) => { const g2 = m.grid.map((row) => row.slice()); g2[a[1]][a[0]] = '.'; return bfs({ ...m, grid: g2 }, a); });
  for (const g of groups) aD.set(g.id, Math.min(...altarFields.map((F) => Math.min(...g.tiles.map((t) => F[t[0] + t[1] * m.W])))) - 1);
  const espawn = s0.champions.filter((c) => c.team !== r.me).map((c) => c.pos);
  const ospawn = s0.champions.filter((c) => c.team === r.me).map((c) => c.pos);
  const ED = bfs(m, espawn[0]), OD = bfs(m, ospawn[0]);
  const gDist = (F, G) => { let dd = 1e9; for (const t of G.tiles) for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) { const x = t[0] + dx, y = t[1] + dy; if (x < 0 || y < 0 || x >= m.W || y >= m.H) continue; const v = F[x + y * m.W]; if (v >= 0) dd = Math.min(dd, v); } return dd; };
  const snapAt = new Map(); for (const s of snaps) if (!snapAt.has(s.round)) snapAt.set(s.round, s);
  const myIds = s0.champions.filter((c) => c.team === r.me).map((c) => c.id);
  for (const id of myIds) {
    const atk = d.events.filter((e) => e.kind === 'Attack' && e.actor?.kind === 1 && e.actor.index === id && e.target?.kind === 'camp');
    let cur = null, lastAtkRound = 0;
    for (const e of atk) {
      const g = groupOfCamp.get(e.target.id); if (!g || g === cur) { lastAtkRound = e.round; continue; }
      // decision round: latest of previous attack round, last capture/tribute/respawn before e.round
      let dr = lastAtkRound;
      for (let rr = e.round - 1; rr > dr; rr--) {
        const a = snapAt.get(rr), b = snapAt.get(rr + 1); if (!a || !b) continue;
        const ca = a.champions.find((c) => c.id === id), cb = b.champions.find((c) => c.id === id);
        if (!ca || !cb) continue;
        if ((ca.gems > 0 && cb.gems === 0 && cb.alive) || (!ca.alive && cb.alive) || (cb.gems > ca.gems)) { dr = rr + 1; break; }
      }
      cur = g; lastAtkRound = e.round;
      const s = snapAt.get(dr) || snapAt.get(e.round); const me = s.champions.find((c) => c.id === id);
      if (!me?.pos || !me.alive) continue;
      const D = bfs(m, me.pos);
      const cands = [];
      for (const G of groups) {
        const alive = G.camps.map((cid) => s.camps.find((c) => c.id === cid)).filter((c) => c && c.hp > 0 && c.pos[0] >= 0);
        if (!alive.length && G !== g) continue;
        let dist = 1e9; for (const t of G.tiles) for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) { const x = t[0] + dx, y = t[1] + dy; if (x < 0 || y < 0 || x >= m.W || y >= m.H) continue; const v = D[x + y * m.W]; if (v >= 0) dist = Math.min(dist, v); }
        const hp = alive.reduce((s2, c) => s2 + c.hp, 0) || G.camps.length * 500;
        const claimed = d.events.some((e2) => e2.kind === 'Attack' && e2.actor?.kind === 1 && e2.actor.index !== id && myIds.includes(e2.actor.index) && e2.round >= dr - 3 && e2.round <= dr && e2.target?.kind === 'camp' && G.camps.includes(e2.target.id));
        cands.push({ G, dist, eDist: gDist(ED, G), oDist: gDist(OD, G), gems: G.gems, gold: G.gold, hp, altarDist: aD.get(G.id), label: G.label, chosen: G === g, claimed, elk: (G.types.Elk || 0), mono: (G.types.Monolith || 0) });
      }
      if (cands.length < 2) continue;
      n++;
      decisions.push({ map: r.map, opening: dr <= 1, champ: s0.champions.find((c) => c.id === id).type, cands: cands.map(({ G, ...c }) => ({ ...c, center: G.center.map(Math.round) })) });
      const ch = cands.find((c) => c.chosen); chosenStats.dist.push(ch.dist);
      for (const [k, f] of Object.entries(hyps)) {
        const sorted = [...cands].sort((a, b) => f(b) - f(a));
        const rank = sorted.indexOf(ch); score[k].rankSum += rank; if (rank === 0) score[k].top1++;
      }
      if (examples < EX) {
        examples++;
        const sorted = [...cands].sort((a, b) => a.dist - b.dist).slice(0, 6);
        console.log(`${r.map} ${s0.champions.find((c) => c.id === id).type} r${dr}->${e.round} at ${me.pos} hp${Math.round(100 * me.hp / me.maxHp)} chose ${g.label}@${g.center.map(Math.round)} d${ch.dist} | ` + sorted.map((c) => `${c.chosen ? '*' : ''}${c.label}@${c.G.center.map(Math.round)} d${c.dist} a${c.altarDist} hp${c.hp}`).join(', '));
      }
    }
  }
}
console.log('decisions', n);
for (const [k, v] of Object.entries(score)) console.log(k.padEnd(22), 'top1', (v.top1 / n).toFixed(3), 'meanRank', (v.rankSum / n).toFixed(2));

// Grid search over a parametric family.
let best = [];
for (const k of [100, 200, 400, 1e9]) for (const c of [0, 3, 6, 10]) for (const ce of [0.3, 0.5, 0.7, 0.85]) for (const p of [0.7, 1, 1.5, 2]) for (const gemOnly of [0, 1]) {
  let top1 = 0; const byChamp = {};
  for (const D of decisions) {
    const f = (x) => (x.mono || x.claimed || (gemOnly && x.gems === 0) ? -1 : (x.gems * (x.elk ? 1 - ce : 1)) / Math.pow(x.dist + x.hp / k + c + 1, p));
    let bi = 0, bs = -1e18; D.cands.forEach((x, i) => { const v = f(x); if (v > bs) { bs = v; bi = i; } });
    const o = (byChamp[D.champ] ??= [0, 0]); o[1]++;
    if (D.cands[bi].chosen) { top1++; o[0]++; }
  }
  best.push({ k, c, ce, p, gemOnly, acc: +(top1 / decisions.length).toFixed(3), byChamp: Object.entries(byChamp).map(([a, [x, y]]) => `${a}:${(x / y).toFixed(2)}`).join(' ') });
}
best.sort((a, b) => b.acc - a.acc);
console.log(best.slice(0, 10).map((b) => JSON.stringify(b)).join('\n'));
{
  const o = {}; let tot = 0;
  for (const D of decisions) { const ch = D.cands.find((c) => c.chosen); const k = `${D.map}:${ch.claimed ? 'claimed' : 'free'}`; o[k] = (o[k] || 0) + 1; tot++; }
  const byElk = {}; for (const D of decisions) { const ch = D.cands.find((c) => c.chosen); const k = `${ch.elk ? 'elk' : 'noelk'}:${ch.claimed ? 'claimed' : 'free'}`; byElk[k] = (byElk[k] || 0) + 1; }
  console.log(JSON.stringify(o)); console.log(JSON.stringify(byElk));
}
if (opt('openings')) {
  // Opening decisions only: print chosen + top-5 by fitted score
  const f = (x) => (x.mono || x.gems === 0 ? -1 : (x.gems * (x.elk ? 0.5 : 1)) / (x.dist + x.hp / 200 + 6));
  const seen = new Set();
  for (const D of decisions.filter((D) => D.opening)) {
    const k = D.map + D.champ; if (seen.has(k)) continue; seen.add(k);
    const ch = D.cands.find((c) => c.chosen);
    const s = [...D.cands].sort((a, b) => f(b) - f(a)).slice(0, 5);
    console.log(D.map.padEnd(9), D.champ.padEnd(8), 'chose', `${ch.label}@${ch.center} d${ch.dist} s${f(ch).toFixed(2)}`, '| top', s.map((c) => `${c.chosen ? '*' : ''}${c.label}@${c.center} d${c.dist} s${f(c).toFixed(2)}`).join(', '));
  }
}

{
  // contested-bonus grid: w = 1 + a * clamp(1 - (eDist - oDist)/K, 0, 1)
  const res = [];
  for (const a of [0, 0.5, 1, 2, 4]) for (const K of [5, 10, 20, 40]) for (const c of [3, 6, 10]) for (const ce of [0.3, 0.5, 0.7]) {
    let t1 = 0, t1o = 0, no = 0;
    for (const D of decisions) {
      const f = (x) => (x.mono || x.claimed || x.gems === 0 ? -1 : (x.gems * (x.elk ? 1 - ce : 1) * (1 + a * Math.min(1, Math.max(0, 1 - (x.eDist - x.oDist) / K)))) / (x.dist + x.hp / 200 + c));
      let bi = 0, bs = -1e18; D.cands.forEach((x, i) => { const v = f(x); if (v > bs) { bs = v; bi = i; } });
      if (D.cands[bi].chosen) { t1++; if (D.opening) t1o++; }
      if (D.opening) no++;
    }
    res.push({ a, K, c, ce, acc: +(t1 / decisions.length).toFixed(3), openAcc: +(t1o / no).toFixed(3) });
  }
  res.sort((x, y) => y.acc - x.acc); console.log('contested grid by acc'); res.slice(0, 6).forEach((x) => console.log(JSON.stringify(x)));
  res.sort((x, y) => y.openAcc - x.openAcc); console.log('contested grid by openAcc'); res.slice(0, 6).forEach((x) => console.log(JSON.stringify(x)));
}
