# Tactical rejection can fall through to the older combat policy

This is a source-level policy inconsistency in the frozen v54 upload. No bot code was changed. It is not a claim that every unfavorable fight in this evaluation used this path.

In `source/src/v1_tactical.h`, `Plan best` starts with value zero. A candidate replaces it only when its value exceeds the current value by more than one. A candidate with a negative exchange value therefore leaves `best.target` empty. The value includes damage, a future-hit estimate, and a penalty for estimated incoming damage.

When there is no selected plan, escape only runs if `stayDanger > health * X_ESCAPERISK`, where the active threshold is 0.55. Otherwise, after the special enemy-spawn and Ren retaliation guards, `tacticalFight()` returns -1.

In `source/src/bot.cpp`, `fightChampions()` returns immediately only when `decision >= 0`. A -1 result falls through into the older policy, which picks an enemy within basic-attack range and attacks it, or approaches enemies under its distance/health rules. It does not repeat the tactical plan's exchange-value test.

For a simple arithmetic illustration, consider a ranged champion with 1,000 HP and 50 strength, no ready spell, no shield or bag, facing two adjacent melee enemies of 50 strength each, whose relevant abilities are unavailable. Give both enemies the movement flag and no completed-turn flag. The response model can estimate 200 incoming damage across its two ticks. The stationary basic-attack plan has value at most 50 + 25 - 1.1*200 = -145, before any additional penalties. That fails to select a tactical plan. But 200 is below the 550 escape trigger, so the older fallback can still attack a nearby opponent.

This example explains the control flow, not an exact replay state or a counterfactual win prediction. The planner may intentionally leave room for a fallback, and its response model is approximate. The concern is that rejecting the exchange does not prevent essentially the same exchange from being performed by another branch.

A future experiment should distinguish “no affordable computation / no relevant enemy” from “evaluated the fight and rejected it,” then compare scoring and survival on held-out opponents. Simply forcing all such cases to retreat could also lose games; this evaluation does not establish the best replacement behavior.
