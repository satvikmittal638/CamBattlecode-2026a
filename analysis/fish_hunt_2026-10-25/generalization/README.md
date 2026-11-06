# Generalizing the Fish counter

Objective: beat current Intercontinental Fish across all 40 published maps. Six-map Team-A script playback in v80 is retained as a reproducible reference, not treated as an all-map result.

## Evidence

- Fresh v80 trajectories: six distinct winning references, three sets, 15/15 live wins.
- Existing developer-versus-Fish corpus: 185 indexed games, 106 wins, 39 maps. Native detailed records are available for 184 of these games (105 wins, 79 losses). One native record is missing; it is recorded in developer_fish_corpus.json. Same engine patch; opponent policies can have changed since those games.
- These outcome-conditioned associations are not causal ablations: Prism averaged 354.36 camp gems and 1.10 deaths in the 105 decoded wins, versus 173.25 gems and 3.67 deaths in the 79 losses.
- Prism's common older build starts Durability Health → Monster Focus → Jungle Health, while the two fresh three-pick wins start Monster Focus → Bruiser Focus → Jungle Health. Equipment order is a hypothesis to test, not a single proven universal build.
- Fresh wins demonstrate distinct resource modes: Prism-retention, Vesper-led income, and cheap direct gem racing. The roster and resource values should respond to camp composition and current strength.

## First state-based experiment: general06 / v81

No action tables, stored coordinates or round-indexed playback. Derived from the v77 reactive controller, with a camp-composition draft, Prism Focus equipment and gem retention, lower gold-only weight, first-arriver capture allocation, conditional recovery recall, and altar-lock purchases/placement.

Local functional check against v62: 3/6 wins; zero runner faults. This is not a live Fish benchmark. On fragment the bot helped clear camps quickly but Prism received its first camp reward only at round 273, whereas the winning reference had rewarded Prism at round 35. Heart received the early wolf rewards. Prism ended with only 100 camp gems while Heart received 546. This demonstrates a failure to distribute the rewards in a way that starts Prism's scaling.

The v62-derived source declares and defines carryWants but never invokes it. Capture rank switches alone therefore do not implement the intended preference. A subsequent experiment should wire a physical handoff into capture execution, keep the region continuously occupied when possible, prioritize a nearby productive carry, and never wait indefinitely for a distant one. It should also reserve small early tasks for a weak Prism rather than blindly grouping all three bodies on them.

The current candidate still inherits the old gated-altar draft and gate behavior. Local boss_battle stagnated at zero banked gems. That is an explicit unresolved all-map failure, not a successful generalization.

## Evaluation

Read the current map registry through scripts. Use distinct maps within each new candidate's initial three five-map challenge sets. Initial v81 test: six formerly scripted maps and nine unseen maps, including newly published 00ambush. Track each version/map/side separately and retain native replay evidence. Evaluate eventual best candidate across the full pool; repeated wins on a fixed script/map are not statistical evidence of map generalization.

Do not silently fold v80's scripted wins into the generalized candidate's win rate. Report these as different policies.

## Stop requested after v82

The user requested stopping after v82. The platform marked v82 (`75740b56-6c6b-4fbb-86f9-2eb135389f1c`) **cancelled at 2026-10-25 09:56:35 UTC**, before compilation completed and before any v82 challenge request was sent. No cancellation reason was included. No reupload or v83 was created. **v81 remains active.** See [stop_summary.json](../trials/general07/stop_summary.json).

v81 finished its fifteen distinct-map live tests with **1 win / 15**, winning `00lost_world` 1115–941. Its other fourteen games were losses. All fifteen replay bundles were downloaded and natively validated, and all 33 uploaded source files were verified through the official archive. See [result.json](../trials/general06/result.json).

v82 was designed to fund a nearby Prism through a physical capture handoff, use a defensive Prism opening, stop counting uncommitted allies as camp damage, and use the ordinary resource-oriented squad on gated maps. All 33 uploaded source files were byte-verified. Local tests against v62 completed with zero runner faults: three wins and three losses. One of those wins (`01boss_battle`) was a 0–0 tiebreak at round 2000, so it does not demonstrate a functioning bank strategy. No live performance claim can be made for v82.

The ten unseen maps in v82's revised plan were **not tested**, since no v82 challenges were queued. Generalized live coverage remains **15 distinct maps**, not 25 or all 40. The planned remaining-map list records planning only, not completed coverage.

A possible preemptive ranged-threat guard exists only as an unintegrated analysis header (`threat_guard.h`). It was not compiled into a new bot, submitted, or tested. No further experiment is running from this workflow.
