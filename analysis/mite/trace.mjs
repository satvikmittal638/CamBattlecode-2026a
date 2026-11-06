// Compact per-champion timeline: state changes and decisions.
//   node analysis/mite/trace.mjs <dir> --skip K --champ Varg [--from r --to r]
import { loadRows, loadMatch, cheb } from './lib.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const rows = loadRows(args[0], { recent: 1, side: opt('side'), map: opt('map'), skip: +opt('skip', 0), opponent: opt('opponent') });
const M = await loadMatch(rows[0]);
const champ = opt('champ', 'Varg'); const from = +opt('from', 0), to = +opt('to', 3000);
const id = M.myIds.find((i) => M.typeOf[i] === champ);
console.log('##', M.mapName, rows[0].opponent, 'won', M.won, 'side', M.me, 'spawn', M.spawn, 'altars', JSON.stringify(M.map?.altars));
let prev = null;
const evs = M.d.events.filter((e) => e.actor?.kind === 1 && e.actor.index === id && !['Move'].includes(e.kind));
const allyEv = M.d.events.filter((e) => e.kind === 'Capture' && e.team === M.me);
for (let r = Math.max(1, from); r <= Math.min(M.meta.finalRound, to); r++) {
  const c = M.champAt(r, id); if (!c) continue;
  const en = (M.snapAt(r)?.champions || []).filter((x) => x.team !== M.me && x.alive && x.pos && c.pos);
  const near = en.filter((x) => cheb(x.pos, c.pos) <= 8).map((x) => `${x.type.slice(0, 3)}${cheb(x.pos, c.pos)}h${Math.round(100 * x.hp / x.maxHp)}`).join(',');
  const es = evs.filter((e) => e.round === r).map((e) => e.kind === 'Attack' ? 'A>' + (e.target ? (e.target.kind === 'camp' ? e.target.type : e.target.type + (e.target.team === M.me ? '(ally)' : '')) : '?') : e.kind === 'Cast ability' ? 'C:' + e.abilityType + (e.target ? '>' + (e.target.type || e.target.kind) : '@' + e.to) : e.kind === 'Set priority' ? 'P' + e.priority : e.kind === 'Submit gems' ? 'SUBMIT' + e.gemsCarried : e.kind === 'Place ward' ? 'W@' + e.to : e.kind);
  const cap = allyEv.some((e) => e.round === r) ? 'CAP' : '';
  const line = `${c.alive ? '' : 'DEAD '}(${c.pos}) h${Math.round(100 * c.hp / c.maxHp)} g${c.gems} $${c.gold}`;
  const allies = M.myIds.filter((i) => i !== id).map((i) => { const a = M.champAt(r, i); return a?.alive && a.pos && c.pos ? M.typeOf[i].slice(0, 3) + cheb(a.pos, c.pos) : ''; }).filter(Boolean).join(',');
  if (es.length || cap || near || !prev || prev.gems !== c.gems || prev.gold !== c.gold || r % 10 === 0) console.log(String(r).padStart(4), line.padEnd(34), (es.join(' ') + ' ' + cap).padEnd(40), near ? 'E[' + near + ']' : '', 'al[' + allies + ']');
  prev = c;
}
