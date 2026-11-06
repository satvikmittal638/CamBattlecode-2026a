// Item shards (emblem = 5, Power emblem = 6) and gold per team at checkpoints.
//   node items.mjs <index.json> <out.jsonl> [--sets ..] [--shard i/n]
import fs from 'node:fs';
import { dumpReplay } from '../../tools/replay_dump.mjs';
const args = process.argv.slice(2);
const [idxFile, outFile] = args;
const opt = (k, d) => (args.includes('--' + k) ? args[args.indexOf('--' + k) + 1] : d);
const sh = opt('shard', '0/1').split('/').map(Number);
const sets = opt('sets', '') ? new Set(opt('sets').split(',')) : null;
const CP = [50, 100, 150, 200, 300, 500];
const games = JSON.parse(fs.readFileSync(idxFile, 'utf8')).filter((g) => !sets || sets.has(g.set)).filter((_, i) => i % sh[1] === sh[0]);
const shards = (items) => items.reduce((a, n, i) => a + n * ((i % 2) ? ((Math.floor(i / 6) === 1) ? 6 : 5) : 1), 0);
for (const g of games) {
  const out = { us: {}, them: {} }; let last = -1;
  try {
    await dumpReplay(g.file, { snapshots: 'none', onStep(st) {
      if (st.round === last) return; last = st.round;
      if (!CP.includes(st.round)) return;
      for (const side of [0, 1]) {
        const cs = st.champions.filter((c) => (c.team === g.us) === (side === 0));
        out[side ? 'them' : 'us'][st.round] = { shards: cs.reduce((a, c) => a + shards(c.items || []), 0), gold: cs.reduce((a, c) => a + c.gold, 0) };
      }
    } });
  } catch (e) { console.error(g.file, e.message); continue; }
  fs.appendFileSync(outFile, JSON.stringify({ set: g.set, ...out }) + '\n');
}
