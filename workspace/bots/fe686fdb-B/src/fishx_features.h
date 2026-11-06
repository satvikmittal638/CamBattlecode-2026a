#pragma once
// fishx: tm30 (team v30) plus switchable elements of Intercontinental Fish's play
// (analysis/fish_meta/FISH_META.md). Every switch defaults to tm30 behaviour (false) until a
// both-side local evaluation shows it helps; tools/variant.mjs flips them per variant.
constexpr bool X_PRIO = false;        // Fish turn order: near enemies act first, wounded gem carriers last
constexpr bool X_CAMPSTUN = true;    // stun armed camps (Cassi/Tavi/Prism) when no enemy champion is near
constexpr bool X_BUILD = false;       // Fish emblem orders per champion, then Power in the scaling stat
constexpr bool X_CARRYCAP = true;    // captures go to the carries (Stellar > Ren > Issac > Varg > Cassi > Ryth)
constexpr bool X_SHOPRECALL = true;  // recall to shop with X_SHOPGOLD+ gold when no enemy is within 8
constexpr int X_SHOPGOLD = 150;
constexpr bool X_BANK = false;        // keep farming small bags: tribute below X_BANKMIN only with an altar within X_BANKNEAR
constexpr int X_BANKMIN = 45;
constexpr int X_BANKNEAR = 8;
constexpr bool X_DRAFT4 = true;      // fourth pick Ryth instead of Varg (Fish's 4-pick team)
constexpr bool X_CARRYEQ = false;     // with X_CARRYCAP: Stellar and Ren share the top capture rank
constexpr bool X_BUILDSTELLAR = false; // Fish's Stellar build only (Power Focus first); other champions keep tm30 builds
constexpr bool X_THREAT = false;       // isolated and outgunned (or 2x outgunned): leave before the fight, drop the task
constexpr float X_THREATRATIO = 1.3f;
constexpr bool X_RECALLGUARD = true;  // do not reissue a recall cancelled by damage; walk home first
constexpr bool X_BOSSTRIB = true;     // boss maps: no 100+ gem tribute with an enemy within 6; step away instead
constexpr int X_CARRYMODE = 1;          // with X_CARRYCAP: 0 Fish order, 1 casters first (Stellar=Cassi>Ren>Issac>Varg>Ryth), 2 poorest ally first
constexpr float X_GOLDW = 0.5f;       // gem-equivalents per gold in camp scoring (tm30: 0.15)
constexpr bool X_GOLDGROUPS = true;   // gold-only groups on our side compete in the main camp scoring
constexpr bool X_GATEDRAFT = false;    // gated-altar maps: normal draft and builds instead of the spell gate team
constexpr bool X_GATESTEAL = true;    // gated-altar maps: only finish a gate observed at or below X_STEALFRAC health
constexpr bool X_BOSSSTEAL = true;    // boss-only maps: casters only finish a monolith at or below X_STEALFRAC health
constexpr float X_STEALFRAC = 0.3f;
constexpr bool X_RALLY = false;        // healthy champions within X_RALLYRANGE converge on an engaged ally when our local power matches theirs
constexpr int X_RALLYRANGE = 12;
constexpr bool X_MELEEHIT = true;     // melee hits the weakest adjacent enemy champion before any retreat step
// --- v43x experiment switches ---
constexpr bool X_PACK = true;     // converge on ally-claimed camp groups (1 ally x1.6, 2 allies x1.2, 3+ x0.6) instead of v43 penalty x0.6
constexpr float X_PACKMINHP = 4000.0f;  // pack bonus only for groups with at least this total HP (0 = all groups, as in v43x-A)
constexpr int X_BRUISER = 2;      // 0 v43 builds; 1 Bruiser Health -> Bruiser damage stat -> Power (v43x-A); 2 Jungle -> Bruiser Health -> Power
