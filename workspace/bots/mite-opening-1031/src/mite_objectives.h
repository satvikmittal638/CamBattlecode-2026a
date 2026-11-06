#pragma once
#include "mite_objectives_data.h"
// Identity is terrain-sized camp spawn geometry plus the actual own spawn.
// It does not assume that replay camp/group handles equal runtime handles.
inline const MiteObjectiveProfile* miteFindProfile(int width,int height,const cambc::bitboard& own,const cambc::bitboard& campTiles){
    int sx=65535,sy=65535,ex=0,ey=0;
    for(auto p:own.positions()){sx=std::min(sx,p.x);sy=std::min(sy,p.y);ex=std::max(ex,p.x);ey=std::max(ey,p.y);}
    unsigned hash=0;auto tiles=campTiles.positions();
    for(auto p:tiles)hash+=((unsigned(p.x)+1u)*0x9e3779b9u)^((unsigned(p.y)+1u)*0x85ebca6bu);
    for(const auto& p:MITE_OBJECTIVE_PROFILES)if(p.width==width&&p.height==height&&p.sx==sx&&p.sy==sy&&p.ex==ex&&p.ey==ey&&p.hash==hash&&p.campTiles==tiles.size())return &p;
    return nullptr;
}
