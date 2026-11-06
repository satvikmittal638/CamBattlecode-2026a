// Draft: Mite always drafts the same fixed order, truncated to the map's team size
// (3 picks -> Varg, Vendetta, Cassi&Issac; 4 -> + Willow; 5 -> + Ren). It never reacts to
// the opponent's picks (duplicates are allowed by the rules, so there is nothing to deny).
#include <cambc.h>
#include "draft.h"
#include <algorithm>
#include <array>
#include <string_view>

void play_draft() {
    // current Mite (2026-10-14): 3-pick maps -> Varg, Ryth, Cassi&Issac; 4/5-pick maps keep Vendetta.
    static constexpr std::array big{
        cambc::champion_draft::varg,   cambc::champion_draft::vendetta, cambc::champion_draft::cassi_and_issac,
        cambc::champion_draft::willow, cambc::champion_draft::ren,      cambc::champion_draft::ryth,
        cambc::champion_draft::marcella, cambc::champion_draft::tavi,   cambc::champion_draft::stellar,
        cambc::champion_draft::prism,  cambc::champion_draft::vesper_vale};
    static constexpr std::array small{
        cambc::champion_draft::varg,   cambc::champion_draft::ryth,     cambc::champion_draft::cassi_and_issac,
        cambc::champion_draft::vendetta, cambc::champion_draft::willow, cambc::champion_draft::ren,
        cambc::champion_draft::marcella, cambc::champion_draft::tavi,   cambc::champion_draft::stellar,
        cambc::champion_draft::prism,  cambc::champion_draft::vesper_vale};
    const auto mine = cambc::draft::current_draft(cambc::team::ally);
    cambc::draft_memory = std::string_view("MITE2");
    const bool threePicks = cambc::draft::team_size() <= 3;
    for (auto pick : threePicks ? small : big) {
        if (std::find(mine.begin(), mine.end(), pick) != mine.end()) continue;
        cambc::draft::pick(pick);
        return;
    }
}
