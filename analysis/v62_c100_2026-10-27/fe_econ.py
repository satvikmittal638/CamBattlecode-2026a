"""Per-variant economy from a field_eval run with --keep-full-stats (stats JSON = official summary format).
  python3 fe_econ.py <fe dir>"""
import collections, json, sys, os
R = json.load(open(os.path.join(sys.argv[1], "results.json")))
ROOT = os.path.dirname(os.path.abspath(__file__)) + "/../.."
num = lambda v: float(v) if isinstance(v, (int, float)) or (isinstance(v, str) and v.replace(".", "", 1).isdigit()) else 0.0
agg = collections.defaultdict(collections.Counter)
for r in R["rows"]:
    s = json.load(open(os.path.join(ROOT, r["stats"])))
    us = "teamA" if r["side"] == "a" else "teamB"
    a = agg[r["variant"]]; a["games"] += 1; a["wins"] += r["win"]; a["zero"] += (r["score"] == 0 and r["oppScore"] == 0)
    a["low"] += (max(r["score"], r["oppScore"]) < 300)
    for c in s["champions"]:
        side = "us" if c["team"] == us else "them"
        for k in ("earnedGold", "collectedGems", "submittedGems", "kills", "deaths"):
            a[side + "_" + k] += num(c["metrics"].get(k, 0))
    for e in s["events"]:
        side = "us" if e["owner"].get("team") == us else "them"
        if e["kind"] == "gemCollection": a[side + "_captures"] += len(e["entries"])
        if e["kind"] == "fuelExhausted": a[side + "_fuelEx"] += len(e["entries"])
for v, a in agg.items():
    n = a["games"]
    print(f"{v:10s} wins {a['wins']:3d}/{n}  0-0 {a['zero']:2d}  <300 {a['low']:2d} | " + "  ".join(f"{k[3:]} {a['us_'+k[3:]]/n:6.0f}/{a['them_'+k[3:]]/n:6.0f}" for k in ("us_earnedGold", "us_collectedGems", "us_submittedGems", "us_captures", "us_kills", "us_deaths", "us_fuelEx")))
