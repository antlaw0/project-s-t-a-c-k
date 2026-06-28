# Project S.T.A.C.K. — Mercenary Hirelings
## Initial Shop Hireling Set v0.1

> These cards use the current Autonomous Ally rules: every hired mercenary receives one independent activation each Encounter Round, follows its printed priority list, can gain Heat, can receive status effects, occupies a Player Row slot, and is discarded when defeated unless its own card says otherwise.

---

# 1. Recommended Market Rules for Mercenary Hirelings

## 1.1 Tags and Availability

Every card in this set has these tags:

- `Hireling`
- `Mercenary`
- `Autonomous Ally`
- `Market Only`

A **Market Only** card may appear in a settlement market only when that settlement meets the card's printed minimum size. It is never added to a Dungeon Deck during dungeon-loot setup.

When a dungeon is seeded with Loot Cards and a `Market Only` card would be selected:

1. Return that card to the bottom of the Loot Deck.
2. Draw a replacement Loot Card.
3. Repeat until the dungeon has the required number of eligible Loot Cards.

This keeps mercenaries purchasable at shops rather than appearing as implausible loot inside a dungeon.

## 1.2 Hiring and Dismissal

A character may hire a Mercenary only at a settlement where it is displayed in the market and meets the card's minimum settlement size.

When purchased:

1. Pay the card's printed Currency Price.
2. Assign the Mercenary to the purchasing character's group.
3. Place it in that character's persistent Hireling or Companion space.
4. It does not count against Inventory capacity.

A character cannot purchase a Mercenary while that character already has a persistent Hireling or Companion, unless a card specifically raises that limit.

A Mercenary enters a dungeon with its owner and occupies an empty Player Row slot. It leaves the dungeon with its owner.

A character may dismiss a Mercenary only at a settlement. Put the dismissed card into the Loot Discard Pile. When the Loot Deck is reshuffled, that card represents another available mercenary of the same game profile.

## 1.3 Defeat and Medical Care

Each card in this set overrides the default Autonomous Ally discard destination:

- When the Mercenary is defeated, put its card into the Loot Discard Pile.

A settlement service that restores HP to player characters may also restore HP to a hired Mercenary under the same cost and difficulty rules. A Mercenary cannot be revived after defeat unless another card explicitly says otherwise.

---

# 2. Hireling Power Budget and Price Curve

A persistent Autonomous Ally is intrinsically powerful because it receives an independent activation every Encounter Round. These prices deliberately make a hireling a meaningful investment, not a cheap extra character.

## 2.1 Power Budget

Start each Hireling at **3 Power** for being an Autonomous Ally with a basic body and one normal action. Add Power for the following features:

| Feature | Power Added |
| --- | ---: |
| 5–6 HP | +1 |
| 7–8 HP | +2 |
| 9–10 HP | +3 |
| Each point of Defense | +1 |
| Each reliable point of damage above 1 | +1 |
| Ranged delivery or attacking from either Player Row | +1 |
| Meaningful targeting, Heat, control, or positioning utility | +1 each |
| Restore 1 HP every Encounter Round | +3 |
| Row-wide damage effect | +2 or more |

## 2.2 Currency Price

```text
Currency Price = 2 + (2 × Power Budget)
```

| Power Budget | Recommended Price | Intended Role |
| ---: | ---: | --- |
| 6 | 14 Currency | Basic dependable combatant |
| 7 | 16 Currency | Specialist or strong support |
| 8 | 18 Currency | High-impact specialist |
| 9 | 20 Currency | Durable tank or premium specialist |

This is a first-pass economy curve. It should be validated after several full dungeon-and-settlement playtests, especially because a permanent independent activation is much more valuable in a small party than in a full party.

---

# 3. Mercenary Hireling Cards

## Roadside Sellsword

```text
Roadside Sellsword
Hireling — Mercenary — Autonomous Ally — Market Only
Minimum Settlement: Village
Power Budget: 6
Currency Price: 14
Preferred Row: Player Front Row

HP: 6
Defense: 1

Priority:
1. Sword Cut
   If this ally is in the Player Front Row, deal 2 Physical damage
   to the enemy in the opposing Front Row with the highest printed Attack.
   Gain 1 Heat.

2. Advance
   If this ally is in the Player Back Row and an empty Player Front Row
   slot exists, move to the leftmost empty Player Front Row slot.

Defeat: Put this card into the Loot Discard Pile.
```

**Role:** The baseline paid sword. It adds steady front-row damage, takes up space, and creates enough Heat to become a plausible target. It has no clever tricks, which is exactly why it is the lowest-cost option.

---

## Veteran Pikewoman

```text
Veteran Pikewoman
Hireling — Mercenary — Autonomous Ally — Market Only
Minimum Settlement: Village
Power Budget: 7
Currency Price: 16
Preferred Row: Player Back Row

HP: 6
Defense: 1

Priority:
1. Pike Thrust
   Deal 2 Physical damage to the enemy in the opposing Front Row
   with the highest printed Attack.
   This ally may use Pike Thrust from either Player Row.
   Keyword: Piercing.
   Gain 1 Heat.

Defeat: Put this card into the Loot Discard Pile.
```

**Role:** A protected anti-frontline attacker. Her reach allows the party to preserve a Front Row slot for a tougher ally while she still contributes from the Back Row.

---

## Crossbow Sharpshooter

```text
Crossbow Sharpshooter
Hireling — Mercenary — Autonomous Ally — Market Only
Minimum Settlement: Town
Power Budget: 8
Currency Price: 18
Preferred Row: Player Back Row

HP: 5
Defense: 0

Priority:
1. Killing Bolt
   If an enemy in either opposing row has 2 or fewer current HP,
   deal 3 Physical damage to the enemy with the lowest current HP.
   Break ties by choosing the enemy with the highest printed Attack.
   Keyword: Piercing.
   Gain 1 Heat.

2. Crossbow Bolt
   Deal 2 Physical damage to the enemy in either opposing row
   with the highest printed Attack.
   Keyword: Piercing.
   Gain 1 Heat.

Defeat: Put this card into the Loot Discard Pile.
```

**Role:** A deliberate finisher. The Sharpshooter is fragile, but she can remove damaged enemies before their next activation instead of wasting damage across the formation.

---

## Shieldbearer of the Free Companies

```text
Shieldbearer of the Free Companies
Hireling — Mercenary — Autonomous Ally — Market Only
Minimum Settlement: Town
Power Budget: 9
Currency Price: 20
Preferred Row: Player Front Row

HP: 8
Defense: 2

Priority:
1. Challenge
   If at least one legal Friendly Entity has more Heat than this ally,
   gain 2 Heat.

2. Shield Strike
   If this ally is in the Player Front Row, deal 2 Physical damage
   to the enemy in the opposing Front Row with the highest printed Attack.
   Keyword: Blunt.
   Gain 1 Heat.

3. Advance
   If this ally is in the Player Back Row and an empty Player Front Row
   slot exists, move to the leftmost empty Player Front Row slot.

Defeat: Put this card into the Loot Discard Pile.
```

**Role:** The durable Heat magnet. It cannot force a target directly, but it repeatedly works toward becoming the legal highest-Heat target while also occupying the row where melee attacks must land.

---

## Field Chirurgeon

```text
Field Chirurgeon
Hireling — Mercenary — Autonomous Ally — Market Only
Minimum Settlement: Town
Power Budget: 7
Currency Price: 16
Preferred Row: Player Back Row

HP: 5
Defense: 0

Priority:
1. Treat Wounds
   If at least one Friendly Entity has 1 or more missing HP,
   restore 1 HP to the Friendly Entity with the greatest missing HP.
   Break ties by choosing the Friendly Entity with the lowest current HP.
   Gain 1 Heat.

Defeat: Put this card into the Loot Discard Pile.
```

**Role:** Slow, reliable sustain. This card is intentionally limited to restoring 1 HP, cannot revive a Downed entity, and cannot remove status cards. It supports a party over several rounds without replacing a Cleric, Druid, potion, or dedicated recovery build.

---

## Fire Flask Grenadier

```text
Fire Flask Grenadier
Hireling — Mercenary — Autonomous Ally — Market Only
Minimum Settlement: City
Power Budget: 8
Currency Price: 18
Preferred Row: Player Back Row

HP: 4
Defense: 0

Priority:
1. Fire Flask
   If either opposing row contains 2 or more enemies,
   deal 1 Fire damage to every enemy in the opposing row containing
   the most enemies. Break ties by choosing the Enemy Front Row.
   Gain 2 Heat.

2. Dagger Toss
   Deal 1 Physical damage to the enemy in either opposing row
   with the highest printed Attack.
   Keyword: Piercing.
   Gain 1 Heat.

Defeat: Put this card into the Loot Discard Pile.
```

**Role:** A crowd-control damage specialist. The Fire Flask is modest against a single enemy but becomes highly efficient against a packed row, which justifies both the City requirement and the elevated Heat it produces.

---

# 4. Initial Set Balance Notes

- **Do not give a starting party a free persistent mercenary.** Even the Roadside Sellsword adds an independent activation every Encounter Round, a major advantage before equipment and Skills have had time to develop.
- **One persistent Hireling or Companion per player group remains essential.** This prevents every player from converting Currency into a full second party.
- **The Field Chirurgeon is the first card to stress-test.** Repeated healing often looks modest on paper and grows teeth over a long dungeon. If it proves too efficient, raise its price to 18 Currency before reducing its healing below 1.
- **The Fire Flask Grenadier is the second card to stress-test.** A dense enemy row can make 1 damage to every enemy outperform much more expensive single-target attacks. If that happens, increase its price to 20 Currency or require 3 enemies in the row for Fire Flask.
- **Hirelings should remain weaker and less flexible than player characters.** Their advantage is reliability and an extra independent activation. Their weakness is predictable AI, restricted actions, limited survivability, permanent loss on defeat, and no access to player equipment or Skill builds.
