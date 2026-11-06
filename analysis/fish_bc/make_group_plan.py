"""Group plan for the group-bundle download: which match groups to fetch and where each match's replay goes.
    python3 make_group_plan.py  ->  group_plan.json  [{gid, kind, createdAt, matches: [[matchId, map], ...]}]
Ranked groups first (strongest opponents), then unranked, each newest first (Fish's latest behaviour)."""
import glob
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
want = {m["matchId"]: m for m in json.load(open(os.path.join(HERE, "fish_matches.json")))}
plan = []
for f in glob.glob(os.path.join(HERE, "crawl_groups", "*.json")):
    g = json.load(open(f))
    ms = [[m["id"], want[m["id"]]["map"]] for m in g.get("matches", []) if m["id"] in want]
    if ms:
        plan.append({"gid": g["group"]["id"], "kind": g["group"]["kind"], "createdAt": g["group"]["createdAt"], "matches": ms})
plan.sort(key=lambda p: (p["kind"] != "ranked", "".join(chr(255 - ord(c)) for c in p["createdAt"])))
json.dump(plan, open(os.path.join(HERE, "group_plan.json"), "w"))
print(len(plan), "groups,", sum(len(p["matches"]) for p in plan), "matches")
