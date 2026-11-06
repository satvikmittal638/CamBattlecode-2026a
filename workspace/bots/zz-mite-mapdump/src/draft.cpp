#include <cambc.h>
#include "draft.h"
#include <cstdio>
#include <string>
#include <vector>
static bool done = false;
void play_draft() {
    if (!done) {
        done = true;
        int W = cambc::map::width(), H = cambc::map::height();
        namespace C = cambc::constants;
        std::printf("CONST capture=%d sleep=%d respawn=%d recall=%d submitMul=%f submitBase=%d submitMin=%d submitRange=%d killGold=%u assistGold=%u passiveGold=%u spawnHeal=%f wardCd=%d wardLife=%d wardVis=%f wardPlace=%f lockHits=%u tp=%d\n", C::capture_time, C::camp_sleep_time, C::respawn_time, C::recall_time, C::submit_gem_duration_multiplier, C::submit_gem_base_duration, C::submit_gem_minimum_duration, C::submit_gems_range, C::kill_gold, C::assist_gold, C::passive_gold, C::spawn_healing, C::ward_cooldown, C::ward_lifetime, C::ward_vision_radius, C::ward_placement_radius, C::altar_lock_hits, C::tp_crystal_time);
        std::printf("MAP %d %d sym=%d teamsize=%u\n", W, H, (int)cambc::map::symmetry(), cambc::draft::team_size());
        auto walls = cambc::map::walls(); auto holes = cambc::map::holes(); auto bush = cambc::map::bushes(); auto alt = cambc::map::altars();
        auto sa = cambc::map::spawn_region(cambc::team::ally); auto se = cambc::map::spawn_region(cambc::team::enemy);
        std::vector<std::string> g(H, std::string(W, '.'));
        auto put = [&](const cambc::bitboard& b, char c) { for (auto p : b.positions()) g[p.y][p.x] = c; };
        put(bush, '"'); put(walls, '#'); put(holes, 'o'); put(alt, 'A'); put(sa, 'S'); put(se, 's');
        auto groups = cambc::map::camp_groups();
        int gi = 0;
        for (auto& grp : groups) {
            std::printf("GROUP %d gold=%u gems=%u respawn=%d camps:", gi, grp.gold_value(), grp.gem_value(), grp.max_respawn_timer());
            for (auto& c : grp.camps()) {
                auto p = c.spawn_position();
                const char* t = "WEG$M";
                g[p.y][p.x] = t[(int)c.kind()];
                std::printf(" %c(%d,%d)", t[(int)c.kind()], p.x, p.y);
            }
            std::printf("\n");
            gi++;
        }
        for (int y = H - 1; y >= 0; --y) std::printf("ROW %3d %s\n", y, g[y].c_str());
        std::fflush(nullptr);
    }
    cambc::draft::pick(cambc::champion_draft::varg);
    auto d = cambc::draft::current_draft(cambc::team::ally);
    (void)d;
}
