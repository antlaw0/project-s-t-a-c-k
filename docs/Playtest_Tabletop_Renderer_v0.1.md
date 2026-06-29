# Playtest Tabletop Renderer v0.1

`playtest.html` is a read-only, text-first browser view over two data sources:

1. `generated/card-catalog.json`, which supplies card definitions and player-facing rules text.
2. A generated runtime-state JSON file, normally `playtest-saves/scenario.solo-warrior-goblin-warrens-smoke-test.initial.json`.

## Purpose

The page proves that the validated card catalog and generated runtime state can be displayed together in a browser before the project introduces state-changing controls. It does not automate game rules or change the runtime state.

## Supported runtime data

The renderer expects the runtime model produced by `scripts/create-playtest-state.js`, including:

- `entities`
- `cardInstances`
- `zones.playerFormation`
- `zones.enemyFormation`
- `zones.dungeonDeck`
- Shared discard and loot zones
- Character equipment, Skill Card slots, Tactical Reserve slots, and Status Rows
- `log`

## Loading states

Start the project with `npm start`, open `/playtest.html`, then either:

- Use **Load local initial state** after running `npm run create:playtest-state`, or
- Use the file chooser to select any runtime-state JSON file.

Do not open `playtest.html` directly from File Explorer. Browser security will prevent its catalog fetch from working reliably outside the local static server.

## Intentional limits for v0.1

- Read-only inspection only.
- No drag and drop.
- No card movement.
- No counter controls.
- No automated AI, targeting, damage, Heat, or status resolution.
- Face-down decks show counts but not card names.
