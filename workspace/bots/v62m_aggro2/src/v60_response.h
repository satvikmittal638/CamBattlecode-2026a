// Bounded response envelopes, not a terrain/vision-aware opponent simulator.
// Every branch consumes at most one cast per owner turn. A slot used in the
// first reply cannot be reused in the second; positions carry forward. This
// excludes intervening kills (Vendetta can refresh cooldowns on a kill).
struct V60Reply { float damage=0; int distance=0,slot=-1; };
static int v60Replies(const V1Body& b,int distance,bool fresh,bool disabled,
                      const int cd[2],V60Reply out[8]) {
    if(disabled){out[0]={0,distance,-1};return 1;}
    const auto& i=b.info;const auto& kit=v1KitForType(i.type);
    const bool attack=fresh||(i.state&16),walk=fresh||(i.state&8),cast=fresh||(i.state&2048);
    const bool melee=i.attack_range==1;int n=0;
    for(int step=0;step<=(walk?1:0);++step){
        const int d=std::max(1,distance-step);
        const float basic=attack&&d<=i.attack_range&&(!step||melee)?i.strength:0;
        out[n++]={basic,d,-1};
        if(!cast)continue;
        for(int k=0;k<2;++k){
            if(cd[k]>0)continue;
            const auto& a=kit.definition.abilities[k];
            if(step&&(a.attributes&1))continue;
            float damage=basic;int landing=d;
            if(a.kind==1){
                if(d<=i.attack_range)damage+=i.strength;
            }else if(a.kind>=2&&a.kind<=4){
                // Ground AoE may affect a tile beyond the cast-centre range.
                // Reach is an upper envelope: enemy visibility and a legal
                // centre are uncertain, so this is not executable-action proof.
                if(!(a.targets&(bc::detail::ability_target_enemies|bc::detail::ability_target_ground)))continue;
                const float radius=a.kind==3?a.payload.aoe_damage.radius:0;
                if(d<=v1DamageRange(a)+radius)damage+=i.focus*v1DamageModifier(a);
            }else if(a.kind==6){
                landing=std::max(1,d-static_cast<int>(a.payload.dash.range));
                // Dash transit/occupancy are uncertain in this cheap envelope.
                damage=attack&&(!step||melee)&&landing<=i.attack_range?i.strength:0;
                if(i.type==12&&landing<=a.payload.dash.radius){
                    damage+=b.heartDash;
                    if(attack&&landing<=i.attack_range)damage+=i.strength*.5f;
                }
            }else continue;
            out[n++]={damage,landing,k};
        }
    }
    return n;
}
static float v1Response(const V1Body& b,vec2 p,int tick,bool disabled=false){
    V60Reply replies[8];int cd[2]{b.cd[0],b.cd[1]};
    const bool fresh=tick>0||(b.info.state&32);
    if(tick>0&&!(b.info.state&32))for(int& c:cd)c=std::max(0,c-tick);
    const int n=v60Replies(b,cheb(b.position(),p),fresh,disabled||(!tick&&b.stun),cd,replies);
    float best=0;for(int j=0;j<n;++j)best=std::max(best,replies[j].damage);return best;
}
static float v60Sequence(const V1Body& b,vec2 p,bool disabled=false){
    const int distance=cheb(b.position(),p);const bool completed=b.info.state&32;
    const int key=disabled?1:0;
    if(distance<12&&(b.responseMemoValid[key]&(1u<<distance)))return b.responseMemo[key][distance];
    V60Reply first[8];const int n=v60Replies(b,distance,completed,disabled||b.stun,b.cd,first);
    float best=0;
    for(int j=0;j<n;++j){
        if(completed){best=std::max(best,first[j].damage);continue;}
        int cd[2]{std::max(0,b.cd[0]-1),std::max(0,b.cd[1]-1)};
        if(first[j].slot>=0)cd[first[j].slot]=std::max(1,v1KitForType(b.info.type).definition.abilities[first[j].slot].cooldown-1);
        V60Reply second[8];const int m=v60Replies(b,first[j].distance,true,false,cd,second);
        for(int k=0;k<m;++k)best=std::max(best,first[j].damage+second[k].damage);
    }
    if(distance<12){b.responseMemo[key][distance]=best;b.responseMemoValid[key]|=1u<<distance;}
    return best;
}
