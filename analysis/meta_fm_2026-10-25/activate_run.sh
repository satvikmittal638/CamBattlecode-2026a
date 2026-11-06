#!/bin/zsh
# Make an already-uploaded version active (by version number), wait until active, run a trial plan.
#   ./activate_run.sh <version> <label> <plan.json> [submissionId]
cd /Users/dmitt/Desktop/CamBattlecode
ver=$1; label=$2; plan=$3
id=${4:-$(node tools/bc.mjs submissions | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{console.log(JSON.parse(s).submissions.find(x=>x.version===$ver).id)})")}
cur=$(node tools/bc.mjs submissions | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{console.log(JSON.parse(s).active.version)})")
[ "$cur" != "$ver" ] && node tools/bc.mjs set-active $id > /dev/null
until node tools/bc.mjs submissions 2>/dev/null | grep -A3 '"active"' | grep -q "\"version\": $ver"; do sleep 10; done
echo "$(date -u +%H:%M:%S) v$ver active"
cd analysis/meta_fm_2026-10-25 && node fm_trial.mjs $label $ver $plan > trials_$label.log 2>&1; tail -1 trials_$label.log
