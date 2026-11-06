#!/bin/bash
# Ablation: for each feature switch in config.h, build a variant with it disabled and play
# full bot (BOT) vs variant on all maps from both sides. Prints wins of the full bot.
#   analysis/kratosmessi/ablate.sh <full-bot-dir> [flags...]
set -u
FULL=$1; shift
FLAGS=${@:-"kSoloCapture kOwnSide kTributeRule kSafeRecall kShopRecall kBuild kAttackReset kTravelDash kAltarLock kSkipMonolith"}
SP=/private/tmp/claude-502/-Users-dmitt-Desktop-CamBattlecode/e7aa379f-7953-47fc-89e4-3d6bfcb5a0df/scratchpad/km/ablate
ROOT=/Users/dmitt/Desktop/CamBattlecode
mkdir -p $SP
for F in $FLAGS; do
  V=$SP/no_$F; rm -rf $V; mkdir -p $V; cp -R $FULL/src $V/src
  sed -i '' "s/inline constexpr bool $F = true;/inline constexpr bool $F = false;/" $V/src/config.h
  (cd $ROOT/workspace && ../.venv/bin/cambc build $V >/dev/null 2>&1) || { echo "$F build failed"; continue; }
  (cd $ROOT && BOT=$FULL analysis/kratosmessi/run_local.sh abl_$F $V 4 >/dev/null 2>&1)
  node $ROOT/analysis/kratosmessi/deep.mjs $ROOT/workspace/replays/kratosmessi/abl_$F --side dir --recent 100 --quiet --json $SP/abl_$F.json >/dev/null 2>&1
  node -e "const a=require('$SP/abl_$F.json'); console.log('$F'.padEnd(14),'full-bot wins',Math.round(a.winRate*a.matches)+'/'+a.matches,'gems',a.gemsFor,'vs',a.gemsAgainst,'diff',(a.gemsFor-a.gemsAgainst).toFixed(0))"
done
