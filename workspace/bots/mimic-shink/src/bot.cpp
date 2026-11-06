// mimic-shink: reproduces SHINK AI 6500's generalised play style.
//
// Style summary (see analysis/shink/STYLE.md):
//  * every champion farms on its own: targets are camp groups scored by
//    gems * (elk ? ELK_FACTOR : 1) / (path distance + remaining hp / 200 + 6); gold-only groups and
//    monoliths are ignored; groups already claimed by enough allies (shared memory) are skipped and only
//    one champion stands on a dead group to capture it (rewards would be split).
//  * bank after almost every capture (tribute when carrying >= 25 gems, or when the altar is closer
//    than the next camp), at the nearest altar.
//  * recall when hp < 45% (walking out of camp / enemy range first) or when gold (including the reward
//    of the capture in progress) reaches one emblem (150g); gold recalls are started while standing on
//    the capture tile so the recall channel overlaps the 5-round capture timer; close to spawn it walks.
//  * build: Jungle emblem of Strength > Durability emblem of Strength > Bruiser emblem of Health >
//    Power Strength shards forever (Cassi buys Jungle Focus shards only).
//  * fights: an enemy champion in attack range is hit first (lowest hp); weakened enemies (< 40% hp)
//    within 6 tiles are chased while healthy; flee when low.
//  * abilities: dashes for travel, attack resets right after a basic attack, damage/stun/aoe spells on
//    the camp being farmed, Varg shield while trading.
//  * no wards, no altar locks, no consumables, no priority changes.
#include <cambc.h>
#include "bot.h"
#include <algorithm>
#include <array>
#include <cmath>
#include <cstdint>
#include <iostream>
#include <memory>
#include <optional>
#include <variant>
#include <vector>

// #define SHINK_DEBUG 1
// #define SHINK_PROF 1

using cambc::bitboard;
using cambc::champion;
using cambc::champion_type;
using cambc::distance_field;
using cambc::team;
using cambc::vec2;

namespace {

// ---- tunables (fitted to SHINK replays) ----
constexpr float RECALL_HP = 0.45f;         // recall below this hp fraction
constexpr float CAPTURE_RECALL_HP = 0.50f; // recall during a capture below this
constexpr int EMBLEM_GOLD = 150;           // recall to shop once this much gold is available
constexpr int TRIBUTE_GEMS = 25;           // always bank at this many carried gems
constexpr float ELK_FACTOR = 0.8f;         // elk groups are discounted
constexpr float ENEMY_HALF_FACTOR = 0.8f;  // groups nearer the enemy spawn are discounted
constexpr int GOLD_RECALL_MIN_DIST = 10;   // closer than this to spawn: walk back to shop instead
constexpr float HP_PER_ROUND = 200.f;      // group hp -> rounds in the score denominator
constexpr float SCORE_C = 6.f;             // constant in the score denominator
constexpr int RESPAWN_WAIT = 12;           // willing to wait this long next to a respawning group
constexpr int CHASE_RADIUS = 6;            // pursue weakened enemies this close
constexpr float CHASE_FOE_HP = 0.4f;       // ... below this hp fraction
constexpr float CHASE_MIN_HP = 0.4f;       // ... while we are above this
constexpr int CASSI_ESCAPE_RADIUS = 6;    // Cassi recalls / backs off from enemies this close when alone
constexpr int FLEE_RADIUS = 4;             // enemies this close stop a recall; walk away instead

int cheb(vec2 a, vec2 b) { return static_cast<int>(a.chebyshev_distance(b)); }

const std::array<vec2, 8> DIRS{vec2{0, 1}, vec2{1, 1}, vec2{1, 0}, vec2{1, -1}, vec2{0, -1}, vec2{-1, -1}, vec2{-1, 0}, vec2{-1, 1}};

struct Group {
    cambc::map::camp_group g;
    std::uint32_t handle = 0;
    bitboard tiles;
    std::vector<vec2> tile_list;
    vec2 center{};
    int gems = 0, gold = 0, hp_total = 0, n_elk = 0, n_mono = 0, n_camps = 0, n_wolf = 0, respawn = 0, capacity = 1;
    bool enemy_side = false;
    // knowledge (this champion's own vision only)
    int known = 0;      // 0 assumed alive, 1 seen alive, 2 seen dead with reward, 3 respawning
    int respawn_at = 0; // round at which a respawning group is back
    int hp_now = 0;
    int last_seen = -1;
    std::unique_ptr<distance_field> field; // distance to the group's spawn tiles (static terrain)
    explicit Group(cambc::map::camp_group grp) : g(std::move(grp)) {}
};

struct State {
    bool init = false;
    int W = 0, H = 0;
    std::vector<Group> groups;
    std::vector<std::int16_t> tile_group; // linear index -> group index (-1 none)
    bitboard static_walls;
    distance_field altar_field, spawn_field;
    std::vector<vec2> altars;
    vec2 enemy_spawn_c{}, ally_spawn_c{};
    int my_slot = 0, issac_slot = -1;
    champion_type type{};
    bool ranged = false;
    int range = 1;
    int target = -1;      // group index
    int last_decide = -100;
    int capture_turns = 0; // consecutive turns standing on a dead target's tile
    int last_gems = 0;
    int stuck = 0;
    vec2 last_pos{};
};
State S;

// ---- per-turn cache ----
struct CampView { cambc::camp c; vec2 pos; vec2 spawn; float hp; float str; int group; };
struct Foe { champion c; vec2 pos; float hp; float hpf; };
struct Turn {
    int round = 0;
    std::vector<std::uint8_t> vis;
    std::vector<CampView> camps;
    std::vector<Foe> foes;
    bitboard blocked;
    bool blocked_ok = false;
    float camp_dmg_factor = 1.f;
};
Turn T;

int lin(vec2 p) { return p.y * S.W + p.x; }
// The linear export is bit-packed row-major (tile i -> byte i/8, bit i%8).
bool vis_at(vec2 p) { const int i = lin(p); return (T.vis[static_cast<std::size_t>(i >> 3)] >> (i & 7)) & 1; }

float unit_hp(cambc::camp_type t) {
    switch (t) {
        case cambc::camp_type::wolf: return 1350.f;
        case cambc::camp_type::elk: return 2400.f;
        case cambc::camp_type::monolith: return 20000.f;
        default: return 500.f;
    }
}

const bitboard& blocked() {
    if (!T.blocked_ok) {
        T.blocked = S.static_walls | cambc::vision::champion_tiles() | cambc::vision::camp_tiles() | cambc::vision::teleport_tiles();
        T.blocked.set(cambc::self().position(), false);
        T.blocked_ok = true;
    }
    return T.blocked;
}

distance_field& group_field(Group& G);

void init() {
    auto& me = cambc::self();
    S.W = cambc::map::width();
    S.H = cambc::map::height();
    S.type = me.champion_name();
    S.range = me.attack_range();
    S.ranged = S.range > 1;
    S.static_walls = cambc::map::walls() | cambc::map::holes() | cambc::map::altars() | cambc::map::spawn_region(team::enemy);
    const auto allies = cambc::champions(team::ally);
    for (std::size_t i = 0; i < allies.size(); ++i) {
        if (allies[i] == me) S.my_slot = static_cast<int>(i);
        if (allies[i].champion_name() == champion_type::issac) S.issac_slot = static_cast<int>(i);
    }
    {
        const auto es = cambc::map::spawn_region(team::enemy).positions();
        const auto os = cambc::map::spawn_region(team::ally).positions();
        if (!es.empty()) S.enemy_spawn_c = es[es.size() / 2];
        if (!os.empty()) S.ally_spawn_c = os[os.size() / 2];
    }
    bitboard visited;
    bitboard roots;
    roots.clear();
    for (auto a : cambc::map::altars().positions()) {
        S.altars.push_back(a);
        roots.draw_chebyshev(a, static_cast<float>(cambc::constants::submit_gems_range));
    }
    roots &= ~S.static_walls;
    S.altar_field.compute(S.static_walls, roots, visited);
    S.spawn_field.compute(S.static_walls & ~cambc::map::spawn_region(team::ally), cambc::map::spawn_region(team::ally), visited);
    S.tile_group.assign(static_cast<std::size_t>(S.W * S.H), -1);
    for (auto& grp : cambc::map::camp_groups()) {
        Group G(grp);
        G.handle = static_cast<std::uint32_t>(static_cast<cambc::handle_camp_group_t>(G.g));
        G.tiles = G.g.spawn_tiles();
        G.gems = static_cast<int>(G.g.gem_value());
        G.gold = static_cast<int>(G.g.gold_value());
        G.respawn = G.g.max_respawn_timer();
        long sx = 0, sy = 0;
        for (const auto& c : G.g.camps()) {
            const vec2 p = c.spawn_position();
            G.tile_list.push_back(p);
            S.tile_group[static_cast<std::size_t>(lin(p))] = static_cast<std::int16_t>(S.groups.size());
            sx += p.x; sy += p.y; ++G.n_camps;
            G.hp_total += static_cast<int>(unit_hp(c.kind()));
            if (c.kind() == cambc::camp_type::elk) ++G.n_elk;
            if (c.kind() == cambc::camp_type::wolf) ++G.n_wolf;
            if (c.kind() == cambc::camp_type::monolith) ++G.n_mono;
        }
        if (G.n_camps) G.center = {static_cast<int>(sx / G.n_camps), static_cast<int>(sy / G.n_camps)};
        G.hp_now = G.hp_total;
        G.enemy_side = cheb(G.center, S.enemy_spawn_c) < cheb(G.center, S.ally_spawn_c);
        G.capacity = G.n_elk ? 3 : std::max(1, static_cast<int>(std::lround(G.hp_total / 1350.0)));
        S.groups.push_back(std::move(G));
    }
    S.init = true;
}

distance_field& group_field(Group& G) {
    if (!G.field) {
        G.field = std::make_unique<distance_field>();
        bitboard visited;
        G.field->compute(S.static_walls & ~G.tiles, G.tiles, visited);
    }
    return *G.field;
}

// Distance estimate without forcing a field computation (Chebyshev * 1.15 when not cached).
int group_dist(Group& G, vec2 pos, bool force) {
    if (G.field || force) return group_field(G).get(pos);
    int d = 1 << 20;
    for (auto t : G.tile_list) d = std::min(d, cheb(t, pos));
    return static_cast<int>(d * 1.15f);
}

void begin_turn() {
    T = Turn{};
    T.round = static_cast<int>(cambc::round_number());
    T.vis = cambc::vision::visible_tiles().export_linear_buffer();
    try {
        for (auto& c : cambc::vision::camps()) {
            try {
                if (!c.is_visible()) continue;
                const float hp = c.health();
                if (hp <= 0) continue;
                const vec2 sp = c.spawn_position();
                T.camps.push_back({c, c.position(), sp, hp, c.strength(), S.tile_group[static_cast<std::size_t>(lin(sp))]});
            } catch (...) {}
        }
    } catch (...) {}
    try {
        for (auto& c : cambc::vision::champions(team::enemy)) {
            try {
                if (!c.is_alive() || !c.is_visible()) continue;
                const float hp = c.health();
                T.foes.push_back({c, c.position(), hp, hp / std::max(1.f, c.max_health())});
            } catch (...) {}
        }
    } catch (...) {}
    try {
        const auto cnt = cambc::self().item_count();
        using it = cambc::item_type;
        if (cnt[it::jungle_emblem_of_strength] + cnt[it::jungle_emblem_of_health] + cnt[it::jungle_emblem_of_focus] > 0) T.camp_dmg_factor *= 0.7f;
        if (cnt[it::durability_emblem_of_strength] + cnt[it::durability_emblem_of_health] + cnt[it::durability_emblem_of_focus] > 0) T.camp_dmg_factor *= 0.9f;
    } catch (...) {}
}

void update_knowledge() {
    const int round = T.round;
    for (std::size_t gi = 0; gi < S.groups.size(); ++gi) {
        auto& G = S.groups[gi];
        bool seen = false;
        for (auto t : G.tile_list) if (vis_at(t)) { seen = true; break; }
        if (!seen) {
            if (G.known == 3 && round >= G.respawn_at) { G.known = 0; G.hp_now = G.hp_total; }
            if (G.known == 2 && round - G.last_seen > 12) { G.known = 3; G.respawn_at = G.last_seen + G.respawn; }
            continue;
        }
        std::uint32_t st = 0;
        if (cambc::detail::sdk_camp_group_state(G.handle, &st) != 0) continue;
        G.last_seen = round;
        if (st == 1) {
            G.known = 1;
            int hp = 0;
            for (const auto& c : T.camps) if (c.group == static_cast<int>(gi)) hp += static_cast<int>(c.hp);
            G.hp_now = hp > 0 ? hp : G.hp_total;
        } else if (st == 2) {
            G.known = 2; G.hp_now = 0;
        } else if (st == 3) {
            std::int32_t timer = 0;
            cambc::detail::sdk_camp_group_cooldown(G.handle, &timer);
            G.known = 3; G.respawn_at = round + timer; G.hp_now = G.hp_total;
        }
    }
}

// ---- shared memory claims: byte slot = group index + 1 ----
std::array<std::uint8_t, 8> read_claims() {
    std::array<std::uint8_t, 8> c{};
    try { cambc::shared_memory.read(0, std::span<std::uint8_t>{c}); } catch (...) {}
    return c;
}
void write_claim(int group) {
    if (S.my_slot < 0 || S.my_slot >= 8) return;
    try { cambc::shared_memory[static_cast<std::size_t>(S.my_slot)] = static_cast<std::uint8_t>(group + 1); } catch (...) {}
}

bool group_available(const Group& G, int dist) {
    if (G.n_mono || G.gems <= 0) return false;
    if (G.known == 3 && G.respawn_at > T.round + dist + RESPAWN_WAIT) return false;
    return true;
}

float my_dps() {
    auto& me = cambc::self();
    float s = me.strength() * 1.125f;
    if (S.type == champion_type::varg) s *= 1.6f;
    return std::max(10.f, s);
}

// Can we (with helpers) finish this group before dropping below ~15% hp?
bool can_solo(const Group& G, float hp, int helpers) {
    float incoming = G.n_elk * 60.f + G.n_wolf * 20.f;
    if (incoming <= 0.f) return true;
    incoming *= T.camp_dmg_factor;
    const float kill_rounds = (G.known == 2 ? 0.f : static_cast<float>(G.hp_now)) / (my_dps() * (1 + helpers));
    const float survive_rounds = (hp - 0.15f * cambc::self().max_health()) / (incoming / (1 + helpers));
    return kill_rounds <= survive_rounds;
}

float group_score(Group& G, vec2 pos, bool force) {
    const int d = group_dist(G, pos, force);
    if (d >= distance_field::unreachable) return -1.f;
    if (!group_available(G, d)) return -1.f;
    const float hp = G.known == 2 ? 0.f : static_cast<float>(G.hp_now);
    const int eff = G.known == 3 ? std::max(d, G.respawn_at - T.round) : d;
    return G.gems * (G.n_elk ? ELK_FACTOR : 1.f) / (eff + hp / HP_PER_ROUND + SCORE_C);
}

int choose_target(vec2 pos, int exclude = -1) {
    const auto claims = read_claims();
    const float hp = cambc::self().health();
    // Two passes: rank with cheap estimates, then confirm the best few with exact path distances.
    std::vector<std::pair<float, int>> cand;
    for (std::size_t i = 0; i < S.groups.size(); ++i) {
        auto& G = S.groups[i];
        if (static_cast<int>(i) == exclude) continue;
        int n_claim = 0;
        for (int s = 0; s < 8; ++s)
            if (s != S.my_slot && claims[s] == i + 1) ++n_claim;
        if (n_claim >= G.capacity) continue;
        float sc = group_score(G, pos, false);
        if (sc <= 0.f) continue;
        if (!can_solo(G, hp, n_claim)) sc *= n_claim > 0 ? 0.9f : 0.5f;
        if (G.enemy_side) sc *= ENEMY_HALF_FACTOR;
        cand.push_back({sc, static_cast<int>(i)});
    }
    if (cand.empty()) return -1;
    std::sort(cand.begin(), cand.end(), [](auto& a, auto& b) { return a.first > b.first; });
    int best = -1;
    float best_s = 0.f;
    const std::size_t n = std::min<std::size_t>(cand.size(), 4);
    for (std::size_t k = 0; k < n; ++k) {
        auto& G = S.groups[cand[k].second];
        // exact distance (at most one new field per call, fuel permitting): rescale the estimate
        const float est = cand[k].first;
        const int de = group_dist(G, pos, false);
        const bool can_compute = G.field || (k == 0 && cambc::fuel_remaining() > 40000);
        const int dx = can_compute ? group_dist(G, pos, true) : de;
        if (dx >= distance_field::unreachable) continue;
        const float hpn = G.known == 2 ? 0.f : static_cast<float>(G.hp_now);
        const float denom_e = std::max(de, G.known == 3 ? G.respawn_at - T.round : 0) + hpn / HP_PER_ROUND + SCORE_C;
        const float denom_x = std::max(dx, G.known == 3 ? G.respawn_at - T.round : 0) + hpn / HP_PER_ROUND + SCORE_C;
        const float sc = est * denom_e / denom_x;
        if (sc > best_s) { best_s = sc; best = cand[k].second; }
    }
    return best;
}

// ---- movement ----
bool try_move(vec2 t) {
    auto& me = cambc::self();
    try {
        if (me.move_absolute(t)) { T.blocked_ok = false; return true; }
    } catch (...) {}
    return false;
}

bool step_on_field(const distance_field& f, bool allow_dash) {
    auto& me = cambc::self();
    if (!me.can_move()) return false;
    const vec2 pos = me.position();
    // Dash first when it gains ground (Vendetta / Issac / Ren / Vesper).
    if (allow_dash && f.get(pos) > 2 && me.can_cast()) {
        for (const auto& ab : me.abilities()) {
            if (!ab.is_dash()) continue;
            try {
                if (!ab.is_ready()) continue;
                const auto& b = blocked();
                const auto reach = b.reachable_tiles(pos, 2) & ~cambc::map::holes() & ~b;
                vec2 best = pos;
                int bd = f.get(pos);
                for (auto t : reach.positions()) { const int v = f.get(t); if (v + 1 < bd) { bd = v; best = t; } }
                if (best != pos && ab.use(best)) { T.blocked_ok = false; break; }
            } catch (...) {}
        }
    }
    if (!me.can_move()) return true;
    const vec2 p2 = me.position();
    const int cur = f.get(p2);
    const auto& b = blocked();
    std::array<std::pair<int, vec2>, 8> opts{};
    int n = 0;
    for (auto d : DIRS) {
        const vec2 t = p2 + d;
        if (!cambc::map::is_in_bounds(t) || b.is_set(t)) continue;
        const int v = f.get(t);
        if (v == distance_field::unreachable) continue;
        if (v < cur || (v == cur && S.stuck > 0)) opts[n++] = {v, t};
    }
    std::sort(opts.begin(), opts.begin() + n, [](auto& a, auto& c) { return a.first < c.first; });
    for (int i = 0; i < n; ++i) if (try_move(opts[i].second)) return true;
    return false;
}

bool step_away_from(vec2 threat) {
    auto& me = cambc::self();
    if (!me.can_move()) return false;
    const vec2 pos = me.position();
    const auto& b = blocked();
    vec2 best = pos;
    int bs = -1000000;
    for (auto d : DIRS) {
        const vec2 t = pos + d;
        if (!cambc::map::is_in_bounds(t) || b.is_set(t)) continue;
        const int sd = S.spawn_field.get(t);
        if (sd == distance_field::unreachable) continue;
        const int sc = cheb(t, threat) * 3 - sd;
        if (sc > bs) { bs = sc; best = t; }
    }
    if (best == pos) return false;
    return try_move(best);
}

// Occupied spawn tiles delay a group's respawn: move off any tile of a group that is not capturable.
void step_off_camp_tiles() {
    auto& me = cambc::self();
    if (!me.can_move()) return;
    const vec2 pos = me.position();
    const int on = S.tile_group[static_cast<std::size_t>(lin(pos))];
    if (on < 0 || S.groups[on].known == 2) return;
    const auto& b = blocked();
    for (auto d : DIRS) {
        const vec2 t = pos + d;
        if (!cambc::map::is_in_bounds(t) || b.is_set(t)) continue;
        if (S.tile_group[static_cast<std::size_t>(lin(t))] >= 0) continue;
        if (try_move(t)) return;
    }
}

// ---- shopping ----
void shop() {
    auto& me = cambc::self();
    using cambc::item_type;
    try {
        for (int guard = 0; guard < 40; ++guard) {
            if (me.gold_count() < 30) return;
            const auto cnt = me.item_count();
            auto n = [&](item_type shard, item_type emblem) {
                return static_cast<int>(cnt[shard]) + 5 * static_cast<int>(cnt[emblem]);
            };
            item_type next;
            if (S.type == champion_type::cassi) {
                next = item_type::jungle_shard_of_focus;
            } else if (n(item_type::jungle_shard_of_strength, item_type::jungle_emblem_of_strength) < 5) {
                next = item_type::jungle_shard_of_strength;
            } else if (n(item_type::durability_shard_of_strength, item_type::durability_emblem_of_strength) < 5) {
                next = item_type::durability_shard_of_strength;
            } else if (n(item_type::bruiser_shard_of_health, item_type::bruiser_emblem_of_health) < 5) {
                next = item_type::bruiser_shard_of_health;
            } else {
                next = item_type::power_shard_of_strength;
            }
            if (!me.can_buy(next, 1)) return;
            me.buy(next, 1);
        }
    } catch (...) {}
}

// ---- combat helpers ----
// Cast the first ready offensive spell (damage / cc / aoe) at a target; returns true if cast.
template <class Target>
bool cast_offensive(const Target& target, vec2 tpos, bool is_camp) {
    auto& me = cambc::self();
    if (!me.can_cast()) return false;
    if (cheb(me.position(), tpos) > 4) return false;
    for (const auto& ab : me.abilities()) {
        try {
            if (!(ab.is_damage() || ab.is_cc() || ab.is_aoe_damage())) continue;
            if (!ab.is_ready()) continue;
            if (ab.is_aoe_damage()) { if (ab.use(tpos)) return true; continue; }
            if (is_camp ? !ab.can_target_camps() : !ab.can_target_enemies()) continue;
            if (ab.use(target)) return true;
        } catch (...) {}
    }
    return false;
}

bool cast_attack_reset() {
    auto& me = cambc::self();
    if (!me.can_cast()) return false;
    for (const auto& ab : me.abilities()) {
        try { if (ab.is_attack_reset() && ab.is_ready()) return ab.use(); } catch (...) {}
    }
    return false;
}

void cast_shield() {
    auto& me = cambc::self();
    if (!me.can_cast()) return;
    for (const auto& ab : me.abilities()) {
        try { if (ab.is_shield() && ab.is_ready()) { ab.use(); return; } } catch (...) {}
    }
}

template <class Target>
bool basic_attack(const Target& t, vec2 tpos) {
    auto& me = cambc::self();
    try {
        if (!me.can_attack()) return false;
        if (cheb(tpos, me.position()) > S.range) return false;
        me.attack(t);
        return true;
    } catch (...) { return false; }
}

// Attack the lowest-hp enemy champion in range (spells first, then basic + reset + basic).
bool fight_enemies() {
    auto& me = cambc::self();
    const vec2 pos = me.position();
    const Foe* best = nullptr;
    for (const auto& f : T.foes) {
        if (cheb(f.pos, pos) > std::max(S.range, 4)) continue;
        if (!best || f.hp < best->hp) best = &f;
    }
    if (!best) return false;
    const int d = cheb(best->pos, pos);
    cast_offensive(best->c, best->pos, false);
    if (d <= S.range) {
        if (basic_attack(best->c, best->pos) && cast_attack_reset()) basic_attack(best->c, best->pos);
        cast_shield();
        return true;
    }
    return false;
}

// Attack camps of group gi (or any camp) that are in range, lowest hp first. Returns true if attacked.
bool attack_group_camps(int gi, bool allow_any_camp) {
    const vec2 pos = cambc::self().position();
    const CampView* best = nullptr;
    const CampView* spell_target = nullptr;
    for (const auto& c : T.camps) {
        if (!(allow_any_camp || (gi >= 0 && c.group == gi))) continue;
        const int d = cheb(c.pos, pos);
        if (d <= 4 && !spell_target) spell_target = &c;
        if (d > S.range) continue;
        if (!best || c.hp < best->hp) best = &c;
    }
    if (best) {
        cast_offensive(best->c, best->pos, true);
        bool attacked = false;
        if (basic_attack(best->c, best->pos)) {
            attacked = true;
            if (cast_attack_reset()) basic_attack(best->c, best->pos);
        }
        if (best->str > 0) cast_shield();
        return attacked;
    }
    if (spell_target && S.ranged) cast_offensive(spell_target->c, spell_target->pos, true);
    return false;
}

// Camps that can hit us now (alive, within their range 3, non-zero strength).
struct Threat { int n = 0; vec2 nearest{}; int nd = 1000; };
Threat camp_threat(vec2 pos) {
    Threat t;
    for (const auto& c : T.camps) {
        const int d = cheb(c.pos, pos);
        if (d > 3 || c.str <= 0) continue;
        ++t.n;
        if (d < t.nd) { t.nd = d; t.nearest = c.pos; }
    }
    return t;
}

// Greedy local step that reduces the Chebyshev distance to the nearest of `goals` (cheap; used for
// short approaches to visible camps / enemies). Tie-break with an optional static field.
bool greedy_step(const std::vector<vec2>& goals, int want, const distance_field* tie) {
    auto& me = cambc::self();
    if (!me.can_move() || goals.empty()) return false;
    const vec2 pos = me.position();
    auto dist_to = [&](vec2 p) { int d = 1 << 20; for (auto g : goals) d = std::min(d, cheb(g, p)); return d; };
    const int cur = dist_to(pos);
    if (cur <= want) return false;
    // Dash when it closes at least two tiles (SHINK dashes on almost every approach).
    if (cur > want + 1 && me.can_cast()) {
        for (const auto& ab : me.abilities()) {
            if (!ab.is_dash()) continue;
            try {
                if (!ab.is_ready()) continue;
                const auto& b0 = blocked();
                const auto reach = b0.reachable_tiles(pos, 2) & ~cambc::map::holes() & ~b0;
                vec2 bestd = pos;
                int bdd = cur;
                for (auto t : reach.positions()) { const int v = std::max(dist_to(t), want); if (v + 1 < bdd) { bdd = v; bestd = t; } }
                if (bestd != pos && ab.use(bestd)) { T.blocked_ok = false; return true; }
            } catch (...) {}
        }
    }
    const auto& b = blocked();
    vec2 best = pos;
    int bd = cur, bt = tie ? tie->get(pos) : 0;
    for (auto d : DIRS) {
        const vec2 t = pos + d;
        if (!cambc::map::is_in_bounds(t) || b.is_set(t)) continue;
        const int v = dist_to(t);
        const int tv = tie ? tie->get(t) : 0;
        if (v < bd || (v == bd && v < cur && tv < bt)) { bd = v; bt = tv; best = t; }
    }
    if (best == pos) return false;
    return try_move(best);
}

// Move towards a tile from which an alive, visible camp of group gi is in attack range.
bool approach_alive_camps(int gi) {
    std::vector<vec2> goals;
    for (const auto& c : T.camps) if (c.group == gi) goals.push_back(c.pos);
    if (goals.empty()) return false;
    auto& G = S.groups[gi];
    return greedy_step(goals, S.range, G.field ? G.field.get() : nullptr);
}

bool on_group_tile(int gi, vec2 pos) { return gi >= 0 && S.tile_group[static_cast<std::size_t>(lin(pos))] == gi; }

void go_tribute() {
    auto& me = cambc::self();
    const vec2 pos = me.position();
    for (auto a : S.altars) {
        if (cheb(a, pos) <= cambc::constants::submit_gems_range) {
            try {
                if (cambc::vision::has_altar_lock(a)) continue;
                me.submit_gems(a);
                return;
            } catch (...) {}
        }
    }
    step_on_field(S.altar_field, true);
}

// Chase a weakened enemy nearby (or one a single step outside melee range) while healthy.
// Returns true when the turn is used up by the chase.
bool chase(float hpf, bool& fought) {
    auto& me = cambc::self();
    if (fought || !me.can_move() || hpf < CHASE_MIN_HP) return false;
    const vec2 pos = me.position();
    const Foe* prey = nullptr;
    for (const auto& f : T.foes) {
        const int d = cheb(f.pos, pos);
        if (d > CHASE_RADIUS || d <= S.range) continue;
        const bool weak = f.hpf < CHASE_FOE_HP;
        const bool one_step = !S.ranged && d == 2 && hpf >= 0.5f;
        if (!weak && !one_step) continue;
        if (!prey || f.hp < prey->hp) prey = &f;
    }
    if (!prey || cambc::map::spawn_region(team::enemy).is_set(prey->pos)) return false;
    if (!greedy_step({prey->pos}, S.range, nullptr)) return false;
    fought = fight_enemies();
    return true;
}

} // namespace

// Spend spare fuel on precomputing group distance fields (one or more per turn).
void precompute_fields() {
    for (auto& G : S.groups) {
        if (G.field) continue;
        if (cambc::fuel_remaining() < 45000) return;
        group_field(G);
    }
}

void play_turn_inner();

void play_turn() {
    play_turn_inner();
    try { precompute_fields(); } catch (...) {}
}

void play_turn_inner() {
    if (!S.init) init();
    auto& me = cambc::self();
#ifdef SHINK_PROF
    const auto f0 = cambc::fuel_remaining();
#endif
    begin_turn();
#ifdef SHINK_PROF
    const auto f1 = cambc::fuel_remaining();
#endif
    update_knowledge();
#ifdef SHINK_PROF
    const auto f2 = cambc::fuel_remaining();
    struct P { ~P() { const auto f3 = cambc::fuel_remaining(); if (a - f3 > 50000) std::cout << "PROF r" << cambc::round_number() << " t" << static_cast<int>(S.type) << " begin " << (a - b) << " know " << (b - c) << " rest " << (c - f3) << std::endl; } std::uint64_t a, b, c; } prof{f0, f1, f2};
#endif
    const int round = T.round;

    if (!me.is_alive()) {
        shop();
        S.target = -1; S.capture_turns = 0;
        write_claim(-1);
        return;
    }
    if (me.is_recalling() || me.is_submitting_gems() || me.is_teleporting()) {
        if (me.is_recalling()) write_claim(-1);
        return;
    }

    const vec2 pos = me.position();
#ifdef SHINK_DEBUG
    if (round % 20 == 0) {
        std::cout << "DBG r" << round << " " << static_cast<int>(S.type) << " pos " << pos.x << "," << pos.y << " tgt " << S.target;
        if (S.target >= 0) { auto& G = S.groups[S.target]; std::cout << " known " << G.known << " c " << G.center.x << "," << G.center.y << " ra " << G.respawn_at; }
        std::cout << std::endl;
    }
#endif
    if (pos == S.last_pos) ++S.stuck; else S.stuck = 0;
    S.last_pos = pos;
    const bool at_spawn = cambc::map::spawn_region(team::ally).is_set(pos);
    if (at_spawn) shop();
    const float hpf = me.health() / std::max(1.f, me.max_health());
    const int gems = static_cast<int>(me.gem_count());
    const int gold = static_cast<int>(me.gold_count());
    int foe_d = 1000;
    vec2 foe_p{};
    for (const auto& f : T.foes) { const int d = cheb(f.pos, pos); if (d < foe_d) { foe_d = d; foe_p = f.pos; } }

    // Heal on spawn: stay one turn if hurt.
    if (at_spawn && hpf < 0.95f) { write_claim(S.target); return; }

    // Low hp: recall, or walk away first when an enemy / awake camp is close.
    if (!at_spawn && hpf < RECALL_HP) {
        const Threat th = camp_threat(pos);
        const bool finish = S.target >= 0 && S.groups[S.target].known == 1 && foe_d > FLEE_RADIUS &&
                            group_dist(S.groups[S.target], pos, true) <= S.range && can_solo(S.groups[S.target], me.health(), 0);
        if (!finish) {
            if (foe_d <= FLEE_RADIUS) {
                if (foe_d <= S.range && hpf > 0.15f) fight_enemies();
                step_away_from(foe_p);
            } else if (th.n > 0) {
                step_away_from(th.nearest);
            } else {
                write_claim(-1);
                try { me.recall(); } catch (...) {}
            }
            return;
        }
    }

    // Cassi (fragile backline) leaves when an enemy champion shows up close and no ally is next to her.
    if (S.type == champion_type::cassi && !at_spawn && foe_d <= CASSI_ESCAPE_RADIUS) {
        bool ally_close = false;
        try {
            for (auto& a : cambc::vision::champions(team::ally))
                if (!(a == me) && a.is_alive() && a.is_visible() && cheb(a.position(), pos) <= 2) { ally_close = true; break; }
        } catch (...) {}
        if (!ally_close) {
            if (foe_d <= 3) { fight_enemies(); step_away_from(foe_p); }
            else { write_claim(-1); try { me.recall(); } catch (...) {} }
            return;
        }
    }

    // Enemy champion in range: hit it first; then maybe chase a weakened one.
    bool fought = fight_enemies();
    if (chase(hpf, fought)) return;

    // Validate target.
    if (S.target >= 0 && !group_available(S.groups[S.target], group_dist(S.groups[S.target], pos, true))) S.target = -1;

    // Capture in progress on the target group?
    if (S.target >= 0 && S.groups[S.target].known == 2 && on_group_tile(S.target, pos)) {
        ++S.capture_turns;
        const auto& G = S.groups[S.target];
        const int sd = S.spawn_field.get(pos), ad = S.altar_field.get(pos);
        const bool gold_recall = gold + G.gold >= EMBLEM_GOLD && sd >= GOLD_RECALL_MIN_DIST && ad >= 10;
        if (S.capture_turns >= 2 && foe_d > 5 && (hpf < CAPTURE_RECALL_HP || gold_recall)) {
            try { me.recall(); } catch (...) {}
            write_claim(-1);
            S.target = -1; S.capture_turns = 0;
            return;
        }
        write_claim(S.target);
        if (!fought) attack_group_camps(-1, true);
        return;
    }
    S.capture_turns = 0;

    // Gems captured since last turn -> force a re-decision.
    if (gems > S.last_gems && S.target >= 0 && S.groups[S.target].known != 1) S.target = -1;
    S.last_gems = gems;

    // Gold recall (after banking): recall, or walk home when spawn is close.
    if (!at_spawn && gold >= EMBLEM_GOLD && gems < TRIBUTE_GEMS && foe_d > FLEE_RADIUS) {
        const bool engaged = S.target >= 0 && S.groups[S.target].known == 1 && group_dist(S.groups[S.target], pos, true) <= 1;
        if (!engaged) {
            write_claim(-1);
            if (S.spawn_field.get(pos) < GOLD_RECALL_MIN_DIST) {
                if (!fought) attack_group_camps(-1, false);
                step_on_field(S.spawn_field, true);
            } else {
                try { me.recall(); } catch (...) {}
            }
            return;
        }
    }

    // Choose target (Cassi follows Issac's claim).
    if (S.type == champion_type::cassi && S.issac_slot >= 0) {
        const auto claims = read_claims();
        const int t = static_cast<int>(claims[S.issac_slot]) - 1;
        if (t >= 0 && t < static_cast<int>(S.groups.size())) S.target = t;
    }
    if (S.target < 0 || round - S.last_decide > 25) {
        S.target = choose_target(pos);
        S.last_decide = round;
    }
    if (S.type != champion_type::cassi) write_claim(S.target);

    // Bank gems.
    if (gems > 0) {
        bool bank = gems >= TRIBUTE_GEMS;
        if (!bank) {
            const int ad = S.altar_field.get(pos);
            const int td = S.target >= 0 ? group_dist(S.groups[S.target], pos, true) : (1 << 20);
            bank = S.target < 0 || ad + 2 < td;
        }
        if (bank) {
            if (!fought) attack_group_camps(-1, false);
            go_tribute();
            return;
        }
    }

    if (S.target < 0) {
        // Nothing worth farming: hold, but never block a camp's respawn tiles.
        if (!fought) attack_group_camps(-1, true);
        step_off_camp_tiles();
        return;
    }

    if (S.groups[S.target].known == 2 && S.type != champion_type::cassi) {
        auto& G = S.groups[S.target];
        // Only one champion captures (rewards are split between everyone on the region): leave it
        // to an ally already standing on it, or to a lower-slot claimer that is closer.
        bool leave = false;
        try {
            const auto claims = read_claims();
            const auto all = cambc::champions(team::ally);
            for (std::size_t k = 0; k < all.size(); ++k) {
                const auto& a = all[k];
                if (static_cast<int>(k) == S.my_slot || !a.is_alive() || !a.is_visible()) continue;
                const vec2 ap = a.position();
                if (on_group_tile(S.target, ap)) { leave = true; break; }
                if (static_cast<int>(k) < S.my_slot && k < 8 && claims[k] == S.target + 1 &&
                    group_field(G).get(ap) < group_field(G).get(pos)) { leave = true; break; }
            }
        } catch (...) {}
        if (leave && !on_group_tile(S.target, pos)) {
            S.target = choose_target(pos, S.target);
            S.last_decide = round;
            write_claim(S.target);
            if (S.target < 0) { step_off_camp_tiles(); return; }
        }
    }

    auto& G = S.groups[S.target];
    if (G.known == 2) {
        // dead group: go and stand on it (Cassi only waits nearby so the reward is not split)
        if (S.type == champion_type::cassi) {
            if (group_field(G).get(pos) > 3) step_on_field(group_field(G), true);
        } else if (!on_group_tile(S.target, pos)) {
            step_on_field(group_field(G), true);
        }
        if (!fought) attack_group_camps(-1, true);
        return;
    }

    // alive (or assumed alive): approach and attack.
    if (fought) return;
    // Anti-deadlock: standing still for long next to a group with no visible camp -> treat it as respawning.
    if (S.stuck > 12 && G.known != 3) {
        bool any = false;
        for (const auto& c : T.camps) if (c.group == S.target) { any = true; break; }
        if (!any) { G.known = 3; G.respawn_at = round + 10; S.stuck = 0; }
    }
    if (attack_group_camps(S.target, false)) return;
    const int d = group_dist(G, pos, true);
    if (S.ranged) {
        for (const auto& c : T.camps)
            if (c.group == S.target && cheb(c.pos, pos) <= S.range) return; // in range but could not attack
    }
    if (G.known == 3) {
        // waiting for the respawn: stand next to the group, not on it
        if (d > 1) step_on_field(group_field(G), true);
        step_off_camp_tiles();
        return;
    }
    if (!approach_alive_camps(S.target)) {
        if (d > 1) step_on_field(group_field(G), true);
        step_off_camp_tiles();
    }
    // after moving, try attacking again (melee can walk + attack)
    if (!S.ranged) attack_group_camps(S.target, false);
}
