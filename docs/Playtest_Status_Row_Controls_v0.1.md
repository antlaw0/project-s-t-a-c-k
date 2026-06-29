# Project S.T.A.C.K. Playtest Status Row Controls v0.1

## Purpose

This browser upgrade adds explicit, keyboard-operable Status Row controls to the manual playtest table. It preserves the game’s card-based status model: all combat entities have exactly five Status Row spaces, negative statuses come from the shared Status Deck, and persistent Ability or Spell cards return to their original equipped Skill Card when their effect ends.

The interface remains manual. It records placement, removal, counter changes, and card movement but does not decide when a status should be applied or resolve its printed effect.

## Runtime state additions

A newly generated playtest state now includes:

```text
zones.statusDeck
zones.statusRevealArea
zones.statusDiscardPile
```

The runtime-state generator creates the shared Status Deck from every active card definition that has:

```text
cardType: "status"
data.statusCategory: "negative"
```

It creates the number of instances specified by each card’s canonical `count`. With the present catalog, this is the combined supply of Poisoned and Stunned cards. The order is seeded and reproducible alongside the Dungeon Deck order.

The rulebook identifies a shared Status Deck but does not name a specific discard pile for it. For digital playtest bookkeeping, resolved negative status cards are placed in `statusDiscardPile`. This is a tracking area, not a new printed component or a finalized reshuffle rule.

Older saved runtime-state JSON files remain loadable. The browser adds empty Status Deck, Status Reveal Area, and Status Discard Pile arrays in memory. Regenerate a state to populate the Status Deck with actual card instances.

## Supported manual actions

### Draw a negative status

Activate **Draw top Status Card**. The card moves from the face-down Status Deck to the face-up Status Reveal Area. Only one unresolved Status Card can be revealed at a time.

The Reveal Area exposes a separate **Place [status] on [entity]** button for every currently legal entity. Legal targets are read from the status card’s `data.canAffect` array.

The table prevents placement when:

- the target has no open Status Row space;
- the card’s target list excludes that entity type; or
- the target already has the same non-stacking status.

Stacking status cards, such as Poisoned, may occupy separate Status Row spaces as long as the Status Deck has copies and the target has space.

### Discard a resolved negative status

Each negative status in an entity’s Status Row exposes:

```text
Discard [status] from [entity] Status Row
```

Use it after manually resolving the printed trigger or when another rule removes the card. The card moves into the Status Discard Pile and the Status Row space becomes empty.

### Activate a persistent Ability status

An attached Ability Card receives a **Move [ability] to [owner] Status Row** button only when its catalog data explicitly declares:

```text
data.activation.moveTo: "ownerStatusRow"
```

For the current test set, this supports Rage. Activating this control does not spend a shared activation or decide whether a target or condition is legal. You resolve that card text manually, then use the button to record the resulting placement.

The ability retains a `statusReturn` record identifying the exact equipped Skill Card it left.

### Return a persistent Ability status

A persistent Ability Card with a recorded Skill Card source exposes:

```text
Return [ability] to its equipped Skill Card
```

Use this when the effect expires, ends, or combat ends. The card returns to the exact original Skill Card attachment slot rather than a generic hand, discard pile, or deck.

## Where Status Rows appear

- **Player-side entities:** Full Status Row controls appear in their Character Area.
- **Enemies and bosses:** Status Row controls appear directly within the Formation entity card.

Every entity’s Status Row is normalized to exactly five spaces when a state is loaded.

## Intentional boundaries

This upgrade does not:

- choose status targets automatically;
- resolve Poisoned, Stunned, or any other status trigger automatically;
- spend actions, enforce shared activations, or decide when Rage ends;
- implement the future Status Deck reshuffle rule;
- create positive statuses from Tactical Reserve cards;
- add drag-and-drop or mouse-only interactions.

Use the playtest log and downloaded runtime-state JSON to preserve a test session’s manual history.

## Enemy defeat cleanup

When the manual **Defeat and discard** control removes an enemy from Formation, any negative Status Cards in that enemy's Status Row move to the Status Discard Pile in the same state update. This prevents an attached negative status from becoming an orphaned card after its affected entity no longer exists. The playtest log names every status moved this way.
