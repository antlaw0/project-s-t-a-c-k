(function initializePlayerInventoryModal() {
  "use strict";

  const DEFAULT_INVENTORY_CAPACITY = 20;
  const INVENTORY_COLUMNS = 5;
  const INVENTORY_ROWS_PER_TABLE = 10;
  const INVENTORY_TABLE_SLOT_COUNT = INVENTORY_COLUMNS * INVENTORY_ROWS_PER_TABLE;
  const DEFAULT_EQUIPMENT_SLOTS = [
    { key: "head", label: "Head" },
    { key: "neck", label: "Neck" },
    { key: "body", label: "Body" },
    { key: "hands", label: "Hands" },
    { key: "feet", label: "Feet" },
    { key: "leftHand", label: "Left Hand" },
    { key: "rightHand", label: "Right Hand" },
    { key: "weapon", label: "Weapon" },
    { key: "offHand", label: "Off-Hand" },
    { key: "ring1", label: "Ring 1" },
    { key: "ring2", label: "Ring 2" }
  ]; // end default-equipment-slots array

  const inventoryUiState = {
    activeInventoryDialog: null,
    selectedMovement: null,
    invokingControl: null
  }; // end inventory-ui-state object

  function getApi() {
    return window.ProjectStackPlaytestApi || null;
  } // end getApi function

  function getRuntimeState() {
    const api = getApi();
    return api ? api.getRuntimeState() : null;
  } // end getRuntimeState function

  function sanitizeIdPart(value) {
    const api = getApi();
    if (api && typeof api.sanitizeIdPart === "function") {
      return api.sanitizeIdPart(value);
    } // end API-sanitizer branch

    return String(value || "item").trim().replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "item";
  } // end sanitizeIdPart function

  function getEntity(entityId) {
    const api = getApi();
    return api && typeof api.getEntity === "function" ? api.getEntity(entityId) : null;
  } // end getEntity function

  function getCardInstance(cardInstanceId) {
    const api = getApi();
    return api && typeof api.getCardInstance === "function" ? api.getCardInstance(cardInstanceId) : null;
  } // end getCardInstance function

  function getDefinitionForInstance(cardInstanceId) {
    const api = getApi();
    return api && typeof api.getDefinitionForInstance === "function" ? api.getDefinitionForInstance(cardInstanceId) : null;
  } // end getDefinitionForInstance function

  function formatCardLabel(cardInstanceId) {
    const api = getApi();
    if (api && typeof api.formatCardLabel === "function") {
      return api.formatCardLabel(cardInstanceId);
    } // end API-card-label branch

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

  function getPositiveIntegerOrDefault(value, fallbackValue) {
    return Number.isInteger(value) && value >= 0 ? value : fallbackValue;
  } // end getPositiveIntegerOrDefault function

  function normalizeInventory(entity) {
    const runtimeState = getRuntimeState();
    if (!entity || !runtimeState || !runtimeState.cardInstances) {
      return;
    } // end unavailable-inventory-state branch

    entity.inventoryCapacity = getPositiveIntegerOrDefault(entity.inventoryCapacity, DEFAULT_INVENTORY_CAPACITY);

    const slots = Array.isArray(entity.inventorySlots) ? entity.inventorySlots.slice() : [];
    const knownCardIds = new Set();
    entity.inventorySlots = slots.map(function normalizeInventorySlot(cardInstanceId) {
      const instance = typeof cardInstanceId === "string" ? runtimeState.cardInstances[cardInstanceId] : null;
      if (!instance || knownCardIds.has(cardInstanceId)) {
        return null;
      } // end invalid-or-duplicate-slot branch

      knownCardIds.add(cardInstanceId);
      return cardInstanceId;
    }); // end inventory-slot normalization map

    Object.values(runtimeState.cardInstances).forEach(function recoverStoredInventoryCard(instance) {
      if (!instance || instance.ownerEntityId !== entity.id || instance.zone !== "inventory" || knownCardIds.has(instance.id)) {
        return;
      } // end non-inventory-instance branch

      entity.inventorySlots.push(instance.id);
      knownCardIds.add(instance.id);
    }); // end stored-inventory recovery loop
  } // end normalizeInventory function

  function getInventoryCardCount(entity) {
    normalizeInventory(entity);
    return entity && Array.isArray(entity.inventorySlots)
      ? entity.inventorySlots.filter(function countOccupiedInventorySlot(cardInstanceId) {
          return typeof cardInstanceId === "string";
        }).length
      : 0;
  } // end getInventoryCardCount function

  function getInventorySlotCountToRender(entity) {
    normalizeInventory(entity);
    const occupiedOrStoredSlots = entity.inventorySlots.length;
    const configuredCapacity = entity.inventoryCapacity;
    const minimumVisibleSlots = Math.max(INVENTORY_TABLE_SLOT_COUNT, occupiedOrStoredSlots, configuredCapacity);
    return Math.max(INVENTORY_TABLE_SLOT_COUNT, Math.ceil(minimumVisibleSlots / INVENTORY_TABLE_SLOT_COUNT) * INVENTORY_TABLE_SLOT_COUNT);
  } // end getInventorySlotCountToRender function

  function updateCardZone(cardInstanceId, zone, zoneDetail) {
    const api = getApi();
    const instance = getCardInstance(cardInstanceId);
    if (!api || !instance || typeof api.updateCardInstanceZone !== "function") {
      throw new Error("The selected card could not be updated because the playtest API is unavailable.");
    } // end unavailable-card-update branch

    api.updateCardInstanceZone(cardInstanceId, zone, zoneDetail, true);
  } // end updateCardZone function

  function updateCardAsInventoryCard(entity, cardInstanceId, slotIndex) {
    const instance = getCardInstance(cardInstanceId);
    if (!instance) {
      return;
    } // end missing-card-instance branch

    instance.ownerEntityId = entity.id;
    updateCardZone(cardInstanceId, "inventory", `${entity.id}:slot${slotIndex + 1}`);
  } // end updateCardAsInventoryCard function

  function addCardToInventory(entity, cardInstanceId) {
    normalizeInventory(entity);

    let slotIndex = entity.inventorySlots.findIndex(function findFirstOpenUsableSlot(slotValue, index) {
      return slotValue === null && index < entity.inventoryCapacity;
    }); // end first-open-usable-slot search

    if (slotIndex === -1) {
      slotIndex = entity.inventorySlots.findIndex(function findFirstOpenStoredSlot(slotValue) {
        return slotValue === null;
      }); // end first-open-stored-slot search
    } // end usable-slot-exhausted branch

    if (slotIndex === -1) {
      slotIndex = entity.inventorySlots.length;
      entity.inventorySlots.push(null);
    } // end inventory-expansion branch

    entity.inventorySlots[slotIndex] = cardInstanceId;
    updateCardAsInventoryCard(entity, cardInstanceId, slotIndex);
    return slotIndex;
  } // end addCardToInventory function

  function getInventoryCardAt(entity, slotIndex) {
    normalizeInventory(entity);
    return entity.inventorySlots[slotIndex] || null;
  } // end getInventoryCardAt function

  function takeCardFromInventory(entity, slotIndex) {
    normalizeInventory(entity);
    const cardInstanceId = getInventoryCardAt(entity, slotIndex);
    if (!cardInstanceId) {
      throw new Error("That inventory position is empty.");
    } // end empty-inventory-position branch

    entity.inventorySlots[slotIndex] = null;
    return cardInstanceId;
  } // end takeCardFromInventory function

  function cardTypeFor(cardInstanceId) {
    const definition = getDefinitionForInstance(cardInstanceId);
    return String(definition && definition.cardType ? definition.cardType : "").toLowerCase();
  } // end cardTypeFor function

  function isEquipmentCard(cardInstanceId) {
    const definition = getDefinitionForInstance(cardInstanceId);
    return cardTypeFor(cardInstanceId) === "equipment" || Boolean(definition && definition.data && definition.data.equipmentType);
  } // end isEquipmentCard function

  function isSkillCard(cardInstanceId) {
    return cardTypeFor(cardInstanceId) === "skill";
  } // end isSkillCard function

  function isAbilityOrSpellCard(cardInstanceId) {
    const definition = getDefinitionForInstance(cardInstanceId);
    const cardType = cardTypeFor(cardInstanceId);
    const tags = Array.isArray(definition && definition.tags) ? definition.tags : [];
    return cardType === "ability" || cardType === "spell" || tags.includes("ability") || tags.includes("spell");
  } // end isAbilityOrSpellCard function

  function isTacticalReserveCard(cardInstanceId) {
    return cardTypeFor(cardInstanceId) === "tacticalreserve";
  } // end isTacticalReserveCard function

  function normalizeSkillSlots(entity) {
    const existingSlots = Array.isArray(entity.skillSlots) ? entity.skillSlots.slice(0, 5) : [];
    while (existingSlots.length < 5) {
      existingSlots.push(null);
    } // end skill-slot padding loop

    entity.skillSlots = existingSlots.map(function normalizeSkillSlot(skillSlot) {
      if (!skillSlot || typeof skillSlot !== "object" || typeof skillSlot.skillCardInstanceId !== "string") {
        return null;
      } // end invalid-skill-slot branch

      skillSlot.attachedAbilityInstanceIds = Array.isArray(skillSlot.attachedAbilityInstanceIds)
        ? skillSlot.attachedAbilityInstanceIds.filter(function filterAbilityIds(cardInstanceId) {
            return typeof cardInstanceId === "string";
          })
        : [];
      return skillSlot;
    }); // end skill-slot normalization map
  } // end normalizeSkillSlots function

  function normalizeTacticalReserveSlots(entity) {
    const existingSlots = Array.isArray(entity.tacticalReserveSlots) ? entity.tacticalReserveSlots.slice(0, 5) : [];
    while (existingSlots.length < 5) {
      existingSlots.push(null);
    } // end tactical-reserve-slot padding loop

    entity.tacticalReserveSlots = existingSlots.map(function normalizeTacticalReserveSlot(cardInstanceId) {
      return typeof cardInstanceId === "string" ? cardInstanceId : null;
    }); // end tactical-reserve-slot normalization map
  } // end normalizeTacticalReserveSlots function

  function createButton(label, className, handler) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    if (className) {
      button.className = className;
    } // end button-class branch

    button.addEventListener("click", handler);
    return button;
  } // end createButton function

  function focusElementSoon(element) {
    window.requestAnimationFrame(function focusAfterRender() {
      if (element && typeof element.focus === "function") {
        element.focus();
      } // end focusable-element branch
    }); // end focus-after-render callback
  } // end focusElementSoon function

  function closeDialog(dialog, suppressFocusReturn) {
    if (!dialog) {
      return;
    } // end missing-dialog branch

    if (suppressFocusReturn) {
      dialog.dataset.suppressFocusReturn = "true";
    } // end focus-suppression branch

    if (typeof dialog.close === "function" && dialog.open) {
      dialog.close();
    } else {
      dialog.remove();
    } // end dialog-close branch
  } // end closeDialog function

  function createBaseDialog(className, labelledById) {
    const dialog = document.createElement("dialog");
    dialog.className = className;
    dialog.setAttribute("aria-labelledby", labelledById);
    document.body.append(dialog);
    return dialog;
  } // end createBaseDialog function

  function showDialog(dialog, initialFocusTarget) {
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    } // end dialog-display branch

    focusElementSoon(initialFocusTarget);
  } // end showDialog function

  function formatRulesText(cardInstanceId) {
    const definition = getDefinitionForInstance(cardInstanceId);
    const rulesText = definition && definition.rulesText ? definition.rulesText : "No player-facing rules text is recorded.";
    return rulesText;
  } // end formatRulesText function

  function getEquipmentSlotChoices(entity, cardInstanceId) {
    const definition = getDefinitionForInstance(cardInstanceId);
    const configuredSlot = definition && definition.data ? definition.data.equipmentSlot : null;
    const entries = DEFAULT_EQUIPMENT_SLOTS.slice();
    const knownKeys = new Set(entries.map(function mapDefaultEquipmentSlot(slot) {
      return slot.key;
    })); // end default-equipment-slot-key map

    [configuredSlot].concat(Object.keys(entity.equipment || {})).forEach(function addRuntimeEquipmentSlot(slotKey) {
      if (!slotKey || knownKeys.has(slotKey)) {
        return;
      } // end duplicate-or-empty-equipment-slot branch

      knownKeys.add(slotKey);
      entries.push({ key: slotKey, label: String(slotKey) });
    }); // end runtime-equipment-slot loop

    return entries;
  } // end getEquipmentSlotChoices function

  function getEquipmentSlotDescription(entity, slotKey) {
    const equippedCardId = entity.equipment && entity.equipment[slotKey] ? entity.equipment[slotKey] : null;
    if (!equippedCardId) {
      return "Empty.";
    } // end empty-equipment-slot branch

    return `${formatCardLabel(equippedCardId)}. ${formatRulesText(equippedCardId)}`;
  } // end getEquipmentSlotDescription function

  function rerenderAndReopenInventory(entityId, message) {
    const api = getApi();
    const entity = getEntity(entityId);
    const inventoryButtonId = entity ? `inventory-button-${sanitizeIdPart(entity.id)}` : null;
    if (!api || typeof api.rerenderAfterStateChange !== "function") {
      return;
    } // end unavailable-rerender branch

    api.rerenderAfterStateChange(message, "success", inventoryButtonId);
    window.setTimeout(function reopenInventoryAfterTableRender() {
      if (getEntity(entityId)) {
        openInventoryDialog(entityId, document.getElementById(inventoryButtonId));
      } // end still-existing-entity branch
    }, 0);
  } // end rerenderAndReopenInventory function

  function createChoiceDialog(settings) {
    const titleId = `inventory-choice-title-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const dialog = createBaseDialog("stack-inventory-choice-dialog", titleId);
    const heading = document.createElement("h2");
    heading.id = titleId;
    heading.textContent = settings.title;
    const description = document.createElement("p");
    description.textContent = settings.description;
    const list = document.createElement("ul");
    list.className = "inventory-choice-list";

    settings.choices.forEach(function renderChoice(choice) {
      const listItem = document.createElement("li");
      const choiceHeading = document.createElement("h3");
      choiceHeading.textContent = choice.label;
      const choiceDescription = document.createElement("p");
      choiceDescription.textContent = choice.description;
      const selectButton = createButton(choice.actionLabel || "Select", "", function handleChoiceSelection() {
        closeDialog(dialog, true);
        choice.onSelect();
      }); // end choice-selection handler
      listItem.append(choiceHeading, choiceDescription, selectButton);
      list.append(listItem);
    }); // end choice-render loop

    const cancelButton = createButton("Cancel", "", function handleChoiceCancel() {
      closeDialog(dialog, true);
      if (typeof settings.onCancel === "function") {
        settings.onCancel();
      } // end choice-cancel callback branch
    }); // end choice-cancel handler

    dialog.append(heading, description, list, cancelButton);
    dialog.addEventListener("cancel", function handleChoiceDialogCancel(event) {
      event.preventDefault();
      closeDialog(dialog, true);
      if (typeof settings.onCancel === "function") {
        settings.onCancel();
      } // end escape-cancel callback branch
    }); // end choice-dialog cancel listener
    dialog.addEventListener("close", function cleanUpChoiceDialog() {
      dialog.remove();
    }); // end choice-dialog cleanup listener
    showDialog(dialog, heading);
  } // end createChoiceDialog function

  function openEquipmentSlotMenu(entityId, inventorySlotIndex) {
    const entity = getEntity(entityId);
    const cardInstanceId = entity ? getInventoryCardAt(entity, inventorySlotIndex) : null;
    if (!entity || !cardInstanceId) {
      return;
    } // end unavailable-equipment-selection branch

    closeDialog(inventoryUiState.activeInventoryDialog, true);
    const cardName = formatCardLabel(cardInstanceId);
    const choices = getEquipmentSlotChoices(entity, cardInstanceId).map(function mapEquipmentSlotChoice(slot) {
      return {
        label: `${slot.label}: ${getEquipmentSlotDescription(entity, slot.key)}`,
        description: `Equip ${cardName} to the ${slot.label} slot. Existing equipment in that slot moves to this inventory position.`,
        actionLabel: `Equip to ${slot.label}`,
        onSelect: function equipToSelectedSlot() {
          const currentEquippedCardId = entity.equipment && entity.equipment[slot.key] ? entity.equipment[slot.key] : null;
          entity.equipment = entity.equipment && typeof entity.equipment === "object" ? entity.equipment : {};
          entity.equipment[slot.key] = cardInstanceId;
          updateCardZone(cardInstanceId, "equipment", `${entity.id}:${slot.key}`);
          const selectedInstance = getCardInstance(cardInstanceId);
          if (selectedInstance) {
            selectedInstance.ownerEntityId = entity.id;
          } // end selected-equipment-owner branch

          entity.inventorySlots[inventorySlotIndex] = currentEquippedCardId || null;
          if (currentEquippedCardId) {
            updateCardAsInventoryCard(entity, currentEquippedCardId, inventorySlotIndex);
          } // end equipment-swap branch

          const swapMessage = currentEquippedCardId
            ? `${cardName} replaced ${formatCardLabel(currentEquippedCardId)} in ${entity.name}'s ${slot.label} slot.`
            : `${cardName} was equipped to ${entity.name}'s ${slot.label} slot.`;
          const api = getApi();
          api.appendLog("inventoryEquipmentEquipped", swapMessage);
          inventoryUiState.selectedMovement = null;
          rerenderAndReopenInventory(entity.id, swapMessage);
        } // end equip-to-selected-slot callback
      };
    }); // end equipment-slot-choice map

    createChoiceDialog({
      title: `Equip ${cardName}`,
      description: "Choose any equipment slot. This manual tabletop does not enforce card type, handedness, or other equipment restrictions.",
      choices,
      onCancel: function returnToInventoryAfterEquipmentCancel() {
        openInventoryDialog(entityId, inventoryUiState.invokingControl);
      } // end equipment-menu cancel callback
    }); // end equipment-choice-dialog configuration
  } // end openEquipmentSlotMenu function

  function equipSkillCardToSlot(entityId, inventorySlotIndex, targetSkillIndex) {
    const entity = getEntity(entityId);
    const selectedCardId = entity ? getInventoryCardAt(entity, inventorySlotIndex) : null;
    if (!entity || !selectedCardId) {
      return;
    } // end unavailable-skill-selection branch

    normalizeSkillSlots(entity);
    const previousSlot = entity.skillSlots[targetSkillIndex];
    const previousSkillCardId = previousSlot ? previousSlot.skillCardInstanceId : null;
    const previousAbilityIds = previousSlot && Array.isArray(previousSlot.attachedAbilityInstanceIds)
      ? previousSlot.attachedAbilityInstanceIds.slice()
      : [];

    entity.skillSlots[targetSkillIndex] = {
      skillCardInstanceId: selectedCardId,
      attachedAbilityInstanceIds: []
    }; // end selected-skill-slot object
    entity.inventorySlots[inventorySlotIndex] = previousSkillCardId || null;

    const selectedInstance = getCardInstance(selectedCardId);
    if (selectedInstance) {
      selectedInstance.ownerEntityId = entity.id;
    } // end selected-skill-owner branch
    updateCardZone(selectedCardId, "skillCard", `${entity.id}:slot${targetSkillIndex + 1}`);

    if (previousSkillCardId) {
      updateCardAsInventoryCard(entity, previousSkillCardId, inventorySlotIndex);
    } // end previous-skill-return branch

    previousAbilityIds.forEach(function returnPreviousSkillAbility(abilityCardId) {
      addCardToInventory(entity, abilityCardId);
    }); // end previous-skill-ability return loop

    const previousSummary = previousSkillCardId
      ? ` ${formatCardLabel(previousSkillCardId)} and ${previousAbilityIds.length} attached ability or spell card(s) moved to inventory.`
      : "";
    const message = `${formatCardLabel(selectedCardId)} was equipped to ${entity.name}'s Skill slot ${targetSkillIndex + 1}.${previousSummary}`;
    const api = getApi();
    api.appendLog("inventorySkillEquipped", message);
    inventoryUiState.selectedMovement = null;
    rerenderAndReopenInventory(entity.id, message);
  } // end equipSkillCardToSlot function

  function openSkillSlotMenu(entityId, inventorySlotIndex) {
    const entity = getEntity(entityId);
    const selectedCardId = entity ? getInventoryCardAt(entity, inventorySlotIndex) : null;
    if (!entity || !selectedCardId) {
      return;
    } // end unavailable-skill-menu branch

    normalizeSkillSlots(entity);
    const firstOpenSlotIndex = entity.skillSlots.findIndex(function findOpenSkillSlot(slot) {
      return slot === null;
    }); // end first-open-skill-slot search

    if (firstOpenSlotIndex !== -1) {
      equipSkillCardToSlot(entityId, inventorySlotIndex, firstOpenSlotIndex);
      return;
    } // end direct-skill-equip branch

    closeDialog(inventoryUiState.activeInventoryDialog, true);
    const choices = entity.skillSlots.map(function mapOccupiedSkillSlot(skillSlot, index) {
      const attachedCards = skillSlot.attachedAbilityInstanceIds || [];
      const attachmentLabel = attachedCards.length === 0
        ? "No attached ability or spell cards."
        : `Attached cards: ${attachedCards.map(formatCardLabel).join(", ")}.`;
      return {
        label: `Skill slot ${index + 1}: ${formatCardLabel(skillSlot.skillCardInstanceId)}`,
        description: `${formatRulesText(skillSlot.skillCardInstanceId)} ${attachmentLabel}`,
        actionLabel: `Replace Skill slot ${index + 1}`,
        onSelect: function replaceOccupiedSkillSlot() {
          equipSkillCardToSlot(entityId, inventorySlotIndex, index);
        } // end occupied-skill replacement callback
      };
    }); // end occupied-skill-slot choice map

    createChoiceDialog({
      title: `Choose a Skill slot for ${formatCardLabel(selectedCardId)}`,
      description: "All five Skill slots are occupied. Select the Skill Card to return to inventory. Its attached ability and spell cards will also return to inventory.",
      choices,
      onCancel: function returnToInventoryAfterSkillCancel() {
        openInventoryDialog(entityId, inventoryUiState.invokingControl);
      } // end skill-menu cancel callback
    }); // end skill-choice-dialog configuration
  } // end openSkillSlotMenu function

  function equipAbilityToSkill(entityId, inventorySlotIndex, targetSkillIndex) {
    const entity = getEntity(entityId);
    const cardInstanceId = entity ? getInventoryCardAt(entity, inventorySlotIndex) : null;
    if (!entity || !cardInstanceId) {
      return;
    } // end unavailable-ability-selection branch

    normalizeSkillSlots(entity);
    const targetSlot = entity.skillSlots[targetSkillIndex];
    if (!targetSlot) {
      return;
    } // end unavailable-target-skill branch

    entity.inventorySlots[inventorySlotIndex] = null;
    targetSlot.attachedAbilityInstanceIds = Array.isArray(targetSlot.attachedAbilityInstanceIds)
      ? targetSlot.attachedAbilityInstanceIds
      : [];
    targetSlot.attachedAbilityInstanceIds.push(cardInstanceId);
    const instance = getCardInstance(cardInstanceId);
    if (instance) {
      instance.ownerEntityId = entity.id;
    } // end attached-card-owner branch
    updateCardZone(cardInstanceId, "skillAttachment", targetSlot.skillCardInstanceId);

    const message = `${formatCardLabel(cardInstanceId)} was attached to ${formatCardLabel(targetSlot.skillCardInstanceId)}. The tabletop does not enforce compatibility or attachment limits.`;
    const api = getApi();
    api.appendLog("inventoryAbilityAttached", message);
    inventoryUiState.selectedMovement = null;
    rerenderAndReopenInventory(entity.id, message);
  } // end equipAbilityToSkill function

  function openAbilitySkillMenu(entityId, inventorySlotIndex) {
    const entity = getEntity(entityId);
    const cardInstanceId = entity ? getInventoryCardAt(entity, inventorySlotIndex) : null;
    if (!entity || !cardInstanceId) {
      return;
    } // end unavailable-ability-menu branch

    normalizeSkillSlots(entity);
    const occupiedSkillSlots = entity.skillSlots
      .map(function mapSkillSlot(skillSlot, index) {
        return skillSlot ? { skillSlot, index } : null;
      }) // end skill-slot map
      .filter(function removeEmptySkillSlots(value) {
        return value !== null;
      }); // end empty-skill-slot filter

    if (occupiedSkillSlots.length === 0) {
      const api = getApi();
      api.setManualControlStatus(`${entity.name} has no equipped Skill Card available for ${formatCardLabel(cardInstanceId)}.`, "error");
      return;
    } // end no-equipped-skills branch

    closeDialog(inventoryUiState.activeInventoryDialog, true);
    const choices = occupiedSkillSlots.map(function mapAbilityTargetChoice(value) {
      const attachedCount = Array.isArray(value.skillSlot.attachedAbilityInstanceIds)
        ? value.skillSlot.attachedAbilityInstanceIds.length
        : 0;
      return {
        label: `Skill slot ${value.index + 1}: ${formatCardLabel(value.skillSlot.skillCardInstanceId)}`,
        description: `${formatRulesText(value.skillSlot.skillCardInstanceId)} Currently attached cards: ${attachedCount}.`,
        actionLabel: `Attach to Skill slot ${value.index + 1}`,
        onSelect: function attachAbilityToChosenSkill() {
          equipAbilityToSkill(entityId, inventorySlotIndex, value.index);
        } // end ability-attachment callback
      };
    }); // end ability-target-choice map

    createChoiceDialog({
      title: `Attach ${formatCardLabel(cardInstanceId)} to a Skill Card`,
      description: "Choose an equipped Skill Card. Compatibility and maximum attachment counts are intentionally left to the players.",
      choices,
      onCancel: function returnToInventoryAfterAbilityCancel() {
        openInventoryDialog(entityId, inventoryUiState.invokingControl);
      } // end ability-menu cancel callback
    }); // end ability-choice-dialog configuration
  } // end openAbilitySkillMenu function

  function equipTacticalReserveCardToSlot(entityId, inventorySlotIndex, targetReserveIndex) {
    const entity = getEntity(entityId);
    const selectedCardId = entity ? getInventoryCardAt(entity, inventorySlotIndex) : null;
    if (!entity || !selectedCardId) {
      return;
    } // end unavailable-tactical-reserve-selection branch

    normalizeTacticalReserveSlots(entity);
    const replacedCardId = entity.tacticalReserveSlots[targetReserveIndex];
    entity.tacticalReserveSlots[targetReserveIndex] = selectedCardId;
    entity.inventorySlots[inventorySlotIndex] = replacedCardId || null;

    const selectedInstance = getCardInstance(selectedCardId);
    if (selectedInstance) {
      selectedInstance.ownerEntityId = entity.id;
    } // end selected-tactical-reserve-owner branch
    updateCardZone(selectedCardId, "tacticalReserve", `${entity.id}:slot${targetReserveIndex + 1}`);

    if (replacedCardId) {
      updateCardAsInventoryCard(entity, replacedCardId, inventorySlotIndex);
    } // end tactical-reserve-swap branch

    const message = replacedCardId
      ? `${formatCardLabel(selectedCardId)} replaced ${formatCardLabel(replacedCardId)} in ${entity.name}'s Tactical Reserve slot ${targetReserveIndex + 1}.`
      : `${formatCardLabel(selectedCardId)} was equipped to ${entity.name}'s Tactical Reserve slot ${targetReserveIndex + 1}.`;
    const api = getApi();
    api.appendLog("inventoryTacticalReserveEquipped", message);
    inventoryUiState.selectedMovement = null;
    rerenderAndReopenInventory(entity.id, message);
  } // end equipTacticalReserveCardToSlot function

  function openTacticalReserveMenu(entityId, inventorySlotIndex) {
    const entity = getEntity(entityId);
    const selectedCardId = entity ? getInventoryCardAt(entity, inventorySlotIndex) : null;
    if (!entity || !selectedCardId) {
      return;
    } // end unavailable-tactical-reserve-menu branch

    normalizeTacticalReserveSlots(entity);
    const firstOpenSlotIndex = entity.tacticalReserveSlots.findIndex(function findOpenTacticalReserveSlot(cardId) {
      return cardId === null;
    }); // end first-open-tactical-reserve-slot search

    if (firstOpenSlotIndex !== -1) {
      equipTacticalReserveCardToSlot(entityId, inventorySlotIndex, firstOpenSlotIndex);
      return;
    } // end direct-tactical-reserve-equip branch

    closeDialog(inventoryUiState.activeInventoryDialog, true);
    const choices = entity.tacticalReserveSlots.map(function mapReserveSlotChoice(cardId, index) {
      return {
        label: `Tactical Reserve slot ${index + 1}: ${formatCardLabel(cardId)}`,
        description: formatRulesText(cardId),
        actionLabel: `Replace Tactical Reserve slot ${index + 1}`,
        onSelect: function replaceTacticalReserveSlot() {
          equipTacticalReserveCardToSlot(entityId, inventorySlotIndex, index);
        } // end tactical-reserve replacement callback
      };
    }); // end tactical-reserve-slot choice map

    createChoiceDialog({
      title: `Choose a Tactical Reserve slot for ${formatCardLabel(selectedCardId)}`,
      description: "All five Tactical Reserve slots are occupied. Select the card to return to the same inventory position.",
      choices,
      onCancel: function returnToInventoryAfterReserveCancel() {
        openInventoryDialog(entityId, inventoryUiState.invokingControl);
      } // end tactical-reserve-menu cancel callback
    }); // end tactical-reserve-choice-dialog configuration
  } // end openTacticalReserveMenu function

  function openTradeMenu(entityId, inventorySlotIndex) {
    const sourceEntity = getEntity(entityId);
    const cardInstanceId = sourceEntity ? getInventoryCardAt(sourceEntity, inventorySlotIndex) : null;
    if (!sourceEntity || !cardInstanceId) {
      return;
    } // end unavailable-trade-selection branch

    const destinationCharacters = getPlayerCharacters().filter(function removeSourceCharacter(entity) {
      return entity.id !== sourceEntity.id;
    }); // end source-character filter

    closeDialog(inventoryUiState.activeInventoryDialog, true);
    if (destinationCharacters.length === 0) {
      createChoiceDialog({
        title: `Trade ${formatCardLabel(cardInstanceId)}`,
        description: "No other player character is currently present in this virtual tabletop instance.",
        choices: [],
        onCancel: function returnToInventoryAfterUnavailableTrade() {
          openInventoryDialog(entityId, inventoryUiState.invokingControl);
        } // end unavailable-trade cancel callback
      }); // end unavailable-trade choice dialog
      return;
    } // end no-trade-destinations branch

    const choices = destinationCharacters.map(function mapTradeTarget(destinationEntity) {
      const count = getInventoryCardCount(destinationEntity);
      return {
        label: destinationEntity.name,
        description: `Current inventory capacity: ${count} / ${destinationEntity.inventoryCapacity} cards. The card transfers immediately and may place this character over capacity for the players to resolve.`,
        actionLabel: `Trade to ${destinationEntity.name}`,
        onSelect: function tradeToDestinationCharacter() {
          sourceEntity.inventorySlots[inventorySlotIndex] = null;
          const destinationSlotIndex = addCardToInventory(destinationEntity, cardInstanceId);
          const message = `${formatCardLabel(cardInstanceId)} was traded from ${sourceEntity.name}'s inventory position ${inventorySlotIndex + 1} to ${destinationEntity.name}'s inventory position ${destinationSlotIndex + 1}.`;
          const api = getApi();
          api.appendLog("inventoryCardTraded", message);
          inventoryUiState.selectedMovement = null;
          rerenderAndReopenInventory(sourceEntity.id, message);
        } // end direct-trade callback
      };
    }); // end trade-target choice map

    createChoiceDialog({
      title: `Trade ${formatCardLabel(cardInstanceId)}`,
      description: "Choose the player character that receives this card. The transfer is immediate; this tabletop does not use a shared party inventory.",
      choices,
      onCancel: function returnToInventoryAfterTradeCancel() {
        openInventoryDialog(entityId, inventoryUiState.invokingControl);
      } // end trade-menu cancel callback
    }); // end trade-choice-dialog configuration
  } // end openTradeMenu function

  function switchInventoryPositions(entityId, firstIndex, secondIndex) {
    const entity = getEntity(entityId);
    if (!entity) {
      return;
    } // end unavailable-movement-entity branch

    normalizeInventory(entity);
    const firstCardId = entity.inventorySlots[firstIndex];
    const secondCardId = entity.inventorySlots[secondIndex];
    if (!firstCardId || !secondCardId) {
      return;
    } // end unavailable-movement-card branch

    entity.inventorySlots[firstIndex] = secondCardId;
    entity.inventorySlots[secondIndex] = firstCardId;
    updateCardAsInventoryCard(entity, secondCardId, firstIndex);
    updateCardAsInventoryCard(entity, firstCardId, secondIndex);
    inventoryUiState.selectedMovement = null;

    const message = `${formatCardLabel(firstCardId)} and ${formatCardLabel(secondCardId)} switched inventory positions.`;
    const api = getApi();
    api.appendLog("inventoryPositionSwitched", message);
    rerenderAndReopenInventory(entity.id, message);
  } // end switchInventoryPositions function

  function selectInventoryCardForMovement(entityId, slotIndex) {
    const entity = getEntity(entityId);
    const cardInstanceId = entity ? getInventoryCardAt(entity, slotIndex) : null;
    if (!entity || !cardInstanceId) {
      return;
    } // end unavailable-movement-selection branch

    const selectedMovement = inventoryUiState.selectedMovement;
    if (selectedMovement && selectedMovement.entityId === entityId && selectedMovement.slotIndex !== slotIndex) {
      switchInventoryPositions(entityId, selectedMovement.slotIndex, slotIndex);
      return;
    } // end inventory-position-switch branch

    inventoryUiState.selectedMovement = { entityId, slotIndex, cardInstanceId };
    reopenInventoryForUiOnly(entityId);
  } // end selectInventoryCardForMovement function

  function reopenInventoryForUiOnly(entityId) {
    closeDialog(inventoryUiState.activeInventoryDialog, true);
    window.setTimeout(function reopenUiOnlyInventoryDialog() {
      openInventoryDialog(entityId, inventoryUiState.invokingControl);
    }, 0);
  } // end reopenInventoryForUiOnly function

  function createInventoryCardActions(entity, cardInstanceId, slotIndex) {
    const actions = document.createElement("div");
    actions.className = "inventory-card-actions";

    if (isEquipmentCard(cardInstanceId)) {
      actions.append(createButton(`Equip ${formatCardLabel(cardInstanceId)}`, "", function handleEquipmentEquip() {
        openEquipmentSlotMenu(entity.id, slotIndex);
      })); // end equipment-equip action
    } // end equipment-action branch

    if (isSkillCard(cardInstanceId)) {
      actions.append(createButton(`Equip ${formatCardLabel(cardInstanceId)} as a Skill Card`, "", function handleSkillEquip() {
        openSkillSlotMenu(entity.id, slotIndex);
      })); // end skill-equip action
    } // end skill-action branch

    if (isAbilityOrSpellCard(cardInstanceId)) {
      actions.append(createButton(`Attach ${formatCardLabel(cardInstanceId)} to an equipped Skill Card`, "", function handleAbilityAttach() {
        openAbilitySkillMenu(entity.id, slotIndex);
      })); // end ability-attach action
    } // end ability-action branch

    if (isTacticalReserveCard(cardInstanceId)) {
      actions.append(createButton(`Move ${formatCardLabel(cardInstanceId)} to Tactical Reserve`, "", function handleTacticalReserveEquip() {
        openTacticalReserveMenu(entity.id, slotIndex);
      })); // end tactical-reserve-equip action
    } // end tactical-reserve-action branch

    const selectedMovement = inventoryUiState.selectedMovement;
    const selectedCardName = selectedMovement ? formatCardLabel(selectedMovement.cardInstanceId) : null;
    const movementButtonLabel = selectedMovement && selectedMovement.entityId === entity.id && selectedMovement.slotIndex === slotIndex
      ? `Selected for movement: ${selectedCardName}`
      : selectedMovement && selectedMovement.entityId === entity.id
        ? `Switch inventory position with selected card (${selectedCardName})`
        : `Select ${formatCardLabel(cardInstanceId)} for movement`;
    const movementButton = createButton(movementButtonLabel, "", function handleInventoryMovementSelection() {
      selectInventoryCardForMovement(entity.id, slotIndex);
    }); // end inventory-movement-selection action
    if (selectedMovement && selectedMovement.entityId === entity.id && selectedMovement.slotIndex === slotIndex) {
      movementButton.disabled = true;
    } // end selected-movement-button disable branch
    actions.append(movementButton);

    const otherPlayersExist = getPlayerCharacters().some(function findOtherPlayerCharacter(candidate) {
      return candidate.id !== entity.id;
    }); // end other-player-character search
    const tradeButton = createButton(
      otherPlayersExist ? `Trade ${formatCardLabel(cardInstanceId)} with other player` : `Trade ${formatCardLabel(cardInstanceId)} with other player (unavailable)`,
      "",
      function handleInventoryTrade() {
        openTradeMenu(entity.id, slotIndex);
      }
    ); // end inventory-trade action
    tradeButton.disabled = !otherPlayersExist;
    actions.append(tradeButton);

    return actions;
  } // end createInventoryCardActions function

  function createInventorySlotCell(entity, slotIndex, rowHeaderId, columnHeaderId) {
    const tableCell = document.createElement("td");
    tableCell.setAttribute("headers", `${rowHeaderId} ${columnHeaderId}`);
    const cardInstanceId = getInventoryCardAt(entity, slotIndex);
    const withinConfiguredCapacity = slotIndex < entity.inventoryCapacity;

    if (!cardInstanceId) {
      tableCell.className = withinConfiguredCapacity ? "inventory-empty-slot" : "inventory-unavailable-slot";
      tableCell.textContent = withinConfiguredCapacity
        ? `Inventory position ${slotIndex + 1}: empty.`
        : `Inventory position ${slotIndex + 1}: outside current inventory capacity.`;
      return tableCell;
    } // end empty-inventory-slot branch

    const card = document.createElement("article");
    card.className = "inventory-card";
    const heading = document.createElement("h3");
    heading.textContent = formatCardLabel(cardInstanceId);
    const position = document.createElement("p");
    position.className = "inventory-card-position";
    position.textContent = `Inventory position ${slotIndex + 1}.`;
    const rules = document.createElement("p");
    rules.className = "inventory-card-rules";
    rules.textContent = formatRulesText(cardInstanceId);
    card.append(heading, position, rules, createInventoryCardActions(entity, cardInstanceId, slotIndex));
    tableCell.append(card);
    return tableCell;
  } // end createInventorySlotCell function

  function createInventoryTable(entity, tableIndex) {
    const table = document.createElement("table");
    table.className = "inventory-grid-table";
    const startPosition = tableIndex * INVENTORY_TABLE_SLOT_COUNT + 1;
    const endPosition = startPosition + INVENTORY_TABLE_SLOT_COUNT - 1;
    const caption = document.createElement("caption");
    caption.textContent = `Inventory positions ${startPosition} through ${endPosition}`;
    table.append(caption);

    const tableHead = document.createElement("thead");
    const headingRow = document.createElement("tr");
    const cornerHeader = document.createElement("th");
    cornerHeader.scope = "col";
    cornerHeader.textContent = "Row";
    headingRow.append(cornerHeader);
    for (let columnIndex = 0; columnIndex < INVENTORY_COLUMNS; columnIndex += 1) {
      const columnHeader = document.createElement("th");
      columnHeader.id = `inventory-column-${tableIndex + 1}-${columnIndex + 1}`;
      columnHeader.scope = "col";
      columnHeader.textContent = `Column ${columnIndex + 1}`;
      headingRow.append(columnHeader);
    } // end inventory-column-header loop
    tableHead.append(headingRow);
    table.append(tableHead);

    const tableBody = document.createElement("tbody");
    for (let rowIndex = 0; rowIndex < INVENTORY_ROWS_PER_TABLE; rowIndex += 1) {
      const tableRow = document.createElement("tr");
      const rowHeader = document.createElement("th");
      rowHeader.id = `inventory-row-${tableIndex + 1}-${rowIndex + 1}`;
      rowHeader.scope = "row";
      rowHeader.textContent = `Row ${rowIndex + 1}`;
      tableRow.append(rowHeader);
      for (let columnIndex = 0; columnIndex < INVENTORY_COLUMNS; columnIndex += 1) {
        const slotIndex = tableIndex * INVENTORY_TABLE_SLOT_COUNT + rowIndex * INVENTORY_COLUMNS + columnIndex;
        tableRow.append(createInventorySlotCell(
          entity,
          slotIndex,
          rowHeader.id,
          `inventory-column-${tableIndex + 1}-${columnIndex + 1}`
        )); // end inventory-slot-cell append
      } // end inventory-column loop
      tableBody.append(tableRow);
    } // end inventory-row loop
    table.append(tableBody);
    return table;
  } // end createInventoryTable function

  function openInventoryDialog(entityId, invokingControl) {
    const api = getApi();
    const entity = getEntity(entityId);
    if (!api || !entity || entity.entityType !== "playerCharacter") {
      return;
    } // end unavailable-player-inventory branch

    normalizeInventory(entity);
    inventoryUiState.invokingControl = invokingControl || inventoryUiState.invokingControl;
    if (inventoryUiState.selectedMovement && inventoryUiState.selectedMovement.entityId !== entity.id) {
      inventoryUiState.selectedMovement = null;
    } // end cross-character-movement-clear branch

    if (inventoryUiState.activeInventoryDialog) {
      closeDialog(inventoryUiState.activeInventoryDialog, true);
    } // end existing-inventory-dialog close branch

    const titleId = `inventory-dialog-title-${sanitizeIdPart(entity.id)}`;
    const dialog = createBaseDialog("stack-inventory-dialog", titleId);
    inventoryUiState.activeInventoryDialog = dialog;

    const heading = document.createElement("h2");
    heading.id = titleId;
    heading.tabIndex = -1;
    heading.textContent = `Inventory — ${entity.name}`;
    const guidance = document.createElement("p");
    guidance.textContent = "Cards remain in the order chosen by the players. Use screen-reader table navigation to move through the five-column inventory table.";

    const capacitySummary = document.createElement("p");
    capacitySummary.className = "inventory-capacity-summary";
    const inventoryCount = getInventoryCardCount(entity);
    capacitySummary.textContent = `Current inventory capacity: ${inventoryCount} / ${entity.inventoryCapacity} cards.`;
    if (inventoryCount > entity.inventoryCapacity) {
      const capacityWarning = document.createElement("strong");
      capacityWarning.textContent = ` Over capacity by ${inventoryCount - entity.inventoryCapacity} card(s). Players must resolve capacity rules manually.`;
      capacitySummary.append(capacityWarning);
    } // end over-capacity-warning branch

    const capacityControls = document.createElement("div");
    capacityControls.className = "inventory-capacity-controls";
    const capacityEditor = document.createElement("div");
    capacityEditor.hidden = true;
    const capacityInputId = `inventory-capacity-input-${sanitizeIdPart(entity.id)}`;
    const capacityLabel = document.createElement("label");
    capacityLabel.htmlFor = capacityInputId;
    capacityLabel.textContent = `Set maximum inventory cards for ${entity.name}`;
    const capacityInput = document.createElement("input");
    capacityInput.id = capacityInputId;
    capacityInput.type = "number";
    capacityInput.min = "0";
    capacityInput.step = "1";
    capacityInput.value = String(entity.inventoryCapacity);
    const saveCapacityButton = createButton("Save Capacity", "", function saveInventoryCapacity() {
      const proposedCapacity = Number(capacityInput.value);
      if (!Number.isInteger(proposedCapacity) || proposedCapacity < 0) {
        api.setManualControlStatus("Inventory capacity must be a whole number of zero or greater.", "error");
        focusElementSoon(capacityInput);
        return;
      } // end invalid-inventory-capacity branch

      const previousCapacity = entity.inventoryCapacity;
      entity.inventoryCapacity = proposedCapacity;
      const message = `${entity.name}'s inventory capacity changed from ${previousCapacity} to ${proposedCapacity}.`;
      api.appendLog("inventoryCapacityChanged", message);
      rerenderAndReopenInventory(entity.id, message);
    }); // end save-inventory-capacity handler
    const cancelCapacityButton = createButton("Cancel Capacity Edit", "", function cancelInventoryCapacityEdit() {
      capacityEditor.hidden = true;
      editCapacityButton.hidden = false;
      focusElementSoon(editCapacityButton);
    }); // end cancel-inventory-capacity-edit handler
    capacityEditor.append(capacityLabel, capacityInput, saveCapacityButton, cancelCapacityButton);

    const editCapacityButton = createButton("Edit Capacity", "", function editInventoryCapacity() {
      editCapacityButton.hidden = true;
      capacityEditor.hidden = false;
      focusElementSoon(capacityInput);
    }); // end edit-inventory-capacity handler
    capacityControls.append(editCapacityButton, capacityEditor);

    const gridRegion = document.createElement("section");
    gridRegion.setAttribute("aria-label", `${entity.name} inventory grid`);
    const tableCount = Math.ceil(getInventorySlotCountToRender(entity) / INVENTORY_TABLE_SLOT_COUNT);
    for (let tableIndex = 0; tableIndex < tableCount; tableIndex += 1) {
      gridRegion.append(createInventoryTable(entity, tableIndex));
    } // end inventory-table render loop

    const closeButton = createButton("Close Inventory", "", function closeInventoryModal() {
      closeDialog(dialog, false);
    }); // end close-inventory-modal handler
    dialog.append(heading, guidance, capacitySummary, capacityControls, gridRegion, closeButton);
    dialog.addEventListener("cancel", function handleInventoryDialogCancel(event) {
      event.preventDefault();
      closeDialog(dialog, false);
    }); // end inventory-dialog cancel listener
    dialog.addEventListener("close", function cleanUpInventoryDialog() {
      const shouldRestoreFocus = dialog.dataset.suppressFocusReturn !== "true";
      if (inventoryUiState.activeInventoryDialog === dialog) {
        inventoryUiState.activeInventoryDialog = null;
      } // end active-inventory-dialog cleanup branch
      dialog.remove();
      if (shouldRestoreFocus && inventoryUiState.invokingControl) {
        focusElementSoon(inventoryUiState.invokingControl);
      } // end inventory-focus restoration branch
    }); // end inventory-dialog cleanup listener
    showDialog(dialog, heading);
  } // end openInventoryDialog function

  function getInventorySetupDefinitions() {
    const api = getApi();
    const catalog = api && typeof api.getCatalog === "function" ? api.getCatalog() : null;
    if (!catalog || !catalog.cardsById) {
      return [];
    } // end missing-inventory-setup-catalog branch

    const excludedCardTypes = new Set(["character", "playercharacter", "enemy", "boss", "summon", "controlledally", "autonomousally", "status"]);
    return Object.values(catalog.cardsById)
      .filter(function filterInventorySetupDefinition(definition) {
        return definition && definition.active === true && !excludedCardTypes.has(String(definition.cardType || "").toLowerCase());
      }) // end inventory-setup-definition filter
      .sort(function sortInventorySetupDefinitions(first, second) {
        return first.name.localeCompare(second.name) || first.id.localeCompare(second.id);
      }); // end inventory-setup-definition sort
  } // end getInventorySetupDefinitions function

  function refreshInventorySetupControls() {
    const setupKindSelect = document.getElementById("setup-card-kind-select");
    const setupCardSelect = document.getElementById("setup-card-select");
    const assignButton = document.getElementById("assign-card-button");
    const setupSlotLabel = document.querySelector("label[for='setup-slot-input']");
    if (!setupKindSelect || setupKindSelect.value !== "inventory" || !setupCardSelect || !assignButton) {
      return;
    } // end inactive-inventory-setup branch

    const definitions = getInventorySetupDefinitions();
    setupCardSelect.replaceChildren();
    definitions.forEach(function addInventorySetupDefinition(definition) {
      const option = document.createElement("option");
      option.value = definition.id;
      option.textContent = definition.name;
      setupCardSelect.append(option);
    }); // end inventory-setup-definition option loop
    assignButton.disabled = definitions.length === 0;
    if (setupSlotLabel) {
      setupSlotLabel.textContent = "Inventory cards are placed in the first empty inventory position. The Slot number field is ignored for this role.";
    } // end inventory-setup-label branch
  } // end refreshInventorySetupControls function

  function restoreStandardSetupSlotLabel() {
    const setupKindSelect = document.getElementById("setup-card-kind-select");
    const setupSlotLabel = document.querySelector("label[for='setup-slot-input']");
    if (!setupKindSelect || setupKindSelect.value === "inventory" || !setupSlotLabel) {
      return;
    } // end inactive-standard-setup-label branch

    setupSlotLabel.textContent = "Slot number. For Equipment, enter the equipment slot name, such as weapon.";
  } // end restoreStandardSetupSlotLabel function

  function interceptInventorySetupAssignment(event) {
    const clickedElement = event.target;
    if (!clickedElement || clickedElement.id !== "assign-card-button") {
      return;
    } // end unrelated-click branch

    const setupKindSelect = document.getElementById("setup-card-kind-select");
    const setupEntitySelect = document.getElementById("setup-entity-select");
    const setupCardSelect = document.getElementById("setup-card-select");
    if (!setupKindSelect || setupKindSelect.value !== "inventory" || !setupEntitySelect || !setupCardSelect) {
      return;
    } // end non-inventory-setup branch

    event.preventDefault();
    event.stopImmediatePropagation();
    const api = getApi();
    const entity = getEntity(setupEntitySelect.value);
    const definitionId = setupCardSelect.value;
    if (!api || !entity || entity.entityType !== "playerCharacter" || !definitionId || typeof api.takeUnusedOrCreateCardInstance !== "function") {
      if (api && typeof api.setManualControlStatus === "function") {
        api.setManualControlStatus("Select a Player Character and an available card before adding a card to inventory.", "error");
      } // end inventory-setup-error-status branch
      return;
    } // end invalid-inventory-setup-selection branch

    try {
      const cardInstanceId = api.takeUnusedOrCreateCardInstance(definitionId, {
        ownerEntityId: entity.id,
        zone: "inventory",
        zoneDetail: null,
        faceUp: true
      }); // end inventory-card-instance request
      const destinationIndex = addCardToInventory(entity, cardInstanceId);
      const message = `${formatCardLabel(cardInstanceId)} was added to ${entity.name}'s inventory position ${destinationIndex + 1}.`;
      api.appendLog("inventoryCardAdded", message);
      api.rerenderAfterStateChange(message, "success", "assign-card-button");
    } catch (error) {
      api.setManualControlStatus(error.message, "error");
    } // end inventory-setup assignment try-catch
  } // end interceptInventorySetupAssignment function

  document.addEventListener("change", function handleInventorySetupKindChange(event) {
    const changedElement = event.target;
    if (!changedElement || changedElement.id !== "setup-card-kind-select") {
      return;
    } // end unrelated-setup-kind change branch

    window.setTimeout(function updateInventorySetupAfterCoreRefresh() {
      refreshInventorySetupControls();
      restoreStandardSetupSlotLabel();
    }, 0);
  }, true); // end inventory-setup-kind capture listener

  document.addEventListener("click", interceptInventorySetupAssignment, true); // end inventory-setup assignment capture listener

  function appendInventoryButton(panel, entity) {
    if (!panel || !entity || entity.entityType !== "playerCharacter" || panel.querySelector("[data-stack-inventory-button='true']")) {
      return;
    } // end invalid-or-duplicate-inventory-button branch

    const button = createButton(`View Inventory for ${entity.name}`, "inventory-open-button", function openPlayerInventory() {
      openInventoryDialog(entity.id, button);
    }); // end open-player-inventory handler
    button.id = `inventory-button-${sanitizeIdPart(entity.id)}`;
    button.dataset.stackInventoryButton = "true";
    panel.append(button);
  } // end appendInventoryButton function

  window.ProjectStackInventoryModal = {
    appendInventoryButton,
    openInventoryDialog
  }; // end ProjectStackInventoryModal export
}()); // end initializePlayerInventoryModal IIFE
