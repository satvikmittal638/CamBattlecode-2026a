// Per-champion condensed timeline: camp groups engaged, captures, tributes, recalls, shops, deaths, fights.
// usage: node analysis/whim/timeline.mjs <replay> <side> <map> [maxRound]
import { dumpReplay, loadMap, cheb } from './lib.mjs';
const [file, side, mapName, maxR = '9999'] = process.argv.slice(2);
const M = loadMap(mapName);
const d = await dumpReplay(file, { snapshots: 'round' });
const me = side === 'b' ? 1 : 0;
console.log(JSON.stringify(d.meta.draft), d.meta.outcome, d.meta.submittedGems, 'rounds', d.meta.finalRound);
const myIds = new Set(d.meta.finalChampions.filter((c) => c.team === me).map((c) => c.id));
const typeOf = Object.fromEntries(d.meta.finalChampions.map((c) => [c.id, c.type]));
const campGroup = {}; for (const c of d.snapshots[1].camps) campGroup[c.id] = M.campAt.get(c.pos.join(','));
const byRound = new Map(); for (const s of d.snapshots) if (!byRound.has(s.round)) byRound.set(s.round, s);
const st = (rd, id) => { const s = byRound.get(rd); const c = s?.champions.find((x) => x.id === id); return c ? `hp${c.hp}/${c.maxHp} g${c.gold} gem${c.gems} @${c.pos}` : ''; };
const lines = {};
for (const id of myIds) lines[id] = [];
let last = {};
for (const e of d.events) {
  if (e.round > +maxR) break;
  if (e.actor?.kind !== 1 || !myIds.has(e.actor.index)) continue;
  const id = e.actor.index; const L = lines[id];
  if ((e.kind === 'Attack' || e.kind === 'Cast ability') && e.target?.kind === 'camp') {
    const g = campGroup[e.target.id];
    if (last[id] !== 'g' + g) { L.push(`r${e.round} CAMP g${g}:${M.groups[g].label}@${Math.round(M.groups[g].cx)},${Math.round(M.groups[g].cy)} [${st(e.round, id)}]`); last[id] = 'g' + g; }
  } else if ((e.kind === 'Attack' || e.kind === 'Cast ability') && e.target?.kind === 'champion' && e.target.team !== me) {
    if (last[id] !== 'f' + e.target.id) { L.push(`r${e.round} FIGHT ${e.target.type} [${st(e.round, id)}]`); last[id] = 'f' + e.target.id; }
  } else if (['Submit gems', 'Recall', 'Place altar lock', 'Shop', 'Cancel channel', 'Teleport channel'].includes(e.kind)) {
    let s = `r${e.round} ${e.kind}`; if (e.kind === 'Submit gems') s += ` gems=${e.gemsCarried} altar=${e.to}`; if (e.kind === 'Shop') s += ' ' + Object.entries(e.items || {}).map(([k, v]) => k.replace(/ (Shard|Emblem) of /, (m, t) => t[0] + ':') + (v > 0 ? '+' : '') + v).join(','); if (e.kind === 'Place altar lock') s += ` at ${e.to}`;
    s += ` [${st(e.round, id)}]`;
    if (e.kind === 'Shop' && L.at(-1)?.includes(' Shop ') && L.at(-1).startsWith(`r${e.round} `)) L[L.length - 1] += ' | ' + Object.entries(e.items || {}).map(([k, v]) => k.replace(/ (Shard|Emblem) of /, (m, t) => t[0] + ':') + (v > 0 ? '+' : '') + v).join(',');
    else L.push(s);
    last[id] = e.kind;
  }
}
// deaths
for (const id of myIds) { let prev = null; for (const s of d.snapshots) { if (s.round > +maxR) break; const c = s.champions.find((x) => x.id === id); if (prev && prev.alive && !c.alive) lines[id].push(`r${s.round} DIED carrying ${prev.gems} @${prev.pos}`); prev = c; } }
for (const id of myIds) { console.log(`=== ${typeOf[id]} #${id}`); const L = lines[id].sort((a, b) => +a.match(/^r(\d+)/)[1] - +b.match(/^r(\d+)/)[1]); console.log(L.join('\n')); }
