// After each capture: does the champ tribute next (T) or capture again first (C)? by carried gems.
import fs from 'node:fs';
import { listRows } from './lib.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const rows = listRows(args[0], { recent: +opt('recent', 30), side: opt('side'), teamName: opt('team', 'Agentic Loop Builders') });
const inc = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };
const byG = {}, byMap = {};
for (const r of rows) {
  const cf = `analysis/shink/cache/${r.file.replace('.repl26a', '')}_${r.me}.json`;
  if (!fs.existsSync(cf)) continue;
  const m = JSON.parse(fs.readFileSync(cf, 'utf8'));
  for (const c of m.captures) {
    const nextT = m.tributes.find((t) => t.champ === c.champ && t.round >= c.round);
    const nextC = m.captures.find((x) => x.champ === c.champ && x.round > c.round);
    const nextR = m.recalls.find((x) => x.champ === c.champ && x.round >= c.round - 5);
    const death = m.deaths.find((x) => x.champ === c.champ && x.round > c.round);
    let what = 'T';
    const tr = nextT ? nextT.round : 1e9, cr = nextC ? nextC.round : 1e9, dr = death ? death.round : 1e9;
    if (cr < tr && cr < dr) what = 'C'; else if (dr < tr) what = 'D'; else if (tr === 1e9) what = 'end';
    const gb = c.carried < 25 ? '<25' : c.carried < 50 ? '25-49' : c.carried < 75 ? '50-74' : c.carried < 100 ? '75-99' : '100+';
    const o = (byG[gb] ??= {}); inc(o, what);
    const o2 = (byMap[r.map] ??= {}); inc(o2, what);
  }
}
console.log('next after capture by carried gems', JSON.stringify(byG));
console.log('by map', JSON.stringify(byMap));
