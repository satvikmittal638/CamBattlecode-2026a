from pathlib import Path
import os,json
p=Path(__file__).parent
os.environ.setdefault('MPLCONFIGDIR',str(p/'mplconfig'))
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
rows=json.loads((p/'native.json').read_text())['rows']
fig,axes=plt.subplots(2,2,figsize=(13,8),sharex='col',layout='constrained')
for j,(op,mapname,title) in enumerate([('Intercontinental Fish','00monolith','Successful scaling: 1,124–936 vs Fish'),('procless','01boss_battle','Power without conversion: 262–339 vs procless')]):
 r=next(r for r in rows if r['opponent']==op and r['map']==mapname);ts=r['prismTurns'];x=[t['r'] for t in ts];base=[t['focus']-1.5*t['bag'] for t in ts];bonus=[1.5*t['bag'] for t in ts]
 ax=axes[0,j];ax.stackplot(x,base,bonus,labels=['Base + equipment Focus','Focus from carried gems'],colors=['#7999af','#935bd5']);ax.set(title=title,ylabel='Native Prism Focus');ax.legend(loc='upper left',fontsize=8);ax.grid(alpha=.15)
 ax=axes[1,j];finalBag=next(c['gems'] for c in r['final'] if c['team']==r['us'] and c['type']=='Prism');ax.plot(x+[r['rounds']],[t['bag'] for t in ts]+[finalBag],color='#935bd5',label='Prism carried gems',lw=1.7)
 for team,label,color in [(r['us'],'Developer team bank','#208454'),(1-r['us'],'Opponent bank','#c65353')]:
  bx=[0];by=[0];total=0
  for b in r['banking']:
   if b['team']==team:total+=b['amount'];bx.append(b['r']);by.append(total)
  bx.append(r['rounds']+max(10,r['rounds']*.01));by.append(total);ax.step(bx,by,where='post',label=label,color=color,lw=1.5)
 ax.set(xlabel='Round',ylabel='Gems',xlim=(0,r['rounds']+max(10,r['rounds']*.01)));ax.legend(loc='upper left',fontsize=8);ax.grid(alpha=.15)
 if j==0:
  ax.axvline(979,color='#444',ls=':',lw=1);ax.annotate('653-gem winning deposit',xy=(979,1124),xytext=(420,1200),arrowprops={'arrowstyle':'->'},fontsize=9)
 else:ax.annotate('Ends carrying 1,312 gems',xy=(r['rounds'],1312),xytext=(900,1450),arrowprops={'arrowstyle':'->'},fontsize=9)
fig.suptitle('Prism: carried gems become combat power, but only banked gems score',fontsize=16)
fig.savefig(p/'images/prism_examples.png',dpi=160);fig.savefig(p/'images/prism_examples.svg');plt.close(fig)
