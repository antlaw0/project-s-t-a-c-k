"use strict";

const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const DEFAULT_SCENARIO_ID = "scenario.solo-warrior-goblin-warrens-smoke-test";
const DEFAULT_LOOT_INJECTION_COUNT = 8;
const DEFAULT_LOOT_CARD_TYPES = new Set(["equipment", "tacticalReserve", "item", "transportation"]);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  } // end assertion guard
} // end assert function

function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Could not read JSON file ${filePath}: ${error.message}`);
  } // end JSON-read catch
} // end readJsonFile function

function writeJsonFile(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
} // end writeJsonFile function

function listJsonFilesRecursively(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    return [];
  } // end missing-directory branch

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
} // end listJsonFilesRecursively function

function loadDefinitions(directoryPath, label) {
  const definitionsById = new Map();

  for (const filePath of listJsonFilesRecursively(directoryPath)) {
    const definition = readJsonFile(filePath);

    if (!definition || typeof definition.id !== "string" || definition.id.length === 0) {
      throw new Error(`${label} file ${filePath} is missing a non-empty id.`);
    } // end definition-ID validation

    if (definitionsById.has(definition.id)) {
      throw new Error(`${label} ID ${definition.id} is duplicated. Check ${filePath}.`);
    } // end duplicate-definition validation

    definitionsById.set(definition.id, definition);
  } // end definition-file loop

  return definitionsById;
} // end loadDefinitions function

function hashSeed(seedValue) {
  const seedText = String(seedValue);
  let hash = 2166136261;

  for (let index = 0; index < seedText.length; index += 1) {
    hash ^= seedText.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  } // end seed-character loop

  return hash >>> 0;
} // end hashSeed function

function createSeededRandom(seedValue) {
  let state = hashSeed(seedValue) || 1;

  return function nextRandom() {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  }; // end next-random function
} // end createSeededRandom function

function shuffleCopy(values, random) {
  const shuffledValues = [...values];

  for (let index = shuffledValues.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const currentValue = shuffledValues[index];
    shuffledValues[index] = shuffledValues[swapIndex];
    shuffledValues[swapIndex] = currentValue;
  } // end Fisher-Yates loop

  return shuffledValues;
} // end shuffleCopy function

function parseArguments(argumentValues) {
  const originalArguments = [...argumentValues];
  let scenarioId = DEFAULT_SCENARIO_ID;
  let outputPath = null;

  for (let index = 0; index < argumentValues.length; index += 1) {
    const argument = argumentValues[index];
    const nextValue = argumentValues[index + 1];

    if (argument === "--scenario") {
      scenarioId = nextValue;
      index += 1;
      continue;
    } // end scenario option branch

    if (argument === "--out") {
      outputPath = nextValue;
      index += 1;
      continue;
    } // end output option branch
  } // end argument loop

  if (!scenarioId) {
    throw new Error("--scenario requires a value.");
  } // end scenario argument validation

  if (outputPath === "") {
    throw new Error("--out requires a file path.");
  } // end output argument validation

  return {
    originalArguments,
    scenarioId,
    outputPath
  }; // end argument result
} // end parseArguments function

function resolveStateOutputPath(options) {
  if (options.outputPath) {
    return path.resolve(PROJECT_ROOT, options.outputPath);
  } // end explicit-output path branch

  return path.join(PROJECT_ROOT, "playtest-saves", `${options.scenarioId}.initial.json`);
} // end resolveStateOutputPath function

function isLootEligible(definition) {
  if (!definition || definition.active !== true) {
    return false;
  } // end inactive-definition branch

  const lootDeck = definition.data && definition.data.lootDeck ? definition.data.lootDeck : null;

  if (lootDeck && lootDeck.eligible === false) {
    return false;
  } // end explicit-ineligible branch

  if (lootDeck && lootDeck.eligible === true) {
    return true;
  } // end explicit-eligible branch

  return DEFAULT_LOOT_CARD_TYPES.has(definition.cardType);
} // end isLootEligible function

function getHighestInstanceSequence(state, definitionId) {
  const prefix = `instance.${definitionId}.`;
  let highestSequence = 0;

  for (const instanceId of Object.keys(state.cardInstances || {})) {
    if (!instanceId.startsWith(prefix)) {
      continue;
    } // end unrelated-instance branch

    const candidateSequence = Number(instanceId.slice(prefix.length));

    if (Number.isInteger(candidateSequence) && candidateSequence > highestSequence) {
      highestSequence = candidateSequence;
    } // end highest-sequence branch
  } // end instance-ID loop

  return highestSequence;
} // end getHighestInstanceSequence function

function getUsageCountByDefinition(state) {
  const counts = new Map();

  for (const instance of Object.values(state.cardInstances || {})) {
    if (!instance || typeof instance.definitionId !== "string") {
      continue;
    } // end invalid-instance branch

    counts.set(instance.definitionId, (counts.get(instance.definitionId) || 0) + 1);
  } // end runtime-instance loop

  return counts;
} // end getUsageCountByDefinition function

function appendLog(state, type, message) {
  const currentLog = Array.isArray(state.log) ? state.log : [];
  const greatestSequence = currentLog.reduce(function calculateGreatestSequence(currentGreatest, entry) {
    return Math.max(currentGreatest, Number.isInteger(entry && entry.sequence) ? entry.sequence : 0);
  }, 0);

  currentLog.push({
    sequence: greatestSequence + 1,
    type,
    message
  }); // end log-entry object

  state.log = currentLog;
} // end appendLog function

function spawnBaseStateGenerator(options) {
  const originalGeneratorPath = path.join(PROJECT_ROOT, "scripts", "create-playtest-state.js");

  assert(fs.existsSync(originalGeneratorPath), `Missing base state generator: ${originalGeneratorPath}`);

  const result = childProcess.spawnSync(
    process.execPath,
    [originalGeneratorPath, ...options.originalArguments],
    {
      cwd: PROJECT_ROOT,
      encoding: "utf8"
    }
  ); // end base-generator process call

  if (result.stdout) {
    process.stdout.write(result.stdout);
  } // end standard-output branch

  if (result.status !== 0) {
    const detail = result.stderr ? `\n${result.stderr}` : "";
    throw new Error(`The existing base state generator failed with exit code ${result.status}.${detail}`);
  } // end base-generator failure branch
} // end spawnBaseStateGenerator function

function buildGlobalLootDeck(state, cardDefinitionsById, random) {
  state.zones = state.zones && typeof state.zones === "object" ? state.zones : {};
  state.zones.lootDeck = Array.isArray(state.zones.lootDeck) ? state.zones.lootDeck : [];

  if (state.zones.lootDeck.length > 0) {
    throw new Error("The base state already contains Loot Deck cards. This bootstrap expects the existing generator to start with an empty Loot Deck.");
  } // end nonempty-loot-deck validation

  const usageCounts = getUsageCountByDefinition(state);
  const newLootDeckInstanceIds = [];

  const definitions = [...cardDefinitionsById.values()]
    .filter(isLootEligible)
    .sort(function sortLootDefinitions(first, second) {
      return first.id.localeCompare(second.id);
    }); // end loot-definition filtering and sort

  for (const definition of definitions) {
    const usedCount = usageCounts.get(definition.id) || 0;
    const remainingCount = definition.count - usedCount;

    if (remainingCount < 0) {
      throw new Error(`${definition.id} has ${usedCount} runtime instances but only ${definition.count} physical copies.`);
    } // end impossible-copy-count validation

    let nextSequence = getHighestInstanceSequence(state, definition.id);

    for (let copyIndex = 0; copyIndex < remainingCount; copyIndex += 1) {
      nextSequence += 1;

      const instanceId = `instance.${definition.id}.${String(nextSequence).padStart(3, "0")}`;

      if (state.cardInstances[instanceId]) {
        throw new Error(`Loot Deck instance ID collision: ${instanceId}`);
      } // end instance-ID collision validation

      state.cardInstances[instanceId] = {
        id: instanceId,
        definitionId: definition.id,
        cardType: definition.cardType,
        ownerEntityId: null,
        zone: "lootDeck",
        zoneDetail: "globalLootDeck",
        faceUp: false,
        lootDeckOrigin: true
      }; // end loot-card instance object

      newLootDeckInstanceIds.push(instanceId);
    } // end remaining-copy loop
  } // end loot-definition loop

  state.zones.lootDeck = shuffleCopy(newLootDeckInstanceIds, random);

  return state.zones.lootDeck.length;
} // end buildGlobalLootDeck function

function injectDungeonLoot(state, scenario, random) {
  const dungeonSetup = scenario.data && scenario.data.dungeonSetup ? scenario.data.dungeonSetup : {};
  const configuredCount = dungeonSetup.lootInjectionCount;
  const injectionCount = Number.isInteger(configuredCount)
    ? configuredCount
    : DEFAULT_LOOT_INJECTION_COUNT;

  if (injectionCount < 0) {
    throw new Error(`Scenario ${scenario.id} has an invalid lootInjectionCount.`);
  } // end invalid-injection-count branch

  const lootDeck = state.zones.lootDeck;

  if (lootDeck.length < injectionCount) {
    throw new Error(
      `Dungeon initialization requires ${injectionCount} Loot Deck cards, but the Loot Deck contains only ${lootDeck.length}. Add more eligible loot card copies or lower dungeonSetup.lootInjectionCount.`
    );
  } // end insufficient-loot-deck validation

  const injectedCardInstanceIds = lootDeck.splice(0, injectionCount);

  for (const cardInstanceId of injectedCardInstanceIds) {
    const instance = state.cardInstances[cardInstanceId];

    instance.zone = "dungeonDeck";
    instance.zoneDetail = "lootDeckInjection";
    instance.faceUp = false;
    instance.dungeonLootInjection = true;
  } // end injected-card update loop

  state.zones.dungeonDeck = shuffleCopy(
    [...state.zones.dungeonDeck, ...injectedCardInstanceIds],
    random
  ); // end combined-dungeon-deck shuffle

  state.dungeonLootInjection = {
    count: injectionCount,
    cardInstanceIds: injectedCardInstanceIds
  }; // end injection-metadata object

  return injectedCardInstanceIds;
} // end injectDungeonLoot function

function buildLootDeckState(options) {
  spawnBaseStateGenerator(options);

  const outputPath = resolveStateOutputPath(options);
  const state = readJsonFile(outputPath);
  const cardDefinitionsById = loadDefinitions(path.join(PROJECT_ROOT, "data", "cards"), "Card definition");
  const scenarioDefinitionsById = loadDefinitions(path.join(PROJECT_ROOT, "data", "scenarios"), "Scenario definition");
  const scenario = scenarioDefinitionsById.get(options.scenarioId);

  assert(scenario, `Scenario ${options.scenarioId} was not found under data/scenarios.`);

  const random = createSeededRandom(`${state.seed || "default"}:global-loot-deck`);
  const createdLootCardCount = buildGlobalLootDeck(state, cardDefinitionsById, random);
  const injectedCardInstanceIds = injectDungeonLoot(state, scenario, random);

  appendLog(
    state,
    "lootDeckBuilt",
    `Built the Global Loot Deck with ${createdLootCardCount} face-down cards from eligible remaining physical copies.`
  );

  appendLog(
    state,
    "dungeonLootInjected",
    `Blindly drew ${injectedCardInstanceIds.length} face-down Loot Deck cards and shuffled them into the Dungeon Deck.`
  );

  writeJsonFile(outputPath, state);

  return {
    outputPath,
    createdLootCardCount,
    injectedCardCount: injectedCardInstanceIds.length,
    remainingLootDeckCardCount: state.zones.lootDeck.length,
    dungeonDeckCardCount: state.zones.dungeonDeck.length
  }; // end build result object
} // end buildLootDeckState function

function main() {
  const options = parseArguments(process.argv.slice(2));
  const result = buildLootDeckState(options);

  console.log(`Loot Deck cards after injection: ${result.remainingLootDeckCardCount}`);
  console.log(`Injected Loot Deck cards: ${result.injectedCardCount}`);
  console.log(`Dungeon Deck cards after injection: ${result.dungeonDeckCardCount}`);
  console.log(`Loot-aware playtest state: ${path.relative(PROJECT_ROOT, result.outputPath)}`);
} // end main function

try {
  main();
} catch (error) {
  console.error(`Loot Deck state creation failed: ${error.message}`);
  process.exitCode = 1;
} // end top-level execution
