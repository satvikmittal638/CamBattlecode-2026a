// Gold income by source per team up to round TO: captures, kills (killer of a champion death), other positive deltas.
//   node goldsrc.mjs <index.json> <set> [--to 200]
import fs from 'node:fs';
import { dumpReplay } from '../../tools/replay_dump.mjs';
const [idxFile, set] = process.argv.slice(2);
const TO = process.argv.includes('--to') ? +process.argv[process.argv.indexOf('--to') + 1] : 200;
const games = JSON.parse(fs.readFileSync(idxFile, 'utf8')).filter((g) => g.set === set);
const acc = [0, 1].map(() => ({ start: 0, cap: 0, kill: 0, other: 0 }));
for (const g of games) {
  let prev = null, first = true;
  await dumpReplay(g.file, { snapshots: 'none', onStep(st, ev) {
    if (st.round > TO) return;
    if (first && st.champions.length && st.round >= 1) { for (const c of st.champions) acc[c.team === g.us ? 0 : 1].start += c.gold; first = false; }
    if (prev) for (const c of st.champions) {
      const b = prev.find((p) => p.id === c.entity.index); if (!b) continue;
      const d = c.gold - b.gold; if (d <= 0) continue;
      const a = acc[c.team === g.us ? 0 : 1];
      if (st.step.kind === 2) a.cap += d; else if (prev.some((p) => p.team !== c.team && p.alive && !st.champions.find((x) => x.entity.index === p.id).alive)) a.kill += d; else a.other += d;
    }
    prev = st.champions.map((c) => ({ id: c.entity.index, team: c.team, gold: c.gold, alive: c.alive }));
  } });
}
const n = games.length;
for (const [i, s] of ['us', 'them'].entries()) console.log(set.padEnd(9), s.padEnd(5), `start ${(acc[i].start / n).toFixed(0)} captures ${(acc[i].cap / n).toFixed(0)} kills ${(acc[i].kill / n).toFixed(0)} other ${(acc[i].other / n).toFixed(0)}`);
