"""Patch 2.0.0 impact from official match summaries: same five-champion draft (Heart, Vesper, Ryth, Marcella, Vendetta)
before the patch (v55/v57 100-challenge evals, 22-23 Oct) and after it (v62 attempt 1, v97 attempt 2, this v62 run).
Opponents are restricted to a common rank band (--ranks lo hi, default 27-103) so the field is comparable.
  python3 patch_impact.py [--ranks 27 103] [--json patch_impact.json]
Prints: results, opponent drafts, opponent item spend by family (incl. first emblem), per-champion performance."""
import collections, json, os, sys

A = os.path.dirname(os.path.abspath(__file__)) + "/.."
SETS = [("v55 pre", "v55_eval_2026-10-23", "pre"), ("v57 pre", "v57_eval_2026-10-23", "pre"),
        ("v62 att1", "v62_attempt1_2026-10-26", "post"), ("v97 att2", "v62y_attempt2_2026-10-26", "post"),
        ("v62 c100", "v62_c100_2026-10-27", "post")]
DRAFT = ["Ryth", "Vesper Vale", "Vendetta", "Cassi & Issac", "Stellar", "Prism", "Marcella", "Willow", "Ren", "Varg", "Tavi", "Heart of Ruin"]
NEW = {"Tribute", "Capture", "Prospector", "Hunter", "Skirmish", "Greed", "Collectors"}
argv = sys.argv[1:]
lo, hi = (int(argv[argv.index("--ranks") + 1]), int(argv[argv.index("--ranks") + 2])) if "--ranks" in argv else (27, 103)
num = lambda v: float(v) if isinstance(v, (int, float)) or (isinstance(v, str) and v.replace(".", "", 1).isdigit()) else 0.0


TYPES = ["Ryth", "Vesper Vale", "Vendetta", "Cassi", "Issac", "Stellar", "Prism", "Marcella", "Willow", "Ren", "Varg", "Tavi", "Heart of Ruin"]
FAMS = ["Monster", "Power", "Durability", "Treasure", "Jungle", "Home", "Bruiser", "Tribute", "Capture", "Prospector", "Hunter", "Skirmish", "Greed", "Collectors"]
STATS = ["Strength", "Focus", "Health"]


def norm_item(item):  # pre-patch CLI: "Unknown item (i)", i = family*6 + stat*2 + emblem
    if item.startswith("Unknown item ("):
        i = int(item[14:-1]); return f"{FAMS[i // 6]} {'Emblem' if i % 2 else 'Shard'} of {STATS[(i % 6) // 2]}"
    return item


def norm_champ(name):  # pre-patch CLI: "Unknown champion (t)", t = champion_type
    return TYPES[int(name[18:-1])] if name.startswith("Unknown champion (") else name


def family(item):  # "Treasure Shard of Health" -> Treasure
    return norm_item(item).split(" Shard")[0].split(" Emblem")[0]


def load(dirname):
    idx = json.load(open(f"{A}/{dirname}/games/index.json"))
    sdir = f"{A}/{dirname}/official_summaries"
    files = {f[:-5]: f for f in os.listdir(sdir) if f.endswith(".json")}
    out = []
    for g in idx:
        if g.get("opponentRank") is None or not (lo <= g["opponentRank"] <= hi):
            continue
        f = files.get(g["matchId"])
        if not f:
            continue
        s = json.load(open(f"{sdir}/{f}"))
        us = "teamA" if g["side"] == "a" else "teamB"
        out.append((g, s, us))
    return out


def analyse(rows):
    r = collections.Counter()
    oppPick = collections.Counter(); oppPickWin = collections.Counter(); oppWins = 0
    oppSpend = collections.Counter(); ourSpend = collections.Counter(); oppFirst = collections.Counter()
    champ = {"us": collections.defaultdict(collections.Counter), "them": collections.defaultdict(collections.Counter)}
    team = {"us": collections.Counter(), "them": collections.Counter()}
    for g, s, us in rows:
        win = g["result"] == "win"
        r["games"] += 1; r["wins"] += win; r["margin"] += g["score"] - g["oppScore"]
        for d in g.get("oppDraft") or []:
            oppPick[DRAFT[int(d)]] += 1
            if not win:
                oppPickWin[DRAFT[int(d)]] += 1
        oppWins += not win
        for c in s["champions"]:
            side = "us" if c["team"] == us else "them"
            m = champ[side][norm_champ(c["name"])]
            m["n"] += 1
            for k in ("kills", "deaths", "championDamageDone", "monsterDamageDone", "collectedGems", "earnedGold", "submittedGems", "championDamageTaken", "monsterDamageTaken"):
                m[k] += num(c["metrics"].get(k, 0)); team[side][k] += num(c["metrics"].get(k, 0))
            for it in c.get("itemsBought", []):
                if " Shard" in norm_item(it["item"]):
                    (ourSpend if side == "us" else oppSpend)[family(it["item"])] += 30 * int(it["quantity"])
        # first emblem each opponent champion completes (itemCombination events in round order)
        firsts = {}
        for e in s["events"]:
            if e["kind"] != "itemCombination" or e["owner"].get("team") == us:
                continue
            owner = e["owner"].get("id", e["owner"].get("champion"))
            for x in e["entries"]:
                rnd = x["timestamp"]["round"]
                if owner not in firsts or rnd < firsts[owner][0]:
                    firsts[owner] = (rnd, family(x["target"]["name"]))
        for rnd, fam in firsts.values():
            oppFirst[fam] += 1
    n = max(1, r["games"])
    return {"games": r["games"], "winPct": round(100 * r["wins"] / n, 1), "meanMargin": round(r["margin"] / n),
            "oppPickShare": {k: round(v / n, 2) for k, v in oppPick.most_common()},
            "oppPickShareWhenTheyWin": {k: round(v / max(1, oppWins), 2) for k, v in oppPickWin.most_common()},
            "oppSpendShare": {k: round(100 * v / max(1, sum(oppSpend.values())), 1) for k, v in oppSpend.most_common()},
            "oppNewFamilySpendPct": round(100 * sum(v for k, v in oppSpend.items() if k in NEW) / max(1, sum(oppSpend.values())), 1),
            "oppFirstEmblem": {k: round(100 * v / max(1, sum(oppFirst.values())), 1) for k, v in oppFirst.most_common(8)},
            "ourSpendShare": {k: round(100 * v / max(1, sum(ourSpend.values())), 1) for k, v in ourSpend.most_common()},
            "teamPerGame": {side: {k: round(v / n) for k, v in team[side].items()} for side in team},
            "champPerGame": {side: {name: {k: round(v / m["n"]) for k, v in m.items() if k != "n"} | {"games": m["n"]}
                                    for name, m in sorted(champ[side].items(), key=lambda x: -x[1]["n"])} for side in champ}}


def main():
    res = {}
    for label, d, period in SETS:
        rows = load(d)
        if rows:
            res[label] = analyse(rows) | {"period": period}
    print(f"opponent ranks {lo}-{hi}")
    for label, x in res.items():
        print(f"\n=== {label} ({x['period']}): {x['games']} games, win {x['winPct']}%, mean margin {x['meanMargin']}")
        print("  team per game  us:", x["teamPerGame"]["us"])
        print("               them:", x["teamPerGame"]["them"])
        print("  opp picks:", x["oppPickShare"])
        print("  opp spend %:", x["oppSpendShare"], "| new families", x["oppNewFamilySpendPct"], "%")
        print("  opp first emblem %:", x["oppFirstEmblem"])
        print("  our spend %:", x["ourSpendShare"])
    ours = ["Heart of Ruin", "Vesper Vale", "Ryth", "Marcella", "Vendetta"]
    print("\nper-champion per game (ours): kills / deaths / champ dmg / monster dmg / gems collected / gold earned")
    for name in ours:
        for label, x in res.items():
            c = x["champPerGame"]["us"].get(name)
            if c:
                print(f"  {name:14s} {label:9s} n={c['games']:4d}  K {c['kills']:3d} D {c['deaths']:3d}  cd {c['championDamageDone']:6d}  md {c['monsterDamageDone']:6d}  gems {c['collectedGems']:4d}  gold {c['earnedGold']:5d}")
    print("\nsame champions on the OPPONENT side (how others play our picks):")
    for name in ours:
        for label, x in res.items():
            c = x["champPerGame"]["them"].get(name)
            if c:
                print(f"  {name:14s} {label:9s} n={c['games']:4d}  K {c['kills']:3d} D {c['deaths']:3d}  cd {c['championDamageDone']:6d}  md {c['monsterDamageDone']:6d}  gems {c['collectedGems']:4d}  gold {c['earnedGold']:5d}")
    if "--json" in argv:
        json.dump(res, open(argv[argv.index("--json") + 1], "w"), indent=1)



if __name__ == "__main__":
    main()
