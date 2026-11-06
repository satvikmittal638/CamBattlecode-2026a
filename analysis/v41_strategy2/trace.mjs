// Focused event windows. For each requested case prints, per round, the focus champion's HP/stun/gems, its own
// actions, enemy Attack/Cast steps that resolve onto it (casts are coordinate-resolved: NOT proof of visibility),
// and the actual inventories (stat shard-equivalents: Power emblem=6, Bruiser=5+1+1, other emblems 5 + passive)
// of the focus champion and of every enemy that hit it, with gold spent (30/shard, 150/emblem).
//   node analysis/v41_strategy2/trace.mjs <index.json> <label> <ourDeath|enemyDeathByUs> <minRound> [wonOnly]
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay, STEP_KINDS, CHAMPION_TYPES, ITEM_NAMES } from '../../tools/replay_dump.mjs';
const [idxFile, label, mode, minR, wonOnly, notMap] = process.argv.slice(2);  // wonOnly: 'won'|'any'; notMap: map name to exclude
// NOTE: inventories/state are read at the FIRST step of the death round, not at the exact lethal step.
const idx = JSON.parse(fs.readFileSync(idxFile, 'utf8')).sort((a, b) => a.createdAt.localeCompare(b.createdAt)).filter((x) => x.label === label && (wonOnly !== 'won' || x.result === 'win') && (!notMap || x.map !== notMap));
const FAM = ['Monster', 'Power', 'Durability', 'Treasure', 'Jungle', 'Home', 'Bruiser'];
const inv = (c) => { const s = { str: 0, foc: 0, hp: 0 }; const pas = []; let gold = 0; const ST = ['str', 'foc', 'hp'];
  c.items.forEach((n, i) => { if (!n) return; const fam = Math.floor(i / 6), stat = ST[Math.floor((i % 6) / 2)], emblem = i % 2 === 1;
    if (!emblem) { s[stat] += n; gold += 30 * n; } else { gold += 150 * n; if (FAM[fam] === 'Power') s[stat] += 6 * n; else if (FAM[fam] === 'Bruiser') { s[stat] += 5 * n; for (const o of ST) if (o !== stat) s[o] += n; } else { s[stat] += 5 * n; pas.push(FAM[fam]); } } });
  const names = c.items.map((n, i) => n ? `${n}x${ITEM_NAMES[i].replace(' of ', ' ').replace('Emblem', 'Emb').replace('Shard', 'Sh')}` : null).filter(Boolean).join(', ');
  return `stat-eq str ${s.str} foc ${s.foc} hp ${s.hp}; passives [${[...new Set(pas)].join(',')}]; spent ${gold}g; items: ${names}`; };
for (const g of idx) {
  const file = path.join(path.dirname(idxFile), g.file); const us = g.side === 'a' ? 0 : 1; let found = null;
  await dumpReplay(file, { snapshots: 'none', onStep(x, ev, prev) { if (found || !prev || x.round < +minR) return;
    const K = [0, 0]; for (const c of x.champions) { const b = prev.find((y) => y.entity.index === c.entity.index); if (b && c.kills > b.kills) K[c.team] += c.kills - b.kills; }
    for (const c of x.champions) { const b = prev.find((y) => y.entity.index === c.entity.index); if (!b || !(b.alive && !c.alive)) continue;
      const deaths = x.champions.filter((y) => y.team === c.team && !y.alive && prev.find((z) => z.entity.index === y.entity.index)?.alive).length;
      if (mode === 'ourDeath' && c.team === us && K[1 - us] >= deaths) found = { id: c.entity.index, round: x.round };
      if (mode === 'enemyDeathByUs' && c.team !== us && K[us] >= deaths) found = { id: c.entity.index, round: x.round };
      if (found) break; } } });
  if (!found) continue;
  const lines = new Map(); let invLine = '', hitters = new Set(), deathState = null;
  await dumpReplay(file, { snapshots: 'none', onStep(x, ev, prev) { if (x.round < found.round - 6 || x.round > found.round) return;
    const L = lines.get(x.round) || { st: null, acts: [] }; lines.set(x.round, L); const v = x.champions.find((c) => c.entity.index === found.id);
    if (!L.st && v) L.st = `${v.alive ? Math.round(100 * v.health / v.maxHealth) + '%' : 'dead'}${v.stunned ? ' STUN' : ''} g${v.gems}${v.position ? ' @' + v.position.x + ',' + v.position.y : ''}`;
    if (ev && ev.actor.kind === 1) { const a = x.champions.find((c) => c.entity.index === ev.actor.index); if (!a) return;
      const onFocus = ev.target && ev.target.kind === 'champion' && ev.target.id === found.id;
      if (a.entity.index === found.id && ['Attack', 'Cast ability', 'Move', 'Recall', 'Submit gems', 'Shop'].includes(ev.kind)) L.acts.push(`self ${ev.kind === 'Cast ability' ? 'cast ' + ev.abilityType : ev.kind}${ev.target ? '->' + (ev.target.kind === 'champion' ? (ev.target.team === a.team ? 'ally ' : 'enemy ') + ev.target.type : 'camp') : ''}`);
      else if (onFocus && a.team !== v?.team) { hitters.add(a.entity.index); L.acts.push(`${CHAMPION_TYPES[a.type]}#${a.entity.index} ${ev.kind === 'Cast ability' ? 'cast ' + ev.abilityType + ' (coord-resolved)' : 'basic Attack'}`); } }
    if (x.round === found.round && !deathState) { deathState = x; } } });
  const v = deathState.champions.find((c) => c.entity.index === found.id);
  console.log(`\n=== ${g.file} | ${label} side ${g.side} (${g.result} ${g.score}-${g.oppScore}) | focus ${mode === 'ourDeath' ? 'OUR' : 'ENEMY'} ${CHAMPION_TYPES[v.type]} #${found.id} dies r${found.round}`);
  for (const [r, L] of [...lines.entries()].sort((a, b) => a[0] - b[0])) console.log(`  r${r} ${L.st || ''} | ${L.acts.join('; ') || '-'}`);
  console.log(`  focus inventory: ${inv(v)}`);
  for (const h of hitters) { const c = deathState.champions.find((y) => y.entity.index === h); console.log(`  hitter ${CHAMPION_TYPES[c.type]}#${h} inventory: ${inv(c)}`); }
  break;
}
