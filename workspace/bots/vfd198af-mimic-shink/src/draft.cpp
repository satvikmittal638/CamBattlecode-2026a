// SHINK-style draft: a fixed priority list (Vendetta > Varg > Cassi&Issac > Ryth > Tavi) with
// map-specific substitutions (SHINK's current table: corners -> Vendetta/Varg/Ryth/Ren/Marcella,
// elkring -> Ren as 5th, collision -> Vendetta/C&I/Ren; packs went back to the base order). SHINK ignores the opponent's picks entirely (picks are made
// simultaneously and duplicates are allowed), so we do too.
#include <cambc.h>
#include "draft.h"
#include <algorithm>
#include <string_view>
#include <vector>

using cambc::champion_draft;

namespace {

struct MapSig {
    int camps = 0, wolves = 0, elks = 0, gems = 0, golds = 0, monos = 0;
};

MapSig signature() {
    MapSig s;
    for (const auto& g : cambc::map::camp_groups())
        for (const auto& c : g.camps()) {
            ++s.camps;
            switch (c.kind()) {
                case cambc::camp_type::wolf: ++s.wolves; break;
                case cambc::camp_type::elk: ++s.elks; break;
                case cambc::camp_type::gem_cluster: ++s.gems; break;
                case cambc::camp_type::gold_cluster: ++s.golds; break;
                case cambc::camp_type::monolith: ++s.monos; break;
            }
        }
    return s;
}

// Returns the full ordered pick list for this map.
std::vector<champion_draft> plan(unsigned team_size) {
    const int w = cambc::map::width(), h = cambc::map::height();
    const MapSig s = signature();
    const auto V = champion_draft::vendetta, G = champion_draft::varg, CI = champion_draft::cassi_and_issac,
               R = champion_draft::ryth, T = champion_draft::tavi, N = champion_draft::ren, M = champion_draft::marcella;
    (void)h;
    // Base order used by SHINK on every map it has not specialised (current version, 2026-10-14).
    std::vector<champion_draft> order{V, G, CI, R, T};
    if (team_size <= 3) {
        // Mid-size 3v3 maps with a few elks and many single wolves (collision-like): Ren replaces Varg.
        if (w >= 36 && w <= 48 && s.elks > 0 && s.wolves >= s.elks) order = {V, CI, N, G, R};
    } else if (team_size >= 5) {
        // Elk-dominated maps (elkring-like, >= 1/2 elks): Ren instead of Tavi as the fifth pick.
        if (s.elks * 2 >= s.camps) order = {V, G, CI, R, N};
        // Elk-heavy maps (corners-like, 30-50% elks): an all-melee brawl line-up without C&I.
        else if (s.elks * 10 >= s.camps * 3) order = {V, G, R, N, M};
    }
    return order;
}

} // namespace

void play_draft() {
    const auto chosen = cambc::draft::current_draft(cambc::team::ally);
    const auto order = plan(cambc::draft::team_size());
    for (auto pick : order) {
        if (std::find(chosen.begin(), chosen.end(), pick) == chosen.end()) {
            cambc::draft::pick(pick);
            return;
        }
    }
    // Fallback: anything not yet taken.
    for (int i = 0; i < 11; ++i) {
        auto pick = static_cast<champion_draft>(i);
        if (std::find(chosen.begin(), chosen.end(), pick) == chosen.end()) { cambc::draft::pick(pick); return; }
    }
}
