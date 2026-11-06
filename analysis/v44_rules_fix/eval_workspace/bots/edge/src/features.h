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
constexpr bool F_TSCORE = false;
constexpr bool F_TSCORE2 = true;     // week-2 camp choice fitted on Nyx: (gems+1.5*gold)/(dist+1+0.01*hp)
constexpr bool F_GOLDELIG = true;    // gold-only camp groups on our side are eligible (clusters are 120 HP now)
constexpr bool F_BUILD2 = true;      // Treasure emblem in the scaling stat first, then Power forever
constexpr bool F_RENFOCUS = true;   // Ren and Tavi use the v21 Focus plan (Jungle, Durability, Power Focus)
constexpr bool F_TRIBSAFE = true;   // never start a tribute with enemies within 5
constexpr bool F_BAG2 = false;       // keep farming until 50 gems unless an altar is adjacent or the bag wins
constexpr bool F_BAG = false;        // small bags keep farming when a camp is closer than the altar
constexpr bool F_SHOPRECALL = true; // recall to shop at 180+ gold when safe
constexpr bool F_WARD = false;       // relocate ward often, ahead toward the target
constexpr bool F_PRIO = true;       // stun-ready champions act first, then ranged
constexpr bool F_LOWHP = true;      // casters disengage at 45% hp (melee 38%) instead of 35%
constexpr float G_GOLDW = 0.3f;      // gold weight in the fitted camp score (top teams fit ~0.5-0.8)
constexpr bool F_BOSSGOLD = true;   // boss-only maps: farm gold groups on the enemy half too (top teams: ~43%)
constexpr bool F_MAPDRAFT = true;   // big 3-pick maps: Cassi & Issac, Stellar, Varg (top-team expanse draft)
constexpr bool F_CAMPESC = false;   // retreat while hp still covers walking out of awake camps' range
constexpr bool F_RECALLTRIB = false;// far from altars: recall home with the bag and tribute by spawn
constexpr int G_SHOPGOLD = 150;     // shopping-recall gold threshold
constexpr bool F_POWER = false;      // item-aware local power; avoid unfavorable fights within 5 tiles
constexpr bool F_GEMTGT = true;     // gem-first, team-aware camp choice (chooseTargetW3)
constexpr float G_GOLDW3 = 0.15f;   // gem-equivalents per gold in chooseTargetW3
constexpr bool F_HANDOFF = true;    // melee leaves a cleared group to a poorer ally arriving for it
constexpr bool F_CAMPGATE = false;  // only hit armed camp groups when the tank survives the team's clear time
constexpr bool F_POWER2 = true;     // leave at first sight (8 tiles) when the item-aware enemy power is G_POWERMARGIN x ours
constexpr float G_POWERMARGIN = 1.2f;
constexpr bool F_TGTML = true;      // camp choice cloned from top teams (chooseTargetW4)
constexpr bool F_W4ALL = true;      // W4 considers every reachable group (top teams do), not only our-side ones
constexpr float G_W4STICK = 0.3f;   // utility bonus for keeping the current target
