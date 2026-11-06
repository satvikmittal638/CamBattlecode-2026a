> **Evaluation preference updated 2026-10-23:** The user said, “no need to switch side and play the match with the same team … this way we cover a larger pool of testing.” Future platform batches should use distinct opponents per challenge, rather than repeated side-swapped challenges against one team. Balance sides across different opponents. This supersedes the older 25-opponents-times-two sampling guidance. Keep the exact 100-challenge total and 50/50 rank-centered split when requested; use the closest unused eligible teams and report the resulting wider rank ranges. The v55 run had already accepted 50 paired challenges before this instruction; its remaining 50 were changed to 50 new opponents, giving 75 distinct opponents overall. See `analysis/v55_eval_2026-10-23/plan.json` and `plan_before_unique_preference.json`.

# Mimic-bot agent guide (shared by all four team agents)

Project root: `/Users/dmitt/Desktop/CamBattlecode` (all paths below are relative to it).

## What exists

| Path | What |
| --- | --- |
| `docs/official/GameRules.md` | Complete game rules + champion specs. Read fully first. |
| `docs/official/BotAPICpp.md` | Complete C++ SDK reference (we write bots in **C++**). |
| `docs/pages/` | Rendered handbook pages (guides: bitboards, distance fields, getting started). |
| `top_replays/<rank>_<team>/` | Every finished match of the four top teams: `index.json` (one row per match: map, opponent, side `a`/`b`, kind ranked/unranked, createdAt, won, drafts, gems, file), `groups/*.json` (platform per-match statistics: items bought, damage, gold...), `replays/*.repl26a`. Newest matches reflect the team's current bot version - weight them most. |
| `workspace/` | cambc workspace. Bots in `workspace/bots/`. Starter bots: `starter-cpp` etc. Maps in `workspace/maps/` (the 9 platform maps). |
| `.venv/bin/cambc` | CAMBC CLI 2.1.5 (already logged in for submit). |
| `tools/replay_dump.mjs` | Decode a replay into JSON (events: Move, Attack (+target champion/camp), Cast ability (+abilityType, target), Shop (+items delta), Sell, Place ward, Recall, Submit gems (+gemsCarried), Capture, Respawn (=death), Place altar lock, Consumable, Teleport, Set priority, Draft; plus per-round snapshots of every champion: pos, hp, gold, gems, items, alive). Importable: `import { dumpReplay } from '../tools/replay_dump.mjs'`. ~0.5 s per replay. |
| `tools/profile_team.mjs` | Aggregate a team's style over many replays (draft, build orders, abilities, captures, tributes, wards, recalls, kills/deaths, spatial habits). Works on `top_replays/<team>` (uses index.json side) or on any folder of replays with `--side a|b`. |
| `tools/bc.mjs` | Platform helper (session auto-refreshes): `quota`, `ladder [n]`, `submissions`, `set-active <id>`, `wait-build <id>`, `challenge <teamId> [5 comma-separated map names]`, `wait-group <groupId>`, `download-group <groupId> <dir>`, `team-groups <teamId>`, `lock <owner>`, `unlock <owner>`, `lock-status`. |

Team IDs:
- Mite (#1): `ee83f5e5-bcad-4923-86b4-b79ea6083d2e`
- KratosMessi (#2): `6599a236-7801-436f-a863-4acbb6aafa91`
- WHIM (#3): `4ce66a67-dc60-44f3-81f5-03997b963594`
- SHINK AI 6500 (#4 at download time): `84b02442-4aa2-4f9b-9738-83d4d5da8a6f`
- NOVA (#4/#5, moving): `772c398c-6856-4e72-a709-a20db9f67569`
- Our team: "Agentic Loop Builders" `6b04505b-d16c-4196-b7c6-53a4688a32ca`

Engine facts worth remembering: replay team 0 = side `a` = Team A, team 1 = side `b`. Champion type ids (replay): Ryth 0, VesperVale 1, Vendetta 2, Cassi 3, Issac 4, Stellar 5, Prism 6, Marcella 7, Willow 8, Ren 9, Varg 10, Tavi 11. Draft ids: same order but CassiAndIssac = 3, Stellar 4, Prism 5, Marcella 6, Willow 7, Ren 8, Varg 9, Tavi 10. Item index order is in `ITEM_NAMES` in `tools/replay_dump.mjs` (family x {Shard,Emblem} x {Strength,Focus,Health}; families Monster, Power, Durability, Treasure, Jungle, Home, Bruiser). Check the SDK headers in `workspace/sdk/cpp` for exact C++ enum names. **C++ bots get only 100k fuel per turn** (10x on the first draft turn, 2x on the first game turn); unfinished work resumes next turn. Prefer SDK bitboard / distance-field calls (engine-side) over hand-written loops; check `cambc::fuel_remaining()`.

## Local testing (cheap - do most of your iteration here)

```
cd workspace
../.venv/bin/cambc build <bot>                       # compile check
../.venv/bin/cambc run <botA> <botB> --map <name> -o replays/<your-slug> --statistics replays/<your-slug>/stats-<x>.json
```
A full match takes ~5-15 s. Use all 9 maps. Always pass `-o replays/<your-slug>` so agents don't mix files. You can play your mimic against the starter bots and against the other agents' mimic bots (`workspace/bots/mimic-*`) - read-only use of other agents' bots is fine, never edit them.

Profile your own bot's side of local replays: `node tools/profile_team.mjs workspace/replays/<your-slug> --side a --recent 40` (your bot must be botA there, or use `--side b`).

## Platform protocol (shared account, ONE active bot)

Challenges ("unranked matches") always play the team's **active** bot, 5 maps, no rating change. Our team quota is **30 challenges per rolling hour, shared by four agents**: you may start at most **6 challenges per hour and 16 in total**. Run `node tools/bc.mjs quota` first; if `used >= 24`, wait.

Everything that depends on which bot is active must happen while holding the lock:
1. Build locally first (`cambc build`) and run at least one local match - never submit code that hasn't compiled and run.
2. `node tools/bc.mjs lock <your-slug>` (blocks until free; stale after 25 min, so keep holds short).
3. `cd workspace && ../.venv/bin/cambc submit <bot>`; then `node tools/bc.mjs submissions` to get the new submission id.
4. `node tools/bc.mjs wait-build <id>`. If the build failed: unlock, fix, retry later.
5. `node tools/bc.mjs set-active <id>` (always, even if it already looks active).
6. `node tools/bc.mjs challenge <teamId>` (optionally 5 map names) -> note `groupId`.
7. `node tools/bc.mjs wait-group <groupId>`.
8. `node tools/bc.mjs unlock <your-slug>`.
9. Then (outside the lock) `node tools/bc.mjs download-group <groupId> analysis/<your-slug>/platform/<groupId>` and analyse.

You can re-challenge with an already-uploaded version: lock, `set-active <id>`, challenge, wait, unlock (no re-upload needed). Log every submission id, group id and result in `analysis/<your-slug>/platform_log.md`.

Note: whatever bot is active also plays our ranked ladder matches automatically. That's accepted; just don't leave a crashing bot active - if you discover a bot crashes, fix it before submitting.

## Storage and context hygiene

- The disk has ~40 GB free; keep your total footprint under 2 GB. Don't write full JSON dumps for hundreds of replays - decode in memory (import `dumpReplay`) and keep only small summaries. Delete scratch dumps when done.
- Write analysis scripts that print concise aggregates instead of dumping raw JSON into your context.
- Put your scripts, notes and outputs in `analysis/<your-slug>/`. Your bot goes in `workspace/bots/mimic-<your-slug>/`. Don't modify `tools/`, `docs/`, `top_replays/` or other agents' folders (create your own helper scripts instead).

## Deliverables (in `analysis/<your-slug>/`)

- `STYLE.md` - detailed description of the team's play style: draft logic (incl. by map / opponent picks), opening, farming route & camp choice, capture/tribute rhythm, shopping/build orders, ability usage, fighting & target selection, recall/retreat thresholds, wards, priority use, team coordination, map-specific behaviour, how it changed over recent versions. Back claims with numbers.
- `REPORT.md` - (1) fidelity: metric-by-metric comparison target vs your mimic in the head-to-head platform games and locally, final verdict; (2) head-to-head results per platform challenge; (3) generalization results vs other teams and how the mimic's behaviour there compares with the real team's behaviour vs similar opponents (overfitting check); (4) **"Good strategies worth fusing"**: the concrete mechanisms that make this team strong, ranked by estimated impact, each with how it's implemented in your bot (file/function); (5) weaknesses / exploitable habits.
- `platform_log.md`, your analysis scripts, and the final bot source in `workspace/bots/mimic-<your-slug>/`.
