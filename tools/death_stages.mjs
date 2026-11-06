#!/usr/bin/env node
// For local runs made with a PHASE2_LOG=2 build: the stage logged on each of the victim's last 3
// turns before each of OUR deaths (side a). Usage: node tools/death_stages.mjs <dir with run subdirs>
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { dumpReplay, CHAMPION_TYPES } from './replay_dump.mjs';
const root = process.argv[2]; const tally = {}; const last1 = {}; let n = 0;
for (const d of fs.readdirSync(root)) {
  const dir = path.join(root, d); if (!fs.statSync(dir).isDirectory()) continue;
  const rep = fs.readdirSync(dir).find((f) => f.endsWith('.repl26a')); if (!rep) continue;
  const out = path.join(dir, 'bundle'); fs.mkdirSync(out, { recursive: true });
  execFileSync('unzip', ['-o', '-q', path.join(dir, rep), '-d', out]);
  const log = fs.readFileSync(path.join(out, 'team-a.stdout'), 'latin1');
  const st = new Map(); for (const m of log.matchAll(/decision (\d+) (\d+) (\S+)/g)) st.set(m[1] + '|' + m[2], m[3]);
  await dumpReplay(path.join(dir, rep), { snapshots: 'none', onStep(s, ev, prev) { if (!prev) return;
    for (const c of s.champions) { if (c.team !== 0) continue; const b = prev.find((x) => x.entity.index === c.entity.index); if (!b || !(b.alive && !c.alive)) continue;
      n++; const seq = [3, 2, 1].map((k) => st.get((s.round - k) + '|' + c.type) || st.get((s.round - k + 1) + '|' + c.type) || '?');
      for (const x of new Set(seq)) tally[x] = (tally[x] || 0) + 1; last1[seq[2]] = (last1[seq[2]] || 0) + 1; } } });
}
console.log('our deaths', n);
console.log('stage in any of last 3 turns:', Object.entries(tally).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' | '));
console.log('stage on last turn:          ', Object.entries(last1).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' | '));
