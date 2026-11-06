// Engagement behaviour per side (rounds 1..TO): for each champion turn with an enemy champion inside
// attack range + 1 (visible-ish proxy: within 4), did it hit an enemy champion? When several of a team's champions hit
// champions in the same round, did they hit the same one (focus)? Also local numbers when engaging.
//   node engage.mjs <index.json> <out.jsonl> [--sets a,b] [--shard i/n] [--to 400]
import fs from 'node:fs';
import { dumpReplay, CHAMPION_TYPES } from '../../tools/replay_dump.mjs';

const args = process.argv.slice(2);
const [idxFile, outFile] = args;
const opt = (k, d) => (args.includes('--' + k) ? args[args.indexOf('--' + k) + 1] : d);
const sh = opt('shard', '0/1').split('/').map(Number);
const sets = opt('sets', '') ? new Set(opt('sets').split(',')) : null;
const TO = +opt('to', 400);
const RANGED = new Set(['VesperVale', 'Prism', 'Stellar', 'Tavi', 'Willow', 'Cassi']);
const games = JSON.parse(fs.readFileSync(idxFile, 'utf8')).filter((g) => !sets || sets.has(g.set)).filter((_, i) => i % sh[1] === sh[0]);
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
for (const g of games) {
  const S = [0, 1].map(() => ({ opp: 0, hit: 0, oppLowHit: 0, oppLow: 0, multi: 0, focused: 0, hitRounds: 0, campWhileOpp: 0 }));
  let cur = null; // round accumulation
  const flush = () => {
    if (!cur) return;
    for (const team of [0, 1]) {
      const s = S[team];
      for (const [id, c] of cur.champs) {
        if (c.team !== team || !c.alive) continue;
        const reach = (RANGED.has(c.type) ? 3 : 1) + 1;
        const foes = cur.champs.filter(([, e]) => e.team !== team && e.alive && cheb(e.pos, c.pos) <= reach);
        if (!foes.length) continue;
        s.opp++;
        const did = cur.hits.get(id);
        if (did) s.hit++;
        if (cur.campHits.has(id)) s.campWhileOpp++;
        const low = foes.some(([, e]) => e.hp / e.maxHp < 0.35);
        if (low) { s.oppLow++; if (did) s.oppLowHit++; }
      }
      const targets = [...cur.hits.entries()].filter(([id]) => cur.champs.find(([i]) => i === id)?.[1].team === team).map(([, t]) => t);
      if (targets.length) s.hitRounds++;
      if (targets.length >= 2) { s.multi++; const cnt = {}; for (const t of targets) cnt[t] = (cnt[t] || 0) + 1; if (Math.max(...Object.values(cnt)) >= 2) s.focused++; }
    }
  };
  try {
    await dumpReplay(g.file, {
      snapshots: 'none',
      onStep(st, ev) {
        if (st.round > TO) return;
        if (!cur || cur.r !== st.round) {
          flush();
          cur = { r: st.round, hits: new Map(), campHits: new Set(), champs: st.champions.filter((c) => c.position).map((c) => [c.entity.index, { team: c.team, type: CHAMPION_TYPES[c.type], alive: c.alive, pos: c.position, hp: c.health, maxHp: c.maxHealth }]) };
        }
        if (ev && ev.actor?.kind === 1 && (ev.kind === 'Attack' || ev.kind === 'Cast ability')) {
          if (ev.target?.kind === 'champion' && ev.target.team !== ev.team) cur.hits.set(ev.actor.index, ev.target.id);
          if (ev.target?.kind === 'camp') cur.campHits.add(ev.actor.index);
        }
      },
    });
    flush();
  } catch (e) { console.error(g.file, e.message); continue; }
  fs.appendFileSync(outFile, JSON.stringify({ set: g.set, map: g.map, side: g.side, result: g.result, file: g.file, us: S[g.us], them: S[1 - g.us] }) + '\n');
}
