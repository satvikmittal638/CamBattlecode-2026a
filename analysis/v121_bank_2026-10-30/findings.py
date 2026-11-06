from pathlib import Path
import json,os,numpy as np
D=Path(__file__).resolve().parent;os.environ['MPLCONFIGDIR']=str(D/'.mpl')
import matplotlib;matplotlib.use('Agg')
import matplotlib.pyplot as plt
P=D/'paired_c2';cmp=json.loads((P/'comparison.json').read_text());A,B=[sum([json.loads(p.read_text()) for p in (P/a).glob('bank_audit_?.json')],[]) for a in ['control','candidate']]
fig,ax=plt.subplots(1,3,figsize=(15,5),layout='constrained');x=np.arange(3);w=.32
for off,label,col,k in [(-w/2,'v121','#9aa8b7','baselineWins'),(w/2,'v123','#287eb8','candidateWins')]:
 vals=[cmp[p][k] for p in ['all','strong','near']];bars=ax[0].bar(x+off,vals,w,label=label,color=col);ax[0].bar_label(bars,padding=3)
ax[0].set(xticks=x,xticklabels=['All /100','Half-rank /50','Near-rank /50'],ylim=(0,58),title='Matched platform wins');ax[0].legend(frameon=False)
keys=['channelDeaths','largeBagDeaths','interrupted'];xs=np.arange(3)
for off,label,col,rs in [(-w/2,'v121','#9aa8b7',A),(w/2,'v123','#287eb8',B)]:
 vals=[sum(r[k] for r in rs) for k in keys];bars=ax[1].bar(xs+off,vals,w,label=label,color=col);ax[1].bar_label(bars,padding=3)
ax[1].set(xticks=xs,xticklabels=['Deaths while\ntributing','Deaths with\n≥200 gems','Interrupted\ntributes'],ylim=(0,220),title='Delivery behavior across 100 games')
maps=['01boss_battle','02treasure_box','00lanes'];xs=np.arange(3)
for off,label,col,k in [(-w/2,'v121','#9aa8b7','baselineWins'),(w/2,'v123','#287eb8','candidateWins')]:
 vals=[cmp['maps'][m][k] for m in maps];bars=ax[2].bar(xs+off,vals,w,label=label,color=col);ax[2].bar_label(bars,padding=3)
ax[2].set(xticks=xs,xticklabels=['Boss Battle /20','Treasure Box /10','Lanes /10'],ylim=(0,17),title='The remaining weakness is broader')
for a in ax:a.spines[['top','right']].set_visible(False);a.grid(axis='y',alpha=.15);a.set_axisbelow(True)
fig.suptitle('The bank fix executes, but the overall strength gain remains uncertain',fontsize=16)
fig.supxlabel('8 gained wins, 5 lost wins. Opponent-cluster bootstrap 95% interval: −2 to +9 net wins per 100.\nSame opponents, maps, sides and drafts; random seeds and opponent executable versions were not controlled.',fontsize=10)
fig.savefig(D/'findings.png',dpi=160,bbox_inches='tight');fig.savefig(D/'findings.svg',bbox_inches='tight')
print(D/'findings.png')
