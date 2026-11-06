#!/usr/bin/env node
// Camp-target decisions of one team, for fitting a choice model (behaviour cloning).
//   node tools/ml/target_dataset.mjs <teamDir> <out.jsonl> [--side us|them|both] [--limit N]
// A decision starts when a champion becomes free (its capture pays out, it respawns, it arrives
// on its spawn, or its tribute completes) and ends with the first camp it hits afterwards
// (within 80 rounds). Candidates: every camp group with a living camp at the decision time.
// Features per candidate use walking distances (8-neighbour BFS over walls/holes/altars).
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay, CHAMPION_TYPES, CAMP_TYPES, ITEM_NAMES } from '../replay_dump.mjs';
const args = process.argv.slice(2);
const [dir, outFile] = args;
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const want = opt('side', 'us');
const rows = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8')).slice(0, +opt('limit', 1e9));
const STR = { Wolf: 20, Elk: 60, Golem: 120, GemCluster: 0, GoldCluster: 0, Monolith: 200 };
const RESP = { Wolf: 40, Elk: 60, Golem: 80, GemCluster: 50, GoldCluster: 50, Monolith: 150 };
const GEMS = { Wolf: 4, Elk: 15, Golem: 36, GemCluster: 7, GoldCluster: 0, Monolith: 200 };
const GOLD = { Wolf: 40, Elk: 90, Golem: 160, GemCluster: 0, GoldCluster: 20, Monolith: 300 };
const shardsOf = (c) => c.items.reduce((s, n, i) => s + n * (ITEM_NAMES[i].includes('Emblem') ? (ITEM_NAMES[i].startsWith('Power') ? 6 : 5) : 1), 0);
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
const out = fs.createWriteStream(outFile);
let nDec = 0;
for (const r of rows) {
  const usTeam = r.side === 'b' ? 1 : 0;
  const teams = want === 'both' ? [0, 1] : [want === 'us' ? usTeam : 1 - usTeam];
  let W = 0, H = 0, info = null, groups = null, campGroup = null, field = null, spawnField = null;
  const pending = new Map(); // champ id -> decision
  const prevOnSpawn = new Map();
  const bfs = (sources) => {
    const d = new Int32Array(W * H).fill(-1); const q = new Int32Array(W * H); let h = 0, t = 0;
    for (const [x, y] of sources) { const i = y * W + x; if (d[i] < 0) { d[i] = 0; q[t++] = i; } }
    while (h < t) {
      const i = q[h++], x = i % W, y = (i / W) | 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const j = ny * W + nx; if (d[j] >= 0 || info.walls[j] || info.holes[j]) continue;
        let alt = false; for (const [ax, ay] of info.altars) if (ax === nx && ay === ny) { alt = true; break; }
        if (alt) continue;
        d[j] = d[i] + 1; q[t++] = j;
      }
    }
    return d;
  };
  const onSpawn = (team, p) => { const s = info.spawn[team]; return p && p.x >= s.minX && p.x <= s.maxX && p.y >= s.minY && p.y <= s.maxY; };
  const startDecision = (st, c, why) => {
    if (!teams.includes(c.team) || !c.position) return;
    const cands = [];
    for (const g of groups) {
      let hpLeft = 0, armed = 0, alive = 0;
      for (const ci of g.camps) { const cp = st.camps.find((x) => x.entity.index === ci); if (cp && cp.health > 0) { alive++; hpLeft += cp.health; armed += STR[CAMP_TYPES[cp.type]] || 0; } }
      if (!alive || g.monolith) continue;
      const dist = field[g.id][c.position.y * W + c.position.x];
      if (dist < 0) continue;
      let allyNear = 0, enemyNear = 0;
      for (const o of st.champions) {
        if (!o.alive || !o.position || o.entity.index === c.entity.index) continue;
        let dm = 99; for (const [x, y] of g.tiles) dm = Math.min(dm, Math.max(Math.abs(o.position.x - x), Math.abs(o.position.y - y)));
        if (o.team === c.team && dm <= 4) allyNear++;
        if (o.team !== c.team && dm <= 6) enemyNear++;
      }
      cands.push({ g: g.id, gems: g.gems, gold: g.gold, hp: Math.round(hpLeft), totalHp: g.totalHp, armed, dist, allyNear, enemyNear,
        dOwn: g.dSpawn[c.team], dEnemy: g.dSpawn[1 - c.team], label: g.label });
    }
    if (cands.length < 2) return;
    pending.set(c.entity.index, { round: st.round, why, map: r.map, team: c.team, type: CHAMPION_TYPES[c.type], hpf: +(c.health / c.maxHealth).toFixed(3), shards: shardsOf(c), gold: c.gold, gems: c.gems, cands });
  };
  await dumpReplay(path.join(dir, r.file), { snapshots: 'none', mapInfo: true,
    onStart(s) { info = s.mapInfo; W = s.width; H = s.height; },
    onStep(st, ev, prev) {
      if (!groups) {
        // camp groups by cardinal adjacency of the initial camps
        const pos = st.camps.map((c) => ({ id: c.entity.index, x: c.position.x, y: c.position.y, t: CAMP_TYPES[c.type] }));
        const key = (x, y) => x + ',' + y; const at = new Map(pos.map((p) => [key(p.x, p.y), p]));
        groups = []; campGroup = new Map();
        for (const p of pos) {
          if (campGroup.has(p.id)) continue;
          const g = { id: groups.length, camps: [], tiles: [], types: [] }; groups.push(g);
          const stack = [p]; campGroup.set(p.id, g.id);
          while (stack.length) { const q = stack.pop(); g.camps.push(q.id); g.tiles.push([q.x, q.y]); g.types.push(q.t); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const n = at.get(key(q.x + dx, q.y + dy)); if (n && !campGroup.has(n.id)) { campGroup.set(n.id, g.id); stack.push(n); } } }
          g.gems = g.types.reduce((s, t) => s + (GEMS[t] || 0), 0); g.gold = g.types.reduce((s, t) => s + (GOLD[t] || 0), 0);
          g.monolith = g.types.includes('Monolith'); g.totalHp = 0;
          const cnt = {}; for (const t of g.types) cnt[t] = (cnt[t] || 0) + 1; g.label = Object.entries(cnt).sort().map(([t, n]) => t + n).join('+');
        }
        for (const g of groups) for (const ci of g.camps) { const cp = st.camps.find((x) => x.entity.index === ci); g.totalHp += cp ? cp.health : 0; }
        field = groups.map((g) => bfs(g.tiles));
        const rect = (s) => { const a = []; for (let y = s.minY; y <= s.maxY; y++) for (let x = s.minX; x <= s.maxX; x++) a.push([x, y]); return a; };
        spawnField = [bfs(rect(info.spawn[0])), bfs(rect(info.spawn[1]))];
        for (const g of groups) { g.dSpawn = [0, 1].map((t) => { let m = 1e9; for (const [x, y] of g.tiles) { const v = spawnField[t][y * W + x]; if (v >= 0) m = Math.min(m, v); } return m; }); }
      }
      if (!prev) return;
      // free moments
      for (const c of st.champions) {
        if (!teams.includes(c.team)) continue;
        const b = prev.find((x) => x.entity.index === c.entity.index); if (!b) continue;
        if (!b.alive && c.alive) { startDecision(st, c, 'respawn'); continue; }
        const on = c.alive && onSpawn(c.team, c.position), was = prevOnSpawn.get(c.entity.index);
        prevOnSpawn.set(c.entity.index, on);
        if (on && was === false) startDecision(st, c, 'home');
        if (ev && ev.kind === 'Capture' && c.alive && (c.gold > b.gold || c.gems > b.gems) && !on) startDecision(st, c, 'capture');
        if (ev && ev.kind === 'Gems submitted' && ev.actor?.index === c.entity.index) startDecision(st, c, 'tribute');
      }
      // resolution: first camp hit
      if (ev && ev.actor?.kind === 1 && (ev.kind === 'Attack' || ev.kind === 'Cast ability') && ev.target?.kind === 'camp') {
        const d = pending.get(ev.actor.index); if (!d) return;
        pending.delete(ev.actor.index);
        if (st.round - d.round > 80) return;
        const gid = campGroup.get(ev.target.id); const ci = d.cands.findIndex((x) => x.g === gid);
        if (ci < 0) return;
        out.write(JSON.stringify({ ...d, chosen: ci, delay: st.round - d.round }) + '\n'); nDec++;
      }
    } });
}
out.end();
console.error(`${dir}: ${nDec} decisions from ${rows.length} games -> ${outFile}`);
