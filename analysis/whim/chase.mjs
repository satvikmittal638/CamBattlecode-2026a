// Fight approach behaviour: when the nearest enemy is at distance k, does our champion close in next round?
//   node analysis/whim/chase.mjs whim N | <dir> <side>
import fs from 'node:fs'; import path from 'node:path';
import { dumpReplay, loadIndex, cheb } from './lib.mjs';
const a = process.argv.slice(2);
let rows;
if (a[0] === 'whim') rows = loadIndex().slice(0, +(a[1] || 30));
else { const files = []; const walk = (d) => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (f.endsWith('.repl26a')) files.push(p); } }; walk(a[0]); rows = files.map((p) => ({ path: p, side: a[1] || 'a' })); }
const T = {}; const inc = (k, v) => { (T[k] ??= { closer: 0, same: 0, away: 0 }); T[k][v]++; };
const chaseLen = []; const retreatHp = [];
for (const r of rows) {
  const d = await dumpReplay(r.path, { snapshots: 'round' });
  const me = r.side === 'b' ? 1 : 0;
  const S = d.snapshots; const byRound = new Map(); for (const s of S) if (!byRound.has(s.round)) byRound.set(s.round, s);
  const rounds = [...byRound.keys()].sort((x, y) => x - y);
  for (let i = 0; i + 1 < rounds.length; i++) {
    const s = byRound.get(rounds[i]), t = byRound.get(rounds[i + 1]);
    for (const c of s.champions.filter((x) => x.team === me && x.alive && x.pos)) {
      const c2 = t.champions.find((x) => x.id === c.id); if (!c2?.alive || !c2.pos) continue;
      const ens = s.champions.filter((x) => x.team !== me && x.alive && x.pos); if (!ens.length) continue;
      const e = ens.reduce((b, x) => (cheb(x.pos, c.pos) < cheb(b.pos, c.pos) ? x : b));
      const dd = cheb(e.pos, c.pos); if (dd > 8 || dd < 2) continue;
      const e2 = t.champions.find((x) => x.id === e.id); if (!e2?.pos) continue;
      const nd = cheb(e2.pos, c2.pos);
      const hpb = c.hp / c.maxHp >= 0.6 ? 'hi' : c.hp / c.maxHp >= 0.3 ? 'mid' : 'lo';
      const ehp = e.hp / e.maxHp < 0.4 ? 'enemyLow' : 'enemyOk';
      const mov = c2.pos[0] !== c.pos[0] || c2.pos[1] !== c.pos[1];
      const v = !mov ? 'same' : cheb(e.pos, c2.pos) < dd ? 'closer' : cheb(e.pos, c2.pos) > dd ? 'away' : 'same';
      inc(`d${dd <= 3 ? dd : dd <= 5 ? '4-5' : '6-8'} ${hpb} ${ehp} gems${c.gems >= 40 ? '40+' : '<40'}`, v);
    }
  }
}
for (const [k, v] of Object.entries(T).sort()) { const n = v.closer + v.same + v.away; if (n >= 30) console.log(k.padEnd(36), 'n', String(n).padStart(5), 'closer', (v.closer / n).toFixed(2), 'same', (v.same / n).toFixed(2), 'away', (v.away / n).toFixed(2)); }
