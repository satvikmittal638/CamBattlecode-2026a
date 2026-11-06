#!/usr/bin/env node
// Decode a CAMBC replay (.repl26a bundle or inner replay file) into JSON using the
// game engine shipped with the official visualiser (tools/engines/<version>.wasm,
// selected from the replay header).
//
// Usage:
//   node tools/replay_dump.mjs <replay.repl26a> [--out file.json] [--snapshots round|step|none]
//
// Output JSON:
//   meta:      map size, draft picks per team, final round/outcome/submitted gems
//   events:    every non-trivial engine step (move, attack, cast, shop, ward, recall,
//              submit gems, capture, consumable, ...) with round, team, actor, from, to
//   snapshots: champion/camp/group state at the first step of every round (default)
//
// Entity kinds: 1 = champion, 2 = camp. Champion `type` uses CHAMPION_TYPES below.
// Item counts are indexed by ITEM_NAMES. Coordinates are tile (x, y); +y is north.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENGINES = path.join(HERE, 'engines');
const DEFAULT_ENGINE = 'v1_0_0';

export const CHAMPION_TYPES = ['Ryth', 'VesperVale', 'Vendetta', 'Cassi', 'Issac', 'Stellar', 'Prism', 'Marcella', 'Willow', 'Ren', 'Varg', 'Tavi', 'HeartOfRuin'];
export const DRAFT_CHAMPIONS = ['Ryth', 'VesperVale', 'Vendetta', 'CassiAndIssac', 'Stellar', 'Prism', 'Marcella', 'Willow', 'Ren', 'Varg', 'Tavi', 'HeartOfRuin'];
export const ITEM_NAMES = ('Monster Shard of Strength.Monster Emblem of Strength.Monster Shard of Focus.Monster Emblem of Focus.Monster Shard of Health.Monster Emblem of Health.Power Shard of Strength.Power Emblem of Strength.Power Shard of Focus.Power Emblem of Focus.Power Shard of Health.Power Emblem of Health.Durability Shard of Strength.Durability Emblem of Strength.Durability Shard of Focus.Durability Emblem of Focus.Durability Shard of Health.Durability Emblem of Health.Treasure Shard of Strength.Treasure Emblem of Strength.Treasure Shard of Focus.Treasure Emblem of Focus.Treasure Shard of Health.Treasure Emblem of Health.Jungle Shard of Strength.Jungle Emblem of Strength.Jungle Shard of Focus.Jungle Emblem of Focus.Jungle Shard of Health.Jungle Emblem of Health.Home Shard of Strength.Home Emblem of Strength.Home Shard of Focus.Home Emblem of Focus.Home Shard of Health.Home Emblem of Health.Bruiser Shard of Strength.Bruiser Emblem of Strength.Bruiser Shard of Focus.Bruiser Emblem of Focus.Bruiser Shard of Health.Bruiser Emblem of Health').split('.')
  // engine 2.0.0 (SDK 4.0.0): 7 more families appended, ids 42-83
  .concat(['Tribute', 'Capture', 'Prospector', 'Hunter', 'Skirmish', 'Greed', 'Collectors'].flatMap((f) =>
    ['Strength', 'Focus', 'Health'].flatMap((s) => [`${f} Shard of ${s}`, `${f} Emblem of ${s}`])));
export const STEP_KINDS = 'Phase.Respawn.Capture.Tick.Move.Attack.Cast ability.Input.End turn.Set priority..Recall.Submit gems.Shop.Place ward.Consumable.Cancel channel.Sandbox.Gems submitted.Draft champion.Place altar lock.Teleport channel.Teleport complete.Movement blocked.Resign.Sell item.Turn rollover.Bot error'.split('.');
export const PHASES = { 0: 'RoundStart', 1: 'CampRespawns', 4: 'Spells', 7: 'CampCaptures', 9: 'Camps', 10: 'Champions', 11: 'Finished', 12: 'Draft', 13: 'ChampionEndTurn', 14: 'ChampionStartTurn' };
export const CAMP_TYPES = ['Wolf', 'Elk', 'GemCluster', 'GoldCluster', 'Monolith', 'Golem'];
export const ABILITY_TYPES = ['None', 'AttackReset', 'Damage', 'AoeDamage', 'Cc', 'Heal', 'Dash', 'Shield'];
// Steps that carry no decision information; skipped from the event list.
const BORING = new Set(['Phase', 'Tick', 'Input', 'Turn rollover', '']);

const TIMELINE_SNAPSHOT_SIZE = 40152;      // engines 1.0.x (42 item types)
const TIMELINE_SNAPSHOT_SIZE_V2 = 42840;   // engine 2.0.0: 84 item types, +168 bytes per champion record
const SNAPSHOT_SIZES = new Set([TIMELINE_SNAPSHOT_SIZE, TIMELINE_SNAPSHOT_SIZE_V2]);
const FULL_SNAPSHOT_SIZE = 184696;

function makeWasi(getMemory) {
  const dec = new TextDecoder();
  let out = '';
  return {
    wasi_snapshot_preview1: {
      random_get(ptr, len) { const b = new Uint8Array(getMemory().buffer, ptr, len); for (let i = 0; i < len; i++) b[i] = (Math.random() * 256) | 0; return 0; },
      clock_time_get(id, prec, outp) { new DataView(getMemory().buffer).setBigUint64(outp, BigInt(Date.now()) * 1000000n, true); return 0; },
      environ_sizes_get(a, b) { const v = new DataView(getMemory().buffer); v.setUint32(a, 0, true); v.setUint32(b, 0, true); return 0; },
      environ_get() { return 0; },
      args_sizes_get(a, b) { const v = new DataView(getMemory().buffer); v.setUint32(a, 0, true); v.setUint32(b, 0, true); return 0; },
      args_get() { return 0; },
      fd_close(fd) { return fd <= 2 ? 0 : 8; },
      fd_fdstat_get(fd, p) { if (fd > 2) return 8; const v = new DataView(getMemory().buffer); v.setUint8(p, 2); v.setUint16(p + 2, 0, true); v.setBigUint64(p + 8, 0n, true); v.setBigUint64(p + 16, 0n, true); return 0; },
      fd_prestat_get() { return 8; },
      fd_prestat_dir_name() { return 8; },
      fd_read() { return 8; },
      fd_seek() { return 8; },
      fd_write(fd, iovs, n, written) {
        const v = new DataView(getMemory().buffer); let total = 0;
        for (let i = 0; i < n; i++) { const p = v.getUint32(iovs + i * 8, true), l = v.getUint32(iovs + i * 8 + 4, true); out += dec.decode(new Uint8Array(getMemory().buffer, p, l)); total += l; }
        v.setUint32(written, total, true);
        if (out.length > 4096) out = out.slice(-4096);
        return 0;
      },
      proc_exit(code) { throw new Error('wasm proc_exit ' + code); },
    },
  };
}

export class Engine {
  static async create(version = DEFAULT_ENGINE) {
    const e = new Engine();
    const file = path.join(ENGINES, `${version}.wasm`);
    if (!fs.existsSync(file)) throw new Error(`replay needs engine ${version}, not available in tools/engines`);
    const bytes = fs.readFileSync(file);
    const imports = makeWasi(() => e.exp.memory);
    const { instance } = await WebAssembly.instantiate(bytes, imports);
    e.exp = instance.exports;
    e.exp._initialize();
    e.outBuf = e.exp.Engine_Malloc(32);
    e.args = e.exp.Engine_Malloc(128);
    return e;
  }
  get view() { return new DataView(this.exp.memory.buffer); }
  cstr(p) { const m = new Uint8Array(this.exp.memory.buffer); let e = p; while (m[e]) e++; return new TextDecoder().decode(m.subarray(p, e)); }
  check(code) { if (code !== 0) throw new Error(`engine error ${code}: ${this.cstr(this.exp.GetLastErrorMsg())}`); }
  get outHandle() { return this.view.getBigUint64(this.outBuf, true); }
}

export function readReplayBytes(file) {
  const buf = fs.readFileSync(file);
  if (buf[0] === 0x50 && buf[1] === 0x4b) {
    return execFileSync('unzip', ['-p', file, 'replay.repl26a'], { maxBuffer: 1 << 30 });
  }
  return buf;
}

function u32arr(v, off, n) { const a = new Array(n); for (let i = 0; i < n; i++) a[i] = v.getUint32(off + i * 4, true); return a; }

// Port of the visualiser's timeline-snapshot decoder (PanelChrome hr/xr).
export function decodeTimeline(v, t) {
  const U = (o) => v.getUint32(t + o, true), I = (o) => v.getInt32(t + o, true), F = (o) => v.getFloat32(t + o, true);
  const size = U(4);
  if (U(0) !== 1 || !SNAPSHOT_SIZES.has(size)) throw new Error('Unsupported snapshot ABI');
  // Port of the visualiser's timeline decoder (PanelChrome mr): 2.0.0 adds 42 item counts per champion record.
  const v2 = size === TIMELINE_SNAPSHOT_SIZE_V2, ci = v2 ? 168 : 0, ct = v2 ? 2688 : 0, nItems = v2 ? 84 : 42;
  const slot = U(108), kind = U(68), hasSlot = slot !== 0xffffffff && kind !== 19, r = 120;
  const drafts = [[], []];
  for (let e = 0; e < 2; e++) for (let k = 0; k < 5; k++) drafts[e].push(I(r + 12 + e * 20 + k * 4));
  const ent = (o) => ({ kind: U(o), index: U(o + 4) });
  const table = (countOff, dataOff, stride, cap, fn) => { const n = U(countOff); if (n > cap) throw new Error('bad count'); const a = new Array(n); for (let i = 0; i < n; i++) a[i] = fn(dataOff + i * stride); return a; };
  return {
    draftNumRounds: U(r), draftCounts: [U(r + 4), U(r + 8)], drafts,
    round: U(8), turn: U(12), team: U(16), phase: U(24), outcome: U(28),
    submittedGems: [Number(v.getBigUint64(t + 32, true)), Number(v.getBigUint64(t + 40, true))],
    currentChampion: U(60),
    step: { phase: U(64), kind, actor: { kind: U(72), index: U(76) }, from: { x: I(80), y: I(84) }, to: { x: I(88), y: I(92) }, round: U(96), substep: U(104), abilitySlot: hasSlot ? slot : undefined, abilityType: hasSlot ? U(112) : undefined, priority: I(116) },
    champions: table(172, 196, 252 + ci, 16, (n) => ({
      entity: ent(n), team: U(n + 8), type: U(n + 12),
      position: I(n + 16) >= 0 && I(n + 20) >= 0 ? { x: I(n + 16), y: I(n + 20) } : null,
      health: F(n + 24), maxHealth: F(n + 28), alive: !!U(n + 32), gold: U(n + 36), gems: U(n + 40), kills: U(n + 44),
      items: u32arr(v, t + n + 48, nItems), consumables: u32arr(v, t + n + ci + 216, 4),
      stunned: !!U(n + ci + 248),
    })),
    camps: table(176, 4228 + ct, 28, 500, (e) => ({ entity: ent(e), team: U(e + 8), type: U(e + 12), position: { x: I(e + 16), y: I(e + 20) }, health: F(e + 24) })),
    groups: table(180, 18228 + ct, 8, 500, (e) => ({ rewardAvailable: !!U(e), captureTeam: U(e + 4) })),
    wards: table(184, 22228 + ct, 8, 128, (e) => ({ team: U(e), disabled: !!U(e + 4) })),
  };
}

function compactChampion(c) {
  const items = {};
  c.items.forEach((n, i) => { if (n) items[ITEM_NAMES[i]] = n; });
  const cons = {};
  c.consumables.forEach((n, i) => { if (n) cons[i] = n; });
  return {
    id: c.entity.index, team: c.team, type: CHAMPION_TYPES[c.type] ?? c.type,
    pos: c.position ? [c.position.x, c.position.y] : null,
    hp: Math.round(c.health), maxHp: Math.round(c.maxHealth), alive: c.alive,
    gold: c.gold, gems: c.gems, kills: c.kills, items, consumables: cons, stunned: c.stunned || undefined,
  };
}

// Replay header: 8-byte magic, then engine version bytes at 8..10 (e.g. v0_0_3).
export function replayEngineVersion(bytes) {
  if (bytes.length < 14) throw new Error('replay header truncated');
  return `v${bytes[8]}_${bytes[9]}_${bytes[10]}`;
}

// Static map features: grids (Uint8Array W*H) for walls/bushes/holes/altars, altar list,
// spawn rectangles per team (Team B = symmetric image of Team A), symmetry.
export function readMapInfo(eng, game, width, height) {
  eng.check(eng.exp.Game_GetBitboardMetadata(game, eng.outBuf));
  const stride = eng.view.getUint32(eng.outBuf + 16, true);
  const grid = (fn) => {
    eng.check(eng.exp[fn](game, eng.outBuf));
    const ptr = eng.view.getUint32(eng.outBuf, true);
    const v = eng.view, g = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const word = (y >> 3) * stride + (x >> 3), bit = (y & 7) * 8 + (x & 7);
      const byte = v.getUint8(ptr + word * 8 + (bit >> 3));
      if ((byte >> (bit & 7)) & 1) g[y * width + x] = 1;
    }
    return g;
  };
  const walls = grid('Game_GetWallBuffer'), bushes = grid('Game_GetBushBuffer'), holes = grid('Game_GetHoleBuffer'), altarGrid = grid('Game_GetAltarBuffer');
  const altars = [];
  for (let i = 0; i < altarGrid.length; i++) if (altarGrid[i]) altars.push([i % width, Math.floor(i / width)]);
  // The engine rectangle has exclusive maximum coordinates. Query both sides
  // directly rather than reflecting an exclusive endpoint as an inclusive tile.
  const spawnRegion = (team) => {
    eng.check(eng.exp.Game_API_GetSpawnRegion(game, team, eng.outBuf));
    return { minX: eng.view.getInt32(eng.outBuf, true), minY: eng.view.getInt32(eng.outBuf + 4, true),
      maxX: eng.view.getInt32(eng.outBuf + 8, true) - 1, maxY: eng.view.getInt32(eng.outBuf + 12, true) - 1 };
  };
  const a = spawnRegion(0), b = spawnRegion(1);
  eng.check(eng.exp.Game_GetSymmetry(game, eng.outBuf));
  const sym = eng.view.getInt32(eng.outBuf, true);
  return { width, height, symmetry: ['horizontal', 'vertical', 'rotational180'][sym] ?? sym, spawn: [a, b], altars, walls, bushes, holes };
}

export async function dumpReplay(file, { snapshots = 'round', onStep = null, onStart = null, mapInfo: wantMap = false } = {}) {
  const bytes = readReplayBytes(file);
  const engineVersion = replayEngineVersion(bytes);
  const eng = await Engine.create(engineVersion);
  const p = eng.exp.Engine_Malloc(bytes.length);
  new Uint8Array(eng.exp.memory.buffer, p, bytes.length).set(bytes);
  eng.check(eng.exp.Game_FromReplayFileBytes(p, bytes.length, eng.outBuf));
  const game = eng.outHandle;
  eng.exp.Engine_Free(p);
  const snapshotSize = eng.exp.Game_Visualiser_TimelineSnapshotSize();
  if (!SNAPSHOT_SIZES.has(snapshotSize)) throw new Error('timeline snapshot layout changed');
  const snap = eng.exp.Engine_Malloc(snapshotSize);

  // Map metadata.
  eng.check(eng.exp.Game_GetBitboardMetadata(game, eng.outBuf));
  const width = eng.view.getInt32(eng.outBuf, true), height = eng.view.getInt32(eng.outBuf + 4, true);

  const mapInfo = wantMap ? readMapInfo(eng, game, width, height) : null;
  if (onStart) onStart({ width, height, mapInfo, engineVersion, eng, game });

  eng.check(eng.exp.Game_Visualiser_Timeline_GetMain(game, eng.outBuf));
  const main = eng.outHandle;
  eng.check(eng.exp.Game_Visualiser_Timeline_Info(game, main, eng.args, eng.args + 8, eng.args + 16));
  const size = eng.view.getUint32(eng.args, true);
  eng.check(eng.exp.Game_Visualiser_Timeline_Seek(game, main, 0, 0));

  const events = [], snaps = [];
  let lastRound = -1, prevChamps = null, prevCamps = null, st = null;
  const read = () => { eng.check(eng.exp.Game_Visualiser_ReadTimelineState(game, snap)); return decodeTimeline(eng.view, snap); };
  st = read();
  let limit = size;
  const lastPriority = new Map();
  for (let pos = 1; ; pos++) {
    if (pos > limit) {
      eng.check(eng.exp.Game_Visualiser_Timeline_Info(game, main, eng.args, eng.args + 8, eng.args + 16));
      limit = eng.view.getUint32(eng.args, true);
    }
    try { eng.check(eng.exp.Game_Visualiser_Timeline_ReplayNext(game, 1)); } catch (e) { if (pos <= limit) events.push({ pos, error: e.message }); break; }
    st = read();
    const s = st.step, kindName = STEP_KINDS[s.kind] ?? String(s.kind);
    if (snapshots === 'step' || (snapshots === 'round' && st.round !== lastRound)) {
      snaps.push({ pos, round: st.round, gems: st.submittedGems, champions: st.champions.map(compactChampion), camps: st.camps.map((c) => ({ id: c.entity.index, type: CAMP_TYPES[c.type] ?? c.type, pos: [c.position.x, c.position.y], hp: Math.round(c.health) })), groups: st.groups });
      lastRound = st.round;
    }
    let keep = !BORING.has(kindName) && kindName !== 'End turn';
    if (kindName === 'Set priority') {
      const k = s.actor.kind + ':' + s.actor.index;
      keep = lastPriority.get(k) !== s.priority; lastPriority.set(k, s.priority);
    }
    if (keep) {
      const ev = { pos, round: st.round, phase: PHASES[st.phase] ?? st.phase, kind: kindName, team: st.team, actor: s.actor, from: [s.from.x, s.from.y], to: [s.to.x, s.to.y] };
      if (s.abilitySlot !== undefined) { ev.slot = s.abilitySlot; ev.abilityType = ABILITY_TYPES[s.abilityType] ?? s.abilityType; }
      if (kindName === 'Set priority') ev.priority = s.priority;
      if (s.actor.kind === 1) {
        const c = st.champions.find((x) => x.entity.index === s.actor.index);
        if (c) { ev.champ = CHAMPION_TYPES[c.type]; ev.team = c.team; }
        // Shop / sell: record which items changed.
        if ((kindName === 'Shop' || kindName === 'Sell item') && prevChamps) {
          const before = prevChamps.find((x) => x.entity.index === s.actor.index);
          if (before && c) {
            const delta = {};
            c.items.forEach((n, i) => { if (n !== before.items[i]) delta[ITEM_NAMES[i]] = n - before.items[i]; });
            c.consumables.forEach((n, i) => { if (n !== before.consumables[i]) delta['consumable' + i] = n - before.consumables[i]; });
            ev.items = delta; ev.goldAfter = c.gold;
          }
        }
        if (kindName === 'Submit gems' || kindName === 'Gems submitted') { ev.gemsCarried = c?.gems; }
      }
      // Resolve what an attack / targeted cast hit (state before the step, so kills still resolve).
      if ((kindName === 'Attack' || kindName === 'Cast ability') && prevChamps) {
        const [tx, ty] = ev.to;
        const ch = prevChamps.find((x) => x.position && x.position.x === tx && x.position.y === ty);
        if (ch) { ev.target = { kind: 'champion', type: CHAMPION_TYPES[ch.type], team: ch.team, id: ch.entity.index }; }
        else {
          const cp = (prevCamps || []).find((x) => x.position.x === tx && x.position.y === ty);
          if (cp) ev.target = { kind: 'camp', type: CAMP_TYPES[cp.type] ?? cp.type, id: cp.entity.index };
        }
      }
      events.push(ev);
      if (onStep) onStep(st, ev, prevChamps, prevCamps);
    } else if (onStep) onStep(st, null, prevChamps, prevCamps);
    prevChamps = st.champions;
    prevCamps = st.camps;
    if (st.phase === 11) break;
  }
  const meta = {
    file: path.basename(file), engineVersion, width, height, timelineSize: limit,
    draft: st.drafts.map((d, team) => d.slice(0, st.draftCounts[team]).map((x) => DRAFT_CHAMPIONS[x] ?? x)),
    finalRound: st.round, outcome: ['ongoing', 'teamA', 'teamB'][st.outcome] ?? st.outcome, submittedGems: st.submittedGems,
    finalChampions: st.champions.map(compactChampion),
    ...(mapInfo ? { mapInfo } : {}),
  };
  return { meta, events, snapshots: snaps };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith('--') && !args[args.indexOf(a) - 1]?.startsWith('--'));
  const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
  if (!file) { console.error('usage: replay_dump.mjs <replay> [--out f.json] [--snapshots round|step|none]'); process.exit(2); }
  const res = await dumpReplay(file, { snapshots: opt('snapshots', 'round') });
  const out = opt('out');
  const json = JSON.stringify(res);
  if (out) { fs.writeFileSync(out, json); console.error(`wrote ${out}: ${res.events.length} events, ${res.snapshots.length} snapshots, final round ${res.meta.finalRound}, outcome ${res.meta.outcome}`); }
  else process.stdout.write(json + '\n');
}
