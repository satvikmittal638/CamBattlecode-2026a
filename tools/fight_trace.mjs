#!/usr/bin/env node
// Round-by-round text trace of fights in one replay.
//   node tools/fight_trace.mjs <replay> --deaths <team 0|1> [--before 8] [--max 4]
//   node tools/fight_trace.mjs <replay> --rounds <from>-<to> [--around x,y,r]
// Per round: every champion within 8 tiles of the focus point (victim or --around) with
// position, hp/max, stun, gems; then the actions (moves, attacks, casts with ability type and
// target) taken in that round by those champions, in order.
import fs from 'node:fs';
import { dumpReplay, CHAMPION_TYPES, CAMP_TYPES } from './replay_dump.mjs';

const args = process.argv.slice(2);
const file = args[0];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
const deathsOf = opt('deaths') != null ? Number(opt('deaths')) : null;
const before = Number(opt('before', 8)), max = Number(opt('max', 4));

const rounds = new Map(); // round -> {state(champions at round start), events[]}
const deaths = [];
let cur = -1;
await dumpReplay(file, {
  snapshots: 'none',
  onStep(st, ev, prev) {
    if (st.round !== cur) { cur = st.round; rounds.set(cur, { champs: st.champions.map((c) => ({ id: c.entity.index, team: c.team, type: CHAMPION_TYPES[c.type], pos: c.position, hp: Math.round(c.health), max: Math.round(c.maxHealth), alive: c.alive, gems: c.gems, stun: c.stunned })), events: [] }); }
    const r = rounds.get(cur);
    if (ev && ev.actor?.kind === 1 && ['Move', 'Attack', 'Cast ability', 'Recall', 'Submit gems', 'Place ward', 'Shop', 'Set priority'].includes(ev.kind)) {
      if (ev.kind === 'Set priority' || ev.kind === 'Shop' || ev.kind === 'Place ward') return;
      const a = st.champions.find((c) => c.entity.index === ev.actor.index);
      let what = ev.kind === 'Move' ? `move ${ev.from.join(',')}->${ev.to.join(',')}` : ev.kind === 'Attack' ? 'attack' : ev.kind === 'Cast ability' ? `cast ${ev.abilityType}` : ev.kind;
      if (ev.target) what += ` -> ${ev.target.kind === 'champion' ? `${ev.target.type}(t${ev.target.team})` : ev.target.type}`;
      else if (ev.kind === 'Cast ability') what += ` @${ev.to.join(',')}`;
      r.events.push({ id: ev.actor.index, txt: `${CHAMPION_TYPES[a?.type]}(t${a?.team}) ${what}` });
    }
    if (prev && deathsOf != null) for (const c of st.champions) {
      const b = prev.find((x) => x.entity.index === c.entity.index);
      if (b && b.alive && !c.alive && c.team === deathsOf) deaths.push({ round: st.round, id: c.entity.index, type: CHAMPION_TYPES[c.type], pos: b.position });
    }
  },
});

function show(from, to, focus, title) {
  console.log(`\n=== ${title}`);
  for (let r = from; r <= to; r++) {
    const R = rounds.get(r); if (!R) continue;
    const near = R.champs.filter((c) => c.pos && (!focus || cheb(c.pos, focus) <= 8));
    const ids = new Set(near.map((c) => c.id));
    console.log(`r${r}: ` + near.map((c) => `${c.type}(t${c.team})@${c.pos.x},${c.pos.y} ${c.hp}/${c.max}${c.stun ? ' STUN' : ''}${c.gems ? ` g${c.gems}` : ''}`).join(' | '));
    for (const e of R.events) if (ids.has(e.id)) console.log(`      ${e.txt}`);
  }
}
if (deathsOf != null) {
  for (const d of deaths.slice(0, max)) show(d.round - before, d.round, d.pos, `death of ${d.type}(t${deathsOf}) at round ${d.round} @${d.pos?.x},${d.pos?.y}`);
  console.log(`\n(${deaths.length} deaths of team ${deathsOf} in total)`);
} else {
  const [a, b] = opt('rounds', '0-10').split('-').map(Number);
  const ar = opt('around') ? opt('around').split(',').map(Number) : null;
  show(a, b, ar ? { x: ar[0], y: ar[1] } : null, `rounds ${a}-${b}`);
}
