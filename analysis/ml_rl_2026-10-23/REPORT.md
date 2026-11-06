# ML and RL replay experiments — 2026-10-23

Enemy-history models improve offline movement prediction on unseen teams. Expert-action imitation also generalizes at the level of coarse action categories. The tested RL-style draft selector does not justify replacing v57. These results establish prediction signal, not an increase in game wins.

## Scope and data

All 28 frozen v57 source files still match their recorded hashes. No model was deployed, no new submission or platform challenge was made for these experiments. All experimental files are in this analysis directory. Website access used HTTP scripts. Five current official documentation sources were fetched again and matched the prior copies byte for byte; see `docs_verification.json`.

The confirmation corpus contains 180,015 movement labels from 400 replay perspectives covering 100 opponents, and 435,868 expert-action labels from 220 replay perspectives (50 stronger-cohort teachers plus 20 rank-1 Fish games). The datasets overlap in underlying matches; 620 perspectives is not 620 distinct matches. All 620 perspectives decoded with zero errors. The selection deliberately emphasizes each opponent's four largest-deficit games; it does not estimate population-wide performance.

Inputs use the native engine's personal observation at the beginning of the champion turn: visible units/camps, HP, wealth, cooldowns, distances, map geometry, legal-action flags and historical observations. IDs, teacher identity, map names, final outcomes and future actions are excluded from model inputs. Future actions/observations supply labels only. Full-team and hidden replay state are not fed to the models.

Movement labels classify whether the nearest visible enemy approaches, stays at the same distance or withdraws before the next consecutive personal observation, relative to the observer's fixed starting tile. Only small displacements (at most 3 tiles), continuing visibility, nearby enemies and every second eligible observation are retained. This is not prediction of hidden positions or exact movement vectors. Expert labels classify the following turn's actions as fight, farm, bank, recall, shop, move, ability or idle; a turn containing several actions receives one prioritized label. These are descriptive categories, not optimal action commands.

## Validation design

An initial pilot compared logistic regression, extra trees and histogram gradient boosting, with and without history. Selection used validation macro-F1. For confirmation, the selected gradient booster and hyperparameters were frozen: 100 iterations, 15 leaves, minimum 40 samples per leaf, L2=2, learning rate 0.07, no early stopping. All confirmation variants use matching one-hot champion-type and standardized numeric preprocessing; no algorithm was selected using confirmation test results.

Movement splits contain 64 training, 18 validation, 15 newly reserved test and 3 original pilot-test teams. Expert splits contain 34 training, 8 validation, 5 newly reserved test and 3 pilot-test teams; Fish is an additional untrained teacher. Whole teams are separated, rather than randomly splitting correlated frames. Maps are allowed to overlap in these supervised tasks; this is a new-team test, not an unseen-map test. Training is capped at 2,000 examples per game and uses game/class weighting. The original pilot-test teams stayed excluded from training. Fish was inspected during the pilot and is a reused stress test, not a fresh confirmation holdout.

## Enemy movement / short-term fingerprinting

New-team test: 25,205 predictions in 57 games from 15 teams. Three of the 60 reserved replay perspectives produced no eligible motion label. Macro-F1 gives each of the three classes equal weight; accuracy weights each observed frame equally.

| Predictor | Accuracy | Macro-F1 |
|---|---:|---:|
| Repeat previous observed motion | 58.0% | 0.511 |
| Current state | 51.2% | 0.499 |
| State + own history | 51.8% | 0.504 |
| State + enemy history | 58.7% | 0.558 |
| State + both histories | 59.1% | 0.561 |

History improves macro-F1 over motion persistence by 0.050; the paired opponent-cluster bootstrap 95% interval is [0.033, 0.065] (2,000 resamples over 15 teams). Enemy history accounts for most of the gain. The raw accuracy gain over persistence is only 1.1 percentage points. The bootstrap describes variability across these sampled teams; it does not remove replay-selection bias or establish a win-rate gain.

History consists of previous movement and HP changes plus running movement/approach/retreat rates. This is a simple short-term behavior fingerprint, not a learned classification of a team's complete farming, objective and combat strategy.

## Expert-action imitation

New-team test: 35,642 labeled turns from 20 games, 5 previously unused teacher teams.

| Predictor | Accuracy | Macro-F1 |
|---|---:|---:|
| Repeat previous own action | 78.4% | 0.423 |
| Current state | 66.5% | 0.536 |
| State + history | 77.2% | 0.609 |

The history model improves macro-F1 over action persistence by 0.186, with a team-bootstrap 95% interval [0.163, 0.229]. Only five fresh teacher teams are in this test. On the reused Fish stress test the history model scores 78.5% accuracy / 0.609 macro-F1, versus persistence 79.9% / 0.349. Repeated movement dominates many frames; predictability is not evidence that imitating it improves our strategy. A high-level label supplies neither a movement destination nor a specific target/ability.

## Portable inference pilot

The initial pilot models were distilled into C++ decision trees: action tree 47 nodes / depth 5; motion tree 199 nodes / depth 8. Python/C++ inference agreed on 6,000 held-out vectors with zero mismatches. These headers belong to the initial pilot, not the expanded confirmation models. Compression loses useful signal: the motion tree's pilot-test macro-F1 was 0.512 versus 0.524 for motion persistence. Full in-game feature extraction and Wasm fuel were not benchmarked; a few tree comparisons alone do not establish compliance with the per-turn budget.

The initial exploratory history-ablation script used different preprocessing from the main pilot, so its attribution numbers are confounded. The confirmation ablations above correct this with identical preprocessing; use those for conclusions.

## Offline contextual bandit / RL-style experiment

This experiment chooses between two already implemented complete strategies at draft: v57 and fixed Vesper capture priority. It uses static map/camp/layout features plus side, excluding map identity and opponent identity. It is a one-step contextual bandit, not multi-turn PPO or multi-agent self-play.

Training used 144 cached paired contexts on 24 maps and 3 opponents. Validation used 32 contexts on 8 different maps and 2 different opponents. The primary test used 32 contexts on another 8 maps and 2 other opponents; an additional new-opponent check spans 160 contexts across all 40 maps. In total 560 paired contexts represent 1,120 previously executed local engine games, not new platform challenges. Each of five REINFORCE seeds sampled 30,000 cached episodes; these are not 150,000 freshly simulated games. The reward combines a win, a heavy-loss penalty and a small bounded gem-margin term. Policy selection uses validation mean reward and includes fixed policies.

| Policy | Validation wins / 32 | New maps + new opponents / 32 | New opponents, all maps / 160 |
|---|---:|---:|---:|
| Always v57 | 32 | 22 | 118 |
| Always Vesper priority | 31 | 20 | 114 |
| REINFORCE seed 7 | 31 | 23 | 116 |
| REINFORCE seed 11 | 31 | 21 | 115 |
| REINFORCE seed 19 | 31 | 23 | 117 |
| REINFORCE seed 23 | 31 | 22 | 116 |
| REINFORCE seed 29 | 31 | 21 | 115 |
| Ridge reward difference | 31 | 24 | 117 |
| Decision tree reward difference | 31 | 21 | 117 |

Validation selected **always v57**. A learned selector has 24/32 on the small primary test, but selecting it from that test would be cherry-picking; it loses on validation and scores 117/160 on the broader held-out-opponent check versus v57's 118/160. All REINFORCE seeds score 115–117/160. This negative result concerns this limited two-strategy selector; it does not rule out richer RL.

## Practical next experiment

The best-supported next candidate is an enemy-motion risk estimate used inside existing retreat/pursuit scoring, with a baseline fallback and a small influence bound. It needs a portable model that preserves the signal, exact live feature parity, fuel measurement, then paired closed-loop local games against held-out opponents. Prediction metrics alone cannot choose deployment. Expert imitation is useful as an intent prior or diagnostic; it needs destinations and targets before it can act as a complete policy.

For substantial GPU work, the missing prerequisite is a fast multi-turn environment exposing personal observations, legal actions, rewards and resets, plus multiple opponent policies. Then behavior-cloning warm-start followed by recurrent self-play/RL is plausible. None of those full-game training runs were performed here; these tabular CPU experiments did not need a GPU cluster.

## Artifacts and reproduction

- `confirmation/PROTOCOL.json`: frozen team splits and model design.
- `extract.mjs`, `train_confirm.py`, `confirmation/results.json`: feature extraction, training and all confirmation metrics/confusion matrices.
- `confirmation/*.joblib`: fitted confirmation models. Training can be rerun with `.venv/bin/python analysis/ml_rl_2026-10-23/train_confirm.py` after setting `OMP_NUM_THREADS=4 OPENBLAS_NUM_THREADS=2`.
- `train_ml.py`, `ml_results.json`: initial pilot model comparison.
- `bandit_protocol.json`, `train_bandit.py`, `bandit_results.json`: reward, splits, all seeds and negative selection result.
- `action_student.h`, `motion_student.h`, `student_predict.cpp`, `ablation_distillation.json`: initial portable-tree pilot and parity result.
- `VERIFICATION.json`, `docs_verification.json`: source immutability, dataset coverage, artifact hashes and fresh rules check.
- `confirmation_results.png` / `.svg`: offline result figure.

No model was submitted or enabled in v57.
