# Intercontinental Fish (ladder #1): reverse-engineered meta

*20 Oct 2026. Data: 275 Fish games on the final Fish bot, engine 0.0.3, from 19 Oct 19:35 to 20 Oct 02:57 UTC. That is 136 games on the old map pool and 139 on the current 21 maps. A 2,200-game corpus is still downloading into `corpus_fish/`.*

**Caveat.** Fish's bot has failed every match since the Week 2 SDK break (about 03:00 UTC on 20 Oct). Its #1 rating is frozen, and everything here describes how Fish played on the **old balance**. The structure of the policy carries over to the new balance. Exact thresholds (gold, gem bags) were tuned to the old camp rewards.

## How it was reverse-engineered
- **Better replay decoder (`tools/turn_trace.mjs`).**
  - It calls the game engine's own bot API (`Game_API_*`) at the start of every Fish champion turn, from Fish's team perspective.
  - Each record is exactly what the Fish bot could see:
    - its own HP, stats, gold, gems and items;
    - ability cooldowns, channel state, priority and ward charges;
    - visible enemies and allies with their gems, items and cooldowns;
    - visible camps with their awake state;
    - camp-group states and the score.
  - Each record also holds the actions that champion took that turn, with resolved targets.
  - Shared and draft memory are not stored in replays (they read as zeros even for our own bot), so coordination is inferred from behaviour.
- **Parallel extractors (`tools/fish/run.mjs` + `ex_*.mjs`)** turn about 300k Fish turns into decision datasets: recall, tribute, engage, fight target, camp target, wards, priority, spells, team shape and builds.
- **Models.**
  - Decision trees, conditional logits and gradient boosting, all cross-validated by game.
  - A behaviour-cloning classifier predicts Fish's action category per turn at **84%** held-out accuracy (majority baseline 36%), so the policy is close to deterministic given local state.

## The game plan in ten rules
1. **Fixed draft per map type:** Stellar / Ren / Cassi & Issac / Ryth / Varg. The opponent's picks never change it.
2. **Fixed builds:** three emblems in a set order per champion, then Power in the scaling stat forever. Stellar and Ren end up 2–3× richer than any other champion on either team.
3. **Funnel gold into two carries.** When the team clears a camp, Stellar or Ren takes the capture. Stellar earns 1,276 gold per game from captures and Ren 908; Varg earns 278 and Ryth 283.
4. **Move as a pack and farm the nearest camp.** The whole team is usually in one group, camp choice is "nearest first" with a bonus where allies already are, and the team prefers its own half.
5. **Cast every ability on cooldown, mostly on camps.** Stuns go onto Wolves and Elks so camps deal no damage. Dashes are used as travel (about 31 per game each for Ren and Issac).
6. **Bank small and often.** At an altar, tribute once carrying more than about 20 gems with no enemy within 8 tiles. After a capture, walk to an altar once carrying 45+ gems, or 20+ if the altar is close.
7. **Recall to shop, not to survive.** Recall at about 133+ gold when no enemy is within 8 tiles, or below about 37% HP.
8. **Turn order:** priority = HP decile − 10 normally, about −5 lower when carrying gems, and positive (up to +10) when an enemy is within about 6 tiles. Fighters near enemies act first; wounded gem carriers act last.
9. **Fight mechanically.** Hit any enemy within reach: a spell at 4 tiles, stuns at 5. Pick the nearest, lowest-HP target, strongly prefer an enemy that is recalling, and keep focus. Retreat below about 43% HP or when not ahead about 1.6× in local power. Ranged champions hold 4–6 tiles away.
10. **Ward bushes ahead,** about 98 per game: placed at range 3, 78% in bushes, often near altars and paths.

## 1. Draft
- Champions are not exclusive, and Fish's list never reacts to the opponent's draft (checked against every opponent pick).

| Map type | Fish draft (pick order) |
|---|---|
| Default (most maps, 5 picks) | Stellar, Ren, Cassi & Issac, Ryth, Varg |
| 3 picks (collision, fragment, broken_curve, gold_rush, packs) | Stellar, Ren, Cassi & Issac |
| 4 picks (interlock, hooks, swirl, rushbait_v2) | Stellar, Ren, Cassi & Issac, Ryth |
| Boss maps (contest, stampede) | Stellar, Tavi, Prism, Cassi & Issac, Ren |
| Big maps (big_world, fracture) | Cassi & Issac, Vendetta, Varg, Stellar, Ren |
| Old expanse | Cassi & Issac, Stellar, Varg |
| Old rows | Stellar, Prism, Cassi & Issac, Varg |

- **Stellar is the first pick in 91% of games.**
- Each champion's ability slots:

| Champion | Slot 0 | Slot 1 |
|---|---|---|
| Ren | stun | dash |
| Cassi | damage | stun |
| Stellar | damage | area damage |
| Issac | attack reset | dash |
| Varg | attack reset | shield |
| Ryth | area damage | attack reset |
| Tavi | attack reset | stun |
| Prism | stun | area damage |

## 2. Items and shopping
Purchase order, counted as shards bought; 5 shards make an emblem. Then Power in the scaling stat forever.

| Champion | Build (share of games) | Shards bought per game (games of about 540 rounds) |
|---|---|---|
| Stellar | Power Focus > Home Health > Durability Health > Power Focus… (225/268) | 45 (36 of them Power Focus) |
| Ren | Bruiser Health > Durability Health > Power Focus… (218/257) | 32 |
| Cassi | Power Focus > Durability Focus > Bruiser Health (113/245) | 18 |
| Issac | Power Strength > Home Health > Durability Health > Power Strength (103/245) | 17 |
| Varg | Power Strength > Home Health > Durability Health | 17 |
| Ryth | Bruiser Health > Durability Health > Power Strength | 15 |
| Tavi | Treasure Focus > Durability Focus > Power Focus… | 92 |
| Prism | Power Focus > Home Health > Durability Health > Power Focus… | 42 |
| Vendetta | Monster Strength > Power Strength… | 15 |

- **Big maps (big_world, fracture, old expanse, old rows):** every champion opens with a **Monster emblem** (+10% camp damage) and then goes Power.
- **Home emblem:** the Home Health emblem (recall in 3 turns instead of 5) on Stellar, Issac, Varg and Prism matches the frequent shopping recalls.
- **Consumables are rare:** about 0.1–0.2 purchases per champion per game, all of them consumable 0.

**Wealth at round 300 (gold + 30 per shard), Fish vs its opponents:**

| Champion | Fish | Opponents |
|---|---|---|
| Stellar | 871 | 245 |
| Ren | 647 | 295 |
| Cassi | 301 | 162 |
| Issac | 296 | 285 |
| Varg | 329 | 338 |
| Ryth | 286 | 306 |

Fish's edge is concentrated almost entirely in its two carries.

## 3. Economy
**Tempo.** Fish wins 93% of these games with an average length of 538 rounds.

| Round | 100 | 200 | 300 | 400 | 500 |
|---|---|---|---|---|---|
| Gems tributed | 79 | 252 | 466 | 705 | 877 |

- First capture comes around round 46, and the first tribute around round 115.
- On elkring, corners, lanes, monolith and similar maps, the first capture is at rounds 16–40 and 1,000 gems arrive by about round 400.
- Captures yield about 33 gems and 120 gold each, and 25% of Fish's captures are on the enemy half.

**Camp choice.** A conditional logit over every living camp group at each free moment, with walking distances (`analysis/ml/model_target_fish.json`).

| Rule | Top-1 accuracy (~14 candidates) |
|---|---|
| Fitted model | 54% |
| Nearest group | 50% |
| Our W2/W3 scores | 31% |

- **Distance dominates:** utility is about distance^−2.3.
- **Then gold and gems:** log(gold) weight +0.69, log(gems) +0.52.
- **Allies already near the group: +0.42.** This is the pull that keeps the pack together.
- **Own side preferred:** −0.19 per 10 tiles toward the enemy side.
- **Armed groups slightly avoided,** more so when far away or when the champion is wounded.

**Team shape.** In snapshots every 5 rounds:
- The whole team is one connected group (each champion within 5 tiles of another) 72% of the time, 52–86% depending on the map.
- Otherwise it splits 4+1; the champion outside is usually on an errand at full HP, carrying gems in 44% of cases.
- Only 4.8% of champion-snapshots are isolated (nearest ally more than 6 tiles away). Our v27 is at 8.8%.
- Fish's opponents are about as compact, so cohesion is necessary but not what separates Fish.

**Capture allocation (the real differentiator).** When several Fish champions stand near a cleared group, the reward goes in this order:

| Champion | Takes the capture when present nearby |
|---|---|
| Stellar | 76% |
| Ren | 73% |
| Issac | 59% |
| Varg | 57% |
| Cassi | 49% |
| Ryth | 46% |

- Pairwise, Stellar beats Cassi 75% of the time, Ren beats Cassi 77%, Ren beats Issac 69%, Issac beats Ryth 73%, and Stellar against Ren is even.
- **Captures per game:** Stellar 7.6, Ren 5.7, Cassi 3.7, Issac 3.6, Ryth 1.9, Varg 1.5. Opponents spread theirs evenly at 1.8–3.3 per champion.

**Spells and dashes.** Everything is cast on cooldown, mostly at camps:

| Ability | Per game | Target share |
|---|---|---|
| Cassi stun | 24.7 | 84% camps (Wolves, Elks) |
| Ren stun | 23.1 | 76% camps |
| Cassi damage | 26.8 | 88% camps |
| Stellar damage | 20.3 | 83% camps |
| Stellar area damage | 23.6 | mostly ground tiles around camps and fights |
| Issac dash | 32.3 | travel; only 7% in fights |
| Ren dash | 31.3 | travel; only 11% in fights |
| Varg shield | 12.2 | used on cooldown |
| Attack resets | on cooldown | — |

- A stunned camp doesn't hit back, so stunning Wolves and Elks makes clears both safe and fast.

**Tribute rule.** Decision tree, CV AUC 0.97, on turns within 2 tiles of an altar.
- Tribute when carrying **more than 19 gems and no enemy is within 8 tiles**. The chance is about 0.75–0.87 per turn away from home.
- With an enemy at 5–8 tiles, about 38%. With an enemy within 5, rarely.
- 15 tributes per game, with median bag 60 gems (p25 44, p75 88).

**After a capture** (free moment), the next action is tribute 39%, another camp 33%, recall 14% and a fight 14%. The chance of heading to an altar:

| Gems carried | Altar 0–5 tiles | 5–10 | 10–15 | 15–25 |
|---|---|---|---|---|
| 20–40 | 0.49 | 0.36 | 0.25 | 0.11 |
| 40–60 | 0.77 | 0.68 | 0.59 | 0.43 |
| 60–90 | 0.85 | 0.95 | 0.71 | 0.67 |
| 90+ | 0.88–0.97 | — | — | — |

- After returning home it goes to a camp 63% of the time and to an altar 28%. After a tribute it goes to a camp 78% of the time.

**Recall rule.** Decision tree, CV AUC 0.97, on turns with no enemy within 5 tiles.
- **Gold ≥ about 133, no enemy within 8 tiles and more than 5 tiles from an altar:** recall to shop (about 50% per turn, so almost immediately).
- **HP below about 37%:** recall to heal.
- **Never:** above 45% HP with less than about 120 gold.
- 29 recalls per game at a median of 53% HP and 150 gold. 41% of them are made at healthy HP and 53% while still carrying gems.

## 4. Vision
- About 98 wards per game, about one per champion every 30 rounds.
- Ren places 20 per game, Issac 19, Cassi 16 and Stellar 15.
- **Placement:**
  - mostly at the maximum range of 3 tiles from the placer;
  - 78% in bushes;
  - median 6 tiles from the nearest altar, with 25% within 3 tiles;
  - 35% placed while an enemy is in view.
- In practice this sweeps the bushes around altars and paths ahead of the pack.

## 5. Turn order (priority)
Within a team, higher priority acts first, and a change applies from the next round. Fish recomputes priority every turn.

| Situation | Priority |
|---|---|
| No enemy in view, no gems | ⌊10·HP%⌋ − 10: −1 at 90–100% HP, −2 at 80–90%, … −9 at 10–20% |
| Carrying gems | −6 at full HP down to −10 when wounded |
| Enemy within about 6 tiles | +1 to +10, highest for the burst casters (Stellar, Cassi, Ren) |

- A depth-16 regression tree on distance, HP fraction and gems explains R² ≈ 0.63.
- The effect: fresh fighters next to enemies act before their allies, so stuns and bursts land first, and wounded gem carriers move last, after the rest of the team has acted.

## 6. Fighting
**Outcomes (275 games).**
- 7.1 kills and 1.1 deaths per game; Fish steals 73 gems per game in kills.
- Fish starts 67% of fights and wins 76% of all fights.
- When Fish starts a fight, kills outnumber deaths **1,440 to 137**.
- Fight sizes are mostly 1v1, 2v1, 3v1 and 1v2, in mid-map (78%) and near camps (61%).
- **Starting a fight:**
  - 20% of engages hit a target that is recalling, tributing or standing on a capture tile, and 17% are opened from a bush.
  - Openers: Ren stun 580 times, Stellar area damage 468, Cassi stun 400, Ryth area damage 368, Stellar damage 183.

**When to open.** Decision tree, CV AUC 0.97, on quiet turns with an enemy within 7 tiles.

| Distance to enemy | Opens a fight |
|---|---|
| 1 | 91% |
| 2 | 34% |
| 3 | 23% |
| 4 | 21% |
| 5 | 2% |
| 6–7 | 0% |

- The tree is essentially: enemy within 4 tiles and a damage or stun spell ready → use it; at 5 tiles only with a stun ready and no dash ready.
- There is no further engagement calculus. Fights come from positioning (the pack plus the nearest-camp routing) and from being stronger.

**Who to hit.** Conditional logit over visible enemies in reach, 2,301 decisions, **92.5% held-out top-1 accuracy**. "Nearest" alone gets 81% and random 43%. Weights:

| Feature | Weight |
|---|---|
| Distance | −1.83 per tile |
| HP | −1.0 per 1,000 |
| HP fraction | −1.67 |
| Enemy is recalling | **+1.51** (interrupt the recall) |
| Already hit by us in the last 4 rounds | +0.63 (keep focus) |
| Carried gems, items, enemy support | about 0 |

- Focus rate is 0.84 (share of our hits on the fight's main target).

**Positioning.**
- Stellar and Cassi are within 2 tiles of an enemy in only 6–9% of near-enemy turns; they stand at 4–6.
- Stellar hits from 3–4 tiles and Cassi from 3–5.
- Ranged champions cannot both move and attack in a turn, so there is no step-back kiting; spacing does the work.
- Ren, Ryth, Issac and Varg close to 1–2 tiles.

**Retreat.**
- Below about 43% HP, step away.
- Otherwise, with an enemy within 6 tiles, step away when the local power ratio (HP × (strength + 0.6 focus), allies within 6 vs enemies within 8) is below about 1.6.
- Dashes: 1,708 used to engage vs 910 to escape.

## 7. How predictable Fish is (behaviour cloning)
Gradient boosting on about 207k non-boss Fish turns, split by game:

| Action | F1 |
|---|---|
| Hit camp | 0.91 |
| Hit champion | 0.91 |
| Move (no enemy near) | 0.95 |
| Idle | 0.83 |
| Tribute | 0.83 |
| Move toward enemy | 0.71 |
| Recall | 0.71 |
| Move away from enemy | 0.58 |

- Overall accuracy 84%.
- The most important inputs are distance to the nearest enemy, distance to the nearest camp, champion type, cooldowns, HP fraction, the can-move flag, distance home and to an altar, and local enemy power.

## 8. Where our bot differs (v27, platform games)

| Habit | Fish | Our v27 |
|---|---|---|
| Cassi stun | 24.7/game, 84% on camps | 3.7/game, only on enemies (camp stuns disabled) |
| Tributes | 3.1 per 100 rounds, median 60 gems | 1.8 per 100 rounds, median 8 gems |
| Recalls | median 53% HP and 150 gold (shopping) | median 38% HP and 20 gold (emergency) |
| Capture gold | concentrated on Stellar and Ren | spread out; Cassi and Stellar starved |
| Builds | carry-first, then Power forever | Treasure, then Power |
| Priority | dynamic: HP decile, gems, enemy proximity | stun/ranged constants |

## Reproduce
- **Corpus:** `node tools/download_pool.mjs <teamId> corpus_fish --patch 0.0.3 --all-maps`. It respects the bundle rate limit with 4 workers and 20 s back-off.
- **Merge:** `node tools/fish/merge_index.mjs corpus_fish_all corpus_fish replays_week2/1_Intercontinental-Fish replays_recent/1_Intercontinental-Fish`.
- **Extract:** `node tools/fish/run.mjs corpus_fish_all tools/fish/ex_{events,turns,engage,free,team,spells}.mjs analysis/fish_meta/all_<name>`.
- **Analyse:** `analysis/fish_meta/*.py` (run with `.venv/bin/python`); camp choice via `tools/ml/target_dataset.mjs` + `tools/ml/fit_clogit.mjs`.
