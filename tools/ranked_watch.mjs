#!/usr/bin/env node
// Collect our team's ranked games played by one submission version: wait for new groups,
// download replays, keep an index and a running summary. Resumable.
//   node tools/ranked_watch.mjs <version> <outDir> [--target 100] [--since ISO] [--poll 120] [--once]
// Ranked groups are scheduled by the platform (about every 10 minutes, five games each);
// they cannot be requested. Writes <outDir>/index.json (rows usable by the analysis tools,
// side = our side) and <outDir>/summary.txt.
import fs from 'node:fs';
import path from 'node:path';
import { api, fetchBundle, sleep } from './bclib.mjs';

const US = '6b04505b-d16c-4196-b7c6-53a4688a32ca';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const version = Number(args[0]);
const outDir = args[1];
const target = Number(opt('target', 100)), since = opt('since', ''), poll = Number(opt('poll', 120)) * 1000;
fs.mkdirSync(outDir, { recursive: true });
const indexPath = path.join(outDir, 'index.json');
const index = fs.existsSync(indexPath) ? JSON.parse(fs.readFileSync(indexPath, 'utf8')) : [];
const have = new Set(index.map((r) => r.matchId));
const seenGroups = new Set(index.map((r) => r.groupId));
const slug = (s) => String(s || 'x').replace(/[^a-zA-Z0-9]+/g, '-').slice(0, 32);

function summarize() {
  const n = index.length, w = index.filter((r) => r.result === 'win').length;
  const lines = [`version ${version}: ${w}/${n} ranked games won (${n ? Math.round(100 * w / n) : 0}%), loss rate ${n ? Math.round(100 * (n - w) / n) : 0}%`];
  const by = (k) => { const o = {}; for (const r of index) { const x = (o[r[k]] ??= { w: 0, n: 0, gd: 0 }); x.n++; x.w += r.result === 'win'; x.gd += (r.score || 0) - (r.oppScore || 0); } return o; };
  lines.push('by opponent:'); for (const [k, v] of Object.entries(by('opponent')).sort((a, b) => b[1].n - a[1].n)) lines.push(`  ${k.padEnd(32)} ${v.w}/${v.n}  gemDiff ${Math.round(v.gd / v.n)}`);
  lines.push('by map:'); for (const [k, v] of Object.entries(by('map')).sort()) lines.push(`  ${k.padEnd(24)} ${v.w}/${v.n}  gemDiff ${Math.round(v.gd / v.n)}`);
  const end = {}; for (const r of index) { const k = `${r.result}:${r.endReason}`; end[k] = (end[k] || 0) + 1; } lines.push('end reasons: ' + JSON.stringify(end));
  fs.writeFileSync(path.join(outDir, 'summary.txt'), lines.join('\n') + '\n');
  return lines;
}

for (;;) {
  // newest groups first; stop paging at groups older than --since
  let before = '', pages = 0, added = 0;
  outer: for (; pages < 10; pages++) {
    const q = new URLSearchParams({ scope: 'all', team: US, ...(before ? { before } : {}) });
    const page = await api('GET', '/match-groups?' + q);
    for (const g of page.groups) {
      if (since && g.createdAt < since) break outer;
      if (g.kind !== 'ranked' || g.status !== 'finished' || seenGroups.has(g.id)) continue;
      const d = await api('GET', `/match-groups/${g.id}`);
      const mine = d.matches.filter((m) => m.sides.find((s) => s.teamId === US)?.version === version);
      if (!mine.length) { if (d.matches.every((m) => m.status === 'finished')) seenGroups.add(g.id); continue; }
      for (const m of mine) {
        if (m.status !== 'finished' || have.has(m.id)) continue;
        const me = m.sides.find((s) => s.teamId === US), op = m.sides.find((s) => s.teamId !== US);
        const dir = path.join(outDir, m.map); fs.mkdirSync(dir, { recursive: true });
        const file = path.join(m.map, `${m.createdAt.replace(/[:.]/g, '-')}_vs-${slug(op?.teamName)}_${me.side}_${m.id}.repl26a`);
        try { fs.writeFileSync(path.join(outDir, file), await fetchBundle(m.id, { timeoutMs: 600000 })); } catch (e) { console.error('bundle', m.id, e.message); continue; }
        index.push({ matchId: m.id, groupId: g.id, createdAt: m.createdAt, map: m.map, side: me.side, opponent: op?.teamName, opponentId: op?.teamId,
          result: me.result, score: me.score, oppScore: op?.score, myDraft: me.draft, oppDraft: op?.draft, rounds: m.rounds, endReason: m.endReason,
          ratingBefore: me.ratingBefore, ratingAfter: me.ratingAfter, version: me.version, file });
        have.add(m.id); added++;
      }
      seenGroups.add(g.id);
      fs.writeFileSync(indexPath, JSON.stringify(index, null, 1));
    }
    if (!page.groups.length || !page.more) break;
    const last = page.groups[page.groups.length - 1]; before = `${last.createdAt}_${last.id}`;
  }
  const lines = summarize();
  console.log(`${new Date().toISOString()} +${added} -> ${lines[0]}`);
  if (index.length >= target || args.includes('--once')) break;
  await sleep(poll);
}
