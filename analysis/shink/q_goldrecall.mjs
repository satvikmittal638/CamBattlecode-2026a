// For captures where the champion's gold (before capture) + group gold >= 150: did it recall around the capture?
import { listRows, getMetrics } from './lib.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const rows = listRows(args[0], { recent: +opt('recent', 30), side: opt('side'), teamName: opt('team', 'Agentic Loop Builders') });
const GOLD = { Wolf: 90, Elk: 160, Gem: 0, Gold: 35, Monolith: 300 };
const inc = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };
const res = {}; const byCar = {}, byHp = {}, nextShop = {}; const byDist = {}; const byGold = {};
for (const r of rows) {
  const m = await getMetrics(r);
  for (const c of m.captures) {
    const gg = c.label.split('+').reduce((s, t) => { const mm = t.match(/(\d+)(\w+)/); return s + (mm ? +mm[1] * (GOLD[mm[2]] || 0) : 0); }, 0) / (c.share || 1);
    const before = c.goldPrev;
    const tot = before + gg;
    const rec = m.recalls.find((x) => x.champ === c.champ && x.round >= c.round - 6 && x.round <= c.round + 3);
    const k = tot >= 150 ? 'tot>=150' : 'tot<150';
    inc(res, k + (rec ? ':recall' : ':no'));
    if (tot >= 150) { inc(byCar, (c.carried >= 50 ? '50+' : c.carried >= 25 ? '25-49' : '<25') + (rec ? ':R' : ':n')); inc(byHp, Math.floor(c.hpFrac * 5) / 5 + (rec ? ':R' : ':n')); const nxt = m.shops.find((x) => x.champ === c.champ && x.round > c.round); inc(nextShop, rec ? 'R' : (nxt ? Math.min(100, Math.floor((nxt.round - c.round) / 20) * 20) : 'never'));  const db = Math.min(40, Math.floor((c.distSpawn ?? 0) / 10) * 10); inc(byDist, db + (rec ? ':R' : ':n')); const gb = Math.floor(tot / 50) * 50; inc(byGold, gb + (rec ? ':R' : ':n')); }
  }
}
console.log(JSON.stringify(res)); console.log('by dist to spawn', JSON.stringify(byDist)); console.log('by total gold', JSON.stringify(byGold));
console.log('by carried', JSON.stringify(byCar)); console.log('by hp', JSON.stringify(byHp)); console.log('no-recall: rounds to next shop', JSON.stringify(nextShop));
