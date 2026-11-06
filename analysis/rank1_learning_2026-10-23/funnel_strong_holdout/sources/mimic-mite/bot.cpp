// mimic-mite: reproduces the generalised decision rules of team Mite (ladder #1).
//
// Turn structure (each rule is backed by numbers in analysis/mite/STYLE.md):
//   1. priority  = 1000 while hp < 35% (act first to escape), else floor(strength)+10 (Willow: 1)
//   2. shop on spawn / while dead: Jungle(stat) -> Durability or Power -> Bruiser:Health -> Power...
//   3. low-hp mode (<35%): retreat from enemies, recall as soon as no enemy within 6
//   4. fight: enemy champion in range always beats camps; melee steps in at distance 2 and chases at 3
//   5. tribute: carry gems to the nearest altar right after a capture (unless a quick camp is adjacent)
//   6. after a tribute with >=150 gold: recall to shop; while capturing a camp worth >=150 gold: recall
//      during the capture (capture completes first, the champion arrives home with the reward)
//   7. farm: own-half gem camps chosen by value/time with ally claims in shared memory; one capturer
//   8. wards on bush tiles when the current ward is >= 7 tiles away
//   9. Willow escorts Cassi and heals the most-damaged ally in range (missing hp >= 180)
#include "bot.h"
#include <algorithm>
#include <cmath>
#include <cstdio>
#include <optional>
#include <variant>

namespace bc = cambc;
using bc::team;
using bc::vec2;

namespace mm {

static constexpr std::uint16_t UNR = 0xFFFF;
static bool excludesWalking(const bc::ability& ab);
static int cheb(vec2 a, vec2 b) { return std::max(std::abs(a.x - b.x), std::abs(a.y - b.y)); }

static std::vector<bc::champion> safeChamps(team side) {
    std::vector<bc::champion> out;
    try {
        for (auto p : bc::vision::champion_tiles(side).positions()) {
            try { out.push_back(bc::vision::champion_at(p)); } catch (...) {}
        }
    } catch (...) {}
    return out;
}

// vision::camps() throws when a camp died earlier in this turn (stale occupancy); skip such tiles
static std::vector<bc::camp> safeCamps() {
    std::vector<bc::camp> out;
    try {
        for (auto p : bc::vision::camp_tiles().positions()) {
            try { out.push_back(bc::vision::camp_at(p)); } catch (...) {}
        }
    } catch (...) {}
    return out;
}

static float baseDps(int t) {
    // rough per-turn damage incl. ability share, by champion_type
    static const float tbl[12] = {55, 50, 80, 47, 46, 60, 50, 57, 50, 56, 60, 62};
    return (t >= 0 && t < 12) ? tbl[t] : 50.0f;
}

// ------------------------------------------------------------------ init
void Bot::init() {
    auto& me = bc::self();
    W = bc::map::width();
    H = bc::map::height();
    myType = me.champion_name();
    ranged = me.attack_range() > 1;
    const auto walls = bc::map::walls() | bc::map::holes() | bc::map::altars();
    ownSpawnBB = bc::map::spawn_region(team::ally);
    enemySpawnBB = bc::map::spawn_region(team::enemy);
    bushBB = bc::map::bushes();
    staticBlocked = walls | enemySpawnBB;

    bc::bitboard visited;
    bc::distance_field f;
    f.compute(staticBlocked, ownSpawnBB, visited);
    distOwn = f.export_linear_buffer();
    f.compute(walls, enemySpawnBB, visited);
    distEnemy = f.export_linear_buffer();
    int ss = UNR;
    for (auto p : ownSpawnBB.positions()) ss = std::min<int>(ss, distEnemy[idx(p)]);
    farMap = ss > 60;

    // team slots: sorted engine handles, identical in every instance
    auto allies = bc::champions(team::ally);
    std::vector<std::pair<std::uint32_t, int>> hs;
    const auto mine = static_cast<std::uint32_t>(static_cast<bc::handle_champion_t>(me));
    for (auto& a : allies) {
        int t = -1;
        try { t = static_cast<int>(a.champion_name()); } catch (...) {}
        hs.push_back({static_cast<std::uint32_t>(static_cast<bc::handle_champion_t>(a)), t});
    }
    std::sort(hs.begin(), hs.end());
    nAllies = static_cast<int>(hs.size());
    slotType.assign(nAllies, -1);
    for (int i = 0; i < nAllies; ++i) {
        slotType[i] = hs[i].second;
        if (hs[i].first == mine) slot = i;
    }
    for (int i = 0; i < nAllies; ++i) {
        if (slotType[i] == static_cast<int>(bc::champion_type::cassi)) cassiSlot = i;
        if (myType == bc::champion_type::cassi && slotType[i] == static_cast<int>(bc::champion_type::issac)) partnerSlot = i;
        if (myType == bc::champion_type::issac && slotType[i] == static_cast<int>(bc::champion_type::cassi)) partnerSlot = i;
    }

    rawGroups = bc::map::camp_groups();
    groups.resize(rawGroups.size());
    for (std::size_t i = 0; i < rawGroups.size(); ++i) {
        auto& g = groups[i];
        auto& rg = rawGroups[i];
        g.id = static_cast<int>(i);
        g.tilesBB = rg.spawn_tiles();
        g.tiles = g.tilesBB.positions();
        g.gems = static_cast<int>(rg.gem_value());
        g.gold = static_cast<int>(rg.gold_value());
        g.respawn = rg.max_respawn_timer();
        for (auto& c : rg.camps()) {
            auto st = c.base_stats();
            g.totalHp += st.base_health;
            g.totalStr += st.base_strength;
            if (c.is_monolith()) g.monolith = true;
        }
        g.hpLeft = g.totalHp;
        long sx = 0, sy = 0;
        for (auto t : g.tiles) { sx += t.x; sy += t.y; }
        if (!g.tiles.empty()) g.center = {static_cast<int>(sx / (long)g.tiles.size()), static_cast<int>(sy / (long)g.tiles.size())};
        f.compute(staticBlocked, g.tilesBB, visited);
        g.dist = f.export_linear_buffer();
        g.dOwn = g.dEnemy = UNR;
        for (auto t : g.tiles) {
            g.dOwn = std::min<int>(g.dOwn, distOwn[idx(t)]);
            g.dEnemy = std::min<int>(g.dEnemy, distEnemy[idx(t)]);
        }
        // Mite only farms its own half (+ the contested middle) and never gold-only clusters or monoliths
        g.eligible = g.gems > 0 && !g.monolith && g.dOwn != UNR && g.dOwn <= g.dEnemy + 4;
    }

    for (auto a : bc::map::altars().positions()) {
        bc::bitboard r;
        r.draw_chebyshev(a, 1);
        r &= ~staticBlocked;
        f.compute(staticBlocked, r, visited);
        altars.push_back({a, f.export_linear_buffer()});
    }
    spawnAltarDist = UNR;
    for (auto& al : altars)
        for (auto p : ownSpawnBB.positions()) spawnAltarDist = std::min<int>(spawnAltarDist, al.dist[idx(p)]);
}

// ------------------------------------------------------------------ shared memory
void Bot::readShared() {
    for (int i = 0; i < 8; ++i) shared[i] = bc::shared_memory[i];
}

void Bot::writeStatus(bool low) {
    if (slot >= 8) return;
    std::uint8_t v = 0;
    if (target >= 0 && target < 63) v = static_cast<std::uint8_t>(target + 1);
    if (capturing) v |= 0x40;
    if (low) v |= 0x80;
    if (shared[slot] != v) {
        bc::shared_memory[slot] = v;
        shared[slot] = v;
    }
}

bool Bot::allyCapturing(int gid) const {
    for (int s = 0; s < nAllies && s < 8; ++s) {
        if (s == slot) continue;
        if ((shared[s] & 0x40) && (shared[s] & 0x3F) == gid + 1) return true;
    }
    return false;
}

// ------------------------------------------------------------------ knowledge
void Bot::updateKnowledge() {
    auto& me = bc::self();
    if (!me.is_alive()) return;
    const auto vis = bc::vision::visible_tiles();
    std::vector<float> hp(groups.size(), 0.0f);
    std::vector<char> anyCamp(groups.size(), 0);
    for (auto& c : safeCamps()) {
        int gid = -1;
        const auto sp = c.spawn_position();
        for (auto& g : groups)
            if (g.tilesBB.is_set(sp)) { gid = g.id; break; }
        if (gid < 0) continue;
        try { hp[gid] += c.health(); anyCamp[gid] = 1; } catch (...) {}
    }
    for (auto& g : groups) {
        if ((g.tilesBB & vis).is_empty()) continue;
        try {
            auto st = rawGroups[g.id].state();
            if (std::holds_alternative<bc::map::camp_group_alive>(st)) {
                g.state = 1;
                g.hpLeft = anyCamp[g.id] ? hp[g.id] : g.totalHp;
            } else if (std::holds_alternative<bc::map::camp_group_reward_available>(st)) {
                g.state = 2;
                g.hpLeft = 0;
            } else {
                g.state = 3;
                g.respawnAt = round + std::get<bc::map::camp_group_respawning>(st).timer;
            }
            g.seenRound = round;
        } catch (...) {}
    }
    // allies capturing a group: it will be respawning soon
    for (int s = 0; s < nAllies && s < 8; ++s) {
        if (s == slot || !(shared[s] & 0x40)) continue;
        int gid = (shared[s] & 0x3F) - 1;
        if (gid < 0 || gid >= static_cast<int>(groups.size())) continue;
        auto& g = groups[gid];
        if (g.seenRound == round) continue;
        g.state = 3;
        g.respawnAt = std::max(g.respawnAt, round + 5 + g.respawn);
    }
}

bool Bot::groupAlive(const Group& g) const {
    if (g.state == 3) return round >= g.respawnAt;
    return g.state != 2;
}

// ------------------------------------------------------------------ priority / shop / wards
void Bot::setPriority(bool low) {
    auto& me = bc::self();
    int desired = 0;
    if (low) desired = 1000;
    else if (myType == bc::champion_type::willow) desired = 1;
    else desired = static_cast<int>(std::floor(me.strength())) + 10;
    try {
        if (me.priority() != desired) me.set_priority(desired);
    } catch (...) {}
}

bool Bot::onSpawn() const {
    auto& me = bc::self();
    return me.is_alive() && ownSpawnBB.is_set(me.position());
}

void Bot::shop() {
    auto& me = bc::self();
    if (me.is_alive() && !onSpawn()) return;
    // family index: 0 monster 1 power 2 durability 3 treasure 4 jungle 5 home 6 bruiser; stat 0 str 1 focus 2 health
    struct Step { int fam, stat, count; };
    std::vector<Step> plan;
    const bool focusUser = myType == bc::champion_type::cassi || myType == bc::champion_type::stellar || myType == bc::champion_type::prism;
    if (focusUser) {
        plan = {{4, 1, 5}, {2, 1, 5}, {1, 1, 1000}};
    } else if (farMap) {
        plan = {{4, 0, 5}, {1, 0, 5}, {2, 0, 5}, {6, 2, 5}, {1, 0, 1000}};
    } else {
        plan = {{4, 0, 5}, {2, 0, 5}, {6, 2, 5}, {1, 0, 1000}};
    }
    try {
        auto counts = me.item_count();
        int gold = static_cast<int>(me.gold_count());
        for (auto& st : plan) {
            const int shardIdx = st.fam * 6 + st.stat * 2;
            const bc::item_type shard{static_cast<std::uint32_t>(shardIdx)};
            const bc::item_type emblem{static_cast<std::uint32_t>(shardIdx + 1)};
            int have = static_cast<int>(counts[shard]) + 5 * static_cast<int>(counts[emblem]);
            if (st.fam == 1 && st.count >= 1000) have = 0;  // open-ended power stacking
            int need = st.count - have;
            if (need <= 0) continue;
            int n = std::min(need, gold / 30);
            if (n <= 0) break;
            // buy in chunks that never cross an emblem boundary to keep counts exact
            while (n > 0) {
                int chunk = std::min(n, 5 - (static_cast<int>(counts[shard]) % 5));
                if (chunk <= 0) chunk = 1;
                if (!me.can_buy(shard, chunk)) { n = 0; break; }
                me.buy(shard, chunk);
                n -= chunk;
                gold = static_cast<int>(me.gold_count());
                counts = me.item_count();
            }
            have = static_cast<int>(counts[shard]) + 5 * static_cast<int>(counts[emblem]);
            if (st.fam == 1 && st.count >= 1000) { if (gold < 30) break; else continue; }
            if (have < st.count) break;
        }
    } catch (...) {}
}

void Bot::placeWard() {
    auto& me = bc::self();
    try {
        if (me.ward_cooldown() > 0) return;
        const vec2 pos = me.position();
        auto wards = me.ward_positions();
        const bool has = !wards.empty();
        if (has && cheb(wards[0], pos) < 7) return;
        auto cand = me.ward_placement_tiles() & bushBB;
        if (cand.is_empty()) return;
        vec2 best = pos;
        int bestScore = -100000;
        const Group* tg = (target >= 0) ? &groups[target] : nullptr;
        for (auto t : cand.positions()) {
            int s = cheb(t, pos) * 4;
            if (has) s += cheb(t, wards[0]) * 10;
            if (tg) { auto d = gdist(*tg, t); if (d != UNR) s -= d; }
            if (s > bestScore) { bestScore = s; best = t; }
        }
        if (best != pos || cand.is_set(pos)) me.place_ward(best);
    } catch (...) {}
}

// ------------------------------------------------------------------ movement
bc::bitboard Bot::blockedNow() const {
    auto b = staticBlocked | bc::vision::champion_tiles() | bc::vision::camp_tiles() | bc::vision::teleport_tiles();
    b.set(bc::self().position(), false);
    return b;
}

bool Bot::useDashToward(const bc::distance_field& f) {
    auto& me = bc::self();
    stage = "dash";
    if (castThisTurn || !me.can_cast()) return false;
    for (auto ab : me.abilities()) {
        if (!ab.is_dash() || !ab.is_ready()) continue;
        try {
            const vec2 pos = me.position();
            const auto cur = f.get(pos);
            if (cur == UNR || cur <= 2) return false;
            auto blocked = blockedNow();
            auto passable = blocked & ~bc::map::holes();
            auto reach = passable.reachable_tiles(pos, 2) & ~blocked & ab.valid_tiles();
            std::vector<std::pair<int, vec2>> opts;
            for (auto t : reach.positions()) {
                auto d = f.get(t);
                if (d != UNR && d + 1 < cur) opts.push_back({d, t});
            }
            std::sort(opts.begin(), opts.end(), [](auto& a, auto& b) { return a.first < b.first; });
            for (std::size_t i = 0; i < opts.size() && i < 3; ++i) {
                try {
                    if (ab.use(opts[i].second)) { castThisTurn = true; return true; }
                } catch (...) {}
            }
        } catch (...) {}
        return false;
    }
    return false;
}

bool Bot::moveToward(const bc::bitboard& goalsIn, bool allowDash, bool bushy) {
    auto& me = bc::self();
    stage = "move";
    if (!me.can_move()) return false;
    const vec2 pos = me.position();
    auto blocked = blockedNow();
    auto goals = goalsIn & ~blocked;
    if (goals.is_set(pos) || goals.is_empty()) return false;
    bc::distance_field f;
    bc::bitboard visited;
    f.compute(blocked & ~goals, goals, visited);
    const auto here = f.get(pos);
    if (here == UNR) return false;
    // Mite routes through bush tiles when the detour is tiny (<= 2 steps): pick a bush waypoint
    const bc::distance_field* steer = &f;
    bc::distance_field fb;
    if (bushy && here > 3 && !bushBB.is_set(pos)) {
        bc::bitboard cand;
        cand.draw_chebyshev(pos, 5);
        cand &= bushBB;
        cand &= ~blocked;
        if (!cand.is_empty()) {
            bc::distance_field fm;
            bc::bitboard me1, vis2;
            me1.set(pos, true);
            fm.compute(blocked, me1, vis2, 6);
            int bestSc = 1 << 30;
            vec2 via = pos;
            for (auto b : cand.positions()) {
                const int dm = fm.get(b), dg = f.get(b);
                if (dm == UNR || dg == UNR || dg >= here) continue;
                if (dm + dg > here + 2) continue;
                const int sc = (dm + dg) * 16 + dm;
                if (sc < bestSc) { bestSc = sc; via = b; }
            }
            if (via != pos) {
                bc::bitboard root, vis3;
                root.set(via, true);
                fb.compute(blocked & ~root, root, vis3, 8);
                if (fb.get(pos) != UNR) steer = &fb;
            }
        }
    }
    const auto sh = steer->get(pos);
    std::vector<std::pair<int, vec2>> steps;
    for (auto t : blocked.reachable_tiles(pos, 1).positions()) {
        if (t == pos) continue;
        auto d = steer->get(t);
        if (d != UNR && d < sh) steps.push_back({d, t});
    }
    // equal-length steps: prefer bush tiles (hidden approach; Mite walks inside bush rows)
    for (auto& st : steps) st.first = st.first * 2 + (bushBB.is_set(st.second) ? 0 : 1);
    std::sort(steps.begin(), steps.end(), [](auto& a, auto& b) { return a.first < b.first; });
    bool moved = false;
    for (auto& st : steps) {
        try {
            if (me.move_absolute(st.second)) { moved = true; break; }
        } catch (...) {}
    }
    if (moved) movedThisTurn = true;
    if (allowDash) {
        // fields are goal-rooted, so they stay valid after our step
        if (useDashToward(*steer)) movedThisTurn = true;
    }
    return moved;
}

bool Bot::moveAway(const std::vector<vec2>& threats) {
    auto& me = bc::self();
    if (!me.can_move()) return false;
    const vec2 pos = me.position();
    auto blocked = blockedNow();
    vec2 best = pos;
    long bestScore = -1000000;
    for (auto t : blocked.reachable_tiles(pos, 1).positions()) {
        int mind = 99;
        for (auto e : threats) mind = std::min(mind, cheb(t, e));
        int ds = distOwn[idx(t)] == UNR ? 999 : distOwn[idx(t)];
        long s = mind * 100 - ds;
        if (s > bestScore) { bestScore = s; best = t; }
    }
    bool moved = false;
    if (best != pos) {
        try { moved = me.move_absolute(best); } catch (...) {}
    }
    if (moved) movedThisTurn = true;
    // dash home if possible
    if (!castThisTurn && me.can_cast()) {
        bc::distance_field f;
        bc::bitboard visited;
        f.compute(staticBlocked, ownSpawnBB, visited);
        useDashToward(f);
    }
    return moved;
}

int Bot::nearestAltar(vec2 p) const {
    int best = -1, bd = UNR;
    for (std::size_t i = 0; i < altars.size(); ++i) {
        int d = altars[i].dist[idx(p)];
        if (d < bd) { bd = d; best = static_cast<int>(i); }
    }
    return best;
}

// ------------------------------------------------------------------ abilities
void Bot::afterAttackReset(const bc::unit* tgt) {
    auto& me = bc::self();
    stage = "reset";
    if (castThisTurn || !me.can_cast()) return;
    for (auto ab : me.abilities()) {
        if (!ab.is_attack_reset() || !ab.is_ready()) continue;
        try {
            if (ab.use()) {
                castThisTurn = true;
                if (tgt && me.can_attack()) {
                    try {
                        if (tgt->is_visible() && tgt->health() > 0 && cheb(tgt->position(), me.position()) <= me.attack_range()) me.attack(*tgt);
                    } catch (...) {}
                }
            }
        } catch (...) {}
        return;
    }
}

bool Bot::castOnEnemy(const bc::champion& e) {
    auto& me = bc::self();
    if (castThisTurn || !me.can_cast()) return false;
    for (auto ab : me.abilities()) {
        if (!ab.is_ready()) continue;
        const bool offensive = ab.is_damage() || ab.is_cc() || ab.is_aoe_damage();
        if (!offensive) continue;
        if (movedThisTurn && excludesWalking(ab)) continue;
        try {
            if (!ab.valid_tiles().is_set(e.position())) continue;
            bool ok = ab.can_target_ground() && !ab.can_target_enemies() ? ab.use(e.position()) : ab.use(e);
            if (ok) { castThisTurn = true; return true; }
        } catch (...) {}
    }
    return false;
}

bool Bot::castOnCamp(const bc::camp& c) {
    auto& me = bc::self();
    stage = "castcamp";
    if (castThisTurn || !me.can_cast()) return false;
    for (auto ab : me.abilities()) {
        if (!ab.is_ready()) continue;
        // Cassi's stun is kept for champions; damage spells (incl. Ren's damage+stun) go on camps
        const bool dmg = ab.is_damage() || ab.is_aoe_damage() || (ab.is_cc() && myType == bc::champion_type::ren);
        if (!dmg) continue;
        if (movedThisTurn && excludesWalking(ab)) continue;
        try {
            if (!ab.valid_tiles().is_set(c.position())) continue;
            bool ok = ab.can_target_ground() && !ab.can_target_camps() ? ab.use(c.position()) : ab.use(c);
            if (ok) { castThisTurn = true; return true; }
        } catch (...) {}
    }
    return false;
}

static bool excludesWalking(const bc::ability& ab) {
    try {
        const auto& inf = ab.info();
        if (!inf) return false;
        return std::visit([](const auto& x) { return x.exclusive_with_movement; }, *inf);
    } catch (...) { return false; }
}

static bool useShield() {
    auto& me = bc::self();
    if (!me.can_cast()) return false;
    for (auto ab : me.abilities()) {
        if (!ab.is_shield() || !ab.is_ready()) continue;
        try { return ab.use(); } catch (...) {}
    }
    return false;
}

float Bot::myDps() const {
    auto& me = bc::self();
    float s = me.strength() * 1.15f;
    return std::max(s, baseDps(static_cast<int>(myType)) * 0.8f);
}

float Bot::typeDps(int type) const { return baseDps(type); }

// ------------------------------------------------------------------ low hp
bool Bot::handleLowHp() {
    auto& me = bc::self();
    const float hpf = me.health() / std::max(1.0f, me.max_health());
    static bool prevPartnerLow = false;
    const bool partnerLow = partnerSlot >= 0 && partnerSlot < 8 && (shared[partnerSlot] & 0x80);
    const bool partnerRise = partnerLow && !prevPartnerLow;
    prevPartnerLow = partnerLow;
    if (onSpawn()) {
        if (me.health() >= me.max_health() - 0.5f) { lowMode = false; return false; }
        if (lowMode) return true;  // stay on spawn until healed (heal happens at our turn end)
        return false;
    }
    if (!lowMode && (hpf < 0.35f || partnerRise)) lowMode = true;
    if (lowMode && hpf >= 0.6f && !partnerLow) lowMode = false;
    if (!lowMode) return false;

    const vec2 pos = me.position();
    std::vector<vec2> threats;
    for (auto& e : safeChamps(team::enemy)) {
        try { if (e.is_alive() && cheb(e.position(), pos) <= 6) threats.push_back(e.position()); } catch (...) {}
    }
    // awake (damaged) camps within their range 3 would interrupt the recall too
    for (auto& c : safeCamps()) {
        try { if (cheb(c.position(), pos) <= 4 && c.health() < c.max_health()) threats.push_back(c.position()); } catch (...) {}
    }
    if (me.is_recalling()) return true;
    if (threats.empty()) {
        try { me.recall(); } catch (...) {}
        return true;
    }
    // finish an enemy that is almost dead in range, otherwise run home
    if (me.can_attack()) {
        for (auto& e : safeChamps(team::enemy)) {
            try {
                if (e.is_alive() && cheb(e.position(), pos) <= me.attack_range() && e.health() <= me.strength() * 1.05f) {
                    me.attack(e);
                    attackedThisTurn = true;
                    break;
                }
            } catch (...) {}
        }
    }
    if (myType == bc::champion_type::varg && useShield()) castThisTurn = true;
    if (!attackedThisTurn || !ranged) moveAway(threats);
    return true;
}

// ------------------------------------------------------------------ fighting
bool Bot::fightChampions() {
    auto& me = bc::self();
    auto enemies = safeChamps(team::enemy);
    std::vector<bc::champion> live;
    for (auto& e : enemies) {
        try { if (e.is_alive() && e.is_visible()) live.push_back(e); } catch (...) {}
    }
    if (live.empty()) return false;
    vec2 pos = me.position();
    const int range = me.attack_range();
    const float hpf = me.health() / std::max(1.0f, me.max_health());

    auto pickInRange = [&](int r) -> std::optional<bc::champion> {
        std::optional<bc::champion> best;
        float bs = 1e9f;
        for (auto& e : live) {
            try {
                int d = cheb(e.position(), me.position());
                if (d > r) continue;
                float s = e.health() - 2.0f * static_cast<float>(e.gem_count());
                if (s < bs) { bs = s; best = e; }
            } catch (...) {}
        }
        return best;
    };

    auto tgt = pickInRange(range);
    if (!tgt && !ranged && me.can_move()) {
        // melee: step in at distance 2, chase at 3 when healthy
        std::optional<bc::champion> near;
        int nd = 99;
        for (auto& e : live) {
            int d = cheb(e.position(), pos);
            if (d < nd) { nd = d; near = e; }
        }
        // Mite melee: step in at 2 (hits 55%), approach at 3-4 (57% / 51%) while healthy
        if (near && ((nd == 2 && hpf >= 0.35f) || (nd <= 4 && hpf >= 0.5f))) {
            bc::bitboard goals;
            goals.draw_chebyshev(near->position(), 1);
            moveToward(goals, nd >= 3);
            pos = me.position();
            tgt = pickInRange(range);
        }
    }
    // ranged spells reach 4: Cassi stun / damage, Ren damage+stun
    if (!tgt) {
        auto far = pickInRange(4);
        if (far && !movedThisTurn) {
            if (castOnEnemy(*far)) return true;
        }
        // ranged: close to shooting range when an enemy is within 5 and we are healthy
        if (ranged && !movedThisTurn && hpf >= 0.5f && me.can_move()) {
            auto r5 = pickInRange(5);
            if (r5) {
                bc::bitboard goals;
                goals.draw_chebyshev(r5->position(), range);
                moveToward(goals, false);
                return true;
            }
        }
        if (far && movedThisTurn) {
            // only walking-compatible spells (Cassi stun) after moving
            for (auto ab : me.abilities()) {
                if (castThisTurn || !ab.is_ready() || !ab.is_cc() || myType != bc::champion_type::cassi) continue;
                try { if (ab.valid_tiles().is_set(far->position()) && ab.use(*far)) castThisTurn = true; } catch (...) {}
            }
        }
        return false;
    }
    if (!me.can_attack()) {
        castOnEnemy(*tgt);
        return true;
    }
    // Cassi opens with the stun, Ren with damage+stun (both before the swing)
    if (myType == bc::champion_type::cassi || myType == bc::champion_type::ren) castOnEnemy(*tgt);
    try {
        me.attack(*tgt);
        attackedThisTurn = true;
    } catch (...) {}
    afterAttackReset(&*tgt);
    if (!castThisTurn) {
        if (myType == bc::champion_type::varg) { if (useShield()) castThisTurn = true; }
        else castOnEnemy(*tgt);
    }
    return true;
}

// ------------------------------------------------------------------ camps
bool Bot::attackCampsOf(int gid) {
    auto& me = bc::self();
    stage = "atkcamp";
    if (!me.can_attack() && (castThisTurn || !me.can_cast())) return false;
    const vec2 pos = me.position();
    std::optional<bc::camp> best;
    float bh = 1e9f;
    std::optional<bc::camp> spellTgt;
    float sh = -1;
    for (auto& c : safeCamps()) {
        try {
            if (gid >= 0 && !groups[gid].tilesBB.is_set(c.spawn_position())) continue;
            const int d = cheb(c.position(), pos);
            const float h = c.health();
            if (d <= me.attack_range() && h < bh) { bh = h; best = c; }
            if (d <= 4 && h > sh) { sh = h; spellTgt = c; }
        } catch (...) {}
    }
    bool acted = false;
    if (spellTgt && !castThisTurn && !movedThisTurn) {
        if (castOnCamp(*spellTgt)) acted = true;
    }
    if (best && me.can_attack()) {
        try {
            me.attack(*best);
            attackedThisTurn = true;
            acted = true;
        } catch (...) {}
        afterAttackReset(&*best);
        if (!castThisTurn && myType == bc::champion_type::varg && useShield()) castThisTurn = true;
    }
    if (spellTgt && !castThisTurn && !(movedThisTurn && ranged)) {
        if (castOnCamp(*spellTgt)) acted = true;
    }
    return acted;
}

// ------------------------------------------------------------------ targets
int Bot::chooseTarget() {
    auto& me = bc::self();
    stage = "choose";
    const vec2 pos = me.position();
    const float md = myDps();
    bool jungle = false;
    try {
        auto ic = me.item_count();
        for (int st = 0; st < 3; ++st) if (ic[bc::item_type{static_cast<std::uint32_t>(4 * 6 + st * 2 + 1)}] > 0) jungle = true;
    } catch (...) {}
    std::vector<int> cnt(groups.size(), 0);
    std::vector<float> dps(groups.size(), 0.0f);
    for (int s = 0; s < nAllies && s < 8; ++s) {
        if (s == slot || (shared[s] & 0x80)) continue;
        int gid = (shared[s] & 0x3F) - 1;
        if (gid < 0 || gid >= static_cast<int>(groups.size())) continue;
        cnt[gid]++;
        dps[gid] += typeDps(slotType[s]);
    }
    int best = -1;
    float bs = -1.0f;
    for (auto& g : groups) {
        if (!g.eligible) continue;
        const auto d = gdist(g, pos);
        if (d == UNR) continue;
        if (allyCapturing(g.id)) continue;
        float wait = 0.0f, hp = g.totalHp;
        bool reward = false;
        if (g.state == 3) {
            wait = std::max(0.0f, static_cast<float>(g.respawnAt - round - d));
        } else if (g.state == 2) {
            reward = round - g.seenRound < 15;
            hp = reward ? 0.0f : g.totalHp;
        } else if (g.state == 1 && round - g.seenRound < 30) {
            hp = std::max(1.0f, g.hpLeft);
        }
        const float rawKt = reward ? 0.0f : hp / (md + dps[g.id]);
        const float kt = rawKt * (1.0f + g.totalStr / 100.0f);
        const float time = d + wait + kt + 5.0f;
        const float value = g.gems + 0.15f * g.gold;
        float score = value / (time + 8.0f);
        // camps hit the nearest champion: avoid fights we cannot survive without help
        const float taken = rawKt * g.totalStr * (jungle ? 0.7f : 1.0f);
        if (taken > 2.0f * me.health()) score *= 0.3f;
        if (cnt[g.id] > 0) score *= 0.6f;
        if (g.id == target) score *= 1.25f;
        if (score > bs) { bs = score; best = g.id; }
    }
    return best;
}

// ------------------------------------------------------------------ tribute
bool Bot::doTribute() {
    auto& me = bc::self();
    const int gems = static_cast<int>(me.gem_count());
    if (gems <= 0) return false;
    if (me.is_submitting_gems()) return true;
    const vec2 pos = me.position();
    if (capturing) return false;
    const int a0 = nearestAltar(pos);
    const int dAlt = a0 >= 0 ? altars[a0].dist[idx(pos)] : UNR;
    // altar far away (> 20 steps): keep farming until the bag is big (rows: bags of 66 -> 132)
    if (dAlt > 20 && gems < 120) return false;
    // keep farming when a quick camp is right next to us (clustered gem camps)
    if (gems < 100) {
        const int t = chooseTarget();
        if (t >= 0) {
            auto& g = groups[t];
            const auto d = gdist(g, pos);
            if (d != UNR && d <= 5 && groupAlive(g) && !allyCapturing(g.id)) {
                const float hp = (g.state == 1 && round - g.seenRound < 30) ? g.hpLeft : g.totalHp;
                if (hp / myDps() <= 15.0f) return false;
            }
        }
    }
    const int a = nearestAltar(pos);
    if (a < 0) return false;
    const vec2 ap = altars[a].pos;
    if (cheb(pos, ap) <= bc::constants::submit_gems_range) {
        try {
            me.submit_gems(ap);
            return true;
        } catch (...) {}
    }
    bc::bitboard goals;
    goals.draw_chebyshev(ap, bc::constants::submit_gems_range);
    moveToward(goals, true, true);
    if (cheb(me.position(), ap) <= bc::constants::submit_gems_range && !movedThisTurn) {
        try { me.submit_gems(ap); } catch (...) {}
    }
    return true;
}

// ------------------------------------------------------------------ farming
void Bot::farm() {
    auto& me = bc::self();
    const vec2 pos = me.position();
    int t = chooseTarget();
    if (capturing && target >= 0) t = target;  // never abandon a capture in progress
    if (t != target) { target = t; capturing = false; captureSince = -1; }
    if (target < 0) return;
    auto& g = groups[target];
    const bool tileVisible = !(g.tilesBB & bc::vision::visible_tiles()).is_empty();
    bool anyCampVisible = false;
    for (auto& c : safeCamps()) {
        try { if (g.tilesBB.is_set(c.spawn_position())) { anyCampVisible = true; break; } } catch (...) {}
    }
    if (tileVisible && g.state == 2 && !anyCampVisible) {
        // capture: stand on a spawn tile, alone
        if (g.tilesBB.is_set(pos)) {
            if (!capturing) { capturing = true; captureSince = round; }
            // Mite: recall during the capture when the reward completes a shopping trip
            const auto en = safeChamps(team::enemy);
            bool threat = false;
            for (auto& e : en) { try { if (e.is_alive() && cheb(e.position(), pos) <= 6) threat = true; } catch (...) {} }
            // ... but only when the bag will not be walked to an altar right away (far altar, small bag)
            const int a0 = nearestAltar(pos);
            const int dAlt = a0 >= 0 ? altars[a0].dist[idx(pos)] : UNR;
            const bool homeFirst = spawnAltarDist <= dAlt || dAlt > 20;
            if (!threat && homeFirst && round - captureSince >= 1 && static_cast<int>(me.gold_count()) + g.gold >= 150 && !me.is_recalling()) {
                try { me.recall(); } catch (...) {}
            }
            return;
        }
        if (allyCapturing(g.id)) { target = -1; capturing = false; return; }
        capturing = false;
        moveToward(g.tilesBB, true);
        if (g.tilesBB.is_set(me.position())) { capturing = true; captureSince = round; }
        return;
    }
    capturing = false;
    if (anyCampVisible || (tileVisible && g.state == 1)) {
        if (attackCampsOf(target) && ranged) return;
        if (!ranged && attackedThisTurn) return;
        // move into attack range of the closest live camp of the group
        bc::bitboard goals;
        for (auto& c : safeCamps()) {
            try { if (g.tilesBB.is_set(c.spawn_position())) goals.draw_chebyshev(c.position(), me.attack_range()); } catch (...) {}
        }
        if (goals.is_empty()) for (auto tt : g.tiles) goals.draw_chebyshev(tt, me.attack_range());
        if (!attackedThisTurn || !ranged) moveToward(goals, true);
        if (!attackedThisTurn) attackCampsOf(target);
        return;
    }
    // not in sight yet (or respawning): walk next to it, never onto its spawn tiles
    // (an occupied spawn tile blocks the whole group's respawn)
    bc::bitboard goals;
    for (auto tt : g.tiles) goals.draw_chebyshev(tt, std::max(1, me.attack_range()));
    goals &= ~g.tilesBB;
    if (g.tilesBB.is_set(pos)) {
        moveToward(goals, false);
        return;
    }
    moveToward(goals, true, true);
    attackCampsOf(target);
}

// ------------------------------------------------------------------ willow
void Bot::willowTurn() {
    auto& me = bc::self();
    const vec2 pos = me.position();
    // heal the most-damaged ally in range when missing >= 180
    if (!castThisTurn && me.can_cast()) {
        for (auto ab : me.abilities()) {
            if (!ab.is_heal() || !ab.is_ready()) continue;
            std::optional<bc::champion> best;
            float miss = 179.0f;
            for (auto& a : safeChamps(team::ally)) {
                try {
                    if (!a.is_alive() || a == me) continue;
                    if (!ab.valid_tiles().is_set(a.position())) continue;
                    float m = a.max_health() - a.health();
                    if (m > miss) { miss = m; best = a; }
                } catch (...) {}
            }
            if (best) {
                try { if (ab.use(*best)) castThisTurn = true; } catch (...) {}
            }
        }
    }
    if (fightChampions()) return;
    if (doTribute()) return;
    // escort Cassi (or the nearest ally when Cassi is away)
    std::optional<bc::champion> leader;
    int ld = 99;
    for (auto& a : safeChamps(team::ally)) {
        try {
            if (!a.is_alive() || a == me) continue;
            int d = cheb(a.position(), pos);
            if (a.champion_name() == bc::champion_type::cassi) { leader = a; ld = d; break; }
            if (d < ld) { ld = d; leader = a; }
        } catch (...) {}
    }
    int leaderTarget = -1;
    if (cassiSlot >= 0 && cassiSlot < 8) leaderTarget = (shared[cassiSlot] & 0x3F) - 1;
    if (leaderTarget >= static_cast<int>(groups.size())) leaderTarget = -1;
    target = leaderTarget;
    // shoot camps of the leader's target that are already in range
    if (leaderTarget >= 0 && attackCampsOf(leaderTarget)) return;
    if (leader) {
        // stand within 3 of the leader's camps (to shoot) while staying within 3 of the leader
        bc::bitboard near;
        near.draw_chebyshev(leader->position(), 3);
        bc::bitboard shoot;
        if (leaderTarget >= 0) {
            for (auto& c : safeCamps()) {
                try { if (groups[leaderTarget].tilesBB.is_set(c.spawn_position())) shoot.draw_chebyshev(c.position(), me.attack_range()); } catch (...) {}
            }
        }
        auto goals = shoot & near;
        if (!goals.is_empty()) {
            if (!goals.is_set(pos)) moveToward(goals, false);
            return;
        }
        if (ld > 2) {
            bc::bitboard g2;
            g2.draw_chebyshev(leader->position(), 2);
            moveToward(g2, false, true);
        }
        return;
    }
    if (leaderTarget >= 0) {
        bc::bitboard goals;
        for (auto tt : groups[leaderTarget].tiles) goals.draw_chebyshev(tt, 3);
        moveToward(goals, false);
        return;
    }
    farm();
}

// ------------------------------------------------------------------ main turn
void Bot::play_turn() {
    auto& me = bc::self();
    if (!inited) {
        init();
        inited = true;
    }
    round = static_cast<int>(bc::round_number());
    movedThisTurn = attackedThisTurn = castThisTurn = false;
    readShared();

    if (!me.is_alive()) {
        target = -1;
        capturing = false;
        lowMode = false;
        wasSubmitting = false;
        shop();
        writeStatus(false);
        return;
    }
    stage = "know";
    updateKnowledge();

    const bool submittingNow = me.is_submitting_gems();
    const bool justSubmitted = wasSubmitting && !submittingNow && me.gem_count() == 0;
    wasSubmitting = submittingNow;

    if (me.is_recalling() || submittingNow || me.is_teleporting()) {
        setPriority(lowMode);
        writeStatus(lowMode);
        return;
    }
    if (onSpawn()) shop();

    // capture finished? (gems/gold arrived or the group is respawning)
    if (capturing && target >= 0) {
        auto& g = groups[target];
        if (g.state == 3 || static_cast<int>(me.gem_count()) > lastGems) {
            capturing = false;
            g.state = 3;
            if (g.respawnAt < round) g.respawnAt = round + g.respawn;
            target = -1;
        }
    }
    lastGems = static_cast<int>(me.gem_count());

    stage = "low";
    const bool low = handleLowHp();
    setPriority(lowMode);
    if (low) {
        writeStatus(true);
        return;
    }
    stage = "ward";
    placeWard();
    stage = "main";

    // shopping trip right after a tribute
    if (justSubmitted && me.gold_count() >= 150) {
        bool threat = false;
        for (auto& e : safeChamps(team::enemy)) {
            try { if (e.is_alive() && cheb(e.position(), me.position()) <= 6) threat = true; } catch (...) {}
        }
        if (!threat) {
            try { me.recall(); } catch (...) {}
            writeStatus(false);
            return;
        }
    }

    if (myType == bc::champion_type::willow) {
        stage = "willow";
        willowTurn();
        writeStatus(false);
        return;
    }
    stage = "fight";
    if (fightChampions() && (ranged || !me.can_move() || attackedThisTurn)) {
        // melee fighters may still walk after swinging, but stay on the enemy
        writeStatus(false);
        return;
    }
    stage = "tribute";
    if (doTribute()) {
        writeStatus(false);
        return;
    }
    stage = "farm";
    if (!capturing) {
        const vec2 p = me.position();
        for (auto& g : groups) {
            if (g.tilesBB.is_set(p) && g.state == 3) {
                bc::bitboard off;
                off.draw_chebyshev(p, 2);
                off &= ~g.tilesBB;
                moveToward(off, false);
                break;
            }
        }
    }
    farm();
    writeStatus(false);
}

}  // namespace mm
