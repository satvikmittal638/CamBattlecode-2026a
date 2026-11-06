"""Attempt 2 (v97 = v62y) vs attempt 1 (v62) on the same 50 challenge specs: challenges won (3+/5), games won, margins
per pool, game-by-game flips on identical opponent/map/side, gated maps, and our bot faults / fuel exhaustion.
    python3 compare.py"""
import collections, glob, json
US = "6b04505b-d16c-4196-b7c6-53a4688a32ca"


def load(d):
    plan = json.load(open(d + "/plan.json")); spec = {s["teamId"]: s for s in plan["specs"]}
    games, chal = {}, []
    for f in glob.glob(d + "/groups/*.json"):
        g = json.load(open(f))
        opp = next(s["teamId"] for s in g["group"]["sides"] if s["teamId"] != US); s = spec[opp]; w = 0
        for m in g["matches"]:
            me = next(x for x in m["sides"] if x["teamId"] == US); op = next(x for x in m["sides"] if x["teamId"] != US)
            games[(opp, m["map"], me["side"])] = {"pool": s["pool"], "win": me["result"] == "win", "margin": (me["score"] or 0) - (op["score"] or 0), "map": m["map"], "status": m["status"], "err": me["botError"]}
            w += me["result"] == "win"
        chal.append((s["pool"], s["opponent"], w))
    return games, chal


a1, c1 = load("../v62_attempt1_2026-10-26"); a2, c2 = load(".")
print(f"attempt-2 groups collected: {len(c2)}/50, games {len(a2)}")
for pool in ("near", "half"):
    for tag, g, c in (("attempt 1 (v62)", a1, c1), ("attempt 2 (v97)", a2, c2)):
        gs = [x for x in g.values() if x["pool"] == pool]; cs = [x for x in c if x[0] == pool]
        if not gs: continue
        print(f"{pool:4s} {tag}: challenges {sum(w >= 3 for _, _, w in cs)}/{len(cs)}, games {sum(x['win'] for x in gs)}/{len(gs)}, mean margin {sum(x['margin'] for x in gs) / len(gs):+.0f}, heavy losses {sum((not x['win']) and x['margin'] <= -500 for x in gs)}")
both = [k for k in a2 if k in a1]
up = sum(a2[k]["win"] and not a1[k]["win"] for k in both); down = sum(a1[k]["win"] and not a2[k]["win"] for k in both)
print(f"paired games {len(both)}: v97 won where v62 lost {up}, lost where v62 won {down}, net {up - down}")
for pool in ("near", "half"):
    ks = [k for k in both if a1[k]["pool"] == pool]
    print(f"  {pool}: +{sum(a2[k]['win'] and not a1[k]['win'] for k in ks)} -{sum(a1[k]['win'] and not a2[k]['win'] for k in ks)}")
for m in ("02guardians", "01boss_battle"):
    ks = [k for k in both if k[1] == m]
    print(f"  {m}: v62 {[a1[k]['margin'] for k in ks]} -> v97 {[a2[k]['margin'] for k in ks]}")
print("platform bot errors (v97):", collections.Counter(str(x["err"]) for x in a2.values()), "statuses:", collections.Counter(x["status"] for x in a2.values()))
faults = fuel = n = 0
idx = {g["matchId"]: g for g in json.load(open("games/index.json"))} if glob.glob("games/index.json") else {}
for f in glob.glob("official_summaries/*.json"):
    mid = f.split("/")[-1][:-5]
    if mid not in idx: continue
    s = json.load(open(f)); ours = "teamA" if idx[mid]["side"] == "a" else "teamB"; n += 1
    faults += s["diagnostics"]["botFaults"][ours]
    fuel += sum(len(e["entries"]) for e in s["events"] if e["kind"] == "fuelExhausted" and e["owner"].get("team") == ours)
print(f"official summaries {n}: our bot faults {faults}, our fuelExhausted events {fuel}")
