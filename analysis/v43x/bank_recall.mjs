// Banking and recall habits of the index's side: bag size at tribute start (distribution), tributes per game,
// recall starts (HP fraction, gold carried, gems carried), and what preceded a recall (capture/tribute/damage).
//   node analysis/v43x/bank_recall.mjs <index.json>
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay, CHAMPION_TYPES } from '../../tools/replay_dump.mjs';
const idxFile = process.argv[2]; const idx = JSON.parse(fs.readFileSync(idxFile, 'utf8'));
const bags = [], rec = []; let games = 0, recCancel = 0;
for (const g of idx) {
  const us = g.side === 'a' ? 0 : 1; games++; const lastEv = new Map();
  await dumpReplay(path.join(path.dirname(idxFile), g.file), { snapshots: 'none', onStep(st, ev, prev) {
    if (!ev || ev.actor?.kind !== 1 || ev.team !== us || !prev) return;
    const me = prev.find((c) => c.entity.index === ev.actor.index); if (!me) return;
    if (ev.kind === 'Submit gems') bags.push(me.gems);
    if (ev.kind === 'Recall') rec.push({ hp: me.health / me.maxHealth, gold: me.gold, gems: me.gems, after: lastEv.get(ev.actor.index) || '-', r: st.round, t: CHAMPION_TYPES[me.type] });
    if (ev.kind === 'Cancel channel') recCancel++;
    if (['Capture', 'Gems submitted', 'Attack', 'Shop'].includes(ev.kind)) lastEv.set(ev.actor.index, ev.kind === 'Attack' ? (ev.target?.kind || 'x') : ev.kind);
  } });
}
const q = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(p * (s.length - 1))]; };
console.log(`games ${games}; tributes/game ${(bags.length / games).toFixed(1)}; bag at tribute p10/p50/p90 ${q(bags, .1)}/${q(bags, .5)}/${q(bags, .9)}; bags<30 ${(100 * bags.filter((b) => b < 30).length / bags.length).toFixed(0)}%`);
console.log(`recalls/game ${(rec.length / games).toFixed(1)}; self-cancels/game ${(recCancel / games).toFixed(1)}`);
const hpB = { '<35%': (r) => r.hp < .35, '35-70%': (r) => r.hp >= .35 && r.hp < .7, '>=70%': (r) => r.hp >= .7 };
console.log('recall HP: ' + Object.entries(hpB).map(([k, f]) => `${k} ${(100 * rec.filter(f).length / rec.length).toFixed(0)}%`).join(', '));
console.log(`recall with gold>=150 ${(100 * rec.filter((r) => r.gold >= 150).length / rec.length).toFixed(0)}%, carrying gems ${(100 * rec.filter((r) => r.gems > 0).length / rec.length).toFixed(0)}%`);
const af = {}; for (const r of rec) af[r.after] = (af[r.after] || 0) + 1; console.log('last own action before recall: ' + Object.entries(af).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${(100 * v / rec.length).toFixed(0)}%`).join(', '));
