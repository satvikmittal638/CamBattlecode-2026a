// Counterfactual rollouts: branch each selected state live for H rounds with every variant, same opponent policy,
// and compare outcomes. Opponents are either a bot (--opp <wasm>, warm through shadow mode) or the recorded actions.
//   node rollout.mjs --states s.json --variants base,shield,... [--opp variants/base.wasm|scripted] [--h 12]
//        [--index games/index.json] [--jobs 8] [--out results.json] [--limit N] [--opp-from R] [--vdir variants]
// --opp-from R: with a bot opponent, the opponents replay their recorded actions until round R, then the bot plays.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
let states = JSON.parse(fs.readFileSync(opt('states'), 'utf8'));
if (opt('limit')) states = states.slice(0, +opt('limit'));
const variants = opt('variants').split(',');
const opp = opt('opp', 'scripted');
const H = +opt('h', 12);
const jobs = +opt('jobs', 8);
const indexDir = path.dirname(path.resolve(opt('index', path.join(ROOT, 'analysis/current_bot_review_2026-10-23/games/index.json'))));
const exe = path.join(HERE, 'turnhost/target/release/turnhost');
const vdir = path.resolve(opt('vdir', path.join(HERE, 'variants')));
const mapPath = (m) => path.join(ROOT, 'workspace/maps', m.replace(/_/g, '-') + '.map26a');

const run = (st, v) => new Promise((resolve) => {
  const a = ['--engine', path.join(ROOT, 'tools/engines/v1_0_3.wasm'), '--map', mapPath(st.map), '--replay', path.join(indexDir, st.file),
    '--bot', path.join(vdir, `${v}.wasm`), '--team', String(st.team), '--live-from', String(st.round), '--to', String(st.round + H), '--log', '0'];
  if (opp !== 'scripted') a.push('--opp-bot', path.resolve(opp));
  if (opt('opp-from')) a.push('--opp-from', opt('opp-from'));
  const p = spawn(exe, a);
  let out = '', err = '';
  p.stdout.on('data', (d) => { out += d; });
  p.stderr.on('data', (d) => { err += d; });
  p.on('close', (code) => resolve({ code, out, err }));
});

// Outcome of one rollout from its per-round state lines.
function score(st, out) {
  const lines = out.trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const S = lines.filter((x) => x.state !== undefined);
  if (S.length < 2) return null;
  const first = S[0], last = S[S.length - 1];
  const us = st.team;
  const deaths = (team) => { let n = 0; for (let i = 1; i < S.length; i++) for (const c of S[i].champs) { const p = S[i - 1].champs.find((q) => q[0] === c[0]); if (c[1] === team && p && p[6] && !c[6]) n++; } return n; };
  const focal = S.some((s) => s.champs.some((c) => c[0] === st.champ && !c[6]));
  const hp = (s, team) => s.champs.filter((c) => c[1] === team && c[6]).reduce((a, c) => a + c[5], 0);
  const gems = (s, team) => s.sub[team] + s.champs.filter((c) => c[1] === team).reduce((a, c) => a + c[7], 0);
  return {
    focalDead: focal ? 1 : 0, ourDeaths: deaths(us), theirDeaths: deaths(1 - us),
    hpSwing: (hp(last, us) - hp(first, us)) - (hp(last, 1 - us) - hp(first, 1 - us)),
    gemSwing: (gems(last, us) - gems(first, us)) - (gems(last, 1 - us) - gems(first, 1 - us)),
  };
}

const tasks = [];
for (const st of states) for (const v of variants) tasks.push({ st, v });
const results = [];
let next = 0, done = 0;
async function worker() {
  while (next < tasks.length) {
    const t = tasks[next++];
    const r = await run(t.st, t.v);
    const s = r.code === 0 ? score(t.st, r.out) : null;
    results.push({ ...t.st, variant: t.v, ok: !!s, ...(s || {}), err: s ? undefined : r.err.split('\n').filter(Boolean).slice(-1)[0] });
    if (++done % 50 === 0) process.stderr.write(`${done}/${tasks.length}\n`);
  }
}
await Promise.all(Array.from({ length: jobs }, worker));
if (opt('out')) fs.writeFileSync(opt('out'), JSON.stringify(results, null, 1));

// Paired summary against the first variant.
const base = variants[0];
const key = (r) => `${r.file}|${r.round}|${r.champ}`;
const baseBy = new Map(results.filter((r) => r.variant === base && r.ok).map((r) => [key(r), r]));
console.log(`opponents: ${opp}; horizon ${H} rounds; states ${states.length}`);
console.log('variant      n   focalDead  ourDeaths  theirDeaths  netKills   hpSwing   gemSwing | vs base: focal saved/lost');
for (const v of variants) {
  const rs = results.filter((r) => r.variant === v && r.ok && baseBy.has(key(r)));
  const avg = (f) => rs.reduce((a, r) => a + r[f], 0) / Math.max(1, rs.length);
  let saved = 0, lost = 0;
  for (const r of rs) { const b = baseBy.get(key(r)); if (b.focalDead && !r.focalDead) saved++; if (!b.focalDead && r.focalDead) lost++; }
  console.log(`${v.padEnd(10)} ${String(rs.length).padStart(4)} ${avg('focalDead').toFixed(3).padStart(10)} ${avg('ourDeaths').toFixed(3).padStart(10)} ${avg('theirDeaths').toFixed(3).padStart(12)} ${(avg('theirDeaths') - avg('ourDeaths')).toFixed(3).padStart(9)} ${avg('hpSwing').toFixed(0).padStart(9)} ${avg('gemSwing').toFixed(1).padStart(10)} | ${saved}/${lost}`);
}
