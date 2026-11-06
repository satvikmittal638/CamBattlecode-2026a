// Shared helpers for the Mite analysis scripts (decode in memory, print small aggregates).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dumpReplay } from '../../tools/replay_dump.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '../..');

// Parse analysis/mite/maps/<name>.txt (produced by the temporary map-dump bot, team A view).
export function loadMap(name) {
  const f = path.join(HERE, 'maps', name + '.txt');
  if (!fs.existsSync(f)) return null;
  const lines = fs.readFileSync(f, 'utf8').split('\n').filter(Boolean);
  const [, W, H] = lines[0].split(' ');
  const m = { name, W: +W, H: +H, groups: [], altars: [], spawnA: [], spawnB: [], bush: new Set(), wall: new Set(), hole: new Set(), campAt: new Map() };
  for (const l of lines) {
    if (l.startsWith('GROUP')) {
      const g = /GROUP (\d+) gold=(\d+) gems=(\d+) respawn=(\d+) camps:(.*)/.exec(l);
      const camps = [...g[5].matchAll(/(\S)\((\d+),(\d+)\)/g)].map((x) => ({ t: x[1], x: +x[2], y: +x[3] }));
      const grp = { id: +g[1], gold: +g[2], gems: +g[3], respawn: +g[4], camps };
      grp.kind = camps.map((c) => c.t).sort().join('');
      grp.cx = camps.reduce((s, c) => s + c.x, 0) / camps.length; grp.cy = camps.reduce((s, c) => s + c.y, 0) / camps.length;
      m.groups.push(grp);
      for (const c of camps) m.campAt.set(c.x + ',' + c.y, grp.id);
    } else if (l.startsWith('ROW')) {
      const y = +l.slice(4, 7); const row = l.slice(8);
      for (let x = 0; x < row.length; x++) {
        const ch = row[x], k = x + ',' + y;
        if (ch === 'A') m.altars.push([x, y]);
        else if (ch === 'S') m.spawnA.push([x, y]);
        else if (ch === 's') m.spawnB.push([x, y]);
        else if (ch === '"') m.bush.add(k);
        else if (ch === '#') m.wall.add(k);
        else if (ch === 'o') m.hole.add(k);
      }
    }
  }
  const c = (a) => [a.reduce((s, p) => s + p[0], 0) / a.length, a.reduce((s, p) => s + p[1], 0) / a.length];
  m.spawnAc = c(m.spawnA); m.spawnBc = c(m.spawnB);
  return m;
}
const mapCache = {};
export const getMap = (n) => (mapCache[n] ??= loadMap(n));

export const MAPS = ['collision', 'corners', 'elkring', 'expanse', 'interlock', 'lanes', 'monolith', 'packs', 'rows'];
export const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));

// Rows of a top_replays team folder (newest first), or of a folder of local replays.
export function loadRows(dir, { recent = 60, kind = 'all', side, opponent, map, skip = 0 } = {}) {
  let rows;
  const idx = path.join(dir, 'index.json');
  if (fs.existsSync(idx)) {
    rows = JSON.parse(fs.readFileSync(idx, 'utf8')).map((r) => ({ ...r, path: path.join(dir, 'replays', r.file) }));
  } else {
    rows = [];
    const walk = (d) => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (f.endsWith('.repl26a')) rows.push({ file: f, path: p, side, createdAt: fs.statSync(p).mtime.toISOString(), kind: 'local', map: MAPS.includes(f.split('_')[0]) ? f.split('_')[0] : null }); } };
    walk(dir);
  }
  if (kind !== 'all') rows = rows.filter((r) => r.kind === kind);
  if (opponent) rows = rows.filter((r) => (r.opponent || '').toLowerCase().includes(opponent.toLowerCase()));
  if (map) rows = rows.filter((r) => r.map === map);
  rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return rows.slice(skip, skip + recent);
}

// Guess the map from the dimensions + camp layout when the row has no map name.
export function guessMap(d) {
  for (const n of ['collision', 'corners', 'elkring', 'expanse', 'interlock', 'lanes', 'monolith', 'packs', 'rows']) {
    const m = getMap(n);
    if (m && m.W === d.meta.width && m.H === d.meta.height) {
      const s = d.snapshots.find((x) => x.camps.length);
      if (!s) return n;
      const ok = s.camps.every((c) => m.campAt.has(c.pos[0] + ',' + c.pos[1]));
      if (ok) return n;
    }
  }
  return null;
}

// Decode a replay and build a per-match view for one side.
export async function loadMatch(row) {
  const d = await dumpReplay(row.path, { snapshots: 'round' });
  const mapName = row.map || guessMap(d);
  let me = row.side === 'b' ? 1 : row.side === 'a' ? 0 : null;
  return build(d, me, mapName, row);
}

export function build(d, me, mapName, row = {}) {
  const m = d.meta;
  const map = getMap(mapName);
  const typeOf = Object.fromEntries(m.finalChampions.map((c) => [c.id, c.type]));
  const teamOf = Object.fromEntries(m.finalChampions.map((c) => [c.id, c.team]));
  // snapshot per round (first step of round)
  const byRound = [];
  for (const s of d.snapshots) if (!byRound[s.round]) byRound[s.round] = s;
  const snapAt = (r) => { for (let k = r; k >= 0; k--) if (byRound[k] && byRound[k].champions.length) return byRound[k]; return null; };
  const champAt = (r, id) => snapAt(r)?.champions.find((c) => c.id === id);
  const won = m.outcome === (me === 0 ? 'teamA' : 'teamB');
  const spawn = map ? (me === 0 ? map.spawnAc : map.spawnBc) : null;
  const espawn = map ? (me === 0 ? map.spawnBc : map.spawnAc) : null;
  return { d, meta: m, me, map, mapName, row, typeOf, teamOf, byRound, snapAt, champAt, won, spawn, espawn,
    myIds: Object.keys(typeOf).map(Number).filter((id) => teamOf[id] === me),
    enemyIds: Object.keys(typeOf).map(Number).filter((id) => teamOf[id] !== me) };
}

export const mean = (a) => (a.length ? +(a.reduce((s, x) => s + x, 0) / a.length).toFixed(2) : null);
export const median = (a) => { if (!a.length) return null; const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
export const pct = (a, ps = [10, 25, 50, 75, 90]) => { if (!a.length) return null; const b = [...a].sort((x, y) => x - y); return Object.fromEntries(ps.map((p) => ['p' + p, +b[Math.min(b.length - 1, Math.floor((p / 100) * b.length))].toFixed?.(2) ?? b[0]])); };
export const inc = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };
export const top = (o, n = 10) => Object.fromEntries(Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n));
export const hist = (a, step) => { const o = {}; for (const x of a) inc(o, Math.floor(x / step) * step); return Object.fromEntries(Object.entries(o).sort((x, y) => +x[0] - +y[0])); };
