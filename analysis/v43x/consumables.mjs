// Consumable / channel usage per side in a platform or download index: altar locks placed, teleports,
// recalls, tributes (Submit gems) per game; and how often a lock blocked the other side's tribute.
//   node analysis/v43x/consumables.mjs <index.json>
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
const idxFile = process.argv[2]; const idx = JSON.parse(fs.readFileSync(idxFile, 'utf8'));
const T = { us: {}, them: {} }; let games = 0;
for (const g of idx) {
  const us = g.side === 'a' ? 0 : 1; games++;
  await dumpReplay(path.join(path.dirname(idxFile), g.file), { snapshots: 'none', onStep(st, ev) {
    if (!ev || ev.actor?.kind !== 1) return; const side = ev.team === us ? 'us' : 'them';
    if (['Place altar lock', 'Teleport channel', 'Recall', 'Submit gems', 'Consumable', 'Sell item', 'Place ward', 'Cancel channel'].includes(ev.kind)) T[side][ev.kind] = (T[side][ev.kind] || 0) + 1;
  } });
}
for (const s of ['us', 'them']) console.log(s.padEnd(5), Object.entries(T[s]).map(([k, v]) => `${k} ${(v / games).toFixed(2)}`).join(' | '));
