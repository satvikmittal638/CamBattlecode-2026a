# Delivery follow-up: the mechanism improves; the broad win gain is unproven

**Decision: keep v121 active and pinned.** The new bank candidate is retained as v123 and locally as `workspace/bots/v122-bank`, but its overall advantage is too small to promote as a proven improvement. The earlier matched experiment remains the substantial result: v121 **55/100 versus v120 38/100** on that separate cohort. See [that report](../v120_iterate_2026-10-29/REPORT.md).

This follow-up completed another **200 platform games**, with statistical decoding, authoritative turn-level banking audits and visual review. No browser computer use or subagents were used.

## Experiment

Each arm used exactly 20 five-map unranked challenges: 50 games near our planning rank110 and 50 near half-rank. Near opponents were ranks104–115 excluding self and unavailable teams; stronger opponents were ranks50–59. Each challenge used a distinct opponent within its arm. Both versions faced the same 20 teams, maps, sides and drafts. All 200 matches finished with the intended version and no reported match or bot errors.

Each arm contained20 Boss Battle games, ten each of Treasure Box, Lanes, Elk Arena, Guardians, The Line and Cuts, plus20 reference games. Both pools had25 games per side; Boss Battle had five per side in each pool. **The other six repeated maps each used a fixed side in this cohort.** This preserves the paired comparison but limits generalization across sides. Random seeds and opponents' executable versions were not controlled; no opponent draft changes were observed.

| Pool | v121 control | v123 candidate |
|---|---:|---:|
| Near rank | 27/50 | 26/50 |
| Half rank | 11/50 | 15/50 |
| Total | **38/100** | **41/100** |
| Boss Battle subset | 8/20 | 12/20 |

Eight losses became wins; five wins became losses. The opponent-cluster bootstrap95% interval is **−2 to +9 net wins per100**, so the three-win overall gain is inconclusive. The v12138/100 in this experiment must not be compared directly with its earlier55/100: the cohorts differ substantially, including five times as many Boss Battle games.

[Findings chart](findings.png) · [paired results](paired_c2/paired_matches.csv) · [full comparison](paired_c2/comparison.json).

## Why this change was worth testing

Detailed v121 replay frames exposed a concrete delivery failure. Against Funky monkeys, Vesper started an845-gem85-turn tribute at round731. An approaching enemy hit891 damage on each turn737–742; the carrier died743 without counteracting. Against FürFortnite, a1336-gem134-turn tribute was reset by locks at736 and747, then a stun753; the carrier immediately restarted754 beside the attacker.

These are different from the earlier failed predictive guard. Damage itself does not interrupt tribute. Automatically abandoning a healthy, finishable channel based on hypothetical future damage had already been rejected and remains disabled.

The new code instead:

1. Lets a carrier with at least200 gems, within three tiles of an altar, use the existing combat policy against nearby visible threats before starting a long tribute.
2. After an actual interruption with gems still held, gives combat up to eight turns before restarting while nearby enemies remain. Without nearby enemies, banking can resume immediately.
3. Cancels a running tribute only when consecutive own turns show real HP loss, remaining time exceeds two ticks, and current HP is at most three times that observed loss. It then returns control to ordinary combat/recovery.

The candidate preserves the v121 farming, income, helper and movement changes. This implementation was developed from these replay sequences, not copied from previous uploads.

## Verification before platform play

The initial240-game official local screen reported47/60 for the control and46/60 for the combined change, with zero faults and no source drift. The first divergence in its Treasure Box regression occurred at round93 with empty bags, before either banking rule ran. This demonstrates the sensitivity of full-match outcomes to fuel/compilation perturbations; the one-win difference was not treated as strategic evidence.

A final72-game check after removing unnecessary vision queries gave31/36 versus32/36, again zero faults/source drift. Those small scores were treated as noise. Selection relied on behavior and broad non-regression.

Recorded-opponent native probes verified escape from the six-hit death sequence and attacks on a weak lock placer after interruption. These probes retain recorded enemy actions and are mechanism checks, not reactive strength evidence. A final controlled Broken Curve probe preserved the old successful route and healthy deposit: both v121 and the candidate finished1099 at1036–999, with no cancellation or preemption. Its pre-live action agreement was96.7%, so it is not included as an exact replay-fidelity claim.

## What the platform replays prove

All100 candidate and100 control replays were decoded. Banking behavior below comes from their actual observed turn starts/actions, not native approximate-fuel simulation.

| Across100 games | v121 | v123 |
|---|---:|---:|
| Deaths during tribute | 35 | **11** |
| Deaths carrying≥200 gems | 74 | **49** |
| Interrupted tribute episodes | 192 | **139** |
| Combat turns within8 turns after interruption | 117 | **341** |
| Large-carrier combat near an altar | 486 | **1145** |
| Voluntary tribute cancellations | 0 | **34** |

All34 cancellations met the actual-damage rule; none cancelled a channel with two or fewer ticks remaining. All34 carriers survived the next turn,28 survived ten turns and26 survived twenty. These survival observations do not establish how many would have died without the change.

On Boss Battle specifically, tribute deaths fell24→6, deaths with≥200 gems66→36, and average dropped gems3135→1661. The first300-round income, equipment and deaths were identical between arms on this map, placing the observed treatment difference in the intended later phase. Wins rose8→12: five gained wins and one regression. The reduced delivery failures are strong behavioral evidence; the map's win sample is still small.

An actual candidate example is [the1553-gem escape](images/near_r112_07.png): at1038 Vesper has1293HP after losing549, with141 ticks left. It cancels, steps away, recalls at1041 with744HP, and is alive and healed at1048 with the whole bag. The final game is1012–181. [Cancellation follow-up data](cancel_followup.json) includes all34 events.

## Visual review and remaining failures

I visually inspected all100 candidate replays on17 opening trajectory sheets, all20 candidate Boss Battle replays on four later-phase sheets, and all20 control Boss Battle cases on four corresponding sheets. I also inspected20 control Treasure Box/Lanes cases on four opening sheets and the detailed original failure/actual candidate frames. Trails sampled every five rounds include recall/dash jumps and are not path-legality evidence. Late sheets cover rounds600–1400; full-match statistics and turn audits cover the whole game.

The Boss Battle regression against Valenki illustrates the limit: the candidate loses274–276, after the control won546–222. Its large carrier repeatedly survives or restarts but the team still fails to convert enough small scores before the limit. Saving a bag does not itself secure the altar or win the race.

The larger unresolved problem is earlier resource control:

- Of59 candidate losses, **51 never reach1000 banked plus carried gems**, and47 are behind in wealth by round300.
- Excluding Boss Battle leaves51 losses. **50 capture fewer than1000 gems and50 never assemble a winning supply.** There are875 deaths, including682 with zero gems and428 while outnumbered within six tiles.
- **Treasure Box remains1/10.** Its nine losses average24.9 deaths versus7.1; round300 wealth is732 versus1406. The visual sequences repeatedly show early pressure near our spawn and poor access to the central resource area.
- **Lanes remains1/10.** Its nine losses average only4.2 deaths versus3.0, but round300 wealth is863 versus1353 and captured gems662 versus1014 over the match. More retreat or tribute protection cannot explain this quiet income deficit. Opening paths repeatedly cover the lower lane while opponents also exploit other resource routes.
- Across all games, total deaths rise12.72→13.53 and captured gems935.8→913.8. Death rate also rises2.26→2.36 per1000 champion turns. The banking mechanism works, but it does not solve the general economy/combat problem.

The next direction should separate these failure types: verify executable, efficient resource circuits and distribution across champions on long maps; on contested maps, assign covering fire to one valuable camp before the farmer gets focused, while retaining other farming income. Mere proximity, a global rally, or another channel threshold would not address the evidence. This is a research direction, not an already validated fix.

## Final platform/source state

The first uploadv122 was cancelled without a compiler log when selected version changed externally tov114 while our lock was held. Automatic review rejected an attempted selection of that cancelled upload; it was not executed. The safer retry compiled as **v123**, ID7032d2a6-c7be-47bd-85e5-c9e5b31a1fb4. Its22 source files exactly match the frozen candidate. No candidate challenges were sent before successful compilation and source verification.

After all200 matches finished, v121 was restored, rebuilt by the platform and verified active/pinned. Its ID isc31510a8-9504-469e-8e2d-4ad2e5efc6ec. The lock was released. Quota usage for this cycle is40/50 challenges. Originalv114 and frozenv121 source hashes remain unchanged. The candidate remains available for further work without claiming a proven broad strength gain.

Artifacts: `verification.json`, `candidate_source_hashes.json`, `uploaded_v123/`, `submissions_final.json`, `quota_final.json`; per-arm intents/receipts/groups and100 replay bundles under `paired_c2/`; four full metric partitions and four banking-audit partitions per arm; `candidate/images/page_01..17.png`, both arms' `late_images/page_01..04.png`, control `weakness_images/page_01..04.png`; source, probe and plotting scripts in this folder.
