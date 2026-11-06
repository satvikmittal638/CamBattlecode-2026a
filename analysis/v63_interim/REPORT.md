# v63 platform games, interim analysis (first 50 of 100 challenges, 250 games, 2026-10-24)

v63 = workspace/bots/v58s (v58 + low-HP self-shield, camp-aware retreat, keep withdrawal). Our rank 77.

## Results

| pool | opponents' ranks | challenges won (>=3/5) | games won | heavy losses (>=500 gems, not contest/boss) |
|---|---|---|---|---|
| near | 64-114 | 12/25 | 64/125 | 22 |
| half | 13-63 | 2/25 | 26/125 | 61 |

Pass thresholds for the full 100 are >34/50 (near) and >28/50 (half); v63 is on course to miss both.
Special maps 00contest / 01boss_battle: 0/14. Worst maps: 00contest 0/8, 01concentrated_wealth 0/6,
00road_of_riches 0/5, 01boss_battle 0/6, 00fragment 0/7. 63 games were mirrors of our exact draft
(Ryth, Vesper Vale, Heart, Vendetta, Marcella): 21 wins, 25 losses, 17 heavy.

Fidelity: the local v63 build reproduces 96.3% of its platform decisions in turnhost shadow mode
(`shadow/summary.json`), so the decision audit reflects what v63 did.

## The v63 fixes are active

Per heavy-loss game (v58: 29 games, v63: 83 games; opponents differ, so compare rates):

| | v58 | v63 |
|---|---|---|
| Heart shield ready but unused (<50% HP, threat) | 26.0 | 4.7 |
| Heart shield used in that situation | 3.7 | 8.6 |
| idle with an enemy within 2 | 58.8 | 35.6 |
| low HP inside an awake camp's range | 15.4 | 11.3 |
| our deaths | 22.4 | 19.4 |

They do not address what decides the heavy losses.

## Where heavy losses are decided: the opening, on our half

Timeline (`timeline.mjs`, mean per game):

| round | heavy: gems ours/theirs | heavy: deaths ours/theirs | wins: gems ours/theirs | wins: deaths ours/theirs |
|---|---|---|---|---|
| 100 | 23 / 49 | 1.0 / 0.3 | 32 / 29 | 0.5 / 0.8 |
| 200 | 44 / 107 | 2.5 / 0.7 | 71 / 64 | 1.0 / 1.5 |
| 300 | 64 / 173 | 4.2 / 1.0 | 118 / 100 | 1.5 / 2.3 |
| 600 | 128 / 410 | 9.5 / 2.0 | 309 / 229 | 2.9 / 4.7 |

Median round at which the opponent first leads by 100+ gems: 301 in heavy losses.

Camp captures by round 200 (`territory.mjs`, gems per game):

| | ours on our half | ours on their half | theirs on our half | theirs on their half |
|---|---|---|---|---|
| wins | 56.5 | 13.1 | 17.8 | 49.2 |
| losses | 52.1 | 11.1 | 18.8 | 82.6 |
| heavy losses | 40.6 | 7.3 | **39.5** | 64.7 |

Opponents that beat us heavily take as many gems from our half as we do in the first 200 rounds.

Opening deaths (`deaths_heavy.jsonl`, deaths before round 150 in heavy losses): 152 deaths in 64 of 83 games,
479 carried gems lost. 69 of 152 victims had no ally within 6 tiles; 2-4 enemies within 6 was typical; most died
6-20 tiles from home; camp damage (Elk 179 hits, Wolf 66) is a top source alongside enemy basics, i.e. our
champion is fighting a camp alone when the enemy group arrives.

Cohesion, rounds 20-200 (`grouping.mjs`): opponents in heavy losses keep a nearest teammate at 5.1 tiles (38%
alone >4 tiles) vs our 6.2 tiles (46% alone). Our spacing is the same in wins (5.8, 43%); the opponents who
crush us are the ones that move in groups.

Whole-game death recaps (83 heavy losses): 21.7 deaths and 77 carried gems lost per game; damage mostly from
Vesper Vale basics (28%), Vendetta basics (18%), Heart dash (13%), Marcella spell (12%); 1-2 attackers usually.

## Conclusions

1. The decisive weakness is opening territory defence: we farm our half one champion per camp; grouped
   invaders kill the lone farmer (often mid-camp-fight) and take the camp. The gem gap opens by round 100.
2. Opponents also clear their own half faster (64.7 vs our 40.6 own-half gems by round 200 in heavy losses).
3. Special maps (contest, boss_battle) remain 0/14 (Codex F02).
4. The no-plan/idle repairs that won rollouts lost full games; the fight-level fixes shipped in v63 work but are
   second-order to (1).

## Next candidates (to test with field_eval + turnhost rollouts before any submission)

* Home-half defence: when enemies are seen on our half near a camp we are working, converge allies within
  reach (fishx X_RALLY / X_BIGCOMMIT exist, default off) or abandon the camp fight before the invaders arrive.
* Opening pairing: farm the first camps in pairs on maps where the enemy can reach our camps early.
* Faster own-half clear order (compare opening capture schedules with the top opponents' replays).

## Verification against replay events (evidence.mjs), and corrections

Event-level extraction (every capture with team, tile, spawn-distance depth and who was near; every death with nearest
ally, enemies within 6, hitters and whether the victim was attacking a camp), rounds 1-200:

* Confirmed, and it replicates out of sample (second 250 games): in heavy losses the opponent takes the contested
  middle (|spawn-distance margin| < 2): 33.6 / 35.9 gems per game vs our 8.8 / 8.5; in wins 14.5 / 17.5 vs our
  20.9 / 20.2. Their first middle capture: round 54 / 56 vs ours 99 / 70 (wins: 72 / 80 vs 74 / 72).
* At enemy middle captures they have 2.8 champions within 6 (82% with 2+); our nearest champion is ~12 tiles away.
* Corrected: they are mostly not stealing camps we had damaged (16 of 162 middle captures); they reach and clear
  the middle first while we clear our deep side.
* Corrected: early deaths are not "while fighting a camp" (7 of 206); they are champion fights: 64% hit by 2+ enemy
  champions, 47% with no ally within 6, 70% on our half.
* Added: 63 deaths carrying 30+ gems lost 3070 gems (half of all gems lost in heavy losses); carriers were alone
  (36/63) against 2+ enemies (51/63), kept trading, and almost never tributed or recalled.

Concrete examples: 00lost_world vs hello (r43-73 five enemy middle captures with 3 enemies each, we capture deep),
00road_of_riches vs PtitLK (r38/r56), 00gemfight vs Noobot (we take a 78-gem middle camp at r48, Ryth dies at r78
carrying all 78 to three enemies).

## Fixes (workspace/bots/v58x switches) and tests

* X58_DENY / X58_DENYSCALE / X58_DENYROUND: gem groups both teams reach in similar time score
  x(1 + DENY * exp(-|dEnemy - dOwn| / 4)); opening only (round < 300).
* X58_BAGRISK: carrying 30+ gems, danger weight x(1+BAGRISK) and burst-escape threshold /(1+BAGRISK).

Tests on the exact platform games (turnhost, branch at round 1, opponents replay their recorded opening):

| test | v63 | DENY 2.0 <300 | candidate (DENY 2.0 <300 + BAGRISK 1.0) |
|---|---|---|---|
| scripted opponents, 200 rounds, gem swing (236 games) | -17.5 | (all-game 2.0: +43.8) | |
| hybrid: recorded opening to r100 then v63 bot, 400 rounds, first 250 games | +6.8 | +48.1 | +51.5 |
| same, second 250 games (out of sample) | +15.2 | | +51.0 (heavy +67.7 29/14, loss +19.5 24/24, win +31.4 48/29) |

Big-bag pre-death states (44): focal deaths v63 68.2% -> 65.9% (bot opponents), 100% -> 84.1% (scripted).

Full local games (release, 22 pool+holdout maps, both sides):

| opponents | v63 | candidate | flips |
|---|---|---|---|
| codex-v57, 4 mimics, prism-v58-control, v58x_d20 rusher (308 games) | 232 | 226 | +18/-24 |

Local opponents rarely contest the middle (codex-v57/prism take ~9 middle gems per game by r200 vs 34-36 for the
platform teams that crush us), so the local suite cannot show the targeted gain; the slight local deficit is within
noise (sign test p ~ 0.4) and comes from codex-v57.

Submitted as **v64** (workspace/bots/v58d, build tag v58d-deny-bag), active 07:51 UTC; the same 100 challenges as
v63 (platform/c100_v63/specs.json) are running for a paired comparison: platform/c100_v64.
