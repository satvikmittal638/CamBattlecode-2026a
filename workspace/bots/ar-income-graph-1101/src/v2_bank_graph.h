// Bounded graph insertion: position -> harmless camp -> bank versus bank now.
// Exact completed walking fields, no hidden enemy positions or map-name policy.
int Bot::bankGraphWaypoint(int gems,int bankDistance){
    if(!ownItemsKnown||altars.empty())return -1;
    for(const auto& altar:altars)if(!altar.route||!altar.route->complete)return -1;
    const auto pos=bc::self().position();const float dps=myDps();
    const float goldW=X_GOLDW*(ownShards>=X_GOLDRICH?X_GOLDRICHW:1.0f);
    const float gemValue=1+(myType==bc::champion_type::marcella?2*goldW:0);
    const float goldBonus=myType==bc::champion_type::vesper_vale?1.33f:1;
    float bestValue=gemValue*gems,bestTime=bankDistance+std::ceil(gems/10.0f)+1;
    int best=-1;
    for(const auto& g:groups){
        if((g.id&7)==0&&!enough(50000))break;
        if(g.monolith||g.totalStr>0||(!g.gems&&!g.gold)||stalledUntil[g.id]>round||allyCapturing(g.id))continue;
        const bool ours=g.eligible||(g.gold>0&&g.dOwn!=UNR&&g.dOwn<=g.dEnemy+4);
        if(!ours)continue;
        bool claimed=false;for(int k=0;k<nAllies&&k<6;++k)if(k!=slot&&!(shared[k]&0x80)&&(shared[k]&63)==g.id+1)claimed=true;
        if(claimed)continue;
        const int walk=routeAt(g.route.get(),pos);if(walk<0||walk==UNR)continue;
        int bank=UNR;
        for(const auto& altar:altars)for(auto tile:g.tiles){const int d=routeAt(altar.route.get(),tile);if(d>=0)bank=std::min(bank,d);}
        if(bank==UNR)continue;
        const int wait=g.state==3?std::max(0,g.respawnAt-round-walk):0;if(wait>2)continue;
        const bool reward=g.state==2&&round-g.seenRound<15;
        const float hp=reward?0:(g.state==1&&round-g.seenRound<30?g.hpLeft:g.totalHp);
        // Connected spawn tiles give a conservative entry-to-exit walk bound.
        // The graph cannot teleport between two different camp-region tiles.
        const float time=walk+std::max(0,static_cast<int>(g.tiles.size())-1)+wait
            +std::ceil(hp/dps)+5+bank+std::ceil((gems+g.gems)/10.0f)+1;
        const float value=gemValue*(gems+g.gems)+goldW*goldBonus*g.gold;
        if(value*bestTime>bestValue*time){best=g.id;bestValue=value;bestTime=time;}
    }
    return best;
}
