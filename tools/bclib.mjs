// Shared platform API helpers (session from <project>/.auth/state.json, auto-refreshed).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.dirname(HERE);
export const BASE = 'https://2026a.battlecode.co.uk';
const STATE = process.env.BC_STATE || path.join(ROOT, '.auth', 'state.json');
const LOGIN = path.join(HERE, 'login.js');

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// fetch with retries on network-level failures (connect timeouts, resets).
async function fetchRetry(url, opts, tries = 6) {
  for (let i = 0; ; i++) {
    try { return await fetch(url, { ...opts, signal: AbortSignal.timeout(opts?.timeoutMs ?? 60000) }); }
    catch (e) { if (i + 1 >= tries) throw e; await sleep(2000 * (i + 1)); }
  }
}

export function cookieHeader() {
  const state = JSON.parse(fs.readFileSync(STATE, 'utf8'));
  const now = Date.now() / 1000;
  return state.cookies
    .filter((c) => '2026a.battlecode.co.uk'.endsWith(c.domain.replace(/^\./, '')))
    .filter((c) => c.expires === -1 || c.expires > now)
    .map((c) => `${c.name}=${c.value}`).join('; ');
}

export function relogin() {
  try {
    const out = execFileSync('node', [LOGIN, '--refresh'], { cwd: HERE, encoding: 'utf8', timeout: 120000 });
    return out.includes('LOGGED_IN');
  } catch { return false; }
}

const headers = (json) => ({ cookie: cookieHeader(), accept: 'application/json', origin: BASE, referer: BASE + '/game/matches', ...(json ? { 'content-type': 'application/json' } : {}) });

export async function api(method, p, body, { retried = false } = {}) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetchRetry(BASE + '/api/v1' + p, {
      method, headers: headers(body !== undefined), body: body !== undefined ? JSON.stringify(body) : undefined, redirect: 'manual',
    });
    // An expired event session shows up as 401/403 or as a redirect to the sign-in flow.
    const authFailed = res.status === 401 || res.status === 403 || (res.status >= 300 && res.status < 400);
    if (authFailed && !retried && relogin()) return api(method, p, body, { retried: true });
    if (res.status === 429 || res.status >= 500) { await sleep(3000 * (attempt + 1)); continue; }
    const text = await res.text();
    let json; try { json = JSON.parse(text); } catch {
      if (!retried && /<html|<!doctype/i.test(text) && relogin()) return api(method, p, body, { retried: true });
      json = { text };
    }
    if (!res.ok) { const err = new Error(`HTTP ${res.status} ${method} ${p}: ${text.slice(0, 400)}`); err.status = res.status; err.body = json; throw err; }
    return json;
  }
  throw new Error(`retries exhausted for ${method} ${p}`);
}

// Replay bundles are generated on demand: GET /matches/<id>/bundle answers either a 303 to
// storage or {status:"pending", retryAfter, pollUrl}; poll pollUrl until it redirects.
export async function fetchBundle(matchId, { timeoutMs = 180000 } = {}) {
  let url = `${BASE}/api/v1/matches/${encodeURIComponent(matchId)}/bundle`;
  const deadline = Date.now() + timeoutMs;
  let relogged = false;
  while (Date.now() < deadline) {
    const res = await fetchRetry(url, { headers: headers(false), redirect: 'manual' });
    const loc = res.headers.get('location');
    let ready = res.status >= 300 && res.status < 400 && loc && !loc.includes('/auth/') ? loc : null;
    let j = null;
    if (!ready && res.status === 200) {
      try { j = await res.json(); } catch {}
      if (j?.status === 'ready' && j.url) ready = j.url; // JSON form: {status:"ready", url}
    }
    if (ready) {
      const r2 = await fetchRetry(ready.startsWith('http') ? ready : BASE + ready);
      if (!r2.ok) throw new Error(`bundle ${matchId}: storage HTTP ${r2.status}`);
      const buf = Buffer.from(await r2.arrayBuffer());
      if (buf[0] !== 0x50 || buf[1] !== 0x4b) throw new Error(`bundle ${matchId}: not a zip`);
      return buf;
    }
    if ((res.status === 401 || res.status === 403 || (loc && loc.includes('/auth/'))) && !relogged) { relogged = true; if (relogin()) continue; }
    if (res.status === 429) { await sleep(20000 + Math.random() * 10000); continue; }
    if (res.status === 200 || res.status === 202 || res.status === 409 || res.status >= 500) {
      if (!j) { j = {}; try { j = await res.json(); } catch {} }
      if (j.pollUrl) url = BASE + j.pollUrl;
      await sleep(1000 * Math.max(1, Number(j.retryAfter) || 2));
      continue;
    }
    throw new Error(`bundle ${matchId}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
  }
  throw new Error(`bundle ${matchId}: timed out`);
}

export async function maps() {
  const o = await api('GET', '/match-groups/options');
  return { byName: Object.fromEntries(o.maps.map((m) => [m.name, m.id])), byId: Object.fromEntries(o.maps.map((m) => [m.id, m.name])) };
}

export async function downloadGroup(groupId, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const { byId } = await maps();
  const g = await api('GET', `/match-groups/${groupId}`);
  fs.writeFileSync(path.join(outDir, `group_${groupId}.json`), JSON.stringify(g, null, 1));
  const files = [];
  for (const m of g.matches) {
    if (m.status !== 'finished') continue;
    const map = byId[m.mapId] || m.mapId;
    const file = path.join(outDir, `${map}_${m.id}.repl26a`);
    try { fs.writeFileSync(file, await fetchBundle(m.id)); } catch (e) { console.error(e.message); continue; }
    files.push({ map, matchId: m.id, file, outcome: m.statistics?.outcome, rounds: m.statistics?.round, gems: m.statistics?.teams?.map((t) => t.submittedGems) });
  }
  const sides = g.group.sides.map((s) => ({ side: s.side, team: s.teamName, teamId: s.teamId, wins: s.wins, submissionId: s.submissionId, version: s.version }));
  return { groupId, status: g.group.status, sides, files };
}
