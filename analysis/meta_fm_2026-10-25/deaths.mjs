// Context of every champion death (both teams) and of the opening captures, per game.
//   node deaths.mjs <index.json> <out.jsonl> [--shard i/n] [--sets a,b]
// Death: victim type/team/bag/hp history, channel state (recall / tribute started and not ended), camp fighting,
// allies/enemies within 6, hitters by type (hits in the last 6 rounds), position depth (own half > 0).
// Opening: first 8 gem/gold captures with camp types and the recipient.
import fs from 'node:fs';
import { dumpReplay, CHAMPION_TYPES } from '../../tools/replay_dump.mjs';

const args = process.argv.slice(2);
const [idxFile, outFile] = args;
const opt = (k, d) => (args.includes('--' + k) ? args[args.indexOf('--' + k) + 1] : d);
const sh = opt('shard', '0/1').split('/').map(Number);
const sets = opt('sets', '') ? new Set(opt('sets').split(',')) : null;
const games = JSON.parse(fs.readFileSync(idxFile, 'utf8')).filter((g) => !sets || sets.has(g.set)).filter((_, i) => i % sh[1] === sh[0]);
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
const rectDist = (r, p) => Math.max(Math.max(r.minX - p.x, 0, p.x - r.maxX), Math.max(r.minY - p.y, 0, p.y - r.maxY));

for (const g of games) {
  let spawn = null, prev = null, altars = [];
  const hits = new Map(); // victim id -> [{r, src type, src team}]
  const channel = new Map(); // champion id -> {kind, r}
  const campAt = new Map(); // champion id -> last camp attack round
  const deaths = [], caps = [];
  try {
    await dumpReplay(g.file, {
      snapshots: 'none', mapInfo: true,
      onStart(s) { spawn = s.mapInfo.spawn; altars = s.mapInfo.altars || []; },
      onStep(st, ev) {
        if (ev && ev.actor?.kind === 1) {
          const id = ev.actor.index;
          if (ev.kind === 'Recall') channel.set(id, { kind: 'recall', r: st.round });
          if (ev.kind === 'Submit gems') channel.set(id, { kind: 'tribute', r: st.round });
          if (ev.kind === 'Cancel channel' || ev.kind === 'Gems submitted' || ev.kind === 'Move') channel.delete(id);
          if ((ev.kind === 'Attack' || ev.kind === 'Cast ability') && ev.target?.kind === 'camp') campAt.set(id, st.round);
          if ((ev.kind === 'Attack' || ev.kind === 'Cast ability') && ev.target?.kind === 'champion') {
            const l = hits.get(ev.target.id) || []; l.push({ r: st.round, t: ev.champ, team: ev.team, k: ev.kind === 'Attack' ? 'a' : 'c' + ev.slot }); hits.set(ev.target.id, l);
          }
        }
        if (prev && st.step.kind === 2 && caps.length < 12) {
          for (const ch of st.champions) {
            const b = prev.champions.find((p) => p.entity.index === ch.entity.index);
            if (!b || !ch.position || (ch.gems <= b.gems && ch.gold <= b.gold)) continue;
            const near = prev.camps.filter((c) => cheb(c.position, ch.position) <= 2).map((c) => c.type);
            caps.push({ r: st.round, team: ch.team, t: CHAMPION_TYPES[ch.type], gems: ch.gems - b.gems, gold: ch.gold - b.gold, depth: rectDist(spawn[1 - ch.team], ch.position) - rectDist(spawn[ch.team], ch.position), campTypes: near });
          }
        }
        if (prev) for (const ch of st.champions) {
          const b = prev.champions.find((p) => p.entity.index === ch.entity.index);
          if (!b || !b.alive || ch.alive || !b.position) continue;
          const id = ch.entity.index, team = ch.team;
          const allies = prev.champions.filter((o) => o.team === team && o.alive && o.position && o.entity.index !== id && cheb(o.position, b.position) <= 6);
          const enemies = prev.champions.filter((o) => o.team !== team && o.alive && o.position && cheb(o.position, b.position) <= 6);
          const h = (hits.get(id) || []).filter((x) => st.round - x.r <= 6);
          const by = {}; for (const x of h) { const k = x.t + ':' + x.k; by[k] = (by[k] || 0) + 1; }
          const ch0 = channel.get(id);
          deaths.push({
            r: st.round, team, side: team === g.us ? 'us' : 'them', victim: CHAMPION_TYPES[ch.type], bag: b.gems, maxHp: b.maxHealth,
            channel: ch0 && st.round - ch0.r <= 12 ? ch0.kind : null, campFight: st.round - (campAt.get(id) ?? -99) <= 3,
            allies: allies.length, enemies: enemies.length, enemyTypes: enemies.map((o) => CHAMPION_TYPES[o.type]),
            hitters: [...new Set(h.filter((x) => x.team !== team).map((x) => x.t))], hitsBy: by,
            depth: rectDist(spawn[1 - team], b.position) - rectDist(spawn[team], b.position),
            altarD: altars.length ? Math.min(...altars.map(([x, y]) => cheb(b.position, { x, y }))) : 99,
          });
          channel.delete(id);
        }
        prev = st;
      },
    });
  } catch (e) { console.error(g.file, e.message); continue; }
  fs.appendFileSync(outFile, JSON.stringify({ set: g.set, map: g.map, side: g.side, result: g.result, us: g.us, file: g.file, score: g.score, oppScore: g.oppScore, deaths, caps }) + '\n');
}
