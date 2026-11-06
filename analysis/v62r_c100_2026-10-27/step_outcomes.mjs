// What follows each "outmatched-step" of v62r in its own platform games (trace shadow, PHASE2_LOG 2)? Per firing:
// capture claim released (log "claim-clear"), an ally within 7 tiles dying in the next 6 rounds (left behind), the
// stepping champion dying in the next 12 rounds, and stepping back toward the enemy within 3 turns. Grouped by the
// baseline (v62) game: targeted = v62 died >= 12 times there.   node step_outcomes.mjs <trace dir>
import fs from 'node:fs';
import path from 'node:path';
const dir = import.meta.dirname, trace = process.argv[2];
const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
const stage = (r) => (r.log || '').match(/decision \d+ -?\d+ (\S+)/)?.[1] ?? 'none';
const idx = JSON.parse(fs.readFileSync(`${dir}/games/index.json`, 'utf8'));
const base = new Map(JSON.parse(fs.readFileSync(`${dir}/../v62_c100_2026-10-27/games/index.json`, 'utf8')).map((g) => [`${g.label}|${g.map}|${g.side}`, g]));
const baseDeaths = (g) => { const b = base.get(`${g.label}|${g.map}|${g.side}`); if (!b) return null;
  const s = JSON.parse(fs.readFileSync(`${dir}/../v62_c100_2026-10-27/official_summaries/${b.matchId}.json`, 'utf8')); const us = b.side === 'a' ? 'teamA' : 'teamB';
  return s.champions.filter((c) => c.team === us).reduce((t, c) => t + Number(c.metrics.deaths), 0); };
const agg = {};
for (const g of idx) {
  const f = path.join(trace, `${g.map}__${path.basename(g.file, '.repl26a')}.jsonl`);
  if (!fs.existsSync(f)) continue;
  const bd = baseDeaths(g); if (bd === null) continue;
  const grp = bd >= 12 ? 'targeted' : 'untargeted';
  const a = (agg[grp] ??= { games: 0, fires: 0, claim: 0, allyDied: 0, selfDied: 0, back: 0, chain: 0, enemies: 0, allies6: 0, gemsCarried: 0 });
  a.games++;
  const rows = fs.readFileSync(f, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  const by = new Map(); for (const r of rows) (by.get(r.id) ?? by.set(r.id, []).get(r.id)).push(r);
  for (const list of by.values()) list.sort((x, y) => x.r - y.r);
  const deathsAt = []; // [id, round, pos]
  for (const [id, list] of by) for (let i = 1; i < list.length; i++) if (list[i - 1].alive && !list[i].alive) deathsAt.push([id, list[i - 1].r, list[i - 1].pos]);
  for (const [id, list] of by) {
    for (let i = 0; i < list.length; i++) {
      const r = list[i]; if (!r.alive || stage(r) !== 'outmatched-step') continue;
      a.fires++;
      if (/claim-clear/.test(r.log || '')) a.claim++;
      if (i > 0 && stage(list[i - 1]) === 'outmatched-step') a.chain++;
      const foes = (r.ctx?.enemies || []); a.enemies += foes.length; a.allies6 += (r.ctx?.allies || []).filter((x) => cheb([x[2], x[3]], r.pos) <= 6).length; a.gemsCarried += r.gems;
      if (deathsAt.some(([did, dr, dp]) => did !== id && dr >= r.r && dr <= r.r + 6 && cheb(dp, r.pos) <= 7)) a.allyDied++;
      if (deathsAt.some(([did, dr]) => did === id && dr >= r.r && dr <= r.r + 12)) a.selfDied++;
      const near = foes.length ? foes.reduce((m, e) => (cheb([e[2], e[3]], r.pos) < cheb([m[2], m[3]], r.pos) ? e : m)) : null;
      if (near) { const d0 = cheb([near[2], near[3]], r.pos);
        for (let k = i + 1; k <= i + 3 && k < list.length; k++) if (list[k].alive && stage(list[k]) !== 'outmatched-step' && cheb([near[2], near[3]], list[k].pos) < d0) { a.back++; break; } }
    }
  }
}
for (const [grp, a] of Object.entries(agg)) {
  const p = (x) => (100 * x / Math.max(1, a.fires)).toFixed(0) + '%';
  console.log(`${grp}: ${a.games} games, ${a.fires} steps (${(a.fires / a.games).toFixed(1)}/game) | capture released ${p(a.claim)} | ally within 7 died in next 6 rounds ${p(a.allyDied)} | stepper died in next 12 ${p(a.selfDied)} | stepped back toward within 3 turns ${p(a.back)} | consecutive ${p(a.chain)} | enemies seen ${(a.enemies / a.fires).toFixed(1)} allies<=6 ${(a.allies6 / a.fires).toFixed(1)} gems carried ${(a.gemsCarried / a.fires).toFixed(0)}`);
}
