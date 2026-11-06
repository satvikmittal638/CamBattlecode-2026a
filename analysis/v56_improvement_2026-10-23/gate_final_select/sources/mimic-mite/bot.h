#pragma once
// Mimic of team Mite (ladder #1). See analysis/mite/STYLE.md for the behaviour being reproduced.
#include <cambc.h>
#include <cstdint>
#include <vector>

namespace mm {

using cambc::vec2;

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
    std::vector<std::uint16_t> dist;  // walking distance to stand on a tile, row-major
    // belief
    int state = 0;                    // 0 unknown (assume alive), 1 alive, 2 reward available, 3 respawning
    int respawnAt = 0;                // round at which it is alive again (state 3)
    int seenRound = -1000;
    float hpLeft = 0;                 // remaining camp health when last seen alive
};

struct Altar {
    vec2 pos;
    std::vector<std::uint16_t> dist;  // walking distance to a tile within submit range
};

class Bot {
public:
    void play_turn();
    const char* where() const { return stage; }

private:
    // ---- world (static) ----
    bool inited = false;
    int W = 0, H = 0;
    int slot = 0, partnerSlot = -1, cassiSlot = -1;
    int nAllies = 0;
    std::vector<int> slotType;        // champion_type per slot
    cambc::champion_type myType{};
    bool ranged = false;
    bool farMap = false;
    int spawnAltarDist = 0;           // walking distance from own spawn to the nearest altar              // spawn-to-spawn path long -> Power second (low contact)
    cambc::bitboard staticBlocked;
    cambc::bitboard ownSpawnBB, enemySpawnBB, bushBB;
    std::vector<std::uint16_t> distOwn, distEnemy;
    std::vector<Group> groups;
    std::vector<cambc::map::camp_group> rawGroups;
    std::vector<Altar> altars;

    // ---- per-turn state ----
    int round = 0;
    std::uint8_t shared[8] = {};
    int target = -1;                  // camp group id
    bool capturing = false;
    int captureSince = -1;
    bool lowMode = false;
    bool wasSubmitting = false;
    int lastGems = 0;
    bool movedThisTurn = false, attackedThisTurn = false, castThisTurn = false;
    int lastWardRound = -100;
    const char* stage = "";

    // helpers
    void init();
    int idx(vec2 p) const { return p.y * W + p.x; }
    std::uint16_t gdist(const Group& g, vec2 p) const { return g.dist[idx(p)]; }
    void readShared();
    void writeStatus(bool low);
    void updateKnowledge();
    void setPriority(bool low);
    void shop();
    void placeWard();
    bool handleLowHp();
    bool fightChampions();
    bool doTribute();
    void farm();
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
    bool useDashToward(const cambc::distance_field& f);
    bool onSpawn() const;
};

}  // namespace mm

using Bot = mm::Bot;
