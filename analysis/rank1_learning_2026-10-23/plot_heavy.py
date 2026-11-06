from pathlib import Path
import os,json
p=Path(__file__).parent
os.environ.setdefault('MPLCONFIGDIR',str(p/'mplconfig'));os.environ.setdefault('XDG_CACHE_HOME',str(p/'cache'))
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
h=json.loads((p/'heavy_losses.json').read_text())
fig,axes=plt.subplots(1,3,figsize=(12.8,5.2))
for ax,key,title,unit in [(axes[0],'capturedGemsBy300','Gems captured by round 300','Gems per game'),(axes[1],'deathsBy300','Deaths by round 300','Deaths per game'),(axes[2],'capturesPer100Rounds','Camp capture rate','Captures per 100 rounds')]:
 for t,off,c,label in [('us',-.18,'#0072B2','v57'),('opponent',.18,'#D55E00','Opponent')]:
  vals=[h[k][t][key] for k in ['heavy','close']];bars=ax.bar([off,1+off],vals,width=.34,color=c,label=label);ax.bar_label(bars,labels=[f'{v:.1f}' for v in vals],padding=3)
 ax.set_xticks([0,1],['Heavy losses\n(n=145)','Close losses\n(n=29)']);ax.set_title(title,loc='left',fontsize=12);ax.set_ylabel(unit);ax.spines[['top','right']].set_visible(False);ax.set_axisbelow(True);ax.grid(axis='y',alpha=.15);ax.set_ylim(0,ax.get_ylim()[1]*1.15)
fig.suptitle('v57: the early economy and survival gap in heavy defeats',x=.07,ha='left',fontsize=15)
handles,labels=axes[0].get_legend_handles_labels();fig.legend(handles,labels,loc='upper right',bbox_to_anchor=(.98,.94),frameon=False,ncol=2)
fig.text(.07,.025,'Heavy = loss by ≥500 gems; close = loss by 1–150. Normal maps only. Descriptive groups differ in opponents and maps.',fontsize=10)
fig.subplots_adjust(left=.07,right=.98,bottom=.20,top=.79,wspace=.42)
for ext in ['png','svg']:fig.savefig(p/f'heavy_losses.{ext}',dpi=160)
print('Heavy-loss figure written')
