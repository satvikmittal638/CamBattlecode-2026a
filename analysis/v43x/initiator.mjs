// For each of our champion deaths: who landed the first champion-on-champion hit within 6 tiles of the victim in
// the 12 rounds before (us = we initiated, them = they did), and the victim's HP fraction at that first hit.
//   node analysis/v43x/initiator.mjs <index.json> [mapRegex]
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay, CHAMPION_TYPES } from '../../tools/replay_dump.mjs';
const idxFile = process.argv[2]; const re = new RegExp(process.argv[3] || '.');
const idx = JSON.parse(fs.readFileSync(idxFile, 'utf8')).filter((g) => re.test(g.map));
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
const res = { us: 0, them: 0, none: 0 }; const hpAt = { us: [], them: [] }; const byVictimHit = { us: { self: 0, ally: 0 } };
for (const g of idx) {
  const us = g.side === 'a' ? 0 : 1; const hits = [];
  await dumpReplay(path.join(path.dirname(idxFile), g.file), { snapshots: 'none', onStep(st, ev, prev) {
    if (ev && (ev.kind === 'Attack' || ev.kind === 'Cast ability') && ev.target?.kind === 'champion' && ev.target.team !== ev.team && prev) {
      const a = prev.find((c) => c.entity.index === ev.actor.index); hits.push({ r: st.round, team: ev.team, actor: ev.actor.index, pos: a?.position, target: ev.target.id }); if (hits.length > 300) hits.shift(); }
    if (!prev) return;
    for (const c of st.champions) { if (c.team !== us) continue; const b = prev.find((y) => y.entity.index === c.entity.index); if (!b || !b.alive || c.alive || !b.position) continue;
      const w = hits.filter((h) => h.r >= st.round - 12 && h.pos && cheb(h.pos, b.position) <= 6);
      if (!w.length) { res.none++; continue; }
      const f = w[0]; const who = f.team === us ? 'us' : 'them'; res[who]++;
      if (who === 'us') byVictimHit.us[f.actor === c.entity.index ? 'self' : 'ally']++; } } });
}
const n = res.us + res.them + res.none;
console.log(`our deaths ${n}: we hit first ${res.us} (${(100 * res.us / n).toFixed(0)}%; victim itself ${byVictimHit.us.self}, an ally ${byVictimHit.us.ally}), they hit first ${res.them} (${(100 * res.them / n).toFixed(0)}%), no champion hit within 6 tiles/12 rounds ${res.none}`);
