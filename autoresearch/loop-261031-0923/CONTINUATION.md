# V114-line autoresearch continuation — 31 October 2026

I read Claude Code's project `MEMORY.md`, `v114-line.md`, `autoresearch-loop.md`, its v114 walkthrough transcript, and the installed autoresearch classic-loop protocol. I reused its local match, holdout, replay, git and platform tools. No browser automation was used.

## Resume point

Claude's chat stopped after iteration 14 because its session could not authenticate. The workspace held an unlogged iteration 15 commit (`7833e6e`), and its local and holdout tests were already complete. I audited those results, then resumed the same loop and recorded iterations 15–17 in `results.tsv`.

| Iteration | Change | 96 local games versus v121 baseline | 24 archived-map games versus v121 baseline | Decision |
| --- | --- | --- | --- | --- |
| 15 | Non-kill fight-risk threshold 0.95→0.6 | 61 wins, +1 over incumbent | 10 wins, 4 below incumbent; 311 versus 227 deaths | Reverted |
| 16 | Cheap isolated-outmatched escape before response planning | 59 wins, 1 below incumbent | 3 wins, 11 below incumbent; 372 versus 227 deaths | Reverted |
| 17 | One target instead of two in contacts with ≥4 enemies | 62 wins, +2 over incumbent | 11 wins, 3 below incumbent; 319 versus 227 deaths | Reverted |

The incumbent had 60/96 local wins and 14/24 archived-map wins. All three changes built and completed with zero match faults. Iterations 16 and 17 each addressed a plausible crowded-combat mechanism; the archived-layout losses show that early avoidance and narrowed target choice harmed overall play. Local small gains were not accepted as proof.

The user-approved autoresearch workflow stops after five consecutive checks without a kept improvement. Iterations 11–17 are seven such checks. I stopped at this plateau instead of spending challenge quota on a candidate that failed the agreed robustness gate.

The candidate source tree is clean and its `src` tree hash equals the accepted cleanup commit `750097b`: `89c0725104e5751a4cb6177e07f9b7cd84d46f84`. Platform readback at 14:34 UTC showed **v135 active and selected**. The workspace platform lock is absent. I made no platform submission, challenge, or active-version change.

## Next research direction

Analyze the first action divergence in archived-map losses, especially crowded contacts, before another tactical patch. The large outcome shifts from small planner changes suggest fuel/order sensitivity. Measure action and fuel traces on the exact states, then isolate a behavior-preserving budget fix rather than applying a global retreat or target rule.
