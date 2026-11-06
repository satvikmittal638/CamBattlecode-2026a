# Meta study for 1900+ rating (27-28 Oct)

Goal (user): reach 1900+ (we: 1835, rank 106). Band = 37 teams rated 1870-1960 (ranks 54-90), `ladder.json`.

## Data (most recent, patch 2.0.0 only)
* 10 band teams (`teams.json`, ranks 54-73): newest ranked games, one per map, `teams/*/` (212 games after dedupe),
  official summaries in `summaries/` (`fetch_summaries.mjs`).
* Us: v62r live ranked games since 18:31 UTC (`ours_live/`, 45 games, 27 won); v62r challenge games vs band teams
  (`ours/`, 80 games, but those replayed the opponents' 26 Oct bots).

## Profiles (`tools/macro_analysis.mjs`)
us (live) vs band average: captures/100 rounds 4.0 vs 4.5; net worth r150/r300 396/896 vs 432/962; time on the
enemy half 10% vs 17%; grouping .70 vs .77; game length 1344 vs 1189 rounds. v62 only targets groups with
dOwn <= dEnemy + 4, i.e. almost never the enemy half.

## Winners vs losers inside band games (212 games)
deaths 5.4 vs 11.8 (by r300 1.2 vs 2.2); kills 10.1 vs 3.8; captures 75 vs 50; gems by r300 188 vs 138; tributes
29.6 vs 17.9 with 51 vs 30 gems per tribute; gold 7334 vs 4021; spend Bruiser 55% vs 43%, Jungle 8% vs 12%, Treasure
5% vs 8%. Our platform games look like the losers' column (deaths ~11, kills ~5, captures ~50).

## Drafts (decoded with the champion_draft enum; matches the ladder's own pick names)
* Band (424 team-drafts): our lineup Heart+Vesper+Ryth+Marcella+Vendetta 76 drafts 47%. Tavi 63% (48% without),
  Varg 62% (48% without), Heart 48% (59% without), Marcella 51% (45% without). Vesper+Vendetta+Marcella+Varg+Tavi 68%
  (19), Ryth+Vesper+Vendetta+Marcella+Tavi 82% (11). 3-pick: Heart+Marcella+Vesper 53% vs our Heart+Vendetta+Vesper
  38%. 4-pick: Marcella+Varg+Vendetta+Vesper 70% (10).
* A pasted "climbers" analysis (user, 28 Oct) decoded draft ids with the champion_type enum (Heart -> "Tavi",
  Marcella -> "Prism", Varg -> "Ren", Tavi -> "Varg", Willow -> "Marcella"); the platform shows those climbers still
  run Heart (Ad Astra #3: Heart Vesper Ryth Marcella Varg; test4: Heart Marcella Vesper Cassi&Issac Tavi;
  Rogue Lock Pickers: Vesper Vendetta Marcella Tavi Willow). `climbers.json`.
* Local screens vs v62r (`fe_draft1/2`, 35 maps x 2 sides): Ad Astra's +5 (+51 margin), SkuBap's (Vesper Marcella
  Vendetta Varg Tavi) +4 (+45), Vesper Marcella Vendetta Tavi Ryth +4, test4's +3, Rogue's 0, Heart+Tavi 0.
  vs nova_f84 (`fe_draft3`, other 35 maps): base 45, Ad Astra 40 (+83 margin), SkuBap's 44, d2 40. High-combat games
  improve for the Varg lineups on both benches; low-combat games vs nova slightly worse.
* **v62v** = v62r + SkuBap's draft (3-pick Heart Vesper Marcella). Platform v108, 20 challenges (same specs as
  v62s/v62t, sourceGroupId = v62 groups), `../v62v_c20_2026-10-28`.

## v62v on the platform (v108, 20 challenges, exact opponent bots) - not adopted
vs v62 (100 games): near 19 -> 21, half 10 -> 13, challenges 2 -> 6. A priori map split: combat maps 14 -> 14
(deaths 18.8 -> 17.8, kills 6.7 -> 5.8, captures 56 -> 52, tributed 545 -> 524); other maps 15 -> 20 (deaths 10.6
-> 8.4, tributed 600 -> 754). vs v62r (50 overlapping games): combat 8 -> 7 (deaths +1.0, kills -0.9), other 7 -> 10.
Same 100 games: v62 29, v62s 32, v62v 34, v62t 38 wins. The draft did not improve combat maps (its target) => fails the
fix-acceptance rule; v62r restored live 20:51 UTC 27 Oct (rating 1838, rank 105; 1806 that morning).

## Fight-behaviour comparison and health management (28 Oct)
* `fight_behaviour.mjs` (snapshots): converging on an engaged teammate us 35-38% vs band 36-41%; closing in on a
  wounded enemy when ahead 9-10% vs 9-11%; that enemy dead within 5 rounds 28-37% vs 26-36% -> no difference.
* Caught alone (2+ enemies within 6, no ally within 4; `caught_alone.mjs`): in losses we get caught 51x/game (band
  losers 42x), at HP .70 (.78), and die within 10 rounds 23% (15%), 23% even after retreating (13%). Deaths/game in
  losses 18.7 vs band losers 13.0; in wins 5.6 vs band winners 7.8.
* HP (`hp_profile.mjs`): off-spawn time below 60% HP us 18% / 23% (wins / losses) vs band 15% / 17%; heading home at
  median HP .36 / .33 vs .41 / .38. v62 retreats at .35; heal-recall was off.
* Local (`fe_hp1/2`): retreat at .45 deaths -16-18% but gold -7%; heal-recall at .6 deaths -11-12%, economy flat/up;
  both -16-20%. Wins within noise.
* **v62k** (v62r + heal-recall .6, v110) on the platform: vs v62 combat maps 14 -> 12, other maps 15 -> 22; vs v62r
  (50 games) combat 8 -> 5, other 7 -> 13; deaths 12.0/game (v62v 12.5) -> fails the rule.
* Harsh's v109 (e3 = capture assignment + v62r's step-away) activated 21:43 UTC while he tests; left in place.
