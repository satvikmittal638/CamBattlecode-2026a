#!/usr/bin/env node
// How a team clears armed camp groups (Wolf/Elk/Golem): champions that hit the group, their
// types, clear time, damage taken from the camps by each champion and by the most-hit one,
// HP of the tank at the start, deaths during the clear, and which champion captured.
//   node analysis/h2h_tools/armed_clears.mjs <teamDir> [--limit N]
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay, CHAMPION_TYPES, CAMP_TYPES } from '../../tools/replay_dump.mjs';
const args = process.argv.slice(2);
const dir = args[0];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const rows = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8')).slice(0, +opt('limit', 1e9));
const agg = {}; const fail = {};
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
for (const r of rows) {
  const me = r.side === 'b' ? 1 : 0;
  let groupOf = null, members = null; // camp entity index -> group id ; group -> camp types
  const open = new Map(); // gid -> {start, hitters:Set, dmg: Map(champ->dmg), startHp: Map, alive}
  await dumpReplay(path.join(dir, r.file), { snapshots: 'none', onStep(st, ev, prev) {
    if (!groupOf) {
      // group camps by cardinal adjacency of initial positions
      groupOf = new Map(); members = new Map();
      const pos = st.camps.map((c) => ({ id: c.entity.index, x: c.position.x, y: c.position.y, t: CAMP_TYPES[c.type] }));
      const key = (x, y) => x + ',' + y; const at = new Map(pos.map((p) => [key(p.x, p.y), p]));
      let gid = 0;
      for (const p of pos) {
        if (groupOf.has(p.id)) continue;
        const stack = [p]; groupOf.set(p.id, gid); const ms = [];
        while (stack.length) { const q = stack.pop(); ms.push(q.t); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const n = at.get(key(q.x + dx, q.y + dy)); if (n && !groupOf.has(n.id)) { groupOf.set(n.id, gid); stack.push(n); } } }
        members.set(gid, ms); gid++;
      }
    }
    if (!ev) return;
    // our champion hits a camp: open/extend the clear
    if (ev.actor?.kind === 1 && ev.team === me && (ev.kind === 'Attack' || ev.kind === 'Cast ability') && ev.target?.kind === 'camp') {
      const gid = groupOf.get(ev.target.id); if (gid == null) return;
      const ms = members.get(gid); if (!ms.some((t) => t === 'Elk' || t === 'Wolf' || t === 'Golem')) return;
      let o = open.get(gid);
      if (o && st.round - o.last > 15) { const label = Object.entries(members.get(gid).reduce((m, t) => (m[t] = (m[t] || 0) + 1, m), {})).sort().map(([t, n]) => t + n).join('+'); const F = (fail[label] ??= { n: 0, deaths: 0, dmg: 0 }); F.n++; F.deaths += o.deaths; for (const d of o.dmg.values()) F.dmg += d; }
      if (!o || st.round - o.last > 15) { o = { start: st.round, last: st.round, hitters: new Set(), dmg: new Map(), startHp: new Map(), deaths: 0 }; open.set(gid, o); }
      o.last = st.round; o.hitters.add(ev.actor.index);
      const c = st.champions.find((x) => x.entity.index === ev.actor.index);
      if (c && !o.startHp.has(c.entity.index)) o.startHp.set(c.entity.index, c.health);
    }
    // camp hits one of our champions
    if (ev.actor?.kind === 2 && ev.kind === 'Attack' && ev.target?.kind === 'champion' && ev.target.team === me && prev) {
      const gid = groupOf.get(ev.actor.index); const o = open.get(gid); if (!o) return;
      const a = prev.find((x) => x.entity.index === ev.target.id), b = st.champions.find((x) => x.entity.index === ev.target.id);
      if (a && b) o.dmg.set(b.entity.index, (o.dmg.get(b.entity.index) || 0) + Math.max(0, a.health - b.health));
      if (b && !b.alive && a?.alive) o.deaths++;
    }
    // capture closes the clear
    if (ev.kind === 'Capture' && ev.team === me) {
      for (const [gid, o] of open) {
        if (st.round - o.last > 12) { open.delete(gid); continue; }
        const label = Object.entries(members.get(gid).reduce((m, t) => (m[t] = (m[t] || 0) + 1, m), {})).sort().map(([t, n]) => t + n).join('+');
        const typeOf = (id) => CHAMPION_TYPES[st.champions.find((x) => x.entity.index === id)?.type];
        const A = (agg[label] ??= { n: 0, hitters: 0, time: 0, dmg: 0, maxDmg: 0, deaths: 0, tankTypes: {}, hitterTypes: {} });
        A.n++; A.hitters += o.hitters.size; A.time += o.last - o.start + 1; A.deaths += o.deaths;
        let tot = 0, mx = 0, tank = null; for (const [id, d] of o.dmg) { tot += d; if (d > mx) { mx = d; tank = id; } }
        A.dmg += tot; A.maxDmg += mx; if (tank != null) A.tankTypes[typeOf(tank)] = (A.tankTypes[typeOf(tank)] || 0) + 1;
        for (const id of o.hitters) A.hitterTypes[typeOf(id)] = (A.hitterTypes[typeOf(id)] || 0) + 1;
        open.delete(gid);
        break;
      }
    }
  } });
}
const out = Object.entries(agg).sort((a, b) => b[1].n - a[1].n).slice(0, 14);
console.log(`${dir}: armed clears that ended in a capture (n, hitters, rounds, camp dmg taken total / by tank, deaths per clear)`);
for (const [k, A] of out) { const F = fail[k] || { n: 0, deaths: 0, dmg: 0 }; A.failN = F.n; A.failDeaths = F.deaths; }
for (const [k, A] of out) console.log(`  ${k.padEnd(34)} n${String(A.n).padStart(4)}  hitters ${(A.hitters / A.n).toFixed(1)}  rounds ${(A.time / A.n).toFixed(1).padStart(5)}  dmg ${String(Math.round(A.dmg / A.n)).padStart(5)} / ${String(Math.round(A.maxDmg / A.n)).padStart(5)}  deaths ${(A.deaths / A.n).toFixed(2)}  failed ${A.failN} (deaths ${A.failDeaths})  per game ${(A.n / rows.length).toFixed(1)}`);
const tf = Object.values(fail).reduce((a, F) => [a[0] + F.n, a[1] + F.deaths, a[2] + F.dmg], [0, 0, 0]);
console.log(`  all failed clears per game ${(tf[0] / rows.length).toFixed(1)}, deaths in them ${(tf[1] / rows.length).toFixed(2)}, camp dmg in them ${Math.round(tf[2] / rows.length)}`);
