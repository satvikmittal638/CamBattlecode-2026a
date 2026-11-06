#pragma once
// Tuning constants of the v62 strategy. The feature switches that used to live here are now plain code
// (enabled ones kept unconditionally, disabled ones removed); see analysis/v62_c100_2026-10-27/NOTES.md.
constexpr int X_SHOPGOLD = 150;       // recall to shop with this much gold when no enemy is within 8
constexpr float X_GOLDW = 0.5f;       // gem-equivalents per gold in camp scoring
constexpr float X_STEALFRAC = 0.3f;   // gated-altar maps: only finish a gate observed at or below this health share
constexpr float X_PACKMINHP = 4000.0f;  // converge on ally-claimed groups with at least this total HP
constexpr float X_FIGHTRISK = 0.95f;  // tactical plans: reject a non-kill plan whose 2-turn incoming estimate reaches this share of HP
constexpr float X_ESCAPERISK = 0.55f; // no plan: burst-escape when staying would take this share of HP
constexpr float X_OUTMATCHED = 0.35f; // outmatched below this local health share (self + allies within 4 vs enemies within 6)
constexpr int X_GOLDRICH = 25;        // own shards at which gold weight drops
constexpr float X_GOLDRICHW = 0.3f;   // multiplier on X_GOLDW once rich
constexpr int X_COMMITDIST = 12;      // keep a still-valid target once within this route distance
