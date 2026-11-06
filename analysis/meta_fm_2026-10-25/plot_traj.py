"""Side-by-side movement maps of games on the same map/side.

python3 plot_traj.py <traj dir> <out dir> [cell ...]
For each cell (e.g. 00lanes_a) one PNG: a row per game (reference win vs Fish, v84 live, v62 loss ...),
columns = round windows with both teams' trails, plus a score timeline.
Ours: blue/green family, opponent: red/orange family. x = death (colour = victim team), dot = gem capture (size ~ gems).
"""
import json, os, sys, glob
os.environ.setdefault("MPLCONFIGDIR", os.path.join(os.path.dirname(os.path.abspath(__file__)), ".mpl"))
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

src, dst = sys.argv[1], sys.argv[2]
os.makedirs(dst, exist_ok=True)
WINDOWS = [(1, 100), (101, 250), (251, 450)]
ORDER = ["fish_ref", "fish_v84", "fish_v80", "fish_v62", "fish_v76_81", "mite_ref", "mite_v86"]
OURS = ["#1f77b4", "#17becf", "#2ca02c", "#9467bd", "#7f7fff", "#00a0a0"]
THEIRS = ["#d62728", "#ff7f0e", "#e377c2", "#8c564b", "#bcbd22", "#ff4040"]
CAMP_COL = {"Wolf": "#777", "Elk": "#a0522d", "GemCluster": "#00bfff", "GoldCluster": "#ffd700", "Monolith": "#000", "Golem": "#556b2f"}

files = sorted(glob.glob(os.path.join(src, "*.json")))
cells = sys.argv[3:] or sorted({os.path.basename(f).split("__")[1] for f in files})
for cell in cells:
    games = [json.load(open(f)) for f in files if os.path.basename(f).split("__")[1] == cell]
    games.sort(key=lambda g: (ORDER.index(g["set"]) if g["set"] in ORDER else 99, -g["score"] + g["oppScore"]))
    if len(games) < 2:
        continue
    games = games[:5]
    info = games[0]["info"]
    W, H = info["width"], info["height"]
    asp = H / W
    fig, axes = plt.subplots(len(games), len(WINDOWS) + 1, figsize=(4.2 * (len(WINDOWS) + 1), 4.2 * max(asp, 0.45) * len(games) + 0.6), squeeze=False)
    for gi, g in enumerate(games):
        ids = sorted({c[1] for r in g["rounds"] for c in r["c"]})
        teamOf = {c[1]: (c[0], c[2]) for r in g["rounds"] for c in r["c"]}
        col = {}
        ko = kt = 0
        for i in ids:
            t, _ = teamOf[i]
            if t == 0: col[i] = OURS[ko % len(OURS)]; ko += 1
            else: col[i] = THEIRS[kt % len(THEIRS)]; kt += 1
        for wi, (a, b) in enumerate(WINDOWS):
            ax = axes[gi][wi]
            ax.set_xlim(-0.5, W - 0.5); ax.set_ylim(H - 0.5, -0.5); ax.set_aspect("equal"); ax.set_xticks([]); ax.set_yticks([])
            if info["walls"]:
                xs, ys = zip(*info["walls"]); ax.scatter(xs, ys, s=4, c="#bbb", marker="s", linewidths=0)
            if info["holes"]:
                xs, ys = zip(*info["holes"]); ax.scatter(xs, ys, s=4, c="#444", marker="s", linewidths=0)
            for c in g["camps"] or []:
                ax.scatter([c["x"]], [c["y"]], s=10, c=CAMP_COL.get(c["type"], "#999"), marker="s", linewidths=0, alpha=0.8)
            for k, sp in enumerate(info["spawn"]):
                ax.add_patch(plt.Rectangle((sp["minX"] - 0.5, sp["minY"] - 0.5), sp["maxX"] - sp["minX"] + 1, sp["maxY"] - sp["minY"] + 1, fill=False, ec="#1f77b4" if k == 0 else "#d62728", lw=1.2))
            for al in info["altars"]:
                ax.scatter([al[0]], [al[1]], s=40, marker="*", c="purple")
            for i in ids:
                pts = [(c[3], c[4]) for r in g["rounds"] if a <= r["r"] <= b for c in r["c"] if c[1] == i]
                seg = []
                for p in pts + [(-1, -1)]:
                    if p[0] < 0:
                        if len(seg) > 1:
                            xs, ys = zip(*seg); ax.plot(xs, ys, c=col[i], lw=0.9, alpha=0.75)
                        seg = []
                    else:
                        seg.append(p)
            for (r, t, x, y, gems) in g["caps"]:
                if a <= r <= b: ax.scatter([x], [y], s=6 + gems * 1.5, facecolors="none", edgecolors="#1f77b4" if t == 0 else "#d62728", lw=1)
            for (r, t, x, y, bag, typ) in g["deaths"]:
                if a <= r <= b: ax.scatter([x], [y], s=55, marker="x", c="#0050ff" if t == 0 else "#ff0000", lw=2)
            nd = [sum(1 for d in g["deaths"] if a <= d[0] <= b and d[1] == t) for t in (0, 1)]
            if gi == 0: ax.set_title(f"rounds {a}-{b}", fontsize=10)
            ax.text(0.01, 0.99, f"deaths us {nd[0]} / opp {nd[1]}", transform=ax.transAxes, va="top", fontsize=7, bbox=dict(fc="white", alpha=0.7, lw=0))
        ax = axes[gi][-1]
        rr = [r["r"] for r in g["rounds"]]
        for t, c in ((0, "#1f77b4"), (1, "#d62728")):
            tot = [r["bank"][t] + sum(x[5] for x in r["c"] if x[0] == t) for r in g["rounds"]]
            bank = [r["bank"][t] for r in g["rounds"]]
            ax.plot(rr, tot, c=c, lw=1.5); ax.plot(rr, bank, c=c, lw=0.8, ls="--")
        for (r, t, *_rest) in g["deaths"]:
            ax.axvline(r, ymax=0.06, c="#0050ff" if t == 0 else "#ff0000", lw=0.8)
        ax.set_xlim(0, max(rr)); ax.tick_params(labelsize=7)
        ourDraft = [c[2] for c in g["rounds"][0]["c"] if c[0] == 0]
        theirDraft = [c[2] for c in g["rounds"][0]["c"] if c[0] == 1]
        ax.set_title(f"gems (solid=bank+bag, dashed=bank)", fontsize=8)
        axes[gi][0].set_ylabel(f"{g['set']} {g['result']} {g['score']}-{g['oppScore']}\n" + ",".join(ourDraft) + f"\nvs " + ",".join(theirDraft), fontsize=7)
    fig.suptitle(f"{cell}: blue = our side (top rows: reference winners), red = Fish", fontsize=11)
    fig.tight_layout()
    out = os.path.join(dst, f"{cell}.png")
    fig.savefig(out, dpi=80)
    plt.close(fig)
    print(out)
