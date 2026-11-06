#!/usr/bin/env node
// Conditional-logit fit of camp-target choice (softmax over candidate groups of one decision).
//   node tools/ml/fit_clogit.mjs <train.jsonl,...> [--test file.jsonl] [--l2 0.01] [--iters 300] [--out model.json]
// Reports top-1 accuracy and mean log-likelihood on a 20% held-out split (by decision index hash)
// for the fitted model and for the hand-written W2 / W3 scores of our bot.
import fs from 'node:fs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const load = (f) => fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
let data = args[0].split(',').flatMap(load);
const testExt = opt('test') ? opt('test').split(',').flatMap(load) : null;
const l2 = +opt('l2', 0.01), iters = +opt('iters', 300);
const L = Math.log1p;
// Feature map for one candidate given the decision context.
export const FEATS = ['lGems', 'lGold', 'lDist', 'lHp', 'armed', 'armedLowHp', 'allyNear', 'enemyNear', 'side', 'gemsZero', 'distRank0', 'lDistArmed', 'lGemsPerHp'];
function feats(d, c, minDist) {
  const armed = c.armed / 100;
  return [
    L(c.gems), L(c.gold), L(c.dist), L(c.hp), armed, armed * (1 - d.hpf), Math.min(c.allyNear, 3), Math.min(c.enemyNear, 3),
    Math.max(-3, Math.min(3, (c.dOwn - c.dEnemy) / 10)), c.gems === 0 ? 1 : 0, c.dist === minDist ? 1 : 0, L(c.dist) * armed, L(c.gems / (1 + c.hp / 100)),
  ];
}
const prep = (rows) => rows.map((d) => { const md = Math.min(...d.cands.map((c) => c.dist)); return { y: d.chosen, X: d.cands.map((c) => feats(d, c, md)), d }; });
const hash = (i) => ((i * 2654435761) >>> 0) % 5;
let train, test;
if (testExt) { train = prep(data); test = prep(testExt); }
else { const P = prep(data); train = P.filter((_, i) => hash(i) !== 0); test = P.filter((_, i) => hash(i) === 0); }
const K = FEATS.length;
// standardise
const mu = new Array(K).fill(0), sd = new Array(K).fill(0); let n = 0;
for (const s of train) for (const x of s.X) { n++; for (let k = 0; k < K; k++) mu[k] += x[k]; }
for (let k = 0; k < K; k++) mu[k] /= n;
for (const s of train) for (const x of s.X) for (let k = 0; k < K; k++) sd[k] += (x[k] - mu[k]) ** 2;
for (let k = 0; k < K; k++) sd[k] = Math.sqrt(sd[k] / n) || 1;
const Z = (x) => x.map((v, k) => (v - mu[k]) / sd[k]);
for (const s of [...train, ...test]) s.Z = s.X.map(Z);
// fit by gradient ascent with Adam
let w = new Array(K).fill(0); const m = new Array(K).fill(0), v = new Array(K).fill(0);
const ll = (S, w) => { let t = 0, acc = 0; for (const s of S) { const u = s.Z.map((z) => z.reduce((a, zi, k) => a + zi * w[k], 0)); const mx = Math.max(...u); const den = u.reduce((a, ui) => a + Math.exp(ui - mx), 0); t += u[s.y] - mx - Math.log(den); if (u.indexOf(mx) === s.y) acc++; } return [t / S.length, acc / S.length]; };
for (let it = 1; it <= iters; it++) {
  const g = new Array(K).fill(0);
  for (const s of train) {
    const u = s.Z.map((z) => z.reduce((a, zi, k) => a + zi * w[k], 0)); const mx = Math.max(...u);
    const e = u.map((ui) => Math.exp(ui - mx)); const den = e.reduce((a, b) => a + b, 0);
    for (let j = 0; j < s.Z.length; j++) { const p = e[j] / den, c = (j === s.y ? 1 : 0) - p; for (let k = 0; k < K; k++) g[k] += c * s.Z[j][k]; }
  }
  for (let k = 0; k < K; k++) { g[k] = g[k] / train.length - l2 * w[k]; m[k] = 0.9 * m[k] + 0.1 * g[k]; v[k] = 0.999 * v[k] + 0.001 * g[k] * g[k]; w[k] += 0.05 * (m[k] / (1 - 0.9 ** it)) / (Math.sqrt(v[k] / (1 - 0.999 ** it)) + 1e-8); }
}
const [trLL, trAcc] = ll(train, w), [teLL, teAcc] = ll(test, w);
// baselines: hand-written scores (higher is better); accuracy only
const rule = (S, f) => { let acc = 0; for (const s of S) { const sc = s.d.cands.map((c) => f(s.d, c)); if (sc.indexOf(Math.max(...sc)) === s.y) acc++; } return acc / S.length; };
const W2 = (d, c) => { let sc = (c.gems + 1.5 * c.gold) / (c.dist + 1 + c.hp * 0.01); if (c.enemyNear) sc *= 0.5; if (c.allyNear) sc *= 0.6; return sc; };
const W3 = (d, c) => { const clear = c.hp / 60; let sc = (c.gems + 0.15 * c.gold) / (c.dist + 1 + clear + 5); if (c.enemyNear) sc *= 0.5; const taken = clear * c.armed; if (taken > 1.6 * 800 * d.hpf) sc *= 0.3; if (c.allyNear && c.hp <= 400) sc *= 0.35; return sc; };
const nearest = (d, c) => -c.dist;
const avgC = test.reduce((a, s) => a + s.d.cands.length, 0) / test.length;
console.log(`train ${train.length} test ${test.length} (avg ${avgC.toFixed(1)} candidates)`);
console.log(`model: train LL ${trLL.toFixed(3)} acc ${trAcc.toFixed(3)} | test LL ${teLL.toFixed(3)} acc ${teAcc.toFixed(3)}`);
console.log(`rules on test: nearest ${rule(test, nearest).toFixed(3)}  W2 ${rule(test, W2).toFixed(3)}  W3 ${rule(test, W3).toFixed(3)}`);
const raw = w.map((wk, k) => wk / sd[k]);
console.log('weights (per raw unit):'); FEATS.forEach((f, k) => console.log(`  ${f.padEnd(12)} ${raw[k].toFixed(4)}   (std ${w[k].toFixed(3)})`));
if (opt('out')) fs.writeFileSync(opt('out'), JSON.stringify({ feats: FEATS, raw, mu, sd, w, test: { ll: teLL, acc: teAcc } }, null, 1));
