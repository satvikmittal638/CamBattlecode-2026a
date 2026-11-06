// Five-pick maps use Varg, Vendetta, Cassi & Issac, Willow and Ren.
// Three-pick maps use Varg, Ryth and Cassi & Issac. Draft precomputes static distances.
#include <cambc.h>
#include "draft.h"
#include "fishx_features.h"
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
    static constexpr std::array big0{
        cambc::champion_draft::heart_of_ruin,cambc::champion_draft::tavi,
        cambc::champion_draft::vesper_vale,cambc::champion_draft::varg,cambc::champion_draft::ryth};
    static constexpr std::array bigFish{
        cambc::champion_draft::heart_of_ruin,cambc::champion_draft::tavi,
        cambc::champion_draft::vesper_vale,cambc::champion_draft::ryth,cambc::champion_draft::varg};
    // procless / EMPEROR Tung (ranks 2-3): the same five everywhere; four-pick maps drop Vendetta.
    static constexpr std::array bigMeta{
        cambc::champion_draft::heart_of_ruin,cambc::champion_draft::vesper_vale,
        cambc::champion_draft::ryth,cambc::champion_draft::marcella,cambc::champion_draft::vendetta};
    static constexpr std::array smallMeta{
        cambc::champion_draft::heart_of_ruin,cambc::champion_draft::vesper_vale,cambc::champion_draft::vendetta,
        cambc::champion_draft::ryth,cambc::champion_draft::marcella};
    const auto& big = X_META ? bigMeta : X_DRAFT4 ? bigFish : big0;
    static constexpr std::array small0{
        cambc::champion_draft::heart_of_ruin,cambc::champion_draft::tavi,cambc::champion_draft::vesper_vale,
        cambc::champion_draft::varg,cambc::champion_draft::ryth};
    static constexpr std::array farSmall0{
        cambc::champion_draft::heart_of_ruin,cambc::champion_draft::tavi,cambc::champion_draft::varg,
        cambc::champion_draft::vesper_vale,cambc::champion_draft::ryth};
    const auto& small = X_META ? smallMeta : small0;
    const auto& farSmall = X_META ? smallMeta : farSmall0;
    const auto mine = cambc::draft::current_draft(cambc::team::ally);
    prepare_fast_metadata();
    // Fish-specific static-layout draft table, measured in current live replays.
    // The source does not have access to opponent identity or hidden runtime state.
    struct Fingerprint {int w,h,n;int picks[5];};
    static constexpr Fingerprint known[]{
        {35,31,34,{1,2,11,3,6}}, // 00lost_world
        {30,30,6,{1,11,6,-1,-1}}, // 00fragment
        {41,41,20,{1,11,6,-1,-1}}, // 00collision
        {45,35,32,{1,2,11,3,6}}, // 00split
        {51,40,12,{1,2,11,3,7}}, // 01corridors
        {50,50,16,{1,2,11,3,7}}, // 01starfish
        {30,30,14,{1,2,11,3,-1}}, // 00reverse_spiral
        {100,100,24,{1,2,11,9,3}}, // 01big_world
        {50,65,23,{1,2,11,3,8}}, // 00pilgrimage
        {45,30,22,{1,2,11,3,-1}}, // 00swirl
        {40,40,51,{1,2,11,9,3}}, // 00road_of_riches
        {61,71,28,{1,2,11,3,8}}, // 01fracture
        {50,50,29,{1,2,11,3,6}}, // 01elk_arena
        {50,40,18,{1,2,11,3,6}}, // 00gem_fields
        {71,71,30,{1,2,11,3,6}}, // 00corners
        {31,31,15,{1,11,2,-1,-1}}, // 01gold_rush
        {50,50,14,{1,2,11,3,6}}, // 00contest
        {31,31,12,{1,2,11,3,-1}}, // 01hooks
        {50,50,9,{1,2,11,9,-1}}, // 00rows
        {40,40,22,{1,11,6,-1,-1}}, // 01broken_curve
        {30,30,10,{1,2,11,3,6}}, // 00elkring
        {61,61,11,{1,2,11,3,8}}, // 01concentrated_wealth
        {41,30,8,{1,2,11,3,7}}, // 00eight
        {90,30,42,{1,2,11,3,6}}, // 00lanes
        {50,41,31,{1,2,11,3,6}}, // 01boss_battle
        {60,50,13,{1,2,11,3,6}}, // 00stampede
        {50,50,20,{1,2,11,3,6}}, // 00monolith
    };
    const int w=cambc::map::width(),h=cambc::map::height(),n=cambc::map::camp_groups().size();
    const int fallback[5]{1,2,11,3,6};const int fishSmallFallback[5]{1,11,6,-1,-1};
    const int* picks=cambc::draft::team_size()<=3?fishSmallFallback:fallback;
    for(const auto& f:known)if(f.w==w&&f.h==h&&f.n==n){picks=f.picks;break;}
    for(int j=0;j<5&&picks[j]>=0;++j){const auto pick=static_cast<cambc::champion_draft>(picks[j]);if(std::find(mine.begin(),mine.end(),pick)==mine.end()){cambc::draft::pick(pick);return;}}
    const bool gated=v1DraftBankGate>=0;
    static constexpr std::array gateTeam{cambc::champion_draft::heart_of_ruin,cambc::champion_draft::stellar,cambc::champion_draft::tavi,cambc::champion_draft::prism,cambc::champion_draft::ren};
    if(gated&&!X_GATEDRAFT){for(auto pick:gateTeam)if(std::find(mine.begin(),mine.end(),pick)==mine.end()){cambc::draft::pick(pick);return;}}
    const bool threePicks = cambc::draft::team_size() <= 3;
    for (auto pick : threePicks ? (v1DraftSpawnDistance>60?farSmall:small) : big) {
        if (std::find(mine.begin(), mine.end(), pick) != mine.end()) continue;
        cambc::draft::pick(pick);
        return;
    }
}
