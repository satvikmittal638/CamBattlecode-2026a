// Fight anatomy of the attempt-1 games, both teams, from round snapshots (engine 2.0.0):
//   cohesion  nearest-ally distance (rounds 20-300);
//   contact   champion turns with an enemy within 6: local HP share = (own + allies within 4) / (that + enemies within 6),
//             and what the champion does next round relative to the nearest enemy (approach / hold / retreat);
//   deaths    alive -> dead: enemies and allies within 6, share, carried gems, round, distance to own spawn.
// Writes fights.json (aggregates per outcome class); prints tables.   node fights.mjs
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';

const dir = import.meta.dirname;
const index = JSON.parse(fs.readFileSync(path.join(dir, 'games/index.json'), 'utf8'));
const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
const agg = {};
const bump = (cls, who, k, v = 1) => { const a = (agg[cls] ??= { us: {}, them: {} })[who]; a[k] = (a[k] || 0) + v; };
const deaths = [];
let n = 0;
for (const g of index) {
  const cls = g.result === 'win' ? 'win' : (g.oppScore - g.score >= 500 ? 'heavy' : 'loss');
  let d;
  try { d = await dumpReplay(path.join(dir, 'games', g.file), { snapshots: 'round', mapInfo: true }); } catch { continue; }
  const ourTeam = g.side === 'a' ? 0 : 1, spawns = d.meta.mapInfo.spawn;
  const centre = (r) => [(r.minX + r.maxX) / 2, (r.minY + r.maxY) / 2];
  bump(cls, 'us', 'games'); bump(cls, 'them', 'games');
  for (let i = 1; i < d.snapshots.length; i++) {
    const s = d.snapshots[i], prev = d.snapshots[i - 1], next = d.snapshots[i + 1];
    for (const c of s.champions) {
      if (!c.alive || !c.pos) continue;
      const who = c.team === ourTeam ? 'us' : 'them';
      const allies = s.champions.filter((o) => o.team === c.team && o.id !== c.id && o.alive && o.pos);
      const foes = s.champions.filter((o) => o.team !== c.team && o.alive && o.pos);
      const na = Math.min(99, ...allies.map((o) => cheb(o.pos, c.pos)));
      if (s.round >= 20 && s.round <= 300) { bump(cls, who, 'cohRounds'); bump(cls, who, 'cohDist', Math.min(na, 30)); if (na > 4) bump(cls, who, 'alone'); }
      const f6 = foes.filter((o) => cheb(o.pos, c.pos) <= 6);
      if (f6.length) {
        const a4 = allies.filter((o) => cheb(o.pos, c.pos) <= 4);
        const mine = c.hp + a4.reduce((t, o) => t + o.hp, 0), theirs = f6.reduce((t, o) => t + o.hp, 0);
        const share = mine / Math.max(1, mine + theirs);
        const b = share <= 0.42 ? 'outmatched' : share >= 0.55 ? 'ahead' : 'even';
        bump(cls, who, 'contact'); bump(cls, who, 'contact_' + b);
        const nc = next?.champions.find((o) => o.id === c.id);
        if (nc?.alive && nc.pos) {
          const near = f6.reduce((m, o) => (cheb(o.pos, c.pos) < cheb(m.pos, c.pos) ? o : m));
          const d0 = cheb(near.pos, c.pos), d1 = cheb(near.pos, nc.pos);
          const mv = d1 < d0 ? 'approach' : d1 > d0 ? 'retreat' : 'hold';
          if (d0 >= 2) bump(cls, who, `${b}_${mv}`);
        }
      }
      // death next round
      const nc = next?.champions.find((o) => o.id === c.id);
      if (nc && !nc.alive) {
        const a6 = allies.filter((o) => cheb(o.pos, c.pos) <= 6);
        const mine = c.hp + a6.reduce((t, o) => t + o.hp, 0), theirs = f6.reduce((t, o) => t + o.hp, 0);
        const rec = { cls, who, round: s.round, type: c.type, gems: c.gems, foes6: f6.length, allies6: a6.length, share: +(mine / Math.max(1, mine + theirs)).toFixed(2),
          homeDist: Math.round(cheb(c.pos, centre(spawns[c.team]))), map: g.map };
        deaths.push(rec);
        bump(cls, who, 'deaths'); if (s.round <= 300) bump(cls, who, 'deathsEarly');
        if (f6.length >= 2 && a6.length === 0) bump(cls, who, 'deathAloneVs2');
        if (c.gems >= 30) { bump(cls, who, 'deathCarrier'); bump(cls, who, 'deathCarrierGems', c.gems); }
      }
    }
  }
  if (++n % 25 === 0) console.log(n, '/', index.length);
}
fs.writeFileSync(path.join(dir, 'fights.json'), JSON.stringify({ agg, deaths }));
for (const cls of ['win', 'loss', 'heavy']) {
  const a = agg[cls]; if (!a) continue;
  console.log(`\n${cls}: ${a.us.games} games`);
  for (const who of ['us', 'them']) {
    const x = a[who], c = x.contact || 1;
    const pct = (k) => (100 * (x[k] || 0) / c).toFixed(0) + '%';
    const mvs = (b) => { const t = ['approach', 'hold', 'retreat'].map((m) => x[`${b}_${m}`] || 0), s = t.reduce((p, q) => p + q, 0) || 1; return t.map((v) => (100 * v / s).toFixed(0)).join('/'); };
    console.log(`  ${who.padEnd(4)} nearest ally ${(x.cohDist / x.cohRounds).toFixed(1)} (alone>4 ${(100 * x.alone / x.cohRounds).toFixed(0)}%) | contact ${(x.contact / x.games).toFixed(0)}/game: outmatched ${pct('contact_outmatched')} even ${pct('contact_even')} ahead ${pct('contact_ahead')} | approach/hold/retreat at 2+ tiles: outmatched ${mvs('outmatched')} even ${mvs('even')} ahead ${mvs('ahead')} | deaths ${(x.deaths / x.games).toFixed(1)} (r<=300 ${((x.deathsEarly || 0) / x.games).toFixed(1)}, alone vs 2+ ${((x.deathAloneVs2 || 0) / x.games).toFixed(1)}, carriers 30+ ${((x.deathCarrier || 0) / x.games).toFixed(1)} losing ${((x.deathCarrierGems || 0) / x.games).toFixed(0)} gems)`);
  }
}
