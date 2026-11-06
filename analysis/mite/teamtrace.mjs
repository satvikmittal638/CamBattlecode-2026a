// Team-level compact trace: every --step rounds, each champion's pos/hp/gems and actions since last line.
import { loadRows, loadMatch, cheb } from './lib.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const rows = loadRows(args[0], { recent: 1, side: opt('side'), map: opt('map'), skip: +opt('skip', 0), opponent: opt('opponent'), kind: opt('kind', 'all') });
const M = await loadMatch(rows[0]);
const step = +opt('step', 3), from = +opt('from', 1), to = +opt('to', 120);
const both = args.includes('--both');
console.log('##', M.mapName, rows[0].opponent, rows[0].kind, 'won', M.won, 'me', M.me, 'spawn', M.spawn, 'final', M.meta.submittedGems, 'drafts', JSON.stringify(M.meta.draft));
const ids = both ? [...M.myIds, ...M.enemyIds] : M.myIds;
const code = (e) => e.kind === 'Attack' ? (e.target?.kind === 'champion' ? 'F' : 'a') : e.kind === 'Cast ability' ? 'c' : e.kind === 'Submit gems' ? 'S' : e.kind === 'Recall' ? 'R' : e.kind === 'Shop' ? '$' : e.kind === 'Place ward' ? 'w' : '';
for (let r = from; r <= Math.min(to, M.meta.finalRound); r += step) {
  const parts = [];
  for (const id of ids) {
    const c = M.champAt(r, id); if (!c) continue;
    const acts = [...new Set(M.d.events.filter((e) => e.actor?.kind === 1 && e.actor.index === id && e.round >= r && e.round < r + step).map(code).filter(Boolean))].join('');
    parts.push(`${(M.teamOf[id] === M.me ? '' : '*') + c.type.slice(0, 3)}${c.alive ? '' : '✝'}(${c.pos})${Math.round(100 * c.hp / c.maxHp)}%g${c.gems}${acts ? ' ' + acts : ''}`);
  }
  const caps = M.d.events.filter((e) => e.kind === 'Capture' && e.round >= r && e.round < r + step).map((e) => (e.team === M.me ? 'CAP' : 'eCAP')).join(',');
  console.log(String(r).padStart(4), parts.join(' | '), caps);
}
