"""Exercise exact source excerpts with rule-based counterexamples; no bot edits."""
import json,pathlib,subprocess
here=pathlib.Path(__file__).resolve().parent
source=(here.parent/'iterations/v47p/src/v1_tactical.h').read_text()
start=source.index('static float v1Response(')
end=source.index('\nint Bot::tacticalFight()',start)
response=source[start:end]
start=source.index('const float stayDanger=')
end=source.index('bool acted=false;',start)
escape=source[start:end]
code=r'''
#include <algorithm>
#include <cmath>
#include <iostream>
#include <vector>
struct vec2 {int x,y;};
int cheb(vec2 a,vec2 b){return std::max(std::abs(a.x-b.x),std::abs(a.y-b.y));}
struct Info {int type=6,x=0,y=0,attack_range=3,state=0;float strength=35,health=200;};
struct V1Body {Info info;float shield=0,heartDash=0,spell=0,spellRange=0;int cd[2]{8,8},spellSlot=-1,resetSlot=-1;bool stun=false;vec2 position()const{return {info.x,info.y};}};
'''+response+r'''
bool enough(int){return true;}void meleeParting(){}
int main(){
 V1Body prism;prism.spell=150;prism.spellRange=4;prism.spellSlot=0;prism.cd[0]=8;prism.cd[1]=0;
 const float predicted=v1Response(prism,{4,0},0);
 std::cout << "{\"prism\":{\"v53PredictedDamage\":"<<predicted<<",\"readyAoeDamage\":100},";
 V1Body ryth;ryth.info.type=0;ryth.info.attack_range=1;ryth.spell=100;ryth.spellRange=4;ryth.spellSlot=0;ryth.cd[0]=0;ryth.cd[1]=8;ryth.resetSlot=1;
 std::cout << "\"aoeReach\":{\"v53PredictedDamage\":"<<v1Response(ryth,{5,0},0)<<",\"legalAoeDamage\":100},";
 vec2 origin{0,0};std::vector<vec2> walking{{0,0},{1,0}};V1Body own;own.shield=150;Info selfInfo;selfInfo.health=200;
 struct {void* target=nullptr;} best;
 constexpr float X_ESCAPERISK=.55f;constexpr bool X_MELEEHIT=false;
 const auto incoming=[](vec2 p,auto,bool,bool){return p.x==0?300.f:200.f;};
 '''+escape+r'''
 std::cout << "\"escape\":{\"chosenTile\":"<<escape.x<<",\"saferTile\":1,\"stayHpDamage\":150,\"moveHpDamage\":50}}\n";
 }
}
'''
cpp=here/'source_counterexamples.cpp';cpp.write_text(code)
exe=here/'source_counterexamples'
subprocess.run(['c++','-std=c++17','-O0',str(cpp),'-o',str(exe)],check=True)
result=json.loads(subprocess.check_output([str(exe)],text=True))
assert result['prism']['v53PredictedDamage']==0
assert result['prism']['readyAoeDamage']==100
assert result['aoeReach']['v53PredictedDamage']==0
assert result['aoeReach']['legalAoeDamage']==100
assert result['escape']['chosenTile']==0
assert result['escape']['moveHpDamage']<result['escape']['stayHpDamage']
(here/'bug_counterexamples.json').write_text(json.dumps(result,indent=2))
print(json.dumps(result,indent=2))
