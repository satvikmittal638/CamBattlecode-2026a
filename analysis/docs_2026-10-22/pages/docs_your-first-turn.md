<!-- source: https://2026a.battlecode.co.uk/game/docs/your-first-turn (language: cpp) -->

[◇ Game handbook](/game/docs)[Patch notes ↗](/game/patch-notes)

Game rulesA champion turnClose

Find a rule or champion

# A champion turn

Each turn a champion has a few options.

Every turn a champion can move one tile, in any 8 directions

Make a basic attack, dealing damage equal to their strength to a target in range

And use one of their two champion abilities, to activate a more powerful effect

If you are a ranged champion, you may NOT move, and basic attack on the same turn. This same rule applies for damaging abilities that are ranged as well.

![](/service/assets/battlecode-knight-small-C2yNqawX.webp)**Melee**

**Walk****AND****Attack**

Walk and make a basic attack in the same turn.

![](/service/assets/battlecode-wanted-small-CtP5pJ6m.webp)**Ranged**

**Walk****OR****Attack**

A normal walk spends your attack, and attacking spends your walk.

The basic rule, before spells. An attack-reset spell can restore an attack.

In addition to the basic combat, a champion has a few other options to interact.

Each champion carries a ward, that grants them persistent vision of an area with a range of 6 tiles. They may leave this ward behind to keep watch of an area anywhere within 2 tiles of them, and can relocate it once its free ward charge has recharged over 10 owner turn ends.

When a champion is low on health , or simply needs to travel to their spawn tiles, they can activate a recall. This cancellable action takes 5 turns, and will teleport the champion straight to their spawn tiles.

On the spawn tiles, they may shop for items using gold an unlimited amount.

When carrying the all important gems, and are directly next to an altar, a feature of the map, a champion may tribute gems, a cancellable action that takes a number of turns, equal to the number of gems being tributed divided by 10

Additionally, you can use consumable items without limit (though you can only carry one of each at once).

Everything you can do

Your turn: everything you can do Three kinds of limit

**Once every turn**Refills when your next turn starts

*   **Walk1×**One tile, in any of eight directions
    *   Not after an “excludes walking” spell
*   **Basic attack1×**One visible enemy, camp or altar lock in range
    *   Melee 1 tile · ranged 3
    *   Ranged: uses up your walk
*   **Ability1×**Slot 0 or slot 1, never both
    *   8-round cooldown per slot
    *   Some reset your basic attack

**Whenever you have one**No per-turn limit

*   **Place a ward1 charge**Within 2 tiles; it sees 6 tiles
    *   Recharges over 10 owner turn ends
    *   One active ward; a new one replaces it
*   **Use a consumable1 of each**Crystal or altar lock
    *   10 gold each
    *   Used up when used
*   **ShopAny amount**Shards, emblems and consumables
    *   Only on your spawn…
    *   …or while you are dead

**Timers tick at the end of your turn**Timers count down now, and those reaching zero resolve at the start of your next turn.

*   **Recall5 turn ends**Return to your spawn
    *   3 turn ends with a Home emblem
    *   Damage or a stun cancels it
*   **Tribute gemsGems ÷ 10 / min 1**From a tile touching an altar
    *   Needs at least one carried gem
    *   Stun, death or a new lock cancels it
*   **Teleport crystal3 turn ends**Travel to a free tile within range three
    *   Damage doesn’t stop it; a stun does
    *   You can’t cancel it yourself

Can’t act?**Stunned**→_No actions_**Channelling**→_Cancel only_**Dead**→_Shop only_

Mix actions from all three rows in one turn, then end it. You can walk or attack before starting a channel, but not once it has begun.

The exact turn order

The game engine runs each round's actions through phases, see the below graphic to understand the order of operations:

One round, in order World updates automatically

Phase 1 of 4**Camp respawn timers**

After a camp reward has been claimed, its group's respawn timer ticks once per round. At zero, the group respawns only if all its spawn tiles are free.

Play

Round phase

Camp respawn timers

1.  Respawns
2.  Captures
3.  Camps
4.  Champions

At turn start, resolve zero timers: respawn, ward recharge, buff expiry, then channels. At turn end, decrement timers. Recall arrives at turn start; staying on spawn heals you at that turn’s end.

### Who goes first?

*   **Teams alternate**The team that starts swaps every round.
*   **Priority, then draft order**Within a team, higher priority acts first.
*   **set\_priority**Takes effect from the next round and persists.
*   **Dead champions still act**They get a turn to shop.

**Order matters**

A capture can add gems before a tribute completes. Camps attack before your next turn.
