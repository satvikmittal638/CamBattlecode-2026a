# SHINK AI 6500 play style

Source: 380 downloaded matches (`top_replays/4_SHINK-AI-6500`, all 2026-10-13 13:21-21:00 UTC). Unless stated otherwise,
numbers are per game over the **newest 30 matches** (the current bot version, which first appeared at 20:45), with
the newest 60 used as a cross-check (they agree on everything except the item build). Scripts are in `analysis/shink/`
(`deep.mjs`, `q_*.mjs`, `lib.mjs`). Coordinates are normalised to the side-A frame.

## 1. Headline profile

| metric (per game, newest 30) | value |
| --- | --- |
| win rate | 0.57 (17/30); avg length 500 rounds; gems 877 for / 869 against |
| captures / first capture round | 25.1 / r35 |
| tributes / gems per tribute (median) / first tribute | 22.4 / 45.9 (44) / r57 |
| recalls | 19.0 (52% with hp < 50%, ~40% triggered by gold, 30% started on a capture tile) |
| deaths / kills | 4.6 (100% to enemy champions, ~0 to camps) / 2.8 |
| attacks on champions vs camps | 14% / 86% (camp mix: wolf 47%, elk 27%, gem 22%, gold 5%) |
| wards, altar locks, consumables, priority changes | **0 / 0 / 0 / 0** (never used) |
| time on the enemy half / captures on the enemy half | 7% / 10% |
| captures shared by 2+ allies | 11% |
| mean distance to nearest ally (excluding the C&I partner) | 6.8 tiles (solo farming) |

Win rate by opponent over all 380: Mite 5/30, WHIM 8/25, KratosMessi 3/5, NOVA 3/5, Full Damage 11/15, Valenki 3/5,
larp 5/10, :3 24/40, Rogo 9/10, Nameless 9/10. SHINK beats mid-ladder teams but loses most games to Mite and WHIM.

## 2. Draft (deterministic per map, ignores the opponent)

Base priority **Vendetta > Varg > Cassi&Issac > Ryth > Tavi**, truncated to the team size, with map-specific swaps.
Picks never react to the opponent (identical drafts against every opponent on a map; duplicates of the
opponent's picks are normal: SHINK and Mite both run Vendetta/Varg/C&I).

| map (team size) | current draft | history |
| --- | --- | --- |
| corners, lanes, monolith (5) | Vendetta, Varg, C&I, Ryth, Tavi | unchanged all day |
| elkring (5) | Vendetta, Varg, C&I, Ryth, **Ren** | Tavi until 16h, Ren since |
| rows, interlock (4) | Vendetta, Varg, C&I, Ryth | unchanged |
| expanse (3) | Vendetta, Varg, C&I | unchanged |
| packs (3) | Vendetta, Varg, **Ryth** | C&I until 16h |
| collision (3) | Vendetta, **C&I, Ren** | Vendetta, Varg, C&I until 18h |

Generalised rule used in the mimic: base order; elk-dominated map (elks >= half of all camps) -> Ren instead of
Tavi; small open 3v3 map without elks -> Ryth instead of C&I; mid-size 3v3 with elks and many lone wolves -> C&I
and Ren instead of Varg.

## 3. Shopping

- Never buys before its first recall/death; first purchase ~r70. Shops only on spawn/while dead, buys as many
  shards as gold allows, in a fixed order (5 shards auto-combine into the emblem):
  - **current version (since 20:45):** Jungle emblem of Strength -> Durability emblem of Strength -> Bruiser
    emblem of Health -> Power shards of Strength forever. Same for Vendetta, Varg, Issac, Ryth, Ren, Tavi.
  - previous version: Monster Str -> Jungle Hp -> Power Str -> Durability Hp -> Power Str...
- Cassi practically never buys (she almost never captures, so she has no gold); a few Jungle/Monster Focus shards.
- Corners: SHINK farms only the central gem clusters there (0 gold), so it never shops on corners.

## 4. Farming: target choice, opening, capture and tribute

- **Every champion farms on its own** (nearest ally 6.8 tiles, pairwise "within 3 tiles" mostly 0.03-0.3), and
  each camp group is captured by one champion (shared captures 11%).
- Target scoring, fitted on 1364 "start attacking a new group" decisions: the chosen group is the top-ranked one
  52% of the time under `score = gems * (elk ? 0.5 : 1) / (path distance + group hp / 200 + 6)` with groups
  that an ally is already attacking excluded, versus 27% for "nearest group" and 24% for gems/distance. Gold is
  worth nothing in the score: **pure gold-cluster groups and monoliths are never captured** (0 of 750 captures).
  Captured group mix: 1Wolf 311, 1Gem 243, Elk+Gold 234, 2Wolf 214, 2Gem 184, 3Wolf 98, 2Gold+2Gem 96, Elk 66.
- Openings (side-normalised, newest 30): expanse - Vendetta to the 2-gem group at (12,18), C&I to the 2-gem
  group (25,4), Varg to the 2-wolf group at the centre line (41,6); rows - Vendetta, C&I, Ryth on the 3-wolf group
  (18,4), Varg alone to (31,4); packs - Ryth to the near 2-wolf group, Vendetta and Varg to the two central
  gem/gold packs; elkring - Vendetta, Varg, C&I on the nearest elk (26,23), Ryth+Ren on the second one;
  collision - all three to the central wolves (24,18)/(24,22) (skipping the closer own-side wolves); corners -
  all five to the central gem clusters next to the central altar; interlock - Vendetta+Varg to the 3-gem group,
  C&I+Ryth to the near wolf; lanes - C&I+Tavi to the gem column (36,y), Vendetta/Varg/Ryth to the wolves at x=42.
- Camp target inside a group: lowest-hp camp in range 70% (nearest 95%).
- **Tribute after (almost) every capture** at the nearest altar: captures per tribute 1 (72%), 2 (15%), 0 (12%);
  with >= 50 gems carried it never takes a second camp first; with < 25 gems (a lone wolf/gem) it chains another
  capture 37% of the time. Gems per tribute: p10 22, p25 36, p50 44, p75 48, p90 72.

## 5. Recall / retreat

- Recall reasons (570 recalls): hp < 50% 52%, gold (current + reward of the capture in progress) >= 150 ~40%,
  other 8%. Recall hp percentiles 10/25/50/75/90 = 0.20/0.33/0.47/0.76/0.88.
- **Recall-during-capture trick:** 30% of recalls are started while standing on the capture tile of a dead group,
  so the 5-turn recall overlaps the 5-round capture timer; the reward (and gold) arrives just before the
  teleport, the champion shops immediately, then walks the gems to an altar.
- When the champion is within ~10 tiles of spawn it walks home to shop instead of recalling (84 of 88 cases).
- Spawn: stays 1-3 rounds (heals to full in one turn end), always leaves at 100% hp.
- Retreat from a nearby enemy grows with missing hp: P(move away | foe within 6) = 0.19 at full hp, 0.39 at 50%,
  0.56 below 10%. 90% of recalls complete.

## 6. Fighting

- An enemy champion inside attack range is attacked 64% of the time (a camp only 2%), independent of the local
  numbers (allies-minus-enemies within 5: -2 -> 0.70, 0 -> 0.66, +2 -> 0.59). Target = lowest hp (62%) / nearest
  (82%).
- **Chases weakened enemies**: with the nearest foe 2-6 tiles away, P(approach) = 0.57 when the foe has < 40% hp,
  0.26 otherwise; almost never (0.06) when its own hp is < 40%.
- Spells on enemies are rare (Cassi damage 2.2 + stun 1.6, Ryth AoE 2.3, Tavi stun 1.3, Ren stun 1.2 per game).
- Deaths are always to champions (camps practically never kill SHINK), Cassi&Issac die most (1.17/game).

## 7. Ability usage (casts per game)

Vendetta dash 38 (travel, 85% with nothing around) + attack reset 25; Issac dash 29 + reset 16; Ryth reset 15 +
AoE stun on camps 11 (wolf > elk > gems); Varg reset 15 + shield 10 (cast while trading with camps, mostly at high
hp); Cassi stun on camps 14 + damage on camps 13 (all camp types, incl. gem clusters); Ren dash 14 + stun on camps
6 (elk > wolf); Tavi reset 4 + stun on camps 3. Attack resets are cast right after a basic attack.

## 8. Map-specific behaviour and weaknesses

- corners: everyone contests the centre gem clusters; no gold -> no items; 1 win in the last 7 (168-1022 vs Mite).
- expanse: fully spread (pairwise closeness ~0.03); Varg solos 2-wolf groups at the centre line.
- elkring: elk+gold groups solo-farmed by Vendetta (8.8 captures/game) and Varg once items are bought.
- Exploitable: carries gems on every trip to the altar (10.5 gems lost per death), fights while outnumbered,
  never wards, splits up so it can be picked off one at a time.

## 9. Evolution during the day

Draft swaps at ~16h (packs, elkring) and ~18h (collision); item build switched from Monster/Jungle-Hp/Power to
Jungle-Str/Durability-Str/Bruiser-Hp/Power at 20:45. Capture/tribute/recall/fight rates were stable across versions.
