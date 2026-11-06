#!/usr/bin/env node
// Head-to-head comparison inside the same platform games: KratosMessi side vs our side.
//   node analysis/kratosmessi/h2h.mjs analysis/kratosmessi/platform/<groupId> [more group dirs...] [--json out.json]
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay } from '../../tools/replay_dump.mjs';
import { analyzeMatch, mean } from './lib.mjs';

const args = process.argv.slice(2);
const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : null;
const dirs = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--json');
const OUR = '6b04505b-d16c-4196-b7c6-53a4688a32ca';
const MAPS = ['collision', 'corners', 'elkring', 'expanse', 'interlock', 'lanes', 'monolith', 'packs', 'rows'];
const rows = [];
for (const dir of dirs) {
  const gj = fs.readdirSync(dir).find((f) => f.startsWith('group_'));
  const g = JSON.parse(fs.readFileSync(path.join(dir, gj), 'utf8'));
  const ours = g.group.sides.find((s) => s.teamId === OUR);
  const theirs = g.group.sides.find((s) => s.teamId !== OUR);
  const meIdx = ours.side === 'a' ? 0 : 1;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.repl26a'))) {
    const map = MAPS.find((m) => f.startsWith(m + '_'));
    const d = await dumpReplay(path.join(dir, f), { snapshots: 'round' });
    const us = analyzeMatch(d, meIdx, map), them = analyzeMatch(d, 1 - meIdx, map);
    rows.push({ group: path.basename(dir), opp: theirs.teamName, map, us, them });
  }
}
const r2 = (x) => (x == null ? null : +(+x).toFixed(2));
const metric = (a) => {
  const atk = Object.values(a.attacks).reduce((s, x) => s + x, 0);
  return {
    gems: a.gems[0], captures: a.captures, capPer100: (100 * a.captures) / a.rounds, tributes: a.tributes.length,
    gpt: mean(a.tributes.map((t) => t.gems)) ?? 0, recalls: a.recalls.length, recallHp: mean(a.recalls.map((x) => x.hpf).filter((x) => x != null)) ?? 0,
    kills: a.kills, deaths: a.deaths, champAtkShare: atk ? a.attacks.champion / atk : 0, atkPerGame: atk,
    locksBought: a.altarLockBuys, locksPlaced: a.altarLocksPlaced, wards: a.wards, enemyHalf: a.enemyHalf / Math.max(1, a.aliveSamples), nearAllies: a.nearAllies,
    capturers: mean(a.capturersAtCapture) ?? 0, firstCapture: a.firstCapture ?? 0, firstTribute: a.tributes[0]?.r ?? 0,
  };
};
console.log('per game:');
for (const r of rows) console.log(`  ${r.group.slice(0, 8)} ${r.map.padEnd(9)} ${r.us.won ? 'WIN ' : 'LOSS'} us ${r.us.gems[0]} - ${r.them.gems[0]} ${r.opp}  r${r.us.rounds}  draft us[${r.us.draft}] them[${r.them.draft}]  k/d us ${r.us.kills}/${r.us.deaths} them ${r.them.kills}/${r.them.deaths}`);
const keys = Object.keys(metric(rows[0].us));
const A = {}, B = {};
for (const k of keys) { A[k] = r2(mean(rows.map((r) => metric(r.them)[k]))); B[k] = r2(mean(rows.map((r) => metric(r.us)[k]))); }
console.log('\nmetric'.padEnd(20), 'opponent'.padStart(9), 'mimic'.padStart(9), 'diff');
for (const k of keys) { const d = A[k] ? ((B[k] - A[k]) / Math.abs(A[k]) * 100).toFixed(0) + '%' : ''; console.log(k.padEnd(19), String(A[k]).padStart(9), String(B[k]).padStart(9), d.padStart(6) + (d && Math.abs(parseFloat(d)) > 20 ? ' <<' : '')); }
// per champion abilities per 100 rounds
const champ = (side) => { const o = {}; for (const r of rows) { const a = r[side]; for (const [t, c] of Object.entries(a.perChamp)) { const p = (o[t] ??= { n: 0, ab: {}, campAtk: 0, champAtk: 0, rec: 0, trib: 0, deaths: 0 }); p.n++; p.campAtk += 100 * c.attacksCamp / a.rounds; p.champAtk += 100 * c.attacksChamp / a.rounds; p.rec += c.recalls; p.trib += c.tributes; p.deaths += c.deaths; for (const [k, v] of Object.entries(c.abil)) p.ab[k] = (p.ab[k] || 0) + 100 * v / a.rounds; } } return o; };
const ca = champ('them'), cb = champ('us');
console.log('\nper champion (per 100 rounds unless noted) opponent | mimic');
for (const t of Object.keys(ca)) {
  const a = ca[t], b = cb[t] || { n: 1, ab: {}, campAtk: 0, champAtk: 0, rec: 0, trib: 0, deaths: 0 };
  const f = (p) => `campAtk ${(p.campAtk / p.n).toFixed(1)} champAtk ${(p.champAtk / p.n).toFixed(1)} rec/g ${(p.rec / p.n).toFixed(1)} trib/g ${(p.trib / p.n).toFixed(1)} deaths/g ${(p.deaths / p.n).toFixed(2)} ${Object.entries(p.ab).map(([k, v]) => `${k} ${(v / p.n).toFixed(1)}`).join(' ')}`;
  console.log(`  ${t.padEnd(9)} ${f(a)}\n  ${''.padEnd(9)} ${f(b)}`);
}
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify({ rows: rows.map((r) => ({ group: r.group, map: r.map, opp: r.opp, won: r.us.won, us: metric(r.us), them: metric(r.them) })), opponent: A, mimic: B }, null, 1));
