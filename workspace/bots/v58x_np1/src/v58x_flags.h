#pragma once
// v58x: switchable repairs found by the replay-exact decision audit (analysis/v58_deep_2026-10-24).
// Every switch defaults to v58 behaviour; tools/../harness/build_variants.mjs writes overrides per variant.
#ifndef X58_LOWSHIELD
#define X58_LOWSHIELD 0      // low-HP retreat under threat casts any self-shield (v58: Varg only)
#endif
#ifndef X58_CAMPAWARE
#define X58_CAMPAWARE 0      // retreat danger uses camp attack ranges; recall-guard walks avoid nearby camps
#endif
#ifndef X58_NOPLAN
#define X58_NOPLAN 1         // tactical no-plan: 0 v58 (fall through), 1 trade, 2 step to safest tile, 3 trade if a hit is possible else step away
#endif
#ifndef X58_ESCAPERISK
#define X58_ESCAPERISK 0.55f // no plan: burst-escape when staying would take this share of HP
#endif
