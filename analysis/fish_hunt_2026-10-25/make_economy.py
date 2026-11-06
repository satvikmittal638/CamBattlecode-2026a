from pathlib import Path
import shutil
root=Path(__file__).resolve().parents[2];d=root/'workspace/bots/fish-economy-02/src'
assert not d.exists();shutil.copytree(root/'workspace/bots/fish-base62/src',d)
def edit(f,a,b):
 p=d/f;s=p.read_text();assert s.count(a)==1,(f,a[:70],s.count(a));p.write_text(s.replace(a,b))
edit('main.cpp','build v61-bossroster5','build fish-economy-02-v62')
edit('fishx_features.h','constexpr int X_CARRYMODE = 2;','constexpr int X_CARRYMODE = 0;')
edit('fishx_features.h','constexpr bool X_BANK = false;','constexpr bool X_BANK = true;')
edit('fishx_features.h','constexpr int X_BANKNEAR = 8;','constexpr int X_BANKNEAR = 4;')
edit('bot.cpp','    if(t==ct::heart_of_ruin)return 0;','''    if(t==ct::vesper_vale)return 0;
    if(t==ct::marcella)return 1;
    if(t==ct::heart_of_ruin)return 2;
    if(t==ct::prism)return 1;''')
anchor='    try {\n        auto counts = me.item_count();\n        int gold = static_cast<int>(me.gold_count());'
edit('bot.cpp',anchor,'''    // Stun immunity and 15 Focus growth make Marcella a strong burst carrier.
    if(myType==bc::champion_type::marcella&&bankGateHint<0){
        plan={{4,1,5},{6,1,5},{2,2,5},{6,2,5}};
        for(int n=10;n<=400;n+=5){plan.push_back({6,1,n});plan.push_back({6,2,n});}
    }
'''+anchor)
edit('v1_kit.h','damage=std::max(damage,focus*v1DamageModifier(a));\n        if(a.kind==1)damage=std::max(damage,strength);','damage+=focus*v1DamageModifier(a);\n        if(a.kind==1)damage+=strength;')
anchor='    if(!castThisTurn&&me.can_cast())for(int k=0;k<2;++k){'
edit('v1_camp_executor.h',anchor,'''    // Ground-target spells need a ground centre; they are not camp-handle casts.
    if(!castThisTurn&&me.can_cast()&&enough(43000)){
        float single=0;
        for(int k=0;k<2;++k){int cd=8;bc::detail::sdk_champion_cooldown(selfId,k,&cd);const auto& a=kit.definition.abilities[k];
            if(!cd&&(!movedThisTurn||!(a.attributes&1))&&(a.kind==2||a.kind==4))
                for(const auto& c:seen)if(c.target&&cheb(pos,c.p)<=v1DamageRange(a))single=std::max(single,std::min(c.hp,focus*v1DamageModifier(a)));}
        int slot=-1;vec2 centre=pos;float best=single;
        for(int k=0;k<2;++k){
            if(!enough(35000))break;int cd=8;bc::detail::sdk_champion_cooldown(selfId,k,&cd);const auto& a=kit.definition.abilities[k];
            if(cd||a.kind!=3||!(a.targets&bc::detail::ability_target_ground)||(movedThisTurn&&(a.attributes&1)))continue;
            auto legal=me.abilities()[k].valid_tiles()&bc::vision::visible_tiles();bc::bitboard candidates;
            for(const auto& c:seen)if(c.target)candidates.draw_chebyshev(c.p,static_cast<int>(a.payload.aoe_damage.radius));
            for(auto p:(candidates&legal).positions()){
                if(!enough(32000))break;float value=0;bool collateral=false;
                for(const auto& c:seen)if(cheb(p,c.p)<=a.payload.aoe_damage.radius){
                    if(!c.target&&c.strength>0){collateral=true;break;}
                    if(c.target)value+=std::min(c.hp,focus*a.payload.aoe_damage.modifier)+(a.payload.aoe_damage.duration>0?c.strength:0);
                }
                if(!collateral&&value>best+1){best=value;centre=p;slot=k;}
            }
        }
        if(slot>=0)cast(slot,0,0,centre);
    }
'''+anchor)
print('Prepared fish-economy-02')
