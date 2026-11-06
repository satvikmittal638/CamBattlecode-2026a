# v41 strategy research pass 2 (research only; no bot edits, no platform calls)
The earlier version of this report is preserved as `REPORT_v1_before_critique.md`.

## Scope and data
- **Discovery set:** 50 platform probe games, `platform/probe_v41/games/index.json` (engine 1.0.1; our side is v41
  in all 200 probe games). Opponents: Fish r1, :3 r2, Trzy Kwaterki r7, Tartarus r12, Bamboo Teahouse r30, 10 games
  each, 25 maps. v41 won 7.
- **Held-out set:** every 5th game of `platform/v41_ranked/games/index.json` in creation-time order (an outcome-blind
  rule), 29 games near our rating; v41 won 20. Not pooled with the teammate batch.
- **Opponent identity:** team name and timestamp only; their submission versions are unknown. Local mimic bots are
  not evidence of top-team play. `corpus_fish` (engine v0_0_3) is excluded.
- **Vision is personal** (GameRules: own sight and own ward only). "Certified awareness" means only the champion's
  own successful basic `Attack` on an enemy. Coordinate-resolved casts are not proof. Proposed triggers may use only
  the acting champion's live, SDK-visible state.
- **Scripts:** `q_core.mjs`, `trace.mjs`, `econ_checkpoint.mjs`. Logs: `discovery_q_core.log`, `heldout_q_core.log`,
  `traces.log`, `econ_checkpoint.log`.

## Descriptive hypotheses (locked in `HYPOTHESES_LOCKED.md` before held-out): all three FAILED as stated
| Hypothesis | Discovery | Held-out | Verdict |
|---|---|---|---|
| **H1 items:** opponents' Bruiser share of positive item-delta entries ≥ 2× ours, and opposing Heart of Ruin > 50% | 60.4% vs 6.2%; Heart of Ruin 63.5% | 27.7% vs 4.3%; Heart of Ruin 41.0% | **Failed** (Heart of Ruin condition) |
| **H2 banking:** their median tribute bag ≥ ours + 5, and their tribute starts ≥ ours | 25 vs 15; 34.4 vs 26.1 | 22 vs 18; 18.7 vs 30.6 | **Failed** |
| **H3 inactive deaths:** OUR "no action" proxy share ≥ THEIRS + 5 points | 21% vs 14% | 20% vs 18% | **Failed** |

These are descriptive style comparisons, not tests of whether a change improves v41. Caveats:
- **Item-delta entries are not quantities or gold:** purchases are batched, and an emblem conversion adds one entry
  while removing shards.
- **"No action" is a last own-turn proxy,** not stun or bot state.
- **Kill counts:** team native kills (discovery: us 166, them 800) are kept separate from body deaths (889 vs 246).
  Steps where enemy kill-counter increments < deaths are labelled ambiguous.

## Trace windows (`traces.log`)
All paths are under `platform/probe_v41/games/`. State is read at the first step of each round; inventories at the
first step of the death round, not the exact lethal step. Entity IDs are replay champion indices. The windows list
attack sequences only; first contact and aggressor are not established (no prior-distance context).

- **Fish r1, side a, loss 398–1013** — `00lanes/r1_317c4eed-d022-45a3-83d9-491861aa5cb0.repl26a`
  - **Focus:** our Ren #2, dies r614.
  - **Facts:**
    - r608: at 36% HP, moves and casts Dash.
    - r609: at 13%, starts a Recall.
    - r610–613: no own actions.
    - r614: enemy Stellar #5 resolves a basic Attack and a Damage cast on it.
  - **Not established:** whether an enemy was in Ren's sight when it recalled, and whether the outcome was avoidable.
  - **Spend:** ours 330g; enemy Stellar #5 1,050g.
- **Trzy Kwaterki r7, side a, loss 490–1001** — `00lanes/r7_c67a088a-55d7-4ccf-ba0a-3f8d991c2e6e.repl26a`
  - **Focus:** our Ryth #3, dies r605.
  - **Facts:**
    - r599–602: basic Attacks exchanged with enemy Ryth #9 (our HP 63% → 32%).
    - r602–603: moves.
    - r604: stunned at 4%.
    - r605: Ryth #9 basic Attack.
  - **Spend:** ours 60g; enemy Ryth #9 660g.
- **Tartarus r12, side b, loss 209–1012** — `00lanes/r12_d8fcbc40-8221-460a-be95-24f39d897262.repl26a`
  - **Focus:** our Ren #8, dies r819.
  - **Facts:**
    - r815: casts CC targeting Marcella #4.
    - r817–818: basic attack exchanges with Marcella #4.
    - r819: stunned at 92%, hit by Marcella #4 (Attack plus a coordinate-resolved cast) and Willow #5 (2 Attacks)
      in the same round.
  - **Spend:** ours 240g; Marcella #4 1,200g; Willow #5 450g.
- **:3 r2, side a, loss 170–1018** — `01the_farm/r2_86c09785-2c55-4dbb-b2a6-e9b2244ee40e.repl26a`
  - **Focus:** our Heart of Ruin #0 (37 gems), dies r466.
  - **Facts:**
    - r462: casts Dash, then a basic Attack on enemy Heart of Ruin #3.
    - r463–465: Attacks continue; r464: Heart of Ruin #3 basic Attack.
    - r466: dies from 70% HP at round start.
  - **Inventory, stat shard-equivalents:** ours 720g (focus 26, health 0); Heart of Ruin #3 1,920g (focus 51,
    health 21).
- **Counterexample: Bamboo r30, side a, v41 win 1023–886** —
  `00rushbait_v2/r30_cae74fe4-fee5-40cc-bc70-2e139b3a09b6.repl26a`
  - **Focus:** enemy Varg #5, dies r676.
  - **Facts:** our Ryth #3 and Ren #2 basic-attack it over r670–676 while it moves away.
  - **Spend:** ours 480g and 390g; Varg #5 360g.

Three of the five windows are on lanes. They are illustrations, not frequencies.

## Spend vs income (`econ_checkpoint.log`)
At rounds 300/600/900, unspent gold is small for both sides (25–60g per alive champion). At r600 on non-lanes maps,
our spend per alive champion is 463g against their 695g (discovery, top teams), but 587g against 384g in the
held-out set, where v41 wins. This is **consistent with an income gap**. It does not prove shop timing irrelevant or
that spending merely tracks winning. Biases: only alive bodies are counted, only games that last that long,
consumables are excluded, and Tavi sales can change valuation.

## Low-fuel and no-plan fallback, assessed
**What the code does.** `tacticalFight` evaluates candidate actions against up to two target choices. Each scores:
- damage dealt plus a half-weighted future attack;
- support credit;
- minus danger from enemy responses over two ticks (×1.1, or ×1.7 when carrying gems), adjusted for retaliation and
  shields;
- a kill bonus and a move penalty.

It returns −1 on its fuel guards (v1_tactical.h:50 below 60k; partial-collection guards; :81 below 28k; :170 below
23k) **and when no profitable plan exists** (:194). On −1, `fightChampions` (bot.cpp:901) falls back to the older
HP-only approach and attack (bot.cpp:960).

**Evidence.** In one instrumented, behaviour-altered lanes game (`s2b_smoke`), turns whose final stage label was a
tactical action numbered 15, versus 1 with the fallback `fight` label. Labels can persist, and the action filter was
unused. This is **weak local support only**: it does not certify branch frequencies or rule out low-fuel risk on the
platform.

## Ranked next experiments
None are implemented. All acceptance thresholds are **proposed prospectively, not validated retrospectively**.

### Acceptance rules common to all candidates
- **Complete results:** zero faults and zero errors.
- **Off-control reproducibility:** the switch-off build reproduces the v41 baseline (350/350 identical).
- **Positive overall paired wins:** gained > lost.
- **Fixed strata:** stall maps (lanes / rushbait_v2 / yellow_brick_road), the six s5 regression maps, the other
  maps, and each opponent. No stratum may be net-negative by more than 2.
- **Mechanism metrics are necessary but never sufficient:** survival or proxy gains alone cannot qualify a
  candidate.
- **If local passes:** a platform paired run against a concurrent v41 control (requires approval).

### 1. More Health in Heart of Ruin's second emblem (strongest; mechanism plus replicated style; causality untested)
- **Code:** bot.cpp:362. The Heart of Ruin plan `{{4,1,5},{2,1,5},{1,1,1000}}` (Jungle Focus, then Durability Focus,
  then open-ended Power Focus) contains no Health items.
- **Rules:** Heart of Ruin has Health 1000 (+100 per shard), Strength 40 (+4), Focus 100 (+12); Shield = 1.5 × Focus;
  dash = 1.75 × Focus before the missing-health bonus.
- **Proposed first ablation, `X_HORHEALTH` (default off):** second emblem **Durability Health**
  `{{4,1,5},{2,2,5},{1,1,1000}}`.
  - **Change for the same 150g:** +500 max HP, −60 Focus (Shield −90, dash −105 before scaling).
  - **Unchanged:** the Durability −10% damage passive.
  - **Why this one first:** it isolates the HP-for-Focus trade.
- **Separate alternative, not bundled, not tested:** **Bruiser Health** `{{4,1,5},{6,2,5},{1,1,1000}}`.
  - **Change for the same 150g:** +500 HP, +4 Strength, −48 Focus (Shield −72, dash −84).
  - **Lost:** the Durability passive.
  - **Use only as a second, separate ablation.**
- **Evidence:**
  - The opposing Bruiser share is 6–10× ours in both sets (descriptive; H1 failed).
  - In one :3 window our Heart of Ruin (health equivalent 0) died to one with health equivalent 21.
- **Counterevidence:** Fish's Stellar #5 bought mostly Power Focus; Health is not universal among top teams.
- **Cost:** same shop loop, so little overhead is expected; unmeasured.
- **Risks:** a smaller Shield and dash means slower camp clears and less burst. The missing-health passive
  interacts with a larger HP pool.
- **Mechanism checks (necessary, not sufficient):** Heart of Ruin deaths per game fall; total capture income doesn't
  fall by more than 3%.

### 2. Initiation gate against visibly dominant targets (medium; small sample; not experiment-ready until designed)
- **Evidence:** attack sequences (not certified first aggression) in the :3 Heart of Ruin and Trzy Kwaterki Ryth
  windows, against much stronger targets. Visible enemies' `champion_info` (health/max_health/strength/focus) is
  available to the acting champion via the SDK, so this needs no hindsight.
- **Code:** `consider()` move candidates (v1_tactical.h walking loop at :165) and the Heart of Ruin heart-control
  dash.
- **Design requirement:** the gate must not fall through to the older chase (bot.cpp:960) when it removes the best
  plan. Either gate that branch under the same condition, or return a distinct "handled, no initiation" result.
- **Difference from `X_THREAT`:** `X_THREAT` retreats globally; local `local_eval/fishx/ablation3.txt` scored
  134–137/210 against base 153 on an older fishx source and field. This gate would only remove moves and dashes
  toward a target whose visible effective power exceeds ours by more than 1.5× (one predeclared value) while no
  ally is engaged in our own sight.
- **Not measured:** how often it would trigger in fights we win.
- **Risks:** fewer kills, lost contested camps.

### 3. Recall-channel exposure (low priority; not experiment-ready)
- **Evidence:** deaths whose last own-turn proxy was "recalling": 29/889 (3%) for us vs 5/246 (2%) in discovery;
  11/357 (3%) vs 8/486 (2%) held-out. One window: the Fish r1 Ren #2 recall at 13% HP, killed at r614.
- **Code:** `handleLowHp` (bot.cpp:828–836) recalls when no visible threat is within 6, while sight extends to 8.
- **A possible trigger:** an observed own-HP drop in recent own turns. HP history detects HP loss, not who caused
  it.
- **Not established:** the exact call site, the visibility at that moment, and avoidability.

### Not supported by evidence
No specific economic allocation candidate beyond the earlier stall work (the experimental fallback).

## Limits
- **Samples:** small (50 + 29), from short windows, against unknown opponent versions.
- **Kind of evidence:** traces are illustrations; correlations are not causal effects.
- **Lanes:** three of five windows are on lanes.
- **Data quality:** checkpoint economics have survivor and length bias, and instrumented evidence comes from one
  altered game.
- **Not done:** no candidate was implemented or tested. The bot remains v41.
