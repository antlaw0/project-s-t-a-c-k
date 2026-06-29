# Project S.T.A.C.K. Manual Playtest Controls v0.1

## Purpose

This browser layer makes the runtime playtest state manually interactive without becoming a rules engine. It is intended for solo rapid prototyping and playtest setup.

The page keeps card rules manual. It changes only explicit state that the tester chooses to change: counters, party Currency, card movement between the Dungeon Deck, the Dungeon Reveal Area, Enemy Formation, and the Dungeon Discard Pile.

## Supported manual actions

### Entity counters

Every entity placed in Formation exposes Damage controls:

- Decrease Damage
- Increase Damage
- Set Damage to an exact non-negative whole number

Friendly entities, including Player Characters, Controlled Allies, and Autonomous Allies, also expose Heat controls. Enemy entities do not expose Heat controls.

Damage is stored as **damage taken**, not remaining HP. The interface announces both damage and the entity's maximum HP.

### Party Currency

Party Currency is a shared runtime-state resource stored at:

```text
resources.currency
```

The control panel provides decrease, increase, and exact-value controls. Currency may not be set below zero.

### Drawing Dungeon Cards

`Draw top Dungeon Card` removes the final item from `zones.dungeonDeck`, reveals it face up, and places it in:

```text
zones.dungeonRevealArea
```

Only one unresolved card may be in the Dungeon Reveal Area at a time. This deliberate lock keeps manual resolution clear and prevents accidentally drawing past a trap or event.

### Resolving drawn cards

The page does not interpret a card's rules text.

- **Enemy Card:** Use `Deploy <name> to Enemy Front Row` or `Deploy <name> to Enemy Back Row`. This creates a runtime enemy entity using the card definition's `data.stats.hp` and `data.stats.defense` values. Once an enemy is in formation, use `Defeat and discard <name>` after its defeat.
- **Trap, Event, or other non-enemy Dungeon Card:** Apply any card text manually using the available counter controls and your own rules judgment. Then use `Discard resolved <name> to Dungeon Discard Pile`.

A drawn enemy cannot be discarded directly from the reveal area. It must first be deployed, keeping enemy formation and defeat tracking visible.

### Exporting a session

`Download current state JSON` saves all runtime changes, including counters, card movement, created enemy entities, party Currency, and the playtest log. Load that file later with the runtime-state file chooser at the top of the page.

Generated state downloads are playtest-session records, not canonical catalog data. Do not replace the scenario or card definition source files with them.

## Runtime additions

Older generated state files are upgraded in memory when loaded. The UI adds these missing structures when needed:

```text
resources.currency
zones.dungeonRevealArea
```

This migration exists only in the browser's current session until the tester downloads the updated state.

## Intentional boundaries

This layer does not:

- resolve card rules, targeting, attacks, damage, Heat, or statuses automatically;
- select enemy AI actions;
- enforce legal row targeting;
- attach, remove, or replace Status Cards;
- save state onto the server;
- use drag-and-drop or mouse-only controls.

Those remain later, separately testable improvements.
