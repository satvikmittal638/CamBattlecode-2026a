"""Train the Fish behavioural-cloning network on data/*.npz shards.

    ../../.venv-analysis/bin/python train.py [--epochs 3] [--width 64] [--blocks 6] [--batch 512] [--no-history] [--tag NAME]
        [--mix 8 --loaders 4] [--compile] [--ckpt-every 5000] [--max-val-shards 20]

Inputs : grid uint8 [C,15,15] (egocentric, radius 7; C = 19 for v1 features, 54 for v2), scalars float [54].
Heads  : move (9), attack tile (225 + none), cast slot (3), cast tile (225 + none), ward tile (225 + none), special (6).
Loss   : sum of cross-entropies; cast tile only where a cast happened, ward tile weight 0.5.
Shards stream from disk (a shard is shuffled in memory); val/test shards are separate games.
Writes models/<tag>.pt and models/<tag>_metrics.json.
"""
import argparse
import glob
import json
import os
import random
import threading
import time
from queue import Queue

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

HERE = os.path.dirname(os.path.abspath(__file__))
NONE = 225
HIST = slice(13 + 35, 13 + 41)  # prev_move_dx .. rounds_since_attack (history scalars)
PRIORITY = 27  # the bot's own set_priority value (Fish-specific internal mode, not board state)


def zeroed_scalars(args):
    """Scalar indices a model was trained without (history with --no-history, plus --zero-scalars)."""
    z = [int(i) for i in str(args.get("zero_scalars") or "").split(",") if i != ""]
    if args.get("no_history"):
        z += list(range(HIST.start, HIST.stop))
    return z


class Block(nn.Module):
    def __init__(self, c):
        super().__init__()
        self.c1 = nn.Conv2d(c, c, 3, padding=1)
        self.c2 = nn.Conv2d(c, c, 3, padding=1)
        self.n1 = nn.BatchNorm2d(c)
        self.n2 = nn.BatchNorm2d(c)

    def forward(self, x):
        return F.relu(x + self.n2(self.c2(F.relu(self.n1(self.c1(x))))))


class FishNet(nn.Module):
    def __init__(self, cin=19, nscal=54, width=64, blocks=6):
        super().__init__()
        self.stem = nn.Conv2d(cin, width, 3, padding=1)
        self.scal = nn.Sequential(nn.Linear(nscal, width), nn.ReLU(), nn.Linear(width, width))
        self.body = nn.Sequential(*[Block(width) for _ in range(blocks)])
        self.pool_mlp = nn.Sequential(nn.Linear(2 * width + width, 128), nn.ReLU())
        self.move = nn.Linear(128, 9)
        self.cast_slot = nn.Linear(128, 3)
        self.special = nn.Linear(128, 6)
        self.none = nn.Linear(128, 3)  # "no target" logits for attack, cast tile, ward
        self.tiles = nn.Conv2d(width, 3, 1)  # per-tile logits for attack, cast tile, ward

    def forward(self, grid, scal):
        s = self.scal(scal)
        x = F.relu(self.stem(grid) + s[:, :, None, None])
        x = self.body(x)
        pooled = torch.cat([x.mean((2, 3)), x[:, :, 7, 7], s], 1)
        h = self.pool_mlp(pooled)
        t = self.tiles(x).flatten(2)  # [B,3,225]
        none = self.none(h)[:, :, None]
        tiles = torch.cat([t, none], 2)  # [B,3,226]
        return self.move(h), tiles[:, 0], self.cast_slot(h), tiles[:, 1], tiles[:, 2], self.special(h)


def shard_stream(files, batch, shuffle=True, zero=(), mix=1, loaders=1, frac=1.0):
    """Yield (grid, scal, lab) numpy batches. Background threads decompress the next shards; with shuffle, batches are
    drawn from a buffer of `mix` shards at a time (more games per batch)."""
    q = Queue(maxsize=max(2, mix))
    fl = list(files)
    if shuffle:
        random.shuffle(fl)
    nxt = iter(range(len(fl)))
    lock = threading.Lock()
    done = [0]

    def loader():
        while True:
            with lock:
                i = next(nxt, None)
            if i is None:
                break
            z = np.load(fl[i])
            q.put((z["grid"], z["scal"], z["lab"]))
        with lock:
            done[0] += 1
            if done[0] == loaders:
                q.put(None)
    for _ in range(loaders):
        threading.Thread(target=loader, daemon=True).start()
    finished = False
    while not finished:
        parts = []
        while len(parts) < mix:
            item = q.get()
            if item is None:
                finished = True
                break
            parts.append(item)
        if not parts:
            return
        g, s, l = (np.concatenate([p[k] for p in parts]) if len(parts) > 1 else parts[0][k] for k in range(3))
        if len(zero):
            s = s.copy()
            s[:, list(zero)] = 0
        idx = np.random.permutation(len(g)) if shuffle else np.arange(len(g))
        if frac < 1:
            idx = idx[:int(len(idx) * frac)]
        for i in range(0, len(idx), batch):
            j = idx[i:i + batch]
            yield g[j], s[j], l[j]


VEC_PAIRS = [(33, 34), (36, 37), (39, 40), (48, 49)]  # spawn, enemy spawn, altar, previous move (dx, dy) scalars


def augment(g, s, l):
    """Random dihedral transform of the egocentric window, direction scalars and action labels (D4 symmetry)."""
    k = random.randrange(8)
    if k == 0:
        return g, s, l
    rot, flip = k % 4, k >= 4
    g = np.rot90(g, rot, axes=(2, 3))
    if flip:
        g = g[:, :, :, ::-1]
    g = np.ascontiguousarray(g)
    l = l.copy()

    def tf_xy(dx, dy):
        for _ in range(rot):  # rot90 counter-clockwise on (row=y, col=x): (x, y) -> (y, -x)
            dx, dy = dy, -dx
        if flip:
            dx = -dx
        return dx, dy
    mv = l[:, 0].astype(int)
    dx, dy = mv % 3 - 1, mv // 3 - 1
    ndx, ndy = tf_xy(dx, dy)
    l[:, 0] = (ndy + 1) * 3 + (ndx + 1)
    for c in (1, 3, 4):
        t = l[:, c].astype(int)
        has = t != NONE
        tx, ty = t % 15 - 7, t // 15 - 7
        ntx, nty = tf_xy(tx, ty)
        l[:, c] = np.where(has, (nty + 7) * 15 + (ntx + 7), NONE)
    s = s.copy()
    for ix, iy in VEC_PAIRS:
        s[:, ix], s[:, iy] = tf_xy(s[:, ix].copy(), s[:, iy].copy())
    if rot % 2:
        s[:, [46, 47]] = s[:, [47, 46]]
    return g, s, l


def aug_tables(dev):
    """Per transform k (0..7): move permutation [9], tile permutation [226], (rot, flip)."""
    tabs = []
    for k in range(8):
        rot, flip = k % 4, k >= 4
        def tf(dx, dy, rot=rot, flip=flip):  # bind this transform's values (closures bind late)
            for _ in range(rot):
                dx, dy = dy, -dx
            return (-dx if flip else dx), dy
        mv = torch.tensor([(lambda d: (d[1] + 1) * 3 + d[0] + 1)(tf(m % 3 - 1, m // 3 - 1)) for m in range(9)], device=dev)
        tl = torch.tensor([(lambda d: (d[1] + 7) * 15 + d[0] + 7)(tf(t % 15 - 7, t // 15 - 7)) for t in range(225)] + [NONE], device=dev)
        tabs.append((rot, flip, mv, tl, tf))
    return tabs


def gpu_augment(g, s, l, k, tabs):
    if k == 0:
        return g, s, l
    rot, flip, mv, tl, tf = tabs[k]
    g = torch.rot90(g, rot, dims=(2, 3))
    if flip:
        g = torch.flip(g, dims=(3,))
    l = l.clone()
    l[:, 0] = mv[l[:, 0]]
    for c in (1, 3, 4):
        l[:, c] = tl[l[:, c]]
    s = s.clone()
    for ix, iy in VEC_PAIRS:
        nx, ny = tf(s[:, ix].clone(), s[:, iy].clone())
        s[:, ix], s[:, iy] = nx, ny
    if rot % 2:
        s[:, [46, 47]] = s[:, [47, 46]]
    return g, s, l


def losses(out, lab):
    mv, att, cs, ct, wd, sp = out
    l_move = F.cross_entropy(mv, lab[:, 0])
    l_att = F.cross_entropy(att, lab[:, 1])
    l_cs = F.cross_entropy(cs, lab[:, 2])
    m = lab[:, 2] > 0
    l_ct = F.cross_entropy(ct[m], lab[m, 3]) if m.any() else mv.sum() * 0
    l_wd = F.cross_entropy(wd, lab[:, 4])
    l_sp = F.cross_entropy(sp, lab[:, 5])
    return l_move + l_att + l_cs + l_ct + 0.5 * l_wd + l_sp, (l_move, l_att, l_cs, l_ct, l_wd, l_sp)


@torch.no_grad()
def evaluate(model, files, dev, batch=4096, zero=()):
    model.eval()
    acc = {k: [0, 0] for k in ["move", "move_nonstay", "attack_any", "attack_tile_when_attack", "cast_slot", "cast_slot_when_cast",
                                  "cast_tile_when_cast", "ward_any", "special", "special_when_special", "all_heads"]}
    for g, s, l in shard_stream(files, batch, shuffle=False, zero=zero, loaders=4):
        gt = (torch.from_numpy(g).to(dev).float() / 255).contiguous(memory_format=torch.channels_last)
        st = torch.from_numpy(s).to(dev)
        lt = torch.from_numpy(l.astype(np.int64)).to(dev)
        with torch.autocast(device_type="cuda", dtype=torch.bfloat16, enabled=dev.type == "cuda"):
            mv, att, cs, ct, wd, sp = model(gt, st)
        pm, pa, pc, pt, pw, ps = mv.argmax(1), att.argmax(1), cs.argmax(1), ct.argmax(1), wd.argmax(1), sp.argmax(1)

        def add(k, ok, mask=None):
            if mask is not None:
                ok = ok[mask]
            acc[k][0] += int(ok.sum())
            acc[k][1] += int(ok.numel())
        add("move", pm == lt[:, 0])
        add("move_nonstay", pm == lt[:, 0], lt[:, 0] != 4)
        add("attack_any", (pa != NONE) == (lt[:, 1] != NONE))
        add("attack_tile_when_attack", pa == lt[:, 1], lt[:, 1] != NONE)
        add("cast_slot", pc == lt[:, 2])
        add("cast_slot_when_cast", pc == lt[:, 2], lt[:, 2] > 0)
        add("cast_tile_when_cast", pt == lt[:, 3], lt[:, 2] > 0)
        add("ward_any", (pw != NONE) == (lt[:, 4] != NONE))
        add("special", ps == lt[:, 5])
        add("special_when_special", ps == lt[:, 5], lt[:, 5] > 0)
        add("all_heads", (pm == lt[:, 0]) & (pa == lt[:, 1]) & (pc == lt[:, 2]) & (ps == lt[:, 5]))
    model.train()
    return {k: (v[0] / v[1] if v[1] else None, v[1]) for k, v in acc.items()}


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--epochs", type=int, default=3)
    ap.add_argument("--width", type=int, default=64)
    ap.add_argument("--blocks", type=int, default=6)
    ap.add_argument("--batch", type=int, default=512)
    ap.add_argument("--lr", type=float, default=2e-3)
    ap.add_argument("--no-history", action="store_true")
    ap.add_argument("--zero-scalars", default="", help=f"comma list of scalar indices to blank, e.g. {PRIORITY} (priority)")
    ap.add_argument("--no-augment", action="store_true")
    ap.add_argument("--max-train-shards", type=int, default=0)
    ap.add_argument("--max-val-shards", type=int, default=0)
    ap.add_argument("--max-test-shards", type=int, default=0)
    ap.add_argument("--sample-frac", type=float, default=1.0, help="use this random fraction of each shard's turns per epoch")
    ap.add_argument("--mix", type=int, default=1, help="shards shuffled together per buffer")
    ap.add_argument("--loaders", type=int, default=2, help="shard decompression threads")
    ap.add_argument("--compile", action="store_true")
    ap.add_argument("--ckpt-every", type=int, default=0, help="save a checkpoint every N steps")
    ap.add_argument("--tag", default="fishnet")
    ap.add_argument("--data-dir", default=os.path.join(HERE, "data"))
    ap.add_argument("--out-dir", default=os.path.join(HERE, "models"))
    a = ap.parse_args()
    dev = torch.device("cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu"))
    amp = dev.type == "cuda"
    train = sorted(glob.glob(os.path.join(a.data_dir, "train_*.npz")))
    val = sorted(glob.glob(os.path.join(a.data_dir, "val_*.npz")))
    test = sorted(glob.glob(os.path.join(a.data_dir, "test_*.npz")))
    if a.max_train_shards:
        train = train[:a.max_train_shards]
    if a.max_val_shards:
        val = val[:a.max_val_shards]
    if a.max_test_shards:
        test = test[:a.max_test_shards]
    print(f"device {dev}; shards train {len(train)} val {len(val)} test {len(test)}", flush=True)
    a.cin = int(np.load(train[0], mmap_mode="r")["grid"].shape[1])
    model = FishNet(cin=a.cin, width=a.width, blocks=a.blocks).to(dev).to(memory_format=torch.channels_last)
    print(f"params {sum(p.numel() for p in model.parameters()) / 1e6:.2f}M", flush=True)
    fwd = torch.compile(model) if a.compile else model
    opt = torch.optim.AdamW(model.parameters(), lr=a.lr, weight_decay=1e-4)
    n_batches = int(sum(len(np.load(f, mmap_mode="r")["lab"]) for f in train) * a.sample_frac) // a.batch * a.epochs
    sched = torch.optim.lr_scheduler.OneCycleLR(opt, max_lr=a.lr, total_steps=max(1, n_batches + 10))
    tables = aug_tables(dev)
    zero = zeroed_scalars(vars(a))
    step, t0 = 0, time.time()
    history = []
    for ep in range(a.epochs):
        run = torch.zeros(7, device=dev)
        cnt = 0
        for g, s, l in shard_stream(train, a.batch, zero=zero, mix=a.mix, loaders=a.loaders, frac=a.sample_frac):
            gt = (torch.from_numpy(g).to(dev, non_blocking=True).float() / 255).contiguous(memory_format=torch.channels_last)
            st = torch.from_numpy(s).to(dev, non_blocking=True)
            lt = torch.from_numpy(l.astype(np.int64)).to(dev, non_blocking=True)
            if not a.no_augment:
                gt, st, lt = gpu_augment(gt, st, lt, random.randrange(8), tables)
            with torch.autocast(device_type="cuda", dtype=torch.bfloat16, enabled=amp):
                out = fwd(gt, st)
            loss, parts = losses([o.float() for o in out], lt)
            opt.zero_grad(set_to_none=True)
            loss.backward()
            opt.step()
            if step < n_batches + 9:
                sched.step()
            step += 1
            run += torch.stack([loss.detach()] + [p.detach() for p in parts])
            cnt += 1
            if a.ckpt_every and step % a.ckpt_every == 0:
                os.makedirs(a.out_dir, exist_ok=True)
                torch.save({"state": model.state_dict(), "args": vars(a), "step": step}, os.path.join(a.out_dir, f"{a.tag}_ckpt.pt"))
            if step % 500 == 0:
                r = (run / cnt).tolist()
                print(f"ep {ep} step {step}/{n_batches} loss {r[0]:.3f} (move {r[1]:.3f} att {r[2]:.3f} cslot {r[3]:.3f} ctile {r[4]:.3f} ward {r[5]:.3f} spec {r[6]:.3f}) {time.time() - t0:.0f}s", flush=True)
                run.zero_()
                cnt = 0
        v = evaluate(model, val, dev, zero=zero)
        history.append({"epoch": ep, "val": v})
        print(f"epoch {ep} val: " + ", ".join(f"{k} {x[0]:.3f}" for k, x in v.items() if x[0] is not None), flush=True)
    os.makedirs(a.out_dir, exist_ok=True)
    torch.save({"state": model.state_dict(), "args": vars(a)}, os.path.join(a.out_dir, f"{a.tag}.pt"))
    te = evaluate(model, test, dev, zero=zero)
    print("test: " + ", ".join(f"{k} {x[0]:.3f} (n={x[1]})" for k, x in te.items() if x[0] is not None), flush=True)
    json.dump({"args": vars(a), "history": history, "test": te}, open(os.path.join(a.out_dir, f"{a.tag}_metrics.json"), "w"), indent=1)
