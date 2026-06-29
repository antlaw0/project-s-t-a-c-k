"use strict";

const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const DEFAULT_SCENARIO_ID = "scenario.solo-warrior-goblin-warrens-smoke-test";
const DEFAULT_SEED = "20260629";
const FORMATION_SLOT_COUNT = 4;
const DEFAULT_STATUS_ROW_SLOT_COUNT = 5;

function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Could not read JSON file ${filePath}: ${error.message}`);
  } // end readJsonFile catch
} // end readJsonFile

function listJsonFilesRecursively(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    return [];
  } // end missing-directory check

  const results = [];
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      results.push(...listJsonFilesRecursively(entryPath));
      continue;
    } // end directory branch

    if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) {
      results.push(entryPath);
    } // end JSON-file branch
  } // end directory-entry loop

  return results.sort();
} // end listJsonFilesRecursively

function loadDefinitions(directoryPath, label) {
  const files = listJsonFilesRecursively(directoryPath);
  const definitionsById = new Map();

  for (const filePath of files) {
    const definition = readJsonFile(filePath);

    if (!definition || typeof definition.id !== "string" || definition.id.length === 0) {
      throw new Error(`${label} file ${filePath} is missing a non-empty id.`);
    } // end definition-id validation

    if (definitionsById.has(definition.id)) {
      throw new Error(`${label} ID ${definition.id} is duplicated. Check ${filePath}.`);
    } // end duplicate-definition validation

    definitionsById.set(definition.id, definition);
  } // end definition-file loop

  return definitionsById;
} // end loadDefinitions

function parseArguments(argumentValues) {
  const options = {
    scenarioId: DEFAULT_SCENARIO_ID,
    seed: DEFAULT_SEED,
    outputPath: null
  };

  for (let index = 0; index < argumentValues.length; index += 1) {
    const argument = argumentValues[index];
    const nextValue = argumentValues[index + 1];

    if (argument === "--scenario") {
      options.scenarioId = nextValue;
      index += 1;
      continue;
    } // end scenario option branch

    if (argument === "--seed") {
      options.seed = nextValue;
      index += 1;
      continue;
    } // end seed option branch

    if (argument === "--out") {
      options.outputPath = nextValue;
      index += 1;
      continue;
    } // end output option branch

    if (argument === "--help" || argument === "-h") {
      printUsage();
      process.exit(0);
    } // end help option branch

    throw new Error(`Unknown argument: ${argument}`);
  } // end argument loop

  if (!options.scenarioId) {
    throw new Error("--scenario requires a scenario ID.");
  } // end scenario option validation

  if (!options.seed) {
    throw new Error("--seed requires a value.");
  } // end seed option validation

  if (options.outputPath === "") {
    throw new Error("--out requires a file path.");
  } // end output option validation

  return options;
} // end parseArguments

function printUsage() {
  console.log("Usage: node scripts/create-playtest-state.js [--scenario <scenario-id>] [--seed <seed>] [--out <path>]");
} // end printUsage

function hashSeed(seedValue) {
  const seedText = String(seedValue);
  let hash = 2166136261;

  for (let index = 0; index < seedText.length; index += 1) {
    hash ^= seedText.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  } // end seed-character loop

  return hash >>> 0;
} // end hashSeed

function createSeededRandom(seedValue) {
  let state = hashSeed(seedValue) || 1;

  return function nextRandom() {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  }; // end nextRandom
} // end createSeededRandom

function shuffleCopy(values, random) {
  const shuffledValues = [...values];

  for (let index = shuffledValues.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const currentValue = shuffledValues[index];
    shuffledValues[index] = shuffledValues[swapIndex];
    shuffledValues[swapIndex] = currentValue;
  } // end Fisher-Yates loop

  return shuffledValues;
} // end shuffleCopy

function createNullSlotArray(slotCount) {
  return Array.from({ length: slotCount }, () => null);
} // end createNullSlotArray

function getRequiredDefinition(definitionsById, definitionId, expectedCardType, referenceLabel) {
  const definition = definitionsById.get(definitionId);

  if (!definition) {
    throw new Error(`${referenceLabel} references missing card definition ${definitionId}.`);
  } // end missing-definition validation

  if (definition.active !== true) {
    throw new Error(`${referenceLabel} references inactive card definition ${definitionId}.`);
  } // end inactive-definition validation

  if (expectedCardType && definition.cardType !== expectedCardType) {
    throw new Error(`${referenceLabel} expected card type ${expectedCardType} but ${definitionId} is ${definition.cardType}.`);
  } // end card-type validation

  return definition;
} // end getRequiredDefinition

function getActiveNegativeStatusDefinitions(cardDefinitionsById) {
  return [...cardDefinitionsById.values()]
    .filter(function filterNegativeStatusDefinition(definition) {
      return Boolean(
        definition &&
        definition.active === true &&
        definition.cardType === "status" &&
        definition.data &&
        definition.data.statusCategory === "negative"
      );
    }) // end negative-status filtering
    .sort(function sortByDefinitionId(first, second) {
      return first.id.localeCompare(second.id);
    }); // end negative-status sorting
} // end getActiveNegativeStatusDefinitions function

function createCardInstanceFactory(cardDefinitionsById) {
  const nextSequenceByDefinitionId = new Map();
  const usageByDefinitionId = new Map();
  const instancesById = {};

  function createCardInstance(definitionId, details) {
    const definition = getRequiredDefinition(cardDefinitionsById, definitionId, null, details.referenceLabel || "Runtime setup");
    const nextSequence = (nextSequenceByDefinitionId.get(definitionId) || 0) + 1;
    const nextUsage = (usageByDefinitionId.get(definitionId) || 0) + 1;

    if (nextUsage > definition.count) {
      throw new Error(`Scenario setup requires ${nextUsage} copies of ${definitionId}, but its active catalog count is ${definition.count}.`);
    } // end copy-count validation

    nextSequenceByDefinitionId.set(definitionId, nextSequence);
    usageByDefinitionId.set(definitionId, nextUsage);

    const instanceId = `instance.${definitionId}.${String(nextSequence).padStart(3, "0")}`;
    const instance = {
      id: instanceId,
      definitionId,
      cardType: definition.cardType,
      ownerEntityId: details.ownerEntityId || null,
      zone: details.zone,
      zoneDetail: details.zoneDetail || null,
      faceUp: details.faceUp !== false
    };

    instancesById[instanceId] = instance;
    return instance;
  } // end createCardInstance

  return {
    createCardInstance,
    instancesById,
    usageByDefinitionId
  };
} // end createCardInstanceFactory

function requireSlot(slotNumber, maximumSlots, referenceLabel) {
  if (!Number.isInteger(slotNumber) || slotNumber < 1 || slotNumber > maximumSlots) {
    throw new Error(`${referenceLabel} must use a slot number from 1 through ${maximumSlots}.`);
  } // end slot-range validation

  return slotNumber - 1;
} // end requireSlot

function buildScenarioState(options) {
  const cardDefinitionsById = loadDefinitions(path.join(PROJECT_ROOT, "data", "cards"), "Card definition");
  const deckDefinitionsById = loadDefinitions(path.join(PROJECT_ROOT, "data", "decks"), "Deck definition");
  const scenarioDefinitionsById = loadDefinitions(path.join(PROJECT_ROOT, "data", "scenarios"), "Scenario definition");
  const scenario = scenarioDefinitionsById.get(options.scenarioId);

  if (!scenario) {
    throw new Error(`Scenario ${options.scenarioId} was not found under data/scenarios.`);
  } // end missing-scenario validation

  if (scenario.active !== true) {
    throw new Error(`Scenario ${options.scenarioId} is inactive and cannot be instantiated.`);
  } // end inactive-scenario validation

  const scenarioData = scenario.data || {};
  const random = createSeededRandom(options.seed);
  const cardFactory = createCardInstanceFactory(cardDefinitionsById);
  const entitiesById = {};
  const participantStates = [];
  const playerFrontRow = createNullSlotArray(FORMATION_SLOT_COUNT);
  const playerBackRow = createNullSlotArray(FORMATION_SLOT_COUNT);
  const enemyFrontRow = createNullSlotArray(FORMATION_SLOT_COUNT);
  const enemyBackRow = createNullSlotArray(FORMATION_SLOT_COUNT);
  let entitySequence = 0;

  const participants = Array.isArray(scenarioData.participants) ? scenarioData.participants : [];

  if (participants.length === 0) {
    throw new Error(`Scenario ${scenario.id} must define at least one participant.`);
  } // end participant-count validation

  for (const participant of participants) {
    const participantId = participant.id;

    if (!participantId) {
      throw new Error(`Scenario ${scenario.id} has a participant without an id.`);
    } // end participant-id validation

    const controlledSetups = Array.isArray(participant.controlledCharacterSetups)
      ? participant.controlledCharacterSetups
      : [];
    const controlledEntityIds = [];

    for (const characterSetup of controlledSetups) {
      const characterDefinition = getRequiredDefinition(
        cardDefinitionsById,
        characterSetup.characterCardId,
        "character",
        `Character setup ${characterSetup.id || "without-id"}`
      );
      const characterCardInstance = cardFactory.createCardInstance(characterDefinition.id, {
        referenceLabel: `Character setup ${characterSetup.id || "without-id"}`,
        zone: "characterArea",
        zoneDetail: participantId
      });
      entitySequence += 1;
      const entityId = `entity.${characterDefinition.id}.${String(entitySequence).padStart(3, "0")}`;
      const slotCapacity = characterDefinition.data && characterDefinition.data.slotCapacity
        ? characterDefinition.data.slotCapacity
        : {};
      const statusRowSlots = Number.isInteger(slotCapacity.statusRowSlots)
        ? slotCapacity.statusRowSlots
        : DEFAULT_STATUS_ROW_SLOT_COUNT;
      const skillSlotCapacity = Number.isInteger(slotCapacity.skillSlots) ? slotCapacity.skillSlots : 0;
      const tacticalReserveSlotCapacity = Number.isInteger(slotCapacity.tacticalReserveSlots)
        ? slotCapacity.tacticalReserveSlots
        : 0;
      const startingState = characterSetup.startingState || {};
      const entity = {
        id: entityId,
        definitionId: characterDefinition.id,
        characterCardInstanceId: characterCardInstance.id,
        name: characterDefinition.name,
        entityType: "playerCharacter",
        controllerParticipantId: participantId,
        currentRow: characterSetup.startingRow,
        damage: Number.isInteger(startingState.damage) ? startingState.damage : 0,
        heat: Number.isInteger(startingState.heat) ? startingState.heat : 0,
        maximumHp: characterDefinition.data ? characterDefinition.data.maximumHp : null,
        statusRow: createNullSlotArray(statusRowSlots),
        equipment: {},
        skillSlots: createNullSlotArray(skillSlotCapacity),
        tacticalReserveSlots: createNullSlotArray(tacticalReserveSlotCapacity)
      };

      if (entity.currentRow === "playerFront") {
        const frontSlot = playerFrontRow.indexOf(null);

        if (frontSlot === -1) {
          throw new Error(`No open Player Front Row slot is available for ${entity.name}.`);
        } // end player-front capacity validation

        playerFrontRow[frontSlot] = entityId;
      } else if (entity.currentRow === "playerBack") {
        const backSlot = playerBackRow.indexOf(null);

        if (backSlot === -1) {
          throw new Error(`No open Player Back Row slot is available for ${entity.name}.`);
        } // end player-back capacity validation

        playerBackRow[backSlot] = entityId;
      } else {
        throw new Error(`Character setup ${characterSetup.id || entityId} has unsupported startingRow ${entity.currentRow}.`);
      } // end character-row placement

      const equipmentEntries = Array.isArray(characterSetup.equipment) ? characterSetup.equipment : [];

      for (const equipmentSetup of equipmentEntries) {
        const equipmentDefinition = getRequiredDefinition(
          cardDefinitionsById,
          equipmentSetup.cardId,
          "equipment",
          `Equipment setup for ${entity.name}`
        );
        const equipmentSlot = equipmentSetup.slot;

        if (!equipmentSlot || entity.equipment[equipmentSlot]) {
          throw new Error(`Equipment setup for ${entity.name} has an invalid or duplicate slot ${equipmentSlot}.`);
        } // end equipment-slot validation

        const equipmentInstance = cardFactory.createCardInstance(equipmentDefinition.id, {
          referenceLabel: `Equipment setup for ${entity.name}`,
          ownerEntityId: entityId,
          zone: "equipmentSlot",
          zoneDetail: equipmentSlot
        });
        entity.equipment[equipmentSlot] = equipmentInstance.id;
      } // end equipment loop

      const skillEntries = Array.isArray(characterSetup.skills) ? characterSetup.skills : [];

      for (const skillSetup of skillEntries) {
        const skillDefinition = getRequiredDefinition(
          cardDefinitionsById,
          skillSetup.cardId,
          "skill",
          `Skill setup for ${entity.name}`
        );
        const skillSlotIndex = requireSlot(skillSetup.slot, entity.skillSlots.length, `Skill setup for ${entity.name}`);

        if (entity.skillSlots[skillSlotIndex] !== null) {
          throw new Error(`Skill setup for ${entity.name} duplicates skill slot ${skillSetup.slot}.`);
        } // end duplicate-skill-slot validation

        const skillInstance = cardFactory.createCardInstance(skillDefinition.id, {
          referenceLabel: `Skill setup for ${entity.name}`,
          ownerEntityId: entityId,
          zone: "skillSlot",
          zoneDetail: `skillSlot:${skillSetup.slot}`
        });
        const attachedAbilityCardIds = Array.isArray(skillSetup.attachedAbilityCardIds)
          ? skillSetup.attachedAbilityCardIds
          : [];
        const attachedAbilityInstanceIds = [];

        for (const abilityCardId of attachedAbilityCardIds) {
          const abilityDefinition = getRequiredDefinition(
            cardDefinitionsById,
            abilityCardId,
            "ability",
            `Ability attachment for ${skillDefinition.name}`
          );
          const abilityInstance = cardFactory.createCardInstance(abilityDefinition.id, {
            referenceLabel: `Ability attachment for ${skillDefinition.name}`,
            ownerEntityId: entityId,
            zone: "skillAttachment",
            zoneDetail: skillInstance.id
          });
          attachedAbilityInstanceIds.push(abilityInstance.id);
        } // end ability-attachment loop

        entity.skillSlots[skillSlotIndex] = {
          skillCardInstanceId: skillInstance.id,
          attachedAbilityInstanceIds
        };
      } // end skill loop

      const tacticalReserveEntries = Array.isArray(characterSetup.tacticalReserve)
        ? characterSetup.tacticalReserve
        : [];

      for (const tacticalReserveSetup of tacticalReserveEntries) {
        const tacticalReserveDefinition = getRequiredDefinition(
          cardDefinitionsById,
          tacticalReserveSetup.cardId,
          "tacticalReserve",
          `Tactical Reserve setup for ${entity.name}`
        );
        const tacticalReserveSlotIndex = requireSlot(
          tacticalReserveSetup.slot,
          entity.tacticalReserveSlots.length,
          `Tactical Reserve setup for ${entity.name}`
        );

        if (entity.tacticalReserveSlots[tacticalReserveSlotIndex] !== null) {
          throw new Error(`Tactical Reserve setup for ${entity.name} duplicates slot ${tacticalReserveSetup.slot}.`);
        } // end duplicate-tactical-reserve-slot validation

        const tacticalReserveInstance = cardFactory.createCardInstance(tacticalReserveDefinition.id, {
          referenceLabel: `Tactical Reserve setup for ${entity.name}`,
          ownerEntityId: entityId,
          zone: "tacticalReserveSlot",
          zoneDetail: `tacticalReserveSlot:${tacticalReserveSetup.slot}`
        });
        entity.tacticalReserveSlots[tacticalReserveSlotIndex] = tacticalReserveInstance.id;
      } // end tactical-reserve loop

      entitiesById[entityId] = entity;
      controlledEntityIds.push(entityId);
    } // end character-setup loop

    participantStates.push({
      id: participantId,
      controlledEntityIds
    });
  } // end participant loop

  const dungeonSetup = scenarioData.dungeonSetup || {};
  const deckDefinition = deckDefinitionsById.get(dungeonSetup.deckId);

  if (!deckDefinition) {
    throw new Error(`Scenario ${scenario.id} references missing deck ${dungeonSetup.deckId}.`);
  } // end missing-deck validation

  if (deckDefinition.active !== true) {
    throw new Error(`Scenario ${scenario.id} references inactive deck ${deckDefinition.id}.`);
  } // end inactive-deck validation

  if (deckDefinition.deckType !== "dungeon") {
    throw new Error(`Scenario ${scenario.id} requires a dungeon deck, but ${deckDefinition.id} is ${deckDefinition.deckType}.`);
  } // end deck-type validation

  const dungeonCardInstanceIds = [];
  const deckEntries = deckDefinition.data && Array.isArray(deckDefinition.data.cardEntries)
    ? deckDefinition.data.cardEntries
    : [];

  for (const deckEntry of deckEntries) {
    for (let quantityIndex = 0; quantityIndex < deckEntry.quantity; quantityIndex += 1) {
      const deckCardInstance = cardFactory.createCardInstance(deckEntry.cardId, {
        referenceLabel: `Deck ${deckDefinition.id}`,
        zone: "dungeonDeck",
        zoneDetail: deckDefinition.id,
        faceUp: false
      });
      dungeonCardInstanceIds.push(deckCardInstance.id);
    } // end deck-entry quantity loop
  } // end deck-entry loop

  const shuffledDungeonDeck = shuffleCopy(dungeonCardInstanceIds, random);
  const statusCardInstanceIds = [];
  const negativeStatusDefinitions = getActiveNegativeStatusDefinitions(cardDefinitionsById);

  for (const statusDefinition of negativeStatusDefinitions) {
    for (let quantityIndex = 0; quantityIndex < statusDefinition.count; quantityIndex += 1) {
      const statusCardInstance = cardFactory.createCardInstance(statusDefinition.id, {
        referenceLabel: "Shared Status Deck",
        zone: "statusDeck",
        zoneDetail: "sharedStatusDeck",
        faceUp: false
      });
      statusCardInstanceIds.push(statusCardInstance.id);
    } // end status-copy creation loop
  } // end negative-status-definition loop

  const shuffledStatusDeck = shuffleCopy(statusCardInstanceIds, random);
  const primaryParticipant = participantStates[0];
  const primaryEntityId = primaryParticipant.controlledEntityIds[0] || null;

  return {
    stateVersion: 1,
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    moduleId: scenario.moduleId,
    createdAt: new Date().toISOString(),
    seed: String(options.seed),
    playMode: scenarioData.playMode || "soloManual",
    automationPolicy: scenarioData.automationPolicy || {},
    activeParticipantId: primaryParticipant.id,
    activeCharacterEntityId: primaryEntityId,
    participants: participantStates,
    entities: entitiesById,
    cardInstances: cardFactory.instancesById,
    zones: {
      playerFormation: {
        frontRow: playerFrontRow,
        backRow: playerBackRow
      },
      enemyFormation: {
        frontRow: enemyFrontRow,
        backRow: enemyBackRow
      },
      dungeonDeck: shuffledDungeonDeck,
      dungeonDiscardPile: [],
      dungeonLootArea: [],
      lootDeck: [],
      lootDiscardPile: [],
      expendedSummons: [],
      statusDeck: shuffledStatusDeck,
      statusRevealArea: [],
      statusDiscardPile: []
    },
    encounter: {
      round: 1,
      phase: "manualSetup",
      activeEntityId: primaryEntityId,
      notes: "This state is intentionally manual. It does not resolve AI, attacks, damage, targeting, Heat, or status effects automatically."
    },
    log: [
      {
        sequence: 1,
        type: "scenarioInstantiated",
        message: `Created runtime state from ${scenario.id} using seed ${options.seed}.`
      }
    ]
  };
} // end buildScenarioState

function resolveOutputPath(options, state) {
  if (options.outputPath) {
    return path.resolve(PROJECT_ROOT, options.outputPath);
  } // end explicit-output-path branch

  return path.join(PROJECT_ROOT, "playtest-saves", `${state.scenarioId}.initial.json`);
} // end resolveOutputPath

function writeStateFile(outputPath, state) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
} // end writeStateFile

function main() {
  const options = parseArguments(process.argv.slice(2));
  const state = buildScenarioState(options);
  const outputPath = resolveOutputPath(options, state);
  writeStateFile(outputPath, state);

  console.log(`Created playtest state: ${path.relative(PROJECT_ROOT, outputPath)}`);
  console.log(`Scenario: ${state.scenarioId}`);
  console.log(`Card instances: ${Object.keys(state.cardInstances).length}`);
  console.log(`Dungeon Deck cards: ${state.zones.dungeonDeck.length}`);
  console.log(`Status Deck cards: ${state.zones.statusDeck.length}`);
  console.log(`Active character: ${state.activeCharacterEntityId || "none"}`);
} // end main

try {
  main();
} catch (error) {
  console.error(`Playtest-state creation failed: ${error.message}`);
  process.exitCode = 1;
} // end top-level execution
