# Project S.T.A.C.K.
## Core Rulebook: Medieval Fantasy Module
### Version 0.10 Alpha: Consolidated Rules Update
### June 28, 2026

> **Alpha status.** This version consolidates the core systems that have been finalized since Version 0.9 Alpha, including the shared-activation action economy, Friendly Entity terminology, status-card tracking, weapon eligibility, Tactical Reserve lifecycle, and prepared dungeon effects. Deferred systems remain explicitly identified in **Appendix C: Deferred and Provisional Rules** rather than being quietly treated as finished rules.

> **Reading note.** This is a consolidated rulebook, not a replacement game. Rules that remain functional from Version 0.9 Alpha have been preserved. Where a previously published rule conflicts with a later finalized rule, this version uses the later finalized rule.

---

## Table of Contents

1. [Game Overview](#1-game-overview)  
2. [Core Concepts and Rule Priority](#2-core-concepts-and-rule-priority)  
3. [Campaign Structure and World Turns](#3-campaign-structure-and-world-turns)  
4. [Characters, HP, and Defeat](#4-characters-hp-and-defeat)  
5. [Equipment, Defense, and Trading](#5-equipment-defense-and-trading)  
6. [Skills, Spells, Abilities, and Tactical Reserve](#6-skills-spells-abilities-and-tactical-reserve)  
7. [Damage, Defense, Resistance, Keywords, and Status Effects](#7-damage-defense-resistance-keywords-and-status-effects)  
8. [Encounter Layout and Combat](#8-encounter-layout-and-combat)  
9. [Heat and Enemy Targeting](#9-heat-and-enemy-targeting)  
10. [Allies, Hirelings, Companions, and Summons](#10-allies-hirelings-companions-and-summons)  
11. [World Map, Exploration, Terrain, and Transportation](#11-world-map-exploration-terrain-and-transportation)  
12. [Settlements, Markets, Currency, and Medical Care](#12-settlements-markets-currency-and-medical-care)  
13. [Dungeons, Dungeon Loot, Objectives, and Retreat](#13-dungeons-dungeon-loot-objectives-and-retreat)  
14. [Crafting](#14-crafting)  
15. [Difficulty Presets and Campaign Pressure](#15-difficulty-presets-and-campaign-pressure)  
16. [Scenario Setup](#16-scenario-setup)  
17. [Accessibility Principles](#17-accessibility-principles)  
18. [Appendix A: Reference Tables](#appendix-a-reference-tables)  
19. [Appendix B: Glossary](#appendix-b-glossary)  
20. [Appendix C: Deferred and Provisional Rules](#appendix-c-deferred-and-provisional-rules)  

---

# 1. Game Overview

Project S.T.A.C.K. is a modular, cooperative tabletop adventure game built around map exploration, character building, equipment, card-based combat, settlements, and dungeon delving.

Each player controls one character. Players explore a face-down world map, discover terrain and locations, improve their characters through loot and training, and work together to complete scenario objectives.

The default Medieval Fantasy campaign objective is to clear all required dungeons on the map. A scenario may instead require players to recover artifacts, defeat a boss, survive a countdown, protect a settlement, complete a quest, or achieve another stated objective.

Most specific instructions belong on cards. This rulebook supplies the shared rules used whenever a card or scenario does not say otherwise.

## 1.1 No Character Levels

Characters do not gain conventional levels. Progression comes from:

- Finding, buying, crafting, or earning cards.
- Equipping stronger equipment.
- Preparing Skills, Spells, and Abilities.
- Discovering settlement services and safe routes.
- Building an effective party formation.

A character becomes stronger through its loadout and choices, not through an experience-point level track.

## 1.2 The First Module

The initial setting includes these player classes:

- Warrior
- Rogue
- Mage
- Cleric
- Druid

Future Project S.T.A.C.K. modules may change setting, equipment, enemies, transportation, locations, and scenario rules while retaining shared systems such as cards, damage, combat rows, inventory, and difficulty presets.

---

# 2. Core Concepts and Rule Priority

## 2.1 Rule Priority

When rules conflict, use this order:

1. Scenario rules.
2. Card text.
3. Core rules in this rulebook.

A specific instruction overrides a general instruction.

## 2.2 Players and Characters

A **player** is a person at the table. A **character** is the Character Card and associated cards controlled by that player.

Each character has a personal play area containing its Character Card, equipped cards, Tactical Reserve, Inventory, and counters.

## 2.3 Card Types

The game uses several card types, including:

- Character Cards
- Equipment Cards
- Skill Cards
- Spell Cards
- Ability Cards
- Item Cards
- Transportation Cards
- Enemy Cards
- Dungeon Cards
- Loot Cards
- Crafting Blueprint Cards
- Hireling, Companion, and Summon Cards

A card's type, tags, cost, rank, effects, restrictions, and keywords are printed on that card.

## 2.4 Counters and Tokens

Combat uses stackable tactile counters only for numerical tracking that benefits from a changing value:

- **Damage**
- **Temporary Defense** on player characters when an effect changes Defense
- **Heat** or **Aggression**

Printed values, such as maximum HP, weapon damage, enemy Defense, Resistance, cost, and Skill capacity, are read from cards rather than duplicated with counters.

Status effects are not tracked with numerical counters. They are represented by cards in an entity's Status Row. Bleed Out uses a card sequence rather than Bleed counters. See [Status Effects](#79-status-effects-and-status-rows).

Scenario progress, currency, and similar non-combat resources use the components defined by the scenario, card, or campaign setup.

## 2.5 Important Areas and Piles

| Area or Pile | Purpose |
| --- | --- |
| **Inventory** | Cards carried or stored for later use. Normally accessible only at safe zones. |
| **Tactical Reserve** | Exactly 5 prepared consumable and tactical cards usable inside a dungeon. |
| **Status Row** | Each entity's 5 spaces for positive and negative status-effect cards. |
| **Status Deck** | Shared source of negative status cards. |
| **Loot Deck** | Shared source of obtainable cards used by settlements and dungeon loot setup. Used Tactical Reserve cards are shuffled into this deck after resolving or expiring. |
| **Loot Discard Pile** | Discard pile for the shared Loot Deck. Shuffle it into a new Loot Deck when needed. |
| **Dungeon Deck** | A dungeon's themed encounter deck. |
| **Dungeon Discard Pile** | Cards removed from a dungeon during its current attempt. |
| **Dungeon Loot Area** | Face-up non-immediate Loot Cards discovered in an active dungeon. |
| **Recovered Loot** | Loot carried out after a dungeon is cleared, before players resolve it at a settlement. |
| **Expended Summons Area** | Summon Cards defeated during the current dungeon. |
| **Bleed Out Sequence** | A three-stage card sequence beside a Downed player character. It is not a numerical counter and does not use a Status Row space. |

## 2.6 Discarding and Shuffling Back

**Discarding** and **shuffling back** are different.

A discarded card is removed from its current deck or area. For example, a defeated enemy goes to that dungeon's Dungeon Discard Pile and normally cannot appear again during that dungeon attempt.

A card that is shuffled back into a deck may be drawn again later. For example, if an enemy's preferred row is full when it is drawn, shuffle that enemy back into the Dungeon Deck.


## 2.7 Friendly Entity Terms

A **Friendly Entity** is any player-side combat entity in the encounter: a player character, Controlled Ally, or Autonomous Ally.

A **Controlled Ally** is a Friendly Entity directly commanded by a player character, such as a summon, familiar, minion, construct, or companion whose card says it is controlled. A Controlled Ally shares its owner's normal action opportunity.

An **Autonomous Ally** is a Friendly Entity with its own independent activation and printed AI priority list, such as a hireling, rescued NPC, escort, or story companion whose card says it is autonomous.

An **owner** is the player character whose group contains that ally. An ally's card may override this terminology or assignment.

---

# 3. Campaign Structure and World Turns

A campaign alternates between **World Turns**, where characters explore and use settlements, and **Encounter Rounds**, where characters inside dungeons fight and pursue objectives.

## 3.1 World Turn Order

Before play begins, choose a fixed player order. Use that order for World Turns, unless a scenario says otherwise.

Each player takes 1 World Turn before any player takes another World Turn. Once every player has completed a World Turn, that is 1 complete **World Round**.

A complete World Round matters for any Campaign Timer, Enemy Advance rule, or scenario effect that refers to global time.

## 3.2 What a Character May Do on a World Turn

On a character's World Turn, use the rules that apply to that character's current situation:

- A character on the world map may Travel or Scout.
- A character at a settlement may use that settlement's available services and may Travel or Scout when allowed by its remaining movement.
- A character participating in a dungeon follows the dungeon encounter rules instead of taking a normal map-exploration turn.

A player may therefore buy or sell at a settlement and then move away during that World Turn, provided the character follows normal movement rules.

## 3.3 World Turns While Another Character Is in a Dungeon

The map does not freeze because a dungeon is active.

For example, one player may buy, sell, heal, or travel on the world map while another player is fighting inside a dungeon. Resolve actions in the established player order.

## 3.4 Dungeon Encounter Timing

A dungeon encounter resolves as an **Encounter Round** when the next participating player character reaches that character's World Turn.

An Encounter Round resolves in this order:

1. Draw and resolve 1 Dungeon Card.
2. Resolve all enemy activations.
3. Resolve each participating non-Downed player character's **shared activation** in table order.
4. Resolve each eligible Autonomous Ally's independent activation in the same owner/table order.
5. Resolve end-of-round effects, including Bleed Out.

A player character and that character's Controlled Allies have exactly 1 shared activation per Encounter Round. During that activation, the player chooses exactly 1 eligible entity from that group to take 1 normal action:

- The player character; or
- 1 Controlled Ally owned by that player character.

All other Controlled Allies in that group do not take a normal action that round. A player character does not take a normal action in a round in which one of that character's Controlled Allies uses the shared activation.

An Autonomous Ally is not part of its owner's shared activation. Each active, non-defeated Autonomous Ally receives 1 independent activation every Encounter Round and follows its own printed AI priority list.

A participating player character whose shared activation is resolved during an Encounter Round does not receive an additional dungeon activation when that character's own World Turn later appears in the same shared encounter sequence. This keeps a shared dungeon as 1 coordinated fight rather than several disconnected duels.

## 3.5 Joining an Active Dungeon

A character may enter a dungeon already being explored by another player when that character reaches the dungeon tile on the world map.

Place the joining Character Card in an empty Player Front Row or Player Back Row slot. The joining character becomes a legal target and participates in future Encounter Rounds.

**Alpha timing rule:** A character joining after an Encounter Round has begun does not receive an action until the next Encounter Round unless a card or scenario says otherwise.

## 3.6 Multiple Active Dungeons

Multiple dungeons may be active at the same time. Each active dungeon keeps its own:

- Dungeon Deck
- Dungeon Discard Pile
- Enemy rows
- Loot Area
- Objective progress
- Participating characters
- Other dungeon-specific state

Resolve World Turns in the established player order. When a participating character reaches its World Turn, resolve the relevant dungeon's next Encounter Round.

---

# 4. Characters, HP, and Defeat

## 4.1 Character Cards

Each Character Card defines that character's:

- Maximum HP
- Class traits
- Native skill categories
- Starting abilities or special rules
- Other class-specific features

The default maximum HP values are:

| Class | Maximum HP |
| --- | ---: |
| Warrior | 20 |
| Rogue | 18 |
| Cleric | 14 |
| Druid | 14 |
| Mage | 12 |

Exact starting equipment, starting Skills, starting Spells or Abilities, and class traits are provided by the relevant Character Card or scenario setup.

## 4.2 Damage and HP

When a character takes damage, place that many Damage counters on the Character Card.

When a character's Damage counters equal or exceed its maximum HP, the character becomes **Downed**, unless an active difficulty rule says that character dies immediately.

## 4.3 Downed Characters

When a player character's Damage counters equal or exceed its maximum HP, that character becomes **Downed**, unless an active difficulty rule says that character dies immediately.

A Downed character:

- Cannot take a shared activation.
- Cannot activate any Controlled Ally.
- Remains in the encounter unless the party retreats with that character.
- Keeps all equipped cards and Inventory.
- Receives a Downed marker or Downed state card.
- Cannot normally be targeted, moved, or repositioned.
- Is not immediately dead in Story, Standard, or Hardcore Mode.

A Controlled Ally that is defeated or otherwise unable to act cannot be selected for its owner's shared activation. An Autonomous Ally that is defeated or otherwise unable to act loses only that ally's own independent activation. See [Stun and Activations](#794-stun-and-activations) for the specific Stunned rules.

## 4.4 Bleed Out

Bleed Out is represented by a 3-stage **Bleed Out Sequence**, not by numerical Bleed counters.

At the end of each complete Encounter Round, advance every Downed player character's Bleed Out Sequence by 1 stage:

1. Place **Bleed Out I** beside the Downed character.
2. Replace it with **Bleed Out II**.
3. Replace it with **Bleed Out III** and immediately resolve the active Difficulty Preset's death result.

The sequence is a campaign-defeat tracker, not a normal status effect. It does not occupy a Status Row space.

At the third stage:

- In **Story Mode**, the character becomes Unconscious rather than dying.
- In **Standard Mode**, the character dies.
- In **Hardcore Mode**, the character dies permanently.

This gives the party up to 3 complete Encounter Rounds to revive or withdraw with a Downed ally.

## 4.5 Reviving a Downed Character

A Downed character can be revived only by a Spell, Ability, Item, service, or other effect that specifically says it can **Revive**.

A normal healing effect does not revive a Downed character unless it explicitly says so.

Unless the reviving card says otherwise, revival:

- Removes the Downed marker or Downed state card.
- Removes the character's Bleed Out Sequence.
- Returns the character to 1 HP. Remove Damage counters until the character has 1 HP remaining.

## 4.6 Retreating with a Downed Ally

A party may retreat with a Downed ally.

A Downed character cannot independently retreat or move. However, when the remaining active party withdraws from the dungeon, remove any Downed allies with the party. Remove that character's Bleed Out Sequence when the character leaves the dungeon this way.

A rescued Downed character remains Downed until revived by a valid effect or service. The retreat stops Bleed Out because the character is no longer in an active encounter.

## 4.7 Death and Replacement

The active Difficulty Preset determines whether death is temporary, restricted, permanent, or immediate. See [Difficulty Presets and Campaign Pressure](#15-difficulty-presets-and-campaign-pressure).

A scenario may allow a replacement character, recovery of a dead character's equipment, resurrection, or another outcome.

---

# 5. Equipment, Defense, and Trading

## 5.1 Equipment Slots

Every character has the following equipment slots:

- Head
- Neck
- Body
- Hands
- Feet
- Left Held Slot
- Right Held Slot
- Left Ring
- Right Ring
- Transportation

All classes use the same equipment-slot layout unless a Character Card specifically says otherwise.

Each character has 2 Ring slots. Class identity comes from traits, Skills, Spells, Abilities, and card effects, not from unequal numbers of equipment slots.

## 5.2 Held Slots

The Left Held Slot and Right Held Slot hold items such as:

- Weapons
- Shields
- Magical focuses
- Tools
- Torches
- Other hand-held equipment

A one-handed item occupies 1 Held Slot. A two-handed item occupies both Held Slots. A shield occupies 1 Held Slot, normally the off-hand.

A character cannot equip another item in a Held Slot occupied by a two-handed item.

## 5.3 Armor and Defense

Armor and shields provide Defense.

| Armor Type | Defense Bonus |
| --- | ---: |
| Clothing | +0 |
| Leather Armor | +1 |
| Scale Mail or Brigandine | +2 |
| Chainmail | +3 |
| Full Plate | +4 |

| Shield Type | Defense Bonus |
| --- | ---: |
| Buckler | +1 |
| Kite Shield or Square Shield | +2 |

A character can normally reach 6 Defense through Full Plate and a +2 shield.

Effects such as Spells, Abilities, or special equipment may raise Defense above 6. A character's Defense can never exceed 10.

See [Damage, Defense, Resistance, and Keywords](#7-damage-defense-resistance-keywords-and-status-effects) for how Defense reduces damage.

## 5.4 Dual Wielding

A character may equip a one-handed weapon in each Held Slot. However, a character does not automatically gain an attack benefit from holding two weapons.

Without a Skill Card, Ability Card, or other effect that specifically allows **Dual Wielding**, a character chooses 1 equipped weapon when making an attack.

A Dual Wielding effect states its benefit and restrictions.

Example:

```text
Recruit Dual Wielding

You may equip a one-handed weapon in each Held Slot.

When you use a Melee attack with a one-handed weapon,
add +1 Physical damage if your other Held Slot contains
a one-handed weapon.
```

A card may require light weapons, prohibit shield use, or provide a different dual-wielding benefit.

## 5.5 Armor Restrictions

Armor has no universal class restriction. Any character may equip Clothing, Leather Armor, Scale Mail, Chainmail, Full Plate, or another Body-slot item if that slot is available.

Individual cards may impose requirements or drawbacks, such as:

- Cannot benefit from Stealth.
- Requires a named Skill.
- Increases movement costs in certain terrain.
- Cannot be worn with another named item.

Card text overrides the general no-restriction rule.

## 5.6 Equipment and Inventory Capacity

Equipment does not normally change Inventory capacity. Transportation Cards are the primary source of capacity bonuses.

Rare Equipment Cards may change Inventory capacity only when their text specifically says so.

Example:

```text
Traveler's Pack
+2 Inventory capacity.
```

## 5.7 Broken, Cursed, and Bound Equipment

Broken, cursed, and bound equipment are not part of the initial core rules.

Equipment functions normally unless a card specifically says otherwise. Future modules may introduce those mechanics through card text or scenario rules.

## 5.8 Equipment Changes

Equipment may normally be equipped, removed, or swapped only at a settlement or another card-defined safe zone.

A character cannot rebuild its equipment loadout inside a dungeon.

## 5.9 Field Trading

Characters may trade while occupying the same revealed world-map tile. Field Trading is not allowed inside a dungeon.

Outside a settlement or other safe zone, characters may trade only:

- Currency
- Tactical Reserve cards
- Tradable quest items
- Cards that specifically say they may be traded in the field

Field Trading does not grant Inventory access.

## 5.10 Settlement Trading

Characters occupying the same settlement or other safe zone may access Inventory and trade any tradable cards.

At a settlement, characters may trade:

- Equipment Cards
- Transportation Cards
- Tactical Reserve cards
- Consumable Items
- Crafting materials
- Crafting Blueprint Cards
- Currency
- Tradable quest items

Characters may not trade:

- Character Cards
- Skill Cards
- Spell Cards
- Ability Cards
- Cards attached to a Skill Card
- Bound cards
- Cards that specifically say they cannot be traded

Receiving an Equipment Card through trade does not allow the receiving character to equip it immediately unless the trade happens at a safe zone.

---

# 6. Skills, Spells, Abilities, and Tactical Reserve

## 6.1 Skill Slots and Specialization

Each player character has exactly **5 Skill Slots**.

A Skill Card represents training the character is currently maintaining. Spell Cards and Ability Cards represent techniques, knowledge, or powers made available by that training.

A character may use all 5 Skill Slots for the rank-progression cards of a single domain to fully specialize in that domain. A character may instead divide its 5 slots among different domains and ranks.

There is no separate global cap on equipped Spells or Ability Cards beyond:

- The 5 available Skill Slots; and
- The capacity printed on each equipped Skill Card.

## 6.2 Equipping Spells and Abilities

A Spell or Ability Card may be equipped to a Skill Card only if:

- Its tag matches that Skill Card.
- Its rank is not higher than that Skill Card's rank.
- The Skill Card has remaining capacity.

Examples:

- A card tagged `Restoration Magic` may be equipped to a Restoration Magic Skill Card.
- A card tagged `Thief` may be equipped to a Thief Skill Card.
- A card with multiple tags may be equipped to any matching Skill Card.

## 6.3 Skill Rank and Capacity

A Skill Card's rank determines both the highest rank of Spell or Ability Card it can equip and the total number of matching cards it can hold.

| Rank Position | Maximum Equipped Cards |
| --- | ---: |
| 1 | 1 |
| 2 | 2 |
| 3 | 3 |
| 4 | 4 |
| 5 | 5 |

For example, a rank-4 Skill Card may equip up to 4 matching Spells or Abilities of rank 4 or lower. The attached cards may be any mixture of lower ranks, provided their total number does not exceed 4.

## 6.4 Rank Names

Magic Skills use these names:

- Novice
- Apprentice
- Adept
- Master
- Grand Master

Warrior Skills use these names:

- Recruit
- Footsoldier
- Veteran
- Elite
- Champion

Other class domains may use setting-specific labels. Rank position and capacity remain the same regardless of the displayed name.

## 6.5 Native Skills

A Native Skill belongs to the character's class domain.

Each Character Card allows its owner to freely equip and unequip Skill Cards belonging to that character's own class domain at a settlement or other safe zone.

When a Native Skill is removed:

1. Return all attached Spell and Ability Cards to that character's Inventory.
2. Return the Native Skill Card to that character's Inventory.

The character keeps its native training card.

## 6.6 Off-Class Skills

An Off-Class Skill does not belong to the character's class domain.

A character may equip an Off-Class Skill only at a settlement with the matching specialty, unless a card or scenario creates an exception.

When an Off-Class Skill is removed:

1. Return all attached Spell and Ability Cards to that character's Inventory.
2. Discard the Off-Class Skill Card.

This represents no longer maintaining foreign training.

Special loot, a scenario, or a settlement service may alter these removal rules when its text says so.

## 6.7 Prepared Spells, Abilities, and Skill Changes

Skill Cards cannot normally be equipped or removed inside a dungeon.

A character enters a dungeon with the Skills, Spells, and Abilities it prepared at a safe zone.

There is no general spell-recovery, spell-discard, or once-per-cast rule. A prepared Spell or Ability remains attached to its Skill Card after it resolves unless its own card says otherwise.

The normal time that a prepared Spell or Ability returns to Inventory is when its Skill Card is actively removed at a safe zone. Summon Cards and persistent effects follow their specific rules.

## 6.8 Tactical Reserve

Each player character has exactly **5 Tactical Reserve slots**.

The Tactical Reserve holds prepared consumable and tactical cards such as:

- Potions
- Scrolls
- Bombs
- Bandages
- Other single-use items

Tactical Reserve cards occupy these dedicated slots. They do **not** use Skill, Spell, Ability, Equipment, Inventory, or Status Row capacity while prepared.

Characters choose Tactical Reserve cards before entering a dungeon. Once inside a dungeon, a character may use only the Tactical Reserve cards it brought with it.

A Tactical Reserve card states its timing:

- **Action:** Use it as the action taken by the owner player character or a Controlled Ally selected for that owner's shared activation. An Autonomous Ally may use it only when the ally's card or the Tactical Reserve card explicitly permits it.
- **Reaction:** Resolve it immediately when its printed trigger occurs. It does not consume a normal activation unless its card says otherwise.
- **Prepared Dungeon Effect:** Use the acting player character's shared activation to prepare it, then place it in that character's Status Row while it waits for its printed trigger. See [Prepared Dungeon Effects](#611-prepared-dungeon-effects).

A Scroll in Tactical Reserve is not a school Spell. Unless the Scroll says otherwise, it may be used by any Friendly Entity and does not require a matching magic Skill Card.

After a Tactical Reserve card resolves or expires, shuffle it into the shared **Loot Deck**. It does not enter the Dungeon Discard Pile, Loot Discard Pile, or a separate Tactical Reserve discard pile.

## 6.9 Inventory

Inventory represents cards a character carries or stores for later use.

Each character has a base Inventory capacity of 20 cards.

The following do not count against Inventory capacity:

- Equipped Equipment Cards
- Equipped Skill Cards
- Spell and Ability Cards attached to equipped Skill Cards
- Tactical Reserve cards
- Currency tokens
- Damage, Defense, or Heat counters

Some cards increase Inventory capacity.

Examples:

- Backpack: +5 Inventory capacity.
- Caravan: +10 Inventory capacity.

A character may access Inventory only at a settlement or another card-defined safe location. Inventory cannot normally be accessed inside a dungeon.

## 6.10 Full Inventory

When a character's Inventory is full, it cannot add another Inventory card until it creates space.

A character may create space by:

- Selling cards
- Discarding cards
- Storing cards
- Crafting with cards
- Equipping an eligible card at a safe zone
- Using a card that increases Inventory capacity

Dungeon Loot uses a separate Loot Area while a dungeon is active, so a full Inventory never prevents the party from discovering dungeon treasure. See [Dungeons, Dungeon Loot, Objectives, and Retreat](#13-dungeons-dungeon-loot-objectives-and-retreat).

## 6.11 Prepared Dungeon Effects

Some Spells, Abilities, and Tactical Reserve cards are cast or used now but resolve only when a condition occurs later in the same Encounter Round.

To use a Prepared Dungeon Effect:

1. Spend the player character's shared activation.
2. Place the prepared card in the caster's Status Row.
3. Wait for its printed trigger.
4. When the first qualifying trigger occurs that Encounter Round, resolve the effect immediately.
5. Return, shuffle, discard, or otherwise handle the card exactly as its type and printed text require.

If the trigger does not occur before the end of that Encounter Round, the prepared effect expires without resolving unless its card says otherwise. Its shared activation was still spent.

A prepared effect occupies a Status Row space while waiting. This makes delayed dungeon magic visible and prevents a character from preparing unlimited effects at once.

Example:

```text
Speak to the Dead
Prepared Dungeon Effect

Use your shared activation. The first time an enemy is defeated
this Encounter Round, immediately resolve this card's printed effect.

If no enemy is defeated this Encounter Round, this effect expires.
```

# 7. Damage, Defense, Resistance, Keywords, and Status Effects

## 7.1 Damage Effects

A damaging card or effect should state:

- Its **Delivery**
- Its **Damage Type**
- Its damage amount
- Any relevant **Keywords**

A **weapon attack** uses the printed base damage and printed damage types of 1 equipped weapon, plus any modifiers supplied by the attacking card or effect.

Example:

```text
Iron Spear
Weapon: Melee, Spear

Melee Weapon Attack
Deal this weapon's printed Physical damage.
Keyword: Piercing.
```

```text
Fireball
Spell Attack

Deal 3 Fire damage.
```

## 7.2 Delivery and Weapon Eligibility

Delivery describes how an effect is used. Common Delivery types include:

- Melee
- Ranged
- Spell
- Item

Delivery determines targeting and interactions. Delivery is not a Damage Type.

Every Weapon Card has:

- 1 range tag: **Melee** or **Ranged**.
- 1 or more subtype tags, such as **Blunt**, **Sword**, **Axe**, **Dagger**, **Spear**, **Shortbow**, **Longbow**, or **Crossbow**.

A **melee weapon attack** requires an equipped weapon with the **Melee** range tag. It normally targets only an opposing Front Row entity.

A **ranged weapon attack** requires an equipped weapon with the **Ranged** range tag. It normally targets either opposing row.

An Ability or Spell that modifies or makes a weapon attack must explicitly state the required range tag and any required subtype tag. A range-only requirement accepts any subtype within that range. A subtype requirement accepts only weapons with that exact listed subtype tag.

Examples:

```text
Smashing Blow
Melee Weapon Attack

Make a melee weapon attack with +1 damage.
Requires a Melee weapon with the Blunt tag.
```

```text
Power Bolt
Ranged Weapon Attack

Make a ranged weapon attack with +1 damage.
Requires a Ranged weapon with the Crossbow tag.
```

A Shortbow has the `Ranged` and `Shortbow` tags. It qualifies for a range-only ranged weapon attack, but it does not qualify for a Crossbow-only effect.

A Spell may deal Fire, Frost, Lightning, Force, Physical, or another Damage Type. The Spell delivery does not make it a weapon attack unless the card specifically says so.

## 7.3 Damage Types

The starting Damage Types are:

- Physical
- Fire
- Frost
- Lightning
- Poison
- Force

### Physical Damage

Physical damage represents weapon strikes, arrows, claws, falling debris, crushing force, and similar mundane harm.

Physical damage is reduced by Defense.

Physical damage may have keywords such as Piercing, Slashing, or Blunt. These keywords have no universal effect unless another card specifically refers to them.

### Fire Damage

Fire damage represents flames, burning weapons, explosions, lava, and magical fire.

Fire damage is reduced by Fire Resistance. Normal Defense does not reduce Fire damage unless a card specifically says otherwise.

### Frost Damage

Frost damage represents freezing cold, ice magic, freezing winds, and similar effects.

Frost damage is reduced by Frost Resistance. Normal Defense does not reduce Frost damage unless a card specifically says otherwise.

### Lightning Damage

Lightning damage represents electrical attacks, storms, magical lightning, and similar effects.

Lightning damage is reduced by Lightning Resistance. Normal Defense does not reduce Lightning damage unless a card specifically says otherwise.

### Poison Damage

Poison damage represents venom, toxins, disease-like effects, and similar harmful substances.

Poison damage is reduced by Poison Resistance. Normal Defense does not reduce Poison damage unless a card specifically says otherwise.

A Poison card may add further instructions, such as dealing damage at the end of a round or preventing healing.

### Force Damage

Force damage represents raw magical impact, telekinetic force, arcane energy, or other non-elemental magical harm.

Force damage is reduced by Force Resistance. Normal Defense does not reduce Force damage unless a card specifically says otherwise.

Force is intended for generic arcane attacks such as Magic Bolt or Arcane Bolt.

Example:

```text
Magic Bolt
Spell Attack

Deal 2 Force damage to one enemy in either opposing row.
```

## 7.4 Defense

Defense reduces Physical damage.

```text
Physical Damage Taken = Physical Damage - applicable Defense
```

Physical damage cannot be reduced below 0 unless a card specifically says otherwise.

Example:

```text
Attack: 4 Physical damage.
Target Defense: 3.

4 - 3 = 1 damage taken.
```

A target with enough Defense may reduce a Physical attack to 0 damage.

## 7.5 Resistance

A Resistance reduces damage of its matching Damage Type.

```text
Damage Taken = Damage Amount - matching Resistance
```

Damage cannot be reduced below 0 unless a card specifically says otherwise.

Example:

```text
Attack: 4 Fire damage.
Target Fire Resistance: 1.

4 - 1 = 3 damage taken.
```

A target's normal Defense does not reduce non-Physical damage unless a card specifically says otherwise.

## 7.6 Damage Keywords

Keywords add detail to an attack. Common examples include:

- Piercing
- Slashing
- Blunt
- Magical
- Fire
- Poison

Keywords do nothing by themselves unless a card specifically refers to them.

Example:

```text
Crushing Blow
Melee Attack

Deal 4 Physical damage.
Keyword: Blunt.
Ignore 1 Defense.
```

Example:

```text
Padded Undergarment

+1 Defense against Piercing attacks.
```

## 7.7 Mixed Damage

Some effects deal more than 1 Damage Type. Resolve each Damage Type separately, apply the appropriate Defense or Resistance to each portion, then add the remaining damage together.

Example:

```text
Fire Sword
Melee Attack

Deal 2 Physical damage.
Deal 2 Fire damage.
Keywords: Slashing, Fire.
```

Against a target with Defense 2 and Fire Resistance 1:

```text
Physical damage: 2 - 2 Defense = 0
Fire damage: 2 - 1 Fire Resistance = 1

Total damage taken: 1
```

A card deals multiple Damage Types only when it specifically says so.

## 7.8 Special Damage Rules

Card text may override normal damage rules.

Examples:

- Ignore 1 Defense.
- Ignore Fire Resistance.
- This damage cannot be reduced below 1.
- This damage cannot be prevented.
- Deal +1 damage to a target with Frost Resistance.
- This attack deals double damage to a target with the Undead tag.


## 7.9 Status Effects and Status Rows

Every combat entity has a **Status Row** with exactly 5 spaces. This single row holds both positive and negative status-effect cards.

All status effects are represented by cards, not duration counters, sideways cards, or a separate buff deck.

### 7.9.1 Negative Status Effects

Negative statuses come from the shared **Status Deck** and may affect player characters, Controlled Allies, Autonomous Allies, enemies, and bosses when a card permits it.

Unless a status card says otherwise, it occupies 1 Status Row space. A status cannot be added when the affected entity has no available Status Row space.

A status card states its own trigger, stacking rule, mechanical effect, and removal condition. Common core status behavior is:

| Status | Stack? | Core behavior |
| --- | --- | --- |
| Burning | No | At the start of the affected entity's next applicable activation, take 1 Fire damage, then discard Burning. |
| Poisoned | Yes | At the start of the affected entity's next applicable activation, take 1 Poison damage for each Poisoned card, then discard each resolved Poisoned card. |
| Bleeding | No | The next time the entity changes rows or makes a Melee attack, resolve the card's bleed effect, then discard Bleeding. |
| Stunned | No | The entity loses its next normal activation, then discard Stunned. |
| Immobilized | No | The entity cannot change rows while Immobilized remains. |
| Blinded | No | The entity cannot make Physical attacks while Blinded remains. |
| Silenced | No | The entity cannot cast Spells while Silenced remains. |
| Weakened | Yes | Persistent. Apply the card's printed penalty. |
| Vulnerable | Yes | Persistent. Apply the card's printed penalty. |
| Corroded | Yes | Persistent. Apply the card's printed penalty. |

Poison uses stackable **Poisoned** status cards. It does not use an escalating sequence of differently named poison stages.

A card may direct a multi-stage status to replace itself with another named status card. Such replacement uses cards, not counters.

### 7.9.2 Positive Status Effects and Buffs

Positive effects originate from player Skill, Spell, Ability, or Tactical Reserve cards. A persistent positive effect is placed in the target's Status Row while active.

The persistent effect card remains the property of its source owner. When a Spell or Ability effect is consumed, removed, or expires, return it to its original equipped Skill Card unless its own card says otherwise. A Tactical Reserve effect follows the Tactical Reserve return rule and is shuffled into the Loot Deck after it resolves or expires.

Regular enemies normally do not gain positive status cards. Their power comes from printed numbers and abilities. Bosses may gain positive status cards when a Boss Card, scenario, or other effect explicitly says so.

### 7.9.3 Status Timing

Resolve a status when its printed trigger occurs.

For an enemy or Autonomous Ally, “at the start of this entity's activation” means immediately before that entity's activation.

For a player character's group, resolve such a trigger immediately before the group's shared activation. Resolve applicable start-of-activation effects on the player character and that character's Controlled Allies before selecting the entity that will use the shared activation.

### 7.9.4 Stun and Activations

Stun interacts with the shared-activation system as follows:

- A **Stunned player character** loses that character's entire shared activation for the round and cannot activate any Controlled Ally.
- A **Stunned Controlled Ally** cannot be selected to use its owner's shared activation. The owner may still act personally or select another eligible, unstunned Controlled Ally.
- A **Stunned Autonomous Ally** loses only that ally's own independent activation.

Stun does not by itself prevent passive effects, statuses, reactions, or triggered abilities unless they require the Stunned entity to take an action.

### 7.9.5 Accessibility and Ownership

Persistent cards are oriented toward their owner. Accessibility kits may use tactile ownership markers on Braille sleeves or another consistent tactile method.

Status tracking must never require a duration counter, a sideways card, or a separate positive-buff deck.

---

# 8. Encounter Layout and Combat

## 8.1 Encounter Layout

Each dungeon encounter uses 2 rows for the players and 2 rows for enemies.

```text
Player Front Row: [ ] [ ] [ ] [ ]
Player Back Row:  [ ] [ ] [ ] [ ]

Enemy Front Row:  [ ] [ ] [ ] [ ]
Enemy Back Row:   [ ] [ ] [ ] [ ]
```

Each row has 4 slots.

Each character, enemy, summon, pet, companion, hireling, or allied NPC occupies 1 slot. A slot may contain only 1 card.

## 8.2 Placing Characters

When a character enters a dungeon, place that Character Card in an empty Player Front Row or Player Back Row slot.

A character may change rows by spending a shared activation unless a card says otherwise.

## 8.3 Placing Enemies

Enemy Cards list a preferred row.

When an Enemy Card is drawn:

1. Place it in an empty slot in its preferred row.
2. If that row is full, shuffle that Enemy Card back into the Dungeon Deck.

Enemy row capacity is intentional. Controlling space is part of combat strategy.

## 8.4 Front Row

A character or enemy in the Front Row may use:

- Melee attacks
- Ranged attacks
- Spells
- Items
- Abilities

A Front Row card may be targeted by Melee, Ranged, Spell, or special effects.

## 8.5 Back Row

A character or enemy in the Back Row may use:

- Ranged attacks
- Spells
- Items
- Abilities

A Back Row card cannot normally use Melee attacks unless a card says otherwise. A Back Row card cannot normally be targeted by Melee attacks.

## 8.6 Melee Attacks

A Melee attack may target only cards in the opposing Front Row unless a card specifically says otherwise.

## 8.7 Ranged Attacks and Spells

Ranged attacks and Spells may target cards in either opposing row unless a card says otherwise.

Examples include:

- Bows
- Crossbows
- Throwing weapons
- Fireball
- Lightning Bolt
- Other ranged abilities

## 8.8 Shared Activations

Each participating non-Downed player character receives 1 **shared activation** during the Player Character portion of an Encounter Round.

During that shared activation, choose exactly 1 eligible entity from that player character's group:

- The player character; or
- 1 Controlled Ally owned by that player character.

The chosen entity takes 1 normal action. All other Controlled Allies in that group do not take a normal action that round.

A normal action may be used to:

- Make an attack
- Cast a Spell
- Use an equipped Ability
- Use an Action Tactical Reserve card
- Summon a creature
- Move from Front Row to Back Row
- Move from Back Row to Front Row
- Retreat from the dungeon
- Take another action permitted by a card

Moving between rows uses that entity's entire normal action unless an effect says otherwise.

Some cards may combine movement and another action.

Example:

```text
Charge Strike
Move from the Back Row to the Front Row, then make a melee weapon attack.
```

A card that grants an additional action or permits movement without spending an action overrides the normal action rule.

Autonomous Allies resolve their separate independent activations after player-character shared activations. See [Autonomous Allies](#104-autonomous-allies).

## 8.9 Enemy Turns

Each Enemy Card lists 1 or more actions.

During an Enemy Turn, resolve that enemy's listed actions from top to bottom. If an action's condition is not met or it has no legal target, skip that action and continue to the next listed action.

Example:

```text
Goblin Berserker

1. Berserker Rage: If this enemy has less than half its HP remaining,
   its Melee attacks deal +1 damage this turn.
2. Club Smash: Deal 3 Melee Physical damage.
```

If the Goblin Berserker has less than half its HP remaining, it gains the bonus and then uses Club Smash for 4 damage.

## 8.10 Defeating Enemies

Enemies have HP printed on their cards. Place Damage counters on an enemy when it takes damage.

When an enemy's Damage counters equal or exceed its HP:

1. That enemy is defeated.
2. Remove it from its row.
3. Place it in that dungeon's Dungeon Discard Pile.

Defeated enemies do not return during the current dungeon attempt unless a card says otherwise.

---

# 9. Heat and Enemy Targeting

Heat represents how threatening a **Friendly Entity** appears to enemies.

Unless an Enemy Card says otherwise, an enemy targets the legal Friendly Entity with the highest Heat.

## 9.1 Gaining Heat

Friendly Entities gain Heat primarily by dealing damage. The amount of Heat gained is defined by the Spell, Ability, Weapon, or other effect that caused the damage.

Cards may also grant Heat through a taunt, defensive action, healing effect, or another stated rule.

## 9.2 Leaving a Dungeon

When a Friendly Entity leaves a dungeon, remove all Heat counters from that entity.

## 9.3 Allies and Heat

Player characters, Controlled Allies, and Autonomous Allies may all gain Heat, receive status effects, occupy rows, and be targeted by enemies when legal.

Enemy default targeting uses the highest-Heat legal Friendly Entity, not only player characters.

An enemy action that targets a row, all Friendly Entities, a random legal target, or another specified group follows its own card text rather than the default Heat rule.

## 9.4 Heat Edge Cases

The core Heat rule uses the highest-Heat legal Friendly Entity. Heat ties and any special interaction not covered by a card remain provisional until the final Heat reference is published. See [Appendix C](#appendix-c-deferred-and-provisional-rules).

# 10. Allies, Hirelings, Companions, and Summons

Allied creature cards represent Friendly Entities that fight alongside a player character.

Examples include:

- Controlled summons
- Familiars
- Constructs
- Companions
- Hirelings
- Mercenaries
- Rescued NPCs
- Escorts
- Story allies

All allied cards occupy normal Player Row slots.

## 10.1 Player Groups

Each player character has a group. A group may include:

- That player's Character Card
- Controlled Allies
- Autonomous Allies
- Other allied cards assigned to that player character

When multiple players enter the same dungeon, their groups combine into 1 shared allied formation using the same 8 Player Row slots.

No player has reserved slots. Any Friendly Entity may occupy any legal empty Player Row slot.

## 10.2 Ally Limits

Each player group may normally have:

- 1 player character
- Up to 1 persistent Hireling or Companion
- Up to 2 active Summons

Cards may increase or reduce these limits.

An ally cannot enter play if there is no eligible empty Player Row slot.

## 10.3 Controlled Allies

A Controlled Ally is directly commanded by its owner and shares that owner's activation economy.

A Controlled Ally lists its own stats, HP, Defense, actions, tags, Damage Types, and special rules.

When the owner uses the shared activation for a Controlled Ally:

1. Choose 1 eligible active Controlled Ally in that player's group.
2. Choose 1 legal action listed on that ally's card.
3. Resolve that action.

A Controlled Ally may use only actions printed on its own card unless another card says otherwise. It follows normal targeting rules unless its card says otherwise.

Examples include:

- Skeletal Warrior
- Skeletal Archer
- Skeletal Spider
- Wolf Spirit
- Vine Guardian
- Elemental
- Construct
- Familiar

## 10.4 Autonomous Allies

An Autonomous Ally has its own independent activation each Encounter Round. It does not use its owner's shared activation.

An Autonomous Ally uses a printed AI priority list. During its activation:

1. Read its priority list from top to bottom.
2. Resolve the first legal line.
3. Skip a line whose condition is not met or has no legal target.

Every Autonomous Ally behavior line must include explicit target-selection instructions when it needs a target, such as:

- Lowest current HP
- Greatest missing HP
- Highest printed Attack
- Friendly Entity with the highest Heat
- Nearest legal enemy
- Another specifically printed selection method

An Autonomous Ally does **not** use the enemy default highest-Heat targeting rule unless its own card explicitly says so.

Examples include:

- Mercenary Guard
- Archer for Hire
- Scout
- Field Medic
- Porter
- Guide
- Sellsword
- Rescued NPC
- Story escort

## 10.5 Companions and Story Allies

Companions and Story Allies follow the instructions on their cards. A Companion or Story Ally may be Controlled, Autonomous, temporary, persistent, scenario-required, or bound to a specific character.

If a Companion or Story Ally conflicts with a general ally rule, follow its card text.

## 10.6 Shared and Independent Activations

A player character's **shared activation** is the single normal-action opportunity shared by that player character and all of that character's Controlled Allies.

An **independent activation** belongs only to an Autonomous Ally and is resolved once each Encounter Round.

A player character receives no separate independent activation. Controlled Allies are not an extra action economy. They are an alternative use of the owner's shared activation.

Allies not taking a normal action remain in their current row and may still be targeted, block slots, provide passive effects, use reactions allowed by their cards, receive Heat, and receive status effects.

## 10.7 Summon Cards and Preparation

Summon Cards are Spell Cards or Ability Cards equipped to a matching Skill Card. A Summon Card counts against the capacity of the Skill Card to which it is attached.

Example:

```text
Adept Necromancy
Maximum Equipped Cards: 3

- Skeletal Warrior
- Skeletal Warrior
- Skeletal Spider
```

A character may summon only cards prepared by equipping them to a matching Skill Card before entering the dungeon, unless a card specifically says otherwise.

## 10.8 Summoning a Creature

To summon a creature:

1. Spend the owner player character's shared activation.
2. Choose an equipped Summon Card.
3. Move that Summon Card from its Skill Card to an eligible empty Player Row slot.
4. The card becomes an active Controlled Ally unless its own card says it is Autonomous.

A newly summoned creature cannot take a normal action during the same player-group shared activation in which it was summoned unless the Summon Card says otherwise.

## 10.9 Defeated Summons

When a Summon takes Damage equal to or greater than its HP:

1. Remove it from the Player Row.
2. Place it in that owner's Expended Summons Area.

A card in the Expended Summons Area:

- Cannot be summoned again during the current dungeon.
- Cannot be used or accessed during the current dungeon.
- Is not part of the owner's active Inventory during the dungeon.

When the dungeon ends or the owner leaves the dungeon, move all Expended Summon Cards to that owner's Inventory. The owner may re-equip those Summon Cards only at a settlement or another card-defined safe zone.

## 10.10 Active Summons When a Dungeon Ends

When a dungeon is cleared or a Summon's owner leaves the dungeon:

1. Remove all active Summons owned by that character from the Player Rows.
2. Return those Summon Cards to the owner's Inventory.
3. Move all Expended Summons belonging to that character to the owner's Inventory.

A Summon Card must be equipped again before it can be used in another dungeon. Unless a card says otherwise, Summons do not remain active while traveling on the world map.

## 10.11 Summoning and Full Rows

A Summon cannot enter play if there is no eligible empty Player Row slot.

If a Summon cannot enter play because there is no empty slot:

- The Summon Card remains attached to its Skill Card.
- The character does not spend the attempted shared activation.

A card may override this rule by creating space, replacing another ally, summoning into a specific slot, or using another special effect.

## 10.12 Hirelings

Hirelings are persistent allied NPCs purchased or gained outside dungeons.

Unless a Hireling Card says otherwise, a Hireling is an Autonomous Ally.

A Hireling:

- Belongs to 1 player group.
- Occupies a Player Row slot during encounters.
- Has its own HP, Defense, actions, and special rules.
- Uses an explicit Autonomous Ally priority list unless its card says otherwise.
- Does not use the owner's Equipment, Skill Cards, Spell Cards, Ability Cards, or Tactical Reserve cards.

Hirelings are intended to be expensive and valuable but weaker and less flexible than player characters.

## 10.13 Defeated Hirelings and Autonomous Allies

Unless an Autonomous Ally Card says otherwise, when an Autonomous Ally takes Damage equal to or greater than its HP:

1. Remove it from the Player Row.
2. Discard the Autonomous Ally Card.

Autonomous Allies do not use player-character Downed or Bleed Out rules unless their cards specifically say they do.

## 10.14 Equipment, Skills, and Items for Allies

Allied cards use only the equipment, Skills, Abilities, stats, and actions printed on their own cards.

Unless another card says otherwise, allies cannot:

- Equip player Equipment Cards.
- Equip Skill Cards.
- Use player Spell Cards.
- Use player Ability Cards.
- Use Tactical Reserve cards.
- Use Transportation Cards.
- Receive Ring, Head, Body, Hands, Feet, Neck, or Held Slot equipment.

A Tactical Reserve Scroll is an exception only to the extent stated in [Tactical Reserve](#68-tactical-reserve): it may be used by any Friendly Entity, but it does not become that entity's equipment, Skill, or Spell.

Examples of specific exceptions:

```text
Companion Weapon
May only be equipped by a Hireling.
```

```text
Bone Charm
Your Skeletal Summons gain +1 Defense.
```

```text
Pack Leader
Your Beast Summons deal +1 Physical damage.
```

## 10.15 Healing and Revival of Allies

Unless a card says otherwise:

- Autonomous Allies may be healed by effects that can target allies.
- Controlled Summons may be healed only by effects that specifically affect their summon type, such as Undead, Beast, Construct, or Summon.
- Summons cannot be revived after defeat unless a card specifically says otherwise.
- Autonomous Allies cannot be revived after defeat unless a card specifically says otherwise.

## 10.16 Owner Leaves the Dungeon

Each ally belongs to 1 player group.

When an ally's owner leaves a dungeon:

- Active Summons owned by that character leave play and return to that owner's Inventory.
- Expended Summons belonging to that character return to that owner's Inventory.
- Autonomous Allies and other persistent allies follow their card instructions.

Unless an Autonomous Ally Card says otherwise, that ally leaves the dungeon with its owner.

## 10.17 Combined Groups

When multiple player groups enter the same dungeon:

- All player characters, Controlled Allies, and Autonomous Allies use the same 8 Player Row slots.
- Each player controls that player's own Controlled Allies.
- Each player character receives only 1 shared activation per Encounter Round.
- Each Autonomous Ally receives only 1 independent activation per Encounter Round.
- Friendly Entities may support any player character unless their cards say otherwise.
- No player may exceed that player's own ally limits, even when groups combine.

# 11. World Map, Exploration, Terrain, and Transportation

## 11.1 World Map

The world map is a grid of square map spaces. Each map space contains 1 tile.

Tiles may represent:

- Open terrain
- Difficult terrain
- Water
- Mountains
- Villages
- Towns
- Cities
- Dungeons
- Special locations

The starting region begins revealed. Other map tiles begin face down unless a scenario says otherwise.

## 11.2 Map Sizes

| Map Size | Grid |
| --- | --- |
| Small | 10 x 10 spaces |
| Standard | 12 x 12 spaces |
| Large | 14 x 14 spaces |
| Extended | Up to 20 x 20 spaces |

A map boundary is the edge of the playable world. Characters cannot move beyond it unless a scenario says otherwise.

## 11.3 Biome Chunks

The map is built from biome chunks rather than from one completely mixed terrain pile.

Each chunk represents a coherent biome, such as:

- Forest
- Wetlands
- Tundra
- Desert
- Jungle
- Snowfield
- Volcanic region
- Other scenario-defined biomes

A standard 12 x 12 map uses 9 chunks arranged as a 3 x 3 grid. Each standard chunk contains 16 tiles in a 4 x 4 area. Players begin in the center chunk.

For each biome chunk:

1. Gather the required biome terrain tiles.
2. Replace selected biome terrain tiles with any settlement, dungeon, or special-location tiles assigned to that chunk.
3. Shuffle the chunk's tiles face down.
4. Place them into the chunk's map spaces.

This creates local terrain identity while preserving uncertainty within the chunk.

Smaller, larger, and app-assisted maps may use another chunk layout defined by the scenario.

## 11.4 Adjacent Tiles

An adjacent tile is any tile directly next to the character's current map space, including diagonal spaces.

## 11.5 Travel

When taking a Travel turn:

1. Reveal 1 adjacent face-down tile.
2. Spend Movement Points to move through revealed adjacent tiles.

A character may not enter a face-down tile unless a card specifically allows it.

## 11.6 Scout

Instead of Traveling, a character may Scout.

When taking a Scout turn:

- Do not move.
- Reveal 2 adjacent face-down tiles.

Scout effects represent searching the area, observing routes, or gathering information before committing to travel.

## 11.7 Exploration Effects

Abilities and cards may modify exploration.

Examples:

- Scout: Reveal 2 additional tiles.
- Eagle Eye: Reveal 3 additional tiles.
- Ranger Trait: Whenever you reveal a tile, reveal 1 additional tile.

## 11.8 Terrain

Terrain changes the cost of travel.

| Terrain | Normal Movement Cost | Terrain Category |
| --- | ---: | --- |
| Open Field | 1 | Normal |
| Forest | 2 | Dense |
| Jungle | 2 | Dense |
| Swamp | 2 | Wet |
| Marsh | 2 | Wet |
| Desert | 2 | Extreme |
| Snow | 2 | Extreme |
| Ice | 2 | Extreme |
| Volcanic Region | 2 | Extreme |
| Water | Impassable | Water |
| Mountain | Impassable | Mountain |

Mountains cannot normally be entered. Water cannot normally be entered without a suitable Transportation Card.

## 11.9 Transportation

Each character has 1 Transportation slot.

Transportation Cards may change Movement Points, terrain access, Inventory capacity, Stealth, or other travel rules. No transportation option is intended to be universally best. Terrain and objectives determine which travel method is valuable.

### Traveling on Foot

**Movement:** 1

Benefits:

- Requires no equipment.
- Cannot be dismounted.
- May use Stealth.
- Ignores difficult-terrain movement penalties.

When traveling on foot, Dense, Wet, and Extreme terrain each cost only 1 Movement Point.

A character on foot cannot enter Water or Mountain tiles.

### Draft Horse

**Movement:** 2

Benefits:

- +5 Inventory capacity.

Terrain costs:

- Normal: 1
- Dense: 2
- Wet: 2
- Extreme: 2

A Draft Horse cannot enter Water or Mountain tiles.

### War Horse

**Movement:** 2

Benefits:

- May provide combat-oriented bonuses printed on the card.

Terrain costs:

- Normal: 1
- Dense: 2
- Wet: 2
- Extreme: 2

A War Horse cannot enter Water or Mountain tiles.

### Giant Spider

**Movement:** 2

Benefits:

- Dense terrain costs 1.
- Wet terrain costs 1.
- May climb cliffs or obstacles when a card permits it.

Terrain costs:

- Normal: 1
- Dense: 1
- Wet: 1
- Extreme: 2

A Giant Spider cannot enter Water or Mountain tiles unless a card specifically allows it.

### Camel

**Movement:** 2

Benefits:

- +3 Inventory capacity.
- Extreme terrain costs 1.

Terrain costs:

- Normal: 1
- Dense: 2
- Wet: 2
- Extreme: 1

A Camel cannot enter Water or Mountain tiles.

### Dire Wolf

**Movement:** 2

Benefits:

- May grant Stealth benefits.
- Dense terrain costs 1.
- Snow and Ice cost 1.

Terrain costs:

- Normal: 1
- Dense: 1
- Wet: 2
- Desert: 2
- Snow and Ice: 1

A Dire Wolf cannot enter Water or Mountain tiles.

### Flying Mount

**Movement:** 3

Benefits:

- Dense terrain costs 1.
- Wet terrain costs 1.
- Extreme terrain costs 1.
- May fly over Water.
- May fly over Mountains.

Restrictions:

- A Flying Mount may not end movement on a Mountain tile.
- A Flying Mount provides no Inventory bonus.
- A Flying Mount cannot benefit from Stealth.
- Flying Mounts are intended to be rare and expensive.

### Canoe

**Movement:** 1

Benefits:

- May travel on Rivers and Lakes.
- May carry up to 2 players.

A Canoe occupies a character's Transportation slot and may be carried while its owner is traveling on foot.

Embarking, disembarking, passenger movement, ocean travel, ships, and larger watercraft are reserved for a future transportation expansion.

---

# 12. Settlements, Markets, Currency, and Medical Care

## 12.1 Settlements

Settlements are safe zones where characters may access Inventory, manage equipment, buy cards, sell cards, receive medical care, and use specialty training.

Every settlement has:

- A size
- A specialty
- A market

Settlement size determines market size and general service level. Settlement specialty determines discounts and off-class training access.

## 12.2 Settlement Tiles

There are 15 Settlement Tiles.

| Specialty | Village | Town | City |
| --- | --- | --- | --- |
| Mage | Mage Village | Mage Town | Mage City |
| Warrior | Warrior Village | Warrior Town | Warrior City |
| Rogue | Rogue Village | Rogue Town | Rogue City |
| Cleric | Cleric Village | Cleric Town | Cleric City |
| Druid | Druid Village | Druid Town | Druid City |

Each settlement tile has exactly 1 specialty. There are no separate Trainer Cards or Guild Cards. The tile determines its own specialty.

## 12.3 Village

A Village is a small settlement.

**Village Market:** Reveal and maintain 4 Loot Cards.

Village services:

- Inventory access
- Equipment changes
- Buying and selling
- Storage
- Basic medical care
- Specialty training and discounts

## 12.4 Town

A Town is a medium settlement.

**Town Market:** Reveal and maintain 8 Loot Cards.

Town services:

- Inventory access
- Equipment changes
- Buying and selling
- Storage
- Improved medical care
- Specialty training and discounts

## 12.5 City

A City is a large settlement.

**City Market:** Reveal and maintain 12 Loot Cards.

City services:

- Inventory access
- Equipment changes
- Buying and selling
- Storage
- Advanced medical care
- Specialty training and discounts
- Advanced scenario services, such as crafting stations, blacksmiths, or special quest services

Cities are intended to be rare.

## 12.6 Currency

Currency is represented by tokens, coins, or another setting-appropriate resource.

Currency is used for:

- Buying cards
- Paying for medical care
- Training
- Crafting
- Other settlement services

Currency may be found in dungeons, earned through quests, gained through gathering or crafting in a future module, or received by selling unwanted cards.

## 12.7 Shared Loot Deck

The Loot Deck is 1 shared deck containing all obtainable cards. It may include:

- Weapons
- Armor
- Shields
- Accessories
- Transportation
- Consumable items
- Crafting materials
- Skill Cards
- Spell Cards
- Ability Cards
- Currency cards
- Other treasure

Every Loot Card has a printed Currency cost.

The Loot Deck is used by both settlements and dungeon loot setup. When it becomes empty, shuffle its Loot Discard Pile to form a new Loot Deck.

## 12.8 Markets

Markets do not use separate decks. Each settlement draws cards from the shared Loot Deck.

When a settlement is revealed:

1. Draw Loot Cards equal to that settlement's Market size.
2. Place those cards face up beside the settlement.
3. Maintain that number of displayed cards while the market is active.

All displayed cards may be purchased by any character.

When a card is purchased:

1. Pay its Currency cost.
2. Add the purchased card to the buyer's Inventory, if capacity allows.
3. Immediately draw 1 replacement card from the Loot Deck.

A market remains associated with its settlement after discovery.

## 12.9 Specialty Discounts

A settlement specialty grants a discount to cards tagged for that specialty.

Examples:

- Mage settlements discount Mage and Magic cards.
- Warrior settlements discount Warrior and martial cards.
- Rogue settlements discount Rogue and stealth cards.
- Cleric settlements discount Cleric and holy cards.
- Druid settlements discount Druid and nature cards.

A matching card costs 1 less Currency. A card's cost can never be reduced below 0.

Non-matching cards may still be purchased at full price.

The card's printed specialty tags determine whether it qualifies. The detailed card-tag taxonomy is maintained with the card database.

## 12.10 Specialty Training

A settlement specialty allows training with matching Skill Cards.

For example:

- Mage settlements provide Mage training.
- Warrior settlements provide Warrior training.
- Rogue settlements provide Rogue training.
- Cleric settlements provide Cleric training.
- Druid settlements provide Druid training.

A character wishing to equip an Off-Class Skill must visit a settlement with the matching specialty unless a card or scenario says otherwise.

## 12.11 Selling and Storage

Settlements permit selling and storage. The exact resale value of sold cards and the final handling of sold cards are intentionally not fixed in this alpha rulebook.

Until a scenario provides a specific selling table, do not assume that a sold card becomes an immediately purchasable market card.

## 12.12 Medical Care

Medical rules depend on the Difficulty Preset.

| Settlement | Service Name |
| --- | --- |
| Village | Medicine Man |
| Town | Temple of Healing |
| City | General Hospital |

In **Story Mode**, a character recovers all HP for free at any settlement.

In **Standard Mode**, a character pays 1 Currency per HP restored at a settlement unless a card or scenario says otherwise.

In **Hardcore Mode**, settlements do not restore HP. Characters recover HP only through Spells, Abilities, Items, Tactical Reserve cards, or other stated effects.

Advanced medical services, including resurrection after death, exist only when a rare card, scenario, or specifically stated city service allows them.

---

# 13. Dungeons, Dungeon Loot, Objectives, and Retreat

## 13.1 Dungeons and Encounters

Entering a dungeon begins an encounter.

Each dungeon has its own:

- Dungeon Deck
- Dungeon Discard Pile
- Enemy Front Row
- Enemy Back Row
- Loot Area
- Dungeon objective
- Encounter state

A dungeon normally uses a themed Dungeon Deck, such as:

- Undead
- Beasts
- Goblins
- Elementals
- Demons
- Machines
- Other monster-focused themes

A typical Dungeon Deck contains approximately 30 cards, though final deck size is determined by dungeon type or scenario.

## 13.2 Dungeon Loot Setup

When a dungeon is prepared, shuffle a specified number of Loot Cards from the shared Loot Deck into that dungeon's Dungeon Deck.

The current recommended starting value is 5 Loot Cards per dungeon.

Dungeon loot may include:

- Equipment
- Items
- Currency
- Skill Cards
- Spell Cards
- Ability Cards
- Crafting materials
- Transportation
- Other rewards

## 13.3 Dungeon Cards

Dungeon Cards may include:

- Enemies
- Loot
- Traps
- Events
- Objectives
- Bosses
- Scenario-specific effects

Each Dungeon Card explains how it is resolved.

## 13.4 Dungeon Loot Area

Each active dungeon has a Loot Area.

When a Loot Card is drawn from a Dungeon Deck, place it face up in that dungeon's Loot Area unless the card says to resolve it immediately.

Record the character whose turn revealed the Loot Card as that card's **claimant**. The claimant has first right to resolve that card after the dungeon is cleared. The party may later trade eligible loot at a settlement.

Loot Cards in the Loot Area do not enter a character's Inventory when they are drawn. Inventory capacity is not checked while the dungeon encounter is active.

## 13.5 Currency Cards

When a Currency Card is drawn from a Dungeon Deck, resolve it immediately.

Currency does not count against Inventory capacity. Unless the card says otherwise, Currency gained in a dungeon may be divided among participating characters in any way the players agree.

## 13.6 Immediate Loot

Some Loot Cards have the `Immediate` keyword.

Resolve Immediate Loot as soon as it is drawn. Follow its card instructions. It may be discarded, remain in play, add progress to a dungeon objective, or create another effect.

Immediate Loot does not enter the Loot Area unless its card says otherwise.

## 13.7 Clearing a Dungeon

When a dungeon objective is completed:

1. The dungeon is cleared.
2. All cards in that dungeon's Loot Area become **Recovered Loot**.
3. The cleared dungeon remains cleared for the rest of the campaign unless a scenario or optional Enemy Advance rule says it can repopulate.

Recovered Loot represents treasure carried out of the cleared dungeon by the party. It is not part of any character's Inventory and cannot be used, equipped, traded, or sold until the party reaches a settlement.

## 13.8 Resolving Recovered Loot

At a settlement, resolve Recovered Loot before the party enters another dungeon.

For each Recovered Loot card:

1. Its claimant may add it to that claimant's Inventory, if capacity allows.
2. The claimant may instead sell, store, or discard it.
3. Once it has entered a character's Inventory, it may be traded according to the normal settlement-trading rules.

If the claimant cannot or does not wish to claim the card, the party resolves it by agreement through sale, storage, discard, or a later eligible transfer at the same settlement.

## 13.9 Failed or Abandoned Dungeons

If all participating characters retreat before completing a dungeon objective:

- All cards in that dungeon's Loot Area are lost.
- The dungeon resets according to that dungeon's reset rules.

If at least 1 character remains inside, the dungeon remains active and its Loot Area remains with that active dungeon.

## 13.10 Dungeon Reset

A dungeon's reset rules are supplied by its Dungeon Card or scenario.

The default reset principle is that the dungeon returns to its original unresolved state: enemy rows are cleared, objective progress resets, discarded dungeon contents are restored as required by that dungeon's setup, and the deck is rebuilt and shuffled according to its original construction instructions.

Dungeon designers must state any exception, such as a persistent destroyed object, a permanently defeated boss, or a scenario-specific reset change.

## 13.11 Deck Exhaustion and Objective Design

Dungeon Decks must be designed so that their objective can be completed before the Dungeon Deck is exhausted.

Defeating enemies removes them from future draws. Drawing Loot, Traps, and Events also removes those cards from future draws. As the deck is thinned, the probability of drawing needed quest items, objectives, or the boss should rise.

A dungeon may use this structure to create a search-and-attrition arc: players gradually clear distractions until the objective becomes increasingly likely to appear.

## 13.12 Retreating

A player character may retreat by spending that character's shared activation unless a card says otherwise.

A Controlled Ally cannot independently retreat. When its owner retreats, remove that owner's Controlled Allies from the encounter as described in [Owner Leaves the Dungeon](#1016-owner-leaves-the-dungeon).

When a player character retreats:

- Remove that character from the dungeon encounter.
- Remove all Heat from that character.
- Return that character to the world map outside the dungeon.

A dungeon remains active while at least 1 player character remains inside it.

If all player characters leave, apply the dungeon's reset rule.

---

# 14. Crafting

## 14.1 Version 1 Crafting Scope

Version 1 does not use a separate resource-gathering system.

Crafting uses Blueprint Cards that represent the final crafted product and list the cards and training required to create it.

## 14.2 Crafting a Blueprint

To craft a Blueprint Card:

1. Be at a settlement or another card-defined safe crafting location.
2. Have the Blueprint Card and every listed required card.
3. Have every required Skill Card and specialization equipped.
4. Follow any listed cost or service requirement.
5. Return or discard the listed consumed component cards as directed by the Blueprint.
6. The Blueprint becomes the listed final crafted product.

Example:

```text
Flaming Sword Blueprint

Requirements:
- Iron Sword
- Fire Gem
- Blacksmithing Skill

Craft: Return Iron Sword and Fire Gem to the Loot Discard Pile.
This card becomes Flaming Sword.
```

The exact physical presentation may use a double-sided card, a marker, or another component method. The rules outcome is the same: the Blueprint is the resulting crafted product after its requirements are paid.

## 14.3 Crafting Skills and Specializations

Crafting may require a matching Skill Card and rank.

For example, metal crafting may require an equipped Blacksmithing Skill Card. Blacksmithing may have specialized Ability Cards such as:

- Weaponsmithing
- Armorer
- Exotic Metals

A Blueprint lists the required crafting Skills, rank, and specializations.

## 14.4 Crafting Components

Cards consumed during crafting return to the Loot Discard Pile unless the Blueprint says otherwise.

This keeps crafting connected to the shared Loot Deck without creating a separate gathering deck for Version 1.

---

# 15. Difficulty Presets and Campaign Pressure

Before starting a game, choose 1 Difficulty Preset. A scenario may override a preset when its rules specifically say so.

## 15.1 Story Mode

Story Mode is intended for learning the game, relaxed exploration, shorter campaigns, character builds, and cooperative adventure.

| Setting | Story Mode Rule |
| --- | --- |
| Settlement Healing | Recover all HP for free at any settlement. |
| Downed Characters | Become Downed when Damage equals or exceeds maximum HP. |
| Bleed Out | Advance the Bleed Out Sequence by 1 stage at the end of each Encounter Round. |
| Death | At Bleed Out III, become Unconscious instead of dying. |
| Recovery | Recover after the encounter ends or after the party leaves the dungeon. |
| Resurrection | Not needed because characters do not permanently die. |
| Campaign Timer | Off unless required by the scenario. |
| Enemy Advance | Off unless required by the scenario. |

Story Mode does not remove danger. A Downed character cannot act and may still force the party to retreat or change plans.

## 15.2 Standard Mode

Standard Mode is the default way to play Project S.T.A.C.K.

It provides meaningful risk, resource decisions, rescue opportunities, and consequences without making one bad encounter end an entire campaign.

| Setting | Standard Mode Rule |
| --- | --- |
| Settlement Healing | Pay Currency to restore HP at settlements. |
| Healing Cost | 1 Currency per HP restored unless a settlement or card says otherwise. |
| Downed Characters | Become Downed when Damage equals or exceeds maximum HP. |
| Bleed Out | Advance the Bleed Out Sequence by 1 stage at the end of each Encounter Round. |
| Death | Die at Bleed Out III. |
| Revival During Encounter | Requires a card effect that specifically allows revival. |
| Resurrection After Death | Allowed only through a rare card effect, advanced medical service, or scenario rule that specifically allows it. |
| Campaign Timer | Off unless required by the scenario. |
| Enemy Advance | Off unless required by the scenario. |

Standard Mode uses normal rules for retreating, dungeon resets, lost dungeon loot, limited Inventory, paid healing, and settlement services.

## 15.3 Hardcore Mode

Hardcore Mode is intended for experienced players who want permanent consequences, difficult recovery, and stronger campaign pressure.

| Setting | Hardcore Mode Rule |
| --- | --- |
| Settlement Healing | Settlements do not restore HP. |
| HP Recovery | Recover HP only through Spells, Abilities, Items, Tactical Reserve cards, or other card effects. |
| Downed Characters | Become Downed when Damage equals or exceeds maximum HP. |
| Bleed Out | Advance the Bleed Out Sequence by 1 stage at the end of each Encounter Round. |
| Death | Die at Bleed Out III. |
| Resurrection | Dead characters cannot be resurrected. |
| Campaign Timer | Recommended. |
| Enemy Advance | Recommended. |

Hardcore Mode emphasizes preparation, retreat, travel routes, healing resources, and survival.

## 15.4 Optional Campaign Settings

The following settings may be added to any Difficulty Preset when chosen before the game begins.

### Campaign Timer

A Campaign Timer represents a larger threat that must be stopped before time runs out.

Examples include:

- An enemy army approaching
- A ritual nearing completion
- A spreading plague
- A villain gathering power

At the end of each complete World Round, reduce the Campaign Timer by 1.

If it reaches 0 before the required objectives are completed, the players lose the game. The scenario determines the starting value.

### Enemy Advance

Enemy Advance represents hostile forces expanding territory, influence, strength, or control over the map.

When an Enemy Advance occurs, follow the scenario's listed effect. Possible effects include:

- Place a new Dungeon Tile on an adjacent legal map space.
- Increase the difficulty of an existing dungeon.
- Add Enemy Cards to an active or uncleared Dungeon Deck.
- Place an Enemy Influence marker on a settlement or terrain tile.
- Block, tax, or endanger a route.
- Reduce the Campaign Timer.
- Add a scenario-specific enemy bonus.
- Increase a shared Threat Track.

Enemy Advance should be used only when the scenario supplies clear placement and resolution rules.

### Ironman Death

Ironman Death may be added to Hardcore Mode or used as a special standalone campaign setting.

When Damage equals or exceeds a character's maximum HP:

- That character dies immediately.
- The character does not become Downed.
- The character does not begin a Bleed Out Sequence.
- The character cannot be revived.

Ironman Death is intended for short, high-stakes scenarios.

### No Resurrection

When No Resurrection is active:

- A dead character cannot return to play.
- No card, settlement, medical service, or scenario effect may restore that character unless the scenario specifically says otherwise.

No Resurrection is included in Hardcore Mode by default.

### Shared Party Defeat

When Shared Party Defeat is active, the game ends immediately if every player character is dead, Downed, or otherwise unable to continue.

When Shared Party Defeat is not active, surviving characters may continue the scenario and may attempt to rescue, revive, replace, or recover defeated allies when allowed by the scenario and game rules.

## 15.5 Difficulty Summary

| Setting | Story | Standard | Hardcore |
| --- | --- | --- | --- |
| Settlement Healing | Free full recovery | 1 Currency per HP | No settlement HP recovery |
| Downed at 0 HP | Yes | Yes | Yes |
| Bleed Out | Bleed Out III after 3 Encounter Rounds | Bleed Out III after 3 Encounter Rounds | Bleed Out III after 3 Encounter Rounds |
| Result at Bleed Out III | Unconscious | Death | Permanent death |
| Revival in Dungeon | Card effect required | Card effect required | Card effect required |
| Resurrection After Death | Scenario allowed | Rare and restricted | Not allowed |
| Campaign Timer | Off | Off by default | Recommended |
| Enemy Advance | Off | Off by default | Recommended |
| Intended Experience | Exploration and learning | Core campaign | High-stakes survival |

---

# 16. Scenario Setup

Before starting a game, players choose or receive:

- Scenario or campaign
- Difficulty Preset
- Map size
- Biome chunk layout
- Number of dungeons
- Dungeon types
- Number of Villages, Towns, and Cities
- Victory condition
- Defeat condition
- Optional Campaign Timer
- Optional Enemy Advance rule
- Other scenario-specific rules

The scenario should also define:

- The starting region
- Starting character equipment
- Starting Skill Cards
- Starting Spell or Ability Cards
- Required setup components
- Any class or scenario-specific exceptions

## 16.1 Settlement Tile Setup

The scenario determines how many Villages, Towns, and Cities are used.

Example:

- 4 Villages
- 3 Towns
- 1 City

This creates 8 settlements total.

To select settlement tiles:

1. Randomly draw the required number of Village tiles from the 5 Village tiles.
2. Randomly draw the required number of Town tiles from the 5 Town tiles.
3. Randomly draw the required number of City tiles from the 5 City tiles.
4. Ensure every specialty appears at least once unless the scenario says otherwise.
5. Shuffle the selected Settlement Tiles together.
6. Assign them to biome chunks, then include them among face-down tiles during map setup.

Players do not know a settlement's location, size, or specialty until its tile is revealed.

## 16.2 Victory and Defeat

Players win when they complete the scenario's required objectives.

For the default campaign, players win when they clear all required dungeon tiles.

A dungeon or scenario may have another objective, such as:

- Defeat a boss
- Recover artifacts
- Survive a countdown
- Destroy an object
- Clear all enemies
- Complete a scenario-specific task

The scenario determines how players can lose. Possible defeat conditions include:

- All player characters die.
- A Campaign Timer expires before objectives are completed.
- Enemy forces spread beyond a permitted limit.
- A scenario-specific failure condition occurs.

---

# 17. Accessibility Principles

Project S.T.A.C.K. is intended to be playable with accessible physical components and clear card text.

The game should favor:

- Direct instructions on cards
- Predictable card layouts
- Clear row and slot structure
- Minimal hidden bookkeeping
- Physical organization identifiable by touch, labels, or accessible digital support
- Consistent names for areas, counters, tags, and game states
- App-assisted setup or map randomization when it improves accessibility or reduces setup burden

Specific accessibility component standards, tactile layout standards, card-format rules, and digital-support tools are maintained separately from this core rulebook.

---

# Consolidated Changes Since Version 0.9 Alpha

This version incorporates the following finalized rules:

- **Shared Activation:** A player character and that character's Controlled Allies share 1 normal action. Autonomous Allies act independently through printed AI.
- **Friendly Entity scope:** Player characters, Controlled Allies, and Autonomous Allies all use rows, Heat, and status effects and may be enemy targets when legal.
- **Status-card system:** Every entity has 5 shared Status Row spaces. Negative statuses use the Status Deck; persistent positive effects use the originating card. No duration counters, sideways cards, or separate buff deck.
- **Weapon eligibility:** Weapon Cards use Melee or Ranged range tags plus subtype tags. Weapon-based cards must name their required range and, when applicable, subtype.
- **Skills:** Player characters have exactly 5 Skill Slots. There is no extra global cap on equipped Spells or Abilities beyond Skill capacity.
- **Tactical Reserve:** Every player character has exactly 5 slots. Used Tactical Reserve cards shuffle into the Loot Deck.
- **Prepared Dungeon Effects:** Delayed spells and abilities take the caster's shared activation, wait in the Status Row, and expire at the end of the current Encounter Round if their trigger never occurs.
- **Bleed Out tracking:** The 3-round Bleed Out limit is tracked with cards rather than numerical Bleed counters.
- **Warrior ranks and class HP:** The Warrior ladder is Recruit, Footsoldier, Veteran, Elite, Champion. Cleric maximum HP is 14.

---

# Appendix A: Reference Tables

## A.1 Character HP

| Class | Maximum HP |
| --- | ---: |
| Warrior | 20 |
| Rogue | 18 |
| Cleric | 14 |
| Druid | 14 |
| Mage | 12 |

## A.2 Equipment Slots

| Slot | Typical Contents |
| --- | --- |
| Head | Helmets, hoods, crowns |
| Neck | Amulets, pendants, collars |
| Body | Clothing, armor, robes |
| Hands | Gloves, gauntlets |
| Feet | Boots, greaves |
| Left Held | Weapon, shield, focus, tool |
| Right Held | Weapon, shield, focus, tool |
| Left Ring | Ring |
| Right Ring | Ring |
| Transportation | Mount, vehicle, travel method |

## A.3 Armor and Shield Defense

| Item | Defense |
| --- | ---: |
| Clothing | +0 |
| Leather Armor | +1 |
| Scale Mail or Brigandine | +2 |
| Chainmail | +3 |
| Full Plate | +4 |
| Buckler | +1 |
| Kite Shield or Square Shield | +2 |

## A.4 Skill Capacity

| Rank Position | Capacity |
| --- | ---: |
| 1 | 1 |
| 2 | 2 |
| 3 | 3 |
| 4 | 4 |
| 5 | 5 |

Magic labels are Novice, Apprentice, Adept, Master, and Grand Master. Warrior labels are Recruit, Footsoldier, Veteran, Elite, and Champion.

## A.5 Terrain Costs by Transportation

| Terrain | On Foot | Draft Horse | War Horse | Giant Spider | Camel | Dire Wolf | Flying Mount |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Normal | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| Dense | 1 | 2 | 2 | 1 | 2 | 1 | 1 |
| Wet | 1 | 2 | 2 | 1 | 2 | 2 | 1 |
| Desert | 1 | 2 | 2 | 2 | 1 | 2 | 1 |
| Snow or Ice | 1 | 2 | 2 | 2 | 2 | 1 | 1 |
| Volcanic Region | 1 | 2 | 2 | 2 | 1 | 2 | 1 |
| Water | No | No | No | No* | No | No | May fly over |
| Mountain | No | No | No | No* | No | No | May fly over, cannot end there |

`*` A Giant Spider may enter Water or Mountain only when a card specifically allows it.

## A.6 Settlement Markets

| Settlement | Face-Up Market Cards | Core Services |
| --- | ---: | --- |
| Village | 4 | Inventory, equipment, buy/sell, storage, basic medicine, specialty training |
| Town | 8 | Inventory, equipment, buy/sell, storage, improved medicine, specialty training |
| City | 12 | Inventory, equipment, buy/sell, storage, advanced medicine, specialty training, advanced scenario services |

---

# Appendix B: Glossary

**Ability Card:** A prepared technique, talent, or power attached to a matching Skill Card.

**Autonomous Ally:** A Friendly Entity with an independent activation and a printed AI priority list.

**Bleed Out Sequence:** Three successive cards, Bleed Out I through Bleed Out III, used to track a Downed player character's time before the difficulty preset resolves a death outcome.

**Controlled Ally:** A Friendly Entity directly commanded by its owner. It may take a normal action only when selected for its owner's shared activation.

**Damage Type:** The kind of harm dealt, such as Physical, Fire, Frost, Lightning, Poison, or Force.

**Delivery:** How an effect is used, such as Melee, Ranged, Spell, or Item.

**Downed:** A player character at or above maximum Damage that cannot use a shared activation and begins advancing through the Bleed Out Sequence at the end of Encounter Rounds.

**Dungeon Loot Area:** The face-up area containing non-immediate Loot discovered in an active dungeon.

**Encounter Round:** The complete dungeon sequence of drawing a Dungeon Card, resolving enemies, resolving player-character shared activations, resolving Autonomous Ally activations, and resolving end-of-round effects.

**Friendly Entity:** A player character, Controlled Ally, or Autonomous Ally in the encounter.

**Front Row:** The forward row in an encounter. It may normally use Melee, Ranged, Spells, Items, and Abilities.

**Heat:** A measure of threat used by enemies to choose the highest-Heat legal Friendly Entity.

**Immediate Loot:** Loot with the `Immediate` keyword that resolves when drawn rather than entering the Dungeon Loot Area.

**Independent Activation:** The one normal activation received by an Autonomous Ally each Encounter Round.

**Inventory:** Cards a character carries or stores for later use. It is normally accessible only at safe zones.

**Melee Weapon Attack:** A weapon attack requiring an equipped Weapon Card with the Melee range tag.

**Prepared Dungeon Effect:** An effect prepared with a shared activation that waits in a Status Row for a printed trigger later in the same Encounter Round.

**Ranged Weapon Attack:** A weapon attack requiring an equipped Weapon Card with the Ranged range tag.

**Recovered Loot:** Loot carried out after clearing a dungeon, pending resolution at a settlement.

**Resistance:** A stat that reduces matching non-Physical damage.

**Safe Zone:** A settlement or another card-defined location where Inventory and loadout changes are permitted.

**Shared Activation:** The single normal-action opportunity shared by a player character and that character's Controlled Allies during an Encounter Round.

**Skill Card:** Training that holds matching Spells and Abilities.

**Specialty:** The class domain associated with a settlement, such as Mage, Warrior, Rogue, Cleric, or Druid.

**Status Row:** Five spaces belonging to an entity, used for all active positive and negative status-effect cards.

**Tactical Reserve:** Five prepared slots for tactical or consumable cards usable in dungeons.

**Weapon Attack:** An attack that uses 1 equipped weapon's printed base damage and printed damage types, plus applicable modifiers.

**Weapon Range Tag:** The Melee or Ranged tag required for weapon-attack eligibility.

**Weapon Subtype Tag:** A tag such as Blunt, Sword, Axe, Dagger, Shortbow, Longbow, or Crossbow used by card requirements.

**World Round:** The period after every player has completed 1 World Turn.

**World Turn:** A player's turn on the world map, in a settlement, or as part of a dungeon's Encounter Round.

# Appendix C: Deferred and Provisional Rules

The following topics are intentionally not finalized in this alpha core rulebook. They should be handled only by card text, scenario text, or a mutually agreed campaign note until the final rule is published.

## C.1 Final Starting Loadouts

Each class has a finalized maximum HP value, but final default starting equipment, starting Skill Cards, starting Spells or Abilities, native category lists, class traits, and baseline unarmed or fallback attack options still belong on Character Cards and starter-scenario materials.

## C.2 Off-Class Training Economy

This rulebook establishes where Off-Class Skills may be equipped and what happens when they are removed. Exact Currency costs, trainer discounts, and special loot exceptions remain card- or scenario-defined.

## C.3 Market Resale Rules

Settlements permit selling, but the resale amount, sale destination, player resale access, and scheduled market refresh rules are not yet fixed.

## C.4 Heat Edge Cases

The core Heat rule uses the highest-Heat legal Friendly Entity. Heat ties and non-damage Heat interactions still need a final shared reference.

## C.5 Water Travel and Large Vehicles

The Canoe establishes a basic small-watercraft concept. Embarking, disembarking, passenger turns, oceans, ships, warships, steamships, and other large vehicles are reserved for a later expansion.

## C.6 Advanced Map Generation

The core chunk-based biome map system is complete for physical setup. App-assisted randomization may later generate more structured maps, including roads, rivers, mountain chains, and other geographic features.

## C.7 Optional Last Stand Rule

A Last Stand action may become an optional rule, but no default Last Stand action is part of this alpha core ruleset.


## C.8 Broken, Cursed, and Bound Equipment

These mechanics are not used by default. Future modules may introduce them through cards or scenarios.

