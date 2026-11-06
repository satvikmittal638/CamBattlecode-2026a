// Focused questions on a set of platform v41 games (ours = v41 on the indexed side):
//  Q1 death context: team native kill totals kept separate; per-step attribution only when unambiguous
//     (enemy counter increments >= victims -> champion; 0 -> camp/other by actor; else ambiguous). Victim's
//     last own-turn actions are PROXIES. Certified personal awareness = the victim's own successful basic Attack
//     on an enemy champion in its last 3 own turns AND within 4 rounds (history reset at death); casts = unknown.
//  Q2 banking (tribute starts with bag size, gems lost on death)
//  Q3 purchases = all positive item deltas on Shop events; plus the first purchase per (game, champion).
//   node analysis/v41_strategy2/q_core.mjs <index.json> <labels comma|"every:N"> <out.json>
import fs from 'node:fs';
import path from 'node:path';
import { Worker } from 'node:worker_threads';
const [idxFile, sel, outFile] = process.argv.slice(2);
const idx = JSON.parse(fs.readFileSync(idxFile, 'utf8')).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
const games = sel.startsWith('every:') ? idx.filter((_, i) => i % +sel.split(':')[1] === 0) : idx.filter((x) => sel.split(',').includes(x.label));
const ROOT = '/Users/dmitt/Desktop/CamBattlecode';
const src = `const { parentPort, workerData } = require('node:worker_threads');
(async () => { const { dumpReplay, STEP_KINDS, CHAMPION_TYPES } = await import('${ROOT}/tools/replay_dump.mjs');
 for (const g of workerData) { const us = g.side === 'a' ? 0 : 1; const S = { key: g.key, result: g.result, deaths: [], tributes: [], shops: [], lostGems: [0, 0], killsNative: [0, 0], deathsN: [0, 0], ok: false };
  try { const turnActs = new Map(), lastTurns = new Map(); let last = null;
   await dumpReplay(g.path, { snapshots: 'none', onStep(x, ev, prev) { last = x; const kn = STEP_KINDS[x.step.kind]; const a = x.step.actor;
    if (a.kind === 1 && kn !== 'End turn' && !['Set priority', 'Tick', 'Phase'].includes(kn)) { const L = turnActs.get(a.index) || []; let k = kn === 'Move' ? 'move' : kn === 'Recall' ? 'recall' : (kn === 'Submit gems' || kn === 'Gems submitted') ? 'submit' : kn === 'Shop' ? 'shop' : kn;
      if ((kn === 'Attack' || kn === 'Cast ability') && ev && ev.target) { const me = x.champions.find((c) => c.entity.index === a.index); const enemyChamp = ev.target.kind === 'champion' && me && ev.target.team !== me.team; k = enemyChamp ? (kn === 'Attack' ? 'basicAtkChamp' : 'castNearChamp') : ev.target.kind === 'camp' ? 'atkCamp' : kn; }
      L.push(k); turnActs.set(a.index, L); }
    if (a.kind === 1 && kn === 'End turn') { const c = x.champions.find((y) => y.entity.index === a.index); const T = lastTurns.get(a.index) || []; T.push({ acts: turnActs.get(a.index) || [], onCampTile: c && c.position ? x.camps.some((k) => k.position.x === c.position.x && k.position.y === c.position.y && !(k.health > 0)) : false, round: x.round }); if (T.length > 3) T.shift(); lastTurns.set(a.index, T); turnActs.delete(a.index); }
    if (ev && ev.kind === 'Submit gems' && a.kind === 1) { const c = x.champions.find((y) => y.entity.index === a.index); if (c) S.tributes.push({ side: c.team === us ? 'us' : 'them', bag: ev.gemsCarried ?? c.gems, round: x.round }); }
    if (ev && ev.kind === 'Shop' && a.kind === 1 && ev.items) { const c = x.champions.find((y) => y.entity.index === a.index); if (c) for (const [it, d] of Object.entries(ev.items)) if (d > 0) { const first = !S.firstSeen?.[a.index]; (S.firstSeen ||= {})[a.index] = 1; S.shops.push({ side: c.team === us ? 'us' : 'them', type: CHAMPION_TYPES[c.type], item: it, round: x.round, first }); } }
    if (!prev) return;
    const K = [0, 0]; const D = [[], []];
    for (const c of x.champions) { const b = prev.find((y) => y.entity.index === c.entity.index); if (!b) continue; if (c.kills > b.kills) K[c.team] += c.kills - b.kills; if (b.alive && !c.alive) D[c.team].push({ c, b }); }
    for (const v of [0, 1]) { if (!D[v].length) continue; const k = K[1 - v], d = D[v].length;
     const attr = k >= d ? 'champion' : k === 0 ? (x.step.actor.kind === 2 ? 'camp' : 'other') : 'ambiguous';
     for (const { c, b } of D[v]) { const side = v === us ? 'us' : 'them'; S.deathsN[v === us ? 0 : 1]++; S.lostGems[v === us ? 0 : 1] += b.gems;
      const T = (lastTurns.get(c.entity.index) || []).filter((t) => x.round - t.round <= 4); const lastT = T[T.length - 1] || { acts: [], onCampTile: false };
      const cat = lastT.acts.some((q) => q === 'basicAtkChamp' || q === 'castNearChamp') ? 'fighting' : lastT.acts.includes('recall') ? 'recalling' : lastT.acts.includes('submit') ? 'tributing' : lastT.onCampTile ? 'onCaptureTile' : lastT.acts.includes('atkCamp') ? 'clearingCamp' : lastT.acts.includes('move') ? 'moving' : 'noAction';
      S.deaths.push({ side, round: x.round, type: CHAMPION_TYPES[c.type], attr, cat, gems: b.gems, hp0: b.health / b.maxHealth, certSeen: T.some((t) => t.acts.includes('basicAtkChamp')), simult: d });
      lastTurns.delete(c.entity.index); turnActs.delete(c.entity.index); } } } });
   S.killsNative = [last.champions.filter((c) => c.team === us).reduce((s, c) => s + c.kills, 0), last.champions.filter((c) => c.team !== us).reduce((s, c) => s + c.kills, 0)]; S.rounds = last.round; S.ok = true;
  } catch (e) { S.error = String(e.message).slice(0, 120); }
  parentPort.postMessage(S); } })();`;
const work = games.map((x) => ({ key: `${x.label}|${x.map}|${x.side}`, path: path.join(path.dirname(idxFile), x.file), side: x.side, result: x.result }));
const res = []; let werr = 0, badExit = 0; const jobs = 4;
await Promise.all(Array.from({ length: jobs }, (_, j) => new Promise((r) => { const w = new Worker(src, { eval: true, workerData: work.filter((_, i) => i % jobs === j) }); w.on('message', (m) => res.push(m)); w.on('error', (e) => { werr++; console.log('worker error', e.message); }); w.on('exit', (code) => { if (code) badExit++; r(); }); })));
const ok = res.filter((r) => r.ok); const n = ok.length;
console.log(`games selected ${games.length}, results ${res.length}, decoded ok ${n}, failed ${res.filter((r) => !r.ok).map((r) => r.key + ':' + r.error).join('; ') || 0}, worker errors ${werr}, non-zero exits ${badExit}; our wins ${ok.filter((r) => r.result === 'win').length}`);
if (res.length !== games.length || werr || badExit || n !== games.length) { fs.writeFileSync(outFile, JSON.stringify({ selection: sel, files: games.map((x) => x.file), results: res, incomplete: true }, null, 0)); console.log('INCOMPLETE - summary not printed; raw results saved'); process.exit(1); }
console.log(`team native kills (end counters): us ${ok.reduce((s, r) => s + r.killsNative[0], 0)}, them ${ok.reduce((s, r) => s + r.killsNative[1], 0)}; body deaths us ${ok.reduce((s, r) => s + r.deathsN[0], 0)}, them ${ok.reduce((s, r) => s + r.deathsN[1], 0)}`);
const pg = (x) => (x / n).toFixed(2);
for (const side of ['us', 'them']) { const D = ok.flatMap((r) => r.deaths.filter((d) => d.side === side)); const cnt = (f) => { const m = {}; for (const d of D) { const k = f(d); m[k] = (m[k] || 0) + 1; } return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v} (${(100 * v / D.length).toFixed(0)}%)`).join(', '); };
  console.log(`\nQ1 ${side} deaths ${D.length} (${pg(D.length)}/game): attribution: ${cnt((d) => d.attr)}\n   last own-turn action PROXY (within 4 rounds): ${cnt((d) => d.cat)}\n   certified personal awareness (own basic Attack on enemy champion, last 3 own turns & <=4 rounds): ${cnt((d) => d.certSeen ? 'yes' : 'unknown')} | simultaneous multi-death steps: ${D.filter((d) => d.simult > 1).length}\n   gems carried at death: total ${D.reduce((s, d) => s + d.gems, 0)} (${pg(D.reduce((s, d) => s + d.gems, 0))}/game), deaths with >=20 gems ${D.filter((d) => d.gems >= 20).length}\n   by type: ${cnt((d) => d.type)}`); }
for (const side of ['us', 'them']) { const T = ok.flatMap((r) => r.tributes.filter((t) => t.side === side)).map((t) => t.bag).sort((a, b) => a - b); const q = (p) => T[Math.floor(p * (T.length - 1))];
  console.log(`Q2 ${side}: tribute starts ${T.length} (${pg(T.length)}/game), bag p25/p50/p75/p90 ${q(.25)}/${q(.5)}/${q(.75)}/${q(.9)}; gems lost on death ${pg(ok.reduce((s, r) => s + r.lostGems[side === 'us' ? 0 : 1], 0))}/game`); }
for (const side of ['us', 'them']) { const S = ok.flatMap((r) => r.shops.filter((s) => s.side === side)); const first = {}; for (const s of S) { const k = s.type; (first[k] ||= {}); first[k][s.item] = (first[k][s.item] || 0) + 1; }
  const F = S.filter((s) => s.first); const ff = {}; for (const s of F) ff[s.item] = (ff[s.item] || 0) + 1;
  console.log(`Q3 ${side} first purchase per (game,champion) n=${F.length}: ${Object.entries(ff).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([i, c]) => i + ' ' + c).join(', ')}`);
  console.log(`Q3 ${side} all positive item deltas ${S.length}: top by type: ` + Object.entries(first).map(([t, m]) => `${t}: ${Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([i, c]) => i.replace(/ of /, ' ').replace('Emblem', 'Emb').replace('Shard', 'Sh') + ' ' + c).join(', ')}`).join(' | ')); }
fs.writeFileSync(outFile, JSON.stringify({ selection: sel, files: games.map((x) => x.file), results: ok }, null, 0));
console.log('saved', outFile);
