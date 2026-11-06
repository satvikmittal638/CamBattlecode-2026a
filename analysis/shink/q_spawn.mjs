// Time spent on spawn after arriving (recall or respawn) and hp fraction when leaving.
import { dumpReplay } from '../../tools/replay_dump.mjs';
import { listRows } from './lib.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const rows = listRows(args[0], { recent: +opt('recent', 10), side: opt('side'), teamName: opt('team', 'Agentic Loop Builders') });
const stays = [], leaveHp = [], healPerRound = [];
for (const r of rows) {
  const d = await dumpReplay(r.path, { snapshots: 'round' });
  const s0 = d.snapshots.find((s) => s.champions.length && s.champions.every((c) => c.pos));
  const spawn = s0.champions.filter((c) => c.team === r.me).map((c) => c.pos);
  const onSpawn = (p) => p && spawn.some((s) => Math.max(Math.abs(s[0] - p[0]), Math.abs(s[1] - p[1])) <= 1);
  for (const id of s0.champions.filter((c) => c.team === r.me).map((c) => c.id)) {
    let start = null, prevHp = null;
    for (const s of d.snapshots) {
      if (s.round < 5) continue;
      const c = s.champions.find((x) => x.id === id); if (!c?.alive) { start = null; continue; }
      if (onSpawn(c.pos)) { if (start === null) start = s.round; else if (prevHp !== null && c.hp > prevHp && c.hp < c.maxHp) healPerRound.push((c.hp - prevHp) / c.maxHp); }
      else if (start !== null) { stays.push(s.round - start); leaveHp.push(+(c.hp / c.maxHp).toFixed(2)); start = null; }
      prevHp = c.hp;
    }
  }
}
const h = (a) => { const o = {}; a.forEach((x) => (o[x] = (o[x] || 0) + 1)); return JSON.stringify(o); };
console.log('stay rounds', h(stays.map((x) => Math.min(x, 15))));
console.log('leave hp', h(leaveHp.map((x) => Math.floor(x * 10) / 10)));
console.log('heal/round frac mean', (healPerRound.reduce((a, b) => a + b, 0) / healPerRound.length).toFixed(3));
