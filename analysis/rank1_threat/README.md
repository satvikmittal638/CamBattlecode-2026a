# Rank-1 (Intercontinental Fish) farming -> aggression thresholds

Pipeline (all reproducible):

1. `tools/replay_scraper.cpp` — observation-only CAMBC SDK bot (`tools/build_replay_scraper.sh` builds it as
   `workspace/bots/replay-scraper`). On every Fish Vendetta / Cassi / Issac turn with one of our champions in that
   champion's personal vision (`bc::vision::champions(bc::opponent(team::ally))`), it logs round, champion,
   Chebyshev distance and HP fraction of our nearest visible champion, nearest alive visible camp, carried gems, own HP,
   nearest altar.
2. Hosting: `turnhost --observe` (analysis/v58_deep_2026-10-24/harness/turnhost). It steps the recorded replay itself
   and, at each Fish champion turn start, runs the scraper with every SDK call answered by the replay state from that
   champion's perspective — exactly what Fish's bot saw; no re-simulation, so no drift. (The ordinary shadow mode drifts
   when it hosts the opponent's side: our recorded hits were rejected as not visible from round 45.)
3. `tools/replay_scraper_run.mjs` — runs 455 replay files (361 distinct games we played against Fish, v62-family and
   Codex counters) and classifies Fish's recorded action for each turn: attack/spell on our champion or a move closer to
   it = AGGRESSION; attack/spell on a camp or a move closer to the nearest camp = FARMING; tribute or move to an altar
   with gems = BANKING (also RETREAT / IDLE / RECALL). Output `rank1_threat_data.csv` (256,165 rows).
4. `tools/rank1_threat_analysis.py` (`.venv-analysis/bin/python`) — logistic fits and empirical rates by distance,
   split by champion and target HP (>50% vs <=50%), three outcome definitions:
   * strict: only turns with an attack/spell (champion vs camp target),
   * abandon: the champion farmed on its previous turn; did it switch to aggression now,
   * broad: the requested definition including moves (moves are ambiguous: ~38% "aggression" floor at long range).
   Outputs `rank1_aggression_{strict,abandon,broad}.png`, `breakpoints.json`.
