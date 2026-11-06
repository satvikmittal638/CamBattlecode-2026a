// Pairwise closeness (fraction of alive rounds within 3 tiles) of a team's champions, per map.
//   node analysis/shink/q_pairs.mjs <dir> [--recent N] [--team name] [--side a|b]
import { dumpReplay } from '../../tools/replay_dump.mjs';
import { listRows } from './lib.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const rows = listRows(args[0], { recent: +opt('recent', 30), side: opt('side'), teamName: opt('team', 'Agentic Loop Builders'), map: opt('map') });
const byMap = {};
for (const r of rows) {
  const d = await dumpReplay(r.path, { snapshots: 'round' });
  const me = r.me; const o = (byMap[r.map] ??= {});
  for (const s of d.snapshots) {
    if (s.round < +opt('from', 0) || s.round > +opt('to', 9999)) continue;
    const cs = s.champions.filter((c) => c.team === me && c.alive && c.pos);
    for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) {
      const k = [cs[i].type, cs[j].type].sort().join('-');
      const p = (o[k] ??= [0, 0]); p[1]++;
      if (Math.max(Math.abs(cs[i].pos[0] - cs[j].pos[0]), Math.abs(cs[i].pos[1] - cs[j].pos[1])) <= 3) p[0]++;
    }
  }
}
for (const [m, o] of Object.entries(byMap)) console.log(m.padEnd(10), Object.entries(o).filter(([k]) => k !== 'Cassi-Issac').sort((a, b) => b[1][0] / b[1][1] - a[1][0] / a[1][1]).map(([k, [a, n]]) => `${k}:${(a / n).toFixed(2)}`).join(' '));
