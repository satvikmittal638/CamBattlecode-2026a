// Ability casts on camps by camp type, per champion+ability; and casts on enemies vs hp.
import { dumpReplay } from '../../tools/replay_dump.mjs';
import { listRows } from './lib.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const rows = listRows(args[0], { recent: +opt('recent', 15), side: opt('side'), teamName: opt('team', 'Agentic Loop Builders') });
const o = {};
for (const r of rows) {
  const d = await dumpReplay(r.path, { snapshots: 'none' });
  for (const e of d.events) {
    if (e.kind !== 'Cast ability' || e.team !== r.me || e.actor?.kind !== 1) continue;
    const k = `${e.champ}:${e.abilityType}`;
    const t = e.target?.kind === 'camp' ? e.target.type : e.target?.kind === 'champion' ? (e.target.team === r.me ? 'self' : 'enemy') : 'tile';
    (o[k] ??= {})[t] = ((o[k] ??= {})[t] || 0) + 1;
  }
}
for (const [k, v] of Object.entries(o)) console.log(k.padEnd(22), Object.entries(v).sort((a, b) => b[1] - a[1]).map(([a, b]) => `${a}:${(b / rows.length).toFixed(1)}`).join(' '));
