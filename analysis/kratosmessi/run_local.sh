#!/bin/bash
# Usage: analysis/kratosmessi/run_local.sh <tag> <opponent-bot> [jobs] [maps...]
# Plays mimic-kratosmessi vs <opponent> on every map from both sides.
# Replays: workspace/replays/kratosmessi/<tag>/{a,b}/<map>.repl26a  (mimic is side a in a/, side b in b/)
set -e
TAG=$1; OPP=$2; JOBS=${3:-2}; shift 3 || true
MAPS=${@:-"collision corners elkring expanse interlock lanes monolith packs rows"}
ROOT=/Users/dmitt/Desktop/CamBattlecode/workspace
BOT=${BOT:-../../../bots/mimic-kratosmessi}
case "$OPP" in /*) OPPP=$OPP;; *) OPPP=../../../bots/$OPP;; esac
OUT=$ROOT/replays/kratosmessi/$TAG
rm -rf $OUT; mkdir -p $OUT/a $OUT/b
MAN=$OUT/manifest.txt
: > $MAN
for m in $MAPS; do
  echo "$BOT $OPPP ../../../maps/$m.map26a a/$m.repl26a" >> $MAN
  echo "$OPPP $BOT ../../../maps/$m.map26a b/$m.repl26a" >> $MAN
done
cd $ROOT && ../.venv/bin/cambc run-batch $MAN --jobs $JOBS --color never 2>&1 | tail -n 25
