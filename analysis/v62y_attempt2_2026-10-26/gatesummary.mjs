// Per gated-map game: Monolith hits by side, the round each Monolith group fell, captures of the gate, first tributes.
import fs from 'node:fs'; import path from 'node:path'; import { dumpReplay } from '../../tools/replay_dump.mjs';
const dir = import.meta.dirname, idx = JSON.parse(fs.readFileSync(path.join(dir, 'games/index.json'), 'utf8'));
for (const g of idx.filter((x) => /boss_battle|guardians/.test(x.map))) {
  const d = await dumpReplay(path.join(dir, 'games', g.file), { snapshots: 'round' });
  const ours = g.side === 'a' ? 0 : 1, first = d.snapshots.find((s) => s.camps.length);
  const mono = new Set(first.camps.filter((c) => c.type === 'Monolith').map((c) => c.pos.join(',')));
  const hits = { us: 0, them: 0 }; let firstHit = { us: null, them: null };
  for (const e of d.events) if ((e.kind === 'Attack' || e.kind === 'Cast ability') && mono.has(e.to.join(','))) { const w = e.team === ours ? 'us' : 'them'; hits[w]++; firstHit[w] ??= e.round; }
  let fell = null; for (const s of d.snapshots) { const live = s.camps.filter((c) => c.type === 'Monolith').length; if (live < mono.size) { fell = s.round; break; } }
  const subs = d.events.filter((e) => e.kind === 'Gems submitted').slice(0, 3).map((e) => `${e.round}:${e.team === ours ? 'us' : 'them'}`);
  console.log(`${g.map.padEnd(14)} ${g.result} ${g.score}-${g.oppScore} | hits us ${hits.us} (from r${firstHit.us}) them ${hits.them} (from r${firstHit.them}) | first monolith down r${fell} | tributes ${subs.join(' ')}`);
}
