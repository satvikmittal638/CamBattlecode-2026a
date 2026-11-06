// Replay scraper: an observation-only CAMBC bot. Hosted by the replay-exact harness (turnhost, shadow mode) on the
// Rank-1 team's side, it runs at each of that team's champion turns with exactly the state and personal vision the
// Rank-1 bot had, prints one SCRAPE line per turn, and takes no action (turnhost then applies the recorded action).
//
// Build:  tools/build_replay_scraper.sh            (copies this file to workspace/bots/replay-scraper/src/main.cpp)
// Run:    node tools/replay_scraper_run.mjs ...     (drives turnhost over the replays, writes rank1_threat_data.csv)
//
// Logged per turn of a Vendetta / Cassi / Issac with at least one opponent champion in its vision:
//   round, champion, own tile/HP/carried gems, every visible opponent (tile, HP fraction, type), nearest opponent
//   distance and HP fraction, nearest alive visible camp (tile, distance, kind), nearest altar (tile, distance).
#include <cambc.h>
#include <algorithm>
#include <cstdio>
#include <string>

namespace bc = cambc;
using bc::team;
using bc::vec2;

#ifndef SCRAPE_ALL_TYPES
#define SCRAPE_ALL_TYPES 0   // 1: log every champion type, not only Vendetta / Cassi / Issac
#endif

static int cheb(vec2 a, vec2 b) { return static_cast<int>(a.chebyshev_distance(b)); }

static const char* typeName(bc::champion_type t) {
    static constexpr const char* names[] = {"Ryth", "VesperVale", "Vendetta", "Cassi", "Issac", "Stellar", "Prism",
                                            "Marcella", "Willow", "Ren", "Varg", "Tavi", "HeartOfRuin"};
    const int i = static_cast<int>(t);
    return i >= 0 && i < 13 ? names[i] : "?";
}

static void scrapeTurn() {
    auto& me = bc::self();
    const auto type = me.champion_name();
    if (!SCRAPE_ALL_TYPES && type != bc::champion_type::vendetta && type != bc::champion_type::cassi && type != bc::champion_type::issac) return;
    const vec2 pos = me.position();

    // Opponents (from the Rank-1 champion's point of view) in its personal vision.
    const auto foes = bc::vision::champions(bc::opponent(team::ally));
    if (foes.empty()) return;

    std::string line;
    line.reserve(1024);
    char buf[160];
    int nearestD = 1 << 20; float nearestHp = 0; vec2 nearestPos{-1, -1};
    line += "[";
    bool first = true;
    for (const auto& f : foes) {
        if (!f.is_alive()) continue;
        const vec2 p = f.position();
        const float frac = f.health() / std::max(1.0f, f.max_health());
        const int d = cheb(pos, p);
        if (d < nearestD) { nearestD = d; nearestHp = frac; nearestPos = p; }
        std::snprintf(buf, sizeof buf, "%s[%d,%d,%.3f,%d]", first ? "" : ",", p.x, p.y, frac, static_cast<int>(f.champion_name()));
        line += buf; first = false;
    }
    line += "]";
    if (nearestD == (1 << 20)) return;

    // Nearest alive (awake or asleep) camp in vision; also the visible camp tiles for action classification.
    int campD = -1; vec2 campPos{-1, -1}; int campKind = -1;
    std::string camps = "[";
    bool firstCamp = true;
    for (const auto& c : bc::vision::camps()) {
        if (c.is_dead()) continue;
        const vec2 p = c.position();
        const int d = cheb(pos, p);
        if (campD < 0 || d < campD) { campD = d; campPos = p; campKind = static_cast<int>(c.kind()); }
        if (d <= 10) { std::snprintf(buf, sizeof buf, "%s[%d,%d]", firstCamp ? "" : ",", p.x, p.y); camps += buf; firstCamp = false; }
    }
    camps += "]";

    int altarD = -1; vec2 altarPos{-1, -1};
    for (auto a : bc::map::altars().positions()) { const int d = cheb(pos, a); if (altarD < 0 || d < altarD) { altarD = d; altarPos = a; } }

    std::printf("SCRAPE {\"round\":%d,\"champion\":\"%s\",\"pos\":[%d,%d],\"hp\":%.1f,\"mhp\":%.1f,\"gems\":%u,"
                "\"dist_to_enemy\":%d,\"enemy_health_pct\":%.4f,\"enemy_pos\":[%d,%d],\"enemies\":%s,"
                "\"dist_to_camp\":%d,\"camp_pos\":[%d,%d],\"camp_kind\":%d,\"camps\":%s,\"dist_to_altar\":%d,\"altar_pos\":[%d,%d]}\n",
                static_cast<int>(bc::round_number()), typeName(type), pos.x, pos.y, me.health(), me.max_health(), me.gem_count(),
                nearestD, nearestHp, nearestPos.x, nearestPos.y, line.c_str(),
                campD, campPos.x, campPos.y, campKind, camps.c_str(), altarD, altarPos.x, altarPos.y);
}

int main() {
    while (true) {
        try {
            if (!bc::is_draft()) scrapeTurn();
        } catch (const std::exception& e) {
            std::printf("SCRAPE_ERROR %s\n", e.what());
        } catch (...) {
            std::printf("SCRAPE_ERROR unknown\n");
        }
        bc::end_turn();
    }
}
