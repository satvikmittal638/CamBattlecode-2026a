from pathlib import Path
import json,os,numpy as np
D=Path(__file__).resolve().parent;os.environ['MPLCONFIGDIR']=str(D/'.mpl')
import matplotlib;matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Circle
rows=json.loads((D/'perspective_frames.json').read_text());fig,axs=plt.subplots(1,3,figsize=(17,6),layout='constrained')
for ax,e in zip(axs,rows):
 t=e['observed'];me=t['self'];m=e['info'];g=e['group'];xs=[me['x']]+[p['x'] for p in g['members']]+[p['x'] for p in t['en']];ys=[me['y']]+[p['y'] for p in g['members']]+[p['y'] for p in t['en']];x0=max(-1,min(xs)-3);x1=min(m['width'],max(xs)+3);y0=max(-1,min(ys)-3);y1=min(m['height'],max(ys)+3)
 visible={tuple(p) for p in e['visible']};fog=np.ones((m['height'],m['width']));
 for x,y in visible:fog[y,x]=0
 ax.imshow(fog,origin='lower',extent=(-.5,m['width']-.5,-.5,m['height']-.5),cmap='Greys',vmin=0,vmax=2,alpha=.3,zorder=0)
 for key,col in [('walls','#404a57'),('holes','#b5c7db'),('bushes','#dcebcf')]:
  ps=[p for p in m[key] if x0<=p[0]<=x1 and y0<=p[1]<=y1]
  if ps:ax.scatter(*zip(*ps),s=65,c=col,marker='s',lw=0,zorder=1)
 for c in t['cp']:
  if not(x0<=c['x']<=x1 and y0<=c['y']<=y1):continue
  col='#8b50a3' if c['ty']=='Monolith' else '#aa9c71';ax.scatter(c['x'],c['y'],s=100,c=col,marker='s',edgecolor='white',lw=.8,zorder=3)
  if c['str']>0 and not(c['ty']=='Monolith' and e['map']=='01boss_battle'):ax.annotate(f"{c['ty']} {c['str']:g}",(c['x'],c['y']),xytext=(0,10),textcoords='offset points',ha='center',fontsize=8,color=col)
 if e['map']=='01boss_battle':ax.text(23.5,20.7,'2 Monoliths · 200 each',ha='center',fontsize=8,color='#8b50a3')
 for p in g['members']:
  ax.scatter(p['x'],p['y'],s=180,facecolors='none',edgecolors='#7e4c9c',lw=1.5,zorder=2)
 for c in t['en']:
  ax.scatter(c['x'],c['y'],s=125,c='#d34d3e',ec='white',zorder=5);ax.annotate(c['t'],(c['x'],c['y']),xytext=(0,-16),textcoords='offset points',ha='center',fontsize=8,color='#b5352a')
 ax.scatter(me['x'],me['y'],s=170,c='#2076b8',ec='white',zorder=5);ax.annotate('observer',(me['x'],me['y']),xytext=(0,-16),textcoords='offset points',ha='center',fontsize=8,color='#2076b8')
 if e['kind']=='weapon':
  mons=[c for c in t['cp'] if any(c['x']==p['x'] and c['y']==p['y'] for p in g['members']) and c['str']>0]
  for c in mons:
   target=min(t['en'],key=lambda p:max(abs(c['x']-p['x']),abs(c['y']-p['y'])));ax.annotate('',xy=(target['x'],target['y']),xytext=(c['x'],c['y']),arrowprops=dict(arrowstyle='->',color='#ad6b19',lw=2))
  sub='Wake the camp; its nearest target is an enemy'
 else:
  ax.annotate(f"{g['gems']} gems ready\n{e['pathDistance']} walking steps\nexcluded by static territory",(g['members'][0]['x'],g['members'][0]['y']),xytext=(15,20),textcoords='offset points',fontsize=10,color='#75428d',bbox=dict(fc='white',ec='#75428d',alpha=.95))
  sub='A visible reward with no remaining clear cost'
 ax.set(xlim=(x0-.5,x1+.5),ylim=(y0-.5,y1+.5),aspect='equal',title=f"{e['map']} · round {e['r']}\n{sub}");ax.grid(alpha=.12);ax.tick_params(labelsize=8)
fig.suptitle('What the champion can observe: overlooked opportunities, without omniscient enemy information',fontsize=15)
fig.supxlabel('Only personally observed enemies and camps are drawn. Shading marks outside current vision; terrain is public.\nPurple rings = selected camp region. Orange arrows = nearest-target prediction at that instant, not a guarantee about enemy future movement.',fontsize=10)
fig.savefig(D/'personal_opportunities.png',dpi=150,bbox_inches='tight');plt.close(fig);print(D/'personal_opportunities.png')
