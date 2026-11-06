// Where do two deterministic runs of the same (opponent, map, side) first differ? Games are deterministic, so the first
// event by our team that differs between run A and run B is the decision our code change altered. At that point print
// what each run did, and the context in run B's snapshot (enemies within 6 of the acting champion, live camps within 2,
// HP fraction). Shard with --shard i/n.   node divergence.mjs fe_y y fe_z z flips_fe_y_fe_z.json --shard 0/6
import fs from 'node:fs'; import path from 'node:path'; import { dumpReplay } from '../../tools/replay_dump.mjs';
const [ra, va, rb, vb, flipsFile] = process.argv.slice(2);
const sh = (process.argv.find((x) => x.includes('/') && /^\d+\/\d+$/.test(x)) || '0/1').split('/').map(Number);
const dir = import.meta.dirname, flips = JSON.parse(fs.readFileSync(path.join(dir, flipsFile), 'utf8'));
const items = [...flips.down.map((k) => ['down', k]), ...flips.up.map((k) => ['up', k])].filter((_, i) => i % sh[1] === sh[0]);
const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
const sig = (e) => `${e.round}|${e.kind}|${e.actor?.index}|${e.from}|${e.to}|${e.slot ?? ''}`;
const out = [];
for (const [cls, [opp, map, side]] of items) {
  const f = (r, v) => path.join(dir, r, 'games', v, opp, map, side + '.repl26a');
  const A = await dumpReplay(f(ra, va)), B = await dumpReplay(f(rb, vb));
  const team = side === 'a' ? 0 : 1;
  const ours = (d) => d.events.filter((e) => e.team === team && e.kind !== 'Draft champion' && e.phase !== 'Draft');
  const ea = ours(A), eb = ours(B);
  let i = 0; while (i < ea.length && i < eb.length && sig(ea[i]) === sig(eb[i])) i++;
  const x = ea[i], y = eb[i];
  const round = Math.min(x?.round ?? 1e9, y?.round ?? 1e9);
  const s = B.snapshots.find((q) => q.round === round) || B.snapshots.at(-1);
  const actor = (y && y.round === round ? y : x)?.actor?.index;
  const c = s.champions.find((q) => q.id === actor);
  let ctx = null;
  if (c?.pos) {
    const foes = s.champions.filter((q) => q.team !== team && q.alive && q.pos && cheb(q.pos, c.pos) <= 6);
    const mates = s.champions.filter((q) => q.team === team && q.id !== c.id && q.alive && q.pos && cheb(q.pos, c.pos) <= 4);
    const camps = s.camps.filter((q) => q.hp > 0 && cheb(q.pos, c.pos) <= 2);
    ctx = { type: c.type, hp: +(c.hp / c.maxHp).toFixed(2), foes6: foes.length, mates4: mates.length, camps2: camps.length, gems: c.gems };
  }
  const brief = (e) => e ? `${e.round} ${e.kind}${e.abilityType ? '/' + e.abilityType : ''} ${e.from}->${e.to}${e.target ? ' @' + e.target.kind + ':' + e.target.type : ''}` : 'none';
  out.push({ cls, opp, map, side, round, a: brief(x?.round === round ? x : null), b: brief(y?.round === round ? y : null), ctx, scoreA: A.meta.submittedGems, scoreB: B.meta.submittedGems });
  console.log(cls, opp, map, side, 'r' + round, '|', va + ':', out.at(-1).a, '|', vb + ':', out.at(-1).b, '|', JSON.stringify(ctx));
}
fs.writeFileSync(path.join(dir, 'divergence', `${va}_${vb}_${sh[0]}.json`), JSON.stringify(out));
