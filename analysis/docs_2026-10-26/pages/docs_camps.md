<!-- source: https://2026a.battlecode.co.uk/game/docs/camps (language: cpp) -->

[◇ Game handbook](/game/docs)[Patch notes ↗](/game/patch-notes)

Game rulesCamps & captureClose

Find a rule or champion

# Camps & capture

2 min read · Current game rules

On this page

The main way to obtain resources is to defeat camps or monsters, on the map. They can spawn alone or in a group (any monsters that are cardinally connected).

## [Pick your target#](/game/docs/camps#monsters)

| Monster | Health | Strength | Range | Gold | Gems | Respawn |
| --- | --- | --- | --- | --- | --- | --- |
| Wolf | 1,350 | 20 | 3 | 40 | 4 | 40 rounds |
| Elk | 2,400 | 60 | 4 | 90 | 15 | 60 rounds |
| Golem | 5,000 | 120 | 4 | 160 | 36 | 80 rounds |
| Gem cluster | 120 | 0 | 0 | 0 | 7 | 50 rounds |
| Gold cluster | 120 | 0 | 0 | 20 | 0 | 50 rounds |
| Monolith | 20,000 | 200 | 5 | 300 | 200 | 150 rounds |

The map is populated with a variety of monsters. They vary in health , strength (damage dealt per turn) and the rewards they drop.

The monsters are friendly until they are hit! When a champion strikes a monster, it will awaken attacking the nearest champion every turn, until it either dies or has no targets in range for 2 turns.

## [After defeating a camp, make sure to capture!#](/game/docs/camps#clear-and-claim)

Capture a wolf camp Illustrated example

Capture area

Capture timer

**Not started**

Play

Capture progress

Clear the camp

1.  Clear
2.  Start
3.  4
4.  3
5.  2
6.  1
7.  Reward

**Clear the camp.** Defeat every monster in the group. Only then can the camp be captured.

After defeating an entire group (cardinally connected monsters), you can then capture the rewards by standing on one of the tiles a monster was underneath, and wait 5 turns (the capture timer). This will award the waiting champion the gold and gems from the camp. If there are multiple champions, the reward is split evenly among them.

## [What happens next?#](/game/docs/camps#respawns)

After a camp reward is captured, its respawn timer begins. After the timer has finished (ticking down by 1 each round), the camp will respawn in the same location as before, full health , ready to drop rewards again.

Capture and monster details

*   Rewards combine every monster in the group.
*   Allies on the region split the reward; the lowest ID gets the remainder.
*   Extra allies do not speed capture. Empty or contested regions reset it.
*   Wolf attacks at range 3, Elk and Golem at range 4, and Monolith at range 5. Monsters have vision 8, see through bushes and do not chase.
*   Damage wakes the group; two rounds without an in-range champion let it sleep.
