# Project S.T.A.C.K. Browser Catalog Bundle v0.1

## Purpose

`generated/card-catalog.json` is a deterministic browser-readable bundle built from the canonical JSON files under:

- `data/cards/`
- `data/decks/`
- `data/scenarios/`

The canonical files remain the only editable source of truth. The generated bundle exists so the static browser UI can load card, deck, and scenario metadata without needing to scan directories at runtime.

## Build command

```powershell
npm run build:catalog
```

This writes:

```text
generated/card-catalog.json
```

## Test command

```powershell
npm run test:catalog-build
```

The test rebuilds the bundle and verifies:

- catalog version is correct;
- all catalog maps contain records keyed by their own `id`;
- at least one card, deck, and scenario exist;
- active-ID lists exactly match definitions with `"active": true`.

## Browser contract

The first browser tabletop renderer should load:

```text
generated/card-catalog.json
```

then use each runtime card instance's `definitionId` to find its printable card definition. It must treat the runtime-state JSON as the source of card location, owner, face-up state, counters, rows, and log entries.

Do not place mutable playtest state in the DOM. The DOM is a view of runtime state.
