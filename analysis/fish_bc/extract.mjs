// Extract Fish observations + recorded actions for behavioural cloning.
//   node extract.mjs [--jobs 8] [--limit N]
// Sources: index.json (downloaded Fish replays) and our own games vs Fish (trial result.json rows under analysis/).
// For each game: turnhost --observe on Fish's side with tools/fishbc_observer.cpp; writes obs/<matchId>.tsv.gz:
//   line 1  "M ..." static map record
//   then    round \t champion handle \t champion type \t recorded actions (';') \t observation ("O ..." without prefix)
// Resumable: games with an existing obs file are skipped. Appends to games.json (game metadata).
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { spawn } from 'node:child_process';

const HERE = import.meta.dirname;
const ROOT = path.resolve(HERE, '../..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const exe = path.join(ROOT, 'analysis/v58_deep_2026-10-24/harness/turnhost/target/release/turnhost');
const bot = path.join(ROOT, 'workspace/bots/fishbc-observer/.cambc/build-release/bot-injected.wasm');
const mapPath = (m) => { const f = m.replace(/_/g, '-') + '.map26a'; for (const d of ['workspace/maps', 'workspace/maps_holdout']) if (fs.existsSync(path.join(ROOT, d, f))) return path.join(ROOT, d, f); return null; };

const games = [];
for (const r of JSON.parse(fs.readFileSync(path.join(HERE, 'index.json'), 'utf8'))) games.push({ ...r, source: 'census', path: path.join(HERE, r.file) });
// Our games vs Fish (trial folders).
const walk = (d, depth) => { if (depth > 5) return; for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) { if (f.name !== 'fish_bc') walk(p, depth + 1); } else if (f.name === 'result.json') {
  let r; try { r = JSON.parse(fs.readFileSync(p, 'utf8')); } catch { continue; }
  for (const row of r.rows || []) { if (!(row.opp === 'fish' || row.opponent === 'Intercontinental Fish') || !row.file) continue;
    const file = path.join(path.dirname(p), row.opp ? row.file : path.join('games', row.file)); if (!fs.existsSync(file)) continue;
    games.push({ matchId: row.matchId, map: row.map, fishSide: row.side === 'a' ? 'b' : 'a', fishResult: row.result === 'win' ? 'loss' : 'win', opponent: 'Agentic Loop Builders', createdAt: row.createdAt, source: 'ours', path: file }); } } } };
walk(path.join(ROOT, 'analysis'), 0);
const seen = new Set(); let todo = games.filter((g) => g.matchId && !seen.has(g.matchId) && seen.add(g.matchId) && mapPath(g.map));
fs.mkdirSync(path.join(HERE, 'obs'), { recursive: true });
todo = todo.filter((g) => !fs.existsSync(path.join(HERE, 'obs', g.matchId + '.tsv.gz'))).slice(0, +opt('limit', 1e9));
console.log(`${games.length} games known, ${todo.length} to extract`);
const metaFile = path.join(HERE, 'games.json');
const meta = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8')) : [];

const run = (g) => new Promise((resolve) => {
  const team = g.fishSide === 'a' ? 0 : 1;
  const p = spawn(exe, ['--engine', path.join(ROOT, 'tools/engines/v1_0_3.wasm'), '--map', mapPath(g.map), '--replay', g.path, '--bot', bot, '--team', String(team), '--observe', '--quantum', '3000000', '--log', '400000']);
  const chunks = []; let err = '';
  p.stdout.on('data', (d) => chunks.push(d)); p.stderr.on('data', (d) => { err += d; });
  p.on('close', (code) => {
    const lines = Buffer.concat(chunks).toString('utf8').split('\n');
    let mapLine = null; const out = []; let turns = 0, missing = 0;
    for (const l of lines) {
      if (!l.startsWith('{')) continue;
      const t = JSON.parse(l);
      let obs = null;
      for (const x of t.log.split('\n')) { if (x.startsWith('M ') && !mapLine) mapLine = x; else if (x.startsWith('O ')) obs = x.slice(2); }
      turns++;
      if (!obs) { missing++; continue; }
      out.push(`${t.r}\t${t.id}\t${t.type}\t${t.rep.join(';')}\t${obs}`);
    }
    if (code === 0 && mapLine && out.length) {
      fs.writeFileSync(path.join(HERE, 'obs', g.matchId + '.tsv.gz'), zlib.gzipSync(mapLine + '\n' + out.join('\n') + '\n', { level: 6 }));
      meta.push({ matchId: g.matchId, map: g.map, fishSide: g.fishSide, fishResult: g.fishResult, opponent: g.opponent, createdAt: g.createdAt, source: g.source, turns, observed: out.length, missing });
    } else console.error('failed', g.matchId, code, err.split('\n').filter(Boolean).slice(-1)[0]);
    resolve();
  });
});
let next = 0, done = 0; const t0 = Date.now();
await Promise.all(Array.from({ length: +opt('jobs', 8) }, async () => {
  while (next < todo.length) { await run(todo[next++]); if (++done % 100 === 0) { fs.writeFileSync(metaFile, JSON.stringify(meta)); console.log(`${done}/${todo.length} games, ${((Date.now() - t0) / 1000).toFixed(0)}s`); } }
}));
fs.writeFileSync(metaFile, JSON.stringify(meta));
console.log(`extracted ${done} games; total ${meta.length}`);
