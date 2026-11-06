// Aggregate behaviour metrics (captures, tributes, recalls, deaths, shops, abilities...) for a team.
//   node analysis/shink/deep.mjs <dir> [--recent N] [--side a|b] [--team "SHINK AI 6500"] [--map m]
//        [--opponent o] [--kind ranked|unranked] [--section all|caps|recall|shop|open|tribute|death]
// Per-match metrics are cached in analysis/shink/cache/ (small JSON).
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
import { analyzeMatch, listRows } from './lib.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const dir = args[0];
const rows = listRows(dir, { side: opt('side'), teamName: opt('team', 'Agentic Loop Builders'), recent: +opt('recent', 60), kind: opt('kind', 'all'), map: opt('map'), opponent: opt('opponent') });
const CACHE = 'analysis/shink/cache'; fs.mkdirSync(CACHE, { recursive: true });
const section = opt('section', 'all');

export async function getMetrics(r) {
  const cf = path.join(CACHE, r.file.replace('.repl26a', '') + `_${r.me}.json`);
  if (fs.existsSync(cf) && fs.statSync(cf).mtimeMs > fs.statSync(r.path).mtimeMs) return JSON.parse(fs.readFileSync(cf, 'utf8'));
  const d = await dumpReplay(r.path, { snapshots: 'round' });
  const a = analyzeMatch(d, r.me);
  a.map = r.map; a.opponent = r.opponent; a.kind = r.kind; a.createdAt = r.createdAt;
  fs.writeFileSync(cf, JSON.stringify(a));
  return a;
}

const ms = [];
for (const r of rows) { try { ms.push(await getMetrics(r)); } catch (e) { console.error('skip', r.file, e.message); } }
const mean = (a) => (a.length ? +(a.reduce((s, x) => s + x, 0) / a.length).toFixed(2) : null);
const pct = (a, q) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };
const inc = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };
const top = (o, n = 10) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `${k}:${v}`).join('  ');
const N = ms.length;
console.log(`matches ${N}  wins ${ms.filter((m) => m.won).length}  avgRounds ${mean(ms.map((m) => m.rounds))}  gems ${mean(ms.map((m) => m.gems[0]))}-${mean(ms.map((m) => m.gems[1]))}`);

if (section === 'all' || section === 'summary') {
  const per = (f) => mean(ms.map(f));
  console.log('per game: captures', per((m) => m.captures.length), 'firstCap', mean(ms.filter((m) => m.captures.length).map((m) => m.captures[0].round)),
    'tributes', per((m) => m.tributes.length), 'gems/trib', mean(ms.flatMap((m) => m.tributes.map((t) => t.gems))), 'firstTrib', mean(ms.filter((m) => m.tributes.length).map((m) => m.tributes[0].round)),
    'recalls', per((m) => m.recalls.length), 'deaths', per((m) => m.deaths.length), 'kills', per((m) => m.kills),
    'champAtk', per((m) => m.champAttacks), 'campAtk', per((m) => m.campAttacks), 'champAtkFrac', +(ms.reduce((s, m) => s + m.champAttacks, 0) / Math.max(1, ms.reduce((s, m) => s + m.champAttacks + m.campAttacks, 0))).toFixed(3),
    'enemyHalf', per((m) => m.enemyHalfFrac), 'nearestAlly', per((m) => m.nearestAlly), 'shareFrac', +(ms.flatMap((m) => m.captures).filter((c) => c.share > 1).length / Math.max(1, ms.flatMap((m) => m.captures).length)).toFixed(3));
  const camp = {}; ms.forEach((m) => Object.entries(m.campAttackTypes).forEach(([k, v]) => inc(camp, k, v)));
  console.log('camp attack mix', top(camp));
}
if (section === 'all' || section === 'caps') {
  const lab = {}; ms.forEach((m) => m.captures.forEach((c) => inc(lab, c.label)));
  console.log('captured group types', top(lab, 15));
  const champCaps = {}; ms.forEach((m) => m.captures.forEach((c) => inc(champCaps, c.champ)));
  console.log('captures by champ (per game)', Object.entries(champCaps).map(([k, v]) => `${k}:${(v / N).toFixed(1)}`).join(' '));
}
if (section === 'all' || section === 'tribute') {
  const g = ms.flatMap((m) => m.tributes.map((t) => t.gems));
  console.log('gems/tribute pctl 10/25/50/75/90', [0.1, 0.25, 0.5, 0.75, 0.9].map((q) => pct(g, q)).join('/'), ' n', g.length);
  const by = {}; ms.forEach((m) => m.tributes.forEach((t) => (by[t.champ] ??= []).push(t.gems)));
  console.log('gems/tribute by champ', Object.entries(by).map(([k, v]) => `${k}:${mean(v)}(n${v.length})`).join(' '));
  // captures before tribute: count captures by the same champ between tributes
  const chain = [];
  for (const m of ms) for (const ch of new Set(m.captures.map((c) => c.champ))) {
    const evs = [...m.captures.filter((c) => c.champ === ch).map((c) => ({ r: c.round, k: 'c' })), ...m.tributes.filter((t) => t.champ === ch).map((t) => ({ r: t.round, k: 't' }))].sort((a, b) => a.r - b.r);
    let n = 0; for (const e of evs) { if (e.k === 'c') n++; else { chain.push(n); n = 0; } }
  }
  const hist = {}; chain.forEach((n) => inc(hist, n));
  console.log('captures per tribute (same champ) hist', JSON.stringify(hist));
}
if (section === 'all' || section === 'recall') {
  const rs = ms.flatMap((m) => m.recalls);
  console.log('recalls n', rs.length, 'hpFrac pctl 10/25/50/75/90', [0.1, 0.25, 0.5, 0.75, 0.9].map((q) => pct(rs.map((r) => +r.hpFrac.toFixed(2)), q)).join('/'),
    'gold pctl', [0.1, 0.25, 0.5, 0.75, 0.9].map((q) => pct(rs.map((r) => r.gold), q)).join('/'), 'gems>0 frac', (rs.filter((r) => r.gems > 0).length / Math.max(1, rs.length)).toFixed(2),
    'onCapTile', (rs.filter((r) => r.onCapTile).length / Math.max(1, rs.length)).toFixed(2), 'arrived', (rs.filter((r) => r.arrived).length / Math.max(1, rs.length)).toFixed(2));
  const by = {}; rs.forEach((r) => inc(by, r.champ)); console.log('recalls by champ per game', Object.entries(by).map(([k, v]) => `${k}:${(v / N).toFixed(2)}`).join(' '));
  const hb = {}; rs.forEach((r) => inc(hb, Math.floor(r.hpFrac * 10) / 10)); console.log('recall hp hist', JSON.stringify(hb));
  const gb = {}; rs.forEach((r) => inc(gb, Math.floor(r.gold / 50) * 50)); console.log('recall gold hist', JSON.stringify(gb));
}
if (section === 'all' || section === 'death') {
  const ds = ms.flatMap((m) => m.deaths);
  console.log('deaths', ds.length, 'byChampion frac', (ds.filter((d) => d.byChampion).length / Math.max(1, ds.length)).toFixed(2), 'gemsLost mean', mean(ds.map((d) => d.gemsLost)));
  const by = {}; ds.forEach((d) => inc(by, d.champ)); console.log('deaths by champ per game', Object.entries(by).map(([k, v]) => `${k}:${(v / N).toFixed(2)}`).join(' '));
}
if (section === 'all' || section === 'shop') {
  const by = {};
  for (const m of ms) {
    const seq = {};
    for (const s of m.shops) for (const [it, n] of Object.entries(s.items || {})) if (n > 0) (seq[s.champ] ??= []).push(`${it.replace(/ (Shard|Emblem) of /, (x, y) => (y === 'Emblem' ? '*' : ':'))}${n > 1 ? 'x' + n : ''}`);
    for (const [c, s] of Object.entries(seq)) { const o = (by[c] ??= {}); inc(o, s.slice(0, 6).join(' > ')); }
  }
  for (const [c, o] of Object.entries(by)) console.log('build', c, '\n   ', top(o, 6).split('  ').join('\n    '));
  const sr = ms.flatMap((m) => m.shops.map((s) => s.round)); console.log('first shop round mean', mean(ms.filter((m) => m.shops.length).map((m) => m.shops[0].round)));
}
if (section === 'all' || section === 'abil') {
  const ab = {}; ms.forEach((m) => Object.entries(m.abilities).forEach(([k, v]) => inc(ab, k, v)));
  console.log('abilities per game', Object.entries(ab).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${(v / N).toFixed(1)}`).join('  '));
}
if (section === 'open') {
  const byMap = {};
  for (const m of ms) { const o = (byMap[m.map] ??= {}); for (const [c, f] of Object.entries(m.firstTargets)) inc((o[c] ??= {}), `${f.label}@${f.center}`); }
  for (const [mp, o] of Object.entries(byMap)) { console.log('==', mp); for (const [c, t] of Object.entries(o)) console.log('  ', c, top(t, 4)); }
}
