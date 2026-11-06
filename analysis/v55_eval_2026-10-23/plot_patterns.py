from pathlib import Path
import os, json
p=Path(__file__).parent
os.environ.setdefault('MPLCONFIGDIR',str(p/'mplconfig'))
os.environ.setdefault('XDG_CACHE_HOME',str(p/'cache'))
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
rows=json.loads((p/'metrics.json').read_text())['rows']
normal=[g for g in rows if g['map'] not in ['00contest','01boss_battle']]
fig,ax=plt.subplots(figsize=(10.5,6.6),layout='constrained')
for result,label,color in [('win','V55 wins','#0072B2'),('loss','V55 losses','#D55E00')]:
    gs=[g for g in normal if g['result']==result]
    x=[sum(d['team']==g['us'] for d in g['deaths'])-sum(d['team']!=g['us'] for d in g['deaths']) for g in gs]
    y=[100*(g['metrics'][0]['capGems']-g['metrics'][1]['capGems'])/g['rounds'] for g in gs]
    ax.scatter(x,y,s=36,alpha=.55,color=color,edgecolors='white',linewidths=.35,label=f'{label} ({len(gs)})')
ax.axvline(0,c='#747474',lw=.9,zorder=0)
ax.axhline(0,c='#747474',lw=.9,zorder=0)
ax.grid(c='#e5e5e5',lw=.6,alpha=.7)
ax.set_axisbelow(True)
ax.spines[['top','right']].set_visible(False)
ax.set_xlabel('Our deaths minus opponent deaths\nLeft: fewer deaths  |  Right: more deaths',labelpad=12)
ax.set_ylabel('Our captured gems minus opponent captured gems, per 100 rounds\nAbove zero: faster gem farming')
ax.set_title(f'V55: fighting losses and farming deficits often appear together\n{len(normal)} normal-map games; boss and gated maps excluded',loc='left',fontsize=14,pad=15)
ax.legend(frameon=False,loc='upper right')
fig.savefig(p/'fight_and_farm.png',dpi=160)
fig.savefig(p/'fight_and_farm.svg')
print('Plotted',len(normal),'normal-map games')
