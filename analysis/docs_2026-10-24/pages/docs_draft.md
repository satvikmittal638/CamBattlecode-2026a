<!-- source: https://2026a.battlecode.co.uk/game/docs/draft (language: cpp) -->

[◇ Game handbook](/game/docs)[Patch notes ↗](/game/patch-notes)

Game rulesDraftingClose

Find a rule or champion

# Drafting

2 min read · Current game rules

On this page

## [Choosing champions#](/game/docs/draft#picks)

Before the match begins, you must select your team of “champions”.

The map is fully visible in the drafting phase. By looking at the map layout, and where the monsters/camps are, your code can make an informed decision on the best champions to tackle the job.

Depending on the map, each team will select between 3 and 5 champions.

Champions are picked one by one.

For fairness, both teams select champions simultaneously, revealing their picks as they go.

Champions are unique, so you may only pick one of each, though you can select the same champions as your opponent, see the table below:

Selection rules
| Choice | Allowed |
| --- | --- |
| Not selected by your team | ✓ |
| Already selected by your team | ✗ |
| Selected by the opposing team | ✓ |
| Cassi & Issac (one selection) | ✓ |

## [Shared draft memory#](/game/docs/draft#instances)

In addition to picking your champions, the drafting phase allows you to think carefully about your strategy and communicate it to your bots (code controlling the champions).

This is achieved by writing your opening plan into the 1024 byte draft memory, which can be read by your champion bots later.

The draft phase has additional fuel (compute) and can see the entire map layout, allowing for extra planning ahead.

[

Shared memory ↗

Your team’s two scratchpads: 1,024 bytes saved in the draft, and 8 bytes shared all match.

](/game/docs/shared-memory)

## [After the draft#](/game/docs/draft#start)

After the draft, the selected champions are placed on each team's corresponding spawn tiles at full health .

## [Missing a pick#](/game/docs/draft#fallback)

If a draft bot yields, exhausts its fuel, or crashes without making a pick, the remaining selections are randomly selected by the game.

[

Fuel ↗

Bots have a computation limit enforced via Wasmtime fuel. Fuel roughly corresponds to CPU instructions, though it isn't perfectly 1:1. Using fuel rather than time means that execution is deterministic and machine-independent. Since some languages are more instruction efficient than others, there are different fuel limits for different languages.

](/game/docs/fuel)

[

![](/service/assets/battlecode-cats-small-BEW7MDgz.webp)Champion roster ↗

](/game/docs/champions)
