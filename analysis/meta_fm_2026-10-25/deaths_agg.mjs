// Summaries of deaths.jsonl: how each side's champions die, who kills, and the opening capture schedule.
//   node deaths_agg.mjs deaths.jsonl [--sets fish_ref,fish_v62,...]
import fs from 'node:fs';
const args = process.argv.slice(2);
let rows = fs.readFileSync(args[0], 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
if (args.includes('--sets')) { const s = new Set(args[args.indexOf('--sets') + 1].split(',')); rows = rows.filter((r) => s.has(r.set)); }
const groups = {};
for (const r of rows) (groups[`${r.set}/${r.result}`] ||= []).push(r);
const pct = (a, b) => (b ? ((100 * a) / b).toFixed(0) + '%' : '-');
const top = (o, n = 6) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `${k} ${v}`).join(', ');
for (const [k, g] of Object.entries(groups).sort()) {
  console.log(`\n### ${k} (${g.length} games)`);
  for (const side of ['us', 'them']) {
    const D = g.flatMap((r) => r.deaths.filter((d) => d.side === side));
    if (!D.length) continue;
    const victims = {}, killers = {}, killerAbil = {};
    for (const d of D) {
      victims[d.victim] = (victims[d.victim] || 0) + 1;
      for (const h of d.hitters) killers[h] = (killers[h] || 0) + 1;
      for (const [hk, n] of Object.entries(d.hitsBy)) if (!d.hitters.length || d.hitters.includes(hk.split(':')[0])) killerAbil[hk] = (killerAbil[hk] || 0) + n;
    }
    const n = D.length, per = (n / g.length).toFixed(1);
    console.log(` ${side === 'us' ? 'OUR' : 'OPP'} deaths ${per}/game | channel: tribute ${pct(D.filter((d) => d.channel === 'tribute').length, n)} recall ${pct(D.filter((d) => d.channel === 'recall').length, n)}` +
      ` | campFight ${pct(D.filter((d) => d.campFight).length, n)} | own half ${pct(D.filter((d) => d.depth > 0).length, n)} | near altar(<=3) ${pct(D.filter((d) => d.altarD <= 3).length, n)}` +
      ` | alone ${pct(D.filter((d) => d.allies === 0).length, n)} | outnumbered (e>a+1) ${pct(D.filter((d) => d.enemies > d.allies + 1).length, n)} | even-or-better ${pct(D.filter((d) => d.enemies <= d.allies + 1).length, n)}` +
      ` | camp-only ${pct(D.filter((d) => !d.hitters.length).length, n)} | bag>=30 ${pct(D.filter((d) => d.bag >= 30).length, n)} mean bag ${(D.reduce((a, d) => a + d.bag, 0) / n).toFixed(0)}`);
    console.log(`   victims: ${top(victims, 8)}`);
    console.log(`   hitters (champion types damaging the victim in its last 6 rounds): ${top(killers, 8)}`);
    console.log(`   hits by type:slot: ${top(killerAbil, 10)}`);
    const early = D.filter((d) => d.r <= 300);
    console.log(`   deaths r<=300: ${(early.length / g.length).toFixed(1)}/game; alone ${pct(early.filter((d) => d.allies === 0).length, early.length)}, outnumbered ${pct(early.filter((d) => d.enemies > d.allies + 1).length, early.length)}, enemies/allies mean ${(early.reduce((a, d) => a + d.enemies, 0) / Math.max(1, early.length)).toFixed(1)}/${(early.reduce((a, d) => a + d.allies, 0) / Math.max(1, early.length)).toFixed(1)}`);
  }
  // Opening captures (first 12 rewards of the game, both teams).
  for (const side of [0, 1]) {
    const C = g.flatMap((r) => r.caps.filter((c) => (c.team === r.us) === (side === 0)));
    const first = g.map((r) => r.caps.filter((c) => (c.team === r.us) === (side === 0))).filter((l) => l.length);
    const types = {};
    for (const c of C) { const k = [...new Set(c.campTypes)].sort().join('+') || '?'; types[k] = (types[k] || 0) + 1; }
    console.log(` ${side === 0 ? 'OUR' : 'OPP'} first rewards: mean first round ${(first.reduce((a, l) => a + l[0].r, 0) / Math.max(1, first.length)).toFixed(0)}, ` +
      `rewards in first 12 events ${(C.length / g.length).toFixed(1)}/game, gems ${(C.reduce((a, c) => a + c.gems, 0) / g.length).toFixed(0)}, gold ${(C.reduce((a, c) => a + c.gold, 0) / g.length).toFixed(0)}, ` +
      `depth(own>0) mean ${(C.reduce((a, c) => a + c.depth, 0) / Math.max(1, C.length)).toFixed(1)} | camps ${top(types, 5)}`);
  }
}
