#!/usr/bin/env node
// Download a team's most recent replays, capped per map, covering the current map pool.
//   node tools/download_recent.mjs <teamId> <outDir> [--per-map 6] [--max-groups 200]
//        [--patch 0.0.3] [--all-maps] [--version N]   (--version: only matches where this team played version N)
// Layout: outDir/<map>/<createdAt>_<kind>_vs-<opponent>_<side>_<matchId>.repl26a
//         outDir/index.json (one row per match: map, side, opponent, kind, result, scores, drafts, rounds, endReason)
import fs from 'node:fs';
import path from 'node:path';
import { api, fetchBundle } from './bclib.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const [teamId, outDir] = args;
if (!teamId || !outDir) { console.error('usage: download_recent.mjs <teamId> <outDir> [--per-map N] [--max-groups N] [--patch P] [--all-maps]'); process.exit(2); }
const perMap = Number(opt('per-map', 6));
const maxGroups = Number(opt('max-groups', 200));
const patch = opt('patch', '0.0.3');
const version = opt('version') ? Number(opt('version')) : null;
const slug = (s) => String(s || 'unknown').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32) || 'x';

const pool = (await (await fetch('https://2026a.battlecode.co.uk/api/v1/maps/pool')).json()).maps.map((m) => m.name);
const wanted = args.includes('--all-maps') ? null : new Set(pool);
fs.mkdirSync(outDir, { recursive: true });
const indexPath = path.join(outDir, 'index.json');
const index = fs.existsSync(indexPath) ? JSON.parse(fs.readFileSync(indexPath, 'utf8')) : [];
const have = new Set(index.map((r) => r.matchId));
const count = {};
for (const r of index) count[r.map] = (count[r.map] || 0) + 1;
const full = () => wanted && [...wanted].every((m) => (count[m] || 0) >= perMap);

let before = '', scanned = 0, added = 0;
outer: while (scanned < maxGroups && !full()) {
  const q = new URLSearchParams({ scope: 'all', team: teamId, ...(before ? { before } : {}) });
  const page = await api('GET', '/match-groups?' + q);
  if (!page.groups.length) break;
  for (const g of page.groups) {
    if (++scanned > maxGroups || full()) break outer;
    if (g.status !== 'finished') continue;
    const detail = await api('GET', `/match-groups/${g.id}`);
    const jobs = [];
    for (const m of detail.matches) {
      if (m.status !== 'finished' || have.has(m.id)) continue;
      if (patch && !String(m.patchId || '').startsWith(patch)) continue;
      if (wanted && !wanted.has(m.map)) continue;
      if (version !== null && m.sides.find((s) => s.teamId === teamId)?.version !== version) continue;
      if ((count[m.map] || 0) >= perMap) continue;
      count[m.map] = (count[m.map] || 0) + 1;
      jobs.push(m);
    }
    await Promise.all(jobs.map(async (m) => {
      const me = m.sides.find((s) => s.teamId === teamId), opp = m.sides.find((s) => s.teamId !== teamId);
      const dir = path.join(outDir, m.map);
      fs.mkdirSync(dir, { recursive: true });
      const file = `${m.createdAt.replace(/[:.]/g, '-')}_${m.kind}_vs-${slug(opp?.teamName)}_${me?.side}_${m.id}.repl26a`;
      try { fs.writeFileSync(path.join(dir, file), await fetchBundle(m.id)); }
      catch (e) { console.error(e.message); count[m.map]--; return; }
      index.push({ matchId: m.id, groupId: g.id, map: m.map, kind: m.kind, createdAt: m.createdAt, patch: m.patchId?.split(':')[0], side: me?.side,
        opponent: opp?.teamName, opponentId: opp?.teamId, result: me?.result, score: me?.score, oppScore: opp?.score, myDraft: me?.draft, oppDraft: opp?.draft,
        rounds: m.rounds, endReason: m.endReason, version: me?.version, file: path.join(m.map, file) });
      have.add(m.id); added++;
    }));
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 1));
  }
  const last = page.groups[page.groups.length - 1];
  before = `${last.createdAt}_${last.id}`;
  if (!page.more) break;
}
fs.writeFileSync(indexPath, JSON.stringify(index, null, 1));
console.log(`team ${teamId}: scanned ${scanned} groups, +${added} replays, ${index.length} total`);
console.log('per map:', JSON.stringify(Object.fromEntries((wanted ? [...wanted] : Object.keys(count)).sort().map((m) => [m, count[m] || 0]))));
