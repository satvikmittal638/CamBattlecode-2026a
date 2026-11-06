
#include <vector>
#include <set>
#include <utility>
#include <cassert>
#include <iostream>
struct vec2{int x,y;};struct Board{std::set<std::pair<int,int>> tiles;bool is_set(vec2 p)const{return tiles.count({p.x,p.y});}};
namespace bc{namespace vision{Board seen,camps;Board visible_tiles(){return seen;}Board camp_tiles(){return camps;}}}
bool X_DYNAMICGATE=false;
struct Group{int state=1,seenRound=0;};struct Altar{std::vector<vec2> approaches;};
struct Bot{int bankGate=0,round=0;std::vector<Group> groups{{}};std::vector<Altar>altars{{{{24,20}}}};bool groupAlive(const Group&g)const{return g.state==1;}bool bankGateClosed()const;};
bool Bot::bankGateClosed()const{
    if(bankGate<0)return false;
    const auto& gate=groups[bankGate];
    if(X_DYNAMICGATE){
        const auto visible=bc::vision::visible_tiles(),living=bc::vision::camp_tiles();
        for(const auto& altar:altars)for(auto p:altar.approaches)
            if(visible.is_set(p)&&!living.is_set(p))return false;
    }
    // Occupancy can delay actual respawn after the countdown reaches zero.
    // Fresh personal engine state outranks the predicted respawn deadline.
    if(gate.state==3&&gate.seenRound==round)return false;
    return groupAlive(gate);
}

int main(){Bot bot;bc::vision::seen.tiles={{24,20}};bc::vision::camps.tiles={{23,20},{24,20}};
 for(bool dynamic:{false,true}){X_DYNAMICGATE=dynamic;assert(bot.bankGateClosed());}
 bc::vision::camps.tiles.erase({24,20});X_DYNAMICGATE=false;assert(bot.bankGateClosed());X_DYNAMICGATE=true;assert(!bot.bankGateClosed());
 bc::vision::seen.tiles.clear();assert(bot.bankGateClosed());
 std::cout<<"Live group, personally observed free altar approach: closed -> open; unseen approach remains closed\n";}
