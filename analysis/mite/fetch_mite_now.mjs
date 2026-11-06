// Download Mite's most recent match groups (current bot version) and build an index.json usable
// by tools/profile_team.mjs and analysis/mite/*.mjs.   node analysis/mite/fetch_mite_now.mjs [nGroups]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib.mjs';
const MITE = 'ee83f5e5-bcad-4923-86b4-b79ea6083d2e';
const n = +(process.argv[2] || 12);
const out = path.join(ROOT, 'analysis/mite/mite_now');
fs.mkdirSync(path.join(out, 'replays'), { recursive: true });
const groups = JSON.parse(execFileSync('node', [path.join(ROOT, 'tools/bc.mjs'), 'team-groups', MITE, String(n + 5)], { encoding: 'utf8' }));
const idxPath = path.join(out, 'index.json');
const index = fs.existsSync(idxPath) ? JSON.parse(fs.readFileSync(idxPath, 'utf8')) : [];
const have = new Set(index.map((r) => r.groupId));
let done = 0;
for (const g of groups) {
  if (done >= n) break;
  if (g.status !== 'finished' || have.has(g.id) || g.sides.startsWith('Agentic')) continue;
  const tmp = path.join(out, 'tmp_' + g.id);
  try { execFileSync('node', [path.join(ROOT, 'tools/bc.mjs'), 'download-group', g.id, tmp], { encoding: 'utf8', stdio: 'pipe' }); } catch (e) { console.error('fail', g.id); continue; }
  const gj = JSON.parse(fs.readFileSync(path.join(tmp, `group_${g.id}.json`), 'utf8'));
  for (const m of gj.matches) {
    const me = m.sides.find((s) => s.teamName === 'Mite'); const op = m.sides.find((s) => s.teamName !== 'Mite');
    const src = path.join(tmp, `${m.map}_${m.id}.repl26a`);
    if (!me || !fs.existsSync(src)) continue;
    const file = `${g.createdAt.replace(/[:.]/g, '-')}_${g.kind}_${m.map}_${m.id}.repl26a`;
    fs.renameSync(src, path.join(out, 'replays', file));
    index.push({ matchId: m.id, groupId: g.id, kind: g.kind, createdAt: g.createdAt, map: m.map, side: me.side, opponent: op?.teamName, won: me.result === 'win', file });
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  done++;
  console.log('got', g.id, g.sides);
}
fs.writeFileSync(idxPath, JSON.stringify(index, null, 0));
console.log('index rows', index.length);
