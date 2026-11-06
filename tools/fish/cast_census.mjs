#!/usr/bin/env node
// Count ability casts by champion type, ability and target kind in replays (one side).
//   node tools/fish/cast_census.mjs <replay>... [--team 0|1]
import { dumpReplay } from '../replay_dump.mjs';
const args = process.argv.slice(2);
const files = args.filter((a) => a.endsWith('.repl26a'));
const ti = args.indexOf('--team'); const team = ti >= 0 ? +args[ti + 1] : null;
const c = {};
for (const f of files) {
  await dumpReplay(f, { snapshots: 'none', onStep(st, ev) {
    if (!ev || ev.kind !== 'Cast ability' || !ev.champ) return;
    if (team !== null && ev.team !== team) return;
    const k = `${ev.champ}:${ev.abilityType}->${ev.target?.kind ?? 'ground'}`; c[k] = (c[k] || 0) + 1;
  } });
}
for (const [k, v] of Object.entries(c).sort()) console.log(k.padEnd(36), v);
