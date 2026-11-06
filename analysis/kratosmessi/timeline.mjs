#!/usr/bin/env node
// Print a compact per-champion timeline for one replay (one side).
//   node analysis/kratosmessi/timeline.mjs <replay> <side a|b> <map> [--champ Varg] [--until 300]
import { dumpReplay } from '../../tools/replay_dump.mjs';
import { loadMap, groupAt, groupNear, cheb } from './lib.mjs';

const [file, sideArg, mapName] = process.argv.slice(2);
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const me = sideArg === 'b' ? 1 : 0;
const m = loadMap(mapName);
const d = await dumpReplay(file, { snapshots: 'round' });
const until = +opt('until', 99999);
const onlyChamp = opt('champ');
const myIds = d.meta.finalChampions.filter((c) => c.team === me).map((c) => c.id);
const typeOf = Object.fromEntries(d.meta.finalChampions.map((c) => [c.id, c.type]));
const snapBy = new Map(); for (const s of d.snapshots) if (!snapBy.has(s.round)) snapBy.set(s.round, s);
console.log('map', mapName, 'size', m.w, m.h, 'spawn', m.spawnC[me].map((x) => x.toFixed(0)).join(','), 'draft', d.meta.draft[me].join(','), 'vs', d.meta.draft[1 - me].join(','), 'result', d.meta.outcome, d.meta.submittedGems.join('-'));
const gname = (g) => (g < 0 ? '-' : `g${g}(${m.groups[g].types.replace('Cluster', '')}@${m.groups[g].c.map((x) => x.toFixed(0)).join(',')} d${m.groups[g].dist[me].toFixed(0)})`);
for (const id of myIds) {
  if (onlyChamp && typeOf[id] !== onlyChamp) continue;
  const line = [];
  let lastG = -2, attackingChamp = 0, lastR = -1;
  let prevGems = 0, prevGold = 0, prevAlive = true;
  for (const s of d.snapshots) {
    if (s.round > until) break;
    const c = s.champions.find((x) => x.id === id); if (!c) continue;
    if (c.alive && c.gems > prevGems) line.push(`r${s.round}+${c.gems - prevGems}gem@${gname(groupNear(m, c.pos, 1))}`);
    prevGems = c.gems; prevAlive = c.alive;
  }
  for (const e of d.events) {
    if (e.round > until) break;
    if (e.actor?.kind !== 1 || e.actor.index !== id) continue;
    const s = snapBy.get(e.round); const c = s?.champions.find((x) => x.id === id);
    if (e.kind === 'Attack' && e.target?.kind === 'camp') { const g = groupAt(m, e.to); if (g !== lastG) { line.push(`r${e.round} atk ${gname(g)}`); lastG = g; } }
    else if (e.kind === 'Attack' && e.target?.kind === 'champion') { if (e.round - lastR > 3) line.push(`r${e.round} FIGHT ${e.target.type} hp${c?.hp}/${c?.maxHp}`); lastR = e.round; lastG = -2; }
    else if (e.kind === 'Submit gems') line.push(`r${e.round} TRIB ${e.gemsCarried} @${e.to} d${cheb(e.to, m.spawnC[me])}`);
    else if (e.kind === 'Recall') line.push(`r${e.round} RECALL hp${c ? (c.hp / c.maxHp).toFixed(2) : '?'} gold${c?.gold} gems${c?.gems}`);
    else if (e.kind === 'Shop') line.push(`r${e.round} SHOP ${Object.entries(e.items || {}).map(([k, v]) => `${k.replace(' Shard of ', ':').replace(' Emblem of ', '*')}${v > 0 ? '+' : ''}${v}`).join(',')} g${e.goldAfter}`);
    else if (e.kind === 'Place altar lock') line.push(`r${e.round} ALTARLOCK @${e.to}`);
    else if (e.kind === 'Cast ability' && e.target?.kind === 'champion' && e.target.team !== me) line.push(`r${e.round} cast ${e.abilityType}->${e.target.type}`);
  }
  for (const e of d.events) if (e.kind === 'Respawn' && e.actor?.kind === 1 && e.actor.index === id && e.round <= until) line.push(`r${e.round} DIED(respawn evt)`);
  line.sort((a, b) => +a.match(/^r(\d+)/)[1] - +b.match(/^r(\d+)/)[1]);
  console.log(`\n### ${typeOf[id]} (id ${id})\n` + line.join('\n'));
}
