// Never release a lone denial body merely because a timer elapsed. A handover
// needs an already-present, healthy, unchannelled claimant on this same region.
bool Bot::captureHandover(bool bankOpen){
    if(!capturing||target<0||captureSince<0||round-captureSince<12||!enough(37000))return false;
    auto& me=bc::self();auto& g=groups[target];const auto pos=me.position();
    if(g.state!=2||!g.tilesBB.is_set(pos))return false;
    const auto id=static_cast<unsigned>(static_cast<bc::handle_champion_t>(me));
    const unsigned bag=me.gem_count();
    // The total rank is stable during a contested capture: empty bodies keep
    // denial before carriers, then smaller bags, then entity ID.
    auto rank=[](unsigned gems,unsigned handle){return std::make_pair(gems,handle);};
    const auto ownRank=rank(bag,id);bool substitute=false;
    for(auto p:(bc::vision::champion_tiles(team::ally)&g.tilesBB).positions()){
        if(!enough(30000))break;unsigned other=0,gems=0;bc::detail::champion_info info{};
        if(bc::detail::sdk_champion_at(p.x,p.y,&other)||other==id||bc::detail::sdk_champion(other,&info)||!(info.state&1)||(info.state&(2|4|4096))||info.health<.5f*info.max_health)continue;
        if(bc::detail::sdk_champion_gems(other,&gems)||rank(gems,other)>=ownRank)continue;
        bool claimed=false;
        for(int k=0;k<nAllies&&k<6;++k)if(k!=slot&&rosterHandles[k]==other&&(shared[k]&0xC0)==0x40&&(shared[k]&63)==g.id+1)claimed=true;
        if(claimed){substitute=true;break;}
    }
    if(!substitute)return false;
    // Departure is worthwhile only with a real delivery route or another
    // resource objective. Closed boss access is not counted as a bank route.
    int bank=-1,next=-1,best=UNR;
    if(bag&&bankOpen){const int a=nearestAltar(pos);if(a>=0&&altarDistance(a,pos)!=UNR)bank=a;}
    if(bank<0)for(const auto& other:groups){
        if(other.id==g.id||other.state!=2||stalledUntil[other.id]>round||!enough(28000))continue;
        if((bc::vision::visible_tiles()&other.tilesBB).is_empty()||!(bc::vision::camp_tiles()&other.tilesBB).is_empty()||!(bc::vision::champion_tiles(team::enemy)&other.tilesBB).is_empty())continue;
        const int distance=gdist(other,pos);if(distance<best){next=other.id;best=distance;}
    }
    if(bank<0&&next<0)return false;
    if(!enough(40000))return false;
    const int old=target,oldSince=captureSince,oldStall=stalledUntil[old];
    const bool priorBank=handoverBank;
    releaseCapture();target=next;stalledUntil[old]=round+16;
    stage="capture-physical-handover";
    if(bank>=0){handoverBank=true;doTribute();}
    else moveToward(groups[next].tilesBB,false);
    // An intent is not a completed handover. Restore the claim if no departure
    // or channel happened; status publication then retains the physical holder.
    bc::detail::champion_info after{};
    if(!bc::detail::sdk_champion(id,&after)&&(after.state&1)&&after.x==pos.x&&after.y==pos.y&&!(after.state&(2|4|4096))){
        capturing=true;captureSince=oldSince;target=old;stalledUntil[old]=oldStall;handoverBank=priorBank;
        stage="capture-handover-deferred";
    }
    return true;
}
