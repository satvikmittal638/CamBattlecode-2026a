// Mine the decoded v84/v86 playbook tables (exact shipped actions of the reference winners) against the reference
// replays' round-start states. Writes per-game JSON lines with context samples for each action family.
//   node mine_tables.mjs <tables.json> <index.json> <set> <out.jsonl> [--shard i/n]
import fs from 'node:fs';
import { dumpReplay, CHAMPION_TYPES } from '../../tools/replay_dump.mjs';

const [tablesFile, idxFile, set, outFile] = process.argv.slice(2);
const sh = process.argv.includes('--shard') ? process.argv[process.argv.indexOf('--shard') + 1].split('/').map(Number) : [0, 1];
const tables = new Map(JSON.parse(fs.readFileSync(tablesFile, 'utf8')).map((b) => [b.case, b]));
const games = JSON.parse(fs.readFileSync(idxFile, 'utf8')).filter((g) => g.set === set).filter((_, i) => i % sh[1] === sh[0]);
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
const RANGE = { VesperVale: 3, Prism: 3, Stellar: 3, Tavi: 3, Willow: 3, Cassi: 3 };
const rectDist = (r, p) => Math.max(Math.max(r.minX - p.x, 0, p.x - r.maxX), Math.max(r.minY - p.y, 0, p.y - r.maxY));

for (const g of games) {
  const book = tables.get(`${g.map}_${g.side}`);
  if (!book) { console.error('no table', g.map, g.side); continue; }
  const byKey = new Map();
  for (const a of book.actions) { const k = `${a.t}|${a.r}`; if (!byKey.has(k)) byKey.set(k, []); byKey.get(k).push(a); }
  const us = g.us;
  let spawn = null, altars = [], lastRound = -1;
  const S = { pri: [], recall: [], cancel: [], ward: [], attack: [], cast: [], tribute: [], lock: [], tele: [], buyAway: 0, buyHome: 0, idle: [] };
  const recallOpen = new Map();
  await dumpReplay(g.file, {
    snapshots: 'none', mapInfo: true,
    onStart(s) { spawn = s.mapInfo.spawn; altars = s.mapInfo.altars; },
    onStep(st) {
      if (st.round === lastRound) return;
      lastRound = st.round;
      const live = st.champions.filter((c) => c.alive && c.position);
      const mine = live.filter((c) => c.team === us), foes = live.filter((c) => c.team !== us);
      // Priority ranks this round (from the table): which champion gets the highest value?
      const pr = [];
      for (const c of st.champions.filter((c) => c.team === us)) {
        const type = CHAMPION_TYPES[c.type];
        const acts = byKey.get(`${type}|${st.round}`) || [];
        if (!c.alive || !c.position) continue;
        const p = c.position;
        const enD = foes.length ? Math.min(...foes.map((e) => cheb(e.position, p))) : 99;
        const en6 = foes.filter((e) => cheb(e.position, p) <= 6);
        const al4 = mine.filter((o) => o !== c && cheb(o.position, p) <= 4);
        const my = c.health + al4.reduce((s, o) => s + o.health, 0), th = en6.reduce((s, o) => s + o.health, 0);
        const share = en6.length ? my / (my + th) : 1;
        const home = rectDist(spawn[us], p), altarD = altars.length ? Math.min(...altars.map(([x, y]) => cheb(p, { x, y }))) : 99;
        const ctx = { r: st.round, t: type, hpf: +(c.health / c.maxHealth).toFixed(2), bag: c.gems, gold: c.gold, enD, en6: en6.length, al4: al4.length, share: +share.toFixed(2), home, altarD };
        const kinds = new Set(acts.map((a) => a.k));
        for (const a of acts) {
          if (a.k === 'priority') pr.push({ ...ctx, v: a.v });
          if (a.k === 'recall') { S.recall.push(ctx); recallOpen.set(c.entity.index, st.round); }
          if (a.k === 'cancel') { const r0 = recallOpen.get(c.entity.index); S.cancel.push({ ...ctx, after: r0 === undefined ? null : st.round - r0 }); recallOpen.delete(c.entity.index); }
          if (a.k === 'ward') S.ward.push({ ...ctx, d: cheb(p, { x: a.x, y: a.y }), wardHome: rectDist(spawn[us], { x: a.x, y: a.y }), wardEnemyHome: rectDist(spawn[1 - us], { x: a.x, y: a.y }) });
          if (a.k === 'tribute') S.tribute.push({ ...ctx });
          if (a.k === 'lock') S.lock.push({ ...ctx, onAltarOwnSideD: rectDist(spawn[us], { x: a.x, y: a.y }), enemySideD: rectDist(spawn[1 - us], { x: a.x, y: a.y }) });
          if (a.k === 'teleport') S.tele.push(ctx);
          if (a.k === 'buy') { if (home === 0) S.buyHome++; else S.buyAway++; }
          if (a.k === 'attack' || a.k === 'cast') {
            const tgt = foes.find((e) => e.position.x === a.x && e.position.y === a.y);
            if (!tgt) continue;
            const rng = (a.k === 'attack' ? (RANGE[type] || 1) : 4) + 1;
            const inReach = foes.filter((e) => cheb(e.position, p) <= rng);
            const lowest = inReach.length ? inReach.reduce((m, e) => (e.health < m.health ? e : m)) : null;
            const lowestFrac = inReach.length ? inReach.reduce((m, e) => (e.health / e.maxHealth < m.health / m.maxHealth ? e : m)) : null;
            (a.k === 'attack' ? S.attack : S.cast).push({ ...ctx, slot: a.s, tgt: CHAMPION_TYPES[tgt.type], tgtHpf: +(tgt.health / tgt.maxHealth).toFixed(2), tgtHp: Math.round(tgt.health), nReach: inReach.length,
              isLowest: lowest === tgt, isLowestFrac: lowestFrac === tgt, tgtBag: tgt.gems });
          }
        }
        if (en6.length && !kinds.has('attack') && !kinds.has('cast') && !kinds.has('move')) S.idle.push({ ...ctx, kinds: [...kinds] });
      }
      if (pr.length >= 2) S.pri.push(pr);
    },
  });
  fs.appendFileSync(outFile, JSON.stringify({ set, map: g.map, side: g.side, source: g.source, draft: book.draft, S }) + '\n');
}
