from pathlib import Path
import shutil,json,hashlib,re
OUT=Path(__file__).resolve().parents[1];ROOT=OUT.parents[1];SRC=ROOT/'analysis/current_bot_review_2026-10-23'

def copy(src,dest):
 dest.parent.mkdir(parents=True,exist_ok=True)
 if src.is_dir():shutil.copytree(src,dest,dirs_exist_ok=True)
 else:shutil.copy2(src,dest)
for name in ['economy_combat','local_comparison','replay_timelines','capture_deadlock']:
 for ext in ['png','svg']:copy(SRC/(name+'.'+ext),OUT/(name+'.'+ext))
copy(SRC/'source',OUT/'source');copy(SRC/'v58_source_snapshot.zip',OUT/'v58_source_snapshot.zip');copy(SRC/'games',OUT/'replays')
copy(SRC/'official_summaries',OUT/'evidence/official_summaries')
for name in ['patterns.json','metrics.json','frame_audit.json','idle_case.json','idle_case_ryth_logs.txt','forecast_counterexamples.json','native_camp_stats.json','official_aggregates.json','source_hashes.json','target.json','review_cutoff.json','docs_verification.json','log_audit.json','VERIFICATION.json','matches.json','target_groups.json']:
 copy(SRC/name,OUT/'evidence'/name)
for name in ['PROTOCOL.json','results.json','stage1_results.json']:copy(SRC/'local'/name,OUT/'evidence/local'/name)
# Preserve all controlled local replay artifacts; keep statistics compact and input snapshots separate.
for f in (SRC/'local').glob('*.repl26a'):copy(f,OUT/'local_replays'/f.name)
for version,folder in [('v56','v56-frozen'),('v57','codex-v57-final')]:copy(ROOT/'workspace/bots'/folder/'src',OUT/'comparison'/version/'src')
for name in ['v56_to_v58.diff','semantic.diff']:copy(SRC/name,OUT/'comparison'/name)
copy(ROOT/'docs/official/GameRules.md',OUT/'rules/GameRules.md')
copy(SRC/'SOURCE_REVIEW.md',OUT/'SOURCE_GUIDE.md')
# Adjust supporting guide references to package-local locations.
f=OUT/'SOURCE_GUIDE.md';s=f.read_text().replace('`source_hashes.json`','`evidence/source_hashes.json`').replace('`v56_to_v58.diff`','`comparison/v56_to_v58.diff`').replace('`semantic.diff`','`comparison/semantic.diff`')
for n in ['forecast_counterexamples.json','frame_audit.json','native_camp_stats.json']:s=s.replace('`'+n+'`','`evidence/'+n+'`')
f.write_text(s)
# Move links with their copied replay files, without depending on the original analysis folder.
s=(SRC/'MATCHES.md').read_text().replace('](games/','](replays/');(OUT/'MATCHES.md').write_text(s)
local=json.loads((SRC/'local/results.json').read_text());flips={}
for old in ['v56','v57']:
 lookup={(r['opponent'],r['map'],r['side']):r for r in local['rows'] if r['version']==old};pairs=[(r,lookup[(r['opponent'],r['map'],r['side'])]) for r in local['rows'] if r['version']=='v58'];flips[old]={'gains':sum(a['win'] and not b['win'] for a,b in pairs),'losses':sum(b['win'] and not a['win'] for a,b in pairs),'lossCases':[{'map':a['map'],'opponent':a['opponent'],'side':a['side'],'v58Score':[a['score'],a['oppScore']],'previousScore':[b['score'],b['oppScore']],'v58Replay':'local_replays/'+Path(a['replay']).name,'previousReplay':'local_replays/'+Path(b['replay']).name} for a,b in pairs if b['win'] and not a['win']]}
(OUT/'evidence/local/paired_flips.json').write_text(json.dumps(flips,indent=2)+'\n')
extra={'scope':'Additional exact-code observations for the v58 README; no new game trials.', 'gateProtection':{'gateGames':4,'gateGamesWithCassiIssacPick':0,'allowedThreatTypes':['Cassi','Issac'],'defaultGateDraft':['HeartOfRuin','Stellar','Tavi','Prism','Ren'],'result':'bankChannelThreat is false for every default gate draft champion, also disabling retreatBankCarrier through this trigger.'},'wealthComparison':{'selfShards':20,'selfGold':0,'allyShards':10,'allyGold':600,'selfComparedWealth':20,'allyComparedWealth':10,'allyTotalShardEquivalentWealth':30,'handoffPredicate':10+3<=20,'scope':'Arithmetic illustration of asymmetric wealth comparison, not a measured match-level improvement.'}}
(OUT/'evidence/additional_code_observations.json').write_text(json.dumps(extra,indent=2)+'\n')
# Embed exact source excerpts, with stable line references and a machine-checkable index.
text=(OUT/'report_tools/template.md').read_text();excerpts=[]
def snippet(m):
 file,a,b=m.group(1),int(m.group(2)),int(m.group(3));lines=(OUT/'source/src'/file).read_text().splitlines();assert 1<=a<=b<=len(lines);code='\n'.join(lines[a-1:b]);excerpts.append({'file':'source/src/'+file,'firstLine':a,'lastLine':b,'sha256':hashlib.sha256(code.encode()).hexdigest()});return f'**v58 source:** [{file}](source/src/{file}#L{a}), lines {a}–{b}.\n\n```cpp\n{code}\n```'
text=re.sub(r'@@CODE ([^ ]+) (\d+) (\d+)@@',snippet,text);assert '@@CODE' not in text
(OUT/'README.md').write_text(text);(OUT/'evidence/code_excerpt_index.json').write_text(json.dumps(excerpts,indent=2)+'\n')
print('Packaged README,',len(excerpts),'exact source excerpts, 130 platform replays, 280 local replays, and eight external image files.')
