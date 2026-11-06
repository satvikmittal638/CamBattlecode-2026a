# Uploaded v58 code interpretation

Target: `8f42f685-6d52-4cae-896c-cbb27925a808`, uploaded 2026-10-23 18:39:12 IST. All 29 downloaded files were read, including the separate boss controller and shared headers. They contain 4,834 newline-terminated source lines. The untouched byte hashes are in `evidence/source_hashes.json`. The original download retains its CRLF line endings; semantic comparisons normalize line endings.

## Architecture and turn flow

The program is a deterministic C++ heuristic bot, with a persistent private instance per champion. It contains two controllers. `main.cpp` selects the boss controller when all gem-bearing camp groups are monolith groups; that choice is carried into champion instances by a draft-memory marker. Other maps, including mandatory-gate maps with ordinary gem camps, use the normal controller.

Drafting spends the larger opening budget on static distance fields, camp-group distances and altar geometry. A checksum-protected 1,024-byte packet carries these facts into play. The picks follow fixed lists: ordinary three-pick maps select Heart, Vesper and Vendetta; larger maps add Ryth, Marcella, then Vendetta in the fixed order. Mandatory gates get Heart, Stellar, Tavi, Prism and Ren as the available pick count allows. Boss-only maps use Tavi, Stellar, Cassi & Issac, Prism and Ren. These exceptions inspect map structure, not map names or opponent identities.

Normal play resets frame/fuel guards, initializes remaining metadata, reads coordination bytes, handles death/stuns/channels, updates personal camp beliefs, buys equipment, handles low HP, places a ward if affordable, considers recall, then chooses winning tribute, combat, carrier escape/help, gate work, tribute and farming in priority order. The returned stage string is diagnostic; action booleans and live SDK allowances determine whether later branches run.

Camp selection estimates the value of gold and gems per travel/clear/capture/banking time. It estimates incoming camp damage, available shields and visible allied arrival times. It applies safety discounts, claim/packing multipliers and target persistence. A cheaper fallback runs when observation leaves too little fuel for the full scorer. Gold is valued less once equipment passes a threshold. These are approximate forecasts, not simulated optimal plans.

Farming clears the selected group, moves onto a spawn tile, waits for the five-round uncontested capture and optionally recalls during capture. The configured handoff policy prefers a poorer nearby ally. Ordinary combat enumerates a bounded collection of current attacks, spells, steps and Heart dash landings, using a two-turn response estimate. If it cannot choose a plan, older chase/attack logic can still run. Recovery starts below 35% HP and generally remains active until 60% or a full spawn heal. Ordinary shopping recalls start at 150 gold when nearby threats do not block them.

Six status bytes encode a camp target, capture flag and low-HP flag. Two additional bytes encode one short-lived, coarse help request. Camp beliefs and route caches persist privately. There is no learned ML model, RL policy, opponent identity table or persistent behavioral fingerprint in the upload.

## File-by-file interpretation

| File under `source/src` | Role and interpretation |
|---|---|
| `main.cpp` | Chooses normal/boss controller, runs each draft/champion turn, catches failures and guards logging against exhausted fuel. |
| `boss_main.cpp` | Separate boss-controller loop, logging and exceptions. It retains an older stream-based logging path. |
| `bot.h` | Normal controller state: route fields, camp beliefs, capture and recovery state, bank topology, help requests and per-turn action flags. |
| `bot.cpp` | Normal lifecycle, personal observations, shop/build lists, wards, movement/recovery, legacy combat, tribute, handoffs and orchestration. |
| `draft.cpp` | Static map analysis and checksum packet, mandatory-gate detection, fixed normal/gate drafts. |
| `draft.h` | Declaration of the normal drafting entry point. |
| `fishx_features.h` | Compile-time experiment switches and thresholds. Active settings include meta draft/builds, gold groups, packing, poorest-first captures and 30% boss/gate stealing. Comments describe multiple older experiments; they are not all active. |
| `random.h` | Deterministic seeded random helper; its presence is not evidence of a learned or exploratory policy. |
| `v1_kit.h` | Immutable native champion-design cache and approximate maximum spell contribution per cooldown cycle. |
| `v1_tactical.h` | Body snapshots, enemy response estimates, two-target bounded tactical search, Heart dash attacks and emergency escape. Contains verified cooldown/radius forecast errors. |
| `v1_camp_executor.h` | Personally visible camp queries, primary attack choice, camp-anchored spells, Heart landing search, resets and shields. It still casts AoE spells; it lacks v57's broader center/value search. |
| `v1_cycle.h` | Full and low-budget resource scoring, clear/incoming-damage estimates, allied arrival estimates, banking amortization, claim bonuses and target commitment. |
| `v1_dispatch.h` | Publishes a compact help call and directs the selected helper toward a coarse anchor. Shared coordinates are advisory, not permission to attack a hidden enemy. |
| `v1_help_packet.h` | Bit packing, epoch aging and stale-call rejection, with compile-time assertions. |
| `v1_support.h` | Willow healing, escort and fallback farming. Ordinary configured drafts do not normally select Willow. |
| `v1_progress.h` | Quiet-turn tracking, expired-task/bank replans, low-budget travel fallback and final geometry warming. Its capture exemption can preserve an indefinitely contested wait. |
| `v1_bank_access.h` | Detects an altar blocked by monolith tiles, tracks gate state, removes locks and assigns range-four caster positions. Its 30% gate threshold and “safe” ring are major weaknesses. |
| `v1_bank_channel.h` | Estimates visible stun interruptions on gated maps for Cassi/Issac. The default gate draft does not include them, so this branch normally does little there. |
| `v1_bank_carrier.h` | Disengages a threatened gated-map carrier. Its trigger depends on the preceding restricted channel-threat check. |
| `v47_geometry.h` | Builds static route fields during legitimate waits. Normal group-distance lookup waits for `groupGeometryReady`; the lack of a full-geometry log in v58 does not prove geometry never completed. |
| `v55_bank.h` | Boss-controller altar-lock removal, submit start and a retry/backoff for locked altars. The normal controller has a different lock implementation. |
| `v55_bridge.h` | Verifies an immediately usable dash into the destination walking component using native legal reachability. |
| `v56_bridge_staging.h` | New v58 feature: reverse-expand the destination component across holes to find launch tiles, walk there, wait for the dash and revalidate it, with timeout/rejection state. |
| `boss/bot.h` | Separate boss-controller state and routing/capture fields. Much overlaps with the normal controller but several tactical fields differ. |
| `boss/bot.cpp` | Boss-only gold farming and caster investment, monolith theft threshold, range-four spell ring, defensive contact rotation, tribute and escort. It duplicates substantial normal-controller logic. |
| `boss/draft.cpp` | Boss detection, static distance packet and fixed boss-caster roster. |
| `boss/draft.h` | Declaration of the boss drafting entry point. |
| `boss/policy.h` | Small pure predicates for winning bags, contact rotation, escort selection and escape scoring. |
| `boss/random.h` | Duplicate deterministic random helper. |

## Exact version relationship

After normalizing line endings, 23 of v58's 29 files match the corresponding v56 files; the other six are the normal/boss implementation and header, the build-label entry point, and the new bridge header. The meaningful v56-to-v58 change is staged bridging in both controllers. See `comparison/v56_to_v58.diff`.

v58 is therefore a v56 branch with staged bridging. It does not retain v57's added legal multi-turn forecasts, area-center farming, tactical withdrawal flag, Ren-safe parting attacks, Heart recovery shields, adaptive shopping threshold, grouped-contact protections or proactive boss/gate objective policy. Some disabled experimental v57 code was also removed; a removed line is not automatically a behavior regression. See `comparison/semantic.diff`.

## Confirmed errors and demonstrated weaknesses

1. `v1_tactical.h` calls the same independent response maximum for tick 0 and tick 1. It does not consume the first cast's cooldown in the second forecast. The exact uploaded pure function returns 444 for a legal-stat Cassi example whose fixed-position two-turn maximum is 252. This is a forecast error, not an assertion that the actual opponent chooses that maximum.
2. The response range uses cast range without AoE radius. In a Ryth example at distance five, it returns zero while a legal range-four, radius-one cast deals 100. Both counterexamples execute the uploaded pure response function; see `evidence/forecast_counterexamples.json`.
3. The normal caller lacks v57's explicit withdrawal flag. A melee escape that uses only a shield can return success while leaving movement available and no basic attack used; the caller can then continue into help, banking or farming. This is a verified control-flow path; its full replay frequency has not been measured.
4. Low-HP recovery explicitly shields Varg but not Heart. Three diagnostic losing replays contain 54 Heart turns with a ready shield, cast allowance, low HP, visible nearby enemies and a move but no cast. The opportunity count alone does not prove all 54 shields would improve the match, but the omission is real; see `evidence/frame_audit.json`.
5. Monolith design range is **5**, verified from native engine 1.0.3 and current rules. Both boss farming and gate setup call a distance-four ring safe. It is within monolith range unless another nearer body takes aggro. Pure range-four kiting is not a valid safety guarantee. `evidence/native_camp_stats.json` records the ABI-checked native values.
6. Capture waits have no elapsed-time/progress limit. Capturing is explicitly exempt from generic idle eviction. The yellow-brick-road winning replay has Ryth stationary for 543 consecutive rounds, repeatedly targeting a cleared 30-tile gold line contested by an enemy at the far end. Personal vision need not reveal that enemy; a bounded no-reward timeout must work without hidden information.
7. `X_GATESTEAL` and `X_BOSSSTEAL` wait for at most 30% boss health. This can be a legitimate theft policy, but there is no robust productive fallback when opening the gate or clearing the boss is necessary to score. Platform results are 0/4 gated-map games and 1/5 pure-boss games in this sample.

## Hardcoding and generalization

I found no enemy-team-ID or map-name dispatch in the downloaded strategy. Geometry-based gate/boss classification is reasonable. Champion lists, build orders, gold/risk thresholds, heuristic damage tables and capture priorities are fixed. These can generalize poorly, but fixed parameters by themselves do not establish overfitting. The local bridge regression and limited platform opponent diversity are evidence to improve validation, not grounds for accusing the teammate of tuning to specific opponents.

The two controllers and overlapping lock/retreat/capture implementations are a maintenance risk: fixes can land in one path and be absent from another. A future consolidation should preserve behavior through focused tests; no implementation change was made during this audit.
