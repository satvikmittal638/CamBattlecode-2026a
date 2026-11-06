import os,json
from pathlib import Path
D=Path(__file__).parent;os.environ['MPLCONFIGDIR']=str(D/'.mpl')
import matplotlib;matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
maps={x['map']:x['info'] for x in json.loads((D/'baseline_visual.json').read_text())};orig=json.loads((D/'original_mechanism_cases.json').read_text())
fig,axs=plt.subplots(1,2,figsize=(14,7),layout='constrained')
for ax,(m,fn,id,start,end) in zip(axs,[('01elk_arena','elk_retry_live',7,24,40),('01broken_curve','broken_final_live',4,1069,1100)]):
 info=maps[m]
 for k,c in [('walls','#777'),('holes','#ccd3df')]:
  xy=info[k]
  if xy:ax.scatter(*zip(*xy),marker='s',s=15,c=c,lw=0)
 if info['altars']:ax.scatter(*zip(*info['altars']),s=100,c='#9551ad',marker='*',label='Altar')
 a=[x for x in orig[m] if not x['self'].get('dead') and x['self'].get('hp',0)>0]
 b=[json.loads(l) for l in (D/(fn+'.jsonl')).read_text().splitlines()];b=[x for x in b if x.get('id')==id and start<=x.get('r',-1)<=end and x.get('pos')]
 ax.plot([x['self']['x'] for x in a],[x['self']['y'] for x in a],'-o',c='#d34e3c',ms=3,label='Recorded v114')
 ax.plot([x['pos'][0] for x in b],[x['pos'][1] for x in b],'-o',c='#187bbb',ms=3,label='Repair counterfactual')
 for pts,color in [(a,'#d34e3c'),(b,'#187bbb')]:
  for j,x in enumerate(pts):
   if j%4==0:
    p=(x['self']['x'],x['self']['y']) if 'self' in x else x['pos'];ax.annotate(str(x['r']),p,xytext=(4,5),textcoords='offset points',fontsize=8,c=color)
 allp=[(x['self']['x'],x['self']['y']) for x in a]+[x['pos'] for x in b];xs,ys=zip(*allp)
 ax.set(xlim=(min(xs)-4,max(xs)+4),ylim=(min(ys)-4,max(ys)+4),aspect='equal',title=m);ax.grid(alpha=.1);ax.legend(fontsize=8)
fig.suptitle('Mechanism checks: blocked retreat and urgent bank delivery',fontsize=16)
fig.supxlabel('Counterfactual uses recorded opponent actions. Labels are rounds; paths include dashes and recalls. This checks behavior, not platform strength.',fontsize=10)
fig.savefig(D/'mechanism_checks.png',dpi=140)
