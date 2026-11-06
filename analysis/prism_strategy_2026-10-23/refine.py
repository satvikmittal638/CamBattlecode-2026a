from pathlib import Path
import shutil
ROOT=Path(__file__).resolve().parents[2];WS=ROOT/'workspace'
for name,cap in [('prism-economy',450),('prism-balanced',160)]:
 dst=WS/'bots'/name/'src';assert not dst.exists();shutil.copytree(WS/'bots/prism-core/src',dst)
 def edit(file,old,new):
  p=dst/file;s=p.read_text();assert s.count(old)==1,(file,old[:70],s.count(old));p.write_text(s.replace(old,new))
 edit('main.cpp','prism-core',''+name)
 edit('draft.cpp','prism,','prism,') if False else None
 p=dst/'draft.cpp';s=p.read_text();s=s.replace('cambc::champion_draft::prism,cambc::champion_draft::vesper_vale,cambc::champion_draft::marcella,cambc::champion_draft::heart_of_ruin,cambc::champion_draft::ryth','cambc::champion_draft::heart_of_ruin,cambc::champion_draft::vesper_vale,cambc::champion_draft::prism,cambc::champion_draft::marcella,cambc::champion_draft::ryth');p.write_text(s)
 # Team-visible bag potential prevents retention from postponing a coordinated win.
 edit('bot.cpp','    if(!enough(32000))return false;\n    const int a=nearestAltar(me.position());if(a<0)return false;','''    if(!enough(32000))return false;
    unsigned teamBag=gems;
    for(auto& a:safeChamps(team::ally))try{if(!(a==me)&&a.is_alive())teamBag+=a.gem_count();}catch(const TurnAbort&){throw;}catch(...){}
    if(bank+teamBag>=1000)return true;
    const int a=nearestAltar(me.position());if(a<0)return false;''')
 edit('bot.cpp','myType==bc::champion_type::prism&&!deadline&&me.health()>=me.max_health()*.6f','myType==bc::champion_type::prism&&!deadline&&gems<'+str(cap)+'&&me.health()>=me.max_health()*.6f')
 # Native Focus shard growth determines the temporary equipment value of a gem.
 p=dst/'v1_cycle.h';s=p.read_text();s='''// The passive is temporary capital: discount its shard-equivalent value by
// half, then express it in the scorer's ordinary gold/gem units.
static float prismGemValue(int type){
    if(!X_PRISM_POLICY||type!=static_cast<int>(bc::champion_type::prism))return 1;
    const float growth=std::max(1.0f,v1KitForType(type).base_stats.focus_growth);
    return 1.0f+0.5f*0.5f*1.5f*30.0f/growth;
}
'''+s
 assert s.count('g.gems+v1GoldW*g.gold')==2;s=s.replace('g.gems+v1GoldW*g.gold','prismGemValue(static_cast<int>(myType))*g.gems+v1GoldW*g.gold')
 s=s.replace('if(kind&&live&&stalledUntil[target]<=round', 'if(!(X_PRISM_POLICY&&myType==bc::champion_type::prism&&g.gems==0)&&kind&&live&&stalledUntil[target]<=round')
 p.write_text(s)
 edit('v1_camp_executor.h','local.draw_chebyshev(pos,std::max(4,range+1))','local.draw_chebyshev(pos,std::max(X_PRISM_POLICY&&myType==bc::champion_type::prism?5:4,range+1))')
print('Prepared economy and bounded-retention refinements')
