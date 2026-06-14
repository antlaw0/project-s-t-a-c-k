# AI_CONTEXT.md

# Project S.T.A.C.K. Digital Prototype

## Purpose

This application is a digital sandbox used to prototype and manually test the Project S.T.A.C.K. tabletop game.

The application is NOT responsible for enforcing game rules.

The user manually applies all game rules and outcomes.

The application's purpose is to:

* Display game state
* Track game state
* Edit game state
* Move game pieces
* Move cards
* Manage decks
* Save and load sessions

The application should behave like a digital tabletop rather than a video game.

---

# Technology Requirements

* HTML
* CSS
* JavaScript
* JSON storage

No backend server is required for Version 1.

No frameworks are required.

Do not use React, Vue, Angular, TypeScript, build systems, or external dependencies unless specifically requested.

The prototype should run by opening index.html in a browser.

---

# Visual Style

## General Theme

* Black background
* White text
* White borders
* High contrast
* Accessibility first

## Grid

* Black squares
* Thick white grid lines
* Coordinates visible
* Keyboard accessible

## Cards

* Black background
* White border
* White text
* Placeholder image area represented by a solid color rectangle
* Optional image upload support

---

# Accessibility Requirements

The application must be fully keyboard accessible.

All functionality available through drag and drop must also be available through keyboard controls.

The application must work with screen readers.

Avoid interactions that require a mouse.

Use semantic HTML whenever possible.

Use proper labels for all form fields.

---

# Core Design Principles

1. No game rule enforcement.
2. Everything must be editable.
3. Everything must be movable.
4. Everything must be saveable.
5. Everything must be restorable.
6. User is the game master.
7. Application only tracks state.

---

# Coordinate System

Grid coordinates begin at:

0,0

Top-left corner.

Increasing X moves right.

Increasing Y moves down.

Example:

0,0
1,0
2,0

0,1
1,1
2,1

---

# Grid Requirements

Default size:

20 x 20

Grid size must be editable.

Users can:

* Increase width
* Decrease width
* Increase height
* Decrease height

When increasing width:

New columns are added to the right.

When increasing height:

New rows are added to the bottom.

Existing tile coordinates must never change.

---

# Tile Model

A tile represents a location on the map.

Each tile contains:

* id
* x
* y
* name
* type
* color
* metadata

Example:

{
"id": "tile_001",
"x": 5,
"y": 3,
"name": "Goblin Cave",
"type": "Dungeon",
"color": "#AA0000",
"metadata": {}
}

---

# Tile Occupancy

Multiple entities may occupy the same tile.

A tile stores:

occupants[]

Example:

{
"occupants": [
"player_1",
"player_2",
"enemy_5"
]
}

Do not assume a tile only contains one entity.

---

# Entity Model

An entity is anything that can exist on the board.

Examples:

* Player
* NPC
* Enemy
* Merchant
* Quest marker

Fields:

* id
* name
* tileX
* tileY

Example:

{
"id": "player_1",
"name": "Warrior",
"tileX": 4,
"tileY": 2
}

---

# Card Architecture

IMPORTANT:

Card Templates and Card Instances are separate objects.

---

# Card Template

Templates never change.

They are master definitions.

Fields:

* id
* name
* cardType
* image
* data

Example:

{
"id": "enemy_goblin_scout",
"name": "Goblin Scout",
"cardType": "Enemy"
}

---

# Card Instance

Instances are runtime copies.

Instances can be modified.

Fields:

* instanceId
* templateId
* flipped
* currentData

Example:

{
"instanceId": "card_001",
"templateId": "enemy_goblin_scout",
"flipped": true
}

Damage, aggression, counters, and other runtime changes belong on instances, not templates.

---

# Supported Card Types

* Character
* Enemy
* Ability
* Item
* Trait
* Passive
* Loot
* Encounter
* Other

System must allow future card types.

---

# Character Card Requirements

Character cards contain:

* Name
* Archetype/Class
* HP
* Aggression
* Currency
* Image
* Trait Slot 1
* Trait Slot 2
* Trait Slot 3
* Trait Slot 4

All values editable.

---

# Enemy Card Requirements

Enemy cards contain:

* Name
* HP
* Image
* Slot 1
* Slot 2
* Slot 3
* Slot 4

All values editable.

---

# Deck Architecture

Templates and instances are separate.

---

# Deck Template

Master deck definition.

Contains:

* id
* name
* cards

Example:

{
"id": "deck_goblin_cave",
"name": "Goblin Cave",
"cards": []
}

---

# Deck Instance

Runtime deck.

Contains:

* id
* templateId
* cardsInOrder

Deck order matters.

Do not automatically shuffle.

---

# Deck Behavior

Deck view shows:

* Card count
* Top card back

Only the top card is visible.

Example:

Cards: 23

[Card Back]

---

# Deck Actions

Supported actions:

* Draw
* Shuffle
* Inspect
* Save Deck
* Load Deck

Inspect must allow:

* View all cards
* Reorder cards
* Add cards
* Remove cards
* Edit cards

---

# Encounter Screen

Rows are configurable.

Default:

4 slots per row

Layout:

Enemy Back Row

Enemy Front Row

Player Front Row

Player Back Row

Cards can be moved between slots.

Cards can be moved between rows.

No combat rules are enforced.

---

# Player Area

One tab per player.

Each player contains:

* Character Card
* Permanent Cards
* Hand
* Deck
* Discard Pile

All cards movable.

---

# Database Editor

Spreadsheet-style editing.

No modal editors required.

Editable tables:

* Card Templates
* Tile Templates
* Deck Templates
* Encounter Templates

Users should be able to add, edit, duplicate, and delete records.

---

# Save System

Must support:

* Save Game
* Load Game
* Export Save
* Import Save

Save file format:

JSON

---

# Saved Game Contents

A save contains:

* Grid
* Tiles
* Entities
* Players
* Card Instances
* Deck Instances
* Encounter State

Everything required to fully restore the session.

---

# Undo Support

Strongly recommended.

Support:

CTRL+Z

CTRL+Y

For all state-changing operations.

---

# Search

Global search should be available.

Users should be able to quickly locate:

* Cards
* Decks
* Tiles
* Entities

---

# Version 1 Goal

Create a functional digital tabletop for Project S.T.A.C.K.

Focus on usability, editing, movement, saving, and state management.

Do not implement gameplay logic.

Do not enforce rules.

The user controls the game.

The application tracks the game.
