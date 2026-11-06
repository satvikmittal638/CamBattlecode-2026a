// Recall decision details (uses deep.mjs cache + capture records).
import fs from 'node:fs';
import { listRows } from './lib.mjs';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const rows = listRows(args[0], { recent: +opt('recent', 30), side: opt('side'), teamName: opt('team', 'Agentic Loop Builders') });
const inc = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };
const cats = {}; const tot = { n: 0 }; const onCapHp = {}, onCapGold = {};
const ex = [];
for (const r of rows) {
  const cf = `analysis/shink/cache/${r.file.replace('.repl26a', '')}_${r.me}.json`;
  if (!fs.existsSync(cf)) continue;
  const m = JSON.parse(fs.readFileSync(cf, 'utf8'));
  for (const rc of m.recalls) {
    tot.n++;
    // capture completing within 6 rounds after recall by same champ
    const cap = m.captures.find((c) => c.champ === rc.champ && c.round > rc.round && c.round <= rc.round + 6);
    const GOLD = { Wolf: 90, Elk: 160, Gem: 0, Gold: 35, Monolith: 300 };
    const capGold = cap ? cap.label.split('+').reduce((s2, t) => { const mm = t.match(/(\d+)(\w+)/); return s2 + (mm ? +mm[1] * (GOLD[mm[2]] || 0) : 0); }, 0) / (cap.share || 1) : 0;
    const goldAfter = rc.gold + capGold;
    if (rc.onCapTile) inc(onCapHp, Math.floor(rc.hpFrac * 10)), inc(onCapGold, Math.floor(goldAfter / 50) * 50);
    const hp = rc.hpFrac;
    const k = `${hp < 0.5 ? 'hp<50' : 'hp>=50'} ${rc.onCapTile ? 'onCap' : 'offCap'} ${goldAfter >= 150 ? 'g>=150' : goldAfter >= 30 ? 'g30-149' : 'g<30'}`;
    inc(cats, k);
    if (hp >= 0.5 && goldAfter < 30 && ex.length < 25) ex.push(`${r.map} ${rc.champ} r${rc.round} hp${hp.toFixed(2)} gold${rc.gold} cap+${cap?.gold ?? '-'} gems${rc.gems} onCap${rc.onCapTile} dSpawn${rc.distSpawn?.toFixed(0)} arrived${rc.arrived}`);
  }
}
console.log('recalls', tot.n);
for (const [k, v] of Object.entries(cats).sort((a, b) => b[1] - a[1])) console.log('  ', k.padEnd(28), v, (v / tot.n).toFixed(2));
console.log(ex.join('\n'));
console.log('onCap hp', JSON.stringify(onCapHp), 'onCap goldAfter', JSON.stringify(onCapGold));
