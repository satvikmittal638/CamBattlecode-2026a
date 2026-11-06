<!-- source: https://2026a.battlecode.co.uk/game/docs/vision (language: cpp) -->

[◇ Game handbook](/game/docs)[Patch notes ↗](/game/patch-notes)

Game rulesVision & wardsClose

Find a rule or champion

# Vision & wards

2 min read · Current game rules

On this page

## [How vision is calculated#](/game/docs/vision#shadowcasting)

Vision in the game is raycast, you can try it with the interactive vision tool below. To be more precise, the system uses symmetric shadow casting based on Albert Ford's algorithm.

[Albert Ford: Symmetric Shadowcasting — explanation and interactive example →](https://www.albertford.com/shadowcasting/)

## [What you can see#](/game/docs/vision#line-of-sight)

Line of sight Interactive · uses the game’s vision rules

Your championPlace a ward

Your champion sees 8 tiles. Hover over any tile to trace its line of sight.

*   Your champion sees
*   Your ward sees
*   In range, out of sight
*   Out of range
*   Wall
*   Bush

Vision is ray cast from the centre of your tile out to 8 tiles, including diagonals. Walls and bushes stop the rays, leaving shadows behind them. Move your champion into a bush to see across it, or place a ward to see around a corner.

*   You see up to 8 tiles away in every direction, including diagonally, if nothing blocks the line of sight.
*   Walls block sight. So do bushes: from outside, you cannot see into a bush or past it.
*   Standing in a bush, you see across that whole bush and out of it, but not into other bushes.
*   Holes cannot be stood on, but they do not block sight

## [Wards#](/game/docs/vision#wards)

Each champion has a free ward, that can be placed to expand their personal vision. Its charge recharges over 10 owner turn ends. Placing a new ward replaces your existing ward, so you only ever have one active.

*   **One active ward**A new ward replaces the old one.
*   **Permanent**Wards do not expire or take damage.

## [Vision is not shared among allies#](/game/docs/vision#personal-vision)

Vision per champion is only their own, plus their own ward. You cannot see what your ally champions see, nor their wards. However, if you spot something of note, you can use the shared memory to try to communicate the information to your team.
