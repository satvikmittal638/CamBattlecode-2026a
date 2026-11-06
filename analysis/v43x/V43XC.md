# v44 (v43x-B) platform result and the v43x-C design — 2026-10-21

## v44 = v43x-B (v43 + pack bonus on big camp groups + Jungle > Bruiser Health > Power builds)
20 challenge groups, `platform/v43x_B` (labels near_rNN = ladder rank 53-63, half_rNN = rank 24-33).
- near rank 58: **22/50** (target >34); near rank 29: **16/50** (target >28). Not a new baseline.
- Ranked meanwhile: v44 2-3, 2-3; rating 1805 -> 1796 (rank 65).
- Common opponents in the last 8 h (small samples): v43 25-35, v44 7-13.

## Why we lose (analysis/v43x/loss_review.mjs, death_geometry.mjs, builds.mjs, carry_share.mjs)
1. Brawl maps (elk_arena 0/3, swirl 0/3, starfish 0/2, collision 0/3): our deaths 40-70 vs 5-17.
   Each death gives the killer 100 gold + carried gems and costs 60 rounds: their net worth at
   round 300 is 1.6-1.8x ours on swirl/collision, then they kill everything.
2. Deaths are bursts, not slow retreats: 62% of our 1444 deaths had >=60% HP six rounds before;
   only 34% were outnumbered (enemies within 5 > allies + 1). We lose even fights.
3. Opponents are far tankier. Max HP at round 900, ours vs opponents (same type):
   Ryth 1631 vs 2434, Vesper Vale 1434 vs 2202, Heart 1497 vs 1953. Top teams: Tung's Heart 2870,
   Marcella 3154, Vendetta 3055; procless's Vendetta 2914.
4. Builds: every top team buys a Treasure emblem first (+20% gold), then Health emblems.
   - EMPEROR Tung (#3): Treasure Health (Strength for Vesper/Tavi) > Jungle Str (Heart Foc) >
     Bruiser Health > Durability Health > Bruiser Str/Foc.
   - procless (#2): Heart Treasure Foc > Durability HP > Home HP; Vesper Treasure Str > Durability
     HP > Monster Str; Ryth Bruiser HP > Durability HP; Marcella/Vendetta Jungle first.
   - Fish (#1): Treasure Foc > Power Foc > Home HP on Heart/Stellar; Bruiser HP > Durability HP on Ren/Ryth.
   - Ours (v44): Jungle > Bruiser HP > Power — no Treasure, little Health.
5. Captures: top teams spread captured gems ~20% per champion (gold -> items for everyone).
   Ours: Heart 45% (carryRank 0), so the Heart owns 53 shards at round 900 and the rest ~20.
6. Draft: procless and Tung (and most teams beating us) use Heart, Vesper Vale, Ryth, Marcella,
   Vendetta. Ours: Heart, Tavi, Vesper Vale, Ryth, Varg (Tavi dies most: 3.6/game).
7. Quiet maps (split, broken_curve, rows, big_world, quadrants, lanes: 0-1/3 each): we capture
   75-90% of the opponent; same captures per 100 rounds (4.1 vs 4.3); they walk less (54% vs 61%
   of turns) and recall 2x as often. Gold rush 0/3 despite 3000 vs 620 net worth at round 500:
   we farm gold, they farm the gems.

## v43x-C (workspace/bots/v43xc): the meta pivot on top of v43x-B
- X_META: draft Heart, Vesper Vale, Ryth, Marcella, Vendetta (4 picks drop Vendetta; 3 picks
  Heart, Vesper Vale, Vendetta). Gated-altar maps keep the gate team.
- X_TBUILD: Tung's build order for every champion, then Bruiser Health/damage alternating.
- X_CARRYMODE 2: the poorer of two nearby allies takes the capture (spreads gold/items).

## v45 = v43x-C on the platform (same 20 specs as v44, `platform/v43x_C`)
- near rank: **31/50** (v44 22/50); rank/2: **17/50** (v44 16/50). Paired vs v44: +18/-8 (sign test p=0.076).
  Not a new baseline by the >34 / >28 rule; it is the base for the next iteration.
- Deaths 11.3/game (v44 14.4), kills 11.4; our max HP now above the opponents' (Marcella 3691 vs 2155 at round 900).
- Local (35 maps x 2 sides x tm30/v27/v43x/mimic-kratosmessi): 231/280 vs B 221/280; head-to-head vs B 50/70.

### Fixes found after upload (in workspace/bots/v43xc, not in v45)
- Fuel standoff (X_TACTREACH, included in v45): the tactical plan search burned ~50k fuel whenever enemies were
  visible but out of reach; routing (36k) and camp actions (42k) then never ran. Both teams froze on elk_arena.
- Shop plan cap: the Bruiser tail stopped at 40+40 shards; in rich games X_SHOPRECALL then recalled forever
  (44% of turns recalling vs tm30 on hooks). Open-ended now. Local: 245/280 (was 231).

### Remaining v45 losses
- Brawl maps (swirl, elk_arena, hooks, packs, fragment, reverse_spiral): 25-63 deaths. Pattern (swirl trace):
  a 4-champion enemy group; our low champion flees 1 tile/turn under ranged fire; a help call pulls a
  full-HP Heart alone into the 4. Outnumbered-by-2+ deaths 5.3/game.
- Quiet maps (split, rows, broken_curve, big_world, lanes): same captures per 100 rounds (4.2) but fewer gems per
  capture (9.1 vs 10.3). On split the opponent farms its golem cluster (64 gems) from round ~250; we take ours
  late or never: the solo incoming-damage estimate kills its score and no ally claims first.

### Local checks for the next iteration
- X_GOLDW 0.25 / 0.15 / no gold groups: no gain (more gems, more deaths); kept 0.5.
- X_THREAT (power-ratio retreat): -19 net (226 vs 245), -12 vs v43x. Rejected; replaced by X_OUTNUM (count-based).
- X_FIGHTRISK 0.7: identical to 0.95 (+1/-1).

## v46 = v43x-C2 (shop-plan fix) and v47 = v43x-D (+ gold decay at 25 shards)
| run | near (rank 53-63) | rank/2 (24-33) | paired vs previous |
|---|---|---|---|
| v44 B | 22/50 | 16/50 | - |
| v45 C | 31/50 | 17/50 | +18/-8 (p=0.08) |
| v46 C2 | 33/50 | 23/50 | +11/-3 (p=0.06); vs v44 +25/-7 (p=0.002) |
| v47 D | 34/50 | 24/50 | +10/-8 (noise) |
- The v45 shop cap caused 13 recall-loop games (8 losses: rows x2, the_farm, yellow_brick_road x2, gold_rush x3);
  in rows/the_farm we held enough carried gems to win but never tributed.
- v47 maps lost 3/3: split, rushbait_v2, quadrants, lanes. Quadrants: opponent first capture r27 vs ours r200;
  Heart/Vendetta die by r60 on the ENEMY half (camps eligible up to 4 tiles closer to the enemy spawn; spawns 4 apart).

## Docs review (2026-10-21, user request): mechanics and our use
- Tribute channel continues under damage (only stun, death or a NEW altar lock cancel it).
- Altar lock (10g, carry 1): placing cancels enemy tributes at that altar; 5 basic attacks clear it; an already
  locked altar cannot be locked again; own lock does not block us. Opponents place ~2.8/game; we placed 0.
  -> X_LOCKATK / X_LOCKDEF implemented (local: -3 / -6, noise; locks placed ~3.3/game).
- Camp groups respawn only when all their spawn tiles are free; contested capture regions reset. (unused)
- Spawn tiles: enemies cannot enter; standing there heals at turn end. Recall 5 turns (3 with Home), damage cancels.
- Teleport crystal: 3 tiles ignoring terrain, 3-turn channel, damage does not cancel (Tung 7.7/game; unused).
- Marcella +2 gold per tributed gem; Vesper +33% gold; kill = 100 gold + carried gems; 60-round respawn.
- Wards: one per champion, 6-tile vision, 10-turn recharge (ours 112/game, opponents 259/game).
- Round-2000 tiebreak: tributed gems, then gold earned all game, then kills.

## Local checks after v47
- X_OUTNUM (count-based retreat): -14, deaths up 4.81->5.29, captures down. Rejected.
- X_BIGCOMMIT (likely helpers for big groups): -14, captures 781->710. Rejected.
- X_GROUPR cohesion: all maps -24 (r8) / -15 (r12); 3-pick maps only (g8s) -2.

## Bug found via the Home-emblem test (2026-10-21)
- farm(): "recall during the capture" (Mite trick) starts a recall 1 turn after stepping on a cleared camp so the
  5-turn recall and the 5-turn capture finish together. With a Home emblem (recall 3) the champion left before the
  capture completed: X_HOME local -40 (captures stopped after ~r500 on expanse). Fixed: wait 3 turns with Home.
- Fight initiation before our deaths (v47): we hit first 40%, they hit first 53%, no champion hit 7%;
  Fish: 30% / 33% / 37% (most Fish deaths are to camps; Fish kills 19.4/game, 16 on its own half).
- Pre-death activity (v47): fighting 62%, fleeing 13%, channel 11% (mostly failed recalls with 0 gems).

## v48 = v43x-E (submitted 2026-10-21 22:26 UTC)
- X_SAFEDASH: a low-HP retreat dash never lands nearer a visible threat. v47: 153 of 1150 low-HP dashes landed
  nearer the nearest enemy; 42% of those champions died within 6 rounds (12% otherwise). Local -1.
- X_BOSSRAID (boss-only maps, i.e. contest): meta draft + Tung builds; from round 400 (or 1600 max HP) the team
  melees the monolith together (the boss bot used to cast only from range 4 and only casters with Focus >= 150, so
  melee raiders never hit it). procless/Tung kill 5-6 monoliths per contest game (procless: build to ~2000+ HP,
  raid from ~r600). Local contest: 800-1000 vs mimics; stealers (tm30/v27/v43x, X_BOSSSTEAL) take some kills.
- Rejected locally (all mostly lose to v43x, the aggressive mirror): X_RALLY (r12 -2, r8 +1), X_SIDESLACK 0/1/2
  (-3/-7/-3), X_GROUPR on 3-pick maps (-2), X_RECALLSAFE 9 (-6), X_FOEMEM 3 (-10), X_LOCKATK (-3/-7),
  X_HOME (fixed: -10), combos (-6 to -11). Pattern: changes that make us retreat more lose to aggressive opponents.

## v48 = E result: near 31/50, rank/2 22/50 (v47: 34/24; paired +9/-14, p=0.4)
- Contest 0/3 (0-1000, 0-1000, 0-600): the raid never got going; we lost the fights (deaths 82/3, 40/23, 36/2) with
  1000-1400 HP champions. v47's caster team also lost contest fights (64, 112 deaths) but stole one win.
- X_SAFEDASH mechanically right: low-HP dashes landing nearer an enemy 153 -> 39, deaths after them 64 -> 12.
- Deaths 10.9 -> 10.3/game, kills 12.1 -> 8.9/game.

## v49 = v43x-F: E without X_BOSSRAID, plus X_FOCUS (shared focus target in shared byte 5; local -4, ~10 discordant).

## v49 = F result: near 30/50, rank/2 21/50 (v47 34/24, v48 31/22). Totals: v44 38, v45 48, v46 56, v47 58, v48 53, v49 51.
- Over v46-v49 (12 games per map): lanes 0/12, split 0/12, rushbait_v2 1/12, broken_curve 1/12, shortcut 1/12.
- Split: our scoring ranks gold-rich wolf groups (15g+150 gold scores 1.25) far above the 64-gem golem (0.11) and the
  33-gem elk (0.14) group: gold counts 0.5 gem and solo incoming damage discounts big groups. The opponent takes the
  33/64-gem groups from ~r240 and later our side's 25/64-gem groups.

## v50 = v43x-G: v47 (D) + X_GOLDW 0.3 and x0.5 from round 250 (X_GOLDT); X_SAFEDASH/X_FOCUS/X_BOSSRAID off.
- Local 35 maps: 246/280 vs 242 (+12/-8), vs v43x 54 vs 48; problem maps (lanes/split/rushbait/broken_curve/
  shortcut/quadrants) 41/48 vs 38/48, margin +64.
- Holdout (user: avoid overfitting): 23 archived map versions (workspace/maps_holdout) x tm30/v43x/mimic-shink/
  mimic-whim: 165/184 vs 166/184 (+9/-10), gem margin +40. tools/field_eval.mjs now accepts ../maps_holdout/<name>.

## v50 = G result: near 34/50, rank/2 25/50 = 59 (best). Paired vs v47 +15/-14. lanes 0/3, split 0/3 still.
- Split with G: we now take MORE >=25-gem groups than the opponent (24/22, 21/16, 30/17) but still lose close races
  (one game 580 vs 514 at r600, lost 803-1012).
- Rank/2 fights (fight_analysis): we deal more damage (2.41M vs 1.50M HP) but kill less (264 vs 431); outnumbered far
  more (1v2 202 vs 2v1 127, 1v3 79 vs 26); their support per fight 0.56 vs ours 0.30; they shield 0.54/fight (0.30)
  and stun 0.15/fight (0.01).

## v51 = v43x-H (G + X_RALLY range 8): near 32/50, rank/2 17/50 = 49. Paired vs v50 +6/-16 (p=0.05).
- Rally fed champions into fights: deaths 11.6 -> 12.7/game, OUR gems dropped 54 -> 188/game (carriers < 44 gems
  join), even/outnumbering deaths up (1.60 -> 2.24, 0.79 -> 1.10), kills unchanged. Rally off again.
- X_FIGHTSHIELD: identical local results (never triggers; the planner already uses shields inside plans).
- v50 re-activated (set-active 2026-10-22 ~01:50 UTC) so ranked games use the best version.

## 2026-10-22: user direction - exactly 100 challenges per variant; build on v47 (ranked peak 1868)
- Ranked per version (20 h): v47 20/32 series won (91-69 games, 1787 -> 1868); v50 16/38 (87-103, 1854 -> 1794).
  The challenge runs (20 groups) had not separated them; ranked did.
- Engine 1.0.3 went live (~07:50 UTC) with CLI 3.0.5 (installed; tools/engines/v1_0_3.wasm). Rules text: awake camps
  sleep after 2 turns with no target in range (was: 2 turns without damage). Local results were bit-identical.
- procless (rank 1 now) uses our exact draft and Tung build; differences are behavioural: 4.9 vs 4.0 captures/100r,
  32 vs 59 steps between own captures, 33% vs 21% capture->capture segments without tribute/recall, net worth +37% at
  r500, deaths 3.5 vs 11/game. Heal recall (X_HEALRECALL) helped on G but not on v47.
- v47p = v47 (v43x-D source) + X_COMMITDIST 12 (keep a still-valid target within 12 route steps; not on gated maps).
  Local 40 maps +5 (280 vs 275), holdout +4 (170 vs 166). Uploaded as v53; 100 challenges: platform/c100_v47p
  (25 teams x 2 near rank 54-79, 25 x 2 near rank/2 22-46; 40 maps rotating).
