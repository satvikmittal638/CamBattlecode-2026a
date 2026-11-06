"""Breakpoints of the Rank-1 (Intercontinental Fish) farming -> aggression switch.

    .venv-analysis/bin/python tools/rank1_threat_analysis.py [analysis/rank1_threat/rank1_threat_data.csv]

Input: rows written by tools/replay_scraper_run.mjs (one per Vendetta / Cassi / Issac turn with one of our champions in
that champion's personal vision; action = Rank-1's recorded action for that turn).

Three outcome definitions (all 1 = AGGRESSION, 0 = FARMING; other actions dropped):
  broad    the user's classification: hits on champions / camps, or a move closer to our nearest champion / the nearest
           camp (moves are ambiguous when both get closer or no camp is visible),
  strict   only turns with an actual attack or spell, on a champion vs on a camp,
  abandon  the champion was FARMING on its previous turn (same game, round - 1): does it switch to AGGRESSION now?
Writes plots and breakpoints.json next to the CSV and prints the thresholds.
"""
import json
import os
import sys

os.environ.setdefault("MPLCONFIGDIR", os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "analysis", "rank1_threat", ".mpl"))
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from scipy.optimize import minimize

CSV = sys.argv[1] if len(sys.argv) > 1 else "analysis/rank1_threat/rank1_threat_data.csv"
OUT = os.path.dirname(os.path.abspath(CSV))
CHAMPS = ["Vendetta", "Cassi", "Issac"]
MAXD = 12

d = pd.read_csv(CSV)
d = d[d.champion_name.isin(CHAMPS)].copy()
d["hit"] = d.recorded_actions.fillna("").str.contains(r"\b(?:attack|cast\d)\b", regex=True)
d["hp_band"] = np.where(d.enemy_health_pct > 0.5, "target HP > 50%", "target HP <= 50%")
d = d.sort_values(["game", "champion_name", "round_number"])
prev = d.groupby(["game", "champion_name"])[["round_number", "action"]].shift(1)
d["prev_farming"] = (prev.round_number == d.round_number - 1) & (prev.action == "FARMING")

fa = d[d.action.isin(["FARMING", "AGGRESSION"])].copy()
fa["y"] = (fa.action == "AGGRESSION").astype(int)
sets = {
    "broad": fa,
    "strict": fa[fa.hit],
    "abandon": fa[fa.prev_farming],
}


def logit_fit(x, y):
    """Logistic regression p = 1 / (1 + exp(-(a + b x))) by maximum likelihood; returns (a, b)."""
    X = np.column_stack([np.ones_like(x, dtype=float), x.astype(float)])
    def nll(w):
        z = X @ w
        return np.sum(np.logaddexp(0, z) - y * z)
    def grad(w):
        p = 1 / (1 + np.exp(-(X @ w)))
        return X.T @ (p - y)
    r = minimize(nll, np.zeros(2), jac=grad, method="BFGS")
    return r.x


def wilson(k, n, z=1.96):
    if n == 0:
        return (np.nan, np.nan)
    p = k / n
    den = 1 + z * z / n
    c = (p + z * z / (2 * n)) / den
    h = z * np.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / den
    return c - h, c + h


summary = {}
lines = []
for name, s in sets.items():
    summary[name] = {}
    fig, axes = plt.subplots(2, 3, figsize=(15, 8.5), sharex=True, sharey=True)
    for j, ch in enumerate(CHAMPS):
        for i, band in enumerate(["target HP > 50%", "target HP <= 50%"]):
            g = s[(s.champion_name == ch) & (s.hp_band == band) & (s.dist_to_enemy <= MAXD)]
            ax = axes[i][j]
            key = f"{ch} | {band}"
            if len(g) < 30:
                ax.set_title(f"{ch}, {band} (n={len(g)})", fontsize=9)
                continue
            a, b = logit_fit(g.dist_to_enemy.values, g.y.values)
            d50 = -a / b if b != 0 else np.nan
            d95 = (np.log(0.95 / 0.05) - a) / b if b != 0 else np.nan
            emp = g.groupby("dist_to_enemy").y.agg(["sum", "count"]).reset_index()
            emp["p"] = emp["sum"] / emp["count"]
            ci = [wilson(k, n) for k, n in zip(emp["sum"], emp["count"])]
            emp["lo"] = [c[0] for c in ci]
            emp["hi"] = [c[1] for c in ci]
            # Largest d such that P(aggression | dist <= d) >= 0.95 (cumulative, n >= 30).
            cum = g.sort_values("dist_to_enemy")
            best95 = None
            for dd in range(1, MAXD + 1):
                sub = g[g.dist_to_enemy <= dd]
                if len(sub) >= 30 and sub.y.mean() >= 0.95:
                    best95 = dd
            summary[name][key] = {"n": int(len(g)), "logit_a": float(a), "logit_b": float(b), "d50": float(d50), "d95_logit": float(d95),
                                  "max_d_with_cum_p95": best95, "p_by_dist": {int(r.dist_to_enemy): [round(float(r.p), 3), int(r["count"])] for _, r in emp.iterrows()}}
            sub = g.sample(min(len(g), 3000), random_state=0)
            ax.scatter(sub.dist_to_enemy + np.random.default_rng(0).uniform(-0.25, 0.25, len(sub)), sub.y + np.random.default_rng(1).uniform(-0.04, 0.04, len(sub)),
                       s=3, alpha=0.08, color="#888")
            # Wilson intervals are not centred on p; clip so the bars stay non-negative at p = 0 or 1.
            ax.errorbar(emp.dist_to_enemy, emp.p, yerr=[(emp.p - emp.lo).clip(lower=0), (emp.hi - emp.p).clip(lower=0)], fmt="o", color="#1f77b4", ms=4, capsize=2, label="observed P(aggression)")
            xs = np.linspace(1, MAXD, 200)
            ax.plot(xs, 1 / (1 + np.exp(-(a + b * xs))), color="#d62728", lw=2, label="logistic fit")
            if np.isfinite(d50) and 1 <= d50 <= MAXD:
                ax.axvline(d50, color="#d62728", ls=":", lw=1)
            ax.set_title(f"{ch}, {band} (n={len(g)}; d50={d50:.1f})", fontsize=9)
            ax.set_ylim(-0.08, 1.08)
            if i == 1:
                ax.set_xlabel("dist_to_enemy (Chebyshev)")
            if j == 0:
                ax.set_ylabel("action (0 farming, 1 aggression)")
    axes[0][0].legend(loc="lower left", fontsize=7)
    fig.suptitle(f"Intercontinental Fish: farming -> aggression vs distance to our nearest champion ({name} definition)", fontsize=11)
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, f"rank1_aggression_{name}.png"), dpi=90)
    plt.close(fig)

# Rule search: P(aggression | dist <= D and target HP <= H) >= 0.95, per champion, for the strict and abandon definitions.
rules = {}
for name in ["strict", "abandon", "broad"]:
    s = sets[name]
    rules[name] = {}
    for ch in CHAMPS:
        g = s[s.champion_name == ch]
        best = []
        for D in range(1, 9):
            for H in [0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1.0]:
                sub = g[(g.dist_to_enemy <= D) & (g.enemy_health_pct <= H)]
                if len(sub) >= 50:
                    best.append((D, H, float(sub.y.mean()), int(len(sub))))
        hi = [r for r in best if r[2] >= 0.95]
        hi.sort(key=lambda r: (-r[0], -r[1]))  # widest distance first, then widest HP
        rules[name][ch] = {"rules_ge_95": hi[:5], "grid": best}

# Multivariate logistic (strict): distance, target HP, own HP, carried gems, visible enemies.
def multi_fit(g):
    cols = ["dist_to_enemy", "enemy_health_pct", "own_health_pct", "carried_gems", "visible_enemies"]
    X = g[cols].astype(float).values
    mu, sd = X.mean(0), X.std(0) + 1e-9
    Z = np.column_stack([np.ones(len(X)), (X - mu) / sd])
    y = g.y.values
    def nll(w):
        z = Z @ w
        return np.sum(np.logaddexp(0, z) - y * z)
    def grad(w):
        p = 1 / (1 + np.exp(-(Z @ w)))
        return Z.T @ (p - y)
    w = minimize(nll, np.zeros(Z.shape[1]), jac=grad, method="BFGS").x
    return {c: round(float(w[k + 1] / sd[k]), 4) for k, c in enumerate(cols)} | {"intercept": round(float(w[0] - np.sum(w[1:] * mu / sd)), 4)}

multi = {ch: multi_fit(sets["strict"][sets["strict"].champion_name == ch]) for ch in CHAMPS}

json.dump({"summary": summary, "rules": rules, "multivariate_strict": multi, "rows": int(len(d)), "games": int(d.game.nunique())},
          open(os.path.join(OUT, "breakpoints.json"), "w"), indent=1, default=str)

print(f"Rank-1 = Intercontinental Fish. {d.game.nunique()} games, {len(d)} scraped turns ({len(fa)} farming/aggression; strict {len(sets['strict'])}, abandon {len(sets['abandon'])}).\n")
for name, label in [("abandon", "ABANDON FARMING (was farming the previous turn)"), ("strict", "STRICT (attack/spell target: champion vs camp)"), ("broad", "BROAD (user definition incl. moves)")]:
    print(f"== {label}")
    for ch in CHAMPS:
        for band in ["target HP > 50%", "target HP <= 50%"]:
            k = f"{ch} | {band}"
            v = summary[name].get(k)
            if not v:
                continue
            pd_ = v["p_by_dist"]
            row = " ".join(f"d{dd}:{pd_[dd][0]:.2f}" for dd in sorted(pd_)[:8])
            m95 = v["max_d_with_cum_p95"]
            print(f"  {ch:8s} {band:17s} n={v['n']:6d}  P(aggr)=50% at d={v['d50']:.2f}  | {row}" + (f"  | >=95% for all d<={m95}" if m95 else ""))
    for ch in CHAMPS:
        hi = rules[name][ch]["rules_ge_95"]
        if hi:
            D, H, p, n = hi[0]
            print(f"  -> Rank 1 {ch} switches to AGGRESSION {100 * p:.0f}% of the time when dist_to_enemy <= {D} AND enemy_health_pct <= {H:.2f} (n={n})")
        else:
            g = [r for r in rules[name][ch]["grid"]]
            top = max(g, key=lambda r: r[2]) if g else None
            if top:
                print(f"  -> Rank 1 {ch}: no rule reaches 95%; best is {100 * top[2]:.0f}% at dist_to_enemy <= {top[0]} AND enemy_health_pct <= {top[1]:.2f} (n={top[3]})")
    print()
print("Multivariate logistic (strict), log-odds per unit:")
for ch, w in multi.items():
    print(f"  {ch:8s} " + ", ".join(f"{k} {v:+.3f}" for k, v in w.items()))
print(f"\nPlots: {OUT}/rank1_aggression_{{abandon,strict,broad}}.png; numbers: {OUT}/breakpoints.json")
