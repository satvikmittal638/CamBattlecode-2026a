// Decision analysis at capture time: recall-capture rule (gold / hp) and tribute threshold (gems).
//   node analysis/whim/decisions.mjs whim [N]   |  node analysis/whim/decisions.mjs <dir> <side>
import fs from 'node:fs'; import path from 'node:path';
import { dumpReplay, loadIndex, cheb } from './lib.mjs';
const a = process.argv.slice(2);
let rows;
if (a[0] === 'whim') rows = loadIndex().slice(+(a[2] || 0), +(a[2] || 0) + +(a[1] || 60));
else { const files = []; const walk = (d) => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (f.endsWith('.repl26a')) files.push(p); } }; walk(a[0]); rows = files.map((p) => ({ path: p, side: a[1] || 'a' })); }
const recallByGold = {}, recallByHp = {}, nextByGems = {}, recallNoCap = [];
const inc = (o, k, v) => { (o[k] ??= { n: 0, y: 0 }); o[k].n++; if (v) o[k].y++; };
const extra = { recallWhileOnCamp: 0, recallTotal: 0, recallHpNoCap: [], recallSamples: [] };
for (const r of rows) {
  const d = await dumpReplay(r.path, { snapshots: 'round' });
  const me = r.side === 'b' ? 1 : 0;
  const ids = d.meta.finalChampions.filter((c) => c.team === me).map((c) => c.id);
  const byRound = new Map(); for (const s of d.snapshots) if (!byRound.has(s.round)) byRound.set(s.round, s);
  for (const id of ids) {
    const evs = d.events.filter((e) => e.actor?.kind === 1 && e.actor.index === id);
    const recRounds = evs.filter((e) => e.kind === 'Recall').map((e) => e.round);
    extra.recallTotal += recRounds.length;
    let prev = null;
    const caps = [];
    for (const s of d.snapshots) {
      const c = s.champions.find((x) => x.id === id); if (!c) continue;
      if (prev && c.alive && prev.alive && (c.gems > prev.gems || c.gold > prev.gold) && c.gold - prev.gold !== 50) {
        // gained via capture (kill gold is exactly 50 + gems)
        caps.push({ round: s.round, gems: c.gems, gold: c.gold, gain: c.gold - prev.gold, gainGems: c.gems - prev.gems, hp: c.hp, max: c.maxHp, pos: c.pos });
      }
      prev = c;
    }
    for (const cp of caps) {
      // recall-capture = a recall started within the 6 rounds before this capture
      const rc = recRounds.find((x) => x <= cp.round && x >= cp.round - 6);
      const goldB = Math.floor(cp.gold / 10) * 10;
      const bucket = cp.gold >= 150 ? '>=150' : cp.gold >= 120 ? '120-149' : cp.gold >= 90 ? '90-119' : '<90';
      inc(recallByGold, bucket, rc != null);
      const hpf = cp.hp / cp.max; inc(recallByHp, (Math.floor(hpf * 10) / 10).toFixed(1), rc != null);
      if (rc == null) {
        // next action
        const nx = evs.find((e) => e.round > cp.round && (e.kind === 'Submit gems' || e.kind === 'Recall' || ((e.kind === 'Attack' || e.kind === 'Cast ability') && e.target?.kind === 'camp')));
        const k = nx ? (nx.kind === 'Submit gems' ? 'tribute' : nx.kind === 'Recall' ? 'recall' : 'camp') : 'none';
        const gb = cp.gems >= 80 ? '80+' : String(Math.floor(cp.gems / 10) * 10);
        (nextByGems[gb] ??= {}); nextByGems[gb][k] = (nextByGems[gb][k] || 0) + 1;
      }
    }
    // recalls not tied to a capture
    for (const rr of recRounds) {
      const tied = caps.some((cp) => rr <= cp.round && rr >= cp.round - 6);
      if (!tied) { const s = byRound.get(rr); const c = s?.champions.find((x) => x.id === id); if (c) { extra.recallHpNoCap.push(+(c.hp / c.maxHp).toFixed(2)); if (extra.recallSamples.length < 40) extra.recallSamples.push(`${path.basename(r.path).slice(0,40)} r${rr} ${c.type} hp${c.hp}/${c.maxHp} g${c.gold} gem${c.gems}`); } }
    }
  }
}
const fmt = (o) => Object.fromEntries(Object.entries(o).sort().map(([k, v]) => [k, `${v.y}/${v.n} = ${(v.y / v.n).toFixed(2)}`]));
console.log('recall-capture rate by gold after capture', fmt(recallByGold));
console.log('recall-capture rate by hp frac at capture', fmt(recallByHp));
console.log('next action after (non-recall) capture by gems carried', nextByGems);
extra.recallHpNoCap.sort((x, y) => x - y);
console.log('recalls total', extra.recallTotal, 'not tied to capture', extra.recallHpNoCap.length, 'hp fracs', extra.recallHpNoCap.join(' '));
console.log(extra.recallSamples.join('\n'));
