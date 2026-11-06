// Economy / fight timeline per game from our side: tributed + carried gems, kills, deaths, captures at checkpoints.
//   node timeline.mjs <games/index.json> [--filter heavy|win|all] [--out file.json]
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay, STEP_KINDS } from '../../tools/replay_dump.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const idxFile = args[0];
const filter = opt('filter', 'all');
const special = /contest|boss_battle/;
const cat = (g) => (g.result === 'win' ? 'win' : !special.test(g.map) && g.oppScore - g.score >= 500 ? 'heavy' : 'loss');
const games = JSON.parse(fs.readFileSync(idxFile, 'utf8')).filter((g) => filter === 'all' || cat(g) === filter);
const CHECK = [100, 200, 300, 400, 600, 800];
const rows = [];
for (const g of games) {
  const us = g.side === 'a' ? 0 : 1;
  const at = {};
  let captures = [0, 0], prevAlive = null, deaths = [0, 0], firstLead100 = null;
  await dumpReplay(path.join(path.dirname(idxFile), g.file), {
    snapshots: 'none',
    onStep(st, ev) {
      if (ev && ev.kind === 'Capture') captures[st.team === 2 ? 0 : st.team]++;
      const alive = st.champions.map((c) => c.alive);
      if (prevAlive) st.champions.forEach((c, i) => { if (prevAlive[i] && !c.alive) deaths[c.team]++; });
      prevAlive = alive;
      const own = (t) => st.submittedGems[t] + st.champions.filter((c) => c.team === t).reduce((s, c) => s + c.gems, 0);
      const lead = own(1 - us) - own(us);
      if (firstLead100 === null && lead >= 100) firstLead100 = st.round;
      for (const r of CHECK) if (!at[r] && st.round >= r) at[r] = { ours: own(us), theirs: own(1 - us), sub: [st.submittedGems[us], st.submittedGems[1 - us]], deaths: [deaths[us], deaths[1 - us]] };
    },
  });
  rows.push({ map: g.map, opponent: g.opponent, cat: cat(g), score: g.score, oppScore: g.oppScore, firstLead100, at });
}
if (opt('out')) fs.writeFileSync(opt('out'), JSON.stringify(rows, null, 1));
for (const c of ['heavy', 'loss', 'win']) {
  const rs = rows.filter((r) => r.cat === c);
  if (!rs.length) continue;
  console.log(`== ${c} (${rs.length} games); first round the opponent led by 100+ gems: median ${median(rs.map((r) => r.firstLead100 ?? 9999))}`);
  for (const r of CHECK) {
    const xs = rs.filter((x) => x.at[r]);
    if (!xs.length) continue;
    const m = (f) => (xs.reduce((s, x) => s + f(x.at[r]), 0) / xs.length).toFixed(1);
    console.log(`  round ${String(r).padStart(4)} (${xs.length} games): gems ours ${m((a) => a.ours)} theirs ${m((a) => a.theirs)} | deaths ours ${m((a) => a.deaths[0])} theirs ${m((a) => a.deaths[1])}`);
  }
}
function median(a) { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; }
