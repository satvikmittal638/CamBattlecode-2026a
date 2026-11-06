"""Paired comparison of two field_eval runs on identical (opponent, map, side): flips, per-map net, score margins,
our faults, and per-game rounds.   python3 paired_yz.py fe_y fe_z"""
import collections, json, sys
a, b = (json.load(open(d + "/results.json"))["rows"] for d in sys.argv[1:3])
k = lambda r: (r["opponent"], r["map"], r["side"])
A = {k(r): r for r in a}; B = {k(r): r for r in b}
both = [x for x in A if x in B]
up = [x for x in both if B[x]["win"] and not A[x]["win"]]; dn = [x for x in both if A[x]["win"] and not B[x]["win"]]
print(f"paired {len(both)}: {sys.argv[2]} gains {len(up)}, losses {len(dn)}, net {len(up)-len(dn)}")
per = collections.Counter()
for x in up: per[x[1]] += 1
for x in dn: per[x[1]] -= 1
print("worst maps:", per.most_common()[::-1][:20])
print("best maps:", per.most_common(10))
po = collections.Counter()
for x in up: po[x[0]] += 1
for x in dn: po[x[0]] -= 1
print("per opponent net:", dict(po))
m = lambda R, x: R[x]["score"] - R[x]["oppScore"]
print("mean margin", sum(m(A, x) for x in both) / len(both), "->", sum(m(B, x) for x in both) / len(both))
print("faults", sum(A[x]["myFaults"] for x in both), sum(B[x]["myFaults"] for x in both), "codes", collections.Counter(c for x in both for c in B[x]["codes"]))
json.dump({"up": up, "down": dn}, open(f"flips_{sys.argv[1]}_{sys.argv[2]}.json", "w"))
