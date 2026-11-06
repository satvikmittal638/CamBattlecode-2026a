// Bounded, interleaved platform A/B: one frozen candidate bot vs the control submission.
//   node analysis/v41_live_iteration/live_iter.mjs plan <outDir> <candidateBot> <controlSubmissionId>  (GETs only; writes plan.json once)
//   node analysis/v41_live_iteration/live_iter.mjs run  <outDir>                                         (refuses if state/receipts exist)
// run: owned lease lock (.platform_lock with a random token and a heartbeat; another owner's lock is never removed);
// live checks of the control, lock, quota and team challenge activity; frozen source hashes; `cambc submit` with the
// version taken from the CLI output (full log kept) and a bounded build wait; uploaded source compared to the frozen
// hashes; chunks in ABBA arm order, each activation only from the exact expected active version; single-shot challenge
// POSTs (failure -> reconcile against recent groups, record, stop); every group must finish with 5 finished matches of
// the expected own version on the planned maps and sides, otherwise the run is marked incomplete and stops dispatching.
// finally: restore the control only if the active bot is one this run set and no external change was seen (confirmed by
// polling); release the lock if still ours. Then a time-bounded replay collection. Files in <outDir>: plan.json,
// receipts.jsonl (append-only), state.json, run.log, submit.log, uploaded_src.json, candidate/ and control/ replays.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { api, sleep, BASE, cookieHeader } from '../../tools/bclib.mjs';

const ROOT = '/Users/dmitt/Desktop/CamBattlecode', WS = path.join(ROOT, 'workspace'), ME = '6b04505b-d16c-4196-b7c6-53a4688a32ca';
const LOCK = path.join(ROOT, '.platform_lock'), OWNER_FILE = path.join(LOCK, 'owner');
const MAPS = ['00lanes', '01the_farm', '00swirl', '01starfish', '00fragment'];
const SIDES = [['a', 'b', 'a', 'b', 'a'], ['b', 'a', 'b', 'a', 'b']];  // group 2 = same maps, every side inverted
const FIXED = [':3', 'Intercontinental Fish', 'Bamboo Teahouse'];
const RESERVE = 10, CHUNK_TIMEOUT = 40 * 60000, TERMINAL = ['finished', 'error', 'errored', 'failed', 'cancelled'];
const [cmd, outArg, botArg, controlArg] = process.argv.slice(2);
if (!['plan', 'run'].includes(cmd) || !outArg) { console.log('usage: plan <outDir> <bot> <controlId> | run <outDir>'); process.exit(2); }
const out = path.resolve(outArg); fs.mkdirSync(out, { recursive: true });
const P = (f) => path.join(out, f);
const log = (...a) => { const l = `${new Date().toISOString()} ${a.join(' ')}`; console.log(l); fs.appendFileSync(P('run.log'), l + '\n'); };
const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const srcHashes = (bot) => { const root = path.join(WS, 'bots', bot, 'src'), h = {}; const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((x, y) => x.name.localeCompare(y.name))) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else h[path.relative(root, p)] = sha(fs.readFileSync(p)); } }; walk(root); return h; };
const validate = (plan, ch) => {
  if (!ch.ready) throw new Error('challenges not ready');
  const ids = Object.fromEntries(ch.maps.map((m) => [m.name, m.id]));
  for (const [n, id] of Object.entries(plan.mapIds)) if (!id || ids[n] !== id) throw new Error(`map ${n}: id ${id} not offered (live ${ids[n]})`);
  for (const o of plan.opponents) { const r = ch.opponentRanks?.[o.teamId]; if (r == null) throw new Error(`opponent ${o.name} not challengeable`); if (ch.maxRankGap != null && Math.abs(r - ch.requesterRank) > ch.maxRankGap) throw new Error(`opponent ${o.name} outside rank gap`); }
  for (const c of plan.chunks) for (const g of c.groups) { if (g.maps.length !== 5 || g.sides.length !== 5 || g.sides.some((s) => s !== 'a' && s !== 'b')) throw new Error('bad group ' + g.key); }
};

if (cmd === 'plan') {
  if (fs.existsSync(P('plan.json'))) { console.log('plan.json already exists (frozen); use a new directory'); process.exit(2); }
  if (!botArg || !controlArg) { console.log('plan needs <bot> <controlId>'); process.exit(2); }
  const subs = await api('GET', '/submissions'); const ctl = subs.submissions.find((s) => s.id === controlArg);
  if (!ctl) throw new Error('control submission not found');
  const teams = []; let me = null;
  for (let p = 1; p <= 20; p++) {
    const L = await api('GET', `/ladder?page=${p}&pageSize=50&category=all`);
    teams.push(...L.teams.map((t) => ({ teamId: t.teamId, name: t.name, rank: t.rank, rating: Math.round(t.rating) })));
    me = teams.find((t) => t.teamId === ME); if ((me && FIXED.every((n) => teams.some((t) => t.name === n))) || !L.teams.length || p >= (L.pages ?? 1)) break;  // L.pageCount reads 1; L.pages is the page total
  }
  if (!me) throw new Error('our team not on the ladder');
  // names are not unique (two teams are called ':3'): take the highest-ranked team of each name
  const fixed = FIXED.map((n) => teams.filter((t) => t.name === n).sort((x, y) => x.rank - y.rank).slice(0, 1)); if (fixed.some((f) => f.length !== 1)) throw new Error('fixed opponent missing');
  const near = teams.find((t) => t.rank === me.rank - 3 && t.teamId !== ME && !FIXED.includes(t.name)); if (!near) throw new Error('no team at our rank - 3');
  const opponents = [...fixed.map((f) => f[0]), near].map((t, i) => ({ code: 'ABCD'[i], ...t }));
  if (new Set(opponents.map((o) => o.teamId)).size !== 4 || opponents.some((o) => o.teamId === ME)) throw new Error('opponents not unique');
  if (SIDES.some((s) => s.length !== MAPS.length) || SIDES[0].some((s, i) => SIDES[1][i] === s)) throw new Error('group 2 sides must invert group 1');
  const ch = await api('GET', '/challenges');
  const mapIds = Object.fromEntries(MAPS.map((n) => [n, ch.maps.find((m) => m.name === n)?.id ?? null]));
  const by = Object.fromEntries(opponents.map((o) => [o.code, [0, 1].map((k) => ({ key: `${o.code}${k + 1}`, opp: o.code, teamId: o.teamId, maps: MAPS, sides: SIDES[k] }))]));
  const chunks = [['candidate', 'AB'], ['control', 'AB'], ['control', 'CD'], ['candidate', 'CD']].map(([arm, os]) => ({ arm, groups: [...os].flatMap((c) => by[c]) }));
  const plan = { created: new Date().toISOString(), candidateBot: botArg, candidateSrc: srcHashes(botArg), control: { id: ctl.id, version: ctl.version }, us: me, opponents,
    nearRule: 'ladder rank = ours - 3 (fixed teams excluded)', mapIds, sides: SIDES, chunks, totalGroups: 16, expectedMatches: 80, quotaReserve: RESERVE };
  validate(plan, ch);
  fs.writeFileSync(P('plan.json'), JSON.stringify(plan, null, 1));
  console.log(`plan -> ${P('plan.json')}\n us rank ${me.rank} (${me.rating}); control v${ctl.version} ${ctl.id}; candidate bot ${botArg} (${Object.keys(plan.candidateSrc).length} src files)`);
  console.log(' opponents: ' + opponents.map((o) => `${o.code}=${o.name} r${o.rank} ${o.rating}`).join(', '));
  console.log(` maps ${MAPS.join(',')}; sides ${SIDES.map((s) => s.join('')).join(' / ')}; chunks ${chunks.map((c) => c.arm + ':' + c.groups.map((g) => g.key).join('')).join(' | ')}`);
  process.exit(0);
}

// ---------------- run ----------------
if (fs.existsSync(P('state.json')) || fs.existsSync(P('receipts.jsonl'))) { console.log('state/receipts already exist in ' + out + '; refusing to rerun'); process.exit(2); }
const plan = JSON.parse(fs.readFileSync(P('plan.json'), 'utf8'));
const state = { started: new Date().toISOString(), startedMs: Date.now(), control: plan.control, candidate: null, exp: null, pending: null, external: null, incomplete: null, error: null, chunks: [] };
const save = () => fs.writeFileSync(P('state.json'), JSON.stringify(state, null, 1));
const receipt = (o) => fs.appendFileSync(P('receipts.jsonl'), JSON.stringify({ at: new Date().toISOString(), ...o }) + '\n');
let stopSig = null; for (const s of ['SIGINT', 'SIGTERM']) process.on(s, () => { stopSig = s; log('signal', s, '- stopping at the next check'); });
const token = crypto.randomUUID(); let lockHeld = false, lockLost = false, hb = null;
const readOwner = () => { try { return JSON.parse(fs.readFileSync(OWNER_FILE, 'utf8')); } catch { return null; } };
const assertOwned = () => { if (stopSig) throw new Error('stopped by ' + stopSig); const o = readOwner(); if (lockLost || o?.token !== token) { lockLost = true; throw new Error('lock no longer ours: ' + JSON.stringify(o)); } };
const external = (msg) => { state.external = msg; save(); log('EXTERNAL', msg); return new Error(msg); };
const active = async () => (await api('GET', '/submissions')).active;
const checkActive = async (where) => { const a = await active(); if (a?.id !== state.exp.id) throw external(`${where}: expected active v${state.exp.version}, found v${a?.version} ${a?.id}`); };
const ourGroups = new Set();
const foreignChallenges = async (sinceMs) => { const L = await api('GET', `/match-groups?scope=all&team=${ME}`); return (L.groups || []).filter((g) => g.kind === 'unranked' && g.sides?.[0]?.teamId === ME && !ourGroups.has(g.id) && (Date.parse(g.createdAt) >= sinceMs || !TERMINAL.includes(g.status))); };
const activate = async (target) => {
  const a = await active(); if (a?.id !== state.exp.id) throw external(`before activating v${target.version}: expected active v${state.exp.version}, found v${a?.version}`);
  assertOwned(); state.pending = { from: state.exp, to: target }; save(); receipt({ type: 'activate-request', from: state.exp, to: target });
  await api('PUT', '/submissions/active', { submissionId: target.id });
  for (let i = 0; i < 30; i++) {
    await sleep(10000); const b = await active();
    if (b?.id === target.id) { state.exp = target; state.pending = null; save(); receipt({ type: 'activate-confirmed', to: target }); log(`active = v${target.version}`); return; }
    if (b?.id !== state.pending.from.id) throw external(`during activation of v${target.version}: found v${b?.version}`);
  }
  throw new Error('activation not confirmed in 5 min: v' + target.version);
};
const postOnce = async (body) => {
  const res = await fetch(BASE + '/api/v1/challenges', { method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(60000), body: JSON.stringify(body),
    headers: { cookie: cookieHeader(), accept: 'application/json', 'content-type': 'application/json', origin: BASE, referer: BASE + '/game/matches' } });
  const text = await res.text(); let json = null; try { json = JSON.parse(text); } catch {}
  return { status: res.status, ok: res.ok, json, text: text.slice(0, 400) };
};
const send = async (g, rec) => {
  for (let w = 0; ; w++) {
    assertOwned(); const q = (await api('GET', '/challenges')).quota; if (q.used + 1 <= q.limit - RESERVE) break;
    if (w >= 140) throw new Error('quota wait over 70 min'); if (w % 10 === 0) log(`quota ${q.used}/${q.limit} (reserve ${RESERVE}), waiting`); await sleep(30000);
  }
  await checkActive('before send ' + g.key);
  const f = await foreignChallenges(state.startedMs); if (f.length) throw external('team challenges not sent by this run: ' + f.map((x) => x.id).join(','));
  const body = { teamId: g.teamId, sides: g.sides, mapIds: g.maps.map((m) => plan.mapIds[m]) };
  const t0 = Date.now(); receipt({ type: 'send-intent', key: g.key, arm: rec.arm, body });
  let r = null, err = null; try { r = await postOnce(body); } catch (e) { err = e.message; }
  const gid = r?.ok && /^[0-9a-f-]{36}$/.test(r.json?.groupId || '') ? r.json.groupId : null;
  receipt({ type: gid ? 'send-ok' : 'send-failed', key: g.key, groupId: gid, status: r?.status ?? null, error: err, response: gid ? undefined : r?.text });
  if (gid) { ourGroups.add(gid); rec.groups.push({ key: g.key, opp: g.opp, teamId: g.teamId, maps: g.maps, sides: g.sides, groupId: gid }); save(); return; }
  // rejected or ambiguous: never resend; reconcile against recent groups, record, stop dispatching
  await sleep(15000); const L = await api('GET', `/match-groups?scope=all&team=${ME}`);
  const found = (L.groups || []).filter((x) => x.kind === 'unranked' && x.sides.some((s) => s.teamId === ME) && x.sides.some((s) => s.teamId === g.teamId) && Date.parse(x.createdAt) >= t0 - 60000 && !ourGroups.has(x.id));
  receipt({ type: 'send-reconcile', key: g.key, found: found.map((x) => ({ id: x.id, createdAt: x.createdAt, status: x.status })) });
  if (found.length === 1) { ourGroups.add(found[0].id); rec.groups.push({ key: g.key, opp: g.opp, teamId: g.teamId, maps: g.maps, sides: g.sides, groupId: found[0].id, reconciled: true }); save(); }
  throw new Error(`send ${g.key} failed (status ${r?.status ?? 'none'}${err ? ', ' + err : ''}); reconciled ${found.length} group(s); stopping`);
};
const validateGroup = async (g, arm) => {
  const d = await api('GET', `/match-groups/${g.groupId}`); const probs = [];
  if (d.group.status !== 'finished') probs.push('group ' + d.group.status);
  const ourSide = d.group.sides.find((s) => s.teamId === ME), oppSide = d.group.sides.find((s) => s.teamId !== ME);
  if (oppSide?.teamId !== g.teamId) probs.push('opponent ' + oppSide?.teamId);
  if (ourSide?.submissionId && ourSide.submissionId !== arm.id) probs.push('group submission ' + ourSide.submissionId);
  g.matches = d.matches.map((m) => { const me = m.sides.find((s) => s.teamId === ME), op = m.sides.find((s) => s.teamId !== ME); return { matchId: m.id, map: m.map, side: me?.side, status: m.status, version: me?.version ?? null, result: me?.result, score: me?.score, oppScore: op?.score, rounds: m.rounds, endReason: m.endReason }; });
  if (g.matches.length !== 5) probs.push(g.matches.length + ' matches');
  for (const m of g.matches) { if (m.status !== 'finished') probs.push(`match ${m.matchId} ${m.status}`); if (m.version !== arm.version) probs.push(`match ${m.matchId} own version ${m.version}`); }
  const want = g.maps.map((m, i) => m + '|' + g.sides[i]).sort().join(','), got = g.matches.map((m) => m.map + '|' + m.side).sort().join(',');
  if (want !== got) probs.push(`maps/sides ${got} != planned ${want}`);
  g.status = d.group.status; g.problems = probs; return probs;
};

try {
  try { fs.mkdirSync(LOCK); } catch { throw new Error('lock held: ' + JSON.stringify(readOwner())); }
  fs.writeFileSync(OWNER_FILE, JSON.stringify({ owner: 'live_iter', token, pid: process.pid, at: Date.now() })); lockHeld = true;
  hb = setInterval(() => { const o = readOwner(); if (o?.token === token) { try { fs.writeFileSync(OWNER_FILE + '.tmp', JSON.stringify({ ...o, at: Date.now() })); fs.renameSync(OWNER_FILE + '.tmp', OWNER_FILE); } catch {} } else lockLost = true; }, 4 * 60000);
  receipt({ type: 'lock', token }); log('lock acquired', token);
  // live prechecks
  const s0 = await api('GET', '/submissions');
  if (s0.frozen || s0.submissionPause || s0.compilationPaused || !s0.compilerAvailable) throw new Error('submissions frozen/paused or compiler unavailable');
  if (s0.active?.id !== plan.control.id) throw new Error(`active is v${s0.active?.version} ${s0.active?.id}, not control v${plan.control.version}`);
  state.exp = plan.control; save();
  const ch0 = await api('GET', '/challenges'); validate(plan, ch0);
  if (ch0.quota.used + plan.totalGroups > ch0.quota.limit - RESERVE) log(`note: quota ${ch0.quota.used}/${ch0.quota.limit}; sends will wait for slots`);
  const f0 = await foreignChallenges(Date.now() - 30 * 60000); if (f0.length) throw new Error('team challenge activity in the last 30 min or unfinished: ' + f0.map((g) => g.id + ' ' + g.status + ' ' + g.createdAt).join(', '));
  const nowSrc = srcHashes(plan.candidateBot); if (JSON.stringify(nowSrc) !== JSON.stringify(plan.candidateSrc)) throw new Error('candidate source changed since the plan was frozen');
  receipt({ type: 'prechecks-ok', active: s0.active.id, quota: ch0.quota });
  // submit the frozen candidate
  assertOwned(); const tSub = Date.now(); receipt({ type: 'submit-start', bot: plan.candidateBot });
  const sb = spawnSync(path.join(ROOT, '.venv/bin/cambc'), ['submit', plan.candidateBot], { cwd: WS, encoding: 'utf8', timeout: 10 * 60000 });
  fs.writeFileSync(P('submit.log'), `exit ${sb.status} signal ${sb.signal}\n--- stdout\n${sb.stdout}\n--- stderr\n${sb.stderr}\n`);
  const mv = /Submitted bot version (\d+)\./.exec((sb.stdout || '') + (sb.stderr || ''));
  receipt({ type: 'submit-done', exit: sb.status, signal: sb.signal, version: mv ? +mv[1] : null });
  if (sb.status !== 0 || !mv) throw new Error('submit failed or version not reported; see submit.log');
  let cand = null; for (let i = 0; i < 12 && !cand; i++) { cand = (await api('GET', '/submissions')).submissions.find((s) => s.version === +mv[1]); if (!cand) await sleep(5000); }
  if (!cand) throw new Error(`submitted v${mv[1]} not listed`);
  if (cand.id === plan.control.id || Date.parse(cand.createdAt) < tSub - 120000) throw new Error('candidate identity check failed: ' + JSON.stringify(cand));
  state.candidate = { id: cand.id, version: cand.version, uploadedBy: cand.uploadedBy, createdAt: cand.createdAt, size: cand.size }; save(); receipt({ type: 'candidate', ...state.candidate });
  log(`submitted ${plan.candidateBot} as v${cand.version} ${cand.id}`);
  let bst = null;
  for (let i = 0; i < 80; i++) {
    await sleep(15000); assertOwned(); const s = await api('GET', '/submissions'); bst = s.submissions.find((x) => x.id === cand.id)?.status;
    if (![plan.control.id, cand.id].includes(s.active?.id)) throw external(`during build: active v${s.active?.version}`);
    if (['active', 'inactive'].includes(bst)) break; if (/err|fail/i.test(bst || '')) throw new Error('candidate build ' + bst);
  }
  if (!['active', 'inactive'].includes(bst)) throw new Error('candidate build not ready in 20 min: ' + bst);
  await sleep(20000); const a1 = await active();
  state.exp = a1?.id === cand.id ? state.candidate : a1?.id === plan.control.id ? plan.control : null; save();
  if (!state.exp) throw external(`after build: active v${a1?.version}`);
  log(`candidate build ${bst}; active v${a1.version}`); receipt({ type: 'build-ready', status: bst, active: a1.id });
  // uploaded source must equal the frozen hashes
  const { files } = await api('GET', `/submissions/${cand.id}/files`); const remote = {};
  for (const f of files) { const r = await api('GET', `/submissions/${cand.id}/file?path=${encodeURIComponent(f.path)}`); remote[f.path.replace(/^src\//, '')] = sha(Buffer.from(r.text ?? '', 'utf8')); }
  const diffs = Object.entries(plan.candidateSrc).filter(([k, h]) => remote[k] !== h).map(([k]) => k);
  fs.writeFileSync(P('uploaded_src.json'), JSON.stringify({ paths: files.map((f) => f.path), remote, diffs }, null, 1));
  if (diffs.length) throw new Error('uploaded source differs from the frozen candidate: ' + diffs.join(','));
  log(`uploaded source matches frozen hashes (${Object.keys(plan.candidateSrc).length} files)`);
  // chunks
  for (const [ci, chk] of plan.chunks.entries()) {
    const arm = chk.arm === 'candidate' ? state.candidate : plan.control;
    if (state.exp.id !== arm.id) await activate(arm); else await checkActive(`start of chunk ${ci}`);
    const rec = { chunk: ci, arm: chk.arm, id: arm.id, version: arm.version, groups: [] }; state.chunks.push(rec); save();
    for (const g of chk.groups) { await send(g, rec); log(`chunk ${ci} ${chk.arm} v${arm.version} ${g.key} -> ${rec.groups.at(-1).groupId}`); }
    const t0 = Date.now();
    for (;;) {
      await sleep(30000); assertOwned(); await checkActive(`during chunk ${ci}`);
      const f = await foreignChallenges(state.startedMs); if (f.length) throw external('team challenges not sent by this run: ' + f.map((x) => x.id).join(','));
      const st = {}; for (const g of rec.groups) { g.status = (await api('GET', `/match-groups/${g.groupId}`)).group.status; st[g.status] = (st[g.status] || 0) + 1; }
      save(); log(`chunk ${ci} ${JSON.stringify(st)}`);
      if (rec.groups.every((g) => TERMINAL.includes(g.status))) break;
      if (Date.now() - t0 > CHUNK_TIMEOUT) throw new Error(`chunk ${ci} timeout`);
    }
    await checkActive(`end of chunk ${ci}`);
    for (const g of rec.groups) await validateGroup(g, arm);
    save(); const bad = rec.groups.filter((g) => g.problems.length);
    if (bad.length) { state.incomplete = `chunk ${ci}: ` + bad.map((g) => g.key + ': ' + g.problems.join('; ')).join(' | '); save(); throw new Error(state.incomplete); }
    const ms = rec.groups.flatMap((g) => g.matches); log(`chunk ${ci} ${chk.arm} v${arm.version} valid: ${ms.filter((m) => m.result === 'win').length}/${ms.length} wins`);
  }
  state.finished = new Date().toISOString(); save();
} catch (e) { state.error = e.message; log('ERROR', e.message); process.exitCode = 1; }
finally {
  clearInterval(hb);
  try {
    const stillOwned = lockHeld && !lockLost && readOwner()?.token === token;
    if (state.external) log('no restore: external change -', state.external);
    else if (state.exp && !stillOwned) { state.restoreSkipped = 'lock not held/owned'; log('no restore: the platform lock is no longer ours'); }
    else if (state.exp) {
      const ours = [state.exp?.id, state.candidate?.id, state.pending?.from?.id, state.pending?.to?.id].filter(Boolean);
      const a = await active();
      if (a?.id === plan.control.id) log(`control v${plan.control.version} is active; no restore needed`);
      else if (!ours.includes(a?.id)) log(`no restore: active v${a?.version} ${a?.id} was not set by this run`);
      else {
        receipt({ type: 'restore-request', from: { id: a.id, version: a.version }, to: plan.control });
        await api('PUT', '/submissions/active', { submissionId: plan.control.id });
        let ok = false; for (let i = 0; i < 30 && !ok; i++) { await sleep(10000); ok = (await active())?.id === plan.control.id; }
        state.restored = ok; receipt({ type: ok ? 'restore-confirmed' : 'restore-unconfirmed' }); log(ok ? `restored control v${plan.control.version} (confirmed)` : 'RESTORE NOT CONFIRMED');
      }
    }
  } catch (e) { state.restoreError = e.message; log('restore failed', e.message); }
  if (lockHeld) { const o = readOwner(); if (o?.token === token) { fs.rmSync(LOCK, { recursive: true, force: true }); log('lock released'); } else log('lock not removed: owned by', JSON.stringify(o)); }
  state.ended = new Date().toISOString(); save();
}
// bounded replay collection, after restore and lock release
for (const armName of ['candidate', 'control']) {
  const gs = state.chunks.filter((c) => c.arm === armName).flatMap((c) => c.groups).filter((g) => g.groupId); if (!gs.length) continue;
  const dir = P(armName); fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'challenges.txt'), gs.map((g) => `${g.key}\t${g.maps.join(',')}\t${g.sides.join(',')}\t${g.groupId}`).join('\n') + '\n');
  const c = spawnSync('node', [path.join(ROOT, 'tools/collect_challenges.mjs'), path.join(dir, 'challenges.txt'), path.join(dir, 'games')], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28, timeout: 20 * 60000 });
  fs.writeFileSync(path.join(dir, 'collect.txt'), (c.stdout || '') + (c.stderr || '') + `\nexit ${c.status} signal ${c.signal}\n`); log(`collected ${armName}: exit ${c.status}${c.signal ? ' signal ' + c.signal : ''}`);
  // every validated match must be in the index with our expected version and a replay file on disk
  const version = armName === 'candidate' ? state.candidate?.version : plan.control.version;
  let idx = []; try { idx = JSON.parse(fs.readFileSync(path.join(dir, 'games', 'index.json'), 'utf8')); } catch {}
  const byId = new Map(idx.map((r) => [r.matchId, r])); const missing = [];
  for (const g of gs) for (const m of g.matches || []) { const r = byId.get(m.matchId); if (!r || r.version !== version || !fs.existsSync(path.join(dir, 'games', r.file))) missing.push(m.matchId); }
  const expected = gs.reduce((s, g) => s + (g.matches?.length ?? 0), 0);
  (state.collection ||= {})[armName] = { exit: c.status, signal: c.signal, expected, indexed: idx.length, missing };
  if (c.status !== 0 || missing.length || gs.some((g) => !g.matches)) { state.collection[armName].incomplete = true; process.exitCode = 1; log(`collection ${armName} INCOMPLETE: missing ${missing.length}, groups without validated matches ${gs.filter((g) => !g.matches).length}`); }
  else log(`collection ${armName} complete: ${expected} replays match receipts`);
  save();
}
// paired summary (same opponent, map, side)
const R = {}; for (const c of state.chunks) for (const g of c.groups) for (const m of g.matches || []) (R[`${g.opp}|${m.map}|${m.side}`] ||= {})[c.arm] = m;
let cw = 0, kw = 0, n = 0, gain = 0, lose = 0;
for (const v of Object.values(R)) { if (!v.candidate || !v.control) continue; n++; const a = v.candidate.result === 'win', b = v.control.result === 'win'; cw += a; kw += b; gain += a && !b; lose += !a && b; }
log(`paired games ${n}: candidate ${cw}/${n}, control ${kw}/${n}, candidate gained ${gain} lost ${lose}${state.incomplete || state.error ? ' (RUN INCOMPLETE)' : ''}`);
