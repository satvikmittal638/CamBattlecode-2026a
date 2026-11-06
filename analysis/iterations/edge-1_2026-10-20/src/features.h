#pragma once
// Feature switches. Values below are the current best set (greedy ablation vs v21, 2026-10-20);
// tools/ablate.mjs rewrites them per variant.
#ifndef F_ALL
#define F_ALL 1
#endif
constexpr bool F_DRAFT = true;      // top-ladder caster draft (else v21 Mite draft)
constexpr bool F_BUILD = false;      // Health x2 then Power in scaling stat, Focus for Ren/Tavi
constexpr bool F_FIGHT = true;      // spell-first fight logic with chase / join / stand rules
constexpr bool F_CAMPSTUN = false;   // stun the strongest awake camp when no enemy is close
constexpr bool F_TELIG = false;      // gold-only and enemy-side camp groups are eligible targets
constexpr bool F_TSCORE = false;     // camp choice fitted to top-team decisions (value/(dist+1+hp*0.015))
constexpr bool F_RENFOCUS = true;   // Ren and Tavi use the v21 Focus plan (Jungle, Durability, Power Focus)
constexpr bool F_TRIBSAFE = true;   // never start a tribute with enemies within 5
constexpr bool F_BAG2 = false;       // keep farming until 50 gems unless an altar is adjacent or the bag wins
constexpr bool F_BAG = false;        // small bags keep farming when a camp is closer than the altar
constexpr bool F_SHOPRECALL = false; // recall to shop at 180+ gold when safe
constexpr bool F_WARD = false;       // relocate ward often, ahead toward the target
constexpr bool F_PRIO = true;       // stun-ready champions act first, then ranged
constexpr bool F_LOWHP = true;      // casters disengage at 45% hp (melee 38%) instead of 35%
constexpr float G_GOLDW = 0.3f;      // gold weight in the fitted camp score (top teams fit ~0.5-0.8)
constexpr bool F_BOSSGOLD = true;   // boss-only maps: farm gold groups on the enemy half too (top teams: ~43%)
constexpr bool F_MAPDRAFT = true;   // big 3-pick maps: Cassi & Issac, Stellar, Varg (top-team expanse draft)
constexpr bool F_CAMPESC = false;   // retreat while hp still covers walking out of awake camps' range
constexpr bool F_RECALLTRIB = false;// far from altars: recall home with the bag and tribute by spawn
