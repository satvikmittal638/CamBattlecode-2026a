from pathlib import Path
import shutil
root=Path(__file__).resolve().parents[2];out=Path(__file__).parent;d=root/'workspace/bots/fish-sustain-04/src'
assert not d.exists();shutil.copytree(root/'workspace/bots/fish-economy-02/src',d)
def edit(f,a,b):
 p=d/f;s=p.read_text();assert s.count(a)==1,(f,a[:70],s.count(a));p.write_text(s.replace(a,b))
edit('main.cpp','build fish-economy-02-v62','build fish-sustain-04-radical')
edit('fishx_features.h','constexpr int X_GOLDRICH = 25;','constexpr int X_GOLDRICH = 10;')
edit('draft.cpp','    const bool gated=v1DraftBankGate>=0;','''    static constexpr std::array sustain{cambc::champion_draft::marcella,cambc::champion_draft::vesper_vale,cambc::champion_draft::willow,cambc::champion_draft::varg,cambc::champion_draft::ren};
    for(auto pick:sustain)if(std::find(mine.begin(),mine.end(),pick)==mine.end()){cambc::draft::pick(pick);return;}
    const bool gated=v1DraftBankGate>=0;''')
edit('bot.cpp','helpValid=helpReader.observe(shared[6]|(static_cast<unsigned>(shared[7])<<8),round);','helpValid=false; // final two bytes now carry the fresh focus-fire target')
edit('v1_dispatch.h','bool Bot::answerHelp(){','bool Bot::answerHelp(){\n    return false; // replaced by a squad objective and shared focus protocol')
edit('bot.cpp','    if(t==ct::vesper_vale)return 0;\n    if(t==ct::marcella)return 1;','    if(t==ct::vesper_vale)return 1;\n    if(t==ct::marcella)return 0;')
anchor='    try {\n        auto counts = me.item_count();\n        int gold = static_cast<int>(me.gold_count());'
edit('bot.cpp',anchor,'''    if(myType==bc::champion_type::willow){
        plan={{2,2,5},{5,2,5},{6,1,5},{6,2,5}};
        for(int n=10;n<=400;n+=5){plan.push_back({6,1,n});plan.push_back({6,2,n});}
    }
    if(myType==bc::champion_type::ren)plan={{6,2,5},{2,2,5},{1,1,1000}};
    if(myType==bc::champion_type::varg)plan={{0,0,5},{4,2,5},{1,0,1000}};
'''+anchor)
s=(d/'bot.cpp').read_text();start=s.index('bool Bot::fightChampions() {');end=s.index('// ------------------------------------------------------------------ camps',start);s=s[:start]+'#include "radical_combat.h"\n\n'+s[end:];(d/'bot.cpp').write_text(s);shutil.copyfile(out/'radical_combat.h',d/'radical_combat.h')
edit('v1_cycle.h','int Bot::chooseTarget(){','''int Bot::chooseTarget(){
    if(!farMap&&!capturing&&!lowMode&&bc::self().gem_count()<45){
        int leader=-1;for(int i=0;i<nAllies&&i<6;++i)if(slotType[i]==static_cast<int>(bc::champion_type::marcella))leader=i;
        if(leader>=0&&leader!=slot&&!(shared[leader]&0xC0)){
            const int gid=(shared[leader]&63)-1;
            if(gid>=0&&gid<static_cast<int>(groups.size())){
                const auto& g=groups[gid];if(g.eligible&&g.state<2&&g.totalHp>=1350&&gdist(g,bc::self().position())<=24&&stalledUntil[gid]<=round){stage="sustain-frontline-objective";return gid;}
            }
        }
    }''')
# Already-cast heals coexist with movement. Catch a patient brought into range
# by this turn's movement instead of waiting an extra enemy/camp attack cycle.
edit('bot.cpp','        willowTurn();\n        writeStatus(false);','''        willowTurn();
        if(!castThisTurn&&me.can_cast()&&enough(24000)){
            std::optional<bc::champion> patient;float missing=150;
            for(auto a:safeChamps(team::ally))if(a!=me&&a.is_alive()&&cheb(me.position(),a.position())<=4&&a.max_health()-a.health()>missing){missing=a.max_health()-a.health();patient=a;}
            if(patient)for(auto ab:me.abilities())if(ab.is_heal()&&selfReady(ab)){if(ACT(ab.use(*patient)))castThisTurn=true;break;}
        }
        writeStatus(false);''')
edit('v1_support.h','value+=(p.info.type==3?3:0)-cheb(pos,{p.info.x,p.info.y})*.25f;','value+=(p.info.type==7?6:0)-cheb(pos,{p.info.x,p.info.y})*.25f;')
print('Prepared fish-sustain-04: new roster, healer anchor, new combat, shared focus')
