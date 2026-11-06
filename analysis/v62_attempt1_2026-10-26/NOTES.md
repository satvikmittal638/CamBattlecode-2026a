# v62 two-attempt cycle (started 2026-10-26)

Task (user, 2026-10-26): two platform attempts only. Attempt 1 = v62 active, 50 challenges (25 near our rank,
25 near rank/2), analyse them for bugs, glitches and strategic failures; test fixes locally as rigorously as needed;
choose carefully; attempt 2 = the fixed bot.

## Situation on 2026-10-26 (before attempt 1)

* **Patch 2.0.0 ("Sprint 3") is live** on the platform since 26 Oct (every match from ~08:40 UTC has patchId 2.0.0).
  Full notes: `analysis/docs_2026-10-26/pages/patch-notes_b1a658bb-...md`. Summary:
  - balance: Vesper Strength 55->45, Ryth/Marcella/Heart per-shard nerfs; Cassi Focus 70->100, Issac and Varg Strength
    40->45, Willow Focus 120->140, Ren stun 0.75->1.1 Focus, Tavi stun 1.4->1.6 Focus, Stellar/Prism per-shard buffs;
  - Treasure emblem gold 20% -> 10%; Monster emblem camp damage 10% -> 15%;
  - new emblem families: Tribute (tribute time -33%), Capture (capture 5 -> 3 turns), Prospector (+25% cluster
    rewards), Hunter (+50 gold per kill), Skirmish (+5% damage to champions), Greed (25 shards -> 35 shards of stats),
    Collectors (+1% damage per completed family);
  - draft first-turn fuel x10; CLI 4.0.0; item backpack 42 -> 84 item types.
* SDK 4.0.0 keeps the old 42 items at indices 0-41 and appends the new families at 42-83 (checked in cambc.h), so old
  item ids still mean the same item.
* Map pool: 70 platform maps (was 40); `workspace/maps` refreshed by `cambc init` (old set in
  `analysis/sdk_backup_3.0.5/maps`).
* Local toolchain upgraded: CLI 3.0.5 -> 4.0.0, workspace SDK 4.0.0 (`analysis/sdk_backup_3.0.5` keeps the old SDK).
* VPN to the GPU cluster is gone for good (user). Replay storage (S3) now downloads directly from this Mac: the block
  was the IIIT network seen through the VPN. All work is local from now on.
* Docs refreshed into `analysis/docs_2026-10-26` (22 files changed vs `docs/`, all from patch 2.0.0).

## v62 bugs found by reading the code against patch 2.0.0 (before any game)

* **Item buffer overflow (4 sites).** `env.champion_items` now writes 84 u32 (336 bytes); v62 passes 42-slot buffers:
  `v60_optional_hit.h:12`, `v1_tactical.h:14`, `v1_cycle.h:55`, `v1_bank_access.h:82`. The 168 extra bytes overwrite
  neighbouring stack data (our own champions: zeros, enemies with new emblems: their counts) - silent corruption of
  locals such as `buffs`/`n` in v60SafeOptionalHit and caller frames.
* Item index semantics (13/15/17 Durability, 25/27/29 Jungle, focus capital, shard count over 42) stay valid because
  the old ids did not move; the shard count ignores new families (v62 never buys them).

## Learnings carried over (from earlier reports; engine 1.0.3, so re-check on 2.0.0)

* Heavy losses are decided in rounds 1-200 on our own half: grouped opponents take the contested middle (r~55 vs our
  r70-100) and kill lone farmers; carriers with 30+ gems die alone vs 2+ enemies (half of all gems lost).
* v62 fight selection: commits rarely when ahead, trades when outmatched; only "no approach when outmatched + flee"
  (napflee) moved Fish live. Opening economy (capture gold by r100 ~40% below winners) is the root deficit.
* Fixes that win short rollouts can lose full games (v63 NOPLAN): confirm with full local games before shipping.
* Local opponents rarely contest the middle like platform teams; local suites can miss platform effects.

## Attempt 1 (v62, platform version 62, submission 6c4550dc) - started 2026-10-26 09:10 UTC

* Our rank 143 (was 54-77 in the 23-24 Oct evaluations). Pools: near = ranks 130-155 (25 teams), half = ranks 58-84
  (25 teams, around 71.5); 50 distinct opponents; maps rotate over the 70-map pool (3-4 games each); sides near
  64a/61b, half 61a/64b. Plan: `plan.json`; sender: `run.mjs` (adapted from the v57 eval: journal + receipts, platform
  lock owner `claude_v62_attempt1`, stops instead of overriding if someone else changes the active bot).
* Scripts: `preflight.mjs` (ladder/challenges/submissions snapshot), `prepare.mjs` (plan), `run.mjs` (send + wait).

## Attempt 1 results (all 50 groups finished 09:16 UTC; 250 replays + official summaries collected)

| pool | ranks | challenges won (3+/5) | games won | mean margin | heavy losses (>=500) |
|---|---|---|---|---|---|
| near | 130-155 | 21/25 | 86/125 | +230 | 17 |
| half | 58-84 | 4/25 | 35/125 | -254 | 45 |

No platform bot errors (250/250 finished), 0 bot faults and 0 fuelExhausted events for our side (opponents: 3651).
New maps 46/100 games won (margin +2), old maps 75/150 (-22).

### Bugs / glitches found (scripts: `scan_logs.py`, `behavior.mjs`, `mapview.mjs`)

* v62 stdout (NUL-padded, strip \x00): 126 turns aborted by the fuel-reserve guard (farm 59, burst-escape 29, fight
  20, low 16); 19 `API me.attack(*best) code 42` = invalid_action_attack_bad_target (meleeParting picks an invalid
  target); 37 turns with a blocked action.
* Idle (alive, off spawn, not channelling, no action): 9.3% of 1.25M champion-rounds. On a camp tile 66k (captures),
  next to empty camp tiles 23k (93/game: waiting for respawns / allies' captures), enemy within 8 12.8k, next to a
  live camp unit without attacking 3.7k, unexplained 10k (456 episodes >= 8 rounds). Full-HP idle on own spawn 10.3k.
  Oscillation 1457 episodes; "Movement blocked" 13.9k (56/game).
* **02guardians (new map): altar sealed by two Monoliths** (approach tiles = the two Monolith spawn tiles, which are
  two separate camp groups). v62's gate detection (`draft.cpp prepare_fast_metadata`) needs ONE boss group to cover
  all approach tiles -> not detected -> champions try to bank, 541 blocked moves/game, 42% of alive rounds idle on
  spawn at full HP; nobody tributes (0-0), lost on the gold tiebreak. 0/3.
* 00breadcrumbs (new, clusters only): 45.7% idle - nothing to do between cluster respawns; 0/4.
* Map hot spots: 01yellow_brick_road 25% idle (1/3), adgato_gemcombat4 18% (0/3), 01boss_battle 0/4 (-1350),
  01elk_arena 193 blocked moves/game.

### Economy / combat (official summaries, `economy.py`)

Heavy losses (62): our deaths 18.4 vs 4.5, kills 3.2 vs 17.6, gems collected 436 vs 1158, gold 3.0k vs 7.1k; by r200
deaths 2.3 vs 0.9 and gems 75 vs 139. Opponents who crush us draft the same pool (Marcella .87, Vesper .81, Vendetta
.69, Heart .66, Ryth .66) and buy the same families (Bruiser, Power, Jungle, Treasure, Durability); new emblems are
still rare (Prospector/Capture/Greed ~1-3 shards/game). The difference is behaviour (fights + captures), not picks.

### Fight anatomy (`fights.mjs`, both teams, round snapshots)

Heavy losses: we are outmatched (local HP share <= .42) in 44% of contact turns (them 17%), ahead in 34% (them 65%);
nearest ally 6.7 tiles (them 5.5); deaths 18.4/game, **7.2 of them alone vs 2+ enemies** (them 0.7); carriers 30+
die 1.3/game (91 gems). When outmatched at 2+ tiles we step toward the enemy 18% / hold 43% / away 39% - the same as
the opponents (19/37/44): the problem is being caught alone, not approaching.

### Isolated deaths are avoidable (`deathcontext.mjs`)

901 deaths alone (no ally within 6) vs 2+ enemies within 6 (3.6/game; 447 in heavy losses). 893 had >= 3 rounds of
warning (2+ enemies within 8), 615 had >= 12; HP at the warning 0.76 on average; half had an ally within 8 then. In the
warning window 88% kept attacking camps, 80% traded with champions, 85% stepped toward the enemies, 39% mostly moved
away. => camp-work / trading tunnel vision while a group closes in; v62's retreat triggers only at low HP (.35).

### Respawn-blocking waits (`blockwait.mjs`)

Idle on a dead camp's spawn tile beyond 6 rounds (delays the group's respawn): us 11.4 rounds/game, them 12.2 - not a
general issue; concentrated on 01yellow_brick_road 1571 (Vendetta 480 rounds on a gold-cluster row), 00vault 536,
00the_line 463 (maps with large connected cluster groups).

### Root causes from v62 decision traces (turnhost ported to engine 2.0.0)

* Harness ported: ITEM_TYPES 84, 2.0.0 timeline layout (+168 bytes/champion, tables +2688), new import
  `camp_group_capture_state` -> `Game_API_CampGroup_GetCaptureState`. Shadow fidelity on 12 platform games: local v62
  build 99.70% identical (0 drift). Trace build (PHASE2_LOG 2) 95.5%.
* 02guardians idle = stage `route-occupied` (8509 turns): doTribute routes to altar approach tiles that are all
  Monolith tiles -> moveToward finds no free goal, doTribute still returns true -> carrier stands forever.
* 01yellow_brick_road (Vendetta 480 rounds at (5,12), awake Wolf chipping it 3500 -> 1300 HP): stage `farm`, goal = the
  map-wide gold-cluster row; live members out of sight, belief "alive", fallback goal = the group's own tiles, already
  standing on one -> moveToward no-op every turn.
* 00breadcrumbs: stage `v1-camp-actions` next to clusters of another group (attackCampsOf only hits the target group).
* Gated maps (`gateprobe` bot over all 70 maps): only 01boss-battle (one boss group, detected) and 02guardians (two
  groups, missed). v62's gate plan: spell gate team draft + X_GATESTEAL (only finish a gate seen <= 30% HP) + caster-only
  fire from range 4: never banked (0/7). Winners: normal draft, farm, then burst the gate with the team (boss_battle
  r700-750: Vesper/Varg/Marcella 54 hits; guardians r1150-1250: Varg/Vendetta 42 hits), capture, bank 1000+.

### Isolation trigger precision (`trigger.mjs`, every 2nd round, ours)

Baseline P(death within 12) 2.3%. ">= 2 enemies within 8, no ally within 4, local HP share < s": s .3 fires 2.7% of
rounds, P(death) .30; s .4 3.9%, .25; s .5 5.1%, .21 (opponents in the same state die less: .19 at s .4).
=> a disengage trigger here is selective (4-5% of rounds) with ~10x death risk. v62m's M62_EVAC is this rule (2+
enemies within 8, share with allies within 6 < .45, no kill -> leave camp toward allies).

### v62x (workspace/bots/v62x = v62m + fixes; switches in m62_flags.h, all default to v62)

* Unconditional: the 4 item buffers are 84 wide. Shadow: v62x defaults 93.0% identical to platform v62 (v62m 98.8%),
  i.e. the overflow really altered ~6% of decisions (mostly movement; Vendetta/Heart/Vesper).
* M62_GATEUNION (draft + bot detection), M62_GATEDRAFT (normal draft/builds on gated maps), M62_GATEASSAULT (+M62_ASSAULTR
  600: healthy champions converge on the gate, attackCampsOf, gate becomes a capture target), M62_BANKSTALL (bank route
  with no reachable altar tile -> 20-round back-off, turn not consumed), M62_WATCHDOG (+M62_IDLEN 10: no action for 10
  turns, no enemy within 8, no live ally capture -> stall target 40 rounds, step off camp tiles).
* Local screen 1 (`fe_screen1`): base / gate / watch / evac / napevac / all vs exact v62, 70 maps x 2 sides.

### Local screen 1 (`fe_screen1`, vs exact platform v62, 70 maps x 2 sides = 140 games each)

| variant | wins | gem diff | net flips vs base |
|---|---|---|---|
| base (84-wide item buffers only) | 82/140 | +65 | - |
| gate (union+draft+assault+bankstall) | 82/140 | +88 | +2/-2 |
| watch (watchdog mode 1) | 79/140 | +43 | +20/-23 |
| evac (M62_EVAC .45) | 49/140 | -139 | +8/-41 |
| napevac | 60/140 | -102 | +15/-37 |
| all (gate+watch+evac) | 58/140 | -101 | +16/-40 |

* The buffer fix alone beats v62 82/140 (expected 70 +/- 6): the overflow was hurting. v1_tactical's per-champion
  V1Body (items -> cooldowns, bag, spell values) sits next to an overflowing buffer => fight evaluation corrupted on
  2.0.0.
* gate: 02guardians now banks (1005-34, 1061-7 vs v62 0-0); 01boss-battle 1W 1L (400-1222: once the gate falls both
  teams can bank). Platform opponents bank there anyway, so 0/7 can only improve.
* watch mode 1 lost both 01yellow-brick-road games -> too broad; added mode 2 (only on the target's own tile with none of
  its camps in sight).
* EVAC is strongly negative even though the local mirror does produce isolation deaths (`isolation_local.mjs`: our
  deaths 8.5/game, 3.0 isolated vs 2+; nearest ally 6.7 both teams) - it gives away more (camps, fights it would win,
  20-round target stalls) than it saves.

### Screen 2 (`fe_screen2`, 9 opponents x 140) - the old local pool is useless on 2.0.0

base won 1190/1260: every local bot except exact v62 lost 135-140/140. vs v62: base 82, gate 82, watch2 82, flee 84,
napflee 87, evac30 72, evac 49. Net flips vs base over all 1260: gate +5, watch2 -3, flee +1, napflee -3, evac30 -23,
evac -47. => EVAC (both shares) dropped.

### The overflow cripples the whole code lineage on 2.0.0

Copies of our lineage bots with only the item buffers widened (`*_f84`: nova, codex-v57, v63=v58s, v64=v58d,
fish-base62, tm30, prism-v58-control) became competitive: v62x base won only 17-24/40 against six of them (tm30_f84
34/40) instead of ~140/140. Our rating: 1815 (25 Oct 22:52) -> 1758 (26 Oct 09:01, after patch 2.0.0 went live),
rank 143 (54-77 a few days earlier at ~1820-1850).

### Screen 3 (`fe_screen3`) - competitive bench

Opponents: v62 (exact), v62x (fixed mirror), nova_f84, codexv57_f84, v63_f84, v64_f84, fish62_f84, prism58_f84.
Variants: base, gate, watch2, flee, napflee, fixes (gate+watch2), fixflee, fixnap. 70 maps x 2 sides.

### Screen 3 results (`fe_screen3`, competitive bench, 1120 games per variant)

| variant | wins | v62 | v62x | nova | codex | v63 | v64 | fish62 | prism58 | net vs base |
|---|---|---|---|---|---|---|---|---|---|---|
| base | 618 (55.2%) | 82 | 70 | 81 | 74 | 80 | 78 | 77 | 76 | - |
| gate | 628 | 82 | 72 | 86 | 72 | 80 | 79 | 79 | 78 | +22/-12 = +10 |
| watch2 | 609 | 82 | 72 | 84 | 69 | 71 | 77 | 74 | 80 | +143/-152 = -9 |
| **flee** | **694 (62.0%)** | 84 | 81 | 97 | 82 | 89 | 88 | 79 | 94 | **+204/-128 = +76** |
| napflee | 631 | 87 | 69 | 88 | 76 | 78 | 79 | 66 | 88 | +13 |
| fixes (gate+watch2) | 618 | 80 | 74 | 84 | 70 | 75 | 75 | 76 | 84 | 0 |
| fixflee (gate+watch2+flee) | 623 | 87 | 66 | 88 | 75 | 73 | 81 | 68 | 85 | +5 |
| fixnap | 617 | 73 | 72 | 95 | 81 | 74 | 76 | 70 | 76 | -1 |

* flee alone +76 (z ~ 4.4 against ~300 chaotic discordant pairs) but flee + gate + watch2 only +5: either an
  interaction or chaos (any code change - even fuel use - reshuffles trajectories; watch2 alone flips ~300 games).
* Screen 4 (`fe_screen4`, opponent mirror frozen as `v62xb`): flee (determinism check), fleenull (watchdog code active
  but never firing: pure perturbation control), fleew2, gateflee, fleemon (Monster emblem), fleenotr (no Treasure),
  fleevarg (Varg for Vesper).

### Screen 4 (stopped at 2374 games on the user's 2k-games budget) and the holdout check

* Determinism: flee repeated = screen-3 flee in 1120/1120 games.
* fleenull (flee + watchdog code that never fires) 617/1120 = base (net -1) while flee is 694 (+76): the flee gain
  vanishes under a no-logic perturbation -> either chaos or fuel fragility (the flee branch needs >= 30k fuel left late in
  tacticalFight; extra per-turn SDK calls starve it). fleew2 partial 81/134.
* Holdout (`fe_holdout`, 23 maps never used for selection x 2 sides, vs v62xb/nova_f84/v63_f84/prism58_f84, 184 games
  each): base 86 (46.7%), flee 109 (59.2%, +47/-24 = +23), final (gate fixes + flee) 111 (60.3%, +25). The flee gain
  replicates on independent maps.

## Decision for attempt 2: v62y

`workspace/bots/v62y` = exact tested source of `final` (fe_holdout/snapshot/src + variants/final.m62_flags.h):
84-wide item buffers + M62_GATEUNION + M62_GATEDRAFT + M62_GATEASSAULT (r600) + M62_BANKSTALL + M62_FLEE.
Not shipped: EVAC (any share), NOAPPROACH, watchdog (both modes), build/draft changes (untested on the bench).
