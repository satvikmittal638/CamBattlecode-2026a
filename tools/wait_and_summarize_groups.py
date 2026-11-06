#!/usr/bin/env python3
import json, subprocess, time, sys

GROUPS = sys.argv[1:]
if not GROUPS:
    print("Usage: wait_and_summarize_groups.py <groupId1> <groupId2> ...")
    sys.exit(1)

def check_group(gid):
    out = subprocess.check_output(['./.venv/bin/cambc', 'match-groups', 'show', '--json', gid])
    return json.loads(out)

pending = set(GROUPS)
while pending:
    for gid in list(pending):
        data = check_group(gid)
        matches = data.get('matches', [])
        all_done = True
        for m in matches:
            if m.get('status') not in ['completed', 'failed', 'finished']:
                all_done = False
                break
        if all_done and matches:
            print(f"\n=== MATCH GROUP {gid} COMPLETED ===")
            for m in matches:
                map_name = m.get('map')
                teams = m.get('teams', [])
                us = next((t for t in teams if 'Agentic Loop' in t.get('name', '')), None)
                opp = next((t for t in teams if 'Agentic Loop' not in t.get('name', '')), None)
                res = us.get('result') if us else 'unknown'
                opp_name = opp.get('name') if opp else 'opponent'
                opp_res = opp.get('result') if opp else 'unknown'
                print(f"Map: {map_name:18s} | {res:4s} vs {opp_name} ({opp_res:4s})")
            pending.remove(gid)
    if pending:
        time.sleep(5)

print("\nAll match groups finished!")
