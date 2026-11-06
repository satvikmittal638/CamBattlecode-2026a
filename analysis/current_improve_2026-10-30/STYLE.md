# Current active submission review: v125 and descendants

The task began with v125 active and pinned. Its 22 downloaded source files are frozen in `active_source/src` and `workspace/bots/v125-review-base-1030/src`. Eighteen files are identical to the previously reviewed v114; the four changed files were reviewed in full. Current official engine/SDK patch is 2.0.0. No browser or computer-use tools were used.

## Draft and coordination

On five-pick maps the ordered draft is Heart of Ruin, Vesper Vale, Cassi & Issac, Marcella, Vendetta. The duo occupies one draft pick and fields two separate bodies. Three-pick maps use Heart, Vesper and Vendetta. The opening comment in draft.cpp is stale; the actual arrays determine the draft. Static spawn distances and mandatory altar-blocking monolith metadata are computed during draft and passed through draft memory.

Each champion farms and navigates independently. Shared bytes publish low-health state, selected camp and capture intent; the helper packet uses the last two bytes. This is lightweight coordination, not a unified squad controller. A linked duo therefore frequently occupies different places and fights different enemies, despite either body’s death killing both.

## Economy and items

The ordinary opening buys Treasure and Jungle emblems in the champion’s damage stat, then Durability Health and Bruiser Health. Ryth and Vendetta use Treasure Health and reverse the two defensive emblems; Ryth also uses Jungle Health. Cassi, Heart and Marcella use Focus as their damage stat. v125 buys/places altar locks. The 10-gold lock purchase can leave a champion returning with 150 gold unable to finish a five-shard emblem immediately.

Camp selection values gems, gold, travel and clearing time, ownership, enemy presence and nearby allies’ targets. Commitment is strongest when the selected camp is within 12 route tiles. Captures take five turns; ownership, stale captures and prolonged contests have explicit recovery checks. Farming, shopping and tributing are separate decisions, with special handling for mandatory bank gates.

v128 changes only Cassi’s opening: the existing Durability Health emblem comes before the economy emblems. This was selected because the local linked-death mechanism improved, not because of a small local win-rate change. Its later platform win gain was stronger than its survival gain; the latter did not generalize well.

## Fighting, recovery and execution

Combat and healing checks run before ordinary farming. The legacy low-health mode starts below 35% personal health or on a linked partner’s low-health signal, and normally exits at 60% when the partner is safe. Spawn healing waits for full health, with a separate plateau escape. Movement uses static geometry, engine distance fields, dash/bridge logic and congestion handling. Melee units can make a safe parting hit before retreating. Ability targeting, incoming-damage checks and local combat evaluation live in the existing tactical helpers.

The critical execution weakness is computational: expensive camp scoring can finish with approximately 39,500–41,000 fuel remaining, below farm()’s 42,000 execution gate. On Lanes, the bot repeats this every turn and never executes its valid plan. All ten fresh v125 and ten fresh v128 platform Lanes games had zero score, captured gold and captured gems. An isolated native checker reproduced the selected Lanes replay with 100% action agreement through round 200.

The recovery candidate preserves one immediately preceding unexecuted task only after three consecutive budget failures at the same position. It requires no earlier movement/attack and no currently visible enemy. Current combat/healing still run first; task validity, respawn timing, ally capture and stall exclusions are checked again. The saved task expires after one round. This repairs a repeated planning stall without globally shortening the objective scorer or assuming a specific map name.

## Observed loss styles

All 158 losses from the first fresh matched platform comparison were visually reviewed through opening trajectory atlases: 83 v125 losses and 75 v128 losses, 27 pages total. These are omniscient plots sampled every five rounds, not bot vision or proof that a straight plotted segment is a legal walking route.

- Lanes: a few opening movements, then the whole army stays stationary while the opponent farms.
- Boss Battle: active own-half farming and repeated barrier approaches, but weak conversion into banked points. More survivability alone does not open the scoring route.
- Swirl and Treasure Box: many deaths on contested opening routes and near spawn. The linked duo amplifies individual mistakes.
- Tangle and some Uncharted/Corners losses: few early deaths but an objective-income deficit. Avoiding fights is insufficient when the opponent completes more useful cycles.

The historical 250-replay archive is a biased mixed-opponent sample. It supports qualitative investigation, not a fair strength comparison. Fresh matched cohorts supply the win evidence.
