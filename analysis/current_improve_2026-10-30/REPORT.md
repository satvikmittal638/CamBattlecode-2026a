# Improving from the active v125 submission

## First platform experiment: Cassi’s linked-life cost

The first fresh matched comparison was **v125 17/100 versus v128 25/100**. Ten losses became wins and two wins became losses. Resampling the 20 opponent clusters gives a 95% interval of **+2 to +15 net wins** for this cohort. Each version played 50 games near the planning rank of 99 and 50 near half that rank, with identical opponents/maps/sides and weak maps deliberately overrepresented. These results do not imply the same win rate across the entire ladder.

| Pool | v125 | v128 |
|---|---:|---:|
| Ranks 45–54 | 3/50 | 7/50 |
| Ranks 94–104, excluding ourselves | 14/50 | 18/50 |
| Total | 17/100 | 25/100 |

All 200 games finished on the intended version with no reported bot or match errors. Opponent drafts changed in five pairs across two opponent clusters. Excluding both entire clusters leaves **17/90 versus 24/90**, nine gains and two losses, bootstrap interval **+1 to +13**. Our drafts were identical in all 100 pairs. Private opponent binaries cannot be verified unchanged.

v128 is exact v125 plus Cassi buying the existing Durability Health emblem before economy emblems; the other source change is the build label. All 22 uploaded files matched the frozen tested source. It is not a bundle of earlier uploaded fixes.

The motivating perspective was the cost of *losing another living body*, not just the slain champion’s gem bag. In an initial 45-replay audit, 97 of 117 directly attributable linked deaths killed a partner still at least 60% healthy; mean partner health was 84%, mean separation 11 tiles. High-bag partner losses were rare. A tiny farming-proximity bonus improved local wins but increased linked deaths, so it was rejected. A more conservative retreat variant reduced income. Cassi armor reduced linked deaths from 221 to 188 over 72 local games, with the same 44 wins; that mechanism justified testing it online.

The online mechanism was much weaker: linked deaths **469→460**, or **4.101→3.978 per 1,000 game rounds**. Early linked deaths increased **85→92**. Pair capture gold rose **673.2→690.75** per game. The win gain supports v128 empirically, but the broad survival hypothesis only partially carried over. Item probes show several first defensive completions occurred after round 300; the opening cannot protect fights that happen before the item is finished. Do not present the local 15% death reduction as an online result.

## Second hypothesis: a computation-induced loss

All ten first-cohort Lanes games were zero-score losses for both v125 and v128. Full replay statistics also showed zero captured gold, zero captured gems, zero equipment and zero deaths. Visuals showed a few opening steps and then a stationary army. This was not merely a poor fight or an unlucky loss.

A repaired isolated native checker reproduced one v128 Lanes replay with **100% action agreement through round 200**, no faults and no preemptions. Diagnostic logging retained 100% agreement. After choosing a valid camp, the bot had approximately 39,500–41,000 fuel left, below farm()’s 42,000 execution gate. Next turn it scored again. The bot could keep choosing work indefinitely without ever doing it.

The first immediate one-turn plan handoff restored Lanes movement but substantially changed early deaths elsewhere. The selected narrower repair requires **three consecutive budget failures at the same position**, with no prior movement/attack and no visible enemy. It executes only the previous turn’s valid task, once, after current combat/healing checks. A changed position, interrupted turn or stale task prevents handoff. Ally capture, respawn and stall exclusions are checked again.

In the 216-game reactive local screen, base/immediate/confirmed scored **45/50/46 wins out of 72**, respectively. These small local differences are not strength evidence. The useful result is all six original Lanes games had zero score while all six confirmed-recovery games scored. By round 300, mean captured gold went **0→503.67**, gems **0→41.5**, with zero deaths in both arms. The final exact-source check was effectively level: **16/30 versus 17/30**, no faults.

A controlled replay intervention from round 6 produced **10→769 engine-validated actions**, **0→220 attacks** and **0→3 gem submissions** by round 300. Both variants matched the first five recorded rounds exactly and had no faults/preemptions. Opponents replay recorded actions here, so this proves the mechanism, not performance against reacting opponents. See [planning_debt.png](planning_debt.png).

The native checker initially lacked the newer consumable and altar-lock imports. Those results were invalid checker traps, not platform bot failures. They are explicitly archived as `invalid_legacy_host_*`; the isolated repaired checker supplies the fidelity evidence above. Some other map checks fall below 98% action agreement and are not used for precise counterfactual attribution.

## Fresh recovery evaluation

A new contemporaneous paired comparison was frozen at rank 119: 50 games against ranks **114–118 and 120–124**, and 50 against ranks **55–64**. Each arm uses 20 unique opponents, the same maps/sides, and balanced sides within each pool. The map mix is 20 Corners, ten each Lanes/Boss/Swirl/Treasure/Uncharted/Tangle, plus 20 reference-map games.

The fresh v128 control finished **35/100**, no errors, all intended versions. Its ten Lanes games again scored zero. v129 is the verified recovery candidate (`ab4679e1-25e5-4258-b7c7-aa0520b5bf24`), with all 22 uploaded files hash-matching `recovery_source_hashes.json`. The candidate also completed 100 games, with no bot or match errors and all intended versions.

## Visual scope and remaining weaknesses

The first fresh comparison’s **158 losses** were actually reviewed in 27 opening atlas pages, not merely rendered. The second comparison’s **128 losses** were reviewed in 22 more pages: 65 control and 63 candidate losses. Across both comparisons this is **286 losses in 49 pages**. Each atlas covers rounds 1–300, sampling every five rounds. These are omniscient summaries, distinct from native personal-observation diagnostics. Plotted links can include jumps or respawns and do not prove legal straight-line paths.

Three different bottlenecks recur: Lanes’ planning deadlock; Boss Battle’s failure to convert farming into banked score across the gate; and early combat losses on compact contested maps. Tangle and some Uncharted/Corners losses occur with little early mortality but inferior objective throughput. More armor or more retreat cannot solve every category.

Useful strategies worth retaining are lightweight capture assignment, stale-task recovery, bank-gate detection and champion-specific items. The strongest newly justified addition is *guaranteeing that repeated planning eventually receives an execution turn*. Further work should measure completion and conversion of useful work, not reward movement, survival or local wins alone.

The latest user instruction is to leave the best supported bot active. It supersedes the earlier request to restore v125. The platform lock must still be released after testing; no persistent selection guard is running.


## Recovery results and final selection

| Pool | v128 | v129 |
|---|---:|---:|
| Ranks 55–64 | 11/50 | 13/50 |
| Ranks 114–124, excluding ourselves | 24/50 | 24/50 |
| Total | 35/100 | 37/100 |

There were **ten gains and eight losses**, mean gem-margin change **+30.6**. The opponent-cluster bootstrap 95% interval is **−8 to +13 net wins**. Both sides’ drafts matched in all 100 pairs. The two-win gain is **inconclusive**; it does not establish that v129 is globally stronger than v128. These are fresh opponents relative to the first experiment, so do not compare 37 directly with the first cohort’s 17 or 25.

| Repeated map | v128 wins | v129 wins |
|---|---:|---:|
| Corners | 13/20 | 11/20 |
| Lanes | 0/10 | 0/10 |
| Boss Battle | 1/10 | 2/10 |
| Swirl | 0/10 | 2/10 |
| Treasure Box | 3/10 | 2/10 |
| Uncharted | 4/10 | 4/10 |
| Tangle | 4/10 | 5/10 |

The desired mechanism **did** work online: all ten Lanes games now scored, averaging **145.8 banked points** versus zero. Captured gold by round 300 increased **0→516.5**, captured gems **0→37.4**; full-game captured gold averaged **1,464.1**, captured gems **159**. The ten scores were 60–237. It still lost all ten: fixing the freeze is necessary, but insufficient to beat these opponents.

Overall captured gold was **4,238.49→4,478.85**, captured gems **609.24→635.04**, and captures **44.57→48.18** per game. Early deaths fell **3.38→3.20**, but full-game deaths rose **17.96→19.48**; activity on formerly frozen Lanes makes raw death totals particularly misleading. Near-rank early mortality and gem losses remain concerning, as do the Corners/Treasure regressions. These are recorded limitations, not hidden by the aggregate gain.

The remaining Lanes bottleneck is useful-work throughput. In the controlled recovery replay, Heart repeatedly alternated one action with several planning pauses before reaching its objective. Online Lanes turn classifications included 36,223 idle turns, 11,844 movement turns and 6,054 farming turns across ten games. Idle is a decoder classification, not a proof of the cause of every turn. The next direction is bounded execution of a safe task until meaningful progress, with interruption on danger or invalidation; simply adding more defensive items does not address this. Boss Battle additionally needs a separate gate-opening/conversion strategy; opening trajectories alone cannot diagnose its late assault timing conclusively.

**v129 is selected, active and pinned**, verified in `final_active.json`. The choice is based on the proven repair of a permanent failure and comparable observed aggregate performance, not a claim that +2 wins is statistically decisive. v128 remains available as the stronger-established fallback from the first matched experiment. The shared platform lock is free, and no guard is running.

All 400 platform games across both experiments have replay metrics and visual extraction. All 286 losses were visually reviewed through round 300. `recovery_validation.json` verifies 20 challenges/100 games per new arm, all versions correct, 100 decoded metrics and 100 visual extractions each, no bot errors, and all 22 uploaded candidate hashes matching. `platform_log.md` records all 80 challenge groups. The final source is `workspace/bots/v128-stall-recovery-1030/src` (platform version 129).
