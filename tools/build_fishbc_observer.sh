#!/bin/zsh
# Build tools/fishbc_observer.cpp as a CAMBC bot (release wasm) at workspace/bots/fishbc-observer.
set -e
ROOT=${0:A:h:h}
mkdir -p $ROOT/workspace/bots/fishbc-observer/src
cp $ROOT/tools/fishbc_observer.cpp $ROOT/workspace/bots/fishbc-observer/src/main.cpp
cd $ROOT/workspace && ../.venv/bin/cambc build fishbc-observer --release
