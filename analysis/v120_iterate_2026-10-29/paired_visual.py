import json,os
from pathlib import Path
D=Path(__file__).resolve().parent;os.environ['MPLCONFIGDIR']=str(D/'.mpl')
import matplotlib;matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
P=D/'paired_c1';pairs=json.loads((P/'pairs.json').read_text());V={arm:{(g['label'],g['map'],g['side']):g for g in json.loads((P/arm/'visual.json').read_text())} for arm in ['control','candidate']}
selections={'gains':[('near_r112_01','01boss_battle','b'),('strong_r55_02','02guardians','b'),('near_r114_03','00the_line','a')],'regressions':[tuple(p['key']) for p in pairs if p['delta']==-1]}
for name,keys in selections.items():
 fig,axs=plt.subplots(len(keys),2,figsize=(15,14),layout='constrained')
 for rr,key in enumerate(keys):
  p=next(p for p in pairs if tuple(p['key'])==key)
  for cc,arm in enumerate(['control','candidate']):
   g=V[arm][key];m=g['info'];ax=axs[rr,cc];ax.set(xlim=(-1,m['width']),ylim=(-1,m['height']),aspect='equal')
   for k,col in [('walls','#606a75'),('holes','#bdc9d8')]:
    if m[k]:ax.scatter(*zip(*m[k]),s=3,c=col,marker='s',lw=0)
   for t,s in enumerate(m['spawn']):ax.add_patch(Rectangle((s['minX']-.5,s['minY']-.5),s['maxX']-s['minX']+1,s['maxY']-s['minY']+1,color='#2076b8' if t==g['us'] else '#d44d3f',alpha=.15))
   if m['altars']:ax.scatter(*zip(*m['altars']),s=25,c='#8b54a2',marker='*')
   ids={c['id'] for r in g['rounds'] for c in r['ch']}
   for id in ids:
    pts=[c for r in g['rounds'] if r['r']<=300 for c in r['ch'] if c['id']==id];col='#2076b8' if pts[0]['t']==g['us'] else '#d44d3f';seg=[]
    for c in pts+[{'p':None}]:
     if c['p'] is None:
      if len(seg)>1:ax.plot(*zip(*seg),c=col,lw=.7,alpha=.5)
      seg=[]
     else:seg.append(c['p'])
   for d in g['deaths']:
    if d['r']<=300:ax.scatter(*d['p'],c='#0056c9' if d['t']==g['us'] else '#c72622',s=30,marker='x')
   for cap in g['caps']:
    if cap['r']<=300 and cap['g']>0:ax.scatter(*cap['p'],s=14+cap['g']*.5,facecolors='none',edgecolors='#2076b8' if cap['t']==g['us'] else '#d44d3f',alpha=.7,lw=.7)
   r=p['a' if arm=='control' else 'b'];ck=r['metric']['teams'][r['metric']['us']]['checkpoints'].get('300',{});version=120 if arm=='control' else 121
   ax.set_title(f"v{version} · {g['map']} · {g['result']} {g['score']}–{g['oppScore']}\nvs {g['opponent']} · r300 captured gold {ck.get('capGold')}, worth {ck.get('worth')}",loc='left',fontsize=11);ax.tick_params(labelsize=8)
 fig.suptitle('Matched platform '+name+': opening 300 rounds',fontsize=17)
 fig.supxlabel('Same opponent/map/side. Blue = us; red = opponent. Sampled trails include recall/dash jumps; crosses = deaths; rings = gem captures.',fontsize=10)
 fig.savefig(P/('paired_'+name+'.png'),dpi=130,bbox_inches='tight');plt.close(fig)
 print(P/('paired_'+name+'.png'))
