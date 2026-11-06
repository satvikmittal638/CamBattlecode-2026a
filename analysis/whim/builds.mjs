// Full purchase sequence per champion (shards collapsed into runs) across recent WHIM games.
import { dumpReplay, loadIndex } from './lib.mjs';
const N = +(process.argv[2] || 30);
const rows = loadIndex().slice(0, N);
const seqs = {};
for (const r of rows) {
  const d = await dumpReplay(r.path, { snapshots: 'none' });
  const me = r.side === 'b' ? 1 : 0;
  const ids = d.meta.finalChampions.filter((c) => c.team === me);
  for (const c of ids) {
    const buys = [];
    for (const e of d.events) if (e.kind === 'Shop' && e.actor?.index === c.id) for (const [k, v] of Object.entries(e.items || {})) if (v > 0 && !k.includes('Emblem')) buys.push(k.startsWith('consumable') ? 'LOCK' : k.replace(' Shard of ', ':'));
    // run-length
    const rl = []; for (const b of buys) { if (rl.length && rl.at(-1)[0] === b) rl.at(-1)[1]++; else rl.push([b, 1]); }
    (seqs[c.type] ??= []).push(rl.map(([b, n]) => n > 1 ? `${b}x${n}` : b).join(' > ') + `  (${d.meta.finalRound}r)`);
  }
}
for (const [t, s] of Object.entries(seqs)) { console.log('== ' + t); s.sort((a, b) => b.length - a.length).slice(0, 6).forEach((x) => console.log('  ' + x)); }
