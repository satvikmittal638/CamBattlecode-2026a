#!/usr/bin/env python3
"""Paired online comparison of two arms played on the same plan with pinned opponent bots.
  python3 autoresearch/online_compare.py <baselineLabel> <candidateLabel>"""
import json, sys
b, c = (json.load(open(f'autoresearch/online_runs/{x}/results.json')) for x in sys.argv[1:3])
key = lambda g: (g['label'], g['map'], g['side'])
B = {key(g): g for g in b['games']}
agg = {}
for g in c['games']:
    o = B.get(key(g))
    if not o: continue
    a = agg.setdefault(g['cls'], {'n': 0, 'bw': 0, 'cw': 0, 'gain': 0, 'loss': 0, 'margin': 0})
    cw, bw = g['result'] == 'win', o['result'] == 'win'
    a['n'] += 1; a['cw'] += cw; a['bw'] += bw; a['gain'] += cw and not bw; a['loss'] += bw and not cw
    a['margin'] += (g['score'] - g['oppScore']) - (o['score'] - o['oppScore'])
net = sum(a['gain'] - a['loss'] for a in agg.values())
for k, a in agg.items():
    print(f"{k:6s} n={a['n']} wins {a['bw']}->{a['cw']} (+{a['gain']}/-{a['loss']}) margin/game {a['margin']/max(1,a['n']):+.0f}")
print(f"wrong-version: baseline {len(b['wrongVersion'])} candidate {len(c['wrongVersion'])}")
print(f'ONLINE_NET: {net}')
