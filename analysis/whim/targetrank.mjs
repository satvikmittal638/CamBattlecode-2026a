// How does the chosen next camp group rank by path distance among alive groups at decision time?
//   node analysis/whim/targetrank.mjs whim N | <dir> <side> <map>
import fs from 'node:fs'; import path from 'node:path';
import { dumpReplay, loadIndex, loadMap, cheb, bfs } from './lib.mjs';
const a = process.argv.slice(2);
let rows;
if (a[0] === 'whim') rows = loadIndex().slice(0, +(a[1] || 20));
else { const files = []; const walk = (d) => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (f.endsWith('.repl26a')) files.push(p); } }; walk(a[0]); rows = files.map((p) => ({ path: p, side: a[1] || 'a', map: a[2] })); }
const rankH = {}, chosenLabel = {}, skipped = {}, teammateSame = { same: 0, diff: 0 };
for (const r of rows) {
  const d = await dumpReplay(r.path, { snapshots: 'round' });
  const M = loadMap(r.map); const me = r.side === 'b' ? 1 : 0;
  const campGroup = {}; for (const c of d.snapshots[1].camps) campGroup[c.id] = M.campAt.get(c.pos.join(','));
  const byRound = new Map(); for (const s of d.snapshots) if (!byRound.has(s.round)) byRound.set(s.round, s);
  const ids = d.meta.finalChampions.filter((c) => c.team === me).map((c) => c.id);
  const groupAlive = (s, g) => M.groups[g].camps.every((cc) => { const k = s.camps.find((x) => x.pos[0] === cc.x && x.pos[1] === cc.y); return k && k.hp > 0; });
  // per champion: list of (round, group) of first attack on each new group
  const seqs = {};
  for (const id of ids) {
    const evs = d.events.filter((e) => e.actor?.kind === 1 && e.actor.index === id);
    let cur = null, lastEnd = 0; const seq = [];
    for (const e of evs) {
      if ((e.kind === 'Attack' || e.kind === 'Cast ability') && e.target?.kind === 'camp') { const g = campGroup[e.target.id]; if (g !== cur) { seq.push({ g, r: e.round, from: lastEnd }); cur = g; } lastEnd = e.round; }
      else if (['Gems submitted', 'Shop', 'Submit gems'].includes(e.kind)) { lastEnd = e.round; cur = null; }
    }
    seqs[id] = seq;
  }
  for (const id of ids) for (const st of seqs[id]) {
    const dr = Math.max(1, st.from); const s = byRound.get(dr); if (!s) continue; const c = s.champions.find((x) => x.id === id); if (!c?.pos || !c.alive) continue;
    const df = bfs(M, [c.pos], { blockCamps: true });
    const cands = M.groups.filter((g) => g.label !== 'M1' && !g.label.includes('M') && groupAlive(s, g.id)).map((g) => { let best = 1e9; for (const cc of g.camps) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const x = cc.x + dx, y = cc.y + dy; if (x >= 0 && y >= 0 && x < M.W && y < M.H) { const v = df(x, y); if (v >= 0 && v < best) best = v; } } return { g: g.id, d: best, label: g.label }; }).sort((x, y) => x.d - y.d);
    const rank = cands.findIndex((x) => x.g === st.g);
    rankH[rank < 0 ? 'notAliveAtDecision' : rank > 4 ? '5+' : rank] = (rankH[rank < 0 ? 'notAliveAtDecision' : rank > 4 ? '5+' : rank] || 0) + 1;
    chosenLabel[M.groups[st.g].label] = (chosenLabel[M.groups[st.g].label] || 0) + 1;
    if (rank > 0) for (const x of cands.slice(0, rank)) skipped[x.label] = (skipped[x.label] || 0) + 1;
  }
}
console.log('rank of chosen group by distance among alive groups:', rankH);
console.log('chosen labels:', chosenLabel);
console.log('closer groups that were skipped (labels):', skipped);
