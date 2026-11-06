#!/usr/bin/env node
// Endgame trace: every --step rounds from --from, both teams' tributed gems and our champions'
// carried gems (type:gems, * = submitting... dead = x).  node tools/endgame_trace.mjs <replay> <side a|b> [--from 1500] [--step 10]
import { dumpReplay, CHAMPION_TYPES } from './replay_dump.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const us = args[1] === 'a' ? 0 : 1, from = +opt('from', 1500), step = +opt('step', 10);
let last = -1;
await dumpReplay(args[0], { snapshots: 'none', onStep(st) {
  if (st.round === last || st.round < from || (st.round - from) % step) return; last = st.round;
  const mine = st.champions.filter((c) => c.team === us).map((c) => `${CHAMPION_TYPES[c.type].slice(0, 4)}:${c.alive ? c.gems : 'x'}@${c.position?.x ?? c.position?.[0]},${c.position?.y ?? c.position?.[1]}`);
  console.log(`r${st.round} us ${st.submittedGems[us]} opp ${st.submittedGems[1 - us]} | ${mine.join(' ')}`);
} });
