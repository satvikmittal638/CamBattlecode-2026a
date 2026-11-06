// Early captures (r<=TO) by our side: reward size class, camp types under the capturing tile region, helpers.
//   node campchoice.mjs <index.json> <set> [--to 150]
import fs from 'node:fs';
import { dumpReplay, CAMP_TYPES } from '../../tools/replay_dump.mjs';
const [idxFile, set] = process.argv.slice(2);
const TO = process.argv.includes('--to') ? +process.argv[process.argv.indexOf('--to') + 1] : 150;
const games = JSON.parse(fs.readFileSync(idxFile, 'utf8')).filter((g) => g.set === set);
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
const rectDist = (r, p) => Math.max(Math.max(r.minX - p.x, 0, p.x - r.maxX), Math.max(r.minY - p.y, 0, p.y - r.maxY));
const byType = {}; let n = 0, totalGold = 0, totalGems = 0, caps = 0, champsAt = 0, ownSide = 0;
for (const g of games) {
  let prev = null, campsAt0 = null, spawn = null;
  const seenRegion = new Set();
  await dumpReplay(g.file, { snapshots: 'none', mapInfo: true, onStart(s) { spawn = s.mapInfo.spawn; }, onStep(st) {
    if (st.round > TO) return;
    if (!campsAt0 && st.camps.length) campsAt0 = st.camps.map((c) => ({ type: CAMP_TYPES[c.type] ?? c.type, x: c.position.x, y: c.position.y }));
    if (prev && st.step.kind === 2) {
      const gainers = st.champions.filter((c) => { const b = prev.find((p) => p.id === c.entity.index); return b && c.team === g.us && (c.gems > b.gems || c.gold > b.gold); });
      if (gainers.length) {
        const c0 = gainers[0]; const key = `${st.round}:${c0.position.x},${c0.position.y}`;
        let gold = 0, gems = 0; for (const c of gainers) { const b = prev.find((p) => p.id === c.entity.index); gold += c.gold - b.gold; gems += c.gems - b.gems; }
        const types = [...new Set((campsAt0 || []).filter((k) => cheb(k, c0.position) <= 2).map((k) => k.type))].sort().join('+') || '?';
        const t = byType[types] ||= { n: 0, gold: 0, gems: 0 }; t.n++; t.gold += gold; t.gems += gems;
        caps++; totalGold += gold; totalGems += gems; champsAt += gainers.length;
        if (rectDist(spawn[g.us], c0.position) < rectDist(spawn[1 - g.us], c0.position)) ownSide++;
      }
    }
    prev = st.champions.map((c) => ({ id: c.entity.index, gems: c.gems, gold: c.gold }));
  } });
  n++;
}
console.log(`${set}: ${n} games, captures/game ${(caps / n).toFixed(1)}, gold/game ${(totalGold / n).toFixed(0)}, gems/game ${(totalGems / n).toFixed(0)}, champions sharing a capture ${(champsAt / caps).toFixed(2)}, own side ${(100 * ownSide / caps).toFixed(0)}%`);
console.log('  by camp types: ' + Object.entries(byType).sort((a, b) => b[1].n - a[1].n).slice(0, 8).map(([k, t]) => `${k} ${(t.n / n).toFixed(1)}/g (${(t.gold / t.n).toFixed(0)}$ ${(t.gems / t.n).toFixed(0)}g)`).join(', '));
