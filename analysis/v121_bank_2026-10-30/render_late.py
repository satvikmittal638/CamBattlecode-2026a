import sys,json,os
from pathlib import Path
P=Path(__file__).parent;os.environ.setdefault('MPLCONFIGDIR',str(P/'.mpl'))
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import Rectangle
src,dst=sys.argv[1:3];dst=Path(dst);dst.mkdir(exist_ok=True,parents=True)
rows=json.loads(Path(src).read_text());rows.sort(key=lambda g:(g.get('result')=='win',g['score']-g['oppScore']))
for page in range((len(rows)+5)//6):
 fig,axs=plt.subplots(2,3,figsize=(18,11),layout='constrained')
 for ax,g in zip(axs.flat,rows[page*6:(page+1)*6]):
  m=g['info'];ax.set(xlim=(-1,m['width']),ylim=(-1,m['height']),aspect='equal')
  for key,col in [('walls','#5c6570'),('holes','#bdc9d8')]:
   if m[key]:q=np.array(m[key]);ax.scatter(q[:,0],q[:,1],c=col,s=3,marker='s',lw=0)
  for t,s in enumerate(m['spawn']):ax.add_patch(Rectangle((s['minX']-.5,s['minY']-.5),s['maxX']-s['minX']+1,s['maxY']-s['minY']+1,color='#2076b8' if t==g['us'] else '#d44d3f',alpha=.16))
  if m['altars']:q=np.array(m['altars']);ax.scatter(q[:,0],q[:,1],s=24,c='#8b54a2',marker='*')
  ids={c['id'] for r in g['rounds'] for c in r['ch']}
  for id in ids:
   pts=[c for r in g['rounds'] if 600<=r['r']<=1400 for c in r['ch'] if c['id']==id];col='#2076b8' if pts[0]['t']==g['us'] else '#d44d3f';seg=[]
   for c in pts+[{'p':None}]:
    if c['p'] is None:
     if len(seg)>1:q=np.array(seg);ax.plot(q[:,0],q[:,1],c=col,lw=.7,alpha=.45)
     seg=[]
    else:seg.append(c['p'])
  for d in g['deaths']:
   if 600<=d['r']<=1400:ax.scatter(*d['p'],c='#0056c9' if d['t']==g['us'] else '#c72622',s=35,marker='x',lw=1.2,zorder=5)
  for c in g['caps']:
   if 600<=c['r']<=1400 and c['g']>0:ax.scatter(*c['p'],s=12+c['g']*.4,facecolors='none',edgecolors='#2076b8' if c['t']==g['us'] else '#d44d3f',alpha=.6,lw=.7)
  dn=[sum(d['t']==t and 600<=d['r']<=1400 for d in g['deaths']) for t in [g['us'],1-g['us']]]
  ax.set_title(f"{g['map']} · {g['result']} {g['score']}–{g['oppScore']}\nvs {g['opponent']} · deaths r600–1400 {dn[0]}–{dn[1]}",fontsize=10,loc='left');ax.tick_params(labelsize=7);ax.grid(alpha=.08)
 for ax in list(axs.flat)[len(rows[page*6:(page+1)*6]):]:ax.set_visible(False)
 fig.suptitle(f"Replay visual audit · rounds 600–1400 · page {page+1}/{(len(rows)+5)//6}",fontsize=17)
 fig.supxlabel('Blue = our side; red = opponent. Trails sampled every 5 rounds; crosses = deaths; hollow circles = gem captures; stars = altars. Omniscient view.',fontsize=10)
 out=dst/f'page_{page+1:02}.png';fig.savefig(out,dpi=120,bbox_inches='tight');plt.close(fig);print(out)
