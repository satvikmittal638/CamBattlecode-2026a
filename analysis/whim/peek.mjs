// Quick look at one replay: print condensed event stream for one side.
// usage: node analysis/whim/peek.mjs <replay> <side a|b> [maxRound] [kinds,comma]
import { dumpReplay } from '../../tools/replay_dump.mjs';
const [file, side = 'a', maxRound = '200', kinds] = process.argv.slice(2);
const d = await dumpReplay(file, { snapshots: 'round' });
const me = side === 'b' ? 1 : 0;
console.log(JSON.stringify(d.meta.draft), d.meta.outcome, d.meta.submittedGems, 'rounds', d.meta.finalRound, d.meta.width + 'x' + d.meta.height);
const ks = kinds ? new Set(kinds.split(',')) : null;
const ids = new Set(d.meta.finalChampions.filter(c => c.team === me).map(c => c.id));
for (const e of d.events) {
  if (e.round > +maxRound) break;
  if (e.actor?.kind === 1 && !ids.has(e.actor.index) && e.kind !== 'Capture') continue;
  if (e.kind === 'Capture' && e.team !== me) continue;
  if (ks && !ks.has(e.kind)) continue;
  if (e.kind === 'Move') continue;
  let s = `r${e.round} ${e.champ ?? ''}#${e.actor?.index} ${e.kind} ${e.from} -> ${e.to}`;
  if (e.abilityType) s += ' ' + e.abilityType;
  if (e.target) s += ' tgt=' + e.target.kind + ':' + e.target.type + (e.target.team !== undefined ? '/t' + e.target.team : '');
  if (e.items) s += ' items=' + JSON.stringify(e.items);
  if (e.gemsCarried != null) s += ' gems=' + e.gemsCarried;
  console.log(s);
}
