#pragma once
// Experiment switches for the outmatched-fight study (defaults = v62n). Resolved and removed before shipping.
// Local share = health of self + allies within 4 / (that + visible enemies within 6).
constexpr float Q_SHARE = 0.35f;
// Q_NOLEGACY: outmatched and the planner found no worthwhile plan -> no legacy attack/approach fallback.
constexpr bool Q_NOLEGACY = false;
// Q_FLEE: outmatched, no plan, an enemy within 5 -> step to the tile with the least estimated incoming damage,
// ties broken by distance from the nearest enemy (the burst escape still handles high danger).
constexpr bool Q_FLEE = false;
// Q_CLOSING: with Q_FLEE, step only when an enemy is within 3 or the nearest enemy closed in since our last turn.
constexpr bool Q_CLOSING = false;
