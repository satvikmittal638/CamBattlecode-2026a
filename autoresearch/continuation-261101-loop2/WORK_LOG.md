# Loop resumed1November07:32UTC

User explicitly instructed continue until improvement, overriding the previous plateau checkpoint. Sprint3deadline passed with original114active; API reports no upcoming tournament and submissions allowed. Keep114as fallback until stronger candidate is verified.

User additionally requested114among testing bots. Fresh source audit verified all22files against original submission a9c2b69f-39b7-4f61-8f51-c6b34200e380. Frozen localopponent `arop-v114` now in default `local_plan_with_v114.json`: original96cases plus16casesvs114,112total,11opponents. Original plan preserved; Codex runner default updated.

S21prototype `ar-marcella-bank-1101`, base141, commit0d8c427: compute whether camps provide no gold; only Marcella on those layouts ignores H1small-bag waiting. Capture and quick-camp batching stay unchanged.

Target24cases vs6exact versions:10->12wins,+3/-1, margin+84.4/game, deaths8.33->7.92. Native round300 economics: Gemcombat2Marcella gold139->167.5, team score139.5->172.5, first tribute mean203->161 (one candidate case nevertributes). Gemcombat1first tribute186->41, team score218->268; Marcella goldmixed261->227while total gold328->352 and deaths2.17->1.42.

Actual visualreview ofall4localflips in1pairedatlas. First-action-divergence audit: all4firstdifferences are Marcella bank-path moves, at rounds14,14,85,75. No early initialization-action divergence precedes those examples.

Original96guard60wins in both; expanded112guard69->68, single lostGemcombat2vs114B, strong-mapguardpasses; archived24guard14->13(single h14LanesB), margin-12/game. Treat these minor localdifferences as inconclusive rather than selecting or rejecting onnoise; require online evidence and investigate systemic losses. Extra harmless-layout guard onGemcombat3/4/5 running.

Fresh platformplan at rank102: new10opponents,5near rank99–104 and5near rank47–54.50games/arm with35weak15strong; targetGem1&Gem2each10cases (eachbalanced5sidesA/5B);30othercases. Opponent/map/sidesfrozen beforecandidate and sourceGroupIdpins eacharm. v114baselinecompleted17/50withzeroerrors/wrongversions.

Additional guardresults:112games69->68(single Gem2vs114B lost), archived24games14->13(single h14LanesB), extraGem3/4/5twelve games5->5withidenticalscores/deaths. Localdifferences are small; targetmechanism verified by first-action-divergence and economic timing; platform decides.

Build-audit correction: commentcleanup rawWASMhashchanged; a chainedtoolstep erroneously continued after assertion and uploaded142beforethis was resolved. No142challengeswere sent. Commitmessageclaim identicalWASMretracted/amended. Rebuilding unchangedsourcealsochangesrawcode; only6functions exception-handlinglayoutsdiffer (119bytesinonecomparison), imports/data/exports/typesunchanged. Same-sequencecalibratedturnhostcomparison of6replays/7200turns perbuild shows0actiondifferences and0fuel deltas. This is sampledbehavior verification,notuniversalbinary-equivalence proof. Detailedraw andshadowaudits retained. Sourcecommentsnowaccurate; allgameplaycodeunchangedafterlocaltests.


S21 platform completed: exact114 17/50, v141 control16/50, banking14214/50. Matched142vs141: target20 8->6 (+2/-4); other30 all outcomes and final scores identical; no wrongversions/errors. Reject142as an improvement. Freshv143sourcearchived23files, original114base plus help78/quick3/chase.35 and conditional40+group shortlisting; full50control running, pinned114opponents.

Draft scout A exact114base swaps Ryth for Cassi&Issac only on no-camp-gold layouts. Extended32cases include114,132,133,143 each onGem2/3/4/5 bothsides:17->23wins (+10/-4), margin+228/game, deaths7.72->8.97. Gem2/3 (4picks) drive gains; Gem4/5 (5picks) net little. Actual14pairedflips reviewed on3atlaspages throughr300. Gem2/3 capture throughput rises; Gem4/5 extra turns largely movement/idling/deaths. Issac/Cassi linked deaths visible. Native round300 economics recorded. Simple role ablation Ryth->Vendetta on4pick noGold, same32cases,17->16 (+2/-3); no support for missing farmer role alone. Prism3pick noGold scout7->7/14 with worse margin/deaths rejected.

Narrow structural candidate ar-free-turns4-1101 retains114 draft except4pick noCampGold, where Cassi&Issac replaces Ryth. No mapnames. Full112guard running vs exact114baseline52/112. v114 permanent opponent remains present in default112plan and32draftscout. No new uploads yet. v143 platform selection/build may take minutes; no override guard running.


v143 platform50finished15/50 vs11417/50; +2/-4, weak10->10,strong7->5. No faults. Not accepted asbest. Source144uploaded22exactfilesverified, candidatear-free-turns4-1101. Gameplaycommit42d7296;generated-ignoreonly e750bfb. Frozenactuallytestedraw+injectedWASMcopiedwithhashes atfree_turns_analysis/tested_build. Control143localdraft interaction17->19/32, weaker than114base17->22; no blindstacking. S21v144armrunning,pinned114same50; nextfreshS22plan50vscontrol50forconfirmation onnew10opponents, rank101,70%weak25near25half, targetsGem2historicalstrong+Gem3weak(v1143/8scout). Source14315/50providesnocause to switchcandidatebasefrom114.

User suggested computational geometry and gold/gem/distance weighted graphs. Current114alreadyusesobstacleawareBFSandweightedone-targetscoring; lacksroute insertion/end-to-end sequence comparison. Officialengine2.0.0 mapgraphs extractedforall70maps atgraph_routes_analysis/graphs.json: perteamstaticwalking distances, physicalcampanchors, closest-regionmetricandanchorpointmetric, gold/gems/HP/damage,bank/home distances. Confirm4picknoGoldscopeexactlyGem2/Gem3. Staticdistancesexclude dynamicoccupancy.

New separategraphprototypear-graph-bank-1101 exact114base: replacequick-camp absolute5tilebankingrule with two-path comparison bank-now vs insertquickcampthenbank. Usescompletedwalkingfields,fullbankdeliverytime,bag+gem+existinggoldweight,reusescleartime<=8anddeadline/safetydecisions. Adds conservative|camptiles|-1internaltraversalbound toprevententer/exit-node teleportshortcut. Fallsbackto114rulewhenfieldsincomplete. Throttledgraph_banklogsrecordactualchangeddecisions. Full112localguardrunning;no graphuploadyet.


Graph112firstprototype52->56(+11/-7),weak34->40,strong18->16,guardfailsstrong2. Harmless-onlybankinsertion52->54(+7/-5),strong18same;no faults. Treat localsmallnetasnoise;graphdecisionlogsproveactualweightedpathchanges. Full36flippedreplays decoded and18pairedr300visuals reviewed; additional300roundwindowsaroundfirstactualdecision rendered, pages2&4actuallyreviewed(lateMonolith/Harvest/Pond/TreasureBox). Some early300plotswereidenticalbecausegraphchangesoccurafterr300;latewindowscorrectthis.

GeometryinvestigationrevealedgdistignorescompletedindividualgroupfieldsuntilALLgroupfieldsfinish. BeforethatitusesChebyshevevenwhenexactcachedgroupdistanceisready. GraphbankdecisionRoadRichesr121 rejectedanold'nearby'goldcamp whoseactualvia-banktime177vsbank-now60. Newindependentar-partial-geometry-1101 usesanycompletedg.routeimmediately;11252->58(+17/-11),weak34->42,strong18->16;health/deathsstrongworse,notyetverifiedonplatform. No graphsourceuploaded.

Newindependentar-plan-resume-1101 exact114base targetsabsorbingplannerloopwithoutv143copiedshortlist: iffarmingselectedvalidtargetbutfallsbelow42krouteadmission,setone-turnplanningdebt. Nextturnreusevalidtargetbeforefullrescoring;freshknowledge,claims,respawn/eligibilitystillchecked. Full112running. Thisdirectlyaddressesrepeatedplanningwithoutactionsobservedin114Lanesidlemax573/630turns. v143reducedto20/45andscore127->555,75->692butstilllostboth;otherthresholdchangesloststronggames,sofull143notaccepted.


Partial-geometrylocal11252->58(+17/-11),strong18->16 andstrongdeaths10.03->11.29,so geometricaccuracydoesnotaloneprovestrategybetter. Plan-resumelocal11252->56(+8/-4),weak34->39,strong18->17,guardpasses;strongdeaths10.03->10.97needinspection. Lanesvs114bothsides82/620->1003/439 and620/82->1002/521;Lanesvs126319->589and238->560butstilllosses. Roadvs123A565->1003winandB638->852loss. Resumeactual12replaymechanismaudit underway. Draft144active08:41,quota50/50until08:46,firstpairedchallengeposted08:46:18.

Offlinebeamroute-scout140map-sides choosesdifferentfirstcampin32vsone-stopreward/time. Usesphysicalanchors,staticwalking,HPreserve,cleartime,capturetime,bankchannelandrecall;existing.5goldvalue;fixedRyth-likefarmer. Noenemies/respawns,notwinprediction. Lanesopeningthreegoldnodes14->16->18 yields120goldin66modelturns,vs40in42one-stop;Gem2firstroute5->0instead0. Dataatgraph_routes_analysis/route_scout.json.


Pre-uploadmechanismauditcorrectedoverstatement: farm-onlyresumedoesNOTremoveallstalls. NativeLanesmax1321/1810turns persistswith4gembagsatspawn. Rootcausebankpathcallsquick-campcomparisonfullscorerthenreturnstruewithoutenoughfueltoexecutebankroute;farmearly-debtneverruns. AddedbankPlanRounddebtafterfailedbankroute;nextturnskipdetourcomparisonandfinishbankroute. Completear-plan-resume-1101commit0ef5e41,22files uploadedas145(awaitingsourceaudit);f8314c5istheearlierfarm-onlycommitnotuploaded. NativeexactlocalLanesmax1714/1496->33/39,score82/620->1010/34 and620/82->1000/518. Actual6pairsvisualreviewed2pages. Full11252->56(+8/-4),weak34->40,strong18->16;strongautomatedguardflags2losses. Userdirectslocalslightwinvariationasnoise;willuse100onlinegamesandmechanism,butfurther44strong-mapcheckrunningbecauseStampedev127B0-1120and41deathsisamaterialindividualregression. Testsdonotclaimallmapstallsfixed.

100platformplan atcontinuation-261101-loop2/platform100_plan.json reusesexact114control50S21+50S19,20distinctopponents,50near50half,70weak30strong. Secondpoolpreviouslyinspected,notblindedheldout. Candidate145armsproposeds21_v145ands19_v145,pinnedtos21_v114ands20_v114respectively. v144exploratory50tied11417/50(+1/-1),all40unaffectedexact finalscores;notaccepted. Keepuntilimprovementloopactive.


145sourceaudit22/22exactpassed;active08:54:15,quota50/50waiting. Additional44strong-mapguard19->18(+6/-7),deaths15.45->15.52,margin-13/game;passesautomatedstrongguard. Stampede22games7->7wins,deaths608->610,aggregate margin-8827->-8162,so individual41-deathcollapseisnotabroadnewcollapse. Harvest12->11wins,73vs72totaldeaths. Thisjustifiesusingplatformratherthanrejectingontwo112-guardflips;allflagsremainreported. Sourcecodeunchangedafteractualtests. 100combined141control33vs11428(+14/-9),opponentblock95CI[-.04,.14],so145mustbecheckedagainst141aswellas114,bestnotassumedfromonepool.

144all50replaysdownloadedanddecoded;10affectedGem2pairsvisuallyreviewed2pagesincludingall6losses. Capturedgems300242.2->278.6,score201.6->233.1,wealth320.7->366.6,butdeaths3004.7->5.9andfinal14.7->18.6;98/186deathsarelinkedCassi/Issac. Extra-bodycollectionmechanismworks,butcombatfragilitycancelsplatformwins. Thisiswhywenotblindlycontinueextra-bodydraftastheresolution.


S21v145first3POSTsaccepted08:56:18/24/30. FourthPOST08:56:36HTTP503nonJSON;bothteamhistoriesplusquota43=40earlieraccepted+3ownprovednotcreated;pendingintentmarkedconfirmed_not_createdwithsaved3evidenceJSONs. Resumed08:58:14,fourthaccepted08:58:15. Anotherwriterselected143at08:58:17,active14308:58:52;runnerabortedbeforefifthrequest. No wrong-version challenges sent. Statussnapshotexternal_selection_145.json. Userearlierdurabletakeoverauthorizationapplies,reselect145once/resume,notindefiniteguard. First4groups/20gamesaccepted;6remainingnewpoolthen10oldpoolfor100.


USER PAUSE 2026-11-01T09:00:33.799448+00:00: stop for Harsh testing. Exact own runner terminated, own lock released. Accepted 4 groups / 20 games in s21_v145; unfinished100test must not be reported complete. No automatic resume or selection guard. SeePAUSED.json; selection cleanup conditional only if still ours.


User resumed testing 2026-11-01T10:12:55.002523+00:00. Active143, no local platformlock,quota12/50,rank89. Source145local22filesstillmatchfrozenplatformsource;no pendingintents. Resuming6remainingS21groups then10S19groups tofinish100original145trials. Buildingoneindependentlocalgeometryvariant on145base (immediateindividualg.route, sourceprototypear-plan-geometry-1101), usingcachedunchanged145112baseline. No newuploaduntil145testcomplete.

CRITICAL VERSION AUDIT CORRECTION 2026-11-01T10:15:15.004106+00:00: fourth pre-pause group82da948d-b9e6-442a-b8e8-60b700b99299 actually used143, despitepre-POSTactive145guard. Earlierclaimallfour145retracted. Nativegroupreadnowidentifiedrace. Excluded5matches,receiptarchivedreceipts_rejected_version.json,journalstaterejected_wrong_version;3validgroups15gamesremain,rerunfourthspecpinnedbaseline. No performancecomparisonincludeswrongversion. Need100verified145gamesplus5excludedwrongversionrequests.


145100VALIDcompleted: S21 15/50vs11417;S19 12/50vs11411;combined27/100vs11428,14133. +2/-3pairedvs114,margin+7.3/game,block95CI[-.05,.03],noerrors/wrongversionsinretained100. Oneearlier143group5gamesexcludedandreplacedexplicitly. 15-secondPOSTpacingeliminatedfurther503insecondarm. Both100replaysetsdownloadedandall200reference/candidatereplaysdecoded. S21nativeLanesmaxidles630/573->25/35and scores75/127->317/416,butstilllostboth;movementrepairworksbutnotenough. Actual6pairsr300reviewedallfirstpoolflips+bothLanes. v141selectedasstrongestmeasuredcontrolafter145failed100;noall-mapsuperiorityclaim.

Furtherlocalson145basebothinconclusive: globalpartialgeometry56->57/112withworse margins/deaths;geodesic-progresscommit56->57/112alsohigherdeaths. Neitheruploaded. Newweightedgraphon141 bank-nowvsanysafeharmlessunclaimedcamponwaybank69->56/112,massregression;1lossand1gainwithzerologgedroutechangesalsoevidencedruntimeoverhead. Cache6turnexistingplannercadence69->66,strong12->9;stillbad,unsubmitted. Arrival-DPSgraphon141 integratedlatevisiblecommittedallyarrivals,event-basedclearanddamage,didnotcreditDPSbeforearrival. Sixindependentclosed-formmathcasestestedwithnativeC++assertspassed. Local69->63/112,moredeaths,strong12->10,notuploaded. Bothgraphhypothesesrejectedfornow.

Newgeometrystrategyar-splash-draft-1101 exact141base,draft-only: VargreplacesVesperonly4/5pickzero-camp-goldmapswithmajorityofgemrewardsfromgroupswithradius-one3+targetclusters. WeightedstaticgeometryselectsGem2/3/4/5;3pickMarcella141draftpreserved. Varg1000HP+shield250,45strength+reset+splash,avoidslinkedCassi/Issacfragility. SourcecampactionexecutoralreadysupportsVarglegalmax-usefulsplashandreset. Target32baseline141and112regressionrunning;v114and143remainintheopponentplan.No newuploadyet.


Resumecontinued145test: activation10:16:39;anotherPOST50310:17afterthreefastrequests. Bothhistoriesafter1minfoundnomatchinggroup;quota13retained(noexactquota-matchclaimbecauseexpirations). Journalreconcilednotcreated. ChangedrunnerPOSTpacing5->15sec,addedquotaBeforeintents;S19all10postedwithout503. Source141alreadycontains6turnroutepreservationandbankusesexistingtargetinsteadchooseTarget,soadding145repairswouldbelargelyredundant;didnotblindlystack.

Additionalstrategieson141: reward-weightedpacked-gemVargdraft(replaceVesper4/5picks noCampGold,>=halfGemRewardsin3+-splashclusterregions) localtarget32 14->12(+4/-6),11269->68withall110unaffectedscoresidentical;Gem3income improves,butothermapsworse,notaccepted. Currentrole-preservingablationar-splash-melee-1101 replacesRythinstead,retainsVesperrangedpresence,testing32. Draft-onlygeometryhasnoruntimeplannerfueloverhead. BodyHP1000+250shield vsRyth1200, no linkeddeath.

FreshcontrolplanS26 rank88:5nearteamsr84-91and5halfr39-45;50games25near25half,35weak15strong,20targetGem2/Gem3bothsidesbalanced. NewopponentsnoneinS19/S21/S22. s26_v141controlrunningwhilecandidateevaluateslocally; no newcandidateuploaded. Needreleaseplatformlockaftertesting. Active/selected141confirmedbeforestartingcontrol.


S26v141newcontrol50completed15/50, allcorrectversion,noerrors;100-botcandidatecomparisoncanusesavedS21v14150+freshS26v14150(16+15=31controlwins). Quota27beforecontrol+10now~37/50;nextcandidateneeds20groups, maywaitforearlierexpirationat10:58:53. No newcandidateuploadedyet.

Vargrole-preservingdraftreplacesRyth,retainsVesperrangedunit(sourceSDKconfirmsMarcellamelee). Local32 14->14(+5/-5),death8.53same,11269->68singleGem2vs114B loss;no affectedother110scores. NativeVargPvEoutputdidnotmateriallyimprove:RythvsVargmonsterdamage3001372->810Gem2,1473->1224Gem3,1730->1684Gem4,970->1118Gem5. Rosterchangealoneunproven.

CodeinspectionfoundVargtacticalplannercreditsonlyprimarybasicdamage,unlikeactualsplashpassive;italreadychargedcollateralRenretaliationbutnotcollateraldamage,andresetcollateralRenhitcountwasoneinsteadoftwo. Newar-splash-aware-1101 pairsgeometry-derivedVargdraftwithcorrectcollateralbasic/resetdamagevalue,killprize,Renhitcount,andoneboundedextrasplash-centrecandidatealongsideoriginal2weakesttargets. Spawn-protectedcollateralisnotcredited. Incomingstillconservativelykeepscollateralfoesalive(sokillsnotoptimisticallyremoved). Local32runningfirst;willnotuploadwithoutmechanism+adequateperformance.


Finalsplash-awarecandidatec5e110b21files: geometryVargreplacesRythkeepingVesperonzeroGoldpacked4/5maps,pluscollateral-awaretacticalmodel. Local32 14->15(+5/-4),deaths8.53->8.34;11269->70,weak57same,strong12->13,noerrors. Non-Vargmapsalsoshow7flipsduetacticalcompile/fuelshape;doNOTattributealllocalgainstoVarg. Nativeaudit2maps: newVargGem2first30013multi-championbasicattacksvs0oldVargcase;Gem3same4vs4. RythalreadyhasAoE100damagespells,sooriginalexpectationVarguniversallyimprovesPvEwasoverstated;Ryth1416campdamagevsVarg720(aware282.5)inoneGem2case. Newcandidatepurposeisrolematchedsplashcombat+campcoverage,notuniversalDPSdominance. Aggregate32r300killsRyth.38,Vargold.34,new.41;deathRyth.62,Vargold.56,new.62. Bothmicroandgeometrylegitimatebutonlinemustdecide. Testedbuildraw/injectedpreserved. SourceuploadedafterS26controlcompleted;waitingversionandexactaudit.

146upload21filesexactsourceauditpassed. Sourcec5e110b, testedWASMpreserved. S26v146first50starting2026-11-01T10:58:35.835617+00:00,pinnedfreshS26v14115/50control. ThenS21v14650pinnedS21v14116/50controlfor100total. Seeplatform146_plan.json. No releaseuntilarmfinishes; runnerreleaseslockeacharm.


146S26screen50completed15/50vs14115/50,no wrongversions/errors,notan improvement. Itstillhasbaselinewalk-resetunderprediction;supersededitsplannedsecond50withcleanisolatedbugfix147candidate ratherthanpromotingroster. Sourcear-walk-reset-1101exact141baseONLYone-linev1_tactical.h difference: reset&&basic&&(!move||selfInfo.attack_range==1)creditssecondattackwhenmeleehaswalked. Existingexecutorindeedwalks->attack->reset->attackformeleepassage;enemyreplymodelalreadyaccountsforit. Rangedwalkerkeepsoneattack,rangedstationarytwo,melee stationarytwo. Truth-tablefourexecutorsequencespass. Nativeofficialengineexamplesrecordedat analysis/walk_reset_evidence.json:VendettaS70movedr35anddealt70+70toHeart1000->860;oldmodel70,new140. Another2examplesr93/269samelegalcombo. Newlocal11269->70,weak57same/strong12->13,weakdeath7.62->7.22,strong12.12->12.59,no faults. Sourcecommitf160a66,raw/injectedtestedbuildpreserved. Uploadnew147pending;willtest100S26+S21against14115+16=31controlwins,total50near50half70weak30strong. v114remainslocalopponentandS21benchmark.


147source21filesexactauditpassed;f160a66onlyv1_tacticalconditiondiffvs141. Local5flipspairedatlasactuallyreviewed,causalfirst-actionaudits2winningcases: Eightvs129Afirstdiffround48,Hooks114Bfirstdiff112. Bothfirstdifferenceisnewwalk->attack->reset->attacksequence;noearlierinitializationdrift. Native3VendettaexamplesS70actual140HPdamagematchnewpredictionvsold70.

147S26first50completed16winsvs14115(+3/-2),margin+32.44/game,weak7->8,strong8same,near7same,half8->9,noerrors/wrongversions;pairedblock95CI[-.08,.14],small/inconclusivealone. SecondS21_v14750running11:16:48,pinnedS21_v14116/50control;100totalcomparisonbase31wins. First50replaysdownloading;fullreference100decodinginreset_platform_analysis. Currentactive147forsecondarm;no guard;lockownedonlyduringtests. Needreleaseaftertest. v146tiedscreen15/50vs14115 andplannedsecond50cancelledin favorofisolated147;donotclaimv146100complete.


147100completedclean:35/100vs14131(+7/-3),S26 16vs15,S21 19vs16;meanmargin+53.46/game,weak18->21(+3/-0),strong13->14(+4/-3),near16->19,half15->16. Exact100candidateversions147,noerrors. Descriptivepairedp=.34375,opponentblock95CI[-.03,.11];modestmeasuredgain,notconclusivestatisticalproof. SharedS21vsoriginal114:19vs17/50. All100replayfilesdownloaded12:43,first150nativeanalysescomplete,remaining50nativeand11remainingcomboauditsrunning. Initialcomboaudit189files:control100685move->attack->reset->attackPvPsequences;candidate89files829sofar,nobroadclaimuntilall100counted.

User saidcontinueagain;client12:36latestplatformsnapshotactive143selected143,rank114,quota10/50,no upcoming. Anotherwriterchangedselectionaftertests. Resel147ONCEunderstandinguserbestactiveauthorization;boundedwatchprocesssession9500,holdsownlockduringactivationthenreleasesinfinally,abortsifexternalreselect. Do notclaim147activeuntilbest_active_verified.json existsandfreshverification. Source147unchanged.Norepeatedguardrunning.


2026-11-01T12:55 UTC: All200 native metrics and all200 combo audits complete. v141685/236-by300 vs147905/291 combos. Average deaths9.21->9.15,captured711.47->747.91,dropped193.32->163.96. Candidate65losses54earlycapturedeficits,51earlydeaths,only2reach1000banked+alivecarried. Actualvisualinspection:10pairedflips,3pairedfirstdiffwindows(r41,106,492),10selectedremaininglosseson10maps. GiftWrappinglatewindow452-652 showsdifferentcentralengagements; do not infercausalalllaterdeaths. Reportwritten. Firstactivationwatch9500 abortedexternalreselect114; lockreleased. Finalone-time147selectionat12:51:45queued,currentwatch60552, no guard. Correctedsourcecheckexcludes2localmetadatafiles;21/21uploadedsourceunchanged.


Final: v147 activated 2026-11-01T12:59:43.060Z. Fresh GET 2026-11-01T13:00:32.241Z confirmed active147/selected147 and lockFree=true. Watch60552 exited0 and released lock. Testing/replay analysis complete; best measured147 left active; no selection guard.
