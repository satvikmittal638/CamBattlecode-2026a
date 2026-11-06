// Extractor: per-turn state -> action dataset for one team's champions (behaviour cloning).
// Keeps every turn with a visible enemy within 10 tiles and 1 in 4 other turns.
const cheb = (ax, ay, bx, by) => Math.max(Math.abs(ax - bx), Math.abs(ay - by));
const rectDist = (r, x, y) => Math.max(Math.max(r.minX - x, 0, x - r.maxX), Math.max(r.minY - y, 0, y - r.maxY));
const SHARDS = (items) => Object.entries(items || {}).reduce((s, [i, n]) => s + n * ((+i & 1) ? (Math.floor(+i / 6) === 1 ? 6 : 5) : 1), 0);
const RANGED = new Set(['Stellar', 'Cassi', 'Prism', 'Tavi', 'VesperVale', 'Marcella', 'Willow']);
const pow = (c) => (c.hp || 0) * ((c.str || 0) + 0.6 * (c.foc || 0)) / 1000;
export function init({ row, team, start }) { return { row, team, mi: start.mapInfo, n: 0, prevHp: new Map() }; }
export function turn(s, t) {
  const me = t.self; if (me.dead || me.x === undefined) return [];
  const flags = me.st || 0;
  if (flags & 6) return []; // recalling or submitting: no decision this turn
  const x = me.x, y = me.y;
  const en = t.en.map((e) => ({ ...e, d: cheb(x, y, e.x, e.y) })).sort((a, b) => a.d - b.d);
  const near = en[0];
  s.n++;
  if (!(near && near.d <= 10) && s.n % 4) return [];
  const al = t.al.map((a) => ({ ...a, d: cheb(x, y, a.x, a.y) }));
  let ePow8 = 0, ePow5 = 0, nE3 = 0, nE5 = 0, nE8 = 0;
  for (const e of en) { if (e.d <= 8) { ePow8 += pow(e); nE8++; } if (e.d <= 5) { ePow5 += pow(e); nE5++; } if (e.d <= 3) nE3++; }
  let aPow6 = pow(me), nA3 = 0, nA6 = 0;
  for (const a of al) { if (a.d <= 6) { aPow6 += pow(a); nA6++; } if (a.d <= 3) nA3++; }
  const camps = t.cp.filter((c) => c.hp > 0).map((c) => ({ ...c, d: cheb(x, y, c.x, c.y) })).sort((a, b) => a.d - b.d);
  const nc = camps[0];
  const awakeArmedNear = camps.filter((c) => c.awake && c.str > 0 && c.d <= 5).reduce((q, c) => q + c.str, 0);
  // action label: first significant action
  let label = 'idle', moveDelta = null, castAb = null;
  for (const a of t.acts) {
    if (a.k === 'Attack') { label = a.tk === 'champion' ? 'atk_champ' : a.tk === 'camp' ? 'atk_camp' : 'atk_other'; break; }
    if (a.k === 'Cast ability') { castAb = a.ab; label = a.tk === 'champion' ? (a.tteam === s.team ? 'cast_ally' : 'cast_champ') : a.tk === 'camp' ? 'cast_camp' : 'cast_ground'; if (a.ab === 'Dash' || a.ab === 'Shield' || a.ab === 'AttackReset') label = 'cast_self_' + a.ab; break; }
    if (a.k === 'Recall') { label = 'recall'; break; }
    if (a.k === 'Submit gems') { label = 'tribute'; break; }
    if (a.k === 'Move') {
      if (near && near.d <= 10) { const nd = cheb(a.to[0], a.to[1], near.x, near.y); moveDelta = nd - near.d; label = nd < near.d ? 'move_toward' : nd > near.d ? 'move_away' : 'move_side'; }
      else label = 'move';
      // keep looking: a move followed by an attack in the same turn counts as the attack
      continue;
    }
  }
  const any = (k) => t.acts.some((a) => a.k === k);
  const hitChamp = t.acts.some((a) => (a.k === 'Attack' || a.k === 'Cast ability') && a.tk === 'champion' && a.tteam !== s.team);
  const hitCamp = t.acts.some((a) => (a.k === 'Attack' || a.k === 'Cast ability') && a.tk === 'camp');
  return [{
    g: s.row.matchId, map: s.row.map, r: t.r, c: t.c, ty: t.t, ranged: RANGED.has(t.t) ? 1 : 0,
    hp: me.hp, hpf: +(me.hp / Math.max(1, me.mhp)).toFixed(3), mhp: me.mhp, str: me.str, foc: me.foc, shards: SHARDS(me.items), gold: me.gold, gems: me.gems,
    cd0: me.cd?.[0], cd1: me.cd?.[1], canMove: (flags >> 3) & 1, canAtk: (flags >> 4) & 1, canCast: (flags >> 11) & 1, prio: me.prio,
    dHome: rectDist(s.mi.spawn[s.team], x, y), dEnemyHome: rectDist(s.mi.spawn[1 - s.team], x, y), dAltar: s.mi.altars.reduce((m, [ax, ay]) => Math.min(m, cheb(x, y, ax, ay)), 99),
    nE3, nE5, nE8, ePow5: +ePow5.toFixed(1), ePow8: +ePow8.toFixed(1), nA3, nA6, aPow6: +aPow6.toFixed(1),
    eD: near ? near.d : 99, eTy: near?.t, eRanged: near ? (RANGED.has(near.t) ? 1 : 0) : null, eHpf: near ? +(near.hp / Math.max(1, near.mhp)).toFixed(3) : null, eHp: near?.hp, eGems: near?.gems, eShards: near ? SHARDS(near.items) : null,
    eCh: near ? near.ch : null, eCd0: near?.cd?.[0], eCd1: near?.cd?.[1], eCanMove: near ? (near.st >> 3) & 1 : null,
    minEHpf: en.filter((e) => e.d <= 5).reduce((m, e) => Math.min(m, e.hp / Math.max(1, e.mhp)), 1),
    cD: nc ? nc.d : 99, cTy: nc?.ty, cHp: nc?.hp, cAwake: nc?.awake, armedAwake5: awakeArmedNear,
    subDiff: (t.sub?.[0] ?? 0) - (t.sub?.[1] ?? 0),
    label, castAb, moveDelta, hitChamp: hitChamp ? 1 : 0, hitCamp: hitCamp ? 1 : 0, ward: any('Place ward') ? 1 : 0, nActs: t.acts.length,
  }];
}
