// Death autopsy from a shadow trace (PHASE2_LOG 2 build over recorded games): for each death of our champions, the
// champion's own last 12 turns - enemies in its personal vision, HP, gems, allies in view, the decision stage that
// acted, and whether it stepped toward or away from the nearest seen enemy. Classifies each death:
//   unseen      no enemy in its own vision on any of its last 3 turns
//   ignored     2+ enemies seen >= 3 turns before death and most turns since were farm/camp/route/commit stages
//   fighting    most turns since the warning were fight-plan stages (two-turn fight, reset, heart, parting hit)
//   escaping    an escape stage (burst-escape, low, retreat, outgunned) ran but it died anyway
//   other
//   node death_autopsy.mjs <trace dir> [--out file.json]
import fs from 'node:fs';
import path from 'node:path';
const dir = process.argv[2];
const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
const stageOf = (r) => (r.log || '').match(/decision \d+ -?\d+ (\S+)/)?.[1] ?? 'none';
const FIGHT = /^(v1-two-turn-fight|reset|v36-heart-control|x-melee-parting|fight)$/;
const ESCAPE = /^(v1-burst-escape|low|retreat-home|retreat-blocked|x-recall-guard|x-outgunned)$/;
const WORK = /^(farm|v1-camp-actions|castcamp|route|route-step|route-blocked|x-commit|v1-cycle|v1-cycle-cached|v41-affordable-task|tribute|capture|opening|farm-unseen|gate-assault|fight-memo|v1-assigned-help)/;
const deaths = [];
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.jsonl'))) {
  const rows = fs.readFileSync(path.join(dir, f), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  const byId = new Map();
  for (const r of rows) (byId.get(r.id) ?? byId.set(r.id, []).get(r.id)).push(r);
  for (const [id, list] of byId) {
    list.sort((a, b) => a.r - b.r);
    for (let i = 1; i < list.length; i++) {
      if (!(list[i - 1].alive && !list[i].alive)) continue;
      const last = list[i - 1], win = list.slice(Math.max(0, i - 12), i).filter((r) => r.alive);
      const seen = win.map((r) => (r.ctx?.enemies || []).filter((e) => cheb([e[2], e[3]], r.pos) <= 8));
      const warnIdx = seen.findIndex((s) => s.length >= 2);
      const lastSeen3 = seen.slice(-3).some((s) => s.length > 0);
      const after = warnIdx >= 0 ? win.slice(warnIdx) : [];
      const stages = after.map(stageOf);
      const nFight = stages.filter((s) => FIGHT.test(s)).length, nWork = stages.filter((s) => WORK.test(s)).length, nEsc = stages.filter((s) => ESCAPE.test(s)).length;
      let toward = 0, away = 0;
      for (let k = warnIdx < 0 ? win.length : warnIdx; k + 1 < win.length; k++) {
        const s = seen[k]; if (!s.length) continue;
        const near = s.reduce((m, e) => (cheb([e[2], e[3]], win[k].pos) < cheb([m[2], m[3]], win[k].pos) ? e : m));
        const d0 = cheb([near[2], near[3]], win[k].pos), d1 = cheb([near[2], near[3]], win[k + 1].pos);
        if (d1 < d0) toward++; else if (d1 > d0) away++;
      }
      const cls = !lastSeen3 ? 'unseen' : warnIdx >= 0 && win.length - warnIdx >= 3 && nEsc > 0 ? 'escaping'
        : warnIdx >= 0 && win.length - warnIdx >= 3 && nWork > nFight ? 'ignored' : nFight > 0 && nFight >= nWork ? 'fighting' : 'other';
      const w = warnIdx >= 0 ? win[warnIdx] : null;
      deaths.push({ game: f, id, type: last.type, round: last.r, cls, warnTurns: warnIdx >= 0 ? win.length - warnIdx : 0,
        hpAtWarn: w ? +(w.hp / w.mhp).toFixed(2) : null, gems: last.gems, enemiesAtWarn: w ? seen[warnIdx].length : 0,
        alliesAtWarn: w ? (w.ctx?.allies || []).filter((a) => cheb([a[2], a[3]], w.pos) <= 6).length : 0,
        firstStage: w ? stageOf(w) : stageOf(last), stages: stages.join(' '), toward, away });
    }
  }
}
const n = deaths.length, by = (k) => deaths.reduce((o, d) => ((o[d[k]] = (o[d[k]] || 0) + 1), o), {});
console.log(`${n} deaths in ${new Set(deaths.map((d) => d.game)).size} games`);
console.log('class:', by('cls'));
for (const c of ['ignored', 'fighting', 'escaping', 'unseen', 'other']) {
  const ds = deaths.filter((d) => d.cls === c); if (!ds.length) continue;
  const avg = (f) => (ds.reduce((t, d) => t + (f(d) ?? 0), 0) / ds.length).toFixed(2);
  const first = ds.reduce((o, d) => ((o[d.firstStage] = (o[d.firstStage] || 0) + 1), o), {});
  console.log(`\n${c}: ${ds.length} (${(100 * ds.length / n).toFixed(0)}%) warn turns ${avg((d) => d.warnTurns)} hp@warn ${avg((d) => d.hpAtWarn)} enemies@warn ${avg((d) => d.enemiesAtWarn)} allies<=6@warn ${avg((d) => d.alliesAtWarn)} gems ${avg((d) => d.gems)} toward ${avg((d) => d.toward)} away ${avg((d) => d.away)}`);
  console.log('  stage at warning:', Object.entries(first).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${k} ${v}`).join(', '));
}
const outI = process.argv.indexOf('--out');
if (outI > 0) fs.writeFileSync(process.argv[outI + 1], JSON.stringify(deaths));
