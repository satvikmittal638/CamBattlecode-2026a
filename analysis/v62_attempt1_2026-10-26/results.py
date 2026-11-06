"""Attempt-1 results from the platform group records (groups/*.json) and the plan: challenges won (3+ of 5 games),
games won, margins, per pool / map / opponent. Writes results.json."""
import collections, glob, json, os
US = "6b04505b-d16c-4196-b7c6-53a4688a32ca"
TYPES = ["Ryth", "Vesper", "Vendetta", "Cassi&Issac", "Stellar", "Prism", "Marcella", "Willow", "Ren", "Varg", "Tavi", "Heart"]
plan = json.load(open("plan.json"))
spec = {s["teamId"]: s for s in plan["specs"]}
rows, chal = [], []
for f in glob.glob("groups/*.json"):
    d = json.load(open(f))
    opp_id = next(s["teamId"] for s in d["group"]["sides"] if s["teamId"] != US)
    s = spec[opp_id]
    w = 0
    for m in d["matches"]:
        me = next(x for x in m["sides"] if x["teamId"] == US); op = next(x for x in m["sides"] if x["teamId"] != US)
        rows.append({"pool": s["pool"], "rank": s["rank"], "opp": s["opponent"], "map": m["map"], "side": me["side"], "result": me["result"],
                     "score": me["score"], "opp_score": op["score"], "rounds": m["rounds"], "end": m["endReason"], "opp_draft": [TYPES[int(x)] for x in op["draft"]],
                     "my_draft": [TYPES[int(x)] for x in me["draft"]], "err": me["botError"], "status": m["status"]})
        w += me["result"] == "win"
    chal.append({"pool": s["pool"], "rank": s["rank"], "opp": s["opponent"], "wins": w})
out = {}
for pool in ("near", "half"):
    c = [x for x in chal if x["pool"] == pool]; g = [r for r in rows if r["pool"] == pool]
    heavy = [r for r in g if r["result"] != "win" and r["opp_score"] - r["score"] >= 500]
    out[pool] = {"challenges_won": sum(x["wins"] >= 3 for x in c), "challenges": len(c), "games_won": sum(r["result"] == "win" for r in g),
                 "games": len(g), "heavy_losses": len(heavy), "mean_margin": sum(r["score"] - r["opp_score"] for r in g) / len(g),
                 "wins_by_count": dict(sorted(collections.Counter(x["wins"] for x in c).items()))}
print(json.dumps(out, indent=1))
print("bot errors:", collections.Counter(str(r["err"]) for r in rows), "statuses:", collections.Counter(r["status"] for r in rows))
print("end reasons:", collections.Counter((r["end"], r["result"]) for r in rows))
new_maps = set(open("maps_before_init.txt").read().split()) - set(os.listdir("../sdk_backup_3.0.5/maps"))
for tag, sel in (("new maps", lambda r: r["map"] + ".map26a" in new_maps), ("old maps", lambda r: r["map"] + ".map26a" not in new_maps)):
    g = [r for r in rows if sel(r)]
    print(f"{tag}: {sum(r['result'] == 'win' for r in g)}/{len(g)} games won")
print("challenges (pool rank opponent wins):")
for x in sorted(chal, key=lambda x: (x["pool"], x["rank"])):
    print(f"  {x['pool']:4s} r{x['rank']:3d} {x['opp'][:28]:28s} {x['wins']}/5")
json.dump({"summary": out, "games": rows, "challenges": chal}, open("results.json", "w"), indent=1)
