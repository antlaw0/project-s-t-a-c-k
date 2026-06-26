I made one structural change that will save balance headaches later: **static Defense stays on Body armor and Shields only**. That preserves the existing equipment-based maximum of **6 Defense** with `Full Plate + Square/Kite Shield`, while headwear, gloves, boots, jewelry, and caster gear provide narrower benefits instead of quietly turning every slot into another armor plate.

I also unified the earlier **WPR** and **APR** concepts into one database field: **Equipment Power Rating (EPR)**. The existing weapon and armor values remain the same.

# Project S.T.A.C.K.

# Starter Equipment Catalog

**Document Status:** Alpha baseline
**Purpose:** Initial player equipment pool for starting characters, early shops, basic dungeon loot, and early balance testing.

---

# 1. Equipment Slots

Each character has the following equipment slots:

| Equipment Slot | Slots Available | Purpose                                                   |
| -------------- | --------------: | --------------------------------------------------------- |
| Weapon         |               1 | Holds a melee weapon, ranged weapon, or staff.            |
| Off-Hand       |               1 | Holds a Shield or Focus if the character has a free hand. |
| Body           |               1 | Holds Clothing or Armor.                                  |
| Head           |               1 | Holds headwear such as hoods, caps, or helms.             |
| Handwear       |               1 | Holds gloves, gauntlets, or similar worn hand equipment.  |
| Feet           |               1 | Holds boots, shoes, or greaves.                           |
| Neck           |               1 | Holds a pendant, amulet, necklace, or similar item.       |
| Ring           |               1 | Holds one ring.                                           |

## 1.1 Weapon Hand Rules

```text
A weapon with Hands Required: 1 Hand leaves the character's Off-Hand slot available.

A weapon with Hands Required: 2 Hands occupies both hands.

A character using a 2-Hand weapon cannot equip a Shield or Focus.

Handwear does not occupy a combat hand.
Gloves, gauntlets, and similar items use the Handwear slot only.
```

Examples:

```text
Arming Sword + Buckler
Legal:
The Arming Sword uses 1 Hand.
The Buckler uses the Off-Hand slot.
```

```text
Battleaxe + Kite Shield
Illegal:
The Battleaxe requires 2 Hands.
The Kite Shield requires the Off-Hand slot.
```

```text
Runed Staff + Crystal Focus
Illegal:
The Runed Staff requires 2 Hands.
The Crystal Focus requires the Off-Hand slot.
```

## 1.2 Ring Slot Rule

```text
A character may equip only one Ring during the alpha.

Do not add a second Ring slot until the game has enough jewelry options to justify it.
```

One Ring slot keeps accessory stacking controlled while still allowing Rings to matter.

---

# 2. Equipment Defense Rules

## 2.1 Base Equipment Defense

```text
Base Defense from equipment comes only from Body armor and Shields.

Headwear, Handwear, Feet, Neck, and Ring equipment should not provide unrestricted permanent Defense during the initial alpha.
```

This preserves the intended base equipment Defense progression:

| Body Equipment     |                       Shield | Total Equipment Defense |
| ------------------ | ---------------------------: | ----------------------: |
| Traveler's Clothes |                         None |                       0 |
| Leather Armor      |                      Buckler |                       2 |
| Chainmail          |                      Buckler |                       3 |
| Chainmail          |                Square Shield |                       4 |
| Scale Mail         |                Square Shield |                       5 |
| Full Plate         | Square Shield or Kite Shield |                       6 |

```text
The intended maximum permanent Defense from ordinary equipped gear is 6.

Temporary bonuses from spells, status cards, abilities, or special effects may exceed 6 later, subject to the final Defense-cap rules.
```

## 2.2 Physical Defense

```text
Defense reduces Physical damage only.

Defense cannot reduce a Physical damage packet below 0.

Resolve each damage packet separately.
```

Example:

```text
An attack deals 3 Physical damage.
The target has 2 Defense.

The target takes 1 Physical damage.
```

Example:

```text
An attack deals 1 Physical damage and 1 Fire damage.
The target has 1 Defense.

The target takes:
0 Physical damage
1 Fire damage

Total: 1 damage
```

---

# 3. Equipment Tags and Proficiencies

## 3.1 Equipment Tags

Equipment Tags identify what an item is and what cards can interact with it.

Examples:

```text
Weapon Tags:
Blade, Sword, Dagger, Blunt, Axe, Polearm, Spear, Bow, Shortbow, Longbow, Crossbow, Staff

Armor Tags:
Clothing, Robe, Light Armor, Padded, Leather, Medium Armor, Chain, Scale, Heavy Armor, Plate

Off-Hand Tags:
Shield, Buckler, Square Shield, Kite Shield, Focus, Crystal, Holy, Ember

Accessory Tags:
Headgear, Hood, Helm, Handwear, Gloves, Boots, Pendant, Ring
```

## 3.2 Armor Proficiency

| Proficiency  | May Equip                                            |
| ------------ | ---------------------------------------------------- |
| None         | Clothing only                                        |
| Light Armor  | Clothing and Light Armor                             |
| Medium Armor | Clothing, Light Armor, and Medium Armor              |
| Heavy Armor  | Clothing, Light Armor, Medium Armor, and Heavy Armor |

## 3.3 Weapon and Shield Proficiency

A Character Class card, equipped Skill card, or another game effect may grant proficiency in a weapon family or Shield use.

Possible initial proficiencies include:

```text
Blade
Axe
Blunt
Polearm
Bow
Crossbow
Shield
Spellcasting
```

## 3.4 Spellcasting Proficiency

```text
A character has Spellcasting proficiency when their Character Class card, equipped Skill cards, or another effect explicitly grants Spellcasting proficiency.
```

Spellcasting proficiency may be used to equip or activate items with tags such as:

```text
Focus
Staff
Robe
Holy
Arcane
Elemental
Necromancy
```

---

# 4. Equipment Power Rating and Shop Value

Each item has an internal **Equipment Power Rating**, abbreviated as **EPR**.

```text
Printed Value = EPR × 10 Gold

Sell Value = half the printed Value
```

EPR is primarily a game-design and economy field. It may be stored in the database without appearing on the physical card.

## 4.1 Initial EPR Budget

| Feature                              | EPR Cost |
| ------------------------------------ | -------: |
| 1 reliable total damage              |        2 |
| 2 reliable total damage              |        5 |
| 3 reliable total damage              |        9 |
| 4 reliable total damage              |       14 |
| Weapon has the Ranged tag            |       +2 |
| Weapon requires 1 Hand               |       +2 |
| Weapon requires 2 Hands              |       +0 |
| Reach                                |       +1 |
| Penetrating 1                        |       +2 |
| +1 permanent Defense                 |       +3 |
| +2 permanent Defense                 |       +7 |
| +3 permanent Defense                 |      +12 |
| +4 permanent Defense                 |      +18 |
| Minor once-per-combat effect         |       +2 |
| Strong once-per-combat effect        | +3 to +4 |
| Resistance 1 against one damage type |       +2 |
| Narrow conditional effect            | +1 to +3 |

## 4.2 Rarity and Value

```text
Value measures shop cost and resale value.

EPR measures mechanical power.

Rarity measures availability.

These are separate controls.
```

A Rare item may be difficult to find without being vastly stronger than a Common item.

---

# 5. Standard Equipment Traits

## 5.1 Reach

```text
Reach:
While in the Front Row, this weapon may target an enemy in the opposing Back Row with a melee weapon attack.
```

## 5.2 Penetrating 1

```text
Penetrating 1:
When this weapon deals Physical damage, ignore 1 Defense for that attack.
```

## 5.3 Resistance 1

```text
[Damage Type] Resistance 1:
Reduce each matching damage packet by 1, to a minimum of 0.
```

Example:

```text
Fire Resistance 1:
Reduce each Fire damage packet by 1, to a minimum of 0.
```

## 5.4 Channeling

```text
Channeling:
A character may activate no more than one Channeling trait per combat, regardless of how many equipped items have Channeling.

If multiple Channeling traits could apply, the character chooses one eligible trait.

A Channeling trait may modify only a spell resolved by its owner.
```

This rule prevents a caster from stacking a robe, focus, staff, ring, and necklace into a single oversized spell burst.

---

# 6. Weapon Cards

## Wooden Club

```text
Name: Wooden Club
Equipment Slot: Weapon
Range Tag: Melee
Weapon Tags: Blunt
Damage: 1 Physical
Hands Required: 1 Hand
Required Proficiency: None
Traits: None
EPR: 4
Value: 40 Gold
Rarity: Common
```

---

## Utility Dagger

```text
Name: Utility Dagger
Equipment Slot: Weapon
Range Tag: Melee
Weapon Tags: Blade, Dagger
Damage: 1 Physical
Hands Required: 1 Hand
Required Proficiency: None
Traits: None
EPR: 4
Value: 40 Gold
Rarity: Common
```

---

## Short Sword

```text
Name: Short Sword
Equipment Slot: Weapon
Range Tag: Melee
Weapon Tags: Blade, Sword
Damage: 1 Physical
Hands Required: 1 Hand
Required Proficiency: Blade
Traits: None
EPR: 4
Value: 40 Gold
Rarity: Common
```

---

## Arming Sword

```text
Name: Arming Sword
Equipment Slot: Weapon
Range Tag: Melee
Weapon Tags: Blade, Sword
Damage: 2 Physical
Hands Required: 1 Hand
Required Proficiency: Blade
Traits: None
EPR: 7
Value: 70 Gold
Rarity: Common
```

---

## Hand Axe

```text
Name: Hand Axe
Equipment Slot: Weapon
Range Tag: Melee
Weapon Tags: Axe
Damage: 1 Physical
Hands Required: 1 Hand
Required Proficiency: Axe
Traits: None
EPR: 4
Value: 40 Gold
Rarity: Common
```

---

## Battleaxe

```text
Name: Battleaxe
Equipment Slot: Weapon
Range Tag: Melee
Weapon Tags: Axe
Damage: 2 Physical
Hands Required: 2 Hands
Required Proficiency: Axe
Traits: None
EPR: 5
Value: 50 Gold
Rarity: Common
```

---

## Warhammer

```text
Name: Warhammer
Equipment Slot: Weapon
Range Tag: Melee
Weapon Tags: Blunt
Damage: 1 Physical
Hands Required: 1 Hand
Required Proficiency: Blunt
Traits: Penetrating 1
EPR: 6
Value: 60 Gold
Rarity: Uncommon
```

---

## Iron Spear

```text
Name: Iron Spear
Equipment Slot: Weapon
Range Tag: Melee
Weapon Tags: Polearm, Spear
Damage: 1 Physical
Hands Required: 2 Hands
Required Proficiency: Polearm
Traits: Reach
EPR: 3
Value: 30 Gold
Rarity: Common
```

---

## Shortbow

```text
Name: Shortbow
Equipment Slot: Weapon
Range Tag: Ranged
Weapon Tags: Bow, Shortbow
Damage: 1 Physical
Hands Required: 2 Hands
Required Proficiency: Bow
Traits: None
EPR: 4
Value: 40 Gold
Rarity: Common
```

---

## Longbow

```text
Name: Longbow
Equipment Slot: Weapon
Range Tag: Ranged
Weapon Tags: Bow, Longbow
Damage: 2 Physical
Hands Required: 2 Hands
Required Proficiency: Bow
Traits: None
EPR: 7
Value: 70 Gold
Rarity: Uncommon
```

---

## Light Crossbow

```text
Name: Light Crossbow
Equipment Slot: Weapon
Range Tag: Ranged
Weapon Tags: Crossbow
Damage: 1 Physical
Hands Required: 2 Hands
Required Proficiency: Crossbow
Traits: Penetrating 1
EPR: 6
Value: 60 Gold
Rarity: Uncommon
```

---

## Oak Staff

```text
Name: Oak Staff
Equipment Slot: Weapon
Range Tag: Melee
Weapon Tags: Blunt, Staff
Damage: 1 Physical
Hands Required: 2 Hands
Required Proficiency: None
Traits: None
EPR: 2
Value: 20 Gold
Rarity: Common
```

The Oak Staff is a basic staff weapon. It is suitable for a caster who wants a simple physical backup option or future Staff-tag ability compatibility.

---

## Runed Staff

```text
Name: Runed Staff
Equipment Slot: Weapon
Range Tag: Melee
Weapon Tags: Blunt, Staff, Implement
Damage: 1 Physical
Hands Required: 2 Hands
Required Proficiency: Spellcasting
Traits:
Channeling:
Once per combat, when a spell you use deals damage,
add 1 damage to one damage packet dealt by that spell.
EPR: 5
Value: 50 Gold
Rarity: Uncommon
```

The Runed Staff is intended for offensive spellcasters who are willing to give up Shield and Focus access for a two-handed caster weapon.

---

# 7. Body Equipment Cards

## Traveler's Clothes

```text
Name: Traveler's Clothes
Equipment Slot: Body
Category: Clothing
Armor Tags: Clothing
Defense Bonus: +0
Required Proficiency: None
Traits: None
EPR: 0
Value: 0 Gold
Rarity: Common
```

---

## Apprentice Robes

```text
Name: Apprentice Robes
Equipment Slot: Body
Category: Clothing
Armor Tags: Clothing, Robe
Defense Bonus: +0
Required Proficiency: None
Traits: None
EPR: 0
Value: 0 Gold
Rarity: Common
```

---

## Spellweave Robes

```text
Name: Spellweave Robes
Equipment Slot: Body
Category: Clothing
Armor Tags: Clothing, Robe, Spellweave
Defense Bonus: +0
Required Proficiency: Spellcasting
Traits:
Channeling:
Once per combat, when a spell you use deals damage or restores HP,
choose one:

- Add 1 damage to one damage packet dealt by that spell.
- Restore 1 additional HP through that spell.
EPR: 3
Value: 30 Gold
Rarity: Uncommon
```

This is the recommended initial robe that enhances magical ability.

Do not use passive effects such as:

```text
All spells deal +1 damage.
All spells restore +1 HP.
```

Because spells do not use mana or a limited-use recovery system, a permanent bonus of that kind would compound too quickly across every combat round.

---

## Padded Gambeson

```text
Name: Padded Gambeson
Equipment Slot: Body
Category: Armor
Armor Tags: Light Armor, Padded
Defense Bonus: +1
Required Proficiency: Light Armor
Traits: None
EPR: 3
Value: 30 Gold
Rarity: Common
```

---

## Leather Armor

```text
Name: Leather Armor
Equipment Slot: Body
Category: Armor
Armor Tags: Light Armor, Leather
Defense Bonus: +1
Required Proficiency: Light Armor
Traits: None
EPR: 3
Value: 30 Gold
Rarity: Common
```

---

## Chainmail

```text
Name: Chainmail
Equipment Slot: Body
Category: Armor
Armor Tags: Medium Armor, Chain
Defense Bonus: +2
Required Proficiency: Medium Armor
Traits: None
EPR: 7
Value: 70 Gold
Rarity: Common
```

---

## Scale Mail

```text
Name: Scale Mail
Equipment Slot: Body
Category: Armor
Armor Tags: Medium Armor, Scale
Defense Bonus: +3
Required Proficiency: Medium Armor
Traits: None
EPR: 12
Value: 120 Gold
Rarity: Uncommon
```

---

## Full Plate

```text
Name: Full Plate
Equipment Slot: Body
Category: Armor
Armor Tags: Heavy Armor, Plate
Defense Bonus: +4
Required Proficiency: Heavy Armor
Traits: None
EPR: 18
Value: 180 Gold
Rarity: Rare
```

---

# 8. Off-Hand Equipment Cards

## Buckler

```text
Name: Buckler
Equipment Slot: Off-Hand
Category: Shield
Equipment Tags: Shield, Buckler
Defense Bonus: +1
Required Proficiency: Shield
Requirements:
Requires an equipped Weapon with Hands Required: 1 Hand.
Traits: None
EPR: 3
Value: 30 Gold
Rarity: Common
```

---

## Square Shield

```text
Name: Square Shield
Equipment Slot: Off-Hand
Category: Shield
Equipment Tags: Shield, Square Shield
Defense Bonus: +2
Required Proficiency: Shield
Requirements:
Requires an equipped Weapon with Hands Required: 1 Hand.
Traits: None
EPR: 7
Value: 70 Gold
Rarity: Common
```

---

## Kite Shield

```text
Name: Kite Shield
Equipment Slot: Off-Hand
Category: Shield
Equipment Tags: Shield, Kite Shield
Defense Bonus: +2
Required Proficiency: Shield
Requirements:
Requires an equipped Weapon with Hands Required: 1 Hand.
Traits: None
EPR: 7
Value: 70 Gold
Rarity: Common
```

Square Shields and Kite Shields are intentionally equal in starting combat power.

Their differing tags create future room for class abilities, loot traits, enemy effects, and narrative identity without forcing extra complexity into the alpha.

---

## Crystal Focus

```text
Name: Crystal Focus
Equipment Slot: Off-Hand
Category: Focus
Equipment Tags: Focus, Crystal, Implement
Defense Bonus: +0
Required Proficiency: Spellcasting
Requirements:
Requires an equipped Weapon with Hands Required: 1 Hand,
or no equipped Weapon.
Traits: None
EPR: 1
Value: 10 Gold
Rarity: Common
```

The Crystal Focus is a basic caster Off-Hand item.

It primarily exists to support future Focus-tag abilities, spells, class features, and specialized magic equipment.

---

## Sunstone Focus

```text
Name: Sunstone Focus
Equipment Slot: Off-Hand
Category: Focus
Equipment Tags: Focus, Crystal, Holy, Implement
Defense Bonus: +0
Required Proficiency: Spellcasting
Requirements:
Requires an equipped Weapon with Hands Required: 1 Hand,
or no equipped Weapon.
Traits:
Channeling:
Once per combat, when a spell you use restores HP,
restore 1 additional HP.
EPR: 2
Value: 20 Gold
Rarity: Uncommon
```

The Sunstone Focus is intended as an early healer, cleric, biomancy, or support-caster focus.

---

## Ember Focus

```text
Name: Ember Focus
Equipment Slot: Off-Hand
Category: Focus
Equipment Tags: Focus, Crystal, Ember, Implement
Defense Bonus: +0
Required Proficiency: Spellcasting
Requirements:
Requires an equipped Weapon with Hands Required: 1 Hand,
or no equipped Weapon.
Traits:
Channeling:
Once per combat, when a spell you use deals Fire damage,
add 1 Fire damage to one Fire damage packet dealt by that spell.
EPR: 2
Value: 20 Gold
Rarity: Uncommon
```

The Ember Focus is intended as an early Elementalism-focused caster item.

---

# 9. Head Equipment Cards

## Traveler's Hood

```text
Name: Traveler's Hood
Equipment Slot: Head
Category: Headwear
Equipment Tags: Headgear, Hood, Clothing
Required Proficiency: None
Traits: None
EPR: 0
Value: 0 Gold
Rarity: Common
```

---

## Scholar's Cap

```text
Name: Scholar's Cap
Equipment Slot: Head
Category: Headwear
Equipment Tags: Headgear, Cap, Clothing
Required Proficiency: None
Traits: None
EPR: 0
Value: 0 Gold
Rarity: Common
```

The Scholar's Cap creates an early Headgear and Cap tag platform for future scholar, mage, ritualist, or alchemist effects.

---

## Iron Helm

```text
Name: Iron Helm
Equipment Slot: Head
Category: Headwear
Equipment Tags: Headgear, Helm, Metal
Required Proficiency: Medium Armor
Traits:
Hard Headed:
Once per combat, when you would gain Stun,
ignore that Stun.
EPR: 4
Value: 40 Gold
Rarity: Uncommon
```

The Iron Helm does not provide permanent Defense. It protects against one of the most punishing control effects without raising the baseline Defense ceiling.

---

# 10. Handwear Equipment Cards

## Work Gloves

```text
Name: Work Gloves
Equipment Slot: Handwear
Category: Handwear
Equipment Tags: Handwear, Gloves, Clothing
Required Proficiency: None
Traits: None
EPR: 0
Value: 0 Gold
Rarity: Common
```

---

## Weapon Grip Gloves

```text
Name: Weapon Grip Gloves
Equipment Slot: Handwear
Category: Handwear
Equipment Tags: Handwear, Gloves
Required Proficiency: None
Traits:
Firm Grip:
Once per combat, when you make a weapon attack,
add 1 Physical damage to that attack.
EPR: 2
Value: 20 Gold
Rarity: Uncommon
```

```text
Firm Grip may modify a Melee weapon attack or Ranged weapon attack.

Firm Grip does not modify damage dealt by spells.
```

---

# 11. Feet Equipment Cards

## Travel Boots

```text
Name: Travel Boots
Equipment Slot: Feet
Category: Footwear
Equipment Tags: Footwear, Boots, Clothing
Required Proficiency: None
Traits: None
EPR: 0
Value: 0 Gold
Rarity: Common
```

---

## Surefoot Boots

```text
Name: Surefoot Boots
Equipment Slot: Feet
Category: Footwear
Equipment Tags: Footwear, Boots
Required Proficiency: None
Traits:
Surefoot:
Once per combat, when an enemy, trap, event, or other effect
would force you to change rows, ignore that forced row change.
EPR: 2
Value: 20 Gold
Rarity: Uncommon
```

```text
Surefoot does not grant free movement.

Surefoot does not allow a character to move without spending
the action or movement cost normally required by the core rules.

Surefoot only prevents forced movement.
```

---

# 12. Neck Equipment Cards

## Simple Pendant

```text
Name: Simple Pendant
Equipment Slot: Neck
Category: Necklace
Equipment Tags: Neck, Pendant
Required Proficiency: None
Traits: None
EPR: 0
Value: 0 Gold
Rarity: Common
```

---

## Guardian Pendant

```text
Name: Guardian Pendant
Equipment Slot: Neck
Category: Necklace
Equipment Tags: Neck, Pendant, Guardian
Required Proficiency: None
Traits:
Protective Spark:
Once per combat, when you would take damage,
reduce one damage packet by 1, to a minimum of 0.
EPR: 3
Value: 30 Gold
Rarity: Uncommon
```

```text
Protective Spark may reduce Physical, Fire, Cold, Lightning,
Poison, or another damage type.

Protective Spark affects only one damage packet.

It does not reduce all damage from an attack unless that attack
contains only one damage packet.
```

---

# 13. Ring Equipment Cards

## Plain Ring

```text
Name: Plain Ring
Equipment Slot: Ring
Category: Ring
Equipment Tags: Ring
Required Proficiency: None
Traits: None
EPR: 0
Value: 0 Gold
Rarity: Common
```

---

## Emberward Ring

```text
Name: Emberward Ring
Equipment Slot: Ring
Category: Ring
Equipment Tags: Ring, Ember, Fire
Required Proficiency: None
Traits:
Fire Resistance 1
EPR: 2
Value: 20 Gold
Rarity: Uncommon
```

---

## Venomward Ring

```text
Name: Venomward Ring
Equipment Slot: Ring
Category: Ring
Equipment Tags: Ring, Venom, Poison
Required Proficiency: None
Traits:
Poison Resistance 1
EPR: 2
Value: 20 Gold
Rarity: Uncommon
```

```text
Poison Resistance 1 reduces Poison damage packets by 1,
to a minimum of 0.

Poison Resistance does not automatically prevent a Poison status card
from being applied unless the effect applying Poison explicitly says
that it deals Poison damage instead of applying a status.
```

---

# 14. Starter Equipment Roles

| Equipment Type | Primary Purpose                                                           |
| -------------- | ------------------------------------------------------------------------- |
| Weapons        | Define attack type, damage, weapon-family abilities, and hand commitment. |
| Body Armor     | Provides the largest permanent source of Defense.                         |
| Shields        | Provide additional permanent Defense in exchange for the Off-Hand slot.   |
| Focuses        | Support caster build tags and limited spell enhancement.                  |
| Headwear       | Provides narrow status protection and build tags.                         |
| Handwear       | Provides limited weapon-use enhancements.                                 |
| Footwear       | Provides positioning and movement-related protection.                     |
| Neck Equipment | Provides flexible defensive utility.                                      |
| Rings          | Provides narrow elemental or poison resistance.                           |

---

# 15. Initial Build Examples

## Sword-and-Shield Warrior

```text
Weapon: Arming Sword
Off-Hand: Square Shield
Body: Chainmail
Head: Iron Helm
Handwear: Weapon Grip Gloves
Feet: Surefoot Boots
Neck: Guardian Pendant
Ring: Emberward Ring
```

Base Defense:

```text
Chainmail: +2 Defense
Square Shield: +2 Defense

Total Permanent Equipment Defense: 4
```

---

## Two-Handed Barbarian

```text
Weapon: Battleaxe
Off-Hand: Empty
Body: Leather Armor
Head: Traveler's Hood
Handwear: Weapon Grip Gloves
Feet: Surefoot Boots
Neck: Guardian Pendant
Ring: Venomward Ring
```

Base Defense:

```text
Leather Armor: +1 Defense

Total Permanent Equipment Defense: 1
```

The Barbarian trades Shield access and Defense for stronger weapon-driven abilities and two-handed weapon access.

---

## Offensive Caster

```text
Weapon: Runed Staff
Off-Hand: Empty
Body: Spellweave Robes
Head: Scholar's Cap
Handwear: Work Gloves
Feet: Travel Boots
Neck: Guardian Pendant
Ring: Emberward Ring
```

```text
The Runed Staff and Spellweave Robes both have Channeling.

The character may use only one Channeling trait per combat.

The player chooses whether to use:
- Runed Staff for +1 spell damage, or
- Spellweave Robes for +1 spell damage or +1 healing.
```

---

## Support Caster

```text
Weapon: Utility Dagger
Off-Hand: Sunstone Focus
Body: Spellweave Robes
Head: Scholar's Cap
Handwear: Work Gloves
Feet: Travel Boots
Neck: Guardian Pendant
Ring: Plain Ring
```

```text
The Sunstone Focus and Spellweave Robes both have Channeling.

The character may activate only one Channeling trait per combat.

The player chooses the best eligible spell enhancement during that combat.
```

---

# 16. Initial Design Limits

Do not add these systems to the initial equipment pool unless testing identifies a specific need:

* Individual helmet, chest, glove, boot, and leg armor Defense stacking
* Armor durability
* Repair costs
* Ammunition tracking
* Weapon reload actions
* Weapon weight
* Armor weight
* Spell failure chances
* Passive universal spell damage bonuses
* Passive universal healing bonuses
* Multiple Ring slots
* Multiple Necklace slots
* Set bonuses
* Activated equipment with several choices
* Effects that require tracking separate counters on equipment cards

The initial equipment system should remain readable through a screen reader, easy to lay out physically, and manageable without creating a bookkeeping hydra.

---

# 17. Future Equipment Expansion Hooks

The initial tags intentionally leave room for later specialization.

Examples:

```text
Shadowweave Leather Armor
Armor Tags: Light Armor, Leather, Shadow

Sunforged Plate
Armor Tags: Heavy Armor, Plate, Holy

Gravetender Robes
Armor Tags: Clothing, Robe, Necromancy

Stormglass Focus
Equipment Tags: Focus, Crystal, Lightning, Implement

Dwarven Kite Shield
Equipment Tags: Shield, Kite Shield, Dwarven

Ranger's Longbow
Weapon Tags: Bow, Longbow, Hunting

Serrated Dagger
Weapon Tags: Blade, Dagger
```

Tags can make future ability cards, loot effects, enemy interactions, and dungeon rewards feel distinct without requiring every item to introduce an entirely new rule.

# Initial Weapon Cards

## Weapon Card Standard

Every weapon card uses the following fields:

* **Name**
* **Equipment Slot**
* **Range Tag**
* **Weapon Tags**
* **Damage**
* **Hands Required**
* **Required Proficiency**
* **Traits**
* **WPR**
* **Value**
* **Rarity**

### Core Definitions

#### Equipment Slot

All cards in this file use:

```text
Equipment Slot: Weapon
```

#### Range Tags

A weapon has one of the following range tags:

* `Melee`
* `Ranged`

Ability cards must check the appropriate range tag when they call for a weapon attack.

Examples:

```text
Make a melee weapon attack.
```

Requires an equipped weapon with the `Melee` tag.

```text
Make a ranged weapon attack.
```

Requires an equipped weapon with the `Ranged` tag.

#### Weapon Tags

Weapon tags identify the weapon's category and subtype. Ability cards may require one or more specific tags.

Examples:

```text
Melee, Blade, Sword
Melee, Blunt
Melee, Polearm, Spear
Ranged, Bow, Shortbow
Ranged, Crossbow
```

#### Required Proficiency

A character may use a weapon only if their Character Class card, equipped Skill cards, or another effect grants the required proficiency.

Possible initial proficiencies include:

* None
* Blade
* Axe
* Blunt
* Polearm
* Bow
* Crossbow

#### Weapon Attack

A weapon attack uses the equipped weapon's printed Damage and Traits.

```text
Melee weapon attack:
Requires a weapon with the Melee tag.

Ranged weapon attack:
Requires a weapon with the Ranged tag.
```

#### Reach

```text
Reach:
While in the Front Row, this weapon may target an enemy in the opposing Back Row with a melee weapon attack.
```

#### Penetrating 1

```text
Penetrating 1:
When this weapon deals Physical damage, ignore 1 Defense for that attack.
```

---

# Weapon Power Rating and Value

Each weapon receives an internal **Weapon Power Rating**, abbreviated as **WPR**.

```text
Printed Value = WPR × 10 gold
Sell Value = half the weapon's printed Value
```

WPR is primarily a balance and economy tool. It does not need to be printed on the physical card, but it should exist in the game database.

## Initial WPR Costs

| Feature                             | WPR Cost |
| ----------------------------------- | -------: |
| 1 reliable total damage             |        2 |
| 2 reliable total damage             |        5 |
| 3 reliable total damage             |        9 |
| 4 reliable total damage             |       14 |
| Weapon has the Ranged tag           |       +2 |
| Weapon requires 1 Hand              |       +2 |
| Weapon requires 2 Hands             |       +0 |
| Reach                               |       +1 |
| Penetrating 1                       |       +2 |
| Narrow conditional +1 damage effect |       +1 |
| Choice between damage types         |       +1 |

---

# Starting Weapon Cards

## Wooden Club

```text
Name: Wooden Club
Equipment Slot: Weapon
Range Tag: Melee
Weapon Tags: Blunt
Damage: 1 Physical
Hands Required: 1 Hand
Required Proficiency: None
Traits: None
WPR: 4
Value: 40 Gold
Rarity: Common
```

---

## Utility Dagger

```text
Name: Utility Dagger
Equipment Slot: Weapon
Range Tag: Melee
Weapon Tags: Blade, Dagger
Damage: 1 Physical
Hands Required: 1 Hand
Required Proficiency: None
Traits: None
WPR: 4
Value: 40 Gold
Rarity: Common
```

---

## Short Sword

```text
Name: Short Sword
Equipment Slot: Weapon
Range Tag: Melee
Weapon Tags: Blade, Sword
Damage: 1 Physical
Hands Required: 1 Hand
Required Proficiency: Blade
Traits: None
WPR: 4
Value: 40 Gold
Rarity: Common
```

---

## Arming Sword

```text
Name: Arming Sword
Equipment Slot: Weapon
Range Tag: Melee
Weapon Tags: Blade, Sword
Damage: 2 Physical
Hands Required: 1 Hand
Required Proficiency: Blade
Traits: None
WPR: 7
Value: 70 Gold
Rarity: Common
```

---

## Hand Axe

```text
Name: Hand Axe
Equipment Slot: Weapon
Range Tag: Melee
Weapon Tags: Axe
Damage: 1 Physical
Hands Required: 1 Hand
Required Proficiency: Axe
Traits: None
WPR: 4
Value: 40 Gold
Rarity: Common
```

---

## Battleaxe

```text
Name: Battleaxe
Equipment Slot: Weapon
Range Tag: Melee
Weapon Tags: Axe
Damage: 2 Physical
Hands Required: 2 Hands
Required Proficiency: Axe
Traits: None
WPR: 5
Value: 50 Gold
Rarity: Common
```

---

## Warhammer

```text
Name: Warhammer
Equipment Slot: Weapon
Range Tag: Melee
Weapon Tags: Blunt
Damage: 1 Physical
Hands Required: 1 Hand
Required Proficiency: Blunt
Traits: Penetrating 1
WPR: 6
Value: 60 Gold
Rarity: Uncommon
```

---

## Iron Spear

```text
Name: Iron Spear
Equipment Slot: Weapon
Range Tag: Melee
Weapon Tags: Polearm, Spear
Damage: 1 Physical
Hands Required: 2 Hands
Required Proficiency: Polearm
Traits: Reach
WPR: 3
Value: 30 Gold
Rarity: Common
```

---

## Shortbow

```text
Name: Shortbow
Equipment Slot: Weapon
Range Tag: Ranged
Weapon Tags: Bow, Shortbow
Damage: 1 Physical
Hands Required: 2 Hands
Required Proficiency: Bow
Traits: None
WPR: 4
Value: 40 Gold
Rarity: Common
```

---

## Longbow

```text
Name: Longbow
Equipment Slot: Weapon
Range Tag: Ranged
Weapon Tags: Bow, Longbow
Damage: 2 Physical
Hands Required: 2 Hands
Required Proficiency: Bow
Traits: None
WPR: 7
Value: 70 Gold
Rarity: Uncommon
```

---

## Light Crossbow

```text
Name: Light Crossbow
Equipment Slot: Weapon
Range Tag: Ranged
Weapon Tags: Crossbow
Damage: 1 Physical
Hands Required: 2 Hands
Required Proficiency: Crossbow
Traits: Penetrating 1
WPR: 6
Value: 60 Gold
Rarity: Uncommon
```

---

# Initial Weapon Roles

| Weapon         | Intended Role                                                  |
| -------------- | -------------------------------------------------------------- |
| Wooden Club    | Basic untrained Blunt weapon                                   |
| Utility Dagger | Basic untrained Blade and Dagger weapon                        |
| Short Sword    | Basic trained Blade weapon                                     |
| Arming Sword   | Reliable one-handed martial damage weapon                      |
| Hand Axe       | Basic trained Axe weapon                                       |
| Battleaxe      | Two-handed raw-damage Axe weapon                               |
| Warhammer      | Anti-Defense Blunt weapon                                      |
| Iron Spear     | Front-row melee weapon that can threaten the opposing Back Row |
| Shortbow       | Basic ranged weapon                                            |
| Longbow        | High-damage ranged Bow weapon                                  |
| Light Crossbow | Ranged anti-Defense weapon                                     |

---

# Future Weapon Design Notes

Do not add the following systems to the initial alpha weapon pool unless testing shows they are necessary:

* Ammunition tracking
* Reload actions
* Durability
* Random damage ranges
* Hit chance or accuracy
* Critical-hit rules
* Weapon weight limits
* Complex activated weapon abilities
* Once-per-combat weapon powers
* Elemental damage before resistance and vulnerability rules are finalized

## Future Elemental Damage Rule

When elemental weapons are introduced, resolve damage in separate packets.

Example:

```text
Damage: 1 Physical + 1 Fire
```

Rules:

```text
Physical Defense reduces Physical damage only.
Fire Resistance reduces Fire damage only.
Fire Vulnerability increases Fire damage only.
Each damage packet is resolved separately.
```

Example:

```text
Emberblade
Damage: 1 Physical + 1 Fire
```

A target with 1 Defense and no Fire Resistance would take:

```text
0 Physical damage
1 Fire damage
Total: 1 damage
```

A target with 1 Defense and Fire Resistance 1 would take:

```text
0 Physical damage
0 Fire damage
Total: 0 damage
```
