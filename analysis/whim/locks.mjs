import { dumpReplay, loadIndex, loadMap, cheb, bfs, spawnTiles } from './lib.mjs';
const N = +(process.argv[2] || 30);
const rows = loadIndex().slice(0, N);
const C = {}; const inc = (k) => { C[k] = (C[k] || 0) + 1; };
const samples = [];
for (const r of rows) {
  const d = await dumpReplay(r.path, { snapshots: 'round' });
  const M = loadMap(r.map); const me = r.side === 'b' ? 1 : 0;
  const dMe = bfs(M, spawnTiles(M, me), { blockCamps: false }), dEn = bfs(M, spawnTiles(M, 1 - me), { blockCamps: false });
  const byRound = new Map(); for (const s of d.snapshots) if (!byRound.has(s.round)) byRound.set(s.round, s);
  const ids = new Set(d.meta.finalChampions.filter((c) => c.team === me).map((c) => c.id));
  const enIds = new Set(d.meta.finalChampions.filter((c) => c.team !== me).map((c) => c.id));
  for (const e of d.events.filter((x) => x.kind === 'Place altar lock' && ids.has(x.actor?.index))) {
    const alt = e.to; const s = byRound.get(e.round); const c = s.champions.find((x) => x.id === e.actor.index);
    const sameTrib = d.events.some((x) => x.kind === 'Submit gems' && x.actor?.index === e.actor.index && Math.abs(x.round - e.round) <= 1);
    const side = dMe(alt[0] + 1, alt[1]) < dEn(alt[0] + 1, alt[1]) ? 'ownSide' : 'enemySide';
    // was an enemy seen tributing at this altar previously
    const enemyUsedBefore = d.events.some((x) => x.kind === 'Submit gems' && enIds.has(x.actor?.index) && x.round < e.round && cheb(x.to, alt) === 0);
    // did an enemy try to tribute at it within the next 30 rounds
    const enemyAfter = d.events.some((x) => x.kind === 'Submit gems' && enIds.has(x.actor?.index) && x.round > e.round && x.round < e.round + 30 && cheb(x.to, alt) === 0);
    const enVisible = s.champions.filter((x) => x.team !== me && x.alive && x.pos && cheb(x.pos, c.pos) <= 8).length;
    inc(`${sameTrib ? 'withOwnTribute' : 'noTribute'} ${side} enemyUsedBefore=${enemyUsedBefore} enVis=${enVisible > 0}`);
    if (samples.length < 25) samples.push(`${r.map} r${e.round} ${c.type} alt=${alt} gems=${c.gems} ${sameTrib ? 'TRIB' : ''} ${side} enemyUsedBefore=${enemyUsedBefore} enemyAfter=${enemyAfter} enVis=${enVisible} lockedAltarsAlready?`);
  }
}
console.log(C); console.log(samples.join('\n'));
