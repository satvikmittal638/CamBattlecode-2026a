// Waits (read-only polling every 3 min) until v62 is the active submission again - switched back by whoever activated
// another version; this script never activates anything - then resumes the sender and the collector for the rest of
// the plan. Gives up after 12 h.   node resume_when_v62.mjs
import fs from 'node:fs'; import { spawnSync } from 'node:child_process'; import { get, sleep } from './http.mjs';
const dir = import.meta.dirname, plan = JSON.parse(fs.readFileSync(dir + '/plan.json'));
const log = (...a) => { const s = new Date().toISOString() + ' ' + a.join(' '); console.log(s); fs.appendFileSync(dir + '/run.log', s + '\n'); };
for (let i = 0; i < 240; i++) {
  const a = (await get('/submissions')).active;
  if (a?.id === plan.submissionId) {
    log('v62 active again: resuming sender');
    fs.rmSync(dir + '/sender_error.json', { force: true });
    const s = spawnSync('node', [dir + '/run.mjs'], { stdio: 'inherit' });
    log('sender exit', s.status);
    spawnSync('node', [dir + '/collect.mjs'], { stdio: 'inherit' });
    process.exit(s.status ?? 1);
  }
  if (i % 10 === 0) log('waiting: active is v' + a?.version);
  await sleep(180000);
}
log('gave up waiting for v62');
