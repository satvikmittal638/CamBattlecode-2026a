// Behavioural-cloning observer: an observation-only CAMBC bot run by turnhost --observe on the Intercontinental Fish
// side of a recorded game. At every Fish champion turn start it prints one "O" line with everything that champion's
// own bot could see through the SDK (personal vision): its own full state, every visible champion, every visible live
// camp, the state of camp groups with a visible tile, and visible wards. No action is taken; turnhost attaches the
// recorded actions (the labels). Static map layers come from the map file, not from here.
//
// Line format (sections '|', records ';', fields ','):
//   O round|S self|C champions|K camps|G groups
//   S: handle,type,x,y,hp,mhp,str,focus,range,state,gold,gems,cd0,cd1,priority,lock(0),tp(0),bankOwn,bankEnemy,items
//      (items = idx:count pairs joined by ':' groups of two, e.g. 24:3:27:1)
//   C: handle,team(0 ally,1 enemy),type,x,y,hp,mhp,str,focus,state,gems,cd0,cd1,shards
//   K: handle,x,y,type,hp,mhp,str,awake,group
//   G: group,state(1 alive,2 reward,3 respawning),timer
// Build: tools/build_fishbc_observer.sh
#include <cambc.h>
#include <cstdarg>
#include <cstdio>
#include <string>

namespace bc = cambc;
namespace sd = cambc::detail;
using bc::team;
using bc::vec2;

static std::string out;
static char buf[256];
static void add(const char* fmt, ...) __attribute__((format(printf, 1, 2)));
static void add(const char* fmt, ...) {
    va_list ap; va_start(ap, fmt); const int n = std::vsnprintf(buf, sizeof buf, fmt, ap); va_end(ap);
    if (n > 0) out.append(buf, std::min<int>(n, sizeof buf - 1));
}

static int shardsOf(const std::uint32_t* items) {
    int s = 0;
    for (int i = 0; i < 42; ++i) s += items[i] * ((i % 2) ? ((i / 6) == 1 ? 6 : 5) : 1);
    return s;
}

static void observe() {
    auto& me = bc::self();
    const unsigned selfId = static_cast<unsigned>(static_cast<bc::handle_champion_t>(me));
    sd::champion_info si{};
    if (sd::sdk_champion(selfId, &si)) return;
    out.clear();
    add("O %d|", static_cast<int>(bc::round_number()));
    // Consumables and ward ownership are not bridged by the replay harness; they are left out.
    std::uint32_t gold = 0, gems = 0, items[42]{}, cons[4]{};
    sd::sdk_champion_gold(selfId, &gold); sd::sdk_champion_gems(selfId, &gems);
    sd::sdk_champion_items(selfId, items);
    std::int32_t cd0 = -1, cd1 = -1; sd::sdk_champion_cooldown(selfId, 0, &cd0); sd::sdk_champion_cooldown(selfId, 1, &cd1);
    int prio = 0; try { prio = static_cast<int>(me.priority()); } catch (...) {}
    add("%u,%d,%d,%d,%.0f,%.0f,%.1f,%.1f,%d,%d,%u,%u,%d,%d,%d,%u,%u,%u,%u,", selfId, si.type, si.x, si.y, si.health, si.max_health, si.strength, si.focus,
        si.attack_range, si.state, gold, gems, cd0, cd1, prio, cons[2], cons[0], bc::global_submitted_gems(team::ally), bc::global_submitted_gems(team::enemy));
    bool first = true;
    for (int i = 0; i < 42; ++i) if (items[i]) { add(first ? "%d:%u" : ":%d:%u", i, items[i]); first = false; }
    out += '|';
    // Visible champions (both teams), excluding self.
    first = true;
    for (auto p : bc::vision::champion_tiles().positions()) {
        unsigned id = 0; sd::champion_info ci{};
        if (sd::sdk_champion_at(p.x, p.y, &id) || id == selfId || sd::sdk_champion(id, &ci) || !(ci.state & 1)) continue;
        std::uint32_t cg = 0, cit[42]{}; std::int32_t c0 = -1, c1 = -1;
        sd::sdk_champion_gems(id, &cg); sd::sdk_champion_items(id, cit); sd::sdk_champion_cooldown(id, 0, &c0); sd::sdk_champion_cooldown(id, 1, &c1);
        add("%s%u,%d,%d,%d,%d,%.0f,%.0f,%.1f,%.1f,%d,%u,%d,%d,%d", first ? "" : ";", id, ci.team == si.team ? 0 : 1, ci.type, ci.x, ci.y, ci.health, ci.max_health,
            ci.strength, ci.focus, ci.state, cg, c0, c1, shardsOf(cit));
        first = false;
    }
    out += '|';
    // Visible live camps and their groups.
    first = true;
    std::uint32_t seenGroups[96]; int nGroups = 0;
    for (auto p : bc::vision::camp_tiles().positions()) {
        unsigned id = 0; sd::camp_state cs{}; std::uint32_t st = 0, grp = 0;
        if (sd::sdk_camp_at(p.x, p.y, &id) || sd::sdk_camp(id, &cs) || sd::sdk_camp_state(id, &st) || st == 0) continue;
        sd::camp_info info{}; sd::sdk_map_camp_info(id, &info);
        sd::sdk_map_camp_group_of(id, &grp);
        add("%s%u,%d,%d,%u,%.0f,%.0f,%.1f,%d,%u", first ? "" : ";", id, p.x, p.y, static_cast<unsigned>(info.type), cs.health, cs.max_health, cs.strength, st == 1 ? 1 : 0, grp);
        first = false;
        bool known = false; for (int k = 0; k < nGroups; ++k) known |= seenGroups[k] == grp;
        if (!known && nGroups < 96) seenGroups[nGroups++] = grp;
    }
    out += '|';
    // Camp groups with any spawn tile in vision (state is only readable then).
    first = true;
    const auto vis = bc::vision::visible_tiles();
    for (const auto& g : bc::map::camp_groups()) {
        bool seen = false;
        for (const auto& c : g.camps()) if (vis.is_set(c.spawn_position())) { seen = true; break; }
        if (!seen) continue;
        std::uint32_t st = 0; std::int32_t timer = 0;
        const unsigned gid = static_cast<unsigned>(static_cast<bc::handle_camp_group_t>(g));
        if (sd::sdk_camp_group_state(gid, &st) || st == 0) continue;
        if (st == 3) sd::sdk_camp_group_cooldown(gid, &timer);
        add("%s%u,%u,%d", first ? "" : ";", gid, st, timer);
        first = false;
    }
    out += '\n';
    std::fwrite(out.data(), 1, out.size(), stdout);
}

// Static map knowledge every bot has without vision, printed once per champion instance:
//   M W,H|walls x,y;..|bushes|holes|altars|allySpawn|enemySpawn|groups gid,gold,gems,respawn,x:y:kind:...;..
static void mapRecord() {
    out.clear();
    add("M %d,%d", bc::map::width(), bc::map::height());
    auto layer = [&](const bc::bitboard& b) { out += '|'; bool f = true; for (auto p : b.positions()) { add(f ? "%d,%d" : ";%d,%d", p.x, p.y); f = false; } };
    layer(bc::map::walls()); layer(bc::map::bushes()); layer(bc::map::holes()); layer(bc::map::altars());
    layer(bc::map::spawn_region(team::ally)); layer(bc::map::spawn_region(team::enemy));
    out += '|';
    bool f = true;
    for (const auto& g : bc::map::camp_groups()) {
        add("%s%u,%u,%u,%d", f ? "" : ";", static_cast<unsigned>(static_cast<bc::handle_camp_group_t>(g)), g.gold_value(), g.gem_value(), g.max_respawn_timer());
        for (const auto& c : g.camps()) add(",%d:%d:%d", c.spawn_position().x, c.spawn_position().y, static_cast<int>(c.kind()));
        f = false;
    }
    out += '\n';
    std::fwrite(out.data(), 1, out.size(), stdout);
}

int main() {
    bool mapped = false;
    while (true) {
        try { if (!bc::is_draft()) { if (!mapped) { mapped = true; mapRecord(); } observe(); } }
        catch (const std::exception& e) { std::printf("OBS_ERROR %s\n", e.what()); }
        catch (...) { std::printf("OBS_ERROR unknown\n"); }
        bc::end_turn();
    }
}
