# Project S.T.A.C.K. Advanced Manual Tabletop Controls v0.1

## Purpose

This layer turns `playtest.html` into a general manual game-state editor. It does not automate card rules, combat, targeting, enemy AI, status timing, or legality beyond a small number of structural safeguards. The playtester remains responsible for resolving printed rules.

## Dungeon Deck order

The runtime array uses these physical-deck semantics:

- The top card is the final array entry.
- The bottom card is the first array entry.
- Draw top uses the final array entry.
- Draw bottom uses the first array entry.
- Returning a Dungeon Card to the Dungeon Deck always places it on the bottom.
- The order of the Dungeon Deck and Dungeon Discard Pile changes only when the player explicitly activates the matching Shuffle control.

A revealed Enemy Card exposes a deployment button for its printed preferred row. If that row is full, the interface reports that it is full and keeps a `Return [Enemy] to bottom of Dungeon Deck` control available. The playtester may also deliberately deploy the enemy in the other Enemy Row when the rules or test case call for it.

## Dungeon Discard Pile

The Dungeon Discard Pile has explicit top draw, bottom draw, and shuffle controls. A drawn discard card enters the same Dungeon Reveal Area used by normal Dungeon Deck draws. It must be manually resolved, deployed, discarded, or returned before another Dungeon Card can be drawn.

## Tactical Reserve

A Tactical Reserve card is not sent to a Dungeon Discard Pile after use. The `Resolve use` control removes it from the owner's Tactical Reserve slot and shuffles it into the Loot Deck, which matches the locked Tactical Reserve rule.

## Participants and friendly entities

The entity-management controls can create runtime entities without changing the underlying scenario JSON:

- A player character can be attached to a new participant such as Player 1 or Player 2, or an existing participant.
- A player character can receive a custom display name.
- An active Hireling Card creates an Autonomous Ally.
- An active Summon or Controlled Ally card creates a Controlled Ally and requires an owning player character.
- All friendly entities receive a visible Formation card, Damage controls, Heat controls, five Status Row slots, row movement buttons, full card details, and a friendly entity panel.

The available selections are derived strictly from active entries in `generated/card-catalog.json`. A selector being empty does not indicate an interface error. It means the catalog does not yet contain an active matching card definition. For example, controlled summons cannot be added until at least one active summon or controlled-ally card exists in the card catalog.

Physical copy counts are enforced when a new runtime card instance is created. A second copy cannot be created after all instances of a card definition's `count` are already in use. Returning an assigned card to Available Supply allows that same instance to be reused later.

## Player-character setup controls

A player character may receive active catalog Equipment, Skill Cards, attached Ability Cards, and Tactical Reserve cards through the `Add cards to a player character` panel. The control creates or reuses a real runtime card instance and honors the card definition's copy count.

- Equipment uses a named slot, such as `weapon` or `armor`.
- Skill and Tactical Reserve use numbered slots.
- Ability Cards attach to a numbered Skill slot and respect the Skill Card's slot capacity and declared discipline when those data fields exist.

## Controls outside this layer

This version intentionally does not perform rules automation. For example, it does not decide targets, calculate damage, apply a Tripwire, run Goblin Alarm's reveal logic, choose a Hireling priority action, or determine whether Rage ends. Use the generated controls to make the resulting manual state changes, then rely on the Playtest Log and exported JSON to review the session.
