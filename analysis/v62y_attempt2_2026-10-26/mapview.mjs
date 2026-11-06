// ASCII view of a replay's map with our champions' idle hot spots (rounds idle per tile from behavior.json episodes are
// approximated by replaying positions here).   node mapview.mjs <matchIdPrefix> [--from R --to R]
//   #  wall   o hole   "  bush   A altar   a/b our/their spawn (ours = 'S')   W wolf E elk G golem M monolith
//   g/$ gem/gold cluster   digits: rounds our champions stood idle on that tile (1-9, * = 10+)
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';

const dir = import.meta.dirname;
const [prefix] = process.argv.slice(2);
const opt = (k, d) => { const i = process.argv.indexOf('--' + k); return i >= 0 ? +process.argv[i + 1] : d; };
const from = opt('from', 0), to = opt('to', 99999);
const g = JSON.parse(fs.readFileSync(path.join(dir, 'games/index.json'), 'utf8')).find((x) => x.matchId.startsWith(prefix));
const d = await dumpReplay(path.join(dir, 'games', g.file), { snapshots: 'round', mapInfo: true });
const mi = d.meta.mapInfo, W = mi.width, H = mi.height, team = g.side === 'a' ? 0 : 1;
const grid = Array.from({ length: H }, () => Array(W).fill('.'));
for (let i = 0; i < W * H; i++) { const x = i % W, y = Math.floor(i / W); if (mi.walls[i]) grid[y][x] = '#'; else if (mi.holes[i]) grid[y][x] = 'o'; else if (mi.bushes[i]) grid[y][x] = '"'; }
for (const [x, y] of mi.altars) grid[y][x] = 'A';
mi.spawn.forEach((r, t) => { for (let y = r.minY; y <= r.maxY; y++) for (let x = r.minX; x <= r.maxX; x++) grid[y][x] = t === team ? 'S' : 'X'; });
const first = d.snapshots.find((s) => s.camps.length);
const sym = { Wolf: 'W', Elk: 'E', Golem: 'G', Monolith: 'M', GemCluster: 'g', GoldCluster: '$' };
for (const c of first.camps) grid[c.pos[1]][c.pos[0]] = sym[c.type] ?? '?';
// idle tiles: alive, no action that round (events), not channelling (approximation: ignore recall windows)
const acted = new Set(d.events.filter((e) => e.actor?.kind === 1).map((e) => e.actor.index + ':' + e.round));
const heat = new Map();
for (const s of d.snapshots) {
  if (s.round < from || s.round > to) continue;
  for (const c of s.champions) if (c.team === team && c.alive && c.pos && !acted.has(c.id + ':' + s.round)) { const k = c.pos.join(','); heat.set(k, (heat.get(k) || 0) + 1); }
}
for (const [k, n] of heat) { const [x, y] = k.split(',').map(Number); if (n >= 3) grid[y][x] = n >= 10 ? '*' : String(Math.min(9, n)); }
console.log(`${g.map} ${g.matchId} side ${g.side} ${g.result} ${g.score}-${g.oppScore} rounds ${d.meta.finalRound}; draft us ${d.meta.draft[team].join(',')} them ${d.meta.draft[1 - team].join(',')}`);
for (let y = H - 1; y >= 0; y--) console.log(String(y).padStart(3) + ' ' + grid[y].join(''));
