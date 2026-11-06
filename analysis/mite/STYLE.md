# Mite (ladder #1) - play style

Source: `top_replays/1_Mite` (1,235 matches on 2026-10-13, 14:00-21:05 UTC; 215 ranked, 1,020 unranked).
Unless stated otherwise numbers are from the **newest 60 matches** (current bot), cross-checked on the
newest 200 (the profile is stable over the last ~4 hours: captures 22.1, tributes 24.0, gems/tribute
44.7, recalls 18.8, wards 36.9, K 5.25, D 2.27 per game, win rate 96%).
Scripts: `analysis/mite/*.mjs` (all decode replays in memory). Map geometry dumps: `analysis/mite/maps/*.txt`.

## 1. Headline profile (newest 60)

| metric (per game, Mite side) | value |
| --- | --- |
| win rate | 93% (56/60); 96% over newest 200 |
| avg rounds | 457 (game usually ends by Mite reaching 1,000 gems) |
| avg gem diff | +451 |
| captures | 22.6 (first at round 33) |
| tributes | 23.8, **44.9 gems per tribute** (first at round 50) |
| recalls | 18.4 |
| wards | 37.2 (100% on bush tiles) |
| altar locks / consumables | 0 / 0 (never buys consumables) |
| kills / deaths | 5.35 / 2.27 |
| set_priority calls | 37 |
| attacks on champions / camps | 14% / 86% (6,274 vs 37,525) |
| enemy-half time / grouped (ally within 4) | 0.13 / 0.63 |

## 2. Draft

* Fixed order, truncated to the team size, **no reaction to the opponent or map**:
  `Varg, Vendetta, Cassi&Issac, Willow, Ren` -> 3-pick maps (collision, packs, expanse) get
  Varg/Vendetta/C&I (= 4 bodies), 4-pick maps (interlock, rows) add Willow, 5-pick maps (corners, elkring,
  lanes, monolith) add Ren. 1,190/1,235 matches use exactly this.
* Earliest version (14h) drafted `Varg, Ryth, Willow, C&I, Ren`; Ryth was replaced by Vendetta at ~15h.
* Draft memory is not observable; the opening is deterministic per map+side (identical positions at
  round 20 in every game on the same side), consistent with a plan computed from the map.

## 3. Priorities (turn order inside the team)

* `priority = floor(strength) + 10` (Varg 60, Vendetta 80, Issac 50, Ren 50, Cassi 40); it is updated
  whenever strength changes after shopping (Varg 60 -> 85 after Jungle emblem, -> 115 after Power ...).
  **Willow is always 1** (acts last, after seeing allies move).
* **1000 while hp < ~35%** (set at hp p50 0.31, p90 0.34; 60% of the 30-40% hp bucket and 92-100% below
  30% are in 1000-mode) so a low champion acts first in the round to escape / recall. It returns to the
  normal value once healed (hp 1.0 at spawn, or >~0.6 via Willow).

## 4. Opening & camp choice

* **Own half only.** Captures per group (newest 80 games) show Mite almost never captures a group that is
  closer to the enemy spawn: e.g. lanes `G own33/enemy50` 22.3 per game vs mirror 0.0; rows own-side
  WWW 5.5/4.0/2.1 vs enemy-side 0; elkring 5 own groups 2.9-6.1 vs 0. Contested middle groups
  (corners central GG at 20/22 and 22/20; packs $$GG 17/18, 18/17) are both taken.
* **Gems over gold.** Gold-only clusters are essentially never farmed (0-0.5/game); monoliths never.
  Gem clusters (500 hp, harmless, 24 gems) are the favourite where they exist (lanes 22 captures/game,
  corners GG 9/game, expanse GG 7/game). Camp attack mix: Wolf 51%, Elk 26%, GemCluster 18%, Gold 5%.
* **Opening = everyone to the best nearby group, then split.** Examples (round 20 positions identical in
  every game): packs - all 4 bodies kill the nearest wolf pair, Vendetta captures, the other three walk
  on to the central $$GG; elkring - all 6 kill the nearest $E, then split to the next three $E groups;
  corners - Varg/Vendetta/Cassi/Willow go to the 4 central gem-cluster groups while Issac+Ren take the
  wolf next to spawn; lanes - Varg+Vendetta walk the bottom lane edge (y=0) to the bottom gem clusters /
  elk, the other four walk inside the y=9 bush row to the middle clusters.
* This is reproduced by a value/time rule with a claim penalty: each champion picks
  `(gems + 0.15 gold) / (path + wait + killTime(shared dps) + 5 + 8)`, x0.6 if an ally already claims
  the group (see `chooseTarget` in the mimic).

## 5. Capture & tribute rhythm

* **Captures are solo**: 1,103 of 1,107 captures had exactly one Mite champion on the capture tiles.
  Others leave as soon as the camp dies; the capturer stands still 5 rounds.
* **Tribute after almost every capture**: after a gem gain the next event is a tribute 60-90% of the
  time (packs 90%, collision 89%, interlock 88%, elkring 80%; lanes/expanse/rows ~50-63% because gem
  clusters sit 2 tiles apart and they chain 2-3 before walking). Gems per tribute: p25 22-24, p50 36-44,
  p75 48, mean 45; peaks at one capture's worth (22/24, 36, 44/48).
* **Altar = nearest to the capture point** (93% rank-0 by distance); median 7 rounds capture->tribute.
* They tribute at hp p50 0.9; tributes are never deliberately stacked for big bags.

## 6. Recall, shopping and the capture-recall trick

* **Low-hp recall**: hp p50 0.32 (p25 0.25, p75 0.34); nearest enemy p10 = 6 tiles -> they first walk out
  of range (retreat 61-78% of low-hp turns with an enemy near) then recall.
* **Shopping recall after a tribute**: after `Gems submitted`, recall happens 63-72% of the time when
  gold >= 150 and **0%** when gold < 150 (n=1,376). Gold at healthy recalls: p25 160, p50 180-195.
* **Capture-recall trick**: 143 recalls were started *while standing on a capture tile*; the capture
  (5 rounds) completes before the recall (5 turn ends), so the champion arrives at spawn with the
  reward and shops immediately. Dominant on rows (108) and expanse (29) where captures pay 90-270 gold
  and spawn->camp paths are long.
* **Cassi/Issac recall together**: 49 healthy C&I recalls happen exactly when the partner is low
  (partner hp 16-35%) - linked fate, both go home.
* **Arrive-and-heal**: recall arrives at turn start; they stay on spawn that turn (heal to full).

## 7. Item builds (spend everything, 30 g shards, emblems completed in order)

* Strength champions (Varg, Vendetta, Issac, Ren, Willow): **Jungle:Str first in 100% of games**
  (30% less camp damage - they farm elks/wolves solo). Then, depending on map contact distance:
  * spawn-to-spawn path <= ~50 (corners, packs, collision, elkring, monolith, interlock):
    `Jungle:Str > Durability:Str > Bruiser:Health > Power:Str x N` (Durability second 139/139 games).
  * long maps (expanse 85, lanes 81, rows 73): `Jungle:Str > Power:Str > Durability:Str > Bruiser:Health > Power...`
    (Power second 75/75 games).
* Cassi: Jungle:Focus (> Durability:Focus); Willow rarely has gold (63% of games buy nothing).
* Shop trips: 262 for Varg in 60 games, gold before shopping p50 200 -> spend to < 30 left.
* First emblem: Vendetta p50 round 111, Varg 118 (p10 34-44 on small maps).

## 8. Abilities

| champion | usage (60 games) | rule |
| --- | --- | --- |
| Varg | AttackReset 1,197, Shield 1,164 | reset on the first swing of a fight (double hit), shield on the very next turn; both vs camps (74%) and champions; cycle every 8 turns while fighting |
| Vendetta | AttackReset 1,496, Dash 1,596 | reset in fights; **dash 75% while travelling** (no attack that round) = +2 tiles every 8 turns |
| Issac | AttackReset 1,381, Dash 1,514 | same as Vendetta |
| Ren | Cc (dmg+stun) 584, Dash 658 | stun-damage mostly on camps (Elk > GemCluster > Wolf) and on champions in range 4; dash for travel |
| Cassi | Damage 1,750, Cc 273 | 2x focus nuke on camps (Wolf/Gem/Elk) and champions; **stun only on champions** (enemy within 4) |
| Willow | Heal 815, AttackReset 958 | heal the ally with the most missing hp in range (95%), missing hp p5 180, p50 300; reset in fights |

## 9. Fighting

* Enemy champion in attack range always beats camps (95% of attack opportunities with both available).
* Melee: in range -> attack 90%; at distance 2 -> step in and hit 55%; distance 3 -> approach 50%;
  distance 4 -> approach 42%, retreat 29%. Low hp (<40%) -> retreat 61%.
* Ranged: attack 55-64% at d<=3, rarely approach; low hp -> retreat 78%.
* Target among several in range: lowest hp / carrying most gems (lowest absolute hp 71%, most gems 85%,
  lowest hp fraction 75%).
* Deaths: 94 by champions, 10 by camps in 60 games; median gems lost 0 (they bank fast).
* Numbers advantage barely changes behaviour; they do not dive the enemy half (13% of time there).

## 10. Wards

* 37/game, **100% on bush tiles**, mostly at placement range 2 ahead of the champion (`dSelf` 3 measured
  from round start), only when the previous ward is >= 7 tiles away (p10 of distance to previous ward = 7,
  median 10, median gap 22 rounds). About half are within 4 tiles of a camp. On bush-heavy lanes they
  walk inside the bush row and drop wards along it.

## 11. Team coordination

* Willow escorts Cassi (Willow's nearest ally is Cassi within 3 tiles 52% of samples; pair median
  distance 2). Everyone else spreads (pair medians 6-11 tiles) but 63% of the time someone is within 4.
* Coordination must go through the 8-byte shared memory (vision is not shared): consistent with one
  byte per champion holding its claimed target / capture / low-hp state.

## 12. Evolution over the day

| hour | draft | first emblem | wards | priority sets | win |
| --- | --- | --- | --- | --- | --- |
| 14h | Varg, Ryth, Willow, C&I, Ren | Power:Str | 0 | 1,258 (every turn) | 67% |
| 15h | Varg, Vendetta, C&I, ... | Jungle:Str | 0 | 1,400 | 67% |
| 16-17h | same | Jungle | 0 | 35-355 | 71-81% |
| 18h+ | same | Jungle | 32-35 | 35-40 | 92-100% |

Main improvements over time: Jungle-first (solo camp farming), priority only on change + 1000 when low,
wards on bushes (18h), stable since ~18h.

## 13. Map-specific notes

* lanes (90x30): left half only; bottom + middle lanes; walks inside the y=9 bush row; gem clusters chained.
* rows: own three WWW triples; capture-recall trick (270 gold per capture); altar far behind walls -> bags of 66-132.
* expanse: own GG + wolves; capture-recall trick; Power second.
* corners: central GG (both pairs) + own elks/wolves; many fights in the centre.
* packs: own wolf pairs + both central $$GG; fights in the centre.
* elkring: own five $E groups only.
* monolith: never touches the monolith; wolves/elk on own side.
