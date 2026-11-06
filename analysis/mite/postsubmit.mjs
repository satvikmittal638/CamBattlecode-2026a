// What happens right after a tribute completes: recall or not, vs gold / hp.
import { loadRows, loadMatch, cheb, pct, inc } from './lib.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const rows = loadRows(args[0], { recent: +opt('recent', 60), side: opt('side'), kind: opt('kind', 'all') });
const tab = {}; const zeroGoldRecall = { hp: [], dSpawn: [] }; const recallGoldNeed = [];
for (const row of rows) {
  let M; try { M = await loadMatch(row); } catch { continue; }
  if (M.me == null || !M.map) continue;
  for (const id of M.myIds) {
    const myEv = M.d.events.filter((e) => e.actor?.kind === 1 && e.actor.index === id);
    for (const e of myEv.filter((x) => x.kind === 'Gems submitted')) {
      const c = M.champAt(e.round, id); if (!c?.pos) continue;
      const rec = myEv.some((x) => x.kind === 'Recall' && x.round >= e.round && x.round <= e.round + 1);
      const hp = c.hp / c.maxHp;
      const gk = c.gold >= 150 ? 'g150+' : c.gold >= 90 ? 'g90-149' : 'g<90';
      const hk = hp < 0.5 ? 'hp<50' : hp < 0.75 ? 'hp50-75' : hp < 0.9 ? 'hp75-90' : 'hp90+';
      const ds = cheb(c.pos, M.spawn) > 25 ? 'far' : 'near';
      inc(tab, `${gk} ${hk}`, 0); (tab[`${gk} ${hk}`] = tab[`${gk} ${hk}`] || 0);
      const k = `${gk} ${hk}`; (tab[k + ' n'] = (tab[k + ' n'] || 0) + 1); if (rec) tab[k + ' rec'] = (tab[k + ' rec'] || 0) + 1;
      if (rec && c.gold < 90) { zeroGoldRecall.hp.push(hp); zeroGoldRecall.dSpawn.push(cheb(c.pos, M.spawn)); }
    }
  }
}
const keys = [...new Set(Object.keys(tab).filter((k) => k.endsWith(' n')).map((k) => k.slice(0, -2)))].sort();
for (const k of keys) console.log(k.padEnd(18), 'n', tab[k + ' n'], 'recall', tab[k + ' rec'] || 0, ((tab[k + ' rec'] || 0) / tab[k + ' n']).toFixed(2));
console.log('low-gold recalls after submit: hp', JSON.stringify(pct(zeroGoldRecall.hp)), 'dSpawn', JSON.stringify(pct(zeroGoldRecall.dSpawn)));
