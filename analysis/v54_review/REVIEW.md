# v54 versus v53

Fetched through read-only HTTP scripts on 2026-10-22. V54 was active when fetched. It was uploaded at **19:30:31 IST** and its recorded active status timestamp was **20:02:38 IST**. No upload, activation, challenge, or bot-source edit was performed for this review.

Both versions were downloaded from the platform. All 25 v53 source-file hashes match the frozen v47p source used in the replay analysis, so this is the correct baseline. V54 has **21 unchanged files, four changed files, and one new file**. The build label changes from `v47p` to `v53-geo`.

## Main change: wall-aware destination scoring

V53 contains `planWork()`, which would compute static fields for camps and altars, but it has no caller. Those fields are otherwise not populated. Consequently, `gdist()` and `altarDistance()` normally fall back to Chebyshev distance when scoring camps and selecting altars.

V53's actual walking already uses wall-aware searches with visible blockers. The gap is between **choosing a destination** and **walking to the chosen destination**.

V54 adds [v47_geometry.h](v54/src/v47_geometry.h), with `warmGeometry()` called after normal turn processing. It progressively computes static distance fields:

1. All altars first.
2. The current committed camp.
3. Remaining reachable, non-Monolith resource groups.

An illustration: a camp five tiles away by straight-line distance might require a 25-step trip around a wall; another camp ten tiles away might have a direct route. The new scoring can distinguish these once the fields are ready.

This directly targets the excessive movement and poor farming/delivery throughput observed in v53. It uses general map geometry rather than map-name or opponent-specific conditions.

## Other changes

| Change | Purpose / resulting behavior |
|---|---|
| Cache completed fields as flat `uint16_t` arrays | Distance lookups can use direct vector indexing rather than repeated SDK field access. |
| Short-circuit active channels before full observation | Saves camp-knowledge scanning while recalling, tributing, or teleporting, while preserving the existing banking-threat hook. Knowledge refresh resumes when the channel ends. |
| Avoid `chooseTarget()` during an ongoing capture | Removes target scoring whose result v53 immediately overwrote with the existing capture target. |
| Invalidate cached camp-to-altar costs when an altar field completes | Lets camp scoring incorporate newly available altar distances. |
| Switch camp scoring to fields only after the resource-field warmup completes | Avoids mixing some fully computed camp distances with other camps' heuristics. Altar distances become usable individually as each completes. |

## When the improvement is available

Warmup only runs for a living, initialized champion that is waiting: channeling, stunned, capturing on the group, or healing on spawn. It also requires at least **82,000 fuel remaining**, no stale frame, and no previous heavy field search that turn. It computes at most one new field per eligible turn.

Important consequences:

- Early busy turns may still use the old camp-distance heuristic.
- Camp distances remain heuristic until the full resource-field warmup completes; the benefit can arrive late on maps with many groups or few cheap waiting turns.
- Dead shopping turns are not used for warmup.
- These are **static terrain distances**, not a guarantee of current travel time through camps and moving units. Actual movement still handles visible dynamic blockers.
- The `geo_ready` log is emitted when the **first altar** field completes. It does not mean all camp fields are ready or that `groupGeometryReady` has switched on.

## Relationship to the bugs found in v53

All five previously reported bugs remain in unchanged source:

| Finding | V54 status |
|---|---|
| Shield-adjusted stay risk compared with unadjusted movement risk | Unchanged `v1_tactical.h`. |
| Highest-damage enemy spell masks a weaker ready spell | Unchanged `v1_tactical.h`. |
| Enemy area-spell forecast omits blast radius | Unchanged `v1_tactical.h` and `v1_kit.h`. |
| Gated banking threat protection restricted to Cassi/Issac, absent from the gated draft | Unchanged bank headers and `draft.cpp`. |
| Range-four boss ring treated as safe against range-five Monoliths | Unchanged boss implementation and gated firing geometry. |

The new channel short-circuit calls the existing bank-threat function, so its Cassi/Issac restriction remains relevant; it has not been generalized to the actual gated team.

Drafts, item builds, feature flags, camp reward/risk scoring formulas, combat policy, small-bag banking policy, and gate-steal thresholds are unchanged. The boss-only branch is byte-identical, so `00contest` receives no gameplay change from this patch. The gated map uses the regular branch and can benefit from geometry warmup, but its objective policy is unchanged.

## Assessment

This is a focused and plausible correction to a real v53 gap: the intended static geometry preprocessing was never called. It can improve camp/altar selection and reduce wasted computation. It is not a broad combat or boss-strategy revision, and its win-rate benefit has not been established by this source review.

No new definite defect was identified in the changed lines by inspection. The important validation questions are how early full camp geometry becomes active, whether the full-field work stays within the waiting turn's fuel, and whether the improved choices increase captures and scoring. I did not build, run matches, or submit anything for this request.

Artifacts: [source-only diff](source_only.diff), [file hashes](comparison.json), [v53 metadata](v53/submission.json), [v54 metadata](v54/submission.json).
