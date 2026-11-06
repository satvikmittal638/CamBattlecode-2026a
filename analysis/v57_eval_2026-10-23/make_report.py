from pathlib import Path
import json
p=Path(__file__).parent
def read(n):return json.loads((p/(n+'.json')).read_text())
plan=read('plan');results=read('platform_results');verified=read('FINAL_VERIFICATION');summary=read('summary');logs=read('log_audit');mech=read('mechanics_audit');snapshot=read('final_platform_snapshot')
assert len(mech['rows'])==500 and not mech['fail']
version=plan['version'];s=results['summary'];rows=read('metrics')['rows']
special={m:[g for g in rows if g['map']==m] for m in ['00contest','01boss_battle']}
def percent(a,b):return f'{100*a/b:.1f}%' if b else 'n/a'
def tally(k):
 a=s[k];return f"{a['challengeWins']}/{a['challenges']} ({percent(a['challengeWins'],a['challenges'])}) | {a['wins']}/{a['games']} ({percent(a['wins'],a['games'])})"
normal=summary['sets']['normalLoss'];a=normal['us'];b=normal['opponent'];ms=mech['summary']
official=read('official_audit');bot_faults=sum(g['stats'][0]['botFaults'] for g in official['rows'])
bands={k:(min(t['rank'] for t in v),max(t['rank'] for t in v)) for k,v in plan['pools'].items()}
active=snapshot.get('active',{}).get('version');errors=[r for r in logs['rows'] if r['errors']]
text=f'''# v{version}: weakness fixes and completed platform verification

The candidate was submitted as **v{version}**, `{plan['submissionId']}`. All 28 uploaded source files match the tested candidate. The requested verification contains **100 challenges / 500 games against 100 distinct opponent IDs**, with no deliberately repeated opponent to reverse sides.

## Platform results

| Cohort | Challenge wins | Individual game wins |
|---|---:|---:|
| Nearby, widened | {tally('near')} |
| Half-rank, widened | {tally('half')} |
| Total | {tally('all')} |

The frozen starting rank was **{plan['rank']}**, half-rank **{plan['halfRank']}**. Closest-unused sampling produced nearby snapshot ranks **{bands['near'][0]}–{bands['near'][1]}** and half-rank ranks **{bands['half'][0]}–{bands['half'][1]}**. Each cohort has 50 challenges and 125 A-side / 125 B-side games; all 40 maps are covered and each map is side-balanced overall. Opponent ranks and versions can drift. The first 50 and second 50 were sent in separate quota windows.

The older v55 batch won 36/100 challenges and 196/500 games, using 75 distinct opponents and different rank bands. Its raw rate is not a controlled estimate of this code change's effect. Incoming challenges or other matches outside our issued batch are excluded from this tally.

## Changes and controlled validation

- **Boss and gate objectives:** durable regular teams build equipment, then commit to a home-side Monolith or mandatory gate. This replaces waiting for enemies to almost clear bosses. Classification uses map topology and camp rewards, not map names.
- **Recovery and tactical correctness:** restore ready-slot/AoE threat estimates, consistent shield comparisons, low-health Heart shielding, optional retaliation checks and safer retreat dashes. An escape cannot immediately fall through to farming movement.
- **Altar access:** a personally observed approach clear of living camps can be used before every monster in its group is dead. Channel checks cover the actual draft and respect Marcella's stun immunity.
- Preserve v56's hole-crossing dash, bank-lock and low-fuel ABI work. Stop geometry warm-up once complete.

Final controlled local validation: **169/240 wins versus v56 155/240** on all 40 current maps; **87/92 each** on 23 archived maps. Current-map paired results were 36 gains and 22 losses, with +60.4 mean gem margin; archived margin improved by 57.1. All 664 final local games completed without native faults or source changes. Local opponents are historical bots/approximations, not private top-team source. The control source differs from the downloaded original only by line-ending normalization.

Normal-map local deaths fell 7.02→6.18/game; group captures rose 4.008→4.091/100 rounds. The matched native audit observed 0→1,392 low-health Heart shield casts, 374/2,409→89/2,907 low-health walk-then-dashes reducing visible enemy separation, and 8→0 immediate own-basic self-deaths. These are behavior counts, not estimates of prevented deaths. Local pure-boss wins were 6/6 versus 4/6; gated wins 5/6 versus 4/6. Baseline special-map wins were zero-score tiebreaks; the candidate actually banked gems. Broad testing rejected several more aggressive combat and economy experiments. Full sources, fixtures, rejected variants and local limitations are in [DEVELOPMENT.md](../v56_improvement_2026-10-23/DEVELOPMENT.md).

![Platform result](platform_results.png)

## Special maps and remaining weaknesses

'''
for m,label in [('00contest','Pure boss'),('01boss_battle','Gated altar')]:
 gs=special[m];w=sum(g['result']=='win' for g in gs);text+=f"- **{label}: {w}/{len(gs)} wins**, mean deposited gems {sum(g['score'] for g in gs)/max(1,len(gs)):.1f}.\n"
text+=f'''
Across **{normal['n']} normal-map losses**, our deaths averaged **{a['deaths']}** per game versus **{b['deaths']}** for opponents; group captures were **{a['groupCapsPer100Rounds']} versus {b['groupCapsPer100Rounds']} per 100 rounds**. Mean completed deposits were **{a['meanDeposit']} versus {b['meanDeposit']} gems**. **{a['deathOutnumber']}%** of our deaths occurred with more enemies than allies within Chebyshev six. That is an omniscient proximity proxy, not proof of personal visibility or avoidability.

![Remaining loss patterns](loss_patterns.png)

These figures describe remaining weaknesses rather than proving every major weakness solved. The matched local analysis also found that outnumbered deaths per normal game were essentially unchanged even while other deaths fell. The selected fixes improve recovery and objective conversion; coordinated fight selection remains a distinct problem.

A personally visible lethal-routing mistake was verified frame by frame in the dromedaries gated game: Vendetta walked into a ready Marcella spell dealing 2,727 damage against 2,720 HP. A separate travel guard then scored 165/240 versus frozen v57 164/240, with 25 gains and 24 losses. It was not selected or uploaded; v57 remained frozen throughout this platform test. A ward-budget/Marcella-Focus screen also failed to establish a convincing gain. The detailed local report records these rejected follow-ups.

## Verification

- All 100 groups finished; all 500 games are unique and use v{version}. No pending challenge request remains.
- Native decoding validated **{verified['nativeSteps']:,} steps** against platform scores, winners and rounds. Replay failures: **0**. Official-summary discrepancies: **0**.
- Every game log contains the expected build marker. Platform bot faults: **{bot_faults}**. Caught-error games: **{logs['summary']['errorGames']}**. Ordinary fuel-limit inputs: **{logs['summary']['atLimit']} / {logs['summary']['ordinaryInputs']:,}**; logged cross-round suspensions: **{logs['summary']['suspended']}**. Zero decoding failures is not an error-free execution claim.
- The all-500 native mechanics audit records **{ms['heartLowShieldCasts']:,} low-health Heart shield casts**, **{ms['heartLowShieldUnused']} qualifying unused-shield recovery movements**, **{ms['lowDashesReducedEnemySeparation']}/{ms['lowDashesAfterWalking']} low-health walk-then-dashes reducing personally visible enemy separation**, and **{ms['selfKilledByBasic']} immediate own-basic self-deaths**. Definitions are in mechanics_audit.json; counts do not equal preventable deaths.
- Handbook entry HTML and patch notes matched previously verified sources during development. A subsequent HTTP-only check freshly fetched the current handbook entry, service entry, docs and champion-grid JavaScript assets and patch notes; all matched the refreshed docs byte for byte. See [the fresh rules check](../rank1_learning_2026-10-23/docs_check/verification.json). The latest published balance note is 1.0.2 while the recorded replay patch ID is 1.0.3; those labels are not treated as evidence of an undocumented rules change. The archived official summary decoder is provenance-tagged; every downloaded summary's size and SHA-256 are checked.

At the final snapshot ({snapshot['at']}), active version was **{active}** and team rank **{snapshot['rank']}**. This is observational metadata, not a causal rank-gain claim.
'''
if errors:
 text+='\nCaught-error examples:\n\n'
 for r in errors[:5]:text+=f"- `{r['matchId']}` / {r['map']}: "+'; '.join(r['errors'][:2])+'\n'
text+='''
Evidence: [FINAL_VERIFICATION.json](FINAL_VERIFICATION.json), [platform_results.json](platform_results.json), [summary.json](summary.json), [official_audit.json](official_audit.json), [mechanics_audit.json](mechanics_audit.json), [log_audit.json](log_audit.json), [frozen source](source/src/). All raw replay archives are preserved.
'''
(p/'REPORT.md').write_text(text)
(p/'RUN_STATUS.md').write_text(f'''# v{version} verification COMPLETE

- All 100 distinct-opponent challenges / 500 games finished and verified. Nearby: {s['near']['challengeWins']}/50 challenges, {s['near']['wins']}/250 games. Half-rank: {s['half']['challengeWins']}/50 challenges, {s['half']['wins']}/250 games.
- Zero native decoding failures or official summary discrepancies. Execution errors/fuel counts are disclosed in REPORT.md.
- No pending challenge request remains. Sender released its lock; activation guard stops at sender_done.json. Do not restart this batch or resubmit v{version}.
- Final snapshot: active v{active}, team rank {snapshot['rank']}. Do not infer causality from rank or differently sampled historical batches.
- Final report: [REPORT.md](REPORT.md). Source development: [DEVELOPMENT.md](../v56_improvement_2026-10-23/DEVELOPMENT.md).
''')
print('Final report written')
