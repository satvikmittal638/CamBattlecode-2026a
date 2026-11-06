from pathlib import Path
import os,json
p=Path(__file__).parent
os.environ.setdefault('MPLCONFIGDIR',str(p/'mplconfig'));os.environ.setdefault('XDG_CACHE_HOME',str(p/'cache'))
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
s=json.loads((p/'platform_results.json').read_text())['summary'];rows=json.loads((p/'metrics.json').read_text())['rows']
fig,axes=plt.subplots(1,2,figsize=(11.5,5.4))
for ax,key,title in [(axes[0],'challengeWins','Five-game challenge wins'),(axes[1],'wins','Individual game wins')]:
 denkey='challenges' if key=='challengeWins' else 'games';vals=[s[k][key] for k in ['near','half','all']];den=[s[k][denkey] for k in ['near','half','all']];rates=[100*a/b for a,b in zip(vals,den)]
 bars=ax.bar(['Nearby*','Half-rank*','Total'],rates,color=['#0072B2','#D55E00','#555555'],width=.6);ax.bar_label(bars,labels=[f'{a}/{b}\n{r:.1f}%' for a,b,r in zip(vals,den,rates)],padding=4);ax.set_ylim(0,110);ax.set_ylabel('Win rate (%)');ax.set_title(title,loc='left');ax.spines[['top','right']].set_visible(False);ax.set_axisbelow(True);ax.grid(axis='y',alpha=.2)
fig.suptitle('v57: completed 100-challenge platform test',x=.08,ha='left',fontsize=15)
fig.text(.08,.035,'*Frozen rank centers; distinct-opponent sampling widened the bands. Historical batches used different opponents.',fontsize=10)
fig.subplots_adjust(left=.08,right=.98,bottom=.17,top=.83,wspace=.27)
for ext in ['png','svg']:fig.savefig(p/f'platform_results.{ext}',dpi=160)
print('Platform chart written')

# Separate, descriptive loss-pattern chart; no historical-bot causal comparison.
z=json.loads((p/'summary.json').read_text())['sets']['normalLoss']
fig,axes=plt.subplots(1,3,figsize=(12,4.8))
for ax,key,title,unit in [
 (axes[0],'groupCapsPer100Rounds','Camp captures','Per 100 rounds'),
 (axes[1],'deaths','Champion deaths','Per game'),
 (axes[2],'meanDeposit','Completed deposit size','Gems per completed deposit')]:
 vals=[z['us'][key],z['opponent'][key]]
 bars=ax.bar(['v57','Opponent'],vals,color=['#0072B2','#D55E00'],width=.58)
 ax.bar_label(bars,labels=[f'{v:.2f}' for v in vals],padding=4)
 ax.set_ylim(0,max(vals)*1.22);ax.set_title(title,loc='left');ax.set_ylabel(unit)
 ax.spines[['top','right']].set_visible(False);ax.set_axisbelow(True);ax.grid(axis='y',alpha=.18)
fig.suptitle(f"Remaining gap in {z['n']} normal-map losses",x=.07,ha='left',fontsize=15)
fig.text(.07,.03,'Descriptive means within this test. Camp captures include gold-only groups; special maps are excluded.',fontsize=10)
fig.subplots_adjust(left=.07,right=.98,bottom=.19,top=.80,wspace=.45)
for ext in ['png','svg']:fig.savefig(p/f'loss_patterns.{ext}',dpi=160)
print('Loss-pattern chart written')
