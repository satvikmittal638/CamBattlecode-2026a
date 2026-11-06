"""Empirical Fish rules from raw observations: whom does Fish hit when it has a choice?

    python3 rules_targets.py --obs-dir obs [--max-games 5000] [--procs 16]

For every Fish attack on an enemy champion or a camp unit, the candidates are all enemy champions and camp units within
the attacker's range (Chebyshev distance <= range) at the start of the turn. For turns with 2+ candidates, counts how often
the chosen target was the lowest-HP, lowest-HP-fraction, closest, richest (gems), ranged, etc., next to the random
baseline (1 / number of candidates). Writes rules_targets.json next to the obs dir.
"""
import argparse
import gzip
import json
import os
from collections import Counter
from multiprocessing import Pool

RANGED = {1, 3, 5, 6, 8, 11}


def cheb(ax, ay, bx, by):
    return max(abs(ax - bx), abs(ay - by))


def game(path):
    st = Counter()
    with gzip.open(path, "rt") as fh:
        lines = fh.read().split("\n")[1:]
    for line in lines:
        if not line:
            continue
        rnd, cid, ctype, rep, obs = line.split("\t")
        att = [a for a in rep.split(";") if a.startswith("attack ")]
        if not att:
            continue
        tx, ty = map(int, att[0][7:].split(","))
        sec = obs.split("|")
        sf = sec[1].split(",")
        x, y, rng = int(sf[2]), int(sf[3]), int(sf[8])
        for a in rep.split(";"):  # range is measured from where Fish stands when it attacks (after this turn's move)
            if a.startswith("move "):
                x, y = map(int, a[5:].split(","))
            elif a.startswith("attack "):
                break
        champs = [c.split(",") for c in sec[2].split(";") if c] if len(sec) > 2 else []
        camps = [c.split(",") for c in sec[3].split(";") if c] if len(sec) > 3 else []
        cands = []
        for c in champs:
            if c[1] == "1":
                cx, cy = int(float(c[3])), int(float(c[4]))
                cands.append({"kind": "champ", "x": cx, "y": cy, "hp": float(c[5]), "frac": float(c[5]) / max(1.0, float(c[6])),
                              "gems": float(c[10]), "ranged": int(c[2]) in RANGED, "type": int(c[2]), "busy": int(c[9]) & 6 != 0})
        for c in camps:
            cx, cy = int(float(c[1])), int(float(c[2]))
            cands.append({"kind": "camp", "x": cx, "y": cy, "hp": float(c[4]), "frac": float(c[4]) / max(1.0, float(c[5])),
                          "gems": 0.0, "ranged": False, "type": -1, "busy": False, "awake": float(c[7]) > 0})
        for c in cands:
            c["d"] = cheb(x, y, c["x"], c["y"])
        inr = [c for c in cands if c["d"] <= max(1, rng)]
        chosen = [c for c in inr if (c["x"], c["y"]) == (tx, ty)]
        if not chosen:
            st["attack_target_not_a_candidate"] += 1
            hit = [c for c in cands if (c["x"], c["y"]) == (tx, ty)]
            st["not_candidate_" + (f"{hit[0]['kind']}_d{hit[0]['d'] - max(1, rng)}" if hit else "no_unit_on_tile")] += 1
            continue
        ch = chosen[0]
        st[f"attacks_on_{ch['kind']}"] += 1
        champs_in = [c for c in inr if c["kind"] == "champ"]
        camps_in = [c for c in inr if c["kind"] == "camp"]
        if champs_in and camps_in:
            st["mixed_choice"] += 1
            st[f"mixed_choice_chose_{ch['kind']}"] += 1
        pool = champs_in if ch["kind"] == "champ" else camps_in
        if len(pool) < 2:
            continue
        k = ch["kind"]
        st[f"{k}_choices"] += 1
        st[f"{k}_baseline"] += 1 / len(pool)
        for name, key, best in (("lowest_hp", "hp", min), ("lowest_frac", "frac", min), ("closest", "d", min), ("most_gems", "gems", max)):
            v = best(c[key] for c in pool)
            if ch[key] == v:
                st[f"{k}_chose_{name}"] += 1
                st[f"{k}_chose_{name}_ties"] += sum(1 for c in pool if c[key] == v) > 1
        if k == "champ":
            if any(c["ranged"] for c in pool) and not all(c["ranged"] for c in pool):
                st["champ_ranged_available"] += 1
                st["champ_chose_ranged"] += ch["ranged"]
            if any(c["busy"] for c in pool) and not all(c["busy"] for c in pool):
                st["champ_busy_available"] += 1
                st["champ_chose_busy"] += ch["busy"]
            for c in pool:
                st[f"type_avail_{c['type']}"] += 1
            st[f"type_chosen_{ch['type']}"] += 1
    return st


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--obs-dir", default="obs")
    ap.add_argument("--max-games", type=int, default=5000)
    ap.add_argument("--procs", type=int, default=16)
    a = ap.parse_args()
    files = sorted(os.path.join(a.obs_dir, f) for f in os.listdir(a.obs_dir) if f.endswith(".tsv.gz"))[:a.max_games]
    tot = Counter()
    with Pool(a.procs) as p:
        for st in p.imap_unordered(game, files, chunksize=8):
            tot.update(st)
    out = {k: round(v, 2) for k, v in sorted(tot.items())}
    json.dump({"games": len(files), "counts": out}, open(os.path.join(os.path.dirname(os.path.abspath(a.obs_dir)), "rules_targets.json"), "w"), indent=1)
    print(f"{len(files)} games")
    for k in ("champ", "camp"):
        n = tot[f"{k}_choices"]
        if not n:
            continue
        print(f"{k} attacks with 2+ {k} targets in range: {n}  (random pick would hit a given target {tot[f'{k}_baseline'] / n:.2f})")
        for name in ("lowest_hp", "lowest_frac", "closest", "most_gems"):
            print(f"  chose {name:12s} {tot[f'{k}_chose_{name}'] / n:.2f}  (ties {tot[f'{k}_chose_{name}_ties'] / n:.2f})")
    if tot["champ_ranged_available"]:
        print(f"  mixed ranged/melee in range: chose ranged {tot['champ_chose_ranged'] / tot['champ_ranged_available']:.2f} (n={tot['champ_ranged_available']})")
    if tot["champ_busy_available"]:
        print(f"  someone recalling/submitting in range: chose them {tot['champ_chose_busy'] / tot['champ_busy_available']:.2f} (n={tot['champ_busy_available']})")
    if tot["mixed_choice"]:
        print(f"champion and camp both in range: chose champion {tot['mixed_choice_chose_champ'] / tot['mixed_choice']:.2f} (n={tot['mixed_choice']})")
    print(f"attacks: champ {tot['attacks_on_champ']}, camp {tot['attacks_on_camp']}, target not a candidate {tot['attack_target_not_a_candidate']}")
    print("  not a candidate:", {k[14:]: v for k, v in tot.most_common() if k.startswith("not_candidate_")})
