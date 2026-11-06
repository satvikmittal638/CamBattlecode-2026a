// Side-by-side style comparison: SHINK (reference) vs another replay set.
//   node analysis/shink/compare.mjs <refDir> <otherDir> [--ref-recent 30] [--recent 60] [--side a] [--team "Agentic Loop Builders"] [--ref-team "SHINK AI 6500"] [--map m] [--opponent o] [--ref-opponent o]
import { listRows, getMetrics, summarize } from './lib.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const refRows = listRows(args[0], { recent: +opt('ref-recent', 30), map: opt('map'), opponent: opt('ref-opponent'), teamName: opt('ref-team', 'SHINK AI 6500') });
const othRows = listRows(args[1], { recent: +opt('recent', 60), side: opt('side'), teamName: opt('team', 'Agentic Loop Builders'), map: opt('map'), opponent: opt('opponent') });
const load = async (rows) => { const out = []; for (const r of rows) { try { out.push(await getMetrics(r)); } catch (e) { console.error('skip', r.file, e.message); } } return out; };
const A = summarize(await load(refRows)), B = summarize(await load(othRows));
const keys = [...new Set([...Object.keys(A), ...Object.keys(B)])];
console.log('metric'.padEnd(40), 'ref'.padStart(9), 'other'.padStart(9), '  diff%');
for (const k of keys) {
  const a = A[k] ?? 0, b = B[k] ?? 0;
  const d = a ? ((b - a) / Math.abs(a)) * 100 : (b ? Infinity : 0);
  const flag = Math.abs(d) > 20 && (Math.abs(a) > 0.05 || Math.abs(b) > 0.05) ? ' <--' : '';
  console.log(k.padEnd(40), (+a.toFixed(3)).toString().padStart(9), (+b.toFixed(3)).toString().padStart(9), (isFinite(d) ? d.toFixed(0) : 'inf').padStart(6) + flag);
}
