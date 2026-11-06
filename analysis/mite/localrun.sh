#!/bin/bash
# Usage: analysis/mite/localrun.sh <opponent-bot> <tag> [maps...]
# Plays mimic-mite vs <opponent> on every map from both sides; replays go to
# workspace/replays/mite/<tag>/{a,b}; prints the result table and any bot errors.
cd "$(dirname "$0")/../../workspace" || exit 1
OPP=$1; TAG=$2; shift 2
MAPS=${@:-collision corners elkring expanse interlock lanes monolith packs rows}
OUT=replays/mite/$TAG
rm -rf $OUT; mkdir -p $OUT/a $OUT/b
for m in $MAPS; do
  r=$(../.venv/bin/cambc run mimic-mite $OPP --map $m -o $OUT/a 2>&1 | grep -E 'wins|round 2000|draw' | head -1)
  f=$(ls -t $OUT/a/*.repl26a | head -1); mv "$f" "$OUT/a/${m}_$(basename "$f")"
  e=$(unzip -p "$OUT/a/${m}_$(basename "$f")" team-a.stdout | strings | grep -c 'bot error')
  echo "A $m: $r errs=$e"
  r=$(../.venv/bin/cambc run $OPP mimic-mite --map $m -o $OUT/b 2>&1 | grep -E 'wins|round 2000|draw' | head -1)
  f=$(ls -t $OUT/b/*.repl26a | head -1); mv "$f" "$OUT/b/${m}_$(basename "$f")"
  e=$(unzip -p "$OUT/b/${m}_$(basename "$f")" team-b.stdout | strings | grep -c 'bot error')
  echo "B $m: $r errs=$e"
done
