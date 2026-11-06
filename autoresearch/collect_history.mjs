// Collect our finished match groups (versions >= --minver) since --since, with per-match map and winner.
// Resumable: details cached in autoresearch/history/groups/<id>.json. Rate limited to ~25 requests/min.
//   node autoresearch/collect_history.mjs --since 2026-10-29T16:00:00Z --minver 121
import fs from 'node:fs';
import { api, maps } from '../tools/bclib.mjs';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i >= 0 ? process.argv[i + 1] : d; };
const TEAM = '6b04505b-d16c-4196-b7c6-53a4688a32ca';
const since = Date.parse(arg("since", "2026-10-29T16:00:00Z")), minver = +arg("minver", 121), maxver = +arg("maxver", 9999);
const DIR = 'autoresearch/history/groups'; fs.mkdirSync(DIR, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let last = 0; const paced = async (fn) => { const w = 2400 - (Date.now() - last); if (w > 0) await sleep(w); last = Date.now(); return fn(); };
const { byId } = await paced(() => maps());
const list = []; let next = null;
for (let page = 0; page < 400; page++) {
  const r = await paced(() => api('GET', `/match-groups?scope=all&team=${TEAM}` + (next ? `&before=${encodeURIComponent(next)}` : '')));
  if (!r.groups?.length) break;
  list.push(...r.groups);
  const tail = r.groups[r.groups.length - 1];
  if (Date.parse(tail.createdAt) < since) break;
  next = r.next || `${tail.createdAt}_${tail.id}`;
  if (!r.more && !r.next) break;
}
const wanted = list.filter((g) => Date.parse(g.createdAt) >= since && g.status === 'finished' && (g.sides.find((s) => s.teamId === TEAM)?.version ?? 0) >= minver && (g.sides.find((s) => s.teamId === TEAM)?.version ?? 0) <= maxver);
console.log(`listed ${list.length}, wanted ${wanted.length}`);
let done = 0;
for (const g of wanted) {
  const f = `${DIR}/${g.id}.json`;
  if (fs.existsSync(f)) { done++; continue; }
  try {
    const d = await paced(() => api('GET', `/match-groups/${g.id}`));
    const me = g.sides.find((s) => s.teamId === TEAM), op = g.sides.find((s) => s.teamId !== TEAM);
    const rec = { id: g.id, kind: g.kind, createdAt: g.createdAt, requestedBy: g.requestedBy ?? d.group?.requestedBy ?? null,
      version: me.version, side: me.side, opponent: op.teamName, opponentId: op.teamId, opponentVersion: op.version,
      matches: d.matches.map((m) => { const o = m.sides.find((s) => s.teamId === TEAM), x = m.sides.find((s) => s.teamId !== TEAM);
        return { id: m.id, map: m.map || byId[m.mapId] || m.mapId, status: m.status, result: o?.result ?? null, rounds: m.rounds,
          endReason: m.endReason, score: o?.score ?? null, oppScore: x?.score ?? null, botError: o?.botError ?? null, draft: o?.draft, oppDraft: x?.draft }; }) };
    fs.writeFileSync(f, JSON.stringify(rec));
    if (++done % 25 === 0) console.log(`${done}/${wanted.length}`);
  } catch (e) { console.log('ERR', g.id, e.message); }
}
console.log(`done ${done}/${wanted.length}`);
