// Shared helpers for KratosMessi analysis: map geometry + per-match metric extraction.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CAMP = ['Wolf', 'Elk', 'GemCluster', 'GoldCluster', 'Monolith'];
const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
export { cheb };

const mapCache = {};
export function loadMap(name) {
  if (mapCache[name]) return mapCache[name];
  const lines = fs.readFileSync(path.join(HERE, 'maps', name + '.txt'), 'utf8').split('\n');
  const [, W, H, , sym, , team] = lines[0].split(' ');
  const rows = lines.filter((l) => l.startsWith('ROW ')).map((l) => l.slice(4));
  const w = +W, h = +H;
  const grid = [];
  for (let y = 0; y < h; y++) grid.push(rows[h - 1 - y]);
  const altars = [], spawnA = [], spawnB = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const c = grid[y][x];
    if (c === 'A') altars.push([x, y]);
    if (c === 'S') spawnA.push([x, y]);
    if (c === 'E') spawnB.push([x, y]);
  }
  const groups = lines.filter((l) => l.startsWith('GROUP ')).map((l) => {
    const [head, rest] = l.split(':');
    const p = head.trim().split(/\s+/);
    const cells = rest.trim().split(/\s+/).filter(Boolean).map((t) => { const [k, x, y] = t.split(',').map(Number); return { type: CAMP[k], x, y }; });
    const types = [...new Set(cells.map((c) => c.type))].sort().join('+');
    return { id: +p[1], gold: +p[3], gems: +p[5], resp: +p[7], cells, types };
  });
  const cellGroup = new Map();
  for (const g of groups) for (const c of g.cells) cellGroup.set(c.x + ',' + c.y, g.id);
  const centre = (s) => [s.reduce((a, c) => a + c[0], 0) / s.length, s.reduce((a, c) => a + c[1], 0) / s.length];
  const m = { name, w, h, sym: +sym, teamSize: +team, grid, altars, spawn: [spawnA, spawnB], spawnC: [centre(spawnA), centre(spawnB)], groups, cellGroup };
  // Per group: distance (chebyshev, from spawn centre) for each team, and "side" (closer to which spawn).
  for (const g of groups) {
    const gc = centre(g.cells.map((c) => [c.x, c.y]));
    g.c = gc;
    g.dist = [cheb(gc, m.spawnC[0]), cheb(gc, m.spawnC[1])];
  }
  mapCache[name] = m;
  return m;
}

export function groupAt(m, pos) {
  if (!pos) return -1;
  const g = m.cellGroup.get(pos[0] + ',' + pos[1]);
  return g === undefined ? -1 : g;
}
// Nearest group whose cell is within r of pos.
export function groupNear(m, pos, r = 1) {
  let best = -1, bd = 1e9;
  for (const g of m.groups) for (const c of g.cells) { const d = cheb(pos, [c.x, c.y]); if (d <= r && d < bd) { bd = d; best = g.id; } }
  return best;
}

const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : null);
const median = (a) => { if (!a.length) return null; const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
export { mean, median };

const FAM = (name) => { const m = name.match(/^(\w+) (Shard|Emblem) of (\w+)$/); return m ? { fam: m[1], kind: m[2], stat: m[3] } : null; };
const SHARDS_PER_EMBLEM = 5;

// Extract per-match metrics for team `me` (0 = side a, 1 = side b).
export function analyzeMatch(d, me, mapName) {
  const m = loadMap(mapName);
  const meta = d.meta;
  const snaps = d.snapshots;
  const won = meta.outcome === (me === 0 ? 'teamA' : 'teamB');
  const myIds = new Set(meta.finalChampions.filter((c) => c.team === me).map((c) => c.id));
  const typeOf = Object.fromEntries(meta.finalChampions.map((c) => [c.id, c.type]));
  const R = meta.finalRound;
  const out = {
    map: mapName, won, rounds: R, gems: [meta.submittedGems[me], meta.submittedGems[1 - me]], draft: meta.draft[me], oppDraft: meta.draft[1 - me],
    captures: 0, capturesByType: {}, capturersAtCapture: [], firstCapture: null, captureList: [],
    oppCaptures: 0,
    tributes: [], recalls: [], deaths: 0, kills: 0, perChamp: {}, altarLocksPlaced: 0, altarLockBuys: 0,
    attacks: { champion: 0, camp: 0, other: 0 }, campAttackTypes: {},
    abilities: {}, wards: 0, prio: 0,
    enemyHalf: 0, aliveSamples: 0, pairClose: {}, pairSamples: 0, nearAllies: [],
    opening: {},
  };
  const champ = (id) => (out.perChamp[typeOf[id]] ??= { attacksCamp: 0, attacksChamp: 0, abil: {}, shops: [], build: [], recalls: 0, deaths: 0, tributes: 0, gemsTributed: 0, kills: 0, firstTargets: [], hpAtRecall: [], dashes: 0 });
  for (const id of myIds) champ(id);

  // --- captures from group state transitions
  let prevGroups = null, prevSnap = null;
  const snapByRound = new Map();
  for (const s of snaps) if (!snapByRound.has(s.round)) snapByRound.set(s.round, s);
  for (const s of snaps) {
    if (prevGroups) {
      for (let g = 0; g < s.groups.length; g++) {
        const a = prevGroups[g], b = s.groups[g];
        if (a.rewardAvailable && !b.rewardAvailable && a.captureTeam !== 2) {
          if (a.captureTeam === me) {
            out.captures++;
            const grp = m.groups[g];
            const key = grp ? grp.types : '?';
            out.capturesByType[key] = (out.capturesByType[key] || 0) + 1;
            if (out.firstCapture === null) out.firstCapture = s.round;
            // who was on the group region (within 1 of a cell) in prev snapshot
            const present = prevSnap.champions.filter((c) => c.team === me && c.alive && c.pos && grp && grp.cells.some((cc) => cheb(c.pos, [cc.x, cc.y]) <= 0));
            out.capturersAtCapture.push(present.length);
            out.captureList.push({ r: s.round, g, type: key, by: present.map((c) => c.type), distOwn: grp ? grp.dist[me] : null, distOpp: grp ? grp.dist[1 - me] : null });
          } else out.oppCaptures++;
        }
      }
    }
    prevGroups = s.groups; prevSnap = s;
  }

  // --- events
  const ev = d.events;
  for (const e of ev) {
    if (e.actor?.kind !== 1 || !myIds.has(e.actor.index)) continue;
    const c = champ(e.actor.index);
    const s = snapByRound.get(e.round);
    const self = s?.champions.find((x) => x.id === e.actor.index);
    switch (e.kind) {
      case 'Attack': {
        const k = e.target?.kind || 'other';
        out.attacks[k] = (out.attacks[k] || 0) + 1;
        if (k === 'camp') { c.attacksCamp++; out.campAttackTypes[e.target.type] = (out.campAttackTypes[e.target.type] || 0) + 1; if (c.firstTargets.length < 1) c.firstTargets.push({ r: e.round, g: groupAt(m, e.to) }); }
        if (k === 'champion') c.attacksChamp++;
        break;
      }
      case 'Cast ability': {
        const tk = e.target ? (e.target.kind === 'champion' ? (e.target.id === e.actor.index ? 'self' : (e.target.team === me ? 'ally' : 'enemy')) : 'camp') : 'tile';
        const k = `${e.abilityType}->${tk}`;
        c.abil[k] = (c.abil[k] || 0) + 1;
        out.abilities[`${typeOf[e.actor.index]}:${k}`] = (out.abilities[`${typeOf[e.actor.index]}:${k}`] || 0) + 1;
        if (e.abilityType === 'Dash') c.dashes++;
        break;
      }
      case 'Shop': {
        for (const [it, n] of Object.entries(e.items || {})) {
          if (it.startsWith('consumable')) { if (n > 0) { c.shops.push({ r: e.round, it: it === 'consumable2' ? 'AltarLock' : it, n }); if (it === 'consumable2') out.altarLockBuys++; } continue; }
          const f = FAM(it); if (!f) continue;
          if (n > 0) c.shops.push({ r: e.round, it: `${f.fam}:${f.stat}${f.kind === 'Emblem' ? '*E' : ''}`, n });
        }
        break;
      }
      case 'Recall': {
        c.recalls++;
        const hpf = self ? self.hp / self.maxHp : null;
        out.recalls.push({ r: e.round, champ: typeOf[e.actor.index], hpf, gold: self?.gold, gems: self?.gems, distSpawn: self?.pos ? cheb(self.pos, m.spawnC[me]) : null });
        if (hpf !== null) c.hpAtRecall.push(hpf);
        break;
      }
      case 'Submit gems': {
        c.tributes++; c.gemsTributed += e.gemsCarried || 0;
        // others carrying gems at that time
        out.tributes.push({ r: e.round, champ: typeOf[e.actor.index], gems: e.gemsCarried, altar: e.to, distOwnSpawn: cheb(e.to, m.spawnC[me]), distOppSpawn: cheb(e.to, m.spawnC[1 - me]) });
        break;
      }
      case 'Place altar lock': out.altarLocksPlaced++; break;
      case 'Place ward': out.wards++; break;
      case 'Set priority': out.prio++; break;
      default: break;
    }
  }
  for (const e of ev) if (e.kind === 'Respawn' && e.actor?.kind === 1 && myIds.has(e.actor.index)) { out.deaths++; champ(e.actor.index).deaths++; }
  const fin = meta.finalChampions.filter((c) => c.team === me);
  for (const f of fin) { out.kills += f.kills; champ(f.id).kills = f.kills; champ(f.id).finalItems = f.items; }

  // Build: emblem completion order, derived from snapshot item counts (shards+5*emblem per fam:stat)
  for (const id of myIds) {
    const c = champ(id);
    let prevE = {};
    for (const s of snaps) {
      const me_ = s.champions.find((x) => x.id === id); if (!me_) continue;
      for (const [it, n] of Object.entries(me_.items)) {
        const f = FAM(it); if (!f || f.kind !== 'Emblem') continue;
        const k = `${f.fam}:${f.stat}`;
        if ((prevE[k] || 0) < n) { for (let i = prevE[k] || 0; i < n; i++) c.build.push(k); prevE[k] = n; }
      }
    }
  }

  // Spatial
  const ownC = m.spawnC[me], oppC = m.spawnC[1 - me];
  const ids = [...myIds];
  for (const s of snaps) {
    const cs = s.champions.filter((c) => c.team === me && c.alive && c.pos);
    for (const c of cs) {
      out.aliveSamples++;
      if (cheb(c.pos, oppC) < cheb(c.pos, ownC)) out.enemyHalf++;
      out.nearAllies.push(cs.filter((o) => o !== c && cheb(o.pos, c.pos) <= 4).length);
    }
    if (s.round % 2 === 0) {
      out.pairSamples++;
      for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
        const a = cs.find((c) => c.id === ids[i]), b = cs.find((c) => c.id === ids[j]);
        if (a && b && cheb(a.pos, b.pos) <= 4) { const k = `${typeOf[ids[i]]}-${typeOf[ids[j]]}`; out.pairClose[k] = (out.pairClose[k] || 0) + 1; }
      }
    }
  }
  out.nearAllies = mean(out.nearAllies);
  return out;
}

// BFS path distances (8-dir) from a tile on the static grid; blocked: wall, hole, altar, enemy spawn of `me`.
export function bfs(m, from, me) {
  const W = m.w, H = m.h, dist = new Int32Array(W * H).fill(-1);
  const enemySpawn = me === 0 ? 'E' : 'S';
  const ok = (x, y) => x >= 0 && y >= 0 && x < W && y < H && !'#oA'.includes(m.grid[y][x]) && m.grid[y][x] !== enemySpawn;
  const q = [from[0] + from[1] * W]; dist[q[0]] = 0;
  for (let h = 0; h < q.length; h++) {
    const i = q[h], x = i % W, y = (i - x) / W;
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      if (!dx && !dy) continue; const nx = x + dx, ny = y + dy;
      if (!ok(nx, ny)) continue; const j = nx + ny * W; if (dist[j] >= 0) continue; dist[j] = dist[i] + 1; q.push(j);
    }
  }
  return (p) => dist[p[0] + p[1] * W];
}
// distance to a group = min over its cells of (dist to a neighbour of cell) i.e. dist(cell) computed treating cell as walkable
export function groupDist(m, df, g) {
  let best = 1e9;
  for (const c of m.groups[g].cells) {
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      const x = c.x + dx, y = c.y + dy; if (x < 0 || y < 0 || x >= m.w || y >= m.h) continue;
      const v = df([x, y]); if (v >= 0 && v + 1 < best) best = v + 1;
    }
  }
  return best;
}
