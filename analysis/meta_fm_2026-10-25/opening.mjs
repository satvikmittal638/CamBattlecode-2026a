// Capture schedule up to round R for given games: round, champion, gems, gold.
//   node opening.mjs <index.json> <set> <map_side,...> [--to 100]
import fs from 'node:fs';
import { dumpReplay, CHAMPION_TYPES, CAMP_TYPES } from '../../tools/replay_dump.mjs';
const [idxFile, set, cells] = process.argv.slice(2);
const TO = process.argv.includes('--to') ? +process.argv[process.argv.indexOf('--to') + 1] : 100;
const games = JSON.parse(fs.readFileSync(idxFile, 'utf8')).filter((g) => g.set === set && cells.split(',').includes(`${g.map}_${g.side}`));
for (const g of games) {
  let prev = null; const caps = [];
  await dumpReplay(g.file, { snapshots: 'none', onStep(st) {
    if (st.round > TO) return;
    if (prev && st.step.kind === 2) for (const c of st.champions) {
      const b = prev.find((p) => p.id === c.entity.index); if (!b) continue;
      const dg = c.gems - b.gems, dd = c.gold - b.gold; if (dg <= 0 && dd <= 0) continue;
      const near = prev.camps ? "" : ""; if ((c.team === g.us) !== (process.argv.includes("--them"))) caps.push(`r${st.round} ${CHAMPION_TYPES[c.type].slice(0, 4)}(${c.position.x},${c.position.y}) +${dg}g/${dd}$`);
    }
    prev = st.champions.map((c) => ({ id: c.entity.index, gems: c.gems, gold: c.gold }));
  } });
  console.log(`\n${set} ${g.map}_${g.side} (${g.result} ${g.score}-${g.oppScore}): ${caps.length} captures by r${TO}`);
  console.log('  ' + caps.join(' | '));
}
