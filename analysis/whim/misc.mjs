// Misc rules: recall-capture conditions, lock-before-tribute, dash context, shield context, ability targets.
import { dumpReplay, loadIndex, loadMap, cheb, bfs, spawnTiles } from './lib.mjs';
const N = +(process.argv[2] || 40);
const rows = loadIndex().slice(0, N);
const rc = {}; const inc = (o, k, y) => { (o[k] ??= { n: 0, y: 0 }); o[k].n++; if (y) o[k].y++; };
const lockStats = { tribWithLockHeld: 0, tribLockPlaced: 0, tribNoLock: 0 };
const dash = { enemyNear: 0, noEnemy: 0, towardTarget: 0 };
const shield = { campAdj: 0, enemyNear: 0, neither: 0, dmgTakenPrev: 0 };
const ryth = { campHitsWhenAoe: [], enemyCount: [] };
const afterTrib = {};
for (const r of rows) {
  const d = await dumpReplay(r.path, { snapshots: 'round' });
  const M = loadMap(r.map); const me = r.side === 'b' ? 1 : 0;
  const sp = spawnTiles(M, me); const df = bfs(M, sp, { blockCamps: false });
  const byRound = new Map(); for (const s of d.snapshots) if (!byRound.has(s.round)) byRound.set(s.round, s);
  const ids = d.meta.finalChampions.filter((c) => c.team === me).map((c) => c.id);
  for (const id of ids) {
    const evs = d.events.filter((e) => e.actor?.kind === 1 && e.actor.index === id);
    const recR = evs.filter((e) => e.kind === 'Recall').map((e) => e.round);
    let prev = null;
    for (const s of d.snapshots) {
      const c = s.champions.find((x) => x.id === id); if (!c) continue;
      if (prev && c.alive && prev.alive && (c.gems > prev.gems || c.gold > prev.gold) && c.gold - prev.gold !== 50) {
        if (c.gold >= 150) {
          const isRc = recR.some((x) => x <= s.round && x >= s.round - 6);
          const sd = c.pos ? df(c.pos[0], c.pos[1]) : -1;
          inc(rc, 'gems' + (c.gems >= 40 ? '>=40' : '<40'), isRc);
          inc(rc, 'spawnDist' + (sd < 15 ? '<15' : sd < 30 ? '15-30' : '30+'), isRc);
          inc(rc, 'hp' + (c.hp / c.maxHp < 0.9 ? '<0.9' : '>=0.9'), isRc);
          inc(rc, 'gold' + (c.gold >= 300 ? '300+' : c.gold >= 200 ? '200-299' : '150-199'), isRc);
          inc(rc, 'combo gems' + (c.gems >= 40 ? '>=40' : '<40') + ' hp' + (c.hp / c.maxHp < 0.9 ? '<0.9' : '>=0.9'), isRc);
        }
      }
      prev = c;
    }
    // tribute & lock
    const subs = evs.filter((e) => e.kind === 'Submit gems');
    for (const e of subs) {
      const s = byRound.get(e.round); const c = s?.champions.find((x) => x.id === id);
      const placed = evs.some((x) => x.kind === 'Place altar lock' && Math.abs(x.round - e.round) <= 1);
      if (placed) lockStats.tribLockPlaced++; else if (c && c.consumables && c.consumables['2']) lockStats.tribWithLockHeld++; else lockStats.tribNoLock++;
      // what next after tribute
      const nx = evs.find((x) => x.round > e.round + 1 && (x.kind === 'Recall' || ((x.kind === 'Attack' || x.kind === 'Cast ability') && x.target?.kind === 'camp')));
      const k = (c?.gold >= 150 ? 'gold>=150' : 'gold<150') + ':' + (nx ? (nx.kind === 'Recall' ? 'recall' : 'camp') : 'none');
      afterTrib[k] = (afterTrib[k] || 0) + 1;
    }
    for (const e of evs.filter((x) => x.kind === 'Cast ability')) {
      const s = byRound.get(e.round); const c = s?.champions.find((x) => x.id === id); if (!c?.pos) continue;
      const enNear = s.champions.some((x) => x.team !== me && x.alive && x.pos && cheb(x.pos, c.pos) <= 4);
      if (e.abilityType === 'Dash') { if (enNear) dash.enemyNear++; else dash.noEnemy++; }
      if (e.abilityType === 'Shield') {
        const campAdj = s.camps.some((k) => k.hp > 0 && cheb(k.pos, c.pos) <= 3);
        if (enNear) shield.enemyNear++; else if (campAdj) shield.campAdj++; else shield.neither++;
        const p = byRound.get(e.round - 1)?.champions.find((x) => x.id === id); if (p && p.hp > c.hp) shield.dmgTakenPrev++;
      }
      if (e.abilityType === 'AoeDamage') { const t = e.to; ryth.campHitsWhenAoe.push(s.camps.filter((k) => k.hp > 0 && cheb(k.pos, t) <= 1).length); ryth.enemyCount.push(s.champions.filter((x) => x.team !== me && x.alive && x.pos && cheb(x.pos, t) <= 1).length); }
    }
  }
}
const fmt = (o) => Object.fromEntries(Object.entries(o).sort().map(([k, v]) => [k, `${v.y}/${v.n} = ${(v.y / v.n).toFixed(2)}`]));
console.log('recall-capture | gold>=150 after capture:', fmt(rc));
console.log('locks at tribute:', lockStats);
console.log('after tribute:', afterTrib);
console.log('dash context:', dash, 'shield context:', shield);
const h = (a) => { const o = {}; for (const x of a) o[x] = (o[x] || 0) + 1; return o; };
console.log('ryth aoe: camps hit', h(ryth.campHitsWhenAoe), 'enemies hit', h(ryth.enemyCount));
