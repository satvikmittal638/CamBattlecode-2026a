// Do our champions die again where we just died? For every death (alive -> dead between round snapshots), both
// teams: last alive position, round, enemies within 6. A death is a "repeat" when one of the same team's champions
// already died within 6 tiles in the previous 150 rounds ("self" when it was the same champion). Also: how far from
// its own spawn, and whether the victim walked straight back from spawn (it had respawned within the last 80 rounds).
// Writes repeat_deaths.json, prints a summary.   node repeat_deaths.mjs
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';

const dir = import.meta.dirname;
const index = JSON.parse(fs.readFileSync(path.join(dir, 'games/index.json'), 'utf8'));
const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
const out = [], tot = { us: {}, them: {} };
const bump = (w, k, v = 1) => { tot[w][k] = (tot[w][k] || 0) + v; };
for (const g of index) {
  let d;
  try { d = await dumpReplay(path.join(dir, 'games', g.file), { snapshots: 'round' }); } catch { continue; }
  const ourTeam = g.side === 'a' ? 0 : 1;
  const lastPos = new Map(), respawned = new Map(), deaths = [];
  bump('us', 'games'); bump('them', 'games');
  for (let i = 1; i < d.snapshots.length; i++) {
    const s = d.snapshots[i], prev = d.snapshots[i - 1];
    for (const c of s.champions) {
      const p = prev.champions.find((o) => o.id === c.id);
      if (c.alive && c.pos) lastPos.set(c.id, c.pos);
      if (c.alive && p && !p.alive) respawned.set(c.id, s.round);
      if (!c.alive && p?.alive && lastPos.has(c.id)) {
        const pos = lastPos.get(c.id), who = c.team === ourTeam ? 'us' : 'them';
        const foes6 = prev.champions.filter((o) => o.team !== c.team && o.alive && o.pos && cheb(o.pos, pos) <= 6).length;
        const prior = deaths.filter((x) => x.team === c.team && s.round - x.round <= 150 && cheb(x.pos, pos) <= 6);
        const rec = { map: g.map, cls: g.result === 'win' ? 'win' : g.oppScore - g.score >= 500 ? 'heavy' : 'loss', who, team: c.team, id: c.id, round: s.round, pos, foes6,
          repeat: prior.length > 0, selfRepeat: prior.some((x) => x.id === c.id), sinceRespawn: respawned.has(c.id) ? s.round - respawned.get(c.id) : null };
        deaths.push(rec); out.push(rec);
        bump(who, 'deaths'); if (rec.repeat) bump(who, 'repeat'); if (rec.selfRepeat) bump(who, 'selfRepeat');
        if (rec.sinceRespawn !== null && rec.sinceRespawn <= 80) { bump(who, 'within80ofRespawn'); if (rec.repeat) bump(who, 'within80ofRespawn_repeat'); }
      }
    }
  }
}
fs.writeFileSync(path.join(dir, 'repeat_deaths.json'), JSON.stringify(out));
for (const w of ['us', 'them']) {
  const t = tot[w], n = t.games;
  console.log(w, `deaths/game ${(t.deaths / n).toFixed(1)}, repeat zone ${(100 * t.repeat / t.deaths).toFixed(0)}% (${(t.repeat / n).toFixed(1)}/game),`,
    `same champion again ${(100 * t.selfRepeat / t.deaths).toFixed(0)}%, died within 80 rounds of respawning ${(t.within80ofRespawn / n).toFixed(1)}/game (${(100 * (t.within80ofRespawn_repeat || 0) / Math.max(1, t.within80ofRespawn)).toFixed(0)}% of those in a repeat zone)`);
}
const byMap = {};
for (const r of out.filter((x) => x.who === 'us')) { const m = (byMap[r.map] ??= { d: 0, rep: 0, g: new Set() }); m.d++; m.rep += r.repeat; }
for (const g of index) byMap[g.map] && byMap[g.map].g.add(g.matchId);
console.log('our deaths per game by map (top 12):', Object.entries(byMap).map(([k, v]) => [k, +(v.d / v.g.size).toFixed(1), Math.round(100 * v.rep / v.d) + '% rep']).sort((a, b) => b[1] - a[1]).slice(0, 12));
