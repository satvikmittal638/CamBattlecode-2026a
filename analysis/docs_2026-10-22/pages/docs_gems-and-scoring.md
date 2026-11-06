<!-- source: https://2026a.battlecode.co.uk/game/docs/gems-and-scoring (language: cpp) -->

[◇ Game handbook](/game/docs)[Patch notes ↗](/game/patch-notes)

Game rulesGems & altarsClose

Find a rule or champion

# Gems & altars

2 min read · Current game rules

On this page

The main objective of the game is to obtain gems by capturing camps, or stealing them from enemies. To actually progress towards winning the game however, the gems must first be tributed at altars.

## [Carried or tributed#](/game/docs/gems-and-scoring#two-kinds)

In your bag**Carried gems**

*   Your killer takes them if you die
*   Worth nothing until tributed
*   [Prism](/game/docs/prism) gains Focus from them

Tribute at an altar**→**

Team score**Tributed gems**

*   Safe for the rest of the match
*   Count for your whole team
*   1,000 wins the match

## [Tribute at an altar#](/game/docs/gems-and-scoring#tribute)

Tributing requires a channel to secure the gems. The amount of time this takes scales with the number of gems you are carrying, namely the amount divided by 10, rounded up.

1.  Step 1**Stand next to an altar**Any of the eight tiles around it, diagonals included.
2.  Step 2**Start a tribute**You need at least one carried gem.
3.  Step 3**Stay for the channel**Duration of channel is equal to number of gems / 10 turns.

Actions that cancel your channel

*   Taking Damage**Continues**
*   Stun**Cancels**
*   Death**Cancels**
*   [Altar getting locked](#locks)**Cancels**

**22 gems**in your bag

→

**3 turn ends**to tribute

Try a different bag size

22 gems

Gems ÷ 10, rounded up, with a minimum of 1 turn end. Counts down at your turn end, including the starting turn. Resolves at your next turn start once zero.

Timing details

*   The channel ticks at the end of its champion’s turn, including the turn it starts. A timer that reaches zero stays pending until the start of that champion’s next turn. A one-tick tribute therefore completes at your next turn start, not at the end of the turn you start it.
*   Its length uses your bag when you start. Completion tributes your whole bag, including gems gained since.
*   Captures resolve before channels, so gems captured this round are included.

## [Altar locks#](/game/docs/gems-and-scoring#locks)

Altar locks are a consumable you can purchase for 10g, and carry one at a time. You can place them on altars if you are within range, cancelling enemy channels, or simply delaying them by leaving them there. It takes 5 basic attacks to clear the lock, which is also triggered by the tributing action in the engine.

Break an enemy altar lock Illustrated example

Basic attacks

**5 to break**

Play

Attacks on the lock

Enemy lock placed

1.  Locked
2.  1 hit
3.  2 hits
4.  3 hits
5.  4 hits
6.  Broken

**Enemy lock placed.** Your team cannot tribute at this altar. Placing the lock also cancelled any tributes already in progress here.

Your own team’s lock does not stop you: you can tribute past it, and only the enemy is blocked.

Tributing against a lock

Attempts to tribute against a locked altar are implicitly converted to auto attacks against the altar lock.
