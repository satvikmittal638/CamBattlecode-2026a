from pathlib import Path
import os,json,re
D=Path(__file__).resolve().parent;os.environ['MPLCONFIGDIR']=str(D/'.mpl')
import matplotlib;matplotlib.use('Agg')
import matplotlib.pyplot as plt

def load(p):return [x for l in p.read_text().splitlines()if 'r'in (x:=json.loads(l))]
trace=load(D/'lanes_trace.jsonl');a=load(D/'recovery_live_base.jsonl');b=load(D/'recovery_live_recovery.jsonl')
fig,axs=plt.subplots(1,3,figsize=(16,4.8),layout='constrained')
for cid in sorted({t['id']for t in trace}):
 pts=[]
 for t in trace:
  m=re.search(r'remaining (\d+)',t.get('log',''))
  if t['id']==cid and m and t['r']>=8:pts.append((t['r'],int(m[1])))
 if pts:axs[0].plot(*zip(*pts),lw=.8,label=next(t['type']for t in trace if t['id']==cid))
axs[0].axhline(42000,c='#b84032',ls='--',label='Farm execution gate: 42,000');axs[0].set(xlabel='Round',ylabel='Bot-reported fuel remaining',title='A target chosen every turn, no action budget');axs[0].legend(fontsize=7,frameon=False)
for data,label,col in [(a,'v128','#a5aeb8'),(b,'Repeated-stall recovery','#267cb4')]:
 for cid in sorted({t['id']for t in data}):
  p=[t['pos']for t in data if t['id']==cid and t['alive']];axs[1].plot(*zip(*p),c=col,lw=1,alpha=.65,label=label if cid==min(t['id']for t in data)else None)
 xs=sorted({t['r']for t in data});counts=[sum(len(t.get('bot',[]))for t in data if t['mode']=='live'and t['r']<=r)for r in xs];axs[2].plot(xs,counts,c=col,label=label)
axs[1].set(xlabel='Map x',ylabel='Map y',title='The army leaves its stationary opening',xlim=(0,90),ylim=(0,30),aspect='equal');axs[1].legend(fontsize=8,frameon=False)
axs[2].set(xlabel='Round',ylabel='Cumulative engine-validated actions',title='Fresh budget becomes actual game work');axs[2].legend(fontsize=8,frameon=False)
for ax in axs:ax.grid(alpha=.15)
fig.suptitle('Planning can become a permanent substitute for playing',fontsize=16)
fig.supxlabel('Left: original v128 diagnostic replay, 100% action agreement through round 200. Right: intervention from round 6 with recorded opponent actions.\nThis verifies the deadlock mechanism, not strength against a reacting opponent; fully reactive tests and platform matches are separate.',fontsize=9)
fig.savefig(D/'planning_debt.png',dpi=150,bbox_inches='tight');plt.close(fig)
