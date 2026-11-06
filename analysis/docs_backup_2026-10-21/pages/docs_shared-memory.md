<!-- source: https://2026a.battlecode.co.uk/game/docs/shared-memory (language: cpp) -->

[◇ Game handbook](/game/docs)[Patch notes ↗](/game/patch-notes)

Game rulesShared memoryClose

Find a rule or champion

# Shared memory

1 min read · Current game rules

On this page

Each champion has its own bot instance, but there is a team memory buffer that is shared by your team, which cannot be read by the opponent.

Each team has 8 bytes of shared memory, that is readable and writable throughout the match.

In addition, there is the 1024 bytes of draft memory, that is writable during the draft phase, that becomes read-only for your champions during the match itself.
