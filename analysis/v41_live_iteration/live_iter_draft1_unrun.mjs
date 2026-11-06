// Bounded, interleaved platform A/B for one candidate vs an existing control submission.
//   node analysis/v41_live_iteration/live_iter.mjs plan <outDir>        -> writes <outDir>/plan.json (no platform writes)
//   node analysis/v41_live_iteration/live_iter.mjs run  <outDir> <candidateBotDir> <controlSubmissionId>
// run: non-blocking local lock (.platform_lock, same protocol as tools/bc.mjs); refuses if the lock is held, if the active
// submission is not the control, or if any of our unranked challenge groups is unfinished. Submits the candidate
// (platform activates it), then executes the plan's chunks in order, activating each chunk's arm and waiting for active
// status, sending each group with <=3 attempts (quota reserve 10), polling every 30 s (chunk timeout 40 min), checking the
// active version before every send and during polling (external change -> abort, no reactivation), verifying our version
// on every match, and downloading replays per arm with tools/collect_challenges.mjs. finally: if the last activation was
// ours, restore the control; release the lock. Everything is logged to <outDir>/run.log and <outDir>/state.json.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { api, sleep } from '../../tools/bclib.mjs';
const ROOT = '/Users/dmitt/Desktop/CamBattlecode'; const ME = '6b04505b-d16c-4196-b7c6-53a4688a32ca'; const LOCK = path.join(ROOT, '.platform_lock'); const OWNER = 'live_iter';
const [cmd, outArg, candDir, controlId] = process.argv.slice(2); const out = path.resolve(outArg); fs.mkdirSync(out, { recursive: true });
const log = (...a) => { const l = `${new Date().toISOString()} ${a.join(' ')}`; console.log(l); fs.appendFileSync(path.join(out, 'run.log'), l + '\n'); };
const MAPS1 = ['00lanes', '00swirl', '00collision', '01starfish', '00rushbait_v2'], MAPS2 = ['01yellow_brick_road', '01islands', '01the_farm', '00fragment', '01big_world'];
if (cmd === 'plan') {
  const rows = []; for (let p = 1; p <= 6; p++) { const L = await api('GET', `/ladder?page=${p}&pageSize=50&category=all`); const R = L.rows || L.entries || L.teams || []; if (!R.length) break; R.forEach((x, i) => rows.push({ rank: (p - 1) * 50 + i + 1, name: x.teamName || x.name || x.team?.name, id: x.teamId || x.id || x.team?.id, rating: Math.round(x.rating || 0) })); }
  const me = rows.find((r) => r.id === ME); const fixed = [':3', 'Intercontinental Fish', 'Bamboo Teahouse'].map((n) => rows.find((r) => r.name === n));
  if (fixed.some((x) => !x)) { console.log('missing fixed opponent', fixed); process.exit(2); }
  const near = rows.filter((r) => r.rank === me.rank - 3 && !fixed.includes(r) && r.id !== ME)[0] || rows.filter((r) => r.rank < me.rank && !fixed.includes(r)).at(-1);
  const opps = [...fixed, near].map((t, i) => ({ code: 'ABCD'[i], ...t }));
  const groups = (o) => [{ opp: o.code, teamId: o.id, maps: MAPS1, sides: ['a', 'b', 'a', 'b', 'a'] }, { opp: o.code, teamId: o.id, maps: MAPS2, sides: ['b', 'a', 'b', 'a', 'b'] }];
  const by = Object.fromEntries(opps.map((o) => [o.code, groups(o)]));
  const chunks = [{ arm: 'candidate', groups: [...by.A, ...by.B] }, { arm: 'control', groups: [...by.A, ...by.B] }, { arm: 'control', groups: [...by.C, ...by.D] }, { arm: 'candidate', groups: [...by.C, ...by.D] }];
  const plan = { created: new Date().toISOString(), us: me, opponents: opps, nearRule: 'rank = our rank - 3 (excluding fixed)', maps: [MAPS1, MAPS2], chunks, totalGroups: chunks.reduce((s, c) => s + c.groups.length, 0), quotaReserve: 10 };
  fs.writeFileSync(path.join(out, 'plan.json'), JSON.stringify(plan, null, 1));
  console.log(`plan -> ${path.join(out, 'plan.json')}: us rank ${me.rank} (${me.rating}); opponents ${opps.map((o) => o.code + '=' + o.name + ' r' + o.rank + ' ' + o.rating).join(', ')}; ${plan.totalGroups} groups (${plan.totalGroups * 5} games)`);
  process.exit(0);
}
if (cmd !== 'run') { console.log('usage: plan|run'); process.exit(2); }
const plan = JSON.parse(fs.readFileSync(path.join(out, 'plan.json'), 'utf8')); const state = { started: new Date().toISOString(), chunks: [], abort: null };
const save = () => fs.writeFileSync(path.join(out, 'state.json'), JSON.stringify(state, null, 1));
let lockHeld = false, lastActivationOurs = false, controlVersion = null;
const active = async () => (await api('GET', '/submissions')).active;
const activate = async (subId, version) => { await api('PUT', '/submissions/active', { submissionId: subId }); lastActivationOurs = true; for (let i = 0; i < 40; i++) { const a = await active(); if (a?.version === version && a?.status === 'active') { log(`active = v${version}`); return; } await sleep(15000); } throw new Error('activation timeout v' + version); };
try {
  try { fs.mkdirSync(LOCK); fs.writeFileSync(path.join(LOCK, 'owner'), JSON.stringify({ owner: OWNER, at: Date.now() })); lockHeld = true; } catch (e) { const info = fs.existsSync(path.join(LOCK, 'owner')) ? fs.readFileSync(path.join(LOCK, 'owner'), 'utf8') : '?'; throw new Error('lock held: ' + info); }
  log('lock acquired');
  const subs = await api('GET', '/submissions'); const ctl = subs.submissions.find((s) => s.id === controlId); if (!ctl) throw new Error('control submission not found'); controlVersion = ctl.version;
  if (subs.active?.id !== controlId) throw new Error(`active is v${subs.active?.version}, not control v${ctl.version}`);
  const recent = await api('GET', `/match-groups?scope=all&team=${ME}`); const pending = (recent.groups || []).filter((g) => g.kind === 'unranked' && g.sides[0].teamId === ME && !['finished', 'error', 'cancelled'].includes(g.status));
  if (pending.length) throw new Error('unfinished challenge groups of ours exist: ' + pending.map((g) => g.id).join(','));
  // submit candidate (platform activates it after build)
  const before = new Set(subs.submissions.map((s) => s.version));
  const sb = spawnSync(path.join(ROOT, '.venv/bin/cambc'), ['submit', path.basename(candDir)], { cwd: path.join(ROOT, 'workspace'), encoding: 'utf8' }); log('submit:', (sb.stdout + sb.stderr).trim().split('\n').pop()); if (sb.status) throw new Error('submit failed');
  lastActivationOurs = true;
  let cand = null; for (let i = 0; i < 40 && !cand; i++) { const s2 = await api('GET', '/submissions'); cand = s2.submissions.find((s) => !before.has(s.version)); if (!cand) await sleep(5000); }
  if (!cand) throw new Error('new submission not found'); state.candidate = { id: cand.id, version: cand.version }; state.control = { id: ctl.id, version: ctl.version }; save(); log(`candidate submitted v${cand.version} ${cand.id}`);
  for (let i = 0; i < 80; i++) { const s3 = await api('GET', '/submissions'); const c = s3.submissions.find((s) => s.id === cand.id); if (c.status === 'active' || c.status === 'inactive') { log('candidate build status', c.status); if (c.status === 'error') throw new Error('build error'); break; } if (c.status === 'error') throw new Error('candidate build error'); await sleep(15000); }
  const arms = { candidate: state.candidate, control: state.control };
  for (const [ci, ch] of plan.chunks.entries()) {
    const arm = arms[ch.arm]; const rec = { chunk: ci, arm: ch.arm, version: arm.version, groups: [] }; state.chunks.push(rec); save();
    const a0 = await active(); if (a0?.version !== arm.version) await activate(arm.id, arm.version);
    for (const g of ch.groups) {
      for (let w = 0; ; w++) { const q = (await api('GET', '/challenges')).quota; if (q.used + 1 <= q.limit - plan.quotaReserve) break; if (w > 50) throw new Error('quota wait exceeded'); log(`quota ${q.used}/${q.limit} (reserve ${plan.quotaReserve}), waiting`); await sleep(30000); }
      const a1 = await active(); if (a1?.version !== arm.version) { state.abort = `external active change before send: v${a1?.version}`; lastActivationOurs = false; throw new Error(state.abort); }
      const opts = await api('GET', '/challenges'); const byName = Object.fromEntries(opts.maps.map((m) => [m.name, m.id])); let gid = null;
      for (let t = 0; t < 3 && !gid; t++) { try { const r = await api('POST', '/challenges', { teamId: g.teamId, sides: g.sides, mapIds: g.maps.map((m) => byName[m]) }); gid = r.groupId; } catch (e) { log(`send ${g.opp} attempt ${t + 1} failed: ${e.message.slice(0, 120)}`); await sleep(20000); } }
      rec.groups.push({ opp: g.opp, maps: g.maps, sides: g.sides, groupId: gid }); save(); log(`chunk ${ci} ${ch.arm} v${arm.version} ${g.opp} -> ${gid}`);
    }
    const t0 = Date.now();
    for (;;) { const st = {}; for (const g of rec.groups.filter((x) => x.groupId)) { const d = await api('GET', `/match-groups/${g.groupId}`); st[d.group.status] = (st[d.group.status] || 0) + 1; g.status = d.group.status; g.matchVersions = d.matches.map((m) => m.sides.find((s) => s.teamId === ME)?.version ?? null); }
      const a2 = await active(); if (a2?.version !== arm.version) { state.abort = `external active change during chunk ${ci}: v${a2?.version}`; lastActivationOurs = false; save(); throw new Error(state.abort); }
      const done = rec.groups.filter((x) => x.groupId).every((g) => ['finished', 'error', 'cancelled'].includes(g.status)); log(`chunk ${ci} status ${JSON.stringify(st)}`); save();
      if (done) break; if (Date.now() - t0 > 40 * 60000) throw new Error('chunk timeout'); await sleep(30000); }
    rec.versionMismatches = rec.groups.flatMap((g) => (g.matchVersions || []).filter((v) => v !== arm.version)).length; save();
    const dir = path.join(out, ch.arm); fs.mkdirSync(dir, { recursive: true }); fs.appendFileSync(path.join(dir, 'challenges.txt'), rec.groups.filter((g) => g.groupId).map((g) => `${g.opp}${g.maps[0] === plan.maps[0][0] ? 1 : 2}\t${g.maps.join(',')}\t${g.sides.join(',')}\t${g.groupId}`).join('\n') + '\n');
    log(`chunk ${ci} done, version mismatches ${rec.versionMismatches}`);
  }
  for (const armName of ['candidate', 'control']) { const dir = path.join(out, armName); const c = spawnSync('node', [path.join(ROOT, 'tools/collect_challenges.mjs'), path.join(dir, 'challenges.txt'), path.join(dir, 'games')], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 }); fs.writeFileSync(path.join(dir, 'collect.txt'), (c.stdout || '') + (c.stderr || '')); log(`collected ${armName}: exit ${c.status}`); }
  state.finished = new Date().toISOString(); save();
} catch (e) { log('ERROR', e.message); state.error = e.message; save(); process.exitCode = 1; }
finally {
  try { if (lastActivationOurs && controlVersion !== null) { const a = await active(); if (a?.version !== controlVersion) { const subs = await api('GET', '/submissions'); const ctl = subs.submissions.find((s) => s.version === controlVersion); await api('PUT', '/submissions/active', { submissionId: ctl.id }); log(`restored control v${controlVersion} (activation requested)`); } } else if (!lastActivationOurs) log('no restore: last activation change was not ours'); } catch (e) { log('restore failed', e.message); }
  if (lockHeld) { fs.rmSync(LOCK, { recursive: true, force: true }); log('lock released'); } save();
}
