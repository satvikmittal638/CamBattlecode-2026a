// Extractor: team formation once every 5 rounds: positions of all alive champions of the team
// (allies are always visible), group structure (link distance <= 5), and each champion's
// position relative to own and enemy spawn.
const cheb = (ax, ay, bx, by) => Math.max(Math.abs(ax - bx), Math.abs(ay - by));
const rectDist = (r, x, y) => Math.max(Math.max(r.minX - x, 0, x - r.maxX), Math.max(r.minY - y, 0, y - r.maxY));
export function init({ row, team, start }) { return { row, team, mi: start.mapInfo, lastR: -1 }; }
export function turn(s, t) {
  if (t.r % 5 || t.r === s.lastR || t.self.dead || t.self.x === undefined) return [];
  s.lastR = t.r;
  const us = [{ c: t.c, t: t.t, x: t.self.x, y: t.self.y, gems: t.self.gems, hpf: t.self.hp / Math.max(1, t.self.mhp) }, ...t.al.map((a) => ({ c: a.c, t: a.t, x: a.x, y: a.y, gems: a.gems, hpf: a.hp / Math.max(1, a.mhp) }))];
  // union-find groups
  const p = us.map((_, i) => i); const f = (i) => (p[i] === i ? i : (p[i] = f(p[i])));
  for (let i = 0; i < us.length; i++) for (let j = i + 1; j < us.length; j++) if (cheb(us[i].x, us[i].y, us[j].x, us[j].y) <= 5) p[f(i)] = f(j);
  const groups = {}; us.forEach((u, i) => { (groups[f(i)] ??= []).push(u.t); });
  const nearestAlly = us.map((u, i) => us.reduce((m, v, j) => (j === i ? m : Math.min(m, cheb(u.x, u.y, v.x, v.y))), 99));
  const centroid = { x: us.reduce((q, u) => q + u.x, 0) / us.length, y: us.reduce((q, u) => q + u.y, 0) / us.length };
  const spread = us.reduce((q, u) => q + Math.max(Math.abs(u.x - centroid.x), Math.abs(u.y - centroid.y)), 0) / us.length;
  const W = s.mi.width, H = s.mi.height;
  return [{ g: s.row.matchId, map: s.row.map, r: t.r, n: us.length, groups: Object.values(groups).map((gr) => gr.sort().join('+')),
    pos: us.map((u) => ({ t: u.t, dOwn: rectDist(s.mi.spawn[s.team], u.x, u.y), dEn: rectDist(s.mi.spawn[1 - s.team], u.x, u.y), gems: u.gems, hpf: +u.hpf.toFixed(2) })),
    enVisible: t.en.length, nearestAlly, spread: +spread.toFixed(2) }];
}
