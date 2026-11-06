// Download the Fish corpus to the GPU cluster one match group at a time (one zip holds all of a group's replays).
// The platform API allows 30 reads a minute, so this paces itself to --rate requests a minute (default 25). A group's
// bundle is built on first request ("pending" + pollUrl); it is polled again after --repoll seconds. Ready pre-signed
// URLs are shipped in batches to the cluster's receive_groups.py, which downloads and unpacks them.
//   node feed_groups.mjs [--rate 25] [--repoll 40] [--batch 12]
import fs from 'node:fs';
import { spawn, execFileSync } from 'node:child_process';
import { BASE, cookieHeader, relogin, sleep } from '../../tools/bclib.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const HOST = 'anwar@192.168.3.6';
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const plan = JSON.parse(fs.readFileSync(new URL('group_plan.json', import.meta.url), 'utf8'));
const have = new Set(execFileSync('ssh', ['-o', 'BatchMode=yes', HOST, 'cd /media/data_dump/Anwar/fish_bc/replays && find . -name "*.repl26a" | sed "s|.*/||; s|.repl26a||"'], { encoding: 'utf8', maxBuffer: 1 << 28 }).split('\n').filter(Boolean));
const todo = plan.filter((p) => p.matches.some(([id]) => !have.has(id)));
log(`${plan.length} groups, ${have.size} replays on the cluster, ${todo.length} groups to fetch`);

const pending = []; // {p, url, at, tries}
let next = 0, buffer = [], shipping = 0, okG = 0, okM = 0, failG = 0, gaveUp = 0, reqs = 0, limited = 0;
const failed = [];
// A batch whose ssh link breaks (VPN drop) is not lost: groups without a reply are asked for again a minute later.
function ship(entries) {
  shipping++;
  const p = spawn('ssh', ['-o', 'BatchMode=yes', '-o', 'ConnectTimeout=20', '-o', 'ServerAliveInterval=15', HOST, 'python3 /home/anwar/cuda_satvik/projects/fish_bc/receive_groups.py']);
  let out = '';
  p.stdout.on('data', (d) => { out += d; });
  p.stdin.on('error', () => {});
  p.on('error', () => {});
  p.on('close', (code) => {
    const answered = new Set();
    for (const r of out.split('\n').filter(Boolean)) {
      const [st, gid, n] = r.split(' ');
      answered.add(gid);
      if (st === 'ok') { okG++; okM += +n; } else { failG++; failed.push(gid); if (failG < 20) log(r); }
    }
    const lost = entries.filter((e) => !answered.has(e.item.p.gid));
    if (lost.length) {
      log(`ssh batch ended (code ${code}); re-queueing ${lost.length} groups`);
      for (const e of lost) pending.push({ ...e.item, url: `${BASE}/api/v1/match-groups/${e.item.p.gid}/bundle`, tries: 0, at: Date.now() + 60000 });
    }
    shipping--;
  });
  p.stdin.end(entries.map((e) => e.line).join('\n') + '\n');
}
async function ask(url) {
  reqs++;
  const res = await fetch(url, { headers: { cookie: cookieHeader() }, redirect: 'manual', signal: AbortSignal.timeout(30000) });
  const loc = res.headers.get('location');
  if (res.status === 401 || res.status === 403 || (loc && loc.includes('/auth/'))) return { auth: true };
  if (res.status === 429) return { limited: true };
  if (loc) return { ready: loc.startsWith('http') ? loc : BASE + loc };
  const j = await res.json().catch(() => ({}));
  if (j.status === 'ready' && j.url) return { ready: j.url };
  return { poll: j.pollUrl ? BASE + j.pollUrl : null };
}
const gap = 60000 / +opt('rate', 25), repoll = 1000 * +opt('repoll', 40), B = +opt('batch', 12);
let lastShip = Date.now(), lastLog = Date.now(), relogged = 0;
while (next < todo.length || pending.length) {
  const t0 = Date.now();
  // A due re-poll first, otherwise trigger a new group (keep at most 60 in flight).
  let item = null;
  const i = pending.findIndex((x) => x.at <= t0);
  if (i >= 0) item = pending.splice(i, 1)[0];
  else if (next < todo.length && pending.length < 60) { const p = todo[next++]; item = { p, url: `${BASE}/api/v1/match-groups/${p.gid}/bundle`, tries: 0 }; }
  if (item) {
    let r = {};
    try { r = await ask(item.url); } catch (e) { r = {}; }
    if (r.auth) { if (relogged++ < 3 && relogin()) { pending.push({ ...item, at: Date.now() }); continue; } throw new Error('login required'); }
    if (r.limited) { limited++; pending.push({ ...item, at: Date.now() + 5000 }); await sleep(5000); }
    else if (r.ready) buffer.push({ item, line: `${item.p.gid}\t${r.ready}` });
    else if (++item.tries < 30) pending.push({ ...item, url: r.poll || item.url, at: Date.now() + repoll });
    else gaveUp++;
  }
  if (buffer.length >= B || (buffer.length && Date.now() - lastShip > 30000)) { ship(buffer); buffer = []; lastShip = Date.now(); }
  if (Date.now() - lastLog > 120000) { lastLog = Date.now(); log(`triggered ${next}/${todo.length} groups, in flight ${pending.length}, shipping ${shipping}; groups ok ${okG} (${okM} replays), failed ${failG}, gave up ${gaveUp}; ${reqs} requests, ${limited} rate-limited`); }
  await sleep(Math.max(0, gap - (Date.now() - t0)));
}
if (buffer.length) ship(buffer);
while (shipping) await sleep(2000);
fs.writeFileSync(new URL('feed_groups_failed.json', import.meta.url), JSON.stringify(failed));
log(`done: groups ok ${okG} (${okM} replays), failed ${failG}, gave up ${gaveUp}`);
