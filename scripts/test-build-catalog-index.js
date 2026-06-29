"use strict";

const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const CATALOG_PATH = path.join(PROJECT_ROOT, "generated", "card-catalog.json");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  } // end assertion guard
} // end assert function

function getSortedActiveIds(definitionsById) {
  return Object.values(definitionsById)
    .filter((definition) => definition.active === true)
    .map((definition) => definition.id)
    .sort((left, right) => left.localeCompare(right));
} // end getSortedActiveIds function

function assertDefinitionMap(definitionsById, label) {
  assert(definitionsById && typeof definitionsById === "object" && !Array.isArray(definitionsById), `${label} must be an object map.`);

  for (const [definitionId, definition] of Object.entries(definitionsById)) {
    assert(definition && typeof definition === "object" && !Array.isArray(definition), `${label} record ${definitionId} must be an object.`);
    assert(definition.id === definitionId, `${label} record ${definitionId} does not match its map key.`);
  } // end definition-map loop
} // end assertDefinitionMap function

function main() {
  const buildResult = childProcess.spawnSync(
    process.execPath,
    ["scripts/build-catalog-index.js"],
    {
      cwd: PROJECT_ROOT,
      encoding: "utf8"
    }
  );

  assert(buildResult.status === 0, `Catalog build exited with code ${buildResult.status}.\n${buildResult.stderr}`);
  assert(fs.existsSync(CATALOG_PATH), "Catalog build did not create generated/card-catalog.json.");

  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));

  assert(catalog.catalogVersion === 1, "Catalog version must be 1.");
  assertDefinitionMap(catalog.cardsById, "cardsById");
  assertDefinitionMap(catalog.decksById, "decksById");
  assertDefinitionMap(catalog.scenariosById, "scenariosById");

  assert(Object.keys(catalog.cardsById).length > 0, "Catalog must contain at least one card definition.");
  assert(Object.keys(catalog.decksById).length > 0, "Catalog must contain at least one deck definition.");
  assert(Object.keys(catalog.scenariosById).length > 0, "Catalog must contain at least one scenario definition.");

  assert(
    JSON.stringify(catalog.activeCardIds) === JSON.stringify(getSortedActiveIds(catalog.cardsById)),
    "activeCardIds does not match active card definitions."
  );
  assert(
    JSON.stringify(catalog.activeDeckIds) === JSON.stringify(getSortedActiveIds(catalog.decksById)),
    "activeDeckIds does not match active deck definitions."
  );
  assert(
    JSON.stringify(catalog.activeScenarioIds) === JSON.stringify(getSortedActiveIds(catalog.scenariosById)),
    "activeScenarioIds does not match active scenario definitions."
  );

  console.log("Catalog bundle test passed.");
  console.log(
    `Verified ${Object.keys(catalog.cardsById).length} cards, ${Object.keys(catalog.decksById).length} decks, and ${Object.keys(catalog.scenariosById).length} scenarios.`
  );
} // end main function

try {
  main();
} catch (error) {
  console.error(`Catalog bundle test failed: ${error.message}`);
  process.exitCode = 1;
} // end top-level execution
