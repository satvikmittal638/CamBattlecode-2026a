from pathlib import Path
import os,json,statistics
p=Path(__file__).resolve().parent;root=p.parents[1]
os.environ['MPLCONFIGDIR']=str(p/'mpl_cache');os.environ['XDG_CACHE_HOME']=str(p/'cache')
import matplotlib;matplotlib.use('Agg')
import matplotlib.pyplot as plt
suites=[('40 current maps','final_current'),('23 archived maps','final_holdout')]
vals={}
for title,name in suites:
 d=json.loads((p/name/'results.json').read_text());groups={}
 for v in ['base','codex-v55']:
  rows=[r for r in d['rows'] if r['variant']==v];deaths=[];bank=[]
  for r in rows:
   z=json.loads((root/r['stats']).read_text());me='teamA' if r['side']=='a' else 'teamB'
   deaths.append(sum(int(c['metrics']['deaths']) for c in z['champions'] if c['team']==me));bank.append(r['score'])
  groups[v]={'games':len(rows),'wins':sum(r['win'] for r in rows),'deathMean':statistics.mean(deaths),'bankMean':statistics.mean(bank)}
 vals[name]=groups
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':10})
fig,axes=plt.subplots(1,3,figsize=(12,4.4));colors=['#718096','#168f91']
for ax,metric,label in zip(axes,['winPct','deathMean','bankMean'],['Game wins (%)','Mean champion deaths / game','Mean gems banked / game']):
 for i,(title,name) in enumerate(suites):
  for j,v in enumerate(['base','codex-v55']):
   a=vals[name][v];value=100*a['wins']/a['games'] if metric=='winPct' else a[metric];x=i+(j-.5)*.32
   ax.bar(x,value,width=.29,color=colors[j],label=['v54','Candidate'][j] if i==0 else None)
   txt=f"{a['wins']}/{a['games']}" if metric=='winPct' else f'{value:.1f}'
   ax.annotate(txt,(x,value),xytext=(0,4),textcoords='offset points',ha='center',fontsize=9)
 ax.set_xticks([0,1],[a[0].replace(' maps','\nmaps') for a in suites]);ax.set_title(label);ax.spines[['top','right']].set_visible(False);ax.grid(axis='y',alpha=.17);ax.set_axisbelow(True);ax.set_ylim(0,110 if metric=='winPct' else ax.get_ylim()[1]*1.16)
axes[0].legend(loc='upper left',frameon=False)
fig.suptitle('Exact-source local validation: v54 versus frozen candidate',fontsize=14,y=.98)
fig.text(.5,.015,'Same opponents, maps and sides. Historical/local opponents; these results do not predict the platform win rate.',ha='center',fontsize=9,color='#444')
fig.tight_layout(rect=(0,.04,1,.94));fig.savefig(p/'local_validation.png',dpi=170);fig.savefig(p/'local_validation.svg');(p/'local_validation_metrics.json').write_text(json.dumps(vals,indent=2));print(json.dumps(vals))
