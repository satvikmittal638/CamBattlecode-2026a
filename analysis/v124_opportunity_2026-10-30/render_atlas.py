from pathlib import Path
import json,os,numpy as np
D=Path(__file__).resolve().parent;os.environ['MPLCONFIGDIR']=str(D/'.mpl')
import matplotlib;matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
P=D.parent/'v121_bank_2026-10-30/paired_c2/control';V=json.loads((P/'visual.json').read_text());H=json.loads((D/'horizon_summary.json').read_text());G=sum([json.loads(p.read_text()) for p in D.glob('perspective2_?.json')],[])
selected=[next(h for h in H if h['map']=='00lanes' and h['label']=='strong_r50_01'),next(h for h in H if h['map']=='02cuts' and h['label']=='strong_r51_02')]
fig,axs=plt.subplots(2,2,figsize=(15,10),layout='constrained')
for rr,h in enumerate(selected):
 g=next(g for g in G if g['matchId']==h['matchId']);v=next(v for v in V if v['matchId']==h['matchId']);m=v['info'];a=[a for a in h['audits'] if a['visited']];freq={q['id']:sum((int(x['mask'])>>q['id'])&1 for x in a)/len(a) for q in g['groups']}
 ax=axs[rr,0]
 for key,col in [('walls','#444d59'),('holes','#b6c5d5')]:
  if m[key]:ax.scatter(*zip(*m[key]),s=5,c=col,marker='s',lw=0)
 for t,s in enumerate(m['spawn']):ax.add_patch(Rectangle((s['minX']-.5,s['minY']-.5),s['maxX']-s['minX']+1,s['maxY']-s['minY']+1,color='#2678b2' if t==g['us'] else '#d55643',alpha=.22))
 for q in g['groups']:
  x=np.mean([p['x'] for p in q['members']]);y=np.mean([p['y'] for p in q['members']]);eligible=q['eligible'];size=30+2*q['gems']
  ax.scatter(x,y,s=size,c=[freq[q['id']]] if eligible else '#d2d4d6',cmap='viridis',vmin=0,vmax=1,edgecolors='#1c2632' if eligible else 'none',linewidth=.6,zorder=3)
  if eligible:ax.annotate(str(q['id']),(x,y),xytext=(4,4),textcoords='offset points',fontsize=7)
 ax.set(xlim=(-1,m['width']),ylim=(-1,m['height']),aspect='equal',title=f"{g['map']} · camps the scorer actually considers")
 ax=axs[rr,1];qs=[q for q in g['groups'] if q['eligible']];ax.bar([q['id'] for q in qs],[freq[q['id']] for q in qs],color=plt.cm.viridis([freq[q['id']] for q in qs]));ax.set(ylim=(0,1.05),xlabel='Engine camp-group ID (arbitrary ordering)',ylabel='Fraction of scoring calls that evaluate this camp',title=f"{sum(x['visited']<x['total'] for x in a)}/{len(a)} scans truncated · action agreement {100*h['agreement']:.2f}%");ax.grid(axis='y',alpha=.15)
fig.suptitle('A second map exists inside the bot: its computation budget changes resource access',fontsize=16)
fig.supxlabel('First 600 rounds, recorded-opponent diagnostic replay. Grey camps fail static eligibility; colored camps are eligible.\nDot size follows gem value. Low-coverage camps remain physically accessible. Instrumentation can perturb fuel; both cases exceed 98% action agreement.',fontsize=10)
fig.savefig(D/'computational_atlas.png',dpi=150,bbox_inches='tight');plt.close(fig)
# Show the observed local mechanism instead of interpreting small win differences.
rows=sum([json.loads(p.read_text()) for p in (D/'local_metrics').glob('metrics_?.json')],[])
fig,axs=plt.subplots(1,3,figsize=(14,4.8),layout='constrained');maps=['00lanes','02treasure_box','02cuts'];xs=np.arange(3);w=.34
for ax,key,title in zip(axs,['capGold','capGems','deaths'],['Captured gold by round 300','Captured gems by round 300','Deaths by round 300']):
 for off,va,col in [(-w/2,'base','#9aa8b7'),(w/2,'partition','#267db6')]:
  vals=[np.mean([r['teams'][r['us']]['checkpoints']['300'][key] for r in rows if r['map']==mp and r['label']==va]) for mp in maps];b=ax.bar(xs+off,vals,w,color=col,label=va);ax.bar_label(b,fmt='%.1f',padding=3,fontsize=9)
 ax.set(xticks=xs,xticklabels=['Lanes','Treasure Box','Cuts'],title=title);ax.grid(axis='y',alpha=.15);ax.set_axisbelow(True);ax.margins(y=.15)
axs[0].legend(frameon=False);fig.suptitle('Change the order of thought, preserve the resource values',fontsize=16)
fig.supxlabel('Six fully reactive local situations per map, both sides against three bots. These metrics verify resource use; small local win changes are not strength evidence.',fontsize=10)
fig.savefig(D/'scan_mechanism.png',dpi=150,bbox_inches='tight');plt.close(fig)
print('Rendered computational_atlas.png and scan_mechanism.png')
