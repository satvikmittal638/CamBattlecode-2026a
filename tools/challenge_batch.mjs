#!/usr/bin/env node
// Send several challenges: node tools/challenge_batch.mjs <specs.json> <out.txt>
// specs.json: [{ "label": "Nyx", "teamId": "...", "maps": ["00ambush", ...5], "sides": ["a","b",...] }, ...]
import fs from 'node:fs';
import { api } from './bclib.mjs';
const [specFile, outFile] = process.argv.slice(2);
const specs = JSON.parse(fs.readFileSync(specFile, 'utf8'));
const opts = await api('GET', '/challenges');
const byName = Object.fromEntries(opts.maps.map((m) => [m.name, m.id]));
for (const s of specs) {
  const body = { teamId: s.teamId, sides: s.sides || ['a', 'b', 'a', 'b', 'a'] };
  if (s.maps) body.mapIds = s.maps.map((n) => { if (!byName[n]) throw new Error('unknown map ' + n); return byName[n]; });
  let line;
  try { const r = await api('POST', '/challenges', body); line = `${s.label}\t${(s.maps || []).join(',')}\t${body.sides.join(',')}\t${r.groupId}`; }
  catch (e) { line = `${s.label}\t${(s.maps || []).join(',')}\tERROR ${e.message.slice(0, 160)}`; }
  console.log(line); if (outFile) fs.appendFileSync(outFile, line + '\n');
}
