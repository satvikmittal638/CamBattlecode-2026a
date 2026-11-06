// List every Intercontinental Fish match on engine patch 1.0.3 (census + crawl of Fish's match groups); writes
// fish_matches.json [{matchId, map, fishSide, fishResult, opponent, createdAt, kind, rounds}]. Resumable via crawl_groups/.
import fs from 'node:fs';
import path from 'node:path';
import { api, sleep } from '../../tools/bclib.mjs';
const FISH = '1890540d-1ffc-4847-adbf-d0d08772f268';
const HERE = import.meta.dirname;
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const out = new Map();
const census = JSON.parse(fs.readFileSync(path.join(HERE, '../fish_counter_allmaps_2026-10-25/matches.json'), 'utf8'));
for (const m of (Array.isArray(census) ? census : census.matches).filter((m) => m.opponent === 'Intercontinental Fish' && m.patchId?.startsWith('1.0.3')))
  out.set(m.matchId, { matchId: m.matchId, map: m.map, fishSide: m.side === 'a' ? 'b' : 'a', fishResult: m.result === 'win' ? 'loss' : 'win', opponent: m.sourceTeam, createdAt: m.createdAt, kind: m.kind, rounds: m.rounds });
log(`census ${out.size}`);
const gdir = path.join(HERE, 'crawl_groups'); fs.mkdirSync(gdir, { recursive: true });
const groups = [];
let cursor, pages = 0;
for (;;) {
  const p = await api('GET', '/match-groups?' + new URLSearchParams({ scope: 'all', team: FISH, ...(cursor ? { before: cursor } : {}) }));
  pages++;
  for (const g of p.groups || []) if (g.status === 'finished') groups.push(g);
  if (pages % 25 === 0) log(`pages ${pages}, groups ${groups.length}, oldest ${p.groups?.at(-1)?.createdAt}`);
  if (!p.more) break;
  const next = p.next ?? (p.groups.at(-1).createdAt + '_' + p.groups.at(-1).id);
  if (next === cursor) break;
  cursor = next;
  // Stop once well past the patch boundary: sample one group's patch every 25 pages.
  if (pages % 25 === 0) {
    const g = p.groups.at(-1);
    const f = path.join(gdir, g.id + '.json');
    const d = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : await api('GET', '/match-groups/' + g.id);
    fs.writeFileSync(f, JSON.stringify(d));
    if (!(d.matches || []).some((m) => String(m.patchId || '').startsWith('1.0.3'))) { log('older patch reached at', g.createdAt); break; }
  }
}
log(`listed ${groups.length} groups in ${pages} pages; fetching details`);
let next = 0, done = 0;
await Promise.all(Array.from({ length: 5 }, async () => {
  for (;;) {
    const g = groups[next++]; if (!g) return;
    const f = path.join(gdir, g.id + '.json');
    let d;
    try { d = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : await api('GET', '/match-groups/' + g.id); } catch (e) { log('fail', g.id, e.message); continue; }
    fs.writeFileSync(f, JSON.stringify(d));
    for (const m of d.matches || []) {
      if (m.status !== 'finished' || !String(m.patchId || '').startsWith('1.0.3') || out.has(m.id)) continue;
      const fs_ = m.sides.find((s) => s.teamId === FISH), os_ = m.sides.find((s) => s.teamId !== FISH);
      if (fs_) out.set(m.id, { matchId: m.id, map: m.map, fishSide: fs_.side, fishResult: fs_.result, opponent: os_?.teamName, createdAt: m.createdAt, kind: d.group.kind, rounds: m.rounds });
    }
    if (++done % 500 === 0) log(`details ${done}/${groups.length}, matches ${out.size}`);
  }
}));
fs.writeFileSync(path.join(HERE, 'fish_matches.json'), JSON.stringify([...out.values()]));
log(`fish_matches.json: ${out.size} matches`);
