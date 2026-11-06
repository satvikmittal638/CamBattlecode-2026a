// First-300-round economy of the index side: captures, captured gems/gold, gold spent (shards owned at r150/r300),
// tributes and tributed gems, recalls, deaths, champion-turns on camps vs walking, by r150 and r300.
//   node analysis/v43x/early.mjs <index.json>
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay, ITEM_NAMES } from '../../tools/replay_dump.mjs';
const idxFile = process.argv[2]; const idx = JSON.parse(fs.readFileSync(idxFile, 'utf8'));
const A = { 150: {}, 300: {} }; let games = 0;
const add = (r, k, v) => { A[r][k] = (A[r][k] || 0) + v; };
for (const g of idx) {
  const us = g.side === 'a' ? 0 : 1; games++; let lr = -1;
  await dumpReplay(path.join(path.dirname(idxFile), g.file), { snapshots: 'none', onStep(st, ev, prev) {
    const R = st.round; if (R > 300) return;
    for (const r of [150, 300]) if (R <= r) {
      if (ev && ev.kind === 'Capture' && prev) for (const c of st.champions) { if (c.team !== us) continue; const b = prev.find((x) => x.entity.index === c.entity.index); if (b && (c.gems > b.gems || c.gold > b.gold)) { add(r, 'captures', 1); add(r, 'gems', c.gems - b.gems); add(r, 'gold', Math.max(0, c.gold - b.gold)); } }
      if (ev && ev.team === us && ev.actor?.kind === 1) { if (ev.kind === 'Gems submitted') add(r, 'tributes', 1); if (ev.kind === 'Recall') add(r, 'recalls', 1); if (ev.kind === 'Move') add(r, 'moves', 1); if ((ev.kind === 'Attack' || ev.kind === 'Cast ability') && ev.target?.kind === 'camp') add(r, 'campHits', 1); }
      if (prev) for (const c of st.champions) { if (c.team !== us) continue; const b = prev.find((x) => x.entity.index === c.entity.index); if (b && b.alive && !c.alive) add(r, 'deaths', 1); }
    }
    if (R !== lr) { lr = R; if (R === 150 || R === 300) { add(R, 'tributed', st.submittedGems[us]); add(R, 'shards', st.champions.filter((c) => c.team === us).reduce((s, c) => s + c.items.reduce((a, n, i) => a + n * (ITEM_NAMES[i].includes('Emblem') ? (ITEM_NAMES[i].startsWith('Power') ? 6 : 5) : 1), 0), 0)); } }
  } });
}
for (const r of [150, 300]) console.log(`by r${r}: ` + Object.entries(A[r]).map(([k, v]) => `${k} ${(v / games).toFixed(1)}`).join(', '));
