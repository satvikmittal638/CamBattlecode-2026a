// Captures per game for each camp group (described by kind, distance to own / enemy spawn), per map.
import { loadRows, loadMatch, cheb, inc } from './lib.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const rows = loadRows(args[0], { recent: +opt('recent', 60), side: opt('side'), kind: opt('kind', 'all'), map: opt('map') });
const per = {}; const games = {};
for (const row of rows) {
  let M; try { M = await loadMatch(row); } catch { continue; }
  if (M.me == null || !M.map) continue;
  inc(games, M.mapName);
  const P = (per[M.mapName] ??= {});
  for (const e of M.d.events.filter((x) => x.kind === 'Capture')) {
    const mineCap = e.team === M.me;
    const look = [M.snapAt(e.round + 1), M.snapAt(e.round)];
    let g = null;
    for (const s of look) {
      const c = (s?.champions || []).find((c) => c.team === e.team && c.alive && c.pos && M.map.campAt.has(c.pos[0] + ',' + c.pos[1]));
      if (c) { g = M.map.groups[M.map.campAt.get(c.pos[0] + ',' + c.pos[1])]; break; }
    }
    if (!g) continue;
    const key = `${g.kind.padEnd(9)} own${String(Math.round(cheb([g.cx, g.cy], M.spawn))).padStart(3)} enemy${String(Math.round(cheb([g.cx, g.cy], M.espawn))).padStart(3)} gems${String(g.gems).padStart(4)} gold${String(g.gold).padStart(4)}`;
    (P[key] ??= { me: 0, opp: 0 }); if (mineCap) P[key].me++; else P[key].opp++;
  }
}
for (const [m, P] of Object.entries(per)) {
  console.log('##', m, 'games', games[m]);
  for (const [k, v] of Object.entries(P).sort((a, b) => b[1].me - a[1].me)) console.log('  ', k, 'mite/game', (v.me / games[m]).toFixed(2), 'opp/game', (v.opp / games[m]).toFixed(2));
}
