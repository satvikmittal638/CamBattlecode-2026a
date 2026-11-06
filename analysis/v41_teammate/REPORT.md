# v41 (teammate) analysis — 2026-10-21

Sources: `v41/`, `v40/`, `v39/` (downloaded with `tools/fetch_submission.mjs`), diff in `v40_to_v41.diff`.
Replays: `platform/teammate_v40`, `platform/teammate_v41` (teammate's 20-group batches, same opponents),
`platform/v41_ranked` (29 ranked groups, 145 games). Local: `local_eval/v41/field35`.

## What v41 is
- v40 is byte-identical to our v36 (fishx-c6); v39's endgame and lanes fuel fixes were dropped.
- v41 = v36 + Heart of Ruin:
  - draft: Heart of Ruin replaces Cassi & Issac as first pick in every order (also the gate team);
  - focus item build, capture priority 0 (`carryRank`);
  - Heart's dash used in camp clearing (`attackCampsOf`) and as a fight opener (`v36-heart-control` in `v1_tactical.h`); its damage is in target scoring and fight estimates.
- Fuel safety: scoring needs 68k (was 62k) and returns early under 57k; altar distances computed incrementally; raw SDK reads in `handleLowHp` / `progressFinish`; printf logging with a 10k fuel floor.
- Small fixes: remove enemy altar locks on any altar; Tavi spell estimate 2.2→1.4×Focus; skip a fight move into a newly blocked tile.

## Results
- Ranked: 20 of 29 groups won, 83–62 games; rating 1726 → 1818 peak (1796 at 03:50 UTC).
- Teammate batch, paired by opponent/map/side (90 games): v40 32 wins, v41 49; flips +25/−8.
- Local 35-map field: v41 303/350 vs v39 278/350 (+40/−15).

## Why it wins (100-game batches, per game)
| | v40 | v41 |
|---|---|---|
| gems captured | 647 | 945 |
| our deaths | 22.6 | 13.7 |
| kills | 15.8 | 17.4 |

| per game | Cassi + Issac (v40) | Heart of Ruin (v41) |
|---|---|---|
| gems captured | 182 | 428 |
| kills | 2.3 | 4.8 |
| deaths | 11.0 | 2.8 |

Cassi & Issac were two fragile bodies dying 11 times a game; Heart is one durable carry that clears camps fast and holds captures. Every other champion also dies less and Stellar captures more (159 → 182).

## Remaining weak maps (ranked + batch, 245 games)
- 00lanes 0/9: the fuel deadlock fixed in v39 (`X_ROUTEFUEL` 36k→24k). Platform replay vs Danger Bille: Stellar and Ren frozen r100–r900, our idle 71% vs opponent 16%. All 9 lanes games >37% idle.
- 01yellow_brick_road: both teams idle a lot (map-specific); local v41 4/10 vs v39 7/10.
- 00rows 1/7 (golem cluster never committed: gold-first + caster carry, see local rows tests).
- 00elkring 0/4, 00split 1/4, 01the_farm 1/4, 00rushbait_v2 3/9, 00contest 3/10 (0-gem losses with 110+ deaths).

## Candidate next step (not uploaded)
v41 + X_ROUTEFUEL=24000 (+ optionally X_ENDGAME): targets lanes/yellow_brick_road without touching the Heart changes.
