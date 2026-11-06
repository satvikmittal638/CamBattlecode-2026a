#pragma once
#include <cstdint>
struct PbAct{int key,x,y,v,k,s;};
struct PbMap{int w,h,groups,sx,sy,n,end;int draft[5];const char* data;int size;};
#include "book_00ambush_a.h"
#include "book_00ambush_b.h"
#include "book_00collision_a.h"
#include "book_00collision_b.h"
#include "book_00contest_a.h"
#include "book_00contest_b.h"
#include "book_00corners_a.h"
#include "book_00corners_b.h"
#include "book_00eight_a.h"
#include "book_00eight_b.h"
#include "book_00elkring_a.h"
#include "book_00elkring_b.h"
#include "book_00expanse_a.h"
#include "book_00expanse_b.h"
#include "book_00fragment_a.h"
#include "book_00fragment_b.h"
#include "book_00gem_fields_a.h"
#include "book_00gem_fields_b.h"
#include "book_00gemfight_a.h"
#include "book_00gemfight_b.h"
#include "book_00great_wall_a.h"
#include "book_00great_wall_b.h"
#include "book_00interlock_a.h"
#include "book_00interlock_b.h"
#include "book_00lanes_a.h"
#include "book_00lanes_b.h"
#include "book_00lost_world_a.h"
#include "book_00lost_world_b.h"
#include "book_00monolith_a.h"
#include "book_00monolith_b.h"
#include "book_00packs_a.h"
#include "book_00packs_b.h"
#include "book_00pilgrimage_a.h"
#include "book_00pilgrimage_b.h"
#include "book_00quadrants_a.h"
#include "book_00quadrants_b.h"
#include "book_00reverse_spiral_a.h"
#include "book_00reverse_spiral_b.h"
#include "book_00road_of_riches_a.h"
#include "book_00road_of_riches_b.h"
#include "book_00rows_a.h"
#include "book_00rows_b.h"
#include "book_00rushbait_v2_a.h"
#include "book_00rushbait_v2_b.h"
#include "book_00split_a.h"
#include "book_00split_b.h"
#include "book_00stampede_a.h"
#include "book_00stampede_b.h"
#include "book_00swirl_a.h"
#include "book_00swirl_b.h"
#include "book_01big_world_a.h"
#include "book_01big_world_b.h"
#include "book_01boss_battle_a.h"
#include "book_01boss_battle_b.h"
#include "book_01broken_curve_a.h"
#include "book_01broken_curve_b.h"
#include "book_01concentrated_wealth_a.h"
#include "book_01concentrated_wealth_b.h"
#include "book_01corridors_a.h"
#include "book_01corridors_b.h"
#include "book_01elk_arena_a.h"
#include "book_01elk_arena_b.h"
#include "book_01fracture_a.h"
#include "book_01fracture_b.h"
#include "book_01gold_rush_a.h"
#include "book_01gold_rush_b.h"
#include "book_01hooks_a.h"
#include "book_01hooks_b.h"
#include "book_01islands_a.h"
#include "book_01islands_b.h"
#include "book_01shortcut_a.h"
#include "book_01shortcut_b.h"
#include "book_01starfish_a.h"
#include "book_01starfish_b.h"
#include "book_01starvation_a.h"
#include "book_01starvation_b.h"
#include "book_01the_farm_a.h"
#include "book_01the_farm_b.h"
#include "book_01yellow_brick_road_a.h"
#include "book_01yellow_brick_road_b.h"
static const PbMap pb_maps[]={
{100,100,12,3,3,5,1044,{1,2,11,9,6},pb_data_0,5299},
{100,100,12,93,93,5,1109,{1,11,2,10,6},pb_data_1,5674},
{41,41,20,3,1,3,1047,{6,2,0},pb_data_2,6573},
{41,41,20,3,37,3,1273,{6,2,0},pb_data_3,7745},
{50,50,14,3,3,5,2000,{11,0,2,1,6},pb_data_4,9402},
{50,50,14,44,44,5,1479,{1,11,2,10,6},pb_data_5,7305},
{71,71,30,13,33,5,965,{1,0,2,10,6},pb_data_6,5774},
{71,71,30,55,33,5,1086,{1,11,2,10,6},pb_data_7,5591},
{41,30,8,0,14,5,1038,{6,0,7,10,5},pb_data_8,20593},
{41,30,8,38,14,5,1241,{1,11,2,10,6},pb_data_9,5819},
{30,30,10,0,0,5,870,{1,11,2,10,6},pb_data_10,4382},
{30,30,10,27,27,5,855,{11,1,2,6,7},pb_data_11,11419},
{80,80,24,3,2,5,984,{1,11,2,10,6},pb_data_12,4954},
{80,80,24,73,74,5,1015,{1,11,2,10,6},pb_data_13,5182},
{30,30,6,1,18,3,1675,{1,11,6},pb_data_14,5681},
{30,30,6,26,9,3,1684,{1,2,11},pb_data_15,4879},
{50,40,18,20,14,5,825,{11,1,2,6,7},pb_data_16,9762},
{50,40,18,27,23,5,606,{6,1,2,7,11},pb_data_17,2872},
{30,30,19,1,1,4,1118,{6,2,0,1},pb_data_18,8748},
{30,30,19,26,26,4,710,{1,2,11,10},pb_data_19,2775},
{50,40,17,23,0,5,1044,{1,11,2,10,6},pb_data_20,4866},
{50,40,17,23,37,5,899,{1,11,2,10,6},pb_data_21,4279},
{40,40,14,0,0,4,1034,{6,2,0,1},pb_data_22,9061},
{40,40,14,37,37,4,1100,{1,2,11,10},pb_data_23,4453},
{90,30,42,2,12,5,1161,{1,11,2,10,6},pb_data_24,6019},
{90,30,42,85,12,5,969,{6,2,0,1,11},pb_data_25,11196},
{35,31,34,0,0,5,989,{6,2,0,1,11},pb_data_26,8148},
{35,31,34,0,28,5,584,{1,11,2,10,6},pb_data_27,2770},
{50,50,20,2,45,5,1017,{6,2,0,1,9},pb_data_28,11310},
{50,50,20,45,2,5,991,{1,11,2,10,6},pb_data_29,4725},
{31,31,8,0,0,3,1263,{1,2,11},pb_data_30,4125},
{31,31,8,28,28,3,1081,{1,2,11},pb_data_31,3334},
{50,65,23,1,1,5,1538,{9,11,1,0,7},pb_data_32,29952},
{50,65,23,46,1,5,1481,{1,2,11,3,8},pb_data_33,9307},
{45,45,21,17,17,5,564,{6,2,0,1,11},pb_data_34,6023},
{45,45,21,25,25,5,508,{1,2,11,3,6},pb_data_35,3569},
{30,30,14,12,13,4,1538,{6,2,0,1},pb_data_36,10298},
{30,30,14,15,14,4,1444,{1,6,0,2},pb_data_37,5879},
{40,40,51,17,11,5,695,{6,2,0,1,9},pb_data_38,6322},
{40,40,51,19,25,5,666,{1,11,2,10,6},pb_data_39,3392},
{50,50,9,2,2,4,924,{6,2,0,1},pb_data_40,9327},
{50,50,9,44,44,4,1061,{1,2,11,10},pb_data_41,4450},
{30,80,18,11,38,4,1095,{2,6,11,1},pb_data_42,17553},
{30,80,18,15,38,4,1201,{11,1,2,6},pb_data_43,6159},
{45,35,32,10,1,5,754,{6,9,11,0,7},pb_data_44,14357},
{45,35,32,32,1,5,809,{1,11,2,10,6},pb_data_45,4068},
{60,50,13,0,0,5,2000,{1,2,11,0,6},pb_data_46,9293},
{60,50,13,0,47,5,1745,{1,11,2,10,6},pb_data_47,8302},
{45,30,22,26,6,4,1060,{10,2,6,0},pb_data_48,5676},
{45,30,22,16,21,4,873,{1,2,11,10},pb_data_49,3761},
{100,100,24,78,11,5,957,{1,11,2,10,6},pb_data_50,4920},
{100,100,24,18,85,5,918,{1,11,2,10,6},pb_data_51,4692},
{50,41,31,22,0,5,883,{1,11,2,10,6},pb_data_52,4213},
{50,41,31,22,39,5,1119,{1,11,2,10,6},pb_data_53,4930},
{40,40,22,26,5,3,1072,{1,6,2},pb_data_54,4644},
{40,40,22,11,32,3,797,{1,2,11},pb_data_55,2260},
{61,61,11,1,29,5,1566,{1,2,11,9,6},pb_data_56,7230},
{61,61,11,57,29,5,1259,{1,11,2,10,6},pb_data_57,6556},
{51,40,12,24,0,5,984,{1,11,2,10,6},pb_data_58,5356},
{51,40,12,24,37,5,1075,{1,11,2,10,6},pb_data_59,5946},
{50,50,29,12,23,5,2000,{1,11,2,10,6},pb_data_60,9153},
{50,50,29,34,23,5,1714,{1,11,2,10,6},pb_data_61,8501},
{61,71,28,1,1,5,1011,{1,11,2,10,6},pb_data_62,4925},
{61,71,28,56,66,5,963,{1,11,2,10,6},pb_data_63,4689},
{31,31,15,1,16,3,976,{1,2,11},pb_data_64,2895},
{31,31,15,27,12,3,1106,{1,2,11},pb_data_65,3362},
{31,31,12,1,1,4,1062,{5,1,6,11},pb_data_66,11172},
{31,31,12,27,27,4,1138,{11,1,0,6},pb_data_67,4148},
{60,60,46,28,3,5,771,{1,2,11,9,6},pb_data_68,3642},
{60,60,46,28,54,5,887,{1,11,2,10,6},pb_data_69,3933},
{40,40,21,18,25,4,882,{1,2,11,10},pb_data_70,3427},
{40,40,21,18,12,4,834,{1,2,11,10},pb_data_71,3384},
{50,50,16,2,2,5,1259,{1,11,2,10,6},pb_data_72,6249},
{50,50,16,45,2,5,1278,{1,11,2,10,6},pb_data_73,5927},
{80,80,14,1,48,5,1601,{1,11,2,10,6},pb_data_74,7692},
{80,80,14,76,48,5,1657,{1,11,2,10,6},pb_data_75,8253},
{50,40,28,1,1,3,911,{1,2,11},pb_data_76,2947},
{50,40,28,45,1,3,1021,{1,2,11},pb_data_77,3146},
{40,30,28,2,13,5,1239,{1,11,2,10,6},pb_data_78,5853},
{40,30,28,34,13,5,1132,{1,11,2,10,6},pb_data_79,5285}
};
static constexpr int PB_MAPS=sizeof(pb_maps)/sizeof(pb_maps[0]);
inline unsigned pb_six(char c){return c>='A'&&c<='Z'?c-'A':c>='a'&&c<='z'?c-'a'+26:c>='0'&&c<='9'?c-'0'+52:c=='+'?62:63;}
inline int pb_key(const char* p){unsigned a=pb_six(p[0]),b=pb_six(p[1]),c=pb_six(p[2]);return ((a<<2)|(b>>4))|(((b<<4)|(c>>2))&255)<<8;}
inline PbAct pb_read(const char* p){unsigned char b[12];for(int i=0;i<4;++i){unsigned a=pb_six(p[4*i]),c=pb_six(p[4*i+1]),d=pb_six(p[4*i+2]),e=pb_six(p[4*i+3]);b[3*i]=(a<<2)|(c>>4);b[3*i+1]=(c<<4)|(d>>2);b[3*i+2]=(d<<6)|e;}return {b[0]|(b[1]<<8),static_cast<std::int16_t>(b[2]|(b[3]<<8)),static_cast<std::int16_t>(b[4]|(b[5]<<8)),static_cast<std::int32_t>(static_cast<std::uint32_t>(b[6])|(static_cast<std::uint32_t>(b[7])<<8)|(static_cast<std::uint32_t>(b[8])<<16)|(static_cast<std::uint32_t>(b[9])<<24)),b[10],b[11]};}
