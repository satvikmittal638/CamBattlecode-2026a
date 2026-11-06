// Head-to-head: per map, the same metrics for both sides of each platform replay.
//   node analysis/mite/h2h.mjs <groupDir> <ourSide a|b>
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
import { build, cheb, MAPS } from './lib.mjs';
const [dir, ours] = process.argv.slice(2);
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.repl26a')).sort();
const metr = (M) => {
  const ev = M.d.events; const mine = ev.filter((e) => e.actor?.kind === 1 && M.myIds.includes(e.actor.index));
  const subs = mine.filter((e) => e.kind === 'Submit gems');
  const atk = mine.filter((e) => e.kind === 'Attack');
  let eh = 0, al = 0;
  for (const s of M.d.snapshots) for (const c of s.champions) if (c.team === M.me && c.alive && c.pos && M.spawn) { al++; if (cheb(c.pos, M.espawn) < cheb(c.pos, M.spawn)) eh++; }
  return {
    gems: M.meta.submittedGems[M.me], caps: ev.filter((e) => e.kind === 'Capture' && e.team === M.me).length, trib: subs.length,
    gpt: subs.length ? Math.round(subs.reduce((s, e) => s + e.gemsCarried, 0) / subs.length) : 0, rec: mine.filter((e) => e.kind === 'Recall').length,
    ward: mine.filter((e) => e.kind === 'Place ward').length, K: M.meta.finalChampions.filter((c) => c.team === M.me).reduce((s, c) => s + c.kills, 0),
    D: ev.filter((e) => e.kind === 'Respawn' && e.actor?.kind === 1 && M.myIds.includes(e.actor.index)).length,
    chAtk: +(atk.filter((e) => e.target?.kind === 'champion').length / Math.max(1, atk.length)).toFixed(2), eHalf: +(eh / Math.max(1, al)).toFixed(2),
    prio: mine.filter((e) => e.kind === 'Set priority').length, firstCap: (ev.find((e) => e.kind === 'Capture' && e.team === M.me) || {}).round,
  };
};
const tot = { us: {}, them: {} };
for (const f of files) {
  const d = await dumpReplay(path.join(dir, f), { snapshots: 'round' });
  const map = f.split('_')[0];
  const us = metr(build(d, ours === 'a' ? 0 : 1, MAPS.includes(map) ? map : null));
  const them = metr(build(d, ours === 'a' ? 1 : 0, MAPS.includes(map) ? map : null));
  console.log(map.padEnd(10), 'rounds', d.meta.finalRound, '\n   us  ', JSON.stringify(us), '\n   mite', JSON.stringify(them));
  for (const [k, v] of Object.entries(us)) tot.us[k] = (tot.us[k] || 0) + (v || 0);
  for (const [k, v] of Object.entries(them)) tot.them[k] = (tot.them[k] || 0) + (v || 0);
}
const n = files.length;
console.log('MEAN us  ', JSON.stringify(Object.fromEntries(Object.entries(tot.us).map(([k, v]) => [k, +(v / n).toFixed(2)]))));
console.log('MEAN mite', JSON.stringify(Object.fromEntries(Object.entries(tot.them).map(([k, v]) => [k, +(v / n).toFixed(2)]))));
