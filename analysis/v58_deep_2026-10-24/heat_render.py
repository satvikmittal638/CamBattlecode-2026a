"""Render heatmaps from heat_extract.mjs data.
Cross-map: where we stand / die relative to the two spawns (0 = our spawn, 1 = enemy spawn) and when we die,
heavy losses vs wins. Per map (maps with a heavy loss): our occupancy, our HP lost to champions (+ deaths) and
camps, enemy occupancy; heavy-loss games in one row, wins on that map in a second row when present."""
import json, sys, glob, os
from collections import defaultdict
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
games = [json.load(open(f)) for f in sorted(glob.glob(os.path.join(src, "*.json")))]

# ---- cross-map summary
fig, ax = plt.subplots(1, 3, figsize=(15, 4.2))
for cls, col in (("win", "#2b8a3e"), ("heavy", "#c92a2a"), ("loss", "#e67700")):
    G = [g for g in games if g["cls"] == cls]
    rel = np.concatenate([np.array(g["rel"]) for g in G]) if G else np.array([])
    dr = np.array([d[3] for g in G for d in g["deaths"]])
    dt = np.array([d[2] for g in G for d in g["deaths"]])
    lab = f"{cls} ({len(G)} games)"
    ax[0].hist(rel, bins=20, range=(0, 1), density=True, histtype="step", lw=2, color=col, label=lab)
    ax[1].hist(dr, bins=20, range=(0, 1), weights=np.full(len(dr), 1 / max(1, len(G))), histtype="step", lw=2, color=col, label=lab)
    ax[2].hist(dt, bins=20, range=(0, 2000), weights=np.full(len(dt), 1 / max(1, len(G))), histtype="step", lw=2, color=col, label=lab)
ax[0].set_title("Where our champions stand (density)"); ax[0].set_xlabel("0 = our spawn ... 1 = enemy spawn")
ax[1].set_title("Where our champions die (deaths per game)"); ax[1].set_xlabel("0 = our spawn ... 1 = enemy spawn")
ax[2].set_title("When our champions die (deaths per game)"); ax[2].set_xlabel("round")
for a in ax: a.legend(fontsize=8)
fig.suptitle("v58 normal maps: heavy losses (lost by 500+) vs wins")
fig.tight_layout(); fig.savefig(os.path.join(out, "cross_map_positions.png"), dpi=110); plt.close(fig)

# ---- per map
terr_cmap = ListedColormap(["#ffffff", "#343a40", "#adb5bd", "#b2f2bb", "#ffd43b"])
by_map = defaultdict(list)
for g in games: by_map[g["map"]].append(g)
def panel(a, g0, arr, title, cmap, deaths=None):
    W, H = g0["W"], g0["H"]
    t = np.array(g0["terr"]).reshape(H, W)
    a.imshow(t, cmap=terr_cmap, vmin=0, vmax=4, interpolation="nearest")
    m = np.ma.masked_where(arr <= 0, np.log1p(arr))
    a.imshow(m, cmap=cmap, alpha=0.75, interpolation="nearest")
    for key, c in (("spawnUs", "#1c7ed6"), ("spawnThem", "#e03131")):
        r = g0[key]; a.add_patch(plt.Rectangle((r["minX"] - .5, r["minY"] - .5), r["maxX"] - r["minX"] + 1, r["maxY"] - r["minY"] + 1, fill=False, ec=c, lw=1.5))
    if deaths:
        xs, ys = zip(*[(d[0], d[1]) for d in deaths]); a.scatter(xs, ys, marker="x", s=14, c="#000000", lw=0.8)
    a.set_title(title, fontsize=8); a.set_xticks([]); a.set_yticks([])
n = 0
for mp, G in sorted(by_map.items()):
    heavy = [g for g in G if g["cls"] == "heavy"]
    if not heavy: continue
    wins = [g for g in G if g["cls"] == "win"]
    rows = [("heavy losses", heavy)] + ([("wins", wins)] if wins else [])
    fig, ax = plt.subplots(len(rows), 4, figsize=(16, 4.2 * len(rows)), squeeze=False)
    for r, (lab, S) in enumerate(rows):
        g0 = S[0]; sh = (g0["H"], g0["W"])
        occ = sum(np.array(g["occ"]).reshape(sh) for g in S); eocc = sum(np.array(g["eocc"]).reshape(sh) for g in S)
        dC = sum(np.array(g["dmgC"]).reshape(sh) for g in S); dK = sum(np.array(g["dmgK"]).reshape(sh) for g in S)
        deaths = [d for g in S for d in g["deaths"]]
        scores = ", ".join(f"{g['score'][0]}-{g['score'][1]} vs {g['opp']}" for g in S)[:120]
        panel(ax[r][0], g0, occ, f"{lab} ({len(S)}): our occupancy\n{scores}", "Blues")
        panel(ax[r][1], g0, dC, f"HP lost to enemy champions; x = our deaths ({len(deaths)})", "Reds", deaths)
        panel(ax[r][2], g0, dK, "HP lost to camps", "Oranges")
        panel(ax[r][3], g0, eocc, "enemy occupancy", "Purples")
    fig.suptitle(f"v58 on {mp} (blue box = our spawn, red box = enemy spawn; terrain: wall dark, hole grey, bush green, altar yellow)", fontsize=10)
    fig.tight_layout(); fig.savefig(os.path.join(out, f"map_{mp}.png"), dpi=95); plt.close(fig); n += 1
print("figures:", n + 1)
