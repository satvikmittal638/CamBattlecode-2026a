// How long our champions stand idle on a camp spawn tile whose camp is dead (no live camp unit on it). Captures take 5
// turns; beyond ~6 idle rounds the champion is waiting on a respawning group, which its presence delays (rules: "Any
// occupied spawn tile delays the entire group"). Also counts the same for the opponent.   node blockwait.mjs
import fs from 'node:fs'; import path from 'node:path'; import { dumpReplay } from '../../tools/replay_dump.mjs';
const dir = import.meta.dirname, index = JSON.parse(fs.readFileSync(path.join(dir, 'games/index.json'), 'utf8'));
const tot = { us: { long: 0, excess: 0, episodes: 0 }, them: { long: 0, excess: 0, episodes: 0 } }, byMap = {}, worst = [];
for (const g of index) {
  const d = await dumpReplay(path.join(dir, 'games', g.file), { snapshots: 'round' });
  const ourTeam = g.side === 'a' ? 0 : 1;
  const tiles = new Set(); for (const s of d.snapshots) { if (s.camps.length) { for (const c of s.camps) tiles.add(c.pos.join(',')); if (s.round > 1) break; } }
  const acted = new Set(d.events.filter((e) => e.actor?.kind === 1 && e.kind !== 'Set priority').map((e) => e.actor.index + ':' + e.round));
  const run = new Map();
  for (const s of d.snapshots) {
    const live = new Set(s.camps.filter((c) => c.hp > 0).map((c) => c.pos.join(',')));
    for (const c of s.champions) {
      const k = c.pos?.join(','), who = c.team === ourTeam ? 'us' : 'them';
      const waiting = c.alive && k && tiles.has(k) && !live.has(k) && !acted.has(c.id + ':' + s.round);
      const r = waiting ? (run.get(c.id)?.pos === k ? run.get(c.id).n + 1 : 1) : 0;
      if (!waiting && (run.get(c.id)?.n || 0) > 6) { const n = run.get(c.id).n; tot[who].episodes++; tot[who].excess += n - 6; if (who === 'us') { (byMap[g.map] ??= [0, 0])[0] += n - 6; worst.push([n, g.map, g.matchId.slice(0, 8), c.type, run.get(c.id).pos, s.round - n]); } }
      run.set(c.id, { pos: k, n: r });
    }
  }
  for (const m of Object.values(byMap)) m[1] = m[1];
}
console.log('rounds idle on dead camp tiles beyond 6 (blocking respawns):', JSON.stringify(tot));
console.log('per game: us', (tot.us.excess / index.length).toFixed(1), 'them', (tot.them.excess / index.length).toFixed(1));
console.log('by map (us):', Object.entries(byMap).sort((a, b) => b[1][0] - a[1][0]).slice(0, 12).map(([m, v]) => m + ' ' + v[0]).join(', '));
worst.sort((a, b) => b[0] - a[0]); console.log('worst episodes:', worst.slice(0, 12));
