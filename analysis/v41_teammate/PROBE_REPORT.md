# v41 weakness probe — 2026-10-21 04:20 UTC

40 challenge groups (200 games) with the active v41 against 20 teams ranked 1–85 (2 groups each):
one group on v41's 10 weak maps (5 per side each), one rotating over the other 25 maps (2 per side).
Data: `platform/probe_v41/` (specs.json, games/index.json, decomp.txt, idle.txt, deaths.jsonl,
fights_summary.json). Tools: loss_decomp, idle_scan, death_context, death_actions, finish_rate,
fight_analysis.

## Results
- 56/200 (28%). Top 15 (≥1980 rating): 7/80 (Fish, :3, EMPEROR Tung, Trzy Kwaterki 0/10).
  Ranks 18–85: 49/120 (41%).
- Weak maps: lanes 0/10, rows 0/10, the_farm 1/10, contest 1/10, yellow_brick_road 2/10,
  elkring 2/10, split 2/10, monolith 2/10, rushbait_v2 3/10, fracture 4/10.
- New 0/4 maps: collision, fragment, reverse_spiral, swirl, big_world.

## Weakness 1 — losing fights against strong teams (largest)
Fight analysis, us vs them per game:
- champion kills 4.5 vs 10.5; fights won 39%;
- they initiate 56% of fights and win them 1345 kills to 321; when we initiate, 572 vs 756;
- outnumbered fights: 1v2 788 vs 2v1 416, 1v3 201 vs 3v1 72;
- our deaths 16.2/game (11.7 outnumbered, 6.7 by 2+), 12 of them on our own half;
- low champions (<25% HP): ours die 47%, theirs 26% (top 15: 51% vs 20%);
- 55% of our deaths come from >60% HP within 4 rounds (burst); 35% of our victims were stunned (theirs 23%);
- cohesion: allies within 6 tiles 1.0 (us) vs 1.2 (them); alone 41% vs 35%;
- we also die to camps 5.6/game vs 4.5 (34% right after a champion fight).
Pantheon (r15) starts a recall after almost every action (89 per 100 champion-turns); no other team does.

## Weakness 2 — boss maps use the old boss bot
`src/boss/` (contest, boss_battle) was not touched by v41: its draft is Tavi, Stellar,
Cassi & Issac, Prism, Ren (no Heart). Contest: 67 deaths/game (65 to champions), 0 gems in 7 of 10 games.

## Weakness 3 — close-spawn brawl maps
swirl 36 deaths/game, hooks 37, fragment 33, stampede 27, reverse_spiral 25; 64–84% of those
deaths on our own half, many before round 300. Swirl spawns are ~12 tiles apart (45x30 map).

## Weakness 4 — economy stalls
- lanes 0/10: fuel deadlock (idle 36–52% vs ~15%); fixed by v39's X_ROUTEFUEL=24000.
- yellow_brick_road: both sides idle 40–80% (map-specific).
- rows 0/10: big golem cluster never taken (gold-first + caster-carry).
- big_world, the_farm, pilgrimage, gold_rush: capture rate 55–70% of the opponent's with few deaths.
- one rushbait_v2 game at 68% idle (opponent 4%).

## Close races
elkring, split, monolith, fracture: capture rate ~85–90% of the opponent's, few deaths.
