#!/usr/bin/env python3
"""Cluster side of the group-bundle download. Reads "group_id<TAB>presigned_url" lines on stdin, downloads each group's
zip (8 at a time) and unpacks its per-match replay zips to /media/data_dump/Anwar/fish_bc/replays/<map>/<matchId>.repl26a
using group_plan.json. Prints "ok <gid> <n>" or "fail <gid> <reason>" per group."""
import json
import os
import subprocess
import sys
import zipfile
from concurrent.futures import ThreadPoolExecutor

ROOT = "/media/data_dump/Anwar/fish_bc"
os.environ["TMPDIR"] = ROOT + "/tmp"
plan = {p["gid"]: dict(p["matches"]) for p in json.load(open(ROOT + "/group_plan.json"))}


def get(line):
    gid, url = line.rstrip("\n").split("\t", 1)
    tmp = f"{ROOT}/tmp/{gid}.zip"
    try:
        r = subprocess.run(["curl", "-sS", "--fail", "-m", "300", "-o", tmp, url], capture_output=True, text=True)
        if r.returncode:
            return f"fail {gid} curl {r.stderr.strip()[:120]}"
        n = 0
        with zipfile.ZipFile(tmp) as z:
            for name in z.namelist():
                mid = name.rsplit("/", 1)[-1].split("-", 1)[-1].removesuffix(".zip")
                if mid not in plan.get(gid, {}):
                    continue
                data = z.read(name)
                if len(data) < 1000 or data[:2] != b"PK":
                    continue
                d = f"{ROOT}/replays/{plan[gid][mid]}"
                os.makedirs(d, exist_ok=True)
                with open(f"{d}/{mid}.repl26a.part", "wb") as f:
                    f.write(data)
                os.replace(f"{d}/{mid}.repl26a.part", f"{d}/{mid}.repl26a")
                n += 1
        return f"ok {gid} {n}"
    except Exception as e:
        return f"fail {gid} {type(e).__name__} {str(e)[:120]}"
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)


with ThreadPoolExecutor(8) as ex:
    for out in ex.map(get, [l for l in sys.stdin if "\t" in l]):
        print(out, flush=True)
