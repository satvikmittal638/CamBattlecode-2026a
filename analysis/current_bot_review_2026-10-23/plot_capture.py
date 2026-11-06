import os,json
from pathlib import Path
os.environ.setdefault('MPLCONFIGDIR',str(Path('analysis/v57_eval_2026-10-23/mplconfig').resolve()))
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
p=Path(__file__).parent;d=json.loads((p/'idle_case.json').read_text());s=next(s for s in d['samples'] if s['r']==100);fig,ax=plt.subplots(figsize=(12,3.5),layout='constrained');ax.scatter(range(5,35),[12]*30,s=115,marker='s',color='#d6d9e0',label='One cleared camp region: 30 connected tiles')
for c in s['regionOccupants']:
 color='#367bb5' if c['type']=='Ryth' else '#ce4b54';ax.scatter([c['pos']['x']],[12],s=230,color=color,zorder=5);ax.annotate(('Our Ryth' if c['type']=='Ryth' else 'Enemy Vendetta')+f"\n({c['pos']['x']}, 12)",(c['pos']['x'],12),xytext=(0,35),textcoords='offset points',ha='center',color=color,fontsize=12)
ax.annotate('',(13,11.6),(5,11.6),arrowprops={'arrowstyle':'<->','color':'#367bb5'});ax.text(9,11.35,'8-tile personal vision radius',ha='center',fontsize=10,color='#367bb5');ax.set_xlim(3,36);ax.set_ylim(11,14);ax.set_yticks([]);ax.set_xlabel('Map x coordinate; all these tiles are in the same camp group');ax.spines[['top','right','left']].set_visible(False);ax.set_title('A large win hides a capture deadlock · yellow_brick_road vs DOOMSDAY',fontsize=15);fig.text(.5,-.07,f"Ryth: {d['longestConsecutiveSameTile']} consecutive rounds on one tile; {d['counts']['contestedGoldLineRounds']} sampled rounds in a contested cleared region.\nEnemy occupancy anywhere in the region resets capture; the far end is outside Ryth’s vision.",ha='center',fontsize=10);fig.savefig(p/'capture_deadlock.png',dpi=160,bbox_inches='tight');fig.savefig(p/'capture_deadlock.svg',bbox_inches='tight');print('Capture deadlock diagram written')
