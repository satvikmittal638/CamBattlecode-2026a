"""Charts for interpret.py results (small JSON copied from the cluster).
    ../../.venv-analysis/bin/python render_interpret.py interpret/<tag>.json  ->  interpret/<tag>_probes.png
"""
import json
import sys

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

SURFACE, INK, INK2, GRID = "#fcfcfb", "#0b0b0b", "#52514e", "#e4e3df"
BLUE, ORANGE, AQUA = "#2a78d6", "#eb6834", "#1baf7a"
ORANGE_DARK, ORANGE_LIGHT = "#a8431b", "#f4a582"  # same hue, ordered groups (outnumbered darkest)

r = json.load(open(sys.argv[1]))
p = r["probes"]
plt.rcParams.update({"font.size": 10, "text.color": INK, "axes.labelcolor": INK2, "xtick.color": INK2, "ytick.color": INK2,
                     "axes.edgecolor": GRID, "figure.facecolor": SURFACE, "axes.facecolor": SURFACE})
fig, axes = plt.subplots(2, 2, figsize=(11, 8))


def panel(ax, xs, series, title, xlabel):
    for label, ys, color in series:
        ax.plot(xs, ys, color=color, lw=2, marker="o", ms=4)
        ax.annotate(label, (xs[-1], ys[-1]), xytext=(6, 0), textcoords="offset points", va="center", color=INK2, fontsize=9)
    ax.set_title(title, loc="left", fontsize=11, color=INK)
    ax.set_xlabel(xlabel)
    ax.grid(True, color=GRID, lw=0.8)
    ax.spines[["top", "right"]].set_visible(False)
    ax.set_xlim(min(xs), max(xs) + (max(xs) - min(xs)) * 0.28)
    ax.set_xticks([t for t in ax.get_xticks() if min(xs) <= t <= max(xs)])
    ax.set_ylim(0, None)


hp = sorted(p["own_hp"], key=float)
x = [float(v) * 100 for v in hp]
panel(axes[0, 0], x, [("outnumbered", [p["own_hp"][v]["outnumbered"]["p_retreat"] for v in hp], ORANGE_DARK),
                      ("even", [p["own_hp"][v]["even"]["p_retreat"] for v in hp], ORANGE),
                      ("outnumbering", [p["own_hp"][v]["outnumbering"]["p_retreat"] for v in hp], ORANGE_LIGHT)],
      "P(retreat) vs own HP, by local numbers", "own HP (% of max)")
eh = sorted(p["enemy_hp"], key=float)
x = [float(v) * 100 for v in eh]
panel(axes[0, 1], x, [("approach", [p["enemy_hp"][v]["all"]["p_approach"] for v in eh], BLUE),
                      ("retreat", [p["enemy_hp"][v]["all"]["p_retreat"] for v in eh], ORANGE),
                      ("attack", [p["enemy_hp"][v]["all"]["p_attack"] for v in eh], AQUA)],
      "Nearest enemy's HP: weak enemies get chased", "nearest enemy HP (% of max)")
gm = sorted(p["gems"], key=float)
x = [float(v) for v in gm]
panel(axes[1, 0], x, [("approach", [p["gems"][v]["all"]["p_approach"] for v in gm], BLUE),
                      ("retreat", [p["gems"][v]["all"]["p_retreat"] for v in gm], ORANGE)],
      "Carrying gems makes Fish cautious", "gems carried")
x = [float(v) * 100 for v in hp]
panel(axes[1, 1], x, [("recall", [p["own_hp"][v]["all"]["p_recall"] for v in hp], ORANGE)],
      "P(recall) in a fight vs own HP", "own HP (% of max)")
fig.suptitle(f"Fish clone, counterfactual probes on {p['group_sizes']['all']:,} held-out fight turns (enemy within 5 tiles); "
             "one input changed, all else as it was", x=0.01, ha="left", fontsize=10, color=INK2)
fig.tight_layout(rect=(0, 0, 1, 0.96))
out = sys.argv[1].replace(".json", "_probes.png")
fig.savefig(out, dpi=140)
print("->", out)
