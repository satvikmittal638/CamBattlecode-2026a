// Cassi-Issac distance distribution
import { dumpReplay } from '../../tools/replay_dump.mjs';
import { listRows } from './lib.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const rows = listRows(args[0], { recent: +opt('recent', 15), side: opt('side'), teamName: opt('team', 'Agentic Loop Builders') });
const h = {}; let n = 0;
for (const r of rows) {
  const d = await dumpReplay(r.path, { snapshots: 'round' });
  for (const s of d.snapshots) {
    const c = s.champions.find((x) => x.team === r.me && x.type === 'Cassi'), i = s.champions.find((x) => x.team === r.me && x.type === 'Issac');
    if (!c?.alive || !i?.alive || !c.pos || !i.pos) continue;
    const dd = Math.max(Math.abs(c.pos[0] - i.pos[0]), Math.abs(c.pos[1] - i.pos[1]));
    const b = dd <= 1 ? '0-1' : dd <= 3 ? '2-3' : dd <= 6 ? '4-6' : dd <= 12 ? '7-12' : '13+';
    h[b] = (h[b] || 0) + 1; n++;
  }
}
console.log(Object.entries(h).map(([k, v]) => `${k}:${(v / n).toFixed(2)}`).join(' '));
