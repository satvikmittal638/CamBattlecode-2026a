# v41x experiment report — local only (2026-10-21)

## Recommendation
**Keep the unchanged teammate v41** (`workspace/bots/v41/src`). No candidate met its predeclared promotion
rule. The most promising change, the fallback target (`X_FALLBACKTGT`), is kept only as an
**experimental, unvalidated** artifact. No platform challenge, submission or activation took place in this
pass. The holdout opponents were never run, because no candidate qualified for them.
(The earlier stage-by-stage draft is preserved as `REPORT_draft_before_final.md`.)

## Artifacts
| Role | Location | Source aggregate sha256 | Release binary sha256 (bot-injected.wasm) |
|---|---|---|---|
| Recommended: v41 (unchanged) | `workspace/bots/v41/src` (= `analysis/v41_teammate/v41/src` = `local_eval/v41/field35/snapshot/src`) | `ffef529200b93b73c056aab8dfe4c6edd45d2da4e86673bce6578f13c374484f` | `a14eb8e7f0de1806ddf6f234aa7c4bfc9418cab32576346e35fea7ebf7a700d6` (`workspace/bots/fedb2d4a-base`) |
| Experiment source, every switch at its default (tested identical to v41 only on s8's 90 games) | `workspace/bots/v41x/src` | `b55ceec6e8432c755d9d11471292839dc90eacc9c9a58d6874dfa37d82a1cab9` | s8 off control: `6a3feff8c2478b8efa14ab99bb300001588daa9ab9941c741cf1eea2b5e7774b` |
| Experimental fallback (not validated) | `workspace/bots/fe66e002-fb` (the s8 snapshot plus `variants/fb.fishx_features.h`, which sets `X_FALLBACKTGT=true`) | `b059075056abe0277207f885333c1df7d6cdad74b3c43967bef43a2d40650a3f` | `ada478a48a7af45c73ccb173fd7177a66e7002b953597c9a77b734b60ad18be6` |

Switch defaults in v41x: `X_ROUTEFUEL=36000`, `X_SCOREFIRST=false`, `X_SCOREGATE=0`,
`X_FALLBACKTGT=false`, `X_FALLBACKQUIET=3`. All code edits are recorded in
`local_eval/v41x/patches/*.patch`, applied with `crlfsub.py`, which preserves CRLF line endings.

## Setup and provenance
- **Toolchain:** cambc 3.0.2 (SDK 3.0.2), engine 1.0.1, wasi-sdk-33 clang++ in Release, flags
  `-O3 -DNDEBUG -std=c++20 -msimd128 -mbulk-memory -mbulk-memory-opt -fwasm-exceptions`.
- **Runner:** `cambc run-batch --release --fuel-quantum 100000 --log-limit 0`, driven by
  `tools/field_eval.mjs --keep-bots`.
- **Field:** 35 maps (aggregate `aa4e2feb1b06…`) × 5 opponents (tm30, v27, v21, mimic-mite, edge) × both sides,
  350 games per variant.
- **Records kept per run directory:** `results.json`, `provenance.json` (variant and opponent binary hashes, map
  hashes, compiler command), the frozen `snapshot/`, `variants/`, and the runner log. The full stdout and exit
  code of every run are in `local_eval/v41x/logs/`.
- **Holdout, never used:** opponents mimic-kratosmessi, mimic-shink and mimic-whim, plus the archived maps.

## Run summary (local, paired by opponent/map/side against each run's `base`)
| Run | What | Result |
|---|---|---|
| `s1_baseline_repro` | exact copy of v41 | 303/350; identical to `field35` on 350/350 games; 0 faults, errors or draws |
| `s1b_alloff` | v41x, switches off | 350/350 identical to baseline; runner-built binary byte-identical |
| `s2_lanes_diag` | first diagnostic build | **invalid**: printing at turn start cost about 29k fuel, so the bot never initialised |
| `s2b_smoke` | fixed diagnostic build, 1 game | usable logs; play diverged from production (W 1018–863 vs W 1018–651) |
| `s3_rf24` | `X_ROUTEFUEL=24000` | 302 vs 303; 11 gained / 12 lost; lanes unchanged; **off** |
| `s4_sf_lanes` | immediate `X_SCOREFIRST`, lanes only | 5→7/10 (+2/−0) |
| `s5_sf_full` | immediate `X_SCOREFIRST`, full field | 303→307 (+10/−6, sign p = 0.45); **all 6 losses vs tm30**; **off** |
| `s6_probe` | skip-printing probe, 3 games | hypothesis evidence only (see limits) |
| `s7_gate_narrow` | off / immediate / gate3, 7 maps | gate3 failed its regression check; immediate comparator drifted; **off** |
| `s8_fallback_narrow` | off / `X_FALLBACKTGT`, 9 maps | 74→78/90 (+7/−3, p = 0.34); regression maps net −1, so the predeclared rule fails; **not promoted** |

## Data classes
- **Engine-authoritative.** From the statistics JSON: outcome, submitted gems, rounds, bot faults. From replays:
  native kill counters and alive→dead transitions.
- **Replay-derived proxies:**
  - **Prolonged-stationary share:** no action on the champion's own turn, on the same tile for 20+ of its own
    turns. It still includes some legitimate waits.
  - **Capture income:** gem gains of capturing champions on Capture steps.
  - **Legitimate-wait categories:** stun, spawn heal, recall or tribute channel, capture tile, respawn ring.
    All are proxies, not bot state.
- **Diagnostic logs** (`v41x-diag`): bookkeeping inside the decision code changed decisions, so these logs
  identify branches but cannot be paired with production games.
- **Fuel file:** the layout was verified from the visualiser decoder: a 77-byte header (magic, version 0.0.1,
  two language IDs, two teams × four limits), then one u64 per draft pick and per own end-turn step.
  What each value measures is still provisional.

## Stall diagnosis (lanes)
- **Instrumented game.** In the one instrumented, diverged game (`s2b_smoke`), 2693 of 2869 (94%)
  prolonged-stationary turns followed one path:
  - `farm()` had no target (F0);
  - because `scoreTargets` was entered with less than 68k fuel and no target (`early68-none`);
  - after the knowledge refresh had spent about 28k and other pre-farm work about 7k;
  - and the watchdog's 8-quiet-turn branch did nothing, since there was no target (`pf-q8-notarget`).

  The 94% applies to that single game only.
- **Production consistency check.** In the 10 production lanes games, stationary own turns cost
  p25/p50/p75 35.6k/37.6k/42.4k (fuel file). That matches the diagnostic no-target branch
  (35.2k/36.5k/38.2k) and not the ring or capture branches (47–68k). Consistent, but not proof.
- **Legitimate-wait proxies.** On four representative production lanes traces, none of the stationary turns
  matched a legitimate-wait proxy; most were spent within 2 tiles of a live camp. Zero proxy matches is not an
  exact exclusion of every legitimate wait.

## Candidates and why each is off
- **rf24** (`X_ROUTEFUEL` 36000→24000 in `moveToward` only): 11 gained / 12 lost, lanes unchanged.
  This shows no demonstrated effect; p = 1.0 is not proof of no effect.
- **Immediate `X_SCOREFIRST`** (skip one knowledge refresh in the round after a fuel-starved, no-target
  scoring):
  - **Lanes:** stationary proxy 33.2%→8.3%; capture income 516→722 gems per 1000 rounds, with v27 side a worse
    (715→672). Deaths per game 1.0→1.6.
  - **Full field (`s5`):** off control identical 350/350. 307 vs 303 (+10/−6); every loss came against tm30,
    some with large swings: swirl b 1005–30 → 121–1007, boss_battle b 1142–8 → 145–464, stampede a
    960–160 → 320–800.
  - **Full-field metrics (700/700, 0 worker errors):** stationary 3.2%→1.4%; capture 772→792; deaths
    6.83→6.97. Against tm30: deaths 9.13→10.04, capture 726→723.
  - **Bounding:** it can re-arm on the skip turn itself, so consecutive skips happen (the probe logged rounds
    18–19 and 21–25 for one swirl champion).
  - **Probe limits (`s6`):** the round signature samples only position, rounded HP and gems at round start.
    The probe's extra branch and printing changed play: the swirl probe won 1039–631 where production
    lost 121–1007. Its first logged skip need not equal production's first skip. So whether boss_battle's
    divergence at round 188 came from a skip or from bookkeeping is **unresolved**.
- **Gated `X_SCOREFIRST`, gate = 3** (also requires `quietTurns`≥3 and a normal refresh on the arming
  turn; at most one additional refresh is skipped consecutively by this mechanism; beliefs about unseen
  groups and budget-limited scans still age independently):
  - **`s7` results:** off control identical to `s1b_alloff` 70/70. The rebuilt immediate arm matched archived
    s5 `sf` in only 49/70 games. That is the observed fact. The added `knowFresh` bookkeeping changing fuel use
    and branches is an explanation consistent with it, not a measured, isolated cause.
  - **Wins:** off 62, immediate 62 (+4/−4), gate3 63 (+4/−3: tm30 +1/−3; regression maps +2/−3; mean margin
    −18.9).
  - **Metrics (210/210):** both skip arms lowered the stationary proxy 8.3%→3.9% and raised capture
    901→918/925, but deaths rose 7.63→9.30 (immediate) and 8.53 (gate3). Against tm30, deaths rose
    11.0→16.6 and 13.5.
  - **Verdict:** fails the predeclared regression check, so neither skip arm is promoted.
  - **Stale frames:** recovery turns after a stale frame do pass through the knowledge phase. Whether a pending
    arm is cleared correctly after partially completed or aborted frames was **not verified**. This is
    unresolved for both rejected skip variants.
- **Fallback target (`X_FALLBACKTGT`; skip switches off; knowledge refresh unchanged).**
  - **Trigger:** the scorer exits on its 68k or 57k fuel guard, and the champion has no target,
    `quietTurns`≥3, and no move, attack or cast this turn.
  - **Pick:** the nearest group that passes the scorer's cheap filters (eligibility, `stalledUntil`, ally
    capture or claim, `gdist`≠UNR, which may be a geometric heuristic, respawn wait ≤8, the scorer's
    freshness rules) and a conservative clear-damage *estimate* (≤ own HP).
  - **Fuel guards:** 45k at entry, 40k inside the loop. The scan cost is unmeasured.
  - **`s8` results:** off control identical to `s1b_alloff` 90/90. 78 vs 74/90 (+7/−3, sign p = 0.34), mean
    margin +40. tm30 +3/−2; lanes +3/−0; rushbait +2/−1; yellow_brick_road +1/−0.
  - **Regression maps:** +1/−2 (boss_battle +1, stampede −1, starfish −1), net −1. **This fails the
    predeclared "not net-worse on the regression maps" rule, so it is not promoted.**
  - **Metrics (180/180, 0 worker errors; raw data in `s8_fallback_narrow/mech_per_game.json`):**
    stationary 11.3%→5.0%, capture 827→876, deaths 7.27→7.78 (+7.0%). Against tm30: deaths
    10.39→11.28 (+8.6%), capture 784→808.

| Map | Stationary proxy (off → on) | Capture income, gems per 1000 rounds (off → on) | Deaths per game (off → on) |
|---|---|---|---|
| lanes | 33.2% → 2.2% | 516 → 774 | 1.0 → 1.2 |
| rushbait_v2 | 27.4% → 16.9% | 462 → 563 | 4.2 → 4.6 |
| yellow_brick_road | 16.8% → 4.9% | 674 → 784 | 7.8 → 8.4 |
| reverse_spiral | 21.0% → 20.6% | 470 → 481 | 6.4 → 7.1 |
| swirl | — | 986 → 946 | 13.6 → 14.8 |
| starfish | — | 805 → 774 | 19.3 → 20.1 |
| stampede | — | 456 → 451 | 7.7 → 7.8 |
| islands | — | 1000 → 1010 | 1.8 → 1.7 |
| boss_battle | — | 2072 → 2102 | 3.6 → 4.3 |

Deaths rose on most maps.

- **Low-HP protect call:** deferred, not implemented. Helper safety, helper attrition and single-packet
  contention were not validated, and neither was how representative the local opponents are for this
  behaviour.

## Limitations
- **Opponents:** local only, five fixed opponents. How they compare with ladder opponents was not measured
  in this pass. No platform validation, no holdout run.
- **Repeats:** every comparison is a single deterministic run. Deterministic repetitions add no independent
  evidence.
- **Chaos sensitivity:** small instruction-count changes from inactive or bookkeeping code flip games. Paired
  discordant counts are small and inconclusive (p = 0.34–1.0).
- **tm30 risk:** both knowledge-skip arms raised deaths against tm30, which is closest to our own code.
- **Off-switch equivalence of the final v41x source** was verified only on s8's 90 games. Earlier source
  states were verified separately: s7's 70 games at the gate stage, and the full 350 at the s5 stage.
- **Fuel-file values and all proxies** are labelled provisional or proxy throughout.

## What remains (not done in this pass)
- Replicated or perturbed runs, and platform paired runs against a concurrent v41 control, for the fallback
  candidate.
- A fallback variant that avoids the regression maps without map-specific rules.
- Holdout validation once a candidate passes its predeclared rule.
- The low-HP protect call, as its own ablation.
