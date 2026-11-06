// Download Intercontinental Fish replays listed by Codex's census (patch 1.0.3), newest first; resumable.
//   node download.mjs [--limit N] [--jobs 4]
// Writes replays/<map>/<matchId>.repl26a and index.json [{matchId, map, fishSide, fishResult, createdAt, kind, rounds, file}].
import fs from 'node:fs';
import path from 'node:path';
import { fetchBundle } from '../../tools/bclib.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const HERE = import.meta.dirname;
const census = JSON.parse(fs.readFileSync(path.join(HERE, '../fish_counter_allmaps_2026-10-25/matches.json'), 'utf8'));
const rows = (Array.isArray(census) ? census : census.matches).filter((m) => m.opponent === 'Intercontinental Fish' && m.patchId?.startsWith('1.0.3'))
  .sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, +opt('limit', 1e9));
const idxFile = path.join(HERE, 'index.json');
const index = fs.existsSync(idxFile) ? JSON.parse(fs.readFileSync(idxFile, 'utf8')) : [];
const have = new Set(index.map((r) => r.matchId));
let next = 0, ok = 0, fail = 0;
const save = () => fs.writeFileSync(idxFile, JSON.stringify(index));
await Promise.all(Array.from({ length: +opt('jobs', 4) }, async () => {
  for (;;) {
    const m = rows[next++]; if (!m) return;
    if (have.has(m.matchId)) continue;
    const file = path.join('replays', m.map, m.matchId + '.repl26a');
    try {
      if (!fs.existsSync(path.join(HERE, file))) {
        const bytes = await fetchBundle(m.matchId);
        fs.mkdirSync(path.join(HERE, 'replays', m.map), { recursive: true });
        fs.writeFileSync(path.join(HERE, file), Buffer.from(bytes));
      }
      index.push({ matchId: m.matchId, map: m.map, fishSide: m.side === 'a' ? 'b' : 'a', fishResult: m.result === 'win' ? 'loss' : 'win', opponent: m.sourceTeam, createdAt: m.createdAt, kind: m.kind, rounds: m.rounds, file });
      have.add(m.matchId); ok++;
      if (ok % 100 === 0) { save(); console.log(new Date().toISOString().slice(11, 19), `${ok} downloaded, ${fail} failed, ${next}/${rows.length}`); }
    } catch (e) { fail++; if (fail < 20) console.error('fail', m.matchId, e.message); }
  }
}));
save();
console.log(`done: ${ok} downloaded, ${fail} failed, index ${index.length}`);
