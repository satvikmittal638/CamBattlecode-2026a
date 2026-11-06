#!/usr/bin/env node
// Platform helper for the CAMBC 2026a event, using the saved (auto-refreshed) web session.
//
//   node tools/bc.mjs quota                         challenge allowance (limit per hour)
//   node tools/bc.mjs ladder [n]                    top n ladder rows
//   node tools/bc.mjs submissions                   our uploaded versions + active one
//   node tools/bc.mjs set-active <submissionId>     make an uploaded version the active bot
//   node tools/bc.mjs wait-build <submissionId>     wait until a submission finishes compiling
//   node tools/bc.mjs challenge <teamId> [5 map names] [5 sides a|b, default a,b,a,b,a]
//                                                   start an unranked 5-map match (active bot)
//   node tools/bc.mjs wait-group <groupId>          poll until a match group finishes
//   node tools/bc.mjs download-group <groupId> <outDir>   replays + statistics for a group
//   node tools/bc.mjs team-groups <teamId> [n]      recent match groups for any team
//   node tools/bc.mjs lock <owner> | unlock <owner> | lock-status
//                                                   exclusive platform lock (submit/challenge cycle)
//
// Every platform action that depends on which bot is active (submit, set-active, challenge,
// waiting for that challenge to finish) MUST be done while holding the lock.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, api, sleep, maps as mapsByName, downloadGroup } from './bclib.mjs';

const LOCK_DIR = path.join(ROOT, '.platform_lock');
const LOCK_STALE_MS = 25 * 60 * 1000;
const out = (x) => console.log(typeof x === 'string' ? x : JSON.stringify(x, null, 1));

const [cmd, ...args] = process.argv.slice(2);
try {
  switch (cmd) {
    case 'quota': { const c = await api('GET', '/challenges'); out({ quota: c.quota, ready: c.ready, requesterRank: c.requesterRank, maxRankGap: c.maxRankGap }); break; }
    case 'ladder': { const l = await api('GET', `/ladder?page=1&pageSize=${Number(args[0] || 25)}&category=all`); out(l.teams.map((t) => ({ rank: t.rank, name: t.name, teamId: t.teamId, rating: Math.round(t.rating), matches: t.matches }))); break; }
    case 'submissions': { const s = await api('GET', '/submissions'); out({ active: s.active, pinned: s.pinned, submissions: s.submissions.map((x) => ({ id: x.id, version: x.version, status: x.status, note: x.note, createdAt: x.createdAt, language: x.language })) }); break; }
    case 'set-active': { out(await api('PUT', '/submissions/active', { submissionId: args[0] })); break; }
    case 'wait-build': {
      const id = args[0];
      for (let i = 0; i < 180; i++) {
        const s = await api('GET', '/submissions');
        const sub = s.submissions.find((x) => x.id === id);
        if (sub && !['queued', 'building', 'pending', 'compiling'].includes(sub.status)) { out({ id, status: sub.status, active: s.active?.id ?? s.active }); break; }
        await sleep(5000);
      }
      break;
    }
    case 'challenge': {
      // challenge <teamId> [5 comma-separated map names] [5 comma-separated sides a|b]
      const opts = await api('GET', '/challenges');
      const byName = Object.fromEntries(opts.maps.map((m) => [m.name, m.id]));
      const body = { teamId: args[0] };
      if (args[1]) {
        const ids = args[1].split(',').map((n) => { if (!byName[n]) throw new Error('unknown map ' + n + ' (pool: ' + Object.keys(byName).join(',') + ')'); return byName[n]; });
        if (ids.length !== 5) throw new Error('exactly five maps required');
        body.mapIds = ids;
      }
      body.sides = args[2] ? args[2].split(',') : ['a', 'b', 'a', 'b', 'a'];
      out(await api('POST', '/challenges', body));
      break;
    }
    case 'wait-group': {
      for (let i = 0; i < 360; i++) {
        const g = await api('GET', `/match-groups/${args[0]}`);
        if (['finished', 'error', 'cancelled'].includes(g.group.status)) {
          out({ status: g.group.status, sides: g.group.sides.map((s) => ({ side: s.side, team: s.teamName, wins: s.wins, submissionId: s.submissionId, version: s.version })), matches: g.matches.map((m) => ({ id: m.id, status: m.status, error: m.errorCode, outcome: m.statistics?.outcome, round: m.statistics?.round, gems: m.statistics?.teams?.map((t) => t.submittedGems) })) });
          break;
        }
        await sleep(10000);
      }
      break;
    }
    case 'download-group': { out(await downloadGroup(args[0], args[1])); break; }
    case 'team-groups': {
      const r = await api('GET', `/match-groups?scope=all&team=${args[0]}`);
      out(r.groups.slice(0, Number(args[1] || 25)).map((g) => ({ id: g.id, kind: g.kind, status: g.status, createdAt: g.createdAt, sides: g.sides.map((s) => `${s.teamName}(${s.side}):${s.wins}`).join(' vs ') })));
      break;
    }
    case 'lock': {
      const owner = args[0] || 'unknown';
      for (;;) {
        try { fs.mkdirSync(LOCK_DIR); fs.writeFileSync(path.join(LOCK_DIR, 'owner'), JSON.stringify({ owner, at: Date.now() })); out(`LOCKED by ${owner}`); break; }
        catch (e) {
          if (e.code !== 'EEXIST') throw e;
          let info = {}; try { info = JSON.parse(fs.readFileSync(path.join(LOCK_DIR, 'owner'), 'utf8')); } catch {}
          if (info.at && Date.now() - info.at > LOCK_STALE_MS) { fs.rmSync(LOCK_DIR, { recursive: true, force: true }); console.error(`removed stale lock of ${info.owner}`); continue; }
          if (info.owner === owner) { fs.writeFileSync(path.join(LOCK_DIR, 'owner'), JSON.stringify({ owner, at: Date.now() })); out(`LOCKED by ${owner} (refreshed)`); break; }
          await sleep(15000);
        }
      }
      break;
    }
    case 'unlock': {
      let info = {}; try { info = JSON.parse(fs.readFileSync(path.join(LOCK_DIR, 'owner'), 'utf8')); } catch {}
      if (info.owner && info.owner !== args[0]) { out(`lock held by ${info.owner}, not ${args[0]}; not removed`); break; }
      fs.rmSync(LOCK_DIR, { recursive: true, force: true }); out('UNLOCKED'); break;
    }
    case 'lock-status': { let info = null; try { info = JSON.parse(fs.readFileSync(path.join(LOCK_DIR, 'owner'), 'utf8')); } catch {} out(info ? { ...info, ageSec: Math.round((Date.now() - info.at) / 1000) } : 'free'); break; }
    default:
      console.error(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 20).join('\n'));
      process.exit(2);
  }
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
