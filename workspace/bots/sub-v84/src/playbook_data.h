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
{100,100,12,3,3,5,1059,{1,3,9,2,11},pb_data_0,16719},
{100,100,12,93,93,5,1146,{1,11,2,10,6},pb_data_1,5890},
{41,41,20,3,1,3,1409,{5,1,11},pb_data_2,10511},
{41,41,20,3,37,3,955,{6,2,10},pb_data_3,7897},
{50,50,14,3,3,5,1756,{1,2,11,10,6},pb_data_4,23230},
{50,50,14,44,44,5,2000,{1,2,11,10,6},pb_data_5,29088},
{71,71,30,13,33,5,1343,{1,2,11,10,6},pb_data_6,16456},
{71,71,30,55,33,5,1269,{5,1,6,0,11},pb_data_7,7811},
{41,30,8,0,14,5,1077,{1,2,11,10,6},pb_data_8,14378},
{41,30,8,38,14,5,844,{1,2,11,10,6},pb_data_9,10980},
{30,30,10,0,0,5,750,{1,2,11,10,6},pb_data_10,10964},
{30,30,10,27,27,5,805,{6,2,0,1,11},pb_data_11,8317},
{80,80,24,3,2,5,889,{1,2,11,10,6},pb_data_12,12713},
{80,80,24,73,74,5,895,{5,1,6,2,11},pb_data_13,4903},
{30,30,6,1,18,3,1302,{5,1,11},pb_data_14,10576},
{30,30,6,26,9,3,1645,{6,2,10},pb_data_15,13641},
{50,40,18,20,14,5,596,{1,2,11,10,6},pb_data_16,8482},
{50,40,18,27,23,5,592,{5,6,0,11,1},pb_data_17,3143},
{30,30,19,1,1,4,1040,{5,6,0,11},pb_data_18,4665},
{30,30,19,26,26,4,906,{5,6,0,11},pb_data_19,4177},
{50,40,17,23,0,5,926,{1,11,2,10,6},pb_data_20,4339},
{50,40,17,23,37,5,1067,{11,1,2,6,0},pb_data_21,5203},
{40,40,14,0,0,4,1356,{6,2,0,1},pb_data_22,11927},
{40,40,14,37,37,4,1306,{6,2,0,1},pb_data_23,11483},
{90,30,42,2,12,5,957,{1,2,0,10,6},pb_data_24,13013},
{90,30,42,85,12,5,985,{5,1,6,7,11},pb_data_25,13096},
{35,31,34,0,0,5,747,{6,2,0,1,11},pb_data_26,7311},
{35,31,34,0,28,5,841,{1,11,2,10,6},pb_data_27,3706},
{50,50,20,2,45,5,935,{6,2,0,1,9},pb_data_28,10431},
{50,50,20,45,2,5,968,{5,1,6,0,11},pb_data_29,5070},
{31,31,8,0,0,3,1153,{1,11,2},pb_data_30,3645},
{31,31,8,28,28,3,1748,{11,1,6},pb_data_31,6168},
{50,65,23,1,1,5,2000,{1,11,2,10,6},pb_data_32,9494},
{50,65,23,46,1,5,1435,{11,9,0,1,6},pb_data_33,8431},
{45,45,21,17,17,5,540,{11,1,2,6,7},pb_data_34,6757},
{45,45,21,25,25,5,550,{6,1,10,7,11},pb_data_35,2455},
{30,30,14,12,13,4,1743,{1,11,2,10},pb_data_36,6135},
{30,30,14,15,14,4,1571,{5,1,6,0},pb_data_37,6464},
{40,40,51,17,11,5,976,{5,1,6,0,11},pb_data_38,4942},
{40,40,51,19,25,5,792,{5,1,6,0,11},pb_data_39,4492},
{50,50,9,2,2,4,1029,{1,11,2,10},pb_data_40,4454},
{50,50,9,44,44,4,980,{5,1,6,2},pb_data_41,4509},
{30,80,18,11,38,4,1170,{1,2,11,10},pb_data_42,4704},
{30,80,18,15,38,4,997,{11,1,6,2},pb_data_43,10781},
{45,35,32,10,1,5,767,{6,2,0,1,9},pb_data_44,8428},
{45,35,32,32,1,5,730,{6,2,0,1,9},pb_data_45,7962},
{60,50,13,0,0,5,1621,{0,5,1,6,11},pb_data_46,8910},
{60,50,13,0,47,5,1704,{6,2,0,1,11},pb_data_47,19886},
{45,30,22,26,6,4,1362,{6,2,0,1},pb_data_48,9548},
{45,30,22,16,21,4,922,{6,2,1,7},pb_data_49,8230},
{100,100,24,78,11,5,888,{6,2,0,1,11},pb_data_50,10187},
{100,100,24,18,85,5,923,{6,2,0,1,11},pb_data_51,10269},
{50,41,31,22,0,5,1296,{6,11,1,0,5},pb_data_52,24135},
{50,41,31,22,39,5,1707,{1,11,2,10,6},pb_data_53,7780},
{40,40,22,26,5,3,916,{5,1,11},pb_data_54,2919},
{40,40,22,11,32,3,826,{5,1,11},pb_data_55,2831},
{61,61,11,1,29,5,1498,{11,1,2,6,7},pb_data_56,17802},
{61,61,11,57,29,5,1142,{6,1,10,7,11},pb_data_57,4746},
{51,40,12,24,0,5,1429,{6,1,10,7,11},pb_data_58,6363},
{51,40,12,24,37,5,1258,{11,5,2,1,6},pb_data_59,17934},
{50,50,29,12,23,5,1762,{5,1,6,7,11},pb_data_60,22166},
{50,50,29,34,23,5,2000,{5,1,6,0,11},pb_data_61,9687},
{61,71,28,1,1,5,1040,{1,2,11,10,6},pb_data_62,14595},
{61,71,28,56,66,5,972,{6,2,0,1,9},pb_data_63,10547},
{31,31,15,1,16,3,1291,{11,1,6},pb_data_64,4782},
{31,31,15,27,12,3,1234,{1,11,2},pb_data_65,3816},
{31,31,12,1,1,4,977,{5,1,6,11},pb_data_66,10462},
{31,31,12,27,27,4,1470,{1,2,11,3},pb_data_67,17036},
{60,60,46,28,3,5,907,{5,1,6,0,11},pb_data_68,5158},
{60,60,46,28,54,5,780,{5,1,6,7,11},pb_data_69,10071},
{40,40,21,18,25,4,1062,{5,1,6,11},pb_data_70,11184},
{40,40,21,18,12,4,1149,{1,11,2,10},pb_data_71,4383},
{50,50,16,2,2,5,1217,{11,9,0,1,6},pb_data_72,7615},
{50,50,16,45,2,5,1048,{5,6,2,11,1},pb_data_73,5958},
{80,80,14,1,48,5,1522,{1,2,11,9,6},pb_data_74,7039},
{80,80,14,76,48,5,1574,{1,2,11,10,6},pb_data_75,21624},
{50,40,28,1,1,3,1357,{11,6,1},pb_data_76,4054},
{50,40,28,45,1,3,1296,{11,6,1},pb_data_77,3941},
{40,30,28,2,13,5,918,{5,1,6,7,11},pb_data_78,10421},
{40,30,28,34,13,5,1041,{6,2,0,1,11},pb_data_79,10500}
};
static constexpr int PB_MAPS=sizeof(pb_maps)/sizeof(pb_maps[0]);
inline unsigned pb_six(char c){return c>='A'&&c<='Z'?c-'A':c>='a'&&c<='z'?c-'a'+26:c>='0'&&c<='9'?c-'0'+52:c=='+'?62:63;}
inline int pb_key(const char* p){unsigned a=pb_six(p[0]),b=pb_six(p[1]),c=pb_six(p[2]);return ((a<<2)|(b>>4))|(((b<<4)|(c>>2))&255)<<8;}
inline PbAct pb_read(const char* p){unsigned char b[12];for(int i=0;i<4;++i){unsigned a=pb_six(p[4*i]),c=pb_six(p[4*i+1]),d=pb_six(p[4*i+2]),e=pb_six(p[4*i+3]);b[3*i]=(a<<2)|(c>>4);b[3*i+1]=(c<<4)|(d>>2);b[3*i+2]=(d<<6)|e;}return {b[0]|(b[1]<<8),static_cast<std::int16_t>(b[2]|(b[3]<<8)),static_cast<std::int16_t>(b[4]|(b[5]<<8)),static_cast<std::int32_t>(static_cast<std::uint32_t>(b[6])|(static_cast<std::uint32_t>(b[7])<<8)|(static_cast<std::uint32_t>(b[8])<<16)|(static_cast<std::uint32_t>(b[9])<<24)),b[10],b[11]};}
