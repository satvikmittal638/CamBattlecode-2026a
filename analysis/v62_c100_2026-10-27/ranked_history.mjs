// Our team's match-group history (read only): pages back to --since and writes history.json with one row per group
// (kind, time, our version, opponent, game wins). Used to compare v62's ranked results before / after patch 2.0.0.
//   node ranked_history.mjs [--since 2026-10-22T00:00:00Z]
import fs from 'node:fs';
import { get, sleep, US } from './http.mjs';
const dir = import.meta.dirname, args = process.argv.slice(2);
const since = Date.parse(args.includes('--since') ? args[args.indexOf('--since') + 1] : '2026-10-22T00:00:00Z');
const rows = [], seen = new Set();
let next = null;
for (let page = 0; page < 400; page++) {
  const r = await get(`/match-groups?scope=all&team=${US}` + (next ? `&before=${encodeURIComponent(next)}` : ''));
  if (!r.groups?.length) break;
  for (const g of r.groups) {
    if (seen.has(g.id)) continue; seen.add(g.id);
    const me = g.sides.find((s) => s.teamId === US), op = g.sides.find((s) => s.teamId !== US);
    rows.push({ id: g.id, kind: g.kind, status: g.status, createdAt: g.createdAt, requestedBy: g.requestedBy ?? null, version: me?.version ?? null,
      submissionId: me?.submissionId ?? null, side: me?.side, opponent: op?.teamName, opponentId: op?.teamId, opponentVersion: op?.version ?? null,
      wins: me?.wins ?? 0, losses: op?.wins ?? 0, games: g.gameCount });
  }
  const last = r.groups.at(-1);
  if (Date.parse(last.createdAt) < since || !r.more) break;
  next = r.next || `${last.createdAt}_${last.id}`;
  await sleep(3000);   // platform read budget: 30 requests / minute
}
fs.writeFileSync(dir + '/history.json', JSON.stringify(rows.filter((x) => Date.parse(x.createdAt) >= since), null, 1));
console.log(rows.length, 'groups; oldest', rows.at(-1)?.createdAt);
