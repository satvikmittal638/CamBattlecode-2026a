# v44 "current-rules" candidate — evaluation review (continuing Codex's v43 review)

Context: Codex's `analysis/active_bot_review_2026-10-21/REPORT.md` found v43 (teammate, active & pinned at
13:34 UTC 21 Oct) keeps an inherited Monolith "safe ring" at range 4 although current rules give Monoliths
range 5, plus other inherited policies. A follow-up candidate was built in `workspace/bots/rules-fix-v43`
(`analysis/v44_rules_fix/integrate.py`: `workMonolith` with modelled camp threat ranges in both controllers;
boss scoring no longer assumes zero camp damage; tribute-interrupt risk check for all champions/maps) and
evaluated in `analysis/v44_rules_fix/field1` (cambc 3.0.4 / **engine 1.0.2**, 35 maps × tm30, v27, edge ×
both sides, 420 games). Nobody had analysed field1; this review does. No bot code, platform calls or matches
were made for this review.

## Checks
- Control `rules-control-v43` source == downloaded v43 (25/25 files identical).
- field1: runner exit 0, 420/420 stats on engine 1.0.2, 0 errors, 0 faults, sources unchanged during run.

## Results (engine-authoritative: official statistics `champions[].metrics`, `events[]`)
Wins: control (v43) 194/210, fix 195/210; paired flips +5/−4 (inconclusive). By map group, per game:

| group | n/variant | wins base→fix | deaths | submitted gems | other |
|---|---|---|---|---|---|
| contest (boss-only) | 6 | 6→6 (all 0–0 gold tiebreaks) | 62.0→56.7 | 0→0 | kills 27.2→32.3, earned gold 10.0k→10.9k; no team ever collected gems — local opponents do not take Monoliths, so the gem path of the fix is not exercised here |
| boss_battle | 6 | 6→5 | 6.0→6.7 | 300→162 | monster damage taken 79.8k→82.4k |
| monolith | 6 | 5→6 | 4.0→2.7 | 1005→1005 | champion damage taken 12.3k→8.6k |
| other 32 maps | 192 | 177→178 | 5.7→5.4 | 964→972 | — |

Regression signals:
1. **boss_battle vs tm30** — the only local opponent that fights over the boss, i.e. exactly where the
   Monolith change acts: side a W 549–433 → L 341–748; side b W 1252–53 → W 630–425. n = 2, so not
   conclusive, but both move the same way on the targeted behaviour.
2. **Engine-recorded `fuelExhausted` events (our side):** control 5 games × 1 event; fix 7 events in each of
   two lanes games (v27 a, edge a) plus 3 single events. Suspended turns resume mid-logic next round.
   Cause not isolated (candidate: the tribute-risk check now evaluated for every champion every turn).

## Assessment
Not a demonstrated improvement; do not submit as is. The rule correction itself (Monolith range 5) is
well-founded, but the implemented positioning/finishing policy looks weaker where an opponent contests the
boss, and the added checks cost fuel on camp-dense lanes.

## Suggested next steps (not run)
- Inspect the two tm30 boss_battle replays (needs the 1.0.2 decoder wasm; ours stops at 1.0.1) to see whether
  our casters now hold out of range or concede the finish.
- Isolate the two changes: (a) Monolith/boss positioning only, (b) tribute-risk check only (gate it to
  carriers with gems and an enemy champion in personal vision), each vs v43 on boss maps + lanes, with
  fuelExhausted events and submitted gems as predeclared mechanism metrics.
- Codex's remaining items: compare v41/v42/v43 on engine 1.0.2 and isolate v43's draft, low-budget targeting
  and Heart emblem; test the boss-steal policy against an opponent that grinds bosses (tm30 is the only local
  one); Vesper capture priority.

Files: `analysis/v44_review/stats_compare.mjs`, `stats_compare.log`.
