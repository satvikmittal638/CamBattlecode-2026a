"""Reproduce final platform and behavior charts from frozen evaluation artifacts."""
from pathlib import Path
import json
import os

p = Path(__file__).parent
os.environ.setdefault('MPLCONFIGDIR', str(p / 'mplconfig'))
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

old = p.parent / 'teammate_eval_2026-10-22'
new_results = json.loads((p / 'platform_results.json').read_text())['summary']
# Previous verified 100-challenge tally; also recorded in its REPORT.md.
old_results = {'near': (25, 121), 'half': (8, 86), 'all': (33, 207)}
colors = ['#767676', '#0072B2']
plt.rcParams.update({'font.size': 11, 'axes.spines.top': False, 'axes.spines.right': False})
fig, axes = plt.subplots(1, 2, figsize=(12, 5.5))
x = np.arange(3)
for ax, field, title in zip(axes, ['challengeWins', 'wins'], ['Five-game challenge wins', 'Individual game wins']):
    for i, (version, color) in enumerate(zip(['v54', 'v55'], colors)):
        nums = [old_results[k][field == 'wins'] if i == 0 else new_results[k][field] for k in ['near', 'half', 'all']]
        den = [50, 50, 100] if field == 'challengeWins' else [250, 250, 500]
        rates = [100 * a / b for a, b in zip(nums, den)]
        bars = ax.bar(x + (i - .5) * .36, rates, .36, color=color, label=version)
        ax.bar_label(bars, labels=[f'{a}/{b}\n{r:.1f}%' for a, b, r in zip(nums, den, rates)], fontsize=9, padding=4)
    ax.set_xticks(x, ['Nearby cohort', 'Rank/2 cohort*', 'Total'])
    ax.set_ylim(0, 72)
    ax.set_ylabel('Win rate (%)')
    ax.set_title(title, loc='left')
    ax.set_axisbelow(True)
    ax.grid(axis='y', alpha=.2)
axes[0].legend(frameon=False)
fig.suptitle('v55 platform test: modest nearby results, large gap against the rank/2 cohort', x=.07, ha='left', fontsize=14)
fig.text(.07, .035, '*Opponent cohorts changed and rank bands widened; this is a descriptive comparison, not a controlled test.', fontsize=10)
fig.subplots_adjust(left=.07, right=.98, bottom=.17, top=.83, wspace=.25)
for ext in ['png', 'svg']:
    fig.savefig(p / f'evaluation_results.{ext}', dpi=160)
plt.close(fig)

audits = [json.loads((q / 'mechanics_audit.json').read_text())['summary'] for q in [old, p]]
fig, axes = plt.subplots(2, 2, figsize=(11, 7))
metrics = [
    ('Heart shield casts below 35% HP', 'heartLowShieldCasts', 'Casts', False),
    ('Ready shield unused during dangerous recovery moves', 'heartLowShieldUnused', 'Qualifying movements', False),
    ('Low-HP walk-then-dashes that close enemy distance', None, 'Share of audited dashes (%)', True),
    ('Own basic attack immediately kills its attacker', 'selfKilledByBasic', 'Events', False),
]
for ax, (title, key, ylabel, rate) in zip(axes.flat, metrics):
    values = [100 * a['lowDashesReducedEnemySeparation'] / a['lowDashesAfterWalking'] if rate else a[key] for a in audits]
    bars = ax.bar(['v54', 'v55'], values, color=colors, width=.55)
    labels = [f'{v:.1f}%' if rate else f'{v:,}' for v in values]
    if rate:
        labels = [f'{label}\n({a["lowDashesReducedEnemySeparation"]}/{a["lowDashesAfterWalking"]})' for label, a in zip(labels, audits)]
    ax.bar_label(bars, labels=labels, padding=4, fontsize=10)
    ax.set_ylim(0, max(values) * 1.38)
    ax.set_title(title, loc='left', fontsize=11, wrap=True)
    ax.set_ylabel(ylabel)
    ax.set_axisbelow(True)
    ax.grid(axis='y', alpha=.2)
fig.suptitle('The recovery fixes changed the intended behavior', x=.08, ha='left', fontsize=15)
fig.text(.08, .035, '500 replays per version, different opponents. Event counts do not measure preventable deaths or prove a win-rate gain.\nShield eligibility uses personal vision; dash distance uses enemies visible immediately before the dash.', fontsize=10)
fig.subplots_adjust(left=.08, right=.98, bottom=.16, top=.87, hspace=.5, wspace=.27)
for ext in ['png', 'svg']:
    fig.savefig(p / f'mechanics_results.{ext}', dpi=160)
print('Created evaluation_results and mechanics_results (PNG/SVG).')
