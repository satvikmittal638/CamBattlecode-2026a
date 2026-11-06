// Contact-episode states for rollouts from traj files: first round of each contact episode (an enemy within 6 of one
// of our champions after 8 quiet rounds), focal = our champion in contact with the lowest local HP share.
//   node select_contacts.mjs <trajDir> <prefix> <out.json> [--to 600]
import fs from 'node:fs';
import path from 'node:path';
const [td, prefix, out] = process.argv.slice(2);
const TO = process.argv.includes('--to') ? +process.argv[process.argv.indexOf('--to') + 1] : 600;
const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
const states = [];
for (const f of fs.readdirSync(td).filter((x) => x.startsWith(prefix))) {
  const T = JSON.parse(fs.readFileSync(path.join(td, f), 'utf8'));
  let quiet = 99;
  for (const R of T.rounds) {
    if (R.r < 10 || R.r > TO) continue;
    const ours = R.c.filter((c) => c[0] === 0 && c[3] >= 0), theirs = R.c.filter((c) => c[0] === 1 && c[3] >= 0);
    const contact = ours.map((c) => {
      const en = theirs.filter((e) => cheb([e[3], e[4]], [c[3], c[4]]) <= 6);
      if (!en.length) return null;
      const al = ours.filter((o) => o !== c && cheb([o[3], o[4]], [c[3], c[4]]) <= 4);
      const my = c[6] + al.reduce((s, o) => s + o[6], 0), th = en.reduce((s, e) => s + e[6], 0);
      return { id: c[1], share: my / (my + th), en: en.length, al: al.length };
    }).filter(Boolean);
    if (contact.length && quiet >= 8) {
      const focal = contact.reduce((m, c) => (c.share < m.share ? c : m));
      states.push({ file: path.relative(process.cwd(), T.file), map: T.map, side: T.side, team: T.us, round: R.r, champ: focal.id, share: +focal.share.toFixed(2), en: focal.en, al: focal.al });
    }
    quiet = contact.length ? 0 : quiet + 1;
  }
}
fs.writeFileSync(out, JSON.stringify(states, null, 1));
const b = (lo, hi) => states.filter((s) => s.share >= lo && s.share < hi).length;
console.log(`${states.length} contact episodes; share <.35 ${b(0, 0.35)}, .35-.55 ${b(0.35, 0.55)}, >=.55 ${b(0.55, 2)}`);
