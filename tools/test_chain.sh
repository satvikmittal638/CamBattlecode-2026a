#!/bin/bash
# Unattended platform chain: paired-test <ver> (must already be active), then re-activate the
# baseline submission and rerun the same schedule as <baseDir>. Logs to platform/chain_<ver>.log.
#   tools/test_chain.sh <ver> <baseVer> <baseSubmissionId> <baseOutDir> [compare]
cd "$(dirname "$0")/.." || exit 1
VER=$1; BASE=$2; BASEID=$3; BASEDIR=$4; CMP=${5:-v33,v36,v37}
LOG=platform/chain_v$VER.log
echo "$(date -u +%FT%TZ) start v$VER" >> $LOG
node tools/paired_run.mjs $VER platform/unranked_v$VER --specs platform/unranked_v31/specs.json --compare $CMP >> $LOG 2>&1 || { echo "paired_run v$VER failed" >> $LOG; exit 1; }
node tools/bc.mjs unlock v$VER >> $LOG 2>&1; node tools/bc.mjs lock v$BASE-rerun >> $LOG 2>&1
node tools/bc.mjs set-active $BASEID >> $LOG 2>&1
node tools/paired_run.mjs $BASE $BASEDIR --specs platform/unranked_v31/specs.json --compare v$VER,$CMP >> $LOG 2>&1
echo "$(date -u +%FT%TZ) chain done" >> $LOG
