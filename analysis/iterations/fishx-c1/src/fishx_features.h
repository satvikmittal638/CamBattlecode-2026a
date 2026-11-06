#pragma once
// fishx: tm30 (team v30) plus switchable elements of Intercontinental Fish's play
// (analysis/fish_meta/FISH_META.md). Every switch defaults to tm30 behaviour (false) until a
// both-side local evaluation shows it helps; tools/variant.mjs flips them per variant.
constexpr bool X_PRIO = false;        // Fish turn order: near enemies act first, wounded gem carriers last
constexpr bool X_CAMPSTUN = false;    // stun armed camps (Cassi/Tavi/Prism) when no enemy champion is near
constexpr bool X_BUILD = false;       // Fish emblem orders per champion, then Power in the scaling stat
constexpr bool X_CARRYCAP = false;    // captures go to the carries (Stellar > Ren > Issac > Varg > Cassi > Ryth)
constexpr bool X_SHOPRECALL = true;  // recall to shop with X_SHOPGOLD+ gold when no enemy is within 8
constexpr int X_SHOPGOLD = 150;
constexpr bool X_BANK = false;        // keep farming small bags: tribute below X_BANKMIN only with an altar within X_BANKNEAR
constexpr int X_BANKMIN = 45;
constexpr int X_BANKNEAR = 8;
constexpr bool X_DRAFT4 = true;      // fourth pick Ryth instead of Varg (Fish's 4-pick team)
constexpr bool X_CARRYEQ = false;     // with X_CARRYCAP: Stellar and Ren share the top capture rank
constexpr bool X_BUILDSTELLAR = false; // Fish's Stellar build only (Power Focus first); other champions keep tm30 builds
