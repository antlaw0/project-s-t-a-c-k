(function initializePlaytestTabletop() {
  "use strict";

  const CATALOG_URL = "./generated/card-catalog.json";
  const DEFAULT_STATE_URL = "./playtest-saves/scenario.solo-warrior-goblin-warrens-smoke-test.initial.json";

  const application = {
    catalog: null,
    runtimeState: null,
    selectedCardInstanceId: null
  }; // end application object

  const elements = {
    catalogStatus: document.getElementById("catalog-status"),
    loadLocalStateButton: document.getElementById("load-local-state-button"),
    stateFileInput: document.getElementById("state-file-input"),
    loadStatus: document.getElementById("load-status"),
    tabletop: document.getElementById("tabletop"),
    tabletopHeading: document.getElementById("tabletop-heading"),
    runtimeSummary: document.getElementById("runtime-summary"),
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
    } // end ID branch

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

  function formatCardLabel(cardInstanceId) {
    const cardInstance = getCardInstance(cardInstanceId);
    if (!cardInstance) {
      return "Missing card instance";
    } // end missing-card-instance branch

    const definition = getCardDefinition(cardInstance.definitionId);
    return definition ? definition.name : `Unknown card definition: ${cardInstance.definitionId}`;
  } // end formatCardLabel function

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
    const actions = createElement("div", {
      className: "card-actions"
    }); // end card-list actions

    actions.append(createCardDetailsButton(cardInstanceId));
    item.append(label, detail, actions);
    return item;
  } // end createCardListItem function

  function createEmptySlotItem(slotLabel) {
    const item = createElement("li", {
      className: "empty-slot",
      text: `${slotLabel}: empty`
    }); // end empty-slot item
    return item;
  } // end createEmptySlotItem function

  function renderRuntimeSummary() {
    clearElement(elements.runtimeSummary);

    const state = application.runtimeState;
    const summaryEntries = [
      ["State version", String(state.stateVersion)],
      ["Seed", state.seed || "Not recorded"],
      ["Play mode", state.playMode || "Not recorded"],
      ["Round", state.encounter && state.encounter.round ? String(state.encounter.round) : "Not recorded"],
      ["Phase", state.encounter && state.encounter.phase ? state.encounter.phase : "Not recorded"],
      ["Dungeon Deck", `${state.zones.dungeonDeck.length} face-down card(s)`]
    ]; // end summary entries array

    for (const [term, description] of summaryEntries) {
      const wrapper = createElement("div");
      wrapper.append(
        createElement("dt", { text: term }),
        createElement("dd", { text: description })
      );
      elements.runtimeSummary.append(wrapper);
    } // end summary-entry loop
  } // end renderRuntimeSummary function

  function renderFormationRow(title, entityIds) {
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
      } // end empty formation-slot branch

      const entity = getEntity(entityId);
      const item = createElement("li");
      const entityName = entity ? entity.name : `Unknown entity: ${entityId}`;
      const text = createElement("strong", {
        text: `${slotLabel}: ${entityName}`
      }); // end formation entity label
      const details = createElement("span", {
        className: "card-meta",
        text: entity ? `Damage ${entity.damage} of ${entity.maximumHp} maximum HP. Heat ${entity.heat}.` : "Entity data unavailable."
      }); // end formation entity detail

      item.append(text, details);
      if (entity && entity.characterCardInstanceId) {
        const actions = createElement("div", {
          className: "card-actions"
        }); // end formation entity actions
        actions.append(createCardDetailsButton(entity.characterCardInstanceId));
        item.append(actions);
      } // end character-card-actions branch
      list.append(item);
    }); // end formation-slot loop

    panel.append(heading, list);
    return panel;
  } // end renderFormationRow function

  function renderFormation() {
    clearElement(elements.formationGrid);
    const formation = application.runtimeState.zones.playerFormation;
    const enemyFormation = application.runtimeState.zones.enemyFormation;

    elements.formationGrid.append(
      renderFormationRow("Player Front Row", formation.frontRow),
      renderFormationRow("Player Back Row", formation.backRow),
      renderFormationRow("Enemy Front Row", enemyFormation.frontRow),
      renderFormationRow("Enemy Back Row", enemyFormation.backRow)
    );
  } // end renderFormation function

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
        const nestedList = createElement("ul", {
          className: "card-list"
        }); // end attached-abilities list
        abilityIds.forEach(function renderAttachedAbility(abilityInstanceId) {
          nestedList.append(createCardListItem(abilityInstanceId));
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

  function renderStatusRow(entity, list) {
    (entity.statusRow || []).forEach(function renderStatusSlot(cardInstanceId, index) {
      const slotLabel = `Status row slot ${index + 1}`;
      list.append(cardInstanceId ? createCardListItem(cardInstanceId, slotLabel) : createEmptySlotItem(slotLabel));
    }); // end status-slot loop
  } // end renderStatusRow function

  function renderCharacterPanel(entity) {
    const panel = createElement("article", {
      className: "character-panel"
    }); // end character panel
    const heading = createElement("h4", {
      text: entity.name
    }); // end character panel heading
    const summary = createElement("p", {
      text: `Current row: ${entity.currentRow}. Damage: ${entity.damage}. Maximum HP: ${entity.maximumHp}. Heat: ${entity.heat}.`
    }); // end character panel summary

    const characterCardActions = createElement("div", {
      className: "card-actions"
    }); // end character-card actions
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
    renderStatusRow(entity, statusList);

    panel.append(
      heading,
      summary,
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
    const entities = Object.values(application.runtimeState.entities || {});

    if (entities.length === 0) {
      elements.characterAreas.append(createElement("p", { text: "No entities are present in this runtime state." }));
      return;
    } // end empty-entities branch

    entities.forEach(function renderEntityArea(entity) {
      elements.characterAreas.append(renderCharacterPanel(entity));
    }); // end entity-area loop
  } // end renderCharacterAreas function

  function describeZone(zoneName, cardInstanceIds, hiddenCardCount) {
    const card = createElement("article", {
      className: "zone-card"
    }); // end zone card
    const heading = createElement("h4", { text: zoneName });
    const count = createElement("p", {
      text: hiddenCardCount ? `${cardInstanceIds.length} face-down card(s).` : `${cardInstanceIds.length} card(s).`
    }); // end zone count

    card.append(heading, count);

    if (!hiddenCardCount && cardInstanceIds.length > 0) {
      const list = createElement("ul", { className: "card-list" });
      cardInstanceIds.forEach(function renderZoneCard(cardInstanceId) {
        list.append(createCardListItem(cardInstanceId));
      }); // end zone-card loop
      card.append(list);
    } // end face-up-zone branch

    return card;
  } // end describeZone function

  function renderZones() {
    clearElement(elements.zoneSummary);
    const zones = application.runtimeState.zones;
    const zoneConfigurations = [
      ["Dungeon Deck", zones.dungeonDeck || [], true],
      ["Dungeon Discard Pile", zones.dungeonDiscardPile || [], false],
      ["Dungeon Loot Area", zones.dungeonLootArea || [], false],
      ["Loot Deck", zones.lootDeck || [], true],
      ["Loot Discard Pile", zones.lootDiscardPile || [], false],
      ["Expended Summons", zones.expendedSummons || [], false]
    ]; // end zone configurations array

    zoneConfigurations.forEach(function renderZoneConfiguration(configuration) {
      elements.zoneSummary.append(describeZone(configuration[0], configuration[1], configuration[2]));
    }); // end zone-configuration loop
  } // end renderZones function

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
      }));
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
    }); // end card-details rules text
    const tagsHeading = createElement("h5", { text: "Tags" });
    const tags = createElement("p", {
      text: Array.isArray(definition.tags) && definition.tags.length > 0 ? definition.tags.join(", ") : "No tags recorded."
    }); // end card-details tags

    elements.cardDetails.append(name, metadata, rulesHeading, rulesText, tagsHeading, tags);
  } // end renderCardDetails function

  function renderTabletop() {
    const state = application.runtimeState;
    elements.tabletop.hidden = false;
    elements.tabletopHeading.textContent = state.scenarioName || state.scenarioId || "Loaded playtest state";
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
    } // end runtime-state-required-key loop

    if (!state.zones.playerFormation || !state.zones.enemyFormation || !Array.isArray(state.zones.dungeonDeck)) {
      throw new Error("The runtime state is missing one or more required formation or Dungeon Deck zones.");
    } // end runtime-state-zone validation
  } // end validateRuntimeState function

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
      validateRuntimeState(state);
      application.runtimeState = state;
      application.selectedCardInstanceId = null;
      renderTabletop();
      setLoadStatus(`Loaded ${sourceLabel}.`, "success");
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
        validateRuntimeState(state);
        application.runtimeState = state;
        application.selectedCardInstanceId = null;
        renderTabletop();
        setLoadStatus(`Loaded ${file.name}.`, "success");
      } catch (error) {
        setLoadStatus(`Could not read ${file.name}: ${error.message}`, "error");
      } // end state-file parse try-catch
    }); // end state-file load listener

    reader.addEventListener("error", function handleStateFileError() {
      setLoadStatus(`Could not read ${file.name}.`, "error");
    }); // end state-file error listener

    reader.readAsText(file);
  } // end loadRuntimeStateFromFile function

  function bindEvents() {
    elements.loadLocalStateButton.disabled = true;

    elements.loadLocalStateButton.addEventListener("click", function handleLoadLocalState() {
      loadRuntimeStateFromUrl(DEFAULT_STATE_URL, "the local initial state");
    }); // end local-state button listener

    elements.stateFileInput.addEventListener("change", function handleStateFileChange(event) {
      const selectedFile = event.target.files && event.target.files[0];
      loadRuntimeStateFromFile(selectedFile);
    }); // end state-file input listener
  } // end bindEvents function

  bindEvents();
  loadCatalog();
}()); // end initializePlaytestTabletop IIFE
