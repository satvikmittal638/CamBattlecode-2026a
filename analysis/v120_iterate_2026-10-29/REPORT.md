# v121: matched platform improvement

v121 won **55/100**, against **38/100** for v120 in a contemporary paired test. Both versions faced the same 20 teams, maps and sides. Each arm used 20 five-game unranked challenges: 50 games near our rank and 50 near half our rank. Eighty games per arm targeted historically weak maps. All 200 matches finished with the intended version and no reported bot or infrastructure errors.

| Pool | v120 | v121 |
|---|---:|---:|
| Near rank | 25/50 | 36/50 |
| Half rank | 13/50 | 19/50 |
| Total | 38/100 | 55/100 |

There were 20 gained wins and three lost wins. Eleven opponents improved, two worsened and seven were unchanged. A bootstrap over the 20 opponent clusters gives a 95% interval of +7 to +28 net wins per 100 scenarios. This is evidence of improvement on this cohort, not a guarantee of future performance. Random choices were not seed matched; one opponent changed draft between arms. Excluding that pair leaves a net gain of 16 wins.

## What changed and why

The selected changes address the loss review rather than reuse old uploaded fixes: Prospector as the first emblem converts cluster captures into more gold and gems; early objective commitment on geometrically separated gated maps reduces repeated planning and idle travel; a cheap legal attack on the assigned visible camp preserves productive turns when planning has used the budget; emergency helpers can answer multi-enemy pressure from three to five turns away. Optional Willow drafting was screened and left disabled. The previously rejected predictive channel cancellation remains disabled.

Local screening covered 300 official matches with no faults or source drift. The small local score differences were treated as noise. Selection relied on mechanisms and replay checks. Native recorded-opponent probes verified the extra farming and helper actions; they do not establish reactive match strength.

## Statistical and visual checks

All 100 candidate replays were decoded and visually reviewed across 17 trajectory sheets, plus paired gain/regression panels and detailed cases. Authoritative replay statistics show mean captured gems 716→871 (+21.7%), captured gold 4314→4651 (+7.8%), wealth at round 300 926→1007 (+8.7%), deaths 12.11→11.16, and kills 6.78→7.69. Capture-recipient counts moved only 42.45→43.21, so much of the gain is improved conversion and resource use rather than a large increase in completed camp cycles. First-300 farming turns increased 8.5%; idle turns declined 4789→4044 across the cohort. Early deaths were unchanged at 2.43 per match.

On Boss Battle, gold captured by round 300 increased from mean 730 to 2025; wins moved 0/4→2/4. Core weak-map results also improved on Line (0→3/4), Guardians (2→4/4), Elk (2→3/4), Cuts (2→3/4) and Vault (1→2/4). Treasure Box and Lanes remained 1/4 each. Four games per map are descriptive and too few for a reliable map-specific effect estimate.

A native action audit found 92/100 replays with at least 98% action agreement and no native preemption, averaging 99.93% agreement. Those contain 451 cheap assigned-camp fallback hits, 2166 assigned-help turns and 2727 pressure escapes. Eight lower-fidelity cases were excluded from mechanism attribution; official statistics and visuals include all 100.

## Remaining failures

Two Boss Battle losses dominate lost-gem totals: enormous recycled bags repeatedly attempt long tributes, are interrupted, then die or remain unbanked at the limit. Consequently mean dropped gems rose 89→350; excluding Boss Battle it was 87→92. Income is better, but late delivery is unresolved. Regressions on Packs, Collision and Elk were examined visually: two had better early income but lost later control/conversion; Elk collapsed early. These motivate a targeted delivery/combat investigation while preserving v121 as the proven baseline.

The uploaded source matches all 22 frozen candidate files. v114 and v120 remain unchanged. v121 (c31510a8-9504-469e-8e2d-4ad2e5efc6ec) is active and pinned; the platform lock was released after all matches finished. Raw paired results, receipts, metrics, visual sheets, and bootstrap output are in paired_c1/.
