// Were our deaths against 2+ enemies with no ally near avoidable? For each such death look back up to 12 rounds:
// warning = rounds since 2+ enemies were first within 8 of the victim; what the victim did in that window
// (camp attacks, champion attacks, steps toward / away from the enemies), its HP then, allies within 8, gems carried.
// Writes deathcontext.json and prints a summary.   node deathcontext.mjs
import fs from 'node:fs'; import path from 'node:path'; import { dumpReplay } from '../../tools/replay_dump.mjs';
const dir = import.meta.dirname, index = JSON.parse(fs.readFileSync(path.join(dir, 'games/index.json'), 'utf8'));
const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
const out = [];
for (const g of index) {
  const cls = g.result === 'win' ? 'win' : (g.oppScore - g.score >= 500 ? 'heavy' : 'loss');
  const d = await dumpReplay(path.join(dir, 'games', g.file), { snapshots: 'round' });
  const team = g.side === 'a' ? 0 : 1;
  const evBy = new Map();
  for (const e of d.events) if (e.actor?.kind === 1) { const k = e.actor.index + ':' + e.round; (evBy.get(k) ?? evBy.set(k, []).get(k)).push(e); }
  const S = d.snapshots;
  for (let i = 1; i < S.length - 1; i++) {
    for (const c of S[i].champions) {
      if (c.team !== team || !c.alive || !c.pos) continue;
      const nx = S[i + 1].champions.find((o) => o.id === c.id);
      if (!nx || nx.alive) continue;
      const foes = (s, ch) => s.champions.filter((o) => o.team !== team && o.alive && o.pos && cheb(o.pos, ch.pos) <= 6);
      const mates = (s, ch, r) => s.champions.filter((o) => o.team === team && o.id !== ch.id && o.alive && o.pos && cheb(o.pos, ch.pos) <= r);
      if (foes(S[i], c).length < 2 || mates(S[i], c, 6).length) continue;
      // look back for the first round with 2+ enemies within 8
      let warn = 0, at = null, campHits = 0, champHits = 0, toward = 0, away = 0;
      for (let j = i; j >= Math.max(1, i - 12); j--) {
        const cj = S[j].champions.find((o) => o.id === c.id);
        if (!cj?.alive || !cj.pos) break;
        const f8 = S[j].champions.filter((o) => o.team !== team && o.alive && o.pos && cheb(o.pos, cj.pos) <= 8);
        if (f8.length < 2) break;
        warn = i - j + 1; at = { hp: +(cj.hp / cj.maxHp).toFixed(2), allies8: mates(S[j], cj, 8).length, gems: cj.gems, round: S[j].round };
        for (const e of evBy.get(c.id + ':' + S[j].round) ?? []) {
          if (e.kind === 'Attack' || e.kind === 'Cast ability') { const tgt = S[j].champions.find((o) => o.pos && o.pos[0] === e.to[0] && o.pos[1] === e.to[1]); if (tgt && tgt.team !== team) champHits++; else campHits++; }
        }
        const prev = S[j - 1]?.champions.find((o) => o.id === c.id);
        if (prev?.pos) {
          const near = f8.reduce((m, o) => (cheb(o.pos, cj.pos) < cheb(m.pos, cj.pos) ? o : m));
          const d0 = cheb(near.pos, prev.pos), d1 = cheb(near.pos, cj.pos);
          if (d1 < d0) toward++; else if (d1 > d0) away++;
        }
      }
      out.push({ cls, map: g.map, matchId: g.matchId.slice(0, 8), round: S[i].round, type: c.type, warn, at, campHits, champHits, toward, away, gemsAtDeath: c.gems });
    }
  }
}
fs.writeFileSync(path.join(dir, 'deathcontext.json'), JSON.stringify(out));
const by = (f) => out.reduce((m, x) => ((m[f(x)] = (m[f(x)] || 0) + 1), m), {});
console.log(`${out.length} deaths alone vs 2+ enemies within 6 (no ally within 6)`);
console.log('by outcome class:', by((x) => x.cls));
console.log('warning rounds (2+ enemies within 8 before death):', by((x) => Math.min(x.warn, 12)));
const w3 = out.filter((x) => x.warn >= 3);
console.log(`with >=3 rounds warning: ${w3.length}; HP at warning: mean ${(w3.reduce((a, x) => a + x.at.hp, 0) / w3.length).toFixed(2)}; ally within 8 at warning: ${w3.filter((x) => x.at.allies8 > 0).length}`);
console.log(`  in the window: camp attacks in ${w3.filter((x) => x.campHits > 0).length}, champion attacks in ${w3.filter((x) => x.champHits > 0).length}, stepped toward enemies (>=1) ${w3.filter((x) => x.toward > 0).length}, mostly away ${w3.filter((x) => x.away > x.toward).length}`);
console.log(`  carrying 20+ gems at warning: ${w3.filter((x) => x.at.gems >= 20).length}; by round: ${JSON.stringify(by((x) => (x.round < 200 ? '<200' : x.round < 600 ? '200-600' : '600+')))}`);
console.log('by type:', by((x) => x.type));
