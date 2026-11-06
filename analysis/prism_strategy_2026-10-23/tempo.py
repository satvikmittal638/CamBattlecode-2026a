from pathlib import Path
import shutil
root=Path(__file__).resolve().parents[2];bots=root/'workspace/bots'
for name,care in [('prism-tempo',False),('prism-fortress',True)]:
 dst=bots/name/'src';assert not dst.exists();shutil.copytree(bots/'prism-balanced/src',dst)
 def edit(file,old,new):
  p=dst/file;s=p.read_text();assert s.count(old)==1,(file,old[:70],s.count(old));p.write_text(s.replace(old,new))
 edit('main.cpp','prism-balanced',name)
 edit('draft.cpp','cambc::champion_draft::heart_of_ruin,cambc::champion_draft::vesper_vale,cambc::champion_draft::prism,cambc::champion_draft::marcella,cambc::champion_draft::ryth','cambc::champion_draft::heart_of_ruin,cambc::champion_draft::vesper_vale,cambc::champion_draft::prism,cambc::champion_draft::marcella,cambc::champion_draft::vendetta')
 edit('v1_kit.h','if(X_CYCLEBOTH)damage+=slot;else damage=std::max(damage,slot);','if(X_CYCLEBOTH||(X_PRISM_POLICY&&kit.base_stats.base_focus==80&&kit.base_stats.focus_growth==8))damage+=slot;else damage=std::max(damage,slot);')
 # The design comparison above would be a brittle identity proxy: use actual
 # champion type at callers instead of selecting behavior from numerical stats.
 p=dst/'v1_kit.h';s=p.read_text().replace('float focus) {','float focus,bool both=false) {').replace('X_CYCLEBOTH||(X_PRISM_POLICY&&kit.base_stats.base_focus==80&&kit.base_stats.focus_growth==8)','X_CYCLEBOTH||both');p.write_text(s)
 for file in ['v1_cycle.h','bot.cpp']:
  p=dst/file;s=p.read_text()
  s=s.replace('v1CycleCast(v1KitForType(own.type),own.strength,own.focus)','v1CycleCast(v1KitForType(own.type),own.strength,own.focus,X_PRISM_POLICY&&myType==bc::champion_type::prism)')
  s=s.replace('v1CycleCast(kit,strength,F)','v1CycleCast(kit,strength,F,X_PRISM_POLICY&&myType==bc::champion_type::prism)')
  s=s.replace('v1CycleCast(v1KitForType(static_cast<int>(myType)),S,F)','v1CycleCast(v1KitForType(static_cast<int>(myType)),S,F,X_PRISM_POLICY&&myType==bc::champion_type::prism)')
  p.write_text(s)
 if care:
  # Avoid retrying a fully evaluated declined trade through legacy chase.
  p=dst/'v1_tactical.h';s=p.read_text().replace('const bool declined=X_DECLINE&&!choices.empty()', 'const bool declined=(X_DECLINE||myType==bc::champion_type::prism)&&!choices.empty()').replace('(X_DECLINE&&!choices.empty())','((X_DECLINE||myType==bc::champion_type::prism)&&!choices.empty())');p.write_text(s)
  edit('bot.cpp','    if(X_NOCHASE){','    if(X_NOCHASE||myType==bc::champion_type::prism){')
print('Prepared alternative companion and Prism cycle models')
