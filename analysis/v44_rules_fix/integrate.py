from pathlib import Path
base=Path('workspace/bots/rules-fix-v43/src')
def change(rel,old,new):
 p=base/rel;raw=p.read_bytes();nl=b'\r\n' if b'\r\n' in raw else b'\n';a=old.encode().replace(b'\n',nl);b=new.encode().replace(b'\n',nl)
 assert raw.count(a)==1,(rel,old[:80],raw.count(a));p.write_bytes(raw.replace(a,b))
for rel,prefix in [('bot.h',''),('boss/bot.h','../')]:
 change(rel,'#include <cambc.h>','#include <cambc.h>\n#include "'+prefix+'rules_policy.h"')
 change(rel,'float totalHp = 0, totalStr = 0;','float totalHp = 0, totalStr = 0;\n    std::vector<rules_policy::CampThreat> threats;')
 change(rel,'bool doTribute();','bool doTribute();\n    bool workMonolith(int gid,cambc::bitboard& blind);')
for rel,prefix in [('bot.cpp',''),('boss/bot.cpp','../')]:
 change(rel,'#include <algorithm>','#include <algorithm>\n#include "'+prefix+'rules_channel.h"')
 change(rel,'g.totalHp+=st.base_health;g.totalStr+=st.base_strength;','g.totalHp+=st.base_health;g.totalStr+=st.base_strength;g.threats.push_back({c.spawn_position().x,c.spawn_position().y,st.base_attack_range,st.base_strength});')
change('bot.cpp','#include "v1_bank_access.h"','#include "rules_monolith.h"\n#include "v1_bank_access.h"')
change('bot.cpp','if(bankGate>=0&&retreatBankCarrier())','if(retreatBankCarrier())')
change('v1_bank_carrier.h','if(bankGate<0||me.gem_count()==0||!bankChannelThreat())return false;','if(me.gem_count()==0||!bankChannelThreat())return false;')
p=base/'v1_bank_channel.h';p.write_text('''// Shared by both controllers, all maps and all stun-susceptible champions.
bool Bot::bankChannelThreat(){
    const auto pos=bc::self().position();
    if(channelThreatRound==round&&channelThreatPosition==pos)return channelThreatValue;
    if(!enough(34000))return false;
    channelThreatRound=round;channelThreatPosition=pos;
    channelThreatValue=rules_runtime::tribute_interrupt_risk([](unsigned reserve){return enough(reserve);});
    return channelThreatValue;
}
''')
p=base/'v1_bank_access.h';text=p.read_text();start=text.index('bool Bot::workBankGate(){');text=text[:start]+'''bool Bot::workBankGate(){
    if(!bankGateClosed()||capturing||lowMode||round<gateRetryAt||!enough(34000))return false;
    if(X_GATESTEAL){const auto& g=groups[bankGate];const float hp=(g.state==1&&round-g.seenRound<30)?g.hpLeft:g.totalHp;if(g.totalHp<=0||hp>X_STEALFRAC*g.totalHp)return false;}
    auto& me=bc::self();
    unsigned items[42]{};const unsigned id=static_cast<unsigned>(static_cast<bc::handle_champion_t>(me));
    if(bc::detail::sdk_champion_items(id,items))return false;
    const unsigned focusCapital=items[26]+5*items[27]+items[14]+5*items[15]+items[8]+5*items[9];
    if(focusCapital<5)return false;
    const bool handled=workMonolith(bankGate,gateBlind);
    if(handled){releaseCapture();target=bankGate;progressKind=clearing;}
    return handled;
}
''';p.write_bytes(text.replace('\n','\r\n').encode())
change('v1_bank_access.h','for(auto p:groups[gate].tiles)gateFiring.draw_chebyshev(p,4);','// Casting envelope only; workMonolith models actual camp range and exit risk.\n    for(auto p:groups[gate].tiles)gateFiring.draw_chebyshev(p,4);')
change('boss/bot.h','bool doTribute();','bool bankChannelThreat();\n    int channelThreatRound=-1;bool channelThreatValue=false;cambc::vec2 channelThreatPosition{};\n    int cancelledBankChannelRound=-1;\n    bool doTribute();')
change('boss/bot.cpp','// ------------------------------------------------------------------ tribute','// ------------------------------------------------------------------ tribute\n#include "../v1_bank_channel.h"')
change('boss/bot.cpp','// ------------------------------------------------------------------ farming','// ------------------------------------------------------------------ farming\n#include "../rules_monolith.h"')
change('boss/bot.cpp','const float taken = (bossOnly&&g.monolith)?0.0f:rawKt * g.totalStr * (jungle ? 0.7f : 1.0f);','const float taken = rawKt * g.totalStr * (jungle ? 0.7f : 1.0f);')
change('boss/bot.cpp',"// Only spells reach from the safe ring; don't forecast Strength", "// Only spells reach from the casting ring; don't forecast Strength")
p=base/'boss/bot.cpp';text=p.read_text();start=text.index('        // Range-three basics surrender the only safety margin.');end=text.index('\n    }\n    if (tileVisible',start)
text=text[:start]+'        workMonolith(target,blindBossTiles);\n        return;'+text[end:];p.write_bytes(text.replace('\n','\r\n').encode())
change('boss/bot.cpp','const bool submittingNow = me.is_submitting_gems();','bool submittingNow = me.is_submitting_gems();')
change('boss/bot.cpp','    if (me.is_recalling() || submittingNow || me.is_teleporting()) {','    if(submittingNow&&bankChannelThreat()){\n        try{ACT(me.cancel_submit_gems());cancelledBankChannelRound=round;submittingNow=false;wasSubmitting=false;stage="bank-channel-interrupt-risk";}catch(const TurnAbort&){throw;}catch(...){}\n    }\n    if (me.is_recalling() || submittingNow || me.is_teleporting()) {')
change('boss/bot.cpp','    if (me.is_submitting_gems()) return true;','    if(cancelledBankChannelRound==round)return false;\n    if (me.is_submitting_gems()) return true;\n    if(bankChannelThreat()){\n        const auto threats=bc::vision::champion_tiles(team::enemy).positions();\n        if(!threats.empty()&&me.can_move())moveAway(threats);\n        stage="bank-interrupt-avoid";return true;\n    }')
change('main.cpp','std::puts("build v36-heart33");','std::puts("build rules-fix-v43");')
print('Integrated current-rule fixes into candidate only.')
