// Fight / recall / tribute-chaining micro-analysis.
//   node analysis/shink/q_fight.mjs <dir> [--recent N] [--team name] [--side a|b]
import { dumpReplay } from '../../tools/replay_dump.mjs';
import { listRows } from './lib.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const rows = listRows(args[0], { recent: +opt('recent', 30), side: opt('side'), teamName: opt('team', 'Agentic Loop Builders'), map: opt('map') });
const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
const RANGED = new Set(['Cassi', 'VesperVale', 'Stellar', 'Prism', 'Willow', 'Tavi']);
const inc = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };
const st = { inRange: 0, atkChamp: 0, atkCamp: 0, other: 0, byHp: {}, byHpAtk: {}, byAdv: {}, byAdvAtk: {}, visible: 0, approach: 0, retreat: 0, hold: 0, visByHp: {}, visRetreatByHp: {} };
const recall = { n: 0, hiHp: 0, nextShop: 0, enemyNear: 0, byReason: {} };
const shield = { n: 0, ctx: {} };
const dash = { n: 0, ctx: {} };
for (const r of rows) {
  const d = await dumpReplay(r.path, { snapshots: 'round' });
  const me = r.me;
  const snaps = d.snapshots.filter((s) => s.champions.length);
  const at = new Map(); for (const s of snaps) if (!at.has(s.round)) at.set(s.round, s);
  const evByRoundActor = new Map();
  for (const e of d.events) if (e.actor?.kind === 1) { const k = e.round + ':' + e.actor.index; (evByRoundActor.get(k) || evByRoundActor.set(k, []).get(k)).push(e); }
  for (const s of snaps) {
    const nxt = at.get(s.round + 1); if (!nxt) continue;
    const mine = s.champions.filter((c) => c.team === me && c.alive && c.pos);
    const foes = s.champions.filter((c) => c.team !== me && c.alive && c.pos);
    for (const c of mine) {
      const rng = RANGED.has(c.type) ? 3 : 1;
      const evs = evByRoundActor.get(s.round + ':' + c.id) || [];
      const hpB = Math.min(9, Math.floor(10 * c.hp / c.maxHp));
      const near = foes.filter((f) => cheb(f.pos, c.pos) <= 6);
      if (near.length) {
        // approach/retreat relative to nearest foe within 6
        const f = near.sort((a, b) => cheb(a.pos, c.pos) - cheb(b.pos, c.pos))[0];
        const c2 = nxt.champions.find((x) => x.id === c.id);
        if (c2?.pos && c2.alive) {
          const d0 = cheb(f.pos, c.pos), d1 = cheb(f.pos, c2.pos);
          st.visible++; inc(st.visByHp, hpB);
          if (d1 < d0) st.approach++; else if (d1 > d0) { st.retreat++; inc(st.visRetreatByHp, hpB); } else st.hold++;
        }
      }
      const inR = foes.filter((f) => cheb(f.pos, c.pos) <= rng);
      if (!inR.length) continue;
      st.inRange++; inc(st.byHp, hpB);
      const allies = mine.filter((a) => cheb(a.pos, c.pos) <= 5).length;
      const enemies = foes.filter((a) => cheb(a.pos, c.pos) <= 5).length;
      const adv = Math.max(-2, Math.min(2, allies - enemies));
      inc(st.byAdv, adv);
      const a = evs.find((e) => e.kind === 'Attack');
      if (a?.target?.kind === 'champion' && a.target.team !== me) { st.atkChamp++; inc(st.byHpAtk, hpB); inc(st.byAdvAtk, adv); }
      else if (a?.target?.kind === 'camp') st.atkCamp++; else st.other++;
    }
  }
  // recall contexts
  for (const e of d.events.filter((x) => x.kind === 'Recall' && x.team === me && x.actor?.kind === 1)) {
    const s = at.get(e.round); const c = s?.champions.find((x) => x.id === e.actor.index); if (!c) continue;
    recall.n++;
    const hp = c.hp / c.maxHp;
    const foeNear = s.champions.some((f) => f.team !== me && f.alive && f.pos && c.pos && cheb(f.pos, c.pos) <= 8);
    if (foeNear) recall.enemyNear++;
    const shopSoon = d.events.some((x) => x.kind === 'Shop' && x.actor?.index === c.id && x.round > e.round && x.round <= e.round + 8);
    if (shopSoon) recall.nextShop++;
    const reason = hp < 0.5 ? 'lowHp' : (c.gold >= 150 ? 'gold150' : (c.gems > 0 ? 'carryingGems' : 'other'));
    inc(recall.byReason, reason);
  }
  for (const e of d.events.filter((x) => x.kind === 'Cast ability' && x.team === me && x.actor?.kind === 1 && (x.abilityType === 'Shield' || x.abilityType === 'Dash'))) {
    const s = at.get(e.round); const c = s?.champions.find((x) => x.id === e.actor.index); if (!c?.pos) continue;
    const foeNear = s.champions.some((f) => f.team !== me && f.alive && f.pos && cheb(f.pos, c.pos) <= 4);
    const campNear = s.camps.some((k) => k.hp > 0 && k.pos[0] >= 0 && cheb(k.pos, c.pos) <= 3);
    const o = e.abilityType === 'Shield' ? shield : dash; o.n++;
    inc(o.ctx, `${foeNear ? 'foe' : ''}${campNear ? 'camp' : ''}${!foeNear && !campNear ? 'none' : ''} hp${Math.floor(10 * c.hp / c.maxHp)}`);
  }
}
console.log('enemy in attack range rounds', st.inRange, 'attackedChamp', (st.atkChamp / st.inRange).toFixed(2), 'attackedCamp', (st.atkCamp / st.inRange).toFixed(2), 'other', (st.other / st.inRange).toFixed(2));
console.log('P(attack champ | in range) by own hp decile', Object.keys(st.byHp).sort().map((k) => `${k}:${((st.byHpAtk[k] || 0) / st.byHp[k]).toFixed(2)}(${st.byHp[k]})`).join(' '));
console.log('P(attack champ | in range) by allies-enemies within 5', Object.keys(st.byAdv).sort().map((k) => `${k}:${((st.byAdvAtk[k] || 0) / st.byAdv[k]).toFixed(2)}(${st.byAdv[k]})`).join(' '));
console.log('foe within 6: approach', (st.approach / st.visible).toFixed(2), 'retreat', (st.retreat / st.visible).toFixed(2), 'hold', (st.hold / st.visible).toFixed(2), 'n', st.visible);
console.log('P(retreat | foe within 6) by hp decile', Object.keys(st.visByHp).sort().map((k) => `${k}:${((st.visRetreatByHp[k] || 0) / st.visByHp[k]).toFixed(2)}`).join(' '));
console.log('recalls', recall.n, 'enemyWithin8', (recall.enemyNear / recall.n).toFixed(2), 'shopWithin8', (recall.nextShop / recall.n).toFixed(2), JSON.stringify(recall.byReason));
const topc = (o) => Object.entries(o.ctx).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => `${k}:${v}`).join('  ');
console.log('shield ctx', shield.n, topc(shield));
console.log('dash ctx', dash.n, topc(dash));
