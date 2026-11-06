# v56 weakness fixes: work log

Active platform baseline fetched by HTTP only: v56 bd552e32-5646-4404-bfe1-b46c0d1838bd. All 28 files frozen under baseline/src; exact copy v56-frozen. No platform change or new challenge made during development yet.

Candidate lab: workspace/bots/codex-v57-lab/src. Isolated candidates: v57-objective, v57-plain, v57-risk, v57-camp. Broad 800-game exact-source comparison is running in broad_current; source snapshots and manifest are immutable.

## Confirmed fixes and tested strategy changes

- v56 omitted v55 forecast, shield, retreat-dash and retaliation corrections; restored while preserving v56 bridge-dash, bank-lock and low-fuel ABI improvements. Core regression passes.
- Escape decisions now explicitly end the combat branch, so a melee escape dash cannot fall through to farming movement.
- Two-turn response independently repeated a ready eight-turn spell. A legal-sequence forecast is implemented/tested with mechanical fixtures; enabling it alone lost local games. Stricter fight/escape risk thresholds are tested separately; do not claim guaranteed match benefit from arithmetic correctness.
- Gate closure used whole-group life rather than observed altar access. New mode permits tribute when any legal altar approach is personally observed free. Unseen approaches remain blocked. Production-method fixture passes.
- Dynamic gate firing geometry drops personally observed dead camp tiles. Initial suspicion of permanent geometric inability was too strong: geometry regression finds other old firing tiles. It adds three geometric positions in the tested layout, but visibility/casting availability is not proved by geometry alone.
- New special-map controller uses regular meta team and durable Jungle Health + Durability Health builds, followed by damage/health growth. After generic equipment capital threshold, commits to a home-side monolith or mandatory gate; uses normal legal camp executor and recovery rather than idle steal-only ranged casters. No map-name/opponent-name branch.
- Adaptive shopping saves trips after 3/6 completed emblems (150/300/450 gold thresholds).

## Completed screening batches

### regular_screen

| Variant | Wins | Mean gem margin | Paired gains / losses |
|---|---:|---:|---:|
| base | 23/36 | 244.8 | control |
| aoe | 23/36 | 218.5 | 0 / 0 |
| cycles | 20/36 | 146.5 | 0 / 3 |
| combat | 19/36 | 122.4 | 2 / 6 |
| shop | 25/36 | 260.6 | 4 / 2 |
| heal | 23/36 | 175.4 | 7 / 7 |
| pack | 22/36 | 233.5 | 5 / 6 |
| mix | 23/36 | 142.2 | 6 / 6 |

Runner exit 0; source changes 0. All native fault counts zero.

### special_screen

| Variant | Wins | Mean gem margin | Paired gains / losses |
|---|---:|---:|---:|
| base | 11/16 | 0 | control |
| geometry | 12/16 | 0 | 1 / 0 |
| clear | 4/16 | -258.5 | 1 / 8 |
| tank | 5/16 | -208.5 | 1 / 7 |

Runner exit 0; source changes 0. All native fault counts zero.

### burst_screen

| Variant | Wins | Mean gem margin | Paired gains / losses |
|---|---:|---:|---:|
| base | 22/36 | 199.9 | control |
| burst | 18/36 | 114.4 | 2 / 6 |
| burstShop | 22/36 | 197.3 | 4 / 4 |
| burstAoe | 20/36 | 141 | 3 / 5 |
| burstTeam | 20/36 | 73.7 | 4 / 6 |

Runner exit 0; source changes 0. All native fault counts zero.

### boss_objective

| Variant | Wins | Mean gem margin | Paired gains / losses |
|---|---:|---:|---:|
| base | 6/8 | 0 | control |
| objective | 8/8 | 800 | 2 / 0 |
| early | 8/8 | 750 | 2 / 0 |
| late | 8/8 | 975 | 2 / 0 |

Runner exit 0; source changes 0. All native fault counts zero.

### boss_holdout

| Variant | Wins | Mean gem margin | Paired gains / losses |
|---|---:|---:|---:|
| base | 4/6 | -333.3 | control |
| objective | 6/6 | 900 | 2 / 0 |
| mid | 6/6 | 900 | 2 / 0 |
| later | 6/6 | 833.3 | 2 / 0 |

Runner exit 0; source changes 0. All native fault counts zero.

### gate_objective

| Variant | Wins | Mean gem margin | Paired gains / losses |
|---|---:|---:|---:|
| base | 5/8 | 0 | control |
| objective | 8/8 | 903.6 | 3 / 0 |
| early | 6/8 | 522.6 | 2 / 1 |
| mid | 7/8 | 716.5 | 2 / 0 |

Runner exit 0; source changes 0. All native fault counts zero.

### fight_screen

| Variant | Wins | Mean gem margin | Paired gains / losses |
|---|---:|---:|---:|
| base | 23/36 | 163.1 | control |
| noChase | 20/36 | 144.3 | 6 / 9 |
| noChaseShop | 24/36 | 214.6 | 8 / 7 |
| camp | 24/36 | 233.4 | 7 / 6 |
| campShop | 23/36 | 178.3 | 5 / 5 |
| burstRisk | 25/36 | 266.2 | 8 / 6 |

Runner exit 0; source changes 0. All native fault counts zero.

These screens repeat deterministic control conditions; counts are not independent evidence. Most screening regular maps were six current maps; broad comparison explicitly covers all 40 actual files. Local historical/mimic opponents are not the top teams private source.

## Next steps

Finish broad_current, choose based on exact baseline comparison, verify on archived maps/held-out opponents, run logged smoke matches and audit behavior/fuel. Submit only if final candidate has compelling controlled evidence; use scripts/CLI exclusively. Future platform sampling must use distinct opponents without side-swapping repeats.

## Live-replay follow-up: retain frozen v57

Ward-budget / Marcella Focus screen: 144 games, base26/36, scout25/36, Focus25/36, both26/36; no compelling gain. Route guard initial screen: base26/36, guard25/36. Stun-aware route guard broad test: 480 games, base164/240, candidate165/240, paired25 gains24 losses, mean margin+7.5, zero native faults/errors, exact sources unchanged. Candidate not selected, no v58 upload. All replay files and source snapshots retained.

## Completed public verification and current-rank1 follow-up

v57:100 distinct-opponent challenges/500 games fully verified,47/100 challenges and228/500 games; nearby38/50 and156/250, half-rank9/50 and72/250. Native99,799,706steps,0 decode failures/official discrepancies/platform faults;1 caught error,20 ordinary fuel-limit inputs,21 cross-round suspensions. Frozen28 source files still unchanged.

Fresh rank1 Intercontinental Fish study20 current replays, plus all500 v57 replays split by score margin.145 normal-map losses by≥500; early farming/survival deficit. Detailed economy-stall case82–1,140 with1 camp death. Current draft-ID/live-type-ID mismatch corrected explicitly; draft11 is Heart, not Tavi. Fresh handbook JS/rules/patch notes all byte-identical to updated docs.

720-game equipment experiment rejected: base164/240, Fish Vesper build156/240, protected-then-Strength161/240. Capture allocation experiment: initial172/240 vs164, firstholdout157/160 vs156 (margin -9.1), strongerholdout114/160 vs118 (margin -9.5). Fixed Vesper priority not selected; total443/560 vs438, offsetting53 gains48 losses. Combined build+allocation152/240 rejected. No experimental v58 uploaded.

Online per-observer/per-enemy movement fingerprint model:20 games,48,121 consecutive personal-visibility labels, exact destination45.38% vs stay45.96%/velocity45.98%; mean tile error.7399 vs.6192/.7581. Research model not enabled; higher-level camp/retreat fingerprints remain a proposed policy layer. Reports and all source/replay evidence: `../rank1_learning_2026-10-23/REPORT.md` and `../v57_eval_2026-10-23/REPORT.md`.
