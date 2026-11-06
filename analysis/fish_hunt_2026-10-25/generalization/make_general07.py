from pathlib import Path
import shutil
root=Path(__file__).resolve().parents[3];dest=root/'workspace/bots/fish-general-07/src';assert not dest.exists();shutil.copytree(root/'workspace/bots/fish-general-06/src',dest)
def edit(f,a,b):
 p=dest/f;s=p.read_text();assert s.count(a)==1,(f,s.count(a),a[:60]);p.write_text(s.replace(a,b))
edit('main.cpp','build fish-general-06-state-policy-no-playbacks','build fish-general-07-physical-carry-allocation')
# The full corpus offers a more defensive alternative to the fresh expert's aggressive focus opening.
edit('bot.cpp','plan={{0,1,5},{6,1,5},{4,2,5},{6,1,10},{5,2,5}};','plan={{2,2,5},{0,1,5},{4,2,5},{5,2,5},{6,1,10}};')
edit('fishx_features.h','constexpr bool X_CARRYCAP = false;','constexpr bool X_CARRYCAP = true;')
# Purely prospective helpers do not count as damage already committed to a camp.
edit('fishx_features.h','constexpr bool X_BIGCOMMIT = true;','constexpr bool X_BIGCOMMIT = false;')
# Source designs and equipment should remain useful on gated maps too.
p=dest/'draft.cpp';s=p.read_text();start=s.index('    if(!gated){\n        int gemGroups');end=s.index('    const bool threePicks',start);block=s[start:end].replace('    if(!gated){','    {',1);s=s[:start]+s[end:];idx=s.index('    if(gated&&!X_GATEDRAFT)');s=s[:idx]+block+s[idx:];p.write_text(s)
edit('bot.cpp','    if(bankGateHint<0){\n        if(myType==bc::champion_type::prism){','    {\n        if(myType==bc::champion_type::prism){')
edit('bot.cpp','if(myType==bc::champion_type::prism&&bankGateHint<0){\n        const auto bank','if(myType==bc::champion_type::prism){\n        const auto bank')
# Near a cleared gem group, Prism can request the already-present collector to
# yield after Prism arrives. Ordinary task selection skips somebody else's capture.
edit('v1_cycle.h','int Bot::chooseTarget(){','''int Bot::chooseTarget(){
    if(myType==bc::champion_type::prism&&!lowMode&&!capturing&&enough(38000)){
        const auto pos=bc::self().position();int selected=-1,nearest=5;
        for(const auto& g:groups)if(g.gems>0&&g.state==2&&stalledUntil[g.id]<=round){
            int d=99;for(auto p:g.tiles)d=std::min(d,cheb(pos,p));
            if(d<nearest){nearest=d;selected=g.id;}
        }
        if(selected>=0){stage="meta-prism-nearby-reward";return selected;}
    }''')
# A weak Prism gets a small self-sufficient opening task. Do not crowd that task
# just because it is the nearest camp for all three bodies.
anchor='        if(partnerComing && g.totalStr*remaining/std::max(1.0f,md)>hp*.65f)score*=1.3f;'
edit('v1_cycle.h',anchor,anchor+'''
        if(myType==bc::champion_type::prism&&F<150&&bag<30&&remaining>2400)score*=.15f;
        if(myType!=bc::champion_type::prism&&g.totalHp<=1600&&g.state<2){
            for(int k=0;k<nAllies&&k<6;++k)if(k!=slot&&slotType[k]==static_cast<int>(bc::champion_type::prism)&&!(shared[k]&0xC0)&&(shared[k]&63)==g.id+1)score*=.2f;
        }
''')
# This callable preference was unused in v62. Wire it into execution below.
p=dest/'bot.cpp';s=p.read_text();start=s.index('bool Bot::carryWants(const Group& g) {');end=s.index('// An ally (lower-ranked than me)',start)
s=s[:start]+'''bool Bot::carryWants(const Group& g) {
    if(g.gems<=0||myType==bc::champion_type::prism)return false;
    for(auto a:safeChamps(team::ally)){
        if(a==bc::self()||!a.is_alive()||a.champion_name()!=bc::champion_type::prism||a.health()<a.max_health()*.45f||a.is_submitting_gems()||a.is_teleporting())continue;
        int peer=-1;for(int k=0;k<nAllies&&k<6;++k)if(rosterHandles[k]==static_cast<unsigned>(static_cast<bc::handle_champion_t>(a)))peer=k;
        if(peer<0||(shared[peer]&0x80)||(shared[peer]&63)!=g.id+1)continue;
        int d=99;for(auto p:g.tiles)d=std::min(d,cheb(a.position(),p));
        if(d<=3)return true;
    }
    return false;
}
'''+s[end:];p.write_text(s)
# Ranking is scoped to gem-bearing captures. Gold-only camps use the existing
# first collector; the preference function does not delay them for Prism.
edit('bot.cpp','    if(t==ct::vesper_vale)return 0;\n    if(t==ct::marcella)return 1;\n    if(t==ct::heart_of_ruin)return 2;\n    if(t==ct::prism)return 1;','    if(t==ct::prism)return 0;\n    if(t==ct::vesper_vale)return 1;\n    if(t==ct::marcella)return 2;\n    if(t==ct::heart_of_ruin)return 3;')
anchor='    if (tileVisible && g.state == 2 && !anyCampVisible) {\n        progressKind=capture;'
edit('bot.cpp',anchor,anchor+'''
        if(X_CARRYCAP&&carryWants(g)){
            bool prismHere=false;
            for(auto p:(bc::vision::champion_tiles(team::ally)&g.tilesBB).positions()){
                auto a=bc::vision::champion_at(p);if(a.champion_name()==bc::champion_type::prism){prismHere=true;break;}
            }
            if(g.tilesBB.is_set(pos)&&!prismHere){capturing=true;if(captureSince<0)captureSince=round;return;}
            if(prismHere){
                releaseCapture();
                if(g.tilesBB.is_set(pos)){bc::bitboard off;off.draw_chebyshev(pos,2);off&=~g.tilesBB;moveToward(off,false);}
                target=-1;stage="meta-carry-arrived-yield";return;
            }
            if(handoffWaitGroup!=g.id){handoffWaitGroup=g.id;handoffWaitSince=round;}
            if(round-handoffWaitSince<3){stage="meta-short-carry-arrival";return;}
        }
''')
# First-arriver avoidance added in general06 must allow the actual requesting carry.
edit('bot.cpp','if(!capturing&&allyCapturing(g.id)){bc::bitboard off;','if(!capturing&&allyCapturing(g.id)&&myType!=bc::champion_type::prism){bc::bitboard off;')
edit('bot.h','    bool speculativeRecall=false;','    bool speculativeRecall=false;\n    int handoffWaitGroup=-1,handoffWaitSince=-1;')
print('Prepared general07: explicit short-distance physical handoff, defensive Prism opening, gated normal roster')
