v147 is the best measured candidate from this loop. It fixes the tactical forecast for melee movement followed by an attack reset: the executor can walk, attack, reset, and attack again, but the old forecast credited only one hit after movement. The change is one line in `workspace/bots/ar-walk-reset-1101/src/v1_tactical.h:130`, based on v141, commit `f160a66`. Ranged movement keeps the old one-hit forecast. All 21 uploaded source files match the frozen v147 export; the tested WASMs and their hashes are preserved in `autoresearch/reset_analysis/tested_build/`.

The platform test completed 100 candidate matches against the same maps, sides, and pinned opponent submissions used for 100 v141 control matches. It used 50 opponents near the rank stratum and 50 near half that rank, as defined when the two plans were frozen. Seventy matches targeted previously weak maps and thirty covered stronger maps to detect regressions. The S26 pool was frozen around rank 88; the earlier S21 pool was frozen around rank 102. These are not claims about opponents relative to today's changing rank.

| Comparison | v141 | v147 |
| --- | ---: | ---: |
| All 100 matches | 31 wins | 35 wins |
| Previously weak maps, 70 matches | 18 | 21 |
| Stronger maps, 30 matches | 13 | 14 |
| Near-rank stratum, 50 matches | 16 | 19 |
| Half-rank stratum, 50 matches | 15 | 16 |

Seven losses became wins and three wins became losses. Mean score margin improved by 53.46 gems per game. All 100 candidate matches used v147; there were no bot errors or unfinished matches. This is a modest observed improvement, not conclusive evidence of a general win-rate gain: the descriptive paired p-value is 0.34375 and the opponent-block bootstrap 95% interval for win-rate change is -3 to +11 percentage points. v147 also won 19 versus v114's 17 on their shared S21 fifty-case comparison; that is a separate, smaller comparison. v114 remains a permanent local test opponent.

The mechanism has stronger evidence than the small win-rate change. Three official-engine examples show a melee champion walking and dealing two 70-damage attacks, matching the new 140-damage forecast rather than the old 70. Two local gained wins first diverged exactly at the newly valued walk/attack/reset/attack action. The complete platform replay audit recorded 905 move/attack/reset/attack PvP sequences for v147 versus 685 for v141, including 291 versus 236 by round 300. These counts show the action occurs more often; they are not independent proof that it caused every gained win, and full-game counts also depend on match length.

All 100 candidate and 100 control replays were decoded with the official v2.0.0 engine. I visually inspected the paired first-300-round trail atlases for all ten changed outcomes, three additional paired windows around the first divergence in each regression, and ten deliberately selected remaining losses on distinct maps. Trail atlases sample positions every 20 rounds; they are not continuous replay video. The remaining-loss sample is selected for diagnosis rather than an unbiased performance sample. The visual assets and coverage records are in `autoresearch/reset_platform_analysis/`; regression-window assets are in `autoresearch/reset_late_analysis/`.

The three regressions are:

| Case | First observed action difference | Observed regression |
| --- | ---: | --- |
| S26 half-r45, Gem Combat 2, side A | round 106 | Deaths 1 to 11; captured gems 829 to 731; dropped gems 0 to 197. The first difference is spell timing, not itself the reset sequence. |
| S21 half-r50, Gem Combat 2, side A | round 41 | The first difference is two melee move/reset combos. Deaths 17 to 16 but kills 11 to 4 and dropped gems 168 to 278. More credited damage does not make every engagement profitable. |
| S26 near-r86, Gift Wrapping, side B | round 492 | The first added action is a move/reset second attack. Identical early trails hide a later divergence. Deaths 6 to 8, kills 5 to 1, captured gems 1165 to 709. |

These are action and outcome observations, not a demonstrated causal chain for every later death. The regression windows show altered central engagements and subsequent paths; causal attribution beyond the first action needs a controlled policy ablation.

Across all 100 matches, average deaths changed little (9.21 to 9.15). Captured gems increased from 711.47 to 747.91 and gems dropped at death decreased from 193.32 to 163.96 per game. Dropped gems may be recaptured and are not permanently lost gems. Among v147's 65 remaining losses, 54 were behind in captured gems by round 300, 51 had at least one death by that point, and only two ever reached 1000 banked plus alive-carried gems before losing. This points toward early income and control of contested camps as the next broad problem; it does not support a blanket claim that late banking is the main remaining failure.

The visuals distinguish two important cases. Big World lost three matches with zero deaths, so combat caution alone cannot repair its income deficit. Gem Combat 1/2, Eight, and Treasure Box show substantial early casualties around contested routes, where income and combat interact. Lanes and Road of Riches show a large early capture deficit without the old multi-hundred-turn idle runs in these candidates. The geometry, arrival-time, budget-resumption, and Varg draft experiments were therefore not copied into v147: each either regressed locally, failed to improve on the platform, or only fixed its narrow mechanism without resolving overall results. v146 finished a 50-match screen at 15 wins versus v141's 15; its planned second fifty was superseded, not completed.

REA was useful earlier for archive inventory, but no Mite executable or source was available. This fix and its validation use source inspection and the official replay decoder; they do not reconstruct Mite's private code. No browser or browser computer use was used.

Activation verification is recorded separately in `CURRENT.json` and, if successful, `best_active_verified.json`. The platform lock is released when the bounded selection check ends; there is no repeated selection guard.

Evidence: `autoresearch/reset_analysis/platform100.json`, `autoresearch/reset_platform_analysis/aggregate.json`, `autoresearch/reset_platform_analysis/regression_divergences.json`, `autoresearch/analysis/walk_reset_evidence.json`, `autoresearch/reset_analysis/final_source_check.json`.

Visual review files: [all changed outcomes, page 1](../reset_platform_analysis/atlas_01.png), [page 2](../reset_platform_analysis/atlas_02.png); [three regression windows](../reset_late_analysis/atlas_01.png); [remaining-loss sample, page 1](../reset_platform_analysis/loss_sample_01.png), [page 2](../reset_platform_analysis/loss_sample_02.png).

Final platform verification: v147 was active and selected at 2026-11-01T13:00:32.241Z. The platform lock is free. No selection guard is running.
