from pathlib import Path
import json,os,collections
os.environ.setdefault('MPLCONFIGDIR',str(Path('analysis/v57_eval_2026-10-23/mplconfig').resolve()))
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
p=Path(__file__).parent;r=json.loads((p/'metrics.json').read_text())['rows'];s=json.loads((p/'patterns.json').read_text());local=json.loads((p/'local/results.json').read_text());normal=[g for g in r if g['map'] not in ['00contest','01boss_battle']];colors={'win':'#16826b','loss':'#ce4b54'}
plt.rcParams.update({'font.size':10,'axes.spines.top':False,'axes.spines.right':False})
fig,axs=plt.subplots(2,2,figsize=(13,9),layout='constrained');fig.suptitle('v58: economy and combat separate wins from losses',fontsize=17)
for outcome in ['win','loss']:
 gs=[g for g in normal if g['result']==outcome];c=colors[outcome]
 x=[sum(e['gems']*(1 if e['team']==g['us'] else -1) for e in g['captureEvents'] if e['r']<=300) for g in gs];y=[g['score']-g['oppScore'] for g in gs];axs[0,0].scatter(x,y,c=c,alpha=.65,label=f'{outcome} (n={len(gs)})',s=32)
 x=[sum(1 if d['team']==g['us'] else -1 for d in g['deaths']) for g in gs];axs[0,1].scatter(x,y,c=c,alpha=.65,s=32)
axs[0,0].set(xlabel='Camp gems captured by round 300: ours − enemy',ylabel='Final banked-gem margin',title='Heavy losses often start with an early resource deficit');axs[0,0].legend(fontsize=9)
axs[0,1].set(xlabel='Whole-game deaths: ours − enemy',ylabel='Final banked-gem margin',title='Death disparity accompanies many large defeats')
for ax in axs[0]:ax.axhline(0,c='#999',lw=.8);ax.axvline(0,c='#999',lw=.8);ax.grid(alpha=.13)
labels=['Wins','Losses','Heavy losses'];keys=['normalWins','normalLosses','heavyNormalLosses'];x=np.arange(3);w=.34
for t,label,c in [('us','v58','#367bb5'),('enemy','Enemy','#df8950')]:
 vals=[s['sets'][k][t]['capturedGems300'] for k in keys];bars=axs[1,0].bar(x+(-w/2 if t=='us' else w/2),vals,w,label=label,color=c);axs[1,0].bar_label(bars,fmt='%.0f',padding=3)
axs[1,0].set_xticks(x,[f"{lab}\n(n={s['sets'][k]['games']})" for lab,k in zip(labels,keys)]);axs[1,0].set(ylabel='Mean camp gems captured by round 300',title='Heavy losses: farming deficit before the final score');axs[1,0].legend()
for t,label,c in [('us','v58','#367bb5'),('enemy','Enemy','#df8950')]:
 vals=[s['sets'][k][t]['deaths'] for k in keys];bars=axs[1,1].bar(x+(-w/2 if t=='us' else w/2),vals,w,label=label,color=c);axs[1,1].bar_label(bars,fmt='%.1f',padding=3)
axs[1,1].set_xticks(x,labels);axs[1,1].set(ylabel='Mean champion deaths per game',title='Combat losses compound the resource deficit');axs[1,1].legend()
fig.text(.5,-.012,'Standard-resource maps only; heavy loss = deficit ≥500. Associations do not prove which failure came first.',ha='center',fontsize=10)
fig.savefig(p/'economy_combat.png',dpi=160,bbox_inches='tight');fig.savefig(p/'economy_combat.svg',bbox_inches='tight');plt.close(fig)
fig,axs=plt.subplots(1,2,figsize=(13,6),layout='constrained');fig.suptitle('Controlled local comparison · unchanged uploaded code',fontsize=16)
vs=['v56','v57','v58'];wins=[local['summary'][v]['all']['wins'] for v in vs];bars=axs[0].bar(vs,wins,color=['#98a2b3','#16826b','#ce4b54']);axs[0].bar_label(bars,labels=[f'{v}/80' for v in wins],padding=3);axs[0].set(ylim=(0,85),ylabel='Wins / 80 matched contexts',title='Same maps, opponents and sides');axs[0].grid(axis='y',alpha=.15);axs[0].set_axisbelow(True)
look={v:{(g['map'],g['opponent'],g['side']):g for g in local['rows'] if g['version']==v} for v in vs};by=collections.defaultdict(list)
for key,a in look['v58'].items():
 b=look['v57'][key];by[a['map']].append((a['score']-a['oppScore'])-(b['score']-b['oppScore']))
data=sorted((np.mean(vals),name) for name,vals in by.items());sel=data[:7]+data[-5:];yy=np.arange(len(sel));axs[1].barh(yy,[v for v,k in sel],color=['#ce4b54' if v<0 else '#16826b' for v,k in sel]);axs[1].set_yticks(yy,[k for v,k in sel]);axs[1].axvline(0,c='#555',lw=.8);axs[1].set(xlabel='Mean gem-margin change: v58 − v57',title='Largest negative and positive map changes');axs[1].invert_yaxis()
fig.text(.5,-.015,'40 maps × 2 frozen mimic opponents; one balanced side per context. Separate direct matchups: v58 won 14/40 vs v57.',ha='center',fontsize=10)
fig.savefig(p/'local_comparison.png',dpi=160,bbox_inches='tight');fig.savefig(p/'local_comparison.svg',bbox_inches='tight');plt.close(fig)
# Timelines chosen to inspect largest defeats plus a win against a repeated opponent.
ids=[g['matchId'] for g in sorted(r,key=lambda g:g['score']-g['oppScore']) if g['map'] not in ['00contest','01boss_battle']][:3]
ids += [g['matchId'] for g in sorted(r,key=lambda g:g['score']-g['oppScore'],reverse=True) if g['map'] not in ['00contest','01boss_battle']][:1]
fig,axs=plt.subplots(2,2,figsize=(13,8),layout='constrained');fig.suptitle('Selected replay timelines · three worst standard-map losses and strongest win',fontsize=15)
for ax,id in zip(axs.flat,ids):
 g=next(g for g in r if g['matchId']==id)
 for t,label,c in [(g['us'],'v58','#367bb5'),(1-g['us'],'Enemy','#df8950')]:
  ev=sorted([e for e in g['captureEvents'] if e['team']==t],key=lambda e:e['r']);x=[0]+[e['r'] for e in ev]+[g['rounds']];cum=np.r_[0,np.cumsum([e['gems'] for e in ev])];y=list(cum)+[cum[-1]];ax.step(x,y,where='post',c=c,label=label+' camp gems',lw=1.8)
  bank=sorted(g['bankTimeline'],key=lambda e:e['r']);xx=[0]+[e['r'] for e in bank]+[g['rounds']];yy=[0]+[e['bank'][t] for e in bank]+[g['score'] if t==g['us'] else g['oppScore']];ax.step(xx,yy,where='post',c=c,ls='--',label=label+' banked',alpha=.8)
  deaths=[d['r'] for d in g['deaths'] if d['team']==t];ax.plot(deaths,[-20 if t==g['us'] else -45]*len(deaths),'|',color=c,markersize=6)
 ax.set(title=f"{g['map']} vs {g['opponent']} · {g['score']}–{g['oppScore']}",xlabel='Round',ylabel='Gems');ax.grid(alpha=.15);ax.legend(fontsize=8,ncol=2)
fig.text(.5,-.012,'Solid: cumulative camp captures. Dashed: banked gems (may include stolen gems). Ticks below zero mark deaths.',ha='center',fontsize=9)
fig.savefig(p/'replay_timelines.png',dpi=160,bbox_inches='tight');fig.savefig(p/'replay_timelines.svg',bbox_inches='tight');plt.close(fig)
(p/'figure_cases.json').write_text(json.dumps(ids,indent=2));print('Written three inspected analysis figures')
