#!/bin/bash
# Safe launcher for Deathstar (/home/anwar/cuda_satvik/projects/fish_bc/run.sh).
# Usage: ./run.sh <nvidia-smi index> <tag> [train.py args...]
#        SCRIPT=eval_model.py ./run.sh <index> <tag> [script args...]   (any other src/ script; args passed as given)
# The job is pinned to that GPU's UUID (CUDA never enumerates any other device, so index shifts or the faulty card
# cannot be touched). Pre-flight: only that index is queried; requires >= 8 GiB free (no temperature limit, per the user).
set -euo pipefail
export TMPDIR="/home/anwar/tmp"
export CUDA_DEVICE_ORDER="PCI_BUS_ID"
export PATH="/usr/local/cuda-13.3/bin:$HOME/.local/bin:$PATH"
export LD_LIBRARY_PATH="/usr/local/cuda-13.3/lib64:${LD_LIBRARY_PATH:-}"
export TORCH_HOME="/home/anwar/tmp/torch_cache"
export HF_HOME="/home/anwar/tmp/hf_cache"
# torch.compile caches go to the data volume (the home partition is nearly full).
export TORCHINDUCTOR_CACHE_DIR="/media/data_dump/Anwar/fish_bc/tmp/inductor"
export TRITON_CACHE_DIR="/media/data_dump/Anwar/fish_bc/tmp/triton"
cd /home/anwar/cuda_satvik/projects/fish_bc
IDX=$1; TAG=$2; shift 2
if [ "$IDX" = "4" ] || [ "$IDX" = "1" ] || [ "$IDX" = "7" ]; then echo "refusing GPU $IDX (faulty/unreachable)"; exit 1; fi
IFS=, read -r UUID NAME USED TOTAL UTIL TEMP < <(nvidia-smi -i "$IDX" --query-gpu=uuid,name,memory.used,memory.total,utilization.gpu,temperature.gpu --format=csv,noheader,nounits | sed 's/, /,/g')
FREE=$((TOTAL - USED))
echo "GPU $IDX $NAME $UUID: used ${USED}/${TOTAL} MiB, util ${UTIL}%, temp ${TEMP}C"
if [ "$FREE" -lt 8192 ]; then echo "GPU $IDX lacks 8 GiB free; refusing to start"; exit 1; fi
export CUDA_VISIBLE_DEVICES="$UUID"
if [ -n "${SCRIPT:-}" ]; then
  nohup /home/anwar/cuda_satvik/.venv/bin/python "src/$SCRIPT" "$@" > "results/$TAG.log" 2>&1 < /dev/null &
else
  nohup /home/anwar/cuda_satvik/.venv/bin/python src/train.py --tag "$TAG" --data-dir /media/data_dump/Anwar/fish_bc/data --out-dir /media/data_dump/Anwar/fish_bc/models "$@" > "results/$TAG.log" 2>&1 < /dev/null &
fi
echo "started pid $! on $UUID -> results/$TAG.log"
