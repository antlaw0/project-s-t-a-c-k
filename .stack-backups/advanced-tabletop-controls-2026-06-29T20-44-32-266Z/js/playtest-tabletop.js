(function initializePlaytestTabletop() {
  "use strict";

  const CATALOG_URL = "./generated/card-catalog.json";
  const DEFAULT_STATE_URL = "./playtest-saves/scenario.solo-warrior-goblin-warrens-smoke-test.initial.json";
  const FRIENDLY_ENTITY_TYPES = new Set([
    "playerCharacter",
    "controlledAlly",
    "autonomousAlly"
  ]); // end friendly-entity-types set
  const DEFAULT_STATUS_ROW_SLOT_COUNT = 5;

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
    drawDungeonCardButton: document.getElementById("draw-dungeon-card-button"),
    dungeonDrawSummary: document.getElementById("dungeon-draw-summary"),
    drawStatusCardButton: document.getElementById("draw-status-card-button"),
    statusDrawSummary: document.getElementById("status-draw-summary"),
    partyCurrencyValue: document.getElementById("party-currency-value"),
    decreasePartyCurrencyButton: document.getElementById("decrease-party-currency-button"),
    increasePartyCurrencyButton: document.getElementById("increase-party-currency-button"),
    partyCurrencyInput: document.getElementById("party-currency-input"),
    downloadStateButton: document.getElementById("download-state-button"),
    manualControlStatus: document.getElementById("manual-control-status"),
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
      element.removeChild(element.firstChild);
    } // end child-removal loop
  } // end clearElement function

  function sanitizeIdPart(value) {
    return String(value).replace(/[^a-zA-Z0-9_-]+/g, "-");
  } // end sanitizeIdPart function

  function getCardDefinition(definitionId) {
    const cardsById = application.catalog && application.catalog.cardsById;
    return cardsById ? cardsById[definitionId] || null : null;
  } // end getCardDefinition function

  function getCardInstance(cardInstanceId) {
    const instances = application.runtimeState && application.runtimeState.cardInstances;
    return instances ? instances[cardInstanceId] || null : null;
  } // end getCardInstance function

  function getEntity(entityId) {
    const entities = application.runtimeState && application.runtimeState.entities;
    return entities ? entities[entityId] || null : null;
  } // end getEntity function

  function getDefinitionForInstance(cardInstanceId) {
    const instance = getCardInstance(cardInstanceId);
    return instance ? getCardDefinition(instance.definitionId) : null;
  } // end getDefinitionForInstance function

  function isFriendlyEntity(entity) {
    return Boolean(entity && FRIENDLY_ENTITY_TYPES.has(entity.entityType));
  } // end isFriendlyEntity function

  function getNumericValue(value, fallbackValue) {
    return Number.isInteger(value) && value >= 0 ? value : fallbackValue;
  } // end getNumericValue function

  function normalizeStatusRow(statusRow) {
    const source = Array.isArray(statusRow) ? statusRow.slice(0, DEFAULT_STATUS_ROW_SLOT_COUNT) : [];
    const normalized = source.map(function normalizeStatusSlot(cardInstanceId) {
      return typeof cardInstanceId === "string" ? cardInstanceId : null;
    }); // end status-row-slot normalization

    while (normalized.length < DEFAULT_STATUS_ROW_SLOT_COUNT) {
      normalized.push(null);
    } // end status-row padding loop

    return normalized;
  } // end normalizeStatusRow function

  function normalizeRuntimeState(state) {
    state.log = Array.isArray(state.log) ? state.log : [];
    state.entities = state.entities && typeof state.entities === "object" ? state.entities : {};
    state.cardInstances = state.cardInstances && typeof state.cardInstances === "object" ? state.cardInstances : {};
    state.zones = state.zones && typeof state.zones === "object" ? state.zones : {};
    state.resources = state.resources && typeof state.resources === "object" ? state.resources : {};

    const requiredArrayZones = [
      "dungeonDeck",
      "dungeonRevealArea",
      "dungeonDiscardPile",
      "dungeonLootArea",
      "lootDeck",
      "lootDiscardPile",
      "expendedSummons",
      "statusDeck",
      "statusRevealArea",
      "statusDiscardPile"
    ]; // end required-array-zones array

    requiredArrayZones.forEach(function normalizeZoneArray(zoneName) {
      if (!Array.isArray(state.zones[zoneName])) {
        state.zones[zoneName] = [];
      } // end missing-zone-array branch
    }); // end required-array-zones loop

    state.zones.playerFormation = state.zones.playerFormation || {};
    state.zones.enemyFormation = state.zones.enemyFormation || {};
    state.zones.playerFormation.frontRow = Array.isArray(state.zones.playerFormation.frontRow)
      ? state.zones.playerFormation.frontRow
      : [null, null, null, null];
    state.zones.playerFormation.backRow = Array.isArray(state.zones.playerFormation.backRow)
      ? state.zones.playerFormation.backRow
      : [null, null, null, null];
    state.zones.enemyFormation.frontRow = Array.isArray(state.zones.enemyFormation.frontRow)
      ? state.zones.enemyFormation.frontRow
      : [null, null, null, null];
    state.zones.enemyFormation.backRow = Array.isArray(state.zones.enemyFormation.backRow)
      ? state.zones.enemyFormation.backRow
      : [null, null, null, null];

    state.resources.currency = getNumericValue(state.resources.currency, 0);

    Object.values(state.entities).forEach(function normalizeEntity(entity) {
      entity.damage = getNumericValue(entity.damage, 0);
      entity.statusRow = normalizeStatusRow(entity.statusRow);
      if (isFriendlyEntity(entity)) {
        entity.heat = getNumericValue(entity.heat, 0);
      } // end friendly-entity branch
    }); // end entity-normalization loop

    return state;
  } // end normalizeRuntimeState function

  function formatCardLabel(cardInstanceId) {
    const cardInstance = getCardInstance(cardInstanceId);
    if (!cardInstance) {
      return "Missing card instance";
    } // end missing-card-instance branch

    const definition = getCardDefinition(cardInstance.definitionId);
    return definition ? definition.name : `Unknown card definition: ${cardInstance.definitionId}`;
  } // end formatCardLabel function

  function appendLog(type, message) {
    const logEntries = application.runtimeState.log;
    const greatestSequence = logEntries.reduce(function getGreatestSequence(currentGreatest, entry) {
      return Math.max(currentGreatest, Number.isInteger(entry.sequence) ? entry.sequence : 0);
    }, 0);

    logEntries.push({
      sequence: greatestSequence + 1,
      type,
      message
    }); // end log-entry object
  } // end appendLog function

  function updateCardInstanceZone(cardInstanceId, zone, zoneDetail, faceUp) {
    const instance = getCardInstance(cardInstanceId);
    if (!instance) {
      throw new Error(`Could not update missing card instance ${cardInstanceId}.`);
    } // end missing-card-instance validation

    instance.zone = zone;
    instance.zoneDetail = zoneDetail || null;
    if (typeof faceUp === "boolean") {
      instance.faceUp = faceUp;
    } // end face-up branch
  } // end updateCardInstanceZone function

  function removeCardFromZoneArray(zoneName, cardInstanceId) {
    const zone = application.runtimeState.zones[zoneName];
    if (!Array.isArray(zone)) {
      return false;
    } // end missing-zone-array branch

    const position = zone.indexOf(cardInstanceId);
    if (position === -1) {
      return false;
    } // end card-not-in-zone branch

    zone.splice(position, 1);
    return true;
  } // end removeCardFromZoneArray function

  function createCardDetailsButton(cardInstanceId) {
    const button = createElement("button", {
      text: `View details: ${formatCardLabel(cardInstanceId)}`,
      attributes: {
        type: "button"
      }
    }); // end card-details button

    button.addEventListener("click", function handleCardDetailsClick() {
      application.selectedCardInstanceId = cardInstanceId;
      renderCardDetails();
      elements.cardDetails.focus();
    }); // end card-details click listener

    return button;
  } // end createCardDetailsButton function

  function getCounterControlId(prefix, entityId, counterName, actionName) {
    return `${prefix}-${sanitizeIdPart(entityId)}-${counterName}-${actionName}`;
  } // end getCounterControlId function

  function createCounterButton(label, buttonId, handler) {
    const button = createElement("button", {
      id: buttonId,
      text: label,
      attributes: {
        type: "button"
      }
    }); // end counter button
    button.addEventListener("click", handler);
    return button;
  } // end createCounterButton function

  function restoreFocusAfterRender(controlId) {
    if (!controlId) {
      return;
    } // end no-control-id branch

    window.requestAnimationFrame(function restoreControlFocus() {
      const target = document.getElementById(controlId);
      if (target) {
        target.focus();
      } // end focus-target branch
    }); // end animation-frame callback
  } // end restoreFocusAfterRender function

  function rerenderAfterStateChange(message, statusType, focusControlId) {
    renderTabletop();
    setManualControlStatus(message, statusType || "success");
    restoreFocusAfterRender(focusControlId);
  } // end rerenderAfterStateChange function

  function setEntityCounter(entityId, counterName, requestedValue, focusControlId) {
    const entity = getEntity(entityId);
    const newValue = Number(requestedValue);

    if (!entity || !Number.isInteger(newValue) || newValue < 0) {
      setManualControlStatus("Counter values must be whole numbers of zero or greater.", "error");
      restoreFocusAfterRender(focusControlId);
      return;
    } // end invalid-counter-value branch

    if (counterName === "heat" && !isFriendlyEntity(entity)) {
      setManualControlStatus(`${entity.name} cannot use a Heat counter because it is not a player-side entity.`, "error");
      restoreFocusAfterRender(focusControlId);
      return;
    } // end unsupported-heat branch

    const previousValue = getNumericValue(entity[counterName], 0);
    entity[counterName] = newValue;
    const counterLabel = counterName === "damage" ? "Damage" : "Heat";
    appendLog(
      "counterChanged",
      `${entity.name} ${counterLabel} changed from ${previousValue} to ${newValue}.`
    );
    rerenderAfterStateChange(`${entity.name} ${counterLabel} is now ${newValue}.`, "success", focusControlId);
  } // end setEntityCounter function

  function changeEntityCounter(entityId, counterName, delta, focusControlId) {
    const entity = getEntity(entityId);
    if (!entity) {
      setManualControlStatus("The selected entity no longer exists in this runtime state.", "error");
      return;
    } // end missing-entity branch

    const currentValue = getNumericValue(entity[counterName], 0);
    setEntityCounter(entityId, counterName, Math.max(0, currentValue + delta), focusControlId);
  } // end changeEntityCounter function

  function createEntityCounterControls(entity, prefix) {
    const wrapper = createElement("section", {
      className: "counter-controls",
      attributes: {
        "aria-label": `Counters for ${entity.name}`
      }
    }); // end counter-controls wrapper
    const heading = createElement("h6", { text: "Counters" });
    const damageInputId = getCounterControlId(prefix, entity.id, "damage", "input");
    const decreaseDamageButtonId = getCounterControlId(prefix, entity.id, "damage", "decrease");
    const increaseDamageButtonId = getCounterControlId(prefix, entity.id, "damage", "increase");
    const damageField = createElement("div", { className: "counter-field" });
    const damageOutput = createElement("output", {
      text: `Damage: ${getNumericValue(entity.damage, 0)} of ${entity.maximumHp || "unknown"} maximum HP.`
    }); // end damage output
    const damageButtons = createElement("div", { className: "counter-button-row" });
    const decreaseDamageButton = createCounterButton(
      `Decrease Damage for ${entity.name}`,
      decreaseDamageButtonId,
      function handleDecreaseDamage() {
        changeEntityCounter(entity.id, "damage", -1, decreaseDamageButtonId);
      }
    ); // end decrease-damage button
    const increaseDamageButton = createCounterButton(
      `Increase Damage for ${entity.name}`,
      increaseDamageButtonId,
      function handleIncreaseDamage() {
        changeEntityCounter(entity.id, "damage", 1, increaseDamageButtonId);
      }
    ); // end increase-damage button
    const damageInputLabel = createElement("label", {
      text: `Set Damage for ${entity.name}`,
      attributes: {
        for: damageInputId
      }
    }); // end damage-input label
    const damageInput = createElement("input", {
      id: damageInputId,
      attributes: {
        type: "number",
        min: "0",
        step: "1",
        value: String(getNumericValue(entity.damage, 0))
      }
    }); // end damage input

    damageInput.addEventListener("change", function handleDamageInputChange() {
      setEntityCounter(entity.id, "damage", damageInput.value, damageInputId);
    }); // end damage-input change listener

    damageButtons.append(decreaseDamageButton, increaseDamageButton);
    damageField.append(damageOutput, damageButtons, damageInputLabel, damageInput);
    wrapper.append(heading, damageField);

    if (isFriendlyEntity(entity)) {
      const heatInputId = getCounterControlId(prefix, entity.id, "heat", "input");
      const decreaseHeatButtonId = getCounterControlId(prefix, entity.id, "heat", "decrease");
      const increaseHeatButtonId = getCounterControlId(prefix, entity.id, "heat", "increase");
      const heatField = createElement("div", { className: "counter-field" });
      const heatOutput = createElement("output", {
        text: `Heat: ${getNumericValue(entity.heat, 0)}.`
      }); // end heat output
      const heatButtons = createElement("div", { className: "counter-button-row" });
      const decreaseHeatButton = createCounterButton(
        `Decrease Heat for ${entity.name}`,
        decreaseHeatButtonId,
        function handleDecreaseHeat() {
          changeEntityCounter(entity.id, "heat", -1, decreaseHeatButtonId);
        }
      ); // end decrease-heat button
      const increaseHeatButton = createCounterButton(
        `Increase Heat for ${entity.name}`,
        increaseHeatButtonId,
        function handleIncreaseHeat() {
          changeEntityCounter(entity.id, "heat", 1, increaseHeatButtonId);
        }
      ); // end increase-heat button
      const heatInputLabel = createElement("label", {
        text: `Set Heat for ${entity.name}`,
        attributes: {
          for: heatInputId
        }
      }); // end heat-input label
      const heatInput = createElement("input", {
        id: heatInputId,
        attributes: {
          type: "number",
          min: "0",
          step: "1",
          value: String(getNumericValue(entity.heat, 0))
        }
      }); // end heat input

      heatInput.addEventListener("change", function handleHeatInputChange() {
        setEntityCounter(entity.id, "heat", heatInput.value, heatInputId);
      }); // end heat-input change listener

      heatButtons.append(decreaseHeatButton, increaseHeatButton);
      heatField.append(heatOutput, heatButtons, heatInputLabel, heatInput);
      wrapper.append(heatField);
    } // end friendly-heat-controls branch

    return wrapper;
  } // end createEntityCounterControls function

  function createFormationEntityItem(entity, slotLabel, rowLabel, slotIndex) {
    const item = createElement("li", { className: "entity-card" });
    const name = createElement("strong", { text: `${slotLabel}: ${entity.name}` });
    const summaryParts = [
      `Damage ${getNumericValue(entity.damage, 0)} of ${entity.maximumHp || "unknown"} maximum HP.`
    ]; // end entity-summary-parts array

    if (isFriendlyEntity(entity)) {
      summaryParts.push(`Heat ${getNumericValue(entity.heat, 0)}.`);
    } // end friendly-entity-summary branch

    if (Number.isInteger(entity.defense)) {
      summaryParts.push(`Defense ${entity.defense}.`);
    } // end defense-summary branch

    const details = createElement("span", {
      className: "card-meta",
      text: summaryParts.join(" ")
    }); // end entity details
    const actions = createElement("div", { className: "entity-actions" });

    if (entity.characterCardInstanceId) {
      actions.append(createCardDetailsButton(entity.characterCardInstanceId));
    } // end card-detail-action branch

    if (entity.entityType === "enemy") {
      const defeatButtonId = `formation-${sanitizeIdPart(entity.id)}-defeat`;
      const defeatButton = createCounterButton(
        `Defeat and discard ${entity.name}`,
        defeatButtonId,
        function handleEnemyDefeat() {
          defeatEnemyEntity(entity.id, defeatButtonId);
        }
      ); // end enemy-defeat button
      actions.append(defeatButton);
    } // end enemy-defeat-action branch

    item.append(name, details, createEntityCounterControls(entity, `formation-${rowLabel}-${slotIndex + 1}`), actions);

    if (entity.entityType === "enemy" || entity.entityType === "boss") {
      const statusHeading = createElement("h6", { text: "Status Row" });
      const statusList = createElement("ol", { className: "card-list" });
      renderStatusRow(entity, statusList, `formation-status-${rowLabel}-${slotIndex + 1}`);
      item.append(statusHeading, statusList);
    } // end enemy-status-row branch

    return item;
  } // end createFormationEntityItem function

  function renderFormationRow(title, entityIds, rowLabel) {
    const panel = createElement("section", {
      className: "formation-row",
      attributes: {
        "aria-label": title
      }
    }); // end formation-row panel
    const heading = createElement("h4", { text: title });
    const list = createElement("ol", {
      className: "slot-list",
      attributes: {
        "aria-label": `${title} slots`
      }
    }); // end formation-row list

    entityIds.forEach(function renderFormationSlot(entityId, index) {
      const slotLabel = `Slot ${index + 1}`;
      if (!entityId) {
        list.append(createEmptySlotItem(slotLabel));
        return;
      } // end empty-formation-slot branch

      const entity = getEntity(entityId);
      if (!entity) {
        list.append(createElement("li", {
          className: "empty-slot",
          text: `${slotLabel}: missing entity ${entityId}`
        })); // end missing-entity list item
        return;
      } // end missing-entity branch

      list.append(createFormationEntityItem(entity, slotLabel, rowLabel, index));
    }); // end formation-slot loop

    panel.append(heading, list);
    return panel;
  } // end renderFormationRow function

  function renderFormation() {
    clearElement(elements.formationGrid);
    const formation = application.runtimeState.zones.playerFormation;
    const enemyFormation = application.runtimeState.zones.enemyFormation;

    elements.formationGrid.append(
      renderFormationRow("Player Front Row", formation.frontRow, "playerFront"),
      renderFormationRow("Player Back Row", formation.backRow, "playerBack"),
      renderFormationRow("Enemy Front Row", enemyFormation.frontRow, "enemyFront"),
      renderFormationRow("Enemy Back Row", enemyFormation.backRow, "enemyBack")
    );
  } // end renderFormation function

  function createEmptySlotItem(slotLabel) {
    const item = createElement("li", {
      className: "empty-slot",
      text: `${slotLabel}: empty`
    }); // end empty-slot item
    return item;
  } // end createEmptySlotItem function

  function createCardListItem(cardInstanceId, slotLabel) {
    const item = createElement("li");
    const label = createElement("strong", {
      text: slotLabel ? `${slotLabel}: ${formatCardLabel(cardInstanceId)}` : formatCardLabel(cardInstanceId)
    }); // end card-list label
    const instance = getCardInstance(cardInstanceId);
    const detail = createElement("span", {
      className: "card-meta",
      text: instance ? `Instance: ${instance.id}` : "Instance information unavailable"
    }); // end card-list detail
    const actions = createElement("div", { className: "card-actions" });

    actions.append(createCardDetailsButton(cardInstanceId));
    item.append(label, detail, actions);
    return item;
  } // end createCardListItem function

  function renderEquipment(entity, list) {
    const equipmentEntries = Object.entries(entity.equipment || {});
    if (equipmentEntries.length === 0) {
      list.append(createEmptySlotItem("No equipment"));
      return;
    } // end empty-equipment branch

    for (const [slotName, cardInstanceId] of equipmentEntries) {
      list.append(createCardListItem(cardInstanceId, `Equipment: ${slotName}`));
    } // end equipment-entry loop
  } // end renderEquipment function

  function getStatusRowSlotIndex(entity, cardInstanceId) {
    return Array.isArray(entity.statusRow) ? entity.statusRow.indexOf(cardInstanceId) : -1;
  } // end getStatusRowSlotIndex function

  function getFirstOpenStatusRowSlotIndex(entity) {
    entity.statusRow = normalizeStatusRow(entity.statusRow);
    return entity.statusRow.indexOf(null);
  } // end getFirstOpenStatusRowSlotIndex function

  function findSkillSlotContainingAttachedCard(entity, cardInstanceId) {
    const skillSlots = Array.isArray(entity.skillSlots) ? entity.skillSlots : [];

    for (const skillSlot of skillSlots) {
      if (!skillSlot || !Array.isArray(skillSlot.attachedAbilityInstanceIds)) {
        continue;
      } // end invalid-skill-slot branch

      if (skillSlot.attachedAbilityInstanceIds.includes(cardInstanceId)) {
        return skillSlot;
      } // end attached-card-match branch
    } // end skill-slot lookup loop

    return null;
  } // end findSkillSlotContainingAttachedCard function

  function definitionMovesToOwnerStatusRow(definition) {
    return Boolean(
      definition &&
      definition.data &&
      definition.data.activation &&
      definition.data.activation.moveTo === "ownerStatusRow"
    );
  } // end definitionMovesToOwnerStatusRow function

  function moveSkillAttachmentToOwnerStatusRow(entityId, cardInstanceId, focusControlId) {
    const entity = getEntity(entityId);
    const instance = getCardInstance(cardInstanceId);
    const definition = getDefinitionForInstance(cardInstanceId);

    if (!entity || !instance || !definition) {
      setManualControlStatus("The selected card, owner, or card definition could not be found.", "error");
      restoreFocusAfterRender(focusControlId);
      return;
    } // end missing-move-source branch

    if (!definitionMovesToOwnerStatusRow(definition)) {
      setManualControlStatus(`${definition.name} does not declare an owner Status Row destination in its catalog data.`, "error");
      restoreFocusAfterRender(focusControlId);
      return;
    } // end unsupported-status-move branch

    if (instance.ownerEntityId !== entity.id || instance.zone !== "skillAttachment") {
      setManualControlStatus(`${definition.name} is not currently attached to ${entity.name}'s Skill Card.`, "error");
      restoreFocusAfterRender(focusControlId);
      return;
    } // end invalid-attachment-source branch

    const skillSlot = findSkillSlotContainingAttachedCard(entity, cardInstanceId);
    if (!skillSlot) {
      setManualControlStatus(`${definition.name} could not be found in ${entity.name}'s attached Ability Cards.`, "error");
      restoreFocusAfterRender(focusControlId);
      return;
    } // end missing-skill-attachment branch

    const statusSlotIndex = getFirstOpenStatusRowSlotIndex(entity);
    if (statusSlotIndex === -1) {
      setManualControlStatus(`${entity.name}'s Status Row has no open space.`, "error");
      restoreFocusAfterRender(focusControlId);
      return;
    } // end full-status-row branch

    const attachmentIndex = skillSlot.attachedAbilityInstanceIds.indexOf(cardInstanceId);
    skillSlot.attachedAbilityInstanceIds.splice(attachmentIndex, 1);
    entity.statusRow[statusSlotIndex] = cardInstanceId;
    instance.statusReturn = {
      type: "skillAttachment",
      skillCardInstanceId: skillSlot.skillCardInstanceId,
      ownerEntityId: entity.id
    }; // end status-return object
    updateCardInstanceZone(cardInstanceId, "statusRow", `${entity.id}:slot${statusSlotIndex + 1}`, true);
    appendLog("statusActivated", `${definition.name} moved from its equipped Skill Card to ${entity.name}'s Status Row, slot ${statusSlotIndex + 1}. Resolve its activation cost and rules text manually.`);
    rerenderAfterStateChange(`${definition.name} is now in ${entity.name}'s Status Row.`, "success", focusControlId);
  } // end moveSkillAttachmentToOwnerStatusRow function

  function returnStatusCardToSkillAttachment(entityId, cardInstanceId, focusControlId) {
    const entity = getEntity(entityId);
    const instance = getCardInstance(cardInstanceId);
    const definition = getDefinitionForInstance(cardInstanceId);
    const returnTarget = instance && instance.statusReturn;

    if (!entity || !instance || !definition || !returnTarget || returnTarget.type !== "skillAttachment") {
      setManualControlStatus("This status card does not have an equipped Skill Card return destination.", "error");
      restoreFocusAfterRender(focusControlId);
      return;
    } // end invalid-status-return branch

    if (returnTarget.ownerEntityId !== entity.id || getStatusRowSlotIndex(entity, cardInstanceId) === -1) {
      setManualControlStatus(`${definition.name} is not in ${entity.name}'s Status Row.`, "error");
      restoreFocusAfterRender(focusControlId);
      return;
    } // end invalid-status-row-source branch

    const skillSlot = (entity.skillSlots || []).find(function findReturnSkillSlot(candidateSlot) {
      return candidateSlot && candidateSlot.skillCardInstanceId === returnTarget.skillCardInstanceId;
    }); // end return-skill-slot lookup

    if (!skillSlot) {
      setManualControlStatus(`The original Skill Card for ${definition.name} is no longer equipped by ${entity.name}.`, "error");
      restoreFocusAfterRender(focusControlId);
      return;
    } // end missing-return-skill-slot branch

    const statusSlotIndex = getStatusRowSlotIndex(entity, cardInstanceId);
    entity.statusRow[statusSlotIndex] = null;
    if (!Array.isArray(skillSlot.attachedAbilityInstanceIds)) {
      skillSlot.attachedAbilityInstanceIds = [];
    } // end attached-ability-array initialization
    skillSlot.attachedAbilityInstanceIds.push(cardInstanceId);
    updateCardInstanceZone(cardInstanceId, "skillAttachment", skillSlot.skillCardInstanceId, true);
    delete instance.statusReturn;
    appendLog("statusReturned", `${definition.name} returned from ${entity.name}'s Status Row to its original equipped Skill Card.`);
    rerenderAfterStateChange(`${definition.name} returned to its equipped Skill Card.`, "success", focusControlId);
  } // end returnStatusCardToSkillAttachment function

  function definitionAllowsEntity(definition, entity) {
    const permittedTypes = definition && definition.data && Array.isArray(definition.data.canAffect)
      ? definition.data.canAffect
      : [];
    return permittedTypes.length === 0 || permittedTypes.includes(entity.entityType);
  } // end definitionAllowsEntity function

  function statusAllowsStacking(definition) {
    return Boolean(definition && definition.data && definition.data.stacking && definition.data.stacking.allowed === true);
  } // end statusAllowsStacking function

  function entityAlreadyHasStatusDefinition(entity, definitionId) {
    return (entity.statusRow || []).some(function checkStatusSlot(cardInstanceId) {
      const instance = cardInstanceId ? getCardInstance(cardInstanceId) : null;
      return Boolean(instance && instance.definitionId === definitionId);
    }); // end status-row scan
  } // end entityAlreadyHasStatusDefinition function

  function placeRevealedNegativeStatus(cardInstanceId, targetEntityId, focusControlId) {
    const instance = getCardInstance(cardInstanceId);
    const definition = getDefinitionForInstance(cardInstanceId);
    const targetEntity = getEntity(targetEntityId);

    if (!instance || !definition || !targetEntity) {
      setManualControlStatus("The status card or chosen target entity could not be found.", "error");
      restoreFocusAfterRender(focusControlId);
      return;
    } // end missing-status-placement-data branch

    if (instance.zone !== "statusRevealArea") {
      setManualControlStatus(`${definition.name} is not currently waiting in the Status Reveal Area.`, "error");
      restoreFocusAfterRender(focusControlId);
      return;
    } // end invalid-status-reveal-zone branch

    if (definition.cardType !== "status" || !definition.data || definition.data.statusCategory !== "negative") {
      setManualControlStatus("Only a revealed negative Status Card can be placed from the Status Deck.", "error");
      restoreFocusAfterRender(focusControlId);
      return;
    } // end invalid-negative-status branch

    if (!definitionAllowsEntity(definition, targetEntity)) {
      setManualControlStatus(`${definition.name} cannot affect ${targetEntity.name} according to its catalog data.`, "error");
      restoreFocusAfterRender(focusControlId);
      return;
    } // end unsupported-status-target branch

    if (!statusAllowsStacking(definition) && entityAlreadyHasStatusDefinition(targetEntity, definition.id)) {
      setManualControlStatus(`${targetEntity.name} already has ${definition.name}. This status does not stack.`, "error");
      restoreFocusAfterRender(focusControlId);
      return;
    } // end nonstacking-status branch

    const statusSlotIndex = getFirstOpenStatusRowSlotIndex(targetEntity);
    if (statusSlotIndex === -1) {
      setManualControlStatus(`${targetEntity.name}'s Status Row has no open space.`, "error");
      restoreFocusAfterRender(focusControlId);
      return;
    } // end full-target-status-row branch

    removeCardFromZoneArray("statusRevealArea", cardInstanceId);
    targetEntity.statusRow[statusSlotIndex] = cardInstanceId;
    instance.ownerEntityId = targetEntity.id;
    updateCardInstanceZone(cardInstanceId, "statusRow", `${targetEntity.id}:slot${statusSlotIndex + 1}`, true);
    appendLog("negativeStatusPlaced", `${definition.name} was placed on ${targetEntity.name}'s Status Row, slot ${statusSlotIndex + 1}.`);
    rerenderAfterStateChange(`${definition.name} was placed on ${targetEntity.name}.`, "success", focusControlId);
  } // end placeRevealedNegativeStatus function

  function discardNegativeStatusFromRow(entityId, cardInstanceId, focusControlId) {
    const entity = getEntity(entityId);
    const instance = getCardInstance(cardInstanceId);
    const definition = getDefinitionForInstance(cardInstanceId);

    if (!entity || !instance || !definition || definition.cardType !== "status" || !definition.data || definition.data.statusCategory !== "negative") {
      setManualControlStatus("Only a negative Status Card in a Status Row can be discarded to the Status Discard Pile.", "error");
      restoreFocusAfterRender(focusControlId);
      return;
    } // end invalid-negative-status-discard branch

    const statusSlotIndex = getStatusRowSlotIndex(entity, cardInstanceId);
    if (statusSlotIndex === -1) {
      setManualControlStatus(`${definition.name} is not in ${entity.name}'s Status Row.`, "error");
      restoreFocusAfterRender(focusControlId);
      return;
    } // end missing-status-row-card branch

    entity.statusRow[statusSlotIndex] = null;
    instance.ownerEntityId = null;
    application.runtimeState.zones.statusDiscardPile.push(cardInstanceId);
    updateCardInstanceZone(cardInstanceId, "statusDiscardPile", null, true);
    appendLog("negativeStatusDiscarded", `${definition.name} was discarded from ${entity.name}'s Status Row to the Status Discard Pile.`);
    rerenderAfterStateChange(`${definition.name} was discarded to the Status Discard Pile.`, "success", focusControlId);
  } // end discardNegativeStatusFromRow function

  function createStatusRowCardItem(entity, cardInstanceId, slotLabel, controlPrefix) {
    const item = createCardListItem(cardInstanceId, slotLabel);
    const definition = getDefinitionForInstance(cardInstanceId);
    const actions = createElement("div", { className: "zone-action-row" });

    if (definition && definition.cardType === "status" && definition.data && definition.data.statusCategory === "negative") {
      const buttonId = `${controlPrefix}-${sanitizeIdPart(cardInstanceId)}-discard-negative-status`;
      actions.append(createCounterButton(
        `Discard ${definition.name} from ${entity.name}'s Status Row`,
        buttonId,
        function handleDiscardNegativeStatus() {
          discardNegativeStatusFromRow(entity.id, cardInstanceId, buttonId);
        }
      )); // end discard-negative-status button
    } else {
      const instance = getCardInstance(cardInstanceId);
      if (instance && instance.statusReturn && instance.statusReturn.type === "skillAttachment") {
        const buttonId = `${controlPrefix}-${sanitizeIdPart(cardInstanceId)}-return-to-skill`;
        actions.append(createCounterButton(
          `Return ${definition ? definition.name : formatCardLabel(cardInstanceId)} to its equipped Skill Card`,
          buttonId,
          function handleReturnToSkill() {
            returnStatusCardToSkillAttachment(entity.id, cardInstanceId, buttonId);
          }
        )); // end return-to-skill button
      } // end skill-return branch
    } // end status-card-action branch

    if (actions.childElementCount > 0) {
      item.append(actions);
    } // end status-card-actions branch

    return item;
  } // end createStatusRowCardItem function

  function renderStatusRow(entity, list, controlPrefix) {
    const statusRow = normalizeStatusRow(entity.statusRow);
    entity.statusRow = statusRow;
    statusRow.forEach(function renderStatusSlot(cardInstanceId, index) {
      const slotLabel = `Status row slot ${index + 1}`;
      list.append(cardInstanceId
        ? createStatusRowCardItem(entity, cardInstanceId, slotLabel, controlPrefix)
        : createEmptySlotItem(slotLabel));
    }); // end status-slot loop
  } // end renderStatusRow function

  function renderSkillSlots(entity, list) {
    (entity.skillSlots || []).forEach(function renderSkillSlot(skillSlot, index) {
      const slotLabel = `Skill slot ${index + 1}`;
      if (!skillSlot) {
        list.append(createEmptySlotItem(slotLabel));
        return;
      } // end empty-skill-slot branch

      const item = createCardListItem(skillSlot.skillCardInstanceId, slotLabel);
      const abilityIds = skillSlot.attachedAbilityInstanceIds || [];
      if (abilityIds.length > 0) {
        const nestedHeading = createElement("span", {
          className: "slot-label",
          text: "Attached abilities"
        }); // end attached-abilities heading
        const nestedList = createElement("ul", { className: "card-list" });
        abilityIds.forEach(function renderAttachedAbility(abilityInstanceId) {
          const abilityItem = createCardListItem(abilityInstanceId);
          const abilityDefinition = getDefinitionForInstance(abilityInstanceId);
          if (definitionMovesToOwnerStatusRow(abilityDefinition)) {
            const buttonId = `skill-${sanitizeIdPart(entity.id)}-${sanitizeIdPart(abilityInstanceId)}-move-to-status`;
            const actions = createElement("div", { className: "zone-action-row" });
            actions.append(createCounterButton(
              `Move ${abilityDefinition.name} to ${entity.name}'s Status Row`,
              buttonId,
              function handleMoveAbilityToStatusRow() {
                moveSkillAttachmentToOwnerStatusRow(entity.id, abilityInstanceId, buttonId);
              }
            )); // end move-ability-to-status button
            abilityItem.append(actions);
          } // end status-ability branch
          nestedList.append(abilityItem);
        }); // end attached-ability loop
        item.append(nestedHeading, nestedList);
      } // end attached-abilities branch
      list.append(item);
    }); // end skill-slot loop
  } // end renderSkillSlots function

  function renderTacticalReserveSlots(entity, list) {
    (entity.tacticalReserveSlots || []).forEach(function renderTacticalReserveSlot(cardInstanceId, index) {
      const slotLabel = `Tactical Reserve slot ${index + 1}`;
      list.append(cardInstanceId ? createCardListItem(cardInstanceId, slotLabel) : createEmptySlotItem(slotLabel));
    }); // end tactical-reserve-slot loop
  } // end renderTacticalReserveSlots function

  function renderCharacterPanel(entity) {
    const panel = createElement("article", { className: "character-panel" });
    const heading = createElement("h4", { text: entity.name });
    const summary = createElement("p", {
      text: `Current row: ${entity.currentRow}. Damage: ${getNumericValue(entity.damage, 0)}. Maximum HP: ${entity.maximumHp || "unknown"}. Heat: ${getNumericValue(entity.heat, 0)}.`
    }); // end character-panel summary
    const characterCardActions = createElement("div", { className: "card-actions" });
    characterCardActions.append(createCardDetailsButton(entity.characterCardInstanceId));

    const equipmentHeading = createElement("h5", { text: "Equipment" });
    const equipmentList = createElement("ul", { className: "card-list" });
    renderEquipment(entity, equipmentList);

    const skillsHeading = createElement("h5", { text: "Skill Cards" });
    const skillsList = createElement("ol", { className: "card-list" });
    renderSkillSlots(entity, skillsList);

    const reserveHeading = createElement("h5", { text: "Tactical Reserve" });
    const reserveList = createElement("ol", { className: "card-list" });
    renderTacticalReserveSlots(entity, reserveList);

    const statusHeading = createElement("h5", { text: "Status Row" });
    const statusList = createElement("ol", { className: "card-list" });
    renderStatusRow(entity, statusList, `character-status-${sanitizeIdPart(entity.id)}`);

    panel.append(
      heading,
      summary,
      createEntityCounterControls(entity, "character-area"),
      characterCardActions,
      equipmentHeading,
      equipmentList,
      skillsHeading,
      skillsList,
      reserveHeading,
      reserveList,
      statusHeading,
      statusList
    );
    return panel;
  } // end renderCharacterPanel function

  function renderCharacterAreas() {
    clearElement(elements.characterAreas);
    const friendlyEntities = Object.values(application.runtimeState.entities || {}).filter(isFriendlyEntity);

    if (friendlyEntities.length === 0) {
      elements.characterAreas.append(createElement("p", { text: "No player-side entities are present in this runtime state." }));
      return;
    } // end empty-friendly-entities branch

    friendlyEntities.forEach(function renderFriendlyEntityArea(entity) {
      elements.characterAreas.append(renderCharacterPanel(entity));
    }); // end friendly-entity-area loop
  } // end renderCharacterAreas function

  function getEnemyRowArray(rowKey) {
    const enemyFormation = application.runtimeState.zones.enemyFormation;
    if (rowKey === "enemyFront") {
      return enemyFormation.frontRow;
    } // end enemy-front branch

    if (rowKey === "enemyBack") {
      return enemyFormation.backRow;
    } // end enemy-back branch

    throw new Error(`Unsupported enemy row ${rowKey}.`);
  } // end getEnemyRowArray function

  function createEnemyEntityId(cardInstanceId) {
    const baseId = `entity.runtime.${sanitizeIdPart(cardInstanceId)}`;
    let candidateId = baseId;
    let suffix = 2;

    while (getEntity(candidateId)) {
      candidateId = `${baseId}-${suffix}`;
      suffix += 1;
    } // end unique-entity-id loop

    return candidateId;
  } // end createEnemyEntityId function

  function deployRevealedEnemy(cardInstanceId, rowKey, focusControlId) {
    const state = application.runtimeState;
    const instance = getCardInstance(cardInstanceId);
    const definition = getDefinitionForInstance(cardInstanceId);

    if (!instance || !definition || definition.cardType !== "enemy") {
      setManualControlStatus("Only a revealed Enemy Card can be deployed into Enemy Formation.", "error");
      return;
    } // end invalid-enemy-deployment branch

    if (instance.zone !== "dungeonRevealArea") {
      setManualControlStatus(`${definition.name} is no longer waiting in the Dungeon Reveal Area.`, "error");
      return;
    } // end invalid-enemy-zone branch

    const destinationRow = getEnemyRowArray(rowKey);
    const slotIndex = destinationRow.indexOf(null);
    if (slotIndex === -1) {
      setManualControlStatus(`The selected ${rowKey === "enemyFront" ? "Enemy Front Row" : "Enemy Back Row"} has no open slot.`, "error");
      restoreFocusAfterRender(focusControlId);
      return;
    } // end full-enemy-row branch

    const printedStats = definition.data && definition.data.stats ? definition.data.stats : {};
    const entityId = createEnemyEntityId(cardInstanceId);
    const entity = {
      id: entityId,
      definitionId: definition.id,
      characterCardInstanceId: cardInstanceId,
      name: definition.name,
      entityType: "enemy",
      currentRow: rowKey,
      damage: 0,
      maximumHp: getNumericValue(printedStats.hp, 1),
      defense: getNumericValue(printedStats.defense, 0),
      statusRow: normalizeStatusRow([])
    }; // end enemy-entity object

    removeCardFromZoneArray("dungeonRevealArea", cardInstanceId);
    state.entities[entityId] = entity;
    destinationRow[slotIndex] = entityId;
    instance.ownerEntityId = entityId;
    updateCardInstanceZone(cardInstanceId, "enemyFormation", `${rowKey}:${slotIndex + 1}`, true);
    appendLog("enemyDeployed", `${definition.name} was deployed to ${rowKey === "enemyFront" ? "Enemy Front Row" : "Enemy Back Row"}, slot ${slotIndex + 1}.`);
    rerenderAfterStateChange(`${definition.name} was deployed.`, "success", focusControlId);
  } // end deployRevealedEnemy function

  function discardRevealedDungeonCard(cardInstanceId, focusControlId) {
    const instance = getCardInstance(cardInstanceId);
    const definition = getDefinitionForInstance(cardInstanceId);

    if (!instance || !definition || instance.zone !== "dungeonRevealArea") {
      setManualControlStatus("Only a card currently in the Dungeon Reveal Area can be discarded as resolved.", "error");
      return;
    } // end invalid-revealed-discard branch

    if (definition.cardType === "enemy") {
      setManualControlStatus("Deploy this Enemy Card to formation first. Use its Defeat and discard control after combat.", "error");
      restoreFocusAfterRender(focusControlId);
      return;
    } // end enemy-revealed-discard branch

    removeCardFromZoneArray("dungeonRevealArea", cardInstanceId);
    application.runtimeState.zones.dungeonDiscardPile.push(cardInstanceId);
    updateCardInstanceZone(cardInstanceId, "dungeonDiscardPile", null, true);
    appendLog("dungeonCardDiscarded", `${definition.name} was moved from the Dungeon Reveal Area to the Dungeon Discard Pile after manual resolution.`);
    rerenderAfterStateChange(`${definition.name} was discarded to the Dungeon Discard Pile.`, "success", focusControlId);
  } // end discardRevealedDungeonCard function

  function removeEnemyFromFormation(entityId) {
    const enemyFormation = application.runtimeState.zones.enemyFormation;
    [enemyFormation.frontRow, enemyFormation.backRow].forEach(function removeFromRow(row) {
      const index = row.indexOf(entityId);
      if (index !== -1) {
        row[index] = null;
      } // end enemy-found-in-row branch
    }); // end enemy-formation-row loop
  } // end removeEnemyFromFormation function

  function discardNegativeStatusesFromDefeatedEntity(entity) {
    const discardedNames = [];

    normalizeStatusRow(entity.statusRow).forEach(function discardNegativeStatusOnDefeat(cardInstanceId, index) {
      if (!cardInstanceId) {
        return;
      } // end empty-status-slot branch

      const instance = getCardInstance(cardInstanceId);
      const definition = getDefinitionForInstance(cardInstanceId);
      if (!instance || !definition || definition.cardType !== "status" || !definition.data || definition.data.statusCategory !== "negative") {
        return;
      } // end non-negative-status branch

      entity.statusRow[index] = null;
      instance.ownerEntityId = null;
      application.runtimeState.zones.statusDiscardPile.push(cardInstanceId);
      updateCardInstanceZone(cardInstanceId, "statusDiscardPile", null, true);
      discardedNames.push(definition.name);
    }); // end defeated-entity-status loop

    return discardedNames;
  } // end discardNegativeStatusesFromDefeatedEntity function

  function defeatEnemyEntity(entityId, focusControlId) {
    const entity = getEntity(entityId);
    if (!entity || entity.entityType !== "enemy") {
      setManualControlStatus("Only an enemy entity can use the Defeat and discard control.", "error");
      return;
    } // end invalid-enemy-defeat branch

    const cardInstanceId = entity.characterCardInstanceId;
    const definition = getDefinitionForInstance(cardInstanceId);
    const discardedStatuses = discardNegativeStatusesFromDefeatedEntity(entity);
    removeEnemyFromFormation(entityId);
    delete application.runtimeState.entities[entityId];
    application.runtimeState.zones.dungeonDiscardPile.push(cardInstanceId);
    updateCardInstanceZone(cardInstanceId, "dungeonDiscardPile", null, true);
    const statusSuffix = discardedStatuses.length > 0
      ? ` Negative statuses moved to Status Discard: ${discardedStatuses.join(", ")}.`
      : "";
    appendLog("enemyDefeated", `${entity.name} was manually defeated and moved to the Dungeon Discard Pile.${statusSuffix}`);
    rerenderAfterStateChange(`${definition ? definition.name : entity.name} was defeated and discarded.`, "success", focusControlId);
  } // end defeatEnemyEntity function

  function drawDungeonCard() {
    const state = application.runtimeState;
    const dungeonDeck = state.zones.dungeonDeck;
    const revealArea = state.zones.dungeonRevealArea;

    if (revealArea.length > 0) {
      setManualControlStatus("Resolve, deploy, or discard the Dungeon Card already in the Dungeon Reveal Area before drawing another card.", "error");
      return;
    } // end unresolved-reveal-area branch

    if (dungeonDeck.length === 0) {
      setManualControlStatus("The Dungeon Deck is empty. There is no card to draw.", "error");
      return;
    } // end empty-dungeon-deck branch

    const cardInstanceId = dungeonDeck.pop();
    const definition = getDefinitionForInstance(cardInstanceId);
    revealArea.push(cardInstanceId);
    updateCardInstanceZone(cardInstanceId, "dungeonRevealArea", null, true);
    appendLog("dungeonCardDrawn", `Drew ${definition ? definition.name : cardInstanceId} from the Dungeon Deck into the Dungeon Reveal Area.`);
    rerenderAfterStateChange(`Drew ${definition ? definition.name : "a Dungeon Card"}. Resolve it manually.`, "success", "draw-dungeon-card-button");
  } // end drawDungeonCard function

  function drawStatusCard() {
    const state = application.runtimeState;
    const statusDeck = state.zones.statusDeck;
    const revealArea = state.zones.statusRevealArea;

    if (revealArea.length > 0) {
      setManualControlStatus("Place or discard the Status Card already in the Status Reveal Area before drawing another.", "error");
      return;
    } // end unresolved-status-reveal branch

    if (statusDeck.length === 0) {
      setManualControlStatus("The Status Deck is empty. There is no negative Status Card to draw.", "error");
      return;
    } // end empty-status-deck branch

    const cardInstanceId = statusDeck.pop();
    const definition = getDefinitionForInstance(cardInstanceId);
    revealArea.push(cardInstanceId);
    updateCardInstanceZone(cardInstanceId, "statusRevealArea", null, true);
    appendLog("statusCardDrawn", `Drew ${definition ? definition.name : cardInstanceId} from the Status Deck into the Status Reveal Area.`);
    rerenderAfterStateChange(`Drew ${definition ? definition.name : "a negative Status Card"}. Choose a legal target manually.`, "success", "draw-status-card-button");
  } // end drawStatusCard function

  function createStatusRevealAreaActions(cardInstanceId) {
    const definition = getDefinitionForInstance(cardInstanceId);
    const actions = createElement("div", { className: "zone-action-row" });

    if (!definition || definition.cardType !== "status" || !definition.data || definition.data.statusCategory !== "negative") {
      return actions;
    } // end unsupported-status-reveal branch

    const entities = Object.values(application.runtimeState.entities || {}).filter(function filterEligibleTargets(entity) {
      return definitionAllowsEntity(definition, entity);
    }); // end eligible-status-target filtering

    if (entities.length === 0) {
      actions.append(createElement("p", { text: "No current entity is a legal target for this status card." }));
      return actions;
    } // end no-eligible-status-target branch

    entities.forEach(function createPlaceStatusButton(entity) {
      const buttonId = `status-reveal-${sanitizeIdPart(cardInstanceId)}-place-on-${sanitizeIdPart(entity.id)}`;
      actions.append(createCounterButton(
        `Place ${definition.name} on ${entity.name}`,
        buttonId,
        function handlePlaceStatusOnEntity() {
          placeRevealedNegativeStatus(cardInstanceId, entity.id, buttonId);
        }
      )); // end place-status button
    }); // end eligible-status-target loop

    return actions;
  } // end createStatusRevealAreaActions function

  function setPartyCurrency(requestedValue, focusControlId) {
    const newValue = Number(requestedValue);
    if (!Number.isInteger(newValue) || newValue < 0) {
      setManualControlStatus("Party Currency must be a whole number of zero or greater.", "error");
      restoreFocusAfterRender(focusControlId);
      return;
    } // end invalid-party-currency branch

    const currentValue = getNumericValue(application.runtimeState.resources.currency, 0);
    application.runtimeState.resources.currency = newValue;
    appendLog("partyCurrencyChanged", `Party Currency changed from ${currentValue} to ${newValue}.`);
    rerenderAfterStateChange(`Party Currency is now ${newValue}.`, "success", focusControlId);
  } // end setPartyCurrency function

  function changePartyCurrency(delta, focusControlId) {
    const currentValue = getNumericValue(application.runtimeState.resources.currency, 0);
    setPartyCurrency(Math.max(0, currentValue + delta), focusControlId);
  } // end changePartyCurrency function

  function createRevealAreaActions(cardInstanceId) {
    const definition = getDefinitionForInstance(cardInstanceId);
    const actions = createElement("div", { className: "zone-action-row" });
    if (!definition) {
      return actions;
    } // end missing-reveal-definition branch

    if (definition.cardType === "enemy") {
      const frontButtonId = `reveal-${sanitizeIdPart(cardInstanceId)}-deploy-front`;
      const backButtonId = `reveal-${sanitizeIdPart(cardInstanceId)}-deploy-back`;
      const frontButton = createCounterButton(
        `Deploy ${definition.name} to Enemy Front Row`,
        frontButtonId,
        function handleDeployFront() {
          deployRevealedEnemy(cardInstanceId, "enemyFront", frontButtonId);
        }
      ); // end deploy-front button
      const backButton = createCounterButton(
        `Deploy ${definition.name} to Enemy Back Row`,
        backButtonId,
        function handleDeployBack() {
          deployRevealedEnemy(cardInstanceId, "enemyBack", backButtonId);
        }
      ); // end deploy-back button
      actions.append(frontButton, backButton);
      return actions;
    } // end enemy-reveal-actions branch

    const discardButtonId = `reveal-${sanitizeIdPart(cardInstanceId)}-discard`;
    const discardButton = createCounterButton(
      `Discard resolved ${definition.name} to Dungeon Discard Pile`,
      discardButtonId,
      function handleDiscardResolvedCard() {
        discardRevealedDungeonCard(cardInstanceId, discardButtonId);
      }
    ); // end discard-resolved-card button
    actions.append(discardButton);
    return actions;
  } // end createRevealAreaActions function

  function describeZone(zoneName, zoneKey, cardInstanceIds, hiddenCardCount) {
    const card = createElement("article", { className: "zone-card" });
    const heading = createElement("h4", { text: zoneName });
    const count = createElement("p", {
      text: hiddenCardCount ? `${cardInstanceIds.length} face-down card(s).` : `${cardInstanceIds.length} card(s).`
    }); // end zone-count text
    card.append(heading, count);

    if (!hiddenCardCount && cardInstanceIds.length > 0) {
      const list = createElement("ul", { className: "card-list" });
      cardInstanceIds.forEach(function renderZoneCard(cardInstanceId) {
        const item = createCardListItem(cardInstanceId);
        if (zoneKey === "dungeonRevealArea") {
          item.append(createRevealAreaActions(cardInstanceId));
        } // end dungeon-reveal-actions branch

        if (zoneKey === "statusRevealArea") {
          item.append(createStatusRevealAreaActions(cardInstanceId));
        } // end status-reveal-actions branch
        list.append(item);
      }); // end zone-card loop
      card.append(list);
    } // end face-up-zone branch

    return card;
  } // end describeZone function

  function renderZones() {
    clearElement(elements.zoneSummary);
    const zones = application.runtimeState.zones;
    const zoneConfigurations = [
      ["Dungeon Deck", "dungeonDeck", zones.dungeonDeck || [], true],
      ["Dungeon Reveal Area", "dungeonRevealArea", zones.dungeonRevealArea || [], false],
      ["Dungeon Discard Pile", "dungeonDiscardPile", zones.dungeonDiscardPile || [], false],
      ["Dungeon Loot Area", "dungeonLootArea", zones.dungeonLootArea || [], false],
      ["Loot Deck", "lootDeck", zones.lootDeck || [], true],
      ["Loot Discard Pile", "lootDiscardPile", zones.lootDiscardPile || [], false],
      ["Expended Summons", "expendedSummons", zones.expendedSummons || [], false],
      ["Status Deck", "statusDeck", zones.statusDeck || [], true],
      ["Status Reveal Area", "statusRevealArea", zones.statusRevealArea || [], false],
      ["Status Discard Pile", "statusDiscardPile", zones.statusDiscardPile || [], false]
    ]; // end zone-configurations array

    zoneConfigurations.forEach(function renderZoneConfiguration(configuration) {
      elements.zoneSummary.append(describeZone(configuration[0], configuration[1], configuration[2], configuration[3]));
    }); // end zone-configuration loop
  } // end renderZones function

  function renderRuntimeSummary() {
    clearElement(elements.runtimeSummary);
    const state = application.runtimeState;
    const summaryEntries = [
      ["State version", String(state.stateVersion)],
      ["Seed", state.seed || "Not recorded"],
      ["Play mode", state.playMode || "Not recorded"],
      ["Round", state.encounter && state.encounter.round ? String(state.encounter.round) : "Not recorded"],
      ["Phase", state.encounter && state.encounter.phase ? state.encounter.phase : "Not recorded"],
      ["Dungeon Deck", `${state.zones.dungeonDeck.length} face-down card(s)`],
      ["Status Deck", `${state.zones.statusDeck.length} face-down card(s)`],
      ["Party Currency", String(getNumericValue(state.resources.currency, 0))]
    ]; // end summary-entries array

    for (const [term, description] of summaryEntries) {
      const wrapper = createElement("div");
      wrapper.append(
        createElement("dt", { text: term }),
        createElement("dd", { text: description })
      );
      elements.runtimeSummary.append(wrapper);
    } // end summary-entry loop
  } // end renderRuntimeSummary function

  function renderManualControls() {
    const stateLoaded = Boolean(application.runtimeState);
    const state = application.runtimeState;
    const deckCount = stateLoaded ? state.zones.dungeonDeck.length : 0;
    const revealCount = stateLoaded ? state.zones.dungeonRevealArea.length : 0;
    const statusDeckCount = stateLoaded ? state.zones.statusDeck.length : 0;
    const statusRevealCount = stateLoaded ? state.zones.statusRevealArea.length : 0;
    const currency = stateLoaded ? getNumericValue(state.resources.currency, 0) : 0;

    elements.drawDungeonCardButton.disabled = !stateLoaded || deckCount === 0 || revealCount > 0;
    elements.drawDungeonCardButton.textContent = deckCount === 0 && stateLoaded
      ? "Dungeon Deck is empty"
      : "Draw top Dungeon Card";
    elements.dungeonDrawSummary.textContent = stateLoaded
      ? `Dungeon Deck: ${deckCount} face-down card(s). Dungeon Reveal Area: ${revealCount} card(s).`
      : "No state loaded.";
    elements.drawStatusCardButton.disabled = !stateLoaded || statusDeckCount === 0 || statusRevealCount > 0;
    elements.drawStatusCardButton.textContent = statusDeckCount === 0 && stateLoaded
      ? "Status Deck is empty"
      : "Draw top Status Card";
    elements.statusDrawSummary.textContent = stateLoaded
      ? `Status Deck: ${statusDeckCount} face-down card(s). Status Reveal Area: ${statusRevealCount} card(s).`
      : "No state loaded.";
    elements.partyCurrencyValue.textContent = String(currency);
    elements.partyCurrencyInput.value = String(currency);
    elements.partyCurrencyInput.disabled = !stateLoaded;
    elements.decreasePartyCurrencyButton.disabled = !stateLoaded || currency === 0;
    elements.increasePartyCurrencyButton.disabled = !stateLoaded;
    elements.downloadStateButton.disabled = !stateLoaded;
  } // end renderManualControls function

  function renderLog() {
    clearElement(elements.playtestLog);
    const logEntries = application.runtimeState.log || [];

    if (logEntries.length === 0) {
      elements.playtestLog.append(createElement("li", { text: "No logged playtest events." }));
      return;
    } // end empty-log branch

    logEntries.forEach(function renderLogEntry(entry) {
      const label = entry.sequence ? `Event ${entry.sequence}` : "Event";
      elements.playtestLog.append(createElement("li", {
        text: `${label}: ${entry.message || entry.type || "No message"}`
      })); // end log list item
    }); // end log-entry loop
  } // end renderLog function

  function renderCardDetails() {
    clearElement(elements.cardDetails);

    if (!application.selectedCardInstanceId) {
      elements.cardDetails.append(createElement("p", { text: "Select a card-details button anywhere on the table to inspect its full player-facing text." }));
      return;
    } // end no-selection branch

    const instance = getCardInstance(application.selectedCardInstanceId);
    const definition = instance ? getCardDefinition(instance.definitionId) : null;
    if (!instance || !definition) {
      elements.cardDetails.append(createElement("p", { text: "The selected card instance or its definition could not be found." }));
      return;
    } // end missing-card-data branch

    const name = createElement("h4", { text: definition.name });
    const metadata = createElement("p", {
      text: `Definition ID: ${definition.id}. Instance ID: ${instance.id}. Type: ${definition.cardType}. Current zone: ${instance.zone}${instance.zoneDetail ? ` (${instance.zoneDetail})` : ""}.`
    }); // end card-details metadata
    const rulesHeading = createElement("h5", { text: "Player-facing rules text" });
    const rulesText = createElement("p", {
      className: "card-rules",
      text: definition.rulesText || "No player-facing rules text is recorded."
    }); // end card-rules text
    const tagsHeading = createElement("h5", { text: "Tags" });
    const tags = createElement("p", {
      text: Array.isArray(definition.tags) && definition.tags.length > 0 ? definition.tags.join(", ") : "No tags recorded."
    }); // end tags text

    elements.cardDetails.append(name, metadata, rulesHeading, rulesText, tagsHeading, tags);
  } // end renderCardDetails function

  function renderTabletop() {
    const state = application.runtimeState;
    if (!state) {
      return;
    } // end missing-state branch

    elements.tabletop.hidden = false;
    elements.tabletopHeading.textContent = state.scenarioName || state.scenarioId || "Loaded playtest state";
    renderManualControls();
    renderRuntimeSummary();
    renderFormation();
    renderCharacterAreas();
    renderZones();
    renderLog();
    renderCardDetails();
  } // end renderTabletop function

  function validateRuntimeState(state) {
    const requiredKeys = ["scenarioId", "entities", "cardInstances", "zones"];
    for (const key of requiredKeys) {
      if (!state || typeof state !== "object" || !(key in state)) {
        throw new Error(`The selected file is not a supported runtime-state file because it is missing ${key}.`);
      } // end runtime-state-required-key branch
    } // end required-key loop

    if (!state.zones.playerFormation || !state.zones.enemyFormation || !Array.isArray(state.zones.dungeonDeck)) {
      throw new Error("The runtime state is missing one or more required formation or Dungeon Deck zones.");
    } // end required-zone validation
  } // end validateRuntimeState function

  function setLoadedRuntimeState(state, sourceLabel) {
    validateRuntimeState(state);
    application.runtimeState = normalizeRuntimeState(state);
    application.selectedCardInstanceId = null;
    application.loadedStateLabel = sourceLabel;
    renderTabletop();
    setLoadStatus(`Loaded ${sourceLabel}.`, "success");
    setManualControlStatus("Manual controls are ready. Resolve rules and card text yourself, then use the explicit controls to track the result.", "info");
  } // end setLoadedRuntimeState function

  async function loadCatalog() {
    try {
      const response = await fetch(CATALOG_URL, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      } // end catalog-fetch-status branch

      const catalog = await response.json();
      if (!catalog || !catalog.cardsById) {
        throw new Error("The catalog file does not contain cardsById.");
      } // end catalog-shape branch

      application.catalog = catalog;
      const cardCount = Object.keys(catalog.cardsById).length;
      elements.catalogStatus.textContent = `Card catalog loaded. ${cardCount} card definition(s) are available.`;
      elements.loadLocalStateButton.disabled = false;
    } catch (error) {
      elements.catalogStatus.textContent = `Card catalog failed to load: ${error.message}`;
      setLoadStatus("Start the project through npm start instead of opening playtest.html directly from File Explorer, then reload this page.", "error");
    } // end catalog-load try-catch
  } // end loadCatalog function

  async function loadRuntimeStateFromUrl(url, sourceLabel) {
    if (!application.catalog) {
      setLoadStatus("The card catalog has not loaded yet, so a runtime state cannot be rendered.", "error");
      return;
    } // end missing-catalog branch

    try {
      setLoadStatus(`Loading ${sourceLabel}…`, "info");
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      } // end runtime-state-fetch-status branch

      const state = await response.json();
      setLoadedRuntimeState(state, sourceLabel);
    } catch (error) {
      setLoadStatus(`Could not load ${sourceLabel}: ${error.message}`, "error");
    } // end runtime-state-url try-catch
  } // end loadRuntimeStateFromUrl function

  function loadRuntimeStateFromFile(file) {
    if (!file) {
      return;
    } // end missing-file branch

    if (!application.catalog) {
      setLoadStatus("The card catalog has not loaded yet, so a runtime state cannot be rendered.", "error");
      return;
    } // end missing-catalog branch

    const reader = new FileReader();
    reader.addEventListener("load", function handleStateFileLoad() {
      try {
        const state = JSON.parse(String(reader.result));
        setLoadedRuntimeState(state, file.name);
      } catch (error) {
        setLoadStatus(`Could not read ${file.name}: ${error.message}`, "error");
      } // end state-file parse try-catch
    }); // end state-file load listener
    reader.addEventListener("error", function handleStateFileError() {
      setLoadStatus(`Could not read ${file.name}.`, "error");
    }); // end state-file error listener
    reader.readAsText(file);
  } // end loadRuntimeStateFromFile function

  function downloadCurrentState() {
    if (!application.runtimeState) {
      setManualControlStatus("Load a runtime state before downloading it.", "error");
      return;
    } // end missing-runtime-state branch

    const state = application.runtimeState;
    const scenarioPart = sanitizeIdPart(state.scenarioId || "playtest-state");
    const fileName = `${scenarioPart}.playtest.json`;
    appendLog("stateDownloaded", `Downloaded the current runtime state as ${fileName}.`);
    const content = `${JSON.stringify(state, null, 2)}\n`;
    const blob = new Blob([content], { type: "application/json" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);
    renderLog();
    setManualControlStatus(`Downloaded ${fileName}. Load that file later with the runtime-state file chooser.`, "success");
  } // end downloadCurrentState function

  function bindEvents() {
    elements.loadLocalStateButton.disabled = true;
    elements.drawDungeonCardButton.addEventListener("click", drawDungeonCard);
    elements.drawStatusCardButton.addEventListener("click", drawStatusCard);
    elements.decreasePartyCurrencyButton.addEventListener("click", function handleDecreaseCurrency() {
      changePartyCurrency(-1, "decrease-party-currency-button");
    }); // end decrease-currency listener
    elements.increasePartyCurrencyButton.addEventListener("click", function handleIncreaseCurrency() {
      changePartyCurrency(1, "increase-party-currency-button");
    }); // end increase-currency listener
    elements.partyCurrencyInput.addEventListener("change", function handleCurrencyInputChange() {
      setPartyCurrency(elements.partyCurrencyInput.value, "party-currency-input");
    }); // end currency-input listener
    elements.downloadStateButton.addEventListener("click", downloadCurrentState);
    elements.loadLocalStateButton.addEventListener("click", function handleLoadLocalState() {
      loadRuntimeStateFromUrl(DEFAULT_STATE_URL, "the local initial state");
    }); // end local-state-button listener
    elements.stateFileInput.addEventListener("change", function handleStateFileChange(event) {
      const selectedFile = event.target.files && event.target.files[0];
      loadRuntimeStateFromFile(selectedFile);
    }); // end state-file-input listener
  } // end bindEvents function

  bindEvents();
  renderManualControls();
  loadCatalog();
}()); // end initializePlaytestTabletop IIFE
