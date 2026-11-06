<!-- source: https://2026a.battlecode.co.uk/game/docs/combat (language: cpp) -->

[◇ Game handbook](/game/docs)[Patch notes ↗](/game/patch-notes)

Game rulesCombat & abilitiesClose

Find a rule or champion

# Combat & abilities

2 min read · Current game rules

On this page

## [Basic attacks#](/game/docs/combat#attacks)

Every turn champions can attack using their basic attack, melees can hit targets within 1 tile, and ranged within 3. Depending on whether you are the melee or ranged class will determine whether you can move and attack on the same turn or not:

![](/service/assets/battlecode-knight-small-C2yNqawX.webp)**Melee**Range 1

**AND**Walk and attack in one turn

![](/service/assets/battlecode-wanted-small-CtP5pJ6m.webp)**Ranged**Range 3

**OR**Walk or attack, not both

A basic attack deals your Strength as damage, before modifiers. Diagonals count as one tile, and the target must be visible.

## [Abilities scale with focus #](/game/docs/combat#spells)

Abilities scale with focus by taking the champion's focus value, and multiplying by the ability multiplier.

For example, Stellar starts with 85 focus , and has an ability dealing 2x focus damage. Therefore she can cast the ability on her turn dealing a burst of 170 damage, starting its 8 turn cooldown. After 8 turns, she can cast the ability again.

This turn

Slot 0_Cast_Slot 1_Not this turn_

→

Afterwards

**8**Slot 0_8-round cooldown_Slot 1_Ready_

One successful cast per turn, from either slot. Spell damage scales with Focus : 2 × Focus at 85 Focus is 170 damage before modifiers.

Ability details such as the range, targeting system, and whether you can cast and move are detailed on each champion's individual page

Targets

*   Unit spells need a valid visible target. Ground spells affect an area.
*   Self-targeted spells use the self-cast action.

## [Channels#](/game/docs/combat#effects)

Channels are actions that take several turns to complete, such as recall, tribute and teleport. Their timers tick down at your turn end, then execute at your next turn start when the timer is zero. The below table shows the channel actions in the game, and how and when they can be cancelled.

Channels are cancelled by...

| Channel | Damage | Stun | Cancel yourself |
| --- | --- | --- | --- |
| Recall5 turn ends · 3 with Home | Cancels | Cancels | Yes |
| Tribute gemsGems ÷ 10 turn ends, rounded up (minimum 1) | Continues | Cancels | Yes |
| Teleport crystal3 turn ends | Continues | Cancels | No |
