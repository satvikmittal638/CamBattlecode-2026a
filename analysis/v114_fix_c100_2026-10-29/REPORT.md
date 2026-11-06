# v114 → v120: 100-match repair trial

v120 is uploaded, active and pinned. Exactly **20 challenges / 100 unranked matches** completed, all using v120: **37 wins, 63 losses**, with no reported bot errors or infrastructure errors. The repairs address observable execution defects. They have **not resolved the general losing pattern**: the bot still generates too little objective income and loses contested territory against stronger opponents.

## Trial and provenance

- 50 games against ten distinct teams ranked 100–111 around our planning rank (106–107): **28/50 wins**, mean score margin **+44.26**.
- 50 games against ten distinct teams ranked 48–57 around half our rank: **9/50 wins**, mean margin **−426.64**.
- Sides: **18/50 wins as A; 19/50 as B**. Overall mean margin −191.19.
- All 70 maps covered. **65 games were on historical v114 loss maps**. Ten diagnostic maps each received four games, balanced across sides and opponent pools; the remaining 60 maps received one game each.
- The platform quota increased from 0 to exactly 20 challenges. All 20 distinct receipts and intents are saved. The sender used one POST per intent, without automatic POST retries. Every group and all 100 match IDs were verified unique and finished.
- v120 ID: `f39c9c13-8011-498a-966c-4e9342184d22`. Candidate source hashes match all 22 source files downloaded back from the platform. Original v114 is unchanged.
- Source began with v114. v118/v119 were inspected as historical context, not copied as the candidate. The route-reserve concern overlaps earlier work; the direct banking rescore removal, actionable allied coverage test, and failed-retreat retry were implemented from the replay evidence.

The historical archive contains 69 games, including 35 losses. Its opponent and map distribution differs from this deliberately weakness-weighted trial. Comparing 34/69 historical wins with 37/100 here does **not** estimate the causal win-rate effect of the patch. The trial establishes current performance and tests behavioral hypotheses; it lacks a simultaneous paired v114 platform control.

## What shipped, and why

| Repair | Replay evidence | Implementation in v120 |
| --- | --- | --- |
| Reserve route fuel | On Lanes, a healthy Heart repeatedly rescored until below the routing admission threshold, then falsely consumed the turn as a banking task. | Briefly retain valid distant objectives; inspect the current objective instead of running a full scorer inside banking; return success from a bank route only when it acts or starts submission. |
| Urgent delivery | Broken Curve's healthy 200-gem carrier recalled to shop with the enemy already above 900, then submitted too late. | Winning/urgent delivery precedes optional shopping and fights, subject to survival and actual altar access. |
| Unsupported pressure response | Individual champions accepted positive damage trades while multiple enemies could fire and nearby allies could not provide covering attacks. | Count actual reachable covering bodies; prefer a lower estimated incoming-damage position for nonlethal trades under unsupported multi-enemy pressure. |
| Retry a blocked retreat | On Elk Arena, Ryth selected the same occupied retreat tile repeatedly until death. | After failure, refresh occupancy and try up to two alternatives; ordinary successful retreats retain their cheap original calculation. |

A proposed unsafe-tribute-channel guard was **rejected before submission**. It cancelled a full-health, potentially winning deposit in the Broken Curve counterfactual. Its multi-tick damage estimate was too conservative for this interaction. `F_CHANNEL_SAFETY` is false in v120.

Local screening covered 624 official-engine games across intermediate versions, including a discarded retreat implementation. All reported zero official bot faults. A broad 240-game ablation gave 41/60 wins for control and 44/60 for the combined guard-on variant; a final channel-off check gave 9/12 versus 10/12. These small outcome differences were treated as noise. Selection relied on mechanism checks and the absence of a broad regression, not maximizing those scores. The 44/60 result is for the screening variant with the channel guard, not the final uploaded configuration.

## Do the repairs actually execute?

**Yes, with important limits.**

1. **Urgent-bank regression:** in a native counterfactual of the original Broken Curve loss, the repaired carrier walks to an altar, hits its enemy lock five times, starts submission at round 1079, and ends the game at round **1099 with 1036–999**. Original v114 finished **836–1013**. Opponents follow recorded actions in this harness, so this establishes executable routing/timing, not general playing strength. See [mechanism paths](mechanism_checks.png).
2. **Blocked retreat:** the old Elk Arena position now produces a legal alternate move after the occupied tile is revealed. Ryth survives the old death position and continues withdrawing. This prevents a concrete repeated-action failure; it does not guarantee survival against a coordinated chase.
3. **Actual platform retries:** trustworthy native shadow traces contain **123 blocked-then-successful-move turns across 20 games**.
4. **Actual pressure behavior:** those traces contain 3467 `repair-focus-escape` decisions across 51 games. Matching the actions against the authoritative replay yields **3463 audited decisions and 1331 actual position changes**. Of 788 position changes that began inside visible enemy basic-attack range, **696 reduced that exposure, 90 left it unchanged, and 2 increased it**. Summed immediately reachable basic damage fell from 141114.5 to 20274.5 across that subset. This is a geometric basic-attack exposure proxy, not actual prevented damage; it omits future movement, spells, terrain and enemy adaptation.
5. **Delivery priority across the trial:** no recorded recall met all of these conditions: our carrier healthy at ≥65% HP, carrying ≥40 gems, and either the enemy already banked ≥900 or this carrier could complete our winning score. The original healthy shopping failure did not recur under that check.
6. **Long freeze:** the historical 701-turn healthy Lanes idle did not recur. The largest Lanes idle classification in this trial was 37 turns. A separate 259-turn Boss Battle bag-holding episode remains and needs gated-objective/access analysis.

Native shadow auditing covered all 63 losses and one winning reference. **58 games** passed the ≥98% action-match and no-preemption filter, with **99.96% aggregate action agreement**. Six games were excluded from behavioral attribution because of lower fidelity or one native preemption. Full-match statistics and visual plots for all 100 games come directly from the replay engine and do not depend on that filter. See `behavior_summary.json` and `focus_effects.json` for the audit boundaries.

## Why losses persist

Means within each cohort's losses; this is descriptive, not a paired treatment effect:

| Metric | v114 historical losses (35) | v120 trial losses (63) | v120 opponents in those losses |
| --- | ---: | ---: | ---: |
| Deaths | 15.11 | **15.40** | 4.41 |
| Captured gems | 574.06 | **492.41** | 1067.56 |
| Capture gold | 3197.03 | **3235.90** | 4970.02 |
| Equipped item cost at round 300 | 566.57 | **690.48** | 1050.00 |
| Total gold + equipment at round 300 | 721.06 | **834.32** | 1203.29 |
| Dead-turn fraction | 18.7% | **18.0%** | 4.6% |
| Gems dropped on deaths | 156.23 | **97.67** | 76.87 |

The lower dropped-gem mean is partly sensitive to Boss Battle. Excluding Boss Battle, the figures are 104.76 for historical losses and 85.82 for trial losses. A better-looking equipment or drop statistic does not establish that the treatment improved platform strength.

The decisive facts in the new losses:

- **62/63 captured fewer than 1000 gems**, and **62/63 were outcaptured in gems**. Most losing games never generated a winning supply to deliver.
- **47/63 were behind in total gold + equipment by round 300**.
- **970 deaths**: 447 alone within six tiles, 460 actually outnumbered (enemies > self + nearby allies), and **777 with no gems**. Saving large bags alone cannot address most deaths.
- **17/63 losses had at most four deaths**. Pure survival changes cannot explain these quiet income/race failures.
- Only two losses ever reached 1000 total banked + carried gems: Boss Battle against the ruliad and adgato_gemcombat1. Only the Boss Battle loss still held a winning total at the end: **0 banked, 1106 carried**. Its gate/access failure is a distinct unresolved delivery problem.
- Opponents used new item families in 49/100 games, including 34/63 losses, versus 3/35 historical losses. This is a changed opponent mix and a reason to reassess economy builds, not proof that a new item alone explains the losses.

## Weakness maps and visual findings

| Repeated map | Wins / 4 |
| --- | ---: |
| Elk Arena | 2 |
| Treasure Box | **0** |
| Lanes | **0** |
| Broken Curve | 2 |
| Stalactites | 1 |
| Gemfight | 1 |
| Boss Battle | 1 |
| Cuts | 2 |
| Collision | 2 |
| The Line | **0** |

I visually inspected opening-300-round trajectory sheets for **all 69 original and all 100 trial games**: 12 baseline pages, 7 trial pages covering the first 40, and 10 pages covering the remaining 60. Each sheet shows both teams, terrain, captures and deaths. Paths are sampled every five rounds and can connect recall/dash jumps; they are not path-legality evidence. Full-match statistics were decoded for every trial game. Selected late-game and fight sequences were then examined at exact recorded frames.

- **[Elk Arena vs DOOMSDAY](images/01elk_arena.png):** Ryth leaves the firing line as intended. Other healthy allied bodies remain several tiles behind or pursue different interactions. The enemy line advances together, so repeated individual escapes concede the central objective. Final 72–1026.
- **[Treasure Box vs SALUTE TO TUNG](images/02treasure_box.png):** early retreats move our champions back toward spawn, while allied positioning and neutral camp pressure leave a narrow working area. This repeats on both sides and against both opponent pools: 0/4. A coordinated objective/escort decision must precede the damage trade; escape selection after contact is insufficient.
- **[Lanes vs Mate in One](images/00lanes.png):** the old spawn freeze is absent. Vendetta and the other farmers repeatedly escape a chasing enemy group, but lose access to nearby gem camps. All four Lanes games still lose, showing that the original idle defect was not the map's whole problem.
- **[Boss Battle vs The Party of Heroes](images/01boss_battle.png):** no deaths on either side before round 300, yet our capture gold is **320 versus 2190**, equipment **300 versus 2070**. The native trace exactly reproduces all 2500 own turns through round 500: **1959 movement turns, only 56 attack turns**. Champions repeatedly switch among unfinished farming groups; the source explicitly disables objective commitment on gated maps. This is an income-execution defect before combat or banking matters.
- **Quiet race maps:** Rows, Road of Riches, Cuts and Tangle also show low early mortality with unequal objective conversion. This argues for finishing and allocating farming jobs, not an across-the-board retreat increase.

## Tested next direction: complete farming objectives

A separate, **unreleased** local prototype lives in `workspace/bots/v114-objective-c100`. It enables the existing close-objective commitment and bounded route retention on gated maps during normal farming before round 600. The planned late gate-assault phase is unchanged. v120's frozen source was not edited.

The strategic hypothesis is that a champion should finish an executable resource job instead of repeatedly travelling to a newly preferred group. This is distinct from making an individual retreat safer.

Behavioral evidence:

- In the Boss Battle recorded-opposition counterfactual, first-500-turn attack activity increases from **56 to 768 turns** and movement falls from **1959 to 1277 turns**.
- At round 300 that counterfactual has **129 carried gems and 1599 gold + equipment**, versus the recorded v120's **30 gems and 320 worth**. At round 500 it has 412 gems and about 4562 worth, versus 30 and 320. Opponent reactions are fixed; these figures check execution only.
- In fully reactive official local matches, six paired Boss Battle situations increase mean round-300 capture gold from **703.7 to 1919.0** and capture gems from **39.5 to 148.0**. Deaths increase from 0.5 to 3.0: the income improvement carries exposure cost.
- The same rule **does not generalize cleanly to Guardians**: six paired situations fall from 605.7 to 506.7 capture gold at round 300, with deaths 2.5 → 3.0.
- The 72-game local check reports zero bot faults; 26/36 versus 28/36 wins is a small result and is not the reason to select this strategy.

**Decision:** keep this prototype unpromoted. It establishes that completing resource jobs can repair a major Boss Battle mechanism, while exposing the need to account for danger and allied roles on contested maps. The next general strategy should combine objective completion with a fighting pair that can hold/escort one contested objective while the remaining champions maintain safe income. Actual covering range, arrival timing and a common enemy target need to guide that assignment. Simply gathering the whole team or increasing retreat thresholds risks losing farming throughput.

The platform remains on **v120**. No additional challenges were sent after the requested 20. The overall weakness is still open; the next experiment should measure completed objectives, income per travel turn and objective retention under pressure, alongside performance.

## Artifact index

- [High-level findings chart](findings.png), [mechanism counterfactual paths](mechanism_checks.png).
- [Per-match table](matches.csv), [aggregated statistics](summary.json), full `metrics.json` and `platform/index.json`.
- [Exact completion/version/error checks](completion_verification.json), [behavior audit](behavior_summary.json), `focus_effects.json` and `.log`.
- `baseline_images/page_01..12.png`; `platform_images_early/page_01..07.png`; `platform_images_remaining/page_01..10.png`.
- `plan.json`, `specs.json`, `challenges.txt`, 20 `intent_*.json`, 20 `receipt_*.json`, all `groups/*.json`, and all 100 replay bundles in `platform/`.
- `candidate_source_hashes.json`, `uploaded_v120/`, `submissions_final.json`, `quota_final.json`.
- `objective_check/results.json`, `objective_economy.json`, `boss_objective_live.jsonl`; local prototype source as described above.
