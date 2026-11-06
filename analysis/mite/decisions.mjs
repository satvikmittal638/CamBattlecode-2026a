// Decision-rule mining: recall triggers (hp vs gold), tribute-vs-continue after captures, low-hp behaviour.
import { loadRows, loadMatch, cheb, mean, pct, inc, hist, top } from './lib.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const rows = loadRows(args[0], { recent: +opt('recent', 60), side: opt('side'), kind: opt('kind', 'all'), skip: +opt('skip', 0), opponent: opt('opponent') });
const R = { healthyRecall: { gold: [], gems: [], afterSubmit: 0, n: 0, dAltar: [] }, lowRecall: { hp: [], dE: [], n: 0 }, noRecallGold: [], afterCap: {}, lowHp: { n: 0, recallSoon: 0, died: 0, fought: 0 }, recallGoldByType: {}, submitAfter: [], richNoRecall: {} };
for (const row of rows) {
  let M; try { M = await loadMatch(row); } catch { continue; }
  if (M.me == null || !M.map) continue;
  const ev = M.d.events;
  for (const id of M.myIds) {
    const t = M.typeOf[id];
    const myEv = ev.filter((e) => e.actor?.kind === 1 && e.actor.index === id);
    const recalls = myEv.filter((e) => e.kind === 'Recall');
    for (const e of recalls) {
      const c = M.champAt(e.round, id); if (!c?.pos) continue;
      const hp = c.hp / c.maxHp;
      const en = (M.snapAt(e.round)?.champions || []).filter((x) => x.team !== M.me && x.alive && x.pos);
      const dE = en.length ? Math.min(...en.map((x) => cheb(x.pos, c.pos))) : 99;
      if (hp >= 0.55) {
        R.healthyRecall.n++; R.healthyRecall.gold.push(c.gold); R.healthyRecall.gems.push(c.gems);
        (R.recallGoldByType[t] ??= []).push(c.gold);
        if (myEv.some((x) => x.kind === 'Gems submitted' && x.round >= e.round - 1 && x.round <= e.round)) R.healthyRecall.afterSubmit++;
        R.healthyRecall.dAltar.push(Math.min(...M.map.altars.map((a) => cheb(a, c.pos))));
      } else { R.lowRecall.n++; R.lowRecall.hp.push(hp); R.lowRecall.dE.push(dE); }
    }
    // rounds with gold >= 150, alive, away from spawn, not recalling within next 10 rounds -> what gems did they carry
    for (let r = 20; r < M.meta.finalRound; r += 10) {
      const c = M.champAt(r, id); if (!c?.alive || !c.pos || cheb(c.pos, M.spawn) < 5) continue;
      if (c.gold >= 150 && !recalls.some((e) => e.round >= r && e.round <= r + 10)) { R.noRecallGold.push(c.gold); inc(R.richNoRecall, c.gems > 0 ? 'carrying' : 'empty'); }
    }
    // after-capture decisions: find gem increases
    for (let r = 2; r < M.meta.finalRound; r++) {
      const a = M.champAt(r - 1, id), b = M.champAt(r, id);
      if (!a?.alive || !b?.alive || !b.pos || b.gems <= a.gems) continue;
      // next event among: submit, another gem gain, death, recall
      let nxt = 'none';
      for (let k = r + 1; k < Math.min(M.meta.finalRound, r + 120); k++) {
        const c = M.champAt(k, id);
        if (!c?.alive) { nxt = 'died'; break; }
        if (myEv.some((e) => e.kind === 'Submit gems' && e.round === k)) { nxt = 'submit'; break; }
        if (myEv.some((e) => e.kind === 'Recall' && e.round === k)) { nxt = 'recall'; break; }
        const p = M.champAt(k - 1, id); if (p && c.gems > p.gems) { nxt = 'more'; break; }
      }
      const dAlt = Math.min(...M.map.altars.map((x) => cheb(x, b.pos)));
      const key = `${b.gems >= 60 ? '60+' : b.gems >= 40 ? '40-59' : b.gems >= 30 ? '30-39' : '<30'}`;
      (R.afterCap[key] ??= {}); inc(R.afterCap[key], nxt);
      (R.afterCap['dAlt' + (dAlt <= 8 ? '<=8' : dAlt <= 16 ? '9-16' : '>16')] ??= {}); inc(R.afterCap['dAlt' + (dAlt <= 8 ? '<=8' : dAlt <= 16 ? '9-16' : '>16')], nxt);
    }
    // low hp episodes: first round hp < 0.4 (alive, away from spawn) -> what next within 12 rounds
    let inLow = false;
    for (let r = 2; r < M.meta.finalRound; r++) {
      const c = M.champAt(r, id); if (!c?.alive || !c.pos) { inLow = false; continue; }
      const hp = c.hp / c.maxHp;
      if (hp < 0.4 && !inLow && cheb(c.pos, M.spawn) > 4) {
        inLow = true; R.lowHp.n++;
        const win = myEv.filter((e) => e.round >= r && e.round <= r + 12);
        if (win.some((e) => e.kind === 'Recall')) R.lowHp.recallSoon++;
        if (win.some((e) => e.kind === 'Attack' && e.target?.kind === 'champion')) R.lowHp.fought++;
        for (let k = r; k <= r + 12; k++) { const x = M.champAt(k, id); if (x && !x.alive) { R.lowHp.died++; break; } }
      }
      if (hp > 0.6) inLow = false;
    }
  }
}
console.log('healthy recalls (hp>=.55)', R.healthyRecall.n, 'afterSubmit', R.healthyRecall.afterSubmit, 'gold', JSON.stringify(pct(R.healthyRecall.gold, [5, 10, 25, 50, 75, 90])), 'goldHist', JSON.stringify(hist(R.healthyRecall.gold, 30)), 'gems', JSON.stringify(pct(R.healthyRecall.gems)), 'dAltar', JSON.stringify(pct(R.healthyRecall.dAltar)));
for (const [t, g] of Object.entries(R.recallGoldByType)) console.log('   ', t, JSON.stringify(pct(g, [5, 10, 25, 50])));
console.log('low recalls', R.lowRecall.n, 'hp', JSON.stringify(pct(R.lowRecall.hp)), 'dEnemy', JSON.stringify(pct(R.lowRecall.dE)));
console.log('rich (>=150g) but no recall within 10 rounds: n', R.noRecallGold.length, JSON.stringify(pct(R.noRecallGold)), JSON.stringify(R.richNoRecall));
console.log('after gem gain -> next:'); for (const [k, v] of Object.entries(R.afterCap)) console.log('   ', k, JSON.stringify(v));
console.log('low-hp episodes', JSON.stringify(R.lowHp));
