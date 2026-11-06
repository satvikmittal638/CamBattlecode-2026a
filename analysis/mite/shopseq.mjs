// Print per-champion shop sequences (round:item xN, gold after) for a few recent matches.
import { loadRows, loadMatch } from './lib.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const rows = loadRows(args[0], { recent: +opt('recent', 4), side: opt('side'), map: opt('map'), skip: +opt('skip', 0) });
const ab = (s) => s.replace('Shard of ', '').replace('Emblem of ', 'E:').replace('Strength', 'Str').replace('Health', 'Hp').replace('Focus', 'Foc');
for (const row of rows) {
  const M = await loadMatch(row);
  console.log('##', M.mapName, row.opponent, row.kind, 'won', M.won, 'rounds', M.meta.finalRound);
  for (const id of M.myIds) {
    const shops = M.d.events.filter((e) => e.kind === 'Shop' && e.actor?.index === id);
    const parts = []; let last = -1, cur = null;
    for (const e of shops) {
      if (e.round !== last) { if (cur) parts.push(cur); const c = M.champAt(e.round, id); cur = { r: e.round, g0: c?.gold, hp: c ? Math.round(100 * c.hp / c.maxHp) : -1, alive: c?.alive, items: {} }; last = e.round; }
      for (const [it, n] of Object.entries(e.items || {})) if (n > 0) cur.items[ab(it)] = (cur.items[ab(it)] || 0) + n;
      cur.g1 = e.goldAfter;
    }
    if (cur) parts.push(cur);
    console.log(' ', M.typeOf[id].padEnd(8), parts.map((p) => `r${p.r}${p.alive === false ? 'D' : ''}[${p.g0}->${p.g1}] ${Object.entries(p.items).map(([k, v]) => k + 'x' + v).join(',')}`).join(' | '));
  }
}
