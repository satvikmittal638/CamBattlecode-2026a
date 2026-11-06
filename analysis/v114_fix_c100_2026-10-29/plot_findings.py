import os,json
from pathlib import Path
D=Path(__file__).parent;os.environ['MPLCONFIGDIR']=str(D/'.mpl')
import matplotlib;matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
s=json.loads((D/'summary.json').read_text());fig,axs=plt.subplots(1,3,figsize=(15,5),layout='constrained')
ax=axs[0];ax.bar(['Near our rank\n100–111','Around half rank\n48–57'],[56,18],color=['#2179b5','#d9754b']);ax.set(ylim=(0,100),ylabel='Win rate (%)',title='Platform: exactly 100 games')
for i,n in enumerate([28,9]):ax.text(i,[56,18][i]+3,f'{n}/50',ha='center')
ax=axs[1];loss=s['trial']['loss'];keys=['equipment300','capGems','deaths'];ratios=[loss[k][0]/loss[k][1] for k in keys];ax.bar(['Equipment\nat round 300','Captured\ngems','Deaths'],ratios,color=['#2179b5','#2179b5','#d9754b']);ax.axhline(1,c='#555',ls='--');ax.set(ylabel='Our value / opponent value',title='The 63 losses: deficit persists',ylim=(0,4))
for i,v in enumerate(ratios):ax.text(i,v+.08,f'{v:.2f}×',ha='center')
ax=axs[2];maps=list(s['diagnosticMaps']);vals=[s['diagnosticMaps'][m]['wins'] for m in maps];ax.barh([m.replace('_',' ') for m in maps],vals,color=['#d9754b' if v==0 else '#2179b5' for v in vals]);ax.set(xlim=(0,4),xticks=range(5),xlabel='Wins out of four games',title='Repeated weakness-map diagnostics');ax.invert_yaxis()
fig.suptitle('v120: repairs execute, but stronger opponents still deny objectives',fontsize=16)
fig.supxlabel('Weakness-weighted sample; historical v114 results are not a paired platform control.',fontsize=10)
fig.savefig(D/'findings.png',dpi=150)
