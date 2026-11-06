// Fight behaviour from round snapshots (tools/replay_dump.mjs), one side per game, split by that side's result:
//   converge  healthy (HP >= 60%) champion not in contact (no enemy within 4) with an ally within 10 that has an
//             enemy within 4: does it move toward that ally next round (distance to the ally decreases)?
//   press     our local share (self + allies within 4 vs enemies within 6, by HP) >= .55 and a wounded enemy
//             (HP < 40%) within 4: does it close in next round, and does that enemy die within 5 rounds?
//   grouping  share of alive rounds (20-1500) with an ally within 4.
//   node fight_behaviour.mjs <index.json dir> [<more dirs>...] [--label name] [--limit N]
// Each dir needs index.json rows {file, side, result}; side = the profiled team.
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const dirs = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
const limit = +opt('limit', 1e9), label = opt('label', dirs.join('+'));
const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
const agg = { win: {}, loss: {} };
const bump = (r, k, v = 1) => { agg[r][k] = (agg[r][k] || 0) + v; };
let n = 0;
for (const d of dirs) {
  const rows = JSON.parse(fs.readFileSync(path.join(d, 'index.json'), 'utf8')).slice(0, limit);
  for (const g of rows) {
    let dump; try { dump = await dumpReplay(path.join(d, g.file), { snapshots: 'round' }); } catch { continue; }
    const team = g.side === 'a' ? 0 : 1, res = g.result === 'win' ? 'win' : 'loss'; n++; bump(res, 'games');
    const S = dump.snapshots;
    for (let i = 0; i + 1 < S.length; i++) {
      const s = S[i], nx = S[i + 1]; if (s.round < 20 || s.round > 1500) continue;
      const alive = s.champions.filter((c) => c.alive && c.pos);
      const mine = alive.filter((c) => c.team === team), foes = alive.filter((c) => c.team !== team);
      for (const c of mine) {
        const next = nx.champions.find((o) => o.id === c.id); if (!next?.alive || !next.pos) continue;
        const allies = mine.filter((o) => o.id !== c.id);
        bump(res, 'aliveRounds'); if (allies.some((o) => cheb(o.pos, c.pos) <= 4)) bump(res, 'grouped');
        const f4 = foes.filter((e) => cheb(e.pos, c.pos) <= 4), f6 = foes.filter((e) => cheb(e.pos, c.pos) <= 6);
        // converge
        if (!f4.length && c.hp >= 0.6 * c.maxHp) {
          const engaged = allies.filter((o) => cheb(o.pos, c.pos) <= 10 && cheb(o.pos, c.pos) >= 3 && foes.some((e) => cheb(e.pos, o.pos) <= 4));
          if (engaged.length) {
            const a = engaged.reduce((m, o) => (cheb(o.pos, c.pos) < cheb(m.pos, c.pos) ? o : m));
            const an = nx.champions.find((o) => o.id === a.id); bump(res, 'convergeOpp');
            if (an?.pos && cheb(next.pos, an.pos) < cheb(c.pos, a.pos)) bump(res, 'converged');
          }
        }
        // press
        if (f6.length) {
          const a4 = allies.filter((o) => cheb(o.pos, c.pos) <= 4);
          const ours = c.hp + a4.reduce((t, o) => t + o.hp, 0), theirs = f6.reduce((t, e) => t + e.hp, 0);
          const wounded = f4.filter((e) => e.hp < 0.4 * e.maxHp);
          if (ours / (ours + theirs) >= 0.55 && wounded.length) {
            const w = wounded.reduce((m, e) => (e.hp < m.hp ? e : m)); bump(res, 'pressOpp');
            const wn = nx.champions.find((o) => o.id === w.id);
            if (wn?.alive && wn.pos && cheb(next.pos, wn.pos) < cheb(c.pos, w.pos)) bump(res, 'pressed');
            if (wn?.alive && wn.pos && cheb(next.pos, wn.pos) <= 1 && cheb(c.pos, w.pos) <= 1) bump(res, 'stuck');
            let died = false; for (let k = i + 1; k <= i + 5 && k < S.length; k++) { const z = S[k].champions.find((o) => o.id === w.id); if (z && !z.alive) { died = true; break; } }
            if (died) bump(res, 'killedSoon');
          }
        }
        // caught alone: 2+ enemies within 6, no ally within 4 -> does this champion die within 10 rounds?
        const deadWithin = (id, r) => { for (let k = i + 1; k <= i + r && k < S.length; k++) { const z = S[k].champions.find((o) => o.id === id); if (z && !z.alive) return true; } return false; };
        if (f6.length >= 2 && !allies.some((o) => cheb(o.pos, c.pos) <= 4)) { bump(res, 'alone'); if (deadWithin(c.id, 10)) bump(res, 'aloneDied'); }
        // duel: exactly one enemy within 6, no ally within 4 of either, in range 2 -> who dies within 10 rounds?
        if (f6.length === 1 && cheb(f6[0].pos, c.pos) <= 2 && !allies.some((o) => cheb(o.pos, c.pos) <= 4) && !foes.some((e) => e.id !== f6[0].id && cheb(e.pos, f6[0].pos) <= 4)) {
          bump(res, 'duel'); const me = deadWithin(c.id, 10), them = deadWithin(f6[0].id, 10);
          if (me && !them) bump(res, 'duelLost'); if (them && !me) bump(res, 'duelWon');
          if (c.hp / c.maxHp >= f6[0].hp / f6[0].maxHp) bump(res, 'duelHealthier');
        }
        // deaths
        if (!next.alive) bump(res, 'deaths');
      }
      for (const c of mine) { const next = nx.champions.find((o) => o.id === c.id); if (next && !next.alive) bump(res, 'allDeaths'); }
    }
  }
}
const pct = (a, b) => (b ? (100 * a / b).toFixed(0) + '%' : '-');
for (const res of ['win', 'loss']) {
  const a = agg[res]; if (!a.games) continue;
  console.log(`${label} ${res}: ${a.games} games | grouped ${pct(a.grouped, a.aliveRounds)} | converge: ${a.convergeOpp || 0} chances (${((a.convergeOpp || 0) / a.games).toFixed(0)}/game), moved toward ${pct(a.converged || 0, a.convergeOpp)} | press: ${a.pressOpp || 0} chances (${((a.pressOpp || 0) / a.games).toFixed(0)}/game), closed in ${pct(a.pressed || 0, a.pressOpp)}, stayed in contact ${pct(a.stuck || 0, a.pressOpp)}, enemy dead within 5 ${pct(a.killedSoon || 0, a.pressOpp)}`);
  console.log(`   deaths/game ${((a.allDeaths || 0) / a.games).toFixed(1)} | caught alone ${pct(a.alone || 0, a.aliveRounds)} of alive rounds (${((a.alone || 0) / a.games).toFixed(0)}/game), died within 10 ${pct(a.aloneDied || 0, a.alone)} | duels ${((a.duel || 0) / a.games).toFixed(0)}/game: won ${pct(a.duelWon || 0, a.duel)} lost ${pct(a.duelLost || 0, a.duel)} (we were healthier in ${pct(a.duelHealthier || 0, a.duel)})`);
}
