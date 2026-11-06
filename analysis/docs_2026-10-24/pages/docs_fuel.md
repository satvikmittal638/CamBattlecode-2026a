<!-- source: https://2026a.battlecode.co.uk/game/docs/fuel (language: cpp) -->

[◇ Game handbook](/game/docs)[Patch notes ↗](/game/patch-notes)

Game rulesFuelClose

Find a rule or champion

# Fuel

1 min read · Current game rules

On this page

Bots have a computation limit enforced via Wasmtime fuel. Fuel roughly corresponds to CPU instructions, though it isn't perfectly 1:1. Using fuel rather than time means that execution is deterministic and machine-independent. Since some languages are more instruction efficient than others, there are different fuel limits for different languages.

By default, a C++ or Rust bot gets 100k fuel per turn. OCaml gets 5 times the C++ limit, and Python gets 25 times the C++ limit.

When a bot runs out of fuel, its execution is suspended and the next bot in the turn order gets to go. The next round, this bot's turn will resume from the point of suspension and continues.

We provide bots with 10x fuel for the first turn of draft, to facilitate precomputation, and 2x fuel for the first turn of play, giving bots room to initialise and precompute. Unused fuel at the end of a turn is not added to the next turn's fuel budget.
