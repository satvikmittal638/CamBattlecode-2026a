from pathlib import Path
from collections import Counter
import json
p=Path(__file__).parent;meta=json.loads((p/'books/summary.json').read_text());names=['Ryth','Vesper','Vendetta','Cassi','Issac','Stellar','Prism','Marcella','Willow','Ren','Varg','Tavi','Heart of Ruin'];rows=[]
for m in meta:
 d=json.loads((p/'books'/m['file']).read_text());us=d['team'];captures=[c for c in d['captures'] if c['team']==us];gems=Counter();gold=Counter()
 for c in captures:gems[c['t']]+=c['gems'];gold[c['t']]+=c['gold']
 leader=gems.most_common(1)[0] if gems else (None,0);pt=[t for t in d['turns'] if t['t']==6];pbanks=[]
 for a in d['actions']:
  if a['k']==12 and a['t']==6:
   t=next((t for t in pt if t['r']==a['r']),None)
   if t:pbanks.append({'r':a['r'],'bagAtTurnStart':t['g']})
 locks=[a for a in d['actions'] if a['k']==20];deaths=[x for x in d['deaths'] if x['team']!=us];ours=[x for x in d['deaths'] if x['team']==us]
 rows.append({'case':m['map']+'/'+m['side'],'source':m['source'],'draft':d['draft'],'rounds':m['rounds'],'margin':m['score']-m['enemyScore'],'firstReward':captures[:1],'dominantGemCollector':names[leader[0]] if leader[0] is not None else None,'dominantGemCount':leader[1],'campGems':{names[t]:v for t,v in gems.items()},'campGold':{names[t]:v for t,v in gold.items()},'prismMaxBag':max([t['g'] for t in pt],default=0),'prismBankAttempts':pbanks,'locksPlaced':len(locks),'lockEvents':[{'r':a['r'],'champion':names[a['t']],'position':[a['x'],a['y']]} for a in locks[:10]],'opponentDeaths':len(deaths),'ourDeaths':len(ours),'firstMiteDeath':deaths[:1]})
(p/'catalogue/strategy_patterns.json').write_text(json.dumps(rows,indent=2));drafts=Counter(tuple(r['draft']) for r in rows);collectors=Counter(r['dominantGemCollector'] for r in rows);prism=[r for r in rows if 'Prism' in r['draft']];locks=[r for r in rows if r['locksPlaced']]
lines=['# Patterns in the selected winning references','',f"These are descriptions of **80 outcome-selected public wins**, not controlled comparisons or a claim of an 80/80 live result. Draft, route, collector allocation, combat timing and deposits were observed together. Each exact sequence is subsequently retained or rejected using new live games.",'','## Resource allocation','',f"Largest camp-gem collector by case: {dict(collectors)}. The library therefore retains multiple resource plans instead of assuming one universal carry.",'','Most common complete drafts:','']
for draft,n in drafts.most_common(8):lines.append(f"- {n} cases: {', '.join(draft)}.")
lines+=['','## Prism retention','',f"Prism appears in {len(prism)} cases. {sum(r['prismMaxBag']>=300 for r in prism)} of those carry at least 300 gems at a recorded turn start. The rule is +1.5 Focus per carried gem, so retaining a large bag can increase spell damage. This is an observed mechanism; the data does not establish an optimal universal banking threshold.",'']
for r in sorted(prism,key=lambda r:r['prismMaxBag'],reverse=True)[:5]:lines.append(f"- `{r['case']}`: peak observed Prism bag {r['prismMaxBag']}; camp gems {r['campGems'].get('Prism',0)}; first tribute starts {r['prismBankAttempts'][:3]}; finish round {r['rounds']}.")
lines+=['','## Denial and conversion','',f"Altar locks are placed in {len(locks)} of the 80 reference cases. A lock cancels an opposing tribute and requires five basic attacks to remove, while permitting its owner's team to bank. The library preserves the precise placement and tribute order; trying to generalize a fixed placement round without the accompanying route is an untested change.",'']
for r in sorted(locks,key=lambda r:r['locksPlaced'],reverse=True)[:5]:lines.append(f"- `{r['case']}`: {r['locksPlaced']} lock placements; first events {r['lockEvents'][:3]}.")
lines+=['','## Combat versus racing','',f"{sum(r['opponentDeaths']==0 for r in rows)} references win without any Mite champion death. {sum(r['opponentDeaths']>=10 for r in rows)} have at least ten Mite deaths. Both economic races and combat suppression can therefore produce a win; the counter catalogue keeps the strategy appropriate to the recorded case.",'','For specific lethal sequences, `counterplay.json` stores the eight rounds preceding the first three Mite deaths, including casts and example moves. Each segment is tied to the original replay and full action table. A death window is evidence for a combined sequence, not proof that any isolated move caused the win.','']
(p/'catalogue/STRATEGY_PATTERNS.md').write_text('\n'.join(lines));print('Pattern catalogue:',len(prism),'Prism cases;',len(locks),'lock cases;',dict(collectors))
