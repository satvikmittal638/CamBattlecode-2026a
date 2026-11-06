# Locked before held-out validation (2026-10-21)
Discovery: 50 probe games (v41 vs Fish r1, :3 r2, Trzy Kwaterki r7, Tartarus r12, Bamboo Teahouse r30),
`analysis/v41_strategy2/discovery_q_core.{json,log}`. Held-out: every 5th game of
`platform/v41_ranked/games/index.json` sorted by createdAt (outcome-blind rule), via
`q_core.mjs ... every:5`. Opponent submission versions are unknown; our side is v41 in all games.

H1 (item build): opponents' share of Bruiser item deltas among all positive item deltas is >= 2x v41's,
AND for Heart of Ruin specifically opponents' Bruiser share > 50% while v41's is < 20%
(only types present on both sides; denominators = positive item deltas on Shop events).
H2 (banking): opponents' median bag at tribute start exceeds v41's by >= 5 gems AND opponents'
tribute starts per game >= v41's. (Tribute starts include restarted channels.)
H3 (stunned/inactive deaths): among v41 deaths, the share whose last own-turn action proxy (within 4
rounds) is "noAction" exceeds the opponents' share by >= 5 percentage points.
Each H passes or fails on the held-out set as stated; no re-definition after seeing it.
