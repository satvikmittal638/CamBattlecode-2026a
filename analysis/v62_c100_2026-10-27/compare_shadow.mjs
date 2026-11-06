// Compare two shadow runs of the same recorded games turn by turn (same replay states, so any difference is the bot).
//   node compare_shadow.mjs <shadowDirA> <shadowDirB> [--examples N]
// Buckets every turn where A and B act differently by the stage tags of both and by how much fuel A had left
// (a cheaper build completes actions the other abandons at its fuel guard; that is not a logic change).
import fs from 'node:fs';
import path from 'node:path';
const [A, B] = process.argv.slice(2);
const exN = +(process.argv.includes('--examples') ? process.argv[process.argv.indexOf('--examples') + 1] : 8);
const parse = (f) => fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
const stageOf = (r) => { const m = (r.log || '').match(/decision \d+ -?\d+ (\S+) goal (-?\d+).*remaining (\d+)/); return m ? { stage: m[1], remaining: +m[3] } : { stage: r.log ? 'nolog' : 'silent', remaining: null }; };
let turns = 0, differ = 0, aOnly = 0, bOnly = 0, neither = 0;
const buckets = {}, fuelBuckets = {}, examples = [];
for (const f of fs.readdirSync(A).filter((x) => x.endsWith('.jsonl'))) {
  if (!fs.existsSync(path.join(B, f))) continue;
  const ra = parse(path.join(A, f)), rb = parse(path.join(B, f));
  const key = (r) => r.r + ':' + r.id;
  const mb = new Map(rb.map((r) => [key(r), r]));
  for (const a of ra) {
    const b = mb.get(key(a)); if (!b) continue;
    ++turns;
    if (JSON.stringify(a.bot) === JSON.stringify(b.bot)) continue;
    ++differ;
    if (a.match && !b.match) ++aOnly; else if (!a.match && b.match) ++bOnly; else ++neither;
    const sa = stageOf(a), sb = stageOf(b);
    const k = `${sa.stage} -> ${sb.stage}`;
    buckets[k] = (buckets[k] || 0) + 1;
    const fb = sa.remaining == null ? 'A no fuel log' : sa.remaining < 25000 ? 'A <25k left' : sa.remaining < 45000 ? 'A 25-45k left' : 'A >=45k left';
    fuelBuckets[fb] = (fuelBuckets[fb] || 0) + 1;
    if (examples.length < exN && sa.remaining != null && sa.remaining >= 45000) examples.push({ f, r: a.r, id: a.id, type: a.type, a: a.bot, b: b.bot, rec: a.rep, sa, sb });
  }
}
console.log(JSON.stringify({ turns, differ, share: +(differ / turns * 100).toFixed(3), aMatchesRecordingOnly: aOnly, bMatchesRecordingOnly: bOnly, neither }, null, 1));
console.log('fuel left in A on differing turns:', JSON.stringify(fuelBuckets));
console.log('top stage pairs (A -> B):');
for (const [k, v] of Object.entries(buckets).sort((x, y) => y[1] - x[1]).slice(0, 25)) console.log(String(v).padStart(7), k);
console.log('examples where A had >= 45k fuel left:');
for (const e of examples) console.log(JSON.stringify(e));
