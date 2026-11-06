#!/usr/bin/env node
// Per champion type, both sides: net worth (gold + 30/shard, Power emblem = 6 shards), shards owned,
// unspent gold and gems carried at fixed rounds. Uses one pass over our-side index rows.
//   node analysis/h2h_tools/items_at.mjs <gamesDir> [--rounds 150,300,500,800]
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay, ITEM_NAMES } from '../../tools/replay_dump.mjs';
const args = process.argv.slice(2);
const dir = args[0];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const R = opt('rounds', '150,300,500,800').split(',').map(Number);
const rows = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'));
const shards = (items) => Object.entries(items).reduce((s, [k, n]) => s + n * (k.includes('Emblem') ? (k.startsWith('Power') ? 6 : 5) : 1), 0);
const acc = {}; // side|type|round -> {n, worth, shards, gold, gems}
for (const r of rows) {
  const me = r.side === 'b' ? 1 : 0;
  const d = await dumpReplay(path.join(dir, r.file), { snapshots: 'round' });
  for (const s of d.snapshots) {
    if (!R.includes(s.round)) continue;
    for (const c of s.champions) {
      const k = `${c.team === me ? 'us' : 'them'}|${c.type}|${s.round}`;
      const a = (acc[k] ??= { n: 0, worth: 0, shards: 0, gold: 0, gems: 0 });
      const sh = shards(c.items);
      a.n++; a.shards += sh; a.gold += c.gold; a.worth += c.gold + 30 * sh; a.gems += c.gems;
    }
  }
}
const types = [...new Set(Object.keys(acc).map((k) => k.split('|')[1]))];
for (const rd of R) {
  console.log(`round ${rd}   type: us(worth shards gold gems) | them(...)`);
  for (const t of types) {
    const f = (side) => { const a = acc[`${side}|${t}|${rd}`]; return a ? `${String(Math.round(a.worth / a.n)).padStart(5)} ${String((a.shards / a.n).toFixed(1)).padStart(5)} ${String(Math.round(a.gold / a.n)).padStart(4)} ${String(Math.round(a.gems / a.n)).padStart(3)} n${a.n}` : '   -'; };
    console.log(`  ${t.padEnd(10)} ${f('us')} | ${f('them')}`);
  }
}
