// Decision audit over turnhost shadow runs (--detail): every bot decision at its exact recorded board state, joined
// with what happened next in the replay. Reports vulnerability patterns and how often each precedes a death.
//   node decision_audit.mjs <runs dir with summary.json> [--k 5] [--json out.json] [--examples N]
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const dir = args[0];
const K = +opt('k', 5);
const nExamples = +opt('examples', 3);
const special = /contest|boss_battle/;
const summary = JSON.parse(fs.readFileSync(path.join(dir, 'summary.json'), 'utf8'));
const CAMP = ['Wolf', 'Elk', 'GemCluster', 'GoldCluster', 'Monolith', 'Golem'];
const CAMP_RANGE = { Wolf: 3, Elk: 4, Golem: 4, Monolith: 5 };
const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));

const bucketOf = (g) => (g.result === 'win' ? 'win' : !special.test(g.map) && g.oppScore - g.score >= 500 ? 'heavy' : 'loss');
const P = {}; // pattern -> {bucket -> {n, die}}
const examples = {};
const note = (name, bucket, died, ex) => {
  const p = (P[name] ||= {});
  const b = (p[bucket] ||= { n: 0, die: 0 });
  b.n++;
  if (died) b.die++;
  if (died && bucket === 'heavy' && ex) { const e = (examples[name] ||= []); if (e.length < nExamples) e.push(ex); }
};

let decisions = 0, deaths = { win: 0, loss: 0, heavy: 0 }, games = { win: 0, loss: 0, heavy: 0 };
const deathCover = {}; // pattern -> deaths in heavy losses preceded by it within K rounds
let heavyDeaths = 0;
for (const g of summary) {
  if (g.code !== 0) continue;
  const bucket = bucketOf(g);
  games[bucket]++;
  const lim = g.firstDrift > 0 ? g.firstDrift : 1e9;
  const rows = fs.readFileSync(path.join(dir, g.out), 'utf8').trim().split('\n').map((l) => JSON.parse(l)).filter((x) => x.r !== undefined && x.r < lim);
  const byChamp = new Map();
  for (const x of rows) { if (!byChamp.has(x.id)) byChamp.set(x.id, []); byChamp.get(x.id).push(x); }
  for (const list of byChamp.values()) {
    // Death rounds: alive -> not alive transitions.
    const deathRounds = [];
    for (let i = 1; i < list.length; i++) if (list[i - 1].alive && !list[i].alive) deathRounds.push(list[i].r);
    deaths[bucket] += deathRounds.length;
    const diesSoon = (r) => deathRounds.some((d) => d > r && d <= r + K);
    const flagged = new Map(); // death round -> set of patterns
    for (const x of list) {
      if (!x.alive || !x.pos || !x.ctx) continue;
      decisions++;
      const c = x.ctx;
      const hpf = x.hp / Math.max(1, x.mhp);
      const enemies = c.enemies.map((e) => ({ type: e[0], pos: [e[2], e[3]], hp: e[4], mhp: e[5], d: cheb(x.pos, [e[2], e[3]]) }));
      const allies = c.allies.map((a) => ({ type: a[0], pos: [a[2], a[3]], hp: a[4], mhp: a[5], d: cheb(x.pos, [a[2], a[3]]) }));
      const camps = c.camps.map((k) => ({ type: CAMP[k[1]], pos: [k[2], k[3]], hp: k[4], awake: k[5] === 1, d: cheb(x.pos, [k[2], k[3]]) }));
      const e4 = enemies.filter((e) => e.d <= 4).length, e2 = enemies.filter((e) => e.d <= 2).length;
      const a4 = allies.filter((a) => a.d <= 4).length;
      const awakeInRange = camps.filter((k) => k.awake && CAMP_RANGE[k.type] && k.d <= CAMP_RANGE[k.type]);
      const acts = x.bot.filter((a) => !a.startsWith('prio') && !a.startsWith('blocked'));
      const did = (p) => acts.some((a) => a.startsWith(p));
      const moveTo = acts.filter((a) => a.startsWith('move ')).map((a) => a.slice(5).split(',').map(Number)).pop();
      const threats = [...enemies.filter((e) => e.d <= 5).map((e) => e.pos), ...awakeInRange.map((k) => k.pos)];
      const nearest = (p) => Math.min(...threats.map((t) => cheb(p, t)));
      const retreat = moveTo && threats.length && nearest(moveTo) > nearest(x.pos);
      const died = diesSoon(x.r);
      const ex = { map: g.map, file: g.file, r: x.r, type: x.type, hp: `${x.hp}/${x.mhp}`, pos: x.pos, cd: c.cd, bot: acts, enemies: enemies.filter((e) => e.d <= 5).map((e) => `${e.type}@${e.d}:${Math.round(100 * e.hp / e.mhp)}%`), allies: allies.filter((a) => a.d <= 5).map((a) => `${a.type}@${a.d}`), camps: awakeInRange.map((k) => `${k.type}@${k.d}`) };
      const pats = [];
      const add = (name) => { pats.push(name); note(name, bucket, died, ex); };
      add('all');
      if (hpf < 0.35) add('lowhp');
      if (did('recall') && (e4 > 0 || awakeInRange.length)) add('recall_under_threat');
      if (hpf < 0.35 && awakeInRange.length && !retreat && !did('recall')) add('lowhp_stays_in_camp_range');
      if (hpf < 0.35 && did('recall') && awakeInRange.length) add('lowhp_recall_in_camp_range');
      if (x.type === 'HeartOfRuin' && c.cd[0] === 0 && hpf < 0.5 && (e2 > 0 || awakeInRange.length) && !did('cast0')) add('heart_shield_unused');
      if (x.type === 'HeartOfRuin' && c.cd[0] === 0 && hpf < 0.5 && (e2 > 0 || awakeInRange.length) && did('cast0')) add('heart_shield_used');
      if (e4 >= a4 + 1 + 2 && hpf < 0.6 && !retreat && !did('recall')) add('outnumbered_holds');
      if (e4 >= a4 + 1 + 2 && hpf < 0.6 && retreat) add('outnumbered_retreats');
      if (did('submit') && enemies.some((e) => e.d <= 5)) add('tribute_under_threat');
      if (x.pre && e4 > 0) add('fuel_preempted_near_enemy');
      if (!acts.length && e2 > 0) add('idle_enemy_adjacent');
      if (hpf < 0.25 && e4 > 0 && !retreat && !did('recall') && !did('move')) add('critical_hp_no_escape');
      if (c.cd.some((v) => v === 0) && hpf < 0.35 && e2 > 0 && !acts.some((a) => a.startsWith('cast'))) add('lowhp_ready_slot_unused');
      if (bucket === 'heavy' && died) {
        const d = deathRounds.find((dd) => dd > x.r && dd <= x.r + K);
        const s = flagged.get(d) || new Set();
        for (const p of pats) s.add(p);
        flagged.set(d, s);
      }
    }
    if (bucket === 'heavy') {
      for (const d of deathRounds) {
        heavyDeaths++;
        for (const p of flagged.get(d) || []) deathCover[p] = (deathCover[p] || 0) + 1;
      }
    }
  }
}

console.log(`decisions ${decisions}; games ${JSON.stringify(games)}; deaths ${JSON.stringify(deaths)} (window ${K} rounds)`);
const pct = (b) => (b && b.n ? `${String(b.n).padStart(7)} ${(100 * b.die / b.n).toFixed(1).padStart(5)}%` : '      -      ');
console.log(`${'pattern'.padEnd(28)} ${'win n  die%'.padStart(14)} ${'loss n  die%'.padStart(14)} ${'heavy n  die%'.padStart(14)}  heavy deaths preceded`);
for (const [name, p] of Object.entries(P)) {
  console.log(`${name.padEnd(28)} ${pct(p.win)} ${pct(p.loss)} ${pct(p.heavy)}  ${String(deathCover[name] || 0).padStart(4)}/${heavyDeaths}`);
}
if (nExamples) for (const [name, list] of Object.entries(examples)) {
  if (name === 'all' || name === 'lowhp') continue;
  console.log(`\n## ${name}`);
  for (const e of list) console.log('  ' + JSON.stringify(e));
}
if (opt('json')) fs.writeFileSync(opt('json'), JSON.stringify({ P, deathCover, heavyDeaths, examples }, null, 1));
