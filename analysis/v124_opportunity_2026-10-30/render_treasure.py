from pathlib import Path
import json,os,numpy as np
D=Path(__file__).resolve().parent;os.environ['MPLCONFIGDIR']=str(D/'.mpl')
import matplotlib;matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
rows=json.loads((D/'treasure_frames.json').read_text());fig,axs=plt.subplots(1,4,figsize=(17,5.5),layout='constrained')
for ax,e in zip(axs,rows):
 t=e['observed'];m=e['info'];me=t['self'];fog=np.ones((m['height'],m['width']))
 for x,y in e['visible']:fog[y,x]=0
 ax.imshow(fog,origin='lower',extent=(-.5,m['width']-.5,-.5,m['height']-.5),cmap='Greys',vmin=0,vmax=2,alpha=.4)
 for k,col in [('walls','#47505b'),('holes','#bdc9d8'),('bushes','#dcebcf')]:
  pts=[p for p in m[k] if 8<=p[0]<=27 and 24<=p[1]<=34]
  if pts:ax.scatter(*zip(*pts),s=50,marker='s',c=col,lw=0)
 for team,s in enumerate(m['spawn']):
  ax.add_patch(Rectangle((s['minX']-.5,s['minY']-.5),s['maxX']-s['minX']+1,s['maxY']-s['minY']+1,facecolor='#2076b8' if team==1 else '#d44d3f',alpha=.18))
 for c in t['cp']:
  ax.scatter(c['x'],c['y'],s=55,c='#946a35',marker='s')
 for team,cs,col in [('ally',t['al'],'#2076b8'),('enemy',t['en'],'#d44d3f')]:
  for c in cs:
   ax.scatter(c['x'],c['y'],s=65,c=col,edgecolor='white',zorder=4)
 ax.scatter(me['x'],me['y'],s=110,c='#123f72',edgecolor='white',zorder=5)
 ax.annotate(f"{t['t']}\n{me['hp']}/{me['mhp']} HP",(me['x'],me['y']),xytext=(0,22),textcoords='offset points',ha='center',fontsize=8,bbox=dict(fc='white',ec='none',alpha=.85))
 ax.set(xlim=(8,27),ylim=(24,34),aspect='equal',title=f"Round {t['r']} · {len(t['en'])} visible enemies");ax.grid(alpha=.12);ax.tick_params(labelsize=8)
fig.suptitle('Treasure Box: the opening fight moves just outside the healing region',fontsize=15)
fig.supxlabel('One losing control replay, exact Marcella turn-start observations. Dark blue = observer; blue = allies; red = visible enemies.\nTinted rectangles = spawn regions; enemy champions cannot enter our spawn tiles. This sequence identifies a defensive-positioning hypothesis, not a tested fix.',fontsize=10)
fig.savefig(D/'treasure_opening.png',dpi=140,bbox_inches='tight');plt.close(fig)
