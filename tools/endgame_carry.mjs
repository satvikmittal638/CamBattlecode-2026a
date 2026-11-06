#!/usr/bin/env node
// For each replay: final tributed score per team and gems carried per team at the last round,
// plus the round each team's tributed+carried first reached 1000.
//   node tools/endgame_carry.mjs <index.json> [--filter loss] [--minratio 0.6]
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay } from './replay_dump.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const idx = JSON.parse(fs.readFileSync(args[0], 'utf8'));
const dir = path.dirname(args[0]);
const minr = +opt('minratio', 0.6);
for (const x of idx.filter((x) => x.result !== 'win' && x.endReason === 'gems' && x.score / x.oppScore >= minr)) {
  const us = x.side === 'a' ? 0 : 1;
  let lastSt = null, reach = [null, null];
  await dumpReplay(path.join(dir, x.file), { snapshots: 'none', onStep(st) {
    lastSt = st;
    for (const t of [0, 1]) { if (reach[t] !== null) continue; const carried = st.champions.filter((c) => c.team === t && c.alive).reduce((s, c) => s + c.gems, 0); const trib = st.submittedGems?.[t] ?? 0; if (trib + carried >= 1000) reach[t] = st.round; }
  } });
  const carried = [0, 1].map((t) => lastSt.champions.filter((c) => c.team === t && c.alive).reduce((s, c) => s + c.gems, 0));
  console.log(`${x.label.padEnd(5)} ${x.map.padEnd(22)} ${x.side} us ${x.score}+${carried[us]} carried | opp ${x.oppScore}+${carried[1 - us]} | end ${x.rounds} | us reach1000@${reach[us]} opp@${reach[1 - us]}`);
}
