"""Independent match tests using official engine statistics, without bot-source edits."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[2]
WS = ROOT / "workspace"
CLI = ROOT / ".venv/bin/cambc"
parser = argparse.ArgumentParser()
parser.add_argument("bot")
parser.add_argument("opponents", help="Comma-separated existing bot directory names")
parser.add_argument("out", type=Path)
parser.add_argument("--maps", help="Optional comma-separated map names")
parser.add_argument("--jobs", type=int, default=6)
args = parser.parse_args()
opponents = args.opponents.split(",")
for name in [args.bot, *opponents]:
    if not re.fullmatch(r"[A-Za-z0-9_-]+", name) or not (WS / "bots" / name / "src").is_dir():
        raise SystemExit(f"Invalid or missing bot: {name}")
maps = args.maps.split(",") if args.maps else [m["name"] for m in json.loads((WS / "maps/pool.json").read_text())]
for name in maps:
    if not re.fullmatch(r"[A-Za-z0-9_-]+", name) or not (WS / "maps" / f"{name}.map26a").is_file():
        raise SystemExit(f"Invalid or missing map: {name}")
out = args.out.resolve()
if out.exists():
    raise SystemExit(f"Refusing to overwrite existing test directory: {out}")
out.mkdir(parents=True)


def hashes():
    return {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest()
            for name in [args.bot, *opponents]
            for p in (WS / "bots" / name / "src").rglob("*") if p.is_file()}


before = hashes()
(out / "source_hashes.json").write_text(json.dumps(before, indent=2))
for bot in dict.fromkeys([args.bot, *opponents]):
    subprocess.run([str(CLI), "build", bot], cwd=WS, check=True)
rows, manifest = [], []
for opponent in opponents:
    for name in maps:
        folder = out / opponent / name
        folder.mkdir(parents=True)
        for side in ["a", "b"]:
            a, b = (args.bot, opponent) if side == "a" else (opponent, args.bot)
            replay, stats = folder / f"{side}.repl26a", folder / f"{side}.json"
            row = {"opponent": opponent, "map": name, "side": side,
                   "replay": str(replay.relative_to(ROOT)), "statistics": str(stats.relative_to(ROOT))}
            rows.append(row)
            manifest.append(f"{WS / 'bots' / a} {WS / 'bots' / b} {WS / 'maps' / (name + '.map26a')} {replay} --statistics {stats} --json")
(out / "matches.txt").write_text("\n".join(manifest) + "\n")
with (out / "runner.log").open("w") as log:
    run = subprocess.run([str(CLI), "run-batch", str(out / "matches.txt"),
                          "--jobs", str(args.jobs), "--release", "--fuel-quantum", "100000",
                          "--log-limit", "1000000", "--timeout", "120", "--color", "never"],
                         cwd=WS, stdout=log, stderr=subprocess.STDOUT)
for row in rows:
    path = ROOT / row["statistics"]
    if not path.exists():
        row["error"] = "missing official match statistics"
        continue
    data = json.loads(path.read_text())
    me = "teamA" if row["side"] == "a" else "teamB"
    them = "teamB" if me == "teamA" else "teamA"
    scores = {t["team"]: int(t["submittedGems"]) for t in data["teams"]}
    row.update(outcome=data["match"]["outcome"], win=data["match"]["outcome"] == me,
               score=scores[me], oppScore=scores[them], rounds=data["match"]["roundsStarted"],
               faults=data["diagnostics"]["botFaults"], engineVersion=data["match"]["engineVersion"],
               diagnosticCodes=data["diagnostics"].get("codes", []))
    if data["match"]["outcome"] not in ["teamA", "teamB"]:
        row["error"] = "non-winning outcome: " + str(data["match"]["outcome"])
after = hashes()
changed = sorted(p for p, h in before.items() if after.get(p) != h)


def aggregate(items):
    good = [r for r in items if "error" not in r]
    return {"expected": len(items), "finished": len(good), "wins": sum(r["win"] for r in good),
            "avgGemDifference": round(sum(r["score"] - r["oppScore"] for r in good) / len(good), 2) if good else None,
            "botFaults": sum(sum(r["faults"].values()) for r in good),
            "errors": [r for r in items if "error" in r]}


report = {"bot": args.bot, "runnerExitCode": run.returncode,
          "sourceChangedDuringTest": changed, "overall": aggregate(rows),
          "perOpponent": {o: aggregate([r for r in rows if r["opponent"] == o]) for o in opponents},
          "perMap": {m: aggregate([r for r in rows if r["map"] == m]) for m in maps},
          "rows": rows}
(out / "results.json").write_text(json.dumps(report, indent=2))
print(json.dumps({k: v for k, v in report.items() if k not in ["rows", "perMap"]}, indent=2))
if run.returncode or changed or report["overall"]["errors"] or report["overall"]["botFaults"]:
    raise SystemExit(1)
