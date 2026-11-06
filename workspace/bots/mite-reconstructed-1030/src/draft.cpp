// Reuses the official SDK's multi-source distance-field idiom. The draft policy
// and compact metadata format below are independently authored for this model.
#include "bot.h"
#include <algorithm>
void model_draft() {
    static bool prepared=false;
    if (!prepared) {
        auto groups=bc::map::camp_groups();
        auto walls=bc::map::walls()|bc::map::holes()|bc::map::altars();
        auto home=bc::map::spawn_region(bc::team::ally),enemy=bc::map::spawn_region(bc::team::enemy);
        bc::distance_field a,b;bc::bitboard visited;
        a.compute(walls|enemy,home,visited);b.compute(walls,enemy,visited);
        std::vector<std::uint8_t> data(1024,0);data[0]='M';data[1]='R';data[2]=1;
        auto put=[&](int i,int n){data[i]=n&255;data[i+1]=(n>>8)&255;};
        put(4,groups.size());int spawnDistance=65535;
        for(auto p:home.positions())spawnDistance=std::min<int>(spawnDistance,b.get(p));
        put(6,spawnDistance);
        for(int i=0;i<std::min<int>(groups.size(),250);++i){int da=65535,db=65535;for(auto p:groups[i].spawn_tiles().positions()){da=std::min<int>(da,a.get(p));db=std::min<int>(db,b.get(p));}put(16+i*4,da);put(18+i*4,db);}
        bc::draft_memory=data;prepared=true;
    }
    // Fitted draft families will replace this scaffold after fresh mining.
    const int small[]={1,11,2,10,6},four[]={1,2,11,3,6},large[]={1,2,11,10,6};
    const auto mine=bc::draft::current_draft(bc::team::ally);
    const int* order=bc::draft::team_size()==3?small:bc::draft::team_size()==4?four:large;
    for(int i=0;i<5;++i){const auto pick=static_cast<bc::champion_draft>(order[i]);if(std::find(mine.begin(),mine.end(),pick)==mine.end()){bc::draft::pick(pick);return;}}
}
