# v122 delivery follow-up (30 October, local time)

User said continue after v121 achieved 55/100 vs contemporary v12038/100. v121 report now completed at ../v120_iterate_2026-10-29/REPORT.md. Keep v121 as protected baseline until evidence warrants promoting v122. No browser or subagents. User authorized continuing uploads and rank-split unranked tests; use scripts.

## Mechanism / candidate

Source workspace/bots/v122-bank/src. Frozen candidate_source_hashes.json. v121 and original v114/v120 unchanged. Trace source v122-bank-trace (PHASE2_LOG2) built release. F_OBSERVED_CHANNEL=true and F_BANK_FIGHT=true. Legacy predictive F_CHANNEL_SAFETY remains false.

Read two remaining Boss Battle losses via exact turn traces (near_r115_04.jsonl, strong_r54_01.jsonl). Generated and visually viewed images/near_r115_04.png and images/strong_r54_01.png (4 frames each). First loss: Vesper starts845-gem85-turn channel731; enemy Vesper hits891 per turn737–742; dies743 without any counteraction, handing over bag. Second:1336-gem134-turn channel732 interrupted by a lock736, another747, stun753, immediate restart754. Healthy carrier ignores nearby enemies to restart. Allies remain several tiles away.

Changes: long carrier (>=200 gems) within3 of altar invokes existing legal combat before tributing if visible enemy within6; a genuinely interrupted channel with bag still held gives combat8 turns before retrying while enemies remain nearby. Separately observe actual consecutive-turn HP loss while submitting; if remaining>2 and HP<=3 times last actual loss, cancel and release ordinary combat/recovery. No speculative full-channel damage projection. Cancel is observed to consume the remainder of its decision budget in the hard case; escape occurs next turn, still saving the carrier. No enemy means no retry delay. Cheap short deposits retain priority. Reduce new vision scan to big bags or active recovery so ordinary small deposits pay no extra API queries.

Initial 240-game official local screen: baseline47/60, observed47/60, bankfight46/60, both46/60. Zero faults/source changes. Treat scores as noise. Treasure regression's FIRST divergence at round93 with empty bags before either rule runs; budget/compile perturbation, not direct banking effect. After narrowing unnecessary API scans, final72-game screen: baseline31/36, combined32/36, zero faults/source drift. Again not strength evidence.

Native recorded-opponent probes: changed carrier cancels at740, escapes741 and recalls742 with845-gem bag instead of death743. Interrupt-vs-lock carrier attacks weak enemy Stellar at736 instead of spending every turn on lock/restart. Full changed probe ends first case1117–0 at1315, second1609–272 at1100. Native unchanged v121 live replay also diverges and can win second case; these are executable mechanism tests only, not proof of match strength. Pre-live action agreement ~99%; no preemptions/errors. Old Broken Curve counterfactual currently loses with new bot at1100 but no cancellation, HP remains6400 until1098; requires same-v121 control comparison before interpreting. Prior v120 source won1099 but current v121 has different budget/flags. Do not attribute the difference to this fix without control.

## Paired platform test paired_c2

Fresh planning rank110, quota0/50. 20opponents per arm:50near ranks104,105,107,108,109,111,112,113,114,115;50half-rank ranks50–59.100games/20challenges each for exact same maps/opponents/sides across v121 control and v122 candidate.40challenges total for contemporary control. Both pools have25A/25B and identical weakness map counts. Each arm20Boss Battle,10eachTreasure/Lanes/Elk/Guardians/Line/Cuts,20reference maps =80weak/20ref. Specs and plan saved. User informed200newgames because matched control.

Lock owner codex-v122-paired-20261030, HELD. Control active pinned v121 c31510a8-9504-469e-8e2d-4ad2e5efc6ec. send_arm.mjs exact-one-POST sender with intents/receipts, never blindly retry. It refreshes lock through allmatches. Do notupload/switch until all100controlgamesfinish. Then upload v122, wait build, explicitlyactivatepin, send candidate20. During build refreshlock timestamp60sec. After botharmsfinished verifygroupstatuses100games/version/errors then release onlyafterappropriatebestactivepinned.

Running sessions at log creation:
- control sender27758: all20receipts,15/20finishedlastpoll.
- control collector99415: started before ledgercomplete, may only collect its initial subset. Allowfinish then rerun samecollector to resume until100 (skips IDs).
- control statistics watcher41958 (old analysis/watch_arm.py accepts new armDIR).
- control visual watcher55490 (old watch_visual.py accepts newarmDIR).
- final native probe20160: rerun after last source narrow and tracebuild, poll.
- final check79967 done72games.

Use ../v120_iterate_2026-10-29/analyze_arm.mjs and watchers for stats. For comparisons copy compare_arms.py into thisfolder and change hardcoded paired_c1->paired_c2, old controlversionlabels if needed. copy paired_visual.py similarly. Generic mass visual scripts in ../v114_fix_c100_2026-10-29/. Need statistical all100 each and ACTUAL visual review of candidate losses plus Boss mechanism audit before promotion. Lock is still held; finish authorized cycle.


## Upload interruption / retry

v122 ID8b42ce5f-bd1c-40df-81f0-ad039e458881 was queued then cancelled without compilerlog. READ-ONLY state proves selection changed externally: after_upload pinnedFalse selected122 active121; after_cancel pinnedTrue selected114 active121. No own script selects114. Candidate source exactlymatches22uploadedfiles. Attempt to selectcancelled122 was automatically rejected (tool NOT executed): could selectunavailable bot. Do notbypass; waitforready. User informedrejectionseparately. Saferretry identicalsource wasuploaded as v123 ID7032d2a6-c7be-47bd-85e5-c9e5b31a1fb4, selected123 pinnedFalse active121. Buildwatch60205 monitors retry_build_state.json andrefresheslock; inspectselection before anychallenges. Firstretryhadnote>80 HTTP400, noextraacceptedversion. Userinformedexternal114selectionandmonitoring. Do notactivateuntilready. Needreportfinalversion123ifsuccessful, candidatefolderstillv122-banklogic.

All100control downloaded/statistics/visualjson/authoritativebankauditscomplete; collector99415,stats41958,visual55490,bank74662 alldone. Control38wins:strong11/50,near27/50 (recalculateifneeded). Boss8/20,Treasure1/10,Lanes1/10,Elk6/10,Guardians7/10,Line3/10,Cuts4/10. Eachpool25A/25B, Boss5A5B perpool. **Othercoremapssidesarefixedbymap inthiscohort** fromsamplingrotation (TreasureB,LanesA,ElkB,GuardiansA,LineB,CutsA); samebotharms. Validpairedcomparisonbutlimitationforgeneralizingeachmapacrossbothsides; stateinthefinalreport. Donotmodifycandidateplanaftercontrol.

Control bankaudit100:35channeldeaths (24Boss),74large-bag deaths(66Boss),192interruptions(154Boss),117post-interruption combatturns(71Boss),486largecarriernearbankcombatturns(476Boss),zero voluntarytribute cancellations. Theseareauthoritativetraces, no nativefuelapproximation. bank_audit.mjs andwatch_bank.py acceptarmDIR; runforcandidateafterdownloads. late_visual.mjs samplesBossrounds600–1400; control20extractedlate_boss.json. render_late.py makes4pagescontrol/late_images (session65638). NeedACTUALviewthese. Candidateall100openingvisualmass17pages+lateBoss4pagesrequiredafterdownloads.


Retry v123 successfully BUILT and ACTIVE at19:01:20UTC. Explicit pin response candidate_activation.json active123 selected123 pinnedTrue. All22downloadedv123sourcefilesmatchfrozenhashes. Candidate20challengesallaccepted; sender96712 waitsfinishwithlockrefresh. Collector33869 waitsallledgerthenserialdownloads100. Statistics watcher75863, visualwatch63179, authoritativebankwatch54063. No new uploadsneeded. Needfinishcandidateall100statisticalandvisualreviewandbestversiondecision,finishversion/errorchecksandunlock. ControlBosslate4pagesACTUALLYVIEWED. Planactualcandidateis123because122cancelled.


## Final outcome / review complete

Botharms100/100finishedcorrectversionsnoreportederrors. Candidatev12341/100(controlv12138):strong15vs11,near26vs27.8gains5lossesnet3;clusterbootstrap95%[-2,+9],overallgainINCONCLUSIVE. Boss12/20vs8/20(5gains1loss),first300wealth/income/deathsidenticalonBoss. All100metrics,all100bankaudits,all100visualrecordsperarmcomplete. Authoritativebankcounts:tribute deaths35→11,large-bagdeaths74→49,interruptions192→139,afterinterruptcombat117→341,nearbanklargecombat486→1145.34voluntarycancels,allmeasuredrulematches;28alive10roundslater,26alive20. Boss24→6tributedeaths,66→36large-bagdeaths. Mechanismworksdirectlybutbroadproblemremains.

ACTUALLYVIEWEDcandidateall17openingpages(100games),all4lateBosspages(20games);controlall4lateBosspagesandall4Treasure/Lanesopeningpages(20games). Detailedactualcandidate1553-gemescapeat1038/39/41/48renderedandviewed,plustwooriginalv121failures. Findings.pngviewed. REPORT.mdcompletedwithcomparisonlimits,mechanisms,remainingrootcauses,paths. Lossdecompcandidate59:51neverwinningSupply,47behindwealth300. NonBoss51losses:50neverwinningSupply/50cap<1000,875deaths682zerobag428outnumbered. Treasure1/10,Lanes1/10unchanged. Nextdirectionresourcecircuits/allocationonquietmaps,pre-fightobjectivecoveroncontestedmaps;do notkeepaddingchannelthresholds.

Activebaselinev121restorationPUTqueuedarebuildwhilev123remainedready. Rebuildsuccessverified19:10:44UTC,thenGETsubmissionsandquotaagainactive121selected121pinnedTrue. LockRELEASED. Quotaused40/50resets19:50UTC. Savedsubmissions_final.json,quota_final.json,verification.json. v114andv121all22sourcefilesunchanged;candidate/uploadedv123all22matchfreeze. FinalBrokenCurvev121andcandidatebothwin1036–999round1099nocancels/nopreemptions(prelive96.7%,notexactfidelityclaim). Nativeinitialprototypebrokenlosswasnotfinalsource;resolvedbyfinalcontrolledcomparison.

Noadditionalplatformactionsrequired. v123retainedforfutureworkbutnotpromotedbasedonnoisy3-winbroadgain. Earlierprovenv12155/100vsv12038/100documentedpriorreport;donotmixcohorts. Noactivegoaltooloragents.
