#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const repositoryRoot = path.resolve(__dirname, "..");
const cardsRoot = path.join(repositoryRoot, "data", "cards");
const decksRoot = path.join(repositoryRoot, "data", "decks");
const scenariosRoot = path.join(repositoryRoot, "data", "scenarios");
const errors = [];
const idPattern = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const typePattern = /^[a-z][A-Za-z0-9]*$/;
const allowedScenarioFields = new Set([
  "id",
  "active",
  "scenarioType",
  "name",
  "revision",
  "moduleId",
  "tags",
  "rulesText",
  "data",
  "source"
]);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
} // closes isPlainObject

function addError(filePath, message) {
  const relativePath = path.relative(repositoryRoot, filePath) || filePath;
  errors.push(`${relativePath}: ${message}`);
} // closes addError

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    addError(filePath, `invalid JSON: ${error.message}`);
    return null;
  } // closes try/catch in readJson
} // closes readJson

function findJsonFiles(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    return [];
  } // closes missing-directory condition

  const files = [];

  for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...findJsonFiles(entryPath));
      continue;
    } // closes directory condition

    if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(entryPath);
    } // closes JSON-file condition
  } // closes directory-entry loop

  return files.sort();
} // closes findJsonFiles

function validateStringId(filePath, value, label) {
  if (typeof value !== "string" || !idPattern.test(value)) {
    addError(filePath, `${label} must use lowercase letters, digits, dots, and hyphens only.`);
    return false;
  } // closes invalid-ID condition

  return true;
} // closes validateStringId

function validateSource(filePath, source) {
  if (source === undefined) {
    return;
  } // closes missing-source condition

  if (!isPlainObject(source)) {
    addError(filePath, "source must be an object when provided.");
    return;
  } // closes invalid-source condition

  const allowedSourceFields = new Set([
    "sourceFile",
    "sourceSection",
    "verifiedAgainstRulebook",
    "notes"
  ]);

  for (const fieldName of Object.keys(source)) {
    if (!allowedSourceFields.has(fieldName)) {
      addError(filePath, `source has an unsupported field: \"${fieldName}\".`);
    } // closes unsupported-source-field condition
  } // closes source-field loop

  for (const fieldName of ["sourceFile", "sourceSection", "notes"]) {
    if (source[fieldName] !== undefined && typeof source[fieldName] !== "string") {
      addError(filePath, `source.${fieldName} must be a string when provided.`);
    } // closes source-string-field condition
  } // closes source-string-field loop

  if (
    source.verifiedAgainstRulebook !== undefined &&
    typeof source.verifiedAgainstRulebook !== "boolean"
  ) {
    addError(filePath, "source.verifiedAgainstRulebook must be a boolean when provided.");
  } // closes verified-against-rulebook condition
} // closes validateSource

function loadDefinitionsById(directoryPath, definitionLabel) {
  const definitionsById = new Map();

  for (const filePath of findJsonFiles(directoryPath)) {
    const definition = readJson(filePath);

    if (!isPlainObject(definition) || !validateStringId(filePath, definition?.id, `${definitionLabel} id`)) {
      continue;
    } // closes invalid-definition condition

    if (definitionsById.has(definition.id)) {
      addError(
        filePath,
        `duplicate ${definitionLabel} id \"${definition.id}\"; first defined in ${path.relative(repositoryRoot, definitionsById.get(definition.id).filePath)}.`
      );
      continue;
    } // closes duplicate-definition condition

    definitionsById.set(definition.id, {
      filePath,
      raw: definition
    });
  } // closes definition-file loop

  return definitionsById;
} // closes loadDefinitionsById

function validateTags(filePath, tags) {
  if (!Array.isArray(tags) || tags.length === 0) {
    addError(filePath, "tags must be a non-empty array.");
    return;
  } // closes invalid-tags condition

  const seenTags = new Set();

  for (const tag of tags) {
    if (typeof tag !== "string" || !idPattern.test(tag)) {
      addError(filePath, "each tag must use lowercase letters, digits, dots, and hyphens only.");
      continue;
    } // closes invalid-tag condition

    if (seenTags.has(tag)) {
      addError(filePath, `tags must not repeat \"${tag}\".`);
    } // closes duplicate-tag condition

    seenTags.add(tag);
  } // closes tag loop
} // closes validateTags

function validateObjectFields(filePath, objectValue, allowedFields, label) {
  if (!isPlainObject(objectValue)) {
    addError(filePath, `${label} must be an object.`);
    return false;
  } // closes invalid-object condition

  for (const fieldName of Object.keys(objectValue)) {
    if (!allowedFields.has(fieldName)) {
      addError(filePath, `${label} has an unsupported field: \"${fieldName}\".`);
    } // closes unsupported-field condition
  } // closes object-field loop

  return true;
} // closes validateObjectFields

function requireFields(filePath, objectValue, requiredFields, label) {
  let valid = true;

  for (const fieldName of requiredFields) {
    if (objectValue[fieldName] === undefined) {
      addError(filePath, `${label} is missing required field \"${fieldName}\".`);
      valid = false;
    } // closes missing-required-field condition
  } // closes required-field loop

  return valid;
} // closes requireFields

function recordCardUse(cardUses, cardId, pathLabel) {
  const existing = cardUses.get(cardId) || {
    quantity: 0,
    paths: []
  };

  existing.quantity += 1;
  existing.paths.push(pathLabel);
  cardUses.set(cardId, existing);
} // closes recordCardUse

function validateCardReference(filePath, cardId, expectedCardType, cardsById, scenarioIsActive, label, cardUses) {
  if (!validateStringId(filePath, cardId, label)) {
    return null;
  } // closes invalid-card-ID condition

  const referencedCard = cardsById.get(cardId);

  if (!referencedCard) {
    addError(filePath, `${label} references a card that does not exist: \"${cardId}\".`);
    return null;
  } // closes missing-card condition

  const card = referencedCard.raw;

  if (scenarioIsActive && card.active !== true) {
    addError(filePath, `${label} references inactive card \"${cardId}\" from an active scenario.`);
  } // closes inactive-card condition

  if (card.cardType !== expectedCardType) {
    addError(filePath, `${label} must reference a ${expectedCardType} card, but \"${cardId}\" has cardType \"${card.cardType}\".`);
  } // closes wrong-card-type condition

  recordCardUse(cardUses, cardId, label);
  return card;
} // closes validateCardReference

function validateEquipment(filePath, setup, cardsById, scenarioIsActive, cardUses, setupLabel) {
  if (!Array.isArray(setup.equipment)) {
    addError(filePath, `${setupLabel}.equipment must be an array.`);
    return;
  } // closes invalid-equipment-array condition

  const seenSlots = new Set();

  for (let index = 0; index < setup.equipment.length; index += 1) {
    const entry = setup.equipment[index];
    const entryLabel = `${setupLabel}.equipment[${index}]`;
    const allowedFields = new Set(["cardId", "slot"]);

    if (!validateObjectFields(filePath, entry, allowedFields, entryLabel)) {
      continue;
    } // closes invalid-equipment-entry condition

    if (!requireFields(filePath, entry, ["cardId", "slot"], entryLabel)) {
      continue;
    } // closes incomplete-equipment-entry condition

    const card = validateCardReference(
      filePath,
      entry.cardId,
      "equipment",
      cardsById,
      scenarioIsActive,
      `${entryLabel}.cardId`,
      cardUses
    );

    if (typeof entry.slot !== "string" || !typePattern.test(entry.slot)) {
      addError(filePath, `${entryLabel}.slot must be a lower-camel-case slot name.`);
    } else if (seenSlots.has(entry.slot)) {
      addError(filePath, `${entryLabel}.slot duplicates equipment slot \"${entry.slot}\" within ${setupLabel}.`);
    } else {
      seenSlots.add(entry.slot);
    } // closes equipment-slot validation

    if (card && card.data && card.data.equipmentSlot && card.data.equipmentSlot !== entry.slot) {
      addError(
        filePath,
        `${entryLabel}.slot is \"${entry.slot}\", but equipment \"${entry.cardId}\" declares equipmentSlot \"${card.data.equipmentSlot}\".`
      );
    } // closes equipment-slot-mismatch condition
  } // closes equipment-entry loop
} // closes validateEquipment

function validateSkills(filePath, setup, cardsById, scenarioIsActive, cardUses, setupLabel) {
  if (!Array.isArray(setup.skills)) {
    addError(filePath, `${setupLabel}.skills must be an array.`);
    return;
  } // closes invalid-skills-array condition

  const seenSkillSlots = new Set();

  for (let index = 0; index < setup.skills.length; index += 1) {
    const entry = setup.skills[index];
    const entryLabel = `${setupLabel}.skills[${index}]`;
    const allowedFields = new Set(["cardId", "slot", "attachedAbilityCardIds"]);

    if (!validateObjectFields(filePath, entry, allowedFields, entryLabel)) {
      continue;
    } // closes invalid-skill-entry condition

    if (!requireFields(filePath, entry, ["cardId", "slot", "attachedAbilityCardIds"], entryLabel)) {
      continue;
    } // closes incomplete-skill-entry condition

    const skillCard = validateCardReference(
      filePath,
      entry.cardId,
      "skill",
      cardsById,
      scenarioIsActive,
      `${entryLabel}.cardId`,
      cardUses
    );

    if (!Number.isInteger(entry.slot) || entry.slot < 1 || entry.slot > 5) {
      addError(filePath, `${entryLabel}.slot must be an integer from 1 through 5.`);
    } else if (seenSkillSlots.has(entry.slot)) {
      addError(filePath, `${entryLabel}.slot duplicates Skill Card slot ${entry.slot} within ${setupLabel}.`);
    } else {
      seenSkillSlots.add(entry.slot);
    } // closes skill-slot validation

    if (!Array.isArray(entry.attachedAbilityCardIds)) {
      addError(filePath, `${entryLabel}.attachedAbilityCardIds must be an array.`);
      continue;
    } // closes invalid-attached-ability-array condition

    const attachedAbilityIds = new Set();
    const allowedAttachedCount = skillCard?.data?.attachedCardRules?.slotCount;

    if (Number.isInteger(allowedAttachedCount) && entry.attachedAbilityCardIds.length > allowedAttachedCount) {
      addError(
        filePath,
        `${entryLabel}.attachedAbilityCardIds contains ${entry.attachedAbilityCardIds.length} cards, but \"${entry.cardId}\" has only ${allowedAttachedCount} attached-card slots.`
      );
    } // closes too-many-attached-abilities condition

    for (let abilityIndex = 0; abilityIndex < entry.attachedAbilityCardIds.length; abilityIndex += 1) {
      const abilityId = entry.attachedAbilityCardIds[abilityIndex];
      const abilityLabel = `${entryLabel}.attachedAbilityCardIds[${abilityIndex}]`;

      if (attachedAbilityIds.has(abilityId)) {
        addError(filePath, `${abilityLabel} duplicates attached Ability Card \"${abilityId}\".`);
        continue;
      } // closes duplicate-attached-ability condition

      attachedAbilityIds.add(abilityId);
      const abilityCard = validateCardReference(
        filePath,
        abilityId,
        "ability",
        cardsById,
        scenarioIsActive,
        abilityLabel,
        cardUses
      );

      const requiredDiscipline = skillCard?.data?.discipline;
      const allowedDisciplines = abilityCard?.data?.equipRules?.allowedSkillDisciplines;

      if (
        requiredDiscipline &&
        Array.isArray(allowedDisciplines) &&
        !allowedDisciplines.includes(requiredDiscipline)
      ) {
        addError(
          filePath,
          `${abilityLabel} cannot attach \"${abilityId}\" to \"${entry.cardId}\" because the ability does not allow the ${requiredDiscipline} discipline.`
        );
      } // closes incompatible-ability-discipline condition
    } // closes attached-ability loop
  } // closes skill-entry loop
} // closes validateSkills

function validateTacticalReserve(filePath, setup, cardsById, scenarioIsActive, cardUses, setupLabel) {
  if (!Array.isArray(setup.tacticalReserve)) {
    addError(filePath, `${setupLabel}.tacticalReserve must be an array.`);
    return;
  } // closes invalid-tactical-reserve-array condition

  const seenReserveSlots = new Set();

  for (let index = 0; index < setup.tacticalReserve.length; index += 1) {
    const entry = setup.tacticalReserve[index];
    const entryLabel = `${setupLabel}.tacticalReserve[${index}]`;
    const allowedFields = new Set(["cardId", "slot"]);

    if (!validateObjectFields(filePath, entry, allowedFields, entryLabel)) {
      continue;
    } // closes invalid-tactical-reserve-entry condition

    if (!requireFields(filePath, entry, ["cardId", "slot"], entryLabel)) {
      continue;
    } // closes incomplete-tactical-reserve-entry condition

    validateCardReference(
      filePath,
      entry.cardId,
      "tacticalReserve",
      cardsById,
      scenarioIsActive,
      `${entryLabel}.cardId`,
      cardUses
    );

    if (!Number.isInteger(entry.slot) || entry.slot < 1 || entry.slot > 5) {
      addError(filePath, `${entryLabel}.slot must be an integer from 1 through 5.`);
    } else if (seenReserveSlots.has(entry.slot)) {
      addError(filePath, `${entryLabel}.slot duplicates Tactical Reserve slot ${entry.slot} within ${setupLabel}.`);
    } else {
      seenReserveSlots.add(entry.slot);
    } // closes Tactical Reserve slot validation
  } // closes Tactical Reserve entry loop
} // closes validateTacticalReserve

function validateParticipantSetups(filePath, scenario, cardsById, cardUses) {
  const participants = scenario.data.participants;

  if (!Array.isArray(participants) || participants.length === 0) {
    addError(filePath, "data.participants must be a non-empty array.");
    return;
  } // closes invalid-participants condition

  const participantIds = new Set();
  const setupIds = new Set();

  for (let participantIndex = 0; participantIndex < participants.length; participantIndex += 1) {
    const participant = participants[participantIndex];
    const participantLabel = `data.participants[${participantIndex}]`;
    const allowedFields = new Set(["id", "controlledCharacterSetups"]);

    if (!validateObjectFields(filePath, participant, allowedFields, participantLabel)) {
      continue;
    } // closes invalid-participant condition

    if (!requireFields(filePath, participant, ["id", "controlledCharacterSetups"], participantLabel)) {
      continue;
    } // closes incomplete-participant condition

    if (validateStringId(filePath, participant.id, `${participantLabel}.id`)) {
      if (participantIds.has(participant.id)) {
        addError(filePath, `${participantLabel}.id duplicates participant ID \"${participant.id}\".`);
      } else {
        participantIds.add(participant.id);
      } // closes participant-ID uniqueness condition
    } // closes participant-ID validation

    if (!Array.isArray(participant.controlledCharacterSetups) || participant.controlledCharacterSetups.length === 0) {
      addError(filePath, `${participantLabel}.controlledCharacterSetups must be a non-empty array.`);
      continue;
    } // closes invalid-character-setups condition

    for (let setupIndex = 0; setupIndex < participant.controlledCharacterSetups.length; setupIndex += 1) {
      const setup = participant.controlledCharacterSetups[setupIndex];
      const setupLabel = `${participantLabel}.controlledCharacterSetups[${setupIndex}]`;
      const allowedFields = new Set([
        "id",
        "characterCardId",
        "startingRow",
        "startingState",
        "equipment",
        "skills",
        "tacticalReserve"
      ]);

      if (!validateObjectFields(filePath, setup, allowedFields, setupLabel)) {
        continue;
      } // closes invalid-character-setup condition

      if (!requireFields(filePath, setup, [...allowedFields], setupLabel)) {
        continue;
      } // closes incomplete-character-setup condition

      if (validateStringId(filePath, setup.id, `${setupLabel}.id`)) {
        if (setupIds.has(setup.id)) {
          addError(filePath, `${setupLabel}.id duplicates character setup ID \"${setup.id}\".`);
        } else {
          setupIds.add(setup.id);
        } // closes setup-ID uniqueness condition
      } // closes setup-ID validation

      validateCardReference(
        filePath,
        setup.characterCardId,
        "character",
        cardsById,
        scenario.active === true,
        `${setupLabel}.characterCardId`,
        cardUses
      );

      if (setup.startingRow !== "playerFront" && setup.startingRow !== "playerBack") {
        addError(filePath, `${setupLabel}.startingRow must be playerFront or playerBack.`);
      } // closes starting-row validation

      const startingStateFields = new Set(["damage", "heat"]);

      if (validateObjectFields(filePath, setup.startingState, startingStateFields, `${setupLabel}.startingState`)) {
        if (!requireFields(filePath, setup.startingState, ["damage", "heat"], `${setupLabel}.startingState`)) {
          continue;
        } // closes incomplete-starting-state condition

        for (const stateField of ["damage", "heat"]) {
          if (!Number.isInteger(setup.startingState[stateField]) || setup.startingState[stateField] < 0) {
            addError(filePath, `${setupLabel}.startingState.${stateField} must be an integer of at least 0.`);
          } // closes invalid-starting-state-value condition
        } // closes starting-state-field loop
      } // closes starting-state object validation

      validateEquipment(filePath, setup, cardsById, scenario.active === true, cardUses, setupLabel);
      validateSkills(filePath, setup, cardsById, scenario.active === true, cardUses, setupLabel);
      validateTacticalReserve(filePath, setup, cardsById, scenario.active === true, cardUses, setupLabel);
    } // closes character-setup loop
  } // closes participant loop
} // closes validateParticipantSetups

function validateDungeonSetup(filePath, scenario, decksById, cardUses) {
  const dungeonSetup = scenario.data.dungeonSetup;
  const allowedFields = new Set(["deckId", "drawMode", "drawZone", "discardZone", "lootZone"]);

  if (!validateObjectFields(filePath, dungeonSetup, allowedFields, "data.dungeonSetup")) {
    return;
  } // closes invalid-dungeon-setup condition

  if (!requireFields(filePath, dungeonSetup, [...allowedFields], "data.dungeonSetup")) {
    return;
  } // closes incomplete-dungeon-setup condition

  if (validateStringId(filePath, dungeonSetup.deckId, "data.dungeonSetup.deckId")) {
    const referencedDeck = decksById.get(dungeonSetup.deckId);

    if (!referencedDeck) {
      addError(filePath, `data.dungeonSetup.deckId references a deck that does not exist: \"${dungeonSetup.deckId}\".`);
    } else {
      const deck = referencedDeck.raw;

      if (scenario.active === true && deck.active !== true) {
        addError(filePath, `data.dungeonSetup.deckId references inactive deck \"${dungeonSetup.deckId}\" from an active scenario.`);
      } // closes inactive-deck condition

      if (deck.deckType !== "dungeon") {
        addError(filePath, `data.dungeonSetup.deckId must reference a dungeon deck, but \"${dungeonSetup.deckId}\" has deckType \"${deck.deckType}\".`);
      } // closes wrong-deck-type condition

      const deckEntries = deck?.data?.cardEntries;

      if (Array.isArray(deckEntries)) {
        for (let index = 0; index < deckEntries.length; index += 1) {
          const entry = deckEntries[index];

          if (!isPlainObject(entry) || typeof entry.cardId !== "string" || !Number.isInteger(entry.quantity)) {
            continue;
          } // closes malformed-deck-entry condition

          const existing = cardUses.get(entry.cardId) || {
            quantity: 0,
            paths: []
          };

          existing.quantity += entry.quantity;
          existing.paths.push(`data.dungeonSetup.deckId (${dungeonSetup.deckId}) entry ${index}`);
          cardUses.set(entry.cardId, existing);
        } // closes deck-entry loop
      } // closes deck-entry-array condition
    } // closes existing-deck condition
  } // closes deck-ID validation

  for (const fieldName of ["drawMode", "drawZone", "discardZone", "lootZone"]) {
    if (typeof dungeonSetup[fieldName] !== "string" || dungeonSetup[fieldName].trim().length === 0) {
      addError(filePath, `data.dungeonSetup.${fieldName} must be a non-empty string.`);
    } // closes invalid-dungeon-setup-string condition
  } // closes dungeon-setup string-field loop
} // closes validateDungeonSetup

function validateCardSupply(filePath, cardUses, cardsById) {
  for (const [cardId, use] of cardUses) {
    const card = cardsById.get(cardId)?.raw;

    if (!card || !Number.isInteger(card.count)) {
      continue;
    } // closes missing-card-or-count condition

    if (use.quantity > card.count) {
      addError(
        filePath,
        `scenario requires ${use.quantity} copies of \"${cardId}\", but its card definition count is ${card.count}. References: ${use.paths.join("; ")}.`
      );
    } // closes over-supply condition
  } // closes card-use loop
} // closes validateCardSupply

function validateScenario(filePath, scenario, cardsById, decksById, seenScenarioIds) {
  if (!isPlainObject(scenario)) {
    addError(filePath, "scenario definition must be an object.");
    return;
  } // closes invalid-scenario-object condition

  for (const fieldName of Object.keys(scenario)) {
    if (!allowedScenarioFields.has(fieldName)) {
      addError(filePath, `unsupported top-level field: \"${fieldName}\".`);
    } // closes unsupported-scenario-field condition
  } // closes scenario-field loop

  const requiredFields = [
    "id",
    "active",
    "scenarioType",
    "name",
    "revision",
    "tags",
    "rulesText",
    "data"
  ];

  if (!requireFields(filePath, scenario, requiredFields, "scenario")) {
    return;
  } // closes incomplete-scenario condition

  if (validateStringId(filePath, scenario.id, "scenario.id")) {
    if (seenScenarioIds.has(scenario.id)) {
      addError(filePath, `duplicate scenario id \"${scenario.id}\"; first defined in ${path.relative(repositoryRoot, seenScenarioIds.get(scenario.id))}.`);
    } else {
      seenScenarioIds.set(scenario.id, filePath);
    } // closes scenario-ID uniqueness condition
  } // closes scenario-ID validation

  if (typeof scenario.active !== "boolean") {
    addError(filePath, "active must be a boolean.");
  } // closes invalid-active condition

  if (typeof scenario.scenarioType !== "string" || !typePattern.test(scenario.scenarioType)) {
    addError(filePath, "scenarioType must be a lower-camel-case identifier.");
  } // closes invalid-scenario-type condition

  if (typeof scenario.name !== "string" || scenario.name.trim().length === 0) {
    addError(filePath, "name must be a non-empty string.");
  } // closes invalid-name condition

  if (!Number.isInteger(scenario.revision) || scenario.revision < 1) {
    addError(filePath, "revision must be an integer of at least 1.");
  } // closes invalid-revision condition

  if (scenario.moduleId !== undefined && !validateStringId(filePath, scenario.moduleId, "moduleId")) {
    return;
  } // closes invalid-module-ID condition

  validateTags(filePath, scenario.tags);

  if (typeof scenario.rulesText !== "string" || scenario.rulesText.trim().length === 0) {
    addError(filePath, "rulesText must be a non-empty string.");
  } // closes invalid-rules-text condition

  validateSource(filePath, scenario.source);

  if (!isPlainObject(scenario.data)) {
    addError(filePath, "data must be an object.");
    return;
  } // closes invalid-scenario-data condition

  const requiredDataFields = [
    "playMode",
    "automationPolicy",
    "runtimeSetupPolicy",
    "participants",
    "dungeonSetup",
    "endCondition"
  ];

  if (!requireFields(filePath, scenario.data, requiredDataFields, "data")) {
    return;
  } // closes incomplete-scenario-data condition

  if (typeof scenario.data.playMode !== "string" || scenario.data.playMode.trim().length === 0) {
    addError(filePath, "data.playMode must be a non-empty string.");
  } // closes invalid-play-mode condition

  const automationFields = new Set([
    "automateRulesResolution",
    "allowManualCardMovement",
    "allowManualCounterChanges",
    "allowManualOverrides"
  ]);

  if (validateObjectFields(filePath, scenario.data.automationPolicy, automationFields, "data.automationPolicy")) {
    if (requireFields(filePath, scenario.data.automationPolicy, [...automationFields], "data.automationPolicy")) {
      for (const fieldName of automationFields) {
        if (typeof scenario.data.automationPolicy[fieldName] !== "boolean") {
          addError(filePath, `data.automationPolicy.${fieldName} must be a boolean.`);
        } // closes invalid-automation-policy-value condition
      } // closes automation-policy-field loop
    } // closes complete-automation-policy condition
  } // closes automation-policy object validation

  const runtimeFields = new Set([
    "spawnCardInstancesFromDefinitions",
    "enforceActiveDefinitionsOnly",
    "enforceDefinitionCopyCounts",
    "shuffleReferencedDecksAtSetup"
  ]);

  if (validateObjectFields(filePath, scenario.data.runtimeSetupPolicy, runtimeFields, "data.runtimeSetupPolicy")) {
    if (requireFields(filePath, scenario.data.runtimeSetupPolicy, [...runtimeFields], "data.runtimeSetupPolicy")) {
      for (const fieldName of runtimeFields) {
        if (typeof scenario.data.runtimeSetupPolicy[fieldName] !== "boolean") {
          addError(filePath, `data.runtimeSetupPolicy.${fieldName} must be a boolean.`);
        } // closes invalid-runtime-policy-value condition
      } // closes runtime-policy-field loop
    } // closes complete-runtime-policy condition
  } // closes runtime-policy object validation

  const endConditionFields = new Set(["type", "notes"]);

  if (validateObjectFields(filePath, scenario.data.endCondition, endConditionFields, "data.endCondition")) {
    if (requireFields(filePath, scenario.data.endCondition, [...endConditionFields], "data.endCondition")) {
      for (const fieldName of endConditionFields) {
        if (typeof scenario.data.endCondition[fieldName] !== "string" || scenario.data.endCondition[fieldName].trim().length === 0) {
          addError(filePath, `data.endCondition.${fieldName} must be a non-empty string.`);
        } // closes invalid-end-condition-value condition
      } // closes end-condition-field loop
    } // closes complete-end-condition condition
  } // closes end-condition object validation

  if (scenario.data.knownLimitations !== undefined) {
    if (!Array.isArray(scenario.data.knownLimitations)) {
      addError(filePath, "data.knownLimitations must be an array when provided.");
    } else {
      for (let index = 0; index < scenario.data.knownLimitations.length; index += 1) {
        const limitation = scenario.data.knownLimitations[index];

        if (typeof limitation !== "string" || limitation.trim().length === 0) {
          addError(filePath, `data.knownLimitations[${index}] must be a non-empty string.`);
        } // closes invalid-known-limitation condition
      } // closes known-limitations loop
    } // closes known-limitations type condition
  } // closes known-limitations provided condition

  const cardUses = new Map();
  validateParticipantSetups(filePath, scenario, cardsById, cardUses);
  validateDungeonSetup(filePath, scenario, decksById, cardUses);
  validateCardSupply(filePath, cardUses, cardsById);
} // closes validateScenario

function main() {
  const cardsById = loadDefinitionsById(cardsRoot, "card");
  const decksById = loadDefinitionsById(decksRoot, "deck");
  const scenarioFiles = findJsonFiles(scenariosRoot);
  const seenScenarioIds = new Map();

  if (scenarioFiles.length === 0) {
    console.log("Scenario validation passed: 0 scenario definitions checked.");
    return;
  } // closes empty-scenarios condition

  for (const scenarioFilePath of scenarioFiles) {
    const scenario = readJson(scenarioFilePath);

    if (scenario !== null) {
      validateScenario(scenarioFilePath, scenario, cardsById, decksById, seenScenarioIds);
    } // closes valid-JSON scenario condition
  } // closes scenario-file loop

  if (errors.length > 0) {
    console.error("Scenario validation failed:");

    for (const error of errors) {
      console.error(`- ${error}`);
    } // closes scenario-validation-error loop

    process.exitCode = 1;
    return;
  } // closes validation-errors condition

  console.log(`Scenario validation passed: ${scenarioFiles.length} scenario definition${scenarioFiles.length === 1 ? "" : "s"} checked.`);
} // closes main

main();
