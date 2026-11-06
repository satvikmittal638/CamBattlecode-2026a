// Drive the replay scraper (tools/replay_scraper.cpp) over replays of games against the Rank-1 team and write a CSV.
//   node tools/replay_scraper_run.mjs [--out rank1_threat_data.csv] [--team-name "Intercontinental Fish"] [--jobs 8]
// Sources: every trial result.json under analysis/ whose rows have an opponent (opp/opponent) matching the team and a
// replay file. Each replay runs in turnhost --observe on the Rank-1 side (no re-simulation, no drift); every SCRAPE
// line becomes a row, with Rank-1's recorded actions for that turn classified as FARMING / AGGRESSION / BANKING / ...
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const OUT = path.resolve(opt('out', path.join(ROOT, 'analysis/rank1_threat/rank1_threat_data.csv')));
const TEAM = opt('team-name', 'Intercontinental Fish');
const jobs = +opt('jobs', 8);
const exe = path.join(ROOT, 'analysis/v58_deep_2026-10-24/harness/turnhost/target/release/turnhost');
const bot = path.join(ROOT, 'workspace/bots/replay-scraper/.cambc/build-release/bot-injected.wasm');
const mapPath = (m) => { const f = m.replace(/_/g, '-') + '.map26a'; for (const d of ['workspace/maps', 'workspace/maps_holdout']) if (fs.existsSync(path.join(ROOT, d, f))) return path.join(ROOT, d, f); return null; };

// 1) Collect games: trial folders with result.json rows (ours vs Rank-1).
const games = [];
const walk = (d, depth) => { if (depth > 5) return; for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) walk(p, depth + 1); else if (f.name === 'result.json') {
  let r; try { r = JSON.parse(fs.readFileSync(p, 'utf8')); } catch { continue; }
  for (const row of r.rows || []) {
    const isFish = row.opp === 'fish' || row.opponent === TEAM;
    if (!isFish || !row.file) continue;
    const file = path.join(path.dirname(p), row.opp ? row.file : path.join('games', row.file));
    if (!fs.existsSync(file) || !mapPath(row.map)) continue;
    games.push({ file, map: row.map, side: row.side, result: row.result, version: row.version ?? r.version, matchId: row.matchId });
  } } } };
walk(path.join(ROOT, 'analysis'), 0);
const seen = new Set(); const uniq = games.filter((g) => { const k = g.matchId || g.file; if (seen.has(k)) return false; seen.add(k); return true; });
console.error(`${uniq.length} games vs ${TEAM}`);

// 2) Action classification from the recorded actions and the scraper's observation.
const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
function classify(o, rep) {
  const at = (s) => { const m = /^(attack|cast\d) (-?\d+),(-?\d+)$/.exec(s); return m ? { kind: m[1], p: [+m[2], +m[3]] } : null; };
  const isEnemy = (p) => o.enemies.some((e) => e[0] === p[0] && e[1] === p[1]);
  const isCamp = (p) => o.camps.some((c) => c[0] === p[0] && c[1] === p[1]);
  const hits = rep.map(at).filter(Boolean);
  if (hits.some((h) => isEnemy(h.p) || (h.kind !== 'attack' && o.enemies.some((e) => cheb(e, h.p) <= 1) && !isCamp(h.p) && cheb(h.p, o.pos) > 0))) return 'AGGRESSION';
  if (hits.some((h) => isCamp(h.p))) return 'FARMING';
  if (rep.some((s) => s.startsWith('submit'))) return 'BANKING';
  const mv = rep.map((s) => /^move (-?\d+),(-?\d+)$/.exec(s)).filter(Boolean).pop();
  if (mv) {
    const np = [+mv[1], +mv[2]];
    const dE = cheb(np, o.enemy_pos) - cheb(o.pos, o.enemy_pos);
    const dC = o.dist_to_camp >= 0 ? cheb(np, o.camp_pos) - cheb(o.pos, o.camp_pos) : 1;
    const dA = o.dist_to_altar >= 0 ? cheb(np, o.altar_pos) - cheb(o.pos, o.altar_pos) : 1;
    if (dE < 0 && dC < 0) return o.dist_to_enemy <= o.dist_to_camp ? 'AGGRESSION' : 'FARMING';
    if (dE < 0) return 'AGGRESSION';
    if (dC < 0) return 'FARMING';
    if (dA < 0 && o.gems > 0) return 'BANKING';
    if (dE > 0) return 'RETREAT';
    return 'OTHER_MOVE';
  }
  if (rep.includes('recall')) return 'RECALL';
  return 'IDLE';
}

// 3) Run turnhost --observe per game and collect rows.
const header = ['game', 'map', 'side_rank1', 'result_for_us', 'our_version', 'round_number', 'champion_name', 'dist_to_enemy', 'dist_to_camp', 'enemy_health_pct',
  'carried_gems', 'own_health_pct', 'visible_enemies', 'enemies_within_4', 'dist_to_altar', 'action', 'recorded_actions'];
const rows = [];
const run = (g) => new Promise((resolve) => {
  const rank1 = g.side === 'a' ? 1 : 0;
  const p = spawn(exe, ['--engine', path.join(ROOT, 'tools/engines/v1_0_3.wasm'), '--map', mapPath(g.map), '--replay', g.file, '--bot', bot, '--team', String(rank1), '--observe', '--log', '6000']);
  let out = '', err = '';
  p.stdout.on('data', (d) => { out += d; }); p.stderr.on('data', (d) => { err += d; });
  p.on('close', (code) => {
    let n = 0;
    for (const l of out.split('\n')) {
      if (!l.includes('SCRAPE {')) continue;
      const t = JSON.parse(l);
      const m = /SCRAPE (\{.*\})/.exec(t.log); if (!m) continue;
      const o = JSON.parse(m[1]);
      const rep = t.rep.filter((s) => !s.startsWith('prio') && !s.startsWith('buy') && !s.startsWith('sell') && s !== 'blocked');
      rows.push([path.basename(g.file, '.repl26a'), g.map, rank1 ? 'b' : 'a', g.result, g.version, o.round, o.champion, o.dist_to_enemy, o.dist_to_camp,
        o.enemy_health_pct, o.gems, (o.hp / Math.max(1, o.mhp)).toFixed(4), o.enemies.length, o.enemies.filter((e) => cheb(e, o.pos) <= 4).length, o.dist_to_altar,
        classify(o, rep), rep.join(' ')]);
      n++;
    }
    if (code !== 0) console.error('turnhost failed', g.file, err.split('\n').slice(-2).join(' '));
    resolve(n);
  });
});
let next = 0, done = 0, total = 0;
await Promise.all(Array.from({ length: jobs }, async () => { while (next < uniq.length) { const g = uniq[next++]; total += await run(g); if (++done % 25 === 0) console.error(`${done}/${uniq.length} games, ${total} rows`); } }));
fs.mkdirSync(path.dirname(OUT), { recursive: true });
const esc = (v) => (typeof v === 'string' && /[,"]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
fs.writeFileSync(OUT, [header.join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n') + '\n');
console.error(`wrote ${rows.length} rows from ${uniq.length} games -> ${path.relative(ROOT, OUT)}`);
