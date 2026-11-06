// For every drifting game in a batch summary: first deep state difference and first rejected recorded actions.
//   node drift_diag.mjs <batch dir> <games index.json> [bot.wasm]
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const [dir, indexFile, botArg] = process.argv.slice(2);
const bot = botArg || path.join(ROOT, 'workspace/bots/v58-base/.cambc/build-release/bot-injected.wasm');
const summary = JSON.parse(fs.readFileSync(path.join(dir, 'summary.json'), 'utf8'));
for (const r of summary.filter((x) => x.drift)) {
  const map = path.join(ROOT, 'workspace/maps', r.map.replace(/_/g, '-') + '.map26a');
  const res = spawnSync(path.join(HERE, 'turnhost/target/release/turnhost'), ['--engine', path.join(ROOT, 'tools/engines/v1_0_3.wasm'), '--map', map, '--bot', bot,
    '--replay', path.join(path.dirname(indexFile), r.file), '--team', r.side === 'a' ? '0' : '1', '--out', '/dev/null'],
  { env: { ...process.env, TURNHOST_REJECTS: '1', TURNHOST_DEEPCHECK: '1' } });
  const lines = res.stderr.toString().split('\n');
  const deep = lines.find((l) => l.startsWith('deep diff')) || lines.find((l) => l.startsWith('drift at')) || '-';
  const deepRound = +((deep.match(/round (\d+)/) || [])[1] || 1e9);
  const rej = lines.filter((l) => l.startsWith('rejected')).filter((l) => +l.match(/^rejected r(\d+)/)[1] <= deepRound).slice(-2);
  console.log(`## ${r.map} ${r.result} drift ${r.drift}\n   ${deep.slice(0, 220)}\n   ${rej.map((x) => x.slice(0, 200)).join('\n   ')}`);
}
