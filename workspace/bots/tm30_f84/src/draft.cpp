// Five-pick maps use Varg, Vendetta, Cassi & Issac, Willow and Ren.
// Three-pick maps use Varg, Ryth and Cassi & Issac. Draft precomputes static distances.
#include <cambc.h>
#include "draft.h"
#include <algorithm>
#include <array>
#include <string_view>
#include <vector>

// Only compact static spawn distances cross the draft/champion instance boundary.
static int v1DraftSpawnDistance=65535;
static int v1DraftBankGate=-1;
static void prepare_fast_metadata() {
    static bool submitted=false;
    if(submitted)return;
    const auto groups=cambc::map::camp_groups();
    std::vector<std::uint8_t> bytes(1024,0);
    auto put=[&](int off,int n){bytes[off]=n&255;bytes[off+1]=(n>>8)&255;};
    if(groups.size()>251){cambc::draft_memory=bytes;submitted=true;return;}
    bytes[0]='F';bytes[1]='S';bytes[2]='T';bytes[3]='2';bytes[4]=1;
    put(6,cambc::map::width());put(8,cambc::map::height());put(10,groups.size());
    auto walls=cambc::map::walls()|cambc::map::holes()|cambc::map::altars();
    auto own=cambc::map::spawn_region(cambc::team::ally), enemy=cambc::map::spawn_region(cambc::team::enemy);
    cambc::distance_field ownField,enemyField;cambc::bitboard visited;
    ownField.compute(walls|enemy,own,visited);enemyField.compute(walls,enemy,visited);
    int spawnDistance=65535,altarDistance=65535;
    for(auto p:own.positions())spawnDistance=std::min<int>(spawnDistance,enemyField.get(p));
    for(auto altar:cambc::map::altars().positions()){
        cambc::bitboard approach;approach.draw_chebyshev(altar,1);approach&=~(walls|enemy);
        for(auto p:approach.positions())altarDistance=std::min<int>(altarDistance,ownField.get(p));
    }
    v1DraftSpawnDistance=spawnDistance;
    put(12,spawnDistance);put(14,altarDistance);
    for(std::size_t i=0;i<groups.size();++i){
        int a=65535,b=65535;
        for(auto p:groups[i].spawn_tiles().positions()){a=std::min<int>(a,ownField.get(p));b=std::min<int>(b,enemyField.get(p));}
        put(20+4*i,a);put(22+4*i,b);
    }
    // A bank dependency is a map property, computed once with the larger
    // first-draft budget. It is not selected from the map's name or dimensions.
    std::vector<cambc::bitboard> bosses;std::vector<int> indices;
    for(int i=0;i<static_cast<int>(groups.size());++i){bool boss=false;for(auto c:groups[i].camps())boss|=c.is_monolith();if(boss){bosses.push_back(groups[i].spawn_tiles());indices.push_back(i);}}
    int mandatory=-1;bool allBlocked=true;
    for(auto altar:cambc::map::altars().positions()){
        cambc::bitboard approaches;approaches.draw_chebyshev(altar,1);approaches&=~(walls|enemy);
        int selected=-1;for(int j=0;j<static_cast<int>(bosses.size());++j)if(!(approaches&~bosses[j]).count()&&!approaches.is_empty()){selected=indices[j];break;}
        if(selected<0){allBlocked=false;break;}if(mandatory<0)mandatory=selected;
    }
    if(allBlocked&&mandatory>=0){v1DraftBankGate=mandatory;bytes[18]=0x47;bytes[19]=mandatory+1;}
    unsigned sum=0;for(int i=6;i<16;++i)sum+=bytes[i];for(std::size_t i=20;i<20+4*groups.size();++i)sum+=bytes[i];put(16,sum&65535);
    bytes[5]=0xA5;
    cambc::draft_memory=bytes;submitted=true;
}

void play_draft() {
    // current Mite (2026-10-14): 3-pick maps -> Varg, Ryth, Cassi&Issac; 4/5-pick maps keep Vendetta.
    static constexpr std::array big{
        cambc::champion_draft::cassi_and_issac,cambc::champion_draft::stellar,
        cambc::champion_draft::ren,cambc::champion_draft::varg,cambc::champion_draft::ryth};
    static constexpr std::array small{
        cambc::champion_draft::cassi_and_issac,cambc::champion_draft::stellar,cambc::champion_draft::ren,
        cambc::champion_draft::varg,cambc::champion_draft::ryth};
    static constexpr std::array farSmall{
        cambc::champion_draft::cassi_and_issac,cambc::champion_draft::stellar,cambc::champion_draft::varg,
        cambc::champion_draft::ren,cambc::champion_draft::ryth};
    const auto mine = cambc::draft::current_draft(cambc::team::ally);
    prepare_fast_metadata();
    const bool gated=v1DraftBankGate>=0;
    static constexpr std::array gateTeam{cambc::champion_draft::cassi_and_issac,cambc::champion_draft::stellar,cambc::champion_draft::tavi,cambc::champion_draft::prism,cambc::champion_draft::ren};
    if(gated){for(auto pick:gateTeam)if(std::find(mine.begin(),mine.end(),pick)==mine.end()){cambc::draft::pick(pick);return;}}
    const bool threePicks = cambc::draft::team_size() <= 3;
    for (auto pick : threePicks ? (v1DraftSpawnDistance>60?farSmall:small) : big) {
        if (std::find(mine.begin(), mine.end(), pick) != mine.end()) continue;
        cambc::draft::pick(pick);
        return;
    }
}
