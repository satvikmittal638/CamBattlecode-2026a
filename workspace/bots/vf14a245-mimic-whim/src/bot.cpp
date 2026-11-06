#include <cambc.h>
#include "bot.h"
#include <iostream>
void Bot::buy_items() {}
void Bot::play_turn() {
    auto& me = cambc::self();
    if (cambc::round_number() > 3) return;
    long f0 = cambc::fuel_remaining();
    auto walls = cambc::map::walls() | cambc::map::holes() | cambc::map::altars();
    long f1 = cambc::fuel_remaining();
    cambc::bitboard roots; roots.set(me.position());
    cambc::distance_field field; cambc::bitboard visited;
    field.compute(walls, roots, visited);
    long f2 = cambc::fuel_remaining();
    auto lin = field.export_linear_buffer();
    long f3 = cambc::fuel_remaining();
    auto groups = cambc::map::camp_groups();
    long f4 = cambc::fuel_remaining();
    int s = 0; for (int i = 0; i < 1000; i++) s += field.get({i % cambc::map::width(), (i / 7) % cambc::map::height()});
    long f5 = cambc::fuel_remaining();
    auto allies = cambc::champions(cambc::team::ally);
    std::string info;
    for (auto& a : allies) { try { auto p = a.position(); info += " ally@" + std::to_string(p.x) + "," + std::to_string(p.y) + " alive=" + std::to_string(a.is_alive()) + " hp=" + std::to_string((int)a.health()) + " type=" + std::to_string((int)a.champion_name()); } catch (std::exception& e) { info += std::string(" ERR:") + e.what(); } }
    auto enemies = cambc::champions(cambc::team::enemy);
    for (auto& a : enemies) { try { auto p = a.position(); info += " enemy@" + std::to_string(p.x) + "," + std::to_string(p.y); } catch (std::exception& e) { info += std::string(" EERR:") + e.what(); } }
    long f6 = cambc::fuel_remaining();
    auto bs = me.base_stats();
    std::cout << "r" << cambc::round_number() << " type" << (int)me.champion_name() << " fuel start " << f0 << " walls " << (f0-f1) << " dfield " << (f1-f2) << " export " << (f2-f3) << " groups " << (f3-f4) << " 1000gets " << (f4-f5) << " champs " << (f5-f6) << " sum" << s << info
      << " base hp " << bs.base_health << " str " << bs.base_strength << " campmul " << bs.camp_damage_multiplier << " range " << bs.base_attack_range << " str() " << me.strength() << "\n";
}
