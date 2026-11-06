// Index of decoded games vs Fish and Mite: Codex reference wins (books), v84/v86 live, our v62-family live trials.
//   node build_index.mjs > index.json
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(import.meta.dirname, '../..');
const A = (p) => path.join(ROOT, 'analysis', p);
const out = [];
const books = (dir, set, opp) => {
  for (const f of fs.readdirSync(A(dir + '/books')).filter((f) => f.endsWith('.json'))) {
    const b = JSON.parse(fs.readFileSync(A(dir + '/books/' + f), 'utf8'));
    if (!b.cacheFile || !fs.existsSync(b.cacheFile)) b.cacheFile = A(dir + "/games/" + b.file);
    if (!fs.existsSync(b.cacheFile)) { console.error("missing", b.cacheFile); continue; }
    out.push({ set, opp, file: b.cacheFile, us: b.team, map: b.map, side: b.side, result: b.result, score: b.score, oppScore: b.oppScore, source: b.sourceTeam });
  }
};
const trial = (dir, labels, set, opp) => {
  for (const l of labels) {
    const r = JSON.parse(fs.readFileSync(A(`${dir}/trials/${l}/result.json`), 'utf8'));
    for (const row of r.rows) {
      const file = A(`${dir}/trials/${l}/games/${row.file}`);
      if (!fs.existsSync(file)) { console.error('missing', file); continue; }
      out.push({ set, opp, file, us: row.side === 'a' ? 0 : 1, map: row.map, side: row.side, result: row.result, score: row.score, oppScore: row.oppScore, version: row.version });
    }
  }
};
books('fish_counter_allmaps_2026-10-25', 'fish_ref', 'Fish');
trial('fish_counter_allmaps_2026-10-25', ['atlas09', 'atlas09_rest'], 'fish_v84', 'Fish');
trial('fish_hunt_2026-10-25', ['baseline'], 'fish_v62', 'Fish');
trial('fish_hunt_2026-10-25', ['pack01', 'economy02', 'cohort03', 'sustain04', 'general06'], 'fish_v76_81', 'Fish');
trial('fish_hunt_2026-10-25', ['playbook05'], 'fish_v80', 'Fish');
books('mite_counter_allmaps_2026-10-25', 'mite_ref', 'Mite');
trial('mite_counter_allmaps_2026-10-25', ['mite02', 'mite02_rest'], 'mite_v86', 'Mite');
trial('mite_counter_allmaps_2026-10-25', ['mite01'], 'mite_v85', 'Mite');
console.log(JSON.stringify(out, null, 1));
const c = {}; for (const g of out) c[g.set] = (c[g.set] || 0) + 1; console.error(c);
