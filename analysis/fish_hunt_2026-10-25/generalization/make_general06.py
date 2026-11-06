from pathlib import Path
import shutil
root=Path(__file__).resolve().parents[3];out=Path(__file__).parent;dest=root/'workspace/bots/fish-general-06/src'
assert not dest.exists();shutil.copytree(root/'workspace/bots/fish-economy-02/src',dest)
def edit(f,a,b):
 p=dest/f;s=p.read_text();assert s.count(a)==1,(f,s.count(a),a[:60]);p.write_text(s.replace(a,b))
edit('main.cpp','build fish-economy-02-v62','build fish-general-06-state-policy-no-playbacks')
edit('fishx_features.h','constexpr float X_GOLDW = 0.5f;','constexpr float X_GOLDW = 0.12f;')
edit('fishx_features.h','constexpr int X_GOLDRICH = 25;','constexpr int X_GOLDRICH = 10;')
edit('fishx_features.h','constexpr bool X_BIGCOMMIT = false;','constexpr bool X_BIGCOMMIT = true;')
edit('fishx_features.h','constexpr int X_BIGRANGE = 10;','constexpr int X_BIGRANGE = 6;')
edit('fishx_features.h','constexpr float X_PACKMINHP = 4000.0f;','constexpr float X_PACKMINHP = 2400.0f;')
# Reward throughput wins over repeated distant capture handoffs.
edit('fishx_features.h','constexpr bool X_CARRYCAP = true;','constexpr bool X_CARRYCAP = false;')
# All map selection below uses camp composition, never map identifiers or action tables.
anchor='    const bool threePicks = cambc::draft::team_size() <= 3;'
edit('draft.cpp',anchor,'''    if(!gated){
        int gemGroups=0,fragileGemGroups=0;
        for(const auto& group:cambc::map::camp_groups())if(group.gem_value()>0){
            ++gemGroups;bool fragile=true;for(auto c:group.camps())fragile&=c.is_gem_cluster();
            if(fragile)++fragileGemGroups;
        }
        const bool gemRace=gemGroups>0&&fragileGemGroups*2>gemGroups;
        const int regular5[]{5,1,6,0,11};const int regular3[]{5,1,11};
        const int race5[]{6,2,0,1,11};const int race3[]{6,1,9};
        const bool small=cambc::draft::team_size()<=3;
        const int* picks=gemRace?(small?race3:race5):(small?regular3:regular5);
        for(int j=0;j<(small?3:5);++j){auto p=static_cast<cambc::champion_draft>(picks[j]);if(std::find(mine.begin(),mine.end(),p)==mine.end()){cambc::draft::pick(p);return;}}
    }
'''+anchor)
anchor='    try {\n        auto counts = me.item_count();\n        int gold = static_cast<int>(me.gold_count());'
edit('bot.cpp',anchor,'''    if(bankGateHint<0){
        if(myType==bc::champion_type::prism){
            plan={{0,1,5},{6,1,5},{4,2,5},{6,1,10},{5,2,5}};
            for(int n=15;n<=500;n+=5){plan.push_back({6,1,n});plan.push_back({6,2,n-10});}
        }
        if(myType==bc::champion_type::vesper_vale){
            plan={{3,0,5},{4,0,5},{2,0,5},{6,2,5},{6,0,5},{0,0,5}};
            for(int n=10;n<=500;n+=5){plan.push_back({6,0,n});plan.push_back({6,2,n});}
        }
        if(myType==bc::champion_type::heart_of_ruin){
            plan={{3,1,5},{4,1,5},{6,1,5},{6,2,5}};
            for(int n=10;n<=500;n+=5){plan.push_back({6,1,n});plan.push_back({6,2,n});}
        }
        if(myType==bc::champion_type::marcella){
            plan={{3,1,5},{4,2,5},{6,1,5},{6,2,5}};
            for(int n=10;n<=500;n+=5){plan.push_back({6,1,n});plan.push_back({6,2,n});}
        }
        if(myType==bc::champion_type::ryth){
            plan={{3,2,5},{4,2,5},{6,2,5},{0,0,5}};
            for(int n=10;n<=500;n+=5){plan.push_back({6,2,n});plan.push_back({6,0,n-5});}
        }
    }
'''+anchor)
# Initial ten gold and shop remainders buy a legal denial consumable.
edit('bot.cpp','    if(me.gold_count()<30)return;','''    if((!me.is_alive()||onSpawn())&&enough(26000)){
        try{if(me.can_buy(bc::consumable_type::altar_lock))ACT(me.buy(bc::consumable_type::altar_lock));}catch(const TurnAbort&){throw;}catch(...){}
    }
    if(me.gold_count()<30)return;''')
# Prism treats its bag as combat capital. Other bodies keep depositing normally.
anchor='    if (gems <= 0) return false;'
edit('bot.cpp',anchor,anchor+'''
    if(myType==bc::champion_type::prism&&bankGateHint<0){
        const auto bank=bc::global_submitted_gems(team::ally);const int a=nearestAltar(me.position());
        const int travel=a<0?80:altarDistance(a,me.position());
        const bool timeToConvert=round+travel+(gems+9)/10+25>=1999;
        if(bank+gems<1000&&!timeToConvert){handoverBank=false;return false;}
    }
''')
edit('bot.cpp','if (!lowMode && (hpf < 0.35f || partnerRise))','if (!lowMode && (hpf < (myType==bc::champion_type::prism?.45f:.35f) || partnerRise))')
# Economy recalls must not force Prism to lose its carried gems at a nearby altar.
edit('bot.cpp','if (!threat && me.gem_count() > 0) { const int a = nearestAltar(me.position());','if (!threat && me.gem_count() > 0 && myType!=bc::champion_type::prism) { const int a = nearestAltar(me.position());')
# Prefer the established physical collector, avoiding a costly capture reset.
anchor='        if (g.tilesBB.is_set(pos)) {\n            if (!capturing)'
edit('bot.cpp',anchor,'''        if (g.tilesBB.is_set(pos)) {
            if(!capturing&&allyCapturing(g.id)){bc::bitboard off;off.draw_chebyshev(pos,2);off&=~g.tilesBB;moveToward(off,false);target=-1;return;}
            if (!capturing)''')
edit('bot.h','    void play_step();','    void play_step();\n    void metaAfterTurn();\n    bool speculativeRecall=false;')
# Cancel speculative channels before normal channel handling if useful work remains.
anchor='    // A channel consumes the turn. Refresh full camp beliefs when it ends,'
edit('bot.cpp',anchor,'''    if(speculativeRecall){
        speculativeRecall=false;
        if(me.is_recalling()){
            bool ready=false;
            if(target>=0&&target<static_cast<int>(rawGroups.size()))try{ready=std::holds_alternative<bc::map::camp_group_reward_available>(rawGroups[target].state());}catch(const TurnAbort&){throw;}catch(...){}
            const bool needTrip=me.health()<me.max_health()*.6f||me.gold_count()>=150;
            if(ready||capturing||!needTrip){ACT(me.cancel_recall());stage="meta-cancel-insurance";}
        }
    }
'''+anchor)
edit('v1_progress.h','    warmGeometry();\n}','    warmGeometry();\n    metaAfterTurn();\n}')
with (dest/'v1_progress.h').open('a') as f:f.write('\n#include "general_policy.h"\n')
shutil.copyfile(out/'general_policy.h',dest/'general_policy.h')
print('Prepared general06, map-independent reactive policy; no stored replay actions')
