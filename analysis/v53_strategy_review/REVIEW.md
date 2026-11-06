# v53: strategic weaknesses across all 500 unranked replays

Reviewed 2026-10-22. Analysis only: no bot changes, submissions, challenges, or active-bot changes.

## Coverage and method

- Corpus: `platform/c100_v47p/games/index.json`, all **500 games in 100 five-game challenges**, version 53 (v47p).
- Decoded every native engine step, using engine **v1_0_3** throughout. Every final score, winner, and round reconciled with the index. No decoding failures or native Bot error events.
- Compared both teams' movement, capture rewards, deaths, low-health episodes, bank completions, and final carried gems. Read Claude's current project memory, the frozen v53 source, and the refreshed official rules in `analysis/docs_2026-10-22/`.
- Counted each rewarded camp group once, separately from the number of champions sharing its reward. All 52,995 capture reward events mapped to a static camp composition. Gem acquisition and death totals also matched the earlier independent `analysis/v47p/review.json` pass for every game. Bank completion events reconciled to every final score.
- Frozen v53 source hashes all still match `analysis/iterations/v47p/sha256.txt`.

Results: **238/500 games; 46/100 challenges**. Near-rank: **143/250 games, 33/50 challenges**. Stronger pool: **95/250 games, 13/50 challenges**. This misses both promotion thresholds recorded in Claude's memory (at least 35/50 and 29/50 challenges).

## 1. Fight selection and escape timing cause repeated losses of productive time

Across the **241 losses outside `00contest` and `01boss_battle`**:

| Measure | v53 | Opponent |
|---|---:|---:|
| Body deaths per game | 14.29 | 4.31 |
| Dead champion turn share | 15.7% | 4.7% |
| Deaths with more enemies than allies within six tiles | 52.5% | 24.2% |
| Resolved low-health episodes ending in death | 38.3% | 20.3% |
| Death within ten rounds of low-health episode starting | 36.4% | 18.1% |
| Mean gems in the bag immediately before death | 4.87 | 7.75 |

The main cost is broader than losing carried gems: repeated deaths remove champions from farming, capturing, defending, and upgrading. Their bags are often small when they die.

**Code connection:** `bot.cpp:handleLowHp` enters low mode below 35% HP; the healing-only recall option is disabled (`X_HEALRECALL=0`). `v1_tactical.h` estimates short-horizon retaliation, but its nonlethal danger rejection explicitly exempts an immediate kill. If tactical planning returns “unavailable,” the fallback in `fightChampions` can chase nearby enemies using distance and own HP without the same risk calculation. A favorable immediate hit or kill can therefore take precedence over a safer continuing position.

**What to test:** retreat based on survival through the escape route, including camp attacks and enemy cooldowns; price death and lost farming time into kill trades; require the fallback chase to pass a small risk check. Use credible ally arrival times rather than simply counting nearby bodies.

The local-number statistic is descriptive: it includes the victim among allies, uses Chebyshev radius six, and does not reconstruct personal visibility or wall-separated reach. It is evidence to investigate engagement selection, not proof that every outnumbered death was avoidable. Even excluding Cassi/Issac from opposing victims, the opponent's normal-map outnumbered-death share is only 26.8%.

## 2. Camp choices can be fatal before the low-health policy can rescue them

The clearest reproducible example is **all 12 `01broken_curve` replays**:

- Vendetta dies on **round 20 in 12/12** games.
- Heart of Ruin dies on **round 42 in 12/12** games.
- These are two of our three champions. The pattern occurs in wins as well as losses.

A step-level trace of `near_r59_1` shows actual camp attacks, not inferred enemy casts:

- Vendetta starts clearing a group, then retreats at round 16 and dashes. By round 17 she reaches `(6,34)`, remains there, and continues taking damage from an Elk at `(3,35)` and Wolf at `(3,36)`. She dies on round 20. The Elk is still within its current four-tile attack range.
- Heart initially escapes a two-Elk group and recalls successfully. It returns to the same area, is taking **120 damage per round**, starts withdrawing after falling to 310 HP, and takes three more camp phases of damage before dying on round 42.

**Code connection:** the camp scorer estimates incoming damage but generally applies a soft penalty rather than making an unfinishable, unescapable clear inadmissible. The v53 commitment branch keeps a nearby target without rerunning that survival estimate. Escape movement values separation/home distance, but does not solve “how many camp phases will I remain exposed before reaching safety?” The stalled-retreat recovery also needs several observations to activate, which is too late for these short survival windows.

The current engine's camps sleep after two rounds **without a target in range**. Merely stopping damage does not make an exposed retreat safe.

**What to test:** before waking or recommitting to a camp, require a plausible clear or escape plan using actual monster ranges, current HP, cooldowns, and terrain. Revalidate commitment when those conditions change. This is a general rule, not a special route for this map.

Evidence: [broken_opening.json](broken_opening.json). All 12 games used the same side, so this establishes a repeatable opening failure for that geometry and side rather than a side-independent map claim.

## 3. The farming loop produces rewards too slowly

For a diagnostic subset of **74 games** on `00rows`, `01big_world`, `00lanes`, `00road_of_riches`, `01broken_curve`, and `01the_farm`, v53 wins only **11/74**:

| Measure | v53 | Opponent |
|---|---:|---:|
| Deaths per game | 2.72 | 2.62 |
| Camp groups captured per 100 rounds | 3.68 | 5.13 |
| Gem-bearing groups captured per 100 rounds | 3.17 | 4.59 |
| Gems per gem-bearing group capture | 20.56 | 18.31 |
| Moving end turns / alive end turns | 68.6% | 63.4% |
| All team walking moves per rewarded group | 75.5 | 51.5 |
| Banked gems at round 500 | 166.6 | 243.9 |

This is a selected weak-map subset, not an estimate for every map. It isolates a problem that combat alone cannot explain: **we obtain larger gem rewards per capture, but complete too few cycles**. On all 475 normal-map games, our group capture rate is also lower, 3.86 versus 4.28 per 100 rounds.

`00road_of_riches` is extreme: **2/13 wins**, 130.5 team walking moves per rewarded group versus 51.5. On `00rows`, our team has only **one death across all 12 games**, yet wins just once. `01big_world` also finishes 1/12 despite fewer deaths than the opponent on average.

**Code connection:** camp selection maximizes a local reward/time estimate, with fixed gold-to-gem weights, approximate future damage, advisory ally commitments, and a proximity commitment rule. That does not optimize the complete repeating cycle of clear → capture → delivery → shopping → next clear. Valuable but awkward targets and repeated detours can look attractive locally.

**What to test:** measure realized cycle cost, improve route continuity between camps and altars, reprice gold by the next useful upgrade and time remaining, and revalidate a commitment when its expected payoff deteriorates. Do not simply disable gold farming: our winning games also farm gold successfully.

The walking-per-capture measure includes all team walking, including banking and recovery. It quantifies total movement cost; it does not classify every non-direct move as a navigation mistake.

## 4. Banking often fragments the farming route; finishing logic is too individual

On `00rows`:

| Measure | v53 | Opponent |
|---|---:|---:|
| Completed deposits per game | 50.25 | 32.83 |
| Mean gems per completed deposit | 17.29 | 31.42 |
| Completed deposits below 20 gems | 72.0% | 31.2% |

With almost no deaths on this map, the extra small deliveries are a credible source of lost farming time. They are not automatically wrong—an immediately adjacent altar can make a small deposit cheap—but the current policy does not consistently produce an efficient full cycle.

**Code connection:** `doTribute` only delays a small delivery when another suitable camp is within five route steps, nearly ready, and quick to clear. Otherwise even a tiny bag can start a separate delivery trip. Shopping recall runs before the ordinary winning-bank check. That check promotes a bank when **one champion's** bag covers the deficit; it does not assign the fastest safe combination of team deposits.

Two ordinary losses show finishing opportunities worth reviewing:

- `near_r73_1 / 00great_wall`: final **980–1012**, 109 gems still held. Our bank plus alive bags was at least 1000 at 129 round-start samples.
- `near_r69_2 / 01the_farm`: final **972–1016**, 144 still held; the same condition held at 93 samples.

Those samples are not necessarily consecutive and do not prove an uncontested winning channel existed. They do show why team-level delivery scheduling deserves a targeted experiment.

**What to test:** choose delivery and shopping trips jointly with the next farm route, and give feasible near-term winning deposits priority over further capital accumulation. Base urgency on travel plus channel time and actual interruption threats.

This is not a universal “we already have the gems” explanation: normal-map losses capture only **585.8 versus 1001.6** gems on average and finish with only **29.3** unbanked gems. Most of that deficit requires better acquisition and survival too.

## 5. Boss objectives have two distinct structural failures

### A. Gated altar: farming without a reliable conversion plan

On `01boss_battle`, v53 scores **zero gems in all 12 games**. Its three wins are **0–0 gold tiebreaks**. It finishes with **22,362 carried gems in total**, averaging **1,863.5 per game**. Ten games contain no tribute start; the other two contain one unsuccessful start each.

The regular branch drafts a special caster team here. `workBankGate` refuses to work on a gate unless its personally observed remaining health is at most **30%**. Meanwhile, `doTribute` refuses to act while that gate is believed closed. This relies on someone else opening the objective and on our carriers noticing and exploiting that opening.

Examples:

- `near_r75_2`: neither Monolith ever takes damage; we finish with **4,064 gems** and zero tribute attempts, losing the gold tiebreak.
- `half_r41_1` versus Valenki: the Monoliths die on rounds **1662 and 1762**. At the next round start, our carriers hold **3,486 gems**. The nearby Tavi dies shortly afterward; other carriers remain on outer routes, with Stellar, Prism, and Heart starting recalls on rounds 1768, 1788, and 1810. We never start a tribute. The opponent steals/collects a 1,017-gem bag and finishes banking it on round **1829**. Our final bags still total **3,001**.

The second example disproves “the gate never opened” as a sufficient explanation for every failure. It also shows a timing trap: a 1,467-gem carrier needs a **147-tick** tribute channel, so waiting until the last 67 rounds of this game cannot convert that bag in time even with immediate access.

**What to test:** assign objective-breaking, scouting, capture, and delivery responsibilities; stage carriers before an opening; communicate advisory gate changes and obtain personal confirmation as required. Make the investment-to-scoring transition depend on access and channel time, rather than waiting indefinitely for a low boss-health observation.

Evidence: [boss_window.json](boss_window.json).

### B. Boss-only objectives: the special team loses control before collecting rewards

`main.cpp` routes boss-only gem maps such as `00contest` into a **separate bot implementation**. This is not the regular v53 camp-commitment loop.

Here v53 wins **1/13**, suffers **71.6 body deaths per game**, and records **zero directly acquired camp-capture gems across all 13 games**. The single win banks 600 gems despite no direct camp reward acquisition, so capture income and stolen champion loot must not be confused.

The special draft is Tavi, Stellar, Cassi & Issac, Prism, and Ren. It depends on acquiring caster capital and taking a low-health Monolith, yet generally cannot hold the area against the opposing team. Cassi/Issac linked deaths increase body counts; the count is not 71 independent fights.

There is also an explicit mechanics assumption to remove: both the boss executor and gated firing geometry describe a range-four spell position as safe, while the current Monolith attacks at **range five**. A range-four caster position must account for tanking, control, cover/visibility, or a surviving escape; distance alone does not make it safe.

**What to test:** objective control and survivable boss damage before choosing an all-caster steal plan; price contest strength and delivery access into draft/roles. Keep the boss-only and gated-map diagnoses separate.

## Recommended experiment order

1. Fix the reproducible camp admission/escape failure, using current monster ranges and projected exposure until safety.
2. Improve combat escape and fallback admission, including the value of staying alive after a kill.
3. Optimize full farming/delivery cycles and small-deposit batching on quiet maps.
4. Replace passive boss dependency with an explicit access-and-delivery plan; evaluate both specialized branches.
5. Add team-level finishing assignments and deadlines.

These are proposed experiments, not measured improvements. Earlier v43x history already found broad rally/count-retreat switches harmful; this evidence does not justify blindly turning them back on. Test changes separately against the same baseline, then on both sides and the archived holdout layouts before any later submission.

## Limits and reproducibility

- Every map in this batch was played from only one fixed side. Map/side and opponent assignments are confounded. Avoid attributing a map's win rate solely to its geometry or a side advantage.
- There is no simultaneous v47 control on this schedule. The results do not prove that `X_COMMITDIST=12` caused any regression. Its bypass conditions are a code-level hypothesis to test.
- Deaths are alive-to-dead body transitions. Local proximity is omniscient replay geometry, not reconstructed personal vision. A low-health episode starts at a round-start sample below 35% HP outside spawn and resolves on death, reaching spawn, or recovering to at least 60%; unresolved end-of-game episodes are censored. These are retrospective episodes, not the bot's internal low-mode flag.
- Recall starts can be repeatedly cancelled/reissued by opponents; raw recall counts are not successful healing trips. Recommendations above do not rely on that misleading comparison.
- Capture clear/wait durations in the raw metrics can include work done by either team; they are not clean solo-clear benchmarks. Frame state does not by itself expose the bot's internal target choice or the counterfactual outcome of another decision.
- The report uses local frozen primary documentation already fetched on 2026-10-22. The current rules specify Elk/Golem range four, Monolith range five, persistent awake attacks while targets remain in range, and tribute duration `ceil(starting bag / 10)` owner turn ends.

Files: [metrics.json](metrics.json) contains per-game metrics, per-death histories, low-health episodes, native capture events, and bank timelines; [summary.json](summary.json) contains pool/map aggregates. Reproduce with `node analysis/v53_strategy_review/analyze.mjs`, then `node analysis/v53_strategy_review/summarize.mjs`. Only analysis artifacts were written.
