(function initializeDungeonRevealDestinations() {
  "use strict";

  const DEFAULT_INVENTORY_CAPACITY = 20;
  const DUNGEON_REVEAL_ZONE = "dungeonRevealArea";
  const DUNGEON_LOOT_ZONE = "dungeonLootArea";
  const ENEMY_CARD_TYPES = new Set(["enemy", "boss"]);
  let enhancementScheduled = false;

  function getApi() {
    return window.ProjectStackPlaytestApi || null;
  } // end getApi function

  function getRuntimeState() {
    const api = getApi();
    return api && typeof api.getRuntimeState === "function" ? api.getRuntimeState() : null;
  } // end getRuntimeState function

  function getCardInstance(cardInstanceId) {
    const api = getApi();
    return api && typeof api.getCardInstance === "function" ? api.getCardInstance(cardInstanceId) : null;
  } // end getCardInstance function

  function getDefinitionForInstance(cardInstanceId) {
    const api = getApi();
    return api && typeof api.getDefinitionForInstance === "function" ? api.getDefinitionForInstance(cardInstanceId) : null;
  } // end getDefinitionForInstance function

  function getEntity(entityId) {
    const api = getApi();
    return api && typeof api.getEntity === "function" ? api.getEntity(entityId) : null;
  } // end getEntity function

  function sanitizeIdPart(value) {
    const api = getApi();
    if (api && typeof api.sanitizeIdPart === "function") {
      return api.sanitizeIdPart(value);
    } // end API-sanitizer branch

    return String(value || "item")
      .trim()
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "item";
  } // end sanitizeIdPart function

  function formatCardLabel(cardInstanceId) {
    const api = getApi();
    if (api && typeof api.formatCardLabel === "function") {
      return api.formatCardLabel(cardInstanceId);
    } // end API-label branch

    return String(cardInstanceId || "Unknown card");
  } // end formatCardLabel function

  function getPlayerCharacters() {
    const runtimeState = getRuntimeState();
    if (!runtimeState || !runtimeState.entities) {
      return [];
    } // end missing-runtime-state branch

    return Object.values(runtimeState.entities).filter(function filterPlayerCharacters(entity) {
      return entity && entity.entityType === "playerCharacter";
    }); // end player-character filter
  } // end getPlayerCharacters function

  function getInventoryCapacity(entity) {
    return Number.isInteger(entity && entity.inventoryCapacity) && entity.inventoryCapacity >= 0
      ? entity.inventoryCapacity
      : DEFAULT_INVENTORY_CAPACITY;
  } // end getInventoryCapacity function

  function normalizeInventory(entity) {
    const runtimeState = getRuntimeState();
    if (!entity || !runtimeState || !runtimeState.cardInstances) {
      return;
    } // end unavailable-inventory-state branch

    entity.inventoryCapacity = getInventoryCapacity(entity);
    const sourceSlots = Array.isArray(entity.inventorySlots) ? entity.inventorySlots.slice() : [];
    const knownCardIds = new Set();
    entity.inventorySlots = sourceSlots.map(function normalizeInventorySlot(cardInstanceId) {
      const instance = typeof cardInstanceId === "string" ? runtimeState.cardInstances[cardInstanceId] : null;
      if (!instance || knownCardIds.has(cardInstanceId)) {
        return null;
      } // end invalid-or-duplicate-inventory-slot branch

      knownCardIds.add(cardInstanceId);
      return cardInstanceId;
    }); // end inventory-slot normalization map

    Object.values(runtimeState.cardInstances).forEach(function recoverInventoryCard(instance) {
      if (!instance || instance.ownerEntityId !== entity.id || instance.zone !== "inventory" || knownCardIds.has(instance.id)) {
        return;
      } // end non-inventory-card branch

      entity.inventorySlots.push(instance.id);
      knownCardIds.add(instance.id);
    }); // end inventory-recovery loop
  } // end normalizeInventory function

  function getInventoryCardCount(entity) {
    normalizeInventory(entity);
    return entity && Array.isArray(entity.inventorySlots)
      ? entity.inventorySlots.filter(function countInventoryCard(cardInstanceId) {
        return typeof cardInstanceId === "string";
      }).length
      : 0;
  } // end getInventoryCardCount function

  function addCardToInventory(entity, cardInstanceId) {
    const api = getApi();
    const instance = getCardInstance(cardInstanceId);
    if (!api || !entity || !instance || typeof api.updateCardInstanceZone !== "function") {
      throw new Error("The selected card could not be placed in inventory because the tabletop state is unavailable.");
    } // end unavailable-inventory-update branch

    normalizeInventory(entity);
    let slotIndex = entity.inventorySlots.findIndex(function findFirstOpenCapacitySlot(slotValue, index) {
      return slotValue === null && index < entity.inventoryCapacity;
    }); // end first-open-capacity-slot lookup

    if (slotIndex === -1) {
      slotIndex = entity.inventorySlots.findIndex(function findFirstOpenStoredSlot(slotValue) {
        return slotValue === null;
      }); // end first-open-stored-slot lookup
    } // end capacity-slot-unavailable branch

    if (slotIndex === -1) {
      slotIndex = entity.inventorySlots.length;
      entity.inventorySlots.push(null);
    } // end inventory-growth branch

    entity.inventorySlots[slotIndex] = cardInstanceId;
    instance.ownerEntityId = entity.id;
    api.updateCardInstanceZone(cardInstanceId, "inventory", `${entity.id}:slot${slotIndex + 1}`, true);
    return slotIndex;
  } // end addCardToInventory function

  function removeCardFromDungeonReveal(cardInstanceId) {
    const runtimeState = getRuntimeState();
    if (!runtimeState || !runtimeState.zones || !Array.isArray(runtimeState.zones[DUNGEON_REVEAL_ZONE])) {
      throw new Error("The Dungeon Reveal Area is unavailable in this runtime state.");
    } // end missing-dungeon-reveal-zone branch

    const revealIndex = runtimeState.zones[DUNGEON_REVEAL_ZONE].indexOf(cardInstanceId);
    if (revealIndex === -1) {
      throw new Error("That card is no longer in the Dungeon Reveal Area.");
    } // end missing-revealed-card branch

    runtimeState.zones[DUNGEON_REVEAL_ZONE].splice(revealIndex, 1);
  } // end removeCardFromDungeonReveal function

  function isLootOrInventoryDestinationAllowed(cardInstanceId) {
    const definition = getDefinitionForInstance(cardInstanceId);
    const cardType = String(definition && definition.cardType ? definition.cardType : "").toLowerCase();
    return Boolean(definition) && !ENEMY_CARD_TYPES.has(cardType);
  } // end isLootOrInventoryDestinationAllowed function

  function moveRevealedCardToDungeonLootStash(cardInstanceId, focusControlId) {
    const api = getApi();
    const runtimeState = getRuntimeState();
    const instance = getCardInstance(cardInstanceId);
    const definition = getDefinitionForInstance(cardInstanceId);

    if (!api || !runtimeState || !instance || !definition || instance.zone !== DUNGEON_REVEAL_ZONE) {
      if (api && typeof api.setManualControlStatus === "function") {
        api.setManualControlStatus("Only a currently revealed Dungeon Card can be moved to the dungeon loot stash.", "error");
      } // end API-status branch
      return;
    } // end invalid-dungeon-loot-move branch

    if (!isLootOrInventoryDestinationAllowed(cardInstanceId)) {
      api.setManualControlStatus("Enemy and boss cards must be deployed or returned to the Dungeon Deck, not moved to the dungeon loot stash.", "error");
      return;
    } // end non-lootable-combat-card branch

    try {
      removeCardFromDungeonReveal(cardInstanceId);
      runtimeState.zones[DUNGEON_LOOT_ZONE] = Array.isArray(runtimeState.zones[DUNGEON_LOOT_ZONE])
        ? runtimeState.zones[DUNGEON_LOOT_ZONE]
        : [];
      runtimeState.zones[DUNGEON_LOOT_ZONE].push(cardInstanceId);
      instance.ownerEntityId = null;
      api.updateCardInstanceZone(cardInstanceId, DUNGEON_LOOT_ZONE, "currentDungeonLootStash", true);
      const message = `${definition.name} was added to the current Dungeon Loot Stash.`;
      api.appendLog("revealedDungeonCardMovedToLootStash", message);
      api.rerenderAfterStateChange(message, "success", focusControlId);
    } catch (error) {
      api.setManualControlStatus(error.message, "error");
    } // end dungeon-loot-stash move try-catch
  } // end moveRevealedCardToDungeonLootStash function

  function moveRevealedCardToPlayerInventory(cardInstanceId, destinationEntityId, focusControlId) {
    const api = getApi();
    const instance = getCardInstance(cardInstanceId);
    const definition = getDefinitionForInstance(cardInstanceId);
    const destinationEntity = getEntity(destinationEntityId);

    if (!api || !instance || !definition || !destinationEntity || destinationEntity.entityType !== "playerCharacter" || instance.zone !== DUNGEON_REVEAL_ZONE) {
      if (api && typeof api.setManualControlStatus === "function") {
        api.setManualControlStatus("Choose a current Player Character and a card that is still in the Dungeon Reveal Area.", "error");
      } // end API-status branch
      return;
    } // end invalid-player-inventory-move branch

    if (!isLootOrInventoryDestinationAllowed(cardInstanceId)) {
      api.setManualControlStatus("Enemy and boss cards must be deployed or returned to the Dungeon Deck, not added to a player inventory.", "error");
      return;
    } // end non-inventory-combat-card branch

    try {
      removeCardFromDungeonReveal(cardInstanceId);
      const inventorySlotIndex = addCardToInventory(destinationEntity, cardInstanceId);
      const message = `${definition.name} was added directly to ${destinationEntity.name}'s inventory position ${inventorySlotIndex + 1} from the Dungeon Reveal Area.`;
      api.appendLog("revealedDungeonCardAddedToPlayerInventory", message);
      api.rerenderAfterStateChange(message, "success", focusControlId);
    } catch (error) {
      api.setManualControlStatus(error.message, "error");
    } // end player-inventory move try-catch
  } // end moveRevealedCardToPlayerInventory function

  function closeDialog(dialog) {
    if (!dialog) {
      return;
    } // end missing-dialog branch

    if (typeof dialog.close === "function" && dialog.open) {
      dialog.close();
    } else {
      dialog.remove();
    } // end dialog-close-or-remove branch
  } // end closeDialog function

  function showDialog(dialog, initialFocusTarget) {
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    } // end dialog-display branch

    window.requestAnimationFrame(function focusDestinationChoiceHeading() {
      if (initialFocusTarget && typeof initialFocusTarget.focus === "function") {
        initialFocusTarget.focus();
      } // end focusable-heading branch
    }); // end focus scheduling callback
  } // end showDialog function

  function openPlayerInventoryChoiceDialog(cardInstanceId, invokingControl) {
    const api = getApi();
    const instance = getCardInstance(cardInstanceId);
    const definition = getDefinitionForInstance(cardInstanceId);
    const playerCharacters = getPlayerCharacters();

    if (!api || !instance || !definition || instance.zone !== DUNGEON_REVEAL_ZONE) {
      return;
    } // end unavailable-direct-inventory-dialog branch

    if (playerCharacters.length === 0) {
      api.setManualControlStatus("Add a Player Character before moving a revealed card directly to inventory.", "error");
      return;
    } // end no-player-character branch

    const titleId = `dungeon-reveal-inventory-destination-title-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const dialog = document.createElement("dialog");
    dialog.className = "stack-inventory-choice-dialog";
    dialog.setAttribute("aria-labelledby", titleId);

    const heading = document.createElement("h2");
    heading.id = titleId;
    heading.tabIndex = -1;
    heading.textContent = `Add ${definition.name} to a Player Character inventory`;

    const description = document.createElement("p");
    description.textContent = "Choose the player character that receives this card. This direct move bypasses the dungeon loot stash at the players' discretion.";

    const list = document.createElement("ul");
    list.className = "inventory-choice-list";

    playerCharacters.forEach(function addPlayerCharacterChoice(entity) {
      const item = document.createElement("li");
      const heading = document.createElement("h3");
      heading.textContent = entity.name;
      const currentCount = getInventoryCardCount(entity);
      const capacity = getInventoryCapacity(entity);
      const description = document.createElement("p");
      description.textContent = `Current inventory: ${currentCount} / ${capacity} cards. Capacity is informational and does not block this move.`;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = `Add ${definition.name} to ${entity.name}'s inventory`;
      button.addEventListener("click", function handlePlayerInventoryChoice() {
        closeDialog(dialog);
        moveRevealedCardToPlayerInventory(cardInstanceId, entity.id, invokingControl ? invokingControl.id : null);
      }); // end player-inventory-choice listener
      item.append(heading, description, button);
      list.append(item);
    }); // end player-character-choice loop

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.textContent = "Cancel";
    cancelButton.addEventListener("click", function handleCancelChoice() {
      closeDialog(dialog);
      if (invokingControl && typeof invokingControl.focus === "function") {
        invokingControl.focus();
      } // end invoking-control focus branch
    }); // end cancel-choice listener

    dialog.append(heading, description, list, cancelButton);
    dialog.addEventListener("cancel", function handleChoiceDialogCancel(event) {
      event.preventDefault();
      closeDialog(dialog);
      if (invokingControl && typeof invokingControl.focus === "function") {
        invokingControl.focus();
      } // end invoking-control focus branch
    }); // end choice-dialog cancel listener
    dialog.addEventListener("close", function removeClosedChoiceDialog() {
      dialog.remove();
    }); // end choice-dialog cleanup listener

    document.body.append(dialog);
    showDialog(dialog, heading);
  } // end openPlayerInventoryChoiceDialog function

  function getDungeonRevealPanel() {
    return Array.from(document.querySelectorAll("#zone-summary .zone-card")).find(function findDungeonRevealPanel(panel) {
      const heading = panel.querySelector(":scope > h4");
      return heading && heading.textContent.trim() === "Dungeon Reveal Area";
    }) || null;
  } // end getDungeonRevealPanel function

  function renameDungeonLootHeading() {
    Array.from(document.querySelectorAll("#zone-summary .zone-card")).forEach(function renameDungeonLootPanel(panel) {
      const heading = panel.querySelector(":scope > h4");
      if (heading && heading.textContent.trim() === "Dungeon Loot Area") {
        heading.textContent = "Current Dungeon Loot Stash";
      } // end dungeon-loot-heading branch
    }); // end dungeon-loot-panel loop
  } // end renameDungeonLootHeading function

  function getCardInstanceIdFromListItem(listItem) {
    const metadata = listItem.querySelector(":scope > .card-meta");
    const match = metadata ? metadata.textContent.match(/^Instance:\s*(.+)$/) : null;
    return match ? match[1].trim() : null;
  } // end getCardInstanceIdFromListItem function

  function createDestinationButton(label, id, handler) {
    const button = document.createElement("button");
    button.type = "button";
    button.id = id;
    button.textContent = label;
    button.addEventListener("click", handler);
    return button;
  } // end createDestinationButton function

  function appendDestinationActions(listItem, cardInstanceId) {
    if (listItem.querySelector("[data-stack-dungeon-reveal-destinations='true']")) {
      return;
    } // end existing-destination-actions branch

    const instance = getCardInstance(cardInstanceId);
    const definition = getDefinitionForInstance(cardInstanceId);
    if (!instance || !definition || instance.zone !== DUNGEON_REVEAL_ZONE || !isLootOrInventoryDestinationAllowed(cardInstanceId)) {
      return;
    } // end ineligible-reveal-card branch

    const actions = document.createElement("div");
    actions.className = "zone-action-row";
    actions.dataset.stackDungeonRevealDestinations = "true";

    const safeCardId = sanitizeIdPart(cardInstanceId);
    const lootButtonId = `dungeon-reveal-${safeCardId}-to-loot-stash`;
    const inventoryButtonId = `dungeon-reveal-${safeCardId}-to-player-inventory`;

    actions.append(
      createDestinationButton(`Add ${definition.name} to Current Dungeon Loot Stash`, lootButtonId, function handleDungeonLootStashMove() {
        moveRevealedCardToDungeonLootStash(cardInstanceId, lootButtonId);
      }), // end dungeon-loot-stash destination button
      createDestinationButton(`Add ${definition.name} to a Player Character inventory`, inventoryButtonId, function handleDirectPlayerInventoryMove() {
        openPlayerInventoryChoiceDialog(cardInstanceId, document.getElementById(inventoryButtonId));
      }) // end player-inventory destination button
    ); // end destination-action append

    listItem.append(actions);
  } // end appendDestinationActions function

  function enhanceDungeonRevealArea() {
    renameDungeonLootHeading();
    const revealPanel = getDungeonRevealPanel();
    if (!revealPanel) {
      return;
    } // end missing-dungeon-reveal-panel branch

    revealPanel.querySelectorAll("li").forEach(function enhanceRevealedCardItem(listItem) {
      const cardInstanceId = getCardInstanceIdFromListItem(listItem);
      if (cardInstanceId) {
        appendDestinationActions(listItem, cardInstanceId);
      } // end revealed-card-id branch
    }); // end revealed-card-item loop
  } // end enhanceDungeonRevealArea function

  function scheduleEnhancement() {
    if (enhancementScheduled) {
      return;
    } // end existing-enhancement-schedule branch

    enhancementScheduled = true;
    window.requestAnimationFrame(function runScheduledEnhancement() {
      enhancementScheduled = false;
      enhanceDungeonRevealArea();
    }); // end scheduled-enhancement callback
  } // end scheduleEnhancement function

  const zoneSummary = document.getElementById("zone-summary");
  if (zoneSummary && typeof MutationObserver === "function") {
    const observer = new MutationObserver(function handleZoneSummaryMutation() {
      scheduleEnhancement();
    }); // end zone-summary mutation callback
    observer.observe(zoneSummary, { childList: true, subtree: true });
  } // end zone-summary observer branch

  scheduleEnhancement();
}()); // end initializeDungeonRevealDestinations IIFE
