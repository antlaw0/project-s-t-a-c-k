(function initializePlaytestTabletop() {
  "use strict";

  const CATALOG_URL = "./generated/card-catalog.json";
  const DEFAULT_STATE_URL = "./playtest-saves/scenario.solo-warrior-goblin-warrens-smoke-test.initial.json";
  const FORMATION_SLOT_COUNT = 4;
  const STATUS_ROW_SLOT_COUNT = 5;
  const FRIENDLY_ENTITY_TYPES = new Set(["playerCharacter", "controlledAlly", "autonomousAlly"]);

  const application = {
    catalog: null,
    runtimeState: null,
    selectedCardInstanceId: null,
    loadedStateLabel: null
  }; // end application object

  const elements = {
    catalogStatus: document.getElementById("catalog-status"),
    loadLocalStateButton: document.getElementById("load-local-state-button"),
    stateFileInput: document.getElementById("state-file-input"),
    loadStatus: document.getElementById("load-status"),
    tabletop: document.getElementById("tabletop"),
    tabletopHeading: document.getElementById("tabletop-heading"),
    runtimeSummary: document.getElementById("runtime-summary"),
    manualControlStatus: document.getElementById("manual-control-status"),
    drawDungeonCardButton: document.getElementById("draw-dungeon-card-button"),
    drawBottomDungeonCardButton: document.getElementById("draw-bottom-dungeon-card-button"),
    shuffleDungeonDeckButton: document.getElementById("shuffle-dungeon-deck-button"),
    dungeonDrawSummary: document.getElementById("dungeon-draw-summary"),
    drawDungeonDiscardTopButton: document.getElementById("draw-dungeon-discard-top-button"),
    drawDungeonDiscardBottomButton: document.getElementById("draw-dungeon-discard-bottom-button"),
    shuffleDungeonDiscardButton: document.getElementById("shuffle-dungeon-discard-button"),
    dungeonDiscardSummary: document.getElementById("dungeon-discard-summary"),
    drawStatusCardButton: document.getElementById("draw-status-card-button"),
    shuffleStatusDeckButton: document.getElementById("shuffle-status-deck-button"),
    statusDrawSummary: document.getElementById("status-draw-summary"),
    partyCurrencyValue: document.getElementById("party-currency-value"),
    decreasePartyCurrencyButton: document.getElementById("decrease-party-currency-button"),
    increasePartyCurrencyButton: document.getElementById("increase-party-currency-button"),
    partyCurrencyInput: document.getElementById("party-currency-input"),
    downloadStateButton: document.getElementById("download-state-button"),
    newPlayerControllerSelect: document.getElementById("new-player-controller-select"),
    newPlayerNameInput: document.getElementById("new-player-name-input"),
    newPlayerCharacterSelect: document.getElementById("new-player-character-select"),
    newPlayerCharacterNameInput: document.getElementById("new-player-character-name-input"),
    newPlayerRowSelect: document.getElementById("new-player-row-select"),
    addPlayerCharacterButton: document.getElementById("add-player-character-button"),
    newHirelingOwnerSelect: document.getElementById("new-hireling-owner-select"),
    newHirelingCardSelect: document.getElementById("new-hireling-card-select"),
    newHirelingNameInput: document.getElementById("new-hireling-name-input"),
    newHirelingRowSelect: document.getElementById("new-hireling-row-select"),
    addHirelingButton: document.getElementById("add-hireling-button"),
    newSummonOwnerSelect: document.getElementById("new-summon-owner-select"),
    newSummonCardSelect: document.getElementById("new-summon-card-select"),
    newSummonNameInput: document.getElementById("new-summon-name-input"),
    newSummonRowSelect: document.getElementById("new-summon-row-select"),
    addSummonButton: document.getElementById("add-summon-button"),
    setupEntitySelect: document.getElementById("setup-entity-select"),
    setupCardKindSelect: document.getElementById("setup-card-kind-select"),
    setupCardSelect: document.getElementById("setup-card-select"),
    setupSlotInput: document.getElementById("setup-slot-input"),
    assignCardButton: document.getElementById("assign-card-button"),
    formationGrid: document.getElementById("formation-grid"),
    characterAreas: document.getElementById("character-areas"),
    zoneSummary: document.getElementById("zone-summary"),
    playtestLog: document.getElementById("playtest-log"),
    cardDetails: document.getElementById("card-details")
  }; // end elements object

  function setLoadStatus(message, statusType) {
    elements.loadStatus.textContent = message;
    elements.loadStatus.dataset.status = statusType || "info";
  } // end setLoadStatus function

  function setManualControlStatus(message, statusType) {
    elements.manualControlStatus.textContent = message;
    elements.manualControlStatus.dataset.status = statusType || "info";
  } // end setManualControlStatus function

  function createElement(tagName, options) {
    const element = document.createElement(tagName);
    const settings = options || {};

    if (settings.className) {
      element.className = settings.className;
    } // end class-name branch

    if (settings.text !== undefined) {
      element.textContent = settings.text;
    } // end text branch

    if (settings.id) {
      element.id = settings.id;
    } // end id branch

    if (settings.attributes) {
      for (const [attributeName, attributeValue] of Object.entries(settings.attributes)) {
        element.setAttribute(attributeName, String(attributeValue));
      } // end attribute loop
    } // end attributes branch

    return element;
  } // end createElement function

  function clearElement(element) {
    while (element.firstChild) {
      element.firstChild.remove();
    } // end child-removal loop
  } // end clearElement function

  function sanitizeIdPart(value) {
    return String(value || "item").trim().replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "item";
  } // end sanitizeIdPart function

  function getNumericValue(value, fallbackValue) {
    return Number.isInteger(value) && value >= 0 ? value : fallbackValue;
  } // end getNumericValue function

  function createNullSlotArray(slotCount) {
    return Array.from({ length: slotCount }, function createEmptySlot() {
      return null;
    }); // end null-slot array callback
  } // end createNullSlotArray function

  function normalizeSlotArray(value, slotCount) {
    const normalized = Array.isArray(value) ? value.slice(0, slotCount) : [];
    while (normalized.length < slotCount) {
      normalized.push(null);
    } // end slot-array padding loop
    return normalized.map(function normalizeSlotValue(slotValue) {
      return typeof slotValue === "string" || (slotValue && typeof slotValue === "object") ? slotValue : null;
    }); // end slot-array normalization map
  } // end normalizeSlotArray function

  function isFriendlyEntity(entity) {
    return Boolean(entity && FRIENDLY_ENTITY_TYPES.has(entity.entityType));
  } // end isFriendlyEntity function

  function getCardDefinition(definitionId) {
    return application.catalog && application.catalog.cardsById
      ? application.catalog.cardsById[definitionId] || null
      : null;
  } // end getCardDefinition function

  function getCardInstance(cardInstanceId) {
    return application.runtimeState && application.runtimeState.cardInstances
      ? application.runtimeState.cardInstances[cardInstanceId] || null
      : null;
  } // end getCardInstance function

  function getDefinitionForInstance(cardInstanceId) {
    const instance = getCardInstance(cardInstanceId);
    return instance ? getCardDefinition(instance.definitionId) : null;
  } // end getDefinitionForInstance function

  function getEntity(entityId) {
    return application.runtimeState && application.runtimeState.entities
      ? application.runtimeState.entities[entityId] || null
      : null;
  } // end getEntity function

  function getActiveDefinitions(predicate) {
    if (!application.catalog || !application.catalog.cardsById) {
      return [];
    } // end missing-catalog branch

    return Object.values(application.catalog.cardsById)
      .filter(function filterActiveDefinition(definition) {
        return definition && definition.active === true && predicate(definition);
      }) // end active-definition filter
      .sort(function sortDefinitionNames(first, second) {
        return first.name.localeCompare(second.name) || first.id.localeCompare(second.id);
      }); // end definition sort
  } // end getActiveDefinitions function

  function isSummonDefinition(definition) {
    const tags = Array.isArray(definition && definition.tags) ? definition.tags : [];
    const data = definition && definition.data ? definition.data : {};
    return Boolean(
      definition && (
        definition.cardType === "summon" ||
        definition.cardType === "controlledAlly" ||
        data.entityType === "controlledAlly" ||
        tags.includes("summon") ||
        tags.includes("controlled-ally")
      )
    );
  } // end isSummonDefinition function

  function normalizeRuntimeState(state) {
    state.stateVersion = Number.isInteger(state.stateVersion) ? state.stateVersion : 1;
    state.log = Array.isArray(state.log) ? state.log : [];
    state.resources = state.resources && typeof state.resources === "object" ? state.resources : {};
    state.resources.currency = getNumericValue(state.resources.currency, 0);
    state.entities = state.entities && typeof state.entities === "object" ? state.entities : {};
    state.cardInstances = state.cardInstances && typeof state.cardInstances === "object" ? state.cardInstances : {};
    state.participants = Array.isArray(state.participants) ? state.participants : [];
    state.zones = state.zones && typeof state.zones === "object" ? state.zones : {};
    state.encounter = state.encounter && typeof state.encounter === "object" ? state.encounter : { round: 1, phase: "manualSetup" };

    const arrayZones = [
      "dungeonDeck",
      "dungeonRevealArea",
      "dungeonDiscardPile",
      "dungeonLootArea",
      "lootDeck",
      "lootDiscardPile",
      "expendedSummons",
      "statusDeck",
      "statusRevealArea",
      "statusDiscardPile",
      "unusedSupply"
    ]; // end array-zones list

    arrayZones.forEach(function normalizeArrayZone(zoneName) {
      state.zones[zoneName] = Array.isArray(state.zones[zoneName]) ? state.zones[zoneName] : [];
    }); // end array-zone normalization loop

    state.zones.playerFormation = state.zones.playerFormation && typeof state.zones.playerFormation === "object"
      ? state.zones.playerFormation
      : {};
    state.zones.enemyFormation = state.zones.enemyFormation && typeof state.zones.enemyFormation === "object"
      ? state.zones.enemyFormation
      : {};
    state.zones.playerFormation.frontRow = normalizeSlotArray(state.zones.playerFormation.frontRow, FORMATION_SLOT_COUNT);
    state.zones.playerFormation.backRow = normalizeSlotArray(state.zones.playerFormation.backRow, FORMATION_SLOT_COUNT);
    state.zones.enemyFormation.frontRow = normalizeSlotArray(state.zones.enemyFormation.frontRow, FORMATION_SLOT_COUNT);
    state.zones.enemyFormation.backRow = normalizeSlotArray(state.zones.enemyFormation.backRow, FORMATION_SLOT_COUNT);

    Object.values(state.entities).forEach(function normalizeEntity(entity) {
      entity.damage = getNumericValue(entity.damage, 0);
      entity.statusRow = normalizeSlotArray(entity.statusRow, STATUS_ROW_SLOT_COUNT);
      entity.equipment = entity.equipment && typeof entity.equipment === "object" ? entity.equipment : {};
      entity.skillSlots = Array.isArray(entity.skillSlots) ? entity.skillSlots : [];
      entity.tacticalReserveSlots = Array.isArray(entity.tacticalReserveSlots) ? entity.tacticalReserveSlots : [];
      if (isFriendlyEntity(entity)) {
        entity.heat = getNumericValue(entity.heat, 0);
      } // end friendly-heat normalization branch
    }); // end entity normalization loop

    synchronizeParticipantMembership();
    return state;
  } // end normalizeRuntimeState function

  function synchronizeParticipantMembership() {
    const state = application.runtimeState;
    if (!state) {
      return;
    } // end missing-state branch

    state.participants.forEach(function normalizeParticipant(participant) {
      participant.controlledEntityIds = [];
      participant.alliedEntityIds = [];
    }); // end participant normalization loop

    Object.values(state.entities).forEach(function addEntityToParticipantMembership(entity) {
      const participant = state.participants.find(function findParticipant(candidate) {
        return candidate.id === entity.controllerParticipantId || candidate.id === entity.ownerParticipantId;
      }); // end participant lookup

      if (!participant) {
        return;
      } // end missing-participant branch

      if (entity.entityType === "playerCharacter") {
        participant.controlledEntityIds.push(entity.id);
      } else if (isFriendlyEntity(entity)) {
        participant.alliedEntityIds.push(entity.id);
      } // end participant-membership type branch
    }); // end entity-membership loop
  } // end synchronizeParticipantMembership function

  function formatCardLabel(cardInstanceId) {
    const definition = getDefinitionForInstance(cardInstanceId);
    return definition ? definition.name : `Unknown card: ${cardInstanceId}`;
  } // end formatCardLabel function

  function appendLog(type, message) {
    const entries = application.runtimeState.log;
    const greatestSequence = entries.reduce(function calculateGreatestSequence(currentGreatest, entry) {
      return Math.max(currentGreatest, Number.isInteger(entry.sequence) ? entry.sequence : 0);
    }, 0);
    entries.push({ sequence: greatestSequence + 1, type, message });
  } // end appendLog function

  function updateCardInstanceZone(cardInstanceId, zone, zoneDetail, faceUp) {
    const instance = getCardInstance(cardInstanceId);
    if (!instance) {
      throw new Error(`Card instance ${cardInstanceId} could not be found.`);
    } // end missing-card-instance branch
    instance.zone = zone;
    instance.zoneDetail = zoneDetail || null;
    if (typeof faceUp === "boolean") {
      instance.faceUp = faceUp;
    } // end face-up update branch
  } // end updateCardInstanceZone function

  function removeCardFromZoneArray(zoneName, cardInstanceId) {
    const zone = application.runtimeState.zones[zoneName];
    if (!Array.isArray(zone)) {
      return false;
    } // end missing-zone branch
    const index = zone.indexOf(cardInstanceId);
    if (index === -1) {
      return false;
    } // end card-not-found branch
    zone.splice(index, 1);
    return true;
  } // end removeCardFromZoneArray function

  function removeCardFromAllLooseZones(cardInstanceId) {
    const looseZoneNames = [
      "dungeonDeck",
      "dungeonRevealArea",
      "dungeonDiscardPile",
      "dungeonLootArea",
      "lootDeck",
      "lootDiscardPile",
      "expendedSummons",
      "statusDeck",
      "statusRevealArea",
      "statusDiscardPile",
      "unusedSupply"
    ]; // end loose-zone-name list
    looseZoneNames.forEach(function removeCardFromLooseZone(zoneName) {
      removeCardFromZoneArray(zoneName, cardInstanceId);
    }); // end loose-zone removal loop
  } // end removeCardFromAllLooseZones function

  function getFormationRow(rowKey) {
    const zones = application.runtimeState.zones;
    const rows = {
      playerFront: zones.playerFormation.frontRow,
      playerBack: zones.playerFormation.backRow,
      enemyFront: zones.enemyFormation.frontRow,
      enemyBack: zones.enemyFormation.backRow
    }; // end formation-row map
    return rows[rowKey] || null;
  } // end getFormationRow function

  function removeEntityFromFormation(entityId) {
    ["playerFront", "playerBack", "enemyFront", "enemyBack"].forEach(function clearEntityFromRow(rowKey) {
      const row = getFormationRow(rowKey);
      const index = row.indexOf(entityId);
      if (index !== -1) {
        row[index] = null;
      } // end entity-found branch
    }); // end formation-row loop
  } // end removeEntityFromFormation function

  function rowLabel(rowKey) {
    const labels = {
      playerFront: "Player Front Row",
      playerBack: "Player Back Row",
      enemyFront: "Enemy Front Row",
      enemyBack: "Enemy Back Row"
    }; // end row-label map
    return labels[rowKey] || rowKey;
  } // end rowLabel function

  function canEntityUseRow(entity, rowKey) {
    return isFriendlyEntity(entity) ? rowKey.startsWith("player") : rowKey.startsWith("enemy");
  } // end canEntityUseRow function

  function placeEntityInRow(entityId, rowKey) {
    const entity = getEntity(entityId);
    const destinationRow = getFormationRow(rowKey);
    if (!entity || !destinationRow || !canEntityUseRow(entity, rowKey)) {
      throw new Error("The selected entity cannot be placed in that formation row.");
    } // end invalid-row-placement branch
    const destinationIndex = destinationRow.indexOf(null);
    if (destinationIndex === -1) {
      throw new Error(`${rowLabel(rowKey)} is full.`);
    } // end full-destination-row branch
    removeEntityFromFormation(entityId);
    destinationRow[destinationIndex] = entityId;
    entity.currentRow = rowKey;
    const cardInstance = getCardInstance(entity.characterCardInstanceId);
    if (cardInstance) {
      updateCardInstanceZone(entity.characterCardInstanceId, isFriendlyEntity(entity) ? "playerFormation" : "enemyFormation", `${rowKey}:slot${destinationIndex + 1}`, true);
    } // end main-card-instance zone branch
    return destinationIndex;
  } // end placeEntityInRow function

  function moveEntityToRow(entityId, rowKey, focusControlId) {
    const entity = getEntity(entityId);
    if (!entity) {
      setManualControlStatus("The selected entity no longer exists in this runtime state.", "error");
      return;
    } // end missing-entity branch
    try {
      const slotIndex = placeEntityInRow(entityId, rowKey);
      appendLog("entityMoved", `${entity.name} moved to ${rowLabel(rowKey)}, slot ${slotIndex + 1}.`);
      rerenderAfterStateChange(`${entity.name} moved to ${rowLabel(rowKey)}.`, "success", focusControlId);
    } catch (error) {
      setManualControlStatus(error.message, "error");
      restoreFocusAfterRender(focusControlId);
    } // end move-entity try-catch
  } // end moveEntityToRow function

  function getCopyUsageCount(definitionId) {
    return Object.values(application.runtimeState.cardInstances).filter(function countDefinitionUsage(instance) {
      return instance && instance.definitionId === definitionId;
    }).length;
  } // end getCopyUsageCount function

  function createUniqueRuntimeId(prefix, definitionId) {
    const state = application.runtimeState;
    const base = `${prefix}.${sanitizeIdPart(definitionId)}`;
    let sequence = 1;
    let candidate = `${base}.${String(sequence).padStart(3, "0")}`;
    const occupied = prefix === "instance" ? state.cardInstances : state.entities;
    while (occupied[candidate]) {
      sequence += 1;
      candidate = `${base}.${String(sequence).padStart(3, "0")}`;
    } // end runtime-id uniqueness loop
    return candidate;
  } // end createUniqueRuntimeId function

  function takeUnusedOrCreateCardInstance(definitionId, details) {
    const state = application.runtimeState;
    const definition = getCardDefinition(definitionId);
    if (!definition || definition.active !== true) {
      throw new Error(`Card definition ${definitionId} is missing or inactive.`);
    } // end inactive-definition branch

    const reusableIndex = state.zones.unusedSupply.findIndex(function findReusableInstance(cardInstanceId) {
      const instance = getCardInstance(cardInstanceId);
      return instance && instance.definitionId === definitionId;
    }); // end reusable-instance lookup

    if (reusableIndex !== -1) {
      const reusableId = state.zones.unusedSupply.splice(reusableIndex, 1)[0];
      const reusable = getCardInstance(reusableId);
      reusable.ownerEntityId = details.ownerEntityId || null;
      updateCardInstanceZone(reusableId, details.zone, details.zoneDetail, details.faceUp !== false);
      return reusableId;
    } // end reusable-instance branch

    if (getCopyUsageCount(definitionId) >= definition.count) {
      throw new Error(`${definition.name} has no unused catalog copies available. Increase its count only if the physical supply should contain another copy.`);
    } // end count-exhausted branch

    const instanceId = createUniqueRuntimeId("instance", definitionId);
    state.cardInstances[instanceId] = {
      id: instanceId,
      definitionId,
      cardType: definition.cardType,
      ownerEntityId: details.ownerEntityId || null,
      zone: details.zone,
      zoneDetail: details.zoneDetail || null,
      faceUp: details.faceUp !== false
    }; // end new-card-instance object
    return instanceId;
  } // end takeUnusedOrCreateCardInstance function

  function returnCardToUnusedSupply(cardInstanceId, message) {
    const instance = getCardInstance(cardInstanceId);
    if (!instance) {
      throw new Error("The selected card instance could not be found.");
    } // end missing-supply-card branch
    removeCardFromAllLooseZones(cardInstanceId);
    application.runtimeState.zones.unusedSupply.push(cardInstanceId);
    instance.ownerEntityId = null;
    updateCardInstanceZone(cardInstanceId, "unusedSupply", null, true);
    appendLog("cardReturnedToSupply", message || `${formatCardLabel(cardInstanceId)} returned to Available Supply.`);
  } // end returnCardToUnusedSupply function

  function createCardDetailsButton(cardInstanceId) {
    const button = createElement("button", {
      text: `View details: ${formatCardLabel(cardInstanceId)}`,
      attributes: { type: "button" }
    }); // end card-details button
    button.addEventListener("click", function handleCardDetailsClick() {
      application.selectedCardInstanceId = cardInstanceId;
      renderCardDetails();
      elements.cardDetails.focus();
    }); // end card-details listener
    return button;
  } // end createCardDetailsButton function

  function createButton(label, id, handler) {
    const button = createElement("button", { id, text: label, attributes: { type: "button" } });
    button.addEventListener("click", handler);
    return button;
  } // end createButton function

  function restoreFocusAfterRender(controlId) {
    if (!controlId) {
      return;
    } // end missing-control-id branch
    window.requestAnimationFrame(function restoreFocus() {
      const control = document.getElementById(controlId);
      if (control) {
        control.focus();
      } // end found-control branch
    }); // end focus restoration callback
  } // end restoreFocusAfterRender function

  function rerenderAfterStateChange(message, statusType, focusControlId) {
    renderTabletop();
    setManualControlStatus(message, statusType || "success");
    restoreFocusAfterRender(focusControlId);
  } // end rerenderAfterStateChange function

  function setEntityCounter(entityId, counterName, value, focusControlId) {
    const entity = getEntity(entityId);
    const numericValue = Number(value);
    if (!entity || !Number.isInteger(numericValue) || numericValue < 0) {
      setManualControlStatus("Counter values must be whole numbers of zero or greater.", "error");
      restoreFocusAfterRender(focusControlId);
      return;
    } // end invalid-counter branch
    if (counterName === "heat" && !isFriendlyEntity(entity)) {
      setManualControlStatus("Heat is tracked only for player-side entities.", "error");
      restoreFocusAfterRender(focusControlId);
      return;
    } // end unsupported-heat branch
    const previousValue = getNumericValue(entity[counterName], 0);
    entity[counterName] = numericValue;
    const counterLabel = counterName === "heat" ? "Heat" : "Damage";
    appendLog("counterChanged", `${entity.name} ${counterLabel} changed from ${previousValue} to ${numericValue}.`);
    rerenderAfterStateChange(`${entity.name} ${counterLabel} is now ${numericValue}.`, "success", focusControlId);
  } // end setEntityCounter function

  function changeEntityCounter(entityId, counterName, delta, focusControlId) {
    const entity = getEntity(entityId);
    if (!entity) {
      setManualControlStatus("The selected entity no longer exists.", "error");
      return;
    } // end missing-entity branch
    setEntityCounter(entityId, counterName, Math.max(0, getNumericValue(entity[counterName], 0) + delta), focusControlId);
  } // end changeEntityCounter function

  function createCounterControls(entity, prefix) {
    const wrapper = createElement("section", { className: "counter-controls", attributes: { "aria-label": `Counters for ${entity.name}` } });
    const heading = createElement("h6", { text: "Counters" });
    wrapper.append(heading);
    ["damage"].forEach(function addDamageCounter(counterName) {
      const inputId = `${prefix}-${sanitizeIdPart(entity.id)}-${counterName}-input`;
      const decreaseId = `${prefix}-${sanitizeIdPart(entity.id)}-${counterName}-decrease`;
      const increaseId = `${prefix}-${sanitizeIdPart(entity.id)}-${counterName}-increase`;
      const field = createElement("div", { className: "counter-field" });
      field.append(
        createElement("output", { text: `Damage: ${getNumericValue(entity.damage, 0)} of ${entity.maximumHp || "unknown"} maximum HP.` }),
        createElement("div", { className: "counter-button-row" })
      );
      const buttonRow = field.lastElementChild;
      buttonRow.append(
        createButton(`Decrease Damage for ${entity.name}`, decreaseId, function handleDecreaseDamage() {
          changeEntityCounter(entity.id, "damage", -1, decreaseId);
        }),
        createButton(`Increase Damage for ${entity.name}`, increaseId, function handleIncreaseDamage() {
          changeEntityCounter(entity.id, "damage", 1, increaseId);
        })
      );
      const label = createElement("label", { text: `Set Damage for ${entity.name}`, attributes: { for: inputId } });
      const input = createElement("input", { id: inputId, attributes: { type: "number", min: "0", step: "1", value: String(getNumericValue(entity.damage, 0)) } });
      input.addEventListener("change", function handleDamageChange() {
        setEntityCounter(entity.id, "damage", input.value, inputId);
      }); // end damage-input listener
      field.append(label, input);
      wrapper.append(field);
    }); // end damage-control loop

    if (isFriendlyEntity(entity)) {
      const inputId = `${prefix}-${sanitizeIdPart(entity.id)}-heat-input`;
      const decreaseId = `${prefix}-${sanitizeIdPart(entity.id)}-heat-decrease`;
      const increaseId = `${prefix}-${sanitizeIdPart(entity.id)}-heat-increase`;
      const field = createElement("div", { className: "counter-field" });
      field.append(
        createElement("output", { text: `Heat: ${getNumericValue(entity.heat, 0)}.` }),
        createElement("div", { className: "counter-button-row" })
      );
      const buttonRow = field.lastElementChild;
      buttonRow.append(
        createButton(`Decrease Heat for ${entity.name}`, decreaseId, function handleDecreaseHeat() {
          changeEntityCounter(entity.id, "heat", -1, decreaseId);
        }),
        createButton(`Increase Heat for ${entity.name}`, increaseId, function handleIncreaseHeat() {
          changeEntityCounter(entity.id, "heat", 1, increaseId);
        })
      );
      const label = createElement("label", { text: `Set Heat for ${entity.name}`, attributes: { for: inputId } });
      const input = createElement("input", { id: inputId, attributes: { type: "number", min: "0", step: "1", value: String(getNumericValue(entity.heat, 0)) } });
      input.addEventListener("change", function handleHeatChange() {
        setEntityCounter(entity.id, "heat", input.value, inputId);
      }); // end heat-input listener
      field.append(label, input);
      wrapper.append(field);
    } // end friendly-heat branch

    return wrapper;
  } // end createCounterControls function

  function getStatusSlotIndex(entity, cardInstanceId) {
    return Array.isArray(entity.statusRow) ? entity.statusRow.indexOf(cardInstanceId) : -1;
  } // end getStatusSlotIndex function

  function getFirstOpenStatusSlot(entity) {
    entity.statusRow = normalizeSlotArray(entity.statusRow, STATUS_ROW_SLOT_COUNT);
    return entity.statusRow.indexOf(null);
  } // end getFirstOpenStatusSlot function

  function findSkillSlotContainingAbility(entity, abilityInstanceId) {
    return (entity.skillSlots || []).find(function findAbilityAttachment(skillSlot) {
      return skillSlot && Array.isArray(skillSlot.attachedAbilityInstanceIds) && skillSlot.attachedAbilityInstanceIds.includes(abilityInstanceId);
    }) || null;
  } // end findSkillSlotContainingAbility function

  function abilityMovesToStatusRow(definition) {
    return Boolean(definition && definition.data && definition.data.activation && definition.data.activation.moveTo === "ownerStatusRow");
  } // end abilityMovesToStatusRow function

  function moveSkillAttachmentToStatusRow(entityId, cardInstanceId, focusControlId) {
    const entity = getEntity(entityId);
    const instance = getCardInstance(cardInstanceId);
    const definition = getDefinitionForInstance(cardInstanceId);
    if (!entity || !instance || !definition || !abilityMovesToStatusRow(definition)) {
      setManualControlStatus("That card is not an active ability that can move from a Skill Card to a Status Row.", "error");
      return;
    } // end invalid-ability-move branch
    const skillSlot = findSkillSlotContainingAbility(entity, cardInstanceId);
    const statusIndex = getFirstOpenStatusSlot(entity);
    if (!skillSlot || statusIndex === -1) {
      setManualControlStatus(statusIndex === -1 ? `${entity.name}'s Status Row is full.` : "The ability is not attached to this entity's Skill Card.", "error");
      return;
    } // end unavailable-ability-move branch
    skillSlot.attachedAbilityInstanceIds.splice(skillSlot.attachedAbilityInstanceIds.indexOf(cardInstanceId), 1);
    entity.statusRow[statusIndex] = cardInstanceId;
    instance.statusReturn = { type: "skillAttachment", skillCardInstanceId: skillSlot.skillCardInstanceId, ownerEntityId: entity.id };
    updateCardInstanceZone(cardInstanceId, "statusRow", `${entity.id}:slot${statusIndex + 1}`, true);
    appendLog("abilityMovedToStatusRow", `${definition.name} moved to ${entity.name}'s Status Row, slot ${statusIndex + 1}. Resolve the card's action cost and rules manually.`);
    rerenderAfterStateChange(`${definition.name} moved to ${entity.name}'s Status Row.`, "success", focusControlId);
  } // end moveSkillAttachmentToStatusRow function

  function returnStatusCardToSkill(entityId, cardInstanceId, focusControlId) {
    const entity = getEntity(entityId);
    const instance = getCardInstance(cardInstanceId);
    const definition = getDefinitionForInstance(cardInstanceId);
    const target = instance && instance.statusReturn;
    if (!entity || !instance || !definition || !target || target.type !== "skillAttachment") {
      setManualControlStatus("This Status Row card has no equipped Skill Card return target.", "error");
      return;
    } // end missing-return-target branch
    const sourceSkill = (entity.skillSlots || []).find(function findSourceSkill(slot) {
      return slot && slot.skillCardInstanceId === target.skillCardInstanceId;
    }); // end source-skill lookup
    const statusIndex = getStatusSlotIndex(entity, cardInstanceId);
    if (!sourceSkill || statusIndex === -1) {
      setManualControlStatus("The original Skill Card or Status Row placement could not be found.", "error");
      return;
    } // end unavailable-return branch
    entity.statusRow[statusIndex] = null;
    sourceSkill.attachedAbilityInstanceIds = Array.isArray(sourceSkill.attachedAbilityInstanceIds) ? sourceSkill.attachedAbilityInstanceIds : [];
    sourceSkill.attachedAbilityInstanceIds.push(cardInstanceId);
    updateCardInstanceZone(cardInstanceId, "skillAttachment", sourceSkill.skillCardInstanceId, true);
    delete instance.statusReturn;
    appendLog("statusReturnedToSkill", `${definition.name} returned from ${entity.name}'s Status Row to its original Skill Card.`);
    rerenderAfterStateChange(`${definition.name} returned to its Skill Card.`, "success", focusControlId);
  } // end returnStatusCardToSkill function

  function statusAllowsEntity(definition, entity) {
    const permitted = definition && definition.data && Array.isArray(definition.data.canAffect) ? definition.data.canAffect : [];
    return permitted.length === 0 || permitted.includes(entity.entityType);
  } // end statusAllowsEntity function

  function statusAllowsStacking(definition) {
    return Boolean(definition && definition.data && definition.data.stacking && definition.data.stacking.allowed === true);
  } // end statusAllowsStacking function

  function entityAlreadyHasStatusDefinition(entity, definitionId) {
    return (entity.statusRow || []).some(function matchStatusDefinition(cardInstanceId) {
      const instance = cardInstanceId ? getCardInstance(cardInstanceId) : null;
      return Boolean(instance && instance.definitionId === definitionId);
    }); // end status-definition scan
  } // end entityAlreadyHasStatusDefinition function

  function placeRevealedNegativeStatus(cardInstanceId, targetEntityId, focusControlId) {
    const instance = getCardInstance(cardInstanceId);
    const definition = getDefinitionForInstance(cardInstanceId);
    const target = getEntity(targetEntityId);
    if (!instance || !definition || !target || instance.zone !== "statusRevealArea") {
      setManualControlStatus("The revealed Status Card or target entity could not be found.", "error");
      return;
    } // end invalid-status-placement branch
    const slotIndex = getFirstOpenStatusSlot(target);
    if (!statusAllowsEntity(definition, target) || slotIndex === -1) {
      setManualControlStatus(slotIndex === -1 ? `${target.name}'s Status Row is full.` : `${definition.name} cannot affect ${target.name}.`, "error");
      return;
    } // end status-target-invalid branch
    if (!statusAllowsStacking(definition) && entityAlreadyHasStatusDefinition(target, definition.id)) {
      setManualControlStatus(`${target.name} already has ${definition.name}; that status does not stack.`, "error");
      return;
    } // end nonstacking-status branch
    removeCardFromZoneArray("statusRevealArea", cardInstanceId);
    target.statusRow[slotIndex] = cardInstanceId;
    instance.ownerEntityId = target.id;
    updateCardInstanceZone(cardInstanceId, "statusRow", `${target.id}:slot${slotIndex + 1}`, true);
    appendLog("negativeStatusPlaced", `${definition.name} was placed on ${target.name}'s Status Row, slot ${slotIndex + 1}.`);
    rerenderAfterStateChange(`${definition.name} is on ${target.name}.`, "success", focusControlId);
  } // end placeRevealedNegativeStatus function

  function discardNegativeStatus(entityId, cardInstanceId, focusControlId) {
    const entity = getEntity(entityId);
    const definition = getDefinitionForInstance(cardInstanceId);
    const slotIndex = entity ? getStatusSlotIndex(entity, cardInstanceId) : -1;
    if (!entity || !definition || slotIndex === -1 || definition.cardType !== "status") {
      setManualControlStatus("Only a Status Card currently in an entity's Status Row can be discarded this way.", "error");
      return;
    } // end invalid-status-discard branch
    entity.statusRow[slotIndex] = null;
    application.runtimeState.zones.statusDiscardPile.push(cardInstanceId);
    const instance = getCardInstance(cardInstanceId);
    instance.ownerEntityId = null;
    updateCardInstanceZone(cardInstanceId, "statusDiscardPile", null, true);
    appendLog("statusDiscarded", `${definition.name} was discarded from ${entity.name}'s Status Row.`);
    rerenderAfterStateChange(`${definition.name} was discarded.`, "success", focusControlId);
  } // end discardNegativeStatus function

  function resolveTacticalReserveUse(entityId, cardInstanceId, focusControlId) {
    const entity = getEntity(entityId);
    const definition = getDefinitionForInstance(cardInstanceId);
    const slotIndex = entity && Array.isArray(entity.tacticalReserveSlots) ? entity.tacticalReserveSlots.indexOf(cardInstanceId) : -1;
    if (!entity || !definition || slotIndex === -1 || definition.cardType !== "tacticalReserve") {
      setManualControlStatus("That Tactical Reserve card is no longer in the selected entity's Tactical Reserve slots.", "error");
      return;
    } // end invalid-tactical-reserve-use branch
    entity.tacticalReserveSlots[slotIndex] = null;
    const lootDeck = application.runtimeState.zones.lootDeck;
    lootDeck.push(cardInstanceId);
    shuffleArrayInPlace(lootDeck);
    const instance = getCardInstance(cardInstanceId);
    instance.ownerEntityId = null;
    updateCardInstanceZone(cardInstanceId, "lootDeck", "returnedAfterTacticalReserveUse", false);
    appendLog("tacticalReserveUsed", `${definition.name} was used from ${entity.name}'s Tactical Reserve and shuffled into the Loot Deck.`);
    rerenderAfterStateChange(`${definition.name} was returned to the Loot Deck after use.`, "success", focusControlId);
  } // end resolveTacticalReserveUse function

  function createCardListItem(cardInstanceId, slotLabel) {
    const item = createElement("li");
    item.append(
      createElement("strong", { text: slotLabel ? `${slotLabel}: ${formatCardLabel(cardInstanceId)}` : formatCardLabel(cardInstanceId) }),
      createElement("span", { className: "card-meta", text: `Instance: ${cardInstanceId}` })
    );
    const actions = createElement("div", { className: "card-actions" });
    actions.append(createCardDetailsButton(cardInstanceId));
    item.append(actions);
    return item;
  } // end createCardListItem function

  function createEmptySlotItem(label) {
    return createElement("li", { className: "empty-slot", text: `${label}: empty` });
  } // end createEmptySlotItem function

  function renderEquipment(entity, list) {
    const entries = Object.entries(entity.equipment || {});
    if (entries.length === 0) {
      list.append(createEmptySlotItem("No equipment"));
      return;
    } // end empty-equipment branch
    entries.forEach(function renderEquipmentEntry(entry) {
      const slotName = entry[0];
      const cardInstanceId = entry[1];
      const item = createCardListItem(cardInstanceId, `Equipment: ${slotName}`);
      const buttonId = `equipment-${sanitizeIdPart(entity.id)}-${sanitizeIdPart(cardInstanceId)}-remove`;
      const actions = createElement("div", { className: "zone-action-row" });
      actions.append(createButton(`Return ${formatCardLabel(cardInstanceId)} to Available Supply`, buttonId, function handleUnequip() {
        delete entity.equipment[slotName];
        returnCardToUnusedSupply(cardInstanceId, `${formatCardLabel(cardInstanceId)} was removed from ${entity.name}'s ${slotName} slot and returned to Available Supply.`);
        rerenderAfterStateChange(`${formatCardLabel(cardInstanceId)} returned to Available Supply.`, "success", buttonId);
      }));
      item.append(actions);
      list.append(item);
    }); // end equipment-entry loop
  } // end renderEquipment function

  function renderSkillSlots(entity, list) {
    (entity.skillSlots || []).forEach(function renderSkillSlot(skillSlot, index) {
      const slotLabel = `Skill slot ${index + 1}`;
      if (!skillSlot) {
        list.append(createEmptySlotItem(slotLabel));
        return;
      } // end empty-skill-slot branch
      const item = createCardListItem(skillSlot.skillCardInstanceId, slotLabel);
      const abilities = Array.isArray(skillSlot.attachedAbilityInstanceIds) ? skillSlot.attachedAbilityInstanceIds : [];
      if (abilities.length > 0) {
        item.append(createElement("span", { className: "slot-label", text: "Attached abilities" }));
        const abilityList = createElement("ul", { className: "card-list" });
        abilities.forEach(function renderAbility(abilityInstanceId) {
          const abilityItem = createCardListItem(abilityInstanceId);
          const abilityDefinition = getDefinitionForInstance(abilityInstanceId);
          if (abilityMovesToStatusRow(abilityDefinition)) {
            const buttonId = `ability-${sanitizeIdPart(entity.id)}-${sanitizeIdPart(abilityInstanceId)}-status`;
            const actions = createElement("div", { className: "zone-action-row" });
            actions.append(createButton(`Move ${abilityDefinition.name} to ${entity.name}'s Status Row`, buttonId, function handleAbilityStatusMove() {
              moveSkillAttachmentToStatusRow(entity.id, abilityInstanceId, buttonId);
            }));
            abilityItem.append(actions);
          } // end ability-status action branch
          abilityList.append(abilityItem);
        }); // end ability-render loop
        item.append(abilityList);
      } // end ability-list branch
      list.append(item);
    }); // end skill-slot loop
  } // end renderSkillSlots function

  function renderTacticalReserveSlots(entity, list) {
    (entity.tacticalReserveSlots || []).forEach(function renderTacticalReserveSlot(cardInstanceId, index) {
      const slotLabel = `Tactical Reserve slot ${index + 1}`;
      if (!cardInstanceId) {
        list.append(createEmptySlotItem(slotLabel));
        return;
      } // end empty-tactical-slot branch
      const item = createCardListItem(cardInstanceId, slotLabel);
      const buttonId = `reserve-${sanitizeIdPart(entity.id)}-${sanitizeIdPart(cardInstanceId)}-use`;
      const actions = createElement("div", { className: "zone-action-row" });
      actions.append(createButton(`Resolve use: shuffle ${formatCardLabel(cardInstanceId)} into Loot Deck`, buttonId, function handleTacticalReserveUse() {
        resolveTacticalReserveUse(entity.id, cardInstanceId, buttonId);
      }));
      item.append(actions);
      list.append(item);
    }); // end tactical-reserve slot loop
  } // end renderTacticalReserveSlots function

  function renderStatusRow(entity, list, prefix) {
    entity.statusRow.forEach(function renderStatusSlot(cardInstanceId, index) {
      const slotLabel = `Status row slot ${index + 1}`;
      if (!cardInstanceId) {
        list.append(createEmptySlotItem(slotLabel));
        return;
      } // end empty-status-slot branch
      const item = createCardListItem(cardInstanceId, slotLabel);
      const definition = getDefinitionForInstance(cardInstanceId);
      const instance = getCardInstance(cardInstanceId);
      const actions = createElement("div", { className: "zone-action-row" });
      if (instance && instance.statusReturn && instance.statusReturn.type === "skillAttachment") {
        const returnId = `${prefix}-${sanitizeIdPart(cardInstanceId)}-return`;
        actions.append(createButton(`Return ${formatCardLabel(cardInstanceId)} to its equipped Skill Card`, returnId, function handleStatusReturn() {
          returnStatusCardToSkill(entity.id, cardInstanceId, returnId);
        }));
      } else if (definition && definition.cardType === "status") {
        const discardId = `${prefix}-${sanitizeIdPart(cardInstanceId)}-discard`;
        actions.append(createButton(`Discard ${formatCardLabel(cardInstanceId)} from ${entity.name}'s Status Row`, discardId, function handleStatusDiscard() {
          discardNegativeStatus(entity.id, cardInstanceId, discardId);
        }));
      } // end status-action type branch
      if (actions.childElementCount > 0) {
        item.append(actions);
      } // end populated-status-actions branch
      list.append(item);
    }); // end status-slot loop
  } // end renderStatusRow function

  function createEntityActions(entity, prefix) {
    const actions = createElement("div", { className: "entity-actions" });
    if (entity.characterCardInstanceId) {
      actions.append(createCardDetailsButton(entity.characterCardInstanceId));
    } // end main-card detail branch
    if (isFriendlyEntity(entity)) {
      ["playerFront", "playerBack"].forEach(function addFriendlyRowMove(rowKey) {
        const buttonId = `${prefix}-${sanitizeIdPart(entity.id)}-${rowKey}`;
        actions.append(createButton(`Move ${entity.name} to ${rowLabel(rowKey)}`, buttonId, function handleFriendlyRowMove() {
          moveEntityToRow(entity.id, rowKey, buttonId);
        }));
      }); // end friendly-row-action loop
    } else {
      ["enemyFront", "enemyBack"].forEach(function addEnemyRowMove(rowKey) {
        const buttonId = `${prefix}-${sanitizeIdPart(entity.id)}-${rowKey}`;
        actions.append(createButton(`Move ${entity.name} to ${rowLabel(rowKey)}`, buttonId, function handleEnemyRowMove() {
          moveEntityToRow(entity.id, rowKey, buttonId);
        }));
      }); // end enemy-row-action loop
      const defeatId = `${prefix}-${sanitizeIdPart(entity.id)}-defeat`;
      actions.append(createButton(`Defeat and discard ${entity.name}`, defeatId, function handleEnemyDefeat() {
        defeatEnemyEntity(entity.id, defeatId);
      }));
    } // end entity-side action branch
    return actions;
  } // end createEntityActions function

  function createEntityItem(entity, slotLabel, prefix) {
    const item = createElement("li", { className: "entity-card" });
    const summaryParts = [`Damage ${getNumericValue(entity.damage, 0)} of ${entity.maximumHp || "unknown"} maximum HP.`];
    if (isFriendlyEntity(entity)) {
      summaryParts.push(`Heat ${getNumericValue(entity.heat, 0)}.`);
    } // end friendly-summary branch
    if (Number.isInteger(entity.defense)) {
      summaryParts.push(`Defense ${entity.defense}.`);
    } // end defense-summary branch
    item.append(
      createElement("strong", { text: `${slotLabel}: ${entity.name}` }),
      createElement("span", { className: "card-meta", text: summaryParts.join(" ") }),
      createCounterControls(entity, prefix),
      createEntityActions(entity, prefix)
    );
    const statusHeading = createElement("h6", { text: "Status Row" });
    const statusList = createElement("ol", { className: "card-list" });
    renderStatusRow(entity, statusList, `${prefix}-status`);
    item.append(statusHeading, statusList);
    return item;
  } // end createEntityItem function

  function renderFormationRow(title, rowKey) {
    const row = getFormationRow(rowKey);
    const panel = createElement("section", { className: "formation-row", attributes: { "aria-label": title } });
    const list = createElement("ol", { className: "slot-list", attributes: { "aria-label": `${title} slots` } });
    row.forEach(function renderFormationSlot(entityId, index) {
      const label = `Slot ${index + 1}`;
      const entity = entityId ? getEntity(entityId) : null;
      list.append(entity ? createEntityItem(entity, label, `formation-${rowKey}-${index + 1}`) : createEmptySlotItem(label));
    }); // end formation-slot loop
    panel.append(createElement("h4", { text: title }), list);
    return panel;
  } // end renderFormationRow function

  function renderFormation() {
    clearElement(elements.formationGrid);
    elements.formationGrid.append(
      renderFormationRow("Player Front Row", "playerFront"),
      renderFormationRow("Player Back Row", "playerBack"),
      renderFormationRow("Enemy Front Row", "enemyFront"),
      renderFormationRow("Enemy Back Row", "enemyBack")
    );
  } // end renderFormation function

  function entityTypeLabel(entityType) {
    const labels = {
      playerCharacter: "Player Character",
      controlledAlly: "Controlled Summon or Ally",
      autonomousAlly: "Autonomous Hireling or Ally",
      enemy: "Enemy",
      boss: "Boss"
    }; // end entity-type label map
    return labels[entityType] || entityType || "Entity";
  } // end entityTypeLabel function

  function renderFriendlyEntityPanel(entity) {
    const panel = createElement("article", { className: "character-panel" });
    const summary = createElement("p", { text: `${entityTypeLabel(entity.entityType)}. Current row: ${rowLabel(entity.currentRow)}. Damage: ${getNumericValue(entity.damage, 0)}. Maximum HP: ${entity.maximumHp || "unknown"}. Heat: ${getNumericValue(entity.heat, 0)}.` });
    panel.append(
      createElement("h4", { text: entity.name }),
      summary,
      createCounterControls(entity, "friendly-area"),
      createEntityActions(entity, "friendly-area")
    );
    if (entity.characterCardInstanceId) {
      panel.append(createCardDetailsButton(entity.characterCardInstanceId));
    } // end entity-card-details branch

    const equipmentList = createElement("ul", { className: "card-list" });
    renderEquipment(entity, equipmentList);
    panel.append(createElement("h5", { text: "Equipment" }), equipmentList);

    const skillList = createElement("ol", { className: "card-list" });
    if ((entity.skillSlots || []).length > 0) {
      renderSkillSlots(entity, skillList);
    } else {
      skillList.append(createEmptySlotItem("No Skill Card slots"));
    } // end skill-slot branch
    panel.append(createElement("h5", { text: "Skill Cards" }), skillList);

    const reserveList = createElement("ol", { className: "card-list" });
    if ((entity.tacticalReserveSlots || []).length > 0) {
      renderTacticalReserveSlots(entity, reserveList);
    } else {
      reserveList.append(createEmptySlotItem("No Tactical Reserve slots"));
    } // end tactical-slot branch
    panel.append(createElement("h5", { text: "Tactical Reserve" }), reserveList);

    const statusList = createElement("ol", { className: "card-list" });
    renderStatusRow(entity, statusList, `friendly-status-${sanitizeIdPart(entity.id)}`);
    panel.append(createElement("h5", { text: "Status Row" }), statusList);
    return panel;
  } // end renderFriendlyEntityPanel function

  function renderCharacterAreas() {
    clearElement(elements.characterAreas);
    const friendlyEntities = Object.values(application.runtimeState.entities).filter(isFriendlyEntity);
    if (friendlyEntities.length === 0) {
      elements.characterAreas.append(createElement("p", { text: "No player-side entities are currently on the table." }));
      return;
    } // end no-friendly-entities branch
    friendlyEntities.forEach(function renderFriendlyEntity(entity) {
      elements.characterAreas.append(renderFriendlyEntityPanel(entity));
    }); // end friendly-entity render loop
  } // end renderCharacterAreas function

  function shuffleArrayInPlace(values) {
    for (let index = values.length - 1; index > 0; index -= 1) {
      let randomValue;
      if (window.crypto && typeof window.crypto.getRandomValues === "function") {
        const randomBuffer = new Uint32Array(1);
        window.crypto.getRandomValues(randomBuffer);
        randomValue = randomBuffer[0] / 4294967296;
      } else {
        randomValue = Math.random();
      } // end secure-random selection branch
      const swapIndex = Math.floor(randomValue * (index + 1));
      const current = values[index];
      values[index] = values[swapIndex];
      values[swapIndex] = current;
    } // end shuffle loop
  } // end shuffleArrayInPlace function

  function drawDungeonCardFromZone(zoneName, position, focusControlId) {
    const state = application.runtimeState;
    if (state.zones.dungeonRevealArea.length > 0) {
      setManualControlStatus("Resolve, deploy, discard, or return the Dungeon Card already in the Dungeon Reveal Area before drawing another.", "error");
      return;
    } // end occupied-dungeon-reveal branch
    const source = state.zones[zoneName];
    if (!Array.isArray(source) || source.length === 0) {
      setManualControlStatus(`${zoneName === "dungeonDeck" ? "Dungeon Deck" : "Dungeon Discard Pile"} is empty.`, "error");
      return;
    } // end empty-dungeon-source branch
    const cardInstanceId = position === "bottom" ? source.shift() : source.pop();
    const definition = getDefinitionForInstance(cardInstanceId);
    state.zones.dungeonRevealArea.push(cardInstanceId);
    updateCardInstanceZone(cardInstanceId, "dungeonRevealArea", `drawnFrom:${zoneName}:${position}`, true);
    appendLog("dungeonCardDrawn", `Drew ${definition ? definition.name : cardInstanceId} from the ${zoneName === "dungeonDeck" ? "Dungeon Deck" : "Dungeon Discard Pile"} ${position}.`);
    rerenderAfterStateChange(`Drew ${definition ? definition.name : "a Dungeon Card"}.`, "success", focusControlId);
  } // end drawDungeonCardFromZone function

  function returnCardToDungeonDeckBottom(cardInstanceId, focusControlId) {
    const instance = getCardInstance(cardInstanceId);
    const definition = getDefinitionForInstance(cardInstanceId);
    if (!instance || !definition || !["dungeonRevealArea", "dungeonDiscardPile"].includes(instance.zone)) {
      setManualControlStatus("Only a Dungeon Card in the reveal area or Dungeon Discard Pile can be returned to the Dungeon Deck bottom.", "error");
      return;
    } // end invalid-dungeon-return branch
    removeCardFromZoneArray(instance.zone, cardInstanceId);
    application.runtimeState.zones.dungeonDeck.unshift(cardInstanceId);
    updateCardInstanceZone(cardInstanceId, "dungeonDeck", "bottom", false);
    appendLog("dungeonCardReturnedToBottom", `${definition.name} was placed on the bottom of the Dungeon Deck. No shuffle occurred.`);
    rerenderAfterStateChange(`${definition.name} was returned to the Dungeon Deck bottom.`, "success", focusControlId);
  } // end returnCardToDungeonDeckBottom function

  function shuffleZone(zoneName, label, focusControlId) {
    const zone = application.runtimeState.zones[zoneName];
    if (!Array.isArray(zone) || zone.length < 2) {
      setManualControlStatus(`${label} has fewer than two cards, so shuffling would not change its order.`, "info");
      restoreFocusAfterRender(focusControlId);
      return;
    } // end insufficient-shuffle branch
    shuffleArrayInPlace(zone);
    appendLog("zoneShuffled", `${label} was explicitly shuffled.`);
    rerenderAfterStateChange(`${label} was shuffled.`, "success", focusControlId);
  } // end shuffleZone function

  function getEnemyPreferredRow(definition) {
    return definition && definition.data && ["enemyFront", "enemyBack"].includes(definition.data.preferredRow)
      ? definition.data.preferredRow
      : "enemyFront";
  } // end getEnemyPreferredRow function

  function createEnemyEntityFromRevealedCard(cardInstanceId) {
    const definition = getDefinitionForInstance(cardInstanceId);
    const stats = definition && definition.data && definition.data.stats ? definition.data.stats : {};
    const entityId = createUniqueRuntimeId("entity", definition.id);
    application.runtimeState.entities[entityId] = {
      id: entityId,
      definitionId: definition.id,
      characterCardInstanceId: cardInstanceId,
      name: definition.name,
      entityType: definition.data && definition.data.entityType === "boss" ? "boss" : "enemy",
      currentRow: null,
      damage: 0,
      maximumHp: getNumericValue(stats.hp, 1),
      defense: getNumericValue(stats.defense, 0),
      statusRow: createNullSlotArray(STATUS_ROW_SLOT_COUNT),
      equipment: {},
      skillSlots: [],
      tacticalReserveSlots: []
    }; // end deployed-enemy entity object
    return entityId;
  } // end createEnemyEntityFromRevealedCard function

  function deployRevealedEnemy(cardInstanceId, rowKey, focusControlId) {
    const instance = getCardInstance(cardInstanceId);
    const definition = getDefinitionForInstance(cardInstanceId);
    if (!instance || !definition || definition.cardType !== "enemy" || instance.zone !== "dungeonRevealArea") {
      setManualControlStatus("Only a revealed Enemy Card can be deployed into Enemy Formation.", "error");
      return;
    } // end invalid-enemy-deployment branch
    const row = getFormationRow(rowKey);
    if (row.indexOf(null) === -1) {
      setManualControlStatus(`${rowLabel(rowKey)} is full. Use Return ${definition.name} to Dungeon Deck bottom if it cannot be deployed.`, "error");
      return;
    } // end full-enemy-row branch
    removeCardFromZoneArray("dungeonRevealArea", cardInstanceId);
    const entityId = createEnemyEntityFromRevealedCard(cardInstanceId);
    const entity = getEntity(entityId);
    try {
      const slotIndex = placeEntityInRow(entityId, rowKey);
      instance.ownerEntityId = entityId;
      appendLog("enemyDeployed", `${definition.name} was deployed to ${rowLabel(rowKey)}, slot ${slotIndex + 1}.`);
      rerenderAfterStateChange(`${definition.name} was deployed.`, "success", focusControlId);
    } catch (error) {
      delete application.runtimeState.entities[entityId];
      application.runtimeState.zones.dungeonRevealArea.push(cardInstanceId);
      updateCardInstanceZone(cardInstanceId, "dungeonRevealArea", null, true);
      setManualControlStatus(error.message, "error");
    } // end deployment try-catch
  } // end deployRevealedEnemy function

  function discardRevealedDungeonCard(cardInstanceId, focusControlId) {
    const instance = getCardInstance(cardInstanceId);
    const definition = getDefinitionForInstance(cardInstanceId);
    if (!instance || !definition || instance.zone !== "dungeonRevealArea") {
      setManualControlStatus("Only a card in the Dungeon Reveal Area can be discarded as resolved.", "error");
      return;
    } // end invalid-dungeon-discard branch
    if (definition.cardType === "enemy") {
      setManualControlStatus("An Enemy Card must be deployed or returned to the Dungeon Deck bottom, not discarded from the reveal area.", "error");
      return;
    } // end unresolved-enemy branch
    removeCardFromZoneArray("dungeonRevealArea", cardInstanceId);
    application.runtimeState.zones.dungeonDiscardPile.push(cardInstanceId);
    updateCardInstanceZone(cardInstanceId, "dungeonDiscardPile", null, true);
    appendLog("dungeonCardDiscarded", `${definition.name} was moved to the Dungeon Discard Pile after manual resolution.`);
    rerenderAfterStateChange(`${definition.name} was discarded to the Dungeon Discard Pile.`, "success", focusControlId);
  } // end discardRevealedDungeonCard function

  function discardStatusesFromDefeatedEntity(entity) {
    const discardedNames = [];
    entity.statusRow.forEach(function discardStatusOnDefeat(cardInstanceId, index) {
      if (!cardInstanceId) {
        return;
      } // end empty-status branch
      const definition = getDefinitionForInstance(cardInstanceId);
      if (definition && definition.cardType === "status") {
        entity.statusRow[index] = null;
        application.runtimeState.zones.statusDiscardPile.push(cardInstanceId);
        updateCardInstanceZone(cardInstanceId, "statusDiscardPile", null, true);
        discardedNames.push(definition.name);
      } // end negative-status-on-defeat branch
    }); // end defeat-status loop
    return discardedNames;
  } // end discardStatusesFromDefeatedEntity function

  function defeatEnemyEntity(entityId, focusControlId) {
    const entity = getEntity(entityId);
    if (!entity || !["enemy", "boss"].includes(entity.entityType)) {
      setManualControlStatus("Only an enemy or boss can be defeated with this control.", "error");
      return;
    } // end invalid-enemy-defeat branch
    const cardInstanceId = entity.characterCardInstanceId;
    const definition = getDefinitionForInstance(cardInstanceId);
    const discardedStatuses = discardStatusesFromDefeatedEntity(entity);
    removeEntityFromFormation(entityId);
    delete application.runtimeState.entities[entityId];
    application.runtimeState.zones.dungeonDiscardPile.push(cardInstanceId);
    updateCardInstanceZone(cardInstanceId, "dungeonDiscardPile", null, true);
    appendLog("enemyDefeated", `${entity.name} was manually defeated and moved to the Dungeon Discard Pile.${discardedStatuses.length ? ` Statuses discarded: ${discardedStatuses.join(", ")}.` : ""}`);
    rerenderAfterStateChange(`${definition ? definition.name : entity.name} was defeated and discarded.`, "success", focusControlId);
  } // end defeatEnemyEntity function

  function drawStatusCard() {
    const state = application.runtimeState;
    if (state.zones.statusRevealArea.length > 0) {
      setManualControlStatus("Place or discard the Status Card already in the Status Reveal Area before drawing another.", "error");
      return;
    } // end occupied-status-reveal branch
    if (state.zones.statusDeck.length === 0) {
      setManualControlStatus("The Status Deck is empty.", "error");
      return;
    } // end empty-status-deck branch
    const cardInstanceId = state.zones.statusDeck.pop();
    const definition = getDefinitionForInstance(cardInstanceId);
    state.zones.statusRevealArea.push(cardInstanceId);
    updateCardInstanceZone(cardInstanceId, "statusRevealArea", null, true);
    appendLog("statusCardDrawn", `Drew ${definition ? definition.name : cardInstanceId} from the Status Deck.`);
    rerenderAfterStateChange(`Drew ${definition ? definition.name : "a Status Card"}.`, "success", "draw-status-card-button");
  } // end drawStatusCard function

  function createDungeonRevealActions(cardInstanceId) {
    const definition = getDefinitionForInstance(cardInstanceId);
    const actions = createElement("div", { className: "zone-action-row" });
    if (!definition) {
      return actions;
    } // end missing-dungeon-reveal-definition branch
    if (definition.cardType === "enemy") {
      const preferredRow = getEnemyPreferredRow(definition);
      const preferredId = `reveal-${sanitizeIdPart(cardInstanceId)}-deploy-preferred`;
      actions.append(createButton(`Deploy ${definition.name} to preferred ${rowLabel(preferredRow)}`, preferredId, function handlePreferredDeploy() {
        deployRevealedEnemy(cardInstanceId, preferredRow, preferredId);
      }));
      ["enemyFront", "enemyBack"].filter(function filterNonPreferred(rowKey) {
        return rowKey !== preferredRow;
      }).forEach(function addAlternateDeploy(rowKey) {
        const buttonId = `reveal-${sanitizeIdPart(cardInstanceId)}-${rowKey}`;
        actions.append(createButton(`Deploy ${definition.name} to ${rowLabel(rowKey)}`, buttonId, function handleAlternateDeploy() {
          deployRevealedEnemy(cardInstanceId, rowKey, buttonId);
        }));
      }); // end alternate-deploy loop
    } else {
      const discardId = `reveal-${sanitizeIdPart(cardInstanceId)}-discard`;
      actions.append(createButton(`Discard resolved ${definition.name} to Dungeon Discard Pile`, discardId, function handleResolvedDiscard() {
        discardRevealedDungeonCard(cardInstanceId, discardId);
      }));
    } // end reveal-card-type branch
    const returnId = `reveal-${sanitizeIdPart(cardInstanceId)}-return-bottom`;
    actions.append(createButton(`Return ${definition.name} to bottom of Dungeon Deck`, returnId, function handleDungeonReturn() {
      returnCardToDungeonDeckBottom(cardInstanceId, returnId);
    }));
    return actions;
  } // end createDungeonRevealActions function

  function createStatusRevealActions(cardInstanceId) {
    const definition = getDefinitionForInstance(cardInstanceId);
    const actions = createElement("div", { className: "zone-action-row" });
    if (!definition || definition.cardType !== "status") {
      return actions;
    } // end invalid-status-reveal branch
    Object.values(application.runtimeState.entities).filter(function filterEligibleStatusTarget(entity) {
      return statusAllowsEntity(definition, entity);
    }).forEach(function addStatusTargetAction(entity) {
      const buttonId = `status-${sanitizeIdPart(cardInstanceId)}-${sanitizeIdPart(entity.id)}`;
      actions.append(createButton(`Place ${definition.name} on ${entity.name}`, buttonId, function handleStatusPlacement() {
        placeRevealedNegativeStatus(cardInstanceId, entity.id, buttonId);
      }));
    }); // end status-target loop
    const discardId = `status-${sanitizeIdPart(cardInstanceId)}-discard-revealed`;
    actions.append(createButton(`Discard revealed ${definition.name} to Status Discard Pile`, discardId, function handleRevealedStatusDiscard() {
      removeCardFromZoneArray("statusRevealArea", cardInstanceId);
      application.runtimeState.zones.statusDiscardPile.push(cardInstanceId);
      updateCardInstanceZone(cardInstanceId, "statusDiscardPile", null, true);
      appendLog("revealedStatusDiscarded", `${definition.name} was discarded from the Status Reveal Area.`);
      rerenderAfterStateChange(`${definition.name} was discarded to Status Discard Pile.`, "success", discardId);
    }));
    return actions;
  } // end createStatusRevealActions function

  function createZoneCardActions(zoneKey, cardInstanceId) {
    const actions = createElement("div", { className: "zone-action-row" });
    if (zoneKey === "dungeonRevealArea") {
      actions.append(createDungeonRevealActions(cardInstanceId));
    } // end dungeon-reveal actions branch
    if (zoneKey === "statusRevealArea") {
      actions.append(createStatusRevealActions(cardInstanceId));
    } // end status-reveal actions branch
    if (zoneKey === "dungeonDiscardPile") {
      const buttonId = `discard-${sanitizeIdPart(cardInstanceId)}-return-bottom`;
      actions.append(createButton(`Return ${formatCardLabel(cardInstanceId)} to bottom of Dungeon Deck`, buttonId, function handleDiscardReturn() {
        returnCardToDungeonDeckBottom(cardInstanceId, buttonId);
      }));
    } // end dungeon-discard actions branch
    return actions;
  } // end createZoneCardActions function

  function describeZone(label, zoneKey, hidden) {
    const cards = application.runtimeState.zones[zoneKey] || [];
    const panel = createElement("article", { className: "zone-card" });
    panel.append(
      createElement("h4", { text: label }),
      createElement("p", { text: hidden ? `${cards.length} face-down card(s).` : `${cards.length} card(s).` })
    );
    if (!hidden && cards.length > 0) {
      const list = createElement("ul", { className: "card-list" });
      cards.forEach(function renderZoneCard(cardInstanceId) {
        const item = createCardListItem(cardInstanceId);
        const actions = createZoneCardActions(zoneKey, cardInstanceId);
        if (actions.childElementCount > 0) {
          item.append(actions);
        } // end visible-zone-actions branch
        list.append(item);
      }); // end zone-card list loop
      panel.append(list);
    } // end visible-zone-card branch
    return panel;
  } // end describeZone function

  function renderZones() {
    clearElement(elements.zoneSummary);
    [
      ["Dungeon Deck", "dungeonDeck", true],
      ["Dungeon Reveal Area", "dungeonRevealArea", false],
      ["Dungeon Discard Pile", "dungeonDiscardPile", false],
      ["Dungeon Loot Area", "dungeonLootArea", false],
      ["Loot Deck", "lootDeck", true],
      ["Loot Discard Pile", "lootDiscardPile", false],
      ["Expended Summons", "expendedSummons", false],
      ["Status Deck", "statusDeck", true],
      ["Status Reveal Area", "statusRevealArea", false],
      ["Status Discard Pile", "statusDiscardPile", false],
      ["Available Supply", "unusedSupply", false]
    ].forEach(function renderZone(configuration) {
      elements.zoneSummary.append(describeZone(configuration[0], configuration[1], configuration[2]));
    }); // end zone-configuration loop
  } // end renderZones function

  function setPartyCurrency(value, focusControlId) {
    const numericValue = Number(value);
    if (!Number.isInteger(numericValue) || numericValue < 0) {
      setManualControlStatus("Party Currency must be a whole number of zero or greater.", "error");
      return;
    } // end invalid-currency branch
    const previousValue = getNumericValue(application.runtimeState.resources.currency, 0);
    application.runtimeState.resources.currency = numericValue;
    appendLog("partyCurrencyChanged", `Party Currency changed from ${previousValue} to ${numericValue}.`);
    rerenderAfterStateChange(`Party Currency is now ${numericValue}.`, "success", focusControlId);
  } // end setPartyCurrency function

  function changePartyCurrency(delta, focusControlId) {
    setPartyCurrency(Math.max(0, getNumericValue(application.runtimeState.resources.currency, 0) + delta), focusControlId);
  } // end changePartyCurrency function

  function getDefinitionStats(definition) {
    const data = definition && definition.data ? definition.data : {};
    return data.stats && typeof data.stats === "object" ? data.stats : {};
  } // end getDefinitionStats function

  function getPlayerSlotCapacity(definition) {
    const capacity = definition && definition.data && definition.data.slotCapacity ? definition.data.slotCapacity : {};
    return {
      statusRowSlots: Number.isInteger(capacity.statusRowSlots) ? capacity.statusRowSlots : STATUS_ROW_SLOT_COUNT,
      skillSlots: Number.isInteger(capacity.skillSlots) ? capacity.skillSlots : 0,
      tacticalReserveSlots: Number.isInteger(capacity.tacticalReserveSlots) ? capacity.tacticalReserveSlots : 0
    }; // end player-slot-capacity object
  } // end getPlayerSlotCapacity function

  function createEntityFromCatalog(definition, cardInstanceId, entityType, displayName, ownerInfo) {
    const stats = getDefinitionStats(definition);
    const capacity = entityType === "playerCharacter" ? getPlayerSlotCapacity(definition) : { statusRowSlots: STATUS_ROW_SLOT_COUNT, skillSlots: 0, tacticalReserveSlots: 0 };
    const entityId = createUniqueRuntimeId("entity", definition.id);
    return {
      id: entityId,
      definitionId: definition.id,
      characterCardInstanceId: cardInstanceId,
      name: displayName || definition.name,
      entityType,
      controllerParticipantId: ownerInfo.controllerParticipantId || null,
      ownerParticipantId: ownerInfo.ownerParticipantId || null,
      owningEntityId: ownerInfo.owningEntityId || null,
      currentRow: null,
      damage: 0,
      heat: isFriendlyEntity({ entityType }) ? 0 : undefined,
      maximumHp: entityType === "playerCharacter"
        ? (definition.data && definition.data.maximumHp) || 1
        : getNumericValue(stats.hp, 1),
      defense: getNumericValue(stats.defense, 0),
      statusRow: createNullSlotArray(capacity.statusRowSlots),
      equipment: {},
      skillSlots: createNullSlotArray(capacity.skillSlots),
      tacticalReserveSlots: createNullSlotArray(capacity.tacticalReserveSlots)
    }; // end new-friendly-entity object
  } // end createEntityFromCatalog function

  function createParticipant(displayName) {
    const state = application.runtimeState;
    const fallbackName = `Player ${state.participants.length + 1}`;
    const name = String(displayName || "").trim() || fallbackName;
    let candidateId = `participant.${sanitizeIdPart(name).toLowerCase()}`;
    let suffix = 2;
    while (state.participants.some(function participantIdExists(participant) {
      return participant.id === candidateId;
    })) {
      candidateId = `participant.${sanitizeIdPart(name).toLowerCase()}-${suffix}`;
      suffix += 1;
    } // end unique-participant-id loop
    const participant = { id: candidateId, name, controlledEntityIds: [], alliedEntityIds: [] };
    state.participants.push(participant);
    return participant;
  } // end createParticipant function

  function addPlayerCharacter() {
    const definition = getCardDefinition(elements.newPlayerCharacterSelect.value);
    if (!definition || definition.cardType !== "character") {
      setManualControlStatus("Select an active Character Card before adding a player character.", "error");
      return;
    } // end invalid-character-selection branch
    const selectedControllerId = elements.newPlayerControllerSelect.value;
    const participant = selectedControllerId === "__new__"
      ? createParticipant(elements.newPlayerNameInput.value)
      : application.runtimeState.participants.find(function findController(candidate) {
        return candidate.id === selectedControllerId;
      }); // end participant-selection branch
    if (!participant) {
      setManualControlStatus("Choose an existing controller or create a new player.", "error");
      return;
    } // end missing-controller branch
    try {
      const cardInstanceId = takeUnusedOrCreateCardInstance(definition.id, { zone: "playerFormation", zoneDetail: null, faceUp: true });
      const entity = createEntityFromCatalog(definition, cardInstanceId, "playerCharacter", elements.newPlayerCharacterNameInput.value.trim(), { controllerParticipantId: participant.id, ownerParticipantId: participant.id });
      application.runtimeState.entities[entity.id] = entity;
      const slotIndex = placeEntityInRow(entity.id, elements.newPlayerRowSelect.value);
      const instance = getCardInstance(cardInstanceId);
      instance.ownerEntityId = entity.id;
      appendLog("playerCharacterAdded", `${entity.name} was added for ${participant.name} in ${rowLabel(entity.currentRow)}, slot ${slotIndex + 1}.`);
      synchronizeParticipantMembership();
      rerenderAfterStateChange(`${entity.name} was added to the playtest.`, "success", "add-player-character-button");
    } catch (error) {
      setManualControlStatus(error.message, "error");
    } // end add-player try-catch
  } // end addPlayerCharacter function

  function addHireling() {
    const definition = getCardDefinition(elements.newHirelingCardSelect.value);
    if (!definition || definition.cardType !== "hireling") {
      setManualControlStatus("Select an active Hireling Card before adding an Autonomous Hireling.", "error");
      return;
    } // end invalid-hireling-selection branch
    const ownerParticipant = application.runtimeState.participants.find(function findHirelingOwner(participant) {
      return participant.id === elements.newHirelingOwnerSelect.value;
    }) || null;
    try {
      const cardInstanceId = takeUnusedOrCreateCardInstance(definition.id, { zone: "playerFormation", zoneDetail: null, faceUp: true });
      const entity = createEntityFromCatalog(definition, cardInstanceId, "autonomousAlly", elements.newHirelingNameInput.value.trim(), { controllerParticipantId: ownerParticipant ? ownerParticipant.id : null, ownerParticipantId: ownerParticipant ? ownerParticipant.id : null });
      application.runtimeState.entities[entity.id] = entity;
      const slotIndex = placeEntityInRow(entity.id, elements.newHirelingRowSelect.value);
      getCardInstance(cardInstanceId).ownerEntityId = entity.id;
      appendLog("hirelingAdded", `${entity.name} was added as an Autonomous Hireling in ${rowLabel(entity.currentRow)}, slot ${slotIndex + 1}.`);
      synchronizeParticipantMembership();
      rerenderAfterStateChange(`${entity.name} was added to the playtest.`, "success", "add-hireling-button");
    } catch (error) {
      setManualControlStatus(error.message, "error");
    } // end add-hireling try-catch
  } // end addHireling function

  function addSummon() {
    const definition = getCardDefinition(elements.newSummonCardSelect.value);
    const owner = getEntity(elements.newSummonOwnerSelect.value);
    if (!definition || !isSummonDefinition(definition) || !owner || owner.entityType !== "playerCharacter") {
      setManualControlStatus("Select an active Summon Card and an owning player character before adding a Controlled Summon.", "error");
      return;
    } // end invalid-summon-selection branch
    try {
      const cardInstanceId = takeUnusedOrCreateCardInstance(definition.id, { zone: "playerFormation", zoneDetail: null, faceUp: true });
      const entity = createEntityFromCatalog(definition, cardInstanceId, "controlledAlly", elements.newSummonNameInput.value.trim(), { controllerParticipantId: owner.controllerParticipantId, ownerParticipantId: owner.controllerParticipantId, owningEntityId: owner.id });
      application.runtimeState.entities[entity.id] = entity;
      const slotIndex = placeEntityInRow(entity.id, elements.newSummonRowSelect.value);
      getCardInstance(cardInstanceId).ownerEntityId = entity.id;
      appendLog("summonAdded", `${entity.name} was added as a Controlled Summon for ${owner.name} in ${rowLabel(entity.currentRow)}, slot ${slotIndex + 1}.`);
      synchronizeParticipantMembership();
      rerenderAfterStateChange(`${entity.name} was added to the playtest.`, "success", "add-summon-button");
    } catch (error) {
      setManualControlStatus(error.message, "error");
    } // end add-summon try-catch
  } // end addSummon function

  function parseSlotNumber(value, maximum, label) {
    const slotNumber = Number(value);
    if (!Number.isInteger(slotNumber) || slotNumber < 1 || slotNumber > maximum) {
      throw new Error(`${label} must be a whole number from 1 through ${maximum}.`);
    } // end invalid-slot-number branch
    return slotNumber - 1;
  } // end parseSlotNumber function

  function assignCardToEntity() {
    const entity = getEntity(elements.setupEntitySelect.value);
    const definition = getCardDefinition(elements.setupCardSelect.value);
    const kind = elements.setupCardKindSelect.value;
    if (!entity || entity.entityType !== "playerCharacter" || !definition || definition.cardType !== kind) {
      setManualControlStatus("Select a player character and a compatible active catalog card.", "error");
      return;
    } // end invalid-entity-card-assignment branch
    try {
      if (kind === "equipment") {
        const slotName = String(elements.setupSlotInput.value || "").trim();
        if (!slotName || entity.equipment[slotName]) {
          throw new Error("Enter an unused equipment slot name, such as weapon, armor, head, or ring.");
        } // end invalid-equipment-slot branch
        const cardInstanceId = takeUnusedOrCreateCardInstance(definition.id, { ownerEntityId: entity.id, zone: "equipmentSlot", zoneDetail: slotName, faceUp: true });
        entity.equipment[slotName] = cardInstanceId;
        appendLog("equipmentAssigned", `${definition.name} was assigned to ${entity.name}'s ${slotName} slot.`);
      } else if (kind === "skill") {
        const slotIndex = parseSlotNumber(elements.setupSlotInput.value, entity.skillSlots.length, "Skill slot");
        if (entity.skillSlots[slotIndex]) {
          throw new Error(`Skill slot ${slotIndex + 1} is already occupied.`);
        } // end occupied-skill-slot branch
        const cardInstanceId = takeUnusedOrCreateCardInstance(definition.id, { ownerEntityId: entity.id, zone: "skillSlot", zoneDetail: `skillSlot:${slotIndex + 1}`, faceUp: true });
        entity.skillSlots[slotIndex] = { skillCardInstanceId: cardInstanceId, attachedAbilityInstanceIds: [] };
        appendLog("skillAssigned", `${definition.name} was placed in ${entity.name}'s Skill slot ${slotIndex + 1}.`);
      } else if (kind === "ability") {
        const slotIndex = parseSlotNumber(elements.setupSlotInput.value, entity.skillSlots.length, "Skill slot for Ability attachment");
        const skillSlot = entity.skillSlots[slotIndex];
        if (!skillSlot) {
          throw new Error(`Skill slot ${slotIndex + 1} is empty.`);
        } // end missing-skill-for-ability branch
        const skillDefinition = getDefinitionForInstance(skillSlot.skillCardInstanceId);
        const attachmentRules = skillDefinition && skillDefinition.data ? skillDefinition.data.attachedCardRules : null;
        const capacity = attachmentRules && Number.isInteger(attachmentRules.slotCount) ? attachmentRules.slotCount : 0;
        if (skillSlot.attachedAbilityInstanceIds.length >= capacity) {
          throw new Error(`${skillDefinition ? skillDefinition.name : "This Skill Card"} has no remaining Ability Card slots.`);
        } // end full-ability-capacity branch
        if (attachmentRules && attachmentRules.requiredDiscipline && definition.data && definition.data.discipline && attachmentRules.requiredDiscipline !== definition.data.discipline) {
          throw new Error(`${definition.name} does not match the required ${attachmentRules.requiredDiscipline} discipline for ${skillDefinition.name}.`);
        } // end mismatched-ability-discipline branch
        const cardInstanceId = takeUnusedOrCreateCardInstance(definition.id, { ownerEntityId: entity.id, zone: "skillAttachment", zoneDetail: skillSlot.skillCardInstanceId, faceUp: true });
        skillSlot.attachedAbilityInstanceIds.push(cardInstanceId);
        appendLog("abilityAssigned", `${definition.name} was attached to ${skillDefinition ? skillDefinition.name : "a Skill Card"} for ${entity.name}.`);
      } else if (kind === "tacticalReserve") {
        const slotIndex = parseSlotNumber(elements.setupSlotInput.value, entity.tacticalReserveSlots.length, "Tactical Reserve slot");
        if (entity.tacticalReserveSlots[slotIndex]) {
          throw new Error(`Tactical Reserve slot ${slotIndex + 1} is already occupied.`);
        } // end occupied-reserve-slot branch
        const cardInstanceId = takeUnusedOrCreateCardInstance(definition.id, { ownerEntityId: entity.id, zone: "tacticalReserveSlot", zoneDetail: `tacticalReserveSlot:${slotIndex + 1}`, faceUp: true });
        entity.tacticalReserveSlots[slotIndex] = cardInstanceId;
        appendLog("tacticalReserveAssigned", `${definition.name} was added to ${entity.name}'s Tactical Reserve slot ${slotIndex + 1}.`);
      } // end assignment-kind branch
      rerenderAfterStateChange(`${definition.name} was added to ${entity.name}.`, "success", "assign-card-button");
    } catch (error) {
      setManualControlStatus(error.message, "error");
    } // end assign-card try-catch
  } // end assignCardToEntity function

  function populateSelect(selectElement, options, emptyLabel) {
    const previousValue = selectElement.value;
    clearElement(selectElement);
    if (emptyLabel) {
      selectElement.append(createElement("option", { text: emptyLabel, attributes: { value: "" } }));
    } // end empty-select-option branch
    options.forEach(function addSelectOption(option) {
      selectElement.append(createElement("option", { text: option.label, attributes: { value: option.value } }));
    }); // end select-option loop
    const hasPreviousValue = Array.from(selectElement.options).some(function findPreviousOption(option) {
      return option.value === previousValue;
    }); // end previous-option lookup
    if (hasPreviousValue) {
      selectElement.value = previousValue;
    } // end previous-select-value branch
  } // end populateSelect function

  function definitionOptions(predicate) {
    return getActiveDefinitions(predicate).map(function mapDefinitionOption(definition) {
      return { value: definition.id, label: `${definition.name} (${definition.id})` };
    }); // end definition-option map
  } // end definitionOptions function

  function renderEntityManagementControls() {
    const state = application.runtimeState;
    const loaded = Boolean(state && application.catalog);
    const participants = loaded ? state.participants : [];
    const playerCharacters = loaded ? Object.values(state.entities).filter(function filterPlayerCharacters(entity) {
      return entity.entityType === "playerCharacter";
    }) : [];

    populateSelect(elements.newPlayerControllerSelect, loaded ? [{ value: "__new__", label: "Create a new player" }].concat(participants.map(function mapParticipant(participant) {
      return { value: participant.id, label: participant.name || participant.id };
    })) : [], null);
    if (loaded && !elements.newPlayerControllerSelect.value) {
      elements.newPlayerControllerSelect.value = "__new__";
    } // end default-new-player-controller branch

    populateSelect(elements.newPlayerCharacterSelect, loaded ? definitionOptions(function filterCharacter(definition) {
      return definition.cardType === "character";
    }) : [], "No active Character Cards available");
    populateSelect(elements.newHirelingOwnerSelect, loaded ? [{ value: "", label: "No assigned owner" }].concat(participants.map(function mapHirelingOwner(participant) {
      return { value: participant.id, label: participant.name || participant.id };
    })) : [], "No assigned owner");
    populateSelect(elements.newHirelingCardSelect, loaded ? definitionOptions(function filterHireling(definition) {
      return definition.cardType === "hireling";
    }) : [], "No active Hireling Cards available");
    populateSelect(elements.newSummonOwnerSelect, loaded ? playerCharacters.map(function mapSummonOwner(entity) {
      return { value: entity.id, label: entity.name };
    }) : [], "No player character available");
    populateSelect(elements.newSummonCardSelect, loaded ? definitionOptions(isSummonDefinition) : [], "No active Summon Cards available");
    populateSelect(elements.setupEntitySelect, loaded ? playerCharacters.map(function mapSetupEntity(entity) {
      return { value: entity.id, label: entity.name };
    }) : [], "No player character available");

    const setupKind = elements.setupCardKindSelect.value;
    populateSelect(elements.setupCardSelect, loaded ? definitionOptions(function filterSetupCard(definition) {
      return definition.cardType === setupKind;
    }) : [], `No active ${setupKind} cards available`);

    if (setupKind === "equipment" && !elements.setupSlotInput.value) {
      elements.setupSlotInput.value = "weapon";
    } else if (setupKind !== "equipment" && !/^\d+$/.test(elements.setupSlotInput.value)) {
      elements.setupSlotInput.value = "1";
    } // end setup-slot default branch

    elements.addPlayerCharacterButton.disabled = !loaded || !elements.newPlayerCharacterSelect.value;
    elements.addHirelingButton.disabled = !loaded || !elements.newHirelingCardSelect.value;
    elements.addSummonButton.disabled = !loaded || !elements.newSummonOwnerSelect.value || !elements.newSummonCardSelect.value;
    elements.assignCardButton.disabled = !loaded || !elements.setupEntitySelect.value || !elements.setupCardSelect.value;
  } // end renderEntityManagementControls function

  function renderManualControls() {
    const state = application.runtimeState;
    const loaded = Boolean(state);
    const dungeonDeckCount = loaded ? state.zones.dungeonDeck.length : 0;
    const dungeonDiscardCount = loaded ? state.zones.dungeonDiscardPile.length : 0;
    const dungeonRevealCount = loaded ? state.zones.dungeonRevealArea.length : 0;
    const statusDeckCount = loaded ? state.zones.statusDeck.length : 0;
    const statusRevealCount = loaded ? state.zones.statusRevealArea.length : 0;
    const currency = loaded ? state.resources.currency : 0;

    elements.dungeonDrawSummary.textContent = loaded ? `Dungeon Deck: ${dungeonDeckCount} face-down card(s). Dungeon Reveal Area: ${dungeonRevealCount} card(s).` : "No state loaded.";
    elements.dungeonDiscardSummary.textContent = loaded ? `Dungeon Discard Pile: ${dungeonDiscardCount} card(s). Drawing from it uses the same Dungeon Reveal Area.` : "No state loaded.";
    elements.statusDrawSummary.textContent = loaded ? `Status Deck: ${statusDeckCount} face-down card(s). Status Reveal Area: ${statusRevealCount} card(s).` : "No state loaded.";
    elements.drawDungeonCardButton.disabled = !loaded || dungeonDeckCount === 0 || dungeonRevealCount > 0;
    elements.drawBottomDungeonCardButton.disabled = !loaded || dungeonDeckCount === 0 || dungeonRevealCount > 0;
    elements.shuffleDungeonDeckButton.disabled = !loaded || dungeonDeckCount < 2;
    elements.drawDungeonDiscardTopButton.disabled = !loaded || dungeonDiscardCount === 0 || dungeonRevealCount > 0;
    elements.drawDungeonDiscardBottomButton.disabled = !loaded || dungeonDiscardCount === 0 || dungeonRevealCount > 0;
    elements.shuffleDungeonDiscardButton.disabled = !loaded || dungeonDiscardCount < 2;
    elements.drawStatusCardButton.disabled = !loaded || statusDeckCount === 0 || statusRevealCount > 0;
    elements.shuffleStatusDeckButton.disabled = !loaded || statusDeckCount < 2;
    elements.partyCurrencyValue.textContent = String(currency);
    elements.partyCurrencyInput.value = String(currency);
    elements.partyCurrencyInput.disabled = !loaded;
    elements.decreasePartyCurrencyButton.disabled = !loaded || currency === 0;
    elements.increasePartyCurrencyButton.disabled = !loaded;
    elements.downloadStateButton.disabled = !loaded;
  } // end renderManualControls function

  function renderRuntimeSummary() {
    clearElement(elements.runtimeSummary);
    const state = application.runtimeState;
    [
      ["State version", String(state.stateVersion)],
      ["Seed", state.seed || "Not recorded"],
      ["Round", String(state.encounter.round || 1)],
      ["Phase", state.encounter.phase || "manualSetup"],
      ["Dungeon Deck", `${state.zones.dungeonDeck.length} card(s)`],
      ["Dungeon Discard", `${state.zones.dungeonDiscardPile.length} card(s)`],
      ["Party Currency", String(state.resources.currency)],
      ["Participants", String(state.participants.length)]
    ].forEach(function renderSummaryEntry(entry) {
      const wrapper = createElement("div");
      wrapper.append(createElement("dt", { text: entry[0] }), createElement("dd", { text: entry[1] }));
      elements.runtimeSummary.append(wrapper);
    }); // end summary-entry loop
  } // end renderRuntimeSummary function

  function renderLog() {
    clearElement(elements.playtestLog);
    if (application.runtimeState.log.length === 0) {
      elements.playtestLog.append(createElement("li", { text: "No logged playtest events." }));
      return;
    } // end empty-log branch
    application.runtimeState.log.forEach(function renderLogEntry(entry) {
      elements.playtestLog.append(createElement("li", { text: `Event ${entry.sequence || "?"}: ${entry.message || entry.type || "No message"}` }));
    }); // end log-entry loop
  } // end renderLog function

  function renderCardDetails() {
    clearElement(elements.cardDetails);
    if (!application.selectedCardInstanceId) {
      elements.cardDetails.append(createElement("p", { text: "Select a View details button to inspect full player-facing card text." }));
      return;
    } // end no-card-selection branch
    const instance = getCardInstance(application.selectedCardInstanceId);
    const definition = instance ? getCardDefinition(instance.definitionId) : null;
    if (!instance || !definition) {
      elements.cardDetails.append(createElement("p", { text: "The selected card instance or definition is missing." }));
      return;
    } // end missing-card-data branch
    elements.cardDetails.append(
      createElement("h4", { text: definition.name }),
      createElement("p", { text: `Definition ID: ${definition.id}. Instance ID: ${instance.id}. Type: ${definition.cardType}. Current zone: ${instance.zone}${instance.zoneDetail ? ` (${instance.zoneDetail})` : ""}.` }),
      createElement("h5", { text: "Player-facing rules text" }),
      createElement("p", { className: "card-rules", text: definition.rulesText || "No player-facing rules text is recorded." }),
      createElement("h5", { text: "Tags" }),
      createElement("p", { text: Array.isArray(definition.tags) ? definition.tags.join(", ") : "No tags recorded." })
    );
  } // end renderCardDetails function

  function renderTabletop() {
    if (!application.runtimeState) {
      return;
    } // end missing-runtime-state branch
    elements.tabletop.hidden = false;
    elements.tabletopHeading.textContent = application.runtimeState.scenarioName || application.runtimeState.scenarioId || "Loaded playtest state";
    renderManualControls();
    renderEntityManagementControls();
    renderRuntimeSummary();
    renderFormation();
    renderCharacterAreas();
    renderZones();
    renderLog();
    renderCardDetails();
  } // end renderTabletop function

  function validateRuntimeState(state) {
    const requiredKeys = ["scenarioId", "entities", "cardInstances", "zones"];
    if (!state || typeof state !== "object") {
      throw new Error("The selected file is not a runtime-state JSON object.");
    } // end invalid-state-object branch
    requiredKeys.forEach(function checkRuntimeKey(key) {
      if (!(key in state)) {
        throw new Error(`The selected runtime state is missing ${key}.`);
      } // end missing-runtime-key branch
    }); // end required-key loop
  } // end validateRuntimeState function

  function setLoadedRuntimeState(state, sourceLabel) {
    validateRuntimeState(state);
    application.runtimeState = normalizeRuntimeState(state);
    synchronizeParticipantMembership();
    application.selectedCardInstanceId = null;
    application.loadedStateLabel = sourceLabel;
    renderTabletop();
    setLoadStatus(`Loaded ${sourceLabel}.`, "success");
    setManualControlStatus("Manual controls are ready. No rule is resolved automatically.", "info");
  } // end setLoadedRuntimeState function

  async function loadCatalog() {
    try {
      const response = await fetch(CATALOG_URL, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      } // end catalog-response-status branch
      const catalog = await response.json();
      if (!catalog || !catalog.cardsById) {
        throw new Error("The catalog bundle does not contain cardsById.");
      } // end invalid-catalog branch
      application.catalog = catalog;
      elements.catalogStatus.textContent = `Card catalog loaded. ${Object.keys(catalog.cardsById).length} card definition(s) are available.`;
      elements.loadLocalStateButton.disabled = false;
      if (application.runtimeState) {
        renderTabletop();
      } // end loaded-state catalog refresh branch
    } catch (error) {
      elements.catalogStatus.textContent = `Card catalog failed to load: ${error.message}`;
      setLoadStatus("Start the project through npm start rather than opening playtest.html directly from File Explorer.", "error");
    } // end catalog-load try-catch
  } // end loadCatalog function

  async function loadRuntimeStateFromUrl(url, label) {
    if (!application.catalog) {
      setLoadStatus("The card catalog must load before a runtime state can be rendered.", "error");
      return;
    } // end missing-catalog branch
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      } // end state-response-status branch
      setLoadedRuntimeState(await response.json(), label);
    } catch (error) {
      setLoadStatus(`Could not load ${label}: ${error.message}`, "error");
    } // end local-state load try-catch
  } // end loadRuntimeStateFromUrl function

  function loadRuntimeStateFromFile(file) {
    if (!file || !application.catalog) {
      return;
    } // end missing-file-or-catalog branch
    const reader = new FileReader();
    reader.addEventListener("load", function handleStateFileLoad() {
      try {
        setLoadedRuntimeState(JSON.parse(String(reader.result)), file.name);
      } catch (error) {
        setLoadStatus(`Could not read ${file.name}: ${error.message}`, "error");
      } // end file-read try-catch
    }); // end file-load listener
    reader.addEventListener("error", function handleFileReadError() {
      setLoadStatus(`Could not read ${file.name}.`, "error");
    }); // end file-error listener
    reader.readAsText(file);
  } // end loadRuntimeStateFromFile function

  function downloadCurrentState() {
    if (!application.runtimeState) {
      setManualControlStatus("Load a runtime state before downloading it.", "error");
      return;
    } // end missing-download-state branch
    const fileName = `${sanitizeIdPart(application.runtimeState.scenarioId || "playtest-state")}.playtest.json`;
    appendLog("stateDownloaded", `Downloaded the current runtime state as ${fileName}.`);
    const blob = new Blob([`${JSON.stringify(application.runtimeState, null, 2)}\n`], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = createElement("a", { attributes: { href: url, download: fileName } });
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    renderLog();
    setManualControlStatus(`Downloaded ${fileName}.`, "success");
  } // end downloadCurrentState function

  function bindEvents() {
    elements.loadLocalStateButton.disabled = true;
    elements.loadLocalStateButton.addEventListener("click", function handleLocalStateLoad() {
      loadRuntimeStateFromUrl(DEFAULT_STATE_URL, "the local initial state");
    }); // end local-state listener
    elements.stateFileInput.addEventListener("change", function handleStateFileSelection(event) {
      loadRuntimeStateFromFile(event.target.files && event.target.files[0]);
    }); // end state-file listener
    elements.drawDungeonCardButton.addEventListener("click", function handleDungeonTopDraw() {
      drawDungeonCardFromZone("dungeonDeck", "top", "draw-dungeon-card-button");
    }); // end dungeon-top listener
    elements.drawBottomDungeonCardButton.addEventListener("click", function handleDungeonBottomDraw() {
      drawDungeonCardFromZone("dungeonDeck", "bottom", "draw-bottom-dungeon-card-button");
    }); // end dungeon-bottom listener
    elements.shuffleDungeonDeckButton.addEventListener("click", function handleDungeonShuffle() {
      shuffleZone("dungeonDeck", "Dungeon Deck", "shuffle-dungeon-deck-button");
    }); // end dungeon-shuffle listener
    elements.drawDungeonDiscardTopButton.addEventListener("click", function handleDiscardTopDraw() {
      drawDungeonCardFromZone("dungeonDiscardPile", "top", "draw-dungeon-discard-top-button");
    }); // end discard-top listener
    elements.drawDungeonDiscardBottomButton.addEventListener("click", function handleDiscardBottomDraw() {
      drawDungeonCardFromZone("dungeonDiscardPile", "bottom", "draw-dungeon-discard-bottom-button");
    }); // end discard-bottom listener
    elements.shuffleDungeonDiscardButton.addEventListener("click", function handleDiscardShuffle() {
      shuffleZone("dungeonDiscardPile", "Dungeon Discard Pile", "shuffle-dungeon-discard-button");
    }); // end discard-shuffle listener
    elements.drawStatusCardButton.addEventListener("click", drawStatusCard);
    elements.shuffleStatusDeckButton.addEventListener("click", function handleStatusShuffle() {
      shuffleZone("statusDeck", "Status Deck", "shuffle-status-deck-button");
    }); // end status-shuffle listener
    elements.decreasePartyCurrencyButton.addEventListener("click", function handleCurrencyDecrease() {
      changePartyCurrency(-1, "decrease-party-currency-button");
    }); // end currency-decrease listener
    elements.increasePartyCurrencyButton.addEventListener("click", function handleCurrencyIncrease() {
      changePartyCurrency(1, "increase-party-currency-button");
    }); // end currency-increase listener
    elements.partyCurrencyInput.addEventListener("change", function handleCurrencyInput() {
      setPartyCurrency(elements.partyCurrencyInput.value, "party-currency-input");
    }); // end currency-input listener
    elements.downloadStateButton.addEventListener("click", downloadCurrentState);
    elements.addPlayerCharacterButton.addEventListener("click", addPlayerCharacter);
    elements.addHirelingButton.addEventListener("click", addHireling);
    elements.addSummonButton.addEventListener("click", addSummon);
    elements.assignCardButton.addEventListener("click", assignCardToEntity);
    elements.setupCardKindSelect.addEventListener("change", function handleSetupKindChange() {
      if (elements.setupCardKindSelect.value === "equipment") {
        elements.setupSlotInput.value = "weapon";
      } else {
        elements.setupSlotInput.value = "1";
      } // end setup-slot-default branch
      if (application.runtimeState) {
        renderEntityManagementControls();
      } // end loaded-state setup refresh branch
    }); // end setup-kind listener
    [
  elements.newPlayerControllerSelect,
  elements.newPlayerCharacterSelect,
  elements.newHirelingOwnerSelect,
  elements.newHirelingCardSelect,
  elements.newSummonOwnerSelect,
  elements.newSummonCardSelect,
  elements.setupEntitySelect,
  elements.setupCardSelect
].forEach(function bindEntityManagementRefresh(selectElement) {
  selectElement.addEventListener("change", function handleEntityManagementSelectionChange() {
    if (application.runtimeState) {
      renderEntityManagementControls();
    } // end loaded-runtime-state condition
  }); // end entity-management selection-change listener
}); // end entity-management refresh listener loop
  } // end bindEvents function

  bindEvents();
  renderManualControls();
  renderEntityManagementControls();
  loadCatalog();
}()); // end initializePlaytestTabletop IIFE
