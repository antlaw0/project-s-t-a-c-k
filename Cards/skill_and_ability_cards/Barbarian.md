Your notes catch the exact places where the first pass drifted away from your actual system. I have rebuilt it around these corrected foundations:

* **No global ability cap.** The five equipped skill cards are the specialization limit. A character who equips all five Barbarian rank cards is a full Barbarian specialist, with access to every ability slot on those cards.
* **Barbarian attacks should scale from the equipped weapon.** A five-damage weapon should matter at Champion just as much as it mattered at Recruit.
* **Heat is not repeated on every damage card.** Normal successful attacks already create Heat under the core rules. A card only says “gain Heat” when it deliberately creates additional Heat or creates Heat without attacking.
* **Sundered must be a defined shared negative status card.** `Provoked` is removed entirely because Heat already does that job more cleanly.
* **Poison is a stackable Poison status, not Poisoned / Heavy Poison / Deadly Poison tiers.**
* **Rage is an action to begin, stays active while fed with violence, and ends when the Barbarian goes a later shared activation without personally dealing damage.** 

## Core Rule Added: Weapon Attacks

Use this rule across the Warrior discipline:

> **Weapon Attack:** A weapon attack uses the acting character’s equipped weapon’s printed damage. Add or subtract any modifier written on the ability card before applying the target’s Defense. A weapon attack is a physical attack unless the card says otherwise.

Examples:

* A Barbarian with a **3-damage axe** uses `Massive Strike +2` for **5 damage before Defense**.
* A Barbarian with a **5-damage hammer** uses that same ability for **7 damage before Defense**.
* `Cleave -1` with a 5-damage weapon deals **4 damage before Defense** to each chosen target.

This makes better weapons remain meaningful rather than being quietly replaced by a card’s printed damage number.

---
[Issue:  need to differientate between melee and ranged weapons. cards need to specify a melee weapon for melee abilities that use the equipped weapon otherwise it can use a longbow equipped for example which doesn't make sense. This needs to be a rule going forward because there also will be ability cards such as 'power shot' that say +1 damage only if a ranged weapon equipped. Also, weapon categories, "smashing blow- +1 damage to melee attacks with a blunt melee weapon equppd. another example, 'power bolt:  +1 damage to ranged weapon attacks if using a crossbow' this would not apply if the equipped weapon is a shortbow has weapon type tag shortbow but would apply if the weapon was range and has type tag 'crossbow'. This important going forward, please remember]
# Warrior Discipline: Barbarian, Revised Package

## Barbarian Skill-Card Structure

A character has **five skill-card slots**. A full Barbarian specialist may equip all five cards below:

| Rank        |          Skill Card | Ability Slots | May Equip                                |
| ----------- | ------------------: | ------------: | ---------------------------------------- |
| Recruit     |      Feral Instinct |             2 | Recruit Barbarian abilities              |
| Footsoldier |     Reaver Training |             2 | Footsoldier or lower Barbarian abilities |
| Veteran     |  Crushing Technique |             3 | Veteran or lower Barbarian abilities     |
| Elite       | Ironhide Discipline |             3 | Elite or lower Barbarian abilities       |
| Champion    |        Worldbreaker |             3 | Champion or lower Barbarian abilities    |

That gives a fully specialized Barbarian **13 ability slots**. That is workable because the character still has only one shared activation per turn. The player has more tactical options, not thirteen actions. The skill cards also physically organize the abilities by rank, which helps rather than hurts at the table.

---

# Barbarian Skill Cards

## Recruit: Feral Instinct

**Ability Slots:** 2
**May Equip:** Recruit Barbarian abilities

### Passive: Rising Fury

The first time this character deals 1 or more HP damage to an enemy during each of their shared activations, gain 1 additional Heat.

This is an actual Heat increase, not a pretend targeting modifier. A successful Barbarian attack normally creates its standard Heat; this passive makes the Barbarian rise faster in the enemy priority order.

---

## Footsoldier: Reaver Training

**Ability Slots:** 2
**May Equip:** Footsoldier or lower Barbarian abilities

### Passive: Battle Hunger

While this character has Heat equal to or greater than every other friendly entity, their melee weapon attacks deal +1 damage.

This rewards the Barbarian for actually holding enemy attention instead of creating an artificial targeting rule.
[i like it]
---

## Veteran: Crushing Technique

**Ability Slots:** 3
**May Equip:** Veteran or lower Barbarian abilities

### Passive: Armor Breaker

Melee weapon attacks made through a Barbarian ability that has a positive damage modifier, such as `+1 damage` or `+2 damage`, ignore 1 Defense.

This means a standard weapon attack does not gain the benefit, but a deliberate Barbarian power strike does.

---

## Elite: Ironhide Discipline

**Ability Slots:** 3
**May Equip:** Elite or lower Barbarian abilities

### Passive: Refuse to Yield

While this character has current HP equal to or lower than half of their maximum HP, they gain +1 Defense.

This stacks naturally with armor, but remains inside the game’s Defense ceiling.

---

## Champion: Worldbreaker

**Ability Slots:** 3
**May Equip:** Champion or lower Barbarian abilities

### Passive: Apex Fury

While this character has an active Rage status, melee weapon attacks made through Barbarian abilities deal +1 damage.

Rage already improves all melee weapon attacks. This skill card turns ability-based attacks into the Barbarian’s real thunderclap moments.

---

# Recruit Barbarian Ability Cards

## Rage

**Rank:** Recruit
**Type:** Action, Status, Rage

Use this character’s shared activation. Move this card from its equipped skill card into this character’s status row.

While Rage is active:

* This character’s melee weapon attacks deal +1 damage.
* This character has -1 Defense.
* This character cannot cast spells.
* This character may still use non-spell abilities, reactions, items, and normal weapon attacks.

At the end of each later shared activation belonging to this character, check whether this character personally dealt 1 or more HP damage to an enemy during that activation.

* If they did, Rage remains active.
* If they did not, return Rage to its equipped skill card.
* If the shared activation was entirely lost because this character was Stunned, do not check Rage. Rage remains active.

At the end of combat, return Rage to its equipped skill card.

### Why this version works

Rage is not a permanent, free damage switch. It costs an action to begin, requires the Barbarian to keep personally attacking, and can fall off when the player spends a turn repositioning, defending, using a non-damaging action, or allowing a Controlled Ally to use the shared activation instead.

However, self-Stun from Massive Strike or Earthshaker does **not** extinguish Rage. Otherwise those cards would secretly carry both a Stun cost and a forced Rage reset, which is too much punishment for one heavy action.

---

## Blood Purge

**Rank:** Recruit
**Type:** Reaction, Status
**Timing:** When a Poison status card would be placed in your status row

When a Poison status card would be placed in your status row:

1. Return that Poison status card to the shared status deck instead.
2. Return every Poison status card already in your status row to the shared status deck.
3. Move Blood Purge into your status row.

While Blood Purge is active, Poison status cards cannot be placed in your status row.

At the start of your next shared activation, return Blood Purge to its equipped skill card.

This is a short, sharp poison purge rather than full-combat immunity. It is strong against a poison-heavy encounter, but it does not let a Recruit Barbarian ignore poison forever.

---

## Reckless Strike

**Rank:** Recruit
**Type:** Action, Melee, Physical

Make a melee weapon attack with +2 damage.

After the attack resolves, gain 1 additional Heat.

This extra Heat is intentional. If the attack deals HP damage, the character gains their normal Heat from attacking and then gains the additional Heat from Reckless Strike. It is a Recruit-level way to say, “Hit me next.”

---

# Footsoldier Barbarian Ability Cards

## Cleave

**Rank:** Footsoldier
**Type:** Action, Melee, Physical

Choose up to two legal enemies in the opposing Front Row.

Make a melee weapon attack against each chosen enemy with -1 damage, to a minimum of 1 damage.

Apply Defense separately to each attack.

A single sweep can strike two enemies, but each hit is less forceful than a focused attack.

---

## Rending Blow

**Rank:** Footsoldier
**Type:** Action, Melee, Physical

Make a melee weapon attack with +1 damage against one legal melee target.

If this attack deals 1 or more HP damage after Defense, place one **Sundered** status card from the shared status deck in that target’s status row.

---

## Defiant Roar

**Rank:** Footsoldier
**Type:** Action, Control

Gain 2 Heat.

This does not need a special `Provoked` card. It is the Barbarian making themselves the obvious problem in the room, using the existing Heat system rather than bolting a second aggro engine onto the side.

---

# Veteran Barbarian Ability Cards

## Massive Strike

**Rank:** Veteran
**Type:** Action, Melee, Physical

Make a melee weapon attack with +2 damage against one legal melee target.

If the attack deals 2 or more HP damage after Defense, place one Stunned status card from the shared status deck in the target’s status row.

After resolving the attack, place one Stunned status card from the shared status deck in this character’s status row.

The self-Stun happens whether or not the target was successfully Stunned.

This is a true trade: a weapon-scaled crushing blow with possible enemy Stun, in exchange for losing your next shared activation.

---

## Whirlwind

**Rank:** Veteran
**Type:** Action, Melee, Physical

Make a melee weapon attack against every legal enemy in the opposing Front Row with -2 damage, to a minimum of 1 damage.

Apply Defense separately to each attack.

Whirlwind becomes excellent with a strong weapon, but the -2 modifier keeps it from simply being “Massive Strike against everybody.”

---

## Bloodied Fury

**Rank:** Veteran
**Type:** Reaction, Status
**Timing:** When damage reduces this character to half of their maximum HP or lower

Move Bloodied Fury into this character’s status row.

While Bloodied Fury is active and this character remains at or below half of their maximum HP, their melee weapon attacks deal +1 damage.

If this character rises above half of their maximum HP, immediately return Bloodied Fury to its equipped skill card.

At the end of combat, return Bloodied Fury to its equipped skill card.

This is a conditional battle state, not a free button. Damage wakes it up; healing can calm it down.
[i like this]
---

# Elite Barbarian Ability Cards

## Frenzied Assault

**Rank:** Elite
**Type:** Action, Melee, Physical
**Requirement:** This character must have an active Rage status.

Make a melee weapon attack with +1 damage against one legal melee target.

If that attack defeats the target, you may immediately make one melee weapon attack against a different legal enemy with -1 damage, to a minimum of 1 damage.

The second attack is part of the same shared activation. It does not grant another activation.

---

## Bonebreaker

**Rank:** Elite
**Type:** Action, Melee, Physical
**Requirement:** The target must have a Sundered status card.

Make a melee weapon attack with +2 damage against one legal melee target with Sundered.

If the attack deals 1 or more HP damage after Defense:

1. Return one Sundered status card from that target to the shared status deck.
2. Place one Stunned status card from the shared status deck in that target’s status row.

Bonebreaker turns an exposed armor gap into a concussion. It is a two-card combo, but both halves remain independently useful.

---

## Warpath

**Rank:** Elite
**Type:** Action, Status

Use this character’s shared activation. Move Warpath into this character’s status row.

While Warpath is active, the first time during each of this character’s shared activations that they defeat an enemy with a melee weapon attack, restore 1 HP to this character.

At the end of combat, return Warpath to its equipped skill card.

This lets an Elite Barbarian sustain momentum through a pack of enemies, but does not allow one large Whirlwind to restore several HP at once.

---

# Champion Barbarian Ability Cards

## Executioner’s Blow

**Rank:** Champion
**Type:** Action, Melee, Physical
**Requirement:** The target must have current HP equal to or lower than half of its maximum HP.

Make a melee weapon attack with +3 damage against one legal melee target.

Executioner’s Blow does not need an extra status effect. Its purpose is to turn a wounded boss, elite enemy, or armored monster into a very brief problem.

---

## Earthshaker

**Rank:** Champion
**Type:** Action, Melee, Physical

Make a melee weapon attack against every legal enemy in the opposing Front Row with -1 damage, to a minimum of 1 damage.

Apply Defense separately to each attack.

After resolving all attacks, place one Stunned status card from the shared status deck in this character’s status row.

Earthshaker is intentionally stronger than Whirlwind. It is Champion-tier, it uses the weapon’s full weight more effectively, and it puts the Barbarian in the penalty box afterward.

---

## Unstoppable

**Rank:** Champion
**Type:** Reaction, Status, Rage
**Timing:** When an enemy effect would place Stunned in this character’s status row
**Requirement:** This character must have an active Rage status.

Prevent that Stunned status from being placed. Return it to the shared status deck, then move Unstoppable into this character’s status row.

While Unstoppable is active, enemy effects cannot place Stunned status cards in this character’s status row.

Unstoppable does not prevent Stunned caused by this character’s own abilities, including Massive Strike or Earthshaker.

When Rage ends, return Unstoppable to its equipped skill card.

This preserves the Barbarian’s deliberate self-Stun costs while making enemy attempts to shut down a raging Champion much less reliable.

---

# Shared Negative Status Card Added by Barbarian

## Sundered

**Type:** Negative Status
**Target:** Enemy

While Sundered is active, the target has -1 Defense.

A target cannot have more than one Sundered status card.

If an effect would apply Sundered to a target that already has Sundered, do not place another card.

At the end of combat, return Sundered to the shared status deck.

### Source of the card

Sundered is not created by the Barbarian player out of nowhere. It is a normal negative status card added to the **shared status deck**, alongside Poison, Stunned, and the other universal negative effects.

`Rending Blow` draws and places it. `Bonebreaker` consumes it. Other future disciplines, enemies, traps, or boss abilities could also apply it.

---

## What I removed

### Provoked

I would remove this entirely.

It duplicates Heat while adding a special exception to enemy AI, an extra shared status card, a timing rule, and a question about whether it overrides boss targeting. Defiant Roar gaining actual Heat does the same job with far less rules debris.

### Flat damage attacks

The old `Deal 4 physical damage` formulation is gone from Barbarian weapon attacks. A Barbarian with a five-damage weapon should not somehow perform a “Massive Strike” for only four damage. The weapon is part of the fantasy and the progression system.

---

## Barbarian Combat Loop

A full Barbarian now has a distinct, coherent loop:

1. **Spend an action to enter Rage.**
2. **Personally keep dealing damage** to maintain Rage.
3. Build high Heat through successful attacks, Rising Fury, Reckless Strike, and Defiant Roar.
4. Use **Rending Blow** to create Sundered.
5. Turn Sundered into a Stun with **Bonebreaker**.
6. Choose between focused execution damage, multi-target pressure, self-Stun power moves, and kill-based recovery.
7. Accept that using a Controlled Ally instead of the Barbarian can cause Rage to fall off, because the Barbarian did not personally feed it with damage.

That last part is valuable. A Barbarian with Controlled Allies can still own them, but Rage makes the choice between “my Barbarian fights” and “my minion fights” genuinely consequential instead of decorative.
