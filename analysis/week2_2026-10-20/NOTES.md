# Week 2 patch (20 Oct 2026): what changed and the first post-patch meta

## The patch
Source: platform patch notes "Patch Notes – Week 2" (`docs_check/pages/patch-notes-week2.txt`); CLI 3.0.1, engine `v1_0_0`, live on the ladder from about 05:39 UTC on 20 Oct.

- **Nerfed:** Cassi & Issac (scaling), Stellar (Focus 100→85, Strength 35→30), Ren, Ryth and Varg (Strength), Tavi (stun damage 2.2→1.4 ×Focus).
- **Buffed:** Marcella (2 gold per gem tributed), Willow (Strength 55, Focus 120), Vesper Vale (33% bonus gold), Vendetta, Prism (1 Focus per carried gem).
- **New champion:** Heart of Ruin.
- **Camp rewards cut:** Wolf 40g/4 gems, Elk 90g/15 gems with range 4, gem and gold clusters now 120 HP (7 gems / 20 gold), Monolith range 5.
- **New camp, the Golem:** 5,000 HP, 120 strength, range 4, 160g/36 gems.
- **Other:** kill reward 100 gold (was 50), ward cooldown 10 (was 1), altar lock 5 HP.
- **SDK breaking change (dash ability data).** Old submissions using it no longer compile and are dropped from matchmaking. This is why the team had no active bot this morning; teammate's v25 errored.
- **Map pool now 21 maps:** 11 reworked (`00*`) plus the 10 Sprint 1 maps (`01*`). packs, pilgrimage, rows, rushbait_v2, stampede and swirl were removed.

## Data
- **Nyx (#2, 2114):** 126 post-patch matches on engine `v1_0_0`, 6 per map (`replays_week2/2_Nyx`).
- **Intercontinental Fish (#1):** its 126 downloaded matches are on the new maps but the **old engine** (`v0_0_3`). Fish had not played on the new balance yet (its bot may have been dropped by the SDK change), so Fish's numbers below describe old-balance play.

## Post-patch meta (Nyx, engine v1_0_0)
| | Nyx (post-patch) | Fish (new maps, old balance) |
|---|---|---|
| Win rate | 0.95 | 0.89 |
| Game length | ~1,230 rounds | ~550 |
| Tributed by round 500 / 1000 | 237 / 709 | 877 / 958 |
| Captures per game (ours vs theirs) | **59.6 vs 31.1** | 13.6 vs 9.8 |
| Gems / gold per capture | 10.3 / 83 | 36 / 128 |
| Main captures | Gold clusters (GoldCluster2: 13.5 per game), Wolf + cluster, Elk + gem cluster | Gold clusters, Wolf/Elk + clusters |
| Tributes per game (avg / median gems) | 31 (32 / 22) | 14 (79 / 60) |
| Recalls per game (median HP) | **88 (75%)**, 56% healthy | 30 (52%) |
| Champion kills / deaths per game | 9.9 / 1.6 | 7.1 / 1.1 |
| Fight openers | stun 1,110, AoE 1,450, damage 216, basic attack 462 | stun 452, AoE 352 |
| Time dead / farming / fighting | 7% / 18% / 1.5% | 5% / 19% / 2% |

Drafts (`drafts.txt`):
- **Most maps:** both teams still play Stellar / Ren / Cassi & Issac / Ryth / Varg (3 picks: Stellar / Ren / Cassi & Issac).
- **big_world:** Fish Cassi & Issac / Vendetta / Varg / Stellar / Ren; Nyx Varg / Vendetta / Cassi & Issac / Willow / Ryth.
- **fracture:** Fish Cassi & Issac / Vendetta / Varg / Stellar / Ren.
- **eight, boss_battle (Nyx):** Varg / Vendetta / Cassi & Issac / Willow / Ryth.
- **gold_rush (Nyx):** Varg / Stellar / Cassi & Issac.
- **contest:** Fish Stellar / Tavi / Prism / Cassi & Issac / Ren; Nyx uses its default team.

## Where our bot stands
- **v26 (edge)** was submitted at 05:35 UTC, built on the new SDK and is active.
- **First 4 ranked groups on the new patch:** 1 won, 3 lost (team #149, 1652).
- **Local gauntlet on the new engine and 21 maps:** edge 75% overall, but only 55% against v21 (76% pre-patch).
- **Weak maps:** big_world 2/10, fracture 4/10, interlock 5/10, expanse 6/10.

## Next steps (planned)
1. **Map-specific drafts:** the Vendetta/Varg team on big_world and fracture (and Nyx's melee team on eight and boss_battle).
2. **Economy:** a gold-cluster-heavy target choice, frequent healthy shopping recalls, smaller tributes. Fit the camp-choice rule on Nyx's post-patch decisions (`cands_2_Nyx.jsonl`) instead of pre-patch ones.
3. **Re-run the feature ablation on engine v1_0_0** (the flag set was chosen under the old balance).
4. **Re-download Fish** once it plays on the new engine, and add more post-patch top teams (Mite, Univardisty, procless) for a broader sample.
