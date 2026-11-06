#pragma once
// Persistent per-champion planning state; see research/phase11 for evidence.
#include <cambc.h>
#include "v1_help_packet.h"
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
    std::vector<std::uint16_t> linear;
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
    int bankDistance=-1,bankCursor=0,bankBest=65535;
    bool monolith = false, eligible = false;
    int dOwn = 0, dEnemy = 0;         // walking distance from own / enemy spawn
    vec2 center{0, 0};
    std::unique_ptr<Route> route;
    // belief
    int state = 0;                    // 0 unknown (assume alive), 1 alive, 2 reward available, 3 respawning
    int respawnAt = 0;                // round at which it is alive again (state 3)
    int seenRound = -1000;
    std::vector<std::pair<float,float>> clearOrder,liveOrder;bool fullyObserved=false;int splashTargets=1;
    float hpLeft = 0;                 // remaining camp health when last seen alive
};

struct Altar {
    vec2 pos;
    std::unique_ptr<Route> route;
    std::vector<vec2> approaches;
};

struct V1Body;
class Bot {
public:
    void play_turn();
    const char* where() const { return stage; }
    int goal() const { return target; }
    int type_id() const { return static_cast<int>(myType); }
    bool draft_ready() const { return draftValid; }

private:
    // ---- world (static) ----
    bool inited = false;
    bool groupGeometryReady = false;
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
    std::vector<int> tileGroup;std::vector<std::uint8_t> campRanges;
    std::unique_ptr<Route> homeRoute, moveRoute;
    cambc::bitboard moveGoals;
    bool bridgeWalking=false;int bridgeSince=0,bridgeMisses=0,bridgeProgressRound=0,bridgeWalkBest=65535,bridgeAvoidUntil=0;
    cambc::bitboard bridgeRejected;
    cambc::bitboard bridgeFinalGoals,bridgeWalkGoals;std::unique_ptr<Route> bridgeFarRoute;
    bool planBridge(const cambc::bitboard&,const cambc::bitboard&,const cambc::bitboard&,vec2);
    bool finishBridge(const cambc::bitboard&,vec2);
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
    bool combatWithdraw=false;
    int lastWardRound = -100;
    int spawnHealRound=-1000,spawnHealStall=0;float spawnHealHp=0;
    const char* stage = "";

    // helpers
    void play_step();
    void metaAfterTurn();
    bool speculativeRecall=false;
    bool cheapStep(const cambc::bitboard& goals);
    void progressFinish();
    enum TaskKind {travel,clearing,capture,banking,support,recovery,combat};
    TaskKind progressKind=travel,previousKind=travel;
    int bankAvoid=-1,bankAvoidUntil=0;
    int choiceRound=-1,choiceTarget=-2,choiceResult=-1,choiceBlocked=-1;
    vec2 choicePosition{-1,-1};int scoreTargets();int affordableTarget();
    int quietTurns=0,taskProgressTarget=-1,supportUntil=0,supportTask=-1;
    int lastSupportRound=-1000;bool supportNeeded=false;unsigned supportLeader=0xFFFFFFFF;int supportLeaderUntil=-1000;std::vector<unsigned> rosterHandles;
    float progressCampHp=-1;
    vec2 progressPosition{-1,-1};
    cambc::bitboard fallbackGoals;
    bool fallbackRequested=false;
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
    void warmGeometry();
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
    bool handleLowHp(bool statusOnly=false);
    V1CallReader helpReader;bool helpValid=false;int lastHelpLog=-1000;
    void requestHelp(const std::vector<V1Body>& foes,const std::vector<V1Body>& mates);
    bool answerHelp();int tacticalFight();
    bool fightChampions();
    int bankGateHint=-2;int bankGate=-1,gateRetryAt=0,lastGateShop=-1000,gateRouteFailures=0;
    bool bankTopologyReady=false;cambc::bitboard gateFiring,gateBlind;
    void discoverBankGate();bool bankGateClosed()const;bool workBankGate();
    int cancelledBankChannelRound=-1;
    int channelThreatRound=-1;bool channelThreatValue=false;cambc::vec2 channelThreatPosition{};
    bool bankChannelThreat();
    bool retreatBankCarrier();
    bool removeBankLock(cambc::vec2 altar);
    bool doTribute();
    bool captureHandover(bool);bool handoverBank=false;
    void farm();
    bool carryWants(const Group& g);
    bool outgunnedIsolated();
    bool rallyToFight();
    void meleeParting();
    int recallTryRound = -10; float recallTryHp = 0.0f;
    bool lowerCapturing(int gid) const;
    void willowTurn();
    int chooseTarget();
    float myDps() const;
    float typeDps(int type) const;
    bool groupAlive(const Group& g) const;
    bool allyCapturing(int gid) const;
    int nearestAltar(vec2 p) const;
    cambc::bitboard blockedNow() const;
    bool moveToward(const cambc::bitboard& goals, bool allowDash, bool bushy = false);
    bool moveAway(const std::vector<vec2>& threats);
    bool attackCampsOf(int gid);
    bool castOnCamp(const cambc::camp& c);
    bool castOnEnemy(const cambc::champion& e);
    void afterAttackReset(const cambc::unit* tgt);
    bool useDashToward(const Route& route);
    bool bridgeDash(const Route&,const cambc::bitboard&,vec2);
    bool onSpawn() const;
};

}  // namespace mm

using Bot = mm::Bot;
