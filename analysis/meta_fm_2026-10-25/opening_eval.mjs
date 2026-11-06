// Opening benchmark: play our side live from round 1 to --to with each bot while the opponent replays its recorded
// actions, and report economy and deaths at checkpoints. Paired across bots on the same games.
//   node opening_eval.mjs --index idx.json --bots name=wasm,name=wasm [--to 150] [--jobs 8] [--out res.json]
// idx entries: { file (relative to the index), map, side } (our team = side a -> 0, b -> 1).
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const ROOT = path.resolve(import.meta.dirname, '../..');
const idxFile = path.resolve(opt('index'));
const games = JSON.parse(fs.readFileSync(idxFile, 'utf8'));
const bots = opt('bots').split(',').map((s) => { const [n, w] = s.split('='); return { n, w: path.resolve(w) }; });
const TO = +opt('to', 150), jobs = +opt('jobs', 8);
const CP = [60, 100, 150].filter((c) => c <= TO);
const exe = path.join(ROOT, 'analysis/v58_deep_2026-10-24/harness/turnhost/target/release/turnhost');
const mapPath = (m) => { const f = m.replace(/_/g, '-') + '.map26a'; for (const d of ['workspace/maps', 'workspace/maps_holdout']) if (fs.existsSync(path.join(ROOT, d, f))) return path.join(ROOT, d, f); return null; };

const run = (g, b) => new Promise((resolve) => {
  const us = g.side === 'a' ? 0 : 1;
  const a = ['--engine', path.join(ROOT, 'tools/engines/v1_0_3.wasm'), '--map', mapPath(g.map), '--replay', path.join(path.dirname(idxFile), g.file),
    '--bot', b.w, '--team', String(us), '--live-from', '1', '--to', String(TO), '--log', '0'];
  const p = spawn(exe, a); let out = '';
  p.stdout.on('data', (d) => { out += d; }); p.on('close', (code) => {
    const S = out.trim().split('\n').filter((l) => l.startsWith('{"state"')).map((l) => JSON.parse(l));
    const res = {};
    let deaths = 0;
    for (let i = 1; i < S.length; i++) for (const c of S[i].champs) { const p0 = S[i - 1].champs.find((q) => q[0] === c[0]); if (c[1] === us && p0 && p0[6] && !c[6]) deaths++; if (CP.includes(S[i].state)) res[S[i].state] = res[S[i].state] || null; }
    for (const cp of CP) {
      const s = S.find((x) => x.state === cp); if (!s) continue;
      const mine = s.champs.filter((c) => c[1] === us);
      const dAt = (() => { let n = 0; for (let i = 1; i < S.length && S[i].state <= cp; i++) for (const c of S[i].champs) { const p0 = S[i - 1].champs.find((q) => q[0] === c[0]); if (c[1] === us && p0 && p0[6] && !c[6]) n++; } return n; })();
      res[cp] = { earned: mine.reduce((a, c) => a + c[9] + 30 * c[10], 0), shards: mine.reduce((a, c) => a + c[10], 0), gems: s.sub[us] + mine.reduce((a, c) => a + c[7], 0), deaths: dAt };
    }
    resolve({ code, res });
  });
});
const tasks = []; for (const g of games) for (const b of bots) tasks.push({ g, b });
const results = []; let next = 0;
await Promise.all(Array.from({ length: jobs }, async () => { while (next < tasks.length) { const t = tasks[next++]; const r = await run(t.g, t.b); results.push({ map: t.g.map, side: t.g.side, set: t.g.set, bot: t.b.n, ...r }); } }));
if (opt('out')) fs.writeFileSync(opt('out'), JSON.stringify(results, null, 1));
for (const b of bots) {
  const rs = results.filter((r) => r.bot === b.n && r.code === 0);
  const line = CP.map((cp) => { const v = rs.map((r) => r.res[cp]).filter(Boolean); const m = (f) => (v.reduce((a, x) => a + x[f], 0) / Math.max(1, v.length)); return `r${cp}: earned ${m('earned').toFixed(0)} shards ${m('shards').toFixed(1)} gems ${m('gems').toFixed(0)} deaths ${m('deaths').toFixed(2)}`; }).join(' | ');
  console.log(`${b.n.padEnd(8)} n=${rs.length}  ${line}`);
}
