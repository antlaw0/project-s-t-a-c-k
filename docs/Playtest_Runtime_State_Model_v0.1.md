# Project S.T.A.C.K. Runtime Playtest State Model v0.1

## Purpose

This runtime model converts a validated Scenario Definition into one concrete virtual tabletop state. It does not alter card definitions, deck recipes, or scenario recipes.

- **Card definition:** a permanent printable design record, such as `enemy.goblin-raider`.
- **Deck definition:** a recipe that says which card definitions make up a deck.
- **Scenario definition:** a recipe that says which characters, equipped cards, attached cards, Tactical Reserve cards, and deck recipe begin a test.
- **Runtime state:** a single playtest session containing individually identified card copies, zones, entity counters, rows, and an action log.

## Identity model

Runtime card instances use deterministic IDs such as:

```text
instance.enemy.goblin-raider.001
instance.enemy.goblin-raider.002
```

The definition ID is permanent design data. The instance ID exists only for the current playtest state.

## Current generated zones

- Player Front Row and Player Back Row
- Enemy Front Row and Enemy Back Row
- Dungeon Deck
- Dungeon Discard Pile
- Dungeon Loot Area
- Loot Deck
- Loot Discard Pile
- Expended Summons
- Character equipment slots
- Character Skill Card slots and attached Ability Cards
- Character Tactical Reserve slots
- Character Status Rows

## Manual-first behavior

The generator creates the initial table. It does not automate AI, attacks, targeting, damage, Heat, status resolution, or legal-move enforcement. Those remain manual playtest actions until the interface provides optional guardrails.

## Deterministic setup

Pass a seed so the same scenario produces the same initial Dungeon Deck order:

```powershell
npm run create:playtest-state -- --scenario "scenario.solo-warrior-goblin-warrens-smoke-test" --seed "20260629"
```

The generated save goes to `playtest-saves/` by default. Those saves are intentionally ignored by Git because they are temporary playtest records, not source data.

## Safety checks

The generator refuses to instantiate a scenario when it encounters:

- a missing or inactive card definition;
- a missing or inactive deck definition;
- a non-dungeon deck used as a dungeon deck;
- a card requirement greater than the definition's active `count`;
- an invalid character row;
- a duplicate Skill Card or Tactical Reserve slot;
- an overfilled Player Front or Player Back Row.

## Next implementation boundary

The next UI work should load one generated runtime-state file and render its player formation, enemy formation, Dungeon Deck count, Dungeon Discard Pile, and character-owned cards. Do not replace the runtime model with DOM state.
