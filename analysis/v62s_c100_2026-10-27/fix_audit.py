"""Fix acceptance audit (user rule: the fix must improve the matches it targets and degrade nothing else).
Pairs each candidate game with the baseline game on the same spec (label, map, side) and splits the pairs by the
BASELINE game: targeted = our deaths >= --deaths (default 12; the outmatched-death fix) vs untargeted.
Per group: wins, flips, margin change, and per-game deltas of deaths, kills, captures, gems collected/tributed, gold,
opponent gems. Also lists every lost win (down-flip) with its group, map and metric deltas.
  python3 fix_audit.py <baseline dir> <candidate dir> [--deaths 12]
  python3 fix_audit.py <base variant> <candidate variant> --fe <field_eval dir> [--deaths N]"""
import json, os, sys, collections
base, cand = sys.argv[1], sys.argv[2]
cut = int(sys.argv[sys.argv.index("--deaths") + 1]) if "--deaths" in sys.argv else 12
key = lambda g: (g["label"], g["map"], g["side"])

def metrics(d, g):
    s = json.load(open(f"{d}/official_summaries/{g['matchId']}.json")); us = "teamA" if g["side"] == "a" else "teamB"
    m = collections.Counter()
    for c in s["champions"]:
        side = "us" if c["team"] == us else "them"
        for k in ("deaths", "kills", "collectedGems", "submittedGems", "earnedGold"): m[side + "_" + k] += float(c["metrics"][k])
    for e in s["events"]:
        if e["kind"] == "gemCollection": m[("us" if e["owner"].get("team") == us else "them") + "_captures"] += len(e["entries"])
    m["win"] = g["result"] == "win"; m["margin"] = g["score"] - g["oppScore"]
    return m

def pairs():
    # platform: two collection dirs; local: --fe <field_eval dir> with base/candidate as variant names
    if "--fe" in sys.argv:
        fe = sys.argv[sys.argv.index("--fe") + 1]; R = json.load(open(f"{fe}/results.json"))["rows"]
        root = os.path.dirname(os.path.abspath(__file__)) + "/../.."
        def lm(r):
            s = json.load(open(os.path.join(root, r["stats"]))); us = "teamA" if r["side"] == "a" else "teamB"; m = collections.Counter()
            for c in s["champions"]:
                side = "us" if c["team"] == us else "them"
                for k in ("deaths", "kills", "collectedGems", "submittedGems", "earnedGold"): m[side + "_" + k] += float(c["metrics"][k])
            for e in s["events"]:
                if e["kind"] == "gemCollection": m[("us" if e["owner"].get("team") == us else "them") + "_captures"] += len(e["entries"])
            m["win"] = bool(r["win"]); m["margin"] = r["score"] - r["oppScore"]; return m
        bk = {(r["opponent"], r["map"], r["side"]): r for r in R if r["variant"] == base}
        for r in R:
            if r["variant"] != cand: continue
            o = bk.get((r["opponent"], r["map"], r["side"]))
            if o: yield lm(o), lm(r), {"map": r["map"], "pool": r["opponent"][:4]}
        return
    B = {key(g): g for g in json.load(open(f"{base}/games/index.json"))}
    for g in json.load(open(f"{cand}/games/index.json")):
        o = B.get(key(g))
        if o: yield metrics(base, o), metrics(cand, g), g
groups = collections.defaultdict(list); downs = []
for mb, mc, g in pairs():
    grp = "targeted" if mb["us_deaths"] >= cut else "untargeted"
    groups[grp].append((mb, mc, g))
    if mb["win"] and not mc["win"]: downs.append((grp, g["map"], g["pool"], mb, mc))
K = [("us_deaths", "our deaths"), ("us_kills", "our kills"), ("us_captures", "captures"), ("us_collectedGems", "gems collected"),
     ("us_submittedGems", "gems tributed"), ("us_earnedGold", "gold"), ("them_collectedGems", "opp gems collected")]
for grp in ("targeted", "untargeted"):
    ps = groups[grp]; n = len(ps)
    if not n: continue
    wb = sum(p[0]["win"] for p in ps); wc = sum(p[1]["win"] for p in ps)
    up = sum(p[1]["win"] and not p[0]["win"] for p in ps); dn = sum(p[0]["win"] and not p[1]["win"] for p in ps)
    dm = sum(p[1]["margin"] - p[0]["margin"] for p in ps) / n
    print(f"\n{grp}: {n} paired games | wins {wb} -> {wc} (flips +{up}/-{dn}) | margin change {dm:+.0f}/game")
    for k, name in K:
        a = sum(p[0][k] for p in ps) / n; b = sum(p[1][k] for p in ps) / n
        print(f"   {name:20s} {a:8.1f} -> {b:8.1f}  ({b - a:+.1f}, {100 * (b - a) / max(1e-9, a):+.0f}%)")
print(f"\nlost wins (baseline won, candidate lost): {len(downs)}")
for grp, m, pool, mb, mc in sorted(downs, key=lambda x: (x[0], x[1])):
    print(f"   {grp:10s} {pool:4s} {m:22s} deaths {mb['us_deaths']:4.0f}->{mc['us_deaths']:4.0f}  captures {mb['us_captures']:3.0f}->{mc['us_captures']:3.0f}  gems {mb['us_collectedGems']:5.0f}->{mc['us_collectedGems']:5.0f}  opp gems {mb['them_collectedGems']:5.0f}->{mc['them_collectedGems']:5.0f}  margin {mb['margin']:+5.0f}->{mc['margin']:+5.0f}")
