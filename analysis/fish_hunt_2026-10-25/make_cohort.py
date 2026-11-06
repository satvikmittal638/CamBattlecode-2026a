from pathlib import Path
import shutil,json
root=Path(__file__).resolve().parents[2];out=Path(__file__).parent;d=root/'workspace/bots/fish-cohort-03/src'
assert not d.exists();shutil.copytree(root/'workspace/bots/fish-economy-02/src',d)
def edit(f,a,b):
 p=d/f;s=p.read_text();assert s.count(a)==1,(f,a[:70],s.count(a));p.write_text(s.replace(a,b))
edit('main.cpp','build fish-economy-02-v62','build fish-cohort-03-v62')
table=json.loads((out/'fish_draft_fingerprints.json').read_text());keys={};lines=[]
for r in table:
 k=(r['width'],r['height'],r['groups']);assert k not in keys or keys[k]==r['picks'];keys[k]=r['picks'];picks=list(map(int,r['picks']));picks+= [-1]*(5-len(picks));lines.append('        {'+','.join(map(str,k))+',{'+','.join(map(str,picks))+'}}, // '+r['map'])
draft='''    // Fish-specific static-layout draft table, measured in current live replays.
    // The source does not have access to opponent identity or hidden runtime state.
    struct Fingerprint {int w,h,n;int picks[5];};
    static constexpr Fingerprint known[]{
'''+ '\n'.join(lines)+'''
    };
    const int w=cambc::map::width(),h=cambc::map::height(),n=cambc::map::camp_groups().size();
    const int fallback[5]{1,2,11,3,6};const int fishSmallFallback[5]{1,11,6,-1,-1};
    const int* picks=cambc::draft::team_size()<=3?fishSmallFallback:fallback;
    for(const auto& f:known)if(f.w==w&&f.h==h&&f.n==n){picks=f.picks;break;}
    for(int j=0;j<5&&picks[j]>=0;++j){const auto pick=static_cast<cambc::champion_draft>(picks[j]);if(std::find(mine.begin(),mine.end(),pick)==mine.end()){cambc::draft::pick(pick);return;}}
'''
edit('draft.cpp','    const bool gated=v1DraftBankGate>=0;',draft+'    const bool gated=v1DraftBankGate>=0;')
edit('v1_cycle.h','int Bot::chooseTarget(){','''int Bot::chooseTarget(){
    // The published first six shared bytes carry real team camp commitments.
    // Follow the Vesper carry onto a substantial clear, rather than assuming
    // uncommitted distant allies will join an independently selected task.
    if(!farMap&&!capturing&&!lowMode&&bankGateHint<0&&bc::self().gem_count()<45){
        int leader=-1;for(int i=0;i<nAllies&&i<6;++i)if(slotType[i]==static_cast<int>(bc::champion_type::vesper_vale))leader=i;
        if(leader>=0&&leader!=slot&&!(shared[leader]&0xC0)){
            const int gid=(shared[leader]&63)-1;
            if(gid>=0&&gid<static_cast<int>(groups.size())){
                const auto& g=groups[gid];const int d=gdist(g,bc::self().position());
                if(g.eligible&&!g.monolith&&g.state<2&&g.totalHp>=1350&&d<=18&&stalledUntil[gid]<=round){stage="fish-shared-cohort";return gid;}
            }
        }
    }''')
# Linked death makes either member a valuable target, provided it is legally reachable.
edit('v1_tactical.h','a->info.health+a->shield-a->bag*2+cheb(origin,a->position())*30 < b->info.health+b->shield-b->bag*2+cheb(origin,b->position())*30','a->info.health+a->shield-a->bag*2+cheb(origin,a->position())*30-((a->info.type==3||a->info.type==4)?180:0) < b->info.health+b->shield-b->bag*2+cheb(origin,b->position())*30-((b->info.type==3||b->info.type==4)?180:0)')
edit('v1_tactical.h','if(kill)value+=120+target.bag*2;','if(kill)value+=120+target.bag*2+((target.info.type==3||target.info.type==4)?180:0);')
print('Prepared fish-cohort-03 with',len(table),'measured layout drafts')
