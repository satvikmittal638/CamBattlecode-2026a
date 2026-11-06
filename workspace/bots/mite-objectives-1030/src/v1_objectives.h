// Included inside mm. Phase2 objective playbook; all140 source games are fit
// data. Coordinates select tasks, never actions or fixed action times. The
// ordinary executor rechecks legal visibility, danger, attacks, and capture.
int Bot::objectiveTarget(){
    if(!inited||!objectiveProfile||stale||!enough(35000))return -1;
    const int type=int(myType);if(type<0||type>=13)return -1;
    const auto role=objectiveProfile->roles[type];
    if(!role.count||objectiveCursor>=role.count){objectiveGroup=-1;return -1;}
    const auto pos=bc::self().position();
    for(int attempt=0;attempt<8&&objectiveCursor<role.count;++attempt){
        const auto point=MITE_OBJECTIVE_POINTS[role.offset+objectiveCursor];
        const vec2 tile{point.x,point.y};
        if(tile.x>=W||tile.y>=H){++objectiveCursor;continue;}
        const int gid=tileGroup[idx(tile)];
        if(gid<0||gid>=int(groups.size())){++objectiveCursor;continue;}
        const auto& g=groups[gid];
        // A capture completed by either side invalidates this occurrence. A
        // later occurrence can still target the same group after its respawn.
        const bool respawning=g.state==3&&g.respawnAt>round+4;
        if(gid==objectiveAwaitRespawn&&(g.state==2||respawning)){objectiveGroup=-1;return -1;}
        if(gid==objectiveAwaitRespawn&&g.state!=2&&!respawning)objectiveAwaitRespawn=-1;
        if(!point.capture&&g.state==2){objectiveAwaitRespawn=gid;++objectiveCursor;objectiveGroup=-1;objectiveEntry=-1;continue;}
        if(respawning||stalledUntil[gid]>round||allyCapturing(gid)){
            if(respawning)objectiveAwaitRespawn=gid;++objectiveCursor;objectiveGroup=-1;objectiveEntry=-1;continue;
        }
        if(g.dOwn==UNR){++objectiveCursor;objectiveGroup=-1;continue;}
        if(g.monolith&&!g.eligible&&g.state<2&&gid!=bankGateHint&&round<X_MONOROUND){objectiveGroup=-1;return -1;}
        if(gid!=objectiveGroup||objectiveEntry!=objectiveCursor){objectiveEntry=objectiveCursor;objectiveCapture=point.capture!=0;objectiveGroup=gid;objectiveAdopted=round;objectiveProgressRound=round;objectiveBestDistance=65535;objectiveLastHp=-1;}
        const int d=gdist(g,pos);
        if(d==UNR){++objectiveCursor;objectiveGroup=-1;continue;}
        if(d<objectiveBestDistance||(g.state==1&&objectiveLastHp>=0&&g.hpLeft<objectiveLastHp-.5f))objectiveProgressRound=round;
        objectiveBestDistance=std::min(objectiveBestDistance,d);objectiveLastHp=g.hpLeft;
        // The opponent can deny or alter the source circuit. Repeated failure
        // defers to our generic legal scorer instead of playing a dead script.
        if(round-objectiveProgressRound>35&&g.state!=2&&!capturing){++objectiveCursor;objectiveGroup=-1;continue;}
        if(!enough(31000))return -1;
        const float health=bc::self().health(),maximum=bc::self().max_health();
        if(health<maximum*.55f&&g.totalStr>0){objectiveGroup=-1;return -1;}
        for(auto enemy:bc::vision::champion_tiles(team::enemy).positions()){
            if(cheb(enemy,g.center)<=4&&cheb(pos,g.center)>5&&health<maximum*.8f){objectiveGroup=-1;return -1;}
        }
        stage="mite-role-objective";return gid;
    }
    objectiveGroup=-1;return -1;
}
