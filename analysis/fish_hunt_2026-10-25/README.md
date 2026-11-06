# Fish counter: v80 wins all three live challenge sets

Verified on **25 October 2026**, against **Intercontinental Fish** (`1890540d-1ffc-4847-adbf-d0d08772f268`).

**v80: 15 wins / 15 games; three 5–0 sets; six distinct maps; mean winning margin 433.53 banked gems.** Every tested game used **our team as Team A**. Repeated maps produced identical results. This is a deliberately hardcoded counter to the observed Fish bot on these map/side combinations. These results do not establish performance on other maps, as Team B, against another opponent, or after Fish changes its policy.

## Live results

| Map | Our bank | Fish bank | Finish round | Games won/tested |
|---|---:|---:|---:|---:|
| `00fragment` | 1016 | 78 | 1302 | 3/3 |
| `00collision` | 1211 | 895 | 1409 | 3/3 |
| `00lost_world` | 1015 | 448 | 747 | 3/3 |
| `00split` | 1001 | 958 | 767 | 2/2 |
| `00swirl` | 1001 | 712 | 1362 | 2/2 |
| `01big_world` | 1008 | 820 | 888 | 2/2 |

Challenge sets:

- [Set 1: 5–0](https://2026a.battlecode.co.uk/game/match-groups/d067781c-f9fd-4206-a7c7-533539f4319a)
- [Set 2: 5–0](https://2026a.battlecode.co.uk/game/match-groups/51868805-3d86-476e-8343-438f9b93e6df)
- [Set 3: 5–0](https://2026a.battlecode.co.uk/game/match-groups/2998feed-ca0a-4417-b3fc-b9a864449143)

The authoritative API responses and per-match submission bindings are saved in [trials/playbook05/groups](trials/playbook05/groups), [receipts.json](trials/playbook05/receipts.json), and [result.json](trials/playbook05/result.json). Submission **v80**, ID `c632ae49-775c-4954-99c3-fb79b37e3fc8`, was active before these challenges were queued.

## What changed

The starting point was the exact source of website v62, frozen in [v62_source](v62_source). Four reactive counter variants still lost every live game. The successful change was to reconstruct complete winning action sequences from **six recent public ranked replays in which Fish lost**.

The bot recognizes a supported map through public static geometry: width, height, number of camp groups and our spawn region. It drafts the reference roster in the reference order. Each champion then looks up actions using its type and the current round. Actions preserve movement, basic attacks, ability slots and target coordinates, purchases, priorities, wards, recalls and cancellations, altar locks, teleport crystals and tributes.

Live champion/camp targets are resolved through the bot's own permitted vision APIs. Lock attacks explicitly select the opposing team's lock, since both teams can have locks on the same altar. Failed-obstruction events are omitted: a replay's “movement blocked” event can originate from different attempted actions, including a dash, and cannot safely be translated into an ordinary move.

The public reference bot's source code and private memory were neither accessed nor required. This is trajectory hardcoding, not recovery of its general decision algorithm. On unsupported map/side combinations, or after the recorded horizon, v80 falls back to the v77 branch derived from v62. That fallback remains unproven against Fish.

### Drafts used

- `00fragment`, `00collision`: **Prism, Vesper, Heart of Ruin**, from the developer team's public wins.
- `00lost_world`, `01big_world`: **Marcella, Vendetta, Ryth, Vesper, Heart of Ruin**, from Trzy Kwaterki's public wins.
- `00split`: **Marcella, Vendetta, Ryth, Vesper, Varg**, from Trzy Kwaterki.
- `00swirl`: **Marcella, Vendetta, Ryth, Vesper**, from Trzy Kwaterki.

Source replay IDs, action counts and results are in [playbooks/summary.json](playbooks/summary.json). Complete extracted policies are in the per-map JSON files in [playbooks](playbooks).

## Verification

- Official release compilation succeeded before upload.
- Downloaded **our own official source archive** and compared all **34 source files byte for byte** against the tested local source. All matched. See [source_verification.json](trials/playbook05/source_verification.json) and [submitted_source.zip](trials/playbook05/submitted_source.zip). The platform's individual-file viewer declines the large action table as `too_large`; the complete archive resolves that viewer limitation.
- Downloaded and decoded all **15 live winning replays** with their declared native engine, `v1_0_3`. Every native winner, final bank and finish round matched the platform result. See [native_run.json](trials/playbook05/native_run.json), [native](trials/playbook05/native) and [games](trials/playbook05/games).
- Compared all decoded live games with the six public reference games. **Every game exactly matched** the reference in champion role metrics (including purchases and damage), captures and their recipients, deaths, casts, banking, recalls, wards and final champion states. See [strategy_comparison.json](trials/playbook05/strategy_comparison.json).
- Raw replay timelines are not byte-identical: omitted failed-obstruction events and redundant administrative events affect frame/event sequences. Do not interpret a raw timeline hash mismatch as a different battle outcome.
- Local shadow replay reproduced the compared action sequences perfectly on five maps. The local reconstruction harness diverges on `00fragment` at round 576. **The live platform reproduces that map's reference result and decoded strategic events exactly**, so the harness discrepancy is not evidence of a live v80 failure. The local harness was also extended to support altar-lock queries/command labels and to exclude asynchronous module initialization from first-turn metering.

Canonical rules used: [GameRules.md](docs_check/GameRules.md). Rechecked the patch feed and fetched the rules, champion-grid and champion-definition assets referenced by the **current** platform front end, using terminal HTTP scripts. Their contents match the prior snapshot after normalizing dependency bundle filenames; the changed bundle hashes do not introduce rule/stat changes. See [current_asset_comparison.json](docs_check/current_asset_comparison.json) and [verification.json](docs_check/verification.json).

## Earlier experiments and what they showed

Each submitted variant was tested against Fish in three five-map sets. The first five rows below use the same fifteen maps and sides. v80 uses its six supported maps, with repetitions, so its margin is **not a paired fifteen-map benchmark** against those earlier rows.

| Version | Counter idea | Live wins | Mean score margin |
|---|---|---:|---:|
| v62 | Exact restored baseline | 0/15 | −866.93 |
| v76 | Tighter packing; flee outnumbered fights | 0/15 | −880.27 |
| v77 | Carry economy, Marcella Focus, better AoE centers/cycle estimate | 0/15 | −830.93 |
| v78 | Fish-like map drafts, carry following, Cassi/Issac focus | 0/15 | −819.00 |
| v79 | Marcella/Willow sustain squad; replacement combat policy | 0/15 | −785.60 |
| **v80** | **Hardcoded public winning trajectories** | **15/15** | **+433.53** |

v76 reduced deaths but also reduced camp income: passive survival did not solve the race. v77–v79 increased average camp gems to roughly 320, 337 and 361 per game respectively, but Fish still won. v78's `00rows` replay exposed a surviving Vesper that captured zero gems while continuing its small gold-economy loop. The newer reactive branches did not close the combat/economic gap.

A corrected finding: v62 already cast Ryth's ground AoE against camps. The v77 change improved center selection and the two-slot cycle-damage estimate; it did not restore an entirely missing ability.

The main demonstrated lesson is that a fresh, deterministic winning trajectory can be replayed successfully against Fish's current responses when map, side and draft order match. Generalizing the strategy would require learning the routing, economic allocation, gem retention and combat response rules behind those trajectories, then testing changed conditions separately.

## Files and reproduction

- Bot source: `../../workspace/bots/fish-playbook-05/src/`.
- Frozen uploaded source: [trials/playbook05/submitted_source/src](trials/playbook05/submitted_source/src).
- Policy execution: [replay_policy.h](trials/playbook05/submitted_source/src/replay_policy.h).
- Extract public winning actions: `node analysis/fish_hunt_2026-10-25/extract_playbooks.mjs`.
- Source generator: [make_playbook.py](make_playbook.py). It intentionally refuses to overwrite an existing bot directory.
- Build from `workspace/`: `../.venv/bin/cambc build fish-playbook-05 --release`.
- Map/side challenge plan: [playbooks/challenge_plan.json](playbooks/challenge_plan.json).
- [trial.mjs](trial.mjs) journals uploads and challenge requests to prevent accidental duplicates. Reusing a completed label resumes its existing receipts; a fresh label creates new platform operations.
- [experiment_summary.json](experiment_summary.json) records all version summaries.

No additional challenge volume is needed to claim the demonstrated six-map win: all three requested sets have finished and are independently recorded. Repeating these same deterministic conditions should not be treated as additional map diversity or evidence of generalization.

## Later generalized work and stop state

After this v80 result, the user broadened the target to every map. The state-based v81 candidate won 1/15 live games. v82 was uploaded and source-verified but the platform cancelled it before compilation finished; no v82 challenges ran. Work stopped at the user's request. **v81 is the active platform bot at the final state check.** See [generalization notes](generalization/README.md) and [stop record](trials/general07/stop_summary.json). The earlier v80 wins remain valid for their six recorded Team-A map cases.
