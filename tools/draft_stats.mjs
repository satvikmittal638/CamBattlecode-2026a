#!/usr/bin/env node
// Collect finished ranked match groups from the whole platform since --since (ISO) and store
// every match (map, per-side team, rating, draft, result, score) as JSONL; resumable.
//   node tools/draft_stats.mjs collect --since 2026-10-20T18:45:00Z [--out analysis/draft_stats/matches.jsonl] [--max 3000]
//   node tools/draft_stats.mjs report [--out ...] [--minrating 0]
import fs from 'node:fs';
import { api, sleep } from './bclib.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const OUT = opt('out', 'analysis/draft_stats/matches.jsonl');
const NAMES = ['Ryth', 'VesperVale', 'Vendetta', 'Cassi&Issac', 'Stellar', 'Prism', 'Marcella', 'Willow', 'Ren', 'Varg', 'Tavi', 'HeartOfRuin'];
if (args[0] === 'collect') {
  const since = Date.parse(opt('since')); const max = +opt('max', 3000);
  const done = new Set(fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l).groupId) : []);
  const ids = []; let next = null;
  for (let page = 0; page < 400 && ids.length < max; page++) {
    const r = await api('GET', '/match-groups?scope=all&kind=ranked' + (next ? `&before=${encodeURIComponent(next)}` : ''));
    if (!r.groups?.length) break;
    for (const g of r.groups) if (g.kind === 'ranked' && g.status === 'finished' && Date.parse(g.createdAt) >= since && !done.has(g.id)) ids.push(g.id);
    const last = r.groups[r.groups.length - 1];
    if (Date.parse(last.createdAt) < since || !r.more) break;
    next = r.next;
  }
  console.log(`groups to fetch: ${ids.length} (already ${done.size})`);
  let n = 0;
  const worker = async () => { while (ids.length) { const id = ids.shift(); try { const d = await api('GET', `/match-groups/${id}`);
    const lines = d.matches.filter((m) => m.status === 'finished').map((m) => JSON.stringify({ groupId: id, matchId: m.id, createdAt: m.createdAt, map: m.map, rounds: m.rounds, endReason: m.endReason,
      sides: m.sides.map((s) => ({ side: s.side, team: s.teamName, teamId: s.teamId, rating: s.ratingBefore ?? d.group.sides.find((x) => x.teamId === s.teamId)?.ratingBefore ?? null, draft: s.draft, result: s.result, score: s.score, version: s.version })) }));
    if (lines.length) fs.appendFileSync(OUT, lines.join('\n') + '\n'); if (++n % 100 === 0) console.log('fetched', n); } catch (e) { console.log('fail', id, e.message.slice(0, 80)); await sleep(5000); } } };
  await Promise.all([worker(), worker(), worker()]);
  console.log('done', n);
} else {
  const rows = fs.readFileSync(OUT, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  const minr = +opt('minrating', 0);
  const pick = {}; let games = 0;
  for (const m of rows) {
    if (m.sides.length !== 2 || !m.sides[0].result) continue;
    const [a, b] = m.sides; if ((a.rating ?? 0) < minr && (b.rating ?? 0) < minr) continue; games++;
    for (const [s, o] of [[a, b], [b, a]]) {
      const win = s.result === 'win' ? 1 : s.result === 'loss' ? 0 : 0.5; const exp = 1 / (1 + 10 ** (((o.rating ?? 1500) - (s.rating ?? 1500)) / 400));
      for (const c of new Set(s.draft)) { const k = NAMES[+c] ?? c; const p = (pick[k] ||= { n: 0, w: 0, exp: 0 }); p.n++; p.w += win; p.exp += exp; }
    }
  }
  console.log(`matches ${games} (minrating ${minr})`);
  console.log('champion      picks  pick%   win%  expected%  excess');
  for (const [k, p] of Object.entries(pick).sort((x, y) => (y[1].w - y[1].exp) / y[1].n - (x[1].w - x[1].exp) / x[1].n))
    console.log(k.padEnd(13), String(p.n).padStart(6), (100 * p.n / (2 * games)).toFixed(0).padStart(5) + '%', (100 * p.w / p.n).toFixed(1).padStart(6), (100 * p.exp / p.n).toFixed(1).padStart(9), ((100 * (p.w - p.exp) / p.n) >= 0 ? '+' : '') + (100 * (p.w - p.exp) / p.n).toFixed(1).padStart(6));
}
