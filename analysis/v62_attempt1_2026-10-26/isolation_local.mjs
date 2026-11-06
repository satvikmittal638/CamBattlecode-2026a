// Isolation deaths in local field_eval games (our variant = side a or b per row): deaths with 2+ enemies within 6 and
// no ally within 6, per game, plus overall deaths, to compare local opponents with the platform (3.6/game, 7.2 in heavy
// losses).   node isolation_local.mjs <fe_dir> [variant] [--opps a,b]
import fs from 'node:fs'; import path from 'node:path'; import { dumpReplay } from '../../tools/replay_dump.mjs';
const [feDir, variant = 'base'] = process.argv.slice(2);
const opt = (k) => { const i = process.argv.indexOf('--' + k); return i >= 0 ? process.argv[i + 1] : null; };
const root = path.resolve(import.meta.dirname, '../..');
let rows = JSON.parse(fs.readFileSync(path.join(feDir, 'results.json'), 'utf8')).rows.filter((r) => r.variant === variant);
if (opt('opps')) rows = rows.filter((r) => opt('opps').split(',').includes(r.opponent));
const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
const by = {};
for (const r of rows) {
  const d = await dumpReplay(path.join(root, r.replay), { snapshots: 'round' });
  const us = r.side === 'a' ? 0 : 1, S = d.snapshots;
  const x = (by[r.opponent] ??= { games: 0, deaths: 0, iso: 0, oppDeaths: 0, oppIso: 0, near: 0, nearN: 0, oppNear: 0, oppNearN: 0 });
  x.games++;
  for (let i = 1; i < S.length - 1; i++) {
    for (const c of S[i].champions) {
      if (!c.alive || !c.pos) continue;
      const mine = c.team === us;
      const mates = S[i].champions.filter((o) => o.team === c.team && o.id !== c.id && o.alive && o.pos);
      if (S[i].round >= 20 && S[i].round <= 300 && i % 3 === 0) { const nd = Math.min(30, ...mates.map((o) => cheb(o.pos, c.pos))); if (mine) { x.near += nd; x.nearN++; } else { x.oppNear += nd; x.oppNearN++; } }
      const nx = S[i + 1].champions.find((o) => o.id === c.id);
      if (!nx || nx.alive) continue;
      const foes = S[i].champions.filter((o) => o.team !== c.team && o.alive && o.pos && cheb(o.pos, c.pos) <= 6).length;
      const allies = mates.filter((o) => cheb(o.pos, c.pos) <= 6).length;
      if (mine) { x.deaths++; if (foes >= 2 && !allies) x.iso++; } else { x.oppDeaths++; if (foes >= 2 && !allies) x.oppIso++; }
    }
  }
}
for (const [o, x] of Object.entries(by)) console.log(`${o.padEnd(18)} games ${x.games}: our deaths ${(x.deaths / x.games).toFixed(1)} (isolated vs 2+ ${(x.iso / x.games).toFixed(1)}), their deaths ${(x.oppDeaths / x.games).toFixed(1)} (isolated ${(x.oppIso / x.games).toFixed(1)}); nearest ally r20-300 us ${(x.near / x.nearN).toFixed(1)} them ${(x.oppNear / x.oppNearN).toFixed(1)}`);
