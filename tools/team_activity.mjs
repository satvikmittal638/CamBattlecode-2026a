#!/usr/bin/env node
// Page through a team's match groups and summarise what they play: kind (ranked / challenge /
// scrimmage...), who requested, opponents, their submission versions, results, per hour.
//   node tools/team_activity.mjs <teamId> [--hours 24] [--out file.json]
import fs from 'node:fs';
import { api } from './bclib.mjs';
const args = process.argv.slice(2);
const team = args[0];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const hours = +opt('hours', 24);
const since = Date.now() - hours * 3600e3;
const groups = [];
let before = null;
for (let page = 0; page < 200; page++) {
  const r = await api('GET', `/match-groups?scope=all&team=${team}` + (before ? `&before=${encodeURIComponent(before)}` : ''));
  if (!r.groups?.length) break;
  groups.push(...r.groups);
  const last = r.groups[r.groups.length - 1];
  if (Date.parse(last.createdAt) < since) break;
  before = r.nextCursor || `${last.createdAt}_${last.id}`;
  if (!r.nextCursor && r.groups.length < 10) break;
}
const recent = groups.filter((g) => Date.parse(g.createdAt) >= since);
if (opt('out')) fs.writeFileSync(opt('out'), JSON.stringify(recent, null, 1));
const byKind = {}, byOpp = {}, byHour = {};
for (const g of recent) {
  const me = g.sides.find((s) => s.teamId === team), op = g.sides.find((s) => s.teamId !== team);
  const k = `${g.kind}${g.requestedBy ? ':' + (g.requestedBy === team ? 'byThem' : 'byOther') : ''}`;
  const o = (byKind[k] ??= { n: 0, w: 0, l: 0 }); o.n++; o.w += me?.wins || 0; o.l += op?.wins || 0;
  const b = (byOpp[op?.teamName] ??= { n: 0, kinds: {} }); b.n++; b.kinds[g.kind] = (b.kinds[g.kind] || 0) + 1;
  const h = g.createdAt.slice(0, 13); byHour[h] = (byHour[h] || 0) + 1;
}
console.log(`${recent.length} groups in the last ${hours}h (fetched ${groups.length})`);
console.log('by kind:', JSON.stringify(byKind));
console.log('by hour:', JSON.stringify(byHour));
console.log('top opponents:', JSON.stringify(Object.entries(byOpp).sort((a, b) => b[1].n - a[1].n).slice(0, 15)));
console.log('sample group keys:', Object.keys(recent[0] || {}).join(','), '\nside keys:', Object.keys(recent[0]?.sides?.[0] || {}).join(','));
