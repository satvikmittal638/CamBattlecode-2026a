# v114 repair trial

User-authorized: build from v114, upload, exactly 20 challenges / 100 unranked matches, statistical and visual review. All platform interaction uses the existing scripts and session; visual feedback uses decoded engine states rendered with matplotlib. No browser computer use.

## Evidence and decision criteria

All 69 archived v114 matches were decoded and visually reviewed in 12 trajectory sheets (baseline_images/page_01..12), including all 35 losses. These omniscient diagrams show positions sampled every five rounds, captures and deaths. Straight segments through recalls are not walking paths. Detailed death and decision context comes from the earlier loss-pattern audit.

The dominant loss mechanism is early lost map control: repeated exposed fights while spread out, death downtime, and an equipment/capture deficit. Healthy, quiet farming games also lose gem races, so a blanket retreat threshold is insufficient. Depositing late and fuel starvation are additional concrete defects, not an explanation for every loss.

Behavioral hypotheses:

1. Preserve routing fuel by keeping valid objectives briefly and avoiding a full target rescore inside banking. A healthy Heart on lanes must produce a legal departure instead of its historical 701-turn spawn idle.
2. An urgent carrier (enemy bank >=900, own winning bag, or visible allied winning bags) should bank before optional shopping/fighting. Verify arrival and actual channel completion, not merely a different first move.
3. A tribute channel exposed to enough personally visible basic damage to die before completion should cancel and move. It must not repeatedly restart under the same threat.
4. A nonlethal damage trade against multiple attackers without actual allied covering range should yield to a lower incoming-damage position. This is targeted pressure handling, not global passivity.
5. When a failed retreat reveals occupancy, retry a bounded number of alternatives instead of selecting the same blocked tile until death. Calculate alternatives only on failure to preserve ordinary-turn fuel.

Small local win-rate differences are treated as noise. Local games check mechanics, crashes and major regressions; their narrow opponent pool cannot establish platform strength. Final ablation has 240 games, official faults 0: control 41/60, combined 44/60, pressure/retry 45/60, delivery/retry 41/60. These results support testing, not selecting a strategy by one win.

## Provenance

All candidate source originated in workspace/bots/v114/src. v118 and v119 were downloaded and inspected to understand earlier work. They were not used as the candidate source. The independent target-hold repair overlaps v118's fuel concern, but the direct banking rescore removal, pressure/coverage condition, unsafe-channel estimate, and failed-retreat retry follow the measured replay cases. Original v114 remains unchanged.

## Platform design

The frozen plan uses 20 distinct opponents: 10 around half our rank and 10 near our rank, 50 games each; 50 games on each side. All 70 maps appear. Ten diagnostic maps appear four times each, once on each side in each opponent pool; the other 60 appear once. See plan.json and specs.json. This deliberate broad sample is not a paired comparison with the historical archive. Report by opponent pool, side and map rather than treating an unadjusted archive win-rate difference as causal.

Precommitted observations: bot errors; death and outnumbered-death rates; round-300 equipment and capture value; captured versus submitted versus dropped/carried gems; long healthy idle runs; actual urgent deposit behavior; actual escape actions and subsequent outcomes. If these behavioral repairs work but losses retain early control/equipment deficits, the next hypothesis is objective allocation/coordination and opening economy rather than more late-game banking tweaks.

## Selection after replay verification

Channel safety is OFF for the platform run. With the replay-host channel-time and nullable list-query bridges corrected, the broken-curve carrier reaches the altar, hits its lock five times and starts submission at r1079; the multi-tick basic-damage estimate then cancels despite remaining at full 6400 HP. This is an undesirable interaction with urgent winning delivery. It is rejected on behavioral evidence, independent of a small local win-rate difference. The other four flags remain enabled. Initial shadow traces before the native list-query correction are diagnostic only and must not be used to infer a candidate banking defect. Native counterfactual opponents follow recorded actions; full-match outcomes are not causal strength evidence.

Final selected-source check: 24 official local games comparing channel guard on/off, zero faults and source drift. The selected variant won 9/12 versus 10/12 for guard-on; this one-game difference does not override the undesired channel-cancellation behavior. Selected candidate source hashes are frozen in candidate_source_hashes.json; original v114 hashes were verified unchanged. v120 was uploaded at 14:34 UTC (ID f39c9c13-8011-498a-966c-4e9342184d22). The first upload attempt was rejected for an overlong note and created no submission. No platform challenges are sent before successful build and explicit activation.

Corrected native mechanism result: broken_final_live.jsonl ends with round 1099, outcome 2 (our side B), submitted [999,1036]. The original finished 1013–836. This checks bank-route execution and timing under recorded opposition; it is not a fully reactive opponent comparison. elk_retry_live.jsonl shows a legal alternate step after blocked moves and Ryth alive at 1 HP on rounds 31–33, subsequently withdrawing. See mechanism_checks.png for the actual paths.
