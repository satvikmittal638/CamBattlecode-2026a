#pragma once
// fishmeta switches (tools/field_eval.mjs --fh fm_flags.h overrides them per variant).
// All four at 0 reproduces v62 (this tree is v62m with every M62 switch at its v62 default).
constexpr int FM_FIGHT = 1;   // learned fight policy when an enemy is within 5: move class, target choice, act before moving
constexpr int FM_RECALL = 1;  // learned recall policy replaces v62's fixed low-HP / heal / shop recall thresholds
constexpr int FM_DRAFT = 1;   // Fish's pick-rate order for the team size (bank-gated maps keep the gate team)
constexpr int FM_PRIO = 1;    // Fish's turn order: champions in contact act first, carriers and wounded last (M62_PRIO)
