#pragma once
// Shared by production candidates and deterministic fixtures. Policy != proven match benefit.
namespace v11r {
inline bool winning_bag(unsigned bank,unsigned bag,unsigned goal) {
    return bag>0 && (bank>=goal || bag>=goal-bank);
}
inline bool rotate_contact(float hp,float maxHp,int enemies,int healthyFriends,bool targetInRange,bool immediateFinish) {
    if(enemies<2 || immediateFinish)return false;
    return hp<0.65f*maxHp || (!targetInRange && healthyFriends<enemies);
}
inline int escort_target(const int* types,const unsigned char* shared,int count,int leaderType,int fallbackSlot,int groups) {
    int chosen=fallbackSlot;
    if(leaderType>=0)for(int s=0;s<count;++s)if(types[s]==leaderType){chosen=s;break;}
    if(chosen<0 || chosen>=count || chosen>=8)return -1;
    const int target=(shared[chosen]&63)-1;
    return target>=0 && target<groups?target:-1;
}
inline long escape_score(int separation,int homeSteps) {return 100L*separation-homeSteps;}
}
