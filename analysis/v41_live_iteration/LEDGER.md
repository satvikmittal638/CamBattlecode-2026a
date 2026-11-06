# v41 live iteration — state ledger (update before each step)

## 2026-10-21, written shortly before 12:07 UTC (this header originally said "about 12:30 UTC", which was wrong)
- **Platform:** active v41 (id `bfd64c40-f104-41a6-b78b-550f32be559a`, the teammate's upload). Quota 0/50 at
  11:50 UTC. Lock free. NOTHING has been submitted, activated or challenged by this iteration yet.
- **Candidate:** `workspace/bots/v42h` = v41 plus `X_HORHEALTH` (Heart of Ruin second emblem Durability Health, +500
  max HP, −60 Focus, same 10% damage reduction). Default off.
- **Local gate `local_eval/v41_live/l1_horhealth_full`** (frozen; DO NOT modify): off 304/350, on 309/350 (+9/−4).
  **Fails the intended gate:** the off control matched the v41 baseline (`s1_baseline_repro`, 303/350) on only
  335/350 games, because the ternary `plan = X ? vector{...} : vector{...}` changes code even when off. 304→309 is a
  comparison inside that altered implementation, so the original 303→309 cannot be attributed to the health emblem.
  (This does not show that there is no health effect; it only means l1 is not valid evidence either way.)
- **Fix in progress:** use compile-time selection (`if constexpr`) that keeps the original initializer-list
  assignment on the off path; verify the off control reproduces v41 (the 15 previously differing games, or the code
  section), then rerun the full field as needed.
- **Platform script** `analysis/v41_live_iteration/live_iter.mjs` (syntax-checked, NOT run). Required fixes before any
  run, per review a–g:
  - (a) prevalidate maps, sides, opponents and IDs; group 2 = the same 5 maps with inverted sides;
  - (b) strict per-chunk check of the expected previous arm, and restore only when safe and confirmed;
  - (c) lease lock with an owner token and heartbeat; never erase another's lock;
  - (d) take the submission ID from CLI output, keep the full log, verify hashes and a build-readiness timeout;
  - (e) require exactly 5 finished matches of the expected version per group (80 total), else mark incomplete and
    stop;
  - (f) no automatic retry of ambiguous POSTs; reconcile instead; refuse to rerun over existing receipts;
  - (g) bounded collection after releasing the lock.
- **Default end state:** restore v41 unless the evidence review selects the candidate.

## 2026-10-21 12:08 UTC
- `local_eval/v41_live/l2_offcheck` (fixed v42h via `if constexpr`, off only, the 8 maps holding the 15 previously
  differing games × 5 opponents × 2 sides = 80 games): **80/80 identical** to `s1_baseline_repro`, 0 faults, 0 errors.
- Launched (background) `local_eval/v41_live/l3_horhealth_full`: fixed v42h, `--variants "base:,hh:X_HORHEALTH=true"`,
  the exact 35 maps of `local_eval/v41/field35/results.json` (same as l1), opponents tm30,v27,v21,mimic-mite,edge,
  `--keep-bots`, 700 games. Log `analysis/v41_live_iteration/l3_horhealth_full.stdout.log`.
- Platform: unchanged by us (v41 `bfd64c40-…` active, quota 0/50 and lock free at the last check). Original
  `workspace/bots/v41` unchanged.
- Next: rewrite `live_iter.mjs` per a–g while l3 runs.

## 2026-10-21 12:37 UTC
- l3 (`local_eval/v41_live/l3_horhealth_full`, 700 games): off-control 350/350 identical to `s1_baseline_repro`, and the off
  binary is byte-identical (a14eb8e7…). hh 309/350 vs 303/350 (+9/−3, p=0.146), 0 faults/errors, no stratum negative.
  Mechanism (`l3_mechp.txt`): Heart deaths/game 1.63→1.22, all deaths 6.83→6.38, capture gems/1k rounds 772→792.
  **Local gate: all pre-registered criteria pass** (the result is not statistically significant on its own).
- Candidate = the exact tested bot `workspace/bots/fe50778c-hh` (release bin 77d1b41e…). `workspace/bots/v42h-on` is a
  source-identical alias kept as evidence; its release binary differs by 17 bytes (path-dependent), not used.
- Runner `live_iter.mjs` rewritten for a–g plus fixes: ladder `L.pages`; ':3' name ambiguity resolved to the highest rank;
  no restore unless still owning the lock; collection verified against receipts. The unrun draft is kept as
  `live_iter_draft1_unrun.mjs`.
- Plan frozen in `platform/v42h_ab1/plan.json`: A=:3 (r4), B=Intercontinental Fish (r1), C=Bamboo Teahouse (r47),
  D=subscribe to caterpillow (r73, our rank 76 − 3). Maps lanes, the_farm, swirl, starfish, fragment; sides ababa/babab;
  chunks cand AB | ctrl AB | ctrl CD | cand CD; 16 groups / 80 matches, reserve 10.
- RUN started (background); results go to `platform/v42h_ab1/`.

## 2026-10-21 12:50 UTC — second alternative v42b (frozen before results)
- `workspace/bots/v42b` = v42h src + `X_HORBRUISER` (default off; compile-time `else if constexpr` with direct initializer
  list): Heart second emblem Bruiser Health {6,2,5} instead of Durability Focus {2,1,5}; X_HORHEALTH stays false.
- Local gate `local_eval/v41_live/l4_horbruiser_full` (base off / bh on, exact 35 maps, tm30,v27,v21,mimic-mite,edge, both
  sides, 700 games). Criteria (same as v42h): zero faults; off control identical to `s1_baseline_repro` (350/350); gained > lost;
  no map stratum or opponent net below −2; capture income not down by more than 3%; Heart deaths/game down (necessary, not
  sufficient). Not submitted while the v42h runner holds the lock; a clear regression rejects it.
