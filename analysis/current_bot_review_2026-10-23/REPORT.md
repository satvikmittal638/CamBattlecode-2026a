# v58: uploaded-code and complete replay review

**Verdict:** v58 is operationally stable, but this audit does not support it as an upgrade over v57. It is a v56 branch with a staged dash-bridge change. Controlled local tests favor both v56 and v57. Its largest platform failures involve early gem throughput, combat collapses, and blocked boss/gate objectives. A capture deadlock also appears inside a large win.

## Scope and verification

Reviewed submission `8f42f685-6d52-4cae-896c-cbb27925a808` (v58), uploaded 23 October 2026 at 18:39:12 IST. The review cutoff is **19:28:59 IST on 23 October 2026**. At that cutoff, v58 had 135 match records: **130 completed games and five queued games**. Queued games had not played and had no replay; they are not included in win rates. New games after the cutoff are outside this snapshot.

The full team-history pagination reached the end (137 original pages), then a head refresh added subsequent activity. Match-level version 58 and the group's submission ID identify the reviewed games. All **130** completed replays were downloaded and decoded through **26,502,007 native engine steps**, across 40 maps and 14 opponents. All outcomes, scores and round counts agree with the 130 official summaries. Gem-flow conservation passed for both sides of every game. No decode failures, official bot faults, caught API errors or logged suspensions occurred. The fuel-ledger audit recorded zero ordinary inputs at the limit. The 29 downloaded source files remain unchanged.

The official rules, patch notes and frontend rule assets were fetched again with HTTP scripts. All five checked sources match the earlier verified bytes. Native engine 1.0.3 camp-design queries independently confirm the ranges used in this review. No bot was changed, activated or submitted; no challenge was fired. Local tests used frozen copies.

## Actual platform performance

| Kind | Game wins | Set wins | Distinct opponents | Mean gem margin |
|---|---:|---:|---:|---:|
| Ranked | 12/25 | 4/5 | 5 | -26.5 |
| Unranked | 43/105 | 7/21 | 11 | -183.2 |

Overall: **55/130 game wins (42.3%)**, 11/26 completed sets won, and 36 losses by at least 500 banked gems. Ranked results are 4/5 sets but only 12/25 games: four 3–2 wins and one 0–5 loss. This is a small ranked sample. The unranked sample repeats opponents and is not the earlier 100-distinct-opponent v57 experiment. Raw cross-version win rates therefore do not establish an improvement or regression.

## What the bot is doing

Ordinary drafts use Heart, Vesper, Vendetta on three-pick maps; larger maps use Heart, Vesper, Ryth, Marcella and then Vendetta. Geometry identifies boss-only and mandatory-gate maps and selects separate caster rosters. Draft memory stores static map distances. During play, private champion instances maintain camp beliefs and routes, while eight shared bytes communicate target/capture/low-HP status and one small help request.

The ordinary decision sequence is roughly recovery/channels → shopping and recall → winning deposit → tactical/legacy combat → help/gate work → tribute → farm. Camp scores estimate reward per travel/clear/delivery time, with health-risk and allied-claim adjustments. Builds and drafts are fixed heuristics. The upload contains no ML/RL model or opponent-behavior learner. [SOURCE_REVIEW.md](SOURCE_REVIEW.md) interprets all 29 files and the active branches in detail.

## What distinguishes wins and losses

Standard-resource maps are analyzed separately from the two boss/gate scenarios. There are 121 standard-map games: 54 wins and 67 losses. The 29 heavy standard-map losses have deficits of at least 500.

| Mean per standard-map game | Wins | Losses | Heavy losses |
|---|---:|---:|---:|
| Camp gems by round300, ours / enemy | 106.2 / 112.0 | 110.0 / 192.6 | 54.9 / 175.6 |
| Champion deaths, ours / enemy | 5.1 / 11.9 | 13.7 / 3.4 | 23.0 / 3.9 |
| Camp-group captures, ours / enemy | 54.3 / 44.7 | 41.1 / 62.5 | 36.7 / 64.2 |
| Final carried gems, ours / enemy | 32.7 / 31.4 | 27.5 / 34.6 | 17.4 / 22.0 |

In wins, v58 often survives an approximately even opening, then converts camps and combat advantages into banked gems. In heavy losses it captures far fewer early gems, then suffers a large death gap. Almost half of its deaths in heavy losses occur with more enemies than allies within six tiles. These are observed associations: the charts do not prove whether weaker farming, unfavorable engagement or the opponent's strength started the spiral.

There are also economic failures without a huge death difference: 14 standard-map losses combine less than75% of the enemy's group captures with a death gap below five; 10 losses occur despite fewer deaths than the enemy. Those categories overlap. Improving survival alone will not solve all losses.

In the 29 heavy standard-map losses, mean final carried gems are only 17.4, versus an 814.7 mean score deficit. Those games are not primarily explained by a large bag left unbanked at the final frame. Gate games are a different failure mode and must not be pooled into this claim.

### Diagnostic replay cases

| Replay | Result | Observed pattern |
|---|---:|---|
| `01elk_arena` vs smurphy | 0–1008 | 85 group captures but **zero camp gems**; enemy 106 captures and 1008 camp gems. v58 earned 4572 gold versus 11374 and died 19 times versus 5. A productive-looking gold loop failed to turn into gem throughput. |
| `01hooks` vs smurphy | 0–1001 | 17 captures versus 89, only 44 camp gems, and 40 deaths versus 4. Both resource throughput and combat collapsed. |
| `00gemfight` vs Valenki | 22–1019 | 71 camp gems versus 970; 26 deaths versus 4. 49 of v58's 71 collected gems were lost before banking. |
| `01boss_battle` vs Ninja Turtles | 0–4414 |v58 captured 2247 camp gems, stole 247 and banked **zero**. It lost 2385 gems on death and finished with 109. No tribute start was recorded. Both gate monoliths remained alive until rounds 1431/1436. This is a gate/delivery failure rather than inability to earn resources. |
| `01yellow_brick_road` vs DOOMSDAY | 1003–8 |Four productive champions could win while Ryth stayed on one tile for 543 consecutive rounds. An enemy contested the far end of the same cleared gold group, so capture never completed there. |

The score 4414 is a valid overshoot: tribute completion deposits the entire current bag; 1000 is an end threshold, not a score cap. The gate-case gem equation is 2247+247−2385=109 carried+0 banked. Some gems lost to camps are destroyed rather than transferred.

### A latent weakness inside a win

At round 100 in the DOOMSDAY win, Ryth stood at (5,12) and enemy Vendetta at (34,12), both on one 30-tile cleared gold region. The enemy is 29 tiles away, outside personal vision, but resets capture for the whole region. Ryth remained on the same tile for 543 consecutive round snapshots, was never stunned, and had only 23 walking turns across 915 observed live turns. The native audit counted 872 rounds with Ryth on that cleared, enemy-contested line.

The code has a plausible direct mechanism: `farm()` preserves an ongoing capture and returns; `progressFinish()` exempts capture waits from idle eviction. No bounded no-reward timeout breaks an unseen contest. A fix must infer stalled progress from elapsed time and reward/state changes; it cannot assume hidden enemy visibility. This case demonstrates a real weakness but does not establish its prevalence across all games.

## Confirmed code problems

1. **False monolith safety assumption.** Engine/rules range is 5. `boss/bot.cpp` farms from exactly 4; `v1_bank_access.h` constructs the same range-four ring. It is not outside attack range. Other bodies may draw aggro, but distance alone cannot justify zero incoming damage. Use native ranges and an explicit sustainable clearing/aggro plan.
2. **Impossible repeated-spell forecast.** Executing the uploaded pure response function gives 444 two-turn damage for a Cassi example with Strength 30, Focus 96 and only the damage spell ready. Its legal fixed-position maximum is 252: one 192-damage spell and two 30-damage basics. The eight-turn cooldown is not consumed across the two independent estimates.
3. **AoE reach underestimated.** The same function returns 0 for Ryth five tiles away, although a legal cast center at range 4 plus radius 1 can deal 100. Fix both cooldown sequences and affected-area reach before adjusting aggression thresholds.
4. **Withdrawal can fall through.** A melee tactical escape that only shields can leave movement available and no attack used. The caller has no explicit withdrawal state, so later help/tribute/farm logic remains reachable. This control-flow defect is proven; its replay frequency is not measured.
5. **Heart recovery shield omitted.** Low-HP recovery explicitly shields Varg but not Heart. Three losing-case traces contain 54 low-HP Heart moves with a ready shield, cast allowance, nearby visible enemies and no cast. That supports investigating the omission; it does not prove every shield would change the outcome.
6. **Unbounded capture waiting.** The Ryth case above needs a capture-specific progress budget, not an exception from all idle checks.

AoE farming deserves precision: v58 **does cast AoE spells on camps**. The trace shows Ryth using slot 0 on camp targets. What is absent from v57 is the broader search for useful area centers and comparison of spell value. It would be incorrect to diagnose “all ground AoE is disabled.”

## Strategy criticism and priorities

The boss/gate theft threshold is too restrictive as a complete policy. `X_GATESTEAL=true`, `X_BOSSSTEAL=true` and `X_STEALFRAC=.3` make the bot wait for someone else to do most of the clearing. When scoring depends on that objective, it needs a proactive fallback based on equipment, sustain, support and contest risk. In this sample v58 is 0/4 on the gate map and 1/5 on the pure-boss map. Against both local mimics it won both special scenarios at 0–0 on tiebreaks, whereas v57 banked 1000+; a simple win flag hid the missing objective conversion.

Ordinary farming needs to optimize eventual gems rather than only attractive local gold groups. The elk_arena loss is the clearest diagnostic. Add a measured transition from investment into coordinated high-value clears, and track gems per 100 rounds and clear-to-capture latency. Do not simply disable gold camps: they can fund the stats that make a safe clear possible.

Combat should make one consistent decision. Correct the forecast errors, distinguish “declined trade” from “no calculation,” preserve a withdrawal decision through the rest of the turn, and account for actual camp aggro and usable allies. Tightening every risk threshold could make the bot even less productive. Ren retaliation during parting attacks is another inherited hazard.

The staged bridge idea is reasonable: an immediate dash is insufficient when the launch point must first be reached. It has legal landing checks, cooldown waiting and timeout state. However, this particular implementation has no measured net benefit on the controlled set. Retain the existing baseline while diagnosing the five losing flips, especially lost_world and gemfight; do not assume every geometric improvement improves the full policy.

The ordinary fixed 150-gold shopping trip, poorest-first capture redistribution, fixed drafts and heuristic gold valuation are sensible experiment candidates, not proven bugs. Compare small changes using paired contexts and include severe-loss and throughput metrics. They may interact; this audit does not justify changing all of them at once.

I found no opponent-ID or map-name hardcoding. Geometry-based scenario selection is appropriate. Fixed champion/build/threshold choices are inflexible, but that alone does not demonstrate overfitting to a particular team. The two overlapping controllers make maintenance harder and help explain why recovery/objective fixes are present in one branch and missing in another.

## Comparison with previous versions

After line-ending normalization, v58 differs from v56 only in staged bridging, its state fields, and the build label. It is not v57 plus an enhancement. Several v57 forecasts, retreat safeguards, area-farming and proactive boss/gate policies are absent. See the exact `v56_to_v58.diff` and `semantic.diff`.

The complete activity-history snapshot contains the following version totals. These are **context only**: opponents, challenge choices, active intervals and enemy uploads changed. Group-side versions identify the historical totals; only v58 was exhaustively rechecked at match level in this audit.

| Version | Ranked game wins | Ranked set wins | Unranked game wins |
|---|---:|---:|---:|
|v53|66/120|15/24|346/715|
|v54|86/170|20/34|384/860|
|v55|160/320|32/64|569/1055|
|v56|57/115|11/23|143/265|
|v57|41/85|9/17|282/600|
|v58|12/25|4/5|43/105|

All three prior detailed evaluation corpora(v54/v55/v57) show the same broad loss pattern: lower early camp-gem throughput and a substantial death disadvantage. v58's currently reviewed standard losses average110 versus193 early camp gems and13.7 versus3.4 deaths; these samples differ, so the averages cannot establish a causal version improvement. Exact opponent/map/side overlap with the old v57 corpus contains only 10 current games: 3/10 wins for both, mean margins −250.3 versus −221.6. Public enemy bot versions are hidden. That overlap is too small and uncontrolled to overturn the local comparison.

### Controlled local tests

Frozen source copies were compiled and tested in release mode with 100000 fuel, on all 40 available maps. Each of the two frozen mimic opponents was used on one fixed, balanced side per map. All three versions saw identical opponent/map/side contexts. A separate 40-map direct test compared v58 against v57. No source logic was modified.

| Version | Wins /80 shared contexts | Mean gem margin | Faults |
|---|---:|---:|---:|
|v56|75/80|+550.5|0|
|v57|77/80|+611.9|0|
|v58|70/80|+487.7|0|

Direct v58 versus v57: **14/40 wins**, mean margin −93.9. Against v56, v58 has 0 winning flips and 5 losing flips; against v57, 0 gains and 7 losses. The local opponents are old frozen mimics, not the live remote teams. This is controlled evidence on this set, not a precise estimate of current ladder strength. The four boss/gate contexts show that v58 can win tiebreaks despite never banking; margin/objective checks matter as well as win counts.

The local pool index listed only 21 maps. The initial 147-game batch was therefore extended, before final conclusions, with the remaining 19 available maps and 133 further games. The final totals above include all 280 games; source hashes remained stable and every match completed with zero bot faults.

## Graphs and complete artifacts

All four figures were opened and visually inspected during the review.

- [Economy and combat patterns](economy_combat.png) · [SVG](economy_combat.svg).
- [Controlled version comparison](local_comparison.png) · [SVG](local_comparison.svg).
- [Heavy-loss and strongest-win timelines](replay_timelines.png) · [SVG](replay_timelines.svg).
- [Capture deadlock diagram](capture_deadlock.png) · [SVG](capture_deadlock.svg).
- [Every completed match](MATCHES.md), linked to its downloaded replay, with captures, deaths and carried gems.
- [Source interpretation](SOURCE_REVIEW.md), [source snapshot ZIP](v58_source_snapshot.zip), untouched sources in `source/`. The ZIP is reconstructed from the downloaded files, not the original upload container.
- `VERIFICATION.json`, `patterns.json`, `official_aggregates.json`: coverage, per-map/opponent/outcome summaries and cross-checks.
- `frame_audit.json`, `idle_case.json`, `forecast_counterexamples.json`, `native_camp_stats.json`: concrete frame and rule evidence.
- `local/PROTOCOL.json`, `local/results.json`: frozen test inputs and all 280 results.

Recommended next implementation order: correct native-range/forecast/control-flow errors and the capture timeout; add a sustainable gate/boss fallback; measure early gem throughput and coordinated clears; then retest routing changes in isolation. This review applied none of those changes and made no submission.
