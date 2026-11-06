from pathlib import Path
import json,os,numpy as np
D=Path(__file__).resolve().parent;os.environ['MPLCONFIGDIR']=str(D/'.mpl')
import matplotlib;matplotlib.use('Agg')
import matplotlib.pyplot as plt
C=json.loads((D/'paired_scan/comparison.json').read_text());P=json.loads((D/'paired_scan/pairs.json').read_text());S=json.loads((D/'paired_scan/spatial_comparison.json').read_text())
fig,axs=plt.subplots(2,2,figsize=(14,10),layout='constrained');maps=[m for m,v in C['maps'].items()if v['n']>=10];xs=np.arange(len(maps));w=.36
ax=axs[0,0]
for off,key,col,label in [(-w/2,'baselineWins','#9aa8b7','v121'),(w/2,'candidateWins','#287db7','v126')]:
 vals=[C['maps'][m][key]/C['maps'][m]['n']*100 for m in maps];b=ax.bar(xs+off,vals,w,color=col,label=label);ax.bar_label(b,labels=[str(C['maps'][m][key])+'/'+str(C['maps'][m]['n'])for m in maps],fontsize=8,padding=3)
ax.set(xticks=xs,xticklabels=[m[2:].replace('_',' ').title()for m in maps],ylim=(0,110),ylabel='Win rate (%)',title='Fresh matched platform games: repeated maps');ax.tick_params(axis='x',labelsize=8);ax.legend(frameon=False);ax.grid(axis='y',alpha=.15);ax.set_axisbelow(True)
for ax,key,title in [(axs[0,1],'capGold','Lanes: captured gold by round 300'),(axs[1,0],'capGems','Lanes: captured gems by round 300')]:
 for pool,col,label in [('strong','#d77a32','Half-rank opponents'),('near','#287db7','Near-rank opponents')]:
  ps=[p for p in P if p['key'][1]=='00lanes'and p['pool']==pool];a=[p['a']['metric']['teams'][p['a']['metric']['us']]['checkpoints']['300'][key]for p in ps];b=[p['b']['metric']['teams'][p['b']['metric']['us']]['checkpoints']['300'][key]for p in ps];ax.scatter(a,b,s=45,c=col,label=label,alpha=.85)
 maximum=max(ax.get_xlim()[1],ax.get_ylim()[1]);ax.plot([0,maximum],[0,maximum],color='#7e8891',ls='--',lw=1);ax.set(xlim=(0,maximum),ylim=(0,maximum),xlabel='v121 control',ylabel='v126 candidate',title=title);ax.grid(alpha=.12);ax.legend(frameon=False,fontsize=8)
ax=axs[1,1];bs=['lower','middle','upper'];xs=np.arange(3)
for off,arm,col,label in [(-w/2,'control','#9aa8b7','v121'),(w/2,'candidate','#287db7','v126')]:
 vals=[S['00lanes'][arm]['bands'].get(b+'Gems',0)for b in bs];b=ax.bar(xs+off,vals,w,color=col,label=label);ax.bar_label(b,fmt='%.1f',padding=3,fontsize=9)
ax.set(xticks=xs,xticklabels=['Lower (y<10)','Middle (10≤y<20)','Upper (y≥20)'],ylabel='Mean gems captured by round 300',title='Lanes: where the resources actually came from');ax.grid(axis='y',alpha=.15);ax.set_axisbelow(True);ax.margins(y=.18)
fig.suptitle(f"Scan-order strategy: v121 {C['all']['baselineWins']}/100 → v126 {C['all']['candidateWins']}/100",fontsize=18)
fig.supxlabel(f"100 matched map/side/opponent situations, 20 opponent clusters; net-win bootstrap 95% interval {C['clusterBootstrapNetWins95']}.\nResource figures use all 20 Lanes games. Absolute map y bands; these are measured outcomes, not estimates of hidden camp availability.",fontsize=10)
fig.savefig(D/'platform_comparison.png',dpi=145,bbox_inches='tight');plt.close(fig)
