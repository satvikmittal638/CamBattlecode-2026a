"""Look inside the Fish clone: which situations it tells apart, and how its choices depend on them.
Runs where the data lives (cluster), on held-out test games only; writes one small JSON of results.

    python interpret.py --model models/<tag>.pt --data-dir data_v2 --out interpret/<tag>.json [--shards 6] [--device cuda]

1. Modes   : k-means on the network's internal 128-d summary of each turn (the layer feeding every head); each
             cluster is described by its situation (HP, gems, enemies, camps, ...) and by the clone's / Fish's actions.
2. Probes  : on real fight turns (enemy within 5), change one thing - own HP, the nearest enemy's HP, gems carried,
             allies present, cooldowns, the nearest enemy's champion type - and measure how the clone's choice shifts.
3. Rules   : shallow decision trees on plain features that imitate the clone's fight move / attack / recall choice,
             with their fidelity (agreement with the clone on held-out turns).
4. Inputs  : permutation importance on fight turns (which inputs the move and attack choices depend on).
Moves are classed relative to the nearest visible enemy: approach (Chebyshev distance shrinks), retreat (grows),
sidestep (same distance), stay.
"""
import argparse
import glob
import json
import os

import numpy as np
import torch

from train import FishNet, NONE, zeroed_scalars

TYPES = ["Ryth", "VesperVale", "Vendetta", "Cassi", "Issac", "Stellar", "Prism", "Marcella", "Willow", "Ren", "Varg", "Tavi", "HeartOfRuin"]
RANGED = {1, 3, 5, 6, 8, 11}
MDX = np.array([-1, 0, 1, -1, 0, 1, -1, 0, 1])
MDY = np.array([-1, -1, -1, 0, 0, 0, 1, 1, 1])
YY, XX = np.mgrid[-7:8, -7:8]
CHEB = np.maximum(abs(YY), abs(XX))
ALLY_CH = [6, 9, 24, 25, 26, 27] + list(range(41, 54))
ENEMY_CH = [7, 8, 10, 11] + list(range(19, 24)) + list(range(28, 41))

ap = argparse.ArgumentParser()
ap.add_argument("--model", required=True)
ap.add_argument("--data-dir", required=True)
ap.add_argument("--out", required=True)
ap.add_argument("--shards", type=int, default=6)
ap.add_argument("--fight-per-shard", type=int, default=40000)
ap.add_argument("--calm-per-shard", type=int, default=10000)
ap.add_argument("--probe-n", type=int, default=40000)
ap.add_argument("--device", default="cuda")
ap.add_argument("--threads", type=int, default=8)
a = ap.parse_args()
torch.set_num_threads(a.threads)
dev = torch.device(a.device if a.device != "cuda" or torch.cuda.is_available() else "cpu")
ck = torch.load(a.model, map_location="cpu")
model = FishNet(cin=ck["args"].get("cin", 19), width=ck["args"]["width"], blocks=ck["args"]["blocks"]).to(dev)
model.load_state_dict(ck["state"])
model.eval()
ZERO = zeroed_scalars(ck["args"])
hooked = {}
model.pool_mlp.register_forward_hook(lambda m, i, o: hooked.__setitem__("h", o))
rng = np.random.default_rng(0)

# ---------------- data: held-out test turns, all fights + a sample of calm turns ----------------
G, S, L, W = [], [], [], []
for f in sorted(glob.glob(os.path.join(a.data_dir, "test_*.npz")))[:a.shards]:
    z = np.load(f)
    s = z["scal"]
    fight = np.where(s[:, 44] * 20 <= 8)[0]
    calm = np.where(s[:, 44] * 20 > 8)[0]
    fi = rng.choice(fight, min(len(fight), a.fight_per_shard), replace=False)
    ci = rng.choice(calm, min(len(calm), a.calm_per_shard), replace=False)
    idx = np.sort(np.concatenate([fi, ci]))
    w = np.where(s[idx, 44] * 20 <= 8, len(fight) / max(1, len(fi)), len(calm) / max(1, len(ci)))
    g = z["grid"]
    G.append(g[idx]); S.append(s[idx]); L.append(z["lab"][idx].astype(np.int64)); W.append(w)
    del g, z
G, S, L, W = np.concatenate(G), np.concatenate(S), np.concatenate(L), np.concatenate(W)
S[:, ZERO] = 0
N = len(G)
print(f"{N} turns ({int((S[:, 44] * 20 <= 8).sum())} with an enemy within 8)", flush=True)


@torch.no_grad()
def run(g, s, bs=4096, want_h=False):
    """Clone probabilities per head (+ the internal 128-d summary)."""
    outs, hs = [[] for _ in range(6)], []
    for i in range(0, len(g), bs):
        gt = torch.from_numpy(np.ascontiguousarray(g[i:i + bs])).to(dev).float() / 255
        st = torch.from_numpy(np.ascontiguousarray(s[i:i + bs])).to(dev)
        with torch.autocast(device_type="cuda", dtype=torch.bfloat16, enabled=dev.type == "cuda"):
            o = model(gt, st)
        for k in range(6):
            outs[k].append(torch.softmax(o[k].float(), 1).cpu().numpy())
        if want_h:
            hs.append(hooked["h"].float().cpu().numpy())
    P = [np.concatenate(x) for x in outs]
    return (P, np.concatenate(hs)) if want_h else P


# ---------------- plain features ----------------
def features(g, s):
    en = g[:, 7] > 0
    al = (g[:, 6] > 0) & (CHEB > 0)[None]
    dmap = np.where(en, CHEB[None], 99)
    flat = dmap.reshape(len(g), -1)
    ni = flat.argmin(1)
    ned = flat.min(1)
    ey, ex = ni // 15 - 7, ni % 15 - 7
    has = ned < 99
    r = np.arange(len(g))
    gy, gx = ey + 7, ex + 7
    f = {
        "own_hp": s[:, 13], "gems": s[:, 19] * 100, "type": s[:, :13].argmax(1), "round": s[:, 30] * 2000,
        "spawn_d": s[:, 35] * 40, "own_cd0_ready": (s[:, 20] == 0).astype(float), "own_cd1_ready": (s[:, 21] == 0).astype(float),
        "enemy_d": np.where(has, ned, 99), "enemy_hp": np.where(has, g[r, 7, gy, gx] / 255, np.nan),
        "enemy_ranged": np.where(has, g[r, 10, gy, gx] == 255, False).astype(float),
        "enemy_cd_ready": np.where(has, (g[r, 20, gy, gx] == 255) | (g[r, 21, gy, gx] == 255), False).astype(float),
        "enemy_busy": np.where(has, g[r, 22, gy, gx] > 0, False).astype(float),
        "enemy_type": np.where(has, g[r, 28:41, gy, gx].argmax(1), -1),
        "enemies_4": (en & (CHEB <= 4)[None]).sum((1, 2)), "allies_4": (al & (CHEB <= 4)[None]).sum((1, 2)),
        "enemy_pow_4": np.where(en & (CHEB <= 4)[None], g[:, 7] / 255, 0).sum((1, 2)),
        "ally_pow_4": np.where(al & (CHEB <= 4)[None], g[:, 6] / 255, 0).sum((1, 2)) + s[:, 13],
        "camp_adjacent": ((g[:, 12] > 0) & (g[:, 13] == 255) & (CHEB <= 1)[None]).any((1, 2)).astype(float),
        "camp_reward_ready_2": ((g[:, 17] > 0) & (CHEB <= 2)[None]).any((1, 2)).astype(float),
    }
    f["numbers_4"] = f["allies_4"] + 1 - f["enemies_4"]
    f["power_diff_4"] = f["ally_pow_4"] - f["enemy_pow_4"]
    return f, ex, ey, has


def move_classes(ex, ey, has):
    """[N, 9] class of each move: 0 stay, 1 approach, 2 retreat, 3 sidestep (relative to the nearest enemy)."""
    d0 = np.maximum(abs(ex), abs(ey))[:, None]
    d1 = np.maximum(abs(ex[:, None] - MDX[None]), abs(ey[:, None] - MDY[None]))
    c = np.where(d1 < d0, 1, np.where(d1 > d0, 2, 3))
    c[:, 4] = 0
    c[~has] = 3
    c[~has, 4] = 0
    return c


def summarize(P, cls):
    mv = P[0]
    out = {name: (mv * (cls == k)).sum(1) for k, name in enumerate(["p_stay", "p_approach", "p_retreat", "p_sidestep"])}
    out["p_attack"] = 1 - P[1][:, NONE]
    out["p_cast"] = 1 - P[2][:, 0]
    out["p_recall"] = P[5][:, 1]
    out["p_submit"] = P[5][:, 2]
    return out


F, EX, EY, HAS = features(G, S)
CLS = move_classes(EX, EY, HAS)
P, H = run(G, S, want_h=True)
A = summarize(P, CLS)
fish_cls = CLS[np.arange(N), L[:, 0]]
fish = {"stay": (fish_cls == 0), "approach": (fish_cls == 1), "retreat": (fish_cls == 2), "sidestep": (fish_cls == 3),
        "attack": L[:, 1] != NONE, "cast": L[:, 2] > 0, "recall": L[:, 5] == 1, "submit": L[:, 5] == 2}
res = {"model": a.model, "turns": N, "fight_turns": int((F["enemy_d"] <= 8).sum())}


def wmean(x, w):
    return float((x * w).sum() / max(1e-9, w.sum()))


# ---------------- 1. modes ----------------
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.tree import DecisionTreeClassifier, export_text

Z = PCA(32, random_state=0).fit_transform((H - H.mean(0)) / (H.std(0) + 1e-6))
K = 12
km = KMeans(K, n_init=4, random_state=0).fit(Z, sample_weight=W)
modes = []
for k in range(K):
    m = km.labels_ == k
    w = W[m]
    desc = {"share": float(w.sum() / W.sum()), "n": int(m.sum())}
    for key in ("own_hp", "gems", "enemy_d", "enemies_4", "allies_4", "numbers_4", "camp_adjacent", "camp_reward_ready_2", "spawn_d", "round"):
        x = np.where(F[key] >= 99, 20, F[key]) if key == "enemy_d" else F[key]
        desc[key] = wmean(x[m], w)
    tc = np.bincount(F["type"][m], weights=w, minlength=13)
    desc["top_types"] = [TYPES[i] for i in np.argsort(-tc)[:3] if tc[i] > 0]
    desc["clone"] = {k2: wmean(v[m], w) for k2, v in A.items()}
    desc["fish"] = {k2: wmean(v[m].astype(float), w) for k2, v in fish.items()}
    modes.append(desc)
modes.sort(key=lambda d: -d["share"])
res["modes"] = modes
print("modes done", flush=True)

# ---------------- 2. counterfactual probes on fight turns ----------------
fi = np.where(F["enemy_d"] <= 5)[0]
fi = rng.choice(fi, min(len(fi), a.probe_n), replace=False)
g0, s0 = G[fi].copy(), S[fi].copy()
f0 = {k: v[fi] for k, v in F.items()}
cls0, ex0, ey0 = CLS[fi], EX[fi], EY[fi]
r0 = np.arange(len(fi))
groups = {"all": np.ones(len(fi), bool), "outnumbered": f0["numbers_4"] < 1, "even": f0["numbers_4"] == 1, "outnumbering": f0["numbers_4"] > 1}


def probe(g, s):
    p = summarize(run(g, s), cls0)
    return {gname: {k: float(v[m].mean()) for k, v in p.items()} for gname, m in groups.items() if m.any()}


probes = {"base": probe(g0, s0), "group_sizes": {k: int(v.sum()) for k, v in groups.items()}}
probes["own_hp"] = {}
for v in (0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0):
    s = s0.copy()  # the champion itself is not drawn on the grid: own HP / gems live in the scalars only
    s[:, 13] = v
    probes["own_hp"][v] = probe(g0, s)
probes["enemy_hp"] = {}
for v in (0.05, 0.1, 0.2, 0.3, 0.5, 0.7, 1.0):
    g = g0.copy()
    g[r0, 7, ey0 + 7, ex0 + 7] = max(1, round(255 * v))
    probes["enemy_hp"][v] = probe(g, s0)
probes["gems"] = {}
for v in (0, 5, 10, 20, 40, 80):
    s = s0.copy()
    s[:, 19] = v / 100
    probes["gems"][v] = probe(g0, s)
g = g0.copy()
g[:, ALLY_CH] = 0
s = s0.copy()
s[:, 42] = 0
probes["no_allies_in_view"] = probe(g, s)
for name, val in (("enemy_cooldowns_ready", 255), ("enemy_cooldowns_spent", 64)):
    g = g0.copy()
    g[r0, 20, ey0 + 7, ex0 + 7] = val
    g[r0, 21, ey0 + 7, ex0 + 7] = val
    probes[name] = probe(g, s0)
for name, val in (("own_cooldowns_ready", 0.0), ("own_cooldowns_spent", 0.5)):
    s = s0.copy()
    s[:, 20] = val
    s[:, 21] = val
    probes[name] = probe(g0, s)
probes["enemy_type"] = {}
for t in range(13):
    g = g0.copy()
    g[r0, 28:41, ey0 + 7, ex0 + 7] = 0
    g[r0, 28 + t, ey0 + 7, ex0 + 7] = 255
    g[r0, 10, ey0 + 7, ex0 + 7] = 255 if t in RANGED else 128
    probes["enemy_type"][TYPES[t]] = probe(g, s0)["all"]
g = g0.copy()
g[r0, 22, ey0 + 7, ex0 + 7] = 255
probes["enemy_recalling"] = probe(g, s0)
res["probes"] = probes
print("probes done", flush=True)

# ---------------- 3. readable rules imitating the clone ----------------
names = ["own_hp", "gems", "enemy_d", "enemy_hp", "enemy_ranged", "enemy_cd_ready", "enemy_busy", "enemies_4", "allies_4",
         "numbers_4", "power_diff_4", "camp_adjacent", "own_cd0_ready", "own_cd1_ready", "spawn_d", "round"]
X = np.stack([np.nan_to_num(F[n], nan=-1.0) for n in names], 1)
rules = {}
mf = F["enemy_d"] <= 5
targets = {
    "fight_move (enemy within 5)": (mf, np.argmax(np.stack([A["p_stay"], A["p_approach"], A["p_retreat"], A["p_sidestep"]], 1), 1), ["stay", "approach", "retreat", "sidestep"]),
    "attack (enemy within 5)": (mf, (A["p_attack"] > 0.5).astype(int), ["no attack", "attack"]),
    "recall (any turn)": (np.ones(N, bool), (A["p_recall"] > 0.5).astype(int), ["no recall", "recall"]),
}
for tname, (m, y, labels) in targets.items():
    idx = np.where(m)[0]
    rng.shuffle(idx)
    half = len(idx) // 2
    tr, te = idx[:half], idx[half:]
    out = {}
    for depth in (3, 5):
        dt = DecisionTreeClassifier(max_depth=depth, min_samples_leaf=300, class_weight=None, random_state=0).fit(X[tr], y[tr], sample_weight=W[tr])
        fid = float((dt.predict(X[te]) == y[te]).mean())
        base = float(np.bincount(y[te]).max() / len(te))
        out[f"depth_{depth}"] = {"fidelity": fid, "majority_baseline": base, "classes": labels,
                                 "text": export_text(dt, feature_names=names, class_names=[labels[c] for c in dt.classes_], decimals=2)}
    rules[tname] = out
res["rules"] = rules
print("rules done", flush=True)

# ---------------- 4. which inputs the fight choices use ----------------
schema = json.load(open(os.path.join(a.data_dir, "schema.json")))
sub = slice(0, min(len(fi), 20000))
gb, sb = g0[sub], s0[sub]
pb = run(gb, sb)
mb, ab = pb[0].argmax(1), pb[1].argmax(1) != NONE
imp = {}
for c, name in enumerate(schema["channels"]):
    g = gb.copy()
    g[:, c] = gb[rng.permutation(len(gb)), c]
    p = run(g, sb)
    imp["grid:" + name] = (float((p[0].argmax(1) != mb).mean()), float(((p[1].argmax(1) != NONE) != ab).mean()))
for j, name in enumerate(schema["scalars"]):
    if name.startswith("type_") or j in ZERO:
        continue
    s = sb.copy()
    s[:, j] = sb[rng.permutation(len(sb)), j]
    p = run(gb, s)
    imp["scalar:" + name] = (float((p[0].argmax(1) != mb).mean()), float(((p[1].argmax(1) != NONE) != ab).mean()))
res["fight_input_importance"] = {k: [round(v[0], 4), round(v[1], 4)] for k, v in sorted(imp.items(), key=lambda kv: -max(kv[1]))}
os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
json.dump(res, open(a.out, "w"), indent=1)
print("->", a.out)
