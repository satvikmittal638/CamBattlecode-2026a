"""Bug scan of v62's own stdout in every platform replay bundle (team-a.stdout / team-b.stdout = our side):
'bot error' (caught exception), 'API' (SDK error code), 'suspended' (turn cut off by fuel), decision lines with
yielded/errors/blocked. Writes log_scan.json."""
import collections, glob, json, re, subprocess
index = json.load(open("games/index.json"))
tot = collections.Counter(); per_game = []; examples = collections.defaultdict(list)
for g in index:
    path = "games/" + g["file"]
    names = subprocess.run(["unzip", "-Z1", path], capture_output=True, text=True).stdout.split()
    out = [n for n in names if n.endswith(".stdout")]
    if not out:
        continue
    text = subprocess.run(["unzip", "-p", path, out[0]], capture_output=True).stdout.decode("utf-8", "replace").replace("\x00", "")
    c = collections.Counter()
    for line in text.split("\n"):
        s = line.strip()
        if s.startswith("bot error"):
            c["bot_error"] += 1; key = re.sub(r"round \d+", "round N", s)[:120]; examples["bot_error:" + key].append(g["matchId"])
        elif s.startswith("API"):
            c["api_error"] += 1; key = re.sub(r"^API \d+ ", "API ", s)[:120]; examples["api:" + key].append(g["matchId"])
        elif s.startswith("suspended"):
            c["suspended"] += 1; parts = s.split(); examples["suspended at " + (parts[3] if len(parts) > 3 else "?")].append(g["matchId"])
        elif s.startswith("decision"):
            m = re.search(r"yielded (\d+) errors (\d+) blocked (\d+)", s)
            if m:
                c["decisions"] += 1
                c["yielded"] += int(m.group(1)) > 0; c["err_turns"] += int(m.group(2)) > 0; c["blocked_turns"] += int(m.group(3)) > 0
            m2 = re.search(r"decision \d+ \d+ (\S+)", s)
            if m2 and ("yielded 1" in s or "errors" in s and not "errors 0" in s):
                examples["stage:" + m2.group(1)].append(g["matchId"])
        elif "truncated" in s.lower() or "limit" in s.lower():
            c["log_limit"] += 1
    tot.update(c)
    per_game.append({"matchId": g["matchId"], "pool": g["pool"], "result": g["result"], **c})
print(len(per_game), "games scanned"); print(dict(tot))
for k, v in sorted(examples.items(), key=lambda kv: -len(kv[1]))[:30]:
    print(f"  {len(v):5d}  {k}")
json.dump({"totals": dict(tot), "per_game": per_game, "examples": {k: v[:20] for k, v in examples.items()}}, open("log_scan.json", "w"), indent=1)
