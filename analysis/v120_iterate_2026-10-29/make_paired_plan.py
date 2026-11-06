from pathlib import Path
import json
D=Path(__file__).resolve().parent;x=json.loads((D/'platform_state.json').read_text());rank=x['options']['requesterRank'];US='6b04505b-d16c-4196-b7c6-53a4688a32ca'
a=[r for r in x['ladder'] if r['hasBot'] and r['teamId']!=US]
strong=sorted(sorted(a,key=lambda r:(abs(r['rank']-rank/2),r['rank']))[:10],key=lambda r:r['rank']);used={r['teamId'] for r in strong}
near=sorted(sorted([r for r in a if r['teamId'] not in used],key=lambda r:(abs(r['rank']-rank),r['rank']))[:10],key=lambda r:r['rank'])
core=['02treasure_box','00lanes','00the_line','01boss_battle','02guardians','00gemfight','02stalactites','01elk_arena','02cuts','00vault']
second=['00contest','02crossing','02arena','00ribs','00road_of_riches','00rows','00packs','01corridors','01shortcut','01yellow_brick_road','00lost_world','00gem_fields','00great_wall','02tangle','02geodes','02uncharted_lands','00swirl','00stampede','02the_pond','00rushbait_v2']
ref=['01broken_curve','00collision','01islands','00split','02fields','01big_world','02famine','02gift_wrapping','02the_pack','01starvation','01starfish','00oasis','01gold_rush','01concentrated_wealth','00corners','00crater','00expanse','00fragment','00galaxy','00pilgrimage']
known={m['name'] for m in x['options']['maps']};assert all(m in known for m in core+second+ref)
spec=[]
for i in range(10):
 for poolIndex,(pool,teams) in enumerate([('strong',strong),('near',near)]):
  r=teams[i];j=(i+3)%10;maps=[core[i],core[j],second[2*i],second[2*i+1],ref[i+poolIndex*10]]
  sides=['a' if i<5 else 'b','b' if j<5 else 'a','a' if poolIndex==0 else 'b','b' if poolIndex==0 else 'a','a' if i%2==0 else 'b']
  spec.append({'label':f'{pool}_r{r["rank"]}_{i+1:02}','pool':pool,'rank':r['rank'],'teamId':r['teamId'],'opponent':r['name'],'maps':maps,'sides':sides})
assert len(spec)==20 and len({s['teamId'] for s in spec})==20 and sum(side=='a' for s in spec for side in s['sides'])==50
plan={'planningRank':rank,'gamesPerArm':100,'challengesPerArm':20,'arms':['control_v120','candidate'],'sameOpponentsMapsSides':True,'nearRanks':[r['rank'] for r in near],'strongRanks':[r['rank'] for r in strong],'weaknessGamesPerArm':80,'referenceGamesPerArm':20,'coreMaps':core,'secondaryWeaknessMaps':second,'referenceMaps':ref}
for arm in ['control','candidate']:
 p=D/'paired_c1'/arm;p.mkdir(parents=True,exist_ok=True);(p/'specs.json').write_text(json.dumps(spec,indent=1));(p/'plan.json').write_text(json.dumps(plan,indent=2))
(D/'paired_c1/plan.json').write_text(json.dumps(plan,indent=2));print(plan);print([(s['pool'],s['rank'],s['opponent']) for s in spec])
