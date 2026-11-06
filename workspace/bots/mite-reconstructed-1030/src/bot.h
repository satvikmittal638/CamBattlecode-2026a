#pragma once
#include <cambc.h>
#include <vector>
#include <array>
#include <cstdint>
namespace bc=cambc;
void model_draft();
struct CampGoal {
    bc::map::camp_group group;
    bc::bitboard tiles;
    std::vector<bc::vec2> positions;
    bc::vec2 center;
    float hp=0, hpLeft=0, damage=0;
    int gold=0,gems=0,home=0,enemy=0,respawn=0;
    int state=0,until=0,seen=-1000;
    bool boss=false;
};
struct SeenUnit {
    unsigned id=0;
    bc::vec2 pos;
    float hp=0,maxHp=0,strength=0;
    int range=1,type=0,gems=0;
};
class Model {
    bool ready=false,setup=false;
    int W=0,H=0,type=0,slot=0,round=0,target=-1,initCursor=0;
    int lastGoal=-1,stuck=0,lastRound=-100,goalStale=0;
    bc::vec2 lastPosition{-1,-1};
    unsigned selfId=0;
    bool moved=false,attacked=false,casted=false;
    bool wasBanking=false,recallHold=false,shopRecall=false,contactSeen=false;
    int captureGoal=-1,lastCaptureRound=-1000;
    bc::bitboard blockedStatic,spawn,enemySpawn,bushes;
    std::vector<CampGoal> groups;
    std::vector<bc::map::camp_group> rawGroups;
    std::vector<bc::vec2> altars;
    std::vector<bc::distance_field> altarFields;
    int gate=-1;bool gateReady=false;
    bool gateWork();
    std::vector<int> tileGroup,allyTypes,campGroup,campRange;
    std::array<std::uint8_t,8> shared{};
    std::vector<SeenUnit> allies,enemies;
    struct SeenCamp {unsigned id;bc::vec2 pos;float hp,strength;int group,range;bool awake;};
    std::vector<SeenCamp> camps;
    bc::detail::champion_design kit{};
    int cooldown[2]{};
    unsigned items[84]{},gold=0,gems=0;
    bc::detail::champion_info self{};
    void refreshSelf();
    void init();
    void sense();
    void claim(bool capture=false);
    void shop();
    void ward();
    bool retreat();
    bool fight();
    bool bank();
    void farm();
    int choose();
    bool attack(bool champion,int group=-1);
    bool move(const bc::bitboard& roots,bool dash=true,bool flee=false);
    bool cast(int slot,unsigned kind,unsigned id,bc::vec2 p);
    bool offensive(bool champion,int group=-1);
    void resetAttack(bool champion,int group);
    bool healthyHome();
    bc::bitboard blockers()const;
    int nearestAltar(bc::vec2 pos)const;
    int distance(bc::vec2 a,bc::vec2 b)const;
public:
    void turn();
};
