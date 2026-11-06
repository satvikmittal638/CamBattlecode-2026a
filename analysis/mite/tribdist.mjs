// After a gem gain: next action vs walking distance to the nearest altar and gold.
import { loadRows, loadMatch, inc, getMap } from './lib.mjs';
import { bfs } from './mapinfo.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const rows = loadRows(args[0], { recent: +opt('recent', 60), side: opt('side') });
const altD = {};
const T = {};
for (const row of rows) {
  let M; try { M = await loadMatch(row); } catch { continue; }
  if (!M.map) continue;
  const m = M.map;
  if (!altD[m.name]) { const roots = []; for (const a of m.altars) for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) roots.push([a[0] + dx, a[1] + dy]); altD[m.name] = bfs(m, roots.filter(([x, y]) => x >= 0 && y >= 0 && x < m.W && y < m.H && !m.wall.has(x + ',' + y) && !m.altars.some((a) => a[0] === x && a[1] === y))); }
  for (const id of M.myIds) {
    const myEv = M.d.events.filter((e) => e.actor?.kind === 1 && e.actor.index === id);
    for (let r = 2; r < M.meta.finalRound; r++) {
      const a = M.champAt(r - 1, id), b = M.champAt(r, id);
      if (!a?.alive || !b?.alive || !b.pos || b.gems <= a.gems) continue;
      let nxt = 'none';
      for (let k = r - 6; k < Math.min(M.meta.finalRound, r + 120); k++) {
        if (k <= r) { if (k < r && myEv.some((e) => e.kind === 'Recall' && e.round === k)) { nxt = 'trick'; break; } continue; }
        const c = M.champAt(k, id);
        if (!c?.alive) { nxt = 'died'; break; }
        if (myEv.some((e) => e.kind === 'Submit gems' && e.round === k)) { nxt = 'submit'; break; }
        if (myEv.some((e) => e.kind === 'Recall' && e.round === k)) { nxt = 'recall'; break; }
        const p = M.champAt(k - 1, id); if (p && c.gems > p.gems) { nxt = 'more'; break; }
      }
      const d = altD[m.name].get(b.pos[0] + ',' + b.pos[1]) ?? 99;
      const key = `${M.mapName.padEnd(9)} dAlt${d <= 6 ? '0-6' : d <= 12 ? '7-12' : d <= 20 ? '13-20' : '21+'}`;
      (T[key] ??= {}); inc(T[key], nxt);
    }
  }
}
for (const k of Object.keys(T).sort()) { const n = Object.values(T[k]).reduce((s, x) => s + x, 0); console.log(k.padEnd(22), 'n', String(n).padStart(4), Object.entries(T[k]).sort().map(([a, b]) => `${a}:${(b / n).toFixed(2)}`).join(' ')); }
