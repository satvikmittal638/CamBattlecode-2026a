#!/usr/bin/env node
// Deep-dive aggregates of one side's decision patterns.
//   node analysis/mite/deep.mjs <dir> [--recent N] [--kind ranked|unranked|all] [--side a|b] [--map m] [--opponent o] [--skip K]
// <dir>: top_replays/1_Mite (uses index.json side) or a folder of replays (needs --side).
import { loadRows, loadMatch, cheb, mean, median, pct, inc, top, hist } from './lib.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const dir = args[0];
const rows = loadRows(dir, { recent: +opt('recent', 60), kind: opt('kind', 'all'), side: opt('side'), opponent: opt('opponent'), map: opt('map'), skip: +opt('skip', 0) });
const sections = (opt('sections', 'all')).split(',');
const want = (s) => sections.includes('all') || sections.includes(s);

const A = {
  prio: {}, prio1000: [], recall: {}, submit: {}, shop: {}, emblemOrder: {}, ward: {}, abil: {}, atkSel: { n: 0, lowestHp: 0, lowestFrac: 0, mostGems: 0, closest: 0, onlyOne: 0 },
  capOrder: {}, capShare: [], campAtk: {}, pairs: {}, deaths: { byChamp: 0, byCamp: 0, gemsLost: [] }, altarChoice: { nearest: 0, other: 0 }, firstMoves: {},
  champVsCamp: { bothAvail: 0, choseChamp: 0 }, engage: { n: 0, attacked: 0, fled: 0 }, kills: [], gems: [], subPerChamp: {},
};

const enemyPosAt = (M, r) => (M.snapAt(r)?.champions || []).filter((c) => c.team !== M.me && c.alive && c.pos);
const allyAt = (M, r) => (M.snapAt(r)?.champions || []).filter((c) => c.team === M.me);

for (const row of rows) {
  let M;
  try { M = await loadMatch(row); } catch (e) { console.error('skip', row.file, e.message); continue; }
  if (M.me == null) continue;
  const ev = M.d.events;
  const mine = ev.filter((e) => e.actor?.kind === 1 && M.myIds.includes(e.actor.index));
  const T = (id) => M.typeOf[id];
  const map = M.map;

  // ---------- priorities
  if (want('prio')) for (const e of mine.filter((x) => x.kind === 'Set priority')) {
    const k = T(e.actor.index); (A.prio[k] ??= {}); inc(A.prio[k], e.priority);
    if (e.priority >= 1000) {
      const c = M.champAt(e.round, e.actor.index); const en = enemyPosAt(M, e.round);
      const dE = en.length ? Math.min(...en.map((x) => cheb(x.pos, c.pos))) : 99;
      const nxt = mine.filter((x) => x.actor.index === e.actor.index && x.round >= e.round && x.round <= e.round + 2 && x.kind !== 'Set priority' && x.kind !== 'Move').map((x) => x.kind + (x.target ? ':' + x.target.kind : ''));
      const dAlt = map ? Math.min(...map.altars.map((a) => cheb(a, c.pos))) : -1;
      A.prio1000.push({ t: k, hp: +(c.hp / c.maxHp).toFixed(2), gems: c.gems, dE, dAlt, nxt: [...new Set(nxt)].join('|') });
    }
  }

  // ---------- recalls
  if (want('recall')) for (const e of mine.filter((x) => x.kind === 'Recall')) {
    const id = e.actor.index, c = M.champAt(e.round, id); if (!c?.pos) continue;
    const en = enemyPosAt(M, e.round); const dE = en.length ? Math.min(...en.map((x) => cheb(x.pos, c.pos))) : 99;
    const R = (A.recall[T(id)] ??= { n: 0, hp: [], gold: [], gems: [], dSpawn: [], dEnemy: [], completed: 0, round: [] });
    R.n++; R.hp.push(c.hp / c.maxHp); R.gold.push(c.gold); R.gems.push(c.gems); R.dSpawn.push(M.spawn ? cheb(c.pos, M.spawn) : -1); R.dEnemy.push(dE); R.round.push(e.round);
    const later = M.champAt(e.round + 7, id); if (later?.pos && M.spawn && cheb(later.pos, M.spawn) <= 3) R.completed++;
  }

  // ---------- submits
  if (want('submit')) for (const e of mine.filter((x) => x.kind === 'Submit gems')) {
    const id = e.actor.index, c = M.champAt(e.round, id); if (!c?.pos) continue;
    const S = (A.submit[T(id)] ??= { n: 0, gems: [], hp: [], round: [] });
    S.n++; S.gems.push(e.gemsCarried); S.hp.push(c.hp / c.maxHp); S.round.push(e.round);
    // which altar: nearest to own spawn? nearest to current position?
  }

  // ---------- shop & emblem order
  if (want('shop')) {
    for (const id of M.myIds) {
      const t = T(id); const order = []; const shops = mine.filter((x) => x.actor.index === id && x.kind === 'Shop');
      const SH = (A.shop[t] ??= { trips: 0, goldBefore: [], round1: [], itemsFirst: {} });
      let lastRound = -9;
      for (const e of shops) {
        for (const [it, n] of Object.entries(e.items || {})) if (n > 0 && it.includes('Emblem')) order.push(it.replace(' Emblem of ', ':') + '@' + e.round);
        if (e.round !== lastRound) { SH.trips++; const c = M.champAt(e.round, id); if (c) SH.goldBefore.push(c.gold); lastRound = e.round; }
      }
      const key = order.map((x) => x.split('@')[0]).slice(0, 6).join(' > ') || '(none)';
      (A.emblemOrder[t] ??= {}); inc(A.emblemOrder[t], key);
      if (order.length) SH.round1.push(+order[0].split('@')[1]);
      // first shard bought
      const first = shops.flatMap((e) => Object.entries(e.items || {}).filter(([it, n]) => n > 0 && !it.includes('Emblem')).map(([it]) => it));
      if (first.length) inc(SH.itemsFirst, first[0]);
    }
  }

  // ---------- wards
  if (want('ward')) {
    const last = {};
    for (const e of mine.filter((x) => x.kind === 'Place ward')) {
      const id = e.actor.index, t = T(id), c = M.champAt(e.round, id);
      const W = (A.ward[t] ??= { n: 0, perGame: 0, dSelf: {}, onBush: 0, gap: [], dPrev: [], nearCamp: 0, round1: 0 });
      W.n++;
      if (c?.pos) inc(W.dSelf, cheb(c.pos, e.to));
      if (map?.bush.has(e.to[0] + ',' + e.to[1])) W.onBush++;
      if (map) { const dc = Math.min(...map.groups.flatMap((g) => g.camps.map((cc) => cheb([cc.x, cc.y], e.to)))); if (dc <= 4) W.nearCamp++; }
      if (last[id]) { W.gap.push(e.round - last[id].round); W.dPrev.push(cheb(last[id].to, e.to)); }
      if (e.round <= 5) W.round1++;
      last[id] = e;
    }
    for (const id of M.myIds) { const W = A.ward[T(id)]; if (W) W.perGame += 0; }
  }

  // ---------- abilities with context
  if (want('abil')) for (const e of mine.filter((x) => x.kind === 'Cast ability')) {
    const id = e.actor.index, t = T(id), c = M.champAt(e.round, id); if (!c?.pos) continue;
    const en = enemyPosAt(M, e.round); const dE = en.length ? Math.min(...en.map((x) => cheb(x.pos, c.pos))) : 99;
    const key = t + ':' + e.abilityType;
    const B = (A.abil[key] ??= { n: 0, tgt: {}, hp: [], dEnemy: [], tgtHpFrac: [], dashDist: [], ctx: {} });
    B.n++; inc(B.tgt, e.target ? e.target.kind + ':' + (e.target.type || '') : 'tile'); B.hp.push(c.hp / c.maxHp); B.dEnemy.push(dE);
    if (e.target?.kind === 'champion' && e.target.team === M.me && e.target.id !== id) { const tc = M.champAt(e.round, e.target.id); if (tc) B.tgtHpFrac.push(tc.hp / tc.maxHp); }
    if (e.abilityType === 'Dash') B.dashDist.push(cheb(e.from, e.to));
    // context: was the champion fighting a champion / camp this round?
    const sameRound = mine.filter((x) => x.actor.index === id && Math.abs(x.round - e.round) <= 1 && x.kind === 'Attack');
    const ctx = sameRound.some((x) => x.target?.kind === 'champion') ? 'vsChamp' : sameRound.some((x) => x.target?.kind === 'camp') ? 'vsCamp' : 'noAttack';
    inc(B.ctx, ctx);
  }

  // ---------- attack target selection vs champions
  if (want('atk')) for (const e of mine.filter((x) => x.kind === 'Attack')) {
    const id = e.actor.index, c = M.champAt(e.round, id); if (!c?.pos) continue;
    const range = ['Cassi', 'Willow', 'VesperVale', 'Stellar', 'Prism', 'Tavi'].includes(T(id)) ? 3 : 1;
    const en = enemyPosAt(M, e.round).filter((x) => cheb(x.pos, c.pos) <= range + 1);
    if (e.target?.kind === 'camp') { inc(A.campAtk, T(id) + ':' + e.target.type); if (en.length) { A.champVsCamp.bothAvail++; } continue; }
    if (e.target?.kind !== 'champion' || e.target.team === M.me) continue;
    if (en.length) { A.champVsCamp.bothAvail++; A.champVsCamp.choseChamp++; }
    if (en.length < 2) { A.atkSel.onlyOne++; continue; }
    const tgt = en.find((x) => x.id === e.target.id); if (!tgt) continue;
    A.atkSel.n++;
    if (tgt.hp <= Math.min(...en.map((x) => x.hp))) A.atkSel.lowestHp++;
    if (tgt.hp / tgt.maxHp <= Math.min(...en.map((x) => x.hp / x.maxHp)) + 1e-9) A.atkSel.lowestFrac++;
    if (tgt.gems >= Math.max(...en.map((x) => x.gems))) A.atkSel.mostGems++;
    if (cheb(tgt.pos, c.pos) <= Math.min(...en.map((x) => cheb(x.pos, c.pos)))) A.atkSel.closest++;
  }

  // ---------- captures: which groups, order, sharing
  if (want('cap') && map) {
    const caps = ev.filter((e) => e.kind === 'Capture' && e.team === M.me);
    const order = [];
    for (const e of caps) {
      // champions of mine standing on a camp tile at the capture round
      const cs = allyAt(M, e.round + 1).filter((c) => c.alive && c.pos && map.campAt.has(c.pos[0] + ',' + c.pos[1]));
      const prev = allyAt(M, e.round).filter((c) => c.alive && c.pos && map.campAt.has(c.pos[0] + ',' + c.pos[1]));
      const on = cs.length ? cs : prev;
      if (!on.length) { order.push('?'); continue; }
      const g = map.groups[map.campAt.get(on[0].pos[0] + ',' + on[0].pos[1])];
      const dS = Math.round(cheb([g.cx, g.cy], M.spawn)); const dE = Math.round(cheb([g.cx, g.cy], M.espawn));
      order.push(`${g.kind}@${dS}/${dE}`);
      A.capShare.push(on.filter((c) => map.campAt.get(c.pos[0] + ',' + c.pos[1]) === g.id).length);
    }
    (A.capOrder[M.mapName] ??= []).push(order.slice(0, 10).join(' '));
  }

  // ---------- pairwise proximity
  if (want('pairs')) {
    for (let r = 10; r < M.meta.finalRound; r += 5) {
      const cs = allyAt(M, r).filter((c) => c.alive && c.pos);
      for (const a of cs) for (const b of cs) if (a.id < b.id) { const k = [a.type, b.type].sort().join('-'); (A.pairs[k] ??= []).push(cheb(a.pos, b.pos)); }
    }
  }

  // ---------- deaths
  if (want('death')) {
    for (const e of ev.filter((x) => x.kind === 'Attack' || x.kind === 'Cast ability')) {
      if (e.target?.kind !== 'champion' || e.target.team !== M.me) continue;
      const before = M.champAt(e.round, e.target.id), after = M.champAt(e.round + 1, e.target.id);
      if (before?.alive && after && !after.alive) {
        // count once per death: mark
        const key = e.target.id + ':' + e.round; if (A.deaths['_' + key]) continue; A.deaths['_' + key] = 1;
        if (e.actor.kind === 1) A.deaths.byChamp++; else A.deaths.byCamp++;
        A.deaths.gemsLost.push(before.gems);
      }
    }
  }
  A.kills.push(M.meta.finalChampions.filter((c) => c.team === M.me).reduce((s, c) => s + c.kills, 0));

  // ---------- first moves (opening): position of each champion at round 30 relative to spawn
  if (want('open') && map) {
    for (const id of M.myIds) {
      const c = M.champAt(30, id); if (!c?.pos) continue;
      // nearest group to the champion at round 30
      let best = null, bd = 1e9; for (const g of map.groups) { const dd = cheb([g.cx, g.cy], c.pos); if (dd < bd) { bd = dd; best = g; } }
      (A.firstMoves[M.mapName] ??= {}); inc(A.firstMoves[M.mapName], `${T(id)}->${best.kind}#${best.id}`);
    }
  }
}

const fmt = (o) => JSON.stringify(o);
if (want('prio')) {
  console.log('== PRIORITY values set per champion'); for (const [k, v] of Object.entries(A.prio)) console.log(' ', k, fmt(top(v, 12)));
  console.log('== priority>=1000 contexts n=' + A.prio1000.length);
  const ctx = {}; for (const p of A.prio1000) inc(ctx, `${p.nxt || '-'}`); console.log('  next actions', fmt(top(ctx, 15)));
  console.log('  hp', fmt(pct(A.prio1000.map((p) => p.hp))), 'gems', fmt(pct(A.prio1000.map((p) => p.gems))), 'dEnemy', fmt(pct(A.prio1000.map((p) => p.dE))), 'dAltar', fmt(pct(A.prio1000.map((p) => p.dAlt))));
}
if (want('recall')) {
  console.log('== RECALL');
  for (const [k, R] of Object.entries(A.recall)) console.log(' ', k, 'n', R.n, 'completed', R.completed, '\n    hp', fmt(pct(R.hp)), '\n    gold', fmt(pct(R.gold)), '\n    gems', fmt(pct(R.gems)), '\n    dSpawn', fmt(pct(R.dSpawn)), 'dEnemy', fmt(pct(R.dEnemy)), '\n    hpHist', fmt(hist(R.hp.map((x) => x * 100), 10)), '\n    goldHist', fmt(hist(R.gold, 50)));
}
if (want('submit')) {
  console.log('== SUBMIT');
  for (const [k, S] of Object.entries(A.submit)) console.log(' ', k, 'n', S.n, 'gems', fmt(pct(S.gems)), 'mean', mean(S.gems), 'hp', fmt(pct(S.hp)), '\n    gemsHist', fmt(hist(S.gems, 10)));
}
if (want('shop')) {
  console.log('== SHOP / EMBLEM ORDER');
  for (const [k, S] of Object.entries(A.shop)) console.log(' ', k, 'trips', S.trips, 'goldBefore', fmt(pct(S.goldBefore)), 'firstEmblemRound', fmt(pct(S.round1)), 'firstShard', fmt(top(S.itemsFirst, 4)));
  for (const [k, o] of Object.entries(A.emblemOrder)) { console.log(' ', k); for (const [b, n] of Object.entries(top(o, 6))) console.log('     ', n, b); }
}
if (want('ward')) {
  console.log('== WARDS');
  for (const [k, W] of Object.entries(A.ward)) console.log(' ', k, 'n', W.n, 'onBush', W.onBush, 'nearCamp<=4', W.nearCamp, 'early', W.round1, 'dSelf', fmt(W.dSelf), 'gap', fmt(pct(W.gap)), 'dPrev', fmt(pct(W.dPrev)));
}
if (want('abil')) {
  console.log('== ABILITIES');
  for (const [k, B] of Object.entries(A.abil)) console.log(' ', k, 'n', B.n, 'tgt', fmt(top(B.tgt, 6)), 'ctx', fmt(B.ctx), '\n     hp', fmt(pct(B.hp)), 'dEnemy', fmt(pct(B.dEnemy)), B.tgtHpFrac.length ? 'allyTgtHp ' + fmt(pct(B.tgtHpFrac)) : '', B.dashDist.length ? 'dashDist ' + fmt(hist(B.dashDist, 1)) : '');
}
if (want('atk')) {
  console.log('== ATTACK selection (multi-enemy in range)', fmt(A.atkSel), 'champ-vs-camp', fmt(A.champVsCamp));
  console.log('  camp attacks by champ', fmt(top(A.campAtk, 30)));
}
if (want('cap')) {
  console.log('== CAPTURE ORDER (group kind @ dist own spawn / dist enemy spawn)');
  for (const [m, os] of Object.entries(A.capOrder)) { console.log(' ', m); for (const o of os.slice(0, 6)) console.log('     ', o); }
  console.log('  champions on capture tile', fmt(hist(A.capShare, 1)));
}
if (want('pairs')) {
  console.log('== PAIR DISTANCES (median, frac<=3)');
  for (const [k, v] of Object.entries(A.pairs).sort()) console.log(' ', k, median(v), +(v.filter((x) => x <= 3).length / v.length).toFixed(2));
}
if (want('death')) console.log('== DEATHS', fmt({ byChamp: A.deaths.byChamp, byCamp: A.deaths.byCamp, gemsLost: pct(A.deaths.gemsLost) }), 'kills/game', mean(A.kills));
if (want('open')) { console.log('== OPENING (champ -> nearest group at round 30)'); for (const [m, o] of Object.entries(A.firstMoves)) console.log(' ', m, fmt(top(o, 12))); }
