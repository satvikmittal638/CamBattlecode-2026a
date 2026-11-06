Independent tests before Claude continuation (20 October 2026)

No bot source was modified by Codex. The pre-change edge source hashes and map pool are in baseline_manifest.json.

- CLI 3.0.1; diagnostic match confirms engine 1.0.0.
- edge vs tm30: 10/42 wins, average gem difference -401.9. All 21 maps, both sides. Split: side A 4/21, side B 6/21.
- edge vs v27: 18/42 wins, average gem difference -167.4.
- A logged release match on 00elkring ended 990-1012 at round 932. Official statistics report zero bot faults for both sides. Edge stdout contains no suspended-frame or bot-error lines and no decision lines with API errors.
- These are local comparisons against existing bots, not proof of leaderboard strength.

Claude must decide the implementation and submit after the independent candidate review. Codex may run tests, inspect code and results, and send critiques, but must not implement bot changes.

The original reasoning-only schedule was cancelled after the user's role correction. An attempted unattended scheduler with broad write/shell access was rejected by automatic approval review. The planned continuation is supervised and interactive with manual permissions; no background continuation is currently scheduled.

Complete same-field comparison: edge 46/126 wins (v27 18/42, v21 13/42, mimic-mite 15/42), gem difference -219. tm30 93/126 wins (33/42, 26/42, 34/42), gem difference +240.82, zero bot faults and no source changes.
