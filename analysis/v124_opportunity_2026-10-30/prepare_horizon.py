from pathlib import Path
import json,shutil
D=Path(__file__).resolve().parent;R=D.parents[1];P=R/'analysis/v121_bank_2026-10-30/paired_c2/control';rows=json.loads((P/'platform/index.json').read_text());rs=[]
for mp in ['00lanes','02treasure_box','02cuts','01boss_battle']:
 q=[r for r in rows if r['map']==mp];rs.extend([next(r for r in q if r['result']=='loss'),next(r for r in q if r['result']=='win')])
(D/'probe_index.json').write_text(json.dumps(rs,indent=2))
metrics=sum([json.loads(f.read_text()) for f in P.glob('metrics_?.json')],[])
for mp in ['00lanes','02treasure_box','02cuts','01boss_battle']:
 r=next(x for x in metrics if x['map']==mp);print(mp,len(r['groups']))
src=R/'workspace/bots/v121-income/src';dst=R/'workspace/bots/v124-horizon-trace/src';shutil.copytree(src,dst)
for fn in ['bot.cpp','main.cpp']:
 p=dst/fn;p.write_text(p.read_text().replace('#define PHASE2_LOG 1','#define PHASE2_LOG 2'))
p=dst/'v1_cycle.h';s=p.read_text();s=s.replace('static float v1GoldW=X_GOLDW;','''static float v1GoldW=X_GOLDW;
struct HorizonAudit {
 int round,type,mode,total;int visited=0,scored=0,best=-1;unsigned long long mask=0;
 ~HorizonAudit(){if(bc::fuel_remaining()>14000 && round<=600)std::printf("horizon %d %d %d %d %d %d %d %llu\\n",round,type,mode,total,visited,scored,best,mask);}
};''')
s=s.replace('''    auto& me=bc::self();bc::detail::champion_info own{};
    const unsigned id''','''    auto& me=bc::self();HorizonAudit audit{round,static_cast<int>(myType),0,static_cast<int>(groups.size())};bc::detail::champion_info own{};
    const unsigned id''',1)
s=s.replace('''        if(!enough(38000))break;
        const bool gold''','''        if(!enough(38000))break;
        ++audit.visited;
        const bool gold''',1)
s=s.replace('''        if(score>value){value=score;best=g.id;}
    }
    stage="v41-affordable-task"''','''        ++audit.scored;if(g.id<64)audit.mask|=1ull<<g.id;
        if(score>value){value=score;best=g.id;}
    }
    audit.best=best;
    stage="v41-affordable-task"''',1)
s=s.replace('''    auto& me=bc::self();stage="v1-cycle";''','''    auto& me=bc::self();stage="v1-cycle";
    HorizonAudit audit{round,static_cast<int>(myType),1,static_cast<int>(groups.size())};''',1)
s=s.replace('''        if(!enough(43000)){stage="v1-score-budget";break;}
        // Gold-only''','''        if(!enough(43000)){stage="v1-score-budget";break;}
        ++audit.visited;
        // Gold-only''',1)
s=s.replace('''        if(score>bestScore){bestScore=score;best=g.id;}
    }
    if(!safeGem)''','''        ++audit.scored;if(g.id<64)audit.mask|=1ull<<g.id;
        if(score>bestScore){bestScore=score;best=g.id;}
    }
    audit.best=best;
    if(!safeGem)''',1)
p.write_text(s)
