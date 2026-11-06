#!/usr/bin/env python3
"""Cluster version of extract.mjs (the cluster's node is too old): runs turnhost --observe with the Fish observer bot on
every downloaded replay that has no obs file yet, on Fish's side, and writes obs/<matchId>.tsv.gz in the same format.
    python3 extract_cluster.py [--jobs 40] [--watch 300]
--watch N rescans every N seconds for newly downloaded replays until the file STOP appears in the data root (or no new
replay arrives for an hour). Metadata is appended to games.json in the data root."""
import argparse
import gzip
import json
import os
import subprocess
import time
from concurrent.futures import ThreadPoolExecutor

DATA = "/media/data_dump/Anwar/fish_bc"
PROJ = "/home/anwar/cuda_satvik/projects/fish_bc"
EXE = DATA + "/build/turnhost/release/turnhost"
os.environ["TMPDIR"] = DATA + "/tmp"
ap = argparse.ArgumentParser()
ap.add_argument("--jobs", type=int, default=40)
ap.add_argument("--watch", type=int, default=0)
a = ap.parse_args()
matches = {m["matchId"]: m for m in json.load(open(DATA + "/fish_matches.json"))}
os.makedirs(DATA + "/obs", exist_ok=True)
meta_file = DATA + "/games.json"
meta = json.load(open(meta_file)) if os.path.exists(meta_file) else []
failed = set()


def run(job):
    mid, path = job
    m = matches[mid]
    cmd = [EXE, "--engine", PROJ + "/assets/engine_v1_0_3.wasm", "--map", f"{PROJ}/assets/maps/{m['map'].replace('_', '-')}.map26a",
           "--replay", path, "--bot", PROJ + "/assets/fishbc_observer.wasm", "--team", "0" if m["fishSide"] == "a" else "1",
           "--observe", "--quantum", "3000000", "--log", "400000", "--costs", PROJ + "/fuel_costs_cli.postcard"]
    p = subprocess.run(cmd, capture_output=True, text=True)
    map_line, out, turns, missing = None, [], 0, 0
    for l in p.stdout.split("\n"):
        if not l.startswith("{"):
            continue
        t = json.loads(l)
        obs = None
        for x in t["log"].split("\n"):
            if x.startswith("M ") and map_line is None:
                map_line = x
            elif x.startswith("O "):
                obs = x[2:]
        turns += 1
        if obs is None:
            missing += 1
            continue
        out.append(f"{t['r']}\t{t['id']}\t{t['type']}\t{';'.join(t['rep'])}\t{obs}")
    if p.returncode == 0 and map_line and out:
        tmp = f"{DATA}/obs/{mid}.tsv.gz.part"
        with gzip.open(tmp, "wt", compresslevel=6) as f:
            f.write(map_line + "\n" + "\n".join(out) + "\n")
        os.replace(tmp, f"{DATA}/obs/{mid}.tsv.gz")
        return {k: m.get(k) for k in ("matchId", "map", "fishSide", "fishResult", "opponent", "createdAt", "kind")} | {
            "source": "corpus", "turns": turns, "observed": len(out), "missing": missing}
    failed.add(mid)
    print("failed", mid, p.returncode, (p.stderr.strip().split("\n") or [""])[-1][:200], flush=True)
    return None


last_new = time.time()
with ThreadPoolExecutor(a.jobs) as ex:
    while True:
        have = {f[:-7] for f in os.listdir(DATA + "/obs") if f.endswith(".tsv.gz")}
        todo = []
        for mp in os.listdir(DATA + "/replays"):
            d = os.path.join(DATA + "/replays", mp)
            if os.path.isdir(d):
                for f in os.listdir(d):
                    mid = f[:-8]
                    if f.endswith(".repl26a") and mid in matches and mid not in have and mid not in failed:
                        todo.append((mid, os.path.join(d, f)))
        if todo:
            last_new = time.time()
            t0 = time.time()
            n = 0
            for r in ex.map(run, todo):
                if r:
                    meta.append(r)
                n += 1
                if n % 500 == 0:
                    json.dump(meta, open(meta_file, "w"))
                    print(f"{n}/{len(todo)} games, {time.time() - t0:.0f}s", flush=True)
            json.dump(meta, open(meta_file, "w"))
            print(f"pass done: {len(todo)} games, total {len(meta)}, failed {len(failed)}", flush=True)
        if not a.watch or os.path.exists(DATA + "/STOP") or time.time() - last_new > 3600:
            break
        time.sleep(a.watch)
