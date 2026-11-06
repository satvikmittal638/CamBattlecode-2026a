#!/bin/zsh
# Upload v62t, activate it, reuse v62s's 20-challenge plan (same opponents/maps/sides, sourceGroupId = v62 groups) and
# start sender + collector + summaries. The sender re-activates v62t if anyone switches the bot (user, 27 Oct).
set -e
cd "$(dirname "$0")"
ROOT=../..
node $ROOT/tools/bc.mjs lock claude_v62v_c20
(cd $ROOT/workspace && ../.venv/bin/cambc submit v62v --note "v62v: v62r + post-patch draft Vesper Marcella Vendetta Varg Tavi" < /dev/null)
node -e "
import('$ROOT/tools/bclib.mjs').then(async({api})=>{const fs=require('fs');const s=await api('GET','/submissions');const sub=s.submissions[0];
 if(!/^v62v/.test(sub.note||''))throw Error('newest submission is not v62v: v'+sub.version);
 const p=JSON.parse(fs.readFileSync('../v62s_c100_2026-10-27/plan.json'));p.createdAt=new Date().toISOString();p.version=sub.version;p.submissionId=sub.id;
 p.pairedWith='../v62_c100_2026-10-27 (v62) , v62s/v62t (same 20 specs), v62r (10 of them), sourceGroupId = v62 groups';fs.writeFileSync('plan.json',JSON.stringify(p,null,2));console.log('plan for v'+sub.version,sub.id,p.specs.length,'specs');});"
SUB=$(node -e "console.log(require('./plan.json').submissionId)")
node $ROOT/tools/bc.mjs wait-build $SUB
node $ROOT/tools/bc.mjs set-active $SUB > /dev/null
nohup node run.mjs > run.out 2>&1 &
sleep 20; nohup sh -c 'node collect.mjs > collect.out 2>&1; node official_stats.mjs > official_stats.out 2>&1' > /dev/null 2>&1 &
echo started
