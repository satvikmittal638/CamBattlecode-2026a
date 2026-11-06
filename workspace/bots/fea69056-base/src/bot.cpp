// Coordinated farming with visibility-aware routes, useful splash targeting,
// bounded camp observations and recovery from verified movement/retreat cycles.
// Decisions use personal observations and compact advisory camp commitments.
#include "bot.h"
#include "fishx_features.h"
#include <algorithm>
#include <cmath>
#include <cstdio>
#include <optional>
#include <variant>
#include <type_traits>
#ifndef PHASE2_LOG
#define PHASE2_LOG 1
#endif

namespace bc = cambc;
using bc::team;
using bc::vec2;

namespace mm {

static constexpr std::uint16_t UNR = 0xFFFF;
static int frameRound = -1, apiErrors = 0, blockedActions = 0;
static bool stopped = false, stale = false;
static bool heavyFieldUsed = false;
bool frame_aborted() { return stopped; }
bool frame_stale() { return stale; }
int frame_errors() { return apiErrors; }
int frame_blocked() { return blockedActions; }
void invalidate_frame() { stopped=stale=true; }
static bool enough(std::uint64_t reserve = 18000) {
    if (stopped) return false;
    if (static_cast<int>(bc::round_number()) != frameRound) {
        stopped = stale = true;
        return false;
    }
    if (bc::fuel_remaining() < reserve) { if (bc::fuel_remaining()<18000) stopped=true; return false; }
    return true;
}
template<class F> static auto guarded(F&& f,const char* expression) {
    if (!enough()) throw TurnAbort{};
    try {
        if constexpr (std::is_void_v<std::invoke_result_t<F>>) {
            f();
            if (!enough(4000)) throw TurnAbort{};
        } else {
            auto result = f();
            if constexpr (std::is_same_v<decltype(result), bool>) if (!result) ++blockedActions;
            if (!enough(4000)) throw TurnAbort{};
            return result;
        }
    } catch (const bc::error& e) { ++apiErrors; if(apiErrors<=2)std::printf("API %d %s code %d\n",frameRound,expression,static_cast<int>(e.code())); throw; }
}
#define ACT(expression) guarded([&]() { return (expression); },#expression)
static bool excludesWalking(const bc::ability& ab);
static bool selfReady(const bc::ability& ab){return ab.info().has_value()&&!ab.is_on_cooldown()&&bc::self().can_cast();}
static int cheb(vec2 a, vec2 b) { return std::max(std::abs(a.x - b.x), std::abs(a.y - b.y)); }

static std::vector<bc::champion> safeChamps(team side) {
    std::vector<bc::champion> out;
    try {
        for (auto p : bc::vision::champion_tiles(side).positions()) {
            try { out.push_back(bc::vision::champion_at(p)); } catch (const TurnAbort&) { throw; } catch (...) {}
        }
    } catch (const TurnAbort&) { throw; } catch (...) {}
    return out;
}

// vision::camps() throws when a camp died earlier in this turn (stale occupancy); skip such tiles
static std::vector<bc::camp> safeCamps() {
    std::vector<bc::camp> out;
    try {
        for (auto p : bc::vision::camp_tiles().positions()) {
            if(!enough(28000))break;
            try { out.push_back(bc::vision::camp_at(p)); } catch (const TurnAbort&) { throw; } catch (...) {}
        }
    } catch (const TurnAbort&) { throw; } catch (...) {}
    return out;
}

static float baseDps(int t) {
    // rough per-turn damage incl. ability share, by champion_type
    static const float tbl[12] = {55, 50, 80, 47, 46, 60, 50, 57, 50, 56, 60, 62};
    return (t >= 0 && t < 12) ? tbl[t] : 50.0f;
}

int Bot::heuristic(const std::vector<vec2>& roots, vec2 p) const {
    int best = UNR;
    for (auto t : roots) best = std::min(best, cheb(t, p));
    return best;
}
std::unique_ptr<Route> Bot::newRoute(const std::vector<vec2>& roots) const {
    auto r = std::make_unique<Route>();
    r->roots = roots;
    return r;
}
void Bot::expand(Route& r, int /*nodeLimit*/) {
    if (r.complete || heavyFieldUsed || !enough(76000)) return;
    heavyFieldUsed = true;
    bc::bitboard roots, visited;
    for (auto p : r.roots) roots.set(p, true);
    roots &= ~staticBlocked;
    r.distance.compute(staticBlocked, roots, visited);
    r.complete = true;
    // The immutable result remains usable, but no dynamic decision may continue
    // if an unexpectedly costly host search crossed a round boundary.
    enough();
}
int Bot::routeAt(const Route* r, vec2 p) const {
    if (!r || !r->complete) return -1;
    return r->distance.get(p);
}
std::uint16_t Bot::gdist(const Group& g, vec2 p) const {
    const int d = routeAt(g.route.get(), p);
    return d < 0 ? heuristic(g.tiles, p) : d;
}
std::uint16_t Bot::altarDistance(int a, vec2 p) const {
    const int d = routeAt(altars[a].route.get(), p);
    return d < 0 ? heuristic(altars[a].approaches, p) : d;
}
int Bot::homeDistance(vec2 p) const {
    const int d = routeAt(homeRoute.get(), p);
    return d < 0 ? heuristic(ownSpawnBB.positions(), p) : d;
}
void Bot::planWork() {
    if (recoveryActive) return;
    if (!enough(65000)) return;
    if (bc::self().gem_count()>0 && !altars.empty()) {
        const int a=nearestAltar(bc::self().position());
        if(a>=0){auto& al=altars[a];if(!al.route)al.route=newRoute(al.approaches);expand(*al.route,64);}
        return;
    }
    if (target >= 0 && target < static_cast<int>(groups.size())) {
        auto& g = groups[target];
        if (!g.route) g.route = newRoute(g.tiles);
        expand(*g.route, 64);
    }
}

// ------------------------------------------------------------------ init
void Bot::init() {
    auto& me = bc::self();
    if (!initStarted) {
        W = bc::map::width(); H = bc::map::height();
        myType = me.champion_name(); ranged = me.attack_range() > 1;
        ownSpawnBB = bc::map::spawn_region(team::ally);
        enemySpawnBB = bc::map::spawn_region(team::enemy);
        bushBB = bc::map::bushes();
        staticBlocked = bc::map::walls() | bc::map::holes() | bc::map::altars() | enemySpawnBB;
        terrain = staticBlocked.export_linear_buffer();
        tileGroup.assign(W * H, -1);campRanges.assign(W*H,0);
        rawGroups = bc::map::camp_groups(); groups.resize(rawGroups.size());stalledUntil.assign(groups.size(),0);
        auto byte = [](int i) { return std::to_integer<unsigned char>(bc::draft_memory[i]); };
        auto word = [&](int i) { return byte(i) | (byte(i+1) << 8); };
        draftValid = bc::draft_memory.size() >= 20 && byte(0)=='F' && byte(1)=='S' && byte(2)=='T' && byte(3)=='2' && byte(4)==1 && byte(5)==0xA5 && word(6)==W && word(8)==H && word(10)==static_cast<int>(groups.size()) && groups.size()<=251 && 20+4*groups.size()<=bc::draft_memory.size();
        if(draftValid){unsigned sum=0;for(int i=6;i<16;++i)sum+=byte(i);for(int i=20;i<20+4*static_cast<int>(groups.size());++i)sum+=byte(i);draftValid=(sum&65535)==static_cast<unsigned>(word(16));}
        if(draftValid)bankGateHint=byte(18)==0x47?static_cast<int>(byte(19))-1:-1;
        farMap = draftValid ? word(12)>60 : heuristic(enemySpawnBB.positions(), ownSpawnBB.positions().front())>60;
        closeSpawns=draftValid ? word(12)<=6 : heuristic(enemySpawnBB.positions(),ownSpawnBB.positions().front())<=6;
        spawnAltarDist = draftValid ? word(14) : UNR;
        for (auto a : bc::map::altars().positions()) {
            bc::bitboard approach; approach.draw_chebyshev(a, 1); approach &= ~staticBlocked;
            Altar al; al.pos=a; al.approaches=approach.positions(); altars.push_back(std::move(al));
            if (!draftValid) for (auto q : altars.back().approaches) spawnAltarDist=std::min(spawnAltarDist,heuristic(ownSpawnBB.positions(),q));
        }
        const auto mine=static_cast<std::uint32_t>(static_cast<bc::handle_champion_t>(me));
        std::vector<std::pair<std::uint32_t,int>> handles;
        for (auto a : bc::champions(team::ally)) handles.push_back({static_cast<std::uint32_t>(static_cast<bc::handle_champion_t>(a)),static_cast<int>(a.champion_name())});
        std::sort(handles.begin(), handles.end()); nAllies=handles.size(); slotType.resize(nAllies);
        for(const auto& a:handles)rosterHandles.push_back(a.first);
        for (int i=0;i<nAllies;++i) { slotType[i]=handles[i].second; if(handles[i].first==mine)slot=i; }
        for(int i=0;i<nAllies;++i) {
            if(slotType[i]==static_cast<int>(bc::champion_type::cassi))cassiSlot=i;
            if(myType==bc::champion_type::cassi && slotType[i]==static_cast<int>(bc::champion_type::issac))partnerSlot=i;
            if(myType==bc::champion_type::issac && slotType[i]==static_cast<int>(bc::champion_type::cassi))partnerSlot=i;
        }
        initStarted=true;
    }
    while(initNext<static_cast<int>(groups.size()) && enough(80000)) {
        auto& g=groups[initNext]; auto& rg=rawGroups[initNext];
        g.id=initNext; g.tilesBB=rg.spawn_tiles(); g.tiles=g.tilesBB.positions();
        g.gems=rg.gem_value(); g.gold=rg.gold_value(); g.respawn=rg.max_respawn_timer();
        long sx=0,sy=0;
        for(auto t:g.tiles){sx+=t.x;sy+=t.y;tileGroup[idx(t)]=g.id;}
        if(!g.tiles.empty())g.center={static_cast<int>(sx/g.tiles.size()),static_cast<int>(sy/g.tiles.size())};
        for(auto c:rg.camps()){auto st=c.base_stats();campRanges[idx(c.spawn_position())]=st.base_strength>0?st.base_attack_range:0;g.totalHp+=st.base_health;g.totalStr+=st.base_strength;g.clearOrder.push_back({st.base_health,st.base_strength});if(c.is_monolith())g.monolith=true;}
        std::sort(g.clearOrder.begin(),g.clearOrder.end(),[](auto a,auto b){return a.first/std::max(.01f,a.second)<b.first/std::max(.01f,b.second);});
        for(auto p:g.tiles){int n=0;for(auto q:g.tiles)if(cheb(p,q)<=1)++n;g.splashTargets=std::max(g.splashTargets,n);}
        g.hpLeft=g.totalHp;
        if(draftValid){int off=20+4*initNext;g.dOwn=std::to_integer<unsigned char>(bc::draft_memory[off])|(std::to_integer<unsigned char>(bc::draft_memory[off+1])<<8);g.dEnemy=std::to_integer<unsigned char>(bc::draft_memory[off+2])|(std::to_integer<unsigned char>(bc::draft_memory[off+3])<<8);}
        else {g.dOwn=heuristic(ownSpawnBB.positions(),g.center);g.dEnemy=heuristic(enemySpawnBB.positions(),g.center);}
        g.eligible=g.gems>0 && !g.monolith && g.dOwn!=UNR && g.dOwn<=g.dEnemy+4;
        ++initNext;
    }
    inited=initNext==static_cast<int>(groups.size());
    if(inited && std::none_of(groups.begin(),groups.end(),[](const Group& g){return g.eligible;})){
        // A map can offer only boss gem camps and ordinary gold camps.
        // Empty preferred targets must not mean remaining on spawn forever.
        for(auto& g:groups)g.eligible=g.gold>0 && !g.monolith && g.dOwn!=UNR && g.dOwn<=g.dEnemy+4;
        if(std::none_of(groups.begin(),groups.end(),[](const Group& g){return g.eligible;}))
            for(auto& g:groups)g.eligible=g.gold>0 && !g.monolith && g.dOwn!=UNR;
    }
}

void Bot::openingMove() {
    auto& me=bc::self(); if(!me.is_alive() || !enough())return;
    int best=-1,distance=UNR;
    for(int i=0;i<initNext;++i)if(groups[i].eligible){int d=heuristic(groups[i].tiles,me.position());if(d<distance){distance=d;best=i;}}
    target=best;
    if(best>=0 && attackCampsOf(best))return;
    bc::bitboard goals;
    if(best>=0)for(auto t:groups[best].tiles)goals.draw_chebyshev(t,me.attack_range());
    else goals.draw_chebyshev({W/2,H/2},1);
    moveToward(goals,true);
    stage="opening";
}

// ------------------------------------------------------------------ shared memory
void Bot::readShared() {
    bc::shared_memory.read(0,std::span<std::uint8_t>(shared,8));
    helpValid=helpReader.observe(shared[6]|(static_cast<unsigned>(shared[7])<<8),round);
}

void Bot::writeStatus(bool low) {
    if (slot >= 8) return;
    if (low) releaseCapture();
    refreshCapture();
    std::uint8_t v = 0;
    if (target >= 0 && target < 63) v = static_cast<std::uint8_t>(target + 1);
    if (capturing && bc::self().is_alive() && target>=0 && target<static_cast<int>(groups.size()) && groups[target].tilesBB.is_set(bc::self().position())) v |= 0x40;
    if (low) v |= 0x80;
    if (shared[slot] != v) {
        if (!enough()) throw TurnAbort{};
        bc::shared_memory[slot] = v;
        shared[slot] = v;
    }
}

void Bot::releaseCapture() {
    const bool hadClaim=capturing || (slot<8 && (shared[slot]&0x40));
    capturing=false; captureSince=-1;
    if(slot<8 && (shared[slot]&0x40)) {
        if(!enough())throw TurnAbort{};
        shared[slot]&=~0x40;
        bc::shared_memory[slot]=shared[slot];
    }
    if(hadClaim)recoveryReason(4,"claim-clear");
}
void Bot::refreshCapture() {
    auto& me=bc::self();
    bool actual=capturing && me.is_alive() && !lowMode && target>=0 && target<static_cast<int>(groups.size()) && groups[target].tilesBB.is_set(me.position());
    if(actual)try{actual=std::holds_alternative<bc::map::camp_group_reward_available>(rawGroups[target].state());}catch(const TurnAbort&){throw;}catch(...){actual=false;}
    if(!actual && (capturing || (slot<8 && (shared[slot]&0x40))))releaseCapture();
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
    std::vector<std::vector<std::pair<float,float>>> live(groups.size());
    bool scanComplete=true;
    for(auto tile:bc::vision::camp_tiles().positions()){
        if(!enough(42000)){scanComplete=false;break;}
        const int gid=tileGroup[idx(tile)];if(gid<0)continue;
        unsigned id;bc::detail::camp_state c{};
        if(bc::detail::sdk_camp_at(tile.x,tile.y,&id)||bc::detail::sdk_camp(id,&c)||c.health<=0)continue;
        hp[gid]+=c.health;anyCamp[gid]=1;live[gid].push_back({c.health,c.strength});
    }
    for (auto& g : groups) {
        if (!enough(34000)) break;
        bool visible=false; for(auto t:g.tiles)if(vis.is_set(t)){visible=true;break;}
        if (!visible){
            // An unobserved predicted respawn is UNKNOWN once due. Retaining
            // state3 forever would wait outside a blind shooting ring forever.
            // This does not assert an actual respawn: occupancy may delay it.
            if(g.state==3 && round>=g.respawnAt){g.state=0;g.hpLeft=g.totalHp;}
            continue;
        }
        try {
            auto st = rawGroups[g.id].state();
            if (std::holds_alternative<bc::map::camp_group_alive>(st)) {
                g.state = 1;
                g.fullyObserved=scanComplete&&std::all_of(g.tiles.begin(),g.tiles.end(),[&](auto p){return vis.is_set(p);});
                // A visible subset is not the whole remaining group.
                g.hpLeft = g.fullyObserved ? hp[g.id] : g.totalHp;
                if(g.fullyObserved){g.liveOrder=live[g.id];std::sort(g.liveOrder.begin(),g.liveOrder.end(),[](auto a,auto b){return a.first/std::max(.01f,a.second)<b.first/std::max(.01f,b.second);});}
            } else if (std::holds_alternative<bc::map::camp_group_reward_available>(st)) {
                g.state = 2;
                g.hpLeft = 0;
            } else {
                g.state = 3;
                g.respawnAt = round + std::get<bc::map::camp_group_respawning>(st).timer;
            }
            g.seenRound = round;
        } catch (const TurnAbort&) { throw; } catch (...) {}
    }
    // Peer occupancy is advisory coordination, not evidence that a reward was
    // captured. Only a visible authoritative group state sets respawnAt.
}

bool Bot::groupAlive(const Group& g) const {
    if (g.state == 3) return round >= g.respawnAt;
    return g.state != 2;
}

// ------------------------------------------------------------------ priority / shop / wards
void Bot::setPriority(bool low) {
    auto& me = bc::self();
    int desired = 0;
    if (X_PRIO && myType != bc::champion_type::willow) {
        // Fish: champions within 6 of an enemy act first (casters with a spell ready first);
        // otherwise healthy before wounded, and gem carriers last.
        const float hpf = me.health() / std::max(1.0f, me.max_health());
        bool near = false;
        try { for (auto p : bc::vision::champion_tiles(team::enemy).positions()) if (cheb(p, me.position()) <= 6) { near = true; break; } } catch (const TurnAbort&) { throw; } catch (...) {}
        if (near) {
            bool spell = false;
            try { for (auto ab : me.abilities()) if (selfReady(ab) && (ab.is_cc() || ab.is_damage() || ab.is_aoe_damage())) spell = true; } catch (const TurnAbort&) { throw; } catch (...) {}
            desired = 1 + (spell ? 4 : 0) + (ranged ? 3 : 0) + static_cast<int>(std::floor(2.0f * hpf));
        } else {
            desired = static_cast<int>(std::floor(10.0f * hpf)) - 10 - (me.gem_count() > 0 ? 5 : 0);
            desired = std::max(-10, desired);
        }
    } else if (low) desired = 1000;
    else if (myType == bc::champion_type::willow) desired = 1;
    else desired = static_cast<int>(std::floor(me.strength())) + 10;
    try {
        if (me.priority() != desired) ACT(me.set_priority(desired));
    } catch (const TurnAbort&) { throw; } catch (...) {}
}

bool Bot::onSpawn() const {
    auto& me = bc::self();
    return me.is_alive() && ownSpawnBB.is_set(me.position());
}

void Bot::shop() {
    auto& me = bc::self();
    if (me.is_alive() && !onSpawn() && myType!=bc::champion_type::tavi) return;
    // family index: 0 monster 1 power 2 durability 3 treasure 4 jungle 5 home 6 bruiser; stat 0 str 1 focus 2 health
    struct Step { int fam, stat, count; };
    std::vector<Step> plan;
    const bool focusUser = myType == bc::champion_type::heart_of_ruin || myType == bc::champion_type::cassi || myType == bc::champion_type::stellar || myType == bc::champion_type::prism || (!X_GATEDRAFT&&bankGateHint>=0&&myType!=bc::champion_type::issac);
    if (focusUser) {
        plan = {{4, 1, 5}, {2, 1, 5}, {1, 1, 1000}};
    } else if (farMap) {
        plan = {{4, 0, 5}, {1, 0, 5}, {2, 0, 5}, {6, 2, 5}, {1, 0, 1000}};
    } else {
        plan = {{4, 0, 5}, {2, 0, 5}, {6, 2, 5}, {1, 0, 1000}};
    }
    if(myType==bc::champion_type::heart_of_ruin)plan={{4,1,5},{2,1,5},{1,1,1000}};
    if(myType==bc::champion_type::ren&&bankGateHint<0)plan={{6,2,5},{2,2,5},{1,1,1000}};
    if (X_BUILDSTELLAR && !X_BUILD && bankGateHint < 0 && myType == bc::champion_type::stellar)
        plan = {{1, 1, 5}, {5, 2, 5}, {2, 2, 5}, {1, 1, 1000}};  // Fish's Stellar: Power Focus, Home Health, Durability Health, Power Focus
    if (X_BUILD && bankGateHint < 0) {
        // Fish's emblem orders (family: 0 monster 1 power 2 durability 3 treasure 4 jungle 5 home 6 bruiser; stat 0 str 1 focus 2 health)
        using ct = bc::champion_type;
        if (myType == ct::stellar || myType == ct::prism) plan = {{1, 1, 5}, {5, 2, 5}, {2, 2, 5}, {1, 1, 1000}};
        else if (myType == ct::ren) plan = {{6, 2, 5}, {2, 2, 5}, {1, 1, 1000}};
        else if (myType == ct::cassi) plan = {{1, 1, 5}, {2, 1, 5}, {6, 2, 5}, {1, 1, 1000}};
        else if (myType == ct::issac || myType == ct::varg) plan = {{1, 0, 5}, {5, 2, 5}, {2, 2, 5}, {1, 0, 1000}};
        else if (myType == ct::ryth) plan = {{6, 2, 5}, {2, 2, 5}, {1, 0, 1000}};
        else if (myType == ct::tavi) plan = {{3, 1, 5}, {2, 1, 5}, {1, 1, 1000}};
        else if (myType == ct::vendetta) plan = {{0, 0, 5}, {1, 0, 1000}};
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
                ACT(me.buy(shard, chunk));
                n -= chunk;
                gold = static_cast<int>(me.gold_count());
                counts = me.item_count();
            }
            have = static_cast<int>(counts[shard]) + 5 * static_cast<int>(counts[emblem]);
            if (st.fam == 1 && st.count >= 1000) { if (gold < 30) break; else continue; }
            if (have < st.count) break;
        }
    } catch (const TurnAbort&) { throw; } catch (...) {}
}

void Bot::placeWard() {
    auto& me = bc::self();
    try {
        if (me.ward_cooldown() > 0 || me.restrictions().contains(bc::buff_restrictions::ward)) return;
        const vec2 pos = me.position();
        auto wards = me.ward_positions();
        const bool has = !wards.empty();
        if (has && cheb(wards[0], pos) < 7) return;
        auto cand = me.ward_placement_tiles() & bushBB & ~bc::vision::ward_tiles(team::ally);
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
        if (best != pos || cand.is_set(pos)) ACT(me.place_ward(best));
    } catch (const TurnAbort&) { throw; } catch (...) {}
}

// ------------------------------------------------------------------ movement
bc::bitboard Bot::blockedNow() const {
    auto b = staticBlocked | bc::vision::champion_tiles() | bc::vision::camp_tiles() | bc::vision::teleport_tiles();
    b.set(bc::self().position(), false);
    return b;
}

bool Bot::useDashToward(const Route& route) {
    auto& me=bc::self(); if(castThisTurn || !me.can_cast() || !enough(35000))return false;
    const vec2 pos=me.position();
    if(recoveryActive && (!recoveryValid || blockedNow()!=recoveryBlocked)){recoveryValid=false;return false;}
    int current=recoveryActive?recoveryAt(pos):routeAt(&route,pos);
    if(current<0 && !recoveryActive)current=heuristic(route.roots,pos);
    if(current<0)return false;
    for(auto ab:me.abilities()) {
        if(!ab.is_dash() || !selfReady(ab))continue;
        auto blocked=blockedNow(); auto passable=blocked & ~bc::map::holes();
        // The engine dash rule is a bounded path through nonblocking tiles,
        // allowing holes in transit and requiring an empty legal landing.
        // Every bounded path candidate already lies in the same range mask.
        const int steps=static_cast<int>(std::get<bc::ability_dash>(*ab.info()).range);
        auto reach=passable.reachable_tiles(pos,steps) & ~blocked;
        std::vector<std::pair<int,vec2>> options;
        for(auto t:reach.positions()){if(!enough(28000))break;int d=recoveryActive?recoveryAt(t):routeAt(&route,t);if(d<0 && !recoveryActive)d=heuristic(route.roots,t);if(d>=0 && d!=UNR && d+1<current)options.push_back({d,t});}
        std::sort(options.begin(),options.end(),[](auto& a,auto& b){return a.first<b.first;});
        for(std::size_t i=0;i<options.size() && i<3 && enough(22000);++i)try{if(capturing && (target<0 || target>=static_cast<int>(groups.size()) || !groups[target].tilesBB.is_set(options[i].second)))releaseCapture();if(ACT(ab.use(options[i].second))){castThisTurn=true;return true;}}catch(const TurnAbort&){throw;}catch(...){}
        return false;
    }
    return false;
}

void Bot::noteMotion(vec2 position) {
    if(motionRound==round)return;
    motionRound=round;
    int distance=routeAt(moveRoute.get(),position);
    if(distance<0)distance=heuristic(moveRoute->roots,position);
    if(distance<goalBest){goalBest=distance;stalledMoves=0;motionHistory.clear();recoveryActive=false;recoveryValid=false;}
    else ++stalledMoves;
    motionHistory.push_back(position);
    if(motionHistory.size()>12)motionHistory.erase(motionHistory.begin());
    const int repeats=std::count(motionHistory.begin(),motionHistory.end(),position);
    if(!recoveryActive && ((motionHistory.size()>=7 && repeats>=2 && stalledMoves>=6) || stalledMoves>=10)){recoveryActive=true;recoveryReason(1,"cycle");}
}

void Bot::recoveryReason(int code,const char* reason) {
    if(!PHASE2_LOG || (lastReasonCode==code && round-lastReasonRound<8) || !enough(12000))return;
    lastReasonCode=code;lastReasonRound=round;
    std::printf("recovery %d %d %s goal %d progress %d stalled %d\n",round,static_cast<int>(myType),reason,target,goalBest,stalledMoves);
    std::fflush(stdout);
}

void Bot::prepareRecovery() {
    auto& me=bc::self();
    if(!recoveryActive || !me.is_alive() || !me.can_move() || me.is_recalling() || me.is_submitting_gems() || me.is_teleporting())return;
    const auto pos=me.position(); auto blocked=blockedNow(); auto goals=moveGoals & ~blocked;
    if(recoveryValid && recoveryOrigin==pos && recoveryBlocked==blocked && recoveryGoals==goals)return;
    recoveryValid=false;
    if(goals.is_empty() || heavyFieldUsed || !enough(76000))return;
    // Every ordinary step and every two-step dash after that step is queried.
    // Requests are a complete open radius-three footprint, including the origin.
    bc::bitboard queries,visited;
    queries.draw_chebyshev(pos,3);queries&=~blocked;queries.set(pos,true);
    heavyFieldUsed=true;
    recoveryField.compute_to(blocked,goals,queries,visited,48);
    if(!enough(22000))return;
    recoveryBlocked=blocked;recoveryGoals=goals;recoveryOrigin=pos;recoveryValid=true;
    recoveryReason(2,"dynamic-field");
}

int Bot::recoveryAt(vec2 position) const {
    if(!recoveryValid || cheb(position,recoveryOrigin)>3)return -1;
    const int d=recoveryField.get(position);
    return d==UNR?-1:d; // partial search: this is unknown, never global impossibility
}

bool Bot::moveToward(const bc::bitboard& goalsIn, bool allowDash, bool bushy) {
    auto& me=bc::self();stage="route";
    fallbackGoals=goalsIn;fallbackRequested=true;
    if(!me.can_move() || !enough(X_ROUTEFUEL))return false;
    const auto pos=me.position();const auto blocked=blockedNow();
    const auto goals=goalsIn & ~blocked;
    if(goals.is_empty()){stage="route-occupied";return false;}
    if(goals.is_set(pos))return false;
    // The old speculative group field consumed the only search before the
    // actual destination was known. Search this real goal, with live blockers,
    // until SELF is reached. No arbitrary 48-step ceiling and no uphill step.
    if(heavyFieldUsed){stage="route-budget";return quietTurns>=2?cheapStep(goalsIn):false;}
    if(!moveRoute)moveRoute=newRoute({});
    bc::bitboard origin,visited;origin.set(pos,true);
    heavyFieldUsed=true;recoveryActive=recoveryValid=false;
    moveRoute->distance.compute_to(blocked,goals,origin,visited);
    if(!enough(16000)){stage="route-budget";return false;}
    moveRoute->complete=true;moveRoute->roots=goals.positions();
    const int here=moveRoute->distance.get(pos);
    if(here==UNR){stage="route-unreachable";return false;}
    std::vector<std::pair<int,vec2>> steps;
    for(auto t:blocked.reachable_tiles(pos,1).positions()){
        if(t==pos || !visited.is_set(t))continue;
        const int d=moveRoute->distance.get(t);
        if(d>=here)continue;
        int score=d*32+(t==previousTile?4:0)-(bushy&&bushBB.is_set(t)?1:0);
        steps.push_back({score,t});
    }
    std::sort(steps.begin(),steps.end(),[](const auto& a,const auto& b){return a.first<b.first;});
    bool moved=false;
    for(auto [score,t]:steps){
        try{
            if(capturing && (target<0 || !groups[target].tilesBB.is_set(t)))releaseCapture();
            if(ACT(me.move_absolute(t))){previousTile=pos;moved=movedThisTurn=true;break;}
        }catch(const TurnAbort&){throw;}catch(...){}
        if(!enough())break;
    }
    // A newly revealed occupant invalidates the old dynamic field for dashing.
    if(allowDash && enough(24000) && blockedNow()==([&]{auto b=blocked;b.set(me.position(),false);b.set(pos,false);return b;})())
        if(useDashToward(*moveRoute))movedThisTurn=true;
    stage=movedThisTurn?"route-step":"route-blocked";
    return moved || movedThisTurn;
}

// X_MELEEHIT: a melee champion may attack and still move in the same turn, so it hits the
// lowest-health adjacent enemy champion before any retreat step (ranked top-60 losses: our melee
// hit an adjacent enemy 55-67% of such turns, theirs 97-100%).
void Bot::meleeParting() {
    if (!X_MELEEHIT || ranged || attackedThisTurn) return;
    auto& me = bc::self();
    try {
        if (!me.can_attack()) return;
        const vec2 pos = me.position(); const int r = me.attack_range();
        std::optional<bc::champion> best; float bh = 1e9f;
        for (auto& e : safeChamps(team::enemy)) {
            try { if (e.is_alive() && e.is_visible() && cheb(e.position(), pos) <= r && e.health() < bh) { bh = e.health(); best = e; } } catch (const TurnAbort&) { throw; } catch (...) {}
        }
        if (best) { ACT(me.attack(*best)); attackedThisTurn = true; stage = "x-melee-parting"; }
    } catch (const TurnAbort&) { throw; } catch (...) {}
}
bool Bot::escapeHome(const std::vector<vec2>& threats) {
    if (X_MELEEHIT) meleeParting();
    auto& me=bc::self();releaseCapture();
    recoveryActive=recoveryValid=false;motionHistory.clear();
    if(!enough(36000)||!me.can_move())return false;
    const auto pos=me.position();const auto blocked=blockedNow();
    bc::distance_field home;bc::bitboard origin,visited;origin.set(pos,true);
    bool exact=false;
    if(!heavyFieldUsed){
        const auto roots=ownSpawnBB & ~blocked;
        if(!roots.is_empty()){
            heavyFieldUsed=true;home.compute_to(blocked,roots,origin,visited);
            if(!enough(18000))return false;
            exact=home.get(pos)!=UNR;
        }
    }
    const auto distance=[&](vec2 p){
        if(exact&&visited.is_set(p))return static_cast<int>(home.get(p));
        return exact?100000:heuristic(ownSpawnBB.positions(),p);
    };
    const auto danger=[&](vec2 p){int value=0;for(auto t:threats)value+=std::max(0,4-cheb(p,t));return value;};
    vec2 best=pos,fallback=pos;long bestScore=static_cast<long>(danger(pos))*100000+distance(pos)*64;
    int fallbackDistance=distance(pos);
    for(auto p:blocked.reachable_tiles(pos,1).positions()){
        const int d=distance(p);
        const long score=static_cast<long>(danger(p))*100000+d*64+(p==previousTile?1:0);
        if(score<bestScore){bestScore=score;best=p;}
        if(d<fallbackDistance){fallbackDistance=d;fallback=p;}
    }
    // In a concave corridor, reaching home can require one locally exposed
    // step. Prefer separation, but never hold forever at a local minimum.
    if(best==pos)best=fallback;
    if(best==pos){stage="retreat-blocked";return false;}
    try{if(ACT(me.move_absolute(best))){previousTile=pos;movedThisTurn=true;stage="retreat-home";return true;}}catch(const TurnAbort&){throw;}catch(...){}
    // A home-directed dash must not undo a safe separation step. Walk and
    // recall once out of actual range; retain dash for the next normal route.
    return false;
}

bool Bot::moveAway(const std::vector<vec2>& threats) {
    if (X_MELEEHIT) meleeParting();
    if(stalledRetreat)return escapeHome(threats);
    auto& me = bc::self();
    releaseCapture();
    recoveryActive=recoveryValid=false;motionHistory.clear();motionRound=-1;goalBest=UNR;stalledMoves=0;
    if (!me.can_move()) return false;
    const vec2 pos = me.position();
    auto blocked = blockedNow();
    vec2 best = pos;
    long bestScore = -1000000;
    for (auto t : blocked.reachable_tiles(pos, 1).positions()) {
        int mind = 99;
        for (auto e : threats) mind = std::min(mind, cheb(t, e));
        int ds = homeDistance(t); if (ds == UNR) ds = 999;
        long s = mind * 100 - ds;
        if (s > bestScore) { bestScore = s; best = t; }
    }
    bool moved = false;
    if (best != pos) {
        try { moved = ACT(me.move_absolute(best)); } catch (const TurnAbort&) { throw; } catch (...) {}
    }
    if (moved) movedThisTurn = true;
    // dash home if possible
    if (!castThisTurn && me.can_cast()) {
        if (!homeRoute) homeRoute = newRoute(ownSpawnBB.positions());
        if (enough(48000)) expand(*homeRoute, 64);
        useDashToward(*homeRoute);
    }
    return moved;
}

bool Bot::yieldToAllies() {
    auto& me=bc::self();
    if(capturing || !me.is_alive() || !me.can_move() || me.is_recalling() || me.is_submitting_gems() || me.is_teleporting() || !enough(42000))return false;
    const vec2 pos=me.position();
    if(ownSpawnBB.is_set(pos))return false;
    const int myGroup=tileGroup[idx(pos)];
    if(myGroup>=0 && groups[myGroup].state==2)return false;
    std::optional<bc::champion> peer;
    for(auto a:safeChamps(team::ally)){
        if(a==me || !a.is_alive() || cheb(a.position(),pos)>1 || a.is_recalling() || a.is_submitting_gems() || a.is_teleporting())continue;
        const int gid=tileGroup[idx(a.position())];
        if(gid>=0 && groups[gid].state==2)continue;
        peer=a;break;
    }
    if(!peer){yieldPeerSince=-1;return false;}
    const auto handle=static_cast<std::uint32_t>(static_cast<bc::handle_champion_t>(*peer));
    const vec2 peerPos=peer->position();
    // Persistent nearby traffic is sufficient; the same ally need not remain
    // stationary (a rotating queue can otherwise keep this blocker idle forever).
    if(yieldOwnPosition==pos && yieldPeerLastRound==round-1){}
    else yieldPeerSince=round;
    yieldPeer=handle;yieldPeerPosition=peerPos;yieldOwnPosition=pos;yieldPeerLastRound=round;
    if(round-yieldPeerSince<1)return false;
    auto blocked=blockedNow(); std::vector<vec2> threats;
    for(auto e:safeChamps(team::enemy))if(e.is_alive())threats.push_back(e.position());
    const auto dangerAt=[&](vec2 t){
        int danger=0;
        for(auto e:threats)danger+=std::max(0,4-cheb(t,e))*200;
        return danger;
    };
    const int stayDanger=dangerAt(pos);
    vec2 best=pos;int bestScore=-1000000;
    for(auto t:blocked.reachable_tiles(pos,1).positions()){
        if(t==pos)continue;
        const int danger=dangerAt(t);
        if(danger>stayDanger)continue;
        int score=cheb(t,peerPos)*20 + static_cast<int>(staticBlocked.reachable_tiles(t,1).count());
        score-=danger;
        if(score>bestScore){bestScore=score;best=t;}
    }
    if(best==pos)return false;
    try{if(ACT(me.move_absolute(best))){movedThisTurn=true;previousTile=pos;stage="ally-yield";yieldPeerSince=-1;recoveryReason(3,"ally-yield");return true;}}catch(const TurnAbort&){throw;}catch(...){}
    return false;
}

int Bot::nearestAltar(vec2 p) const {
    int best = -1, bd = UNR;
    for (std::size_t i = 0; i < altars.size(); ++i) {
        if(static_cast<int>(i)==bankAvoid&&round<bankAvoidUntil&&altars.size()>1)continue;
        int d = altarDistance(static_cast<int>(i), p);
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
        if (!ab.is_attack_reset() || !selfReady(ab)) continue;
        try {
            if (ACT(ab.use())) {
                castThisTurn = true;
                if (tgt && me.can_attack()) {
                    try {
                        if (tgt->is_visible() && tgt->health() > 0 && cheb(tgt->position(), me.position()) <= me.attack_range()) ACT(me.attack(*tgt));
                    } catch (const TurnAbort&) { throw; } catch (...) {}
                }
            }
        } catch (const TurnAbort&) { throw; } catch (...) {}
        return;
    }
}

bool Bot::castOnEnemy(const bc::champion& e) {
    auto& me = bc::self();
    if (!enough(26000) || castThisTurn || !me.can_cast()) return false;
    for (auto ab : me.abilities()) {
        if (!selfReady(ab)) continue;
        const bool offensive = ab.is_damage() || ab.is_cc() || ab.is_aoe_damage();
        if (!offensive) continue;
        if (movedThisTurn && excludesWalking(ab)) continue;
        try {
            if (!ab.valid_tiles().is_set(e.position())) continue;
            bool ok = ab.can_target_ground() && !ab.can_target_enemies() ? ACT(ab.use(e.position())) : ACT(ab.use(e));
            if (ok) { castThisTurn = true; return true; }
        } catch (const TurnAbort&) { throw; } catch (...) {}
    }
    return false;
}

bool Bot::castOnCamp(const bc::camp& c) {
    auto& me = bc::self();
    stage = "castcamp";
    if (!enough(26000) || castThisTurn || !me.can_cast()) return false;
    for (auto ab : me.abilities()) {
        if (!selfReady(ab)) continue;
        // Cassi's stun is kept for champions; damage spells (incl. Ren's damage+stun) go on camps
        bool dmg = ab.is_damage() || ab.is_aoe_damage() || (ab.is_cc() && (myType == bc::champion_type::ren || myType == bc::champion_type::ryth));
        if (X_CAMPSTUN && !dmg && ab.is_cc()) {
            // NOTE: castOnCamp has no callers in this bot (the live camp path is attackCampsOf in
            // v1_camp_executor.h, which implements X_CAMPSTUN); kept only for parity with tm30.
            bool enemyNear = false;
            try { for (auto p : bc::vision::champion_tiles(team::enemy).positions()) if (cheb(p, me.position()) <= 7) { enemyNear = true; break; } } catch (const TurnAbort&) { throw; } catch (...) {}
            dmg = !enemyNear && c.strength() > 0;
        }
        if (!dmg) continue;
        if (movedThisTurn && excludesWalking(ab)) continue;
        try {
            if (!ab.valid_tiles().is_set(c.position())) continue;
            bool ok = ab.can_target_ground() && !ab.can_target_camps() ? ACT(ab.use(c.position())) : ACT(ab.use(c));
            if (ok) { castThisTurn = true; return true; }
        } catch (const TurnAbort&) { throw; } catch (...) {}
    }
    return false;
}

static bool excludesWalking(const bc::ability& ab) {
    try {
        const auto& inf = ab.info();
        if (!inf) return false;
        return std::visit([](const auto& x) { return x.exclusive_with_movement; }, *inf);
    } catch (const TurnAbort&) { throw; } catch (...) { return false; }
}

static bool useShield() {
    auto& me = bc::self();
    if (!me.can_cast()) return false;
    for (auto ab : me.abilities()) {
        if (!ab.is_shield() || !selfReady(ab)) continue;
        try { return ACT(ab.use()); } catch (const TurnAbort&) { throw; } catch (...) {}
    }
    return false;
}

float Bot::myDps() const {
    auto& me=bc::self();const float S=me.strength(),F=me.focus();float cast=0;
    if(myType==bc::champion_type::cassi||myType==bc::champion_type::stellar)cast=2*F;
    else if(myType==bc::champion_type::prism)cast=1.5f*F;
    else if(myType==bc::champion_type::ren)cast=1.25f*F;
    else if(myType==bc::champion_type::tavi)cast=std::max(S,1.4f*F);
    else if(myType==bc::champion_type::ryth)cast=std::max(S,F);
    else cast=S;
    return std::max(1.0f,S+cast/8);
}

float Bot::typeDps(int type) const { return baseDps(type); }

// ------------------------------------------------------------------ low hp
bool Bot::handleLowHp(bool statusOnly) {
    auto& me = bc::self();
    bc::detail::champion_info own{};
    const unsigned id=static_cast<unsigned>(static_cast<bc::handle_champion_t>(me));
    bc::detail::check(bc::detail::sdk_champion(id,&own));
    const float hpf=own.health/std::max(1.0f,own.max_health);
    static bool prevPartnerLow = false;
    const bool partnerLow = partnerSlot >= 0 && partnerSlot < 8 && (shared[partnerSlot] & 0x80);
    const bool partnerRise = partnerLow && !prevPartnerLow;
    prevPartnerLow = partnerLow;
    if (ownSpawnBB.is_set({own.x,own.y})) {
        stalledRetreat=false;lowTrail.clear();
        if (own.health >= own.max_health - 0.5f) { lowMode = false; return false; }
        if (lowMode) return true;  // stay on spawn until healed (heal happens at our turn end)
        return false;
    }
    if (!lowMode && (hpf < 0.35f || partnerRise)) lowMode = true;
    if (lowMode && hpf >= 0.6f && !partnerLow) lowMode = false;
    if(statusOnly)return lowMode;
    if (!lowMode){stalledRetreat=false;lowTrail.clear();return false;}
    progressKind=recovery;
    const auto lowPos=vec2{own.x,own.y};const float lowHp=own.health;
    if(lowHp>lastLowHp+1)lowTrail.clear();
    lastLowHp=lowHp;lowTrail.push_back(lowPos);
    if(lowTrail.size()>12)lowTrail.erase(lowTrail.begin());
    if(lowTrail.size()>=6 && std::count(lowTrail.begin(),lowTrail.end(),lowPos)>=3)stalledRetreat=true;
    releaseCapture();

    const vec2 pos = vec2{own.x,own.y};
    std::vector<vec2> threats;
    for (auto& e : safeChamps(team::enemy)) {
        try { if (e.is_alive() && cheb(e.position(), pos) <= 6) threats.push_back(e.position()); } catch (const TurnAbort&) { throw; } catch (...) {}
    }
    // awake (damaged) camps within their range 3 would interrupt the recall too
    for(auto tile:bc::vision::camp_tiles().positions()){
        const int range=campRanges[idx(tile)];if(range==0||cheb(tile,pos)>range)continue;
        if(!enough(32000)){threats.push_back(tile);continue;}
        unsigned camp=0,state=0;bc::detail::camp_state current{};
        if(!bc::detail::sdk_camp_at(tile.x,tile.y,&camp)&&!bc::detail::sdk_camp(camp,&current)&&current.strength>0&&!bc::detail::sdk_camp_state(camp,&state)&&state==1)threats.push_back(tile);
    }
    if (me.is_recalling()) return true;
    if (threats.empty()) {
        // X_RECALLGUARD: a recall issued last turn that was cancelled by damage from an unseen
        // source (e.g. a camp behind a wall) is not reissued in place; walk home first.
        if (X_RECALLGUARD && round - recallTryRound <= 1 && own.health < recallTryHp - 0.5f) {
            recallTryHp = own.health; recallTryRound = round;
            if (escapeHome(threats)) { stage = "x-recall-guard"; return true; }
        }
        if (X_RECALLGUARD) { recallTryRound = round; recallTryHp = own.health; }
        try { ACT(me.recall()); } catch (const TurnAbort&) { throw; } catch (...) {}
        return true;
    }
    // finish an enemy that is almost dead in range, otherwise run home
    if (me.can_attack()) {
        for (auto& e : safeChamps(team::enemy)) {
            try {
                if (e.is_alive() && cheb(e.position(), pos) <= me.attack_range() && e.health() <= me.strength() * 1.05f) {
                    ACT(me.attack(e));
                    attackedThisTurn = true;
                    break;
                }
            } catch (const TurnAbort&) { throw; } catch (...) {}
        }
    }
    if (myType == bc::champion_type::varg && useShield()) castThisTurn = true;
    if (!attackedThisTurn || !ranged) moveAway(threats);
    return true;
}

// ------------------------------------------------------------------ fighting
#include "v1_tactical.h"
// X_THREAT: an isolated champion facing clearly stronger visible enemies leaves before the fight
// (v31 ranked losses: 55% of our champion deaths had no ally within 5 tiles, the enemy had
// been visible for 5+ rounds and held ~34 more shards). Abandons the capture/farm task.
bool Bot::outgunnedIsolated() {
    auto& me = bc::self();
    if (!me.can_move() || movedThisTurn) return false;
    const vec2 pos = me.position();
    auto power = [](const bc::champion& c) -> float { try { return c.health() * (c.strength() + 0.6f * c.focus()); } catch (const TurnAbort&) { throw; } catch (...) { return 0.0f; } };
    std::vector<vec2> threats; float ePow = 0.0f;
    for (auto& e : safeChamps(team::enemy)) {
        try { if (!e.is_alive() || !e.is_visible()) continue; if (cheb(e.position(), pos) <= 7) { threats.push_back(e.position()); ePow += power(e); } } catch (const TurnAbort&) { throw; } catch (...) {}
    }
    if (threats.empty()) return false;
    float aPow = power(me); int near = 0, nd = 99; vec2 nearestAlly = pos;
    for (auto& a : safeChamps(team::ally)) {
        try {
            if (a == me || !a.is_alive() || a.is_recalling()) continue;
            const int d = cheb(a.position(), pos);
            if (d <= 5) { aPow += power(a); ++near; }
            if (d < nd) { nd = d; nearestAlly = a.position(); }
        } catch (const TurnAbort&) { throw; } catch (...) {}
    }
    if (!((near == 0 && ePow > X_THREATRATIO * aPow) || ePow > 2.0f * aPow)) return false;
    for (auto& e : safeChamps(team::enemy)) {
        try { if (e.is_alive() && e.is_visible() && cheb(e.position(), pos) <= std::max(static_cast<int>(me.attack_range()), 4) && e.health() <= 1.5f * me.strength()) return false; } catch (const TurnAbort&) { throw; } catch (...) {}
    }
    if (capturing) releaseCapture();
    if (target >= 0 && target < static_cast<int>(groups.size())) {
        bool contested = false;
        for (auto t : threats) { for (auto g : groups[target].tiles) if (cheb(t, g) <= 6) { contested = true; break; } if (contested) break; }
        if (contested) { stalledUntil[target] = round + 20; target = -1; choiceRound = -1; }
    }
    auto threatDist = [&](vec2 p) { int m = 99; for (auto t : threats) m = std::min(m, cheb(t, p)); return m; };
    bool moved = false;
    if (nd <= 15 && nd > 1 && threatDist(nearestAlly) >= threatDist(pos)) { bc::bitboard goal; goal.draw_chebyshev(nearestAlly, 1); moved = moveToward(goal, true); }
    if (!moved) moved = moveAway(threats);
    if (moved) { stage = "x-outgunned"; return true; }
    return false;
}

bool Bot::fightChampions() {
    progressKind=combat;
    if (X_THREAT && outgunnedIsolated()) return true;
    const int decision=tacticalFight();if(decision>=0)return decision==1;
    auto& me = bc::self();
    auto enemies = safeChamps(team::enemy);
    std::vector<bc::champion> live;
    if(closeSpawns && (myType==bc::champion_type::vendetta || myType==bc::champion_type::issac)){
    const float ownStrength=me.strength();
    const auto startPos=me.position();
    const bool farmer=myType==bc::champion_type::vendetta || myType==bc::champion_type::issac;
    bool protectedDuel=false;
    for(auto& e:enemies){
        try{
            if(!e.is_alive()||!e.is_visible())continue;
            const auto p=e.position();const float hp=e.health();
            const bool protectedEnemy=enemySpawnBB.is_set(p)&&hp>2*ownStrength;
            if(protectedEnemy&&cheb(startPos,p)<=me.attack_range()+1)protectedDuel=true;
            // Keep the established melee/ranged defense. A second melee
            // farmer leaves a proved, nonlethal spawn stalemate to earn gold.
            if(farmer && protectedEnemy && round<spawnRestUntil)continue;
            live.push_back(e);
        }catch(const TurnAbort&){throw;}catch(...){}
    }
    if(protectedDuel&&farmer){
        if(spawnDuelSince<0)spawnDuelSince=round;
        if(round-spawnDuelSince>=8){spawnRestUntil=round+24;spawnDuelSince=-1;}
    }else spawnDuelSince=-1;
    }else{
    for (auto& e : enemies) {
        try { if (e.is_alive() && e.is_visible()) live.push_back(e); } catch (const TurnAbort&) { throw; } catch (...) {}
    }    }

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
            } catch (const TurnAbort&) { throw; } catch (...) {}
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
                if (castThisTurn || !selfReady(ab) || !ab.is_cc() || myType != bc::champion_type::cassi) continue;
                try { if (ab.valid_tiles().is_set(far->position()) && ACT(ab.use(*far))) castThisTurn = true; } catch (const TurnAbort&) { throw; } catch (...) {}
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
        if(tgt->is_visible()&&tgt->is_alive()&&tgt->health()>0&&me.can_attack()){
            ACT(me.attack(*tgt));attackedThisTurn=true;
        }
    } catch (const TurnAbort&) { throw; } catch (...) {}
    afterAttackReset(&*tgt);
    if (!castThisTurn) {
        if (myType == bc::champion_type::varg) { if (useShield()) castThisTurn = true; }
        else castOnEnemy(*tgt);
    }
    return true;
}

// ------------------------------------------------------------------ camps
#include "v1_camp_executor.h"

// ------------------------------------------------------------------ targets
#include "v1_cycle.h"

#include "v1_bank_access.h"
#include "v1_bank_channel.h"
#include "v1_bank_carrier.h"

// ------------------------------------------------------------------ tribute
bool Bot::doTribute() {
    auto& me = bc::self();
    const int gems = static_cast<int>(me.gem_count());
    if (gems <= 0) return false;
    if(cancelledBankChannelRound==round)return false;
    if (me.is_submitting_gems()) return true;
    const vec2 pos = me.position();
    if (capturing || bankGateClosed()) return false;
    if(bankChannelThreat())return false;
    const int a0 = nearestAltar(pos);
    const int dAlt = a0 >= 0 ? altarDistance(a0, pos) : UNR;
    // A long altar journey is worth delaying only for a genuinely quick camp.
    // An arbitrary 120-gem threshold stranded 108-gem carriers for 59 turns.
    const auto bank=bc::global_submitted_gems(team::ally);
    const bool deadline=bank>=1000 || gems>=static_cast<int>(1000-bank) || bc::global_submitted_gems(team::enemy)>=900;
    if(X_BANK && !deadline && gems<X_BANKMIN && dAlt>X_BANKNEAR){
        // Fish banks ~60-gem bags: small bags keep farming unless an altar is near.
        if(chooseTarget()>=0)return false;
    }
    if(!deadline && (gems<100 || (dAlt>20 && gems<120))){
        const int t=chooseTarget();
        if(t>=0){const auto& g=groups[t];const int d=gdist(g,pos);
            const float hp=g.state==2?0.0f:((g.state==1&&round-g.seenRound<30)?g.hpLeft:g.totalHp);
            const int wait=g.state==3?std::max(0,g.respawnAt-round-d):0;
            if(d<=5 && wait<=2 && hp/myDps()<=8 && !allyCapturing(g.id))return false;
        }
    }
    const int a = nearestAltar(pos);
    if (a < 0) return false;
    progressKind=banking;
    const vec2 ap = altars[a].pos;
    if (cheb(pos, ap) <= bc::constants::submit_gems_range) {
        try {
            if(removeBankLock(ap))return true;
            ACT(me.submit_gems(ap));
            return true;
        } catch (const TurnAbort&) { throw; } catch (...) {}
    }
    bc::bitboard goals;
    for(int j=0;j<static_cast<int>(altars.size());++j)if(j!=bankAvoid||round>=bankAvoidUntil||altars.size()==1)goals.draw_chebyshev(altars[j].pos,bc::constants::submit_gems_range);
    moveToward(goals, true, true);
    for(const auto& altar:altars)if(cheb(me.position(),altar.pos)<=bc::constants::submit_gems_range){
        try{if(removeBankLock(altar.pos))return true;ACT(me.submit_gems(altar.pos));}catch(const TurnAbort&){throw;}catch(...){}
        break;
    }
    return true;
}

// ------------------------------------------------------------------ farming
// Capture rank for X_CARRYCAP: lower takes the reward (Fish: Stellar 76%, Ren 73% when present).
static int carryRank(int type) {
    using ct = bc::champion_type;
    const auto t = static_cast<ct>(type);
    if(t==ct::heart_of_ruin)return 0;
    if (X_CARRYMODE == 1) {
        // casters first: our ranked losses showed Stellar and Cassi starved of capture gold
        if (t == ct::stellar || t == ct::cassi || t == ct::prism || t == ct::tavi) return 0;
        if (t == ct::ren) return 1;
        if (t == ct::issac) return 2;
        if (t == ct::varg || t == ct::vendetta) return 3;
        return 4;
    }
    if (t == ct::stellar) return 0;
    if (t == ct::ren) return X_CARRYEQ ? 0 : 1;  // X_CARRYEQ: Stellar and Ren share the top rank (Fish split ~even)
    if (t == ct::prism || t == ct::tavi) return 1;
    if (t == ct::issac) return 2;
    if (t == ct::varg || t == ct::vendetta) return 3;
    if (t == ct::cassi) return 4;
    if (t == ct::ryth) return 5;
    return 3;
}
// A higher-ranked ally targets this cleared group and is within 3 of its tiles.
// Owned stat shards (an emblem counts 5, a Power emblem 6) for X_CARRYMODE 2.
static int fxShards(const bc::champion& c) {
    int n = 0;
    try {
        auto ic = c.item_count();
        for (int i = 0; i < 42; ++i) {
            const int k = static_cast<int>(ic[bc::item_type{static_cast<std::uint32_t>(i)}]);
            if (k) n += k * ((i & 1) ? ((i / 6) == 1 ? 6 : 5) : 1);
        }
    } catch (const TurnAbort&) { throw; } catch (...) {}
    return n;
}
bool Bot::carryWants(const Group& g) {
    auto& me = bc::self();
    if (X_CARRYMODE == 2) {
        // poorest first: leave the reward to an ally arriving for it that owns 3+ fewer shards
        const int mineW = fxShards(me) + static_cast<int>(me.gold_count()) / 30;
        for (auto& a : safeChamps(team::ally)) {
            try {
                if (!a.is_alive() || a == me || a.is_recalling()) continue;
                const int at = static_cast<int>(a.champion_name());
                int s = -1;
                for (int i = 0; i < nAllies && i < 6; ++i) if (slotType[i] == at) s = i;
                if (s < 0 || s == slot || (shared[s] & 0x80) || (shared[s] & 0x3F) != g.id + 1) continue;
                int d = 99;
                for (auto t : g.tiles) d = std::min(d, cheb(a.position(), t));
                if (d <= 3 && fxShards(a) + 3 <= mineW) return true;
            } catch (const TurnAbort&) { throw; } catch (...) {}
        }
        return false;
    }
    const int mine = carryRank(static_cast<int>(myType));
    for (auto& a : safeChamps(team::ally)) {
        try {
            if (!a.is_alive() || a == me || a.is_recalling()) continue;
            const int at = static_cast<int>(a.champion_name());
            if (carryRank(at) >= mine) continue;
            int s = -1;
            for (int i = 0; i < nAllies && i < 6; ++i) if (slotType[i] == at) s = i;
            if (s < 0 || s == slot || (shared[s] & 0x80) || (shared[s] & 0x3F) != g.id + 1) continue;
            int d = 99;
            for (auto t : g.tiles) d = std::min(d, cheb(a.position(), t));
            if (d <= 3) return true;
        } catch (const TurnAbort&) { throw; } catch (...) {}
    }
    return false;
}
// An ally (lower-ranked than me) is capturing this group.
bool Bot::lowerCapturing(int gid) const {
    if (X_CARRYMODE == 2) return false;
    const int mine = carryRank(static_cast<int>(myType));
    for (int s = 0; s < nAllies && s < 6; ++s) {
        if (s == slot) continue;
        if ((shared[s] & 0x40) && (shared[s] & 0x3F) == gid + 1 && carryRank(slotType[s]) > mine) return true;
    }
    return false;
}

// X_RALLY: top teams win fights by local numbers (we were caught 1v2/1v3 far more often).
// Every healthy champion within X_RALLYRANGE converges on an ally that has an enemy champion
// within 4 tiles, when our power there (responders + engaged allies) at least matches theirs.
bool Bot::rallyToFight() {
    auto& me = bc::self();
    if (lowMode || capturing || !me.can_move() || movedThisTurn || me.gem_count() >= 44 || me.health() < 0.5f * me.max_health()) return false;
    if (!enough(40000)) return false;
    const vec2 pos = me.position();
    auto power = [](const bc::champion& c) -> float { try { return c.health() * (c.strength() + 0.6f * c.focus()); } catch (const TurnAbort&) { throw; } catch (...) { return 0.0f; } };
    std::vector<bc::champion> foes, mates;
    for (auto& e : safeChamps(team::enemy)) { try { if (e.is_alive() && e.is_visible() && !enemySpawnBB.is_set(e.position())) foes.push_back(e); } catch (const TurnAbort&) { throw; } catch (...) {} }
    if (foes.empty()) return false;
    for (auto& a : safeChamps(team::ally)) { try { if (!(a == me) && a.is_alive() && !a.is_recalling()) mates.push_back(a); } catch (const TurnAbort&) { throw; } catch (...) {} }
    // the engaged ally nearest to me
    int bestD = 99; vec2 spot = pos; bool found = false;
    for (auto& a : mates) {
        try {
            const vec2 ap = a.position();
            bool engaged = false; for (auto& e : foes) if (cheb(e.position(), ap) <= 4) { engaged = true; break; }
            if (!engaged) continue;
            const int d = cheb(ap, pos);
            if (d <= 2 || d > X_RALLYRANGE || d >= bestD) continue;
            bestD = d; spot = ap; found = true;
        } catch (const TurnAbort&) { throw; } catch (...) {}
    }
    if (!found) return false;
    float ours = power(me), theirs = 0.0f;
    for (auto& a : mates) { try { if (cheb(a.position(), spot) <= 6) ours += power(a); } catch (const TurnAbort&) { throw; } catch (...) {} }
    for (auto& e : foes) { try { if (cheb(e.position(), spot) <= 6) theirs += power(e); } catch (const TurnAbort&) { throw; } catch (...) {} }
    if (theirs <= 0.0f || ours < theirs) return false;
    bc::bitboard goals; goals.draw_chebyshev(spot, ranged ? 2 : 1);
    if (moveToward(goals, true)) { target = -1; stage = "x-rally"; return true; }
    return false;
}

void Bot::farm() {
    progressKind=travel;
    auto& me = bc::self();
    const vec2 pos = me.position();
    int t = chooseTarget();
    if (capturing && target >= 0) t = target;  // never abandon a capture in progress
    if (t != target) { target = t; capturing = false; captureSince = -1; }
    if (target < 0) return;
    auto& g = groups[target];
    bool tileVisible=false; const auto vis=bc::vision::visible_tiles(); for(auto t:g.tiles)if(vis.is_set(t)){tileVisible=true;break;}
    const bool anyCampVisible=!(bc::vision::camp_tiles() & g.tilesBB).is_empty();
    if (tileVisible && g.state == 2 && !anyCampVisible) {
        progressKind=capture;
        // capture: stand on a spawn tile, alone
        if (X_CARRYCAP && !capturing && carryWants(g)) {
            const int old=target;releaseCapture();stalledUntil[old]=round+8;target=-1;choiceRound=-1;
            if (g.tilesBB.is_set(pos)) { bc::bitboard off;off.draw_chebyshev(pos,2);off&=~g.tilesBB;moveToward(off,false); }
            stage="x-carry-handoff";return;
        }
        if (g.tilesBB.is_set(pos)) {
            int keeper=slot;
            for(int j=0;j<nAllies&&j<6;++j)if(j!=slot && (shared[j]&0xC0)==0x40 && (shared[j]&63)==g.id+1 && (!capturing||j<keeper))keeper=j;
            if(X_CARRYCAP && X_CARRYMODE!=2 && keeper!=slot && carryRank(slotType[keeper])>carryRank(static_cast<int>(myType)))keeper=slot;  // a carry shares the tile
            if(keeper!=slot){
                const int old=target;releaseCapture();stalledUntil[old]=round+6;target=-1;
                bc::bitboard off;off.draw_chebyshev(pos,2);off&=~g.tilesBB;
                moveToward(off,false);stage="v1-one-capturer";return;
            }
            if (!capturing) { capturing = true; captureSince = round; }
            // Mite: recall during the capture when the reward completes a shopping trip
            const auto en = safeChamps(team::enemy);
            bool threat = false;
            for (auto& e : en) { try { if (e.is_alive() && cheb(e.position(), pos) <= 6) threat = true; } catch (const TurnAbort&) { throw; } catch (...) {} }
            // ... but only when the bag will not be walked to an altar right away (far altar, small bag)
            const int a0 = nearestAltar(pos);
            const int dAlt = a0 >= 0 ? altarDistance(a0, pos) : UNR;
            const bool homeFirst = spawnAltarDist <= dAlt || dAlt > 20;
            if (!threat && homeFirst && round - captureSince >= 1 && static_cast<int>(me.gold_count()) + g.gold >= 150 && !me.is_recalling()) {
                try { ACT(me.recall()); } catch (const TurnAbort&) { throw; } catch (...) {}
            }
            return;
        }
        if (allyCapturing(g.id) && !(X_CARRYCAP && lowerCapturing(g.id))) { target = -1; capturing = false; return; }
        capturing = false;
        moveToward(g.tilesBB, true);
        if (g.tilesBB.is_set(me.position())) { capturing = true; captureSince = round; }
        return;
    }
    capturing = false;
    if (anyCampVisible || (tileVisible && g.state == 1)) {
        progressKind=clearing;
        if (attackCampsOf(target) && ranged) return;
        if (!ranged && attackedThisTurn) {
            try{if(me.can_move() && std::holds_alternative<bc::map::camp_group_reward_available>(rawGroups[target].state())){
                g.state=2;moveToward(g.tilesBB,true);
                if(g.tilesBB.is_set(me.position())){capturing=true;captureSince=round;}
            }}catch(const TurnAbort&){throw;}catch(...){}
            return;
        }
        // move into attack range of the closest live camp of the group
        bc::bitboard goals;
        const int attackRange=me.attack_range();
        for(auto p:(bc::vision::camp_tiles() & g.tilesBB).positions())goals.draw_chebyshev(p,attackRange);
        if (goals.is_empty()) goals=g.tilesBB;
        if (!attackedThisTurn || !ranged) moveToward(goals, true);
        if (!attackedThisTurn) attackCampsOf(target);
        return;
    }
    // not in sight yet (or respawning): walk next to it, never onto its spawn tiles
    // (an occupied spawn tile blocks the whole group's respawn)
    bc::bitboard goals;
    for (auto tt : g.tiles) goals.draw_chebyshev(tt, std::max(1, me.attack_range()));
    goals &= ~g.tilesBB;
    // A geometric shooting ring can be blind behind a wall/bush. Standing
    // there never reveals the monsters. Explore their actual region instead;
    // an unseen occupant preserves movement and is revealed for this round.
    // Keep the ring during a known respawn to avoid blocking the whole group.
    if(g.state!=3)goals=g.tilesBB;
    if (g.tilesBB.is_set(pos)) {
        moveToward(goals, false);
        return;
    }
    moveToward(goals, true, true);
    attackCampsOf(target);
}

// ------------------------------------------------------------------ willow
#include "v1_support.h"

// ------------------------------------------------------------------ main turn
void Bot::play_step() {
    auto& me = bc::self();
    const bool previousStale=stale;
    frameRound=static_cast<int>(bc::round_number()); stopped=stale=false; apiErrors=blockedActions=0; heavyFieldUsed=false;
    round=frameRound;progressKind=travel;
    if(inited && motionSampleRound!=round){
        motionSampleRound=round;
        if(attackedThisTurn || castThisTurn || capturing || lowMode || previousStale || (target>=0 && groups[target].state>=2) || !me.is_alive() || me.is_recalling() || me.is_submitting_gems() || me.is_teleporting())taskTrail.clear();
        else{
            const auto p=me.position();taskTrail.push_back(p);
            if(taskTrail.size()>12)taskTrail.erase(taskTrail.begin());
            bool repeated=false;
            for(int period=2;period<=6 && 2*period<=static_cast<int>(taskTrail.size());++period){
                bool same=true,nonconstant=false;const int n=taskTrail.size();
                for(int i=0;i<period;++i){
                    same &= taskTrail[n-1-i]==taskTrail[n-1-period-i];
                    nonconstant |= taskTrail[n-1-i]!=taskTrail[n-1];
                }
                repeated |= same;
            }
            if(taskTrail.size()>=8 && repeated && target>=0 && target<static_cast<int>(groups.size())){
                // Only an unproductive repeated footprint expires a target.
                stalledUntil[target]=round+24;target=-1;taskTrail.clear();
            }
        }
    }
    movedThisTurn = attackedThisTurn = castThisTurn = false;
    if(previousStale){target=-1;capturing=false;captureSince=-1;wasSubmitting=false;recoveryActive=recoveryValid=false;motionHistory.clear();motionRound=-1;goalBest=UNR;yieldPeerSince=-1;}
    if(!inited){init();if(!inited){openingMove();return;}}
    if(!enough())return;
    discoverBankGate();
    movedThisTurn = attackedThisTurn = castThisTurn = false;
    readShared();
    refreshCapture();

    if (!me.is_alive()) {
        target = -1;
        capturing = false;
        lowMode = false;
        wasSubmitting = false;
        recoveryActive=recoveryValid=false;motionHistory.clear();motionRound=-1;goalBest=UNR;yieldPeerSince=-1;
        shop();
        writeStatus(false);
        return;
    }
    if(me.buffs().has_stun()){
        // Priority changes are allowed while stunned and affect next round.
        // Preserve the same low-state transitions without attempting actions.
        handleLowHp(true);setPriority(lowMode);
        stage="stunned";writeStatus(lowMode);return;
    }
    stage = "know";
    // X_SCOREFIRST: skip this refresh only if armed in the immediately preceding round; always disarm
    bool skipKnow=false;
    if(X_SCOREFIRST){skipKnow=scoreFirstRound==round-1;scoreFirstRound=-1000;}
    if(!stalledRetreat && !skipKnow)updateKnowledge();
    if(!enough(24000)){stage="budget";return;}

    bool submittingNow = me.is_submitting_gems();
    const bool justSubmitted = wasSubmitting && !submittingNow && me.gem_count() == 0;
    wasSubmitting = submittingNow;

    if(submittingNow&&bankChannelThreat()){
        try{ACT(me.cancel_submit_gems());cancelledBankChannelRound=round;submittingNow=false;wasSubmitting=false;stage="bank-channel-interrupt-risk";}
        catch(const TurnAbort&){throw;}catch(...){}
    }
    if (me.is_recalling() || submittingNow || me.is_teleporting()) {
        setPriority(lowMode);
        writeStatus(lowMode);
        return;
    }
    if(myType==bc::champion_type::tavi)shop();
    if(onSpawn()){
        shop();
        // Recovery occurs at turn end. A shopping recall must not immediately
        // walk out of spawn with the same injury. Preserve the existing low
        // flag, so an ordinary shopping arrival doesn't trigger linked retreat.
        if(me.health()<me.max_health()-.5f){stage="v1-spawn-heal";setPriority(lowMode);writeStatus(lowMode);return;}
    }

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
    if(enough(85000))placeWard();
    if(!enough(24000)){stage="budget";return;}
    stage = "main";

    // shopping trip right after a tribute
    if (justSubmitted && me.gold_count() >= 150) {
        bool threat = false;
        for (auto& e : safeChamps(team::enemy)) {
            try { if (e.is_alive() && cheb(e.position(), me.position()) <= 6) threat = true; } catch (const TurnAbort&) { throw; } catch (...) {}
        }
        if (!threat) {
            try { ACT(me.recall()); } catch (const TurnAbort&) { throw; } catch (...) {}
            writeStatus(false);
            return;
        }
    }

    if (X_SHOPRECALL && !capturing && !onSpawn() && !me.is_recalling() && static_cast<int>(me.gold_count()) >= X_SHOPGOLD) {
        // Fish shops whenever it can afford an emblem and nothing threatens the channel.
        bool threat = false;
        try {
            for (auto p : bc::vision::champion_tiles(team::enemy).positions()) if (cheb(p, me.position()) <= 8) { threat = true; break; }
            if (!threat) for (auto p : bc::vision::camp_tiles().positions()) if (cheb(p, me.position()) <= 4 && bc::vision::camp_at(p).is_awake() && bc::vision::camp_at(p).strength() > 0) { threat = true; break; }
        } catch (const TurnAbort&) { throw; } catch (...) {}
        // carrying gems with an altar close: bank first
        if (!threat && me.gem_count() > 0) { const int a = nearestAltar(me.position()); if (a >= 0 && altarDistance(a, me.position()) <= 5) threat = true; }
        if (!threat) {
            bool started = false;
            try { ACT(me.recall()); started = true; } catch (const TurnAbort&) { throw; } catch (...) {}
            if (started) { stage = "x-shop-recall"; writeStatus(false); return; }
        }
    }
    if (myType == bc::champion_type::willow) {
        stage = "willow";
        willowTurn();
        writeStatus(false);
        return;
    }
    const auto bank=bc::global_submitted_gems(team::ally);
    if(me.gem_count()>0 && (bank>=1000 || me.gem_count()>=1000-bank)){
        if(capturing)releaseCapture();stage="v1-winning-bank";
        if(doTribute()){writeStatus(lowMode);return;}
    }
    stage = "fight";
    if (fightChampions() && (ranged || !me.can_move() || attackedThisTurn)) {
        // melee fighters may still walk after swinging, but stay on the enemy
        writeStatus(false);
        return;
    }
    if(bankGate>=0&&retreatBankCarrier()){writeStatus(lowMode);return;}
    if(answerHelp()){writeStatus(lowMode);return;}
    if(X_RALLY&&rallyToFight()){writeStatus(lowMode);return;}
    if(workBankGate()){writeStatus(lowMode);return;}
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

#include "v1_progress.h"
#include "v1_dispatch.h"

}  // namespace mm
