#pragma once
// Experiments ported onto the teammate's v30 (tools/variant-style toggles).
constexpr bool X_HANDOFF = true;      // melee leaves a cleared group to a poorer ally arriving for it
constexpr bool X_POWER2 = true;       // leave at first sight (8 tiles) when item-aware enemy power > margin x ours
constexpr float X_POWERMARGIN = 1.2f;
constexpr bool X_BUILD2 = false;      // Treasure emblem in the scaling stat, then Power forever
