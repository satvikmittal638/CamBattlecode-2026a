<!-- source: https://2026a.battlecode.co.uk/game/docs/maps-and-movement (language: cpp) -->

[◇ Game handbook](/game/docs)[Patch notes ↗](/game/patch-notes)

Game rulesMaps & movementClose

Find a rule or champion

# Maps & movement

2 min read · Current game rules

On this page

## [Map features#](/game/docs/maps-and-movement#map-features)

The map is a grid, between 30\*30 to 100\*100, built from 5 different tiles as shown below:

| Feature | Description |
| --- | --- |
| ![](/service/assets/wall-C-hg_vXE.png)Wall | Blocks line of sight, cannot be moved onto nor can it be dashed over. TP Crystal can reach walls. |
| ![](/service/assets/hole-DHvJ4UbX.png)Holes | Can be seen over, cannot be moved onto but can be dashed over. |
| ![](/service/assets/bush-Cx6MMfRU.png)Bush | Blocks line of sight, can be moved onto. If you are within a bush, you can see out of the bush. |
| ![](/service/assets/altar-DovrUKol.png)Altar | Cannot be moved onto, used to submit gems. |
| ![](/service/assets/spawn-ChBMbWwc.png)Spawn Tile | Cannot be moved onto by opponents. Your team's champions spawns onto these tiles. While standing on these tiles you are healed. |

The map also is populated with camps/monsters as outlined in the next section.

## [Ways to move#](/game/docs/maps-and-movement#distance)

To traverse the map, a champion can move 1 step every turn with their basic move action. Dashes move up to 2 steps, including diagonals, along a legal dash path. Teleport crystals reach up to 3 tiles horizontally and vertically, including diagonals, and ignore terrain between you and the destination.

Walkrange 1Dashrange 2Teleport crystalrange 3

*   Wall
*   Hole
*   Bush
*   Altar
*   Can land · 4

Walk one tile in any of eight directions. Walls, holes and the altar block it; bushes do not.

Ranges use Chebyshev distance. Units you can see also block landing; you can walk through allies but not land on them.

Ask the SDK for your movement mask rather than recomputing walking yourself; it already accounts for the units you can see.

An unseen enemy blocks a step Illustrated example

?

Play

Hidden blocker

Unseen occupant

1.  Before
2.  Attempt
3.  Retry

**Unseen occupant.** The bush hides an enemy. Your observed movement mask includes its tile because you cannot see the occupant.

**Hidden enemies still block**

If an otherwise legal destination has an unseen occupant, the action returns `false` without throwing. The blocked tile is revealed to your champion for the rest of the round, and the attempt does not consume your movement allowance, ability cooldown or consumable, so you can try another destination. A destination already known to be occupied raises an error (`cambc::error` in C++). A successful action returns `true`. These rules also apply to dashes and teleport crystals; for a crystal, `true` means its channel started successfully.
