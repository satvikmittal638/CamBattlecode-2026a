// Captures per champion per map (local folders lack map names; derive map from map size+champ count).
import { listRows, getMetrics } from './lib.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const rows = listRows(args[0], { recent: +opt('recent', 30), side: opt('side'), teamName: opt('team', 'Agentic Loop Builders') });
const SIZE = { '31x31': 'packs', '30x30': 'elkring', '41x41': 'collision', '80x80': 'expanse', '71x71': 'corners', '90x30': 'lanes', '40x40': 'interlock' };
const by = {};
for (const r of rows) {
  const m = await getMetrics(r);
  let map = SIZE[m.mapSize.join('x')] || (m.mapSize.join('x') === '50x50' ? (m.champs.length >= 6 ? 'monolith' : 'rows') : m.mapSize.join('x'));
  const o = (by[map] ??= { n: 0, c: {} }); o.n++;
  for (const c of m.captures) o.c[c.champ] = (o.c[c.champ] || 0) + 1;
}
for (const [k, o] of Object.entries(by).sort()) console.log(k.padEnd(10), o.n, Object.entries(o.c).map(([c, v]) => `${c}:${(v / o.n).toFixed(1)}`).join(' '));
