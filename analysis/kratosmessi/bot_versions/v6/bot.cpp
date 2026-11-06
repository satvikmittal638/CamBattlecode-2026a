// KratosMessi mimic - champion logic.
//
// Decision order each turn (mirrors what the replays show, see analysis/kratosmessi/STYLE.md):
//   dead -> shop | channel running -> wait | tribute just finished & gold>=150 -> recall
//   at spawn -> shop (Monster > Jungle:Health > Power:Str > Durability:Health > Power:Str..., 1 altar lock)
//   enemy tributing next to me & I hold a lock -> place altar lock
//   fight(): low HP (<1/3) -> hit what is in range / flee / recall; otherwise hit the closest enemy
//            in range (melee also steps in from distance 2), casting the champion's spell first
//   tribute if bag >= 40 gems or an altar is close; else farm the nearest own-side camp group that
//   no ally has claimed, capture it alone, repeat.
#include <cambc.h>
#include "bot.h"
#include <algorithm>
#include <array>
#include <cmath>
#include <cstdio>
#include <span>
#include <variant>

using cambc::bitboard;
using cambc::distance_field;
using cambc::team;
using cambc::vec2;

namespace {

int cheb(vec2 a, vec2 b) { return std::max(std::abs(a.x - b.x), std::abs(a.y - b.y)); }

constexpr float kRecallHp = 0.33f;     // recall / flee threshold (replays: median 0.31-0.33 at round start)
constexpr float kFleeHp = 0.40f;       // below this a melee champion does not step in to fight
constexpr int kTributeGems = 40;       // always bank at >= 40 gems
constexpr int kTributeNearAltar = 8;   // bank anything when an altar is this close (path tiles)
constexpr int kShopGold = 150;         // recall after a tribute when holding an emblem's worth of gold

struct BuildStep { cambc::item_type item; int target; };

}  // namespace

bool Bot::at_spawn() const {
    return cambc::map::spawn_region(team::ally).is_set(cambc::self().position());
}

void Bot::init() {
    auto& me = cambc::self();
    init_done = true;
    W = cambc::map::width();
    H = cambc::map::height();
    type = me.champion_name();
    ranged = me.base_stats().base_attack_range > 1;
    melee = !ranged;
    static_blocked = cambc::map::walls() | cambc::map::holes() | cambc::map::altars() | cambc::map::spawn_region(team::enemy);

    // ally slot for shared-memory claims
    const auto allies = cambc::champions(team::ally);
    n_allies = static_cast<int>(allies.size());
    for (int i = 0; i < n_allies; ++i)
        if (allies[i] == me) slot = i;
    if (slot > 7) slot = 7;

    // distance fields from both spawns (static terrain only)
    bitboard visited;
    own_field.compute(static_blocked, cambc::map::spawn_region(team::ally), visited);
    distance_field enemy_field;
    const bitboard enemy_walls = cambc::map::walls() | cambc::map::holes() | cambc::map::altars() | cambc::map::spawn_region(team::ally);
    enemy_field.compute(enemy_walls, cambc::map::spawn_region(team::enemy), visited);

    cell_group.assign(static_cast<std::size_t>(W * H), -1);
    const auto gs = cambc::map::camp_groups();
    groups.reserve(gs.size());
    for (const auto& g : gs) {
        Group G{g};
        G.gems = static_cast<int>(g.gem_value());
        G.gold = static_cast<int>(g.gold_value());
        G.respawn = g.max_respawn_timer();
        G.gold_only = G.gems == 0;
        int total_hp = 0;
        for (const auto& c : g.camps()) {
            switch (c.kind()) {
            case cambc::camp_type::wolf: total_hp += 1350; break;
            case cambc::camp_type::elk: total_hp += 2400; break;
            case cambc::camp_type::monolith: total_hp += 20000; break;
            default: total_hp += 500; break;
            }
        }
        G.capacity = std::max(1, (total_hp + 1299) / 1300);
        int od = 1 << 20, ed = 1 << 20;
        for (const auto& c : g.camps()) {
            const vec2 p = c.spawn_position();
            G.cells.push_back(p);
            if (c.kind() == cambc::camp_type::monolith) G.monolith = true;
            cell_group[static_cast<std::size_t>(p.y * W + p.x)] = static_cast<std::int16_t>(groups.size());
            const auto a = own_field.get(p), b = enemy_field.get(p);
            if (a != distance_field::unreachable) od = std::min<int>(od, a);
            if (b != distance_field::unreachable) ed = std::min<int>(ed, b);
        }
        G.own_dist = od;
        G.enemy_dist = ed;
        // KratosMessi farms its own half (97% of captures) plus contested middle groups.
        G.own_side = od <= ed + 3;
        groups.push_back(std::move(G));
    }

    altars = cambc::map::altars().positions();
    altar_field.resize(altars.size());
    for (std::size_t i = 0; i < altars.size(); ++i) {
        bitboard ring;
        ring.draw_chebyshev(altars[i], 1);
        ring &= ~static_blocked;
        altar_field[i].compute(static_blocked, ring, visited);
    }
    last_hp = me.health();
}

int Bot::altar_dist(vec2 p, int* which) const {
    int best = 1 << 20, bi = -1;
    for (std::size_t i = 0; i < altars.size(); ++i) {
        const auto d = altar_field[i].get(p);
        if (d == distance_field::unreachable) continue;
        int dd = d;
        // avoid altars visibly locked by the enemy
        if (cambc::map::is_in_bounds(altars[i])) {
            try {
                if (cambc::vision::has_altar_lock(altars[i]) && cambc::vision::altar_lock_at(altars[i]).is_enemy()) dd += 30;
            } catch (...) {}
        }
        if (dd < best) { best = dd; bi = static_cast<int>(i); }
    }
    if (which) *which = bi;
    return best;
}

void Bot::write_claim(int group, bool capturing) {
    std::uint8_t v = group < 0 ? 0 : static_cast<std::uint8_t>((group + 1) & 0x7f);
    if (capturing && group >= 0) v |= 0x80;
    try { cambc::shared_memory[static_cast<std::size_t>(slot)] = v; } catch (...) {}
}

int Bot::claim_of(int other, bool* capturing) const {
    std::uint8_t v = 0;
    try { v = cambc::shared_memory[static_cast<std::size_t>(other)]; } catch (...) { return -1; }
    if (capturing) *capturing = (v & 0x80) != 0;
    return static_cast<int>(v & 0x7f) - 1;
}

void Bot::update_knowledge() {
    auto& me = cambc::self();
    const vec2 pos = me.position();
    const int round = static_cast<int>(cambc::round_number());
    const bitboard visible = cambc::vision::visible_tiles();
    for (auto& g : groups) {
        bool near = false, vis = false;
        for (auto c : g.cells) {
            if (cheb(c, pos) <= 10) near = true;
            if (visible.is_set(c)) vis = true;
        }
        if (!near || !vis) {
            if (g.known == Known::respawning && round >= g.respawn_at) g.known = Known::alive;
            continue;
        }
        try {
            const auto st = g.handle.state();
            if (std::holds_alternative<cambc::map::camp_group_alive>(st)) g.known = Known::alive;
            else if (std::holds_alternative<cambc::map::camp_group_reward_available>(st)) g.known = Known::reward;
            else {
                g.known = Known::respawning;
                g.respawn_at = round + std::get<cambc::map::camp_group_respawning>(st).timer;
            }
            g.seen_round = round;
        } catch (...) {}
    }
}

void Bot::shop() {
    auto& me = cambc::self();
    using I = cambc::item_type;
    const bool caster = type == cambc::champion_type::cassi;
    const std::array<BuildStep, 5> build{{
        {caster ? I::monster_shard_of_focus : I::monster_shard_of_strength, 5},
        {I::jungle_shard_of_health, 5},
        {I::power_shard_of_strength, 5},
        {I::durability_shard_of_health, 5},
        {I::power_shard_of_strength, 1000},
    }};
    const auto emblem_of = [](I s) -> I {
        if (s == I::monster_shard_of_focus) return I::monster_emblem_of_focus;
        if (s == I::monster_shard_of_strength) return I::monster_emblem_of_strength;
        if (s == I::jungle_shard_of_health) return I::jungle_emblem_of_health;
        if (s == I::power_shard_of_strength) return I::power_emblem_of_strength;
        return I::durability_emblem_of_health;
    };
    for (int guard = 0; guard < 8; ++guard) {
        const auto counts = me.item_count();
        int gold = static_cast<int>(me.gold_count());
        bool bought = false;
        for (const auto& step : build) {
            const int owned = static_cast<int>(counts[step.item]) + 5 * static_cast<int>(counts[emblem_of(step.item)]);
            int target = step.target;
            if (step.item == I::power_shard_of_strength && step.target == 1000) target = 1000;
            else if (step.item == I::power_shard_of_strength) target = 5;
            if (owned >= target) continue;
            const int cost = static_cast<int>(step.item.cost());
            int n = std::min(target - owned, gold / std::max(1, cost));
            if (n <= 0) break;
            if (!me.can_buy(step.item, static_cast<std::uint32_t>(n))) break;
            me.buy(step.item, static_cast<std::uint32_t>(n));
            bought = true;
            break;
        }
        if (!bought) break;
    }
    // one altar lock with the change (10 gold), as KratosMessi does
    try {
        const auto lock = cambc::consumable_type::altar_lock;
        if (me.consumables()[lock].count() == 0 && me.can_buy(lock)) me.buy(lock);
    } catch (...) {}
}

bool Bot::try_altar_lock() {
    auto& me = cambc::self();
    try {
        const auto& lock = me.consumables()[cambc::consumable_type::altar_lock];
        if (lock.count() == 0) return false;
        for (const auto& e : cambc::vision::champions(team::enemy)) {
            if (!e.is_alive() || !e.is_submitting_gems()) continue;
            for (auto a : altars) {
                if (cheb(a, e.position()) > 1 || cheb(a, me.position()) > 2) continue;
                if (cambc::vision::has_altar_lock(a)) continue;
                if (lock.use(a)) return true;
            }
        }
    } catch (...) {}
    return false;
}

void Bot::cast_on_enemy(const cambc::champion& enemy) {
    auto& me = cambc::self();
    if (!me.can_cast()) return;
    auto ab = me.abilities();
    const int d = cheb(me.position(), enemy.position());
    try {
        switch (type) {
        case cambc::champion_type::cassi:
            if (d <= 4 && ab[1].is_ready()) { ab[1].use(enemy); return; }   // stun first
            if (d <= 4 && ab[0].is_ready()) { ab[0].use(enemy); return; }   // then 2x focus damage
            break;
        case cambc::champion_type::tavi:
            if (d <= 4 && ab[1].is_ready()) { ab[1].use(enemy); return; }
            break;
        case cambc::champion_type::ryth:
            if (d <= 4 && ab[0].is_ready()) { ab[0].use(enemy.position()); return; }
            break;
        case cambc::champion_type::varg:
            if (ab[1].is_ready() && me.health() < 0.9f * me.max_health()) { ab[1].use(); return; }
            break;
        case cambc::champion_type::marcella:
            if (d <= 4 && ab[1].is_ready()) { ab[1].use(enemy); return; }
            break;
        case cambc::champion_type::ren:
            if (d <= 4 && ab[0].is_ready()) { ab[0].use(enemy); return; }
            break;
        case cambc::champion_type::stellar:
        case cambc::champion_type::prism:
            if (d <= 4 && ab[0].is_ready()) { ab[0].use(enemy); return; }
            break;
        default: break;
        }
    } catch (...) {}
}

// Attack `target` then reuse an attack reset for a second hit (KratosMessi always resets right after a hit).
template <class T>
static bool hit_with_reset(const T& target) {
    auto& me = cambc::self();
    bool hit = false;
    try {
        if (me.can_attack() && target.is_visible() && me.attack_tiles().is_set(target.position())) {
            me.attack(target);
            hit = true;
            if (me.can_cast()) {
                auto ab = me.abilities();
                for (auto& a : ab) {
                    if (a.is_attack_reset() && a.is_ready()) {
                        a.use();
                        if (target.is_visible() && target.health() > 0 && me.can_attack()) me.attack(target);
                        break;
                    }
                }
            }
        }
    } catch (...) {}
    return hit;
}

// Varg pops the 2.5x focus shield whenever it is hurt (<90%) and either still taking damage or an
// enemy champion is close (replays: ~5 casts / 100 rounds, mostly while walking between camps).
void Bot::varg_shield() {
    auto& me = cambc::self();
    if (type != cambc::champion_type::varg || !me.can_cast()) return;
    if (me.health() >= 0.9f * me.max_health()) return;
    auto ab = me.abilities();
    if (!ab[1].is_ready()) return;
    bool danger = me.health() < last_hp - 0.5f;
    if (!danger) {
        for (const auto& e : cambc::vision::champions(team::enemy))
            if (e.is_alive() && cheb(e.position(), me.position()) <= 5) { danger = true; break; }
    }
    if (danger) { try { ab[1].use(); } catch (...) {} }
}

// Step to the neighbour that is furthest from living camps (camps never chase), preferring home.
bool Bot::escape_camps(const std::vector<cambc::camp>& camps) {
    auto& me = cambc::self();
    if (!me.can_move()) return false;
    bitboard blocked = static_blocked | cambc::vision::champion_tiles() | cambc::vision::camp_tiles();
    blocked.set(me.position(), false);
    vec2 best = me.position();
    int best_score = 1 << 30;
    for (auto t : blocked.reachable_tiles(me.position(), 1).positions()) {
        int md = 99;
        for (const auto& c : camps) if (c.health() > 0) md = std::min(md, cheb(t, c.position()));
        const auto f = own_field.get(t);
        const int score = (f == distance_field::unreachable ? 9999 : f) - 10 * std::min(md, 4);
        if (score < best_score) { best_score = score; best = t; }
    }
    if (best != me.position()) {
        try { return me.move_absolute(best); } catch (...) {}
    }
    return false;
}

bool Bot::flee() {
    auto& me = cambc::self();
    if (!me.can_move()) return false;
    const auto enemies = cambc::vision::champions(team::enemy);
    bitboard blocked = static_blocked | cambc::vision::champion_tiles() | cambc::vision::camp_tiles();
    blocked.set(me.position(), false);
    vec2 best = me.position();
    int best_score = 1 << 30;
    for (auto t : blocked.reachable_tiles(me.position(), 1).positions()) {
        int md = 99;
        for (const auto& e : enemies) if (e.is_alive()) md = std::min(md, cheb(t, e.position()));
        const auto f = own_field.get(t);
        const int score = (f == distance_field::unreachable ? 9999 : f) - 3 * std::min(md, 6);
        if (score < best_score) { best_score = score; best = t; }
    }
    if (best != me.position()) {
        try { return me.move_absolute(best); } catch (...) {}
    }
    return false;
}

bool Bot::recall_safely(vec2 pos) {
    auto& me = cambc::self();
    // A camp that is still hitting us would cancel the recall. KratosMessi finishes a camp
    // that is almost dead, otherwise walks out of reach of fighting camps and recalls once safe
    // (only 4% of its recalls get interrupted).
    const auto camps = cambc::vision::camps();
    const bitboard reach = me.attack_tiles();
    for (const auto& c : camps) {
        if (c.health() > 0 && c.health() <= 2.2f * me.strength() && reach.is_set(c.position()) &&
            !c.is_gem_cluster() && !c.is_gold_cluster()) {
            hit_with_reset(c);
            return true;
        }
    }
    bool camp_near = false;
    for (const auto& c : camps)
        if (c.health() > 0 && (c.is_wolf() || c.is_elk() || c.is_monolith()) && cheb(c.position(), pos) <= 3 &&
            (c.health() < c.max_health() || me.health() < last_hp - 0.5f))
            camp_near = true;
    if (camp_near) {
        escape_camps(camps);
        return true;
    }
    me.recall();
    return true;
}

bool Bot::fight() {
    auto& me = cambc::self();
    const vec2 pos = me.position();
    const bool low = me.health() < kRecallHp * me.max_health();
    std::vector<cambc::champion> enemies;
    for (auto& e : cambc::vision::champions(team::enemy))
        if (e.is_alive()) enemies.push_back(e);
    const bool spawn = at_spawn();

    if (enemies.empty()) {
        if (low && !spawn) return recall_safely(pos);
        return false;
    }
    // closest enemy, ties -> lowest health
    std::sort(enemies.begin(), enemies.end(), [&](const auto& a, const auto& b) {
        const int da = cheb(a.position(), pos), db = cheb(b.position(), pos);
        if (da != db) return da < db;
        return a.health() < b.health();
    });
    const auto& closest = enemies.front();
    const int dmin = cheb(closest.position(), pos);
    const int range = me.attack_range();

    if (dmin <= range) {
        cast_on_enemy(closest);
        hit_with_reset(closest);
        if (low && melee && me.can_move()) flee();
        return true;
    }
    if (low) {
        if (spawn) return true;   // stay and heal
        if (dmin <= 4) { flee(); return true; }
        return recall_safely(pos);
    }
    // ranged casters can reach 4 with their spells
    if (dmin <= 4 && (type == cambc::champion_type::cassi || type == cambc::champion_type::tavi)) {
        auto ab = me.abilities();
        const int s = type == cambc::champion_type::cassi ? (ab[1].is_ready() ? 1 : 0) : 1;
        if (ab[s].is_ready()) {
            cast_on_enemy(closest);
            return true;
        }
    }
    // melee steps in from distance 2 (move + attack in the same turn)
    if (melee && dmin == 2 && me.health() >= kFleeHp * me.max_health() && me.can_move()) {
        bitboard blocked = static_blocked | cambc::vision::champion_tiles() | cambc::vision::camp_tiles();
        blocked.set(pos, false);
        for (auto t : blocked.reachable_tiles(pos, 1).positions()) {
            if (t != pos && cheb(t, closest.position()) <= 1) {
                try {
                    if (me.move_absolute(t)) {
                        cast_on_enemy(closest);
                        hit_with_reset(closest);
                        return true;
                    }
                } catch (...) {}
            }
        }
    }
    return false;
}

int Bot::group_eta(const Group& g, const distance_field& f) const {
    int d = 1 << 20;
    for (auto c : g.cells) {
        const auto v = f.get(c);
        if (v != distance_field::unreachable) d = std::min<int>(d, v);
    }
    if (d >= (1 << 20)) return d;
    const int round = static_cast<int>(cambc::round_number());
    if (g.known == Known::respawning) d = std::max(d, g.respawn_at - round);
    return d;
}

void Bot::select_target() {
    auto& me = cambc::self();
    need_reselect = false;
    distance_field f;
    bitboard visited, roots;
    roots.set(me.position(), true);
    bitboard walls = static_blocked;
    walls.set(me.position(), false);
    f.compute(walls, roots, visited, 160);

    std::array<int, 8> claims{};
    std::array<bool, 8> capt{};
    for (int i = 0; i < std::min(n_allies, 8); ++i) {
        claims[static_cast<std::size_t>(i)] = i == slot ? -1 : claim_of(i, &capt[static_cast<std::size_t>(i)]);
    }
    int best = -1;
    double best_score = 1e18;
    int best_eta = 1 << 20;
    for (std::size_t gi = 0; gi < groups.size(); ++gi) {
        const auto& g = groups[gi];
        if (g.monolith || g.gold_only || !g.own_side) continue;
        int eta = group_eta(g, f);
        if (eta >= (1 << 20)) continue;
        double pen = 0;
        bool skip = false;
        int claimers = 0;
        for (int i = 0; i < std::min(n_allies, 8); ++i) {
            if (claims[static_cast<std::size_t>(i)] != static_cast<int>(gi)) continue;
            if (capt[static_cast<std::size_t>(i)]) skip = true;
            else ++claimers;
        }
        // KratosMessi lets 2 champions share an elk / big pack (half of its elk engagements have an
        // ally on the camp) but spreads out on small camps: allies only repel above the group's capacity.
        if (claimers > 0) pen = claimers >= g.capacity ? 12.0 * (claimers - g.capacity + 1) : 3.0 * claimers;
        if (skip) continue;
        const double score = eta + pen - 0.08 * g.gems;
        if (score < best_score) { best_score = score; best = static_cast<int>(gi); best_eta = eta; }
    }
    target = best;
    target_since = static_cast<int>(cambc::round_number());
    write_claim(target, false);

    // tribute decision (taken at decision points, i.e. after a capture / when retargeting)
    const int gems = static_cast<int>(me.gem_count());
    mode = Mode::farm;
    if (gems > 0) {
        int which = -1;
        const int ad = altar_dist(me.position(), &which);
        if (which >= 0 &&
            (gems >= kTributeGems || ad <= kTributeNearAltar || best < 0 || ad <= best_eta ||
             (gems >= 30 && ad <= best_eta + 12)))
            mode = Mode::tribute;
    }
    if (mode == Mode::farm && best < 0) mode = Mode::idle;
}

bool Bot::move_to_goals(const bitboard& goals_in, bool allow_dash) {
    auto& me = cambc::self();
    if (!me.can_move()) return false;
    const vec2 pos = me.position();
    if (goals_in.is_set(pos)) return false;
    const bitboard camps = cambc::vision::camp_tiles();
    bitboard blocked = static_blocked | cambc::vision::champion_tiles() | camps | cambc::vision::teleport_tiles();
    blocked.set(pos, false);
    bitboard goals = goals_in;
    goals &= ~blocked | camps;
    if (goals.is_empty()) return false;
    const bitboard path_walls = blocked & ~goals;
    distance_field field;
    bitboard visited, dest;
    dest.set(pos, true);
    field.compute_to(path_walls, goals, dest, visited);
    const auto here = field.get(pos);
    if (here == distance_field::unreachable) {
        // fall back on static terrain only (hidden or moving blockers)
        return me.move_towards(goals.positions()[0]);
    }
    vec2 cur = pos;
    // Issac / Vendetta (and anyone with a dash) dash along the path while travelling
    if (allow_dash && here >= 3 && me.can_cast()) {
        auto ab = me.abilities();
        for (auto& a : ab) {
            if (!a.is_dash() || !a.is_ready()) continue;
            try {
                bitboard cand = a.valid_tiles();
                cand &= ~blocked;
                vec2 bt = pos;
                auto bd = here;
                for (auto t : cand.positions()) {
                    const auto v = field.get(t);
                    if (v < bd) { bd = v; bt = t; }
                }
                if (bt != pos && bd + 2 <= here && a.use(bt)) cur = me.position();
            } catch (...) {}
            break;
        }
    }
    if (!me.can_move()) return cur != pos;
    blocked.set(pos, false);
    blocked.set(cur, false);
    vec2 step = cur;
    auto sd = field.get(cur);
    for (auto t : blocked.reachable_tiles(cur, 1).positions()) {
        const auto v = field.get(t);
        if (v < sd) { sd = v; step = t; }
    }
    if (step != cur) {
        try { return me.move_absolute(step) || cur != pos; } catch (...) {}
    }
    return cur != pos;
}

bool Bot::attack_camp_in_range(int group_only) {
    auto& me = cambc::self();
    if (!me.can_attack() && !me.can_cast()) return false;
    const auto camps = cambc::vision::camps();
    const bitboard reach = me.attack_tiles();
    const cambc::camp* best = nullptr;
    for (const auto& c : camps) {
        if (c.health() <= 0) continue;
        const vec2 sp = c.spawn_position();
        const int g = cell_group[static_cast<std::size_t>(sp.y * W + sp.x)];
        if (g < 0 || groups[static_cast<std::size_t>(g)].monolith) continue;
        if (group_only >= 0 && g != group_only) continue;
        if (!reach.is_set(c.position())) continue;
        if (!best || c.health() < best->health()) best = &c;
    }
    if (!best) return false;
    // spells on camps: Cassi damage, Tavi damage+stun, Ryth area stun on packed camps, Varg shield when hit
    bool cast = false;
    if (me.can_cast()) {
        auto ab = me.abilities();
        try {
            const int d = cheb(me.position(), best->position());
            if (type == cambc::champion_type::cassi && ab[0].is_ready() && d <= 4) cast = ab[0].use(*best);
            else if (type == cambc::champion_type::tavi && ab[1].is_ready() && d <= 4 && best->health() > 150) cast = ab[1].use(*best);
            else if (type == cambc::champion_type::ryth && ab[0].is_ready() && d <= 4) {
                int packed = 0;
                for (const auto& c : camps) if (c.health() > 0 && cheb(c.position(), best->position()) <= 1) ++packed;
                if (packed >= 2) cast = ab[0].use(best->position());
            } else if (type == cambc::champion_type::varg && ab[1].is_ready() && me.health() < 0.9f * me.max_health() &&
                       me.health() < last_hp) cast = (ab[1].use(), true);
        } catch (...) {}
    }
    if (cast) {
        try { if (me.can_attack() && best->is_visible() && best->health() > 0) me.attack(*best); } catch (...) {}
        return true;
    }
    hit_with_reset(*best);
    return true;
}

bool Bot::do_tribute() {
    auto& me = cambc::self();
    if (me.gem_count() == 0) { mode = Mode::farm; need_reselect = true; return false; }
    int which = -1;
    altar_dist(me.position(), &which);
    if (which < 0) { mode = Mode::farm; return false; }
    const vec2 a = altars[static_cast<std::size_t>(which)];
    if (cheb(a, me.position()) <= 1) {
        try { me.submit_gems(a); was_submitting = true; return true; } catch (...) {}
    }
    bitboard ring;
    ring.draw_chebyshev(a, 1);
    ring &= ~static_blocked;
    move_to_goals(ring, true);
    // a fresh step may have brought us next to the altar
    if (cheb(a, me.position()) <= 1) {
        try { me.submit_gems(a); was_submitting = true; } catch (...) {}
    }
    return true;
}

bool Bot::do_farm() {
    auto& me = cambc::self();
    if (target < 0) return false;
    auto& g = groups[static_cast<std::size_t>(target)];
    const vec2 pos = me.position();
    const int round = static_cast<int>(cambc::round_number());

    if (g.known == Known::alive) {
        if (attack_camp_in_range(target)) return true;
        bitboard goals;
        for (auto c : g.cells) goals.set(c, true);
        move_to_goals(goals, true);
        attack_camp_in_range(target);
        return true;
    }
    if (g.known == Known::reward) {
        // someone else (an ally) already capturing -> leave it to them
        for (int i = 0; i < std::min(n_allies, 8); ++i) {
            if (i == slot) continue;
            bool cap = false;
            if (claim_of(i, &cap) == target && cap) { need_reselect = true; return false; }
        }
        bool on = false;
        for (auto c : g.cells) if (c == pos) on = true;
        if (on) {
            write_claim(target, true);
            // KratosMessi starts the recall while standing on the capture tile when hurt and the
            // reward will buy an emblem: the capture (5 rounds) lands before the recall (5 turns).
            const float hpf = me.health() / me.max_health();
            if (!at_spawn() && ((hpf < 0.55f && static_cast<int>(me.gold_count()) + g.gold >= kShopGold) || hpf < kRecallHp)) {
                me.recall();
                was_recalling = true;
            }
            return true;
        }
        bitboard goals;
        for (auto c : g.cells) goals.set(c, true);
        goals &= ~cambc::vision::champion_tiles();
        if (goals.is_empty()) { need_reselect = true; return false; }
        move_to_goals(goals, true);
        for (auto c : g.cells) if (c == me.position()) write_claim(target, true);
        return true;
    }
    // respawning: walk there and wait if it is the best option, otherwise retarget
    if (g.respawn_at - round > 60) { need_reselect = true; return false; }
    bitboard goals;
    for (auto c : g.cells) {
        bitboard r;
        r.draw_chebyshev(c, 1);
        goals |= r;
    }
    goals &= ~static_blocked;
    for (auto c : g.cells) goals.set(c, false);
    move_to_goals(goals, true);
    return true;
}

void Bot::play_turn() {
    auto& me = cambc::self();
    if (!init_done) init();
    const int round = static_cast<int>(cambc::round_number());

    if (!me.is_alive()) {
        write_claim(-1, false);
        shop();
        target = -1;
        mode = Mode::farm;
        need_reselect = true;
        was_submitting = was_recalling = false;
        last_gems = 0;
        last_hp = me.max_health();
        return;
    }
    update_knowledge();
    const int gems = static_cast<int>(me.gem_count());

    if (me.is_submitting_gems()) { was_submitting = true; last_hp = me.health(); return; }
    if (was_submitting) {
        was_submitting = false;
        if (me.gem_count() == 0) {
            mode = Mode::farm;
            need_reselect = true;
            if (me.gold_count() >= static_cast<unsigned>(kShopGold) && !at_spawn()) {
                // far from home: recall (81% of KM's cases >= 20 tiles away); close: walk home
                const auto hd = own_field.get(me.position());
                if (hd != distance_field::unreachable && hd >= 14) {
                    me.recall();
                    was_recalling = true;
                    last_hp = me.health();
                    return;
                }
                going_home = true;
            }
        }
    }
    if (me.is_recalling()) { was_recalling = true; last_hp = me.health(); return; }
    if (was_recalling) { was_recalling = false; need_reselect = true; }

    const bool spawn = at_spawn();
    if (spawn) { shop(); going_home = false; }
    // gained gems (capture or kill) -> decision point
    if (gems > last_gems) need_reselect = true;
    last_gems = gems;

    try_altar_lock();
    varg_shield();
    if (fight()) { last_hp = me.health(); return; }

    // heal up on spawn before leaving
    if (spawn && me.health() < 0.95f * me.max_health()) { last_hp = me.health(); return; }

    if (going_home && !spawn) {
        move_to_goals(cambc::map::spawn_region(team::ally), true);
        last_hp = me.health();
        return;
    }
    // retarget when the current target is gone
    if (target >= 0) {
        const auto& g = groups[static_cast<std::size_t>(target)];
        if (g.known == Known::respawning && g.respawn_at - round > 25) need_reselect = true;
        if (round - target_since > 150) need_reselect = true;
    } else need_reselect = true;
    if (need_reselect) select_target();

    if (mode == Mode::tribute && gems > 0) {
        do_tribute();
        last_hp = me.health();
        return;
    }
    if (mode == Mode::idle || target < 0) {
        // nothing worth farming on our side: bank what we carry, otherwise go home
        if (gems > 0) { mode = Mode::tribute; do_tribute(); }
        else if (!spawn && round % 10 == 0) need_reselect = true;
        last_hp = me.health();
        return;
    }
    if (!do_farm() && need_reselect) {
        select_target();
        if (mode == Mode::tribute && gems > 0) do_tribute();
        else do_farm();
    }
    last_hp = me.health();
}
