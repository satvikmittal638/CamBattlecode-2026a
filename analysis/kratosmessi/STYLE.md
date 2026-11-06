# KratosMessi (ladder #2) - play style

Source: 1,470 finished matches (294 groups) played 2026-10-13 10:20-21:04 UTC, `top_replays/2_KratosMessi/`.
Numbers below are from the most recent 80 matches unless stated (scripts in this folder:
`deep.mjs`, `decisions.mjs`, `trib_model.mjs`, `target_choice.mjs`, `fights.mjs`, `abil_ctx.mjs`,
`recall_*.mjs`, `opening.mjs`, `engage_hp.mjs`, `lowhp_camp.mjs`, `respawn_gap.mjs`; per-map
geometry dumped by a probe bot into `maps/*.txt`).

**One-line summary:** a disciplined *split-farming* bot. Every champion independently clears the
nearest live camp group **on its own half**, captures it **alone**, banks gems as soon as the bag
is worth it (>= 40 gems, or any bag when an altar is <= 8 tiles away), recalls at ~1/3 HP or right
after a tribute when it can buy an emblem (>= 150 gold), and fights only enemies that come into
reach. No wards, no priorities, no monolith, a fixed draft and a fixed item build. It wins on
economy and safety (1.9 deaths/game) rather than on fights.

## Results / headline numbers (recent 80)

| metric | value |
| --- | --- |
| win rate | 76% (vs. the whole ladder; 14/80 vs Mite overall, 36/105 vs WHIM) |
| avg rounds | 492 (game usually ends by someone hitting 1,000) |
| gems tributed for / against | 974 / 704 |
| captures per game (own / opponent) | 28.2 / 23.1 (5.95 per 100 rounds) |
| champions present at a capture | **1.00** (always exactly one capturer) |
| first capture / first tribute | round 31 / round 61 |
| tributes per game, gems per tribute | 25.5, mean 40.6, median 36 |
| recalls per game, HP at recall | 21.7, mean 0.43 (mode 0.30-0.35) |
| kills / deaths per game | 4.0 / 1.9 |
| altar locks bought / placed per game | 3.5 / 0.25 |
| wards placed, priority changes | 0 / 0 |
| time spent in the enemy half | 9% |
| allies within 4 tiles (mean) | 0.77 |
| attacks: camps / champions per game | 617 / 94 (champions = 13%) |

## Draft

* Fixed priority list, truncated to the team size, **independent of map and of opponent picks**:
  `Varg > Cassi&Issac > Vendetta > Ryth > Tavi` (3 picks: Varg, C&I, Vendetta; 4: + Ryth; 5: + Tavi).
  100% of 1,000+ matches since ~12:00 UTC.
* Earlier version (10:20-12:00) picked `C&I > Vendetta > Varg > Ryth > Tavi` and tried a few
  caster drafts (Ryth/Tavi/Prism/Marcella/Stellar) in the first hour; it won only 38-50% then.
* Rationale visible in the data: all picks have an attack reset (double hits on camps), Varg
  splash + shield and Vendetta cooldown reset on kills are camp-clearing tools; C&I gives two
  bodies (two capturers) for one pick.

## Opening and farming route

* No fixed per-map script is needed to explain it: from round 1 every champion walks (Issac and
  Vendetta dash on cooldown) to the **nearest live camp group by path distance**. Several
  champions often converge on the first wolf (e.g. monolith: 4 champions on the closest wolf at
  round 4-5), kill it in a few turns, then **one** stays to capture and the rest peel off to the
  next nearest groups. First capture ~round 31.
* Target choice (1,256 decisions, recent 30 matches): chosen group = nearest live group 56%,
  2nd nearest 22%, 3rd 9%. When the nearest is skipped it is mostly because **an ally is already
  on it**. Pure gold clusters are almost never captured (0.04/game) and the **monolith is never
  attacked**.
* **Own half only**: 97% of captures are of groups closer to the own spawn than to the enemy's
  (the rest are "middle" groups on collision/packs/corners). Champions spend 9% of alive time in
  the enemy half. On rows they only ever farm their 3 own triple-wolf groups (66 gems each).
* Cooperation: allies are near (<=3 tiles) at ~50% of elk engagements and ~45% of wolf
  engagements, but captures are always solo (`capturersAtCapture = 1.00`): the second champion
  leaves as soon as the camp dies.
* They frequently wait at a group for its respawn (38% of own-side respawns had a KM champion
  within 2 tiles); median gap respawn -> KM capture 35 rounds.
* Captures by camp type per game: Wolf 14.6, Gem cluster 6.7, Elk+Gold 3.0, Elk 2.7,
  Gem+Gold 0.9, Elk+Gem 0.3.

## Tribute rhythm

* Decision is taken right after a capture (gem gain). Share of "go to altar next" vs "farm another
  camp first" (recent 40):

  | bag | altar <= 8 tiles | 9-14 | >= 15 |
  | --- | --- | --- | --- |
  | < 30 gems (one wolf/gem pair) | 96% | 51% | 26% |
  | 30-39 (one elk) | 86% | 67% | 66% |
  | 40-44 (two wolves) | 99% | 83% | 88% |
  | >= 45 | 96% | 94% | 97% |

  i.e. **bank at >= 40 gems, or when an altar is close, or when the next camp is not much closer
  than the altar**; otherwise chain another capture first. Max bags are rare (>110 gems: 0.6%).
* Nearest altar is used 83% of the time.
* Gems per tribute by map: lanes 26, collision/elkring 39-40, monolith/corners/interlock/packs
  41-47, rows 66 (one triple-wolf group).
* After a tribute completes, if the champion holds >= 150 gold it **recalls immediately** to shop
  (104 of the 140 high-HP recalls happen on the turn the tribute lands).

## Recall / retreat

* Low-HP recall: sharp threshold at **~1/3 HP** (snapshot HP at recall: 10th pct 0.20, median
  0.33; bins 0.30-0.35 = 221 vs 0.35-0.40 = 56). Same for every champion (medians 0.28-0.31).
* While a camp is still hitting them at 0.20-0.33 HP they **walk out of range (67%)** or finish
  the camp if it is almost dead (30%, mostly camp HP < 300); recalls are almost never interrupted
  (20 of 530 in 25 matches).
* **Recall during capture**: 17% of recalls start while standing on a dead camp's tile; the 5-round
  capture completes before the 5-turn recall lands, so they get the gold, teleport home, shop and
  then walk to the altar. Typical when HP < 0.5 and gold after the capture >= 150 (72% of those
  cases).
* High-HP recalls (>= 0.5 HP, 29%): 77% have >= 150 gold (the post-tribute shopping recall above);
  a few are "nothing to farm, go home".

## Shopping / builds

Spend everything at spawn (or while dead), always in the same order, one shard (30 g) at a time:

* Varg / Issac / Vendetta / Ryth / Tavi: **Monster Strength x5 -> Jungle Health x5 -> Power
  Strength x5 -> Durability Health x5 -> Power Strength forever**.
* Cassi: **Monster Focus x5 -> Jungle Health x5 -> Power Strength ...** (Cassi rarely captures,
  so 50% of Cassis finish with no emblem).
* One **altar lock** (10 g) bought with the change whenever they do not hold one (3.5 buys/game).
* 12:00-14:00 version used Monster > Jungle > **Durability** > Power; the Power-before-Durability
  order appeared ~15:00 together with the drop in deaths (2.6 -> 1.2 per game).
* Never: Treasure, Home, Bruiser, teleport crystals, wards.

## Abilities (per 100 rounds, per champion)

* Attack reset (Varg, Issac, Vendetta, Ryth, Tavi): ~3.9-4.6, **always right after a basic attack
  in the same turn** (double hit), mostly on camps (~75%), otherwise on champions.
* Issac / Vendetta dash: 7.0 / 7.7, almost all while travelling with no enemy near (dash first, then
  walk) - i.e. used as a movement speed-up on cooldown.
* Varg shield: 5.3, cast when below 90% HP, mostly while walking between/at camps (taking camp
  damage) and in fights.
* Cassi: Damage -> camps 4.8 (wolves, gem clusters, elks), Stun -> enemies 1.2, Damage -> enemies
  1.0 (stun first, then damage).
* Tavi: damage+stun on camps 4.5 (elk, wolf) and on enemies 1.0.
* Ryth: area stun on enemies 1.5, on camps 1.1 (packed camps).

## Fighting

* Target = **closest enemy in range** (91% of choices when >= 2 enemies are in reach; lowest HP is
  only 58%). Carrier status is ignored.
* Melee with HP >= 40%: enemy adjacent -> attack 79%; at distance 2 -> step in and attack 49%; at
  distance 3 -> mostly hold/approach, rarely attack. Ranged (Cassi, Tavi) attack anything within 3
  (51-55%) and cast at 4.
* HP < 40%: move away from enemies at distance 2-5 (36-42%) and recall when clear.
* No camp attacks while an enemy champion is within 3 (1%). They do not chase into the enemy half.
* Altar lock placements (0.25/game) are always on an altar where an **enemy is tributing**, from
  within 2 tiles (cancels the channel).

## What they don't do

No wards (0.00/game), no `set_priority`, no teleport crystals, no Treasure/Home items, no monolith,
no invasion of the enemy jungle, no deliberate gank/escort logic.

## Evolution over the day

| window (UTC) | WR | deaths | captures | gems/trib | locks bought | draft |
| --- | --- | --- | --- | --- | --- | --- |
| 10:00-12:00 | 50% | 5.2 | 25.6 | 35 | 0 | C&I first, experiments |
| 12:00-14:00 | 68% | 2.6 | 32.3 | 41 | 4.7 | Varg first (final) |
| 15:30-17:00 | 80% | 1.4 | 27.2 | 41 | 3.1 | final |
| 18:00-19:30 | 88% | 1.2 | 27.2 | 43 | 3.7 | final |

The late versions mainly became safer (fewer deaths) and switched Power before Durability.

## Weak spots seen in the data

* Rows: loses to teams that take the monolith (990-1056 vs Mite/WHIM/NotSoLonely) since KM
  ignores it (448 gems).
* Mite beats it 66/80; KM's 3-champion games on packs/rows/collision vs Mite are lost on tempo.
* Fights only on contact; enemies that contest its own-side camps with numbers win those camps.
