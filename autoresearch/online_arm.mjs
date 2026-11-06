#!/usr/bin/env node
// One online arm of the autoresearch screen: activate a submission, play the fixed online plan, verify every match
// used that version, restore the previously active submission.
//   node autoresearch/online_arm.mjs <label> <version> [--plan autoresearch/online_plan.json] [--source <baselineLabel>]
// --source pins each opponent's bot to the one it used in that arm (sourceGroupId), for exact pairing.
// Resumable: receipts in autoresearch/online_runs/<label>/receipts.json; a pending intent stops the run.
import fs from 'node:fs';
import { api, sleep } from '../tools/bclib.mjs';
const [label, versionRaw] = process.argv.slice(2);
const opt = (k, d) => { const i = process.argv.indexOf('--' + k); return i >= 0 ? process.argv[i + 1] : d; };
const version = +versionRaw, planFile = opt('plan', 'autoresearch/online_plan.json'), source = opt('source', null);
const TEAM = '6b04505b-d16c-4196-b7c6-53a4688a32ca', OWNER = 'claude-autoresearch';
const DIR = `autoresearch/online_runs/${label}`; fs.mkdirSync(`${DIR}/groups`, { recursive: true });
const LOCK = '.platform_lock';
const log = (...a) => { const s = new Date().toISOString() + ' ' + a.join(' '); console.log(s); fs.appendFileSync(`${DIR}/run.log`, s + '\n'); };
const save = (n, v) => { fs.writeFileSync(`${DIR}/${n}.tmp`, JSON.stringify(v, null, 1)); fs.renameSync(`${DIR}/${n}.tmp`, `${DIR}/${n}`); };
const plan = JSON.parse(fs.readFileSync(planFile));
const pinned = source ? Object.fromEntries(JSON.parse(fs.readFileSync(`autoresearch/online_runs/${source}/receipts.json`)).map((r) => [r.label, r.groupId])) : {};

function lock() {
  for (;;) {
    try { fs.mkdirSync(LOCK); break; } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      let info = {}; try { info = JSON.parse(fs.readFileSync(`${LOCK}/owner`)); } catch {}
      if (info.owner === OWNER || !info.at || Date.now() - info.at > 25 * 60e3) break;
      throw new Error(`platform lock held by ${info.owner}`);
    }
  }
  fs.writeFileSync(`${LOCK}/owner`, JSON.stringify({ owner: OWNER, at: Date.now() }));
}
const unlock = () => { try { const i = JSON.parse(fs.readFileSync(`${LOCK}/owner`)); if (i.owner === OWNER) fs.rmSync(LOCK, { recursive: true, force: true }); } catch {} };

lock(); const keep = setInterval(lock, 60e3);
try {
  const subs = await api('GET', '/submissions');
  const target = subs.submissions.find((s) => s.version === version);
  if (!target || target.status === 'cancelled' || target.status === 'failed') throw new Error(`no usable submission v${version}`);
  const state = fs.existsSync(`${DIR}/state.json`) ? JSON.parse(fs.readFileSync(`${DIR}/state.json`)) : { previous: subs.active?.id, previousVersion: subs.active?.version };
  save('state.json', state);
  if (subs.active?.id !== target.id) { log(`activating v${version} (was v${subs.active?.version})`); await api('PUT', '/submissions/active', { submissionId: target.id }); }
  for (let i = 0; ; i++) {
    const s = await api('GET', '/submissions');
    if (s.active?.id === target.id) break;
    if (i > 120) throw new Error('activation did not take effect');
    // Take-over (user, 31 Oct): re-assert the selection while another writer switches it back.
    if (i % 6 === 5 && (s.selected?.id ?? s.selected) !== target.id) { log(`still v${s.active?.version} active (selected ${JSON.stringify(s.selected ?? null)}); re-activating v${version}`); await api('PUT', '/submissions/active', { submissionId: target.id }); }
    await sleep(10e3);
  }
  log(`v${version} active`);
  const receipts = fs.existsSync(`${DIR}/receipts.json`) ? JSON.parse(fs.readFileSync(`${DIR}/receipts.json`)) : [];
  const journal = fs.existsSync(`${DIR}/journal.json`) ? JSON.parse(fs.readFileSync(`${DIR}/journal.json`)) : [];
  if (journal.some((j) => j.state === 'pending')) throw new Error('pending intent: reconcile journal.json before resuming');
  const opts = await api('GET', '/challenges');
  const byName = Object.fromEntries(opts.maps.map((m) => [m.name, m.id]));
  for (const s of plan.specs) {
    if (receipts.find((r) => r.label === s.label)) continue;
    for (;;) { const q = (await api('GET', '/challenges')).quota; if (q.used < q.limit) break; log(`quota ${q.used}/${q.limit}, waiting`); await sleep(60e3); }
    const now = await api('GET', '/submissions');
    if (now.active?.id !== target.id) { log(`active switched to v${now.active?.version}; re-activating v${version}`); await api('PUT', '/submissions/active', { submissionId: target.id }); await sleep(5e3); }
    const body = { teamId: s.teamId, sides: s.sides, mapIds: s.maps.map((n) => { if (!byName[n]) throw new Error('map not in pool ' + n); return byName[n]; }) };
    if (source) { if (!pinned[s.label]) throw new Error('no source group for ' + s.label); body.sourceGroupId = pinned[s.label]; }
    const intent = { label: s.label, at: new Date().toISOString(), state: 'pending', body }; journal.push(intent); save('journal.json', journal);
    let r;
    try { r = await api('POST', '/challenges', body); } catch (e) { intent.state = 'error'; intent.error = e.message; save('journal.json', journal); throw e; }
    if (!r.groupId) throw new Error('POST without groupId; reconcile');
    intent.state = 'sent'; intent.groupId = r.groupId; save('journal.json', journal);
    receipts.push({ label: s.label, groupId: r.groupId }); save('receipts.json', receipts);
    log(`sent ${s.label} -> ${r.groupId}`);
  }
  const pending = new Set(receipts.map((r) => r.groupId));
  while (pending.size) {
    for (const id of [...pending]) {
      const d = await api('GET', `/match-groups/${id}`);
      if (['finished', 'error', 'cancelled'].includes(d.group.status)) { fs.writeFileSync(`${DIR}/groups/${id}.json`, JSON.stringify(d)); pending.delete(id); log(`finished ${id} ${d.group.status}`); }
    }
    if (pending.size) await sleep(20e3);
  }
  const games = [], wrong = [];
  for (const r of receipts) {
    const d = JSON.parse(fs.readFileSync(`${DIR}/groups/${r.groupId}.json`));
    const s = plan.specs.find((x) => x.label === r.label);
    d.matches.forEach((m, j) => {
      const me = m.sides.find((x) => x.teamId === TEAM), op = m.sides.find((x) => x.teamId !== TEAM);
      if (me?.version !== version) wrong.push(m.id);
      games.push({ label: r.label, idx: j, map: m.map, side: me?.side, cls: s.cls[s.maps.indexOf(m.map)] ?? null, pool: s.pool,
        result: me?.result, score: me?.score, oppScore: op?.score, oppVersion: op?.version, rounds: m.rounds, status: m.status, matchId: m.id, groupId: r.groupId, botError: me?.botError ?? null });
    });
  }
  save('results.json', { label, version, source, wrongVersion: wrong, games });
  log(`results: ${games.filter((g) => g.result === 'win').length}/${games.length} wins; wrong-version matches ${wrong.length}`);
  if (opt('restore', 'yes') !== 'no' && state.previous && state.previous !== target.id) {
    await api('PUT', '/submissions/active', { submissionId: state.previous });
    log(`restored previous active v${state.previousVersion}`);
  }
} finally { clearInterval(keep); unlock(); }
