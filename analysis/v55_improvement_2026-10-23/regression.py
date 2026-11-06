"""Compile the production response/escape excerpts against mechanical counterexamples."""
from pathlib import Path
import subprocess,json
here=Path(__file__).resolve().parent
src=(here.parents[1]/'workspace/bots/v55-lab/src/v1_tactical.h').read_text()
response=src[src.index('static float v1Response('):src.index('\nint Bot::tacticalFight()')]
escape=src[src.index('const float stayDanger='):src.index('bool acted=false;',src.index('const float stayDanger='))]
code=r'''
#include <algorithm>
#include <cmath>
#include <iostream>
#include <vector>
struct vec2{int x,y;};
int cheb(vec2 a,vec2 b){return std::max(std::abs(a.x-b.x),std::abs(a.y-b.y));}
struct Info{int type=6,x=0,y=0,attack_range=3,state=0;float strength=35,health=200;};
struct V1Body{Info info;float shield=0,heartDash=0,spell=0,spellRange=0,slotDamage[2]{},slotRange[2]{};int cd[2]{8,8},spellSlot=-1,resetSlot=-1;bool stun=false;vec2 position()const{return{info.x,info.y};}};
bool X_FORECAST=false,X_DECLINE=false;
'''+response+r'''
bool enough(int){return true;}void meleeParting(){}
int escapeTile(bool fixed){X_FORECAST=fixed;
 vec2 origin{0,0};std::vector<vec2> walking{{0,0},{1,0}},choices;V1Body own;own.shield=150;Info selfInfo;
 struct{void*target=nullptr;}best;constexpr float X_ESCAPERISK=.55f;constexpr bool X_MELEEHIT=false;
 const auto incoming=[](vec2 p,auto,bool,bool){return p.x==0?300.f:200.f;};
'''+escape+r'''
 return escape.x;
 }return -1;
}
int main(){
 for(bool fixed:{false,true}){
  X_FORECAST=fixed;
  V1Body p;p.spell=150;p.spellRange=4;p.spellSlot=0;p.cd[0]=8;p.cd[1]=0;p.slotDamage[0]=150;p.slotRange[0]=4;p.slotDamage[1]=100;p.slotRange[1]=5;
  V1Body r;r.info.type=0;r.info.attack_range=1;r.spell=100;r.spellRange=4;r.spellSlot=0;r.cd[0]=0;r.slotDamage[0]=100;r.slotRange[0]=5;
  std::cout<<fixed<<" "<<v1Response(p,{4,0},0)<<" "<<v1Response(r,{5,0},0)<<" "<<escapeTile(fixed)<<"\n";
 }
}
'''
cpp=here/'regression.cpp';exe=here/'regression';cpp.write_text(code)
subprocess.run(['c++','-std=c++17','-O0',str(cpp),'-o',str(exe)],check=True)
lines=subprocess.check_output([str(exe)],text=True).strip().splitlines()
assert lines==['0 0 0 0','1 100 100 1'],lines
out={'before':{'readySecondarySpellDamage':0,'aoeEdgeDamage':0,'escapeTile':0},'after':{'readySecondarySpellDamage':100,'aoeEdgeDamage':100,'escapeTile':1},'expectedSafeTile':1,'allPassed':True}
(here/'regression.json').write_text(json.dumps(out,indent=2));print(json.dumps(out))
