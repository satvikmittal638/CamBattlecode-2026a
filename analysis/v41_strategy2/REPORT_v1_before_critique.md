# v41 strategy research pass 2 (research only; no bot edits, no platform calls)

## Scope and data
- **Discovery set:** 50 platform probe games (`platform/probe_v41`, engine 1.0.1, our side v41 in all 200 probe
  games). Opponents: Fish r1, :3 r2, Trzy Kwaterki r7, Tartarus r12, Bamboo Teahouse r30, 10 games each, 25 maps.
  v41 won 7.
- **Held-out set:** every 5th `platform/v41_ranked` game in creation-time order (outcome-blind rule), 29 games,
  near our rating. v41 won 20. Not pooled with the teammate batch.
- **Opponent identity:** team name and timestamp only; their submission versions are unknown. Local mimic bots are
  not evidence of top-team play.
- **Excluded:** `corpus_fish` (engine v0_0_3, old balance).
- **Vision is personal** (GameRules: own sight and own ward; teammates' vision is not shared). The only "certified
  awareness" used here is the champion's own successful basic `Attack` on an enemy. Coordinate-resolved casts are
  not proof. Any proposed trigger uses only live, SDK-visible state of the acting champion.
- **Scripts:** `q_core.mjs`, `trace.mjs`, `econ_checkpoint.mjs`. Logs: `discovery_q_core.log`, `heldout_q_core.log`,
  `traces.log`, `econ_checkpoint.log`.

## Descriptive hypotheses (locked in `HYPOTHESES_LOCKED.md` before held-out): all three FAILED as stated
| Hypothesis | Discovery | Held-out | Verdict |
|---|---|---|---|
| **H1 items:** opponents' Bruiser share of positive item-delta entries ≥ 2× ours, and opposing Heart of Ruin > 50% | 60.4% vs 6.2%; Heart of Ruin 63.5% | 27.7% vs 4.3%; Heart of Ruin 41.0% | **Failed** (Heart of Ruin condition) |
| **H2 banking:** their median tribute bag ≥ ours + 5, and their tribute starts ≥ ours | 25 vs 15; 34.4 vs 26.1 | 22 vs 18; 18.7 vs 30.6 | **Failed** |
| **H3 inactive deaths:** "no action" proxy share ≥ ours + 5 points | 21% vs 14% | 20% vs 18% | **Failed** |

Caveats on these measures:
- **Item-delta entries are not quantities or gold:** purchases are batched, and an emblem conversion adds one
  entry while removing shards.
- **"No action" is a last own-turn proxy,** not stun or bot state.
- **Kill counts:** team native kills (discovery: us 166, them 800) are kept separate from body deaths (889 vs 246).
  Steps where enemy kill-counter increments < deaths are labelled ambiguous.

## Trace windows (`traces.log`)
State is read at the first step of each round; inventories at the first step of the death round. HP is our
champion's own (always observable).
| Replay / team / side | Focus, rounds | Facts | Spend: ours vs hitter's |
|---|---|---|---|
| `00lanes/r1_317c4eed…` Fish, a | our Ren #2, r608–614 | Dash away at 36% HP. At 13% (r609) starts a 5-turn recall in place. Enemy Stellar arrives at r614 and kills it with a basic attack plus a cast. | 330 vs 1,050 |
| `00lanes/r7_c67a088a…` Trzy Kwaterki, a | our Ryth #3, r599–605 | Trades basic attacks one-on-one with enemy Ryth from 63% to 24%, moves away, is stunned at r604, dies at r605. | 60 vs 660 |
| `00lanes/r12_d8fcbc40…` Tartarus, b | our Ren #8, r813–819 | Casts CC on Marcella at 100% HP and trades. At r819 is stunned at 92% and killed in the same round by Marcella and Willow (burst). | 240 vs 1,200 |
| `01the_farm/r2_86c09785…` :3, a | our Heart of Ruin #0, r460–466 | At 70% HP carrying 37 gems, dashes in and attacks enemy Heart of Ruin over r462–465. Dies in r466 from 70% at round start (burst). | 720 (health eq 0) vs 1,920 (health eq 21) |
| **Counterexample** `00rushbait_v2/r30_cae74fe4…` Bamboo, a (v41 **won**) | enemy Varg #5, r670–676 | Our Ryth and Ren kill a fleeing Varg two-on-one. | 480 / 390 vs 360 |

Three of the five windows are on lanes, our stall map. They are examples only, not frequencies.

## Spend vs income (`econ_checkpoint.log`)
At rounds 300/600/900, unspent gold is small for both sides (25–60g per alive champion). At r600 on non-lanes maps,
our spend per alive champion is 463g against their 695g (discovery, top teams), but 587g against 384g in the
held-out set, where v41 wins. This is **consistent with an income gap** (we earn less against top teams) rather than
hoarding. It is not proof that shop timing is irrelevant. The figures are biased: only alive bodies are counted, only
games that last that long, consumables are excluded, and Tavi sales can change valuation.

## Low-fuel combat fallback, assessed
**What the code does.** When `tacticalFight` returns −1, `fightChampions` (bot.cpp:901) falls back to the older
HP-only approach and attack (bot.cpp:960). `tacticalFight` returns −1 when:
- fuel is below 60k at entry (v1_tactical.h:50);
- a partial-collection guard trips;
- fuel is below 28k (:81) or below 23k (:170).

**Evidence.** In the only instrumented trace (`s2b_smoke`, one diverged lanes game against v27), fight turns were 15
tactical and 1 fallback. Fuel after the knowledge refresh on those turns was p10 63k, never below 60k. Platform logs
lack stage labels, so the question is **unresolved**, but there is no evidence to prioritise it.

## Ranked next experiments (none implemented; all require their own ablation)

### 1. Health in Heart of Ruin's build (strongest: mechanism plus replicated style)
- **Evidence:**
  - Opposing teams' Bruiser share is 6–10× ours in both sets (descriptive only; H1's Heart of Ruin threshold
    failed).
  - The the_farm and lanes windows show our dying champions with 0–10 health shard-equivalents against enemies
    with 10–21.
- **Rules:**
  - Heart of Ruin gains +100 HP per health shard on 1000 base HP.
  - A Bruiser Emblem of Health gives +500 HP (+50%) plus +4 Strength and +12 Focus.
  - v41's second emblem, Durability Focus, gives +60 Focus and −10% incoming damage (about +11% effective HP).
- **Code:** bot.cpp:362. The Heart of Ruin plan `{{4,1,5},{2,1,5},{1,1,1000}}` (Jungle Focus, then Durability
  Focus, then Power Focus) has no Health.
- **Change:** a default-off switch, `X_HORHEALTH`, that changes the plan to `{{4,1,5},{6,2,5},{1,1,1000}}`: keep
  Jungle Focus first, make the second emblem Bruiser Health. No new fuel cost (same shop loop) and no visibility
  needs.
- **Risks:** less Focus means a smaller Shield (1.5 × Focus) and dash damage, so slower camp clears and less burst.
  The missing-health damage passive interacts with a larger HP pool. Counter-evidence: Fish's Stellar bought mostly
  Power Focus, so Health isn't universal among top teams.
- **Ablation:** off/on on the local 350-game field, both sides; off control must reproduce v41.
- **Pass:**
  - Heart of Ruin deaths per game fall by ≥ 10%.
  - Total deaths per game don't rise.
  - Capture income doesn't fall by more than 3%.
  - Paired discordants are not net-negative overall or on any map group by more than 2.
- **Fail:** any of those violated.
- **If local passes:** a platform paired run against a concurrent v41 control (requires your approval).

### 2. Don't start a dash-in or approach on a target whose visible stats dominate ours (medium; small sample)
- **Evidence:** the the_farm and lanes Ryth windows: v41 initiated or continued trades against much stronger targets.
  The SDK exposes visible enemies' `champion_info` (health/max_health/strength/focus) to the acting champion, so this
  needs no hindsight.
- **Code:** in v1_tactical.h, `consider()` for move candidates (walking loop at :165) and Heart of Ruin's
  heart-control dash block. Today's value is one-turn dealt minus danger.
- **Change:** a default-off switch that adds an initiation penalty only for **moves or dashes toward** a target
  whose effective power `hp × (str + 0.6 × foc)` exceeds ours by more than 1.5×, when no ally is engaged (personal
  vision of allies only). Attacks already in range are not blocked, and there is no proactive retreat.
- **Difference from `X_THREAT`:** `X_THREAT` (`outgunnedIsolated`) retreats whenever a power ratio fires and regressed
  by 16–19 of 210 games. This only removes uninformed initiation.
- **Risks:** fewer kills, lost contested camps, threshold sensitivity (single predeclared value 1.5×, no sweep).
- **Unknown:** how often the trigger fires in successful fights (not measured).
- **Pass:** v41 deaths per game fall by ≥ 5%, kills per game don't fall by more than 5%, capture income is not
  lower, and paired discordants are not net-negative.
- **Fail:** otherwise.

### 3. Recall-channel exposure (low upside)
- **Evidence:** the Fish/Ren window: a recall started at 13% HP with no enemy in personal sight, and the champion was
  killed on the last channel turn. Deaths whose last own-turn proxy was "recalling": 29/889 (3%) for us vs 5/246 (2%)
  in discovery; 11/357 (3%) vs 8/486 (2%) held-out. Small.
- **Code:** `handleLowHp` (bot.cpp:828–836) recalls when no threat is within 6 tiles of personal vision.
- **Possible change:** if the champion took champion damage within the last N own turns (its own HP history), walk
  toward spawn instead of channelling. That requires per-instance memory.
- **Risks:** slower healing and lost recall time.
- **Status:** deprioritised.

### Not supported by evidence
No specific economic allocation candidate beyond the earlier stall work (the experimental fallback). The income gap
against top teams is not tied to one allocation defect in this sample.

## Limits
- **Samples:** small (50 + 29), from short time windows, against unknown opponent versions.
- **Kind of evidence:** traces are illustrations, and correlations are not causal effects.
- **Lanes:** three of five windows are on lanes.
- **Data quality:** checkpoint economics have survivor and length bias. Instrumented-run evidence comes from one
  diverged game.
- **Not done:** no candidate was implemented or tested. The bot remains v41.
