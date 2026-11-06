"""Rewrite scoreTargets() (v1_cycle.h) to the camp scoring v62 actually ran: its 42-slot item buffer overflow zeroed the
carried-gem count and the action state right after reading items, so v62 scored camps with an empty bag (no
amortised altar trip) and without burst/shield openings. Used to build v62t (and the v62fs equivalence check).
  python3 v62_scoring.py <bot src dir>"""
import re, sys
p = sys.argv[1] + '/v1_cycle.h'; s = open(p).read()
def sub(a, b):
    global s
    assert s.count(a) == 1, (a[:80], s.count(a)); s = s.replace(a, b)
# carried gems are not read (v62n/v62s form, then v62f form)
if 'unsigned rawBag=0;bc::detail::check(bc::detail::sdk_champion_gems(selfId,&rawBag));\n' in s:
    sub('    unsigned rawBag=0;bc::detail::check(bc::detail::sdk_champion_gems(selfId,&rawBag));\n', '')
    sub('    const int bag=rawBag;const bool jungle=ownJungle,durability=ownDurability;', '    const bool jungle=ownJungle,durability=ownDurability;')
else:
    sub('unsigned rawBag=0,items[ITEM_TYPES]{};bc::detail::check(bc::detail::sdk_champion_gems(selfId,&rawBag));bc::detail::check(bc::detail::sdk_champion_items(selfId,items));',
        'unsigned items[ITEM_TYPES]{};bc::detail::check(bc::detail::sdk_champion_items(selfId,items));')
    sub('    const int bag=rawBag;const bool jungle=', '    const bool jungle=')
i = s.index('    float readyShield=0,opening=0;'); j = s.index('readyShield=std::max(readyShield,F*a.payload.shield.modifier);\n    }\n', i) + len('readyShield=std::max(readyShield,F*a.payload.shield.modifier);\n    }\n')
s = s[:i] + s[j:]
sub('float incoming=0,clear=0,aliveStrength=observed?0:g.totalStr,burst=opening;', 'float incoming=0,clear=0,aliveStrength=observed?0:g.totalStr;')
sub('            const float h=member.first*ratio;const float applied=std::min(h,burst);burst=0;\n            const float ticks=std::max(0.0f,std::ceil((h-applied)/rate));\n',
    '            const float ticks=std::ceil(member.first*ratio/rate);\n')
i = s.index('        // Defensive opening and reset/damage opening are mutually exclusive.'); j = s.index('        incoming=std::max(0.0f,incoming);', i)
s = s[:i] + s[j:]
sub('        const float usable=hp+shield+std::min(defenseOpening,g.totalStr*5);', '        const float usable=hp+shield;')
sub('''        // Include delivery and countdown, amortized over the combined bag so a
        // batched route does not pay the entire altar journey for every camp.''',
    '''        // Include the altar trip and tribute countdown for this camp's gems alone. v62 never amortised it over the
        // carried bag (its item overflow zeroed the bag here), and that is the scoring its results were built on:
        # amortising made champions batch distant camps with big bags (02famine 5/7 -> 1/7, 00gem_fields 3/7 -> 0/7).''')
sub('''        const float combined=bag+g.gems;
        const float bankCost=g.gems>0?(altar+std::ceil(combined/10.0f)+1)*g.gems/std::max(1.0f,combined):0;''',
    '''        const float bankCost=g.gems>0?altar+std::ceil(g.gems/10.0f)+1:0;''')
s = s.replace("        # amortising made", "        // amortising made")
open(p, 'w').write(s); print('ok', p)
