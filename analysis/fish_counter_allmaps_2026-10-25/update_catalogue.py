from pathlib import Path
import json,sys
folder=Path(__file__).parent;version=int(sys.argv[1]);e=json.loads((folder/f'evaluation_v{version}.json').read_text());f=folder/'catalogue/counterplay.json';cat=json.loads(f.read_text());by={(c['map'],c['side']):c for c in e['cells']}
for c in cat:
 cell=by.get((c['map'],c['side']));matches=cell['matches'] if cell else []
 if not matches:continue
 evidence=[{'version':version,'matchId':r['matchId'],'groupId':r['groupId'],'at':r['createdAt'],'result':r['result'],'score':r['score'],'fishScore':r['oppScore'],'rounds':r['rounds'],'sameSourceResult':r['score']==c['sourceResult']['score'] and r['oppScore']==c['sourceResult']['fishScore'] and r['rounds']==c['sourceResult']['rounds']} for r in matches]
 c.setdefault('liveEvaluations',{}).update({str(version):evidence});c['status']='retained: live win' if evidence[0]['result']=='win' else 'rejected for current Fish: live loss; alternative or adaptive repair required'
f.write_text(json.dumps(cat,indent=2));lines=['# Live counterplay coverage','',f"v{version}: **{e['wins']}/{e['distinctCells']}** map/side cases won ({e['winRate']:.1%}); {len(e['missing'])} cases still untested. Each cell's detailed rationale and round-range move sequences are in [counterplay.json](counterplay.json) and [README.md](README.md).",'','| Map | Team A | Team B |','|---|---|---|']
for m in e['maps']:
 cells={r['side']:r for r in m['rows']};v=[]
 for side in ['a','b']:
  r=cells.get(side);v.append('untested' if not r else f"{'WIN' if r['result']=='win' else 'LOSS'} {r['score']}–{r['oppScore']}")
 lines.append('| '+m['map']+' | '+' | '.join(v)+' |')
(folder/'catalogue/LIVE_RESULTS.md').write_text('\n'.join(lines)+'\n');print('Updated catalogue live status for',e['distinctCells'],'cells')
