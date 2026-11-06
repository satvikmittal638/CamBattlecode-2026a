# Strategic fixes for v41 (from PROBE_REPORT.md + code reading) — 2026-10-21

Paths are under `analysis/v41_teammate/v41/src/`. Nothing here is implemented or uploaded.
Local check: 60 of our deaths on swirl/fragment/hooks/stampede with a per-turn logging build
(`local_eval/v41/stagedeaths`, `tools/death_stages.mjs`): last-turn stage `low` (retreating) 32,
`x-melee-parting` (hit-then-retreat) 12, farming in the last 3 turns 18; the legacy fight fallback 0.

1. Retreat on danger, not at a fixed 35% HP — `bot.cpp:803`.
   Evidence: 55% of our deaths go from >60% HP to dead in 4 rounds; our low champions die 47%
   (theirs 26%; vs top 15: 51% vs 20%). Change: enter low mode when HP < ~1.3x the expected
   incoming damage over the next 2 turns (the `v1Response` sum already used in `v1_tactical.h`),
   or when enemies within 5 >= allies within 5 + 2 and HP < 60%.

2. Retreat toward allies/spawn, not just away — `moveAway` `bot.cpp:604`, recall `bot.cpp:828`.
   Today: one step maximising distance from threats; recall only with no enemy within 6, so a
   chased champion never recalls. Change: score steps by distance to the nearest healthy ally
   group and to spawn; raise a purpose-2 help call (peel) when chased.

3. Help/peel reaches more allies — `v1_dispatch.h:14,17,49`.
   One helper only, ETA <= 5, helper >= 60% HP, not capturing, < 44 gems. Change: allow two
   helpers and ETA up to ~8 for purpose 2; let a capturing non-carrier answer.

4. Don't farm alone where enemies were just seen — target scoring `v1_cycle.h:118-119`.
   Evidence: 12 of 16 deaths/game on our own half; alone 41% vs 35%; 18/60 local deaths while
   farming. Change: keep last-seen enemy positions in shared memory; penalise groups within ~6
   tiles of a sighting in the last ~15 rounds unless 2+ allies are committed there.

5. Focus and finish — `v1_tactical.h:127` (each champion picks among its 2 nearest/lowest).
   Evidence: kills 4.5 vs 10.5/game; their low champions escape 74%. Change: share a focus target
   (id + round) so allies in range prefer it; let healthy champions chase a <25% HP enemy a few
   tiles when not outnumbered.

6. Contest (boss-only maps run `boss/`) — `boss/draft.cpp:64`, `boss/bot.cpp:1074`.
   Evidence: 67 deaths/game, 0 gems in 7/10. Change: Heart of Ruin in the `bosses` draft; re-test
   X_BOSSSTEAL there (casters wait for a 30% monolith and walk into the enemy's team fight).

7. Lanes deadlock — `bot.cpp:508` (`enough(36000)` before routing).
   Evidence: v41 0/19 on lanes (ranked + probe), idle 36–71%. Change: v39's X_ROUTEFUEL=24000.
   v41 raised other fuel floors (scoring 68k, early return 57k), so re-check locally first.

8. Commit as a team to big camps (rows golem cluster) — `v1_cycle.h:118-119`.
   The incoming-damage penalty makes a 10-golem group unpickable alone, and nobody commits first.
   Change: the Heart (or highest-HP champion) commits to a >=100-gem group when 2+ allies are free
   nearby and announces it; arrivals then make it score well for the others.

9. Close-spawn maps — `closeSpawns` (`bot.cpp:159`) exists but only changes Vendetta/Issac.
   Evidence: swirl/hooks/fragment/stampede/reverse_spiral 25–37 deaths/game, 64–84% on our half.
   Change: first ~300 rounds farm only our-side camps near spawn and in pairs (combine with 1–4).

Test protocol: X_THREAT and X_RALLY (simpler versions of 1–3) were neutral/negative locally, and
local opponents rarely gang up (v41 wins 12/12 brawl games locally). Judge 1–5 and 9 on the
platform with the `platform/probe_v41/specs.json` schedule as a paired benchmark against
`platform/probe_v41`; 6–8 can be checked locally first.
