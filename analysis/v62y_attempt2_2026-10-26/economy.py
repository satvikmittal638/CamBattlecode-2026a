"""Economy / combat decomposition of the attempt-1 games from the official summaries (engine 2.0.0).
Per game and team: kills, deaths, gems lost on death, gems collected (captures), gems submitted, gold earned, items.
Compares our wins / losses / heavy losses (lost by 500+), and what the opponents who beat us draft and buy.
Writes economy.json; prints tables."""
import collections, glob, json
idx = {g["matchId"]: g for g in json.load(open("games/index.json"))}
DRAFT = ["Ryth", "Vesper", "Vendetta", "Cassi&Issac", "Stellar", "Prism", "Marcella", "Willow", "Ren", "Varg", "Tavi", "Heart"]


def team_stats(s, team):
    st = collections.Counter()
    for c in s["champions"]:
        if c["team"] != team:
            continue
        for k, v in c["metrics"].items():
            st[k] += float(v) if isinstance(v, (int, float, str)) and str(v).replace(".", "", 1).isdigit() else 0
    ev = collections.Counter()
    early = collections.Counter()
    for e in s["events"]:
        if e["owner"].get("team") != team:
            continue
        for x in e["entries"]:
            ev[e["kind"]] += 1
            r = x["timestamp"]["round"]
            if r <= 200:
                early[e["kind"]] += 1
            if e["kind"] == "gemLoss":
                ev["gemsLostAmount"] += int(x.get("value") or 0)
            if e["kind"] == "gemCollection":
                ev["gemsCollectedAmount"] += int(x.get("value") or 0)
                if r <= 200:
                    early["gemsCollectedAmount"] += int(x.get("value") or 0)
    items = collections.Counter()
    for e in s["events"]:
        if e["owner"].get("team") == team and e["kind"] == "buyItem":
            for x in e["entries"]:
                items[x["target"]["name"].split(" of ")[0].replace(" Shard", "").replace(" Emblem", "")] += int(x.get("value") or 1)
    return st, ev, early, items


games = []
for f in glob.glob("official_summaries/*.json"):
    mid = f.split("/")[-1][:-5]
    if mid not in idx:
        continue
    g = idx[mid]; s = json.load(open(f))
    us, them = ("teamA", "teamB") if g["side"] == "a" else ("teamB", "teamA")
    su, eu, xu, iu = team_stats(s, us); st, et, xt, it = team_stats(s, them)
    cls = "win" if g["result"] == "win" else ("heavy" if g["oppScore"] - g["score"] >= 500 else "loss")
    games.append({"matchId": mid, "pool": g["pool"], "map": g["map"], "cls": cls, "us": {**su, **{"ev_" + k: v for k, v in eu.items()}, **{"early_" + k: v for k, v in xu.items()}},
                  "them": {**st, **{"ev_" + k: v for k, v in et.items()}, **{"early_" + k: v for k, v in xt.items()}}, "their_items": dict(it), "our_items": dict(iu),
                  "their_draft": [DRAFT[int(x)] for x in g["oppDraft"]], "rounds": g["rounds"]})
keys = ["kills", "deaths", "ev_gemsLostAmount", "ev_gemsCollectedAmount", "submittedGems", "earnedGold", "early_gemsCollectedAmount", "early_death", "early_kill", "ev_campClear", "championDamageDone", "monsterDamageDone"]
print(f"{len(games)} games with summaries")
for cls in ("win", "loss", "heavy"):
    gs = [g for g in games if g["cls"] == cls]
    if not gs:
        continue
    print(f"\n{cls}: {len(gs)} games")
    for k in keys:
        a = sum(g["us"].get(k, 0) for g in gs) / len(gs); b = sum(g["them"].get(k, 0) for g in gs) / len(gs)
        print(f"  {k:28s} us {a:9.1f}   them {b:9.1f}")
# what beats us: opponent draft frequency (by champion) in heavy losses vs in our wins
for cls in ("heavy", "win"):
    c = collections.Counter(ch for g in games if g["cls"] == cls for ch in g["their_draft"])
    n = sum(1 for g in games if g["cls"] == cls)
    print(f"\nopponent champions when {cls} (share of games):", {k: round(v / n, 2) for k, v in c.most_common(12)})
for cls in ("heavy", "win"):
    c = collections.Counter()
    gs = [g for g in games if g["cls"] == cls]
    for g in gs:
        for k, v in g["their_items"].items():
            c[k] += v
    print(f"\nopponent item families bought when {cls} (shards per game):", {k: round(v / len(gs), 1) for k, v in c.most_common(14)})
c = collections.Counter()
for g in games:
    for k, v in g["our_items"].items():
        c[k] += v
print("\nour item families (shards per game):", {k: round(v / len(games), 1) for k, v in c.most_common(10)})
json.dump(games, open("economy.json", "w"))
