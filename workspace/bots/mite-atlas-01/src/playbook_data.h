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
{100,100,12,3,3,5,1148,{1,2,11,9,6},pb_data_0,5714},
{100,100,12,93,93,5,1307,{11,0,2,1,6},pb_data_1,6243},
{41,41,20,3,1,3,1047,{6,2,0},pb_data_2,6573},
{41,41,20,3,37,3,1273,{6,2,0},pb_data_3,7745},
{50,50,14,3,3,5,1912,{5,1,6,0,11},pb_data_4,10351},
{50,50,14,44,44,5,1261,{1,2,11,3,0},pb_data_5,7962},
{71,71,30,13,33,5,965,{1,0,2,10,6},pb_data_6,5774},
{71,71,30,55,33,5,1082,{1,11,2,0,6},pb_data_7,5331},
{41,30,8,0,14,5,1203,{1,11,2,10,6},pb_data_8,5887},
{41,30,8,38,14,5,1093,{11,0,7,10,5},pb_data_9,21148},
{30,30,10,0,0,5,821,{1,2,11,3,6},pb_data_10,5387},
{30,30,10,27,27,5,797,{5,6,2,11,1},pb_data_11,4515},
{80,80,24,3,2,5,889,{1,2,11,9,6},pb_data_12,4588},
{80,80,24,73,74,5,928,{5,1,6,2,11},pb_data_13,5059},
{30,30,6,1,18,3,1719,{5,1,11},pb_data_14,13759},
{30,30,6,26,9,3,1502,{1,2,11},pb_data_15,4733},
{50,40,18,20,14,5,569,{6,2,0,1,11},pb_data_16,6572},
{50,40,18,27,23,5,614,{5,6,0,11,1},pb_data_17,3264},
{30,30,19,1,1,4,1207,{5,1,6,11},pb_data_18,11298},
{30,30,19,26,26,4,670,{1,2,11,3},pb_data_19,3720},
{50,40,17,23,0,5,986,{11,5,2,1,6},pb_data_20,12471},
{50,40,17,23,37,5,875,{1,2,11,3,6},pb_data_21,6015},
{40,40,14,0,0,4,1121,{1,2,11,3},pb_data_22,5689},
{40,40,14,37,37,4,1130,{5,1,6,0},pb_data_23,5114},
{90,30,42,2,12,5,950,{1,2,11,3,6},pb_data_24,6342},
{90,30,42,85,12,5,939,{1,2,11,3,6},pb_data_25,6161},
{35,31,34,0,0,5,582,{1,2,11,3,6},pb_data_26,3290},
{35,31,34,0,28,5,817,{5,1,6,0,11},pb_data_27,4306},
{50,50,20,2,45,5,1018,{11,5,2,1,6},pb_data_28,14038},
{50,50,20,45,2,5,992,{5,1,6,0,11},pb_data_29,5481},
{31,31,8,0,0,3,1367,{6,2,10},pb_data_30,5073},
{31,31,8,28,28,3,992,{1,2,11},pb_data_31,3448},
{50,65,23,1,1,5,1500,{11,5,0,1,6},pb_data_32,21509},
{50,65,23,46,1,5,1299,{11,9,1,0,7},pb_data_33,25184},
{45,45,21,17,17,5,463,{5,6,0,11,1},pb_data_34,2649},
{45,45,21,25,25,5,597,{5,6,0,11,1},pb_data_35,3416},
{30,30,14,12,13,4,1500,{6,2,0,1},pb_data_36,10351},
{30,30,14,15,14,4,1144,{5,1,6,0},pb_data_37,5021},
{40,40,51,17,11,5,536,{1,2,11,9,3},pb_data_38,3705},
{40,40,51,19,25,5,606,{1,11,2,0,6},pb_data_39,3035},
{50,50,9,2,2,4,1233,{11,5,2,1},pb_data_40,13483},
{50,50,9,44,44,4,1054,{1,2,11,9},pb_data_41,4861},
{30,80,18,11,38,4,1091,{5,1,6,11},pb_data_42,11610},
{30,80,18,15,38,4,1037,{1,2,11,3},pb_data_43,6426},
{45,35,32,10,1,5,765,{1,2,11,3,6},pb_data_44,5123},
{45,35,32,32,1,5,801,{11,1,0,6,2},pb_data_45,4363},
{60,50,13,0,0,5,1546,{6,1,10,7,11},pb_data_46,6968},
{60,50,13,0,47,5,2000,{1,11,2,10,6},pb_data_47,9703},
{45,30,22,26,6,4,929,{6,2,0,1},pb_data_48,8026},
{45,30,22,16,21,4,984,{11,1,6,0},pb_data_49,3956},
{100,100,24,78,11,5,940,{1,2,11,9,3},pb_data_50,6052},
{100,100,24,18,85,5,893,{6,2,0,1,11},pb_data_51,10354},
{50,41,31,22,0,5,964,{5,1,6,7,11},pb_data_52,11211},
{50,41,31,22,39,5,2000,{9,0,2,6,4},pb_data_53,11217},
{40,40,22,26,5,3,785,{6,2,11},pb_data_54,6459},
{40,40,22,11,32,3,810,{5,1,11},pb_data_55,6331},
{61,61,11,1,29,5,1005,{5,1,6,7,11},pb_data_56,13480},
{61,61,11,57,29,5,1243,{1,2,11,3,8},pb_data_57,8340},
{51,40,12,24,0,5,1031,{1,11,2,10,6},pb_data_58,5568},
{51,40,12,24,37,5,1131,{6,9,11,1,7},pb_data_59,21853},
{50,50,29,12,23,5,1931,{11,6,0,1,2},pb_data_60,9297},
{50,50,29,34,23,5,1509,{1,6,11,10,0},pb_data_61,19960},
{61,71,28,1,1,5,1060,{5,1,6,7,11},pb_data_62,14490},
{61,71,28,56,66,5,1089,{5,1,6,7,11},pb_data_63,14783},
{31,31,15,1,16,3,1587,{1,11,2},pb_data_64,4681},
{31,31,15,27,12,3,1285,{1,2,11},pb_data_65,3668},
{31,31,12,1,1,4,1199,{10,2,6,0},pb_data_66,5834},
{31,31,12,27,27,4,2000,{5,1,6,0},pb_data_67,7756},
{60,60,46,28,3,5,1014,{11,9,0,1,6},pb_data_68,6215},
{60,60,46,28,54,5,770,{1,2,11,9,3},pb_data_69,4830},
{40,40,21,18,25,4,1049,{1,2,11,3},pb_data_70,5160},
{40,40,21,18,12,4,809,{1,2,11,3},pb_data_71,4330},
{50,50,16,2,2,5,1425,{1,2,11,3,7},pb_data_72,8343},
{50,50,16,45,2,5,1190,{1,2,11,3,0},pb_data_73,7827},
{80,80,14,1,48,5,1590,{1,11,2,10,6},pb_data_74,8022},
{80,80,14,76,48,5,1732,{1,2,11,3,8},pb_data_75,10264},
{50,40,28,1,1,3,774,{5,1,11},pb_data_76,5966},
{50,40,28,45,1,3,653,{6,2,11},pb_data_77,5212},
{40,30,28,2,13,5,663,{5,1,6,7,11},pb_data_78,8060},
{40,30,28,34,13,5,1028,{1,2,11,3,6},pb_data_79,4949}
};
static constexpr int PB_MAPS=sizeof(pb_maps)/sizeof(pb_maps[0]);
inline unsigned pb_six(char c){return c>='A'&&c<='Z'?c-'A':c>='a'&&c<='z'?c-'a'+26:c>='0'&&c<='9'?c-'0'+52:c=='+'?62:63;}
inline int pb_key(const char* p){unsigned a=pb_six(p[0]),b=pb_six(p[1]),c=pb_six(p[2]);return ((a<<2)|(b>>4))|(((b<<4)|(c>>2))&255)<<8;}
inline PbAct pb_read(const char* p){unsigned char b[12];for(int i=0;i<4;++i){unsigned a=pb_six(p[4*i]),c=pb_six(p[4*i+1]),d=pb_six(p[4*i+2]),e=pb_six(p[4*i+3]);b[3*i]=(a<<2)|(c>>4);b[3*i+1]=(c<<4)|(d>>2);b[3*i+2]=(d<<6)|e;}return {b[0]|(b[1]<<8),static_cast<std::int16_t>(b[2]|(b[3]<<8)),static_cast<std::int16_t>(b[4]|(b[5]<<8)),static_cast<std::int32_t>(static_cast<std::uint32_t>(b[6])|(static_cast<std::uint32_t>(b[7])<<8)|(static_cast<std::uint32_t>(b[8])<<16)|(static_cast<std::uint32_t>(b[9])<<24)),b[10],b[11]};}
