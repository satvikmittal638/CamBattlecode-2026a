# mimic-shink report

Bot: `workspace/bots/mimic-shink/src/` (`draft.cpp` draft table/rules, `bot.cpp` everything else).
Style analysis: `STYLE.md`. Platform runs: `platform_log.md`. Scripts: `analysis/shink/*.mjs`
(`compare.mjs <refDir> <otherDir>` prints the metric-by-metric fidelity table used below).

_Status: platform sections are filled in as challenges complete._

## 1. Fidelity

### 1a. Local (mimic vs itself, 9 maps, side A) vs SHINK newest 30 platform games

| metric | SHINK | mimic | diff |
| --- | --- | --- | --- |
| draft per map | table in STYLE §2 | identical on all 9 maps | exact |
| item build | Jungle*Str > Durability*Str > Bruiser*Hp > Power Str | same | exact |
| captures / game | 25.1 | 23.2 | -7% |
| first capture round | 35.2 | 35.4 | +1% |
| tributes / game | 22.4 | 21.3 | -5% |
| gems per tribute | 45.9 | 45.1 | -2% |
| first tribute round | 56.6 | 46.4 | -18% |
| recalls / game | 19.0 | 21.1 | +11% |
| recall hp median / share with hp < 50% | 0.47 / 0.52 | 0.44 / 0.57 | -6% / +9% |
| recalls started on a capture tile | 0.30 | 0.37 | +24% |
| kills / game | 2.8 | 2.6 | -8% |
| attacks on champions (share) | 0.14 | 0.11 | -23% |
| shared captures | 0.11 | 0.10 | -15% |
| time on enemy half | 0.07 | 0.06 | -20% |
| nearest ally distance | 6.8 | 7.3 | +7% |
| camp attack mix wolf / elk / gem | 0.47 / 0.27 / 0.22 | 0.54 / 0.24 / 0.18 | +16% / -8% / -17% |
| wards, locks, consumables, priority | 0 | 0 | exact |
| dashes / game Vendetta, Issac | 38 / 35 | 34 / 35 | -12% / -2% |
| attack resets / game Vendetta, Varg, Issac | 25 / 18 / 19 | 26 / 18 / 18 | ~0% |
| Varg shields / game | 12.4 | 12.5 | +1% |

(Mirror deaths, 6.6/game, are not comparable: both sides are SHINK-like brawlers; vs the starter bot the
mimic dies ~0.5 times per game, never to camps.)

## 2. Head-to-head vs SHINK AI 6500 (platform)

_pending_

## 3. Generalisation (Full Damage, Valenki, larp)

SHINK's historical record (its newest games vs each): Full Damage 11/15 wins (gems 978-790, 27.9 captures,
3.0 deaths), Valenki 3/5 (807-871, 6.2 deaths), larp 5/10 (835-928, 6.5 deaths, 0.5 kills), Mite 5/30.

_pending_

## 4. Good strategies worth fusing (ranked by estimated impact)

_draft - finalised after the platform runs_

1. **Gem-first camp valuation + one-farmer-per-group claims.** Score every camp group as
   `gems * (elk ? 0.8 : 1) / (path distance + remaining hp / 200 + 6)`, ignore gold-only groups and monoliths,
   and publish the chosen group in the 8-byte shared memory (`byte[slot] = group + 1`) so allies pick other
   groups (capacity 1 per ~1350 hp, 3 for elk groups) and only one champion stands on a dead group (rewards are
   split between everyone on it). `bot.cpp`: `group_score`, `choose_target`, `read_claims`/`write_claim`.
2. **Bank after every capture.** Tribute at >= 25 gems (or whenever the altar is nearer than the next camp).
   `bot.cpp`: "Bank gems" block, `go_tribute`.
3. **Recall-during-capture.** Start the 5-turn recall on the capture tile while the 5-round capture runs.
   `bot.cpp`: capture branch in `play_turn_inner`.
4. **Survivable solo farming build** (Jungle Str > Durability Str > Bruiser Hp > Power Str) + `can_solo`
   feasibility check + walk out of camp range before recalling. `bot.cpp`: `shop`, `can_solo`, low-hp block.
5. **Draft for parallel farming** (Vendetta, Varg, C&I, Ryth + map swaps). `draft.cpp`.
6. **Opportunistic fighting only** (hit in-range enemies, chase < 40% hp ones). `fight_enemies`, `chase`.
7. **Dash as a movement-speed buff.** `step_on_field`, `greedy_step`.

## 5. Weaknesses / exploitable habits

- Loses most games to Mite (5/30): solo farmers can be collapsed on one at a time; fights while outnumbered.
- Corners-type maps (contested central gem clusters, no gold): never buys items there (1 win in the last 7).
- No vision control (0 wards), no altar locks; predictable capture -> nearest-altar route.
- Cassi&Issac die together most often (1.17 deaths/game) because Cassi wanders on her own.
