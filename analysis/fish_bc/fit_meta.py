"""Fit Fish's core meta as small, cheap policies and write them as a C++ header for the fishmeta bot.

    python fit_meta.py --data-dir data_v2 --obs-dir obs --matches fish_matches.json --out-dir meta [--shards 80]

Everything is learned from Fish's TRAIN games (the md5 split used everywhere; test games only for the reported scores):
  move    : multinomial logistic policy over {stay, approach, retreat, sidestep} (relative to the nearest visible enemy)
            on turns with an enemy within 5 tiles.
  recall  : logistic P(recall) on every turn; calm turns that the dataset sub-sampled are re-weighted, and the decision
            threshold is the one that makes the bot recall exactly as often as Fish.
  target  : conditional logit over the enemy champions in attack range when Fish attacks one of them.
  draft   : Fish's champion pick frequency per team size.
Feature definitions here and in workspace/bots/fishmeta/src/fish_meta.h must stay identical (same order, same scaling).
Writes <out-dir>/fish_meta.json and <out-dir>/fish_meta_params.h.
"""
import argparse
import glob
import gzip
import hashlib
import json
import os
from collections import Counter, defaultdict
from multiprocessing import Pool

import numpy as np

TYPES = ["Ryth", "VesperVale", "Vendetta", "Cassi", "Issac", "Stellar", "Prism", "Marcella", "Willow", "Ren", "Varg", "Tavi", "HeartOfRuin"]
RANGED = {1, 3, 5, 6, 8, 11}
MDX = np.array([-1, 0, 1, -1, 0, 1, -1, 0, 1])
MDY = np.array([-1, -1, -1, 0, 0, 0, 1, 1, 1])
YY, XX = np.mgrid[-7:8, -7:8]
CHEB = np.maximum(abs(YY), abs(XX))
MOVE_FEATURES = ["bias", "own_hp", "own_hp_lt25", "own_hp_lt40", "own_hp_lt60", "enemy_hp", "enemy_hp_lt20", "enemy_hp_lt30",
                 "enemy_hp_lt50", "gems50", "numbers4", "power4", "enemy_d1", "enemy_d2", "enemy_d3", "enemy_d4", "enemy_d5",
                 "enemy_ranged", "own_ranged", "melee_d2", "ranged_in_range", "enemy_cd_ready", "enemy_busy", "own_cd0_ready",
                 "own_cd1_ready", "allies_vis4", "camp_adjacent"]
MOVE_CLASSES = ["stay", "approach", "retreat", "sidestep"]
RECALL_FEATURES = ["bias", "own_hp", "own_hp_lt30", "own_hp_lt40", "own_hp_lt50", "own_hp_lt60", "gems50", "gold100",
                   "gold_ge120", "gold_ge180", "enemy_within8", "enemy_d9", "enemies4", "spawn_d40", "camp_adjacent"]
TARGET_FEATURES = ["hp1000", "hp_frac", "dist", "busy", "gems50", "ranged"]


def split_of(mid):
    h = int(hashlib.md5(mid.encode()).hexdigest(), 16) % 20
    return "test" if h < 2 else ("val" if h == 2 else "train")


def shard_features(path):
    """Features + labels of every turn in one shard (computed exactly as the bot will)."""
    z = np.load(path)
    g, s, lab = z["grid"], z["scal"], z["lab"].astype(np.int64)
    n = len(g)
    en = g[:, 7] > 0
    al = (g[:, 6] > 0) & (CHEB > 0)[None]
    flat = np.where(en, CHEB[None], 99).reshape(n, -1)
    ni, ned = flat.argmin(1), flat.min(1)
    has = ned < 99
    ey, ex = ni // 15 - 7, ni % 15 - 7
    r = np.arange(n)
    gy, gx = ey + 7, ex + 7
    own_hp = s[:, 13]
    enemy_hp = np.where(has, g[r, 7, gy, gx] / 255, 1.0)
    e4 = (en & (CHEB <= 4)[None]).sum((1, 2))
    a4 = (al & (CHEB <= 4)[None]).sum((1, 2))
    pw = own_hp + np.where(al & (CHEB <= 4)[None], g[:, 6] / 255, 0).sum((1, 2)) - np.where(en & (CHEB <= 4)[None], g[:, 7] / 255, 0).sum((1, 2))
    camp_adj = ((g[:, 12] > 0) & (g[:, 13] == 255) & (CHEB <= 1)[None]).any((1, 2)).astype(np.float32)
    d = np.where(has, ned, 99)
    gems50 = s[:, 19] * 100 / 50
    own_ranged = s[:, 17] * 3 > 1.5
    move_x = np.stack([np.ones(n), own_hp, own_hp < 0.25, own_hp < 0.4, own_hp < 0.6, enemy_hp, enemy_hp < 0.2, enemy_hp < 0.3,
                       enemy_hp < 0.5, gems50, a4 + 1 - e4, pw, d == 1, d == 2, d == 3, d == 4, np.minimum(d, 5) / 5,
                       np.where(has, g[r, 10, gy, gx] == 255, False), own_ranged, ~own_ranged & (d == 2), own_ranged & (d <= 3),
                       np.where(has, (g[r, 20, gy, gx] == 255) | (g[r, 21, gy, gx] == 255), False),
                       np.where(has, g[r, 22, gy, gx] > 0, False), s[:, 20] == 0, s[:, 21] == 0, s[:, 42] * 5 / 4, camp_adj], 1).astype(np.float32)
    gold = s[:, 18] * 100
    rec_x = np.stack([np.ones(n), own_hp, own_hp < 0.3, own_hp < 0.4, own_hp < 0.5, own_hp < 0.6, gems50, np.minimum(gold, 500) / 100,
                      gold >= 120, gold >= 180, d <= 8, np.minimum(d, 9) / 9, e4, s[:, 35] * 40 / 40, camp_adj], 1).astype(np.float32)
    # move class of Fish's actual move relative to the nearest enemy
    m = lab[:, 0]
    d0 = np.maximum(abs(ex), abs(ey))
    d1 = np.maximum(abs(ex - MDX[m]), abs(ey - MDY[m]))
    mcls = np.where(m == 4, 0, np.where(d1 < d0, 1, np.where(d1 > d0, 2, 3)))
    fight = has & (d <= 5)
    # weight undoing the dataset's 25% sampling of calm walking turns (build_dataset.py --keep-rest 0.25)
    interesting = (s[:, 44] * 20 <= 8) | (s[:, 45] * 20 <= 6) | (lab[:, 1] != 225) | (lab[:, 2] > 0) | (lab[:, 4] != 225) | (lab[:, 5] > 0)
    w = np.where(interesting, 1.0, 4.0).astype(np.float32)
    keep = (s[:, 32] < 0.5) & (own_hp > 0.001)  # recall: alive and off the own spawn
    return {"move_x": move_x[fight], "move_y": mcls[fight], "rec_x": rec_x[keep], "rec_y": (lab[keep, 5] == 1), "rec_w": w[keep]}


def target_game(path):
    """(candidate feature matrix, chosen index) for every Fish attack on an enemy champion with 2+ champions in range."""
    out = []
    with gzip.open(path, "rt") as fh:
        lines = fh.read().split("\n")[1:]
    for line in lines:
        if not line:
            continue
        rnd, cid, ctype, rep, obs = line.split("\t")
        acts = [a for a in rep.split(";") if a]
        att = [a for a in acts if a.startswith("attack ")]
        if not att:
            continue
        tx, ty = map(int, att[0][7:].split(","))
        sec = obs.split("|")
        sf = sec[1].split(",")
        x, y, rng = int(sf[2]), int(sf[3]), max(1, int(sf[8]))
        for a in acts:  # range from where Fish stands when it attacks
            if a.startswith("move "):
                x, y = map(int, a[5:].split(","))
            elif a.startswith("attack "):
                break
        champs = [c.split(",") for c in sec[2].split(";") if c] if len(sec) > 2 else []
        cands, chosen = [], -1
        for c in champs:
            if c[1] != "1":
                continue
            cx, cy = int(float(c[3])), int(float(c[4]))
            dd = max(abs(cx - x), abs(cy - y))
            if dd > rng:
                continue
            hp, mhp = float(c[5]), max(1.0, float(c[6]))
            if (cx, cy) == (tx, ty):
                chosen = len(cands)
            cands.append([hp / 1000, hp / mhp, dd, float(int(c[9]) & 6 != 0), float(c[10]) / 50, float(int(c[2]) in RANGED)])
        if chosen >= 0 and len(cands) >= 2:
            out.append((np.array(cands, np.float32), chosen))
    return out


def draft_game(path):
    types = {}
    with gzip.open(path, "rt") as fh:
        for i, line in enumerate(fh):
            if i == 0 or not line.strip():
                continue
            p = line.split("\t", 3)
            types[p[1]] = p[2]
            if i > 4000:
                break
    kinds = set(types.values())
    picks = len(types) - (1 if {"Cassi", "Issac"} <= kinds else 0)  # Cassi & Issac: two bodies, one draft selection
    return sorted(kinds), picks


def fit_conditional_logit(data, iters=2000, lr=0.5, l2=1e-3):
    """Softmax over each decision's candidates, all decisions at once (padded to the largest candidate set)."""
    k, kmax = data[0][0].shape[1], max(len(X) for X, _ in data)
    Xp = np.zeros((len(data), kmax, k), np.float64)
    mask = np.zeros((len(data), kmax), bool)
    ch = np.array([c for _, c in data])
    for i, (X, _) in enumerate(data):
        Xp[i, :len(X)] = X
        mask[i, :len(X)] = True
    wt = np.zeros(k)
    for it in range(iters):
        u = np.where(mask, Xp @ wt, -np.inf)
        u -= u.max(1, keepdims=True)
        p = np.exp(u)
        p /= p.sum(1, keepdims=True)
        grad = (Xp[np.arange(len(data)), ch] - (p[:, :, None] * Xp).sum(1)).mean(0)
        wt += lr * (grad - l2 * wt)
    ll = float(np.log(p[np.arange(len(data)), ch] + 1e-12).mean())
    return wt, ll


def choice_acc(data, wt):
    return float(np.mean([int(np.argmax(X @ wt) == c) for X, c in data]))


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--data-dir", required=True)
    ap.add_argument("--obs-dir", required=True)
    ap.add_argument("--matches", required=True)
    ap.add_argument("--out-dir", required=True)
    ap.add_argument("--shards", type=int, default=80)
    ap.add_argument("--test-shards", type=int, default=12)
    ap.add_argument("--target-games", type=int, default=6000)
    ap.add_argument("--procs", type=int, default=8)
    a = ap.parse_args()
    from sklearn.linear_model import LogisticRegression
    rng = np.random.default_rng(0)
    train_files = sorted(glob.glob(os.path.join(a.data_dir, "train_*.npz")))
    test_files = sorted(glob.glob(os.path.join(a.data_dir, "test_*.npz")))
    train_files = list(rng.choice(train_files, min(a.shards, len(train_files)), replace=False))
    test_files = list(rng.choice(test_files, min(a.test_shards, len(test_files)), replace=False))
    with Pool(a.procs) as pool:
        tr = pool.map(shard_features, train_files)
        te = pool.map(shard_features, test_files)
    cat = lambda parts, k: np.concatenate([p[k] for p in parts])
    res = {"train_shards": len(train_files), "test_shards": len(test_files)}

    # ---- move policy ----
    Xm, ym, Xmt, ymt = cat(tr, "move_x"), cat(tr, "move_y"), cat(te, "move_x"), cat(te, "move_y")
    mv = LogisticRegression(C=1.0, max_iter=500, fit_intercept=False).fit(Xm, ym)
    acc = float((mv.predict(Xmt) == ymt).mean())
    res["move"] = {"features": MOVE_FEATURES, "classes": [MOVE_CLASSES[c] for c in mv.classes_], "coef": mv.coef_.tolist(),
                   "n_train": int(len(ym)), "n_test": int(len(ymt)), "test_accuracy": acc,
                   "test_majority": float(np.bincount(ymt).max() / len(ymt)),
                   "test_class_share": (np.bincount(ymt, minlength=4) / len(ymt)).tolist()}
    print(f"move policy: {len(ym)} fight turns, test accuracy {acc:.3f} (majority {res['move']['test_majority']:.3f})", flush=True)

    # ---- recall policy ----
    Xr, yr, wr = cat(tr, "rec_x"), cat(tr, "rec_y"), cat(tr, "rec_w")
    Xrt, yrt, wrt = cat(te, "rec_x"), cat(te, "rec_y"), cat(te, "rec_w")
    rc = LogisticRegression(C=1.0, max_iter=500, fit_intercept=False).fit(Xr, yr, sample_weight=wr)
    pt = rc.predict_proba(Xrt)[:, 1]
    rate = float((wrt * yrt).sum() / wrt.sum())
    order = np.argsort(-pt)
    cw = np.cumsum(wrt[order])
    thr = float(pt[order][np.searchsorted(cw, rate * wrt.sum())])
    pred = pt >= thr
    prec = float((wrt * (pred & yrt)).sum() / max(1e-9, (wrt * pred).sum()))
    recl = float((wrt * (pred & yrt)).sum() / max(1e-9, (wrt * yrt).sum()))
    calib = {}
    for name, col, bins in (("own_hp", 1, [0, .2, .3, .4, .5, .6, .8, 1.01]), ("gold", 7, [0, .6, 1.2, 1.8, 3.0, 5.01])):
        for lo, hi in zip(bins[:-1], bins[1:]):
            m = (Xrt[:, col] >= lo) & (Xrt[:, col] < hi)
            if wrt[m].sum() > 0:
                calib[f"{name} {lo:g}-{hi:g}"] = {"fish": float((wrt[m] * yrt[m]).sum() / wrt[m].sum()), "model": float((wrt[m] * pt[m]).sum() / wrt[m].sum())}
    res["recall"] = {"features": RECALL_FEATURES, "coef": rc.coef_[0].tolist(), "threshold": thr, "fish_rate": rate,
                     "model_mean_rate": float((wrt * pt).sum() / wrt.sum()), "test_precision_at_rate_threshold": prec,
                     "test_recall_at_rate_threshold": recl, "calibration": calib}
    for k2, v2 in calib.items():
        print(f"  recall rate {k2:16s} Fish {v2['fish']:.4f}  model {v2['model']:.4f}", flush=True)
    print(f"recall policy: Fish recalls on {rate:.4f} of turns; threshold {thr:.3f} -> precision {prec:.2f}, recall {recl:.2f}", flush=True)

    # ---- target choice ----
    obs = sorted(f for f in os.listdir(a.obs_dir) if f.endswith(".tsv.gz"))
    tr_games = [os.path.join(a.obs_dir, f) for f in obs if split_of(f[:-7]) == "train"]
    te_games = [os.path.join(a.obs_dir, f) for f in obs if split_of(f[:-7]) == "test"]
    tr_games = list(rng.choice(tr_games, min(a.target_games, len(tr_games)), replace=False))
    te_games = list(rng.choice(te_games, min(a.target_games // 4, len(te_games)), replace=False))
    with Pool(a.procs) as pool:
        tdata = [x for part in pool.map(target_game, tr_games, chunksize=16) for x in part]
        tdata_te = [x for part in pool.map(target_game, te_games, chunksize=16) for x in part]
        drafts = pool.map(draft_game, tr_games, chunksize=16)
    wt, ll = fit_conditional_logit(tdata)
    res["target"] = {"features": TARGET_FEATURES, "coef": wt.tolist(), "n_train": len(tdata), "n_test": len(tdata_te),
                     "test_accuracy": choice_acc(tdata_te, wt),
                     "lowest_hp_rule_test_accuracy": float(np.mean([int(np.argmin(X[:, 0]) == c) for X, c in tdata_te])),
                     "random_baseline": float(np.mean([1 / len(X) for X, _ in tdata_te]))}
    print(f"target policy: {len(tdata)} choices, test accuracy {res['target']['test_accuracy']:.3f} "
          f"(lowest-HP rule {res['target']['lowest_hp_rule_test_accuracy']:.3f}, random {res['target']['random_baseline']:.3f})", flush=True)

    # ---- draft ----
    by_size = defaultdict(Counter)
    games_by_size = Counter()
    for types, size in drafts:
        if size < 3 or size > 5:
            continue
        games_by_size[size] += 1
        for t in types:
            by_size[size][t] += 1
    res["draft"] = {str(sz): {"games": games_by_size[sz], "pick_rate": {t: c / games_by_size[sz] for t, c in cnt.most_common()}} for sz, cnt in sorted(by_size.items())}
    for sz, d in res["draft"].items():
        print(f"draft {sz}-pick ({d['games']} games): " + ", ".join(f"{t} {v:.2f}" for t, v in list(d["pick_rate"].items())[:7]), flush=True)

    os.makedirs(a.out_dir, exist_ok=True)
    json.dump(res, open(os.path.join(a.out_dir, "fish_meta.json"), "w"), indent=1)

    # ---- C++ header ----
    def arr(v):
        return "{" + ", ".join(f"{x:.6g}f" for x in v) + "}"
    cls = res["move"]["classes"]
    hdr = ["#pragma once",
           "// GENERATED by analysis/fish_bc/fit_meta.py from Intercontinental Fish's train games - do not edit by hand.",
           f"// move policy: {res['move']['n_train']} fight turns, test accuracy {acc:.3f} (majority {res['move']['test_majority']:.3f})",
           f"// recall policy: per-turn hazard P(recall) (Fish rate {rate:.4f}, model mean {res['recall']['model_mean_rate']:.4f}); calibration in fish_meta.json",
           f"// target policy: {res['target']['n_train']} choices, test accuracy {res['target']['test_accuracy']:.3f}",
           "namespace fishmeta {",
           f"constexpr int MOVE_NF = {len(MOVE_FEATURES)};  // " + ", ".join(MOVE_FEATURES),
           f"constexpr int MOVE_NC = {len(cls)};  // " + ", ".join(cls)]
    hdr.append(f"constexpr int MOVE_CLASS[MOVE_NC] = {{{', '.join(str(MOVE_CLASSES.index(c)) for c in cls)}}};  // 0 stay 1 approach 2 retreat 3 sidestep")
    hdr.append("constexpr float MOVE_W[MOVE_NC][MOVE_NF] = {" + ", ".join(arr(r) for r in res["move"]["coef"]) + "};")
    hdr.append(f"constexpr int RECALL_NF = {len(RECALL_FEATURES)};  // " + ", ".join(RECALL_FEATURES))
    hdr.append("constexpr float RECALL_W[RECALL_NF] = " + arr(res["recall"]["coef"]) + ";")
    hdr.append(f"constexpr float RECALL_THRESHOLD = {thr:.6g}f;")
    hdr.append(f"constexpr int TARGET_NF = {len(TARGET_FEATURES)};  // " + ", ".join(TARGET_FEATURES))
    hdr.append("constexpr float TARGET_W[TARGET_NF] = " + arr(res["target"]["coef"]) + ";")
    for sz in ("3", "4", "5"):
        d = res["draft"].get(sz)
        order = [t for t in (d["pick_rate"] if d else {})]
        hdr.append(f"constexpr int DRAFT{sz}_N = {len(order)};  // Fish pick rates: " + ", ".join(f"{t} {d['pick_rate'][t]:.2f}" for t in order))
        hdr.append(f"constexpr int DRAFT{sz}[{max(1, len(order))}] = {{{', '.join(str(TYPES.index(t)) for t in order) or '0'}}};")
    hdr.append("}  // namespace fishmeta")
    open(os.path.join(a.out_dir, "fish_meta_params.h"), "w").write("\n".join(hdr) + "\n")
    print("->", os.path.join(a.out_dir, "fish_meta_params.h"))
