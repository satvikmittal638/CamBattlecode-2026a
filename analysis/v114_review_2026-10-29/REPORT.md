# v114 baseline review — 29 October 2026

Baseline: `workspace/bots/v114`, downloaded with the existing `tools/fetch_submission.mjs`.
Submission ID: `a9c2b69f-39b7-4f61-8f51-c6b34200e380`.
Submission note: `pk3: mo1 + weaker farm-near-allies (0.15/0.08)`.
The platform returned this submission as active. No active selection, source submission, or challenge was changed during this review.

All 22 source files, 2,780 lines, were read sequentially in full. `source_inventory.json` records the line count and SHA-256 of each file. The source was left unchanged and built successfully in release mode with CLI/SDK 4.0.0.

## Existing workspace and tools

| Location/tool | Use and relevant constraints |
| --- | --- |
| `docs/official/GameRules.md` | Current complete rules and champion specs; refreshed and read in full. |
| `docs/official/BotAPICpp.md` | Current C++ API; checked item enum, fuel, and channel cancellation references. |
| `.venv/bin/cambc` | CLI 4.0.0; build and local release runs. Current workspace SDK is also 4.0.0. |
| `workspace/sdk/cpp`, `workspace/cmake` | Existing SDK and compiler integration; no bot-specific CMake file is needed. |
| `workspace/maps`, `maps_holdout`, map archives | Current local maps, holdouts and earlier pools. API map names may contain underscores while disk filenames use hyphens; resolve paths explicitly. |
| `tools/fetch_submission.mjs` | Download a specific uploaded version's source and provenance. |
| `tools/bclib.mjs`, `tools/bc.mjs` | Saved-session platform access, replay bundles, quota, submissions and challenge helpers. Read-only downloads do not need an active-bot lock. Mutating active-bot/challenge operations follow the existing lock protocol. |
| `tools/download_recent.mjs` | Download recorded games filtered by team, patch, version and per-map cap. Default patch is old: explicitly pass `--patch 2.0.0 --version 114`. |
| `tools/replay_dump.mjs`, `tools/engines` | Replay engine selected from each replay header; current decoder handles the 84-item, 42,840-byte engine-2 timeline layout. |
| `tools/turn_trace.mjs` | Champion-specific observed state and recorded actions, suitable for inspecting decisions without a browser. |
| `tools/fight_trace.mjs`, `tools/endgame_trace.mjs` | Readable round-by-round combat/death and score/carrier traces. |
| `tools/fight_analysis.mjs`, `tools/decision_patterns.mjs`, `tools/game_profile.mjs`, `tools/champ_stats.mjs` | Existing aggregate analysis. Store results with the exact input snapshot/count. |
| `tools/local_eval.mjs`, `tools/gauntlet.mjs`, `tools/field_eval.mjs` | Local batches and frozen-source variant comparison. `field_eval` also collects official diagnostics and source-stability checks. No evaluation batch was started here. |
| `tools/provenance.mjs` | Hash a retained field-evaluation run's sources, binaries, maps and runner. |
| `analysis/v58_deep_2026-10-24/harness/turnhost` | Existing native replay observer/turn host; shadow/re-simulation infrastructure. Some surrounding JS probes hard-code older snapshot sizes, so check engine compatibility before using them. |
| `analysis/`, `platform/`, replay corpora | Extensive historical experiments. Dates, engine versions and source provenance matter; historical results are not current-balance evidence by default. |

The older `analysis/AGENT_GUIDE.md` is useful context, but its CLI version, map count, draft multiplier and item list predate the present workspace. Its distinct-opponent platform sampling preference is preserved for future requested batches.

Tool caveats observed during review: `profile_team.mjs` expects files below an extra `replays/` directory, unlike the downloader's direct index-relative layout. `game_profile.mjs` filters Capture reward deltas by the event's team; those totals can undercount actual gems, so do not treat them as complete resource accounting. Its checkpoint scores and directly observed deaths are more useful here. Actionless turns include legitimate channels/captures; an idle percentage alone does not prove a stall. Greed also needs its special stat weighting in old shard-count analyzers.

## Complete source map

Paths below are relative to `workspace/bots/v114/src/`.

| File | Lines | Responsibility |
| --- | ---: | --- |
| `main.cpp` | 43 | Persistent bot loop, exception boundaries, bounded logging and turn ending. Build banner still says `v62n-pk3`. |
| `draft.h` | 3 | Draft entry point. |
| `draft.cpp` | 71 | Fixed roster; draft-memory map metadata, own/enemy camp distances, mandatory altar-gate geometry and checksum. |
| `bot.h` | 192 | Persistent world/belief/task/recovery/routing state and method declarations; 84-item buffers. |
| `bot.cpp` | 1332 | Initialization, beliefs, shopping, movement, recovery, fallback fighting, banking, capture/farming and turn dispatcher. |
| `fishx_features.h` | 18 | Active tuning constants, including pk3 proximity and mo1 monolith admission. |
| `random.h` | 21 | Spawn-seeded RNG helper; not included by the active source path. |
| `v1_kit.h` | 43 | Cached immutable engine champion designs and kit damage/dash helpers. |
| `v1_cycle.h` | 210 | Full/cheap camp scoring, item cache, ally arrival estimates, survivability and target commitment. |
| `v1_camp_executor.h` | 104 | Personally visible camp selection, damaging casts, safe Heart splash/dashes, basics, resets and shields. |
| `v1_tactical.h` | 231 | Bounded legal current-action plans and estimated replies; attacks, crowd control, Heart landings and escape. |
| `v60_response.h` | 67 | Enemy response envelopes over up to two replies, cooldown/action accounting and memoization. |
| `v60_optional_hit.h` | 17 | Ren retaliation survival check before optional melee/finishing attacks. |
| `v1_help_packet.h` | 17 | Compact helper-call packing, expiry reader and compile-time checks. |
| `v1_dispatch.h` | 63 | Choose one healthy nearby helper and respond to a fresh shared-memory request. |
| `v1_support.h` | 55 | Willow healing/leader following and support farming; unreachable under the normal fixed draft. |
| `v1_bank_access.h` | 70 | Detect mandatory monolith bank gates, attack altar locks, and assault gates from round 600. |
| `v58_capture.h` | 47 | Physical capture handover to a healthy lower-ranked bag/ID holder; depart only for a useful task. |
| `v47_geometry.h` | 33 | Warm static altar/camp distances during legitimate waiting turns. |
| `v55_bridge.h` | 28 | Verify/rank legal dash landings when a walking route is disconnected. |
| `v56_bridge_staging.h` | 47 | Walk to a verified dash-launch region, wait for cooldown, revalidate and reject failed launches. |
| `v1_progress.h` | 68 | Fuel-reserved fallback step, legitimate-wait protection, stale-task expiry and geometry warming. |

## What v114 does

Draft order on 4/5-pick maps is Heart of Ruin, Vesper Vale, Ryth, Marcella, Vendetta. On 3-pick maps it is Heart, Vesper, Vendetta. Enemy picks do not change this. Draft work writes compact static metadata into 1,024 bytes; the champion instances initialize incrementally.

Each champion keeps its own observations. Six status bytes communicate target IDs 1–63, capture occupancy and low-health state; the remaining two bytes encode a selected helper, coarse coordinates, purpose and short epoch. A shared target is advisory, not proof of a camp's live state.

Turn order in the code: initialize/read coordination, shop while dead, handle stun/channel waits, observe camps, shop/heal on spawn, process completed capture, recover if low, optionally ward, prioritize a winning bank, consider a safe shopping recall, fight, answer help, work a mandatory gate, bank, then farm. Channels return before ordinary recovery/combat evaluation.

Farming prefers gem groups reachable from our side (`dOwn <= dEnemy + 4`), with own-side gold groups also competing. Score combines gems plus 0.5×gold, walking/clear/wait/capture/delivery time, estimated incoming camp damage, ally arrivals/claims and persistence. Gold's weight drops to 0.15 after 25 shard-equivalents. Large camps favor one or two allied commitments. Nearby ally goals within seven tiles give up to two bonuses of 15% each before round 400, 8% after. A valid ordinary target within 12 estimated walking steps is generally retained. Unknown state is not treated as observed death.

Free-standing monoliths become full-scorer candidates from round 700 with 25 shard-equivalents, on our side. This is admission, not an unconditional attack order: fuel, survivability and alternatives still matter. Mandatory bank gates use separate geometry and assault logic from round 600; normal banking is suppressed while the gate is closed.

Shopping is economy/defense first. All champions start Treasure; Ryth/Vendetta use Health, Heart/Marcella Focus, Vesper Strength. Jungle follows (Health for Ryth, damage stat otherwise), then Bruiser Health and Durability Health, with the bruisers taking Bruiser first. Later Bruiser damage:Health is 2:1, or 1:1 for Ryth. Safe shopping recall starts at 150 gold, with enemy/camp and nearby-bank checks. It does not buy the seven new families or consumables.

Recovery enters below 35% HP and exits at 60%, with spawn healing protection. It attacks safely before melee retreat, shields Heart/Varg, escapes active threats and recalls when safe. It detects interrupted recalls and repeated retreat footprints.

Combat considers visible opponents within six tiles, usually at most two target candidates. It scores legal moves/basics/one cast against estimated incoming replies, bag risk, kill value, control and immediate ally support. It accounts for Ren retaliation and Marcella stun immunity. Heart has a separate legal landing evaluator. Reply estimates are not a terrain/vision-aware simulator; they omit some kill-refresh outcomes. A legacy attack/approach fallback remains for decisions returning “no tactical answer.” Outmatched or dangerous decisions can explicitly suppress that fallback and retreat.

Capturing means physically holding a group tile. It avoids abandoning a lone denial body merely on a timer, can yield to a nearby passive-preferred Marcella/Vesper in safe conditions, and can hand a prolonged capture to an already-present healthy ally. Captures/respawns are refreshed from personal engine state. Repeated unresolved contests without a nearby visible enemy can expire.

Banking starts with any bag unless a nearby quick camp is worth batching; the “small bag” condition uses 100 gems, or 120 when the altar trip exceeds 20. Winning bags and an enemy score of 900 force urgency. It chooses reachable altar approaches, breaks enemy altar locks with basic attacks, and retries another route after stalls.

Movement uses current visible blockers and engine distance fields, at most one heavy field per turn. Hidden occupancy failures preserve actions and trigger another attempt where possible. Hole traversal uses verified dash paths and staged launches. Static distances are warmed while channeling/capturing/healing. Fuel checks reserve execution budget; stale frames invalidate dynamic decisions after suspension.

## Scripted replay observations

Replays were inspected through the existing decoder, fight trace, endgame trace and per-champion observation callbacks. No graphical replay viewer was used. The archive and final summary are linked below.

All 69 archived matches were decoded to completion: 69 maps, 21 opponents, 31 ranked and 38 unranked games, 25 on side A and 44 on side B. They span 29 October, 13:21–18:10 IST. Every replay header selects engine 2.0.0; decoded final scores agree with the platform index in all 69 cases. There were 34 wins and 35 losses in this map-capped archive and zero own Bot error timeline events. This is an intentionally broad behavior sample, not a representative ladder win-rate estimate. `replay_summaries.json` retains per-match drafts, actual reward deltas, first captures/tributes, champion deaths, first purchases, monolith hits and final builds.

- `00vault` vs Mate in One, side B: 1,240–527 win at round 597. Round 1 has Heart and Vesper both walk then dash; Ryth/Marcella walk. First own capture reward arrives at round 43 and first completed tribute at round 92. A four-pick roster matches the source. The older game-profile tool reports the first capture as 52 because of its event-team filter; the direct champion reward delta corrects this.
- `01gold_rush` vs umamusume, side B: 1,001–182 win at round 1,392. At round 100 Vendetta has completed Treasure Health and Jungle Strength while Heart has three Treasure Focus shards, confirming the actual build path. The bot continues gold farming before the first tribute at round 289.
- `02guardians` vs coolean, side B: 1,081–15 win at round 1,044. At round 580 the team score is zero while Heart carries 151 gems, Vesper 131 and Ryth 65. The score remains zero at round 700; the first completed tribute is at 713, reaching 331 by 740 and 497 by 780. The gate/banking sequence matches the round-600 assault policy.
- `00great_wall` vs Mate in One, side B: 900–1,079 loss at round 1,210. Marcella kills Vendetta using reset basics then a damage spell at rounds 181–182, then dies at 184 after returning toward the camp region. Ryth repeatedly takes parting attacks while retreating from enemy Marcella at 405–409 and dies at 410. Retreat exists, but cannot guarantee disengagement.
- `02stalactites` vs umamusume, side B: 166–1,011 loss at round 495. Marcella reaches an altar carrying 168 gems, starts a successful tribute at round 84 with 610 HP, then takes no actions during rounds 85–94 while the channel counts down. Vendetta attacks, Marcella falls to 50 HP with seven channel ticks still pending and dies at round 94. This precisely matches the early channel return in `play_step()`. `cancel_submit_gems()` exists in the current SDK; v114 does not use it.
- `01elk_arena` vs umamusume: 0–1,008 loss; 38 own deaths were observed. This is an example where repeated combat/recovery and poor resource access overwhelm the normal farm/bank cycle, not evidence that the submission failed to run.

`fights_summary.json` and `decisions.json` were generated from the first 35 archived maps while downloading continued. That explicit subset had 1,398 detected fight clusters, with 181/277 champion kills (ours/theirs), 77 own camp deaths, and worse kill trades when opponents initiated (49/168) than when we initiated (132/109). The decision tool reports median tribute bag 22 and median recall HP 34%. These are descriptive measurements of a map-capped sample, not ladder win-rate estimates. Capture attribution/geometry approximations in older analyzers require care.

## Current-rule implications to retain

v114 already allocates 84-item buffers and reads immutable kit properties from the engine, so many stat/multiplier changes flow through naturally. However, its shop never selects Tribute/Capture/Prospector/Hunter/Skirmish/Greed/Collectors. Several estimates still assume five capture ticks and plain `ceil(gems/10)` tribute time. Enemy mitigation/damage envelopes explicitly model Durability and special champion effects, but do not fully model every new family. These are review findings, not modifications.

The channel failure above is the clearest replay-backed behavior to investigate next. Other hypotheses to evaluate separately are delayed/disrupted farm cycles, inability to disengage from stronger chasers, and whether current item passives improve resource throughput. No strategy change was made in this task.

## Validation and retained artifacts

- Release compilation succeeded for the unmodified v114 source.
- A bounded 200-round release smoke run on `00vault` against `starter-cpp` completed its requested horizon and produced a replay. It was intentionally truncated and has no win/loss result.
- The smoke's v114 stdout contained zero `API` error lines, zero `bot error` lines and zero `suspended` logs; three decisions deliberately yielded under their reserve checks. This is a smoke result, not proof about every map or native fuel event.
- `source_inventory.json`: all read source hashes and line counts.
- `replays/index.json`, `replay_archive_summary.json`: downloaded match provenance and final coverage.
- `replay_summaries.json`: complete scripted playback summary of every one of the 69 archived matches; reward deltas are measured on our champions irrespective of the Capture event's team field.
- `fights_summary.json`, `fights.jsonl`, `decisions.json`: existing-tool analysis of the first 35 archived maps.
- `game_profile.jsonl`: earlier 14-map checkpoint/death sample; see capture-attribution caveat above.
- `channel_failure_trace.jsonl`: concise per-turn Marcella observations for the verified failure.
- `local_smoke/`: local replay and cleaned v114 stdout.
- `official_exports.diff`, `docs/FETCH_MANIFEST_2026-10-29.json`: refreshed official documentation provenance.
