// Extractor: what a champion does after becoming free (capture paid out, respawn/recall arrival at
// home, tribute completed): next significant action within 80 rounds (tribute, camp, recall, fight),
// with context at the free moment.
const cheb = (ax, ay, bx, by) => Math.max(Math.abs(ax - bx), Math.abs(ay - by));
const rectDist = (r, x, y) => Math.max(Math.max(r.minX - x, 0, x - r.maxX), Math.max(r.minY - y, 0, y - r.maxY));
export function init({ row, team, start }) { return { row, team, mi: start.mapInfo, prev: new Map(), pend: new Map(), out: [] }; }
function close(s, c, what, t, extra = {}) {
  const p = s.pend.get(c); if (!p) return; s.pend.delete(c);
  if (t.r - p.r > 80) return;
  s.out.push({ ...p, next: what, delay: t.r - p.r, ...extra });
}
export function turn(s, t) {
  const me = t.self; const c = t.c; const prev = s.prev.get(c);
  const onHome = me.x !== undefined && rectDist(s.mi.spawn[s.team], me.x, me.y) === 0;
  let why = null;
  if (prev) {
    if (prev.dead && !me.dead) why = 'respawn';
    else if (!me.dead && onHome && !prev.onHome) why = 'home';
    else if (!me.dead && !onHome && (me.gems > prev.gems + 0 && me.gold > prev.gold)) why = 'capture';
    else if (!me.dead && prev.gems > 0 && me.gems === 0 && prev.submitting) why = 'tribute';
  }
  s.prev.set(c, { dead: !!me.dead, onHome, gems: me.gems ?? 0, gold: me.gold ?? 0, submitting: !!(me.st & 4) });
  // resolution by this turn's actions
  for (const a of t.acts) {
    if (a.k === 'Submit gems') { close(s, c, 'tribute', t); break; }
    if (a.k === 'Recall') { close(s, c, 'recall', t); break; }
    if ((a.k === 'Attack' || a.k === 'Cast ability') && a.tk === 'champion' && a.tteam !== s.team) { close(s, c, 'fight', t); break; }
    if ((a.k === 'Attack' || a.k === 'Cast ability') && a.tk === 'camp') { close(s, c, 'camp', t, { campType: a.tt }); break; }
  }
  if (why && !me.dead) {
    const x = me.x, y = me.y;
    const camps = t.cp.filter((q) => q.hp > 0).map((q) => cheb(x, y, q.x, q.y));
    s.pend.set(c, { g: s.row.matchId, map: s.row.map, r: t.r, ty: t.t, why, gems: me.gems, gold: me.gold, hpf: +(me.hp / Math.max(1, me.mhp)).toFixed(3),
      dAltar: s.mi.altars.reduce((m, [ax, ay]) => Math.min(m, cheb(x, y, ax, ay)), 99), dHome: rectDist(s.mi.spawn[s.team], x, y),
      dCampVis: camps.length ? Math.min(...camps) : 99, nE: t.en.length, allyGems: t.al.reduce((q, a) => q + (a.gems || 0), 0), subDiff: (t.sub?.[0] ?? 0) - (t.sub?.[1] ?? 0) });
  }
  const o = s.out.splice(0); return o;
}
