# Strategy research and pending platform experiment — 30 October 2026

The scan-order candidate completed **100 platform games with 40 wins**, against **41/100** for the fresh v121 control. Three paired situations became wins and four became losses; the opponent-cluster bootstrap 95% interval for net wins is **[-5, +3]**. This establishes no strength improvement. The intended Lanes mechanism did work on the platform: early camp gold rose 26%, gems 67%, and deaths fell. However, opponents gained nearly the same additional camp gold, leaving the early gold deficit almost unchanged. More efficient farming alone did not resolve the winning problem.

All 100 candidate games were verified as v126, with no match errors, bot errors or version mismatches. Every replay was downloaded and statistically analyzed; the opening atlases of all 60 candidate losses were visually inspected, in addition to all 59 control losses. The guard stopped after completion. v125 was restored, active and pinned, and the lock was released at 03:40:42 IST. Another session then activated v127 after release. One additional restoration was performed under the user's explicit v125 instruction, without restarting the guard or sending challenges. **v125 was verified active and pinned, and the lock released again at 03:44:55 IST.** No further active-selection writes or challenges are running. [Final verification](validation.json).

All work used existing scripts and native replay tools. No browser computer use or subagents. These are independently investigated strategies; no claim of worldwide novelty is made. The candidate derives from the previously validated v121 descendant of v114, without copying v125 or combining the inconclusive v123 bank changes.

## 1. Computational territory: a camp can be nearby but rarely considered

The full and fallback resource scorers visit camps in ID order and stop at fuel reserves. On one losing Lanes replay, diagnostic action agreement was 98.67%, with no preemptions: 275 of 301 scoring scans stopped early, visiting an average of 69% of the 42 groups. Eligible low IDs were scored in approximately 88–100% of calls; eligible IDs 40, 38 and 36 were scored in only 11%, 19% and 27%. Several neglected camps were closer to our side than frequently scored camps. On reliable Cuts traces, all scans completed through its 25 groups.

[Computational coverage atlas](computational_atlas.png) maps scoring frequency onto the actual camp locations. Instrumentation consumes fuel, so attribution uses only traces with at least 98% action agreement and no preemption. The Treasure Box diagnostic with 52.7% agreement was excluded.

**Change:** each champion starts the full and cheap scoring loops at a different, fixed offset, `slot * groupCount / allyCount`. The loop wraps around. Existing resource utility, danger estimates and actions remain. The frozen source is [v124-partition](../../workspace/bots/v124-partition/src/v1_cycle.h); the platform retry is **v126**, ID `5e972af6-7b50-4071-8eb2-03349eda8f60`. All 22 uploaded source files matched the frozen hashes.

The initial 180-game local screen gave 44/60 baseline wins, 47/60 partition wins and 45/60 for a further knowledge-order variant. The final candidate excludes that extra variant. A separate 48-game check using the exact unchanged v121 source and exact final source gave 19/24 versus 17/24 wins, with zero faults. These small score differences are treated as noise, not evidence of improvement or deterioration.

The meaningful local evidence is the expected mechanism, measured by round 300 in six matched situations per map:

| Map | Gold captured: v121 → candidate | Gems captured: v121 → candidate | Deaths: v121 → candidate |
|---|---:|---:|---:|
| Lanes | 972.2 → 1160.0 | 65.8 → 112.0 | 0.67 → 0.17 |
| Treasure Box | 442.0 → 502.3 | 30.8 → 38.2 | 5.17 → 3.83 |
| Cuts | 1032.5 → 1033.0 | 105.8 → 106.3 | 0.50 → 0.50 |
| Elk Arena | 1023.7 → 1060.5 | 63.3 → 49.7 | 3.67 → 3.50 |

Lanes gained 19% gold and 70% gems; Cuts was essentially unchanged, consistent with the scan-budget explanation. Elk's lower gem collection is a generalization concern to check on the platform. These values are local, not platform results. Full numbers: [exact_mechanism.json](exact_mechanism.json).

## 2. Neutral monsters as indirect artillery — wake, escape, retain vision

An audit of 100 earlier v121 control replays found 91 opportunity episodes across 198 champion turns where visible neutral monsters appeared positioned to attack visible enemies preferentially. The audit used the champion's actual observations, including exact turn-start visibility of every camp member, legal attack availability, at least 60% health, and no carried gems. Episodes are champion/group opportunities separated by more than three rounds, not 91 guaranteed hits. See [personal perspective examples](personal_opportunities.png).

Native engine interventions verified the mechanism in two recorded situations:

* **Boss Battle, round 103:** one Marcella spell woke two Monoliths. Enemy Heart's HP fell from the control's 1000 to 380 by round 105; enemy Marcella reached 400 HP versus 1200 in the control by round 108. Our team's HP had no additional loss over that window.
* **Cuts, round 329:** a naive Vesper poke inflicted 200 damage on enemy Ryth but cost our Vesper 504 HP after the enemy moved and the monster retargeted. A revised intervention placed a ward, attacked, dashed away, then walked beyond the monster's firing range. Ryth took 400 damage, with no additional own-team HP loss by round 334. The ward preserved sight after escape.

[Intervention comparison](neutral_intervention.png). All six control/poke/escape probes had 100% action agreement before the intervention and no errors or preemptions. Opponents retained recorded actions; other own actions were paused equally across arms. This proves a controllable mechanic in those situations, not competitive strength against reacting opponents. The demo bots are scripted experiments and are **not candidates for upload**.

A practical policy needs an escape route and ability budget before provoking, a check of every visible group member, and a margin against enemy movement that changes the nearest target. Naive poking is rejected by its demonstrated health cost.

## 3. Salvage: take a cleared reward outside static territory

The original scorer excludes many camps based on distances from the two spawns even when the champion is currently nearby and the clear cost is zero. Actual-observation audits found 194 reachable cleared-reward episodes, plus one occupied-region denial episode, across the same 100 replays. These are not 194 unique rewards. We did not establish that enemies cleared every reward, or that approaching would stay safe.

One Fragment example offered 26 visible gems two walking steps away while static territory excluded the group. A visible enemy was four tiles from the region, illustrating why a three-tile threat exclusion can still be insufficient.

A standalone prototype considered personally visible, confirmed rewards within eight reachable walking steps, health at least 60%, bag below 44, and no visible enemy within three tiles of the region. Its 288-game four-way local screen gave baseline 55/72, partition 58/72, salvage 55/72 and both 54/72, with no faults. Salvage alone produced eight paired gains and eight losses. This does not establish that salvage is ineffective: the policy's actual selections and subsequent capture/escape outcomes still need auditing. Its overhead also consumes planning fuel. It is excluded from the uploaded candidate. [Detailed local metrics](salvage_mechanism.json).

## Fresh control: loss patterns and visual review

All 100 fresh control games finished on v121, with 41 wins and no version mismatches or match errors. All were downloaded and analyzed. The opening 300 rounds of all 59 losses were rendered into ten replay atlas pages and visually inspected. [Loss atlas, first page](paired_scan/control/loss_atlas/page_01.png); pages 01–10 are in the same folder. Trails are sampled every five rounds and may join dashes, teleports or respawns; they are not proof of legal walking paths. This is an omniscient review, separate from the personal-perspective opportunity audit.

| Repeated map | Wins | Our / enemy gold by r300 | Our / enemy deaths by r300 |
|---|---:|---:|---:|
| Lanes | 1/20 | 755.6 / 1285.1 | 1.70 / 1.05 |
| Treasure Box | 0/10 | 696.5 / 1345.3 | 6.60 / 1.90 |
| The Line | 3/10 | 311.9 / 414.1 | 4.50 / 1.10 |
| Boss Battle | 4/10 | 1960.2 / 2171.8 | 2.60 / 0.90 |
| Cuts | 5/10 | 978.8 / 976.3 | 0.10 / 0.00 |
| Guardians | 7/10 | 708.7 / 433.6 | 2.60 / 3.40 |
| Elk Arena | 8/10 | 1256.3 / 1267.4 | 2.50 / 4.70 |

On Lanes the blue opening trails repeatedly concentrate in the lower/central resource corridor, while several opponents exploit upper resources as well. Four Lanes losses had no death by round 300: early deaths alone cannot explain the deficit. The resource access hypothesis remains credible, but the scan intervention must show actual improved capture distribution on the platform.

Treasure Box shows repeated deaths near the spawn-side entrance and the adjacent corridor, across both sides. All ten losses had early deaths. This is a distinct exposure/engagement problem; more camp consideration may help income without resolving combat at that entrance. If partition improves income but those deaths persist, the next intervention should examine arrival timing and retreat options at the contested exit rather than changing resource weights again.

Cuts mostly shows separated farming paths in the opening with almost no deaths and similar gold, yet five losses. This is a useful control for the scan strategy. Resource travel, capture cadence and later conversion deserve separate attention there. Boss Battle shows deaths within each team's own half; the trail crossings alone cannot attribute those to enemy contact through the central barrier.

Across all 59 losses, mean round-300 gold was 804.8 versus 1242.8; deaths were 3.56 versus 1.36. Twelve losses had no own death by round 300. These are descriptive associations, not causal estimates. [Full diagnosis](control_diagnosis.json).

## Platform experiment and completion criteria

The planned comparison is a fresh 100-game control plus 100 candidate games: 20 distinct opponents per arm, five games each. Planning rank was 100. Half the games use nearby ranks 95–99 and 101–105; half use ranks 45–54. The two arms share opponents, maps and sides. Each rank pool has 25 games on each side; repeated maps are side-balanced overall. Weak maps receive priority: 20 Lanes, ten each on Treasure Box, Elk, The Line, Cuts, Guardians and Boss Battle, plus 20 reference games.

Both arms are complete. Upload v124 was cancelled following selection of v125; identical retry v126 was cancelled too. A direct selection after the user's “take over now” instruction queued v126, but v125 was selected again. Automatic approval review initially rejected a prepared 30-minute selection guard because repeatedly overriding another session could cancel its builds, and the earlier instruction did not explicitly authorize persistent overrides. The user then explicitly authorized that guard. It started at 03:21:50 IST, bounded to 03:51:50 IST, and v126 became active at approximately 03:31 IST. Candidate submissions began only after successful build and active-version verification. All 20 requests have individual saved intents and receipts; no duplicate challenge requests were made.

The assessment follows the stated criterion: paired wins with uncertainty clustered by opponent, alongside early income, spatial capture distribution, travel and deaths. The predicted income improvement occurred without an overall win improvement. Opponent version numbers are private in the match metadata, so exact opponent-binary stability cannot be established; the teams, maps and sides are matched. Both teams' drafts matched in all 100 pairs. Planning rank was 100; rank at candidate send was 96, leaving the saved cohorts close to the requested rank and half-rank ranges.

## Completed platform comparison

| Cohort/map | v121 control | v126 partition |
|---|---:|---:|
| All | 41/100 | 40/100 |
| Half-rank pool | 16/50 | 16/50 |
| Near-rank pool | 25/50 | 24/50 |
| Lanes | 1/20 | 2/20 |
| Treasure Box | 0/10 | 2/10 |
| The Line | 3/10 | 2/10 |
| Boss Battle | 4/10 | 3/10 |
| Elk Arena | 8/10 | 7/10 |
| Cuts | 5/10 | 4/10 |
| Guardians | 7/10 | 7/10 |
| Reference maps | 13/20 | 13/20 |

[Platform comparison figure](platform_comparison.png), [paired statistics](paired_scan/comparison.json), [all matched games](paired_scan/paired_matches.csv), [spatial measures](paired_scan/spatial_comparison.json).

On Lanes, by round 300:

| Measure, mean per game | v121 | v126 |
|---|---:|---:|
| Our camp gold | 755.60 | 952.65 |
| Enemy camp gold | 1285.10 | 1481.00 |
| Our gold deficit | 529.50 | 528.35 |
| Our captured gems | 54.80 | 91.50 |
| Enemy captured gems | 134.45 | 151.55 |
| Our deaths | 1.70 | 1.05 |
| Our farming champion-turns | 313.65 | 417.25 |
| Our moving champion-turns | 755.65 | 709.40 |
| Our fighting champion-turns | 40.05 | 24.55 |
| Enemy fighting champion-turns | 48.25 | 28.65 |
| Distinct own capture locations | 9.0 | 11.5 |

Gold improved in 17/20 paired Lanes games; gems improved in 18/20. Paired bootstrap 95% intervals for the mean changes are +100.8 to +292.6 gold, +25.85 to +46.95 gems, and -1.15 to -0.15 deaths per game. These characterize this cohort; they do not establish general strength. On Cuts, early gold, gems, worth and deaths were exactly identical across arms, supporting the computational-budget explanation. On Boss Battle, early gold fell from 1960.2 to 1767.1, so the ordering change has a material map-specific tradeoff worth preserving in future investigations rather than assuming it is globally benign.

The Lanes improvement is visible in the atlases: more trips and captures extend beyond the original narrow concentration. Most additional gems still come from the lower/middle bands; upper-band own gems rose only 0 to 3.4 per game. The opponent's upper-band collection remained about 28. Nine of the 18 remaining Lanes losses had no own death by round 300. Lower mortality and better own resource use have not closed the resource race. The near-identical gold deficit and reduced fighting time on both sides motivate testing **relative resource control**: a strategically chosen contest or safe denial can matter more than another increment to uncontested personal farming. This is a next hypothesis, not proof that greater aggression would help.

Treasure Box's early deaths stayed 6.60 → 6.70 despite two additional wins. Early camp gold stayed 696.5 → 696.9, and gems fell 53.0 → 47.7. Its mass visuals still show repeated deaths at the spawn-side approach. The two wins are insufficient evidence that the scan fix resolves this map. The healing-access audit below remains relevant, alongside earlier threat-aware retreat timing.

The frozen candidate also reproduced native platform actions over the first 600 rounds with 100% agreement in seven diagnostic cases and 99.93% in the eighth, with zero faults/preemptions. [Fidelity data](candidate_shadow_summary.json). These shadow checks establish implementation fidelity, not match strength.

The selected strategy therefore remains a verified resource-access repair with **unproven overall competitive value**. It was not left active; v125 was restored according to the user's explicit instruction. Future strategy work should target the persistent relative resource deficit and contested-area survival, and separately investigate the Boss Battle tradeoff. The salvage and neutral-artillery ideas remain isolated experiments, not hidden additions to this test.

## Further perspective: healing access is a team resource

Additional exact personal-view frames from a fresh Treasure Box loss show Marcella standing immediately outside the spawn boundary. She takes damage while her health remains above the ordinary 35% retreat trigger. By round 14, at 279/1200 HP, allied Heart and Vendetta occupy both adjacent spawn tiles, blocking a one-step walk into healing. This is distinct from simply asking the injured champion to retreat: allies can consume the entry capacity. [Four exact turn-start frames](treasure_opening.png).

A first figure draft selected a numeric champion ID that shifted because the opponent drafted six units. The extraction was corrected to select Marcella by champion type, regenerated and visually checked before using this example.

Across all ten Treasure Box control replays, the audit found 87 state-specific episodes where a champion below 60% health could move, was one step outside spawn, and had a visible enemy within four tiles. Nine episodes (14 turns) had every adjacent spawn tile occupied by allies; five of those turns occurred within three rounds before that champion's death. Episodes split when blocked/open state changes, and are not independent causal samples. Dashes may bypass walking congestion for some champions. Script: [spawn_access_audit.mjs](spawn_access_audit.mjs); data: [spawn_access_control.json](spawn_access_control.json).

This motivates an untested coordination policy: keep a healing entry available, move healthy occupants deeper into spawn when a wounded ally approaches, and consider damage pressure before the fixed low-health trigger. It is not included in v126. It should be tested with admission/escape outcomes and resource opportunity costs, rather than assuming a reduced death count necessarily improves wins.

The same audit on all ten v126 Treasure Box replays found 95 state-specific episodes, including ten blocked episodes across 15 turns; five blocked turns were within three rounds of death. The scan change did not remove that condition. This accounts for a minority of the 67 early deaths, so healing-entry congestion should not be presented as the complete explanation.
