// Picks Heart of Ruin, Vesper Vale, Ryth, Marcella, Vendetta (3-pick maps: Heart, Vesper Vale, Vendetta) on every map,
// gated-altar maps included (their winners use normal teams). Draft precomputes static distances and the bank gate.
#include <cambc.h>
#include "draft.h"
#include <algorithm>
#include <array>
#include <vector>

static bool s_corridor = false;
static bool s_maze = false;

// Only compact static distances and the bank gate cross the draft/champion instance boundary (draft memory).
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
    const int maxDim = std::max(cambc::map::width(), cambc::map::height());
    const int minDim = std::min(cambc::map::width(), cambc::map::height());
    s_corridor = maxDim >= 2 * minDim;
    s_maze = (spawnDistance >= 2 * maxDim) && (altarDistance >= 2 * maxDim);
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
        if(selected<0&&!approaches.is_empty()){
            // Sealed by several boss groups together: killing any one that holds an approach tile opens the altar.
            cambc::bitboard all;for(const auto& b:bosses)all|=b;
            if(!(approaches&~all).count()){int best=65535;for(int j=0;j<static_cast<int>(bosses.size());++j){if((approaches&bosses[j]).is_empty())continue;int dist=65535;for(auto p:bosses[j].positions())dist=std::min<int>(dist,ownField.get(p));if(dist<best){best=dist;selected=indices[j];}}}
        }
        if(selected<0){allBlocked=false;break;}if(mandatory<0)mandatory=selected;
    }
    if(allBlocked&&mandatory>=0){
        auto sealed=walls;for(const auto& b:bosses)sealed|=b;
        cambc::distance_field closed;cambc::bitboard seen;
        closed.compute(sealed,own,seen);
        bool disconnected=true;for(auto p:enemy.positions())if(closed.get(p)!=65535)disconnected=false;
        bytes[18]=disconnected?0x51:0x47;bytes[19]=mandatory+1;
    }
    unsigned sum=0;for(int i=6;i<16;++i)sum+=bytes[i];for(std::size_t i=20;i<20+4*groups.size();++i)sum+=bytes[i];put(16,sum&65535);
    bytes[5]=0xA5;
    cambc::draft_memory=bytes;submitted=true;
}

void play_draft() {
    prepare_fast_metadata();
    const bool threePicks = cambc::draft::team_size() <= 3;
    const std::array small{
        cambc::champion_draft::vesper_vale,cambc::champion_draft::marcella,cambc::champion_draft::ryth,
        cambc::champion_draft::heart_of_ruin,cambc::champion_draft::vendetta};

    const std::array big_open{
        cambc::champion_draft::heart_of_ruin,cambc::champion_draft::vesper_vale,cambc::champion_draft::vendetta,
        cambc::champion_draft::marcella,cambc::champion_draft::ryth};

    const std::array big_corridor{
        cambc::champion_draft::cassi_and_issac,cambc::champion_draft::heart_of_ruin,cambc::champion_draft::vesper_vale,
        cambc::champion_draft::marcella,cambc::champion_draft::vendetta};

    const auto mine = cambc::draft::current_draft(cambc::team::ally);
    const auto& roster = threePicks ? small : (s_corridor ? big_corridor : big_open);
    for (auto pick : roster) {
        if (std::find(mine.begin(), mine.end(), pick) != mine.end()) continue;
        cambc::draft::pick(pick);
        return;
    }
}
