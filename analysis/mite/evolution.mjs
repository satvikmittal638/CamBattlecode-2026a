// How Mite's behaviour changed over the day: sample every Nth match, bucket by hour.
import fs from 'node:fs';
import path from 'node:path';
import { loadMatch, mean } from './lib.mjs';
const dir = process.argv[2]; const every = +(process.argv[3] || 5);
const idx = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8')).map((r) => ({ ...r, path: path.join(dir, 'replays', r.file) }));
idx.sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
const B = {};
for (let i = 0; i < idx.length; i += every) {
  const row = idx[i]; let M; try { M = await loadMatch(row); } catch { continue; }
  const k = row.createdAt.slice(11, 13) + 'h';
  const b = (B[k] ??= { n: 0, win: 0, caps: [], subs: [], gpt: [], rec: [], wards: [], kills: [], deaths: [], rounds: [], draft: {}, prio: [], champAtk: [], emb: {} });
  b.n++; if (M.won) b.win++;
  const ev = M.d.events; const mine = ev.filter((e) => e.actor?.kind === 1 && M.myIds.includes(e.actor.index));
  b.caps.push(ev.filter((e) => e.kind === 'Capture' && e.team === M.me).length);
  const subs = mine.filter((e) => e.kind === 'Submit gems'); b.subs.push(subs.length); subs.forEach((e) => b.gpt.push(e.gemsCarried));
  b.rec.push(mine.filter((e) => e.kind === 'Recall').length); b.wards.push(mine.filter((e) => e.kind === 'Place ward').length);
  b.prio.push(mine.filter((e) => e.kind === 'Set priority').length);
  const atk = mine.filter((e) => e.kind === 'Attack'); b.champAtk.push(atk.filter((e) => e.target?.kind === 'champion').length / Math.max(1, atk.length));
  b.kills.push(M.meta.finalChampions.filter((c) => c.team === M.me).reduce((s, c) => s + c.kills, 0));
  b.deaths.push(ev.filter((e) => e.kind === 'Respawn' && e.actor?.kind === 1 && M.myIds.includes(e.actor.index)).length);
  b.rounds.push(M.meta.finalRound);
  const d = (M.meta.draft[M.me] || []).join(','); b.draft[d] = (b.draft[d] || 0) + 1;
  // first emblem of Varg
  const vid = M.myIds.find((i) => M.typeOf[i] === 'Varg');
  const firstEmb = mine.filter((e) => e.kind === 'Shop' && e.actor.index === vid).flatMap((e) => Object.keys(e.items || {}).filter((x) => x.includes('Emblem')))[0] || 'none';
  b.emb[firstEmb] = (b.emb[firstEmb] || 0) + 1;
}
for (const [k, b] of Object.entries(B)) console.log(k, 'n', b.n, 'win', (b.win / b.n).toFixed(2), 'rounds', mean(b.rounds), 'caps', mean(b.caps), 'subs', mean(b.subs), 'g/t', mean(b.gpt), 'rec', mean(b.rec), 'wards', mean(b.wards), 'prio', mean(b.prio), 'champAtk%', mean(b.champAtk), 'K', mean(b.kills), 'D', mean(b.deaths), JSON.stringify(b.draft), JSON.stringify(b.emb));
