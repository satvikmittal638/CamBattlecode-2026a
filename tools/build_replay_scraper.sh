#!/bin/zsh
# Build tools/replay_scraper.cpp as a CAMBC bot (release wasm) at workspace/bots/replay-scraper.
set -e
ROOT=${0:A:h:h}
mkdir -p $ROOT/workspace/bots/replay-scraper/src
cp $ROOT/tools/replay_scraper.cpp $ROOT/workspace/bots/replay-scraper/src/main.cpp
cd $ROOT/workspace && ../.venv/bin/cambc build replay-scraper --release
ls -la $ROOT/workspace/bots/replay-scraper/.cambc/build-release/bot-injected.wasm
