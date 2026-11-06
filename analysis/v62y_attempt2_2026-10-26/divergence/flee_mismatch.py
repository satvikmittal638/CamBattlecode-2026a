"""Shadow-trace mismatches against the recorded v62y games: stages of all / first mismatches, and the flee turns by
what each side did.   python3 flee_mismatch.py shadow_w2"""
import json, collections, re, glob, sys
d = sys.argv[1]; c = collections.Counter(); first = collections.Counter(); fl = collections.Counter(); tot = 0
for f in glob.glob(f'{d}/*.jsonl'):
    seen = False
    for line in open(f):
        t = json.loads(line); tot += 1
        if t.get('match', True): continue
        st = re.findall(r'decision \d+ \d+ (\S+)', t.get('log', '')); s = st[-1] if st else '?'
        c[s] += 1
        if not seen: first[s] += 1; seen = True
        if s != 'm62-flee': continue
        hit = lambda a: any(x.split()[0] in ('attack', 'cast0', 'cast1') for x in a)
        b, r = t['bot'], t['rep']
        fl['y did nothing' if not r else 'y hit, w no hit' if hit(r) and not hit(b) else 'same kinds' if [x.split()[0] for x in b] == [x.split()[0] for x in r] else 'other'] += 1
print(d, 'turns', tot, 'mismatch', sum(c.values()))
print('  all:', c.most_common(10)); print('  first:', first.most_common(8)); print('  flee:', fl.most_common())
