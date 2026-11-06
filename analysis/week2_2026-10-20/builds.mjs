// Item builds per champion type: purchase order (first 12 shard buys) and final items.
//   node analysis/recent_2026-10-20/builds.mjs <teamDir>
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
const dir = process.argv[2];
const rows = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'));
const B = {};
for (const r of rows) {
  const me = r.side === 'b' ? 1 : 0;
  const d = await dumpReplay(path.join(dir, r.file), { snapshots: 'none' });
  const mine = d.meta.finalChampions.filter((c) => c.team === me);
  for (const c of mine) {
    const b = (B[c.type] ??= { games: 0, orders: {}, final: {} });
    b.games++;
    const order = [];
    for (const e of d.events) if (e.kind === 'Shop' && e.actor?.index === c.id) for (const [it, n] of Object.entries(e.items || {})) if (n > 0 && it.includes('Shard')) for (let i = 0; i < n; i++) order.push(it.replace(' Shard of ', ':').replace('Strength', 'Str').replace('Health', 'HP'));
    const key = order.slice(0, 12).join(' ') || '(none)';
    b.orders[key] = (b.orders[key] || 0) + 1;
    for (const [it, n] of Object.entries(c.items)) b.final[it] = (b.final[it] || 0) + n;
  }
}
const out = {};
for (const [t, b] of Object.entries(B)) out[t] = { games: b.games, topOrders: Object.entries(b.orders).sort((x, y) => y[1] - x[1]).slice(0, 2), avgFinalItems: Object.fromEntries(Object.entries(b.final).sort((x, y) => y[1] - x[1]).slice(0, 6).map(([k, v]) => [k, +(v / b.games).toFixed(1)])) };
console.log(JSON.stringify({ dir, builds: out }, null, 1));
