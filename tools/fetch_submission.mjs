#!/usr/bin/env node
// Download every source file of one of our team's submissions (read-only API).
//   node tools/fetch_submission.mjs <version> <outDir>
import fs from 'node:fs';
import path from 'node:path';
import { api } from './bclib.mjs';
const [ver, outDir] = process.argv.slice(2);
const subs = await api('GET', '/submissions');
const s = subs.submissions.find((x) => x.version === +ver);
if (!s) { console.error('no version', ver); process.exit(2); }
const { files } = await api('GET', `/submissions/${s.id}/files`);
for (const f of files) {
  const r = await api('GET', `/submissions/${s.id}/file?path=${encodeURIComponent(f.path)}`);
  const p = path.join(outDir, f.path); fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, r.text ?? '');
}
fs.writeFileSync(path.join(outDir, 'submission.json'), JSON.stringify(s, null, 1));
console.log(`v${ver}: ${files.length} files -> ${outDir}`);
