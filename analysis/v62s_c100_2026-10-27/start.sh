#!/bin/zsh
# Upload v62s, activate it, write plan.json (same 100 specs as v62's run) and start sender + collector + summaries.
# Every challenge replays the opponent bot v62 faced (sourceGroupId from ../v62_c100_2026-10-27/receipts.json).
set -e
cd "$(dirname "$0")"
ROOT=../..
node $ROOT/tools/bc.mjs lock claude_v62s_c100
(cd $ROOT/workspace && ../.venv/bin/cambc submit v62s --note "v62s: v62n + step away when outmatched (share<.30, no legacy fallback)" < /dev/null)
node -e "
import('$ROOT/tools/bclib.mjs').then(async({api})=>{const fs=require('fs');const s=await api('GET','/submissions');const sub=s.submissions[0];
 if(!/^v62s/.test(sub.note||''))throw Error('newest submission is not v62s: v'+sub.version);
 const p=JSON.parse(fs.readFileSync('../v62_c100_2026-10-27/plan.json'));p.createdAt=new Date().toISOString();p.version=sub.version;p.submissionId=sub.id;
 p.pairedWith='../v62_c100_2026-10-27 (v62, same specs, sourceGroupId = v62 groups)';fs.writeFileSync('plan.json',JSON.stringify(p,null,2));console.log('plan for v'+sub.version,sub.id);});"
SUB=$(node -e "console.log(require('./plan.json').submissionId)")
node $ROOT/tools/bc.mjs wait-build $SUB
node $ROOT/tools/bc.mjs set-active $SUB > /dev/null
nohup node run.mjs > run.out 2>&1 &
sleep 20; nohup sh -c 'node collect.mjs > collect.out 2>&1; node official_stats.mjs > official_stats.out 2>&1' > /dev/null 2>&1 &
echo started
