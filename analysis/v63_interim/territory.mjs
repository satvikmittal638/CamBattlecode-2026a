// Opening territory and camp control: rounds 1-200. Where each team's champions stand (our half / their half by
// spawn distance) and which team captures the camp groups on each half.
//   node territory.mjs <games/index.json>
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';

const idxFile = process.argv[2];
const special = /contest|boss_battle/;
const cat = (g) => (g.result === 'win' ? 'win' : !special.test(g.map) && g.oppScore - g.score >= 500 ? 'heavy' : 'loss');
const games = JSON.parse(fs.readFileSync(idxFile, 'utf8'));
const rectDist = (r, x, y) => Math.max(Math.max(r.minX - x, 0, x - r.maxX), Math.max(r.minY - y, 0, y - r.maxY));
const acc = {};
for (const g of games) {
  const us = g.side === 'a' ? 0 : 1;
  const c = cat(g);
  const a = (acc[c] ||= { games: 0, inTheirHalf: [0, 0], n: [0, 0], caps: { oursOnOurs: 0, theirsOnOurs: 0, oursOnTheirs: 0, theirsOnTheirs: 0 } });
  a.games++;
  let spawn = null, prevGroups = null, prevChamps = null;
  await dumpReplay(path.join(path.dirname(idxFile), g.file), {
    snapshots: 'none', mapInfo: true,
    onStart(s) { spawn = s.mapInfo.spawn; },
    onStep(st) {
      if (st.round > 200) return;
      // Camp group captured: rewardAvailable -> respawning; credit the team whose champion stands on/near its camps.
      if (prevGroups && st.step.kind === 2) {
        const gems = st.champions.map((c) => c.gems);
        st.champions.forEach((ch, i) => {
          const before = prevChamps?.find((p) => p.entity.index === ch.entity.index);
          if (!before || ch.gems <= before.gems || !ch.position) return;
          const ourHalf = rectDist(spawn[us], ch.position.x, ch.position.y) <= rectDist(spawn[1 - us], ch.position.x, ch.position.y);
          const mine = ch.team === us;
          a.caps[(mine ? 'ours' : 'theirs') + 'On' + (ourHalf ? 'Ours' : 'Theirs')] += ch.gems - before.gems;
        });
      }
      if (st.step.kind === 3 && st.step.phase === 14 && st.phase === 10) {
        const c0 = st.champions.find((x) => x.entity.index === st.currentChampion);
        if (c0 && c0.alive && c0.position) {
          const k = c0.team === us ? 0 : 1;
          const own = spawn[c0.team], other = spawn[1 - c0.team];
          if (rectDist(other, c0.position.x, c0.position.y) < rectDist(own, c0.position.x, c0.position.y)) a.inTheirHalf[k]++;
          a.n[k]++;
        }
      }
      prevGroups = st.groups; prevChamps = st.champions;
    },
  });
}
for (const [c, a] of Object.entries(acc)) {
  const cp = a.caps;
  console.log(`${c.padEnd(6)} ${a.games} games | turns spent in the other team's half: ours ${(100 * a.inTheirHalf[0] / a.n[0]).toFixed(0)}% theirs ${(100 * a.inTheirHalf[1] / a.n[1]).toFixed(0)}%`);
  console.log(`        capture gems per game by r200: ours on our half ${(cp.oursOnOurs / a.games).toFixed(1)}, ours on their half ${(cp.oursOnTheirs / a.games).toFixed(1)}, theirs on our half ${(cp.theirsOnOurs / a.games).toFixed(1)}, theirs on their half ${(cp.theirsOnTheirs / a.games).toFixed(1)}`);
}
