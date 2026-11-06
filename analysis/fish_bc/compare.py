""""What would Fish do here?" - run the Fish clone on one side of any replay (e.g. our own games) and compare, turn by turn,
the recorded actions with the clone's prediction for Fish in the same seat.

    ../../.venv-analysis/bin/python compare.py --model models/<tag>.pt --game <replay>:<map>:<side a|b> [--game ...] [--top 30]

The side's observations are extracted with turnhost --observe + the Fish observer bot (cached in compare/), featurised
exactly like the training data (every turn kept), and scored. Prints agreement per head and per situation, and the
turns where the recorded action is least Fish-like (the clone confidently prefers something else). Writes
compare/<model tag>_report.json.
"""
import argparse
import gzip
import json
import os
import subprocess
from collections import defaultdict

import numpy as np
import torch

from build_dataset import game_samples
from train import FishNet, NONE, zeroed_scalars

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "../.."))
EXE = os.path.join(ROOT, "analysis/v58_deep_2026-10-24/harness/turnhost/target/release/turnhost")
BOT = os.path.join(ROOT, "workspace/bots/fishbc-observer/.cambc/build-release/bot-injected.wasm")
ENGINE = os.path.join(ROOT, "tools/engines/v1_0_3.wasm")
TYPES = ["Ryth", "VesperVale", "Vendetta", "Cassi", "Issac", "Stellar", "Prism", "Marcella", "Willow", "Ren", "Varg", "Tavi", "HeartOfRuin"]
MOVES = ["NW", "N", "NE", "W", "stay", "E", "SW", "S", "SE"]


def map_path(m):
    f = m.replace("_", "-") + ".map26a"
    for d in ("workspace/maps", "workspace/maps_holdout"):
        p = os.path.join(ROOT, d, f)
        if os.path.exists(p):
            return p
    raise FileNotFoundError(f)


def observe(replay, mp, side):
    """Extract (and cache) the observations of `side` in `replay`; same format as extract.mjs."""
    os.makedirs(os.path.join(HERE, "compare"), exist_ok=True)
    out = os.path.join(HERE, "compare", f"{os.path.basename(replay).split('.')[0]}_{side}.tsv.gz")
    if os.path.exists(out):
        return out
    p = subprocess.run([EXE, "--engine", ENGINE, "--map", map_path(mp), "--replay", replay, "--bot", BOT, "--team", "0" if side == "a" else "1",
                        "--observe", "--quantum", "3000000", "--log", "400000"], capture_output=True, text=True)
    map_line, rows = None, []
    for l in p.stdout.split("\n"):
        if not l.startswith("{"):
            continue
        t = json.loads(l)
        obs = None
        for x in t["log"].split("\n"):
            if x.startswith("M ") and map_line is None:
                map_line = x
            elif x.startswith("O "):
                obs = x[2:]
        if obs is not None:
            rows.append(f"{t['r']}\t{t['id']}\t{t['type']}\t{';'.join(t['rep'])}\t{obs}")
    if p.returncode or not map_line:
        raise RuntimeError(f"observe failed for {replay}: {p.stderr.strip().splitlines()[-1:]}")
    with gzip.open(out, "wt") as f:
        f.write(map_line + "\n" + "\n".join(rows) + "\n")
    return out


def tile_str(t):
    return "none" if t == NONE else f"({t % 15 - 7:+d},{t // 15 - 7:+d})"


ap = argparse.ArgumentParser()
ap.add_argument("--model", required=True)
ap.add_argument("--game", action="append", required=True, help="replay:map:side")
ap.add_argument("--top", type=int, default=30)
a = ap.parse_args()
dev = torch.device("cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu"))
ck = torch.load(a.model, map_location="cpu")
model = FishNet(cin=ck["args"].get("cin", 19), width=ck["args"]["width"], blocks=ck["args"]["blocks"]).to(dev)
model.load_state_dict(ck["state"])
model.eval()

agree = defaultdict(lambda: [0, 0])
worst = []
for spec in a.game:
    replay, mp, side = spec.rsplit(":", 2)
    G, S, L, M = game_samples(observe(replay, mp, side), 1.0, np.random.default_rng(0), "v2" if ck["args"].get("cin", 19) > 19 else "v1")
    S[:, zeroed_scalars(ck["args"])] = 0
    probs = [[] for _ in range(6)]
    with torch.no_grad():
        for i in range(0, len(G), 2048):
            out = model(torch.from_numpy(G[i:i + 2048]).to(dev).float() / 255, torch.from_numpy(S[i:i + 2048]).to(dev))
            for k in range(6):
                probs[k].append(torch.softmax(out[k].float(), 1).cpu().numpy())
    P = [np.concatenate(p) for p in probs]
    ne = np.round(S[:, 44] * 20).astype(int)
    for i in range(len(L)):
        sit = "enemy<=2" if ne[i] <= 2 else "enemy 3-5" if ne[i] <= 5 else "enemy 6-8" if ne[i] <= 8 else "no enemy near"
        checks = {"move": P[0][i].argmax() == L[i, 0], "attack_decision": (P[1][i].argmax() != NONE) == (L[i, 1] != NONE),
                  "cast_slot": P[2][i].argmax() == L[i, 2]}
        for k, ok in checks.items():
            for key in (k, f"{k} | {sit}", f"{k} | {TYPES[M[i, 1]] if 0 <= M[i, 1] < 13 else M[i, 1]}"):
                agree[key][0] += int(ok)
                agree[key][1] += 1
        # How un-Fish-like was the recorded move / attack choice? (probability the clone gives it, vs its favourite)
        for head, lab_i, name in ((0, 0, "move"), (1, 1, "attack")):
            p_rec, best = float(P[head][i][L[i, lab_i]]), int(P[head][i].argmax())
            if best != L[i, lab_i]:
                fmt = (lambda v: MOVES[v]) if head == 0 else tile_str
                worst.append({"game": os.path.basename(replay), "round": int(M[i, 0]), "champion": TYPES[M[i, 1]] if 0 <= M[i, 1] < 13 else int(M[i, 1]),
                              "id": int(M[i, 2]), "head": name, "ours": fmt(int(L[i, lab_i])), "p_ours": round(p_rec, 3),
                              "fish": fmt(best), "p_fish": round(float(P[head][i][best]), 3), "situation": sit,
                              "hp_frac": round(float(S[i, 13]), 2)})
worst.sort(key=lambda w: w["p_ours"] - w["p_fish"])
rep = {"model": a.model, "games": a.game, "agreement": {k: round(v[0] / v[1], 3) for k, v in sorted(agree.items())},
       "counts": {k: v[1] for k, v in sorted(agree.items())}, "least_fish_like": worst[:500]}
out = os.path.join(HERE, "compare", os.path.basename(a.model).replace(".pt", "_report.json"))
json.dump(rep, open(out, "w"), indent=1)
print("agreement with the Fish clone (fraction of turns where the recorded action = clone's top choice):")
for k, v in rep["agreement"].items():
    if " | " not in k or "enemy" in k or "no enemy" in k:
        print(f"  {k:32s} {v:.3f}  (n={rep['counts'][k]})")
print(f"\nleast Fish-like turns (top {a.top}):")
for w in worst[:a.top]:
    print(f"  {w['game'][:8]} r{w['round']:4d} {str(w['champion']):11s} {w['head']:6s} ours {w['ours']:>9s} (p {w['p_ours']:.2f})  fish {w['fish']:>9s} (p {w['p_fish']:.2f})  {w['situation']}, hp {w['hp_frac']}")
print(f"-> {out}")
