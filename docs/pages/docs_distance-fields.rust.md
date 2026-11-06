<!-- source: https://2026a.battlecode.co.uk/game/docs/distance-fields (language: rust) -->

[◇ Game handbook](/game/docs)[Patch notes ↗](/game/patch-notes)

GuidesDistance FieldsClose

Find a rule or champion

Code language

# Distance Fields

5 min read · Current game rules

On this page

## [Basics#](/game/docs/distance-fields#basics)

A bitboard answers yes or no for each tile. A distance field stores a number instead: the shortest number of steps from that tile to a goal, using the obstacles you supplied. Goals have distance 0; their open neighbours have distance 1; the next layer has distance 2, and so on.

The search spreads out like a wave from the goal. Because each move costs one, a first-in, first-out queue visits tiles in increasing distance order. This is breadth-first search (BFS). Start from all goal tiles at once to find the distance to whichever is closest by an open route.

*   Path towards a camp, an altar approach tile, or any other set of acceptable destinations.
*   Compare targets by reachable path length instead of straight-line distance.
*   Reuse one field to guide several positions towards the same goals, when their movement constraints match.

For ordinary grid steps, the field considers eight neighbours, including diagonals, with a cost of one per step. Walls are excluded. An unreached tile has no known distance; once a full search finishes, it is unreachable through the supplied open tiles.

## [Interactive pathfinding#](/game/docs/distance-fields#pathing)

Place the start and goal and draw walls. The example uses the selected language's SDK to create a distance field, compute it from the goal, choose a direction with `next_move_from`, and move once per turn. Play or drag the slider to follow each highlighted SDK call.

Edit grid

Select a tile to edit it. Changes restart the example. S = start, G = goal, # = wall, ∞ = unreached. Diagonal steps cost one, just like horizontal and vertical steps.

∞∞∞#∞∞∞∞S∞∞∞#∞∞∞G∞∞∞∞#∞∞∞∞∞∞∞#∞∞∞∞∞∞∞#∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞#∞∞∞∞∞∞∞#∞∞∞∞

Filled = route; solid outline = current tile; dashed outline = destination selected by the SDK.

**Rust SDK: one champion turn**

`walls` is a blockers bitboard and `goal` is a tile position. Run this fragment each turn; Rust uses a function returning `cambc::Result`. Use the usual SDK import for your language.

1.  `let mut goals = bc::Bitboard::new()?; let mut visited = bc::Bitboard::new()?; goals.set(goal, true)?; let mut field = bc::DistanceField::new()?;`
2.  `field.compute(&walls, &goals, &mut visited, bc::DistanceField::UNREACHABLE)?;`
3.  `let me = bc::self_champion()?.expect("champion turn"); let position = me.position()?;`
4.  `let direction = field.next_move_from(position)?;`
5.  `if let Some(direction) = direction {`
6.  `let moved = me.r#move(direction)?; }`
7.  `bc::end_turn();`

Example step

PlayPrevious lineNext lineField onlyShow routeRestart stepsReset grid

Step 1 of 54: Create a goals bitboard containing the destination, a visited bitboard, and a distance field.

**A teaching model**

This example uses an 8×8 grid and only the walls you draw. Diagonal moves check the destination tile rather than imposing an extra corner-cutting restriction. The browser models these SDK calls; it is not running a live bot. Supply current blockers and an open goal, and only run this handler for a living champion that can move. A hidden blocker can make `move` return false; refresh observations and retry on a later turn.

## [Common pitfalls#](/game/docs/distance-fields#pitfalls)

A goal on a blocked tile is ignored. If it is your only goal, nothing expands and every distance remains unreachable (65535). An occupied monster tile is a common trap: keep the monster blocked and use open tiles within attack range as goals instead.

These snippets assume `target` is an occupied monster position and `attack_tiles` is a bitboard of tiles from which your champion can attack it. The `walls` mask includes terrain and occupied tiles.

Wrong: the only goal is blocked

```
let mut goals = cambc::Bitboard::new()?;
goals.set(target, true)?; // target is also in walls.
field.compute(&walls, &goals, &mut visited, cambc::DistanceField::UNREACHABLE)?;
```

Correct: path to open attack positions

```
let goals = attack_tiles.intersect(&walls.complement()?)?;
field.compute(&walls, &goals, &mut visited, cambc::DistanceField::UNREACHABLE)?;
if let Some(step) = field.next_move_from(position)? {
    // Use this direction for your movement action.
}
```

*   Clearing an occupied or impassable goal permits planning towards it, but does not make it a legal landing tile. Use open attack positions when the route must end on a walkable tile.
*   If your champion is included in the occupancy mask, exclude its own current tile from that mask before computing, so its starting distance is available.
*   Check for unreachable before choosing a step. Disconnected goals and empty goal sets also produce no route.
*   With a limited or early-stopped search, unreachable can mean not yet computed. Recompute when goals or blockers change.

## [Approach a blocked target#](/game/docs/distance-fields#move-towards)

The champion move\_towards helper always treats the supplied target tile as free for pathfinding. You can pass a camp or opponent position directly; other blockers are still avoided. Stop at the desired attack or interaction range: if the chosen step lands on a known occupied or impassable target, the engine rejects it with a movement error. This convenience does not change how the lower-level distance-field functions handle blocked goals.

## [Use the SDK#](/game/docs/distance-fields#sdk)

Supply a walls bitboard for blocked destinations, a goals bitboard containing acceptable destination tiles, and a reusable visited bitboard. Compute the field before reading it. Goal tiles should be open. The SDK does the search for you; you do not need to implement breadth-first search yourself.

Rust: compute a field and choose a step

```
// Inside a function returning cambc::Result.
// walls and goals are Bitboards; position is your champion's tile.
let mut field = cambc::DistanceField::new()?;
let mut visited = cambc::Bitboard::new()?;
field.compute(&walls, &goals, &mut visited,
              cambc::DistanceField::UNREACHABLE)?;
let distance = field.get(position)?;
let direction = field.next_move_from(position)?; // Option<Vec2>.
// Check direction before using it in a movement action.
```

`next_move_from` returns a direction delta, not an absolute destination, and returns no step at a goal or an unreached tile. `next_moves_from` returns all equally good direction deltas. The SDK selects ties in compass order from north; your bot can use all choices to apply its own preferences.

Unreached SDK distances use 65535, not mathematical infinity. The example displays ∞ for readability. If a search has a distance limit or stops early at destinations, unreached does not necessarily mean impossible: it can simply mean the search did not get that far.

## [Ordinary steps only#](/game/docs/distance-fields#movement-limits)

**Special movement needs extra planning**

Distance fields count ordinary steps around blocked tiles. They do not model dashes, teleportation or other abilities. Those movements need additional routing logic and their own range, cooldown and destination checks.

## [Advanced: representation and search#](/game/docs/distance-fields#advanced)

The engine stores 16-bit distances in a chunked layout. Use `get` and the SDK import/export helpers rather than assuming the raw buffer is a flat grid. Raw and linear exports have different layouts.

A queue-based BFS visits each reachable tile once and examines a fixed number of neighbours. The engine can perform expansions using bitboards; the demonstration computes that field first, then exposes each decision made while following it. Equal-cost movement is essential: use a weighted shortest-path algorithm if your routing model gives different steps different costs.
