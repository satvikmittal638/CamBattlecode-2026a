// Piecewise camp-clear projection. Ally arrivals are timed edges, not free
// damage at the beginning of the clear. Uses only visible committed allies.
struct V2Arrival {float time=0,dps=0;};
struct V2Clear {float time=0,incoming=0;};
static V2Clear v2ArrivalClear(const std::vector<std::pair<float,float>>& order,
        float ratio,float ownRate,float strength,float burst,std::vector<V2Arrival> arrivals){
    std::sort(arrivals.begin(),arrivals.end(),[](const auto& a,const auto& b){return a.time<b.time;});
    float elapsed=0,incoming=0,rate=std::max(1.0f,ownRate);std::size_t next=0;
    for(const auto& member:order){
        float hp=member.first*ratio;hp-=std::min(hp,burst);burst=0;
        const float start=elapsed;
        while(hp>0){
            while(next<arrivals.size()&&arrivals[next].time<=elapsed){rate+=std::max(0.0f,arrivals[next].dps);++next;}
            const float ticks=std::ceil(hp/rate);
            if(next<arrivals.size()&&arrivals[next].time<elapsed+ticks){
                const float span=arrivals[next].time-elapsed;
                incoming+=span*strength;hp=std::max(0.0f,hp-span*rate);elapsed=arrivals[next].time;
            }else{incoming+=ticks*strength;elapsed+=ticks;hp=0;}
        }
        if(elapsed>start)incoming-=member.second;
        strength=std::max(0.0f,strength-member.second);
    }
    return {elapsed,std::max(0.0f,incoming)};
}
