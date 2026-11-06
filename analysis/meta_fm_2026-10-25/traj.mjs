// Per-round trajectories of both teams for plotting.
//   node traj.mjs <index.json> <outDir> [--sets a,b] [--maps m1_a,m2_b] [--to 600]
// Writes <outDir>/<set>__<map>_<side>__<file stem>.json with map geometry, camps, per-round champion states,
// banks, deaths and gem captures. Team 0 in the output is always "us".
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay, CHAMPION_TYPES, CAMP_TYPES } from '../../tools/replay_dump.mjs';

const args = process.argv.slice(2);
const [idxFile, outDir] = args;
const opt = (k, d) => (args.includes('--' + k) ? args[args.indexOf('--' + k) + 1] : d);
const sets = opt('sets', '') ? new Set(opt('sets').split(',')) : null;
const cells = opt('maps', '') ? new Set(opt('maps').split(',')) : null;
const TO = +opt('to', 600);
fs.mkdirSync(outDir, { recursive: true });
const games = JSON.parse(fs.readFileSync(idxFile, 'utf8')).filter((g) => (!sets || sets.has(g.set)) && (!cells || cells.has(`${g.map}_${g.side}`)));
for (const g of games) {
  const out = path.join(outDir, `${g.set}__${g.map}_${g.side}__${path.basename(g.file, '.repl26a').slice(-8)}.json`);
  if (fs.existsSync(out)) continue;
  const rel = (t) => (t === g.us ? 0 : 1);
  let info = null, prev = null, lastRound = -1;
  const rounds = [], deaths = [], caps = [];
  let camps = null;
  await dumpReplay(g.file, {
    snapshots: 'none', mapInfo: true,
    onStart(s) {
      const m = s.mapInfo, W = m.width, H = m.height;
      const cells = (grid) => { const a = []; for (let i = 0; i < grid.length; i++) if (grid[i]) a.push([i % W, Math.floor(i / W)]); return a; };
      info = { width: W, height: H, walls: cells(m.walls), holes: cells(m.holes), bushes: cells(m.bushes), altars: m.altars, spawn: [m.spawn[g.us], m.spawn[1 - g.us]] };
    },
    onStep(st) {
      if (st.round > TO) return;
      if (!camps && st.camps.length) camps = st.camps.map((c) => ({ type: CAMP_TYPES[c.type] ?? c.type, x: c.position.x, y: c.position.y }));
      if (prev && st.step.kind === 2) for (const ch of st.champions) {
        const b = prev.champions.find((p) => p.entity.index === ch.entity.index);
        if (b && ch.position && ch.gems > b.gems) caps.push([st.round, rel(ch.team), ch.position.x, ch.position.y, ch.gems - b.gems]);
      }
      if (prev) for (const ch of st.champions) {
        const b = prev.champions.find((p) => p.entity.index === ch.entity.index);
        if (b && b.alive && !ch.alive && b.position) deaths.push([st.round, rel(ch.team), b.position.x, b.position.y, b.gems, CHAMPION_TYPES[ch.type]]);
      }
      if (st.round !== lastRound) {
        lastRound = st.round;
        rounds.push({ r: st.round, bank: [st.submittedGems[g.us], st.submittedGems[1 - g.us]],
          c: st.champions.map((c) => [rel(c.team), c.entity.index, CHAMPION_TYPES[c.type], c.alive && c.position ? c.position.x : -1, c.alive && c.position ? c.position.y : -1, c.gems, Math.round(c.health)]) });
      }
      prev = st;
    },
  });
  fs.writeFileSync(out, JSON.stringify({ ...g, info, camps, rounds, deaths, caps }));
  console.log(out);
}
