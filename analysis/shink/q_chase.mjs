// When nearest visible foe is at distance 2..6 (outside melee range), P(approach) by foe hp frac, own hp frac, foe distance.
import { dumpReplay } from '../../tools/replay_dump.mjs';
import { listRows } from './lib.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const rows = listRows(args[0], { recent: +opt('recent', 20), side: opt('side'), teamName: opt('team', 'Agentic Loop Builders') });
const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
const RANGED = new Set(['Cassi', 'VesperVale', 'Stellar', 'Prism', 'Willow', 'Tavi']);
const T = {}; const add = (k, ap) => { const o = (T[k] ??= [0, 0]); o[1]++; if (ap) o[0]++; };
for (const r of rows) {
  const d = await dumpReplay(r.path, { snapshots: 'round' });
  const at = new Map(); for (const s of d.snapshots) if (!at.has(s.round)) at.set(s.round, s);
  for (const s of d.snapshots) {
    const nx = at.get(s.round + 1); if (!nx) continue;
    for (const c of s.champions.filter((x) => x.team === r.me && x.alive && x.pos)) {
      const rng = RANGED.has(c.type) ? 3 : 1;
      const foes = s.champions.filter((x) => x.team !== r.me && x.alive && x.pos).map((f) => ({ f, d: cheb(f.pos, c.pos) })).filter((o) => o.d > rng && o.d <= 6).sort((a, b) => a.d - b.d);
      if (!foes.length) continue;
      const inR = s.champions.some((x) => x.team !== r.me && x.alive && x.pos && cheb(x.pos, c.pos) <= rng);
      if (inR) continue;
      const f = foes[0].f; const c2 = nx.champions.find((x) => x.id === c.id); if (!c2?.alive || !c2.pos) continue;
      const ap = cheb(f.pos, c2.pos) < foes[0].d;
      add('all', ap);
      add('foeHp' + Math.min(4, Math.floor(5 * f.hp / f.maxHp)), ap);
      add('ownHp' + Math.min(4, Math.floor(5 * c.hp / c.maxHp)), ap);
      add('dist' + foes[0].d, ap);
      add((c.gems > 0 ? 'carrying' : 'empty'), ap);
      add(RANGED.has(c.type) ? 'ranged' : 'melee', ap);
    }
  }
}
console.log(Object.entries(T).map(([k, [a, n]]) => `${k}:${(a / n).toFixed(2)}(${n})`).join('  '));
