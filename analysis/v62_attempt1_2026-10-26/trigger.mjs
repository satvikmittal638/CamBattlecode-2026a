// How predictive is an "isolated against a group" trigger of death? For every alive champion-round of ours:
//   T(s, a, e): >= e enemies within 8, no ally within a, local HP share (self + allies within 6) /
//               (that + enemies within 8) < s
// outcome: this champion dies within the next 12 rounds. Prints P(death | T) and how many champion-rounds fire, per
// threshold, so a disengage rule can be chosen from data (both teams for comparison).   node trigger.mjs
import fs from 'node:fs'; import path from 'node:path'; import { dumpReplay } from '../../tools/replay_dump.mjs';
const dir = import.meta.dirname, index = JSON.parse(fs.readFileSync(path.join(dir, 'games/index.json'), 'utf8'));
const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
const SH = [0.3, 0.4, 0.5, 0.6], AL = [4, 6], EN = [2, 3];
const stat = {}; let base = { n: 0, d: 0 };
const key = (who, s, a, e) => `${who} s<${s} noAlly${a} ${e}+enemies`;
for (const g of index) {
  const d = await dumpReplay(path.join(dir, 'games', g.file), { snapshots: 'round' });
  const ours = g.side === 'a' ? 0 : 1, S = d.snapshots;
  const deathAt = new Map(); // id -> sorted death rounds
  for (let i = 1; i < S.length; i++) for (const c of S[i].champions) { const p = S[i - 1].champions.find((o) => o.id === c.id); if (p?.alive && !c.alive) (deathAt.get(c.id) ?? deathAt.set(c.id, []).get(c.id)).push(S[i].round); }
  for (let i = 1; i < S.length; i += 2) {           // every other round keeps it fast and decorrelated
    const s = S[i];
    for (const c of s.champions) {
      if (!c.alive || !c.pos) continue;
      const who = c.team === ours ? 'us' : 'them';
      const dies = (deathAt.get(c.id) || []).some((r) => r > s.round && r <= s.round + 12);
      if (who === 'us') { base.n++; base.d += dies; }
      const foes = s.champions.filter((o) => o.team !== c.team && o.alive && o.pos && cheb(o.pos, c.pos) <= 8);
      if (foes.length < 2) continue;
      const mates = s.champions.filter((o) => o.team === c.team && o.id !== c.id && o.alive && o.pos);
      const nearest = Math.min(99, ...mates.map((o) => cheb(o.pos, c.pos)));
      const mine = c.hp + mates.filter((o) => cheb(o.pos, c.pos) <= 6).reduce((t, o) => t + o.hp, 0);
      const share = mine / Math.max(1, mine + foes.reduce((t, o) => t + o.hp, 0));
      for (const sh of SH) for (const a of AL) for (const e of EN) {
        if (share >= sh || nearest <= a || foes.length < e) continue;
        const k = key(who, sh, a, e); const x = (stat[k] ??= { n: 0, d: 0 }); x.n++; x.d += dies;
      }
    }
  }
}
console.log(`baseline (ours): P(death within 12) = ${(base.d / base.n).toFixed(3)} over ${base.n} sampled champion-rounds`);
for (const k of Object.keys(stat).sort()) { const x = stat[k]; console.log(`${k.padEnd(34)} fires ${String(x.n).padStart(6)} (${(100 * x.n / base.n).toFixed(2)}% of rounds)  P(death) ${(x.d / x.n).toFixed(3)}`); }
fs.writeFileSync(path.join(dir, 'trigger.json'), JSON.stringify({ base, stat }));
