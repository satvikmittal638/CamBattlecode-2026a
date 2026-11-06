// Who hits the Monoliths on gated maps, when, and who captures them.   node bosshits.mjs <matchIdPrefix>
import fs from 'node:fs'; import path from 'node:path'; import { dumpReplay } from '../../tools/replay_dump.mjs';
const dir = import.meta.dirname, [prefix] = process.argv.slice(2);
const g = JSON.parse(fs.readFileSync(path.join(dir, 'games/index.json'), 'utf8')).find((x) => x.matchId.startsWith(prefix));
const d = await dumpReplay(path.join(dir, 'games', g.file), { snapshots: 'round' });
const ours = g.side === 'a' ? 0 : 1;
const first = d.snapshots.find((s) => s.camps.length);
const mono = new Set(first.camps.filter((c) => c.type === 'Monolith').map((c) => c.pos.join(',')));
const hits = {}, byRound = {};
for (const e of d.events) {
  if ((e.kind === 'Attack' || e.kind === 'Cast ability') && mono.has(e.to.join(','))) {
    const who = e.team === ours ? 'us' : 'them'; const k = who + ' ' + (e.champ || '?');
    hits[k] = (hits[k] || 0) + 1; const b = Math.floor(e.round / 100) * 100; (byRound[b] ??= { us: 0, them: 0 })[who]++;
  }
}
const monoHp = d.snapshots.filter((s, i) => i % 50 === 0).map((s) => [s.round, s.camps.filter((c) => c.type === 'Monolith').map((c) => c.hp).join('/')]);
console.log(g.map, g.result, g.score + '-' + g.oppScore, 'our draft', d.meta.draft[ours].join(','), 'their', d.meta.draft[1 - ours].join(','));
console.log('monolith hits by champion:', hits); console.log('hits per 100 rounds:', JSON.stringify(byRound));
console.log('monolith hp every 50 rounds:', JSON.stringify(monoHp));
console.log('captures:', d.events.filter((e) => e.kind === 'Capture').slice(0, 5).map((e) => [e.round, e.team === ours ? 'us' : 'them']));
console.log('first gems submitted:', d.events.filter((e) => e.kind === 'Gems submitted').slice(0, 4).map((e) => [e.round, e.team === ours ? 'us' : 'them', e.champ]));
