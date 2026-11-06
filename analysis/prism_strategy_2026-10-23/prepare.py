from pathlib import Path
import shutil,re,json,hashlib
ROOT=Path(__file__).resolve().parents[2];WS=ROOT/'workspace';OUT=Path(__file__).parent
BASE=WS/'bots/codex-v57-final/src'
variants={'prism-v57-control':{'policy':False,'front':False,'roster':False},'prism-roster':{'policy':False,'front':False,'roster':True},'prism-core':{'policy':True,'front':False,'roster':True},'prism-front':{'policy':True,'front':True,'roster':True}}
# All strategic choices use champion state/map geometry; no map/opponent dispatch.
for name,cfg in variants.items():
 dst=WS/'bots'/name/'src';assert not dst.exists(),name;shutil.copytree(BASE,dst)
 def edit(file,old,new):
  p=dst/file;s=p.read_text();assert s.count(old)==1,(name,file,old[:80],s.count(old));p.write_text(s.replace(old,new))
 with (dst/'fishx_features.h').open('a') as f:f.write('\n// Prism experiment controls, frozen before the paired development batch.\nconstexpr bool X_PRISM_POLICY = '+str(cfg['policy']).lower()+';\n')
 edit('main.cpp','build codex-major-fixes-2026-10-23','build '+name+'-2026-10-23')
 if not cfg['roster']:continue
 picks='prism,heart_of_ruin,vesper_vale,marcella,ryth' if cfg['front'] else 'prism,vesper_vale,marcella,heart_of_ruin,ryth'
 order=','.join('cambc::champion_draft::'+x for x in picks.split(','))
 edit('draft.cpp','    const bool threePicks = cambc::draft::team_size() <= 3;','    // Prism is the first pick; companions remain productive scorers.\n    static constexpr std::array prismTeam{'+order+'};\n    for(auto pick:prismTeam)if(std::find(mine.begin(),mine.end(),pick)==mine.end()){cambc::draft::pick(pick);return;}\n    const bool threePicks = cambc::draft::team_size() <= 3;')
 # Declaration and helper are present in roster-only builds but compiled away.
 edit('bot.h','    bool doTribute();','    bool doTribute();\n    bool prismConversionDue();')
 helper='''// Gem capital is useful only if there is time to convert it into score.
// Personal state and public score only; no hidden positions or enemy identity.
bool Bot::prismConversionDue(){
    if(!X_PRISM_POLICY||myType!=bc::champion_type::prism)return false;
    auto& me=bc::self();const auto gems=me.gem_count();if(!gems)return false;
    const auto bank=bc::global_submitted_gems(team::ally);
    if(bank>=1000||gems>=1000-bank||bc::global_submitted_gems(team::enemy)>=900)return true;
    if(!enough(32000))return false;
    const int a=nearestAltar(me.position());if(a<0)return false;
    const int d=altarDistance(a,me.position());if(d==UNR)return false;
    return round+std::max(0,d)+(gems+9)/10+40>=2000;
}

'''
 edit('bot.cpp','bool Bot::doTribute() {',helper+'bool Bot::doTribute() {')
 edit('bot.cpp','    const bool deadline=bank>=1000 || gems>=static_cast<int>(1000-bank) || bc::global_submitted_gems(team::enemy)>=900;','''    const bool deadline=bank>=1000 || gems>=static_cast<int>(1000-bank) || bc::global_submitted_gems(team::enemy)>=900 || prismConversionDue();
    if(X_PRISM_POLICY&&myType==bc::champion_type::prism&&!deadline&&me.health()>=me.max_health()*.6f){
        // Keep productive gem-powered spell damage. A missing task is not a
        // reason to hold forever, and the hard conversion budget overrides it.
        if(chooseTarget()>=0){stage="prism-grow-capital";return false;}
    }''')
 edit('bot.cpp','if(me.gem_count()>0 && (bank>=1000 || me.gem_count()>=1000-bank)){','if(me.gem_count()>0 && (bank>=1000 || me.gem_count()>=1000-bank || prismConversionDue())){')
 edit('bot.cpp','    try {\n        auto counts = me.item_count();\n        int gold = static_cast<int>(me.gold_count());','''    if(X_PRISM_POLICY&&myType==bc::champion_type::prism){
        // Observed developer strategy: bag supplies Focus; equipment preserves it.
        plan={{2,2,5},{0,1,5},{4,2,5},{5,2,5}};
        for(int n=5;n<=400;n+=5){
            plan.push_back({6,2,n});
            if(n%15==0)plan.push_back({6,1,n/3});
        }
    }
    try {
        auto counts = me.item_count();
        int gold = static_cast<int>(me.gold_count());''')
 edit('bot.cpp','    if (!lowMode && (hpf < 0.35f || partnerRise)) lowMode = true;','    const float retreatAt=X_PRISM_POLICY&&myType==bc::champion_type::prism&&me.gem_count()>=50?.45f:.35f;\n    if (!lowMode && (hpf < retreatAt || partnerRise)) lowMode = true;')
 edit('bot.cpp','bool Bot::carryWants(const Group& g) {\n    auto& me = bc::self();','''bool Bot::carryWants(const Group& g) {
    auto& me = bc::self();
    if(X_PRISM_POLICY&&g.gems>0){
        if(myType==bc::champion_type::prism)return false;
        // Only a healthy, already-nearby Prism committed to the same reward.
        // Never wait for a distant carry or divert gold-only income from Vesper.
        for(auto& a:safeChamps(team::ally))try{
            if(a==me||!a.is_alive()||a.champion_name()!=bc::champion_type::prism||a.is_recalling()||a.is_submitting_gems()||a.health()<a.max_health()*.6f)continue;
            int s=-1;for(int j=0;j<nAllies&&j<6;++j)if(slotType[j]==static_cast<int>(bc::champion_type::prism))s=j;
            if(s<0||(shared[s]&0x80)||(shared[s]&63)!=g.id+1)continue;
            int d=99;for(auto p:g.tiles)d=std::min(d,cheb(a.position(),p));
            if(d<=2)return true;
        }catch(const TurnAbort&){throw;}catch(...){}
    }''')
 edit('bot.cpp','    int t = capturing && target >= 0 ? target : chooseTarget();','''    // A distant unseen enemy on the same region can reset capture forever.
    if(X_PRISM_POLICY&&myType==bc::champion_type::prism&&capturing&&target>=0&&captureSince>=0&&round-captureSince>20){
        const int old=target;releaseCapture();stalledUntil[old]=round+24;target=-1;choiceRound=-1;stage="prism-capture-expired";
    }
    int t = capturing && target >= 0 ? target : chooseTarget();''')
 # Comparing AoE centres is particularly valuable once gem Focus is high.
 edit('v1_camp_executor.h','if(X_AOEFARM&&!castThisTurn&&me.can_cast()&&enough(41000))','if((X_AOEFARM||(X_PRISM_POLICY&&myType==bc::champion_type::prism))&&!castThisTurn&&me.can_cast()&&enough(41000))')
 edit('v1_camp_executor.h','if(!X_AOEFARM&&!castThisTurn&&me.can_cast())','if(!(X_AOEFARM||(X_PRISM_POLICY&&myType==bc::champion_type::prism))&&!castThisTurn&&me.can_cast())')
 # Use only personally visible cast centres for the new Prism path.
 edit('v1_camp_executor.h','bc::bitboard castRange;castRange.draw_chebyshev(pos,static_cast<int>(reach));centres&=castRange;','bc::bitboard castRange;castRange.draw_chebyshev(pos,static_cast<int>(reach));centres&=castRange;\n                if(X_PRISM_POLICY&&myType==bc::champion_type::prism)centres&=bc::vision::visible_tiles();')
 (dst/'prism_strategy.md').write_text('Prism experiment based on frozen v57. See analysis/prism_strategy_2026-10-23.\n') if False else None
# Active source is frozen separately; no existing bot is edited.
(OUT/'variants.json').write_text(json.dumps(variants,indent=2)+'\n')
print('Prepared',list(variants))
