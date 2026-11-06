from pathlib import Path
import json,sys,os
os.environ.setdefault('MPLCONFIGDIR','/private/tmp/fish-atlas-mpl')
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Patch
from matplotlib.colors import ListedColormap
import numpy as np
from datetime import datetime
from zoneinfo import ZoneInfo
p=Path(__file__).parent;version=int(sys.argv[1]);d=json.loads((p/f'evaluation_v{version}.json').read_text());maps=d['maps'];values=np.zeros((len(maps),2),dtype=int);labels=[['untested','untested'] for _ in maps]
for i,m in enumerate(maps):
 for r in m['rows']:
  j=0 if r['side']=='a' else 1;values[i,j]=2 if r['result']=='win' else 1;labels[i][j]=f"{r['score']} – {r['oppScore']}"
fig,ax=plt.subplots(figsize=(8.4,14.8));fig.patch.set_facecolor('#fbfcfe');ax.imshow(values,cmap=ListedColormap(['#e4e7ec','#efb0aa','#99d3b2']),vmin=0,vmax=2,aspect='auto');ax.set_xticks([0,1],['Our team A','Our team B']);ax.xaxis.tick_top();ax.tick_params(axis='x',length=0,pad=9,labelsize=11);ax.set_yticks(range(len(maps)),[m['map'] for m in maps],fontsize=9);ax.tick_params(axis='y',length=0,pad=8)
for i in range(len(maps)):
 for j in range(2):ax.text(j,i,labels[i][j],ha='center',va='center',fontsize=8.5,color='#17212c')
ax.set_xticks(np.arange(-.5,2,1),minor=True);ax.set_yticks(np.arange(-.5,len(maps),1),minor=True);ax.grid(which='minor',color='white',linewidth=1.5);ax.tick_params(which='minor',bottom=False,left=False)
for s in ax.spines.values():s.set_visible(False)
fig.suptitle(f'v{version} vs Mite',fontsize=18,fontweight='bold',x=.58,y=.985);fig.text(.58,.96,f"{d['wins']}/{d['distinctCells']} wins ({d['winRate']:.1%})  •  {d['distinctCells']}/80 cases tested",ha='center',fontsize=12);ax.legend(handles=[Patch(color='#99d3b2',label='Win'),Patch(color='#efb0aa',label='Loss'),Patch(color='#e4e7ec',label='Untested')],loc='upper center',bbox_to_anchor=(.5,-.016),ncol=3,frameon=False)
at=datetime.fromisoformat(d['at'].replace('Z','+00:00')).astimezone(ZoneInfo('Asia/Kolkata'));fig.text(.58,.018,'Cell values: our banked gems – Mite banked gems\nOne live game for each map and side • '+at.strftime('%d %b %Y, %H:%M IST'),ha='center',fontsize=9,color='#495466');fig.subplots_adjust(left=.29,right=.96,top=.92,bottom=.065);out=p/f'evaluation_v{version}.png';fig.savefig(out,dpi=140);print(out)
