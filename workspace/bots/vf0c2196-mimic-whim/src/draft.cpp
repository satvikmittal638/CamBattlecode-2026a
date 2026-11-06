#include <cambc.h>
#include "draft.h"
#include <iostream>
#include <string>
#include <vector>
#include <variant>

static bool dumped = false;
void play_draft() {
    if (!dumped && cambc::draft::current_draft(cambc::team::ally).empty()) {
        dumped = true;
        int W = cambc::map::width(), H = cambc::map::height();
        std::vector<std::string> g(H, std::string(W, '.'));
        auto put = [&](const cambc::bitboard& b, char c) { for (auto p : b.positions()) g[p.y][p.x] = c; };
        put(cambc::map::walls(), '#'); put(cambc::map::bushes(), '"'); put(cambc::map::holes(), 'o');
        put(cambc::map::altars(), 'A'); put(cambc::map::spawn_region(cambc::team::ally), 'S'); put(cambc::map::spawn_region(cambc::team::enemy), 'E');
        std::cout << "MAP " << W << "x" << H << " sym=" << (int)cambc::map::symmetry() << " teamsize=" << cambc::draft::team_size() << "\n";
        int gi = 0;
        for (auto& grp : cambc::map::camp_groups()) {
            std::cout << "GROUP " << gi << " gold=" << grp.gold_value() << " gems=" << grp.gem_value() << " respawn=" << grp.max_respawn_timer() << " camps:";
            for (auto& c : grp.camps()) {
                const char* k = c.is_wolf() ? "W" : c.is_elk() ? "K" : c.is_gem_cluster() ? "G" : c.is_gold_cluster() ? "D" : "M";
                std::cout << " " << k << "(" << c.spawn_position().x << "," << c.spawn_position().y << ")";
                g[c.spawn_position().y][c.spawn_position().x] = k[0];
            }
            std::cout << "\n"; gi++;
        }
        for (int y = H - 1; y >= 0; --y) std::cout << "ROW " << g[y] << "\n";
        std::cout << "CONST capture=" << cambc::constants::capture_time << " sleep=" << cambc::constants::camp_sleep_time << " respawn=" << cambc::constants::respawn_time << " recall=" << cambc::constants::recall_time << " passive_gold=" << cambc::constants::passive_gold << " kill_gold=" << cambc::constants::kill_gold << " assist_gold=" << cambc::constants::assist_gold << " spawn_heal=" << cambc::constants::spawn_healing << " maxr=" << cambc::constants::max_rounds << " submit_range=" << cambc::constants::submit_gems_range << "\n";
    }
    const auto chosen = cambc::draft::current_draft(cambc::team::ally);
    const cambc::champion_draft order[] = {cambc::champion_draft::varg, cambc::champion_draft::ryth, cambc::champion_draft::vendetta, cambc::champion_draft::ren, cambc::champion_draft::marcella};
    cambc::draft::pick(order[chosen.size()]);
}
