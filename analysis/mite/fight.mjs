// Engagement analysis: when an enemy champion is near, does the champion attack / approach / retreat?
import { loadRows, loadMatch, cheb, inc } from './lib.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const rows = loadRows(args[0], { recent: +opt('recent', 40), side: opt('side'), kind: opt('kind', 'all') });
const T = {}; const add = (k, v) => { (T[k] ??= {}); inc(T[k], v); };
const ranged = new Set(['Cassi', 'Willow', 'VesperVale', 'Stellar', 'Prism', 'Tavi']);
for (const row of rows) {
  let M; try { M = await loadMatch(row); } catch { continue; }
  if (M.me == null) continue;
  const atkBy = new Map();
  for (const e of M.d.events) if (e.actor?.kind === 1 && (e.kind === 'Attack' || e.kind === 'Cast ability') && e.target?.kind === 'champion' && e.target.team !== M.me) atkBy.set(e.actor.index + ':' + e.round, 1);
  for (let r = 5; r < M.meta.finalRound - 1; r++) {
    const s = M.snapAt(r), s2 = M.snapAt(r + 1); if (!s || !s2) continue;
    const my = s.champions.filter((c) => c.team === M.me && c.alive && c.pos), en = s.champions.filter((c) => c.team !== M.me && c.alive && c.pos);
    for (const c of my) {
      if (M.spawn && cheb(c.pos, M.spawn) <= 3) continue;
      const near = en.filter((x) => cheb(x.pos, c.pos) <= 5); if (!near.length) continue;
      const tgt = near.reduce((a, b) => (cheb(a.pos, c.pos) <= cheb(b.pos, c.pos) ? a : b));
      const d0 = cheb(tgt.pos, c.pos);
      const c2 = s2.champions.find((x) => x.id === c.id), t2 = s2.champions.find((x) => x.id === tgt.id);
      if (!c2?.alive || !c2.pos) continue;
      const allies = my.filter((x) => x.id !== c.id && cheb(x.pos, c.pos) <= 5).length + 1;
      const hp = c.hp / c.maxHp, ehp = tgt.hp / tgt.maxHp;
      const attacked = atkBy.has(c.id + ':' + r);
      const d1 = t2?.pos ? cheb(t2.pos, c2.pos) : d0;
      const myMove = cheb(c.pos, c2.pos);
      const act = attacked ? 'attack' : myMove === 0 ? 'stay' : cheb(c2.pos, tgt.pos) < d0 ? 'approach' : cheb(c2.pos, tgt.pos) > d0 ? 'retreat' : 'side';
      const role = ranged.has(c.type) ? 'ranged' : 'melee';
      add(`${role} hp${hp < 0.4 ? '<40' : hp < 0.7 ? '40-70' : '70+'}`, act);
      add(`${role} num ${allies >= near.length + 1 ? 'adv' : allies === near.length ? 'even' : 'disadv'}`, act);
      add(`${role} ehp${ehp < 0.4 ? '<40' : ehp < 0.7 ? '40-70' : '70+'}`, act);
      add(`${role} gems${c.gems > 0 ? '>0' : '0'}`, act);
      add(`${role} d${d0}`, act);
    }
  }
}
for (const [k, v] of Object.entries(T).sort()) { const n = Object.values(v).reduce((s, x) => s + x, 0); console.log(k.padEnd(22), 'n', String(n).padStart(5), Object.entries(v).sort().map(([a, b]) => `${a}:${(b / n).toFixed(2)}`).join(' ')); }
