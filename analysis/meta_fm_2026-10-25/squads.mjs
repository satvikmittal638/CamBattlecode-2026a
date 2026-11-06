// Opening squad structure from traj files: at rounds R, connected components of alive champions (link = Chebyshev <= 3)
// on each side; distribution of sorted squad-size patterns. Also: first round on own spawn after leaving (shopping trip),
// first round any champion stands in the middle band, captures by round in own/mid/enemy zone.
//   node squads.mjs <trajDir> <setPrefix>
import fs from 'node:fs';
import path from 'node:path';
const [td, prefix] = process.argv.slice(2);
const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
const rd = (a, p) => Math.max(Math.max(a.minX - p[0], 0, p[0] - a.maxX), Math.max(a.minY - p[1], 0, p[1] - a.maxY));
const R = [15, 30, 45, 60, 80, 100, 130];
const pat = Object.fromEntries(R.map((r) => [r, {}]));
let n = 0; const shopTrip = [], midFirst = [], midCapFirst = [], capsByR = { 60: 0, 100: 0, 150: 0 };
for (const f of fs.readdirSync(td).filter((x) => x.startsWith(prefix + '__'))) {
  const T = JSON.parse(fs.readFileSync(path.join(td, f), 'utf8')); n++;
  const sp = T.info.spawn;
  for (const r of R) {
    const Rr = T.rounds.find((x) => x.r === r); if (!Rr) continue;
    const ours = Rr.c.filter((c) => c[0] === 0 && c[3] >= 0).map((c) => [c[3], c[4]]);
    const seen = new Set(); const sizes = [];
    for (let i = 0; i < ours.length; i++) { if (seen.has(i)) continue; let q = [i], s = 0; seen.add(i); while (q.length) { const j = q.pop(); s++; for (let k = 0; k < ours.length; k++) if (!seen.has(k) && cheb(ours[j], ours[k]) <= 3) { seen.add(k); q.push(k); } } sizes.push(s); }
    const key = sizes.sort((a, b) => b - a).join('+') + ` of ${T.rounds.find((x) => x.r === r).c.filter((c) => c[0] === 0).length}`;
    pat[r][key] = (pat[r][key] || 0) + 1;
  }
  // first return to own spawn after round 10 (per champion, min over team)
  let back = 999;
  const ids = [...new Set(T.rounds.flatMap((x) => x.c.filter((c) => c[0] === 0).map((c) => c[1])))];
  for (const id of ids) { let left = false; for (const Rr of T.rounds) { if (Rr.r > 300) break; const c = Rr.c.find((x) => x[1] === id); if (!c || c[3] < 0) continue; const d = rd(sp[0], [c[3], c[4]]); if (d > 2) left = true; else if (left && d === 0) { back = Math.min(back, Rr.r); break; } } }
  shopTrip.push(back);
  let mf = 999; for (const Rr of T.rounds) { if (Rr.r > 400) break; if (Rr.c.some((c) => c[0] === 0 && c[3] >= 0 && Math.abs(rd(sp[0], [c[3], c[4]]) - rd(sp[1], [c[3], c[4]])) <= 2)) { mf = Rr.r; break; } } midFirst.push(mf);
  const mc = T.caps.find((c) => c[1] === 0 && Math.abs(rd(sp[0], [c[2], c[3]]) - rd(sp[1], [c[2], c[3]])) <= 2); midCapFirst.push(mc ? mc[0] : 999);
  for (const k of [60, 100, 150]) capsByR[k] += T.caps.filter((c) => c[1] === 0 && c[0] <= k).length;
}
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
console.log(`${prefix}: ${n} games | first return to spawn (median) r${med(shopTrip)} | first champion in middle band r${med(midFirst)} | first middle gem capture r${med(midCapFirst)} | gem captures by r60/100/150: ${(capsByR[60] / n).toFixed(1)}/${(capsByR[100] / n).toFixed(1)}/${(capsByR[150] / n).toFixed(1)}`);
for (const r of R) console.log(`  r${r}: ` + Object.entries(pat[r]).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => `${k} ${(100 * v / n).toFixed(0)}%`).join(', '));
