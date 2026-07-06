(function initializePlaytestConsole() {
  "use strict";

  const CONSOLE_ID = "playtest-console";
  const COMMAND_INPUT_ID = "playtest-command-input";
  const RESULT_ID = "playtest-console-result";
  const HISTORY_ID = "playtest-console-history";
  const FRIENDLY_PREFIX = "F";
  const ENEMY_PREFIX = "E";

  const state = {
    friendlies: [],
    enemies: [],
    undoStack: [],
    redoStack: [],
    nextFriendlyIndex: -1,
    nextEnemyIndex: -1,
    reindexScheduled: false,
    pendingRevealFocus: false
  }; // end console state object

  function createElement(tagName, options) {
    const element = document.createElement(tagName);
    const settings = options || {};

    if (settings.id) {
      element.id = settings.id;
    } // end id branch

    if (settings.className) {
      element.className = settings.className;
    } // end class-name branch

    if (settings.text !== undefined) {
      element.textContent = settings.text;
    } // end text branch

    if (settings.attributes) {
      Object.entries(settings.attributes).forEach(function applyAttribute(entry) {
        element.setAttribute(entry[0], String(entry[1]));
      }); // end attribute loop
    } // end attributes branch

    return element;
  } // end createElement function

  function getConsoleElement() {
    return document.getElementById(CONSOLE_ID);
  } // end getConsoleElement function

  function getCommandInput() {
    return document.getElementById(COMMAND_INPUT_ID);
  } // end getCommandInput function

  function getResultElement() {
    return document.getElementById(RESULT_ID);
  } // end getResultElement function

  function getHistoryElement() {
    return document.getElementById(HISTORY_ID);
  } // end getHistoryElement function

  function announce(message) {
    const result = getResultElement();

    if (result) {
      result.textContent = message;
    } // end result-element branch
  } // end announce function

  function getNumber(value, fallbackValue) {
    const numericValue = Number(value);
    return Number.isInteger(numericValue) ? numericValue : fallbackValue;
  } // end getNumber function

  function clamp(value, lowerBound, upperBound) {
    const lowerClamped = Math.max(lowerBound, value);
    return typeof upperBound === "number" ? Math.min(upperBound, lowerClamped) : lowerClamped;
  } // end clamp function

  function isEditableTarget(target) {
    const element = target instanceof Element ? target : null;

    if (!element) {
      return false;
    } // end non-element branch

    return Boolean(element.closest("input, textarea, select, [contenteditable='true']"));
  } // end isEditableTarget function

  function getRowKind(rowHeadingText) {
    if (/^Player\s+(Front|Back)\s+Row$/i.test(rowHeadingText)) {
      return "friendly";
    } // end friendly-row branch

    if (/^Enemy\s+(Front|Back)\s+Row$/i.test(rowHeadingText)) {
      return "enemy";
    } // end enemy-row branch

    return null;
  } // end getRowKind function

  function cleanEntityName(value) {
    return String(value || "").replace(/^Slot\s+\d+\s*:\s*/i, "").trim() || "Unnamed entity";
  } // end cleanEntityName function

  function findCounterInput(card, counterName) {
    return card.querySelector(`input[id$="-${counterName}-input"]`);
  } // end findCounterInput function

  function getEntityTokenFromInputId(inputId) {
    const baseId = String(inputId || "").replace(/-(damage|heat)-input$/i, "");
    const match = baseId.match(/^formation-(?:playerFront|playerBack|enemyFront|enemyBack)-\d+-(.+)$/i);
    return match ? match[1] : null;
  } // end getEntityTokenFromInputId function

  function readPositiveInteger(value) {
    const numericValue = Number(String(value === null || value === undefined ? "" : value).trim());
    return Number.isInteger(numericValue) && numericValue > 0 ? numericValue : null;
  } // end readPositiveInteger function

  function readMaximumHpFromText(value) {
    const text = String(value || "").replace(/\s+/g, " ").trim();

    if (!text) {
      return null;
    } // end empty-text branch

    const patterns = [
      /(?:maximum|max)\s*(?:hp|health|hit points?)\s*[:=]\s*(\d+)\b/i,
      /\b(\d+)\s+(?:maximum|max)\s*(?:hp|health|hit points?)\b/i,
      /(?:hp|health|hit points?)\s*[:=]?\s*\d+\s*(?:of|\/)\s*(\d+)\b/i,
      /\b\d+\s*(?:of|\/)\s*(\d+)\s*(?:hp|health|hit points?)\b/i,
      /damage\s*[:=]?\s*\d+\s*(?:of|\/)\s*(\d+)\b/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);

      if (!match) {
        continue;
      } // end no-match branch

      const maximumHp = readPositiveInteger(match[1]);

      if (maximumHp !== null) {
        return maximumHp;
      } // end valid-maximum branch
    } // end maximum-HP pattern loop

    return null;
  } // end readMaximumHpFromText function

  function readMaximumHp(card) {
    if (!card) {
      return null;
    } // end missing-card branch

    const damageInput = findCounterInput(card, "damage");
    const attributeNames = [
      "data-max-hp",
      "data-maximum-hp",
      "data-max-health",
      "data-maximum-health",
      "data-hit-points",
      "data-max-hit-points"
    ];
    const datasetNames = [
      "maxHp",
      "maximumHp",
      "maxHealth",
      "maximumHealth",
      "hitPoints",
      "maxHitPoints"
    ];
    const elements = [card, damageInput].filter(function keepExistingElement(element) {
      return Boolean(element);
    }); // end existing-element filter

    for (const element of elements) {
      for (const attributeName of attributeNames) {
        const maximumHp = readPositiveInteger(element.getAttribute(attributeName));

        if (maximumHp !== null) {
          return maximumHp;
        } // end attribute-maximum branch
      } // end maximum-HP attribute loop

      if (element.dataset) {
        for (const datasetName of datasetNames) {
          const maximumHp = readPositiveInteger(element.dataset[datasetName]);

          if (maximumHp !== null) {
            return maximumHp;
          } // end dataset-maximum branch
        } // end maximum-HP dataset loop
      } // end dataset branch
    } // end source-element loop

    const metadataElements = [
      card.querySelector(".card-meta"),
      card.querySelector(".entity-meta"),
      card.querySelector(".entity-stats"),
      card.querySelector(".combat-stats"),
      card.querySelector("[data-stat='hp']"),
      card.querySelector("[data-stat='max-hp']"),
      card.querySelector("[data-stat='maximum-hp']")
    ].filter(function keepExistingMetadata(element) {
      return Boolean(element);
    }); // end existing-metadata filter

    for (const metadata of metadataElements) {
      const maximumHp = readMaximumHpFromText(metadata.textContent);

      if (maximumHp !== null) {
        return maximumHp;
      } // end metadata-maximum branch
    } // end metadata-element loop

    return readMaximumHpFromText(card.textContent);
  } // end readMaximumHp function

  function readDefense(card) {
    const metadata = card.querySelector(".card-meta");
    const match = metadata ? metadata.textContent.match(/Defense\s+(\d+)\./i) : null;
    return match ? getNumber(match[1], null) : null;
  } // end readDefense function

  function readRulesText(card) {
    const rulesElement = card.querySelector(".inline-card-rules .card-rules");
    return rulesElement ? rulesElement.textContent.trim().replace(/\s+/g, " ") : "";
  } // end readRulesText function

  function createEntityDescriptor(card, kind, rowName, ordinal) {
    const heading = card.querySelector(":scope > strong") || card.querySelector("strong");
    const damageInput = findCounterInput(card, "damage");
    const heatInput = findCounterInput(card, "heat");

    if (!heading || !damageInput) {
      return null;
    } // end incomplete-entity-card branch

    const key = `${kind === "friendly" ? FRIENDLY_PREFIX : ENEMY_PREFIX}${ordinal}`;
    const name = cleanEntityName(heading.textContent);
    const maximumHp = readMaximumHp(card);
    const damage = getNumber(damageInput.value, 0);
    const heat = heatInput ? getNumber(heatInput.value, 0) : null;
    const defense = readDefense(card);

    heading.id = `playtest-console-${key.toLowerCase()}-heading`;
    heading.tabIndex = -1;
    heading.setAttribute("role", "heading");
    heading.setAttribute("aria-level", "4");
    heading.setAttribute("aria-label", buildEntityDescription({
      key,
      name,
      rowName,
      maximumHp,
      damage,
      heat,
      defense,
      rulesText: readRulesText(card)
    }, false));

    return {
      key,
      kind,
      name,
      rowName,
      card,
      heading,
      entityToken: getEntityTokenFromInputId(damageInput.id),
      damageInputId: damageInput.id,
      heatInputId: heatInput ? heatInput.id : null,
      maximumHp,
      damage,
      heat,
      defense,
      rulesText: readRulesText(card)
    }; // end entity descriptor object
  } // end createEntityDescriptor function

  function refreshEntityIndex() {
    const formationGrid = document.getElementById("formation-grid");

    state.friendlies = [];
    state.enemies = [];

    if (!formationGrid) {
      return;
    } // end missing-formation-grid branch

    Array.from(formationGrid.querySelectorAll(".formation-row")).forEach(function indexFormationRow(row) {
      const rowHeading = row.querySelector(":scope > h4");
      const rowName = rowHeading ? rowHeading.textContent.trim() : "";
      const kind = getRowKind(rowName);

      if (!kind) {
        return;
      } // end unsupported-row branch

      Array.from(row.querySelectorAll("li.entity-card")).forEach(function indexEntityCard(card) {
        const ordinal = kind === "friendly" ? state.friendlies.length + 1 : state.enemies.length + 1;
        const descriptor = createEntityDescriptor(card, kind, rowName, ordinal);

        if (descriptor) {
          if (kind === "friendly") {
            state.friendlies.push(descriptor);
          } else {
            state.enemies.push(descriptor);
          } // end entity-kind branch
        } // end descriptor branch
      }); // end formation-card loop
    }); // end formation-row loop
  } // end refreshEntityIndex function

  function scheduleEntityIndexRefresh() {
    if (state.reindexScheduled) {
      return;
    } // end existing-scheduled-refresh branch

    state.reindexScheduled = true;

    window.requestAnimationFrame(function runScheduledEntityIndexRefresh() {
      state.reindexScheduled = false;
      refreshEntityIndex();
    }); // end scheduled-index-refresh callback
  } // end scheduleEntityIndexRefresh function

  function getEntityByKey(key) {
    const normalizedKey = String(key || "").toUpperCase();
    const match = normalizedKey.match(/^([FE])(\d+)$/);

    if (!match) {
      return null;
    } // end invalid-entity-key branch

    const collection = match[1] === FRIENDLY_PREFIX ? state.friendlies : state.enemies;
    return collection[getNumber(match[2], 0) - 1] || null;
  } // end getEntityByKey function

  function getEntityByToken(entityToken) {
    const normalizedToken = String(entityToken || "");
    const allEntities = state.friendlies.concat(state.enemies);

    return allEntities.find(function findEntityByToken(entity) {
      return entity.entityToken === normalizedToken;
    }) || null;
  } // end getEntityByToken function

  function getCollectionForTarget(target) {
    const normalizedTarget = String(target || "").toUpperCase();

    if (normalizedTarget === "F*") {
      return state.friendlies.slice();
    } // end all-friendly branch

    if (normalizedTarget === "E*") {
      return state.enemies.slice();
    } // end all-enemy branch

    const entity = getEntityByKey(normalizedTarget);
    return entity ? [entity] : [];
  } // end getCollectionForTarget function

  function getCurrentCounterValue(entity, counterName) {
    const inputId = counterName === "heat" ? entity.heatInputId : entity.damageInputId;
    const input = inputId ? document.getElementById(inputId) : null;
    return input ? getNumber(input.value, 0) : null;
  } // end getCurrentCounterValue function

  function buildEntityDescription(entity, includeRulesText) {
    const maximumHpText = Number.isInteger(entity.maximumHp) ? String(entity.maximumHp) : "unknown maximum";
    const currentHp = Number.isInteger(entity.maximumHp) ? Math.max(0, entity.maximumHp - entity.damage) : null;
    const parts = [
      `${entity.key}: ${entity.name}`,
      entity.rowName,
      currentHp === null ? `Damage ${entity.damage} of ${maximumHpText} HP` : `HP ${currentHp} of ${entity.maximumHp}; Damage ${entity.damage}`
    ];

    if (entity.heat !== null && entity.heat !== undefined) {
      parts.push(`Heat ${entity.heat}`);
    } // end heat-summary branch

    if (entity.defense !== null && entity.defense !== undefined) {
      parts.push(`Defense ${entity.defense}`);
    } // end defense-summary branch

    if (includeRulesText && entity.rulesText) {
      parts.push(`Rules: ${entity.rulesText}`);
    } // end rules-summary branch

    return `${parts.join(". ")}.`;
  } // end buildEntityDescription function

  function describeEntities(entities, includeRulesText) {
    if (entities.length === 0) {
      return "No matching active formation entities were found.";
    } // end no-entity branch

    return entities.map(function describeEntity(entity) {
      const currentDamage = getCurrentCounterValue(entity, "damage");
      const currentHeat = entity.heatInputId ? getCurrentCounterValue(entity, "heat") : null;
      const currentEntity = Object.assign({}, entity, {
        damage: currentDamage === null ? entity.damage : currentDamage,
        heat: currentHeat === null ? entity.heat : currentHeat
      }); // end refreshed-entity object

      return buildEntityDescription(currentEntity, includeRulesText);
    }).join(" ");
  } // end describeEntities function

  function focusElement(element, missingMessage) {
    if (!element || typeof element.focus !== "function") {
      announce(missingMessage || "The requested destination is unavailable.");
      return false;
    } // end unavailable-focus-target branch

    element.focus();
    return true;
  } // end focusElement function

  function focusEntityByKey(key) {
    refreshEntityIndex();
    const entity = getEntityByKey(key);

    if (!entity) {
      announce(`${String(key).toUpperCase()} is not available in the current formation.`);
      return false;
    } // end missing-entity branch

    return focusElement(entity.heading, `${entity.key} cannot receive focus right now.`);
  } // end focusEntityByKey function

  function focusDungeonReveal() {
    const revealPanel = Array.from(document.querySelectorAll("#zone-summary .zone-card")).find(function findRevealPanel(panel) {
      const heading = panel.querySelector(":scope > h4");
      return heading && heading.textContent.trim() === "Dungeon Reveal Area";
    }) || null;

    if (!revealPanel) {
      announce("The Dungeon Reveal Area is not available.");
      return false;
    } // end missing-reveal-panel branch

    const heading = revealPanel.querySelector(":scope > h4");

    if (!heading) {
      announce("The Dungeon Reveal Area heading is not available.");
      return false;
    } // end missing-reveal-heading branch

    heading.id = "dungeon-reveal-area-heading";
    heading.tabIndex = -1;
    heading.focus();
    return true;
  } // end focusDungeonReveal function

  function focusNamedSection(sectionId, message) {
    const section = document.getElementById(sectionId);
    const heading = section ? section.querySelector(":scope > h3") : null;

    if (!heading) {
      announce(message || "The requested playtest section is not available.");
      return false;
    } // end missing-section-heading branch

    heading.tabIndex = -1;
    heading.focus();
    return true;
  } // end focusNamedSection function

  function focusNextEntity(kind, direction) {
    refreshEntityIndex();

    const entities = kind === "friendly" ? state.friendlies : state.enemies;

    if (entities.length === 0) {
      announce(`No active ${kind === "friendly" ? "friendly" : "enemy"} entities are in formation.`);
      return false;
    } // end empty-entity-list branch

    const indexProperty = kind === "friendly" ? "nextFriendlyIndex" : "nextEnemyIndex";
    const normalizedDirection = direction < 0 ? -1 : 1;
    const nextIndex = ((state[indexProperty] + normalizedDirection) % entities.length + entities.length) % entities.length;

    state[indexProperty] = nextIndex;
    return focusElement(entities[nextIndex].heading, "The selected entity cannot receive focus.");
  } // end focusNextEntity function

  function setNativeInputValue(input, value) {
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");

    if (valueSetter && typeof valueSetter.set === "function") {
      valueSetter.set.call(input, String(value));
    } else {
      input.value = String(value);
    } // end native-value-setter branch

    input.dispatchEvent(new Event("change", { bubbles: true }));
  } // end setNativeInputValue function

  function makeCounterChange(entity, requestedProperty, requestedValue) {
    const property = String(requestedProperty || "").toLowerCase();
    const valueText = String(requestedValue || "").trim();
    const isRelative = /^[+-]/.test(valueText);
    const parsedValue = Number(valueText);

    if (!Number.isInteger(parsedValue)) {
      throw new Error("Counter values must be whole numbers.");
    } // end invalid-counter-value branch

    if (property === "heat" && entity.kind !== "friendly") {
      throw new Error(`${entity.key} is an enemy. Heat is tracked only for friendly entities.`);
    } // end enemy-heat branch

    if (property === "hp") {
      if (!Number.isInteger(entity.maximumHp)) {
        throw new Error(`${entity.key} does not expose a numeric maximum HP value.`);
      } // end unavailable-maximum-hp branch

      const currentDamage = getCurrentCounterValue(entity, "damage");
      const currentHp = Math.max(0, entity.maximumHp - currentDamage);
      const nextHp = isRelative ? clamp(currentHp + parsedValue, 0, entity.maximumHp) : clamp(parsedValue, 0, entity.maximumHp);

      return {
        target: entity.key,
        entityToken: entity.entityToken,
        counterName: "damage",
        from: currentDamage,
        to: entity.maximumHp - nextHp,
        displayProperty: "HP",
        displayFrom: currentHp,
        displayTo: nextHp
      }; // end HP-derived-change object
    } // end HP branch

    const counterName = property === "heat" ? "heat" : "damage";
    const currentValue = getCurrentCounterValue(entity, counterName);

    if (currentValue === null) {
      throw new Error(`${entity.key} does not expose a ${counterName} control.`);
    } // end missing-counter-control branch

    const nextValue = isRelative ? Math.max(0, currentValue + parsedValue) : Math.max(0, parsedValue);

    return {
      target: entity.key,
      entityToken: entity.entityToken,
      counterName,
      from: currentValue,
      to: nextValue,
      displayProperty: counterName === "heat" ? "Heat" : "Damage",
      displayFrom: currentValue,
      displayTo: nextValue
    }; // end direct-counter-change object
  } // end makeCounterChange function

  function applyChange(change, usePreviousValue) {
    refreshEntityIndex();

    const entity = change.entityToken ? getEntityByToken(change.entityToken) : getEntityByKey(change.target);
    const counterName = change.counterName;
    const inputId = entity ? (counterName === "heat" ? entity.heatInputId : entity.damageInputId) : null;
    const input = inputId ? document.getElementById(inputId) : null;
    const targetValue = usePreviousValue ? change.from : change.to;

    if (!entity || !input) {
      throw new Error(`Could not find ${change.target}'s ${counterName} control. The entity may have moved or left formation.`);
    } // end missing-change-target branch

    setNativeInputValue(input, targetValue);
    refreshEntityIndex();
  } // end applyChange function

  function renderHistory() {
    const historyList = getHistoryElement();

    if (!historyList) {
      return;
    } // end missing-history-list branch

    historyList.replaceChildren();

    const recentEntries = state.undoStack.slice(-8).reverse();

    if (recentEntries.length === 0) {
      historyList.append(createElement("li", { text: "No console changes recorded yet." }));
      return;
    } // end empty-history branch

    recentEntries.forEach(function renderHistoryEntry(entry) {
      historyList.append(createElement("li", { text: entry.label }));
    }); // end history-entry loop
  } // end renderHistory function

  function applyChanges(changes, label, recordHistory) {
    changes.forEach(function applyOneChange(change) {
      applyChange(change, false);
    }); // end change-application loop

    if (recordHistory) {
      state.undoStack.push({ label, changes }); // end undo-history-entry object
      state.redoStack = [];
      renderHistory();
    } // end history-recording branch
  } // end applyChanges function

  function undoLastChange() {
    const entry = state.undoStack.pop();

    if (!entry) {
      announce("There is no console counter change to undo.");
      return;
    } // end missing-undo-entry branch

    try {
      entry.changes.slice().reverse().forEach(function undoOneChange(change) {
        applyChange(change, true);
      }); // end reverse-change loop

      state.redoStack.push(entry);
      renderHistory();
      announce(`Undid: ${entry.label}`);
    } catch (error) {
      state.undoStack.push(entry);
      announce(`Undo failed: ${error.message}`);
    } // end undo try-catch
  } // end undoLastChange function

  function redoLastChange() {
    const entry = state.redoStack.pop();

    if (!entry) {
      announce("There is no console counter change to redo.");
      return;
    } // end missing-redo-entry branch

    try {
      entry.changes.forEach(function redoOneChange(change) {
        applyChange(change, false);
      }); // end redo-change loop

      state.undoStack.push(entry);
      renderHistory();
      announce(`Redid: ${entry.label}`);
    } catch (error) {
      state.redoStack.push(entry);
      announce(`Redo failed: ${error.message}`);
    } // end redo try-catch
  } // end redoLastChange function

  function normalizeCommand(rawCommand) {
    let command = String(rawCommand || "").trim().replace(/\s+/g, " ");

    command = command.replace(/^(friendly|friend|f)(\d+|\*)\.(?:set)?(hp|damage|heat)\b\s*/i, function normalizeFriendlyDottedCommand(match, prefix, number, property) {
      return `F${number} ${property} `;
    }); // end friendly-dotted-command normalization

    command = command.replace(/^(enemy|e)(\d+|\*)\.(?:set)?(hp|damage|heat)\b\s*/i, function normalizeEnemyDottedCommand(match, prefix, number, property) {
      return `E${number} ${property} `;
    }); // end enemy-dotted-command normalization

    command = command.replace(/^(friendly|friend)\s*(\d+|\*)\b/i, function normalizeFriendlyTarget(match, prefix, number) {
      return `F${number}`;
    }); // end friendly-target normalization

    command = command.replace(/^enemy\s*(\d+|\*)\b/i, function normalizeEnemyTarget(match, number) {
      return `E${number}`;
    }); // end enemy-target normalization

    return command.trim();
  } // end normalizeCommand function

  function showHelp() {
    announce("Commands: F1 or E1 reads entity stats. Friendlies or Enemies reads all active entities. F1 HP, F1 HP = 8, F1 HP +2, F1 Damage -1, F1 Heat +1. F* Damage +1 changes every active friendly. E* Damage +1 changes every active enemy. Use Draw, Jump Reveal, Jump F1, Undo, or Redo.");
  } // end showHelp function

  function executeJumpCommand(target) {
    const normalizedTarget = String(target || "").trim().toUpperCase();

    if (normalizedTarget === "REVEAL" || normalizedTarget === "DUNGEON" || normalizedTarget === "DUNGEON REVEAL") {
      focusDungeonReveal();
      return;
    } // end reveal-jump branch

    if (normalizedTarget === "FORMATION") {
      focusNamedSection("formation-section", "The Formation section is unavailable.");
      return;
    } // end formation-jump branch

    if (normalizedTarget === "LOG") {
      focusNamedSection("log-section", "The Playtest Log section is unavailable.");
      return;
    } // end log-jump branch

    if (normalizedTarget === "CONSOLE") {
      const input = getCommandInput();
      focusElement(input, "The command input is unavailable.");
      return;
    } // end console-jump branch

    if (/^[FE]\d+$/i.test(normalizedTarget)) {
      focusEntityByKey(normalizedTarget);
      return;
    } // end entity-jump branch

    announce(`Unknown jump target: ${target}. Use Reveal, Formation, Log, Console, F1, or E1.`);
  } // end executeJumpCommand function

  function executeCounterCommand(target, property, valueText) {
    refreshEntityIndex();

    const entities = getCollectionForTarget(target);

    if (entities.length === 0) {
      announce(`${String(target).toUpperCase()} does not match an active formation entity.`);
      return;
    } // end missing-target-entities branch

    if (!valueText) {
      if (property.toLowerCase() === "hp") {
        const summaries = entities.map(function summarizeHp(entity) {
          const currentDamage = getCurrentCounterValue(entity, "damage");
          const currentHp = Number.isInteger(entity.maximumHp) ? Math.max(0, entity.maximumHp - currentDamage) : null;
          return currentHp === null ? `${entity.key} has no numeric maximum HP.` : `${entity.key} HP is ${currentHp} of ${entity.maximumHp}.`;
        }); // end HP-summary map

        announce(summaries.join(" "));
        return;
      } // end HP-inspection branch

      const counterName = property.toLowerCase() === "heat" ? "heat" : "damage";
      const summaries = entities.map(function summarizeCounter(entity) {
        const currentValue = getCurrentCounterValue(entity, counterName);
        return currentValue === null ? `${entity.key} does not track ${counterName}.` : `${entity.key} ${counterName} is ${currentValue}.`;
      }); // end counter-summary map

      announce(summaries.join(" "));
      return;
    } // end property-inspection branch

    try {
      const changes = entities.map(function createChange(entity) {
        return makeCounterChange(entity, property, valueText);
      }); // end counter-change map

      const label = `${String(target).toUpperCase()} ${property.toUpperCase()} ${valueText}`;
      applyChanges(changes, label, true);

      const resultParts = changes.map(function summarizeChange(change) {
        return `${change.target} ${change.displayProperty} ${change.displayFrom} to ${change.displayTo}`;
      }); // end change-summary map

      announce(`${resultParts.join(". ")}.`);
    } catch (error) {
      announce(`Command failed: ${error.message}`);
    } // end counter-command try-catch
  } // end executeCounterCommand function

  function executeCommand(rawCommand) {
    const command = normalizeCommand(rawCommand);

    if (!command) {
      return;
    } // end empty-command branch

    if (/^(help|\?)$/i.test(command)) {
      showHelp();
      return;
    } // end help-command branch

    if (/^undo$/i.test(command)) {
      undoLastChange();
      return;
    } // end undo-command branch

    if (/^redo$/i.test(command)) {
      redoLastChange();
      return;
    } // end redo-command branch

    if (/^draw$/i.test(command)) {
      const drawButton = document.getElementById("draw-dungeon-card-button");

      if (!drawButton || drawButton.disabled) {
        announce("Draw is unavailable. Load a playtest state with a Dungeon Deck first.");
        return;
      } // end unavailable-draw branch

      drawButton.click();
      return;
    } // end draw-command branch

    const jumpMatch = command.match(/^jump\s+(.+)$/i);

    if (jumpMatch) {
      executeJumpCommand(jumpMatch[1]);
      return;
    } // end jump-command branch

    if (/^(friendlies|friendly|f\*)$/i.test(command)) {
      refreshEntityIndex();
      announce(describeEntities(state.friendlies, false));
      return;
    } // end friendly-list-command branch

    if (/^(enemies|enemy|e\*)$/i.test(command)) {
      refreshEntityIndex();
      announce(describeEntities(state.enemies, true));
      return;
    } // end enemy-list-command branch

    const entityMatch = command.match(/^([FE])(\d+|\*)(?:\s+(.*))?$/i);

    if (!entityMatch) {
      announce(`I did not recognize "${rawCommand}". Type Help for command examples.`);
      return;
    } // end unknown-command branch

    const target = `${entityMatch[1].toUpperCase()}${entityMatch[2]}`;
    const remainder = String(entityMatch[3] || "").trim();

    if (!remainder || /^stats?$/i.test(remainder)) {
      refreshEntityIndex();
      announce(describeEntities(getCollectionForTarget(target), target.startsWith(ENEMY_PREFIX)));
      return;
    } // end entity-inspection branch

    const propertyMatch = remainder.match(/^(hp|damage|heat)(?:\s+(?:set\s+)?(=?[+-]?\d+))?$/i);

    if (!propertyMatch) {
      announce(`I did not recognize the action "${remainder}". Try ${target} HP, ${target} Damage +1, or Jump ${target}.`);
      return;
    } // end invalid-entity-action branch

    const property = propertyMatch[1];
    const rawValue = propertyMatch[2] ? propertyMatch[2].replace(/^=/, "") : "";
    executeCounterCommand(target, property, rawValue);
  } // end executeCommand function

  function createConsole() {
    const existingConsole = getConsoleElement();

    if (existingConsole) {
      return existingConsole;
    } // end existing-console branch

    const tabletop = document.getElementById("tabletop");
    const manualControls = document.getElementById("manual-controls-section");

    if (!tabletop || !manualControls) {
      return null;
    } // end missing-tabletop-target branch

    const section = createElement("section", {
      id: CONSOLE_ID,
      className: "tabletop-section playtest-console",
      attributes: {
        "aria-labelledby": "playtest-console-heading"
      }
    }); // end console-section element

    const heading = createElement("h3", {
      id: "playtest-console-heading",
      text: "Playtest Command Console"
    }); // end console-heading element

    const description = createElement("p", {
      text: "Use short commands to inspect active entities, change test counters, move focus, draw a Dungeon Card, and undo direct console counter changes."
    }); // end console-description element

    const shortcuts = createElement("p", {
      className: "hint",
      text: "Keyboard shortcuts outside text fields: Alt+Shift+P focuses this console; Alt+Shift+R moves to Dungeon Reveal; Alt+Shift+F and Alt+Shift+E cycle friendly and enemy entities."
    }); // end console-shortcuts element

    const jumpActions = createElement("div", {
      className: "playtest-console-actions",
      attributes: {
        "aria-label": "Playtest console focus shortcuts"
      }
    }); // end focus-shortcut group

    const focusConsoleButton = createElement("button", {
      text: "Focus command input",
      attributes: { type: "button" }
    }); // end focus-console button

    const focusRevealButton = createElement("button", {
      text: "Jump to Dungeon Reveal",
      attributes: { type: "button" }
    }); // end focus-reveal button

    const previousFriendlyButton = createElement("button", {
      text: "Previous friendly entity",
      attributes: { type: "button" }
    }); // end previous-friendly button

    const nextFriendlyButton = createElement("button", {
      text: "Next friendly entity",
      attributes: { type: "button" }
    }); // end next-friendly button

    const previousEnemyButton = createElement("button", {
      text: "Previous enemy entity",
      attributes: { type: "button" }
    }); // end previous-enemy button

    const nextEnemyButton = createElement("button", {
      text: "Next enemy entity",
      attributes: { type: "button" }
    }); // end next-enemy button

    focusConsoleButton.addEventListener("click", function handleFocusConsoleClick() {
      focusElement(getCommandInput(), "The command input is unavailable.");
    }); // end focus-console listener

    focusRevealButton.addEventListener("click", function handleFocusRevealClick() {
      focusDungeonReveal();
    }); // end focus-reveal listener

    previousFriendlyButton.addEventListener("click", function handlePreviousFriendlyClick() {
      focusNextEntity("friendly", -1);
    }); // end previous-friendly listener

    nextFriendlyButton.addEventListener("click", function handleNextFriendlyClick() {
      focusNextEntity("friendly", 1);
    }); // end next-friendly listener

    previousEnemyButton.addEventListener("click", function handlePreviousEnemyClick() {
      focusNextEntity("enemy", -1);
    }); // end previous-enemy listener

    nextEnemyButton.addEventListener("click", function handleNextEnemyClick() {
      focusNextEntity("enemy", 1);
    }); // end next-enemy listener

    jumpActions.append(
      focusConsoleButton,
      focusRevealButton,
      previousFriendlyButton,
      nextFriendlyButton,
      previousEnemyButton,
      nextEnemyButton
    ); // end focus-shortcut controls

    const form = createElement("form", {
      className: "playtest-console-form",
      attributes: {
        "aria-describedby": "playtest-console-help"
      }
    }); // end command-form element

    const inputLabel = createElement("label", {
      text: "Command",
      attributes: {
        for: COMMAND_INPUT_ID
      }
    }); // end command-input label

    const input = createElement("input", {
      id: COMMAND_INPUT_ID,
      attributes: {
        type: "text",
        autocomplete: "off",
        spellcheck: "false",
        placeholder: "Examples: F1, E1 HP +2, F* Heat -1, Enemies, Draw, Jump Reveal"
      }
    }); // end command-input element

    const submitButton = createElement("button", {
      text: "Run command",
      attributes: {
        type: "submit"
      }
    }); // end command-submit button

    form.addEventListener("submit", function handleCommandSubmit(event) {
      event.preventDefault();
      const rawCommand = input.value;
      executeCommand(rawCommand);
      input.select();
    }); // end command-form submit listener

    form.append(inputLabel, input, submitButton);

    const result = createElement("p", {
      id: RESULT_ID,
      className: "status-message",
      text: "Console ready. Type Help for command examples.",
      attributes: {
        role: "status",
        "aria-live": "polite"
      }
    }); // end console-result element

    const help = createElement("details", {
      id: "playtest-console-help",
      className: "playtest-console-help"
    }); // end console-help details

    const helpSummary = createElement("summary", {
      text: "Command reference"
    }); // end help-summary element

    const helpList = createElement("ul"); // end help-list element
    [
      "F1 or E1: report that entity's current combat summary. Enemies include their printed rules text.",
      "Friendlies or Enemies: report every active formation entity.",
      "F1 HP, F1 HP = 8, F1 HP +2: inspect, set, or adjust current HP. HP commands translate into the existing Damage counter.",
      "F1 Damage -1, F1 Heat +1, E1 Damage +2: inspect or change tracked counters.",
      "F* Damage +1, F* Heat -1, E* Damage +1: change every active entity of that side.",
      "Friendly1.HP, Friendly1.SetHP +2, and Enemy1.Damage +1 are accepted aliases.",
      "Draw: activate Draw top Dungeon Card and move focus to the Dungeon Reveal Area.",
      "Jump Reveal, Jump F1, Jump E1, Jump Formation, Jump Log, Jump Console: move focus.",
      "Undo and Redo: reverse or repeat direct console counter changes. They do not undo deck draws, card movement, or other manual table actions."
    ].forEach(function appendHelpItem(itemText) {
      helpList.append(createElement("li", { text: itemText }));
    }); // end help-item loop

    help.append(helpSummary, helpList);

    const historyHeading = createElement("h4", {
      text: "Console counter history"
    }); // end history-heading element

    const history = createElement("ol", {
      id: HISTORY_ID,
      className: "playtest-console-history"
    }); // end history-list element

    section.append(
      heading,
      description,
      shortcuts,
      jumpActions,
      form,
      result,
      help,
      historyHeading,
      history
    ); // end console-section content

    tabletop.insertBefore(section, manualControls);

    const sectionNavigation = document.querySelector(".section-nav");

    if (sectionNavigation && !sectionNavigation.querySelector(`a[href="#${CONSOLE_ID}"]`)) {
      const link = createElement("a", {
        text: "Playtest console",
        attributes: {
          href: `#${CONSOLE_ID}`
        }
      }); // end console-navigation link

      sectionNavigation.prepend(link);
    } // end section-navigation branch

    renderHistory();
    return section;
  } // end createConsole function

  function scheduleDungeonRevealFocus() {
    state.pendingRevealFocus = true;

    window.requestAnimationFrame(function waitForPrimaryRender() {
      window.requestAnimationFrame(function waitForRevealEnhancement() {
        if (state.pendingRevealFocus) {
          state.pendingRevealFocus = false;
          focusDungeonReveal();
        } // end pending-focus branch
      }); // end second-render-frame callback
    }); // end first-render-frame callback
  } // end scheduleDungeonRevealFocus function

  function handleDocumentClickCapture(event) {
    const target = event.target instanceof Element ? event.target.closest("#draw-dungeon-card-button, #draw-bottom-dungeon-card-button") : null;

    if (target && !target.disabled) {
      scheduleDungeonRevealFocus();
    } // end dungeon-draw-click branch
  } // end handleDocumentClickCapture function

  function handleDocumentKeydown(event) {
    if (!event.altKey || !event.shiftKey || event.ctrlKey || event.metaKey || isEditableTarget(event.target)) {
      return;
    } // end ignored-shortcut branch

    const key = String(event.key || "").toLowerCase();

    if (key === "p") {
      event.preventDefault();
      focusElement(getCommandInput(), "The command input is unavailable.");
      return;
    } // end console-shortcut branch

    if (key === "r") {
      event.preventDefault();
      focusDungeonReveal();
      return;
    } // end reveal-shortcut branch

    if (key === "f") {
      event.preventDefault();
      focusNextEntity("friendly", 1);
      return;
    } // end friendly-cycle-shortcut branch

    if (key === "e") {
      event.preventDefault();
      focusNextEntity("enemy", 1);
    } // end enemy-cycle-shortcut branch
  } // end handleDocumentKeydown function

  function observeTabletopChanges() {
    const tabletop = document.getElementById("tabletop");

    if (!tabletop || typeof MutationObserver !== "function") {
      return;
    } // end unavailable-observer branch

    const observer = new MutationObserver(function handleTabletopMutation() {
      scheduleEntityIndexRefresh();
    }); // end tabletop-mutation observer

    observer.observe(tabletop, {
      childList: true,
      subtree: true
    }); // end observer configuration
  } // end observeTabletopChanges function

  function initialize() {
    createConsole();
    refreshEntityIndex();
    document.addEventListener("click", handleDocumentClickCapture, true);
    document.addEventListener("keydown", handleDocumentKeydown, true);
    observeTabletopChanges();
  } // end initialize function

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  } // end document-readiness branch
}()); // end initializePlaytestConsole IIFE
