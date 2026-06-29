"use strict";

const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const DATA_ROOT = path.join(PROJECT_ROOT, "data");
const OUTPUT_PATH = path.join(PROJECT_ROOT, "generated", "card-catalog.json");

const COLLECTIONS = [
  { key: "cardsById", directory: "cards" },
  { key: "decksById", directory: "decks" },
  { key: "scenariosById", directory: "scenarios" }
];

function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Could not read JSON file ${filePath}: ${error.message}`);
  } // end readJsonFile catch
} // end readJsonFile function

function listJsonFilesRecursively(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    return [];
  } // end missing-directory guard

  const files = [];
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...listJsonFilesRecursively(entryPath));
      continue;
    } // end directory branch

    if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) {
      files.push(entryPath);
    } // end JSON-file branch
  } // end directory loop

  return files.sort((left, right) => left.localeCompare(right));
} // end listJsonFilesRecursively function

function loadDefinitions(collection) {
  const directoryPath = path.join(DATA_ROOT, collection.directory);
  const files = listJsonFilesRecursively(directoryPath);
  const definitionsById = {};

  for (const filePath of files) {
    const definition = readJsonFile(filePath);

    if (!definition || typeof definition !== "object" || Array.isArray(definition)) {
      throw new Error(`${filePath} must contain one JSON object.`);
    } // end definition-object validation

    if (typeof definition.id !== "string" || definition.id.trim().length === 0) {
      throw new Error(`${filePath} is missing a non-empty id.`);
    } // end definition-id validation

    if (Object.prototype.hasOwnProperty.call(definitionsById, definition.id)) {
      throw new Error(`Duplicate ${collection.directory} definition id ${definition.id}.`);
    } // end duplicate-ID validation

    definitionsById[definition.id] = definition;
  } // end definition-file loop

  return definitionsById;
} // end loadDefinitions function

function getActiveIds(definitionsById) {
  return Object.values(definitionsById)
    .filter((definition) => definition.active === true)
    .map((definition) => definition.id)
    .sort((left, right) => left.localeCompare(right));
} // end getActiveIds function

function buildCatalog() {
  const catalog = {
    catalogVersion: 1,
    cardsById: {},
    decksById: {},
    scenariosById: {},
    activeCardIds: [],
    activeDeckIds: [],
    activeScenarioIds: []
  };

  for (const collection of COLLECTIONS) {
    const definitionsById = loadDefinitions(collection);
    catalog[collection.key] = definitionsById;

    if (collection.key === "cardsById") {
      catalog.activeCardIds = getActiveIds(definitionsById);
    } else if (collection.key === "decksById") {
      catalog.activeDeckIds = getActiveIds(definitionsById);
    } else if (collection.key === "scenariosById") {
      catalog.activeScenarioIds = getActiveIds(definitionsById);
    } // end collection-key branch
  } // end collection loop

  return catalog;
} // end buildCatalog function

function writeCatalog(catalog) {
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
} // end writeCatalog function

function main() {
  const catalog = buildCatalog();
  writeCatalog(catalog);

  console.log(`Built browser catalog: ${path.relative(PROJECT_ROOT, OUTPUT_PATH)}`);
  console.log(`Cards: ${Object.keys(catalog.cardsById).length} total, ${catalog.activeCardIds.length} active.`);
  console.log(`Decks: ${Object.keys(catalog.decksById).length} total, ${catalog.activeDeckIds.length} active.`);
  console.log(`Scenarios: ${Object.keys(catalog.scenariosById).length} total, ${catalog.activeScenarioIds.length} active.`);
} // end main function

try {
  main();
} catch (error) {
  console.error(`Catalog build failed: ${error.message}`);
  process.exitCode = 1;
} // end top-level execution
