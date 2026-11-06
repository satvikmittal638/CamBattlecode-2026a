// What our champion was doing in the 6 rounds before each death (platform run): camp attacks,
// champion attacks/casts, moves toward/away from the nearest visible enemy, recall/tribute starts.
// Class: farming (camp hits, no champion hits) | fighting (champion hits) | fleeing (>=2 moves away, no hits)
// | channel (recall/tribute started) | other. Also: was the victim carrying gems, killer count.
//   node analysis/v43x/death_activity.mjs <index.json> [mapRegex]
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay, CHAMPION_TYPES } from '../../tools/replay_dump.mjs';
const idxFile = process.argv[2]; const re = new RegExp(process.argv[3] || '.');
const idx = JSON.parse(fs.readFileSync(idxFile, 'utf8')).filter((g) => re.test(g.map));
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
const cls = {}; const byType = {}; let n = 0; const ex = [];
for (const g of idx) {
  const us = g.side === 'a' ? 0 : 1; const log = new Map(); let lr = -1; let pos = new Map();
  await dumpReplay(path.join(path.dirname(idxFile), g.file), { snapshots: 'none', onStep(st, ev, prev) {
    if (st.round !== lr) { lr = st.round; pos = new Map(st.champions.map((c) => [c.entity.index, c])); }
    if (ev && ev.actor?.kind === 1 && ev.team === us) {
      const id = ev.actor.index; const L = log.get(id) || []; const me = prev?.find((c) => c.entity.index === id);
      let k = null;
      if ((ev.kind === 'Attack' || ev.kind === 'Cast ability') && ev.target?.kind === 'camp') k = 'camp';
      else if ((ev.kind === 'Attack' || ev.kind === 'Cast ability') && ev.target?.kind === 'champion' && ev.target.team !== us) k = 'champ';
      else if (ev.kind === 'Move' && me?.position) { const en = st.champions.filter((c) => c.team !== us && c.alive && c.position); if (en.length) { const near = en.reduce((a, c) => (cheb(c.position, me.position) < cheb(a.position, me.position) ? c : a)); const d0 = cheb(near.position, me.position), d1 = cheb(near.position, { x: ev.to[0], y: ev.to[1] }); if (d0 <= 8) k = d1 > d0 ? 'away' : d1 < d0 ? 'toward' : 'side'; } }
      else if (ev.kind === 'Recall' || ev.kind === 'Submit gems') k = 'channel';
      if (k) { L.push({ r: st.round, k }); if (L.length > 40) L.shift(); log.set(id, L); }
    }
    if (!prev) return;
    for (const c of st.champions) { if (c.team !== us) continue; const b = prev.find((y) => y.entity.index === c.entity.index); if (!b || !b.alive || c.alive) continue;
      const L = (log.get(c.entity.index) || []).filter((e) => e.r >= st.round - 6); const cnt = (k) => L.filter((e) => e.k === k).length;
      const k = cnt('channel') ? 'channel' : cnt('champ') ? (cnt('camp') ? 'fight+farm' : 'fighting') : cnt('camp') ? 'farming' : cnt('away') >= 2 ? 'fleeing' : cnt('toward') >= 2 ? 'approaching' : 'other';
      cls[k] = (cls[k] || 0) + 1; n++; const t = CHAMPION_TYPES[c.type]; (byType[t] = byType[t] || {})[k] = (byType[t][k] || 0) + 1;
      if (ex.length < 400) ex.push({ g: g.label + '|' + g.map, r: st.round, t, k, bag: b.gems, seq: L.map((e) => e.k[0]).join('') }); }
  } });
}
console.log(`our deaths ${n}`); for (const [k, v] of Object.entries(cls).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(12)} ${v} (${(100 * v / n).toFixed(0)}%)`);
for (const [t, o] of Object.entries(byType)) console.log(`  ${t.padEnd(12)} ${JSON.stringify(o)}`);
if (process.argv[4]) fs.writeFileSync(process.argv[4], ex.map((e) => JSON.stringify(e)).join('\n'));
