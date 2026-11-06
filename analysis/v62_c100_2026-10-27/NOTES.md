# v62 100-challenge evaluation, code review and patch-2.0.0 impact (started 2026-10-26 19:24 UTC)

Task (user): v62 is the best version. Play 100 challenges (50 near our rank, 50 near rank/2), find vulnerabilities and
bugs in the losses, improve via replay analysis. Mid-task additions: read v62's code against the current docs,
remove stale code, and check what patch 2.0.0 changed (rank ~70 before / during Sprint-2 seeding, now 100+).

## Platform run

* 19:24 UTC: v62 active (submission 6c4550dc), rank 103, rating 1828, quota 50/h. Plan `plan.json` (`prepare.mjs`):
  100 distinct opponents, near = ranks 77-128, half = ranks 27-76; every map of the 70-map pool 7-8 times with
  sides balanced per map; 125 games per side per pool. Sender `run.mjs` (journal + receipts, platform lock owner
  `claude_v62_c100`, stops if someone else changes the active bot), collector `collect.mjs`, official summaries
  `official_stats.mjs`, our match history `ranked_history.mjs`.
* First 50 accepted 19:24-19:26, all finished by 19:42 (250 games, every one verified v62).
* 20:24 UTC teammate Harsh's v99 ("Carry bank: 60+ gems ... test only, not live", uploaded 19:39) became active;
  the sender stopped without overriding. `resume_when_v62.mjs` (read-only polling) resumes the remaining 50 once
  v62 is active again. Still v99 at 21:03.
* First half (the stronger end of each pool): near (ranks 77-104) 46/125 games, 7/25 challenges, margin -250; half
  (ranks 27-52) 19/125, 2/25, -464. By band: ranks 27-39 9%, 40-52 22%, 66-78 40%, 79-91 33%, 92-104 40%.

## v62 code review against the 2.0.0 docs

Source: `workspace/bots/v62/src` (byte-identical to the platform submission; 1546-line bot.cpp + 22 headers).

### Bugs / rule mismatches

1. **Item buffer overflow (memory corruption).** `env.champion_items` writes 84 u32 since 2.0.0; four raw buffers are
   42 wide: `v60_optional_hit.h:12`, `v1_tactical.h:14`, `v1_cycle.h:55`, `v1_bank_access.h:82`. The SDK's own
   `item_count()` returns an `enum_map<item_type>` (84 wide with SDK 4.0.0), so only these four overflow in a fresh
   build. Known from the attempt-1 study: the fix alone changed ~6% of decisions and beat exact v62 82/140 locally.
2. **Two-Monolith altar gates are not detected** (draft `prepare_fast_metadata` and `discoverBankGate` both require
   ONE boss group covering every approach tile). 02guardians: champions try to bank into Monolith tiles.
3. **doTribute stalls when no approach tile is free**: `moveToward` returns false (`route-occupied`) but doTribute
   still returns true, so a carrier stands still for the rest of the game (02guardians 541 blocked moves/game).
4. **farm() no-op goal**: standing on its target group's own tile with state != respawning, the goal is the group's
   tiles, `moveToward` returns false (goal already reached) -> idle for hundreds of rounds (yellow_brick_road).
5. **No use of the 2.0.0 capture-state API** (`camp_group_capture_state`: ally capturing / contested / enemy
   capturing / timer). v62 only reads alive / reward / respawning, so it cannot see that its capture is contested by
   an unseen enemy (holds forever) or that an enemy is capturing a group in view (no contest).
6. **Fixed capture time 5** in target scoring; enemies with the new Capture emblem capture in 3.
7. **Damage model gaps**: own Heart of Ruin basic/landing damage ignores the missing-health bonus (up to +50%) in the
   kill test; Skirmish (+5% vs champions) / Collectors emblems not modelled; Bruiser emblem counted as 5 shards (7).
8. **Altar locks never used** (10 g; placing one cancels enemy tribute channels at that altar and blocks tributes
   until five basic attacks). v62 only clears enemy locks.

### Balance changes that hit v62's fixed draft and build

* Draft (every non-gated map): Heart of Ruin, Vesper Vale, Ryth, Marcella, Vendetta. Four of five were nerfed:
  Vesper Strength 55 -> 45, Heart per-shard Strength 3.5 -> 3 / Focus 12 -> 10, Ryth per-shard Strength 5 -> 4.5,
  Marcella per-shard Strength 5 -> 4.5 / Focus 15 -> 14. Buffed picks v62 never takes: Cassi Focus 70 -> 100, Issac and
  Varg Strength 40 -> 45, Ren stun 0.75 -> 1.1 Focus, Tavi stun 1.4 -> 1.6 Focus, Willow Focus 120 -> 140, Stellar
  Focus/shard 7 -> 8.5, Prism Health/shard 60 -> 65.
* Build (X_TBUILD, every champion): Treasure emblem first (150 g), then Jungle, Bruiser Health, Durability Health,
  Bruiser damage. Treasure 20% -> 10% gold. The new families (Capture, Prospector, Hunter, Skirmish, Tribute, Greed,
  Collectors) are never bought.

## Stale code removed: `workspace/bots/v62c` (v62 unchanged as the platform reference)

Removed (source 268 KB -> 149 KB; wasm 3.534 MB -> 3.528 MB because the linker had already dropped most of it):
* `boss/` (6 files) + `boss_main.cpp`: `runBoss()` was never called from `main()`; `v55_bank.h`: never included.
* Functions without a live caller: `planWork`, `castOnCamp`, `outgunnedIsolated` (X_THREAT/X_OUTNUM off),
  `rallyToFight` (X_RALLY off), `typeDps` + `baseDps`, `carryWants` + `fxShards` + `carryRank`, `lowerCapturing`
  (always false under X_CARRYMODE 2), `noteMotion` + `prepareRecovery` + `recoveryAt` (the movement-recovery system:
  `recoveryActive` was only ever set by the uncalled `noteMotion`), `frame_stale`.
* Disabled switch branches: X_PRIO, X_BANK, X_HEALRECALL, X_BIGCOMMIT, X_BUILD, X_BUILDSTELLAR, X_BRUISER==1, the
  pre-Tung shop plans and the Ren override (always overwritten), X_CARRYMODE 0/1, the unused draft rosters
  (big0/bigFish/small0/farSmall0), dead flags (X_BOSSTRIB, X_BOSSSTEAL, X_CARRYEQ, X_THREATRATIO, X_OUTNUMBY,
  X_BIGRANGE, X_RALLYRANGE, X_BANKMIN, X_BANKNEAR, X_DRAFT4).
* Enabled switches inlined (X_CAMPSTUN, X_SHOPRECALL, X_RECALLGUARD, X_GOLDGROUPS, X_GATESTEAL, X_MELEEHIT, X_PACK,
  X_META, X_TBUILD, X_TACTREACH, X_CARRYCAP, X_BRUISER 2, X_GATEDRAFT false); `fishx_features.h` keeps only the
  numeric tunables.
* Written-but-never-read state: `terrain`, `spawnAltarDist`, `farMap`, `cassiSlot`, `yieldPeer(Position)`,
  `lastWardRound`, `moveGoals`, `motionHistory/goalBest/stalledMoves/motionRound`, V1Body `spell/spellRange/
  spellSlot/resetSlot` (+ the per-enemy loop filling them); `expand()`'s unused node-limit parameter.

Verification (turnhost shadow over the 250 attempt-1 platform games, 1,406,908 champion turns):
* With fuel unconstrained (`--quantum 50000000`) v62 and v62c act identically on **every** turn (0 differences):
  the cleanup changes no logic.
* Under the real 100k budget they differ on 0.84% of turns, all fuel effects: v62c spends less, e.g. init finishes
  in the first turn (the unread `terrain` export was the margin) and a ward fits under the 85k threshold at round 2.
  Putting the export back left 0.63%: any recompile shifts instruction counts, so exact identity under fuel limits
  is not expected.

## v62 final result (all 100 challenges; the second 50 ran 21:0x-22:09 UTC after v62 was reactivated)

| pool | ranks | challenges won (3+/5) | games won | mean margin | heavy losses |
|---|---|---|---|---|---|
| near | 77-128 | 15/50 | 99/250 (40%) | -193 | 90 |
| half | 27-76 | 7/50 | 61/250 (24%) | -311 | 105 |

By band: near 77-102 46/125, near 104-128 53/125, half 27-51 19/125, half 52-76 42/125. 0 wins on 01boss_battle,
00breadcrumbs, 00crater, 00lost_world, 00road_of_riches, 02guardians, adgato_gemcombat4, 01fracture, 00monolith.
All 500 games: our deaths 12.0/game, 58% in a repeat zone (opponents 6.2, 37%).

Zero-win maps by failure type (official summaries; deaths us/them, gems captured by r300 us/them):
economy - 00lost_world 6.0/4.9, 72/462; 00road_of_riches 7.6/2.1, 57/303; 00breadcrumbs 7.2/2.9, 64/218;
01boss_battle 6.4/5.6, 51/156; adgato_gemcombat4, 01fracture, 00monolith. Combat - 00crater 30.5/5.0; 00dunes
18.9/4.8; 02guardians 17.6/6.0; 00corners 16.1/5.4. The economy type is the 26 Oct opening gap (rich Elk groups
near spawn left alone, see v62y_attempt2 NOTES); next-iteration target.

## Patch 2.0.0 impact (patch_impact.py, timing.py, ranked_history.mjs)

* **v62 did not lose strength against its own rating band.** Ranked (rating-matched opponents): pre-patch 638-612
  (51.0%, 1250 games), post-patch 143-117 (55.0%); rating 1761 (09:11, right after the patch) -> 1828 (19:21). Our
  rating is where it was on 22-25 Oct (1815-1856); the **ladder above us inflated**: rank 70 needs 1893 now (1880 at
  09:05), rank 30 2031. The rank drop (~70 -> 103) is other teams rising.
* Same rank band (opponents 27-103), pre (v57 eval, 23 Oct, same five-champion draft) vs post (this run): our win
  rate 54% -> 25%; opponents' economy unchanged (gold 7212 -> 7060/game, gems 905 -> 1028), ours down (gold 7246 ->
  4541, gems 867 -> 635, monster damage -30%). Same champion on both sides: ours vs theirs gold/game post-patch -
  Vesper 925 vs 2353, Heart 1074 vs 1374, Marcella 1102 vs 2066. The nerfs hit opponents' copies of our picks too
  (Marcella 86%, Vesper 85% pick rate), so they are not the cause.
* When the gap opens: captures at r150 us 57 / them 82 (pre-patch 45 / 62: same ratio), but by r500 216 / 347 -
  mid-game; deaths by r500 5.2 vs 2.2 (pre 3.7 vs 2.9), kills 1.5 vs 4.7.
* The field is adapting: opponents' first emblem Treasure 68% (attempt 1, morning) -> 46% (this run), Prospector
  8 -> 23%, Capture 0 -> 10%; draft up for buffed Tavi .14 -> .23, Willow .08 -> .17, Cassi .08 -> .12, down for
  nerfed Heart .78 -> .69, Ryth .69 -> .60. Opponents who complete a new-family emblem beat us more in every rank
  band (e.g. ranks 40-52: 92% vs 69%; 27-39: 95% vs 85%) - correlational (fast adapters are the strong teams).
* Item overflow effect measured: v62 (42-wide) vs v62f (84-wide), unconstrained fuel: 1.6-1.8% of decisions differ,
  equally in morning and evening games. Real but small; the A/B on the platform (v97) was +7 games.

## Losses: vulnerabilities (deathcontext.mjs, fights.mjs, repeat_deaths.mjs, behavior.mjs, scan_logs.py)

* 121/250 games lost by 500+. In those: our deaths 20.7/game vs 4.3 (7.3 alone vs 2+), outmatched in 46% of contact
  turns (them 17%), nearest ally 6.8 vs 5.6.
* **Repeat deaths**: 3333 deaths (13.3/game; opponents 5.6). 61% happened within 6 tiles of a teammate's death in the
  previous 150 rounds (opponents 34%; 70% in our heavy losses); 21% the same champion again; 5.0/game within 80
  rounds of respawning (opponents 0.7). Chains: first-in-zone 1315, second 838, third 520, fourth+ 660. 2440 deaths
  with 2+ enemies within 6.
* Isolated deaths: 1207 alone vs 2+ (4.8/game, attempt 1 3.6); 99% had 3+ rounds of warning, HP .79 at warning,
  86% kept stepping toward the enemies (tunnel vision on camps/trades).
* 00contest (boss-only map: two Monoliths + gold clusters): we score 0 in 3 of 4 games, 35-57 deaths/game vs 6-13:
  champions walk one by one into the team holding the Monoliths.
* Glitches: idle 8.9% of alive time (max run 421), oscillation 814 episodes, 12.4k blocked moves; v62 log: 33
  `me.attack code 42` (invalid target in meleeParting, caught), 141 guard-aborted turns.
* **Standoff freeze (traced)**: local mirror on 00ambush = 0-0 for 2000 rounds (both teams idle from r100). With 5
  enemies at 2-6 tiles each champion spends 55-75k on knowledge + bodies + help + planner enumeration (and 15.6k in
  the legacy scan) to conclude "no plan", then farm/route lack the 36-42k they need. Same state every turn.

## Fixes and local screens (workspace/bots/v62p = experiment switches; ~1,100 local games in total)

| screen | games | result |
|---|---|---|
| fe_build1 (builds vs v62f mirror, 35 maps) | 350 | Capture-first +1 (+59 gems), Prospector +4, Pro+Cap -3, Jungle>Capture +4 |
| fe_screenA (10 problem maps x 2 opps) | 200 | memo +2, gate +2 (+140 gems), farm -1, all three +2 (+132 gems); 0-0 games 10 -> 0 |
| fe_screenB (other 35 maps, mirror) | 210 | all three +1; all three + Capture-first -7 |
| fe_screenC/C2 (death-zone memory) | 420 | any-death trigger -8, group-kill trigger -15 (repeat share 48 -> 42%, deaths -0.4) |
| fe_final v62n vs exact v62 (70 maps) | 140 | **82/140**, +42 gems, no 0-0, no faults |

* Dropped: Capture/Prospector builds (no consistent local gain), death-zone avoidance (negative locally, like EVAC on
  26 Oct: the local bench is gentler - 8.5 deaths/game, 46% repeat - so it cannot show the platform effect).
* **v62n** (`workspace/bots/v62n`, clean code, no switches) = v62c + 84-wide item buffers + standoff memo + gated-map
  fixes (multi-Monolith gate detection, normal draft/build, team gate assault from r600, bank-stall back-off) +
  farm fixes (unseen-tile walk, stale capture drop, contested-hold leave via the 2.0.0 capture-state API). Removed
  with the gate team: the pre-r600 caster steal, bankChannelThreat/retreatBankCarrier (Cassi/Issac only),
  `v1_bank_channel.h`, `v1_bank_carrier.h`, `safeCamps()`.
* Verified: v62n = v62p with the three fixes on, 0 differing decisions in 231k turns (unconstrained fuel).
* Fuel (shadow over the 250 platform games, real budget): v62 mean 39,738/turn, v62n 39,676 while acting on 87.3%
  of turns (v62 86.0%); paired on identical actions v62n -88/turn (-196 with no enemy in view, +150 with enemies).
  Done by computing the memo signature only after an idle evaluation with enemies within 6 (reusing the planner's
  flag) and caching our own item counts between purchases.

## Platform A/B: v101 = v62n (user: "Upload v62n now", answered ~04:20 UTC 27 Oct)

* v100 meanwhile uploaded by Harsh (v62 + item-buffer fix only, inactive). Our rank 122 at 04:20.
* 04:2x UTC: `cambc submit v62n` -> version 101 (submission 4780e32e), auto-activated. Paired run in
  analysis/v62n_c100_2026-10-27 on the identical plan (same 100 opponents, maps, sides).
* First 50 (sent 04:24, current opponent bots; `paired.mjs`): near games 46 -> 44 (flips +15/-17), challenges 7 -> 7;
  half 19 -> 19 (+10/-10), challenges 2 -> 2; margin +55 / +22 per game. Gated maps up (02guardians +2,
  01boss_battle +1, 00contest +1), 02famine -3, 01big_world -2, 00split -2. => level with v62 so far.
* Second 50: run.mjs restarted to send `sourceGroupId` = v62's group for the same plan entry (CLI 4.0.0 field), i.e.
  the exact opponent bots v62 faced.

### v101 vs v62 final (500 paired games, identical specs)

| pool | v62 games | v101 games | flips | margin change/game | v62 challenges | v101 challenges |
|---|---|---|---|---|---|---|
| near | 99 | 101 | +35/-33 | +53 | 15/50 | 16/50 |
| half | 61 | 68 | +27/-20 | +25 | 7/50 | 12/50 |

* First 50 (current opponent bots): 65 -> 63 games. Second 50 (exact opponent bots v62 faced, sourceGroupId):
  95 -> 106 (+37/-26), challenges 13 -> 19. Overall +9 games (+62/-53, z ~ 0.8), +6 challenges, better margins.
* Biggest map gains: 02guardians +6, 00vault +4, 02gift_wrapping +3; losses 02famine -4, 00gem_fields -3.
* Below the improvement-loop bar (>34/50 near, >28/50 half) by a wide margin: a cleaner, slightly better v62, not
  a new level. v101 left active (user chose the upload); rank 109, ranked 6-4 in its first two groups.
* Official summaries, same 500 games: games where we scored 0: v62 22 -> v101 12; gems collected 730 -> 761/game,
  tributed 612 -> 644 (opponent 984 -> 962, 864 -> 857); gold 5106 -> 5128. Deaths unchanged: 12.0 -> 12.3/game,
  repeat-zone share 58% -> 59%. The fixes removed failure modes; the death pattern is untouched.

## Round 2 (27 Oct, user: "fetch replay and improve") - deaths

* v101 ranked since 04:20 UTC: 66/125 games (53%), `analysis/v101_ranked_2026-10-27` (tools/ranked_watch.mjs).
* Death autopsy (`../v62n_c100_2026-10-27/death_autopsy.mjs`): trace build v62ntrace shadowed over v101's 331 lost
  challenge games (95.3% identical to the recording), every death seen from the victim's own vision. 4985 deaths:
  escaping 59% (saw 2.5 enemies ~10 turns earlier at HP .73, escaped only at median HP .36, died a median 5 turns
  later), fighting 16%, other 15% (already dying at first sight), unseen 6%, ignored 5%. Local HP share at the
  warning: median .29. Most common stage between warning and escape: `reset` (4619 turns) = the LEGACY fight code,
  which runs when the planner returns "no plan" without a danger veto (it judged every attack net-negative) and then
  attacks with resets or approaches with no danger check.
* Rule (v62q switches): outmatched (share < .35) + no plan -> no legacy fallback (Q_NOLEGACY); with an enemy within
  5 -> step to the least-incoming tile, ties by distance from the nearest enemy (Q_FLEE). Shadow over the platform
  losses: fires on 1.8% of turns, a third of them inside the 12 turns before a death (8x the base rate); 61% of
  deaths had an opportunity.
* Local (490 games): vs v62n mirror - base 35/70, no-legacy only 25/70 (deaths 12.4: standing still is worse), both
  39/70 (deaths 8.1 vs 9.7, repeat 45% vs 54%), flee only 36/70; vs nova_f84 (other 35 maps) - base 42, flee 45,
  both 45 (deaths 8.8 -> 7.5). Both rules: +7 net over 280 paired games.
* **v62r** = v62n + the rule, inlined (X_OUTMATCHED = .35 in fishx_features.h); 0 decision differences vs the switch
  build; fuel -27/turn vs v62n.
* Upload blocked: the CLI session expired (`cambc submit` waited at a login prompt; nothing uploaded, lock released).
  `../v62r_c100_2026-10-27/start.sh` uploads, writes plan.json and starts the 100 paired challenges (every one with
  sourceGroupId = v62's group) once `cambc login` is renewed.
* 27 Oct 10:38 UTC: CLI re-login (browser approval), v62r uploaded as v102 and activated (pinned mode), 100 challenges
  started with sourceGroupId = v62's groups. 12:09 UTC teammate Harsh activated v103 ("c8: v101 + dash fix + team
  camp scoring + bank camp memory + death-camp avoid", uploaded 11:13); the sender stopped after 50 (not overridden).
* **v62r vs v62, 50 challenges, exact opponent bots** (`../v62r_c100_2026-10-27/paired.mjs`): near games 46 -> 54
  (+19/-11), challenges 7 -> 9, margin +166/game; half 19 -> 23 (+13/-9), 2 -> 3, +70. Net +12 games (z ~ 1.7).
  Same specs vs v101 (v101 faced current bots): 63 -> 77. Deaths/game v62 13.3, v101 12.7, v62r 11.2 (opponent 5.6 ->
  6.5), kills 4.4 -> 5.0, repeat-zone share 52%, gems tributed 551 -> 580 -> 632 (opponent 908 -> 870).
  Best platform result of the v62 line; still far below the >34/>28 bar (9/25 near, 3/25 half on this half).

## Fix-acceptance audit (user rule 27 Oct: improve the targeted matches, no degradation anywhere else)

`../v62r_c100_2026-10-27/fix_audit.py` splits paired games by the baseline game: targeted = our deaths >= 12
(platform) / >= 9 (local), else untargeted; reports wins, flips, margins and death/kill/capture/gem/gold deltas.
* v62r on the platform: targeted 107 games wins 11 -> 28 (+22/-5), deaths -21%, gems tributed +59%; untargeted 143
  games 54 -> 49 (+10/-15), kills -8%, gold -2%, rest flat. Same pattern locally (untargeted deaths +35% / +15%,
  opponent gems +7% / +10%) => fails the rule.
* Why (v62r trace on its own games, `step_outcomes.mjs`): side effects per step are rare (capture dropped 1%, ally
  died 3%, stepped back 7%); the cost is volume - 49 steps/game even in untargeted games, 22/game replacing a v62n
  attack. Step situations look the same in both groups (enemies, HP, distance, allies, 2-turn danger median .16):
  strong opponents just create them 3x as often.
* Refinements (fe_r1 mirror / fe_r2 nova, 560 games, base and nlf rebuilt in the same runs):
  R-a closing threats: targeted 5->7 / 10->13, untargeted 30->29 / 33->33 but opponent gems +28% on the mirror.
  R-b share .30: targeted 5->6 (deaths -14%, margin +92) / 10->14 (-27%, +161); untargeted 30->32 / 33->31, no
  metric moving consistently. On the platform step situations, .30 keeps 77% of targeted pre-death steps but cuts
  untargeted steps 40% (48 -> 29/game).
* **v62s** = v62r with X_OUTMATCHED .30 (0 decision differences vs the R-b switch build). Not platform-tested:
  teammate Harsh's v103 is active and being tested.

## v62s and v62t on the platform (27 Oct evening; user: "use the platform, ignore harsh", then "only 100 matches = 20 challenges")

* v62s = v104 (17:21 UTC), 20 challenges = every 5th opponent of each pool of the v62 plan, same maps/sides,
  sourceGroupId = v62's groups (`../v62s_c100_2026-10-27`; the sender now re-activates our version if someone switches).
  vs v62: near 19 -> 16, half 10 -> 16 games (challenges 2 -> 4). Targeted 49 games: wins 10 -> 15, deaths -22%,
  kills +25%, captures +13%, tributed +28%. Untargeted 51: wins 19 -> 17, deaths +17% (4.0 -> 4.7), gold -3% => not
  clean. Lost untargeted wins recur on 02famine / 00gem_fields / 00quarry / 02fields - also in v62r and v101.
* Those regressions come from the v62n base, not the rule: v62 vs v101 vs v62r vs v62s - 02famine 5/7, 1/7, 1/4, 0/3;
  00gem_fields 3/7, 0/7, 1/3, 0/2; 00split 3/7, 1/7, 0/4, 0/1. On v62's own famine/gem_fields/split games v62n's new
  code paths never fire (memo, farm-fix, gate stages: 0 of 106k turns); its deviations (2.3%) are camp-target choices.
* **v62's item overflow had a behavioural effect** (probe build `workspace/bots/v62probe`): in scoreTargets the
  42-slot buffer overrun zeroes the whole `own` champion_info and the carried-gem count on every call. v62 therefore
  scored camps with an empty bag (full altar trip per camp, no batching of distant camps into a big bag) and without
  burst/shield openings. The fight planner's bodies are untouched; the optional-hit check zeroes victim/own (only
  matters vs Ren). v62f + that scoring (`v62_scoring.py`) differs from the overflowing v62c on 0.03% of decisions
  (v62f alone 1.68%): the overflow's effect is fully explained.
* **v62t** = v62s + v62's camp scoring as explicit clean code (less code, less fuel). Local guard vs exact v62:
  77/140, every metric better (deaths 7.8 vs 9.2, gems tributed 813 vs 745). Platform: v105, same 20 specs as v62s.
* **Audit method correction**: splitting by the baseline game's deaths is biased (regression to the mean). Unbiased
  views - mean of both games' deaths, or the map's usual v62 deaths from its other games (a priori):
  v62r (250 games): combat maps 27 -> 37 wins (+17/-7), deaths 20.3 -> 16.4, tributed 441 -> 558, gold +17%; other maps
  38 -> 40 (+15/-13), deaths 8.5 -> 7.6, tributed 627 -> 682 => passes both.
  v62s (100): combat 14 -> 16, deaths -15%; other 15 -> 16, deaths -18%, tributed +14% => passes.
  v62t (100, v105): combat 14 -> 15, kills -7%, tributed -6%; other 15 -> 23, deaths -24%, tributed +22% => the
  restored v62 scoring helps economy maps but costs the combat maps the death fix targets: fails "improve the target".
  Its three blowouts (00contest 4 -> 39 deaths, 00gemfight 5 -> 44, 00interlock 5 -> 31; v62s won all three) are
  cascades after early lost fights: champions walk from spawn toward enemy-side camps past enemies at 5-8 tiles.
  50 games common to all: v62 14, v62r 15 (near margin -47 vs -141), v62s 13, v62t 13.
* 27 Oct 18:31 UTC: v62r (v102) made the live bot at the user's OK (selected 18:21, live after ~10 minutes in pinned mode).
