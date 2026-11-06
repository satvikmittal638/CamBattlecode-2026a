# Current execution state

User authorized a sequential series of separately submitted overfitted bots: **Fish → Mite → Claudus Maximus → Trzy Kwaterki → Willow Best Girl**. Start a new target only after the previous meets its >60% total win rate with broad map coverage. Use terminal HTTP/CLI scripts only for platform access. No browser, no Claude dependency, no subagents unless newly requested. User permits radical gameplay hardcoding. Keep per-replay selection reasons and explained sequences.

## Completed Fish stage

- `analysis/fish_counter_allmaps_2026-10-25/stage_status.json`: objectiveReached true.
- **v84**, ID `7d0e0c5c-2634-4b6d-bfb8-7e9a13ccd9c0`, local bot `fish-atlas-09`.
- Note `TARGET: Intercontinental Fish | atlas09 | 40-map / both-side overfit counter`.
- **60/80 live wins (75%)**, one game per map and side across all forty published maps; **38/40 maps** have a win, **22/40** won both sides. A 32/40, B 28/40.
- `00rushbait_v2` and `01corridors` have no wins. All 20 losing conditions are visible and labelled rejected; do not claim universal success.
- All 80 replay bundles downloaded and natively decoded against engine1.0.3; zero validation errors. All 114 uploaded source files byte-verified through official own archive.
- All 60 wins reproduce their chosen reference scores and finishing rounds exactly.
- Report, coverage PNG, catalogue80cases/470segments/7076legal-personal-vision examples: `analysis/fish_counter_allmaps_2026-10-25/README.md`.
- Fish was active at the last platform check, before starting Mite.

## Active Mite stage

- Folder `analysis/mite_counter_allmaps_2026-10-25/`.
- Target **Mite** ID `ee83f5e5-bcad-4923-86b4-b79ea6083d2e`.
- Config at `config.json`; planned bot `mite-atlas-01`, trial label `mite01`.
- Fish completion checked before this stage began; master progress JSON in this folder's parent progress directory.
- Initial platform state saved; quota at start:16/50, earliest reset12:52UTC. Full candidate evaluation needs16sets/80games. No Mite challenge or submission yet.
- Running census exec session **37973**: `node analysis/mite_counter_allmaps_2026-10-25/census.mjs`. 3700 recent group headers; selected2254groups for details (all ranked, unranked with at least one Mite loss), GET workers5. Poll carefully; it may already finish. Writes matches.json only at completion.
- 12 cached developer wins against Mite from old mass corpus (same full patch ID); sourceTeam fields set.
- Core scripts copied and adapted from Fish's successful workflow: `census.mjs`, `select_ranked.mjs`, `collect_selected.mjs`, `extract.mjs`, `make_bot.py`, `trial.mjs`, `verify_archive.mjs`, `collect_trial.mjs`, `evaluate.mjs`, catalogue/observation/plot scripts. Config target IDs patched in census/trial. **Review adaptations before using**, particularly legacy strings/field names.
- `select_ranked.mjs` prioritizes our own verified current wins, then ranked wins compatible with the latest ranked/live opponent draft. Unranked only after ranked; explicitly mark incompatible/no-reference cells.
- Test plans `initial_plan.json` (3sets/15distinctmaps, mixed sides), `remaining_plan.json` (13sets/65remainingcells), `full_matrix.json` (80cells) copied for same current40-map pool.

### Next actions

1. Finish census; run `select_ranked.mjs`; inspect coverage/current-draft-compatible count; then `collect_selected.mjs` via escalated network.
2. Run `extract.mjs` (4nativeworkers), `make_catalogue.py`, `summarize_patterns.py`, `observations.mjs` as needed. Every complete action/turn table remains under `books/`.
3. `python3 .../make_bot.py mite-atlas-01`; compile from workspace using `../.venv/bin/cambc build mite-atlas-01 --release`; bundle <5MiB.
4. Shadow sample via `analysis/v58_deep_2026-10-24/harness/batch_shadow.mjs --index <folder>/games/<index>.json --bot workspace/bots/mite-atlas-01/.cambc/build-release/bot.wasm --out ... --jobs4 --extra '--to100'` (separate flags; check command syntax). Local shadow is mechanical validation, not target performance; full local native reconstruction sometimes drifts.
5. Submit/test using `node <folder>/trial.mjs mite01 mite-atlas-01 <folder>/initial_plan.json`; note must explicitly say TARGET:Mite. Compile queues have taken3–12minutes. Do not assume upload=active. Verify own uploaded archive with `verify_archive.mjs mite01`.
6. When first3sets finish, evaluate. For same-version remaining65, create another trial directory, copy submission.json from first trial, invoke `trial.mjs <remaininglabel> '' <remaining_plan>`; existing submission means no duplicate upload. Wait for first trial's lock to release.
7. Evaluate all80 together with `evaluate.mjs <actualVersion> <initialLabel> <remainingLabel>`, collect and native-validate80, update notes/results. Do not mix different versions or substitutes into the balanced win rate. Iterate if target/coverage not met. Then advance to Claudus only after Mite succeeds.

## Important implementation findings

- **Public replay metadata doesn't identify opponent private versions.** Fresh unranked wins often used a different Fish draft/opening. Fish v83 4/15 became v84 11/15 on the same fifteen cells after preferring compatible ranked references + sale fix. Matching draft alone still does not prove identical policy.
- **Emblem sales must preserve item identity**. Sale of one emblem is not sale of5shards. `extract.mjs` now records exact negative item-index deltas for Sell. Purchases use shard delta+5*emblem delta.
- `tools/replay_dump.mjs` spawn decoder fixed: use official `Game_API_GetSpawnRegion` for both sides, engine rectangle maxima are exclusive; convert to inclusive tile bounds. Old inferred/reflected Team-B region was shifted by1 and broke map matching. Fixed scripts queried official regions; current selected map fingerprints unique.
- Playback keys nativeChampionType*2048+round, not draftType. Cassi and Issac have separate physical types and scripts.
- Data records fixed12bytes encoded as16base64characters/action, direct indexed key lookup; no whole-library runtime decompression. Fish v84 retained756520actions, ZIP2732293bytes.
- Preserve purchases, priorities, recalls/cancellations, wards, locks and teleports. Failed MovementBlocked events cannot blindly be replayed as moves (may be failed ward/dash); omitted. Live attacks/targeted casts resolve only through personal-vision APIs.
- Attack enemy lock explicitly using raw SDK single-lock query. SDK altar_locks() count query exposed a local bridge/capacity issue; both teams may have locks on same altar.
- Source gen `make_bot.py` uses frozen v80 source as generic fallback/controller base (`workspace/bots/fish-playbook-05/src`). Target specialization comes from each target's own action tables. Names/notes/data must remain distinct.
- Bot source must stay unchanged after submission; regenerate only an unsubmitted bot with explicit `--refresh-unsubmitted`; guard checks upload_intent journals.

## Tools / safety / filesystem

- Cwd `/Users/dmitt/Desktop/CamBattlecode`, macOS zsh, not a git repo. No applicable AGENTS.md found.
- Platform helper `analysis/v57_eval_2026-10-23/http.mjs` supports strict HTTP GET/API/bundle; import cookieHeader only from tools/bclib.mjs. Avoid bclib.api/bc.mjs network (may trigger browser login). Never print cookies.
- Network execs use require_escalated with authorized purpose. No browser/CUA.
- Main `.venv/bin/cambc`3.0.5; engine `tools/engines/v1_0_3.wasm`. Local map names use hyphens, platform map names underscores.
- Trial lock `.platform_lock/owner` heartbeat with unref; don't duplicate uploads/challenges when a process or intent may still exist. Strict match binding checks version AND submissionId.
- Global python3 has matplotlib3.9.1; .venv Python lacks it. Plot script sets MPLCONFIGDIR=/private/tmp/fish-atlas-mpl. View PNG for QA.
- Native decoder: `FISH_DATASET=/absolute/trial node analysis/fish_hunt_2026-10-25/decode.mjs` works for any opponent (env name legacy). Asserts native winner, bank scores and finish round against platform; 4workers.
- Give commentary updates about once a minute, keep going through authorized work. Do not start later target network/experiments until prior target is verified complete.


## Latest Mite update (12:10 UTC)

- Census completed: **4506 public winning references**, all80cells covered. `matches.json`/`all_winners.json` present.
- `select_ranked.mjs` selected80cases: **74 current-draft-compatible, 67 ranked**. Six incompatible:00corners/a,00quadrants/a,00stampede/a,00swirl/b,01fracture/b,01yellow_brick_road/b. All current full patchID.
- All80selectedbundles downloaded and all80books extracted/validated.
- Local bot **mite-atlas-01** generated/built; retained632952actions; source ZIP**2400434bytes**.
- Catalogue80cases/459segments; observations7974legal-personal-vision examples complete.
- Initial15case shadow through100rounds was running exec**59446**; poll/read summary. No Mite submission yet at this exact note.
- `finalize_target.py` generic helper now exists in Mite folder: args actualVersion primaryLabel [additionalLabels]. It writes a source/validation-bound README and stage_status only gates objective true at >60%,>=36mapswithwin, all80nativeverified, sourceverified. Useafterevaluate/update_catalogue/plot.
- Once initial shadow passes, submit using triallabel**mite01**, noteTARGET:Mite. Then full80benchmark withsameversion, sourcearchive verification, and nativeverification. Do not start Claudus yet.


## Latest Mite submission (12:19 UTC)

- **v85 uploaded**, ID `ace5aff2-e86b-453d-959f-5cab3173fe71`, bot `mite-atlas-01`, note `TARGET: Mite | mite01 | 40-map / both-side overfit counter`.
- Running trial exec **89551**, awaiting queued platform compilation. It will automatically fire initial3sets once active. No Mite challenges yet at this timestamp. Active platform bot remains Fishv84 while v85 queues.
- Complete source archive byte-verified **114files**; all80openingcases matched **38000/38000**turns, no drift.
- Mite source ZIP2400434bytes. Initial15shadow7100/7100. Observations7974examples /80cases; catalogue459segments.
- Added `catalogue/OPPONENT_FINGERPRINTS.md`:75/80map-side cells had ranked draft variation in recent history; metadata is a compatibility clue, not private-version identification.
- Trial script file now safely waits in<=30s increments for rolling50/hour quota; the currently running initial process started before this edit, but remainder/future runs will use it.
- After initial15results, evaluate; create resttrial copying `trials/mite01/submission.json` and run remaining65using sameversion. Do not reupload or mixversions. Then download/nativelyvalidate80, finalizeMite via `finalize_target.py 85 mite01 <restlabel>`.
