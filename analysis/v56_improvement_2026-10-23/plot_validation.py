from pathlib import Path
import json,os
p=Path(__file__).parent
os.environ.setdefault('MPLCONFIGDIR',str(p/'mplconfig'));os.environ.setdefault('XDG_CACHE_HOME',str(p/'cache'))
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
x=json.loads((p/'final_current/results.json').read_text());h=json.loads((p/'final_holdout/results.json').read_text());b=json.loads((p/'final_current/behavior_metrics.json').read_text());colors=['#777777','#0072B2'];names=['v56','Candidate'];key='codex-v57-final'
fig,axs=plt.subplots(2,2,figsize=(11,7))
for ax,r,title in [(axs[0,0],x,'40 current maps: wins'),(axs[0,1],h,'23 archived maps: wins')]:
 vs=[r['variants'][v]['overall'] for v in ['base',key]];values=[100*v['wins']/v['games'] for v in vs];bars=ax.bar(names,values,color=colors,width=.55);ax.bar_label(bars,labels=[f"{v['wins']}/{v['games']}\n{a:.1f}%" for a,v in zip(values,vs)],padding=4);ax.set_ylim(0,115);ax.set_ylabel('Win rate (%)');ax.set_title(title,loc='left')
for ax,field,title,ylabel in [(axs[1,0],'deaths','Normal maps: fewer deaths','Champion deaths per game'),(axs[1,1],'bank','Special maps: converting resources to score','Mean gems deposited per game')]:
 cohort='normal' if field=='deaths' else 'special';values=[b[v][cohort][field] for v in ['base',key]];bars=ax.bar(names,values,color=colors,width=.55);ax.bar_label(bars,labels=[f'{v:.2f}' for v in values],padding=4);ax.set_ylim(0,max(values)*1.25);ax.set_ylabel(ylabel);ax.set_title(title,loc='left')
for ax in axs.flat:ax.spines[['top','right']].set_visible(False);ax.set_axisbelow(True);ax.grid(axis='y',alpha=.2)
fig.suptitle('Final local validation of the v56 weakness fixes',x=.09,ha='left',fontsize=15)
fig.text(.09,.025,'Frozen sources, matched maps/opponents/sides, 100k fuel. Local historical/mimic opponents; platform results are separate.',fontsize=10)
fig.subplots_adjust(left=.09,right=.98,bottom=.12,top=.87,wspace=.3,hspace=.4)
for ext in ['png','svg']:fig.savefig(p/f'local_validation.{ext}',dpi=160)
print('Created local_validation.png/svg')
