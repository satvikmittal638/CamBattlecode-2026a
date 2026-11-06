#!/bin/bash
# Cluster: turn newly extracted observations into dataset shards every 20 minutes until /media/data_dump/Anwar/fish_bc/STOP exists.
#   nohup ./build_loop.sh > results/build_loop.log 2>&1 < /dev/null &
export TMPDIR=/media/data_dump/Anwar/fish_bc/tmp
cd /home/anwar/cuda_satvik/projects/fish_bc
D=/media/data_dump/Anwar/fish_bc
while [ ! -f $D/STOP ]; do
  date
  /home/anwar/cuda_satvik/.venv/bin/python src/build_dataset.py --procs 16 --features v2 --obs-dir $D/obs --out-dir $D/data_v2 2>&1 | tail -2
  sleep 1200
done
