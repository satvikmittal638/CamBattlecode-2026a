# Winning meta against Intercontinental Fish and Mite, and a v62-based response (2026-10-25)

Sources: Codex's counter libraries v84 (Fish, 60/80 live) and v86 (Mite, 56/80 live). Their shipped byte tables were
decoded (`decode_tables.mjs`: 756,520 + 531,733 actions) and joined with the 160 reference replays they were copied
from (wins by Mite, Claudus Maximus, Trzy Kwaterki, prism/willow best girl, SSSA, NEETCoders ...). Our own side:
v62 (0/15 vs Fish, margin -867) and Codex's v62 variants v76-v81 (0-1/15 each). 440 games decoded in total
(`index.json`, `features.mjs`, `deaths.mjs`, `contact.mjs`, `actmix.mjs`, `fightodds.mjs`, `engage.mjs`, `mine_tables.mjs`).

## What the winners do that v62 does not

Per game, whole match (`aggregate.mjs`):

| | ref wins vs Fish | v62 vs Fish | ref wins vs Mite |
|---|---|---|---|
| our deaths / Fish-or-Mite deaths | 7.3 / 22.7 | 22.8 / 2.2 | 6.3 / 16.6 |
| our camp gems / theirs | 1048 / 715 | 257 / 998 | 1017 / 635 |
| first gem capture (round) | 76 | 148 | 119 |
| tributes, mean size | 25, 56 | 12, 9 | 27, 55 |
| wards placed | 171 | 64 | 140 |

### 1. Fight selection (the decisive difference)

Contact = one of our champions has an enemy champion within 6. Local HP share = (own + allies within 4) / (that +
enemies within 6).

* Winners are locally ahead (share >= .55) in 53% of their contact turns; v62 in 34%. v62 is clearly outmatched
  (share <= .42) in 42% of contact turns (winners 22%), and 27% of its contact turns are below .30 share.
* When outmatched, winners and Fish step away 41-48% of the time; v62 29%, and v62 keeps trading (35% of those turns).
* At the same share v62 converts far less: at share > .70 winners kill a nearby enemy within 10 rounds 28% of the time
  and die 1.3%; v62 kills 7.9% and dies 4.8% (Fish against v62: 55% / 0.3%).
* Support at contact (allies within 4), rounds 61-150: winners 1.31, v62 0.67; Fish against v62 2.30.
* Death context, rounds <= 300: v62 victims had 3.6 enemies / 0.9 allies within 6 (61% outnumbered); Fish victims of
  the winners had 2.3 / 1.7.

Code cause (v62 `tacticalFight`): the 2-turn danger sums every visible enemy's damage as if all of it lands on this
champion; any non-kill plan at >= 95% of HP is rejected, and a rejected plan returns "no action". In a 4v5 every
champion vetoes itself, so nobody commits, while the fallback only steps in at 2-4 tiles and otherwise returns to
camp work (v62 trace build, 99.66% replay-exact: with an enemy within 6, 25% camp actions, 12% farm, 12% routing,
5% fight plans).

Concrete example (00gem_fields/a, r35-41): Fish's Cassi sat at 210 HP for 8 rounds within 3 tiles of our full-HP
Heart and Vesper, untouched, while Marcella fought alone and died. The winner on the same map held the middle camp as
a 4-champion block and killed each Fish champion that walked in (Vesper 580 -> 182 -> dead in two rounds).

### 2. Opening: safe rich camps first, contest the centre with the whole team

00corners/b: v62 sent four champions to the centre camp by r25-40 and lost the fight to Fish's pack; the winner
cleared a 48-gem corner camp with all five, then took the centre at r80 as a full team. 00gem_fields/a: the winner
took the 71-gem middle at r29 with the group, then split to clear every small camp on its half (16 captures by r200;
v62: 4).

### 3. From the decoded byte tables (exact shipped actions)

* **Draft**: Vesper Vale, Heart of Ruin, Vendetta, Tavi, Marcella (Claudus Maximus vs Mite 33/80 cases; Mite vs Fish
  10); 4 picks Vesper, Vendetta, Heart, Tavi; 3 picks Vesper, Vendetta, Heart. Prism/Vesper/Heart (+Marcella, Ryth or
  Willow) is the alternative Fish counter (prism/willow best girl).
* **Items**: Treasure emblem first (Strength for Vesper/Tavi, Health for Vendetta/Heart), then Jungle, then
  Durability Health / Power / Bruiser. v62 buys the same families but 100-300 rounds later (an economy symptom).
* **Turn order**: the champion nearest an enemy gets top priority (55%), 30+ gem carriers act last (60%).
* **Wards**: re-placed on every charge (one ward per champion, 10-turn recharge), 2-4 tiles from the placer, 65% on our
  half. v62 only places on bush tiles and only when its ward is 7+ tiles away.
* **Tributes**: frequent 10-60 gem banks; 17% with an enemy within 6. Altar locks in half the games, ~50% followed by
  our own tribute within 3 rounds.
* **Targets**: with 2+ enemies in reach, the lowest-HP one 51-60%. Casts: Marcella slot 1, Tavi slot 1, Prism slot 0.
* **Tavi** buys 94% of its shards in the field.
* Mite, willow best girl, Trzy Kwaterki, SSSA, NEETCoders and :3 issue `recall` almost every turn and cancel it the
  next round (100%). No rule makes this useful; treated as a shared template/bait, not copied.

## v62m switches (workspace/bots/v62m, `m62_flags.h`, all default to v62)

| switch | change |
|---|---|
| M62_SHARE | tactical danger: an enemy with a healthy ally of ours nearer to it (or as near and weaker) counts x0.35 |
| M62_COMMIT | share >= .55: risk limit x1.6, 3 target choices, a rejected plan falls back to the plain attack/step-in logic |
| M62_FLEE | share < .35, enemy within 5, no kill: step toward a healthy ally (or away) before trading |
| M62_FOCUS | target order distance weight 30 -> 8 (allies converge on the weakest enemy) |
| M62_CHASE | share >= .6 and healthy: walk onto the weakest visible enemy within 6 instead of returning to camps |
| M62_WARD | re-place the ward on every charge 2-4 tiles out toward the enemy side |
| M62_NOLINK | a partner going low no longer sends a healthy champion home |
| M62_PRIO | winners'/Fish turn order (existing X_PRIO) |
| M62_DRAFT | 1 = Vesper, Heart, Vendetta, Tavi, Marcella |

v62m with defaults reproduces 99.72% of v62's platform turns (turnhost shadow, 15 Fish games).

## Tests

Contact-episode rollouts (114 first-contact states from the 15 v62-vs-Fish games, 15 rounds, `rollout_contacts_*`):

| variant | Fish replays its recording: focal deaths / our deaths / net kills | v62 bot plays Fish's side: same |
|---|---|---|
| base (v62) | 28.9% / 0.40 / -0.37 | 13.2% / 0.18 / -0.09 |
| flee | 9.6% / 0.19 / -0.16 | 6.1% / 0.09 / +0.01 |
| fight (share+commit+flee+focus) | 9.6% / 0.18 / -0.15 | 7.0% / 0.11 / -0.03 |
| prio | 16.7% / 0.21 / -0.11 | 19.3% / 0.24 / -0.12 |
| all (fight+prio+ward+nolink) | 7.9% / 0.12 / -0.06 | 13.2% / 0.18 / -0.09 |

A recorded opponent cannot chase, so it flatters retreat; turn order (prio) only looked good against it.

Local full games (7 local opponents, 22 pool+holdout maps, both sides, 308 games each; v62 237): flee 248 (+11 net),
fight 237, draft 236, core 234, ward 233. Later 48-game isolation runs were negative for almost every change
(base itself varied 32-34): v62's farming and fighting are tuned to beat mid-ladder bots.

## Why v62 loses (deeper decomposition, `items.mjs`, `goldsrc.mjs`, `campchoice.mjs`, `policy.mjs`)

* Economy from round 1: capture gold by r100 winners 335, v62 203 (Fish 410). Item shards at r100/r150: winners 8.9/17.8,
  v62 3.9/7.3, Fish 10.3/20.5. v62 opens with lone champions on Elk camps (2400 HP, 60 dmg/turn; 01broken_curve: three
  solo Elks, zero captures by r60, Heart dead at r24); winners clear wolf+cluster groups together and take the free
  gem clusters.
* First lethal fight: v62 r71 with equal numbers and HP but a third of Fish's items -> lost 69% (Mite 85%); winners r133,
  won 59%. Every later variant shows the same: Fish dies 2-3 times per game whatever v62 does.
* Finishing and escaping: v62 brings 11 Fish champions/game below 30% HP but kills 13% of them (winners 37%); its own
  low champions die 59% (winners 34%) because they hit 30% next to 2.7 enemies with 0.6 allies.
* Contact policy (same state buckets): healthy and outmatched at 2-6 tiles, winners/Fish step away 24-48% of turns,
  v62 steps closer 16-43% (camp routing ignores enemies).
* Dead 29% of champion-rounds before r600 vs Fish (winners 7.7%).

## Live tests (paired, deterministic opponents)

Plan A = v62's original 15 Fish cells, plan B = 15 other map/sides; same cells for Mite. Fish reproduces identical games
for identical bots (v62 rerun matched the morning to the round). Cells still flip chaotically between close variants
(01gold_rush, 00stampede, 00eight swing ~1500), so only multi-cell shifts mean anything.

| version / change | Fish A | Fish B | Mite A | Mite B |
|---|---|---|---|---|
| v62 (baseline) | 0/15, -867 | 0/15, -746 | 1/15, -616 | 1/15, -630 |
| v87 flee | 0/15, -850 | - | 0/15, -651 | - |
| v88 fightr: share+commit+flee+focus+chase+recallfake | 0/15, -851 | - | 0/15, -717 | - |
| v89 fightr2: no dead zone (commit/flee at .45), rally, nolink | 0/15, -864 | - | 0/15, -705 | - |
| v90 ballf: team ball + fightr2 | 0/15, -905 | - | 0/15, -751 | - |
| v91 aggro1: always commit, risk 1.6, escape .8, focus | 0/15, -824 | - | 0/15, -687 | - |
| v92 aggro2: aggro1 + chase .45, finish, fight to 25% HP | 0/15, -869 | 0/15, -749 | 2/15, -532 | 0/15, -738 |
| v93 napflee: no approach when outmatched + flee | 1/15, -713 | 0/15, -716 | 0/15, -665 | 1/15, -626 |
| v94 adapt: commit/chase/finish when ahead, no approach + flee when behind | 0/15, -839 | 0/15, -736 | 0/15, -635 | 1/15, -584 |
| v95 napci: napflee + Cassi/Issac pair targeting | 1/15, -732 | 0/15, -703 | 0/15, -666 | 0/15, -698 |

30-cell means (wins): v62 Fish -806 (0), Mite -623 (2); napflee Fish -714 (1), Mite -645 (1); napci Fish -717 (1),
Mite -682 (0); adapt Fish -788 (0), Mite -609 (1); aggro2 Fish -809 (0), Mite -635 (2).

Conclusion: backing off when locally outmatched (napflee) is the only change that moved Fish consistently (+90 margin on
both plans); nothing tried moves Mite reliably, and no general v62 change wins more than 1-2 of 30. The deficit is set
in the first 70 rounds (opening economy -> items -> first fight); tactics cannot recover it. v62 was restored as the
active bot after the tests.

## What would actually beat them

1. A rebuilt opening: team-cleared wolf/cluster groups and free gem clusters, no solo Elks, first lethal fight only at
   item parity (winners: r133). The opening-only ball and safe-opening switches here were crude and lost locally.
2. Fight execution at item parity: focus, finishing wounded enemies, retreating toward allies before 30% HP.
3. Opponent-specific play (v84/v86 libraries) would win 70-75% against these two but cannot be combined with general
   play cleanly: picks are simultaneous and the Fish and Mite libraries share the first pick in only 24/80 cells, so the
   draft must commit to one library before the opponent can be identified.
