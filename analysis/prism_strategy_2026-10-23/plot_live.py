from pathlib import Path
import os,json
p=Path(__file__).parent;os.environ.setdefault('MPLCONFIGDIR',str(p/'mplconfig'))
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
x=json.loads((p/'platform_results.json').read_text());fig,ax=plt.subplots(figsize=(9,4.8),layout='constrained')
keys=['near_our_rank','near_half_rank','top_stress'];labels=['Near our rank\n(ranks 61–71)','Stronger group\n(ranks 28–37)','Top-team stress\n(ranks 1–5)'];ys=[100*x['cohorts'][k]['wins']/x['cohorts'][k]['games'] for k in keys];bars=ax.bar(labels,ys,color=['#357eaa','#7155a5','#b65c5c'],width=.55)
for b,k,y in zip(bars,keys,ys):
 s=x['cohorts'][k];ax.text(b.get_x()+b.get_width()/2,y+2,f"{s['wins']}/{s['games']} games\n{s['setWins']}/{s['sets']} sets",ha='center',fontsize=11)
ax.set_ylim(0,100);ax.set_ylabel('Game win rate (%)');ax.set_title('v59 Prism live pilot: 29 wins in 125 games',fontsize=16);ax.yaxis.grid(alpha=.2);ax.set_axisbelow(True);fig.supxlabel('25 distinct opponents; cohorts differ in difficulty. No paired live v58 control.',fontsize=9)
fig.savefig(p/'images/live_results.png',dpi=160);fig.savefig(p/'images/live_results.svg');plt.close(fig)
