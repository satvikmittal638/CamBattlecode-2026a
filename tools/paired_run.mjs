#!/usr/bin/env node
// Unattended paired platform test for one submission version:
//   node tools/paired_run.mjs <version> <outDir> --specs platform/unranked_v31/specs.json [--compare v33,v36]
// 1. waits until <version> is the active submission (aborts if another version becomes active),
// 2. sends the challenge specs as the rolling quota allows (waits for quota resets),
// 3. waits until every group is finished/errored, 4. downloads replays and writes index.json
//    (tools/collect_challenges.mjs), 5. writes <outDir>/report.txt with paired results against
//    the --compare versions (same opponent/map/side games in platform/unranked_<v>/games).
// Exits when done, so a background runner is notified. Resumable: groups already listed in
// <outDir>/challenges.txt are not resent.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { api, sleep } from './bclib.mjs';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const version = Number(args[0]);
const outDir = path.resolve(args[1]);
const specs = JSON.parse(fs.readFileSync(opt('specs', 'platform/unranked_v31/specs.json'), 'utf8'));
const compare = (opt('compare', '') || '').split(',').filter(Boolean);
fs.mkdirSync(outDir, { recursive: true });
const chFile = path.join(outDir, 'challenges.txt');
const log = (...a) => { const line = `${new Date().toISOString()} ${a.join(' ')}`; console.log(line); fs.appendFileSync(path.join(outDir, 'paired_run.log'), line + '\n'); };

async function activeVersion() { const s = await api('GET', '/submissions'); return s.active?.version; }

// 1) active version
for (let i = 0; ; i++) {
  const v = await activeVersion();
  if (v === version) break;
  if (i > 120) { log(`abort: version ${version} not active (active ${v})`); process.exit(2); }
  await sleep(30000);
}
log(`version ${version} active`);
// 2) send specs within quota
const sent = fs.existsSync(chFile) ? fs.readFileSync(chFile, 'utf8').trim().split('\n').filter(Boolean) : [];
const sentKeys = new Set(sent.filter((l) => /\t[0-9a-f-]{36}$/.test(l)).map((l) => l.split('\t').slice(0, 2).join('\t')));
const opts0 = await api('GET', '/challenges');
const byName = Object.fromEntries(opts0.maps.map((m) => [m.name, m.id]));
for (const s of specs) {
  const key = `${s.label}\t${(s.maps || []).join(',')}`;
  if (sentKeys.has(key)) continue;
  // Fire as soon as a quota slot frees: sleep until the reported reset (+2 s), never longer than
  // 60 s between checks, then send immediately.
  for (let lastLog = 0; ;) {
    const q = await api('GET', '/challenges');
    if (q.quota.used < q.quota.limit) break;
    const untilReset = q.quota.resetsAt ? Date.parse(q.quota.resetsAt) - Date.now() + 2000 : 60000;
    const wait = Math.max(2000, Math.min(untilReset, 60000));
    if (Date.now() - lastLog > 300000) { log(`quota ${q.quota.used}/${q.quota.limit}, next slot at ${q.quota.resetsAt}`); lastLog = Date.now(); }
    await sleep(wait);
  }
  if ((await activeVersion()) !== version) { log('abort: active version changed while sending'); process.exit(3); }
  const body = { teamId: s.teamId, sides: s.sides || ['a', 'b', 'a', 'b', 'a'], mapIds: s.maps.map((n) => byName[n]) };
  try { const r = await api('POST', '/challenges', body); fs.appendFileSync(chFile, `${key}\t${body.sides.join(',')}\t${r.groupId}\n`); log(`sent ${s.label} -> ${r.groupId}`); }
  // No automatic retry: a send that errored after the platform created the group would duplicate it (the user
  // requires an exact challenge count). Failed specs are listed in failed.txt for a checked manual resend.
  catch (e) { log(`send ${s.label} failed: ${e.message.slice(0, 160)}`); fs.appendFileSync(path.join(outDir, 'failed.txt'), `${key}\t${e.message.slice(0, 160)}\n`); await sleep(5000); }
}
// 3) wait for all groups
const groups = fs.readFileSync(chFile, 'utf8').trim().split('\n').map((l) => l.split('\t').pop()).filter((x) => /^[0-9a-f-]{36}$/.test(x));
for (;;) {
  const st = {};
  for (const id of groups) { const d = await api('GET', `/match-groups/${id}`); st[d.group.status] = (st[d.group.status] || 0) + 1; }
  const done = (st.finished || 0) + (st.error || 0) + (st.cancelled || 0);
  log(`groups ${JSON.stringify(st)}`);
  if (done >= groups.length) break;
  await sleep(60000);
}
// 4) collect
const col = spawnSync('node', [path.join(ROOT, 'tools', 'collect_challenges.mjs'), chFile, path.join(outDir, 'games')], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 });
fs.writeFileSync(path.join(outDir, 'collect.txt'), (col.stdout || '') + (col.stderr || ''));
// 5) paired report
const k = (x) => `${x.label}|${x.map}|${x.side}`;
const mine = JSON.parse(fs.readFileSync(path.join(outDir, 'games', 'index.json'), 'utf8'));
const T = (r) => { const v = +r.slice(1); return v <= 60 ? '1-60' : v <= 130 ? '61-130' : v <= 200 ? '131-200' : '201-300'; };
const lines = [`v${version}: ${mine.filter((x) => x.result === 'win').length}/${mine.length} wins (${outDir})`];
const others = {};
for (const c of compare) { const p = path.join(ROOT, 'platform', `unranked_${c}`, 'games', 'index.json'); if (fs.existsSync(p)) others[c] = new Map(JSON.parse(fs.readFileSync(p, 'utf8')).map((x) => [k(x), x])); }
const fmt = (filter) => { const R = mine.filter(filter); const out = [`v${version} ${R.filter((x) => x.result === 'win').length}/${R.length}`]; for (const [c, M] of Object.entries(others)) { const S = R.map((x) => M.get(k(x))).filter(Boolean); out.push(`${c} ${S.filter((x) => x.result === 'win').length}/${S.length}`); } return out.join(' | '); };
lines.push('ALL         ' + fmt(() => true));
lines.push('boss maps   ' + fmt((x) => /contest|boss/.test(x.map)));
for (const t of ['1-60', '61-130', '131-200', '201-300']) lines.push(`tier ${t.padEnd(8)}` + fmt((x) => T(x.label) === t));
for (const [c, M] of Object.entries(others)) { let g = 0, l = 0; for (const x of mine) { const o = M.get(k(x)); if (!o) continue; const a = x.result === 'win', b = o.result === 'win'; if (a && !b) g++; if (!a && b) l++; } lines.push(`v${version} vs ${c}: flips +${g}/-${l}`); }
fs.writeFileSync(path.join(outDir, 'report.txt'), lines.join('\n') + '\n');
log('done'); console.log(lines.join('\n'));
