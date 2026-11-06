from pathlib import Path
import json,os
D=Path(__file__).resolve().parent;os.environ['MPLCONFIGDIR']=str(D/'.mpl')
import matplotlib;matplotlib.use('Agg')
import matplotlib.pyplot as plt
R=json.loads((D/'neutral_probe3.json').read_text());fig,axs=plt.subplots(1,3,figsize=(15,5),layout='constrained')
for arm,col in [('control','#9aa8b7'),('poke','#c75445'),('escape','#267db4')]:
 a=next(x for x in R if x['map']=='01boss_battle' and x['arm']==arm);o={(x['r'],x['c']):x for x in a['observations']};ps=[(r,o[(r,0)]['hp']) for r in range(103,109) if (r,0) in o]
 if arm!='escape':axs[0].plot(*zip(*ps),marker='o',c=col,label=arm)
 a=next(x for x in R if x['map']=='02cuts' and x['arm']==arm);o={(x['r'],x['c']):x for x in a['observations']};ps=[(r,o[(r,8)]['hp']) for r in range(329,335) if (r,8) in o];axs[1].plot(*zip(*ps),marker='o',c=col,label=arm)
 control=next(x for x in R if x['map']=='02cuts' and x['arm']=='control');b={(x['r'],x['id']):x for x in control['ourHealth']};me=[x for x in a['ourHealth'] if x['type']=='VesperVale'];axs[2].plot([x['r'] for x in me],[x['hp']-b[(x['r'],x['id'])]['hp'] for x in me],marker='o',c=col,label=arm)
axs[0].set(title='Boss Battle: provoke two Monoliths',xlabel='Round',ylabel='Observed enemy Heart HP',ylim=(0,1100));axs[0].legend(frameon=False)
axs[1].set(title='Cuts: monster fire reaches a distant enemy',xlabel='Round',ylabel='Observed enemy Ryth HP',ylim=(0,700));axs[1].legend(frameon=False)
axs[2].set(title='Leaving the firing zone prevents friendly losses',xlabel='Round',ylabel='Our Vesper HP relative to control');axs[2].legend(frameon=False)
for a in axs:a.grid(alpha=.15);a.spines[['top','right']].set_visible(False)
fig.suptitle('Make a neutral monster spend its attacks on the opponent',fontsize=16)
fig.supxlabel('Scripted engine interventions; all other own actions paused equally. Opponents retain recorded actions.\nEscape = ward at the old viewpoint, poke, dash, then walk beyond monster range. Missing enemy HP is unobserved, not assumed dead. This verifies a mechanism, not playing strength.',fontsize=10)
fig.savefig(D/'neutral_intervention.png',dpi=150,bbox_inches='tight');plt.close(fig);print(D/'neutral_intervention.png')
