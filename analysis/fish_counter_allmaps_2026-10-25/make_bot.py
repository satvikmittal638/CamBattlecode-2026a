from pathlib import Path
import base64,json,shutil,struct,sys
root=Path(__file__).resolve().parents[2];folder=Path(__file__).parent
name=sys.argv[1] if len(sys.argv)>1 else 'fish-atlas-08';dest=root/'workspace/bots'/name/'src'
if dest.exists():
 assert '--refresh-unsubmitted' in sys.argv and not any(json.loads(f.read_text()).get('bot')==name for f in (folder/'trials').glob('*/upload_intent.json')),dest
 shutil.rmtree(dest)
shutil.copytree(root/'workspace/bots/fish-playbook-05/src',dest)
(dest/'playbook_data.h').unlink();meta=json.loads((folder/'books/summary.json').read_text());header=['#pragma once\n#include <cstdint>\nstruct PbAct{int key,x,y,v,k,s;};\nstruct PbMap{int w,h,groups,sx,sy,n,end;int draft[5];const char* data;int size;};']
total=0;fingerprints=set();manifest=[]
for i,m in enumerate(meta):
 d=json.loads((folder/'books'/m['file']).read_text());fingerprint=(m['w'],m['h'],m['groups'],m['spawn']['minX'],m['spawn']['minY']);assert fingerprint not in fingerprints,(m['map'],m['side']);fingerprints.add(fingerprint)
 acts=sorted(d['actions'],key=lambda a:(a['t'],a['r']));last_priority={};kept=[]
 for a in acts:
  if a['k']==9:
   if last_priority.get(a['t'])==a['v']:continue
   last_priority[a['t']]=a['v']
  kept.append(a)
 raw=b''.join(struct.pack('<HhhiBB',a['t']*2048+a['r'],a['x'],a['y'],a['v'],a['k'],a['s']) for a in kept);assert len(raw)==len(kept)*12
 encoded=base64.b64encode(raw).decode();assert len(encoded)==len(kept)*16
 f=f'book_{m["map"]}_{m["side"]}.h';(dest/f).write_text('#pragma once\nstatic const char pb_data_'+str(i)+'[]=\n'+'\n'.join('"'+encoded[k:k+1024]+'"' for k in range(0,len(encoded),1024))+';\n');header.append('#include "'+f+'"');m['size']=len(kept);total+=len(kept);manifest.append({**m,'retainedActions':len(kept),'rawActions':len(acts),'dataFile':f})
header.append('static const PbMap pb_maps[]={\n'+',\n'.join('{'+','.join(map(str,[m['w'],m['h'],m['groups'],m['spawn']['minX'],m['spawn']['minY'],len(m['draft']),m['rounds']]))+',{'+','.join(map(str,m['draft']))+'},'+f'pb_data_{i},{m["size"]}'+'}' for i,m in enumerate(meta))+'\n};\nstatic constexpr int PB_MAPS=sizeof(pb_maps)/sizeof(pb_maps[0]);')
header.append('''inline unsigned pb_six(char c){return c>='A'&&c<='Z'?c-'A':c>='a'&&c<='z'?c-'a'+26:c>='0'&&c<='9'?c-'0'+52:c=='+'?62:63;}
inline int pb_key(const char* p){unsigned a=pb_six(p[0]),b=pb_six(p[1]),c=pb_six(p[2]);return ((a<<2)|(b>>4))|(((b<<4)|(c>>2))&255)<<8;}
inline PbAct pb_read(const char* p){unsigned char b[12];for(int i=0;i<4;++i){unsigned a=pb_six(p[4*i]),c=pb_six(p[4*i+1]),d=pb_six(p[4*i+2]),e=pb_six(p[4*i+3]);b[3*i]=(a<<2)|(c>>4);b[3*i+1]=(c<<4)|(d>>2);b[3*i+2]=(d<<6)|e;}return {b[0]|(b[1]<<8),static_cast<std::int16_t>(b[2]|(b[3]<<8)),static_cast<std::int16_t>(b[4]|(b[5]<<8)),static_cast<std::int32_t>(static_cast<std::uint32_t>(b[6])|(static_cast<std::uint32_t>(b[7])<<8)|(static_cast<std::uint32_t>(b[8])<<16)|(static_cast<std::uint32_t>(b[9])<<24)),b[10],b[11]};}
''')
(dest/'playbook_data.h').write_text('\n'.join(header));s=(dest/'replay_policy.h').read_text();a=s.index(' const auto first=m.actions,last=first+m.size;');b=s.index('  try {',a)
s=s[:a]+''' int lo=0,hi=m.size;while(lo<hi){const int mid=(lo+hi)/2;if(pb_key(m.data+mid*16)<key)lo=mid+1;else hi=mid;}
 static int errors=0;
 for(int index=lo;index<m.size&&pb_key(m.data+index*16)==key;++index){const auto a=pb_read(m.data+index*16);const bc::vec2 p{a.x,a.y};
'''+s[b:];(dest/'replay_policy.h').write_text(s)
p=dest/'main.cpp';s=p.read_text().replace('build fish-playbook-05-public-winning-actions','build '+name+'-80-map-side-counter-library');p.write_text(s)
(folder/f'{name}_manifest.json').write_text(json.dumps({'bot':name,'cases':len(meta),'actions':total,'source':'public Fish losses; exact map/side trajectory playback','books':manifest},indent=2));print('Generated',name,len(meta),'cases',total,'actions','base64 bytes',total*16)
