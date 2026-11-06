# Attempt 2 (v97 = workspace/bots/v62y) and the bugs it exposed (2026-10-26)

v97 = v62 + 84-wide item buffers + gated-map fixes (union detection, normal draft, r600 team assault, bank stall)
+ M62_FLEE. Played 13:51 UTC on the exact attempt-1 specs (same 50 opponents, maps, sides). Our rank at launch 113.

| pool | v62 challenges | v97 challenges | v62 games | v97 games | margin | heavy losses |
|---|---|---|---|---|---|---|
| near | 21/25 | 21/25 | 86/125 | 84/125 | +230 -> +214 | 17 -> 19 |
| half | 4/25 | 7/25 | 35/125 | 44/125 | -254 -> -189 | 45 -> 38 |

Paired games: +33 / -26 = +7 (half +19/-10, near +14/-16). 02guardians 1 win (200-0); 01boss_battle still 0/4.

## Bugs found in the v97 games

1. **Fuel starvation of flee (new, serious).** 201 fuelExhausted events and 194 "suspended" turns (v62: 0 and 0);
   2,386 turns aborted by the fuel guard (v62: 126) - stages m62-flee 719, route 632, fight 608, farm 216,
   x-melee-parting 187. Trace (turnhost, 5 games): flee turns median 74.9k fuel. Cause: the flee check sits after the
   full tactical action enumeration (most of a turn's fuel) and then runs a route search + parting-hit scan + dash
   search. It also explains the local "fleenull" result: in v97 flee often could not even pass its enough(30000) check.
   Note: field_eval trims statistics unless --keep-full-stats, so local runs never showed fuel exhaustion.
2. **Gate race.** We start hitting the gate at r603-610 (as designed) and land most of the hits (e.g. 400 vs 27), but
   the opponent arrives fresher, captures and banks first (boss_battle 0/4, guardians 1/3). Strategic, not fixed.
3. **Stuck champions (user observation confirmed).** 13/250 games have an idle streak >= 40 rounds (yellow_brick_road 9
   champion-games, boss_battle 4, 02crossing 4, the_line 3, elkring 2, ...). Tagged traces of farm():
   - `farm-x-cs-contested` (1,767 of 2,334 stall turns on yellow_brick_road): the champion holds a capture tile of a
     map-wide group while an unseen enemy holds another tile of the same region -> contested forever.
   - the clearing / unknown-state branches use the group's own tiles as the goal -> no-op while standing on one.
   - standoff freeze (other maps): 3+ enemies in view, tactical evaluation spends 70-77k fuel, finds no plan, and then
     route (needs 36k) / farm (needs 28k) cannot start -> no action for dozens of rounds.

## Weak maps (both attempts, controlled for pool)

Lost to near-pool teams: 00swirl 2/8, 02cuts 1/6, 00breadcrumbs 3/8, 00gemfight 3/8. 0/8 vs half pool: 00road_of_riches
(-911), 01boss_battle (-1250), 00monolith, 00rushbait_v2, 01big_world, 01broken_curve; 00ribs 1/8 (local 40%).
Two failure types: economy (few deaths, 2-4x slower early gems: big_world 29 vs 109 by r200, broken_curve 34/90, cuts
44/92, road_of_riches 60/150 - opponents clear rich Elk groups near OUR spawn with two champions at r~70) and combat
(swirl deaths 33/16, ribs 30/10, monolith 22/4, stalactites 15/4, gemcombat4 12/2).

## v62z (workspace/bots/v62z = v62y + fixes)

* Flee decided early (before the enumeration) with a cheap kill test; shared fleeMove(): routed walk to an ally only
  with >= 55k fuel, else one cheap step from the known neighbour tiles; parting hit only with >= 45k. Trace on the same
  5 games: turns >= 95k fuel 325 -> 61, unlogged (exhausted) 175 -> 1, flee median fuel 74.9k -> 51.5k, flee fires on
  2105 turns (was 1077: v97 was starving it).
* M62_FARMFIX: clearing branch with no live member in sight -> unseen tiles of the group, else drop the spent group and
  step off; unknown-state branch on its own tile -> same; capture held > 8 turns that the engine does not report as ours
  -> drop; contested > M62_CONTESTMAX (20) turns with no enemy champion within 8 -> leave (stall 30 rounds).
* Validation: `fe_y` (v62y) vs `fe_z` (v62z), 5 opponents x 70 maps x 2 sides, --keep-full-stats.

### v62z result: regression (-75), two bugs in my own fixes

`fe_y` 448/700 (gem margin +135) vs `fe_z` 373/700 (+54); paired flips +86 / -161, every opponent negative.
Fuel fix itself worked: our fuelExhausted 573 -> 5 in 700 local games (field_eval with --keep-full-stats does show
it). But deaths 4,304 -> 4,773 and kills 5,907 -> 5,600, camp clears 36.8k -> 35.8k.

Method (cheap, no new games): `divergence.mjs` finds the first event by our team that differs between the paired
deterministic games; `divergence/shadow_*`: the trace build of the new bot shadowed over the recorded v62y games
(batch_shadow, 247 flipped games, ~2 s each) gives the stage tag of every turn where the new bot would act differently.
First divergences of the 161 lost flips: m62-flee 54, m62-farm-spent 49, v1-camp-actions 39 (knock-on state).

1. **farm-spent broke the capture walk.** After a cast kills the last camp of a group, v62 moves onto the group's tiles
   (goal = its tiles) to start the capture; that "no-op goal" was the capture walk, not only the yellow_brick_road
   stall. v62z declared the group spent and walked off, giving up the reward. Fix (v62w): ask the engine's live group
   state; only when it is still *alive* walk to its unseen tiles; otherwise v62 behaviour.
2. **Early flee lost kills.** Its kill test only covered targets within range from the current tile; the enumeration
   also kills after one step (and the Heart landing cast ran before the late check). Fix: early flee placed after the
   Heart block and its kill test gets +1 range for basic attack and spells (and double basic with a reset spell) -
   conservative: a doubtful kill falls through to the full plan exactly like v62y.
3. **The cheap flee step dropped the dash.** v62y fled by moveToward(ally, allowDash) or moveAway (step + dash home).
   v62z took a single cheap step before moveAway, so escapes were 1 tile instead of a dash. Fix: v62y's order with fuel
   guards (route >= 55k, moveAway >= 40k), the cheap step only as the last resort. At the early flee point 60-70k fuel
   remains, so the dash is affordable.

Shadow on the 247 flipped games (identical decisions to the v62y recording): v62z 92.3%, v62w 94.7%; flee turns
where v62y hit and the new bot did not: 1,410 -> 71; remaining flee differences are mostly v62y doing nothing for lack
of fuel (4,370 turns, the intended fix). 46,847 mismatch turns are v62y's action list cut short (fuel) and v62w
completing it.

### v62w (workspace/bots/v62w) = v62z with the three fixes above

`fe_w`: 280 games (nova_f84 + prism58_f84, 70 maps x 2 sides), paired with v62y's games in `fe_y`:
v62y 195/280 (+180), v62z 162/280 (+86), **v62w 197/280 (+195)**; flips vs v62y +36 / -34. Our fuelExhausted 262 ->
7, kills 2,186 -> 2,263, deaths 1,536 -> 1,649, camp clears 15,175 -> 15,034.

Stuck champions (behavior.mjs, now `--results <fe>/results.json --opps ... --out ...`): champions with an idle run >= 40
rounds 57 -> 30; oscillation episodes 3,859 -> 1,491. yellow_brick_road idle runs 930 / 726 / 524 / 350 -> max 99.
Platform recordings (shadow of the v97 games, recorded idle runs >= 20): v62w would act on 74% of the YBR stall turns
(v62y 0%), 18% of the other stall maps. Remaining causes there:
- contested holds (`farm-x-caphold-cs2`, 00the_line): an unseen enemy on another tile of the same region; v62w leaves
  after M62_CONTESTMAX (20) turns.
- **standoff fuel starvation (not fixed)**: 3+ enemies in view at ~6 tiles. Fuel checkpoints (trace build, `fcp` log
  line): updateKnowledge 9k, enemy/ally bodies 11k, plan enumeration with no plan 23.5k, legacy fightChampions scan
  13.5k -> farm starts with < 28k and returns (02crossing: three champions idle 140 rounds; both teams frozen).
  Tried M62_STANDOFF (skip the legacy scan when no enemy within 5 - it cannot act there): the freed 13.5k lets route
  start a search it cannot finish -> 357 turns exhausted in the 7 stall games. Switch kept at 0. A real fix needs the
  turn budget restructured (e.g. alternate standoff turns between the plan and routing), which is a behaviour change
  that local opponents cannot validate (only nova_f84 creates standoffs locally).

Local whole-team freezes vs nova_f84 (02treasure-box a 0-0 for 2000 rounds -> Team B wins the tiebreak; 00quarry,
01elk-arena, 01starfish) are mutual standoffs with that old bot; platform teams scored on those maps in both attempts.
Not fixed (opponent-specific).

## Weak maps: the economy vulnerability

Platform (both attempts, collections by r200): opponents clear the Elk-guarded rich groups next to their spawn early
and we do not clear ours: 01big_world their spawn Elk (15 gems) r24-30 and Elk+Elk group (41) r72-105, ours r66-122 and
never by r200; 01broken_curve their Elk+Elk (44) r91, ours never by r200; 02cuts their 29-gem Elk group r83-115 and lone
Elk (15) r154-182, ours r243+. Gems by r200 19-49 vs 53-176. `mapcamps.mjs <replay>` prints a map's groups.
Local 02cuts (v62y): side a 3/5, side b 0/5 - side a reaches the centre gem field at r104, side b at r221-275.

Cause in scoreTargets: an Elk group (2,400-2,880 HP) solo gives incoming damage >> usable HP, score x q^2, and the pack
bonus needs X_PACKMINHP 4000, so nobody claims it first and no pair forms.
Test `fe_econ` (10 economy maps x 2 sides x nova/prism58/v63, 60 games per variant, new switch M62_BIGCOMMIT = the
existing X_BIGCOMMIT with the M62_PACKHP threshold):

| variant | wins | gem margin | our gems r150 / r200 | rich captures by r250 | vs base |
|---|---|---|---|---|---|
| base | 35/60 | +37 | 46 / 64 | 2.4 | |
| PACKHP 2000 + BIGCOMMIT | 29/60 | +46 | 58 / 76 | 3.0 | +7 / -13 |
| + NOSOLO 1.0 | 30/60 | -4 | 54 / 74 | 3.0 | +10 / -15 |

Pairs do form (+19% gems by r200, more rich captures) but wins do not follow and the effect is map-dependent
(02cuts / concentrated_wealth / corners up, road_of_riches / broken_curve down). Not adopted (switches kept at 0).

## Final check and state (2026-10-26)

`fe_w2` (v62w vs v63_f84, 70 maps x 2 sides, M62_BIGCOMMIT = M62_STANDOFF = 0): 85/140 (+116) vs v62y 91/140 (+166),
paired +13 / -19. Over all 420 paired games (nova, prism58, v63): **v62w 282, v62y 286** (+49 / -53) - level within
noise (sd of the paired net ~10). Deaths +3% (v63) / +7% (nova+prism), kills equal / +3.5%, gems lost on death -6.5%
(nova+prism). Our fuelExhausted 335 -> 7.

v62w = v97 (v62y) + fuel-cheap early flee (with v97's routed/dash escape order) + M62_FARMFIX (engine-state checked)
+ contest-leave. Off switches added: M62_BIGCOMMIT, M62_STANDOFF. Trace build: workspace/bots/v62wtrace (PHASE2_LOG 2,
farm-x-* tags incl. capture state, `fcp` fuel checkpoints). No platform attempt was used for v62w.
