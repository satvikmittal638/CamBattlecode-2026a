from pathlib import Path
import shutil,json,hashlib
root=Path(__file__).resolve().parents[2];out=Path(__file__).parent
for name in ['fish-base62','fish-pack-01']:
 d=root/'workspace/bots'/name/'src'
 if d.exists():raise RuntimeError(f'{name} already exists')
 shutil.copytree(out/'v62_source/src',d)
 if name=='fish-base62':continue
 def edit(f,a,b):
  p=d/f;s=p.read_text();assert s.count(a)==1,(f,a[:70],s.count(a));p.write_text(s.replace(a,b))
 edit('main.cpp','build v61-bossroster5','build fish-pack-01-v62')
 edit('fishx_features.h','constexpr bool X_OUTNUM = false;','constexpr bool X_OUTNUM = true;')
 edit('fishx_features.h','constexpr int X_OUTNUMBY = 2;','constexpr int X_OUTNUMBY = 1;')
 edit('fishx_features.h','constexpr float X_PACKMINHP = 4000.0f;','constexpr float X_PACKMINHP = 1350.0f;')
 edit('fishx_features.h','constexpr bool X_BIGCOMMIT = false;','constexpr bool X_BIGCOMMIT = true;')
 edit('v1_cycle.h','if(claimed)score*=.6f;','if(claimed)score*=g.totalHp>=X_PACKMINHP?2.0f:.6f;')
 edit('v1_cycle.h','if(claimed[g.id]==1)score*=1.6f; else if(claimed[g.id]==2)score*=1.2f; else if(claimed[g.id]>=3)score*=.6f;','if(claimed[g.id]==1)score*=2.4f; else if(claimed[g.id]==2)score*=1.7f; else if(claimed[g.id]>=3)score*=.8f;')
 # A flat two-turn damage envelope must not forbid a step that opens an escape.
 edit('v1_tactical.h','for(auto p:walking){if(!enough(33000))break;const float r=incoming(p,nullptr,false,false);if(r<risk-1){risk=r;escape=p;}}','''auto separation=[&](vec2 p){int d=99;for(const auto& f:foes)d=std::min(d,cheb(p,f.position()));return d;};
        auto escort=[&](vec2 p){int d=99;for(const auto& a:mates)if(a.id!=selfId&&!(a.info.state&(2|4|4096)))d=std::min(d,cheb(p,{a.info.x,a.info.y}));return d;};
        for(auto p:walking){if(!enough(33000))break;const float r=incoming(p,nullptr,false,false);
            if(r<risk-1||(r<=risk+1&&(separation(p)>separation(escape)||(separation(p)==separation(escape)&&escort(p)<escort(escape))))){risk=r;escape=p;}}''')
 hashes={str(p.relative_to(d)):hashlib.sha256(p.read_bytes()).hexdigest() for p in d.rglob('*') if p.is_file()}
 (out/(name+'_hashes.json')).write_text(json.dumps(hashes,indent=2))
print('Prepared immutable v62 baseline and fish-pack-01')
