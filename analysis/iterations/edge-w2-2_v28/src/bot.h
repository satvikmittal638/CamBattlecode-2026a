#pragma once
// Persistent per-champion planning state; see research/phase11 for evidence.
#include <cambc.h>
#include <cstdint>
#include <vector>
#include <memory>
#include <exception>

namespace mm {

using cambc::vec2;

struct TurnAbort {};
bool frame_aborted();
bool frame_stale();
int frame_errors();
int frame_blocked();
void invalidate_frame();

struct Route {
    std::vector<vec2> roots;
    cambc::distance_field distance;
    bool complete = false;
};

// Static knowledge about one camp group (computed once on the first turn) plus what this
// champion currently believes about its state.
struct Group {
    int id = 0;
    std::vector<vec2> tiles;          // camp spawn tiles (capture tiles)
    cambc::bitboard tilesBB;
    int gems = 0, gold = 0, respawn = 50;
    float totalHp = 0, totalStr = 0;
    bool monolith = false, eligible = false;
    int dOwn = 0, dEnemy = 0;         // walking distance from own / enemy spawn
    vec2 center{0, 0};
    std::unique_ptr<Route> route;
    // belief
    int state = 0;                    // 0 unknown (assume alive), 1 alive, 2 reward available, 3 respawning
    int respawnAt = 0;                // round at which it is alive again (state 3)
    int seenRound = -1000;
    float hpLeft = 0;                 // remaining camp health when last seen alive
};

struct Altar {
    vec2 pos;
    std::unique_ptr<Route> route;
    std::vector<vec2> approaches;
};

class Bot {
public:
    void play_turn();
    const char* where() const { return stage; }
    int goal() const { return target; }
    bool draft_ready() const { return draftValid; }

private:
    // ---- world (static) ----
    bool inited = false;
    int W = 0, H = 0;
    int slot = 0, partnerSlot = -1, cassiSlot = -1;
    int nAllies = 0;
    std::vector<int> slotType;        // champion_type per slot
    cambc::champion_type myType{};
    bool ranged = false;
    bool farMap = false, closeSpawns=false;
    int spawnAltarDist = 0;           // walking distance from own spawn to the nearest altar              // spawn-to-spawn path long -> Power second (low contact)
    cambc::bitboard staticBlocked;
    cambc::bitboard ownSpawnBB, enemySpawnBB, bushBB;
    std::vector<std::uint8_t> terrain;
    std::vector<int> tileGroup;
    std::unique_ptr<Route> homeRoute, moveRoute;
    cambc::bitboard moveGoals;
    int initNext = 0;
    bool initStarted = false;
    bool draftValid = false;
    vec2 previousTile{-1, -1};
    std::vector<vec2> motionHistory;
    int motionRound = -1, goalBest = 65535, stalledMoves = 0;
    bool recoveryActive = false, recoveryValid = false;
    cambc::distance_field recoveryField;
    cambc::bitboard recoveryBlocked, recoveryGoals;
    vec2 recoveryOrigin{-1,-1};
    std::uint32_t yieldPeer = 0xFFFFFFFF;
    vec2 yieldPeerPosition{-1,-1}, yieldOwnPosition{-1,-1};
    int yieldPeerSince = -1, yieldPeerLastRound = -1;
    int lastReasonCode = -1, lastReasonRound = -100;
    std::vector<Group> groups;
    std::vector<cambc::map::camp_group> rawGroups;
    std::vector<Altar> altars;

    // ---- per-turn state ----
    int round = 0;
    std::uint8_t shared[8] = {};
    int target = -1;                  // camp group id
    bool capturing = false;
    int captureSince = -1;
    int spawnDuelSince=-1, spawnRestUntil=0;
    bool lowMode = false, stalledRetreat=false;
    std::vector<vec2> lowTrail, taskTrail;
    std::vector<int> stalledUntil;
    float lastLowHp=0;
    int motionSampleRound=-1;
    bool escapeHome(const std::vector<vec2>& threats);
    bool wasSubmitting = false;
    int lastGems = 0;
    bool movedThisTurn = false, attackedThisTurn = false, castThisTurn = false;
    int lastWardRound = -100;
    const char* stage = "";

    // helpers
    void init();
    int idx(vec2 p) const { return p.y * W + p.x; }
    std::uint16_t gdist(const Group& g, vec2 p) const;
    std::uint16_t altarDistance(int altar, vec2 p) const;
    std::unique_ptr<Route> newRoute(const std::vector<vec2>& roots) const;
    void expand(Route& route, int nodeLimit);
    int routeAt(const Route* route, vec2 p) const;
    int heuristic(const std::vector<vec2>& roots, vec2 p) const;
    int homeDistance(vec2 p) const;
    void openingMove();
    void planWork();
    void releaseCapture();
    void refreshCapture();
    void noteMotion(vec2 position);
    void prepareRecovery();
    int recoveryAt(vec2 position) const;
    bool yieldToAllies();
    void recoveryReason(int code, const char* reason);
    void readShared();
    void writeStatus(bool low);
    void updateKnowledge();
    void setPriority(bool low);
    void shop();
    void placeWard();
    bool handleLowHp();
    bool fightChampions();
    bool fightChampionsV21();
    int chooseTargetV21();
    void placeWardV21();
    bool castOffensive(const std::vector<cambc::champion>& live);
    float targetScore(const cambc::champion& e) const;
    bool enemyClose();
    int enemyCloseRound = -1;
    bool enemyCloseValue = false;
    bool doTribute();
    void farm();
    bool handOffCapture(const Group& g);
    void willowTurn();
    int chooseTarget();
    int chooseTargetUncached();
    int chooseTargetW2();
    int chooseTargetW3();
    int chooseRound = -1, chooseCached = -1;
    bool chooseValid = false;
    float myDps() const;
    float typeDps(int type) const;
    bool groupAlive(const Group& g) const;
    bool allyCapturing(int gid) const;
    int nearestAltar(vec2 p) const;
    cambc::bitboard blockedNow() const;
    bool moveToward(const cambc::bitboard& goals, bool allowDash, bool bushy = false);
    bool moveAway(const std::vector<vec2>& threats);
    bool attackCampsOf(int gid);
    bool campSafe(int gid);
    int gateRound = -1, gateGid = -1, gateRange = 0, gateWaitGid = -1, gateWaitSince = 0;
    bool gateValue = true;
    std::vector<vec2> gateArmed;
    bool castOnCamp(const cambc::camp& c);
    bool castOnEnemy(const cambc::champion& e);
    void afterAttackReset(const cambc::unit* tgt);
    bool useDashToward(const Route& route);
    bool onSpawn() const;
};

}  // namespace mm

using Bot = mm::Bot;
