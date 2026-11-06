#!/usr/bin/env python3
"""Paired local check for the autoresearch loop.

Plays the candidate bot against the fixed local plan (map x opponent, both sides) and compares every game with
the frozen baseline's result on the identical game (local matches are deterministic). Baseline results are
computed once and cached.

  python3 autoresearch/local_check.py baseline            # build + play the baseline arm (cached)
  python3 autoresearch/local_check.py candidate [label]   # play the candidate arm, print paired metric

Last stdout line: "METRIC: <paired net wins>" (candidate wins - candidate losses on games where arms differ).
Guard line: "GUARD: pass|fail <reasons>" (bot faults, fuel exhaustion, strong-map net below -1).
"""
import json, os, subprocess, sys, time
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WS = os.path.join(ROOT, 'workspace')
CLI = os.path.join(ROOT, '.venv', 'bin', 'cambc')
PLAN = os.path.join(ROOT, 'autoresearch', os.environ.get('AR_PLAN', 'local_plan_with_v114.json'))
RUNS = os.path.join(ROOT, 'autoresearch', os.environ.get('AR_RUNS', 'local_runs'))
BASE_BOT, CAND_BOT = os.environ.get('AR_BASE_BOT','arbase-v121'), os.environ.get('AR_CAND_BOT','ar-v121')
JOBS = 7


def games(plan):
    out = []
    for e in plan['pairs']:
        for side in ('a', 'b'):
            out.append({'map': e['map'], 'opp': e['opp'], 'side': side, 'cls': e['cls']})
    return out


def key(g):
    return f"{g['map']}|{g['opp']}|{g['side']}"


def play(bot, g, outdir):
    a, b = (bot, g['opp']) if g['side'] == 'a' else (g['opp'], bot)
    stats = os.path.join(outdir, key(g).replace('|', '__').replace('/', '_') + '.json')
    if not os.path.exists(stats):
        cmd = [CLI, 'run', a, b, '--release', '--map', g['map'], '-o', os.path.join(outdir, 'replays'),
               '--statistics', stats, '--json', '--log-limit', '200000']
        subprocess.run(cmd, cwd=WS, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=900)
    try:
        d = json.load(open(stats))
    except Exception:
        return {'key': key(g), 'error': 'no-stats'}
    me = 'teamA' if g['side'] == 'a' else 'teamB'
    op = 'teamB' if me == 'teamA' else 'teamA'
    sc = {t['team']: int(t['submittedGems']) for t in d['teams']}
    deaths = {me: 0, op: 0}
    kills = {me: 0, op: 0}
    for c in d['champions']:
        deaths[c['team']] += int(c['metrics']['deaths'])
        kills[c['team']] += int(c['metrics']['kills'])
    codes = [c for c in d['diagnostics'].get('codes', []) if json.dumps(c).find(me) >= 0]
    return {'key': key(g), 'win': d['match']['outcome'] == me, 'score': sc[me], 'opp_score': sc[op],
            'rounds': d['match']['roundsCompleted'], 'deaths': deaths[me], 'opp_deaths': deaths[op],
            'kills': kills[me], 'faults': d['diagnostics']['botFaults'][me], 'codes': len(codes)}


def run_arm(bot, label):
    plan = json.load(open(PLAN))
    outdir = os.path.join(RUNS, label)
    os.makedirs(outdir, exist_ok=True)
    b = subprocess.run([CLI, 'build', '--release', bot], cwd=WS, capture_output=True, text=True)
    if b.returncode:
        print(b.stdout[-2000:], b.stderr[-2000:])
        print('GUARD: fail build')
        print('METRIC: -999')
        sys.exit(1)
    gs = games(plan)
    t0 = time.time()
    with ThreadPoolExecutor(JOBS) as ex:
        res = list(ex.map(lambda g: play(bot, g, outdir), gs))
    out = {'bot': bot, 'label': label, 'seconds': round(time.time() - t0), 'results': {r['key']: r for r in res}}
    json.dump(out, open(os.path.join(outdir, 'results.json'), 'w'), indent=1)
    return plan, gs, out


def main():
    mode = sys.argv[1]
    if mode == 'baseline':
        plan, gs, out = run_arm(BASE_BOT, 'baseline')
        r = out['results'].values()
        print(f"baseline: {sum(x.get('win', 0) for x in r)}/{len(gs)} wins, {out['seconds']}s, "
              f"errors {sum('error' in x for x in r)}, faults {sum(x.get('faults', 0) for x in r)}")
        return
    label = sys.argv[2] if len(sys.argv) > 2 else time.strftime('cand-%H%M%S')
    base = json.load(open(os.path.join(RUNS, 'baseline', 'results.json')))['results']
    plan, gs, out = run_arm(CAND_BOT, label)
    cand = out['results']
    agg = {c: {'gain': 0, 'loss': 0, 'n': 0, 'margin': 0, 'deaths': 0, 'bdeaths': 0, 'wins': 0, 'bwins': 0}
           for c in ('weak', 'strong')}
    errors, faults, codes, bcodes = 0, 0, 0, 0
    flips = []
    for g in gs:
        k = key(g)
        c, b = cand[k], base[k]
        if 'error' in c or 'error' in b:
            errors += 1
            continue
        a = agg[g['cls']]
        a['n'] += 1
        a['wins'] += c['win']
        a['bwins'] += b['win']
        a['margin'] += (c['score'] - c['opp_score']) - (b['score'] - b['opp_score'])
        a['deaths'] += c['deaths']
        a['bdeaths'] += b['deaths']
        faults += c['faults']
        codes += c['codes']
        bcodes += b['codes']
        if c['win'] and not b['win']:
            a['gain'] += 1
            flips.append('+' + k)
        elif b['win'] and not c['win']:
            a['loss'] += 1
            flips.append('-' + k)
    net = sum(a['gain'] - a['loss'] for a in agg.values())
    summary = {'label': label, 'net': net, 'agg': agg, 'errors': errors, 'faults': faults, 'codes': codes,
               'baseline_codes': bcodes, 'flips': flips, 'seconds': out['seconds']}
    json.dump(summary, open(os.path.join(RUNS, label, 'summary.json'), 'w'), indent=1)
    for cls, a in agg.items():
        print(f"{cls:6s} n={a['n']:3d} wins {a['bwins']}->{a['wins']} (+{a['gain']}/-{a['loss']}) "
              f"margin/game {a['margin'] / max(1, a['n']):+.1f} deaths/game {a['bdeaths'] / max(1, a['n']):.2f}->"
              f"{a['deaths'] / max(1, a['n']):.2f}")
    print('flips:', ' '.join(flips) or 'none')
    reasons = []
    if errors:
        reasons.append(f'errors={errors}')
    if faults:
        reasons.append(f'faults={faults}')
    if codes > bcodes:
        reasons.append(f'diagnostic-codes {bcodes}->{codes}')
    if agg['strong']['gain'] - agg['strong']['loss'] < -1:
        reasons.append('strong-map regression')
    print('GUARD:', 'fail ' + ','.join(reasons) if reasons else 'pass')
    print(f'METRIC: {net}')


if __name__ == '__main__':
    main()
