from pathlib import Path
import shutil,json
root=Path(__file__).resolve().parents[2];folder=Path(__file__).parent;dest=root/'workspace/bots/fish-playbook-05/src'
assert not dest.exists();shutil.copytree(root/'workspace/bots/fish-economy-02/src',dest)
meta=json.loads((folder/'playbooks/summary.json').read_text());parts=['#pragma once\n#include <cstdint>\nstruct PbAct{std::uint16_t key;std::int16_t x,y;std::int32_t v;std::uint8_t k,s;};\nstruct PbTurn{std::uint16_t key;std::int16_t x,y;};\nstruct PbMap{int w,h,groups,sx,sy,n,end;int draft[5];const PbAct* actions;int size;const PbTurn* turns;int nturns;};']
for i,m in enumerate(meta):
 data=json.loads((folder/'playbooks'/f"{m['map']}.json").read_text());acts=sorted(data['actions'],key=lambda a:(a['t'],a['r']));turns=sorted(data['turns'],key=lambda a:(a['t'],a['r']))
 parts.append(f'static const PbAct pb_acts_{i}[]={{\n'+',\n'.join('{'+','.join(map(str,[a['t']*2048+a['r'],a['x'],a['y'],a['v'],a['k'],a['s']]))+'}' for a in acts)+'\n};')
 parts.append(f'static const PbTurn pb_turns_{i}[]={{\n'+',\n'.join('{'+','.join(map(str,[a['t']*2048+a['r'],a['x'],a['y']]))+'}' for a in turns)+'\n};')
 m['sx']=data['spawn']['minX'];m['sy']=data['spawn']['minY']
parts.append('static const PbMap pb_maps[]={\n'+',\n'.join('{'+','.join(map(str,[m['w'],m['h'],m['groups'],m['sx'],m['sy'],len(m['draft']),m['rounds']]))+',{'+','.join(map(str,m['draft']))+'},'+f'pb_acts_{i},{m["actions"]},pb_turns_{i},{m["turns"]}'+'}' for i,m in enumerate(meta))+'\n};\nstatic constexpr int PB_MAPS=sizeof(pb_maps)/sizeof(pb_maps[0]);')
(dest/'playbook_data.h').write_text('\n'.join(parts)+'\n');shutil.copyfile(folder/'replay_policy.h',dest/'replay_policy.h')
p=dest/'main.cpp';s=p.read_text().replace('#include "draft.h"','#include "draft.h"\n#include "replay_policy.h"').replace('if(draft)play_draft();else bot.play_turn();','if(draft){if(!pb::draft())play_draft();}else if(!pb::turn())bot.play_turn();').replace('build fish-economy-02-v62','build fish-playbook-05-public-winning-actions');p.write_text(s)
index=[]
for m in meta:
 data=json.loads((folder/'playbooks'/f"{m['map']}.json").read_text());index.append({**{k:v for k,v in data.items() if k not in ['actions','turns']},'side':'a','result':'win','score':data['oppScore'],'oppScore':data['score'],'file':data['file']})
(folder/'playbooks/shadow_index.json').write_text(json.dumps(index))
print('Generated six-map winning public replay policy; action tables bytes',(dest/'playbook_data.h').stat().st_size)
