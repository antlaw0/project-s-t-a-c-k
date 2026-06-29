"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const childProcess = require("child_process");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const TEST_SCENARIO_ID = "scenario.solo-warrior-goblin-warrens-smoke-test";
const TEST_SEED = "20260629";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  } // end assertion failure guard
} // end assert

function expectedNegativeStatusCardCount() {
  const cardsDirectory = path.join(PROJECT_ROOT, "data", "cards");
  const stack = [cardsDirectory];
  let total = 0;

  while (stack.length > 0) {
    const currentDirectory = stack.pop();
    const entries = fs.readdirSync(currentDirectory, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(currentDirectory, entry.name);
      if (entry.isDirectory()) {
        stack.push(entryPath);
        continue;
      } // end nested-directory branch

      if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".json")) {
        continue;
      } // end non-json-file branch

      const card = JSON.parse(fs.readFileSync(entryPath, "utf8"));
      if (card.active === true && card.cardType === "status" && card.data && card.data.statusCategory === "negative") {
        total += card.count;
      } // end negative-status-card branch
    } // end directory-entry loop
  } // end card-directory traversal loop

  return total;
} // end expectedNegativeStatusCardCount function

function main() {
  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "project-stack-state-test-"));
  const outputPath = path.join(temporaryDirectory, "runtime-state.json");
  const commandResult = childProcess.spawnSync(
    process.execPath,
    [
      "scripts/create-playtest-state.js",
      "--scenario",
      TEST_SCENARIO_ID,
      "--seed",
      TEST_SEED,
      "--out",
      outputPath
    ],
    {
      cwd: PROJECT_ROOT,
      encoding: "utf8"
    }
  );

  try {
    assert(commandResult.status === 0, `State generator exited with code ${commandResult.status}.\n${commandResult.stderr}`);
    assert(fs.existsSync(outputPath), "State generator did not create its output file.");

    const state = JSON.parse(fs.readFileSync(outputPath, "utf8"));
    const entityIds = Object.keys(state.entities);
    const cardInstanceIds = Object.keys(state.cardInstances);

    assert(state.scenarioId === TEST_SCENARIO_ID, "State scenarioId does not match the requested scenario.");
    assert(state.seed === TEST_SEED, "State seed does not match the requested seed.");
    assert(entityIds.length === 1, `Expected 1 player entity but found ${entityIds.length}.`);
    assert(state.zones.playerFormation.frontRow.filter(Boolean).length === 1, "Expected one entity in the Player Front Row.");
    const statusDeckCardCount = expectedNegativeStatusCardCount();
    const expectedCardInstanceCount = 13 + statusDeckCardCount;
    assert(state.zones.dungeonDeck.length === 8, `Expected 8 Dungeon Deck cards but found ${state.zones.dungeonDeck.length}.`);
    assert(state.zones.statusDeck.length === statusDeckCardCount, `Expected ${statusDeckCardCount} Status Deck cards but found ${state.zones.statusDeck.length}.`);
    assert(state.zones.statusRevealArea.length === 0, "Status Reveal Area should start empty.");
    assert(state.zones.statusDiscardPile.length === 0, "Status Discard Pile should start empty.");
    assert(cardInstanceIds.length === expectedCardInstanceCount, `Expected ${expectedCardInstanceCount} runtime card instances but found ${cardInstanceIds.length}.`);
    assert(state.zones.dungeonDeck.every((instanceId) => state.cardInstances[instanceId].faceUp === false), "Every Dungeon Deck card should start face down.");
    assert(state.zones.statusDeck.every((instanceId) => state.cardInstances[instanceId].faceUp === false), "Every Status Deck card should start face down.");

    console.log("Playtest-state generator test passed.");
    console.log(`Verified scenario ${TEST_SCENARIO_ID}, ${expectedCardInstanceCount} card instances, an 8-card shuffled Dungeon Deck, and a ${statusDeckCardCount}-card shared Status Deck.`);
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  } // end temporary-directory cleanup
} // end main

try {
  main();
} catch (error) {
  console.error(`Playtest-state generator test failed: ${error.message}`);
  process.exitCode = 1;
} // end top-level execution
