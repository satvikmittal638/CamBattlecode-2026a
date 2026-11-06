// Context of recalls that are not recall-captures.
import path from 'node:path';
import { dumpReplay, loadIndex, loadMap, cheb } from './lib.mjs';
const N = +(process.argv[2] || 20), from = +(process.argv[3] || 0), verbose = process.argv[4] === 'v';
const rows = loadIndex().slice(from, from + N);
const stats = { enemyVisible: 0, noEnemy: 0, campFight: 0, afterFight: 0, total: 0 };
const ctx = {};
for (const r of rows) {
  const d = await dumpReplay(r.path, { snapshots: 'round' });
  const M = loadMap(r.map);
  const me = r.side === 'b' ? 1 : 0;
  const ids = d.meta.finalChampions.filter((c) => c.team === me).map((c) => c.id);
  const byRound = new Map(); for (const s of d.snapshots) if (!byRound.has(s.round)) byRound.set(s.round, s);
  for (const id of ids) {
    const evs = d.events.filter((e) => e.actor?.kind === 1 && e.actor.index === id);
    for (const rec of evs.filter((e) => e.kind === 'Recall')) {
      const s = byRound.get(rec.round); const c = s.champions.find((x) => x.id === id);
      // capture tie: gold/gems increase within next 6 rounds while alive
      let tied = false; for (let k = 1; k <= 6; k++) { const s2 = byRound.get(rec.round + k); const c2 = s2?.champions.find((x) => x.id === id); if (c2 && (c2.gems > c.gems || c2.gold > c.gold)) tied = true; }
      if (tied) continue;
      stats.total++;
      const enemy = s.champions.filter((x) => x.team !== me && x.alive && x.pos).map((x) => cheb(x.pos, c.pos));
      const minE = enemy.length ? Math.min(...enemy) : 99;
      const recentChampAtk = evs.some((e) => e.kind === 'Attack' && e.target?.kind === 'champion' && e.round >= rec.round - 5 && e.round <= rec.round);
      const recentCampAtk = evs.some((e) => e.kind === 'Attack' && e.target?.kind === 'camp' && e.round >= rec.round - 3 && e.round <= rec.round);
      const prev = byRound.get(rec.round - 3)?.champions.find((x) => x.id === id);
      const key = (minE <= 8 ? 'enemy<=8' : 'noEnemy') + (recentChampAtk ? '+fought' : '') + (recentCampAtk ? '+campAtk' : '');
      (ctx[key] ??= []).push(+(c.hp / c.maxHp).toFixed(2));
      if (verbose) {
        const ent = c.pos && M.altars.map((a) => cheb(a, c.pos));
        console.log(`${r.map} r${rec.round} ${c.type} hp${c.hp}/${c.maxHp} (${(c.hp / c.maxHp).toFixed(2)}) hp-3r:${prev?.hp} g${c.gold} gem${c.gems} minEnemy=${minE} ${key}`);
      }
    }
  }
}
for (const [k, v] of Object.entries(ctx)) { v.sort((a, b) => a - b); console.log(k, v.length, 'median', v[Math.floor(v.length / 2)], 'p90', v[Math.floor(v.length * 0.9)], 'max', v.at(-1)); }
