#!/bin/bash
# Full locked platform cycle (AGENT_GUIDE protocol), run from the project root:
#   analysis/kratosmessi/platform_cycle.sh <submit|SUBMISSION_ID> <teamId> <map1,map2,map3,map4,map5> <label>
# "submit" uploads workspace/bots/mimic-kratosmessi first; otherwise re-uses an uploaded version.
# Output: analysis/kratosmessi/platform/<groupId>/ (+ a line in cycle.log).
set -u
ROOT=/Users/dmitt/Desktop/CamBattlecode
cd $ROOT
SUB=$1; TEAM=$2; MAPS=$3; LABEL=$4
LOG=$ROOT/analysis/kratosmessi/platform/cycle.log
mkdir -p $ROOT/analysis/kratosmessi/platform
ts() { date -u +%Y-%m-%dT%H:%M:%SZ; }
echo "$(ts) [$LABEL] waiting for lock" >> $LOG
node tools/bc.mjs lock kratosmessi >> $LOG 2>&1
unlock() { node tools/bc.mjs unlock kratosmessi >> $LOG 2>&1; echo "$(ts) [$LABEL] unlocked" >> $LOG; }
Q=$(node tools/bc.mjs quota | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).quota.used))")
echo "$(ts) [$LABEL] locked; quota used=$Q" >> $LOG
if [ "$Q" -ge 24 ]; then echo "$(ts) [$LABEL] quota too high, abort" >> $LOG; unlock; exit 2; fi
if [ "$SUB" = "submit" ]; then
  (cd workspace && ../.venv/bin/cambc submit mimic-kratosmessi >> $LOG 2>&1)
  SUB=$(node tools/bc.mjs submissions | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);j.submissions.sort((a,b)=>a.createdAt<b.createdAt?1:-1);console.log(j.submissions[0].id)})")
  echo "$(ts) [$LABEL] submitted $SUB" >> $LOG
fi
B=$(node tools/bc.mjs wait-build $SUB)
echo "$(ts) [$LABEL] build: $(echo $B | tr -d '\n ')" >> $LOG
if ! echo "$B" | grep -q '"ready"'; then echo "$(ts) [$LABEL] build not ready, abort" >> $LOG; unlock; exit 3; fi
node tools/bc.mjs set-active $SUB >> $LOG 2>&1
C=$(node tools/bc.mjs challenge $TEAM $MAPS 2>&1)
echo "$(ts) [$LABEL] challenge: $(echo $C | tr -d '\n')" >> $LOG
G=$(echo "$C" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{const j=JSON.parse(s);console.log(j.groupId||j.id||j.group?.id||'')}catch{console.log('')}})")
if [ -z "$G" ]; then echo "$(ts) [$LABEL] no group id, abort" >> $LOG; unlock; exit 4; fi
W=$(node tools/bc.mjs wait-group $G)
echo "$(ts) [$LABEL] group $G finished: $(echo $W | tr -d '\n' | cut -c1-600)" >> $LOG
unlock
node tools/bc.mjs download-group $G $ROOT/analysis/kratosmessi/platform/$G > $ROOT/analysis/kratosmessi/platform/$G.download.json 2>&1
echo "$(ts) [$LABEL] DONE sub=$SUB group=$G" >> $LOG
echo "DONE sub=$SUB group=$G"
