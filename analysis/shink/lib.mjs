// Shared per-match behaviour extraction for SHINK analysis and mimic comparison.
// analyzeMatch(dump, me) -> compact metrics object for team `me` (0 = side a, 1 = side b).
import fs from 'node:fs';
import path from 'node:path';

const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
const key = (p) => p[0] + ',' + p[1];

export function campGroups(snap0) {
  // Union camps by cardinal adjacency of their home tiles.
  const camps = snap0.camps.filter((c) => c.pos[0] >= 0);
  const byTile = new Map(camps.map((c) => [key(c.pos), c]));
  const parent = new Map(camps.map((c) => [c.id, c.id]));
  const find = (x) => (parent.get(x) === x ? x : (parent.set(x, find(parent.get(x))), parent.get(x)));
  for (const c of camps) for (const [dx, dy] of [[1, 0], [0, 1]]) {
    const o = byTile.get(key([c.pos[0] + dx, c.pos[1] + dy]));
    if (o) parent.set(find(c.id), find(o.id));
  }
  const groups = new Map();
  for (const c of camps) {
    const g = find(c.id);
    const G = groups.get(g) || { id: g, camps: [], tiles: [], types: {} };
    G.camps.push(c.id); G.tiles.push(c.pos); G.types[c.type] = (G.types[c.type] || 0) + 1;
    groups.set(g, G);
  }
  const GEMS = { Wolf: 22, Elk: 36, GemCluster: 24, GoldCluster: 0, Monolith: 200 };
  const GOLD = { Wolf: 90, Elk: 160, GemCluster: 0, GoldCluster: 35, Monolith: 300 };
  const tileGroup = new Map();
  for (const G of groups.values()) {
    G.gems = Object.entries(G.types).reduce((s, [t, n]) => s + GEMS[t] * n, 0);
    G.gold = Object.entries(G.types).reduce((s, [t, n]) => s + GOLD[t] * n, 0);
    G.label = Object.entries(G.types).map(([t, n]) => `${n}${t.replace('Cluster', '')}`).join('+');
    G.center = [G.tiles.reduce((s, t) => s + t[0], 0) / G.tiles.length, G.tiles.reduce((s, t) => s + t[1], 0) / G.tiles.length];
    for (const t of G.tiles) tileGroup.set(key(t), G);
  }
  return { groups: [...groups.values()], tileGroup };
}

export function analyzeMatch(d, me) {
  const m = d.meta;
  const snaps = d.snapshots.filter((s) => s.champions.length);
  const s0 = snaps.find((s) => s.champions.every((c) => c.pos)) || snaps[0];
  const { groups, tileGroup } = campGroups(s0);
  const myIds = new Set(s0.champions.filter((c) => c.team === me).map((c) => c.id));
  const typeOf = Object.fromEntries(s0.champions.map((c) => [c.id, c.type]));
  const spawn = s0.champions.filter((c) => c.team === me).map((c) => c.pos);
  const espawn = s0.champions.filter((c) => c.team !== me).map((c) => c.pos);
  const spawnC = [spawn.reduce((s, p) => s + p[0], 0) / spawn.length, spawn.reduce((s, p) => s + p[1], 0) / spawn.length];
  const espawnC = [espawn.reduce((s, p) => s + p[0], 0) / espawn.length, espawn.reduce((s, p) => s + p[1], 0) / espawn.length];
  // Symmetry: transform that maps the camp set onto itself and our spawn onto the enemy spawn.
  const W = m.width, H = m.height;
  const T = { rot: (p) => [W - 1 - p[0], H - 1 - p[1]], fx: (p) => [W - 1 - p[0], p[1]], fy: (p) => [p[0], H - 1 - p[1]] };
  const campSet = new Set(s0.camps.filter((c) => c.pos[0] >= 0).map((c) => key(c.pos)));
  let sym = 'rot';
  for (const [k, f] of Object.entries(T)) {
    const okCamps = s0.camps.filter((c) => c.pos[0] >= 0).every((c) => campSet.has(key(f(c.pos))));
    const okSpawn = cheb(f(spawnC), espawnC) <= 1.5;
    if (okCamps && okSpawn) { sym = k; break; }
  }
  const norm = (p) => (p && me === 1 ? T[sym](p) : p);
  const snapByRound = new Map(); for (const s of snaps) if (!snapByRound.has(s.round)) snapByRound.set(s.round, s);
  const champAt = (round, id) => (snapByRound.get(round) || snapByRound.get(round - 1))?.champions.find((c) => c.id === id);
  const won = m.outcome === (me === 0 ? 'teamA' : 'teamB');

  const out = {
    map: null, won, rounds: m.finalRound, gems: [m.submittedGems[me], m.submittedGems[1 - me]], draft: m.draft[me], oppDraft: m.draft[1 - me],
    captures: [], tributes: [], recalls: [], deaths: [], shops: [], firstTargets: {}, abilities: {}, champAttacks: 0, campAttacks: 0,
    campAttackTypes: {}, kills: 0, champs: [...myIds].map((id) => typeOf[id]),
  };
  // Captures / deaths from consecutive snapshots.
  for (let i = 1; i < snaps.length; i++) {
    const a = snaps[i - 1], b = snaps[i];
    const gainers = [];
    for (const c of b.champions) {
      if (!myIds.has(c.id)) continue;
      const p = a.champions.find((x) => x.id === c.id);
      if (!p) continue;
      if (p.alive && !c.alive) {
        // killed by champion if an enemy's kill count rose
        const enemyKill = b.champions.some((e) => e.team !== me && e.kills > (a.champions.find((x) => x.id === e.id)?.kills ?? 0));
        out.deaths.push({ round: b.round, champ: c.type, gemsLost: p.gems, pos: norm(p.pos), byChampion: enemyKill, hpPrev: p.hp });
      }
      if (c.alive && p.alive && c.gems > p.gems && c.kills === p.kills) gainers.push({ c, p });
    }
    for (const { c, p } of gainers) {
      const cp = p.pos || c.pos;
      const G = cp ? tileGroup.get(key(cp)) : null;
      out.captures.push({ round: b.round, champ: c.type, id: c.id, eh: cp ? cheb(cp, espawnC) < cheb(cp, spawnC) : false, pos: norm(cp), group: G?.id ?? null, label: G?.label ?? '?', gems: c.gems - p.gems, gold: c.gold - p.gold, goldNow: c.gold, goldPrev: p.gold, share: gainers.length, carried: c.gems, hpFrac: c.hp / c.maxHp, distSpawn: cp ? cheb(cp, spawnC) : null });
    }
  }
  const ev = d.events.filter((e) => e.actor?.kind === 1 && myIds.has(e.actor.index));
  for (const e of ev) {
    const t = typeOf[e.actor.index];
    if (e.kind === 'Submit gems') {
      const c = champAt(e.round, e.actor.index);
      out.tributes.push({ round: e.round, champ: t, gems: e.gemsCarried, altar: norm(e.to) });
    } else if (e.kind === 'Recall') {
      const c = champAt(e.round, e.actor.index);
      const onCap = c?.pos ? !!tileGroup.get(key(c.pos)) : false;
      // did it arrive? look for position at spawn within 7 rounds
      let arrived = false;
      for (let r = e.round + 1; r <= e.round + 7; r++) { const x = champAt(r, e.actor.index); if (x?.pos && spawn.some((s) => cheb(s, x.pos) <= 1)) { arrived = true; break; } }
      out.recalls.push({ round: e.round, champ: t, hpFrac: c ? c.hp / c.maxHp : null, gold: c?.gold, gems: c?.gems, onCapTile: onCap, distSpawn: c?.pos ? cheb(c.pos, spawnC) : null, arrived });
    } else if (e.kind === 'Place ward') {
      out.wards = (out.wards || 0) + 1;
    } else if (e.kind === 'Place altar lock') {
      out.locks = (out.locks || 0) + 1;
    } else if (e.kind === 'Set priority') {
      out.prio = (out.prio || 0) + 1;
    } else if (e.kind === 'Shop') {
      out.shops.push({ round: e.round, champ: t, items: e.items, goldAfter: e.goldAfter });
    } else if (e.kind === 'Cast ability') {
      const k = `${t}:${e.abilityType}->${e.target ? (e.target.kind === 'camp' ? 'camp' : (e.target.team === me ? 'self/ally' : 'enemy')) : 'tile'}`;
      out.abilities[k] = (out.abilities[k] || 0) + 1;
    } else if (e.kind === 'Attack') {
      if (e.target?.kind === 'champion' && e.target.team !== me) out.champAttacks++;
      else if (e.target?.kind === 'camp') {
        out.campAttacks++;
        out.campAttackTypes[e.target.type] = (out.campAttackTypes[e.target.type] || 0) + 1;
        if (!out.firstTargets[t]) {
          const G = groups.find((g) => g.camps.includes(e.target.id));
          out.firstTargets[t] = { round: e.round, label: G?.label, center: norm(G?.center.map(Math.round)) };
        }
      }
    }
  }
  const fin = m.finalChampions.filter((c) => myIds.has(c.id));
  out.kills = fin.reduce((s, c) => s + c.kills, 0);
  // Spatial: enemy-half fraction, mean nearest-ally distance, solo-at-capture.
  let alive = 0, enemyHalf = 0, nearest = 0, nearestN = 0;
  for (const s of snaps) {
    const cs = s.champions.filter((c) => myIds.has(c.id) && c.alive && c.pos);
    for (const c of cs) {
      alive++;
      if (cheb(c.pos, espawnC) < cheb(c.pos, spawnC)) enemyHalf++;
      const others = cs.filter((o) => o !== c && !(c.type === 'Cassi' && o.type === 'Issac') && !(c.type === 'Issac' && o.type === 'Cassi'));
      if (others.length) { nearest += Math.min(...others.map((o) => cheb(o.pos, c.pos))); nearestN++; }
    }
  }
  out.enemyHalfFrac = alive ? enemyHalf / alive : null;
  out.nearestAlly = nearestN ? nearest / nearestN : null;
  out.mapSize = [m.width, m.height]; out.sym = sym;
  out.groupCount = groups.length;
  return out;
}

// Rows for a team folder (index.json) or a platform/local folder.
export function listRows(dir, { side, teamName, recent = 1e9, kind = 'all', map, opponent } = {}) {
  let rows;
  const indexPath = path.join(dir, 'index.json');
  if (fs.existsSync(indexPath)) {
    rows = JSON.parse(fs.readFileSync(indexPath, 'utf8')).map((r) => ({ ...r, path: path.join(dir, 'replays', r.file), me: r.side === 'b' ? 1 : 0 }));
  } else {
    // Platform group folders: group_<id>.json gives sides; or local folder needs side.
    const files = [];
    const walk = (p) => { for (const f of fs.readdirSync(p)) { const q = path.join(p, f); if (fs.statSync(q).isDirectory()) walk(q); else files.push(q); } };
    walk(dir);
    const groupSide = new Map();
    for (const f of files.filter((f) => /group_.*\.json$/.test(f))) {
      const g = JSON.parse(fs.readFileSync(f, 'utf8'));
      const s = g.group.sides.find((x) => teamName && x.teamName === teamName);
      const o = g.group.sides.find((x) => !teamName || x.teamName !== teamName);
      groupSide.set(path.dirname(f), { me: s ? (s.side === 'b' ? 1 : 0) : null, opponent: o?.teamName, createdAt: g.group.createdAt });
    }
    rows = files.filter((f) => f.endsWith('.repl26a')).map((f) => {
      const gs = groupSide.get(path.dirname(f));
      const me = side ? (side === 'b' ? 1 : 0) : gs?.me ?? 0;
      return { file: path.basename(f), path: f, me, map: path.basename(f).split('_')[0], opponent: gs?.opponent || 'local', createdAt: gs?.createdAt || fs.statSync(f).mtime.toISOString(), kind: gs ? 'platform' : 'local' };
    });
  }
  if (kind !== 'all') rows = rows.filter((r) => r.kind === kind);
  if (map) rows = rows.filter((r) => r.map === map);
  if (opponent) rows = rows.filter((r) => (r.opponent || '').toLowerCase().includes(opponent.toLowerCase()));
  rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return rows.slice(0, recent);
}

// Cached per-match metrics (analysis/shink/cache/).
export async function getMetrics(r) {
  const { dumpReplay } = await import('../../tools/replay_dump.mjs');
  const CACHE = 'analysis/shink/cache'; fs.mkdirSync(CACHE, { recursive: true });
  const cf = path.join(CACHE, r.file.replace('.repl26a', '') + `_${r.me}.json`);
  if (fs.existsSync(cf) && fs.statSync(cf).mtimeMs > fs.statSync(r.path).mtimeMs) return JSON.parse(fs.readFileSync(cf, 'utf8'));
  const d = await dumpReplay(r.path, { snapshots: 'round' });
  const a = analyzeMatch(d, r.me);
  a.map = r.map; a.opponent = r.opponent; a.kind = r.kind; a.createdAt = r.createdAt;
  fs.writeFileSync(cf, JSON.stringify(a));
  return a;
}

// Summary vector of key style metrics over a list of per-match metrics.
export function summarize(ms) {
  const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : NaN);
  const med = (a) => { if (!a.length) return NaN; const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  const N = ms.length;
  const caps = ms.flatMap((m) => m.captures), tribs = ms.flatMap((m) => m.tributes), recs = ms.flatMap((m) => m.recalls), deaths = ms.flatMap((m) => m.deaths);
  const champAtk = ms.reduce((s, m) => s + m.champAttacks, 0), campAtk = ms.reduce((s, m) => s + m.campAttacks, 0);
  const campMix = {}; ms.forEach((m) => Object.entries(m.campAttackTypes).forEach(([k, v]) => (campMix[k] = (campMix[k] || 0) + v)));
  const out = {
    matches: N,
    winRate: ms.filter((m) => m.won).length / N,
    avgRounds: mean(ms.map((m) => m.rounds)),
    gemsFor: mean(ms.map((m) => m.gems[0])),
    gemsAgainst: mean(ms.map((m) => m.gems[1])),
    'captures/g': caps.length / N,
    firstCapture: mean(ms.filter((m) => m.captures.length).map((m) => m.captures[0].round)),
    'tributes/g': tribs.length / N,
    gemsPerTribute: mean(tribs.map((t) => t.gems)),
    firstTribute: mean(ms.filter((m) => m.tributes.length).map((m) => m.tributes[0].round)),
    'recalls/g': recs.length / N,
    recallHpMedian: med(recs.map((r) => r.hpFrac)),
    recallLowHpFrac: recs.filter((r) => r.hpFrac < 0.5).length / Math.max(1, recs.length),
    recallOnCapFrac: recs.filter((r) => r.onCapTile).length / Math.max(1, recs.length),
    'deaths/g': deaths.length / N,
    deathsByChampFrac: deaths.filter((d) => d.byChampion).length / Math.max(1, deaths.length),
    'kills/g': mean(ms.map((m) => m.kills)),
    champAttackFrac: champAtk / Math.max(1, champAtk + campAtk),
    'campAttacks/g': campAtk / N,
    shareFrac: caps.filter((c) => c.share > 1).length / Math.max(1, caps.length),
    enemyHalfCapFrac: caps.filter((c) => c.eh).length / Math.max(1, caps.length),
    enemyHalfFrac: mean(ms.map((m) => m.enemyHalfFrac).filter((x) => x != null)),
    nearestAlly: mean(ms.map((m) => m.nearestAlly).filter((x) => x != null)),
    'wards/g': ms.reduce((s, m) => s + (m.wards || 0), 0) / N,
    'locks/g': ms.reduce((s, m) => s + (m.locks || 0), 0) / N,
    'prioritySets/g': ms.reduce((s, m) => s + (m.prio || 0), 0) / N,
  };
  for (const k of ['Wolf', 'Elk', 'GemCluster', 'GoldCluster']) out['campMix:' + k] = (campMix[k] || 0) / Math.max(1, campAtk);
  const ab = {}; ms.forEach((m) => Object.entries(m.abilities).forEach(([k, v]) => (ab[k] = (ab[k] || 0) + v)));
  const games = {}; ms.forEach((m) => new Set(m.champs).forEach((c) => (games[c] = (games[c] || 0) + 1)));
  for (const [k, v] of Object.entries(ab)) { const c = k.split(':')[0]; out['abil:' + k] = v / Math.max(1, games[c] || N); }
  return out;
}
