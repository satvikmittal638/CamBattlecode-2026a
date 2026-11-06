"""When does the economic gap open? Cumulative gems captured, gold spent on items, kills and deaths at rounds
150 / 300 / 500 for us and the opponent, per dataset (same rank band as patch_impact.py).
  python3 timing.py [--ranks 27 103]"""
import collections, sys
sys.argv += [] if "--ranks" in sys.argv else ["--ranks", "27", "103"]
import patch_impact as P  # reuses SETS / load (prints its own report first; silence it)
CUTS = (150, 300, 500)


def timing(rows):
    acc = {side: collections.Counter() for side in ("us", "them")}
    for g, s, us in rows:
        for e in s["events"]:
            side = "us" if e["owner"].get("team") == us else "them"
            k = e["kind"]
            if k not in ("gemCollection", "buyItem", "kill", "death"):
                continue
            for x in e["entries"]:
                rnd = x["timestamp"]["round"]
                v = int(x.get("value") or 0) if k == "gemCollection" else (int(x.get("amount") or 0) if k == "buyItem" else 1)
                for c in CUTS:
                    if rnd <= c:
                        acc[side][(k, c)] += v
    n = max(1, len(rows))
    return {side: {f"{k}@{c}": round(v / n, 1) for (k, c), v in sorted(acc[side].items())} for side in acc}


for label, d, period in P.SETS:
    rows = P.load(d)
    if not rows:
        continue
    t = timing(rows)
    print(f"\n{label} ({period}, {len(rows)} games)")
    for k in ("gemCollection", "buyItem", "kill", "death"):
        print(f"  {k:14s}" + "".join(f"  r{c}: us {t['us'].get(f'{k}@{c}', 0):7.1f} them {t['them'].get(f'{k}@{c}', 0):7.1f}" for c in CUTS))
