#pragma once
#include <cambc.h>
#include <cstdio>
#include <algorithm>
#include "playbook_data.h"
namespace pb {
namespace bc=cambc;
inline int selected(){
 static int m=-2;if(m!=-2)return m;m=-1;
 const int w=bc::map::width(),h=bc::map::height(),g=bc::map::camp_groups().size();
 const auto spawn=bc::map::spawn_region(bc::team::ally);
 for(int i=0;i<PB_MAPS;++i)if(pb_maps[i].w==w&&pb_maps[i].h==h&&pb_maps[i].groups==g&&spawn.is_set({pb_maps[i].sx,pb_maps[i].sy})){m=i;break;}
 return m;
}
inline bool draft(){const int i=selected();if(i<0)return false;const auto& m=pb_maps[i];const auto mine=bc::draft::current_draft(bc::team::ally);if(mine.size()<m.n)bc::draft::pick(static_cast<bc::champion_draft>(m.draft[mine.size()]));return true;}
inline bool turn(){
 const int i=selected();if(i<0)return false;
 const auto& m=pb_maps[i];const int round=bc::round_number();if(round>m.end)return false;
 auto me=bc::self();const int type=static_cast<int>(me.champion_name());const int key=type*2048+round;
 int lo=0,hi=m.size;while(lo<hi){const int mid=(lo+hi)/2;if(pb_key(m.data+mid*16)<key)lo=mid+1;else hi=mid;}
 static int errors=0;
 for(int index=lo;index<m.size&&pb_key(m.data+index*16)==key;++index){const auto a=pb_read(m.data+index*16);const bc::vec2 p{a.x,a.y};
  try {
   switch(a.k){
    case 4:me.move_absolute(p);break;
    case 5:
     if(bc::vision::champion_tiles().is_set(p))me.attack(bc::vision::champion_at(p));
     else if(bc::vision::camp_tiles().is_set(p))me.attack(bc::vision::camp_at(p));
     else {bc::detail::altar_lock_info raw{};if(bc::detail::sdk_altar_lock(p.x,p.y,bc::detail::absolute_team(bc::team::enemy),&raw)==0)me.attack(bc::altar_lock{raw});}
     break;
    case 6:{auto ab=me.abilities()[a.s];
     if(ab.is_attack_reset()||ab.is_shield())ab.use();
     else if(ab.can_target_ground())ab.use(p);
     else if(bc::vision::champion_tiles().is_set(p))ab.use(bc::vision::champion_at(p));
     else if(bc::vision::camp_tiles().is_set(p))ab.use(bc::vision::camp_at(p));
     break;}
    case 9:me.set_priority(a.v);break;
    case 11:me.recall();break;
    case 12:me.submit_gems(p);break;
    case 13:me.buy(bc::item_type{static_cast<bc::item_type::enum_type>(a.s)},a.v);break;
    case 14:me.place_ward(p);break;
    case 16:if(me.is_recalling())me.cancel_recall();else if(me.is_submitting_gems())me.cancel_submit_gems();else cambc::detail::check(cambc::detail::sdk_cancel_channel());break;
    case 20:me.consumables()[bc::consumable_type::altar_lock].use(p);break;
    case 21:me.consumables()[bc::consumable_type::tp_crystal].use(p);break;
    case 25:me.sell(bc::item_type{static_cast<bc::item_type::enum_type>(a.s)},a.v);break;
    case 30:me.buy(a.s==0?bc::consumable_type::tp_crystal:bc::consumable_type::altar_lock);break;
   }
  }catch(const std::exception& e){if(++errors<=10)std::printf("playbook action error round %d type %d kind %d: %s\n",round,type,a.k,e.what());}
 }
 return true;
}
}
