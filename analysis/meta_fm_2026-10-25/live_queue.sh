#!/bin/zsh
# Upload each v62m variant in turn, wait until it is the active submission, run the paired Fish/Mite trial.
#   ./live_queue.sh name:"note" ...
cd /Users/dmitt/Desktop/CamBattlecode
for spec in "$@"; do
  name=${spec%%:*}; note=${spec#*:}
  out=$(cd workspace && ../.venv/bin/cambc submit v62m_$name -n "$note" 2>&1 | tail -1)
  ver=$(echo $out | grep -o 'version [0-9]*' | grep -o '[0-9]*')
  echo "$(date -u +%H:%M:%S) $name uploaded as v$ver"
  [ -z "$ver" ] && { echo "upload failed: $out"; exit 1; }
  until node tools/bc.mjs submissions 2>/dev/null | grep -A3 '"active"' | grep -q "\"version\": $ver"; do sleep 20; done
  echo "$(date -u +%H:%M:%S) v$ver active"
  (cd analysis/meta_fm_2026-10-25 && node fm_trial.mjs v${ver}_$name $ver plan_fm30.json > trials_v${ver}.log 2>&1; tail -1 trials_v${ver}.log)
done
