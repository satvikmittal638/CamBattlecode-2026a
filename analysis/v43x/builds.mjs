// Item builds per champion type for both teams in a platform run: emblem order (first 3 completed
// emblems/families), and average stats (str/focus/maxHp from the snapshot) at rounds 300/600/900.
//   node analysis/v43x/builds.mjs <index.json>
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay, CHAMPION_TYPES, ITEM_NAMES } from '../../tools/replay_dump.mjs';
const idxFile = process.argv[2];
const idx = JSON.parse(fs.readFileSync(idxFile, 'utf8'));
const fam = (name) => name.replace(/ (Shard|Emblem) of /, ' ').replace('Strength', 'Str').replace('Health', 'HP').replace('Focus', 'Foc');
const orders = { us: {}, them: {} }; const hpAt = { us: {}, them: {} };
for (const g of idx) {
  const us = g.side === 'a' ? 0 : 1; const seen = new Map(); let lastR = -1;
  await dumpReplay(path.join(path.dirname(idxFile), g.file), { snapshots: 'none', onStep(st, ev, prev) {
    if (ev && ev.kind === 'Shop' && ev.items) { const c = st.champions.find((x) => x.entity.index === ev.actor.index); if (!c) return; const s = seen.get(c.entity.index) || { team: c.team, type: CHAMPION_TYPES[c.type], fams: [] }; for (const [k, d] of Object.entries(ev.items)) if (d > 0 && /Shard|Emblem/.test(k)) { const f = fam(k); if (!s.fams.includes(f)) s.fams.push(f); } seen.set(c.entity.index, s); }
    if (st.round !== lastR) { lastR = st.round; if ([300, 600, 900].includes(st.round)) for (const c of st.champions) { const side = c.team === us ? 'us' : 'them'; const k = CHAMPION_TYPES[c.type] + '@' + st.round; const a = hpAt[side][k] = hpAt[side][k] || { n: 0, hp: 0, items: 0 }; a.n++; a.hp += c.maxHealth; a.items += c.items.reduce((s, n, i) => s + n * (ITEM_NAMES[i].includes('Emblem') ? 5 : 1), 0); } }
  } });
  for (const s of seen.values()) { const side = s.team === us ? 'us' : 'them'; const k = s.type + ': ' + s.fams.slice(0, Number(process.env.NF || 3)).join(' > '); orders[side][k] = (orders[side][k] || 0) + 1; }
}
for (const side of ['us', 'them']) { console.log(`== ${side} build orders (first 3 families bought)`); for (const [k, n] of Object.entries(orders[side]).sort((a, b) => b[1] - a[1]).slice(0, side === 'us' ? 12 : 30)) console.log(String(n).padStart(4), k); }
for (const side of ['us', 'them']) { console.log(`== ${side} maxHp / shards owned at rounds`); for (const [k, a] of Object.entries(hpAt[side]).sort()) if (a.n >= 8) console.log('  ', k.padEnd(18), 'maxHp', (a.hp / a.n).toFixed(0), 'shards', (a.items / a.n).toFixed(1), 'n', a.n); }
