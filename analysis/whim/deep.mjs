// Deep behavioural profile of one side over many replays.
//   node analysis/whim/deep.mjs whim [--recent 60] [--kind ranked|unranked] [--from N]
//   node analysis/whim/deep.mjs <dirOfReplays> --side a|b|auto [--team NAME]  (local / platform replays)
// --team NAME with a platform group folder: picks the side whose draft... (auto: uses bc metadata if present)
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay, loadMap, loadIndex, cheb, mean, median, pct } from './lib.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
let rows;
if (args[0] === 'whim') {
  rows = loadIndex();
  if (opt('kind')) rows = rows.filter((r) => r.kind === opt('kind'));
  if (opt('map')) rows = rows.filter((r) => r.map === opt('map'));
  if (opt('opp')) rows = rows.filter((r) => (r.opponent || '').toLowerCase().includes(opt('opp').toLowerCase()));
  rows = rows.slice(+opt('from', 0), +opt('from', 0) + +opt('recent', 60));
} else {
  const files = [];
  const walk = (d) => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (f.endsWith('.repl26a')) files.push(p); } };
  walk(args[0]);
  rows = files.map((p) => ({ path: p, side: opt('side', 'a'), map: null }));
  if (opt('map')) rows = rows.filter((r) => path.basename(r.path).includes(opt('map')));
}
const MAPS = ['collision', 'corners', 'elkring', 'expanse', 'interlock', 'lanes', 'monolith', 'packs', 'rows'];
const mapCache = {};
function guessMap(d, r) {
  if (r.map) return r.map;
  const b = path.basename(r.path);
  for (const m of MAPS) if (b.includes(m)) return m;
  // match by size + first camp positions
  for (const m of MAPS) { const mm = (mapCache[m] ??= loadMap(m)); if (mm.W === d.meta.width && mm.H === d.meta.height && mm.groups.length === d.snapshots[1].groups.length) { const c0 = d.snapshots[1].camps[0]; if (mm.campAt.has(c0.pos.join(','))) return m; } }
  return null;
}

const A = { n: 0, wins: 0, gd: [], rounds: [], draft: {}, caps: [], capFirst: [], capLabels: {}, capShare: {}, open: {}, openSeq: {},
  trib: [], tribGems: [], tribFirst: [], tribHp: [], tribDistNearest: [], tribEnemyNear: 0, tribN: 0,
  rec: [], recHp: [], recGold: [], recGems: [], recSpawnDist: [], recReasons: {}, recCancel: 0,
  shopGold: [], deaths: [], kills: [], campDeaths: 0, champDeaths: 0,
  atk: { champion: 0, camp: 0, other: 0 }, campT: {}, monoAtk: 0,
  abil: {}, rounds100: 0, champRounds: {},
  locks: [], lockCtx: {}, lockRound: [],
  engage: {}, tgtChoice: { lowestHp: 0, notLowest: 0, single: 0 }, tgtType: {},
  enemyHalf: [], grouped: [], spawnDist: [], soloCampFrac: [],
  gemsAtDeath: [], carryMax: [], firstShopItems: {}, perMap: {},
  carryHist: {}, tribAfterCaps: [],
};
const inc = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };

for (const r of rows) {
  let d; try { d = await dumpReplay(r.path, { snapshots: 'round' }); } catch (e) { console.error('skip', r.path, e.message); continue; }
  const mapName = guessMap(d, r); if (!mapName) { console.error('no map for', r.path); continue; }
  const M = (mapCache[mapName] ??= loadMap(mapName));
  const me = r.side === 'b' ? 1 : 0;
  const m = d.meta;
  const won = m.outcome === (me === 0 ? 'teamA' : 'teamB');
  A.n++; if (won) A.wins++;
  const pm = (A.perMap[mapName] ??= { n: 0, w: 0, caps: [], trib: [], gd: [] }); pm.n++; if (won) pm.w++;
  A.gd.push(m.submittedGems[me] - m.submittedGems[1 - me]); pm.gd.push(A.gd.at(-1)); A.rounds.push(m.finalRound);
  inc(A.draft, (m.draft[me] || []).join(','));
  const myIds = new Set(m.finalChampions.filter((c) => c.team === me).map((c) => c.id));
  const typeOf = Object.fromEntries(m.finalChampions.map((c) => [c.id, c.type]));
  const snaps = d.snapshots; const byRound = new Map(); for (const s of snaps) if (!byRound.has(s.round)) byRound.set(s.round, s);
  const snapAt = (rd) => byRound.get(rd) || byRound.get(rd - 1);
  // spawn centres
  const s0 = snaps.find((s) => s.champions.length && s.champions.every((c) => c.pos));
  const cen = (t) => { const cs = s0.champions.filter((c) => c.team === t); return [cs.reduce((s, c) => s + c.pos[0], 0) / cs.length, cs.reduce((s, c) => s + c.pos[1], 0) / cs.length]; };
  const mySpawn = cen(me), enSpawn = cen(1 - me);
  const diag = Math.max(M.W, M.H);
  // camp id -> group
  const campGroup = {}; for (const c of s0 ? snaps[1].camps : []) campGroup[c.id] = M.campAt.get(c.pos.join(','));

  const ev = d.events.filter((e) => e.actor?.kind === 1 && myIds.has(e.actor.index));
  const enemyIds = new Set(m.finalChampions.filter((c) => c.team !== me).map((c) => c.id));
  // per-champion attack sequence of groups (opening)
  const seqBy = {};
  for (const e of ev) {
    if ((e.kind === 'Attack' || e.kind === 'Cast ability') && e.target?.kind === 'camp') {
      const g = campGroup[e.target.id]; const s = (seqBy[e.actor.index] ??= []);
      if (g != null && s.at(-1) !== g) s.push(g);
    }
  }
  for (const [id, s] of Object.entries(seqBy)) {
    const labs = s.slice(0, 3).map((g) => M.groups[g].label);
    if (labs[0]) inc(A.open, mapName + ':' + typeOf[id] + ':' + labs[0]);
  }
  // captures: group reward transitions + gem/gold deltas
  let caps = 0, firstCap = null; const capRounds = [];
  for (let i = 1; i < snaps.length; i++) {
    const a = snaps[i - 1], b = snaps[i];
    for (let g = 0; g < b.groups.length; g++) {
      if (a.groups[g]?.rewardAvailable && !b.groups[g].rewardAvailable) {
        // who captured: our champions standing on the group's tiles in snapshot a or b whose gold/gems rose
        const G = M.groups[g];
        const onIt = (s) => s.champions.filter((c) => c.alive && c.pos && G.camps.some((cc) => cc.x === c.pos[0] && cc.y === c.pos[1]));
        const mine = b.champions.filter((c) => c.team === me && myIds.has(c.id)).filter((c) => { const pa = a.champions.find((x) => x.id === c.id); return pa && (c.gold > pa.gold || c.gems > pa.gems) && onIt(b).some((x) => x.id === c.id) || onIt(a).some((x) => x.id === c.id && c.team === me); });
        const theirs = onIt(a).concat(onIt(b)).filter((c) => c.team !== me);
        if (mine.length && !theirs.length) {
          caps++; capRounds.push(b.round); if (firstCap == null) firstCap = b.round;
          inc(A.capLabels, G.label); inc(A.capShare, String(new Set(mine.map((c) => c.id)).size));
        }
      }
    }
  }
  A.caps.push(caps); pm.caps.push(caps); if (firstCap != null) A.capFirst.push(firstCap);
  // tributes
  const subs = ev.filter((e) => e.kind === 'Submit gems');
  A.trib.push(subs.length); pm.trib.push(subs.length);
  if (subs.length) A.tribFirst.push(subs[0].round);
  for (const e of subs) {
    A.tribN++;
    if (e.gemsCarried != null) { A.tribGems.push(e.gemsCarried); }
    const s = snapAt(e.round); const c = s?.champions.find((x) => x.id === e.actor.index);
    if (c) {
      A.tribHp.push(c.hp / c.maxHp);
      const near = s.champions.some((x) => x.team !== me && x.alive && x.pos && c.pos && cheb(x.pos, c.pos) <= 6);
      if (near) A.tribEnemyNear++;
    }
  }
  // carried gems over time: max carried per champion life
  for (const id of myIds) {
    let mx = 0; for (const s of snaps) { const c = s.champions.find((x) => x.id === id); if (c) mx = Math.max(mx, c.gems); }
    A.carryMax.push(mx);
  }
  // recalls
  const recs = ev.filter((e) => e.kind === 'Recall');
  A.rec.push(recs.length);
  for (const e of recs) {
    const s = snapAt(e.round); const c = s?.champions.find((x) => x.id === e.actor.index); if (!c || !c.pos) continue;
    const hpf = c.hp / c.maxHp; A.recHp.push(hpf); A.recGold.push(c.gold); A.recGems.push(c.gems);
    A.recSpawnDist.push(cheb(c.pos, mySpawn));
    inc(A.recReasons, hpf < 0.5 ? 'lowHp' : c.gold >= 150 ? 'gold>=150' : c.gems > 0 ? 'gems' : 'other');
  }
  // shops: gold before buying
  for (const e of ev.filter((x) => x.kind === 'Shop')) { const s = snapAt(e.round); const c = s?.champions.find((x) => x.id === e.actor.index); if (c) A.shopGold.push(c.gold); }
  // deaths and kills
  const resp = d.events.filter((e) => e.kind === 'Respawn' && e.actor?.kind === 1 && myIds.has(e.actor.index));
  A.deaths.push(resp.length);
  A.kills.push(m.finalChampions.filter((c) => c.team === me).reduce((s, c) => s + c.kills, 0));
  // death cause: find last snapshot where alive -> dead and whether enemy champion adjacent
  for (const id of myIds) {
    let prev = null;
    for (const s of snaps) { const c = s.champions.find((x) => x.id === id); if (!c) continue; if (prev && prev.alive && !c.alive) { A.gemsAtDeath.push(prev.gems); const en = s.champions.some((x) => x.team !== me && x.alive && x.pos && prev.pos && cheb(x.pos, prev.pos) <= 4); if (en) A.champDeaths++; else A.campDeaths++; } prev = c; }
  }
  // attacks & abilities
  for (const e of ev) {
    if (e.kind === 'Attack') { const k = e.target?.kind || 'other'; A.atk[k]++; if (k === 'camp') { inc(A.campT, e.target.type); if (e.target.type === 'Monolith') A.monoAtk++; } if (k === 'champion') inc(A.tgtType, e.target.type); }
    if (e.kind === 'Cast ability') inc(A.abil, typeOf[e.actor.index] + ':' + e.abilityType + '->' + (e.target ? (e.target.kind === 'champion' ? (e.target.team === me ? 'self/ally' : 'enemy') : e.target.kind) : 'tile'));
  }
  for (const id of myIds) inc(A.champRounds, typeOf[id], m.finalRound);
  // attack target choice among enemies in range
  for (const e of ev.filter((x) => x.kind === 'Attack' && x.target?.kind === 'champion')) {
    const s = snapAt(e.round); const c = s?.champions.find((x) => x.id === e.actor.index); if (!c?.pos) continue;
    const rng = ['Varg', 'Ryth', 'Vendetta', 'Ren', 'Marcella', 'Issac'].includes(c.type) ? 1 : 3;
    const cands = s.champions.filter((x) => x.team !== me && x.alive && x.pos && cheb(x.pos, c.pos) <= rng + 1);
    if (cands.length <= 1) { A.tgtChoice.single++; continue; }
    const t = s.champions.find((x) => x.id === e.target.id); if (!t) continue;
    const minHp = Math.min(...cands.map((x) => x.hp));
    if (t.hp <= minHp + 1) A.tgtChoice.lowestHp++; else A.tgtChoice.notLowest++;
  }
  // altar locks
  for (const e of ev.filter((x) => x.kind === 'Place altar lock')) {
    A.lockRound.push(e.round);
    const alt = e.to; const enemyTrib = d.events.some((x) => x.kind === 'Submit gems' && enemyIds.has(x.actor?.index) && x.round >= e.round - 6 && x.round <= e.round && cheb(x.to, alt) <= 1);
    const s = snapAt(e.round);
    const enNear = s?.champions.some((x) => x.team !== me && x.alive && x.pos && cheb(x.pos, alt) <= 1);
    inc(A.lockCtx, enemyTrib ? 'enemyTributing' : enNear ? 'enemyAdjacent' : 'noEnemy');
  }
  A.locks.push(ev.filter((x) => x.kind === 'Place altar lock').length);
  // engagement: per our champion per round, enemy within 2 tiles -> what did it do this round
  const actBy = new Map(); for (const e of ev) { const k = e.round + ':' + e.actor.index; const a = actBy.get(k) || []; a.push(e); actBy.set(k, a); }
  for (const s of snaps) {
    for (const c of s.champions.filter((x) => x.team === me && x.alive && x.pos)) {
      const ens = s.champions.filter((x) => x.team !== me && x.alive && x.pos && cheb(x.pos, c.pos) <= 2);
      if (!ens.length) continue;
      const acts = actBy.get(s.round + ':' + c.id) || [];
      const hpb = c.hp / c.maxHp < 0.3 ? 'hp<30' : c.hp / c.maxHp < 0.6 ? 'hp30-60' : 'hp60+';
      const a = acts.some((x) => x.kind === 'Attack' && x.target?.kind === 'champion') ? 'atkChamp' : acts.some((x) => x.kind === 'Attack' && x.target?.kind === 'camp') ? 'atkCamp' : acts.some((x) => x.kind === 'Recall') ? 'recall' : acts.some((x) => x.kind === 'Submit gems') ? 'tribute' : (acts.some((x) => x.kind === 'Move') ? 'move' : 'idle');
      inc((A.engage[hpb] ??= {}), a);
    }
  }
  // spatial
  let eh = 0, al = 0, dist = 0, grouped = 0, gs = 0;
  for (const s of snaps) {
    const cs = s.champions.filter((c) => c.team === me && c.alive && c.pos);
    for (const c of cs) { al++; const dd = cheb(c.pos, mySpawn); dist += dd / diag; if (cheb(c.pos, enSpawn) < dd) eh++; }
    if (cs.length >= 2) { gs++; let close = 0; for (const a of cs) if (cs.some((b) => b !== a && cheb(a.pos, b.pos) <= 4)) close++; grouped += close / cs.length; }
  }
  if (al) { A.enemyHalf.push(eh / al); A.spawnDist.push(dist / al); } if (gs) A.grouped.push(grouped / gs);
}
const ab = {}; for (const [k, v] of Object.entries(A.abil)) { const t = k.split(':')[0]; ab[k] = +(100 * v / A.champRounds[t]).toFixed(2); }
const out = {
  n: A.n, winRate: +(A.wins / A.n).toFixed(3), avgGemDiff: mean(A.gd), avgRounds: mean(A.rounds), draft: A.draft,
  captures: mean(A.caps), capPer100: +(100 * A.caps.reduce((s, x) => s + x, 0) / A.rounds.reduce((s, x) => s + x, 0)).toFixed(2), firstCapture: median(A.capFirst), capLabels: A.capLabels, capShare: A.capShare,
  tributes: mean(A.trib), tribPer100: +(100 * A.trib.reduce((s, x) => s + x, 0) / A.rounds.reduce((s, x) => s + x, 0)).toFixed(2), gemsPerTribute: { mean: mean(A.tribGems), p10: pct(A.tribGems, 0.1), p25: pct(A.tribGems, 0.25), median: median(A.tribGems), p75: pct(A.tribGems, 0.75), p90: pct(A.tribGems, 0.9) }, firstTribute: median(A.tribFirst), tribHpMedian: median(A.tribHp), tribEnemyNearFrac: +(A.tribEnemyNear / Math.max(1, A.tribN)).toFixed(2),
  carryMaxMedian: median(A.carryMax),
  recalls: mean(A.rec), recallsPer100: +(100 * A.rec.reduce((s, x) => s + x, 0) / A.rounds.reduce((s, x) => s + x, 0)).toFixed(2), recallHp: { p10: pct(A.recHp, 0.1), p25: pct(A.recHp, 0.25), median: median(A.recHp), p75: pct(A.recHp, 0.75), p90: pct(A.recHp, 0.9) }, recallGoldMedian: median(A.recGold), recallGemsMedian: median(A.recGems), recallReasons: A.recReasons, recallSpawnDistMedian: median(A.recSpawnDist),
  shopGold: { p10: pct(A.shopGold, 0.1), median: median(A.shopGold), p90: pct(A.shopGold, 0.9) },
  kills: mean(A.kills), deaths: mean(A.deaths), deathCause: { nearEnemy: A.champDeaths, noEnemyNear: A.campDeaths }, gemsAtDeathMedian: median(A.gemsAtDeath),
  attackMix: { ...A.atk, champFrac: +(A.atk.champion / (A.atk.champion + A.atk.camp)).toFixed(3) }, campTargets: A.campT, monolithAttacks: A.monoAtk, champTargetTypes: A.tgtType, targetChoice: A.tgtChoice,
  abilitiesPer100ChampRounds: ab,
  altarLocks: mean(A.locks), lockContext: A.lockCtx, lockRoundMedian: median(A.lockRound),
  engagement: A.engage,
  spatial: { enemyHalf: mean(A.enemyHalf), spawnDist: mean(A.spawnDist), grouped: mean(A.grouped) },
  openingFirstCamp: Object.fromEntries(Object.entries(A.open).sort()),
  perMap: Object.fromEntries(Object.entries(A.perMap).map(([k, v]) => [k, { n: v.n, winRate: +(v.w / v.n).toFixed(2), caps: mean(v.caps), tribs: mean(v.trib), gd: mean(v.gd) }])),
};
const s = JSON.stringify(out, null, 1);
if (opt('out')) fs.writeFileSync(opt('out'), s);
console.log(s);
