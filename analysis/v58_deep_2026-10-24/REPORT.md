# v58 heavy-loss analysis with replay-exact state tests (2026-10-24)

## What was built

| Tool | Path | Purpose |
|---|---|---|
| Death recaps | `death_recap.mjs`, `deaths_heavy.jsonl` | every allied death: 5 rounds of HP, damage sources, stuns, own actions, unused ready slots |
| Heatmaps | `heat_extract.mjs`, `heat_render.py`, `heat/*.png` | where our champions stand, take damage and die (heavy losses vs wins) |
| turnhost | `harness/turnhost` (Rust, wasmtime 49.0.2) | rebuilds a recorded match in the engine, plays one team with a bot wasm |
| Batch shadow audit | `harness/batch_shadow.mjs`, `harness/decision_audit.mjs` | every bot decision at its exact recorded board state, joined with what happened next |
| Stage traces | `workspace/bots/v58-trace` (debug build, free `debug_block` traces) | where each turn's fuel went and which tactical branch ended it |
| Variants + rollouts | `workspace/bots/v58x`, `harness/build_variants.mjs`, `harness/select_states.mjs`, `harness/rollout.mjs` | switchable fixes, counterfactual rollouts from the states that preceded our deaths |

### turnhost fidelity

* Shadow mode: the bot acts on the live engine game (engine-validated), then the timeline action is deleted and the
  recorded actions are applied, so the state never leaves the replay; live mode (`--live-from R`) lets the bot's
  actions stand for counterfactual rollouts (opponents: recorded actions or a bot).
* Fuel is metered like the official runner: wasmtime 49.0.2 with the runner's operator-cost table (extracted from its
  compile cache), 100k per turn (2x first champion turn), preemption resumes next turn, host-call charges calibrated
  with `workspace/bots/fuelcal` (per-chunk bitboard charges, distance-field and reachability charges, memory reads).
* v58 release build reproduces **99.97%** of its recorded turns on a platform replay and 99.9% on a local CLI match;
  per-turn fuel matches the runner's own fuel_remaining reports within 0-5 units.
* Over the 130 Codex audit replays (790k bot turns), 115 games re-simulate exactly to the end; the other 15 are exact
  up to a late first divergence (unreproduced vision effects); analyses stop at each game's first drift.

## Vulnerabilities found (v58, heavy losses vs wins)

Pattern table (turn count / share followed by that champion's death within 5 rounds; last column = heavy-loss deaths
preceded by the pattern):

| pattern | wins | losses | heavy losses | heavy deaths preceded |
|---|---|---|---|---|
| all | 296661 / 0.5% | 216318 / 0.8% | 116660 / 2.8% | 650/650 |
| lowhp | 14255 / 7.7% | 9743 / 10.3% | 10994 / 14.6% | 491/650 |
| lowhp_stays_in_camp_range | 563 / 17.9% | 370 / 19.2% | 447 / 28.4% | 87/650 |
| heart_shield_unused | 986 / 15.3% | 525 / 21.3% | 754 / 34.1% | 89/650 |
| heart_shield_used | 226 / 2.7% | 185 / 1.6% | 108 / 10.2% | 11/650 |
| tribute_under_threat | 76 / 1.3% | 36 / 2.8% | 31 / 16.1% | 5/650 |
| idle_enemy_adjacent | 1544 / 8.5% | 980 / 15.6% | 1705 / 18.7% | 247/650 |
| outnumbered_retreats | 280 / 32.9% | 266 / 46.6% | 438 / 42.5% | 104/650 |
| lowhp_ready_slot_unused | 1246 / 34.9% | 1149 / 42.6% | 1456 / 47.6% | 283/650 |
| critical_hp_no_escape | 307 / 44.6% | 183 / 57.9% | 357 / 59.4% | 159/650 |
| outnumbered_holds | 339 / 27.4% | 188 / 47.3% | 480 / 44.6% | 115/650 |
| recall_under_threat | 132 / 0.0% | 10 / 0.0% | 1 / 0.0% | 0/650 |

Root causes, confirmed with stage traces and code reading:

1. **Idle under attack.** 1705 heavy-loss turns stand within 2 tiles of an enemy and do nothing. 913 are stuns. Of the
   771 free turns, the dominant path is `tacticalFight` finding foes but no plan with positive value
   (`t-noplan`), danger below the 55% burst-escape threshold, so it returns -1 to the legacy fight code, which also
   does not act, and farming then holds position. The champion takes hits without trading or stepping away.
2. **Heart's self-shield is not used in low-HP retreats.** `handleLowHp` casts a shield only for Varg; Heart at <50% HP
   with a threat leaves the shield unused in 754 heavy-loss turns (34% die within 5 rounds vs 10% when used).
   (Codex F07.)
3. **Camp-blind retreat after unseen damage.** When a recall is cancelled by an unseen source (X_RECALLGUARD),
   `escapeHome` walks the shortest way home with no threats; camp danger uses a champion radius (4) instead of the
   camp's range, so the path can enter an awake Elk's range (the 01yellow_brick_road Ryth death at round 53).
4. **Withdrawal intent lost** (Codex F06): a melee escape that only casts a shield returns success, but the caller
   continues into farming because the champion can still move.
5. Fuel is not the blocker in fights: the tactical planner was skipped for budget in 0 heavy-loss turns with an enemy
   within 3; updateKnowledge costs ~10k (p90 15k) per turn.

## Fixes (v58x switches) and evaluation

Switches in `workspace/bots/v58x/src/v58x_flags.h` (all default to v58):

* `X58_LOWSHIELD`: low-HP retreat under threat (and after an unseen-source recall cancel) casts any self-shield.
* `X58_CAMPAWARE`: retreat danger uses each camp's attack range; the recall-guard walk avoids nearby armed camps
  that are not visibly asleep.
* `X58_NOPLAN`: when the tactical planner sees foes but finds no positive plan and staying would take damage:
  1 trade the least-bad no-move damaging plan, 2 step to the reachable tile with the least incoming damage,
  3 trade if a hit is possible else step.
* `X58_ESCAPERISK`: burst-escape threshold (v58 0.55).
* `X58_KEEPWITHDRAW`: a tactical withdrawal ends the main decision (Codex F06).

### Decision changes on the exact recorded heavy-loss states (shadow mode, 130 games)

| heavy-loss turns | v58 | shield | np2 | np3 |
|---|---|---|---|---|
| Heart shield unused (<50% HP, threat) | 754 | 205 | 758 | 729 |
| Heart shield used (same situation) | 108 | 657 | 104 | 133 |
| idle with enemy within 2 (913 are stuns) | 1705 | 1696 | 1308 | 1294 |

### Counterfactual rollouts from the states before our deaths

302 states (every other state from 604: for each heavy-loss death, the first risky turn in the 5 rounds before it),
branched live for 12 rounds; same opponent policy for every variant.

Opponents played by v58 (reactive):

| variant | focal dies | our deaths | their deaths | HP swing | gem swing | saved/lost vs v58 |
|---|---|---|---|---|---|---|
| v58 | 64.6% | 0.891 | 0.046 | -1042 | -9.4 | - |
| shield | 61.3% | 0.858 | 0.050 | -998 | -8.3 | 12/2 |
| camp | 64.9% | 0.891 | 0.046 | -1030 | -9.1 | 0/1 |
| np2 | 60.3% | 0.818 | 0.023 | -1013 | -8.3 | 26/13 |
| np3 | 61.9% | 0.858 | 0.043 | -1001 | -8.6 | 17/9 |
| esc35 | 62.3% | 0.871 | 0.043 | -1070 | -8.8 | 19/12 |
| shield+camp+np3 | 59.9% | 0.838 | 0.040 | -966 | -7.9 | 23/9 |
| **fin2** shield+camp+np2+keepwithdraw | **57.9%** | **0.795** | 0.020 | **-954** | **-7.6** | 33/13 |
| fin3 shield+camp+np3+keepwithdraw | 59.9% | 0.831 | 0.040 | -960 | -7.9 | 23/9 |

Opponents replaying their recorded actions (non-reactive; v58 reproduces the real deaths):

| variant | focal dies | our deaths | saved/lost vs v58 |
|---|---|---|---|
| v58 | 99.3% | 1.262 | - |
| shield | 86.8% | 1.116 | 38/0 |
| camp | 93.0% | 1.182 | 19/0 |
| np2 | 72.5% | 0.871 | 83/2 |
| np3 | 81.8% | 0.987 | 55/2 |
| esc35 | 74.8% | 0.917 | 74/0 |
| shield+camp+np3 | 68.9% | 0.841 | 94/2 |

### Full local games (field_eval, release builds, both sides, pool + holdout maps)

Rollouts measure 12 rounds after a dangerous state; full games also count objectives. The no-plan switch lost them:

| run | variant | wins | gem diff | flips vs v58 |
|---|---|---|---|---|
| 6 opponents x 18 maps x 2 sides | v58 | 171/216 | 447 | - |
| | fin2 (shield+camp+np2+keep) | 146/216 | 289 | +6/-31 |
| | fin3 (shield+camp+np3+keep) | 155/216 | 356 | +8/-24 |
| codex-v57, prism-v58-control, mimic-shink x 18 maps x 2 | shield | 67/108 | | +7/-9 |
| | camp | 67/108 | | +6/-8 |
| | np2 | 49/108 | | +5/-25 |
| | np3 | 56/108 | | +10/-23 |
| | keep | 66/108 | | +2/-5 |
| | esc35 | 68/108 | | +14/-15 |
| | np2 + HP<50% + objective guard | 60/108 | | +6/-15 |
| | np3 + HP<50% + objective guard | 62/108 | | +4/-11 |
| | safe (shield+camp+keep) | 71/108 | | +10/-8 |
| 6 opponents x 22 maps x 2 sides | v58 | 203/264 | 406 | - |
| | safe | 205/264 | 399 | +15/-13 |

Conclusion: in the no-plan states v58's "hold position" is worth more over a whole game than the deaths it costs in
the next 12 rounds (most of those turns hold a camp fight or capture). The step/trade repairs are not shipped.
The idle-under-attack pattern stays an open problem: a fix has to value the objective being held, not only survival.

## Submitted

**v63** = `workspace/bots/v58s` (v58 + `X58_LOWSHIELD`, `X58_CAMPAWARE`, `X58_KEEPWITHDRAW`; build tag
`v58s-audit-safe`). Locally neutral to slightly positive (+4 net over 372 paired games, no faults); positive in both
rollout opponent models. Platform evaluation: 100 distinct-opponent challenges (50 near rank 77, 50 near rank 38),
`platform/c100_v63`.


