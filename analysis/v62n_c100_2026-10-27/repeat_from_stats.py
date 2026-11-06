"""Repeat-zone deaths from stats/summary JSON death events (x, y, round): a death is a repeat when a teammate died
within 6 tiles in the previous 150 rounds.   python3 repeat_from_stats.py <fe dir | platform>"""
import json, os, sys, collections
ROOT = os.path.dirname(os.path.abspath(__file__)) + "/../.."
def deaths(s, us):
    out = {"us": [], "them": []}
    for e in s["events"]:
        if e["kind"] != "death": continue
        side = "us" if e["owner"].get("team") == us else "them"
        for x in e["entries"]: out[side].append((x["timestamp"]["round"], x.get("x"), x.get("y")))
    return out
def rep(ds):
    ds.sort(); n = r = 0
    for i, (rd, x, y) in enumerate(ds):
        n += 1
        if x is None: continue
        if any(rd - p[0] <= 150 and p[1] is not None and max(abs(p[1] - x), abs(p[2] - y)) <= 6 for p in ds[:i]): r += 1
    return n, r
rows = []
if sys.argv[1] == "platform":
    for g in json.load(open("games/index.json")):
        f = f"official_summaries/{g['matchId']}.json"
        if os.path.exists(f): rows.append((g["result"] == "win", json.load(open(f)), "teamA" if g["side"] == "a" else "teamB", "platform"))
else:
    for r in json.load(open(os.path.join(sys.argv[1], "results.json")))["rows"]:
        rows.append((r["win"], json.load(open(os.path.join(ROOT, r["stats"]))), "teamA" if r["side"] == "a" else "teamB", r["variant"] + " vs " + r["opponent"]))
agg = collections.defaultdict(collections.Counter)
for win, s, us, key in rows:
    d = deaths(s, us)
    for side in ("us", "them"):
        n, r = rep(d[side]); agg[key][side + "_n"] += n; agg[key][side + "_r"] += r
    agg[key]["games"] += 1
for k, a in sorted(agg.items()):
    g = a["games"]
    print(f"{k:24s} games {g:4d}  our deaths/game {a['us_n']/g:5.1f} repeat {100*a['us_r']/max(1,a['us_n']):3.0f}%   their deaths/game {a['them_n']/g:5.1f} repeat {100*a['them_r']/max(1,a['them_n']):3.0f}%")
