# Continuing goal: win more on the platform

User explicitly asks to keep trying until fixes beat opponents and platform wins increase. Do not end at a proposal or a small noisy local improvement. No browser computer use, no sub-agents. Use scripts. Preserve rank/half-rank split and prioritize weak maps.

Starting version v120 (first prior trial 37/100; its source unchanged). Previous complete report is analysis/v114_fix_c100_2026-10-29/REPORT.md. Prior original v114 is still unchanged.

## Candidate v121

workspace/bots/v121-income/src (frozen candidate_source_hashes.json; uploaded_v121/src was compared and matches all 22 files).
Version 121 ID c31510a8-9504-469e-8e2d-4ad2e5efc6ec. Uploaded 16:00:53 UTC, compiled/active around16:10, explicitly activated and pinned. v120 ID f39c9c13-8011-498a-966c-4e9342184d22.

Changes from v120: Prospector first instead of Treasure (same cost/stats, stronger captured gold and gem economy); early objective commitment only on gated maps whose teams are walking-disconnected when boss groups block routes (draft metadata 0x51 and quietGateMap; true for Boss Battle, false for Guardians); cheap budget-safe attack on the current visible assigned camp with no enemy visible, preserving melee attacks after movement/planning; longer rescue ETA accepted when multiple enemies threaten a caller. Optional Willow draft was screened but OFF in the platform candidate. Existing route/bank/pressure/retreat repairs retained. Channel-safety guard still OFF.

Local screen screen_c1: 300 official games, no faults/source drift. Control43/60, income47/60, income+help47/60, optional Willow variants42/60 and43/60. Small scores treated as noise. Selected by mechanism and regression check. Native fixed-recorded-draft probes in behavior_probe.json show first500 Boss Battle attack turns811 vs previous56, no errors, plus useful helper arrivals on Elk/Treasure. Final exact-source smoke won 1012–92 vs v114 on Gemfight, zero faults. Candidate trace source workspace/bots/v121-income-trace, release build complete.

## Matched platform test paired_c1

Fresh rank117 snapshot platform_state.json. Each arm100 games (20 challenges), same20 opponent teams/maps/sides. Ten teams around half-rank ranks54–63; ten near ranks112–122 excludingself117. Per arm50strong/50near and50sideA/50sideB. 80 games on weak maps,20reference. Plan/specs each arm saved.

This is 200 new platform games total for a contemporary matched control, explicitly announced to user. Do not resend accepted challenge intents. Sender sends onePOST only and saves receipts. Lock owner codex-v121-paired-20261029, held through both arms. Current sender automatically refreshes lock every60sec until all groups finish. After completion verify and unlock. User authorized ongoing iteration and further platform trials. Quota50/hour; control+candidate use40 this hour, leaving10 until rolling reset.

Control v120: all20 groups/100 games complete, all downloads and statistics complete. 38/100 =13/50strong,25/50near. completion.json stores totals. All100 replays in paired_c1/control/platform; metric partitions0..3 complete.

Candidate v121: all20 challenges accepted and running/finishing. Ledger, receipts, groups under paired_c1/candidate. Sender process session75957. Collection process session94799. Statistical watcher session3497. Matched comparison watcher session57579. Control visual extraction session83115. All stored processes are tools.exec_command sessions, poll with tools.write_stdin.

### Scripts

- send_arm.mjs DIR SUBMISSION_ID VERSION: exact20 sender, no automatic POST retries; waitsallfinished, verifiesversion, holdslock. Already used for both arms. Do not rerun indiscriminately.
- analyze_arm.mjs DIR --part0..3: incremental fullmatchreplay metrics, imports existingdecoder; skipalreadyprocessed. watch_arm.py DIR loops until100 processed.
- compare_arms.py: joins current collected control/candidate by(label,map,side), saves paired_c1/comparison.json, pairs.json, paired_matches.csv. Gives gains/losses, pooltotals, capture/death/wealth300 deltas,20-opponent cluster-bootstrap netwins interval once100 pairs. Re-run after candidate stats finish because compare watcher can see100indexbeforeallmetricspartitionscomplete.
- watch_comparison.py reports partialmatchedcountsasindexgrows; stopsat100.
- Existing mass_visual.mjs in previousanalysis folder accepts any INDEX OUTJSON, incremental extraction. mass_visual.py renders6cases/page. Control visual extraction in progress -> control/visual.json. Candidate still needs extraction/render and actual visual review of losing cases after collection.
- Previous shadow_trial.py imports current root via own path; accepts INDEX OUTDIR BOTNAME; filters all losses+winningreferences, nativefullshadowstageaudit. Use botv121-income-trace for candidate, can copy/adapt watcher ifuseful. Fullmatch authoritative metric/visual decoder doesn't depend on nativeapproximatefuel. Filter nativefidelity>=.98 and no preemptions for attribution.

## Critical next actions

1. Wait for100candidate results and compare against contemporaneous v120control38/100, not old37/100 acrossdifferentteams.
2. Analyze capture/income300 and deaths to verify strategic mechanism, not merely passive +25% reward. Visually inspect all candidate losses via trajectorysheets plus detailed exactframes on key gains/losses. Fullstatistics100needed.
3. If meaningful platform improvement (aim materially above38, ideally majority wins with broad gains includingstrongpool), keepbest active; if onlysmall/inconsistentgain, continue developing/testing next candidate instead of declaring resolved. User saidkeeptrying. Do notpromoteoptionalWillowfromsmalllocalscore. Candidate draft unchanged fromv120.
4. Verify allgroupstatuses/version/errors, sourcehashes, exact accepted counts, thenunlock after active-dependentmatchescomplete. Keepbestworkingbotactive. Build/report artifacts and concise finalonly after meaningfulgoalprogress.

Potential next bottlenecks ifv121insufficient: team formation/coveringfire beforeengagement; fixed600 gateassault without staging; soloescapeconcedesobjective; large unspent gold in ongoing fights; late banking throughput. Avoid blindly copying previous uploadedrally fixes. Currentcodealreadyhas1155 assigned-help turns across reliablev120shadowgames, but old utilitysubtracted55perETAandfilteredmany3–5turn rescues. Newhelprepair specificallyrelaxes multi-enemy emergency utility.

Both platform arms finished100/100, lock released after version/error/count checks. See paired_c1/completion.json for final raw outcomes; download/statistics/visual review still required.

Final raw paired result: v120control38/100(strong13/50,near25/50), v121candidate55/100(strong19/50,near36/50).20gains3losses net+17. Botharms0reportedbot/infrastructureerrors, correctversions100each. This is meaningful platform improvement; finishstatistical/visualverification and keepv121active. Useralreadytoldresultsincommentary. Do notsendmorematchesunlessnewunresolved concernjustifiesiteration.
