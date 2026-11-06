# Fish behavioural clone

Supervised imitation of Intercontinental Fish (rank 1) from its replays: given what one Fish champion sees at the start
of its turn, predict what Fish did (move, attack target, ability + target, ward, recall/submit/...).

## Pipeline

| step | where | script | output |
|---|---|---|---|
| list Fish's matches (engine 1.0.3) | Mac | `crawl.mjs` | `fish_matches.json` (51,565 matches), `crawl_groups/` |
| plan group downloads | Mac | `make_group_plan.py` | `group_plan.json` (ranked first, newest first) |
| download replays | Mac → cluster | `feed_groups.mjs` → `cluster_receive_groups.py` | cluster `replays/<map>/<matchId>.repl26a` |
| observations | cluster | `extract_cluster.py` (turnhost `--observe` + `tools/fishbc_observer.cpp`) | `obs/<matchId>.tsv.gz` |
| tensors | cluster | `build_dataset.py` (looped by `cluster_build_loop.sh`) | `data/{train,val,test}_NNNN.npz` + `schema.json` |
| train | cluster GPU | `train.py` via `run_cluster.sh` | `models/<tag>.pt`, `<tag>_metrics.json` |
| evaluate | either | `eval_model.py` | per champion / situation accuracy, permutation importance |
| use | Mac | `compare.py` | "what would Fish do" on any replay side (e.g. our games) |

The replay storage is blocked on the Mac's network, so the Mac only asks the platform for pre-signed URLs (30 API
reads/minute; one request per match *group* of ~5 replays) and the cluster downloads. `extract.mjs` is the Mac version
of the extractor (used for the first 835 games).

## Data

One sample = one Fish champion turn, from that champion's own (fog-of-war) view:

- `grid` uint8 [19, 15, 15]: egocentric window, radius 7. Terrain, spawns, altar, ally/enemy HP, carried gems, enemy
  ranged/cooldown-ready marks, camp HP/awake/strength/tiles, camp value, reward-ready, respawn timers.
- `scal` float [54]: champion type one-hot, own stats/cooldowns/state, bank, round, spawn/altar vectors, counts,
  nearest enemy/camp distance, map size, last turn's move/attack/cast, HP change, rounds since last attack.
- labels: move (9 incl. stay), attack tile (225 + none), cast slot (none/1/2), cast tile, ward tile, special
  (recall / submit / cancel / lock / teleport).

Turns with an enemy within 8, a camp within 6, or any non-walking action are all kept; other turns are sampled at
25%. Split by match id hash: 10% test, 5% val, 85% train (whole games, so no leakage between turns of a game).

Masks: `--no-history` blanks the last-turn features (tests the "copycat" shortcut), `--zero-scalars 27` blanks
`priority` (the bot's own `set_priority` value: a Fish-internal mode flag, meaningless for other bots, and it makes
`compare.py` on our games nonsense because we use 1000).

## Model

`FishNet`: conv stem + scalar embedding added to every tile, residual 3x3 blocks, then
pooled + centre-tile + scalar features → move / cast-slot / special heads, and per-tile logits (+ a "none" logit) for
attack / cast / ward targets. Sum of cross-entropies. Random D4 symmetry (rotations/reflections of the window, the
direction scalars and the targets) on the GPU. bf16 autocast, AdamW + one-cycle LR.

`--features v2` (`build_dataset.py`) adds 35 per-champion channels: enemy strength, cooldown-0/1 ready, recalling/submitting,
item shards, champion type one-hot (enemy and ally), ally ranged/strength/cooldown/shards → 54 channels.

## Results so far (held-out test games)

| run | games | features / masks | move | move (non-stay) | attack y/n | attack tile | cast slot (when cast) | cast tile | all heads |
|---|---|---|---|---|---|---|---|---|---|
| a6000_w128b8 (6 ep) | 835 | v1, history, priority | 0.825 | 0.724 | 0.966 | 0.913 | 0.728 | 0.822 | 0.766 |
| nohist_w128b8 (4 ep) | 835 | v1, no history | 0.781 | 0.649 | 0.962 | 0.913 | 0.733 | 0.799 | 0.722 |
| scale_p0_w128b8 (3 ep) | 1,864 | v1, priority blanked | 0.827 | 0.732 | 0.967 | 0.913 | 0.730 | 0.814 | 0.773 |
| scale_p0_v2_w128b8 (3 ep) | 1,864 (same) | v2, priority blanked | **0.833** | **0.742** | **0.968** | **0.918** | **0.743** | **0.830** | **0.781** |

| inter_v2_w128b8 (3 ep) | ~4,500 | v2, priority blanked | 0.853 | 0.771 | 0.974 | 0.932 | 0.812 | 0.847 | 0.811 |

The first two rows share one test set and the next two another (more games), so compare within pairs.

Size / density test (1 epoch, the same ~10,500 games and 4.9M-turn test set; chosen on validation):

| run | val move | val all heads | test move | test move (non-stay) | test cast slot (when cast) | test all heads |
|---|---|---|---|---|---|---|
| capA w128b8, all turns | 0.843 | 0.799 | 0.855 | 0.775 | 0.804 | 0.812 |
| capB w128b8, random half of turns | 0.817 | 0.764 | 0.829 | 0.735 | 0.766 | 0.776 |
| capC w160b10 (4.8M params), all turns | 0.842 | 0.799 | 0.854 | 0.773 | 0.819 | 0.813 |

No-history check at scale (nohist27k_v2_w128b8, ~27,000 games, 1 epoch, 10.1M test turns): move 0.823, non-stay 0.724,
attack y/n 0.972, attack tile 0.927, cast slot (when cast) 0.805, all heads 0.782 - the last-turn inputs add ~3 points of
move accuracy (straight-line walking) and almost nothing to attack / cast choices.

→ keep every turn; the bigger network does not pay for its 2x cost at this scale. Final: w128b8, v2, all games.
Move accuracy by situation (v1 → v2, same games): enemy ≤ 2 tiles 0.73 → 0.75, 3–5 tiles 0.66 → 0.68, 6–8 tiles
0.71 → 0.72, no enemy near 0.88 → 0.88. Fights are the hard part; the history features mostly help straight-line walking.

## Empirical rules (`rules_targets.py`, raw observations, 13,705 games; `rules_targets.json`)

- 2+ enemy champions in range: Fish hits the lowest absolute HP one 89% of the time (random 48%; n = 229,279).
- A champion and a camp unit both in range: always the champion (348,706 / 348,706).
- An enemy recalling or submitting in range: Fish hits it 92% of the time (n = 19,567).
- Camps: lowest HP fraction first (88%).
- `priority` (Fish's `set_priority`) tracks its situation: -1 healthy & empty, -3 carrying gems, -2 damaged/fighting,
  -4 / -9 low HP with gems (recall 7-10% of turns), -6 / -8 many gems, positive values = enemy within ~3-7, 0 = dead.
- Action order: when Fish both moves and attacks/casts in a turn, it acts first and then moves 54% of the time
  (hit-and-reposition), moves first 42%. Our v96b: acts first only 14%, moves first 86% (`compare.py` games).

## Our games vs the clone (`compare.py`, inter_v2_w128b8, 4 v96b games vs Fish)

Turns where our action = the clone's top Fish choice: move 0.76 (enemy 3-5 tiles: 0.44, enemy ≤ 2: 0.57, no enemy
near: 0.79), attack decision 0.96, cast slot 0.90. On Fish's own games the clone scores ~0.68-0.75 on moves in fights,
so our fight movement is the least Fish-like part. Typical confident disagreements: we hit a nearly dead camp unit and step
away (Fish stays and keeps hitting), we cast and walk onto the camp tile where Fish just attacks.

## Inside the model (`interpret.py` on the cluster, `render_interpret.py` → `interpret/capA_w128b8_probes.png`)

Model capA_w128b8 (v2, ~10,500 games), 394,627 held-out test turns (all turns with an enemy within 8 + a weighted sample
of calm ones). Moves are classed relative to the nearest visible enemy: approach / retreat / sidestep / stay.

**Modes the network separates by itself** (k-means on its internal 128-d summary; share = weighted share of turns; the
clone's action rates match Fish's in every cluster):

| share | situation | what Fish does |
|---|---|---|
| 27% | contact: enemies around, HP 0.74, ~20 gems | stay 42%, retreat 20%, sidestep 24%, approach 14%; attack 35%, cast 18%, recall 4% |
| 38% (3 clusters) | travelling, full HP, no enemy near (10-26 gems) | keeps walking (76-87% of moves), rarely acts |
| 14% | camp farming: next to an awake camp unit | stands still 99% and attacks 98% |
| 3% | camp opening | attack 94% + ability 97% in the same turn, standing |
| 5% | walking with ability use | casts 71% while moving (movement / utility ability) |
| 6% | full bag (~63 gems), HP 0.57 | does nothing at all (inferred: channelling a recall / submission) |
| 3% | next to a camp whose reward is ready | stands still, no attack (inferred: waiting on the reward) |
| 3% | dead / respawning | nothing |
| 0.5% | at the altar with ~38 gems | submits (90%) |

**Probes** (40,000 real fight turns, enemy within 5; one input changed, everything else as it was; numbers = the clone's
probability of each choice, averaged):

- Own HP is the main fight-or-flight switch. Retreat 0.26 at full HP → 0.34 at 60% → 0.46 at 40% → 0.55 at ≤ 20%;
  approach 0.32 → 0.11. Approach and retreat cross at ~80% HP. Outnumbered (fewer allies + self than enemies within 4)
  shifts retreat up by ~0.06-0.08 at every HP; outnumbering shifts it down by ~0.03-0.05.
- Recall in a fight: ~0.1% above 70% HP, 2.5% at 50%, 5.3% at 40%, ~8% at ≤ 30%.
- The nearest enemy's HP drives chasing: approach 0.41 / retreat 0.16 / attack 0.37 when it is at 5% HP, vs
  0.24 / 0.37 / 0.28 at full HP.
- Gems make it careful: retreat 0.30 (no gems) → 0.37 (20) → 0.42 (40); approach 0.29 → 0.20; recall 1.0% → 2.2% (80 gems).
- No allies in view: retreat +0.07, approach −0.05.
- Enemy cooldowns ready vs spent: retreat 0.36 vs 0.30, approach 0.26 vs 0.29 (it respects the enemy's abilities).
- Own cooldowns ready vs spent: ready → stands and fights (stay 0.46, cast 0.60, attack 0.38, approach 0.18); spent →
  moves (approach 0.30, retreat 0.34, cast 0.00).
- Enemy champion type (same position/HP, type swapped): most aggressive vs Willow and Cassi (approach 0.33, retreat
  0.26), most careful vs Ryth (retreat 0.34), VesperVale and Marcella (0.33-0.34). The type effect is smaller than HP.

**Readable rules imitating the clone** (decision trees on plain features; fidelity on held-out turns):
- Fight move (enemy within 5), depth 3: 46% agreement (51% at depth 5; always-majority 34%). Fight movement depends
  on terrain/positions the plain features don't capture, but the top splits are: enemy adjacent → stand and fight unless
  own HP ≤ 54% and the enemy has > 31% → retreat; enemy 2-5 away → approach if its HP ≤ 48% (stand if own ability 2 is
  ready), else retreat if own HP ≤ 65%, approach otherwise.
- Attack (enemy within 5), depth 3: 83% (majority 70%): attack an adjacent enemy; at range 2 only with an HP advantage
  in the 4-tile area; further away hit an adjacent camp unit only if no enemy is within 4.
- Recall is too rare for a tree (always "no recall" scores 99.1%); see the probe above.

**What the fight choices read** (share of fight turns whose choice flips when one input is shuffled; move / attack):
enemy positions + ranged mark 0.32 / 0.16, enemy HP 0.31 / 0.13, walls 0.23, camp tiles 0.21, camp respawn timers 0.18,
own HP 0.16, last move 0.12-0.13, enemy ability-2 ready 0.11, own ability-2 cooldown 0.11 / 0.05, bushes 0.11, ally
ranged 0.10, enemy items 0.09.
