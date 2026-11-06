// Print a compact per-champion timeline for one replay: every K rounds position/hp/gems/gold,
// plus key events (capture inferred from gem gains, tribute, recall, shop, death, champion attacks).
// usage: node analysis/shink/timeline.mjs <replay> <team 0|1> [K=5] [maxRound=200]
import { dumpReplay } from '../../tools/replay_dump.mjs';
import fs from 'node:fs';
let [file, teamS, KS, MS] = process.argv.slice(2);
// Query form: "q:<map>:<opponentSubstr>:<nth>" picks from SHINK index (newest first).
if (file.startsWith('q:')) {
  const [, mp, op, nth] = file.split(':');
  const idx = JSON.parse(fs.readFileSync('top_replays/4_SHINK-AI-6500/index.json', 'utf8')).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const r = idx.filter((r) => r.map === mp && (!op || r.opponent.toLowerCase().includes(op.toLowerCase())))[+(nth || 0)];
  file = 'top_replays/4_SHINK-AI-6500/replays/' + r.file; teamS = r.side === 'b' ? '1' : '0';
  console.log(r.file);
}
const team = +teamS, K = +(KS || 5), MAXR = +(MS || 200);
const d = await dumpReplay(file, { snapshots: 'round' });
console.log(d.meta.draft, d.meta.outcome, d.meta.submittedGems, 'size', d.meta.width, d.meta.height);
const mine = d.meta.finalChampions.filter((c) => c.team === team).map((c) => c.id);
const name = Object.fromEntries(d.meta.finalChampions.map((c) => [c.id, c.type]));
const evs = d.events.filter((e) => e.actor?.kind === 1 && mine.includes(e.actor.index) && e.round <= MAXR);
let prev = null;
for (const s of d.snapshots) {
  if (s.round > MAXR) break;
  const cs = s.champions.filter((c) => mine.includes(c.id));
  // gem gain events (captures) between snapshots
  if (prev) for (const c of cs) { const p = prev.champions.find((x) => x.id === c.id); if (p && c.gems > p.gems && c.alive) console.log(`  r${s.round} ${c.type} +${c.gems - p.gems}gems +${c.gold - p.gold}g at ${c.pos}`); }
  if (s.round % K === 0) console.log(`r${s.round} ` + cs.map((c) => `${c.type.slice(0, 4)}@${c.pos ?? '-'} hp${Math.round(100 * c.hp / c.maxHp)} gm${c.gems} g${c.gold}${c.alive ? '' : ' DEAD'}`).join(' | '));
  prev = s;
}
for (const e of evs) {
  if (['Submit gems', 'Recall', 'Shop', 'Place ward', 'Respawn'].includes(e.kind) || (e.kind === 'Attack' && e.target?.kind === 'champion' && e.target.team !== team) || (e.kind === 'Cast ability' && e.target?.kind === 'champion' && e.target.team !== team))
    console.log(`E r${e.round} ${name[e.actor.index]} ${e.kind} ${e.abilityType || ''} to=${e.to} ${e.target ? e.target.type : ''} ${e.gemsCarried ?? ''} ${e.items ? JSON.stringify(e.items) : ''}`);
}
