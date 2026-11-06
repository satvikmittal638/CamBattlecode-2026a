// Five-pick maps use Varg, Vendetta, Cassi & Issac, Willow and Ren.
// Three-pick maps use Varg, Ryth and Cassi & Issac. Draft precomputes static distances.
#include <cambc.h>
#include "draft.h"
#include <algorithm>
#include <array>
#include <string_view>
#include <vector>
#include "../fishx_features.h"

static bool bossOnlyMap=false;

// Only compact static spawn distances cross the draft/champion instance boundary.
static void prepare_fast_metadata() {
    static bool submitted=false;
    if(submitted)return;
    const auto groups=cambc::map::camp_groups();
    bool regular=false,boss=false;
    for(const auto& group:groups)if(group.gem_value()>0){
        bool monolith=false;for(const auto& camp:group.camps())monolith |= camp.is_monolith();
        if(monolith)boss=true;else regular=true;
    }
    bossOnlyMap=boss&&!regular;
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
    put(12,spawnDistance);put(14,altarDistance);
    for(std::size_t i=0;i<groups.size();++i){
        int a=65535,b=65535;
        for(auto p:groups[i].spawn_tiles().positions()){a=std::min<int>(a,ownField.get(p));b=std::min<int>(b,enemyField.get(p));}
        put(20+4*i,a);put(22+4*i,b);
    }
    unsigned sum=0;for(int i=6;i<16;++i)sum+=bytes[i];for(std::size_t i=20;i<20+4*groups.size();++i)sum+=bytes[i];put(16,sum&65535);
    bytes[5]=0xA5;
    bytes[18]=0xB6;bytes[19]=0x51; // reserved bytes, excluded from existing distance checksum
    cambc::draft_memory=bytes;submitted=true;
}

void play_boss_draft() {
    // current Mite (2026-10-14): 3-pick maps -> Varg, Ryth, Cassi&Issac; 4/5-pick maps keep Vendetta.
    static constexpr std::array big{
        cambc::champion_draft::varg,   cambc::champion_draft::vendetta, cambc::champion_draft::cassi_and_issac,
        cambc::champion_draft::willow, cambc::champion_draft::ren,      cambc::champion_draft::ryth,
        cambc::champion_draft::marcella, cambc::champion_draft::tavi,   cambc::champion_draft::stellar,
        cambc::champion_draft::prism,  cambc::champion_draft::vesper_vale};
    static constexpr std::array small{
        cambc::champion_draft::varg,   cambc::champion_draft::ryth,     cambc::champion_draft::cassi_and_issac,
        cambc::champion_draft::vendetta, cambc::champion_draft::willow, cambc::champion_draft::ren,
        cambc::champion_draft::marcella, cambc::champion_draft::tavi,   cambc::champion_draft::stellar,
        cambc::champion_draft::prism,  cambc::champion_draft::vesper_vale};
    const auto mine = cambc::draft::current_draft(cambc::team::ally);
    prepare_fast_metadata();
    static constexpr std::array bosses{cambc::champion_draft::tavi,cambc::champion_draft::stellar,cambc::champion_draft::cassi_and_issac,cambc::champion_draft::prism,cambc::champion_draft::ren};
    // X_BOSSRAID: procless/Tung take boss-only maps with the meta team (build up, then raid monoliths together).
    static constexpr std::array raiders{cambc::champion_draft::heart_of_ruin,cambc::champion_draft::vesper_vale,cambc::champion_draft::ryth,cambc::champion_draft::marcella,cambc::champion_draft::vendetta};
    if(bossOnlyMap&&X_BOSSRAID)for(auto pick:raiders)if(std::find(mine.begin(),mine.end(),pick)==mine.end()){cambc::draft::pick(pick);return;}
    if(bossOnlyMap)for(auto pick:bosses)if(std::find(mine.begin(),mine.end(),pick)==mine.end()){cambc::draft::pick(pick);return;}
    const bool threePicks = cambc::draft::team_size() <= 3;
    for (auto pick : threePicks ? small : big) {
        if (std::find(mine.begin(), mine.end(), pick) != mine.end()) continue;
        cambc::draft::pick(pick);
        return;
    }
}
