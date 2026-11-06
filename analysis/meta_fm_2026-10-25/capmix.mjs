// Captures by r<=TO per side: count, gems, gold, gem-bearing share, mean gems per gem capture, and gold-only captures.
//   node capmix.mjs <index.json> <out.jsonl> [--sets ..] [--shard i/n] [--to 600]
import fs from 'node:fs';
import { dumpReplay } from '../../tools/replay_dump.mjs';
const args = process.argv.slice(2);
const [idxFile, outFile] = args;
const opt = (k, d) => (args.includes('--' + k) ? args[args.indexOf('--' + k) + 1] : d);
const sh = opt('shard', '0/1').split('/').map(Number);
const sets = opt('sets', '') ? new Set(opt('sets').split(',')) : null;
const TO = +opt('to', 600);
const games = JSON.parse(fs.readFileSync(idxFile, 'utf8')).filter((g) => !sets || sets.has(g.set)).filter((_, i) => i % sh[1] === sh[0]);
for (const g of games) {
  const A = [0, 1].map(() => ({ caps: 0, gems: 0, gold: 0, gemCaps: 0, goldOnly: 0, goldOnlyGold: 0 }));
  let prev = null;
  try {
    await dumpReplay(g.file, { snapshots: 'none', onStep(st) {
      if (st.round > TO) return;
      if (prev && st.step.kind === 2) for (const c of st.champions) {
        const b = prev.find((p) => p.id === c.entity.index); if (!b) continue;
        const dg = c.gems - b.gems, dd = c.gold - b.gold; if (dg <= 0 && dd <= 0) continue;
        const a = A[c.team === g.us ? 0 : 1]; a.caps++; a.gems += Math.max(0, dg); a.gold += Math.max(0, dd);
        if (dg > 0) a.gemCaps++; else { a.goldOnly++; a.goldOnlyGold += dd; }
      }
      prev = st.champions.map((c) => ({ id: c.entity.index, gems: c.gems, gold: c.gold }));
    } });
  } catch (e) { console.error(g.file, e.message); continue; }
  fs.appendFileSync(outFile, JSON.stringify({ set: g.set, result: g.result, us: A[0], them: A[1] }) + '\n');
}
