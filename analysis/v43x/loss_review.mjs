// Loss review for a platform challenge run (platform/<run>/games/index.json). Per game, both teams:
// captured gems (capturer gem deltas on Capture steps), tributed score (index), deaths (alive->dead), native
// kills (end counters), gems lost on death, our prolonged-stationary proxy, gems held+tributed at 300/600/900.
// Loss class (proxy): boss map | stall (stationary>=10%) | combat (our deaths >= 1.5x theirs and >= 8) |
// economy (our captured < 0.75x theirs) | close (otherwise).   node analysis/v43x/loss_review.mjs <index.json> [out.json]
import fs from 'node:fs';
import path from 'node:path';
import { Worker } from 'node:worker_threads';
const idxFile = process.argv[2]; const outFile = process.argv[3];
const idx = JSON.parse(fs.readFileSync(idxFile, 'utf8')); const dir = path.dirname(idxFile);
const ROOT = '/Users/dmitt/Desktop/CamBattlecode';
const src = `const { parentPort, workerData } = require('node:worker_threads');
(async () => { const { dumpReplay, STEP_KINDS } = await import('${ROOT}/tools/replay_dump.mjs');
 for (const g of workerData) { const us = g.side === 'a' ? 0 : 1; const R = { key: g.key, ok: false };
  try { const cap = [0, 0], deaths = [0, 0], lost = [0, 0], ck = {}; const acted = new Map(), still = new Map(); let turns = 0, stat = 0, last = null, lastR = -1;
   await dumpReplay(g.path, { snapshots: 'none', onStep(x, ev, prev) { last = x; const kn = STEP_KINDS[x.step.kind]; const a = x.step.actor;
    if (x.round !== lastR) { lastR = x.round; if ([300, 600, 900].includes(x.round)) ck[x.round] = [0, 1].map((t) => x.submittedGems[t] + x.champions.filter((c) => c.team === t && c.alive).reduce((s, c) => s + c.gems, 0)); }
    if (prev) for (const c of x.champions) { const b = prev.find((y) => y.entity.index === c.entity.index); if (!b) continue; if (b.alive && !c.alive) { deaths[c.team]++; lost[c.team] += b.gems; } if (kn === 'Capture') cap[c.team] += Math.max(0, c.gems - b.gems); }
    if (a.kind === 1) { if (kn !== 'End turn') { if (!['Set priority', 'Tick', 'Phase'].includes(kn)) acted.set(a.index, true); }
     else { const c = x.champions.find((y) => y.entity.index === a.index); if (c && c.team === us && c.alive && c.position && x.round >= 5) { turns++; const s = still.get(a.index) || { n: 0 }; if (!acted.get(a.index) && s.p && s.p.x === c.position.x && s.p.y === c.position.y) s.n++; else { s.p = c.position; s.n = acted.get(a.index) ? 0 : 1; } still.set(a.index, s); if (s.n >= 20) stat++; } acted.delete(a.index); } } } });
   const kills = [0, 1].map((t) => last.champions.filter((c) => c.team === t).reduce((s, c) => s + c.kills, 0));
   Object.assign(R, { ok: true, rounds: last.round, cap: [cap[us], cap[1 - us]], deaths: [deaths[us], deaths[1 - us]], kills: [kills[us], kills[1 - us]], lost: [lost[us], lost[1 - us]], stat: stat / Math.max(1, turns), ck: Object.fromEntries(Object.entries(ck).map(([r, v]) => [r, [v[us], v[1 - us]]])) });
  } catch (e) { R.error = String(e.message).slice(0, 120); }
  parentPort.postMessage(R); } })();`;
const work = idx.map((x) => ({ key: `${x.label}|${x.map}|${x.side}`, path: path.join(dir, x.file), side: x.side }));
const res = new Map(); let werr = 0, bad = 0; const jobs = 5;
await Promise.all(Array.from({ length: jobs }, (_, j) => new Promise((r) => { const w = new Worker(src, { eval: true, workerData: work.filter((_, i) => i % jobs === j) }); w.on('message', (m) => res.set(m.key, m)); w.on('error', (e) => { werr++; console.log('worker error', e.message); }); w.on('exit', (c) => { if (c) bad++; r(); }); })));
const failed = [...res.values()].filter((r) => !r.ok); console.log(`games ${idx.length}, decoded ${res.size - failed.length}, failed ${failed.length}, worker errors ${werr}, bad exits ${bad}`);
if (res.size !== idx.length || failed.length || werr || bad) { console.log('INCOMPLETE'); process.exit(1); }
const rows = idx.map((x) => ({ ...x, m: res.get(`${x.label}|${x.map}|${x.side}`) }));
const cls = (x) => { const m = x.m; if (/contest|boss/.test(x.map)) return 'boss-map'; if (m.stat >= 0.10) return 'stall'; if (m.deaths[0] >= 8 && m.deaths[0] >= 1.5 * Math.max(1, m.deaths[1])) return 'combat'; if (m.cap[0] < 0.75 * m.cap[1]) return 'economy'; return 'close'; };
for (const pool of [...new Set(rows.map((x) => x.label.split('_')[0]))]) { const P = rows.filter((x) => x.label.startsWith(pool + '_')); const L = P.filter((x) => x.result !== 'win');
  const c = {}; for (const x of L) c[cls(x)] = (c[cls(x)] || 0) + 1;
  const avg = (S, f) => (S.reduce((s, x) => s + f(x.m), 0) / Math.max(1, S.length)).toFixed(1);
  console.log(`\n${pool}: ${P.length - L.length}/${P.length} wins | losses by class (proxy): ${JSON.stringify(c)}`);
  console.log(`   losses avg: our cap ${avg(L, (m) => m.cap[0])} vs ${avg(L, (m) => m.cap[1])}, deaths ${avg(L, (m) => m.deaths[0])} vs ${avg(L, (m) => m.deaths[1])}, kills ${avg(L, (m) => m.kills[0])} vs ${avg(L, (m) => m.kills[1])}, gems lost ${avg(L, (m) => m.lost[0])} vs ${avg(L, (m) => m.lost[1])}, stationary ${(100 * L.reduce((s, x) => s + x.m.stat, 0) / Math.max(1, L.length)).toFixed(1)}%`);
  console.log(`   wins avg:   our cap ${avg(P.filter((x) => x.result === 'win'), (m) => m.cap[0])} vs ${avg(P.filter((x) => x.result === 'win'), (m) => m.cap[1])}, deaths ${avg(P.filter((x) => x.result === 'win'), (m) => m.deaths[0])} vs ${avg(P.filter((x) => x.result === 'win'), (m) => m.deaths[1])}`);
  for (const x of L) { const m = x.m; console.log(`   L ${x.label.padEnd(9)} ${x.map.padEnd(22)} ${x.side} ${x.score}-${x.oppScore} r${m.rounds} ${cls(x).padEnd(8)} cap ${m.cap[0]}/${m.cap[1]} deaths ${m.deaths[0]}/${m.deaths[1]} kills ${m.kills[0]}/${m.kills[1]} lost ${m.lost[0]}/${m.lost[1]} stat ${(100 * m.stat).toFixed(0)}% @600 ${m.ck[600] ? m.ck[600].join('/') : '-'}`); } }
if (outFile) fs.writeFileSync(outFile, JSON.stringify(rows, null, 0));
