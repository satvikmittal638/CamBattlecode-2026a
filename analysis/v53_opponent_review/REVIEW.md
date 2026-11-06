# Opponents that beat v53, and verified v53 bugs

Analysis only, 2026-10-22. No bot source changes, submissions, challenges, or active-bot changes.

## Scope and documentation check

- Reused the audited metrics from all **500 replays**. There are **262 losses**, against **50 distinct opponents**; every opponent in this schedule beat us at least once.
- Compared all 241 losses outside the two specialized boss maps. Re-decoded **44 selected losing replays** against eight opponents for purchase order, basic-attack targeting, and the local conditions when attacking resumes after a gap. All 44 completed without decoding errors.
- Separately examined the six losses containing an opposing Prism, including five using our ordinary combat implementation.
- Accessed the live website using **direct HTTP scripts only**. Used the site's normal `GET /api/v1/game/access` flow for asset cookies, held only in memory. No browser, DOM, computer-use API, or browser login helper was used for the successful check.
- Downloaded the live handbook modules and ran their **pure Markdown export logic** in an isolated Node VM. The fresh **35,275-byte `GameRules.md` is byte-identical** to `analysis/docs_2026-10-22/official/GameRules.md` (SHA-256 `d0ffc1267709acc546a3ad54c9861aca1ae2707f2a7196cdb804392955d13f94`). No new rules-text update was detected. The patch-note API still lists 1.0.2, 1.0.1, and 1.0.0; the replays themselves use engine 1.0.3.

The rules still contain an outdated **worked example** saying Stellar starts with 85 Focus and deals 170 damage. Stellar's current champion table says **70 Focus**, making that spell's unmodified starting damage **140**. V53 queries engine champion designs; I found no hardcoded 85-Focus assumption in this path. Use current champion tables/native metadata over that prose example.

Evidence: [rules_comparison.json](rules_comparison.json), [fresh rules](docs_live/official/GameRules.md), [comparison.json](comparison.json), [details.json](details.json).

## What v53 is trying to do

On ordinary maps, v53 uses the Heart/Vesper/Ryth/Marcella/Vendetta family of lineups (three picks use Heart/Vesper/Vendetta). It normally buys Treasure first—Health on melee champions, Strength on ranged—then Jungle in the damage stat, Bruiser Health, Durability Health, and further Bruiser upgrades.

Each champion mostly chooses a camp from a local reward/time estimate, considers gold as well as gems, and retains a nearby target. Shared memory communicates camp commitments/capture status and a compact helper request. Combat, recovery, shopping, and most delivery decisions remain individual. This is lightweight coordination, not an absence of coordination.

The opponents' winning replays show several different alternatives. There is no single strategy shared by every team that beat us.

## 1. The strongest controlled comparison: same champions, often the same builds

**74 of the 241 normal-map losses use the same set of champion picks on both teams.** Draft order may differ.

| Measure in those 74 losses | v53 | Winning opponents |
|---|---:|---:|
| Camp groups captured / 100 rounds | 3.36 | 4.77 |
| Gem-bearing groups captured / 100 rounds | 2.37 | 3.79 |
| Body deaths / game | 13.50 | 3.66 |
| Walking moves / rewarded camp group | 82.14 | 60.02 |
| Mean gems / completed deposit | 20.55 | 31.27 |
| Banked score at round 500 | 156.03 | 268.47 |

**E=mc^2+AI^3 is the clearest example.** It wins 9/10 games against v53 in this schedule. Its eight normal-map wins use our exact champion set. Across the 35 comparable champion/game cases where both players bought an emblem, the available first-three-emblem prefixes match in **35/35**; **30 cases have all three emblems present on both sides** and all match.

Despite that similarity, those eight games average **1.5 deaths for them versus 9.0 for us**, and **40.8 gems per deposit versus 20.7**. They capture **3.94 versus 3.23 groups per 100 rounds**. Their winning approach is consistent with cleaner farming/delivery cycles and better survival using essentially our composition and build. Copying a new lineup is not sufficient to explain or resolve this gap.

These are outcome-conditioned comparisons: opponents are selected because they won. They describe how losses unfold, not the causal benefit of copying any one behavior.

## 2. Faster resource cycling: Mite and SilverSamurai

**Mite** wins five of its ten games against us. In those five wins:

- Captures **8.13 groups / 100 rounds**, versus our **4.39**.
- Only **4.0%** of its captured groups are gold-only, versus **15.2%** of ours. This means it emphasizes gem-bearing groups, which can still award plenty of gold.
- The 27 first-emblem observations in these winning replays are all **Jungle**: 18 Focus, nine Strength. Its `00lanes` team includes Marcella, Stellar, Cassi/Issac, Willow, and Heart, with Jungle preceding Treasure and Power.
- Our typical first purchase is Treasure Health/Strength. Mite instead gets camp damage reduction and its chosen damage stat online first, then builds its economy.

In these games, **61.4%** of our first basic attacks after a ten-round attack gap occur with more enemies than allies within six tiles; Mite's corresponding share is **2.6%**. This is a geometric proxy, not a personal-vision reconstruction or a claim that the attacking champion initiated the whole fight. Cassi/Issac also gives Mite another body, with the linked-death tradeoff.

**SilverSamurai** wins 6/10. In its six wins it captures **8.07 versus 5.17 groups / 100 rounds**, and **none of its rewarded groups are gold-only**. It uses more champion-specific first items—Power Focus on Stellar, Monster Strength on several melee champions—rather than our uniform Treasure-first pattern. Its mean deposit is **37.8 gems versus 19.2**. Its death advantage is relatively small, **4.7 versus 5.5**, so this is especially useful evidence for farming and delivery efficiency.

## 3. Pure economy losses exist even against teams we usually beat

**Still Testing** loses eight games to us but wins the `00rows` and `00road_of_riches` games. In those two wins it captures **7.26 groups / 100 rounds versus 3.34**, and deposits **39.5 gems at a time versus 19.5**. It actually averages more deaths, **4.0 versus our 2.5**.

On its `00rows` win, all four champions buy **Monster Strength first**, then Power Strength. V53 spends its first emblem on Treasure Health for the melee champions. Here the opponent's immediate clearing power and delivery cadence beat our longer-term capital plan.

**subscribe to caterpillow** likewise wins six games with **3.7 deaths versus our 3.3**, but captures **5.04 versus 3.75 groups / 100 rounds**. Its purchases vary by champion, including Focus on Heart/Marcella and Jungle Health on some front-line units. These examples show why reducing deaths alone will leave an economic gap.

## 4. Pressure and local support: noobers, Sneaky Bush Campers, and Valenki

**noobers** wins three games overall; two are normal-map combat routs on `00collision` and `00fragment`. Those two average **33.5 of our body deaths versus 0.5 of theirs**. Their basic attacks more often follow an ally's attack on the same target within three rounds (42.0% versus 34.2%), and their first attacks after a gap are less often locally outnumbered (9.6% versus 35.0%). The replay behavior is consistent with keeping pressure supported and concentrating damage.

**Sneaky Bush Campers** wins 7/10, averaging **1.9 deaths versus 21.0** in those wins and **6.48 versus 2.78 captures / 100 rounds**. Its first emblems are mixed: Bruiser Health, Treasure Health, Power Focus, and Jungle. It also captures **more gold-only groups proportionally than we do** (40.9% versus 33.2%). This is a counterexample to a blanket “stop farming gold” fix: it turns capital into pressure and continues collecting resources efficiently. The name alone is not evidence of a specific bush-ambush algorithm.

**Valenki** wins 6/10. Its five normal-map wins average **2.8 deaths versus 15.8**, and **4.02 versus 2.19 captures / 100 rounds**. It uses a different early-power plan: Bruiser Strength on Heart, Bruiser Focus on Marcella, and Power Strength on Vesper appear in the detailed replays. Its same-target follow-up share is **38.9% versus 14.5%** for us.

Its gated-map win is also instructive: after the gate opens, it obtains and successfully tributes a **1,017-gem bag**, while our champions finish with **3,001 carried gems**. Our farming is not organized around securing and exploiting the scoring window.

## 5. Confirmed logic/mechanics bugs in v53

### Bug A: escape compares shield-adjusted danger against unadjusted danger

Source: `analysis/iterations/v47p/src/v1_tactical.h:183–187`.

The current tile's estimated damage subtracts our shield. Candidate walking tiles do not. It therefore compares two different quantities when choosing an escape.

Counterexample, using the exact source loop:

- Our HP: **200**, shield: **150**.
- Raw predicted damage if staying: **300** → **150 HP damage**.
- Raw predicted damage after moving: **200** → **50 HP damage**.
- V53 compares the candidate's **200** with the current tile's **150** and keeps the current tile.

The extracted source reproduces that incorrect choice. Compare all locations on the same basis, with the same shield treatment and a nonnegative damage floor. This finding proves the arithmetic bug; it does not measure how many recorded deaths it caused.

### Bug B: enemy spell forecasting can hide a ready second spell

Source: `v1_tactical.h:19–23` and `:42`.

`v1Body` stores only the highest raw-damage spell. `v1Response` later checks whether that single stored spell is ready. If it is cooling down, a weaker ready spell is omitted.

For Prism with **100 Focus**, at distance four:

- Stronger spell: **150 damage**, cooling down.
- Weaker area spell: **100 damage**, ready.
- V53's response function predicts **zero spell damage** in the isolated source counterexample.

This state occurs in the replay corpus. Across five ordinary-branch losses against Prism, it casts the weaker area spell **283 times while its stronger spell is still cooling down**; **104 casts** have one or more of our champions within the blast area at cast time. The five games include a quiet `00rows` game with no such champion-targeting casts. A sixth Prism loss uses the separate boss implementation and is excluded from those figures.

Cooldowns for this check were reconstructed from successful native cast events, eight owner turn-end ticks, and respawns. Personal visibility and the exact planner branch at each encounter were not reconstructed, so 104 is not a count of proven bad v53 decisions or damage hits.

The correct model must consider each legal, ready spell independently. This can also avoid omitting a lower-damage spell with better range or control.

### Bug C: the enemy area-spell forecast drops the blast radius

Source: `v1_tactical.h:23` and `:42`; `v1_kit.h:22`.

The stored spell range is the cast-center range. The response test compares that directly with the distance to our champion, without adding an area spell's radius. For example, Ryth can place its area spell four tiles away and hit a champion one tile beyond that center. At distance **five**, the exact response function predicts **zero**, although a legal radius-one cast can deal **100** at 100 Focus. A third source counterexample reproduces this case. This is separate from the readiness bug: it occurs even when the area spell itself is ready.

### Bug D: the gated banking-protection feature is inactive for the actual gated draft

Source: `v1_bank_channel.h:5`, `v1_bank_carrier.h:5`, `draft.cpp:83–84`.

`bankChannelThreat()` immediately returns false unless the champion is **Cassi or Issac**. The enabled gated draft is **Heart, Stellar, Tavi, Prism, Ren**. None pass that guard.

Consequently, the ready-interrupt check and `retreatBankCarrier()` protection that depends on it cannot activate for the current gated team. All 12 `01boss_battle` drafts in the corpus use that team. This is a confirmed unreachable protection path, separate from the intentional policy of waiting for a weakened gate. Extending the guard alone still needs performance testing: a carrier must sometimes accept risk to finish a game.

### Bug E: boss positioning assumes safety inside the current Monolith attack range

Source: `boss/bot.cpp:1103` and `:1171–1184`; `v1_bank_access.h:21–23`.

The boss-only branch forecasts **zero incoming camp damage** for a Monolith and uses a **distance-four firing ring**, explicitly treating it as safe. The gated branch uses the same four-minus-three firing geometry. Current rules give Monoliths **attack range five**.

Distance four is therefore not safe by distance alone. Other champions tanking, stuns, or visibility/terrain may change the actual exposure, but the zero-damage assumption must be conditional on those facts. Both the threat estimate and firing-position selection need to use the actual monster range.

### Additional model inconsistency

The camp scorer orders monsters by **health / strength**, while the ordinary basic-attack executor generally chooses **lowest absolute health** (with a Vendetta finishing bonus and a Varg splash exception). A mixed Wolf/Elk group can consequently keep the stronger monster alive longer than the survival forecast assumes. This is a confirmed planner/executor mismatch; choosing a new order is not automatically an improvement, particularly when Vendetta's kill resets matter.

## What I would keep separate from the bug list

- A 35% HP recovery trigger, Treasure-first build, gold weighting, and a 12-step commitment radius are deliberate policies. Their weaknesses are not automatically programming mistakes.
- The repeatable `01broken_curve` deaths are real: Vendetta dies at round 20 and Heart at 42 in all 12 replays. The camp admission/escape policy is unsafe for that opening. There is not enough evidence to attribute all of it to one of the five bugs above.
- The low-health gate-steal policy can strand thousands of gems, but that is an objective-planning failure rather than an illegal API action.
- The full corpus has no native Bot error events. Silent logic bugs do not require a crash or engine-reported fault.

## Practical priorities

1. Correct shield accounting, ready-spell selection, and area-spell reach; generalize the intended banking-protection path to the actual draft.
2. Replace the Monolith's unconditional safe-ring assumption with a survivable objective plan.
3. Improve complete camp → capture → delivery → shop cycles, and measure support/escape quality against same-lineup opponents.
4. Test build alternatives by context. Mite's Jungle-first and Still Testing's Monster-first are useful experiments, while E=mc's same-build wins show that changing purchases is not required for every improvement.

These are recommendations only. No fixes have been applied or evaluated as new bots.

## Interpretation limits and artifacts

Map and side are confounded in this schedule: each map was played from one fixed side. Each opponent has only ten games on its assigned map subset. Per-team figures below describe **their winning normal-map games**; total opponent wins additionally include specialized boss games. Avoid comparing these rows as an intrinsic ranking of teams.

The targeting proxy counts a native basic attack as a same-target follow-up if a different ally attacked that target within the preceding three rounds. Extra bodies, geometry, and enemy movement affect it; it does not prove a shared-memory protocol or enemy source implementation. A first-attack episode starts after more than ten rounds without that champion making a basic attack on an enemy champion. Local numbers use omniscient replay positions within six tiles and include the attacking champion; walls and personal sight are not reconstructed.

The source-only counterexamples are in [verify_bugs.py](verify_bugs.py), [source_counterexamples.cpp](source_counterexamples.cpp), and [bug_counterexamples.json](bug_counterexamples.json). They exercise exact extracted v53 source expressions. [prism_windows.json](prism_windows.json) records the replay cooldown windows. All-opponent aggregates and the selected purchase/targeting traces are reproducible with [compare.mjs](compare.mjs) and [details.mjs](details.mjs).

## All 50 opponents

See the table appended below. Rates are camp groups per 100 rounds; deaths are body deaths per game. `Ours / theirs` always refers to the normal-map games that opponent won.

| Opponent | Their wins / 10 | Normal wins examined | Captures: ours / theirs | Deaths: ours / theirs |
|---|---:|---:|---:|---:|
| E=mc^2+AI^3 | 9 | 8 | 3.23 / 3.94 | 9 / 1.5 |
| The Mania | 8 | 7 | 3.49 / 5.28 | 15 / 3.14 |
| EggsAfter11AM | 8 | 8 | 3.88 / 5.38 | 12.38 / 5.63 |
| Supaswag | 8 | 8 | 3.9 / 4.84 | 12.75 / 9.63 |
| Nameless | 8 | 7 | 2.82 / 5.78 | 21.86 / 3.29 |
| KratosMessi | 7 | 7 | 4.18 / 6.65 | 13.57 / 2.29 |
| sudo rm -rf Imperial | 7 | 7 | 3.8 / 5.47 | 13.86 / 1.57 |
| filter | 7 | 6 | 2.92 / 3.76 | 7.17 / 4.67 |
| PENTAKILL | 7 | 6 | 2.18 / 5.69 | 16.83 / 3.5 |
| print dont int | 7 | 6 | 2.52 / 5.22 | 21.5 / 2 |
| Sneaky Bush Campers | 7 | 7 | 2.78 / 6.48 | 21 / 1.86 |
| AlphaSlop | 7 | 7 | 2.63 / 6.84 | 24.29 / 7.29 |
| SSSA | 7 | 7 | 3.23 / 4.52 | 27 / 9.86 |
| HouseOfCoders | 7 | 6 | 2.81 / 3.94 | 22.33 / 1.83 |
| Bamboo Teahouse | 7 | 6 | 3.64 / 3.96 | 8.67 / 1.83 |
| Lucky Lock Pickers | 6 | 6 | 3.25 / 3.73 | 13.17 / 4.83 |
| SilverSamurai | 6 | 6 | 5.17 / 8.07 | 5.5 / 4.67 |
| Sic Mundus Creatus Est | 6 | 5 | 3.96 / 6.89 | 13.6 / 5 |
| :3 | 6 | 6 | 4.52 / 6.29 | 12.83 / 4.83 |
| subscribe to caterpillow | 6 | 6 | 3.75 / 5.04 | 3.33 / 3.67 |
| Nyx | 6 | 5 | 2.49 / 5.15 | 19.2 / 5.2 |
| Noobot | 6 | 6 | 3.45 / 5.74 | 11.83 / 1.83 |
| Gem Simons | 6 | 6 | 3.57 / 5.79 | 7.67 / 2.83 |
| Valenki | 6 | 5 | 2.19 / 4.02 | 15.8 / 2.8 |
| wawow | 6 | 6 | 3.78 / 5.08 | 17.5 / 4.67 |
| BBL | 6 | 6 | 3.37 / 4.86 | 16.83 / 6 |
| 剑桥夜爬者 | 6 | 5 | 2.15 / 4.66 | 27.8 / 5.4 |
| SquidProxyLovers | 5 | 5 | 3.65 / 7.23 | 10.4 / 2.6 |
| 𓎼𓃭𓅱𓂋𓇌 𓏏𓅱 𓂋𓄿 | 5 | 4 | 2.11 / 4.16 | 17.75 / 3.75 |
| Mite | 5 | 5 | 4.39 / 8.13 | 9.4 / 4.8 |
| geese geese go | 5 | 4 | 2.67 / 4.85 | 9 / 1 |
| smurphy | 5 | 5 | 4.88 / 7.03 | 2.6 / 2.2 |
| ha²t | 5 | 5 | 2.74 / 3.94 | 9 / 5.6 |
| SkuBap | 4 | 3 | 2.14 / 3.05 | 10.67 / 9 |
| error404 | 4 | 4 | 3.77 / 5.47 | 4 / 5.75 |
| tip | 4 | 3 | 2.66 / 3.68 | 13.67 / 5.67 |
| QS2isLaw | 4 | 4 | 2.32 / 2.16 | 22 / 4 |
| Brakence Fan Club | 3 | 3 | 4.09 / 6 | 21.67 / 8.33 |
| noobers | 3 | 2 | 2.17 / 4.55 | 33.5 / 0.5 |
| meow | 3 | 3 | 2.05 / 4.49 | 27 / 6.67 |
| EvilMangohh | 3 | 2 | 3.35 / 3.79 | 2 / 0.5 |
| Rogue Fog Walkers | 3 | 3 | 5.15 / 4.28 | 7.67 / 8.67 |
| cache_v2 | 3 | 2 | 2.54 / 4.03 | 5 / 3 |
| SkibidiSloppers | 3 | 2 | 2.13 / 6.02 | 20.5 / 2.5 |
| Quant Merch Traders | 3 | 2 | 3.86 / 3.97 | 13 / 3.5 |
| Still Testing | 2 | 2 | 3.34 / 7.26 | 2.5 / 4 |
| Martin Shkreli's Defense Team | 2 | 2 | 2.89 / 4.77 | 1.5 / 2 |
| Ninja Turtles | 2 | 2 | 4.15 / 5.69 | 4 / 2 |
| dromedaries | 2 | 2 | 3.98 / 3.58 | 33 / 17 |
| kitfunso | 1 | 1 | 2.09 / 3.38 | 1 / 6 |
