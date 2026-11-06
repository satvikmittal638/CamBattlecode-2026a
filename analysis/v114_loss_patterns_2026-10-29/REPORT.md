# v114 losing patterns — 29 October 2026

The dominant pattern is a reinforcing combat/economy deficit: an early equipment disadvantage, repeated bad fights or failed disengagement, long death downtime, and progressively less access to gem camps. Carrier losses and banking priorities decide some additional games. A severe planning stall exists on one map, but ordinary idle time is not a general explanation for the losses.

Scope: all **35 losses across 35 maps and 18 opponents** in the existing v114 archive, compared with its **34 archived wins**. Every replay uses engine 2.0.0. The archive takes one match per map, mixing ranked and unranked games; these are observational comparisons rather than a representative ladder sample or controlled ablation. No bot source was changed and no new matches were played.

All 69 games were replayed through the existing decoder. The existing fight/death tools were supplemented with exact champion-turn state queries, corrected capture attribution, and per-game resource/checkpoint accounting. Four selected cases were rendered and visually inspected without a browser.

## Main measurements

Means below compare v114 with its opponent **within the 35 losing games**.

| Measurement | v114 | Opponent |
| --- | ---: | ---: |
| Champion body deaths per game | 15.11 | 4.34 |
| Champion kills per game | 2.54 | 13.97 |
| Share of champion turns dead | 17.9% | 5.2% |
| Captured gems per game | 574 | 974 |
| Captured gold per game | 3,197 | 4,855 |
| Gold + equipment purchase value at round 300 | 721 | 1,186 |
| Equipment purchase value alone at round 300 | 567 | 1,006 |
| Carried gems dropped on death per game | 156 | 49 |

Captures include all actual reward deltas on the relevant champions, regardless of the Capture event's team field. Equipment is valued at purchase cost, including Greed's special cost; this is a resource proxy, not a claim that champions can liquidate it. Body deaths and kills differ for linked Cassi/Issac deaths.

In the 34 wins, v114 averages 5.82 deaths, 43.65 dropped gems, and 5.8% dead turns. Among the nine opponents represented in both outcomes, the same contrast remains: 14.19 deaths per loss versus 6.30 per win. Map and opponent-version differences still prevent a causal interpretation of those comparisons.

## 1. Bad fight selection and failed disengagement are the broadest loss pattern

- v114 has fewer champion kills than its opponent in **33/35 losses**; **21/35** involve at least ten own deaths.
- There are **529 own deaths** in the losing games. **286 (54%)** have no allied body within six tiles, and **260 (49%)** have more enemy bodies than self plus nearby allies within that radius. These are omniscient spatial counts at death, not claims about the champion's personal vision.
- The existing death-action tool finds movement in the last four rounds before **95%** of own deaths, attacks/casts in **78%**, and attacks from at least two different enemy champions in **55%**. Thus most deaths are not explained by doing nothing.
- **394/529** victims had at least two observed turns below 35% HP in the last four-round window. This shows a substantial failed-disengagement component alongside burst deaths. It does not mean that merely raising the threshold will solve the problem.
- **369/529 deaths (70%) occur on our own half** by spawn-distance comparison. Many opponents are pushing into our farming area; this is broader than over-invading enemy territory.

Visual examples:

- [01elk_arena, rounds 24 and 28](images/01elk_arena.png): enemy Vesper, Willow and Heart repeatedly focus Ryth. Our Heart withdraws, while Vesper/Ryth attack different opponents. Ryth falls from 840 HP at round 24 start to 136 at round 28 start and dies during round 28. This repeats later; the match ends 0–1,008 with 38 own deaths.
- [02treasure_box, rounds 44–48](images/02treasure_box.png): our Ryth remains exposed to the enemy ranged line as the other champions separate. The opponent has Cassi/Issac and Willow, giving six bodies plus healing against our fixed five-body roster. Ryth dies at 48; the game eventually contains 43 own deaths. The draft difference is one case, not proof that a particular alternative draft would win.

Relevant code: `src/v1_tactical.h` estimates bounded replies and values local allied support, but is not an exact coordinated team planner. Its `outmatched` test uses summed nearby HP. `src/bot.cpp:704` switches ordinary recovery on below 35% HP; the recovery movement uses separation/home heuristics. `fightChampionsFull()` retains a legacy approach/attack fallback for a missing tactical answer. The visual failures are consistent with local HP/support estimates and individually chosen targets failing to represent effective ranged focus fire and a coordinated retreat. Determining which branch causes each engagement needs targeted replay/shadow tests.

## 2. The early economy deficit develops into loss of gem access

- By round 300, v114 trails in gold plus equipment value in **29/35 losses**, but only **5/34 wins**.
- In losing games, it has about **39% less** gold-plus-equipment value at round 300 than the opponent; equipment already purchased is about **44% lower**.
- The opponent captures more gems in **32/35 losses**. In **31/35**, our total camp-captured gems never reaches 1,000. This does not rule out winning through steals, but shows why saving existing bags alone cannot explain most defeats.
- **386/529 own deaths carry zero gems.** Their main cost is the 60-turn respawn and lost farming time, rather than a large bag transfer.

The data support a feedback loop: losing early fights and farming access reduces equipment, which worsens later fights and further reduces access. They do not establish one universal first cause. A simple “buy the gold sitting in inventory” explanation is insufficient: at round 300, losing teams hold 154 gold unspent versus the opponent's 179; much of the deficit is resources never earned.

Examples: `01elk_arena` captures zero gems despite 3,283 gold from captures, while the enemy obtains 1,008 gems and 10,030 capture gold. `00packs`, `00ribs`, `00oasis` and `02arena` similarly combine very poor gem throughput with repeated champion deaths.

Relevant code: `src/v1_cycle.h` scores mostly own-side resource groups using projected clearing time, damage and allied arrivals. `src/draft.cpp` always selects the same roster for a given team size. `shop()` always follows its economy/defense-first sequence. These mechanisms need to be evaluated together under early pressure; none was ablated here.

## 3. Gold acquisition sometimes succeeds while the gem objective still fails

There are **six losses** where v114 earns more capture gold but fewer capture gems than the opponent: `00swirl`, `00galaxy`, `02uncharted_lands`, `02crossing`, `02cuts` and `00split`.

The cleanest example is `02cuts`: only **one own death**, 5,352 capture gold versus 4,024, but 802 captured/banked gems versus 1,010 captured and 1,006 banked by the opponent. `02uncharted_lands` similarly loses 615–1,039 despite a 3,654–2,395 capture-gold advantage and four own deaths.

These cases show that avoiding deaths is not sufficient. Resource selection, allocation between champions, clear speed, capture ownership and delivery efficiency also matter. Higher capture gold alone does not prove that we chose more gold-only camps: Vesper/Treasure bonuses and reward sharing affect it. The narrower, supported conclusion is that our economic advantage does not reliably become gem throughput.

Relevant code: gold contributes 0.5 gem-equivalents per gold to target scoring, falling to 0.15 after 25 shard-equivalents; groups with allied commitments get bonuses; a nearby valid ordinary task is retained. Those are candidates for controlled gem-throughput tests, rather than reasons to blindly reduce all gold farming.

## 4. Carrier protection and endgame priorities throw away additional opportunities

**Bag loss:** 15/35 losses drop at least 100 gems through deaths. The mean is 156, but the median is 66. `01boss_battle` is a large outlier: 1,312 gems captured, only eight banked, and 1,906 gems dropped across repeated carrier deaths. Dropped totals can count the same gems again after they are stolen back. Excluding that map, the remaining losses still drop about 105 gems per game.

**Shopping before urgent banking:** [01broken_curve visual sequence](images/01broken_curve.png) provides a particularly clear decision-order failure:

1. At Vesper's round-1069 turn start, it is full health (6,400/6,400), has 200 gems and 447 gold. Scores are 777–929; an ally holds another 44 gems.
2. Vesper recalls to shop. It reaches spawn and buys equipment at 1074.
3. It walks/dashes back and starts a 20-tick tribute at 1087.
4. At its round-1100 turn start it still has seven channel ticks left. The game ends 836–1,013, with all 200 gems still carried.

A BFS of the exact round-1069 state finds an **eight-step ordinary walking route** to an altar approach, blocking walls, holes, altars, enemy spawn and every currently alive unit/camp. The route is drawn in green. That is feasibility in the observed frame, not a simulation of subsequent enemy movement; it supports a real routing opportunity without proving a counterfactual win.

The source ordering is concrete: the early winning-bank check in `play_step()` requires **this champion's** bag to finish the game. The safe 150-gold shopping recall runs before `doTribute()`. The “enemy has 900+” urgency check is inside `doTribute()`, so shopping can bypass it. Here the teammate's 44 gems do not make the 200-gem carrier trigger the earlier individual winning check.

Other close examples: `01islands` ends 942–1,014 while carrying 58, exactly 1,000 banked plus carried. `00collision` reaches 1,000 banked-plus-carried before the enemy at round-level checkpoints, loses a 66-gem Heart carrier, and ultimately loses 996–1,000. Merely having enough gems does not mean there was time or a safe route to bank them, but these endings warrant explicit delivery planning.

**Unsafe channel persistence:** the previously traced `02stalactites` Marcella death loses 168 gems during an unprotected tribute. Only two losing replays contain deaths whose latest native turn observation is a tribute channel (234 gems combined); this is a concrete bug, but a minority of the observed losses. The early channel return in `play_step()` prevents ordinary recovery/combat from reevaluating the threat.

## 5. A severe recovery-to-task stall exists, but is map-specific

[00lanes frames](images/00lanes.png) and `lanes_trace.jsonl` show Heart recalling at round 185, arriving and shopping at 190, then staying at `(85,12)` for **701 consecutive turns, rounds 191–891**. It has full health, four gems, no channel and available move/attack/cast flags. Other champions also spend extended periods near spawn. The match ends 62–1,021, with only four deaths; 73% of our champion turns are in the unproductive category.

This is not normal healing, capture waiting, a channel, or repeated death. The exact internal branch is not yet isolated. `moveToward()` admission thresholds, `doTribute()` reporting that a banking decision has consumed the turn even without movement, and the reserve checks in `progressFinish()` deserve a focused trace before changing them.

Do not generalize this to all losses: pooled idle share is 5.1% in losses, but falls to **3.2% after removing 00lanes**, compared with 3.7% in wins. Most losing champions are acting, traveling, fighting or dead.

## What the evidence does not support as the main explanation

- **Crashes/API faults:** zero own Bot error events in the archive, and no `bot error`, API error or suspension lines in the retained stdout. Logging is bounded, so this is not proof that every turn is fuel-optimal.
- **The new item families alone:** v114 buys none, but only three losing opponents bought any new-family item. They are worth testing, especially resource passives, but cannot explain most current losses through a direct opponent item advantage.
- **Universal idle behavior or universal unsafe tribute channels:** both have concrete examples, but their measured prevalence is much smaller than combat/economy losses.
- **A single champion or draft replacement as a proven fix:** the roster is fixed and some opponent compositions exploit it, but no controlled draft/build comparison was run.

## Priorities for a subsequent implementation task

1. **Combat survival and effective team coordination:** prevent unsupported engagements, account for actual allied damage/cover, and disengage before being trapped in enemy ranged focus. Use the early elk/treasure cases as regression scenarios, then validate broadly.
2. **Early resource throughput under pressure:** measure capture/equipment rates alongside survival. Separate low-death gem-race losses from combat collapses; test camp scoring/build changes on both.
3. **Urgent delivery before discretionary shopping/farming:** honor enemy-score deadlines before shopping, consider visible/shared team delivery potential, and estimate travel plus channel time. Preserve large carriers and allow threatened channels to be reconsidered.
4. **Fix the 00lanes stall with a trace of the responsible branch:** enforce useful action or task replanning when no genuine wait is progressing. Do not indiscriminately remove legitimate capture/channel waits.

These are proposed evaluation priorities, not implemented changes or promises of a particular win-rate gain.

## Artifacts and verification

- `summary.json`: cohort statistics and counts used here.
- `losses.csv`: all 35 losses with per-game economy, deaths, resource loss, end bags and overlapping observed signs.
- `metrics.json`: complete direct-engine metrics, death histories, native channel observations and idle runs for all 69 games; `analyze.mjs --part 0..3` regenerates the four disjoint chunks.
- `deaths.jsonl`, `death_context.txt`, `death_actions_losses.txt`: existing death analysis tools. The older death-context tool's printed “outnumbered1” excludes the victim from ally counts; this report corrects actual outnumbering to `enemies > allies + 1`.
- `fights.jsonl`, `fights_summary.json`: existing fight-cluster analysis across all 69 games. Cluster attribution is approximate; body deaths and resource totals above come from direct state transitions.
- `stdout_diagnostics.json`: errors, suspension and reserve-yield log census.
- `elk_early_deaths.txt`, `treasure_early_deaths.txt`, `lanes_trace.jsonl`, `broken_curve_finish_trace.jsonl`, `broken_curve_route.json`: diagnostic sequences.
- `visual_frames.json`, `render_frames.py`, `images/`: frame data, renderer, inspected PNGs and SVGs. Views are explicitly omniscient; arrows use actual pre-action enemy positions and the preceding three rounds of recorded targeted attacks/casts. No browser was used.

All own captured-gem totals, dropped-gem totals and body-death counts agree across all 69 matches with the independently generated prior v114 review. The baseline's 22 source hashes remain unchanged.
