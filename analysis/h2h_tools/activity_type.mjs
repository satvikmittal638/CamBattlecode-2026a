#!/usr/bin/env node
// Per champion type, us vs them: share of rounds dead / idle (alive, no action) / moving only /
// hitting camps / fighting champions / channeling (recall, tribute), and rounds standing on own spawn.
//   node analysis/h2h_tools/activity_type.mjs <gamesDir> [--upto 400]
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay, CHAMPION_TYPES } from '../../tools/replay_dump.mjs';
const args = process.argv.slice(2);
const dir = args[0];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const upto = +opt('upto', 400);
const rows = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'));
const acc = {};
for (const r of rows) {
  const me = r.side === 'b' ? 1 : 0;
  let spawn = null; const flags = new Map(); let cur = -1; let champs = null;
  const close = () => {
    if (!champs) return;
    for (const c of champs) {
      const k = `${c.team === me ? 'us' : 'them'}|${CHAMPION_TYPES[c.type]}`;
      const a = (acc[k] ??= { n: 0, dead: 0, idle: 0, move: 0, camp: 0, champ: 0, chan: 0, home: 0 });
      a.n++;
      const f = flags.get(c.entity.index) || {};
      if (!c.alive) a.dead++;
      else if (f.champ) a.champ++;
      else if (f.camp) a.camp++;
      else if (f.chan) a.chan++;
      else if (f.move) a.move++;
      else a.idle++;
      if (c.alive && c.position && spawn) { const s = spawn[c.team]; if (c.position.x >= s.minX - 1 && c.position.x <= s.maxX + 1 && c.position.y >= s.minY - 1 && c.position.y <= s.maxY + 1) a.home++; }
    }
    flags.clear();
  };
  await dumpReplay(path.join(dir, r.file), { snapshots: 'none', mapInfo: true,
    onStart: (s) => { spawn = s.mapInfo.spawn; },
    onStep: (st, ev) => {
      if (st.round > upto) return;
      if (st.round !== cur) { close(); cur = st.round; champs = st.champions; }
      else champs = st.champions;
      if (!ev || !ev.actor || ev.actor.kind !== 1) return;
      const f = flags.get(ev.actor.index) || {}; flags.set(ev.actor.index, f);
      if (ev.kind === 'Move') f.move = 1;
      else if (ev.kind === 'Attack' || ev.kind === 'Cast ability') { if (ev.target?.kind === 'champion') f.champ = 1; else if (ev.target?.kind === 'camp') f.camp = 1; }
      else if (ev.kind === 'Recall' || ev.kind === 'Submit gems') f.chan = 1;
    } });
}
const types = [...new Set(Object.keys(acc).map((k) => k.split('|')[1]))];
const P = (a, k) => String(Math.round(100 * a[k] / a.n)).padStart(3);
console.log(`up to round ${upto}. % of rounds: dead idle move camp champ chan | home   (us | them)`);
for (const t of types) {
  const f = (s) => { const a = acc[`${s}|${t}`]; return a ? ['dead', 'idle', 'move', 'camp', 'champ', 'chan', 'home'].map((k) => P(a, k)).join(' ') : '   -'; };
  console.log(`  ${t.padEnd(10)} ${f('us')} | ${f('them')}`);
}
