#!/usr/bin/env node
// Capture pecking order: at each capture by the team, which of its champions near the group
// (within 3 tiles of the capturer) received the reward. Reports, for each pair of types both
// present, how often each won the capture.
//   node analysis/h2h_tools/capture_order.mjs <gamesDir> [--side us|them]
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay, CHAMPION_TYPES } from '../../tools/replay_dump.mjs';
const args = process.argv.slice(2); const dir = args[0];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const want = opt('side', 'us');
const rows = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8')).filter((r) => !/contest|boss/.test(r.map));
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
const win = {}, present = {}, pair = {};
for (const r of rows) {
  const me = r.side === 'b' ? 1 : 0; const T = want === 'us' ? me : 1 - me;
  await dumpReplay(path.join(dir, r.file), { snapshots: 'none', onStep(st, ev, prev) {
    if (!ev || ev.kind !== 'Capture' || ev.team !== T || !prev) return;
    const got = st.champions.filter((c) => { const b = prev.find((x) => x.entity.index === c.entity.index); return c.team === T && b && (c.gold > b.gold || c.gems > b.gems); });
    if (got.length !== 1) return;
    const cap = got[0];
    const near = st.champions.filter((c) => c.team === T && c.alive && c.position && cap.position && cheb(c.position, cap.position) <= 3);
    const tc = CHAMPION_TYPES[cap.type];
    for (const c of near) {
      const t = CHAMPION_TYPES[c.type]; present[t] = (present[t] || 0) + 1; if (c === cap) win[t] = (win[t] || 0) + 1;
      if (c !== cap) { const k = tc + '>' + t; pair[k] = (pair[k] || 0) + 1; }
    }
  } });
}
console.log('P(captures | present near the capture):');
for (const t of Object.keys(present).sort((a, b) => (win[b] || 0) / present[b] - (win[a] || 0) / present[a])) console.log(`  ${t.padEnd(9)} ${((win[t] || 0) / present[t]).toFixed(2)}  (present ${present[t]})`);
console.log('pairwise: A took it while B stood nearby (A>B count vs B>A count):');
const types = Object.keys(present);
for (let i = 0; i < types.length; i++) for (let j = i + 1; j < types.length; j++) {
  const a = types[i], b = types[j]; const ab = pair[a + '>' + b] || 0, ba = pair[b + '>' + a] || 0;
  if (ab + ba >= 30) console.log(`  ${a.padEnd(8)} vs ${b.padEnd(8)}: ${ab} : ${ba}  (${(ab / (ab + ba)).toFixed(2)})`);
}
