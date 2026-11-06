# v41x experiment report (local only; nothing submitted or activated)

Baseline: teammate v41 (`workspace/bots/v41/src`, 24 files, aggregate sha256 `ffef5292…484f`,
identical to `analysis/v41_teammate/v41/src` and to `local_eval/v41/field35` snapshot).
Toolchain: cambc 3.0.2 (SDK 3.0.2), engine 1.0.1, wasi-sdk-33 clang++ `-O3 -DNDEBUG -std=c++20 -msimd128
-mbulk-memory -mbulk-memory-opt -fwasm-exceptions`, Release. Runner: `cambc run-batch --release
--fuel-quantum 100000 --log-limit 0`. Schedule: 35 maps × 5 opponents (tm30, v27, v21, mimic-mite, edge)
× both sides = 350 games. Maps aggregate sha256 `aa4e2feb1b06…`. Every run directory keeps
`results.json`, `provenance.json` (variant/opponent binary hashes, maps, compiler command),
`snapshot/`, `variants/`, runner log; full stdout + exit code in `local_eval/v41x/logs/`.
Holdout (not used for selection): opponents mimic-kratosmessi, mimic-shink, mimic-whim.

## Stage 1 — baseline and switch-off equivalence
- `s1_baseline_repro`: exact-copy v41, 303/350, identical to `local_eval/v41/field35` on 350/350
  games (outcome, both scores, rounds); 0 faults/errors/draws.
- `workspace/bots/v41x`: v41 + switches (all default to v41 behaviour). `s1b_alloff`: 350/350 identical
  to the baseline; runner-built binary byte-identical (`a14eb8e7f0de…`). Whole-file hash differences of
  builds in other directories are path-derived (an untouched copy elsewhere also differs; only the code
  section differs, same size).

## Stage 2 — lanes stall diagnosis
- Instrumented copy `workspace/bots/v41x-diag` (patches in `local_eval/v41x/patches/d*.patch`).
  First version printed at turn start and cost ~29k fuel/turn: the bot never initialised (init needs
  80k) — those 10 games (`s2_lanes_diag`) are invalid. Fixed version emits at turn end with a cheap
  formatter only when >=12k fuel remains (`s2b_smoke`, 1 game, 53 skipped emits, ~8.6k per emit).
  On-path bookkeeping still changed decisions (diag W 1018-863 @1844 vs production W 1018-651 @1413), so
  diagnostic games identify branches but are not paired with production.
- stdout schema: NUL bytes separate log positions (visualiser decoder); fuel file: 77-byte header
  (magic, version 0.0.1, two language ids, two teams × {firstDraftTurn, draftTurn, firstTurn, turn}),
  then u64 values; count = draft picks + one per own End-turn step (incl. dead). Value semantics provisional.
- In the one (diverged) diagnostic game, 2693 of 2869 prolonged-stationary turns (94%) took one path:
  `farm()` F0 no target, because `scoreTargets` was entered with < 68k fuel and no target
  (`early68-none`); knowledge refresh had used ~28k and other pre-farm work ~7k; the watchdog reached 8
  quiet turns but does nothing without a target (`pf-q8-notarget`). Other stationary paths: F3 ring
  wait at a genuinely respawning group (~78 turns), route fuel guard (~35).
- Uninstrumented consistency check (production lanes, 10 games): stationary own turns cost
  p25/p50/p75 35.6k/37.6k/42.4k (fuel file), matching the diagnostic F0-no-target branch
  (35.2k/36.5k/38.2k) and not the ring/capture branches (47–68k). Consistent, not proof.

## Stage 3 — rf24 comparator (X_ROUTEFUEL 36000 → 24000, moveToward only)
- `s3_rf24` vs `s1b_alloff`: 302 vs 303; discordant 11 gained / 12 lost (70 games identical);
  lanes unchanged; exact sign test p = 1.0 (not evidence of no effect). Kept OFF.

## Stage 4 — stall recovery X_SCOREFIRST
Design: when target scoring was entered without a target and exited on its 68k/57k fuel guard, record
the round; in the next own turn (only if exactly the following round) skip one `updateKnowledge` so
scoring runs with near-full fuel on one-round-old beliefs; always disarm at the knowledge phase.
No thresholds changed, no shared memory, fuel quantum unchanged (the switch's bookkeeping itself costs a
few instructions when on). On a skip turn every use of remembered camp-group beliefs (state, hpLeft,
respawnAt, seenRound) is one round old: target scoring, `farm` branch selection (bot.cpp 1199/1237/1265),
the respawning-tile prelude (1440), `yieldToAllies` (642/647), the tribute quick-camp check (1045) and
taskTrail clearing (1285). Live reads on that turn: vision camp tiles (`anyCampVisible`), `refreshCapture`
(engine group state while capturing), gem counts, fight/vision logic. The capture-finished check (1361)
mixes remembered `g.state` with the live gem count; it cannot be active on a skip turn because arming
requires `target < 0` and capturing is released whenever there is no target.
- Lanes ablation `s4_sf_lanes` (off control identical to production 10/10): wins 5 → 7 (+2/−0, n=10).
  Broad proxy "prolonged-stationary share" (no action, same tile >=20 own turns; still includes legitimate
  waits such as spawn healing, respawn rings, capture, stun) 33.2% → 8.3% mean, lower in all 10 games.
  Captured gems per 1000 rounds 516 → 722 mean, higher in 9/10 (v27 side a worse: 715 → 672).
  Deaths/game 1.0 → 1.6 and kills 1.1 → 0.8 — both worse (small n), to be checked on the full field.
- Full field `s5_sf_full`: PENDING.

Correction to Stage 4: the immediate arm (gate 0) can re-arm on the skip turn itself, so consecutive
skips occur (probe logged rounds 18,19,21–25 on one swirl champion); beliefs can then be several rounds
old. "One-round-old beliefs" holds only for the gated arm below.

## Stage 5 — gated stall recovery (predeclared before running)
X_SCOREGATE (int, used only with X_SCOREFIRST; 0 = the original immediate arm, kept as comparator).
Gated arm (gate > 0) requires all of: scoring entered without a target; existing `quietTurns` >= gate
(consecutive own turns with no move/attack/cast at the same tile, same task kind and target, outside
channel/stun/can't-move/capture-tile/spawn-heal waits; resets at 8); and `knowFresh` — this turn ran a
normal `updateKnowledge` (not a recovery skip). So recovery skips are separated by at least one normal
refresh and remembered camp beliefs are at most one round old at any skip. Death/stale frames never reach
the knowledge phase in that turn; the round-bound arm (== round-1) expires otherwise. Single value gate=3. Predeclared narrow test: maps 00lanes + the six s5 regression maps (00reverse-spiral, 00stampede,
00swirl, 01boss-battle, 01islands, 01starfish) × 5 opponents × 2 sides; arms off / immediate / gate3.
Promotion to the full field only if gate3 keeps the lanes mechanism gain and is not worse than off on the
regression maps (paired discordants, deaths, capture income); holdout untouched until a candidate is chosen.

Stage 5 result (`s7_gate_narrow`, 210 games, metrics 210/210, 0 worker errors): off control identical to
s1b_alloff 70/70; the rebuilt immediate arm DRIFTED from the archived s5 `sf` games (49/70 identical —
the added `knowFresh` bookkeeping changes fuel use whenever X_SCOREFIRST is on). Off 62/70; immediate
62/70 (+4/−4, tm30 +3/−4); gate3 63/70 (+4/−3, tm30 +1/−3; regression maps +2/−3; mean margin −18.9).
Both skip arms lowered the broad stationary proxy (8.3% → 3.9%) and raised capture income slightly
(901 → 918/925 gems per 1000 rounds) but raised deaths (7.63 → 9.30 / 8.53 per game; vs tm30 11.0 →
16.6 / 13.5). Gate3 fails the predeclared regression check: knowledge-skip recovery is NOT promoted.
Precision: the gated arm skips at most one refresh consecutively by this mechanism; remembered beliefs of
unseen groups and budget-limited partial scans already age independently. previousStale recovery turns
DO pass through the knowledge phase; a skip there would require an arm from exactly round−1, i.e. a
normally completed previous turn, so the recovery itself cannot be the arming turn.

## Stage 6 — fallback target (predeclared before running)
X_FALLBACKTGT (default off; skip switches off): when the scorer exits on its 68k/57k fuel guard and the
champion has no target, quietTurns >= 3 (X_FALLBACKQUIET, single value) and no move/attack/cast this turn,
pick the nearest group passing the scorer's cheap filters (eligibility incl. gold-only, stalledUntil, ally
capture, ally claims, gdist != UNR — possibly a geometric heuristic —, respawn wait <= 8, scorer freshness
for reward/hpLeft) and a conservative clear-damage estimate (strength × turns-to-clear <= own HP). Knowledge
refresh unchanged. Scan stops below 40k fuel (unmeasured cost; routing needs 36k).
Predeclared test: the 7 maps above + 00rushbait-v2 + 01yellow-brick-road × 5 opponents × 2 sides, off/on.
Promotion to the full field only if: stationary proxy and capture income improve on lanes/rushbait/
yellow-brick-road, the six regression maps are not net-worse in paired wins, and deaths per game do not
rise by more than 10% overall or vs tm30. Holdout untouched until then.
