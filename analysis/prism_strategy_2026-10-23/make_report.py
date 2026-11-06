from pathlib import Path
import json,datetime
p=Path(__file__).parent
load=lambda n:json.loads((p/n).read_text())
selection=load('selection.json');upload=load('submission.json') if (p/'submission.json').exists() else {}
if (p/'final_submissions.json').exists():upload=next((s for s in load('final_submissions.json')['submissions'] if s['id']==upload.get('id')),upload)
text=f'''# Prism strategy experiment — v{upload.get('version','pending')}

Updated: {datetime.datetime.now(datetime.timezone.utc).isoformat()}.

## Current platform state

Accepted upload: **v{upload.get('version','pending')}**, `{upload.get('id','pending')}`. Last recorded build status: **{upload.get('status','unknown')}**. Source bot: `workspace/bots/{selection['bot']}`.

'''
if (p/'restoration.json').exists():
 r=load('restoration.json');text+=f"**The previous active v{r['active']['version']} has been restored. v{upload['version']} remains uploaded for further experiments.** The live pilot did not support replacing the previous default.\n\n"
if (p/'submission_result.json').exists():text+='Uploaded source was verified byte for byte against the tested files before activation. See [submission verification](submission_result.json).\n\n'
else:text+='The accepted upload is waiting for server compilation. Live results are not yet available; this status is not a successful deployment claim.\n\n'
text+='''## What changed

The candidate branches from frozen v57, preserving its tested controller behavior rather than importing v58's regressing staged-bridge bundle. The active v58 was downloaded again and its source matched the earlier audit exactly. Existing teammate bot directories were not edited.

- Prism appears in the normal roster: Heart, Vesper, Prism, Marcella, Vendetta, as team size permits. This preserves frontline and reset-based camp clearing alongside the mage.
- Prism's equipment follows the observed survival-oriented idea: Durability Health, Monster Focus, Jungle Health, Home Health, then additional Bruiser Health/Focus.
- Captured gems have an extra discounted equipment value in Prism's task scorer, computed using native Focus shard growth. Gold-only target commitment no longer traps Prism in the same capital loop.
- Both of Prism's damage slots count in its long-run farming cycle estimate; they are still cast on separate legal turns.
- Healthy Prism can retain gem capital while productive tasks exist. A 160-gem banking trigger bounds retention; this is not a maximum bag size, since rewards and kills can overshoot it.
- Public team score, legally observed allied bags, enemy score, travel time and channel duration can force conversion earlier. A 40-round margin is reserved before the round limit.
- Nearby healthy Prism can receive a shared gem reward without waiting for a distant carry or diverting gold-only camps from Vesper.
- Prism receives bounded capture-wait recovery, earlier low-HP recovery with a valuable bag, and useful-area camp spell selection.

These policies are a tested adaptation of the observed strategy, not access to the developer team's private source or an exact reconstruction of its objective function. Fixed thresholds are experimental heuristics, not proven optimal constants.

## Local experiments and rejected variants

All runs use the official release engine, 100,000 C++ fuel and matched opponent/map/side inputs. Sources are hashed before and after each batch. Development used 20 maps; the first holdout used the other 20 maps and different opponents. Local opponents are frozen approximations or historical bots, not live remote teams.

| Phase | Subject | Games | Wins | Mean gem margin | Losses by 500+ | Bot faults |
|---|---|---:|---:|---:|---:|---:|
'''
count=0
for phase in ['development','refinement','holdout','tempo','validation']:
 f=p/phase/'results.json'
 if not f.exists():continue
 d=load(phase+'/results.json');count+=len(d['rows'])
 for n,s in d['summary'].items():text+=f"| {phase} | {n} | {s['games']} | {s['wins']} | {s['meanMargin']:+.1f} | {s['heavyLosses']} | {s['faults']} |\n"
text+=f'''\n**{count} completed local games across these batches.** Every reported completed batch had zero candidate bot faults, no missing outcomes and no source changes.

The first full Prism bundle regressed (27/60), so it was rejected. The bounded-economy candidate improved development wins to 35/60, then failed its first holdout (46/60 versus both controls' 48/60). That rejection is preserved in `selection_first_holdout_failed.json`.

The selected Prism-tempo candidate achieved **37/60**, versus active-v58 control **31/60** and v57 control **40/60**, on the shared development contexts. Its heavy losses were worse (12 versus v58's 9). The additional `validation` batch, if shown above, uses three previously unused local opponents and all 40 maps; it was scheduled after the upload decision, not used to retune the uploaded source.

The user explicitly authorized evaluating live even if local performance is slightly worse. Accordingly, local superiority is not a deployment claim or a mandatory gate; correctness, source integrity and candid reporting remain required. The live experiment evaluates this exact frozen source.

## Live check

The plan is **25 challenges / 125 individual games against 25 distinct teams**: ten near our rank, ten near half our rank, and five top-team stress tests. No side-swapped repeat challenges against the same opponent are used. Maps and sides are balanced across the pool.

'''
if (p/'platform_results.json').exists():
 d=load('platform_results.json');text+='| Cohort | Opponent rank range at selection | Games won | Sets won | Mean gem margin | Heavy losses |\n|---|---|---:|---:|---:|---:|\n'
 for c,s in d['cohorts'].items():text+=f"| {c} | {s['rankRange'][0]}–{s['rankRange'][1]} | {s['wins']}/{s['games']} | {s['setWins']}/{s['sets']} | {s['meanMargin']:+.1f} | {s['heavyLosses']} |\n"
 text+=f"\nCombined game wins: **{d['gameWins']}/{d['totalGames']}**. Cohorts deliberately differ in difficulty; the combined rate is not a random-ladder estimate.\n\n"
else:text+='Live evaluation is pending server compilation or match completion. No results are inferred from the queued upload.\n\n'
if (p/'live_findings.json').exists():
 d=load('live_findings.json');text+='## Replay findings\n\n'+d.get('markdown','')+'\n\n'
text+='''## Interpretation limits

The old v58 platform sample and this pilot differ in opponents, maps, timing and hidden enemy versions. A higher or lower raw win percentage does not establish a causal improvement. Twenty-five opponent sets also do not provide 125 independent opponent strategies. Unranked matches do not directly change ladder rating.

This experiment does not implement every earlier v58 audit recommendation. It does not claim ML, RL, hidden-state access, or a complete opponent fingerprinting model. Some inherited routing and combat approximations remain.

## Evidence

- [Candidate selection and user steering](selection.json).
- [Source of the active v58 baseline](active_source_hashes.json).
- [Latest official balance check](rules_freshness.json).
- [Developer-team replay study](../prism_rank1_2026-10-23/README.md).
- Local per-game results and frozen protocols live under `development/`, `refinement/`, `holdout/`, `tempo/`, and `validation/`.
- `submission.json`, `submission_intent.json`, and `submission_cli.log` record the single accepted upload.
- When available: `submission_result.json`, `submitted_source/`, `platform_plan.json`, `receipts.json`, `platform_results.json`, `matches.json`, `games/`, `native.json`, and `log_audit.json` record the live run and its verification.
'''
(p/'README.md').write_text(text)
print('Updated report; completed local games:',count)
