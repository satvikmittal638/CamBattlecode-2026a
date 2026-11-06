#!/usr/bin/env node
// Fast corpus downloader: list a team's matches (newest first), then fetch replay bundles with a
// concurrency pool. Resumable (skips matchIds already in index.json).
//   node tools/download_pool.mjs <teamId> <outDir> [--per-map 60] [--max-groups 2000] [--patch 0.0.3]
//        [--all-maps] [--concurrency 12] [--before ISO] [--kinds unranked,ranked]
import fs from 'node:fs';
import path from 'node:path';
import { api, fetchBundle } from './bclib.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const [teamId, outDir] = args;
const perMap = +opt('per-map', 60), maxGroups = +opt('max-groups', 2000), patch = opt('patch', ''), conc = +opt('concurrency', 12);
const beforeIso = opt('before'); const kinds = opt('kinds') ? new Set(opt('kinds').split(',')) : null;
const slug = (s) => String(s || 'unknown').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32) || 'x';
const pool = (await (await fetch('https://2026a.battlecode.co.uk/api/v1/maps/pool')).json()).maps.map((m) => m.name);
const wanted = args.includes('--all-maps') ? null : new Set(pool);
fs.mkdirSync(outDir, { recursive: true });
const indexPath = path.join(outDir, 'index.json');
const index = fs.existsSync(indexPath) ? JSON.parse(fs.readFileSync(indexPath, 'utf8')) : [];
const have = new Set(index.map((r) => r.matchId));
const count = {}; for (const r of index) count[r.map] = (count[r.map] || 0) + 1;
// 1) collect candidate matches
const todo = []; let before = '', scanned = 0;
const queued = {};
outer: while (scanned < maxGroups) {
  const q = new URLSearchParams({ scope: 'all', team: teamId, ...(before ? { before } : {}) });
  const page = await api('GET', '/match-groups?' + q);
  if (!page.groups.length) break;
  const gs = page.groups.filter((g) => g.status === 'finished' && (!beforeIso || g.createdAt < beforeIso) && (!kinds || kinds.has(g.kind)));
  scanned += page.groups.length;
  const details = await Promise.all(gs.map((g) => api('GET', `/match-groups/${g.id}`).then((d) => [g, d]).catch(() => null)));
  for (const x of details) {
    if (!x) continue; const [g, d] = x;
    for (const m of d.matches) {
      if (m.status !== 'finished' || have.has(m.id)) continue;
      if (patch && !String(m.patchId || '').startsWith(patch)) continue;
      if (wanted && !wanted.has(m.map)) continue;
      if ((count[m.map] || 0) + (queued[m.map] || 0) >= perMap) continue;
      queued[m.map] = (queued[m.map] || 0) + 1; todo.push([g, m]);
    }
  }
  const last = page.groups[page.groups.length - 1];
  before = `${last.createdAt}_${last.id}`;
  if (!page.more) break;
  if (wanted && [...wanted].every((mp) => (count[mp] || 0) + (queued[mp] || 0) >= perMap)) break;
}
console.error(`scanned ${scanned} groups; ${todo.length} matches to fetch`);
// 2) fetch with a pool
let next = 0, okN = 0, fail = 0;
const save = () => fs.writeFileSync(indexPath, JSON.stringify(index, null, 1));
async function worker() {
  while (next < todo.length) {
    const [g, m] = todo[next++];
    const me = m.sides.find((s) => s.teamId === teamId), opp = m.sides.find((s) => s.teamId !== teamId);
    const dir = path.join(outDir, m.map); fs.mkdirSync(dir, { recursive: true });
    const file = `${m.createdAt.replace(/[:.]/g, '-')}_${m.kind}_vs-${slug(opp?.teamName)}_${me?.side}_${m.id}.repl26a`;
    try { fs.writeFileSync(path.join(dir, file), await fetchBundle(m.id, { timeoutMs: 600000 })); }
    catch (e) { fail++; console.error('fail', m.id, e.message); continue; }
    index.push({ matchId: m.id, groupId: g.id, map: m.map, kind: m.kind, createdAt: m.createdAt, patch: m.patchId?.split(':')[0], side: me?.side,
      opponent: opp?.teamName, opponentId: opp?.teamId, result: me?.result, score: me?.score, oppScore: opp?.score, myDraft: me?.draft, oppDraft: opp?.draft,
      rounds: m.rounds, endReason: m.endReason, file: path.join(m.map, file) });
    have.add(m.id); okN++;
    if (okN % 20 === 0) { save(); console.error(`  ${okN}/${todo.length} fetched (${fail} failed)`); }
  }
}
await Promise.all(Array.from({ length: conc }, worker));
save();
const c2 = {}; for (const r of index) c2[r.map] = (c2[r.map] || 0) + 1;
console.log(`done: +${okN} (${fail} failed), ${index.length} total`, JSON.stringify(c2));
