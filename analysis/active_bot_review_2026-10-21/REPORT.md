# Active teammate bot v43: code and rules review

## Verdict

**I found no evidence of map-name, opponent-ID, replay, or fixed-route memorization. I would not label v43 overfitted from this code inspection.** It is a hand-written policy with fixed draft lists, item builds, scoring weights and compute thresholds. Those are hardcoded decisions, but their existence does not establish overfitting.

There are useful general changes, particularly the SDK-driven ability metadata and lower-budget camp selection. There are also concrete weaknesses: an inherited Monolith-range assumption contradicts the current rules; an inherited boss-finishing policy depends on somebody else damaging the boss; and the reward-allocation policy does not give the newly drafted Vesper Vale a distinct economic priority. None of these requires assuming the teammate overfitted the bot.

This is a source and rules review, not a performance verdict. No bot code, active submission, tooling or matches were changed. Only downloaded source copies and review artifacts were created in this directory.

## What was actually reviewed

- Active submission at the initial GET, **21 October 2026, 18:57:37 IST / 13:27:37 UTC**: **v43**, `2c5badec-d519-4cbb-a0ad-dd893de3b8ea`, uploaded by `70410a67-73c5-4450-9634-694d274525b1` at `2026-10-21T12:54:56.833Z`.
- Rechecked at **19:04:05 IST / 13:34:05 UTC**: v43 was still active, selected and pinned. These fields establish account state; `uploadedBy` identifies the source uploader, not the author of a later activation.
- Downloaded all **25 v43 source files** and all **24 files of our submitted v42**, `dd3cdbe4-b181-481f-ba19-f7303bf17a37`, using `tools/fetch_submission.mjs`.
- Downloaded v42 is byte-identical to our exact tested candidate, `workspace/bots/fe50778c-hh/src`.
- Also compared with the previously fetched v41 source, `analysis/v41_teammate/v41/src`.
- Reread the current [game rules](../../docs/official/GameRules.md), the relevant C++ API documentation, current patch notes and SDK layouts used by the new metadata cache.

Evidence: [initial platform state](submissions_at_fetch.json), [final active check](active_recheck.json), [per-file hashes and comparisons](comparison.json), [complete v42 → v43 diff](v42_to_v43.diff).

Relative to v42, **7 files changed, 1 was added, 17 are byte-identical, and none were removed**. Relative to v41, 6 files changed, 1 was added and 18 are identical. All six files under `src/boss/`, plus `boss_main.cpp`, are unchanged from v42 and v41.

## Changes from our v42

### 1. Ordinary draft replaces Stellar/Ren with Tavi/Vesper Vale

Actual enabled five-pick order:

| | Picks in order |
| --- | --- |
| v42 | Heart of Ruin, Stellar, Ren, Ryth, Varg |
| v43 | Heart of Ruin, Tavi, Vesper Vale, Ryth, Varg |

For ordinary three-pick maps the corresponding first three picks apply, except when computed spawn-to-spawn walking distance exceeds 60: that list selects **Heart, Tavi, Varg** in v43, versus Heart, Stellar, Varg in v42.

The separate mandatory-altar-gate draft remains **Heart, Stellar, Tavi, Prism, Ren**. The boss-only draft remains **Tavi, Stellar, Cassi & Issac, Prism, Ren**. Thus the substitution is not applied to every map class.

Code: [draft.cpp](v43/src/draft.cpp), lines 56–80; [boss draft](v43/src/boss/draft.cpp), lines 50–65.

This choice has a plausible rules-based rationale: patch 1.0.2 reduces Stellar to 650 starting HP / 70 Focus and Ren's stun damage to 0.75 × Focus, while Tavi has 900 HP / 110 Focus and Vesper has 1000 HP / 55 Strength. That makes the substitution reasonable to test; it does not prove the new team is stronger.

### 2. Ability estimates now read the engine's champion designs

The new [v1_kit.h](v43/src/v1_kit.h), lines 3–37, queries `sdk_champion_design` and caches each champion's immutable ability definitions. Current health, Focus, cooldowns and shields are still read from live state.

The main camp-clear estimate, `myDps()`, and enemy spell/reset estimates use these definitions instead of several manually encoded champion multipliers and slot mappings. For example, Ren's old 1.25 multiplier in these estimates is replaced by the engine's value. Heart's camp-clear estimate no longer assumes a 1.75 dash coefficient.

This **reduces patch-sensitive hardcoding**. It does not turn the planner into an exact simulator: the eight-turn amortization, approximate enemy responses, some champion-specific passives and the separate boss planner remain specialized.

Code: [bot.cpp](v43/src/bot.cpp), lines 781–783; [v1_cycle.h](v43/src/v1_cycle.h), lines 41–65; [v1_tactical.h](v43/src/v1_tactical.h), lines 8–49. The SDK's `champion_design` structure contains the ability definition and base stats (`workspace/sdk/cpp/imports.h`, lines 273–282).

### 3. Camp observation queries less distant detail

[bot.cpp](v43/src/bot.cpp), lines 267–314, still checks visible group lifecycle states, but skips individual camp HP queries outside the current target, mandatory gate, and a local radius of `attack_range + 1`.

Importantly, skipped groups are marked incompletely scanned. Their partial HP sum is not treated as the whole group's remaining health; scoring falls back to full base health. This is a conservative loss of detail to save fuel, not use of hidden information. The tradeoff is that a nearly dead, visible alternative camp farther away may initially look more expensive than it really is.

### 4. Low-budget target selection is added

In v42, a champion below the 68k full-planner threshold without a usable existing target could return no task. V43 adds `affordableTarget()` with approximately 40k entry / 38k loop reserves. It scores generic camps using travel, reward, estimated clear time, approximate incoming damage and team commitments.

It is invoked when full planning cannot start, after another budget checkpoint, or when the full pass finds no target. It excludes Monoliths and respects stalled-target and ally-capture checks.

Code: [v1_cycle.h](v43/src/v1_cycle.h), lines 1–39, 65 and 162.

This addresses a general failure mode under the rules' 100k C++ fuel budget. The particular reserves and scoring approximations still need profiling and evaluation. The cheaper estimate omits some protections and coordination detail from the full scorer, including equipment mitigation and detailed kill order. That is a tradeoff, not demonstrated overfitting.

### 5. Heart's second emblem returns to v41's Focus build

| | Heart's item sequence |
| --- | --- |
| Our v42 | Jungle Focus → Durability Health → repeated Power Focus |
| v43 | Jungle Focus → Durability Focus → repeated Power Focus |

Code: [v43 shop](v43/src/bot.cpp), line 370, versus [v42 shop](v42/src/bot.cpp), line 362. V43 also removes the `X_HORHEALTH` switch.

Under the current rules, this swap gives **60 more Focus and 500 less maximum HP**, at the same 150-gold emblem cost and the same Durability passive. Holding other factors and the missing-health percentage constant, it adds 90 base shield and 90 base dash landing damage; Heart's missing-health bonus further modifies dash damage.

For illustration, after exactly the first two emblems and no other equipment, v42 has 1500 maximum HP / 160 Focus, whereas v43 has 1000 maximum HP / 220 Focus. This is a survivability versus spell-power tradeoff, not a free upgrade.

Our previous health-build local result favored v42 on engine **1.0.1** (309/350 versus 303/350), with Heart deaths/game 1.22 versus 1.63. That does not settle this choice with the new draft and 1.0.2 balance. Likewise, the existing 7/40 versus 5/40 v42/v41 live pilot is not a v43 comparison.

### 6. A stale build label was added

[main.cpp](v43/src/main.cpp), line 42, prints `build v36-heart33`. The actual downloaded submission is v43. This is a misleading diagnostic label, not a strategy rule or evidence of overfitting.

## Hardcoding and concrete concerns

### A. Inherited Monolith “safe ring” assumption is wrong under current rules

The [rules](../../docs/official/GameRules.md), lines 180–207, specify Monolith range **5** and Strength **200**. Yet:

- [Boss farming](v43/src/boss/bot.cpp), lines 1170–1184, deliberately uses an exactly range-four ring and waits there between casts.
- [Boss scoring](v43/src/boss/bot.cpp), lines 1091–1103, treats the boss clear as taking **zero incoming camp damage**.
- [Mandatory-gate firing tiles](v43/src/v1_bank_access.h), lines 21–23, also form a range-four ring by subtracting radius three from radius four.

A champion four tiles from an awake Monolith is inside its attack range. When visible to it and selected as its nearest target, that champion can take the Monolith's attacks; distance four alone does not supply the claimed safety. Terrain and other tanking champions can change exposure, but the fixed ring does not establish safety.

**Classification:** high-confidence stale rules/model assumption, inherited unchanged. This is more concrete than an accusation of overfitting. A correction needs an actual damage/tanking/positioning model; moving to distance six alone would also put the usual range-four spells out of reach.

### B. Inherited 30%-health boss-finishing rule depends on external damage

Both `X_GATESTEAL` and `X_BOSSSTEAL` are enabled, with `X_STEALFRAC = 0.3` ([flags](v43/src/fishx_features.h), lines 25–27).

- [workBankGate](v43/src/v1_bank_access.h), line 55, refuses to start its gate-opening routine while estimated HP exceeds 30% of total.
- [Boss target selection](v43/src/boss/bot.cpp), lines 1070–1074, excludes a living Monolith above that threshold, even after a caster has enough Focus.

This can be a deliberate denial/steal policy. Its weakness is that, without another source of damage, the routine will not start a full-health boss. If both teams wait and there is no incidental damage, it cannot open that route to gems through this policy; the gold tiebreak can still determine the game.

**Classification:** opponent-behavior-dependent policy and generalization risk; not proof of overfitting. Test against a passive farming opponent as well as one that voluntarily grinds bosses.

### C. Inherited capture priority does not account for Vesper's economic role

With enabled `X_CARRYCAP` and `X_CARRYMODE = 1`, [carryRank](v43/src/bot.cpp), lines 1075–1085, assigns:

- Heart and Tavi: rank 0.
- Varg: rank 3.
- Vesper: default rank 4.

[carryWants](v43/src/bot.cpp), lines 1128–1139, lets a higher-priority, visible, healthy ally claim the reward when it targets the same group and is within three tiles. [farm](v43/src/bot.cpp), lines 1204–1207, can make Vesper leave the capture for that ally.

Vesper's passive grants 33% more gold ([rules](../../docs/official/GameRules.md), line 519). The fixed priority can therefore forgo extra team gold to feed another champion. This might be worthwhile for a strong carry; it is not automatically incorrect. But the new draft was not accompanied by a corresponding change in this economic allocation policy, and the decision is not recomputed from actual marginal combat value or current equipment.

**Classification:** concrete fixed policy newly relevant to the changed draft; impact unmeasured. Compare the existing allocation with a Vesper-aware policy before declaring either superior.

### D. Draft and builds are deliberately fixed, with limited adaptation

The ordinary draft has predetermined orders and a strict spawn-distance cutoff at 60. It does not counterpick from revealed enemy picks. Builds use fixed family/stat sequences, with a few champion/map-class exceptions, rather than comparing the value of every legal item at each purchase.

These are ordinary design choices for a fuel-constrained game. Plausible overfitting checks would include maps near either side of the 60-distance cutoff, different enemy drafts, and independent maps/opponents not used to select the policy. The source does not establish that these checks have been passed or failed.

### E. Other inherited limitations, without overstating their scope

- The regular bank-interruption check in [v1_bank_channel.h](v43/src/v1_bank_channel.h), line 5, applies only to Cassi/Issac on mandatory-gate maps. Neither is in the normal gate draft, so that specific protection does not cover the default gated team. This is incomplete coverage, not a newly introduced v43 change.
- The new enemy response model stores only the highest raw-damage spell per champion ([v1_tactical.h](v43/src/v1_tactical.h), lines 19–24), then checks that spell's cooldown. A weaker spell may be ready while the selected stronger one is cooling down. This remains an approximate response model; the old version also omitted alternative spells for some champions.
- The old fixed `baseDps` table still exists in the main file, but its main-path wrapper has no callers. I did not count that unused table as an active main-path weakness. A similar table is used by the unchanged boss planner for ally commitment estimates.
- Comments mentioning Mite/Fish and the old “Five-pick maps use…” comments do not reliably describe the active draft. Disabled `X_BUILD`, `X_THREAT`, `X_BANK` and `X_RALLY` branches were not treated as enabled policies.

## Why I do not call this memorized or proven overfitted

The map branches inspect public structure: whether only Monolith groups yield gems, whether altar approach tiles are occupied by a Monolith group, and computed spawn distances. Walls, spawns, altars, group membership, camp base stats and routes are obtained from the SDK. They do not identify a named map and load a prerecorded route.

I found no opponent identity lookup, match/replay ID table, fixed-coordinate opening script or result-dependent test switch. The fixed 13 champion / 42 item capacities correspond to the current SDK roster and item enum; the 251-group draft limit follows from fitting 20 + 4 × groups bytes inside 1024 bytes of draft memory. Those are representation constraints, not evidence of memorized games.

The new camp observation code and tactical enemy collection use personal vision. Shared team commitments are advisory. I found no new reliance on replay-omniscient enemy state in the diff. Static public map analysis during draft is explicitly permitted by the rules.

Statistical overfitting would require evidence that choices selected on development games fail to generalize to independent conditions. That evidence is not supplied by the source diff. Equally, absence of a lookup table does not prove that every tuned threshold generalizes.

## What I would validate next

1. Address the range-four/Monolith-range-five inconsistency first; verify behavior against real current-engine camp ranges.
2. Evaluate **v41, v42 and v43 on the same current engine**, then isolate draft replacement, reduced scanning/fallback and Heart emblem choice. V43 changes these together, so an overall win difference cannot identify which change helped.
3. Test the boss-finishing policy against passive and aggressive opponents, and the capture policy with/without Vesper economic priority. Measure tributed gems, deaths, capture income, idle turns and bot/fuel errors, not only wins.
4. Freeze policies before an independent set of maps/opponents, play both sides, and check every live match's actual submission and engine version. No new matches or code changes were performed for this review.
