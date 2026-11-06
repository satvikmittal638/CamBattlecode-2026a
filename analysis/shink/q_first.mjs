// First capture -> first tribute behaviour.
import { listRows, getMetrics } from './lib.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const rows = listRows(args[0], { recent: +opt('recent', 30), side: opt('side'), teamName: opt('team', 'Agentic Loop Builders') });
const out = [];
for (const r of rows) {
  const m = await getMetrics(r);
  if (!m.captures.length || !m.tributes.length) continue;
  const c0 = m.captures[0], t0 = m.tributes[0];
  const capsBefore = m.captures.filter((c) => c.round < t0.round).length;
  out.push(`${r.map.padEnd(9)} cap0 r${c0.round} ${c0.champ} ${c0.label} carried${c0.carried} | trib0 r${t0.round} ${t0.champ} gems${t0.gems} | capsBeforeTrib0 ${capsBefore}`);
}
console.log(out.join('\n'));
