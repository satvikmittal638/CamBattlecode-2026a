// Extractor: every ability cast by the team with its target kind and fight context.
const cheb = (ax, ay, bx, by) => Math.max(Math.abs(ax - bx), Math.abs(ay - by));
export function init({ row, team, start }) { return { row, team }; }
export function turn(s, t) {
  const me = t.self; if (me.dead || me.x === undefined) return [];
  const out = [];
  const dE = t.en.reduce((m, e) => Math.min(m, cheb(me.x, me.y, e.x, e.y)), 99);
  const fight = t.hits.some((h) => h.r >= t.r - 2 && cheb(h.x, h.y, me.x, me.y) <= 6);
  for (const a of t.acts) {
    if (a.k !== 'Cast ability') continue;
    let tk = a.tk || 'ground'; if (tk === 'champion') tk = a.tteam === s.team ? 'ally/self' : 'enemy';
    out.push({ g: s.row.matchId, map: s.row.map, r: t.r, ty: t.t, ab: a.ab, slot: a.slot, tk, tt: a.tt, dE, fight: fight ? 1 : 0, hpf: +(me.hp / Math.max(1, me.mhp)).toFixed(2),
      dist: a.to ? cheb(me.x, me.y, a.to[0], a.to[1]) : null, campAwake: a.tk === 'camp' ? (t.cp.find((c) => c.id === a.tid)?.awake ?? null) : null });
  }
  return out;
}
