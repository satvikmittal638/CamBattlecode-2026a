#pragma once
// v58x: switchable repairs found by the replay-exact decision audit (analysis/v58_deep_2026-10-24).
// Every switch defaults to v58 behaviour; harness/build_variants.mjs and tools/field_eval.mjs override them.
constexpr int X58_LOWSHIELD = 0;        // low-HP retreat under threat casts any self-shield (v58: Varg only)
constexpr int X58_CAMPAWARE = 0;        // retreat danger uses camp attack ranges; recall-guard walks avoid nearby camps
constexpr int X58_NOPLAN = 0;           // tactical no-plan: 0 v58 (fall through), 1 trade, 2 step to safest tile, 3 trade if a hit is possible else step away
constexpr float X58_ESCAPERISK = 0.55f; // no plan: burst-escape when staying would take this share of HP
constexpr int X58_KEEPWITHDRAW = 0;     // a tactical withdrawal (escape step, dash or shield) ends the main decision (Codex F06)
