"""Build behavioural-cloning tensors from extracted Fish observations (obs/<matchId>.tsv.gz).

    ../../.venv-analysis/bin/python build_dataset.py [--procs 8] [--keep-rest 0.25] [--games-per-shard 40] [--obs-dir obs] [--out-dir data]

One sample = one Fish champion turn, as that champion's own bot saw it (personal vision).
  grid  uint8 [C, 15, 15]  egocentric window (radius 7) around the champion, channels CH below
  scal  float32 [S]        own state + context (names in SCALARS)
  lab   int16 [L]          move(0-8, 4 = stay), attack(0-224 tile, 225 none), cast_slot(0 none,1,2),
                           cast_tile(0-224, 225 none/self), ward(0-224, 225 none), special(0 none,1 recall,2 submit,
                           3 cancel,4 lock,5 teleport)
Turns are kept when something is in view (enemy, camp within 6) or Fish did anything but move/stay;
the remaining plain-walking turns are subsampled (--keep-rest). Split by game: md5(matchId) % 20: 0-1 test, 2 val.
"""
import argparse
import gzip
import hashlib
import json
import os
from multiprocessing import Pool

import numpy as np

R = 7
W = 2 * R + 1
CH = ["inside", "wall", "bush", "altar", "own_spawn", "enemy_spawn", "ally_hp", "enemy_hp", "enemy_bag", "ally_bag",
      "enemy_ranged", "enemy_cd_ready", "camp_hp", "camp_awake", "camp_str", "camp_tile_static", "group_value", "group_reward_ready",
      "group_respawning"]
TYPES13 = ["Ryth", "VesperVale", "Vendetta", "Cassi", "Issac", "Stellar", "Prism", "Marcella", "Willow", "Ren", "Varg", "Tavi", "HeartOfRuin"]
# --features v2: per-champion detail (who exactly is there and what they can do right now).
CH_V2 = CH + ["enemy_str", "enemy_cd0_ready", "enemy_cd1_ready", "enemy_busy", "enemy_shards", "ally_ranged", "ally_str",
              "ally_cd_ready", "ally_shards"] + [f"enemy_{t}" for t in TYPES13] + [f"ally_{t}" for t in TYPES13]
SCALARS = [f"type_{i}" for i in range(13)] + ["hp_frac", "max_hp", "strength", "focus", "range", "gold", "gems", "cd0", "cd1",
           "can_move", "can_attack", "can_cast", "recalling", "submitting", "priority", "bank_own", "bank_enemy", "round",
           "shards", "on_own_spawn", "spawn_dx", "spawn_dy", "spawn_d", "enemy_spawn_dx", "enemy_spawn_dy", "enemy_spawn_d",
           "altar_dx", "altar_dy", "altar_d", "n_allies_vis", "n_enemies_vis", "nearest_enemy_d", "nearest_camp_d",
           "map_w", "map_h", "prev_move_dx", "prev_move_dy", "prev_attacked", "prev_cast", "hp_change", "rounds_since_attack"]
RANGED = {1, 3, 5, 6, 8, 11}  # Vesper, Cassi, Stellar, Prism, Willow, Tavi
HERE = os.path.dirname(os.path.abspath(__file__))


def pts(s):
    if not s:
        return []
    return [tuple(map(int, p.split(","))) for p in s.split(";") if p]


def parse_map(line):
    f = line[2:].split("|")
    w, h = map(int, f[0].split(","))
    layers = [pts(x) for x in f[1:7]]  # walls bushes holes altars allySpawn enemySpawn
    groups = {}
    tile_group = {}
    for g in (f[7].split(";") if len(f) > 7 and f[7] else []):
        parts = g.split(",")
        gid, gold, gems, resp = map(int, parts[:4])
        tiles = [tuple(map(int, c.split(":")[:2])) for c in parts[4:]]
        groups[gid] = (gold, gems, resp, tiles)
        for t in tiles:
            tile_group[t] = gid
    return w, h, layers, groups, tile_group


def cheb(a, b):
    return max(abs(a[0] - b[0]), abs(a[1] - b[1]))


def centre(ts):
    return (sum(t[0] for t in ts) / len(ts), sum(t[1] for t in ts) / len(ts)) if ts else (0, 0)


def game_samples(path, keep_rest, rng, features="v1"):
    with gzip.open(path, "rt") as fh:
        lines = fh.read().split("\n")
    w, h, (walls, bushes, holes, altars, own_sp, en_sp), groups, tile_group = parse_map(lines[0])
    static = np.zeros((6, h, w), np.uint8)
    for k, layer in enumerate([walls + holes, bushes, altars, own_sp, en_sp]):
        for x, y in layer:
            static[k + 1, y, x] = 255
    static[0] = 255
    gval = np.zeros((h, w), np.uint8)
    camp_static = np.zeros((h, w), np.uint8)
    for gid, (gold, gems, resp, tiles) in groups.items():
        v = min(255, gems + gold // 5)
        for x, y in tiles:
            if 0 <= x < w and 0 <= y < h:
                gval[y, x] = v
                camp_static[y, x] = 255
    own_c, en_c = centre(own_sp), centre(en_sp)
    hist = {}
    G, S, L, M = [], [], [], []
    for line in lines[1:]:
        if not line:
            continue
        rnd, cid, ctype, rep, obs = line.split("\t")
        rnd, cid = int(rnd), int(cid)
        sec = obs.split("|")
        sf = sec[1].split(",")
        handle, typ, x, y = int(sf[0]), int(sf[1]), int(sf[2]), int(sf[3])
        hp, mhp, stren, focus, rng_, state = float(sf[4]), float(sf[5]), float(sf[6]), float(sf[7]), int(sf[8]), int(sf[9])
        gold, gems, cd0, cd1, prio = int(sf[10]), int(sf[11]), int(sf[12]), int(sf[13]), int(sf[14])
        bank_own, bank_en = int(sf[17]), int(sf[18])
        items = sf[19].split(":") if len(sf) > 19 and sf[19] else []
        shards = 0
        for k in range(0, len(items) - 1, 2):
            i, n = int(items[k]), int(items[k + 1])
            shards += n * ((6 if i // 6 == 1 else 5) if i % 2 else 1)
        champs = [list(map(float, c.split(","))) for c in sec[2].split(";") if c] if len(sec) > 2 else []
        camps = [list(map(float, c.split(","))) for c in sec[3].split(";") if c] if len(sec) > 3 else []
        gstates = [list(map(int, c.split(","))) for c in sec[4].split(";") if c] if len(sec) > 4 else []

        # ---- labels from recorded actions ----
        mv, att, cslot, ctile, ward, special = 4, 225, 0, 225, 225, 0
        acts = [a for a in rep.split(";") if a]
        nonwalk = False
        def tile(px, py):
            dx, dy = px - x, py - y
            return (dy + R) * W + (dx + R) if abs(dx) <= R and abs(dy) <= R else 225
        for a in acts:
            op, _, arg = a.partition(" ")
            if op == "move":
                px, py = map(int, arg.split(","))
                dx, dy = max(-1, min(1, px - x)), max(-1, min(1, py - y))
                mv = (dy + 1) * 3 + (dx + 1)
            elif op == "attack":
                px, py = map(int, arg.split(","))
                if att == 225:
                    att = tile(px, py)
                nonwalk = True
            elif op.startswith("cast"):
                px, py = map(int, arg.split(","))
                if cslot == 0:
                    cslot = int(op[4:]) + 1
                    ctile = tile(px, py) if (px, py) != (x, y) else 225
                nonwalk = True
            elif op == "ward":
                px, py = map(int, arg.split(","))
                ward = tile(px, py)
                nonwalk = True
            elif op == "recall":
                special, nonwalk = 1, True
            elif op == "submit":
                special, nonwalk = 2, True
            elif op == "cancel":
                special, nonwalk = 3, True
            elif op == "consumable2":
                special, nonwalk = 4, True
            elif op == "consumable0":
                special, nonwalk = 5, True

        # ---- history (per champion) ----
        hprev = hist.get(cid)
        prev_dx = prev_dy = 0.0
        prev_att = prev_cast = 0.0
        hp_change = 0.0
        since_att = 99
        if hprev and hprev["r"] == rnd - 1:
            prev_dx, prev_dy = hprev["dx"], hprev["dy"]
            prev_att, prev_cast = hprev["att"], hprev["cast"]
            hp_change = (hp - hprev["hp"]) / max(1.0, mhp)
        if hprev:
            since_att = min(99, rnd - hprev["last_att"]) if hprev["last_att"] >= 0 else 99
        last_att = rnd if att != 225 else (hprev["last_att"] if hprev else -1)
        hist[cid] = {"r": rnd, "dx": (mv % 3) - 1, "dy": (mv // 3) - 1, "att": float(att != 225), "cast": float(cslot > 0), "hp": hp, "last_att": last_att}

        enemies = [c for c in champs if int(c[1]) == 1]
        allies = [c for c in champs if int(c[1]) == 0]
        ne = min([cheb((x, y), (c[3], c[4])) for c in enemies], default=99)
        nc = min([cheb((x, y), (c[1], c[2])) for c in camps], default=99)
        interesting = ne <= 8 or nc <= 6 or nonwalk or special
        if not interesting and rng.random() > keep_rest:
            continue

        # ---- grid ----
        g = np.zeros((len(CH_V2 if features == "v2" else CH), W, W), np.uint8)
        x0, y0 = x - R, y - R
        xs0, ys0 = max(0, x0), max(0, y0)
        xs1, ys1 = min(w, x0 + W), min(h, y0 + W)
        if xs1 > xs0 and ys1 > ys0:
            g[0:6, ys0 - y0:ys1 - y0, xs0 - x0:xs1 - x0] = static[:, ys0:ys1, xs0:xs1]
            g[15, ys0 - y0:ys1 - y0, xs0 - x0:xs1 - x0] = camp_static[ys0:ys1, xs0:xs1]
            g[16, ys0 - y0:ys1 - y0, xs0 - x0:xs1 - x0] = gval[ys0:ys1, xs0:xs1]

        def put(ch, px, py, v):
            px, py = int(px) - x0, int(py) - y0
            if 0 <= px < W and 0 <= py < W:
                g[ch, py, px] = max(g[ch, py, px], int(max(0, min(255, v))))
        for c in champs:
            team, ctyp, cx, cy, chp, cmhp, cstate, cgems, ccd0, ccd1 = int(c[1]), int(c[2]), c[3], c[4], c[5], c[6], int(c[9]), c[10], c[11], c[12]
            frac = 255 * chp / max(1.0, cmhp)
            if team == 0:
                put(6, cx, cy, max(1, frac)); put(9, cx, cy, cgems)
            else:
                put(7, cx, cy, max(1, frac)); put(8, cx, cy, cgems)
                put(10, cx, cy, 255 if ctyp in RANGED else 128)
                put(11, cx, cy, 255 if (ccd0 == 0 or ccd1 == 0) else 64)
            if features == "v2":
                cstr, cshards = c[7], c[13] if len(c) > 13 else 0
                if team == 0:
                    put(24, cx, cy, 255 if ctyp in RANGED else 128); put(25, cx, cy, 2 * cstr)
                    put(26, cx, cy, 255 if (ccd0 == 0 or ccd1 == 0) else 64); put(27, cx, cy, 8 * cshards)
                    if 0 <= ctyp < 13:
                        put(41 + ctyp, cx, cy, 255)
                else:
                    put(19, cx, cy, 2 * cstr); put(20, cx, cy, 255 if ccd0 == 0 else 64); put(21, cx, cy, 255 if ccd1 == 0 else 64)
                    put(22, cx, cy, 255 if cstate & 2 else (128 if cstate & 4 else 0)); put(23, cx, cy, 8 * cshards)
                    if 0 <= ctyp < 13:
                        put(28 + ctyp, cx, cy, 255)
        for c in camps:
            _, cx, cy, ctyp, chp, cmhp, cstr, awake, grp = c
            put(12, cx, cy, max(1, 255 * chp / max(1.0, cmhp)))
            put(13, cx, cy, 255 if awake else 0)
            put(14, cx, cy, cstr)
        for gid, st, timer in gstates:
            tiles = groups.get(gid, (0, 0, 0, []))[3]
            for tx, ty in tiles:
                if st == 2:
                    put(17, tx, ty, 255)
                elif st == 3:
                    put(18, tx, ty, max(1, 255 - 3 * timer))

        # ---- scalars ----
        ax, ay = min(altars, key=lambda a: cheb((x, y), a)) if altars else (x, y)
        sc = np.zeros(len(SCALARS), np.float32)
        if 0 <= typ < 13:
            sc[typ] = 1
        vals = [hp / max(1.0, mhp), mhp / 1000, stren / 100, focus / 100, rng_ / 3, gold / 100, gems / 100, cd0 / 8, cd1 / 8,
                float(bool(state & 8)), float(bool(state & 16)), float(bool(state & 2048)), float(bool(state & 2)), float(bool(state & 4)),
                prio / 10, bank_own / 1000, bank_en / 1000, rnd / 2000, shards / 30, float((x, y) in set(own_sp)),
                (own_c[0] - x) / 40, (own_c[1] - y) / 40, cheb((x, y), own_c) / 40, (en_c[0] - x) / 40, (en_c[1] - y) / 40, cheb((x, y), en_c) / 40,
                (ax - x) / 40, (ay - y) / 40, cheb((x, y), (ax, ay)) / 40, len(allies) / 5, len(enemies) / 5, min(ne, 20) / 20, min(nc, 20) / 20,
                w / 100, h / 100, prev_dx, prev_dy, prev_att, prev_cast, hp_change, since_att / 99]
        sc[13:13 + len(vals)] = vals
        G.append(g)
        S.append(sc)
        L.append(np.array([mv, att, cslot, ctile, ward, special], np.int16))
        M.append(np.array([rnd, typ, cid], np.int16))
    if not G:
        return None
    return np.stack(G), np.stack(S), np.stack(L), np.stack(M)


def split_of(mid):
    hsh = int(hashlib.md5(mid.encode()).hexdigest(), 16) % 20
    return "test" if hsh < 2 else ("val" if hsh == 2 else "train")


def build_shard(job):
    shard_id, split, items, keep_rest, obs_dir, out_dir, features = job
    rng = np.random.default_rng(shard_id)
    parts, gidx = [], []
    for k, mid in enumerate(items):
        r = game_samples(os.path.join(obs_dir, mid + ".tsv.gz"), keep_rest, rng, features)
        if r is None:
            continue
        parts.append(r)
        gidx.append(np.full(len(r[0]), k, np.int32))
    if not parts:
        return None
    out = os.path.join(out_dir, f"{split}_{shard_id:04d}.npz")
    tmp = os.path.join(out_dir, f"tmp_{split}_{shard_id:04d}.npz")  # renamed when complete (trainers glob "train_*")
    np.savez_compressed(tmp, grid=np.concatenate([p[0] for p in parts]), scal=np.concatenate([p[1] for p in parts]),
                        lab=np.concatenate([p[2] for p in parts]), meta=np.concatenate([p[3] for p in parts]),
                        game=np.concatenate(gidx), games=np.array(items))
    os.replace(tmp, out)
    return out, sum(len(p[0]) for p in parts)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--procs", type=int, default=8)
    ap.add_argument("--keep-rest", type=float, default=0.25)
    ap.add_argument("--games-per-shard", type=int, default=40)
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--obs-dir", default=os.path.join(HERE, "obs"))
    ap.add_argument("--out-dir", default=os.path.join(HERE, "data"))
    ap.add_argument("--features", default="v1", choices=["v1", "v2"])
    ap.add_argument("--games-file", help="only build these match ids (json list)")
    a = ap.parse_args()
    os.makedirs(a.out_dir, exist_ok=True)
    done = {f for f in os.listdir(a.out_dir) if f.endswith(".npz") and not f.startswith("tmp_")}
    built = set()
    for f in done:
        built.update(np.load(os.path.join(a.out_dir, f))["games"].tolist())
    games = sorted(f[:-7] for f in os.listdir(a.obs_dir) if f.endswith(".tsv.gz"))
    games = [g for g in games if g not in built]
    if a.games_file:
        keep = set(json.load(open(a.games_file)))
        games = [g for g in games if g in keep]
    if a.limit:
        games = games[:a.limit]
    by = {"train": [], "val": [], "test": []}
    for g in games:
        by[split_of(g)].append(g)
    start = max([int(f.split("_")[1][:4]) for f in done], default=-1) + 1
    jobs = []
    for split, gl in by.items():
        for i in range(0, len(gl), a.games_per_shard):
            jobs.append((start + len(jobs), split, gl[i:i + a.games_per_shard], a.keep_rest, a.obs_dir, a.out_dir, a.features))
    print(f"{len(games)} new games -> {len(jobs)} shards ({ {k: len(v) for k, v in by.items()} })", flush=True)
    with Pool(a.procs) as pool:
        for res in pool.imap_unordered(build_shard, jobs):
            if res:
                print(res, flush=True)
    json.dump({"channels": CH_V2 if a.features == "v2" else CH, "features": a.features, "scalars": SCALARS, "radius": R, "labels": ["move", "attack", "cast_slot", "cast_tile", "ward", "special"]},
              open(os.path.join(a.out_dir, "schema.json"), "w"), indent=1)
