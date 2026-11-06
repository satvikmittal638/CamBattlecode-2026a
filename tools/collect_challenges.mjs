#!/usr/bin/env node
// Wait for challenge groups to finish, download their replays and index them from our side.
//   node tools/collect_challenges.mjs <challenges.txt> <outDir>
// challenges.txt: one group per line, label first, groupId last (as written by challenge_batch.mjs).
// Writes <outDir>/<map>/<label>_<matchId>.repl26a and <outDir>/index.json (rows usable by the
// analysis tools), then prints results per opponent and per map.
import fs from 'node:fs';
import path from 'node:path';
import { api, fetchBundle, sleep } from './bclib.mjs';

const US = '6b04505b-d16c-4196-b7c6-53a4688a32ca';
const [file, outDir] = process.argv.slice(2);
const lines = fs.readFileSync(file, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean);
const groups = lines.map((l) => { const parts = l.split(/\s+/); return { label: parts[0], groupId: parts[parts.length - 1] }; })
  .filter((g) => /^[0-9a-f-]{36}$/.test(g.groupId));
fs.mkdirSync(outDir, { recursive: true });
const indexPath = path.join(outDir, 'index.json');
const index = fs.existsSync(indexPath) ? JSON.parse(fs.readFileSync(indexPath, 'utf8')) : [];
const have = new Set(index.map((r) => r.matchId));

for (const g of groups) {
  let d;
  for (let i = 0; i < 360; i++) {
    d = await api('GET', `/match-groups/${g.groupId}`);
    if (['finished', 'error', 'cancelled'].includes(d.group.status)) break;
    await sleep(10000);
  }
  for (const m of d.matches) {
    if (m.status !== 'finished' || have.has(m.id)) continue;
    const me = m.sides.find((s) => s.teamId === US), opp = m.sides.find((s) => s.teamId !== US);
    const dir = path.join(outDir, m.map); fs.mkdirSync(dir, { recursive: true });
    const rel = path.join(m.map, `${g.label}_${m.id}.repl26a`);
    try { fs.writeFileSync(path.join(outDir, rel), await fetchBundle(m.id)); } catch (e) { console.error(e.message); continue; }
    index.push({ matchId: m.id, groupId: g.groupId, label: g.label, map: m.map, side: me?.side, opponent: opp?.teamName, result: me?.result, score: me?.score, oppScore: opp?.score,
      myDraft: me?.draft, oppDraft: opp?.draft, version: me?.version, rounds: m.rounds, endReason: m.endReason, kind: m.kind, createdAt: m.createdAt, file: rel });
    have.add(m.id);
  }
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 1));
}
const per = {}, perMap = {};
for (const r of index) {
  const o = (per[r.label] ??= { w: 0, n: 0, gd: 0 }); o.n++; o.w += r.result === 'win'; o.gd += (r.score || 0) - (r.oppScore || 0);
  const pm = (perMap[r.map] ??= []); pm.push(`${r.label}:${r.result === 'win' ? 'W' : 'L'}${r.side}`);
}
let W = 0, N = 0;
for (const [k, v] of Object.entries(per)) { W += v.w; N += v.n; console.log(`${k.padEnd(10)} ${v.w}/${v.n}  avg gem diff ${Math.round(v.gd / v.n)}`); }
console.log(`TOTAL ${W}/${N}`);
for (const [m, v] of Object.entries(perMap).sort()) console.log(`  ${m.padEnd(24)} ${v.join(' ')}`);
