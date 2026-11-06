// Extractor: engagement decisions and fight target choice of one team's champions.
//  'eng' rows: quiet turns (no champion hits within 6 tiles of me in the last 3 rounds) with a
//    visible enemy within 7 -> did this champion open a fight (hit an enemy champion this turn)?
//  'tgt' rows: every hit on an enemy champion, with the candidate set (visible enemies the
//    champion could plausibly hit: within max(range,4)+1) and per-candidate features.
const cheb = (ax, ay, bx, by) => Math.max(Math.abs(ax - bx), Math.abs(ay - by));
const rectDist = (r, x, y) => Math.max(Math.max(r.minX - x, 0, x - r.maxX), Math.max(r.minY - y, 0, y - r.maxY));
const SHARDS = (items) => Object.entries(items || {}).reduce((s, [i, n]) => s + n * ((+i & 1) ? (Math.floor(+i / 6) === 1 ? 6 : 5) : 1), 0);
const SLOTS = { Ren: ['Cc', 'Dash'], Issac: ['AttackReset', 'Dash'], Varg: ['AttackReset', 'Shield'], Ryth: ['AoeDamage', 'AttackReset'], Stellar: ['Damage', 'AoeDamage'], Cassi: ['Damage', 'Cc'], Tavi: ['AttackReset', 'Cc'], Prism: ['Cc', 'AoeDamage'], Vendetta: ['AttackReset', 'Dash'] };
const RANGED = new Set(['Stellar', 'Cassi', 'Prism', 'Tavi', 'VesperVale', 'Marcella', 'Willow']);
const pow = (c) => (c.hp || 0) * ((c.str || 0) + 0.6 * (c.foc || 0)) / 1000;
const ready = (ty, cd, kind) => { const sl = SLOTS[ty] || []; for (let i = 0; i < 2; i++) if (sl[i] === kind && cd && cd[i] === 0) return 1; return 0; };
export function init({ row, team, start }) { return { row, team, mi: start.mapInfo }; }
function candFeat(s, t, me, e, al, en) {
  const d = cheb(me.x, me.y, e.x, e.y);
  const eAllies = en.filter((o) => o.c !== e.c && cheb(o.x, o.y, e.x, e.y) <= 4);
  const ourNear = [me, ...al].filter((o) => cheb(o.x, o.y, e.x, e.y) <= 4);
  return { d, ty: e.t, ranged: RANGED.has(e.t) ? 1 : 0, hp: e.hp, hpf: +(e.hp / Math.max(1, e.mhp)).toFixed(3), mhp: e.mhp, shards: SHARDS(e.items), gems: e.gems ?? 0,
    ch: e.ch, stunned: ((e.st >> 3) & 1) ? 0 : 1, recalling: (e.st >> 1) & 1, tributing: (e.st >> 2) & 1,
    eSup: eAllies.length, eSupPow: +eAllies.reduce((q, o) => q + pow(o), 0).toFixed(1), ourNear: ourNear.length, ourNearPow: +ourNear.reduce((q, o) => q + pow(o), 0).toFixed(1),
    eHome: rectDist(s.mi.spawn[1 - s.team], e.x, e.y), bush: s.mi.bushes[e.y * s.mi.width + e.x], ePow: +pow(e).toFixed(1),
    hitRecently: t.hits.some((h) => h.tg === e.c && h.at === s.team) ? 1 : 0 };
}
export function turn(s, t) {
  const me = t.self; if (me.dead || me.x === undefined || (me.st & 6)) return [];
  const al = t.al, en = t.en;
  if (!en.length) return [];
  const out = [];
  const hitActs = t.acts.filter((a) => (a.k === 'Attack' || a.k === 'Cast ability') && a.tk === 'champion' && a.tteam !== s.team);
  const near = en.map((e) => ({ e, d: cheb(me.x, me.y, e.x, e.y) })).sort((a, b) => a.d - b.d);
  const base = { g: s.row.matchId, map: s.row.map, r: t.r, ty: t.t, hpf: +(me.hp / Math.max(1, me.mhp)).toFixed(3), hp: me.hp, shards: SHARDS(me.items), gems: me.gems,
    ccReady: ready(t.t, me.cd, 'Cc'), dmgReady: ready(t.t, me.cd, 'Damage'), aoeReady: ready(t.t, me.cd, 'AoeDamage'), dashReady: ready(t.t, me.cd, 'Dash'), resetReady: ready(t.t, me.cd, 'AttackReset'), shieldReady: ready(t.t, me.cd, 'Shield'),
    myPow: +pow(me).toFixed(1), alPow6: +al.filter((a) => cheb(a.x, a.y, me.x, me.y) <= 6).reduce((q, a) => q + pow(a), 0).toFixed(1), nA6: al.filter((a) => cheb(a.x, a.y, me.x, me.y) <= 6).length,
    enPow8: +near.filter((x) => x.d <= 8).reduce((q, x) => q + pow(x.e), 0).toFixed(1), nE8: near.filter((x) => x.d <= 8).length,
    alCcReady: al.filter((a) => cheb(a.x, a.y, me.x, me.y) <= 6 && ready(a.t, a.cd, 'Cc')).length,
    dHome: rectDist(s.mi.spawn[s.team], me.x, me.y), subDiff: (t.sub?.[0] ?? 0) - (t.sub?.[1] ?? 0) };
  // engagement decision on quiet turns
  const quiet = !t.hits.some((h) => h.r >= t.r - 3 && cheb(h.x, h.y, me.x, me.y) <= 6);
  if (quiet && near[0].d <= 7) {
    const target = hitActs.length ? en.find((e) => e.c === hitActs[0].tid) : near[0].e;
    const firstMove = t.acts.find((a) => a.k === 'Move');
    const dAfter = firstMove ? cheb(firstMove.to[0], firstMove.to[1], near[0].e.x, near[0].e.y) : near[0].d;
    out.push({ k: 'eng', ...base, open: hitActs.length ? 1 : 0, openAb: hitActs[0]?.ab ?? (hitActs.length ? 'Attack' : null), approach: dAfter < near[0].d ? 1 : 0, retreat: dAfter > near[0].d ? 1 : 0,
      ...Object.fromEntries(Object.entries(candFeat(s, t, me, target || near[0].e, al, en)).map(([k, v]) => ['e_' + k, v])) });
  }
  // target choice
  for (const h of hitActs.slice(0, 1)) {
    const reach = Math.max(me.rng || 1, 4) + 1;
    const cands = en.filter((e) => cheb(me.x, me.y, e.x, e.y) <= reach);
    if (cands.length < 2 || !cands.some((e) => e.c === h.tid)) continue;
    out.push({ k: 'tgt', ...base, how: h.k === 'Attack' ? 'Attack' : h.ab, chosen: cands.findIndex((e) => e.c === h.tid), cands: cands.map((e) => candFeat(s, t, me, e, al, en)) });
  }
  return out;
}
