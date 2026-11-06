#!/usr/bin/env node
// Capture mix per team: rewards grouped by (gems,gold) of each capture event (summed over the
// team's capturers), with capturer count and mean x position.  node tools/capture_mix.mjs <replay> <side a|b>
import { dumpReplay } from './replay_dump.mjs';
const [file, side] = process.argv.slice(2); const us = side === 'a' ? 0 : 1;
const mix = [{}, {}];
await dumpReplay(file, { snapshots: 'none', onStep(st, ev, prev) {
  if (!prev || !ev || ev.kind !== 'Capture') return;
  let g = 0, d = 0, n = 0, xs = 0;
  for (const c of st.champions) { if (c.team !== ev.team) continue; const b = prev.find((y) => y.entity.index === c.entity.index); if (!b) continue; const dg = c.gems - b.gems, dd = c.gold - b.gold; if (dg > 0 || dd > 0) { g += Math.max(0, dg); d += Math.max(0, dd); n++; xs += c.position?.x ?? 0; } }
  if (!n) return; const k = `${g}g/${d}$`; const o = (mix[ev.team][k] ||= { n: 0, cap: 0, x: 0, first: st.round }); o.n++; o.cap += n; o.x += xs / n;
} });
for (const t of [us, 1 - us]) {
  const rows = Object.entries(mix[t]).sort((a, b) => b[1].n * parseInt(b[0]) - a[1].n * parseInt(a[0]));
  console.log(t === us ? 'US ' : 'OPP', rows.map(([k, o]) => `${k} x${o.n} (cap/ev ${(o.cap / o.n).toFixed(1)}, x̄ ${(o.x / o.n).toFixed(0)}, first r${o.first})`).join(' | '));
}
