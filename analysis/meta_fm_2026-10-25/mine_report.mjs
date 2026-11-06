// Summaries of mine_tables output.
//   node mine_report.mjs mine_fish.jsonl [mine_mite.jsonl ...]
import fs from 'node:fs';
const rows = process.argv.slice(2).flatMap((f) => fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)));
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN);
const pct = (a, b) => (b ? ((100 * a) / b).toFixed(0) + '%' : '-');
const f1 = (x) => (Number.isFinite(x) ? x.toFixed(2) : '-');
const by = (arr, key) => { const o = {}; for (const x of arr) { const k = key(x); (o[k] ||= []).push(x); } return o; };
const all = (k) => rows.flatMap((r) => r.S[k].map((x) => ({ ...x, source: r.source, map: r.map })));
const hist = (arr, edges, f) => edges.map((e, i) => `${i ? edges[i - 1] : '-inf'}..${e}: ${arr.filter((x) => f(x) < e && (i === 0 || f(x) >= edges[i - 1])).length}`).join(' | ');
const G = rows.length;

console.log(`games ${G}`);
// 1. Priority: which champion is ranked first?
{
  const P = rows.flatMap((r) => r.S.pri);
  let n = 0, nearestFirst = 0, lowHpLast = 0, bagLast = 0, nLow = 0, nBag = 0;
  const vals = {};
  for (const pr of P) {
    for (const p of pr) vals[p.v] = (vals[p.v] || 0) + 1;
    if (new Set(pr.map((p) => p.v)).size < 2) continue;
    n++;
    const top = pr.reduce((m, p) => (p.v > m.v ? p : m));
    const minD = Math.min(...pr.map((p) => p.enD));
    if (top.enD === minD) nearestFirst++;
    const low = pr.filter((p) => p.hpf < 0.4);
    if (low.length) { nLow++; const bottom = pr.reduce((m, p) => (p.v < m.v ? p : m)); if (bottom.hpf < 0.4) lowHpLast++; }
    const bag = pr.filter((p) => p.bag >= 30);
    if (bag.length) { nBag++; const bottom = pr.reduce((m, p) => (p.v < m.v ? p : m)); if (bottom.bag >= 30) bagLast++; }
  }
  console.log(`\n## Priority: ${P.length} rounds with priority sets; values used: ${Object.entries(vals).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([v, c]) => v + 'x' + c).join(' ')}`);
  console.log(`  rounds with distinct values ${n}: top-priority = champion nearest an enemy ${pct(nearestFirst, n)}; low-HP champion ranked last ${pct(lowHpLast, nLow)}; 30+ bag ranked last ${pct(bagLast, nBag)}`);
}
// 2. Recall / cancel
{
  const R = all('recall'), C = all('cancel');
  console.log(`\n## Recall: ${(R.length / G).toFixed(0)}/game, cancel ${(C.length / G).toFixed(0)}/game`);
  const bySrc = by(R, (x) => x.source);
  for (const [s, l] of Object.entries(bySrc).sort((a, b) => b[1].length - a[1].length).slice(0, 8)) {
    const c = C.filter((x) => x.source === s);
    console.log(`  ${s.padEnd(28)} recalls ${(l.length).toString().padStart(6)} | on spawn ${pct(l.filter((x) => x.home === 0).length, l.length)} | enemy<=6 ${pct(l.filter((x) => x.enD <= 6).length, l.length)} | hpf<0.5 ${pct(l.filter((x) => x.hpf < 0.5).length, l.length)} | bag>0 ${pct(l.filter((x) => x.bag > 0).length, l.length)} | cancels ${c.length}, cancelled after 1 round ${pct(c.filter((x) => x.after === 1).length, c.length)}`);
  }
  const off = R.filter((x) => x.home > 0);
  console.log(`  off-spawn recalls: ${off.length}; hpf mean ${f1(mean(off.map((x) => x.hpf)))}; gold mean ${f1(mean(off.map((x) => x.gold)))}; enemy within 8 ${pct(off.filter((x) => x.enD <= 8).length, off.length)}`);
}
// 3. Wards
{
  const W = all('ward');
  console.log(`\n## Wards: ${(W.length / G).toFixed(0)}/game; placed at distance ${hist(W, [1, 2, 3, 4, 9], (x) => x.d)}; by type ${Object.entries(by(W, (x) => x.t)).map(([k, v]) => k + ' ' + (v.length / G).toFixed(1)).join(', ')}`);
  console.log(`  ward tile: on our half ${pct(W.filter((x) => x.wardHome < x.wardEnemyHome).length, W.length)}; with enemy within 6 of placer ${pct(W.filter((x) => x.enD <= 6).length, W.length)}; round ${hist(W, [50, 150, 300, 600, 3000], (x) => x.r)}`);
}
// 4. Attacks: target choice
{
  for (const k of ['attack', 'cast']) {
    const A = all(k);
    const multi = A.filter((x) => x.nReach >= 2);
    console.log(`\n## ${k} on champions: ${(A.length / G).toFixed(0)}/game; with 2+ enemies in reach (${multi.length}): lowest absolute HP ${pct(multi.filter((x) => x.isLowest).length, multi.length)}, lowest HP fraction ${pct(multi.filter((x) => x.isLowestFrac).length, multi.length)}`);
    console.log(`  attacker local share at attack: ${hist(A, [0.3, 0.42, 0.5, 0.58, 0.7, 2], (x) => x.share)}; attacker hpf<0.3 ${pct(A.filter((x) => x.hpf < 0.3).length, A.length)}`);
    const tg = by(A, (x) => x.tgt);
    console.log(`  targets: ${Object.entries(tg).sort((a, b) => b[1].length - a[1].length).map(([t, l]) => `${t} ${pct(l.length, A.length)}`).join(', ')}`);
    if (k === 'cast') console.log(`  cast slots by type: ${Object.entries(by(A, (x) => x.t + ':' + x.slot)).sort((a, b) => b[1].length - a[1].length).slice(0, 12).map(([t, l]) => `${t} ${l.length}`).join(', ')}`);
  }
}
// 5. Tribute and locks
{
  const T = all('tribute'), L = all('lock');
  console.log(`\n## Tribute starts: ${(T.length / G).toFixed(1)}/game; bag ${hist(T, [10, 30, 60, 100, 200, 400, 2000], (x) => x.bag)}; enemy within 6 ${pct(T.filter((x) => x.enD <= 6).length, T.length)}; by type ${Object.entries(by(T, (x) => x.t)).map(([k, v]) => k + ' ' + v.length).join(', ')}`);
  console.log(`## Locks placed: ${(L.length / G).toFixed(1)}/game in ${rows.filter((r) => r.S.lock.length).length} games; placer bag ${hist(L, [1, 30, 100, 2000], (x) => x.bag)}; round ${hist(L, [100, 300, 600, 3000], (x) => x.r)}; placer altarD ${hist(L, [1, 2, 3, 99], (x) => x.altarD)}`);
  const lockThenTrib = rows.reduce((a, r) => a + r.S.lock.filter((l) => r.S.tribute.some((t) => t.r >= l.r && t.r - l.r <= 3)).length, 0);
  console.log(`   lock followed by our tribute within 3 rounds: ${pct(lockThenTrib, L.length)}`);
}
// 6. Idle near enemies (no move/attack/cast), what else
{
  const I = all('idle');
  console.log(`\n## Idle turns with enemy within 6: ${(I.length / G).toFixed(0)}/game; their other actions: ${Object.entries(by(I, (x) => x.kinds.sort().join('+') || 'none')).sort((a, b) => b[1].length - a[1].length).slice(0, 6).map(([k, v]) => k + ' ' + v.length).join(', ')}`);
  const B = rows.reduce((a, r) => a + r.S.buyAway, 0), H = rows.reduce((a, r) => a + r.S.buyHome, 0);
  console.log(`## Buys away from spawn (Tavi field buys): ${pct(B, B + H)}`);
}
