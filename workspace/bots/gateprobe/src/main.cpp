// Map probe (never submit): in the draft, classify every altar - free, gated by ONE boss group (v62's detection), or
// gated only by the UNION of several boss groups (missed by v62) - and print one line per map.
#include <cambc.h>
#include <cstdio>
#include <vector>
int main() {
    if (cambc::is_draft()) {
        const auto groups = cambc::map::camp_groups();
        const auto walls = cambc::map::walls() | cambc::map::holes() | cambc::map::altars();
        const auto enemy = cambc::map::spawn_region(cambc::team::enemy);
        std::vector<cambc::bitboard> boss; std::vector<int> bossIdx; int monoliths = 0;
        for (int i = 0; i < static_cast<int>(groups.size()); ++i) {
            bool b = false; for (auto c : groups[i].camps()) b |= c.is_monolith();
            if (b) { boss.push_back(groups[i].spawn_tiles()); bossIdx.push_back(i); ++monoliths; }
        }
        int nAltars = 0, free = 0, single = 0, unionOnly = 0;
        for (auto altar : cambc::map::altars().positions()) {
            ++nAltars;
            cambc::bitboard ap; ap.draw_chebyshev(altar, 1); ap &= ~(walls | enemy);
            bool one = false; for (auto& b : boss) if (!ap.is_empty() && !(ap & ~b).count()) one = true;
            cambc::bitboard all; for (auto& b : boss) all |= b;
            const bool covered = !ap.is_empty() && !(ap & ~all).count();
            if (one) ++single; else if (covered) ++unionOnly; else ++free;
        }
        std::printf("GATEPROBE altars %d free %d single %d union %d bossGroups %d\n", nAltars, free, single, unionOnly, monoliths);
        cambc::draft::pick(cambc::champion_draft::ryth);
        cambc::end_turn();
    }
    while (true) cambc::end_turn();
}
