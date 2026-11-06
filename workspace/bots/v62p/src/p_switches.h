#pragma once
// Experiment switches for the patch-2.0.0 study (defaults = v62f). field_eval overrides them per variant; the
// chosen settings get inlined and this header removed before anything is shipped.
// P_BUILD (normal maps; families 0 Monster 2 Durability 3 Treasure 4 Jungle 6 Bruiser 8 Capture 9 Prospector):
//   0 Treasure > Jungle > Bruiser Health > Durability Health > Bruiser damage (v62)
//   1 Capture instead of Treasure          2 Prospector instead of Treasure
//   3 Prospector > Capture > Jungle > ...   4 Jungle > Treasure > ...      5 Jungle > Capture > ...
constexpr int P_BUILD = 0;
// P_MEMO: skip the fight evaluation (tactical planner + legacy scan, 55-75k fuel with 3+ enemies in view) when the
// last evaluation of the same situation found nothing to do, so farming/routing get the fuel (standoff freeze).
constexpr bool P_MEMO = false;
// P_GATE: gated-altar maps - detect altars sealed by several boss groups (02guardians), normal draft and build, from
// round P_ASSAULTR healthy champions attack the gate together and capture it; a bank route with no reachable altar
// tile backs off for 20 rounds instead of consuming the turn.
constexpr bool P_GATE = false;
constexpr int P_ASSAULTR = 600;
// P_FARMFIX: farm() with no live member in sight walks to the group's unseen tiles (v62 stood on its own tile),
// drops a capture the engine does not report as ours after 8 turns, and leaves a capture contested for 20 turns
// with no enemy champion within 8 (unseen contester on a map-wide group).
constexpr bool P_FARMFIX = false;
// P_DZONE: a champion killed with enemies in view marks the camp group nearest its death (status byte 0xC0|group,
// a combination v62 never writes) while it waits to respawn; allies skip that group for P_DZALLY rounds, the victim
// for P_DZSELF rounds after its death (61% of our deaths came within 6 tiles of an ally's death in the last 150 rounds).
// 0 off, 1 any death with an enemy in view, 2 only deaths with 2+ enemies within 6 on the last turn alive.
constexpr int P_DZONE = 0;
constexpr int P_DZALLY = 60;
constexpr int P_DZSELF = 120;
