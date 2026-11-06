// Run turnhost over many replays in parallel (shadow mode by default) and summarise fidelity.
//   node batch_shadow.mjs --index <games/index.json> --bot <bot.wasm> --out <dir> [--filter all|loss|heavy]
//        [--jobs 8] [--opp-bot <wasm>] [--extra "--detail"] [--engine v2_0_0]
// Writes <out>/<game file stem>.jsonl per game and <out>/summary.json.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const indexFile = path.resolve(opt('index'));
const bot = path.resolve(opt('bot'));
const outDir = path.resolve(opt('out'));
const filter = opt('filter', 'all');
const jobs = +opt('jobs', 8);
const oppBot = opt('opp-bot');
const extra = (opt('extra', '--detail') || '').split(' ').filter(Boolean);
const special = /contest|boss_battle/;
const engine = path.join(ROOT, 'tools/engines', opt('engine', 'v2_0_0') + '.wasm');

let games = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
games = games.filter((g) => filter === 'all' || (g.result !== 'win' && (filter === 'loss' || (!special.test(g.map) && g.oppScore - g.score >= 500))));
fs.mkdirSync(outDir, { recursive: true });
const exe = path.join(HERE, 'turnhost/target/release/turnhost');
const mapPath = (m) => {
  const f = m.replace(/_/g, '-') + '.map26a';
  for (const d of ['workspace/maps', 'workspace/maps_holdout']) if (fs.existsSync(path.join(ROOT, d, f))) return path.join(ROOT, d, f);
  return null;
};

const summary = [];
let next = 0;
async function worker() {
  while (next < games.length) {
    const g = games[next++];
    const stem = path.basename(g.file, '.repl26a');
    const out = path.join(outDir, `${g.map}__${stem}.jsonl`);
    const a = ['--engine', engine, '--map', mapPath(g.map), '--replay', path.join(path.dirname(indexFile), g.file),
      '--bot', bot, '--team', g.side === 'a' ? '0' : '1', '--out', out, ...extra];
    if (oppBot) a.push('--opp-bot', path.resolve(oppBot));
    const t0 = Date.now();
    const res = await new Promise((resolve) => {
      const p = spawn(exe, a);
      let err = '';
      p.stderr.on('data', (d) => { err += d; });
      p.on('close', (code) => resolve({ code, err }));
    });
    const m = res.err.match(/bot turns (\d+), identical to recorded (\d+).*rebuilds (\d+), state drift (\d+), first drift round (-?\d+)/);
    const row = { map: g.map, file: g.file, out: path.relative(outDir, out), result: g.result, score: g.score, oppScore: g.oppScore, side: g.side, opponent: g.opponent,
      code: res.code, turns: m ? +m[1] : null, same: m ? +m[2] : null, rebuilds: m ? +m[3] : null, drift: m ? +m[4] : null, firstDrift: m ? +m[5] : null, secs: (Date.now() - t0) / 1000 };
    if (res.code !== 0) row.error = res.err.split('\n').filter(Boolean).slice(-3).join(' | ');
    summary.push(row);
    process.stderr.write(`${summary.length}/${games.length} ${g.map} ${row.result} ${row.same}/${row.turns} drift ${row.drift}${row.error ? ' ERROR ' + row.error : ''}\n`);
  }
}
await Promise.all(Array.from({ length: jobs }, worker));
fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 1));
const ok = summary.filter((r) => r.code === 0);
const tot = ok.reduce((s, r) => s + r.turns, 0), same = ok.reduce((s, r) => s + r.same, 0);
console.log(`games ${summary.length}, ok ${ok.length}, turns ${tot}, identical ${same} (${(100 * same / Math.max(1, tot)).toFixed(2)}%), drift games ${ok.filter((r) => r.drift).length}`);
