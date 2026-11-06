// Coordinated farming with visibility-aware routes, useful splash targeting,
// bounded camp observations and recovery from verified movement/retreat cycles.
// Decisions use personal observations and compact advisory camp commitments.
#include "bot.h"
#include "policy.h"
#include "../fishx_features.h"
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

namespace boss {

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
// Every caller passes an ability enumerated from self().abilities(). The SDK
// is_ready() constructs another champion (and both ability/consumable handles)
// merely to query its live can_cast flag. Preserve that live query and the
// metadata/cooldown predicates using the existing self handle instead.
static bool selfReady(const bc::ability& ab) {
    return ab.info().has_value() && !ab.is_on_cooldown() && bc::self().can_cast();
}

static int cheb(vec2 a, vec2 b) { return std::max(std::abs(a.x - b.x), std::abs(a.y - b.y)); }

static std::vector<bc::champion> safeChamps(team side) {
    static std::vector<std::pair<std::uint32_t,bc::champion>> known;
    std::vector<bc::champion> out;
    try{
        for(auto p:bc::vision::champion_tiles(side).positions()){
            try{
                std::uint32_t id{};
                bc::detail::check(bc::detail::sdk_champion_at(p.x,p.y,&id));
                auto at=std::find_if(known.begin(),known.end(),[&](const auto& entry){return entry.first==id;});
                if(at==known.end()){
                    known.emplace_back(id,bc::vision::champion_at(p));at=known.end()-1;
                }
                out.push_back(at->second);
            }catch(const TurnAbort&){throw;}catch(...){}
        }
    }catch(const TurnAbort&){throw;}catch(...){}
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
        tileGroup.assign(W * H, -1);
        rawGroups = bc::map::camp_groups(); groups.resize(rawGroups.size());stalledUntil.assign(groups.size(),0);
        auto byte = [](int i) { return std::to_integer<unsigned char>(bc::draft_memory[i]); };
        auto word = [&](int i) { return byte(i) | (byte(i+1) << 8); };
        draftValid = bc::draft_memory.size() >= 20 && byte(0)=='F' && byte(1)=='S' && byte(2)=='T' && byte(3)=='2' && byte(4)==1 && byte(5)==0xA5 && word(6)==W && word(8)==H && word(10)==static_cast<int>(groups.size()) && groups.size()<=251 && 20+4*groups.size()<=bc::draft_memory.size();
        if(draftValid){unsigned sum=0;for(int i=6;i<16;++i)sum+=byte(i);for(int i=20;i<20+4*static_cast<int>(groups.size());++i)sum+=byte(i);draftValid=(sum&65535)==static_cast<unsigned>(word(16));}
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
        for(auto c:rg.camps()){auto st=c.base_stats();g.totalHp+=st.base_health;g.totalStr+=st.base_strength;if(c.is_monolith())g.monolith=true;}
        g.hpLeft=g.totalHp;
        if(draftValid){int off=20+4*initNext;g.dOwn=std::to_integer<unsigned char>(bc::draft_memory[off])|(std::to_integer<unsigned char>(bc::draft_memory[off+1])<<8);g.dEnemy=std::to_integer<unsigned char>(bc::draft_memory[off+2])|(std::to_integer<unsigned char>(bc::draft_memory[off+3])<<8);}
        else {g.dOwn=heuristic(ownSpawnBB.positions(),g.center);g.dEnemy=heuristic(enemySpawnBB.positions(),g.center);}
        g.eligible=g.gems>0 && !g.monolith && g.dOwn!=UNR && g.dOwn<=g.dEnemy+4;
        ++initNext;
    }
    inited=initNext==static_cast<int>(groups.size());
    if(inited)bossOnly=std::none_of(groups.begin(),groups.end(),[](const Group& g){return g.gems>0&&!g.monolith&&g.dOwn!=UNR;})
        && std::any_of(groups.begin(),groups.end(),[](const Group& g){return g.gems>0&&g.monolith&&g.dOwn!=UNR;});
    if(inited && std::none_of(groups.begin(),groups.end(),[](const Group& g){return g.eligible;})){
        // A map can offer only boss gem camps and ordinary gold camps.
        // Empty preferred targets must not mean remaining on spawn forever.
        for(auto& g:groups)g.eligible=g.gold>0 && !g.monolith && g.dOwn!=UNR && g.dOwn<=g.dEnemy+4;
        if(std::none_of(groups.begin(),groups.end(),[](const Group& g){return g.eligible;}))
            for(auto& g:groups)g.eligible=g.gold>0 && !g.monolith && g.dOwn!=UNR;
    }
    if(inited && bossOnly)for(auto& g:groups)if(g.monolith && g.dOwn!=UNR)g.eligible=true;
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
    for (auto& c : safeCamps()) {
        if(!enough(40000))break;
        int gid = -1;
        const auto sp = c.spawn_position();
        if (sp.x >= 0 && sp.y >= 0 && sp.x < W && sp.y < H) gid = tileGroup[idx(sp)];
        if (gid < 0) continue;
        try { hp[gid] += c.health(); anyCamp[gid] = 1; } catch (const TurnAbort&) { throw; } catch (...) {}
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
                g.hpLeft = anyCamp[g.id] ? hp[g.id] : g.totalHp;
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
    if (low) desired = 1000;
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
    const bool focusUser = myType == bc::champion_type::cassi || myType == bc::champion_type::stellar || myType == bc::champion_type::prism || myType==bc::champion_type::tavi || (bossOnly&&myType==bc::champion_type::ren);
    if(bossOnly) {
        const int stat=focusUser?1:0;
        plan={{2,2,5},{1,stat,1000}};
    } else if (focusUser) {
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
    if(!me.can_move() || !enough(36000))return false;
    const auto pos=me.position();const auto blocked=blockedNow();
    const auto goals=goalsIn & ~blocked;
    if(goals.is_empty()){stage="route-occupied";return false;}
    if(goals.is_set(pos))return false;
    // The old speculative group field consumed the only search before the
    // actual destination was known. Search this real goal, with live blockers,
    // until SELF is reached. No arbitrary 48-step ceiling and no uphill step.
    if(heavyFieldUsed){stage="route-budget";return false;}
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

bool Bot::escapeHome(const std::vector<vec2>& threats) {
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
    // On combat escape, a homeward dash must also improve separation.
    if(contactEscape && !castThisTurn && me.can_cast() && enough(35000)) {
        const auto origin=me.position();const auto b=blockedNow();
        const auto homeRoots=ownSpawnBB.positions();
        auto score=[&](vec2 p){int separation=99;for(auto e:threats)separation=std::min(separation,cheb(p,e));
            return v11r::escape_score(separation,heuristic(homeRoots,p));};
        const auto originScore=score(origin);
        for(auto ab:me.abilities())if(ab.is_dash() && selfReady(ab)) {
            const int steps=static_cast<int>(std::get<bc::ability_dash>(*ab.info()).range);
            auto reach=(b & ~bc::map::holes()).reachable_tiles(origin,steps) & ~b;
            std::vector<std::pair<long,vec2>> options;
            for(auto p:reach.positions()){
                if(!enough(26000))break;
                const long value=score(p);if(value>originScore)options.push_back({-value,p});
            }
            std::sort(options.begin(),options.end(),[](auto a,auto b){return a.first<b.first;});
            for(auto [value,p]:options)try{if(!enough(22000))break;if(ACT(ab.use(p))){castThisTurn=true;movedThisTurn=true;return true;}}catch(const TurnAbort&){throw;}catch(...){}
            break;
        }
        return moved;
    }
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
        int d = altarDistance(static_cast<int>(i), p);
        if (d < bd) { bd = d; best = static_cast<int>(i); }
    }
    return best;
}

// ------------------------------------------------------------------ abilities
void Bot::afterAttackReset(const bc::unit* tgt) {
    if(!attackedThisTurn||castThisTurn||!enough(34000))return;
    auto& me=bc::self();const unsigned id=static_cast<unsigned>(static_cast<bc::handle_champion_t>(me));
    bc::detail::champion_info own{};if(bc::detail::sdk_champion(id,&own)||!(own.state&2048))return;
    for(int k=0;k<2;++k){
        if(!enough(28000))return;int cd=8;bc::detail::ability_props p{};
        if(bc::detail::sdk_champion_cooldown(id,k,&cd)||cd||bc::detail::sdk_champion_ability_props(id,k,&p)||p.kind!=1)continue;
        try{int used=0;if(ACT(([&](){bc::detail::check(bc::detail::sdk_cast(k,0,0,own.x,own.y,&used));return used!=0;})())){
            castThisTurn=true;
            if(tgt&&enough(23000)&&tgt->is_visible()&&tgt->health()>0&&me.can_attack()&&cheb(tgt->position(),me.position())<=me.attack_range())ACT(me.attack(*tgt));
        }}catch(const TurnAbort&){throw;}catch(...){}return;
    }
}

bool Bot::castOnEnemy(const bc::champion& enemy) {
    if(castThisTurn||!enough(35000))return false;
    auto& me=bc::self();const unsigned id=static_cast<unsigned>(static_cast<bc::handle_champion_t>(me)),eid=static_cast<unsigned>(static_cast<bc::handle_champion_t>(enemy));
    bc::detail::champion_info own{},foe{};
    if(bc::detail::sdk_champion(id,&own)||!(own.state&2048)||bc::detail::sdk_champion(eid,&foe)||!(foe.state&1))return false;
    for(int k=0;k<2;++k){
        if(!enough(27000))return false;int cd=8;bc::detail::ability_props p{};
        if(bc::detail::sdk_champion_cooldown(id,k,&cd)||cd||bc::detail::sdk_champion_ability_props(id,k,&p)||(movedThisTurn&&(p.attributes&1)))continue;
        const float range=p.kind==2?p.payload.damage.range:p.kind==3?p.payload.aoe_damage.range:p.kind==4?p.payload.cc.range:0;
        if(range<=0||cheb({own.x,own.y},{foe.x,foe.y})>range)continue;
        const unsigned kind=(p.targets&bc::detail::ability_target_enemies)?1:0;if(!kind&&!(p.targets&bc::detail::ability_target_ground))continue;
        try{int used=0;if(ACT(([&](){bc::detail::check(bc::detail::sdk_cast(k,kind,kind?eid:0,foe.x,foe.y,&used));return used!=0;})())){castThisTurn=true;return true;}}catch(const TurnAbort&){throw;}catch(...){}
    }return false;
}

bool Bot::castOnCamp(const bc::camp& c) {
    auto& me = bc::self();
    stage = "castcamp";
    if (!enough(26000) || castThisTurn || !me.can_cast()) return false;
    for (auto ab : me.abilities()) {
        if (!selfReady(ab)) continue;
        // Cassi's stun is kept for champions; damage spells (incl. Ren's damage+stun) go on camps
        const bool dmg = ab.is_damage() || ab.is_aoe_damage() || (ab.is_cc() && (myType == bc::champion_type::ren || myType==bc::champion_type::tavi));
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
    if(!enough(28000))return false;auto& me=bc::self();
    const unsigned id=static_cast<unsigned>(static_cast<bc::handle_champion_t>(me));bc::detail::champion_info own{};
    if(bc::detail::sdk_champion(id,&own)||!(own.state&2048))return false;
    for(int k=0;k<2;++k){int cd=8;bc::detail::ability_props p{};
        if(bc::detail::sdk_champion_cooldown(id,k,&cd)||cd||bc::detail::sdk_champion_ability_props(id,k,&p)||p.kind!=7)continue;
        try{int used=0;return ACT(([&](){bc::detail::check(bc::detail::sdk_cast(k,0,0,own.x,own.y,&used));return used!=0;})());}catch(const TurnAbort&){throw;}catch(...){}break;
    }return false;
}

float Bot::myDps() const {
    auto& me = bc::self();
    float s = me.strength() * 1.15f;
    return std::max(s, baseDps(static_cast<int>(myType)) * 0.8f);
}

float Bot::typeDps(int type) const { return baseDps(type); }

// ------------------------------------------------------------------ low hp
bool Bot::handleLowHp(bool statusOnly) {
    auto& me = bc::self();
    const float hpf = me.health() / std::max(1.0f, me.max_health());
    static bool prevPartnerLow = false;
    const bool partnerLow = partnerSlot >= 0 && partnerSlot < 8 && (shared[partnerSlot] & 0x80);
    const bool partnerRise = partnerLow && !prevPartnerLow;
    prevPartnerLow = partnerLow;
    if (onSpawn()) {
        stalledRetreat=false;lowTrail.clear();
        if (me.health() >= me.max_health() - 0.5f) { lowMode = false; return false; }
        if (lowMode) return true;  // stay on spawn until healed (heal happens at our turn end)
        return false;
    }
    if (!lowMode && (hpf < 0.35f || partnerRise)) lowMode = true;
    if (lowMode && hpf >= 0.6f && !partnerLow) lowMode = false;
    if(statusOnly)return lowMode;
    if (!lowMode){stalledRetreat=false;lowTrail.clear();return false;}
    const auto lowPos=me.position();const float lowHp=me.health();
    if(lowHp>lastLowHp+1)lowTrail.clear();
    lastLowHp=lowHp;lowTrail.push_back(lowPos);
    if(lowTrail.size()>12)lowTrail.erase(lowTrail.begin());
    if(lowTrail.size()>=6 && std::count(lowTrail.begin(),lowTrail.end(),lowPos)>=3)stalledRetreat=true;
    releaseCapture();

    const vec2 pos = me.position();
    std::vector<vec2> threats;
    for (auto& e : safeChamps(team::enemy)) {
        try { if (e.is_alive() && cheb(e.position(), pos) <= 6) threats.push_back(e.position()); } catch (const TurnAbort&) { throw; } catch (...) {}
    }
    // awake (damaged) camps within their range 3 would interrupt the recall too
    for (auto& c : safeCamps()) {
        try {
            // Camps stay on their tiles. Only an awake armed camp in actual
            // attack range can interrupt this recall; damage alone is not a
            // threat, and range four is already safe from range-three camps.
            if(cheb(c.position(),pos)<=c.attack_range()&&c.strength()>0&&c.is_awake())threats.push_back(c.position());
        } catch (const TurnAbort&) { throw; } catch (...) {}
    }
    if (me.is_recalling()) return true;
    if (threats.empty()) {
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
bool Bot::fightChampions() {
    auto& me = bc::self();
    if(!enough(42000))return false;
    // During this actor's turn enemy positions and bags do not change before
    // our first action. Revalidate live/visible state after any damaging cast.
    struct Contact {
        bc::champion unit;bc::detail::champion_info info;unsigned bag;
        vec2 position()const{return {info.x,info.y};}
        bool is_alive()const{return info.state&1;}bool is_visible()const{return true;}
        float health()const{return info.health;}unsigned gem_count()const{return bag;}
        auto buffs()const{return unit.buffs();}
    };
    std::vector<Contact> enemies,live;
    for(auto unit:safeChamps(team::enemy)){
        if(!enough(34000))return false;
        const unsigned id=static_cast<unsigned>(static_cast<bc::handle_champion_t>(unit));
        bc::detail::champion_info info{};unsigned bag=0;
        if(!bc::detail::sdk_champion(id,&info)&&(info.state&1)&&!bc::detail::sdk_champion_gems(id,&bag))enemies.push_back({unit,info,bag});
    }
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
    // The first prototype won fights but never converted gold into boss gems.
    // Defend local contact; do not pursue unrelated enemies across this map.
    // Preserve defense of the boss capture approach after equipping.

    vec2 pos = me.position();
    const int range = me.attack_range();
    const float hpf = me.health() / std::max(1.0f, me.max_health());

    auto pickInRange = [&](int r) -> std::optional<Contact> {
        std::optional<Contact> best;
        float bs = 1e9f;
        for (auto& e : live) {
            try {
                int d = cheb(e.position(), pos);
                if (d > r) continue;
                float s = e.health() - 2.0f * static_cast<float>(e.gem_count());
                if (s < bs) { bs = s; best = e; }
            } catch (const TurnAbort&) { throw; } catch (...) {}
        }
        return best;
    };

    auto tgt = pickInRange(range);
    int localEnemies=0,healthyFriends=1;
    std::vector<vec2> contactThreats;
    for(const auto& e:live)if(cheb(e.position(),pos)<=5){++localEnemies;contactThreats.push_back(e.position());}
    if(localEnemies>=2 && enough(40000)) {
        for(const auto& a:safeChamps(team::ally)) {
            if(!enough(32000))break;
            const unsigned id=static_cast<unsigned>(static_cast<bc::handle_champion_t>(a));
            bc::detail::champion_info info{};
            if(a==me||bc::detail::sdk_champion(id,&info)||!(info.state&1)||cheb({info.x,info.y},pos)>4)continue;
            if(info.health>=.4f*info.max_health&&!(info.state&(2|4)))++healthyFriends;
        }
        // Conservative finish exception: account for shields and leave room
        // for ordinary mitigation; an apparent low HP Varg is not a free kill.
        bool finish=false;
        if(tgt && me.can_attack()) {
            const auto buffs=tgt->buffs();
            const float shield=buffs.has_shield()?buffs.get<bc::buff_shield>().value:0.0f;
            finish=tgt->health()+shield<=0.5f*me.strength();
        }
        if(v11r::rotate_contact(me.health(),me.max_health(),localEnemies,healthyFriends,tgt.has_value(),finish)) {
            contactEscape=true;
            if(myType==bc::champion_type::varg && !castThisTurn && useShield())castThisTurn=true;
            moveAway(contactThreats);
            return true;
        }
    }
    if (!tgt && !ranged && me.can_move()) {
        // melee: step in at distance 2, chase at 3 when healthy
        std::optional<Contact> near;
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
            if (castOnEnemy(far->unit)) return true;
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
                try { if (ab.valid_tiles().is_set(far->position()) && ACT(ab.use(far->unit))) castThisTurn = true; } catch (const TurnAbort&) { throw; } catch (...) {}
            }
        }
        return false;
    }
    if (!me.can_attack()) {
        castOnEnemy(tgt->unit);
        return true;
    }
    // Cassi opens with the stun, Ren with damage+stun (both before the swing)
    if (myType == bc::champion_type::cassi || myType == bc::champion_type::ren) castOnEnemy(tgt->unit);
    try {
        if(tgt->unit.is_alive() && tgt->unit.is_visible() && me.can_attack()){ACT(me.attack(tgt->unit));attackedThisTurn = true;}
    } catch (const TurnAbort&) { throw; } catch (...) {}
    afterAttackReset(&tgt->unit);
    if (!castThisTurn) {
        if (myType == bc::champion_type::varg) { if (useShield()) castThisTurn = true; }
        else castOnEnemy(tgt->unit);
    }
    return true;
}

// ------------------------------------------------------------------ camps
bool Bot::attackCampsOf(int gid) {
    auto& me=bc::self();stage="atkcamp";
    if(!enough(42000))return false; // leave the movement decision affordable
    const bool basic=me.can_attack();
    const bool spells=!castThisTurn && me.can_cast();
    if(!basic&&!spells)return false;
    const auto pos=me.position();const int range=me.attack_range();const float strength=me.strength();
    const auto all=bc::vision::camp_tiles();
    const auto groupTiles=gid>=0?all & groups[gid].tilesBB:all;
    bc::bitboard basicArea;basicArea.draw_chebyshev(pos,range);
    const bool canHit=basic && !(groupTiles & basicArea).is_empty();
    bool canSpell=false;
    if(spells)for(auto ab:me.abilities()){
        if(!selfReady(ab) || (movedThisTurn&&excludesWalking(ab)))continue;
        if(!(ab.is_damage()||ab.is_aoe_damage()||(ab.is_cc()&&(myType==bc::champion_type::ren || myType==bc::champion_type::tavi))))continue;
        if(!(ab.valid_tiles() & groupTiles).is_empty()){canSpell=true;break;}
    }
    if(!canHit&&!canSpell)return false;
    struct Seen {bc::camp unit;vec2 pos;float hp,strength;bool target;};
    std::vector<Seen> seen;
    bc::bitboard local;local.draw_chebyshev(pos,std::max(4,range+1));
    for(auto p:(all & local).positions()){
        if(!enough(36000))break;
        try{
            auto c=bc::vision::camp_at(p);const float hp=c.health();
            if(hp>0)seen.push_back({c,p,hp,c.strength(),gid<0||groups[gid].tilesBB.is_set(c.spawn_position())});
        }catch(const TurnAbort&){throw;}catch(...){}
    }
    std::optional<bc::camp> best,spellTgt;float bestScore=1e9f,spellHealth=-1;
    for(const auto& c:seen){
        if(!c.target)continue;
        const int d=cheb(c.pos,pos);
        if(canHit&&d<=range){
            float score=c.hp;
            // Apply the proven fixed-basic sequential rule only when no
            // ability is available and no allied body can alter the clear.
            if(!spells && bc::vision::champion_tiles(team::ally).count()<=1)
                score=std::ceil(c.hp/std::max(1.0f,strength))/std::max(0.01f,c.strength);
            if(myType==bc::champion_type::vendetta&&c.hp<=strength)score=-1000+c.hp;
            if(myType==bc::champion_type::varg){
                float useful=0;
                for(const auto& other:seen)if(cheb(other.pos,c.pos)<=1)useful+=std::min(other.hp,strength);
                score=-useful+c.hp*0.00001f;
            }
            if(score<bestScore){bestScore=score;best=c.unit;}
        }
        if(canSpell&&d<=4&&c.hp>spellHealth){spellHealth=c.hp;spellTgt=c.unit;}
    }
    bool acted=false;
    if(spellTgt&&!movedThisTurn&&enough(26000))acted=castOnCamp(*spellTgt);
    if(best&&enough(24000)&&me.can_attack()){
        try{
            // A spell can kill the selected basic target or an adjacent one.
            if(best->is_alive()&&best->health()>0){ACT(me.attack(*best));attackedThisTurn=acted=true;}
        }catch(const TurnAbort&){throw;}catch(...){}
        if(attackedThisTurn&&enough(26000)){
            // A kill can refresh a reset, but the dead primary cannot receive
            // the renewed attack. Pick a living legal target after the hit.
            std::optional<bc::camp> resetTarget;
            for(const auto& c:seen){
                if(!c.target||cheb(c.pos,me.position())>range)continue;
                try{if(c.unit.is_alive()&&c.unit.health()>0){
                    if(c.unit==*best){resetTarget=c.unit;break;}
                    if(!resetTarget)resetTarget=c.unit;
                }}catch(const TurnAbort&){throw;}catch(...){}
                if(!enough(26000))break;
            }
            if(resetTarget)afterAttackReset(&*resetTarget);
        }
        if(!castThisTurn&&myType==bc::champion_type::varg&&enough(24000)&&useShield())castThisTurn=true;
    }
    if(spellTgt&&!castThisTurn&&!(movedThisTurn&&ranged)&&enough(26000)){
        try{if(spellTgt->is_alive()&&spellTgt->health()>0&&castOnCamp(*spellTgt))acted=true;}catch(const TurnAbort&){throw;}catch(...){}
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
    } catch (const TurnAbort&) { throw; } catch (...) {}
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
        if (!g.eligible || stalledUntil[g.id]>round) continue;
        if(bossOnly && g.monolith && g.state!=2) {
            const bool caster=myType==bc::champion_type::cassi || myType==bc::champion_type::stellar || myType==bc::champion_type::prism || myType==bc::champion_type::tavi || myType==bc::champion_type::ren;
            if(!caster || me.focus()<150)continue;
            // X_BOSSSTEAL: only finish a monolith already observed at or below X_STEALFRAC health.
            if(X_BOSSSTEAL){const float hp=(g.state==1&&round-g.seenRound<30)?g.hpLeft:g.totalHp;if(g.totalHp<=0||hp>X_STEALFRAC*g.totalHp)continue;}
        }
        const auto d = gdist(g, pos);
        if (d == UNR) continue;
        if (allyCapturing(g.id)) continue;
        float wait = 0.0f, hp = g.totalHp;
        bool reward = false;
        if (g.state == 3) {
            wait = std::max(0.0f, static_cast<float>(g.respawnAt - round - d));
            if(wait>8)continue;
        } else if (g.state == 2) {
            reward = round - g.seenRound < 15;
            hp = reward ? 0.0f : g.totalHp;
        } else if (g.state == 1 && round - g.seenRound < 30) {
            hp = std::max(1.0f, g.hpLeft);
        }
        float ownDamage=md;
        if(bossOnly && g.monolith){
            // Only spells reach from the safe ring; don't forecast Strength
            // basics here or treat a ready spell as sustained every turn.
            float cycle=0;for(const auto& ab:me.abilities())if(ab.is_damage()||ab.is_aoe_damage()||ab.is_cc())cycle+=ab.damage_amount();
            ownDamage=std::max(1.0f,cycle/8.0f);
        }
        const float rawKt = reward ? 0.0f : hp / (ownDamage + dps[g.id]);
        const float kt = rawKt * ((bossOnly&&g.monolith)?1.0f:(1.0f + g.totalStr / 100.0f));
        const float time = d + wait + kt + 5.0f;
        const float value = g.gems + 0.15f * g.gold;
        float score = value / (time + 8.0f);
        // camps hit the nearest champion: avoid fights we cannot survive without help
        const float taken = (bossOnly&&g.monolith)?0.0f:rawKt * g.totalStr * (jungle ? 0.7f : 1.0f);
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
    const int dAlt = a0 >= 0 ? altarDistance(a0, pos) : UNR;
    // A long altar journey is worth delaying only for a genuinely quick camp.
    // An arbitrary 120-gem threshold stranded 108-gem carriers for 59 turns.
    const bool winning=v11r::winning_bag(bc::global_submitted_gems(team::ally),gems,bc::constants::winning_gems);
    if(!winning && (gems<100 || (dAlt>20 && gems<120))){
        const int t=chooseTarget();
        if(t>=0){const auto& g=groups[t];const int d=gdist(g,pos);
            const float hp=g.state==2?0.0f:((g.state==1&&round-g.seenRound<30)?g.hpLeft:g.totalHp);
            const int wait=g.state==3?std::max(0,g.respawnAt-round-d):0;
            if(d<=5 && wait<=2 && hp/myDps()<=8 && !allyCapturing(g.id))return false;
        }
    }
    const int a = nearestAltar(pos);
    if (a < 0) return false;
    const vec2 ap = altars[a].pos;
    if (X_BOSSTRIB && gems >= 100) {
        // Boss maps: a 200-gem channel next to enemy champions is a stolen bag. Do not start it
        // with an enemy within 6; step away (toward home) and try again when clear.
        std::vector<vec2> threats;
        for (auto& e : safeChamps(team::enemy)) { try { if (e.is_alive() && e.is_visible() && cheb(e.position(), pos) <= 6) threats.push_back(e.position()); } catch (const TurnAbort&) { throw; } catch (...) {} }
        if (!threats.empty()) { stage = "x-boss-carry-safe"; if (me.can_move()) moveAway(threats); return true; }
    }
    if (cheb(pos, ap) <= bc::constants::submit_gems_range) {
        try {
            ACT(me.submit_gems(ap));
            return true;
        } catch (const TurnAbort&) { throw; } catch (...) {}
    }
    bc::bitboard goals;
    for(const auto& altar:altars)goals.draw_chebyshev(altar.pos,bc::constants::submit_gems_range);
    moveToward(goals, true, true);
    for(const auto& altar:altars)if(cheb(me.position(),altar.pos)<=bc::constants::submit_gems_range){
        try{ACT(me.submit_gems(altar.pos));}catch(const TurnAbort&){throw;}catch(...){}
        break;
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
    bool tileVisible=false; const auto vis=bc::vision::visible_tiles(); for(auto t:g.tiles)if(vis.is_set(t)){tileVisible=true;break;}
    const bool anyCampVisible=!(bc::vision::camp_tiles() & g.tilesBB).is_empty();
    if(bossOnly && g.monolith && g.state!=2) {
        // Range-three basics surrender the only safety margin. Cast from
        // exactly range four, then wait for cooldown instead of walking in.
        bc::bitboard ring;
        for(auto p:g.tiles){bc::bitboard outer,inner;outer.draw_chebyshev(p,4);inner.draw_chebyshev(p,3);ring|=outer & ~inner;}
        // A geometric range-four destination can be blind behind walls/bushes.
        // Record an actually observed blind landing; explore another legal
        // ring tile rather than repeatedly waiting for an invisible target.
        if(ring.is_set(pos) && !anyCampVisible && !tileVisible)blindBossTiles.set(pos,true);
        ring &= ~blindBossTiles;
        for(auto p:(bc::vision::camp_tiles() & g.tilesBB).positions())try {
            const auto monster=bc::vision::camp_at(p);
            if(cheb(pos,p)==4 && castOnCamp(monster))return;
        }catch(const TurnAbort&){throw;}catch(...){}
        if(!ring.is_set(pos))moveToward(ring,false);
        return;
    }
    if (tileVisible && g.state == 2 && !anyCampVisible) {
        // capture: stand on a spawn tile, alone
        if (g.tilesBB.is_set(pos)) {
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
        if (allyCapturing(g.id)) { target = -1; capturing = false; return; }
        capturing = false;
        moveToward(g.tilesBB, true);
        if (g.tilesBB.is_set(me.position())) { capturing = true; captureSince = round; }
        return;
    }
    capturing = false;
    if (anyCampVisible || (tileVisible && g.state == 1)) {
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
void Bot::willowTurn() {
    auto& me = bc::self();
    const vec2 pos = me.position();
    // heal the most-damaged ally in range when missing >= 180
    if (!castThisTurn && me.can_cast()) {
        for (auto ab : me.abilities()) {
            if (!ab.is_heal() || !selfReady(ab)) continue;
            std::optional<bc::champion> best;
            float miss = 179.0f;
            for (auto& a : safeChamps(team::ally)) {
                try {
                    if (!a.is_alive() || a == me) continue;
                    if (!ab.valid_tiles().is_set(a.position())) continue;
                    float m = a.max_health() - a.health();
                    if (m > miss) { miss = m; best = a; }
                } catch (const TurnAbort&) { throw; } catch (...) {}
            }
            if (best) {
                try { if (ACT(ab.use(*best))) castThisTurn = true; } catch (const TurnAbort&) { throw; } catch (...) {}
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
        } catch (const TurnAbort&) { throw; } catch (...) {}
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
                try { if (groups[leaderTarget].tilesBB.is_set(c.spawn_position())) shoot.draw_chebyshev(c.position(), me.attack_range()); } catch (const TurnAbort&) { throw; } catch (...) {}
            }
        }
        auto goals = shoot & near;
        if (!goals.is_empty()) {
            if (!goals.is_set(pos)) moveToward(goals, false);
            else yieldToAllies();
            return;
        }
        if (ld > 2) {
            bc::bitboard g2;
            g2.draw_chebyshev(leader->position(), 2);
            moveToward(g2, false, true);
        }
        else yieldToAllies();
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
    const bool previousStale=stale;
    frameRound=static_cast<int>(bc::round_number()); stopped=stale=false; apiErrors=blockedActions=0; heavyFieldUsed=false;
    round=frameRound;
    if(inited && motionSampleRound!=round){
        motionSampleRound=round;
        if(attackedThisTurn || capturing || lowMode || previousStale || (target>=0 && groups[target].state>=2) || !me.is_alive() || me.gem_count()>0 || me.is_recalling() || me.is_submitting_gems() || me.is_teleporting())taskTrail.clear();
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
                repeated |= same&&nonconstant;
            }
            if(taskTrail.size()>=8 && repeated && target>=0 && target<static_cast<int>(groups.size())){
                // Only an unproductive repeated footprint expires a target.
                stalledUntil[target]=round+24;target=-1;taskTrail.clear();
            }
        }
    }
    contactEscape=false;
    movedThisTurn = attackedThisTurn = castThisTurn = false;
    if(previousStale){target=-1;capturing=false;captureSince=-1;wasSubmitting=false;recoveryActive=recoveryValid=false;motionHistory.clear();motionRound=-1;goalBest=UNR;yieldPeerSince=-1;}
    if(!inited){init();if(!inited){openingMove();return;}}
    if(!enough())return;
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
        handleLowHp(true);setPriority(lowMode);
        stage="stunned";writeStatus(lowMode);return;
    }
    stage = "know";
    if(!stalledRetreat)updateKnowledge();
    if(!enough(24000)){stage="budget";return;}

    const bool submittingNow = me.is_submitting_gems();
    const bool justSubmitted = wasSubmitting && !submittingNow && me.gem_count() == 0;
    wasSubmitting = submittingNow;

    if (me.is_recalling() || submittingNow || me.is_teleporting()) {
        setPriority(lowMode);
        writeStatus(lowMode);
        return;
    }
    if (onSpawn() || myType==bc::champion_type::tavi) shop();

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

    // A bag that can finish the game outranks optional combat and extra camps.
    // Emergency survival and an already-running channel/capture remain first.
    if(!capturing && me.gem_count()>0 && v11r::winning_bag(bc::global_submitted_gems(team::ally),me.gem_count(),bc::constants::winning_gems)) {
        stage="winning-tribute";
        if(doTribute()){writeStatus(false);return;}
    }

    // Gold-only farming otherwise never reaches the tribute-triggered shop.
    // Tavi shops in the field. Other casters need a safe investment trip.
    if(bossOnly && myType!=bc::champion_type::tavi && me.gold_count()>=150 && me.gem_count()==0 && !onSpawn() && !capturing) {
        bool nearby=false;for(const auto& e:safeChamps(team::enemy))if(e.is_alive() && cheb(e.position(),me.position())<=6)nearby=true;
        if(!nearby){try{ACT(me.recall());writeStatus(false);return;}catch(const TurnAbort&){throw;}catch(...){}}
    }
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

    if (myType == bc::champion_type::willow) {
        stage = "willow";
        willowTurn();
        writeStatus(false);
        return;
    }
    stage = "fight";
    if (fightChampions() && (contactEscape || ranged || !me.can_move() || attackedThisTurn)) {
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

}  // namespace boss
