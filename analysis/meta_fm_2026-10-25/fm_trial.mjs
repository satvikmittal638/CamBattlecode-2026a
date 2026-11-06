// Live challenge sets against Intercontinental Fish / Mite for the active submission, with a duplicate-safe journal.
//   node fm_trial.mjs <label> <expectedVersion> <plan.json>
// plan: [{ "opp": "fish"|"mite", "maps": [5 platform map names], "sides": [5 x "a"|"b"] }, ...]
// Requires the platform lock held by owner "claude-fm" (node tools/bc.mjs lock claude-fm).
// Writes trials/<label>/{receipts.json, intent_<i>.json, groups/, games/, result.json}. Rerunning resumes.
import fs from 'node:fs';
import path from 'node:path';
import { api, sleep, downloadGroup } from '../../tools/bclib.mjs';

const TEAMS = { fish: '1890540d-1ffc-4847-adbf-d0d08772f268', mite: 'ee83f5e5-bcad-4923-86b4-b79ea6083d2e' };
const US = '6b04505b-d16c-4196-b7c6-53a4688a32ca';
const [label, expected, planFile] = process.argv.slice(2);
const dir = path.join(import.meta.dirname, 'trials', label);
fs.mkdirSync(path.join(dir, 'groups'), { recursive: true });
const plan = JSON.parse(fs.readFileSync(planFile, 'utf8'));
const save = (f, x) => fs.writeFileSync(path.join(dir, f), JSON.stringify(x, null, 1));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const lock = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '../../.platform_lock/owner'), 'utf8'));
if (lock.owner !== 'claude-fm') throw new Error(`platform lock held by ${lock.owner}`);
const receipts = fs.existsSync(path.join(dir, 'receipts.json')) ? JSON.parse(fs.readFileSync(path.join(dir, 'receipts.json'), 'utf8')) : [];

for (let i = 0; i < plan.length; i++) {
  if (receipts.some((r) => r.i === i)) continue;
  const intent = path.join(dir, `intent_${i}.json`);
  if (fs.existsSync(intent) && JSON.parse(fs.readFileSync(intent, 'utf8')).state === 'pending') throw new Error(`unreconciled intent ${i}: check the platform before retrying`);
  const subs = await api('GET', '/submissions');
  if (String(subs.active?.version) !== String(expected)) throw new Error(`active version ${subs.active?.version}, expected ${expected}`);
  let q = await api('GET', '/challenges');
  while (!q.ready || q.quota.used >= q.quota.limit) { log('waiting for quota', q.quota); await sleep(30000); q = await api('GET', '/challenges'); }
  const byName = Object.fromEntries(q.maps.map((m) => [m.name, m.id]));
  const body = { teamId: TEAMS[plan[i].opp], mapIds: plan[i].maps.map((n) => byName[n]), sides: plan[i].sides };
  if (body.mapIds.some((x) => !x)) throw new Error('unknown map in ' + plan[i].maps);
  fs.writeFileSync(intent, JSON.stringify({ at: new Date().toISOString(), body, state: 'pending' }));
  const r = await api('POST', '/challenges', body);
  if (!r.groupId) throw new Error('no group id: ' + JSON.stringify(r));
  fs.writeFileSync(intent, JSON.stringify({ at: new Date().toISOString(), body, state: 'accepted', response: r }));
  receipts.push({ i, opp: plan[i].opp, maps: plan[i].maps, sides: plan[i].sides, groupId: r.groupId, version: subs.active.version, submissionId: subs.active.id });
  save('receipts.json', receipts);
  log('challenge', i, plan[i].opp, r.groupId);
}
// Wait for every group, then download.
for (;;) {
  let done = 0;
  for (const r of receipts) {
    const g = await api('GET', `/match-groups/${r.groupId}`);
    fs.writeFileSync(path.join(dir, 'groups', r.groupId + '.json'), JSON.stringify(g));
    const side = g.group.sides.find((s) => s.teamId === US);
    if (side.submissionId !== r.submissionId) throw new Error('group bound to a different submission ' + r.groupId);
    if (['finished', 'error', 'cancelled'].includes(g.group.status)) done++;
  }
  if (done === receipts.length) break;
  log(`groups finished ${done}/${receipts.length}`);
  await sleep(30000);
}
const rows = [];
for (const r of receipts) {
  const g = JSON.parse(fs.readFileSync(path.join(dir, 'groups', r.groupId + '.json'), 'utf8'));
  const d = await downloadGroup(r.groupId, path.join(dir, 'games'));
  for (const m of g.matches) {
    const s = m.sides.find((x) => x.teamId === US), o = m.sides.find((x) => x.teamId !== US);
    const f = d.files.find((x) => x.matchId === m.id);
    rows.push({ opp: r.opp, matchId: m.id, groupId: r.groupId, map: m.map, side: s.side, result: s.result, score: s.score, oppScore: o.score, myDraft: s.draft, oppDraft: o.draft, rounds: m.rounds, version: s.version, file: f ? path.relative(dir, f.file) : null });
  }
}
const sum = (opp) => { const x = rows.filter((r) => r.opp === opp); return { games: x.length, wins: x.filter((r) => r.result === 'win').length, meanMargin: x.reduce((a, r) => a + r.score - r.oppScore, 0) / Math.max(1, x.length) }; };
save('result.json', { at: new Date().toISOString(), label, version: expected, fish: sum('fish'), mite: sum('mite'), rows });
log('fish', JSON.stringify(sum('fish')), 'mite', JSON.stringify(sum('mite')));
