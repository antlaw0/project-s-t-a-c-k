# Starter Roster Bulk Pack v0.1

This pack bulk-converts nine approved starter-roster records into the Project S.T.A.C.K. card catalog.

## New Character Cards

- Rogue
- Cleric
- Druid

Mage and Warrior are deliberately not included because they already exist in the current catalog.

## New Tactical Reserve Cards

- Bandage
- Antidote
- Smoke Bomb
- Scroll of Force Dart
- Holy Water
- Barkskin Salve

Healing Potion is deliberately not included because it already exists in the current catalog.

## Deliberate rank decision

The Rogue starter-loadout references use the finalized Rogue rank ladder:

`Runner → Scoundrel → Infiltrator → Shadow → Phantom`

Therefore, this pack uses `skill.thief.runner` and `skill.skirmisher.runner`, rather than the older source document's `novice` references. The matching Skill and Ability Card definitions will be included in the next bulk conversion pack.

## Count policy

Character Cards have `count: 1`.

Tactical Reserve supply counts are provisional module counts intended to support the five-character starter roster and early Loot Deck testing:

| Card | Count |
|---|---:|
| Bandage | 4 |
| Antidote | 8 |
| Smoke Bomb | 4 |
| Scroll of Force Dart | 4 |
| Holy Water | 4 |
| Barkskin Salve | 4 |

## What this pack does not do

- It does not overwrite Mage, Warrior, Healing Potion, or any existing card file.
- It does not add the referenced equipment, Skill, Spell, Ability, or Summon records.
- It does not modify scenarios, deck recipes, runtime saves, or UI code.
- It does not run project commands automatically.

## After applying

Run:

```powershell
npm run validate:data
npm run build:catalog
```

Then reload `playtest.html`. Rogue, Cleric, and Druid will appear in the available Character Card choices. The new Tactical Reserve cards will appear once the relevant UI selector is refreshed.
