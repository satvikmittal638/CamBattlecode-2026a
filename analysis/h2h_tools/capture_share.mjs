#!/usr/bin/env node
// Who receives capture rewards: gold/gems gained per champion type at Capture steps, split us/them,
// plus the number of champions sharing each capture.
//   node analysis/h2h_tools/capture_share.mjs <gamesDir> [--limit N]
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay, CHAMPION_TYPES } from '../../tools/replay_dump.mjs';
const args = process.argv.slice(2);
const dir = args[0];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const limit = +opt('limit', 1e9);
const rows = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8')).slice(0, limit);
const acc = {}; const share = { us: {}, them: {} }; const games = { us: 0, them: 0 };
for (const r of rows) {
  const me = r.side === 'b' ? 1 : 0;
  await dumpReplay(path.join(dir, r.file), { snapshots: 'none', onStep: (st, ev, prev) => {
    if (!ev || ev.kind !== 'Capture' || !prev) return;
    let n = 0; const side = ev.team === me ? 'us' : 'them';
    for (const c of st.champions) {
      const p = prev.find((q) => q.entity.index === c.entity.index);
      if (!p) continue;
      const dg = c.gold - p.gold, dm = c.gems - p.gems;
      if (dg <= 0 && dm <= 0) continue;
      n++;
      const k = `${c.team === me ? 'us' : 'them'}|${CHAMPION_TYPES[c.type]}`;
      const a = (acc[k] ??= { gold: 0, gems: 0, caps: 0 }); a.gold += dg; a.gems += dm; a.caps++;
    }
    share[side][n] = (share[side][n] || 0) + 1;
  } });
  games.us++; games.them++;
}
const types = [...new Set(Object.keys(acc).map((k) => k.split('|')[1]))];
console.log(`games ${rows.length}. per game: captures received, gold, gems   us | them`);
for (const t of types) {
  const f = (s) => { const a = acc[`${s}|${t}`]; return a ? `${(a.caps / rows.length).toFixed(1).padStart(5)} ${String(Math.round(a.gold / rows.length)).padStart(5)} ${String(Math.round(a.gems / rows.length)).padStart(4)}` : '    -'; };
  console.log(`  ${t.padEnd(10)} ${f('us')} | ${f('them')}`);
}
console.log('champions sharing a capture:', JSON.stringify(share));
