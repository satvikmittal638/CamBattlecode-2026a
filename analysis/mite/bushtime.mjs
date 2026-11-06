// Fraction of alive champion-rounds spent on bush tiles, per map, and wards per game.
import { loadRows, loadMatch, inc } from './lib.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const rows = loadRows(args[0], { recent: +opt('recent', 40), side: opt('side') });
const T = {};
for (const row of rows) {
  let M; try { M = await loadMatch(row); } catch { continue; }
  if (!M.map) continue;
  const t = (T[M.mapName] ??= { n: 0, bush: 0, tot: 0, wards: 0 }); t.n++;
  for (const s of M.d.snapshots) for (const c of s.champions) if (c.team === M.me && c.alive && c.pos) { t.tot++; if (M.map.bush.has(c.pos.join(','))) t.bush++; }
  t.wards += M.d.events.filter((e) => e.kind === 'Place ward' && M.myIds.includes(e.actor?.index)).length;
}
for (const [m, t] of Object.entries(T)) console.log(m.padEnd(10), 'games', t.n, 'bushFrac', (t.bush / t.tot).toFixed(3), 'wards/game', (t.wards / t.n).toFixed(1));
