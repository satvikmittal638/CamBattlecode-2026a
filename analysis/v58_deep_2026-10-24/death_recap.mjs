// Death recaps for one side of platform replays: for every death of that side, the last WINDOW rounds before it -
// HP at each of the victim's turn starts, every HP loss attributed to the step's actor (champion type/ability or
// camp), stuns applied, the victim's own actions, ability slots that were ready (cooldown 0, read through the
// engine's bot API from the victim's own perspective) but not used, and nearby allies/enemies.
//   node death_recap.mjs <index.json> [--filter heavy|loss|all] [--window 5] [--out deaths.jsonl] [--print N]
import fs from 'node:fs';
import path from 'node:path';
import { dumpReplay, CHAMPION_TYPES, CAMP_TYPES, STEP_KINDS, ABILITY_TYPES } from '../../tools/replay_dump.mjs';
const args = process.argv.slice(2); const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const idxFile = args[0]; const W = +opt('window', 5); const filter = opt('filter', 'heavy');
const special = /contest|boss_battle/;
let idx = JSON.parse(fs.readFileSync(idxFile, 'utf8'));
idx = idx.filter((g) => filter === 'all' || (g.result !== 'win' && (filter === 'loss' || (!special.test(g.map) && g.oppScore - g.score >= 500))));
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
const rectDist = (r, p) => Math.max(Math.max(r.minX - p.x, 0, p.x - r.maxX), Math.max(r.minY - p.y, 0, p.y - r.maxY));
const out = []; let games = 0;
for (const g of idx) {
  const us = g.side === 'a' ? 0 : 1; games++;
  let eng, game, buf, persp, spawn;
  const hist = new Map(); // champion id -> [{r, hp, mhp, pos, cd:[..], gems, acts:[], dmg:[], stun:[] , near:{al,en}}]
  const turnRec = (id, r) => { const h = hist.get(id) || []; let t = h.find((x) => x.r === r); if (!t) { t = { r, acts: [], dmg: [], stun: [] }; h.push(t); while (h.length && h[0].r < r - W - 1) h.shift(); hist.set(id, h); } return t; };
  await dumpReplay(path.join(path.dirname(idxFile), g.file), { snapshots: 'none', mapInfo: true,
    onStart(s) { eng = s.eng; game = s.game; buf = eng.exp.Engine_Malloc(64); persp = eng.exp.Engine_Malloc(16); spawn = s.mapInfo.spawn[us]; },
    onStep(st, ev, prev) {
      const s = st.step; const kind = STEP_KINDS[s.kind];
      if (s.kind === 3 && s.phase === 14 && st.phase === 10) { // turn start of currentChampion
        const c = st.champions.find((x) => x.entity.index === st.currentChampion);
        if (c && c.team === us && c.alive && c.position) {
          const t = turnRec(c.entity.index, st.round); t.hp = Math.round(c.health); t.mhp = Math.round(c.maxHealth); t.pos = c.position; t.gems = c.gems;
          eng.view.setUint32(persp, us, true); eng.view.setUint32(persp + 4, c.entity.index, true);
          t.cd = [0, 1].map((k) => (eng.exp.Game_API_Champion_GetCooldown(game, persp, c.entity.index, k, buf) === 0 ? eng.view.getInt32(buf, true) : null));
          t.al = st.champions.filter((o) => o.team === us && o !== c && o.alive && o.position && cheb(o.position, c.position) <= 6).map((o) => CHAMPION_TYPES[o.type] + ':' + Math.round(100 * o.health / o.maxHealth));
          t.en = st.champions.filter((o) => o.team !== us && o.alive && o.position && cheb(o.position, c.position) <= 6).map((o) => CHAMPION_TYPES[o.type] + ':' + Math.round(100 * o.health / o.maxHealth));
          t.home = rectDist(spawn, c.position);
        }
      }
      if (!prev) return;
      const actor = s.actor; let src = null;
      if (actor.kind === 1) { const a = prev.find((x) => x.entity.index === actor.index); src = a ? (a.team === us ? 'ally ' : '') + CHAMPION_TYPES[a.type] + (kind === 'Cast ability' ? '/' + (ABILITY_TYPES[s.abilityType] ?? 'spell') : kind === 'Attack' ? '/basic' : '/' + kind) : 'champion?'; }
      else if (actor.kind === 2) { const cp = st.camps.find((x) => x.entity.index === actor.index); src = 'camp ' + (cp ? CAMP_TYPES[cp.type] : '?'); }
      else src = kind;
      for (const c of st.champions) {
        if (c.team !== us) continue; const b = prev.find((x) => x.entity.index === c.entity.index); if (!b) continue;
        if (b.alive && b.health - c.health > 0.5) turnRec(c.entity.index, st.round).dmg.push({ src, amt: Math.round(b.health - c.health) });
        if (!b.stunned && c.stunned) turnRec(c.entity.index, st.round).stun.push(src);
        if (b.alive && !c.alive) {
          const h = (hist.get(c.entity.index) || []).filter((x) => x.r >= st.round - W);
          const turns = h.filter((x) => x.hp != null);
          const dmg = h.flatMap((x) => x.dmg.map((d) => ({ r: x.r, ...d })));
          const unused = turns.map((x) => ({ r: x.r, ready: (x.cd || []).map((v, k) => (v === 0 ? k : -1)).filter((k) => k >= 0), cast: x.acts.filter((a) => a.k === 'cast').map((a) => a.slot) })).map((x) => ({ r: x.r, unusedSlots: x.ready.filter((k) => !x.cast.includes(k)) }));
          out.push({ map: g.map, label: g.label || g.opponent, opp: g.opponent, score: `${g.score}-${g.oppScore}`, round: st.round, victim: CHAMPION_TYPES[c.type], gemsLost: b.gems,
            hpTrack: turns.map((x) => `${x.r}:${x.hp}/${x.mhp}`).join(' '), firstNear: turns[0] ? { al: turns[0].al, en: turns[0].en, home: turns[0].home } : null,
            dmg, stuns: h.flatMap((x) => x.stun.map((s2) => ({ r: x.r, s: s2 }))), acts: h.flatMap((x) => x.acts.map((a) => ({ r: x.r, ...a }))), unused });
        }
      }
      if (ev && actor.kind === 1) { const a = prev.find((x) => x.entity.index === actor.index); if (a && a.team === us) {
        const rec = turnRec(actor.index, st.round);
        if (ev.kind === 'Move') rec.acts.push({ k: 'move', to: ev.to.join(',') });
        else if (ev.kind === 'Attack') rec.acts.push({ k: 'attack', tgt: ev.target ? (ev.target.kind === 'champion' ? CHAMPION_TYPES.indexOf(ev.target.type) >= 0 ? ev.target.type : ev.target.type : ev.target.type) : '?' });
        else if (ev.kind === 'Cast ability') rec.acts.push({ k: 'cast', slot: ev.slot, ab: ev.abilityType, tgt: ev.target?.type });
        else if (['Recall', 'Submit gems', 'Cancel channel', 'Consumable'].includes(ev.kind)) rec.acts.push({ k: ev.kind });
      } }
    } });
}
if (opt('out')) fs.writeFileSync(opt('out'), out.map((x) => JSON.stringify(x)).join('\n') + '\n');
// aggregate
const n = out.length; const pct = (k) => (100 * k / Math.max(1, n)).toFixed(0) + '%';
const srcAgg = {}; let totalDmg = 0; for (const d of out) for (const x of d.dmg) { const k = x.src.replace(/^ally .*/, 'ally'); srcAgg[k] = (srcAgg[k] || 0) + x.amt; totalDmg += x.amt; }
const attackersPer = out.map((d) => new Set(d.dmg.filter((x) => !x.src.startsWith('camp')).map((x) => x.src.split('/')[0])).size);
const unusedAny = out.filter((d) => d.unused.some((u) => u.unusedSlots.length)).length;
const stunned = out.filter((d) => d.stuns.length).length;
const fought = out.filter((d) => d.acts.some((a) => a.k === 'attack' || a.k === 'cast')).length;
console.log(`games ${games} (${filter}); our deaths ${n} (${(n / Math.max(1, games)).toFixed(1)}/game); gems lost ${out.reduce((s, d) => s + d.gemsLost, 0)}`);
console.log(`stunned in the last ${W} rounds: ${pct(stunned)}; fought back (attack/cast): ${pct(fought)}; had a ready ability slot left unused on some turn: ${pct(unusedAny)}`);
console.log(`distinct enemy champion attackers: ` + [0, 1, 2, 3, 4].map((k) => `${k}${k === 4 ? '+' : ''}: ${pct(attackersPer.filter((a) => (k === 4 ? a >= 4 : a === k)).length)}`).join(', '));
console.log('damage taken in the window by source: ' + Object.entries(srcAgg).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => `${k} ${(100 * v / totalDmg).toFixed(0)}%`).join(', '));
const byVictim = {}; for (const d of out) { const v = byVictim[d.victim] = byVictim[d.victim] || { n: 0, unused: {} }; v.n++; for (const u of d.unused) for (const k of u.unusedSlots) v.unused[k] = (v.unused[k] || 0) + 1; }
console.log('per victim type: deaths and turn-count of ready-but-unused slots: ' + Object.entries(byVictim).map(([k, v]) => `${k} ${v.n} (slot0 ${v.unused[0] || 0}, slot1 ${v.unused[1] || 0})`).join('; '));
for (const d of out.slice(0, +opt('print', 0))) console.log('\n' + JSON.stringify(d));
