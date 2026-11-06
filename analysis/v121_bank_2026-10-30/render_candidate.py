from pathlib import Path
import os,json
P=Path(__file__).parent
os.environ.setdefault('MPLCONFIGDIR',str((P/'.mpl').resolve()))
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import Rectangle

cases=json.loads((P/'candidate_visual_frames.json').read_text())
names={'HeartOfRuin':'H','VesperVale':'V','Ryth':'R','Marcella':'M','Vendetta':'D','Willow':'W','Cassi':'C','Issac':'I','Prism':'P','Stellar':'S','Varg':'G','Tavi':'T','Ren':'N'}
ours='#2076b8';enemy='#d44d3f'
specs={
 '01elk_arena':((18,33,18,29),'Ryth steps out of the firing line, but the team still loses the central objective'),
 '02treasure_box':((8,23,23,36),'Early pressure responses withdraw into a shrinking farming area'),
 '00lanes':((12,45,-1,18),'The bot escapes individual threats but loses control of nearby camps'),
 '01boss_battle':((-1,50,-1,42),'No early combat: repeated farm journeys fail to generate equipment and camp income')}
out=P/'images';out.mkdir(exist_ok=True)
for g in cases:
 n=len(g['frames']);wide=False;fig,axs=plt.subplots(1 if n<=2 else 2,2,figsize=(16,5.7 if n<=2 else 12),layout='constrained',squeeze=False)
 m=g['mapInfo'];bounds=(17,32,13,29);subtitle='Observed damage triggers cancellation; the carrier escapes and heals with its bag'
 if g['map']=='01broken_curve':bounds=(-1,m['width'],-1,m['height'])
 for ax,fr in zip(axs.flat,g['frames']):
  x0,x1,y0,y1=bounds;ax.set(xlim=(x0-.5,x1+.5),ylim=(y0-.5,y1+.5),aspect='equal')
  def tiles(key,color,alpha=1):
   pts=[p for p in m[key] if x0-1<=p[0]<=x1+1 and y0-1<=p[1]<=y1+1]
   if pts:
    a=np.array(pts);ax.scatter(a[:,0],a[:,1],s=90 if x1-x0<25 else 14,marker='s',c=color,alpha=alpha,linewidths=0,zorder=0)
  tiles('bushes','#d6e8c7',.8);tiles('holes','#758ca5',.7);tiles('walls','#444d59')
  for t,sp in enumerate(m['spawn']):
   ax.add_patch(Rectangle((sp['minX']-.5,sp['minY']-.5),sp['maxX']-sp['minX']+1,sp['maxY']-sp['minY']+1,fc=ours if t==g['us'] else enemy,alpha=.12,ec=ours if t==g['us'] else enemy,lw=1.5))
  for x,y in m['altars']:ax.scatter(x,y,marker='*',s=90,c='#7e3fa1',zorder=2)
  for c in fr['camps']:
   if c['hp']<=0:continue
   x,y=c['pos']
   if not(x0<=x<=x1 and y0<=y<=y1):continue
   col={'GemCluster':'#26b8bc','GoldCluster':'#d4a51c','Monolith':'#5d427e'}.get(c['type'],'#9b9690')
   ax.scatter(x,y,c=col,s=18 if wide else 38,marker='s',alpha=.65,zorder=1)
  # Recorded attack arrows in the preceding three rounds, directed at our champions.
  if not wide:
   pairs=set()
   for e in g['events']:
    if not(fr['round']-3<=e['round']<fr['round'] and e['kind'] in ['Attack','Cast ability'] and e.get('actor',{}).get('kind')==1 and e.get('team')!=g['us'] and e.get('target',{}).get('kind')=='champion' and e['target'].get('team')==g['us']):continue
    a,b=e['from'],e['to'];key=(*a,*b)
    if key in pairs or not(x0<=a[0]<=x1 and y0<=a[1]<=y1):continue
    pairs.add(key);ax.annotate('',xy=b,xytext=a,arrowprops=dict(arrowstyle='->',color=enemy,alpha=.45,lw=1.3),zorder=2)
  for c in fr['champions']:
   if not c['alive'] or c['pos'] is None:continue
   x,y=c['pos'];col=ours if c['team']==g['us'] else enemy
   if not(x0<=x<=x1 and y0<=y<=y1):
    if c['team']==g['us'] and c['type']=='VesperVale':
     ax.text(.03,.97,f"Vesper outside crop at ({x}, {y})\nHP {c['hp']}/{c['maxHp']} · {c['gems']} gems",transform=ax.transAxes,ha='left',va='top',color=col,fontsize=10,bbox=dict(fc='white',ec=col,alpha=.95,pad=5))
    continue
   ax.scatter(x,y,s=170 if not wide else 68,c=col,ec='white',lw=.8,zorder=5)
   ax.text(x,y,names.get(c['type'],'?'),ha='center',va='center',color='white',fontsize=8 if wide else 10,fontweight='bold',zorder=6)
   if not wide:
    text=f"{c['hp']}/{c['maxHp']}"+(f" · {c['gems']}g" if c['gems'] else '')
    offset=-16 if c['type'] in ['VesperVale','Willow','Issac'] else 10
    ax.annotate(text,(x,y),xytext=(0,offset),textcoords='offset points',ha='center',fontsize=7,color=col,zorder=7,bbox=dict(fc='white',alpha=.8,ec='none',pad=.5))
  if g['map']=='01broken_curve' and fr['round']==1069 and g.get('availableWalkRoute1069'):
   route=np.array(g['availableWalkRoute1069']);ax.plot(route[:,0],route[:,1],c='#20814b',ls='--',lw=2,zorder=3,label='8-step route in this frame')
   ax.legend(loc='lower right',fontsize=8)
  timing=g.get('frameTiming','round start')
  ax.set_title(f"Round {fr['round']} · {timing} · banked {fr['gems'][g['us']]}–{fr['gems'][1-g['us']]}",fontsize=11,loc='left')
  ax.set_xlabel('x');ax.set_ylabel('y');ax.grid(alpha=.12);ax.tick_params(labelsize=8)
 for ax in list(axs.flat)[n:]:ax.set_visible(False)
 fig.suptitle(f"v123 · {g['map']} vs {g['opponent']} · final {g['score']}–{g['oppScore']}\n{subtitle}",fontsize=15)
 fig.supxlabel('Blue = v123; red = opponent. H Heart, V Vesper, R Ryth, M Marcella, D Vendetta. Purple stars = altars.\nOmniscient replay view; arrows show recorded incoming champion attacks/casts in the preceding 3 rounds. Labels show HP/max HP and carried gems.',fontsize=10)
 for ext in ['png','svg']:fig.savefig(out/f"{g['label']}.{ext}",dpi=150,bbox_inches='tight')
 plt.close(fig)
 print(out/f"{g['label']}.png")
