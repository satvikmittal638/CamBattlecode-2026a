// Extractor: Fish's discrete decisions with context (shop, recall, tribute, ward, priority) and
// one 'game' row per replay. Used by tools/fish/run.mjs.
const cheb = (ax, ay, bx, by) => Math.max(Math.abs(ax - bx), Math.abs(ay - by));
const rectDist = (r, x, y) => Math.max(Math.max(r.minX - x, 0, x - r.maxX), Math.max(r.minY - y, 0, y - r.maxY));
const SHARDS = (items) => Object.entries(items || {}).reduce((s, [i, n]) => s + n * ((+i & 1) ? (Math.floor(+i / 6) === 1 ? 6 : 5) : 1), 0);
export function init({ row, team, start }) {
  return { row, team, mi: start.mapInfo, types: new Map(), last: new Map(), prioSeen: new Map(), rounds: 0, sub: [0, 0], recalls: [] };
}
function ctx(s, t) {
  const me = t.self; const x = me.x, y = me.y;
  let nE = 0, nE4 = 0, dE = 99, ePow = 0, aPow = 0, nA = 0;
  for (const e of t.en) { const d = cheb(x, y, e.x, e.y); dE = Math.min(dE, d); if (d <= 8) { nE++; ePow += e.hp * (e.str + 0.6 * e.foc); } if (d <= 4) nE4++; }
  for (const a of t.al) { const d = cheb(x, y, a.x, a.y); if (d <= 6) { nA++; aPow += a.hp * (a.str + 0.6 * a.foc); } }
  const altar = s.mi.altars.reduce((m, [ax, ay]) => Math.min(m, cheb(x, y, ax, ay)), 99);
  return { r: t.r, ty: t.t, hpf: me.mhp ? +(me.hp / me.mhp).toFixed(3) : 0, hp: me.hp, gold: me.gold, gems: me.gems, shards: SHARDS(me.items),
    dHome: rectDist(s.mi.spawn[s.team], x, y), dAltar: altar, dE, nE, nE4, nA, pow: +(((me.hp || 0) * ((me.str || 0) + 0.6 * (me.foc || 0)) + aPow) / 1000).toFixed(1), ePow: +(ePow / 1000).toFixed(1),
    cd0: me.cd?.[0], cd1: me.cd?.[1], sub: t.sub };
}
export function turn(s, t) {
  s.rounds = Math.max(s.rounds, t.r); s.sub = t.sub; s.types.set(t.c, t.t);
  const out = []; const me = t.self;
  for (const a of t.acts) {
    if (a.k === 'Shop') out.push({ k: 'shop', ...ctx(s, t), items: a.items, goldAfter: a.goldAfter, dead: me.dead ? 1 : 0 });
    else if (a.k === 'Recall') out.push({ k: 'recall', ...ctx(s, t) });
    else if (a.k === 'Submit gems') out.push({ k: 'tribute', ...ctx(s, t), to: a.to, allyGems: t.al.filter((x) => cheb(x.x, x.y, me.x, me.y) <= 3).reduce((q, x) => q + (x.gems || 0), 0) });
    else if (a.k === 'Place ward') out.push({ k: 'ward', ...ctx(s, t), wx: a.to[0] - me.x, wy: a.to[1] - me.y, wd: cheb(a.to[0], a.to[1], me.x, me.y), wdHome: rectDist(s.mi.spawn[s.team], a.to[0], a.to[1]), wdAltar: s.mi.altars.reduce((m, [ax, ay]) => Math.min(m, cheb(a.to[0], a.to[1], ax, ay)), 99), bush: s.mi.bushes[a.to[1] * s.mi.width + a.to[0]] });
    else if (a.k === 'Cancel channel') out.push({ k: 'cancel', ...ctx(s, t), chLeft: me.ch, st: me.st });
    else if (a.k === 'Consumable' || a.k === 'Place altar lock') out.push({ k: a.k === 'Consumable' ? 'consumable' : 'altarlock', ...ctx(s, t), to: a.to });
    else if (a.k === 'Set priority') out.push({ k: 'prio', ...ctx(s, t), v: a.v, prev: me.prio });
  }
  return out;
}
export function end(s) {
  const r = s.row;
  return [{ k: 'game', map: r.map, opp: r.opponent, result: r.result, score: r.score, oppScore: r.oppScore, rounds: r.rounds, endReason: r.endReason, draft: r.myDraft, oppDraft: r.oppDraft, side: r.side, types: [...s.types.values()] }];
}
