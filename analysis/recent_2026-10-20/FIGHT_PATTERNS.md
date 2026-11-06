# Top-2 fight patterns vs our v21 (2026-10-20)

**Data.** Ladder on 2026-10-20: #1 **Intercontinental Fish** (2308), #2 **Univardisty of Shingtonwash** (2102). We are #145 of 710 (1644) with submission **v21** (active, pinned; source in `workspace/bots/v21/`).
- Top teams: 136 most recent current-patch (0.0.3) matches each, 8 per map on all 17 pool maps (`replays_recent/1_*`, `2_*`).
- v21: 102 matches, 6 per map (`replays_recent/0_*`).

The top teams mostly play other top-rated teams, while v21 plays mid-ladder opponents. So every gap below understates the real difference.

How it was measured (`tools/fight_analysis.mjs`, plus `combo.mjs`, `camp_deaths.mjs`, `per_champion.mjs`, `builds.mjs` in this folder): every champion→enemy-champion attack/cast is clustered into fights (same fight if ≤3 rounds and ≤8 tiles apart). Raw outputs are `fights_*.json(l)`, `combo_*.json`, `campdeaths_*.json`, `perchamp_*.json`, `builds_*.json` and `per_map_table.txt`.

## 1. Headline numbers

| | Fish | Univ | **v21** |
|---|---|---|---|
| Match win rate (sample) | 0.97 | 0.86 | **0.56** |
| Champion kills / deaths per game | 7.4 / 1.2 | 6.4 / 1.6 | **5.4 / 7.1** |
| Fights started by us | 67% | 66% | **43%** |
| Significant fights won | 76% | 69% | **41%** |
| Kill trade when we start a fight | 762 : 81 | 689 : 120 | **338 : 317** |
| Kill trade when they start | 250 : 75 | 186 : 102 | **209 : 408** |
| Damage dealt : taken (champions) | 1.80 | 1.71 | **1.10** |
| Avg fight length (rounds) | 5.3 | 5.3 | **8.7** |
| Rounds to kill a champion (ours / theirs) | 5.3 / 6.8 | 5.4 / 5.7 | **8.0 / 4.8** |
| PvP hits per game | 80 | 81 | **225** |
| Openers that are spells | 84% | 92% | **34%** |
| Champion deaths to camps per game (direct last hit) | 0.37 | 0.20 | **2.03** |
| Wards placed per game | 98 | 368 | **41** |
| Gems per tribute | 68 | 76 | **45** |
| Avg game length (rounds) | 540 | 556 | **707** |

## 2. How the top two fight

### 2.1 Composition and builds: burst casters, nothing else
- **Fish:** Stellar, Cassi & Issac and Ren on almost every map, plus Ryth and Varg when there are 5 picks. On boss-only `contest` and on `stampede`: Stellar / Tavi / Prism / Cassi & Issac / Ren.
- **Univ:** Stellar 100%, Ren 83%, Tavi 77%, Cassi & Issac 77%, Prism 39%. Varg and Ryth only on a few maps.
- **Neither ever drafts Vendetta or Willow.** Every pick except Varg and Issac is a ranged caster with a range-4 stun or a Focus-scaling nuke.
- **Builds go almost entirely into Power Focus on every caster.**
  - Fish's Stellar averages ~8 Power Emblems of Focus (≈40 focus shards); Ren and Prism ~5; Tavi ~12 (after a Treasure Focus emblem).
  - Typical order: 1–3 Durability or Bruiser **Health** shards first, then Power Focus forever.
  - Issac and Varg go Power Strength.
  - Result: Stellar's 2×Focus hit and 1.4×Focus AoE, Ren's 1.25×Focus stun and Tavi's 2.2×Focus stun become lethal burst.

### 2.2 Engagement: spells first, from range 4
- They start two thirds of all fights, and the opener is a spell 84–92% of the time.
- Most common openers:
  - **Fish:** Ren stun, Stellar AoE, Cassi stun, Ryth AoE.
  - **Univ:** Ren stun, Stellar AoE, Tavi stun, Prism AoE.
- They open at **range 4**, the full spell range, outside every basic-attack range: Ren stun at 4 (3.6–5.0 per game), Tavi and Cassi stun at 4, Stellar damage at 4. Melee (Issac) basic attacks only follow.
- Stuns are re-applied on the same target within 2 rounds (stun chains) 11–12% of the time vs v21's 5%.
- Univ re-orders action priority every turn (values >100 most of the time); Fish uses small negative values that change each round. Both decide who acts first each round, presumably the stunner before the nukers. v21's priority is near-static (`strength+10`).

### 2.3 Target choice and opportunism
- **Punish channels.**
  - Univ opens 30% of its fights on a champion that is **recalling** (449 openings in 136 games) or standing on a capture tile (92).
  - Fish: 160 on recalls, 95 on capture tiles, 43 on tributes.
  - Damage cancels recall, and the recaller is low on HP by definition.
  - v21: 43 / 56 / 42.
- **Gem carriers:** Fish's first target carries gems 34% of the time (average 13.6 gems), turning fights into gem swings: Fish steals 55 gems per game and loses 9.
- **Lowest HP in reach:** 63–69% for the top teams (v21 78%, so v21 already focuses low HP). The top teams hit **ranged** targets more often (Univ 52%).

### 2.4 Execution: short, decisive, then leave
- About 5.3 rounds per fight and ~80 PvP hits per game: burst, kill or not, disengage. Fish kills in 5.3 rounds; v21 needs 8.0 and is itself killed in 4.8.
- They usually fight with numbers: 56–62% of their PvP hits come with more allies than enemies within 4 tiles (v21 is similar, so local numbers are not v21's problem; burst is).
- **Disengage early.** Their last action in a fight comes at ~70% HP on average, and they recall in fights at ~38–42% HP. Each top-team champion dies only 0.1–0.8 times per game to champions (most 0.1–0.4).
- Spells are shared between farming and fighting. Most stuns land on camps (next section), but whenever an enemy is in range 4 the stun goes on the enemy first.

### 2.5 Camps are fought like champions
- They **stun camps**: Cassi stun on camps 22 per game (Fish), Ren stun on camps 19 (both), Tavi stun on camps 20 (Univ), Prism stun on camps 5–9. A stunned camp doesn't attack, so they take very little monster damage. Only 0.2–0.37 camp deaths per game.
- **They group for Elks and Monoliths.** Fish's most common Elk attack has 3 allies nearby (48 per game); Monolith attacks always have 3+ allies.
- Opponents of the top teams die to camps 4–4.6 times per game, so the top teams fight next to awake camps and let the camps finish enemies (54% of fights are within 3 tiles of a camp).

### 2.6 Vision, tempo, gems
- **Wards:** Univ relocates its ward almost every turn (368 per game); Fish 98. Spells need visible targets, so this vision is what enables range-4 openers and recall punishes.
- **Bigger bags:** 68–76 gems per tribute, 15–16 tributes per game (v21: 45 gems, 19 tributes). Fewer trips means more time farming and fighting.
- Univ uses altar locks (2.9 per game); Fish never does. Both use teleport crystals about once per game.
- Games end at ~540–556 rounds (v21 707).

### 2.7 Differences between the two
- **Fish:** more AoE (Stellar plus Ryth), a Varg/Issac frontline on 5-pick maps, the best kill trade (7.4 : 1.2), hunts gem carriers.
- **Univ:** more stuns (Tavi and Prism, 23 stuns on champions per game vs 16), extreme vision (368 wards), the most recall punishing, altar locks.

## 3. Map varieties

From `per_map_table.txt`. Columns: win rate, kills/deaths per game, non-PvP deaths per game (camps plus linked Cassi/Issac deaths), share of fights started, fights won, spell-opener share.

| Map | Type | Fish | Univ | **v21** |
|---|---|---|---|---|
| contest 50×50 | 2 Monoliths, 20 gold clusters, boss-only brawl | 0.88, 44/6 | 1.00, 35/4 | **0.17, 26/42, 24 non-PvP deaths** |
| stampede 60×50 | 6 Elk, 28 gold/6 gem clusters, 456 bushes, 610 holes | 1.00, 7/2 | 0.88, 8/3 | **0.17, 3/12, 23 non-PvP (Elks kill v21 6–18 times a game)** |
| swirl 45×30 | 24 Elk + 24 Wolf, 354 holes | 1.00, 11/2 | 1.00, 13/3 | **0.33, 7/13, 11.5 non-PvP** |
| eight 41×30 | 10 Elk, 1 altar | 1.00, 11/1 | 0.88, 10/2 | 0.67, 16/17 |
| pilgrimage 50×65 | 28 gold clusters, 654 holes | 1.00, 3/1 | 1.00, 6/2 | **0.00, 4/6** |
| rushbait_v2 30×80 | 10 Wolf, 8 Elk, 142 holes | 0.88, 2/0 | 1.00, 2/0 | **0.17, 0.5/2.7** |
| interlock 40×40 | 8 Elk, 6 Wolf | 1.00, 7/2 | 1.00, 5/0.5 | 0.33, 4/5 |
| collision, fragment, corners, elkring, packs, monolith | mid-size, mixed | 0.75–1.00 | 0.75–0.88 | 0.50–1.00 |
| ambush 100×100, expanse 80×80, lanes 90×30, rows 50×50 | huge or open: almost no fights | 1.00 | 0.63–1.00 | 0.50–0.83 (fine) |

- **Brawl maps** (contest, eight, swirl, collision, fragment, elkring) decide most games: 7–44 kills per game for the top teams.
- **Elk-heavy maps** (stampede, swirl, eight, interlock, corners) punish solo Elk farming.
- **Huge maps** are farming races where v21 is already competitive.

## 4. What the top two do that v21 does not

References are to `workspace/bots/v21/src/` (main bot) and `src/boss/` (boss-only maps such as contest).

1. **Draft for burst casters** (`draft.cpp` 51–61).
   - v21 takes Varg / Vendetta / Cassi & Issac / Willow / Ren (the Oct-14 Mite team), or Varg / Ryth / Cassi & Issac on 3-pick maps.
   - Both top teams take Stellar plus 2–3 of Ren / Tavi / Prism / Cassi & Issac, with Ryth or Varg as the only melee.
   - v21's Willow contributes 0.19 kills against 1.42 deaths per game. Vendetta 1.06 kills / 1.51 deaths. Issac dies 1.62 times per game and takes Cassi with him (1.69 linked deaths per game).
2. **Build Focus on every caster, including Ren and Tavi** (`bot.cpp` 323–365, `shop()`).
   - `focusUser` covers only Cassi, Stellar and Prism, so the main bot builds **Ren on Strength** (Power Emblem of Strength 2.1, Focus 0.7).
   - v21's Cassi ends most games with almost no items (no purchases in 47 of 102 games); Willow buys almost nothing (none in 60 of 72 games).
   - Top teams: 1–3 Health shards, then Power Focus.
3. **Open fights with spells at range 4** (`fightChampions()`, 771–879).
   - v21 basic-attacks first whenever a target is in attack range (lines 863–873). The range-4 spell opener runs only when nothing is in range **and** the champion hasn't moved (838–843).
   - Melee step in and chase at distance 2–4 (829–836), which produces 8.7-round brawls and 225 PvP hits per game.
   - Top teams: stun or nuke at 4, follow up, finish in ~5 rounds, leave.
4. **Use stuns on camps and group for Elks/Monoliths** (`castOnCamp()` 665–682, `chooseTarget()` 960–1010).
   - v21 deliberately keeps Cassi's stun for champions (line 671).
   - `chooseTarget` only multiplies a dangerous group's score by 0.3 (1003–1004) instead of requiring allies. v21's most common Elk attack is solo (67 per game), and Elks cause 1.55 of v21's 2.03 camp deaths per game.
5. **Disengage earlier** (`handleLowHp()` 711–768).
   - v21 enters low mode below 35% HP and recalls in fights at 31%.
   - Top teams make their last fight action at ~70% HP and recall at ~40%, and rarely die (0.1–0.8, mostly 0.1–0.4, deaths per champion per game).
6. **Punish recalls and captures.**
   - v21's target score is `health - 2*gems` (`pickInRange`, 806–818), with no bonus for a recalling, tributing or capturing enemy.
   - Univ makes 30% of its openings on channelling champions.
7. **Vision** (`placeWard()` 367–388).
   - v21 places a ward only on bush tiles and only when the old ward is ≥7 tiles away (41 per game).
   - Univ re-places one almost every turn (368 per game), Fish 98.
8. **Dynamic priority** (`setPriority()` 307–316). v21 uses static `floor(strength)+10`; the top teams re-order every turn.
9. **Bigger tributes** (`doTribute()` 1013–1049).
   - v21 delays only below 100–120 gems and only for a camp within 5 tiles; it tributes 45 gems per trip vs 68–76.
   - Part of this is forced: v21's carriers die more, and lose 70.7 gems per game to kills.
10. **Contest / boss mode** (`boss/bot.cpp` 810–946).
    - Same team as the top teams (Tavi / Stellar / Cassi & Issac / Prism / Ren) and Focus builds, yet 42 deaths per game against 26 kills, and 1 win in 6.
    - The fight code is the main bot's (attack-first, chase), plus a "rotate out when outnumbered" rule.
    - On contest the top teams kill 35–44 times per game with spell-first fighting around the two Monoliths. Execution, not draft, is the gap.

## 5. Biggest levers, in my estimate of impact

1. **Caster team + Focus builds** (items 1–2). It's a precondition for everything else and cheap to change.
2. **Spell-first range-4 engagement with short fights and early disengage** (items 3, 5). This is the kill-trade gap (5.4 : 7.1 vs 7.4 : 1.2).
3. **Camp stuns + no solo Elks** (item 4). It removes ~1.5–2 deaths per game outright and fixes stampede, swirl and eight.
4. **Contest/boss fight execution** (item 10). A map v21 nearly always loses even with the right team.
5. **Recall/capture punishing, vision and dynamic priority** (items 6–8). These are what the top two use to turn spell range into kills.
6. **Bigger tribute bags** (item 9). Secondary; follows from dying less.

Caveat: these are correlations from replays. Re-measure each change on local matches against the mimic bots, then on the platform.
