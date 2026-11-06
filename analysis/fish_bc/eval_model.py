"""Evaluate a trained FishNet on held-out games: per-champion and per-situation accuracy, move confusion, and permutation
importance of every input (which grid channels / scalars Fish's decisions depend on).

    ../../.venv-analysis/bin/python eval_model.py models/<tag>.pt [--data-dir data] [--max-samples 120000]
Writes models/<tag>_eval.json and prints a summary.
"""
import argparse
import glob
import json
import os

import numpy as np
import torch

from train import FishNet, NONE, zeroed_scalars

HERE = os.path.dirname(os.path.abspath(__file__))
TYPES = ["Ryth", "VesperVale", "Vendetta", "Cassi", "Issac", "Stellar", "Prism", "Marcella", "Willow", "Ren", "Varg", "Tavi", "HeartOfRuin"]

ap = argparse.ArgumentParser()
ap.add_argument("model")
ap.add_argument("--data-dir", default=os.path.join(HERE, "data"))
ap.add_argument("--max-samples", type=int, default=120000)
a = ap.parse_args()
dev = torch.device("cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu"))
ck = torch.load(a.model, map_location="cpu")
args = ck["args"]
model = FishNet(cin=args.get("cin", 19), width=args["width"], blocks=args["blocks"]).to(dev)
model.load_state_dict(ck["state"])
model.eval()
schema = json.load(open(os.path.join(a.data_dir, "schema.json")))

files = sorted(glob.glob(os.path.join(a.data_dir, "test_*.npz")))
G, S, L, M = [], [], [], []
n = 0
for f in files:
    z = np.load(f)
    G.append(z["grid"]); S.append(z["scal"]); L.append(z["lab"]); M.append(z["meta"])
    n += len(z["lab"])
    if n >= a.max_samples:
        break
G, S, L, M = (np.concatenate(x)[:a.max_samples] for x in (G, S, L, M))
S[:, zeroed_scalars(args)] = 0


@torch.no_grad()
def predict(g, s, bs=4096):
    outs = [[] for _ in range(6)]
    for i in range(0, len(g), bs):
        gt = torch.from_numpy(g[i:i + bs]).to(dev).float() / 255
        st = torch.from_numpy(s[i:i + bs]).to(dev)
        with torch.autocast(device_type="cuda", dtype=torch.bfloat16, enabled=dev.type == "cuda"):
            o = model(gt, st)
        for k in range(6):
            outs[k].append(o[k].float().argmax(1).cpu().numpy())
    return [np.concatenate(x) for x in outs]


def scores(P, L):
    mv, at, cs, ct, wd, sp = P
    return {
        "move": float((mv == L[:, 0]).mean()),
        "attack_decision": float(((at != NONE) == (L[:, 1] != NONE)).mean()),
        "attack_tile_when_attack": float((at == L[:, 1])[L[:, 1] != NONE].mean()) if (L[:, 1] != NONE).any() else None,
        "cast_slot": float((cs == L[:, 2]).mean()),
        "special_when_special": float((sp == L[:, 5])[L[:, 5] > 0].mean()) if (L[:, 5] > 0).any() else None,
        "ward_decision": float(((wd != NONE) == (L[:, 4] != NONE)).mean()),
    }


P = predict(G, S)
base = scores(P, L)
res = {"overall": base, "n": int(len(L))}
# Per champion type.
res["by_type"] = {}
for t in np.unique(M[:, 1]):
    m = M[:, 1] == t
    res["by_type"][TYPES[t] if 0 <= t < 13 else str(t)] = {"n": int(m.sum()), **scores([p[m] for p in P], L[m])}
# Per situation: nearest enemy distance bucket (scalar nearest_enemy_d * 20).
ne = np.round(S[:, 13 + 31] * 20).astype(int)
res["by_enemy_distance"] = {}
for lo, hi, name in [(0, 2, "enemy<=2"), (3, 5, "enemy 3-5"), (6, 8, "enemy 6-8"), (9, 99, "no enemy near")]:
    m = (ne >= lo) & (ne <= hi)
    if m.sum():
        res["by_enemy_distance"][name] = {"n": int(m.sum()), **scores([p[m] for p in P], L[m])}
# Move confusion (rows = true, cols = predicted), 0..8 with 4 = stay.
conf = np.zeros((9, 9), int)
np.add.at(conf, (L[:, 0], P[0]), 1)
res["move_confusion"] = conf.tolist()
# Permutation importance (shuffle one input across samples; drop in move accuracy and attack-decision accuracy).
rng = np.random.default_rng(0)
imp = {}
sub = slice(0, min(len(L), 40000))
g0, s0, l0 = G[sub], S[sub], L[sub]
b0 = scores(predict(g0, s0), l0)
for c, name in enumerate(schema["channels"]):
    g = g0.copy()
    g[:, c] = g0[rng.permutation(len(g0)), c]
    sc = scores(predict(g, s0), l0)
    imp["grid:" + name] = (b0["move"] - sc["move"], b0["attack_decision"] - sc["attack_decision"])
for j, name in enumerate(schema["scalars"]):
    if name.startswith("type_") or j in zeroed_scalars(args):
        continue
    s = s0.copy()
    s[:, j] = s0[rng.permutation(len(s0)), j]
    sc = scores(predict(g0, s), l0)
    imp["scalar:" + name] = (b0["move"] - sc["move"], b0["attack_decision"] - sc["attack_decision"])
res["permutation_importance"] = {k: [round(v[0], 4), round(v[1], 4)] for k, v in sorted(imp.items(), key=lambda kv: -max(kv[1]))}
out = a.model.replace(".pt", "_eval.json")
json.dump(res, open(out, "w"), indent=1)
print(f"n={len(L)} overall: " + ", ".join(f"{k} {v:.3f}" for k, v in base.items() if v is not None))
print("by type: " + "; ".join(f"{k} move {v['move']:.2f} att {v['attack_decision']:.2f}" for k, v in res["by_type"].items()))
print("by enemy distance: " + "; ".join(f"{k} move {v['move']:.2f} att {v['attack_decision']:.2f} (n={v['n']})" for k, v in res["by_enemy_distance"].items()))
print("top inputs (drop in move acc, attack-decision acc):")
for k, v in list(res["permutation_importance"].items())[:15]:
    print(f"  {k:28s} {v[0]:+.4f} {v[1]:+.4f}")
print(f"-> {out}")
