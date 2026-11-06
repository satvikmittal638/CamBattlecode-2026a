#!/usr/bin/env node
// Decision analysis: what a champion does right after gaining gems (capture), recall triggers,
// shop behaviour. Works on KM index (top_replays/2_KratosMessi) or folder mode (--side a|b).
//   node analysis/kratosmessi/decisions.mjs top_replays/2_KratosMessi --recent 40
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
import { loadMap, groupAt, cheb, mean, median } from './lib.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const dir = args[0];
const MAPS = ['collision', 'corners', 'elkring', 'expanse', 'interlock', 'lanes', 'monolith', 'packs', 'rows'];
let rows;
if (fs.existsSync(path.join(dir, 'index.json'))) rows = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8')).map((r) => ({ ...r, path: path.join(dir, 'replays', r.file), me: r.side === 'b' ? 1 : 0 }));
else rows = fs.readdirSync(dir).filter((f) => f.endsWith('.repl26a')).map((f) => ({ file: f, path: path.join(dir, f), map: MAPS.find((mm) => f.startsWith(mm)), me: opt('side', 'a') === 'b' ? 1 : 0, createdAt: f }));
if (opt('map')) rows = rows.filter((r) => r.map === opt('map'));
rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
rows = rows.slice(0, +opt('recent', 40));

const afterCap = {}; // gemsBucket -> {trib, camp, recall}
const tribDist = []; // distance to altar when deciding to tribute vs camp
const recallCtx = []; const shopSeq = {}; const tribGemsByMap = {};
const inc = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };
const capFeat = [];
for (const r of rows) {
  const d = await dumpReplay(r.path, { snapshots: 'round' });
  const m = loadMap(r.map);
  const me = r.me;
  const myIds = d.meta.finalChampions.filter((c) => c.team === me).map((c) => c.id);
  const typeOf = Object.fromEntries(d.meta.finalChampions.map((c) => [c.id, c.type]));
  const snaps = d.snapshots;
  const snapBy = new Map(); for (const s of snaps) if (!snapBy.has(s.round)) snapBy.set(s.round, s);
  for (const id of myIds) {
    const evs = d.events.filter((e) => e.actor?.kind === 1 && e.actor.index === id);
    // gem gains from snapshots
    let prev = 0;
    for (const s of snaps) {
      const c = s.champions.find((x) => x.id === id); if (!c) continue;
      if (c.alive && c.gems > prev) {
        // next decisive event after this round
        const nxt = evs.find((e) => e.round >= s.round && ((e.kind === 'Attack' && e.target?.kind === 'camp') || e.kind === 'Submit gems' || e.kind === 'Recall'));
        let cls = !nxt ? 'none' : nxt.kind === 'Submit gems' ? 'trib' : nxt.kind === 'Recall' ? 'recall' : 'camp';
        const b = c.gems < 30 ? '<30' : c.gems < 45 ? '30-44' : c.gems < 60 ? '45-59' : c.gems < 80 ? '60-79' : '80+';
        const ad = Math.min(...m.altars.map((a) => cheb(a, c.pos)));
        const ab = ad <= 5 ? 'alt<=5' : ad <= 10 ? 'alt6-10' : ad <= 20 ? 'alt11-20' : 'alt>20';
        (afterCap[b] ??= {}); inc(afterCap[b], cls);
        (afterCap[ab] ??= {}); inc(afterCap[ab], cls);
        capFeat.push({ gems: c.gems, ad, cls, hpf: c.hp / c.maxHp, round: s.round, map: r.map, champ: c.type });
      }
      prev = c.gems;
    }
    for (const e of evs) {
      if (e.kind === 'Recall') {
        const s = snapBy.get(e.round); const c = s?.champions.find((x) => x.id === id);
        // did it take damage in the last 3 rounds? (hp drop)
        const s3 = snapBy.get(e.round - 3); const c3 = s3?.champions.find((x) => x.id === id);
        recallCtx.push({ hpf: c ? c.hp / c.maxHp : null, hp: c?.hp, maxHp: c?.maxHp, gold: c?.gold, gems: c?.gems, dmg3: c && c3 ? c3.hp - c.hp : 0, champ: typeOf[id], dist: c?.pos ? cheb(c.pos, m.spawnC[me]) : null, round: e.round });
      }
    }
  }
  for (const e of d.events) if (e.kind === 'Submit gems' && e.team === me) (tribGemsByMap[r.map] ??= []).push(e.gemsCarried);
}
console.log('After-gem-gain next action (by gems carried / by altar distance):');
for (const [k, v] of Object.entries(afterCap)) { const t = Object.values(v).reduce((a, b) => a + b, 0); console.log(' ', k.padEnd(9), t, Object.entries(v).map(([a, b]) => `${a}:${(b / t * 100).toFixed(0)}%`).join(' ')); }
// cross-tab gems x altar distance -> trib share
const cross = {};
for (const f of capFeat) { const gb = f.gems < 30 ? 'g<30' : f.gems < 45 ? 'g30-44' : f.gems < 70 ? 'g45-69' : 'g70+'; const ab = f.ad <= 6 ? 'a<=6' : f.ad <= 12 ? 'a7-12' : 'a>12'; const k = gb + ' ' + ab; (cross[k] ??= { n: 0, trib: 0 }); cross[k].n++; if (f.cls === 'trib') cross[k].trib++; }
console.log('trib share by gems x altarDist:'); for (const [k, v] of Object.entries(cross).sort()) console.log('  ', k.padEnd(14), v.n, (v.trib / v.n * 100).toFixed(0) + '%');
console.log('Recall contexts:', recallCtx.length);
const rb = {}; for (const x of recallCtx) { const k = (x.hpf < 0.4 ? 'lowhp' : 'okhp') + (x.gold >= 150 ? '+gold150' : x.gold >= 90 ? '+gold90' : '') + (x.dmg3 > 0 ? '+hit' : ''); inc(rb, k); }
console.log(rb);
console.log('recall hpf percentiles', [0.1, 0.25, 0.5, 0.75, 0.9].map((p) => { const a = recallCtx.map((x) => x.hpf).filter((x) => x != null).sort((x, y) => x - y); return a[Math.floor(p * a.length)]?.toFixed(2); }).join(' '));
const hiRecall = recallCtx.filter((x) => x.hpf >= 0.5);
console.log('high-hp recalls: gold mean', mean(hiRecall.map((x) => x.gold)).toFixed(0), 'gold>=150 share', (hiRecall.filter((x) => x.gold >= 150).length / hiRecall.length).toFixed(2), 'gems mean', mean(hiRecall.map((x) => x.gems)).toFixed(0), 'n', hiRecall.length);
const g = {}; for (const x of hiRecall) inc(g, x.gold >= 300 ? '300+' : x.gold >= 150 ? '150-299' : x.gold >= 90 ? '90-149' : '<90'); console.log('high-hp recall gold buckets', g);
const lowRecall = recallCtx.filter((x) => x.hpf < 0.5);
const lg = {}; for (const x of lowRecall) inc(lg, x.gold >= 150 ? '150+' : x.gold >= 90 ? '90-149' : '<90'); console.log('low-hp recall gold buckets', lg);
console.log('recall hp absolute (low) median', median(lowRecall.map((x) => x.hp)), 'maxHp median', median(lowRecall.map((x) => x.maxHp)));
for (const [k, v] of Object.entries(tribGemsByMap)) console.log('trib gems', k.padEnd(9), 'n', v.length, 'mean', mean(v).toFixed(1), 'median', median(v));
