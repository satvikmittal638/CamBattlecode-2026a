// KratosMessi draft: a fixed priority list, truncated by team size, independent of map
// and of the opponent's picks (verified on ~1,000 matches since their 12:00 version):
//   Varg > Cassi&Issac > Vendetta > Ryth > Tavi
#include <cambc.h>
#include "draft.h"
#include <algorithm>
#include <array>
#include <vector>

void play_draft() {
    using cambc::champion_draft;
    static constexpr std::array<champion_draft, 11> order{
        champion_draft::varg, champion_draft::cassi_and_issac, champion_draft::vendetta,
        champion_draft::ryth, champion_draft::tavi,
        // fall-backs (never reached in practice; picks are unique per team only)
        champion_draft::ren, champion_draft::marcella, champion_draft::stellar,
        champion_draft::vesper_vale, champion_draft::prism, champion_draft::willow};
    const auto chosen = cambc::draft::current_draft(cambc::team::ally);
    for (auto pick : order) {
        if (std::find(chosen.begin(), chosen.end(), pick) == chosen.end()) {
            cambc::draft::pick(pick);
            return;
        }
    }
}
