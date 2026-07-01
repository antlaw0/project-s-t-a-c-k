"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const childProcess = require("child_process");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const SCENARIO_ID = "scenario.solo-warrior-goblin-warrens-smoke-test";
const EXPECTED_LOOT_INJECTION_COUNT = 8;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  } // end assertion guard
} // end assert function

function runNode(nodeArgs) {
  const result = childProcess.spawnSync(process.execPath, nodeArgs, {
    cwd: PROJECT_ROOT,
    encoding: "utf8"
  }); // end Node process call

  if (result.status !== 0) {
    const output = `${result.stdout || ""}\n${result.stderr || ""}`.trim();
    throw new Error(`Command failed: node ${nodeArgs.join(" ")}\n${output}`);
  } // end command failure branch

  return result;
} // end runNode function

function main() {
  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "project-stack-loot-deck-test-"));
  const baseStatePath = path.join(temporaryDirectory, "base-state.json");
  const lootStatePath = path.join(temporaryDirectory, "loot-state.json");

  try {
    runNode([
      "scripts/create-playtest-state.js",
      "--scenario",
      SCENARIO_ID,
      "--seed",
      "loot-deck-bootstrap-test",
      "--out",
      baseStatePath
    ]);

    runNode([
      "scripts/create-loot-playtest-state.js",
      "--scenario",
      SCENARIO_ID,
      "--seed",
      "loot-deck-bootstrap-test",
      "--out",
      lootStatePath
    ]);

    const baseState = JSON.parse(fs.readFileSync(baseStatePath, "utf8"));
    const lootState = JSON.parse(fs.readFileSync(lootStatePath, "utf8"));
    const injectedCardInstanceIds = Object.keys(lootState.cardInstances).filter(function findInjectedLoot(cardInstanceId) {
      return lootState.cardInstances[cardInstanceId].dungeonLootInjection === true;
    }); // end injected-loot filter

    assert(
      lootState.zones.dungeonDeck.length === baseState.zones.dungeonDeck.length + EXPECTED_LOOT_INJECTION_COUNT,
      `Expected ${baseState.zones.dungeonDeck.length + EXPECTED_LOOT_INJECTION_COUNT} Dungeon Deck cards but found ${lootState.zones.dungeonDeck.length}.`
    );

    assert(
      injectedCardInstanceIds.length === EXPECTED_LOOT_INJECTION_COUNT,
      `Expected ${EXPECTED_LOOT_INJECTION_COUNT} injected Loot Deck cards but found ${injectedCardInstanceIds.length}.`
    );

    assert(
      lootState.zones.dungeonDeck.filter(function countInjectedDeckCards(cardInstanceId) {
        return injectedCardInstanceIds.includes(cardInstanceId);
      }).length === EXPECTED_LOOT_INJECTION_COUNT,
      "Every injected Loot Deck card must be inside the face-down Dungeon Deck."
    );

    assert(
      lootState.zones.lootDeck.length > 0,
      "Expected the Global Loot Deck to retain at least one face-down card after injection."
    );

    assert(
      lootState.zones.lootDeck.every(function checkFaceDownLoot(cardInstanceId) {
        const instance = lootState.cardInstances[cardInstanceId];
        return instance && instance.zone === "lootDeck" && instance.faceUp === false;
      }),
      "Every remaining Loot Deck card must be face down and located in the Loot Deck."
    );

    assert(
      injectedCardInstanceIds.every(function checkFaceDownInjection(cardInstanceId) {
        const instance = lootState.cardInstances[cardInstanceId];
        return instance && instance.zone === "dungeonDeck" && instance.faceUp === false;
      }),
      "Every injected Loot Deck card must start face down in the Dungeon Deck."
    );

    assert(
      lootState.log.some(function findLootLog(entry) {
        return entry && entry.type === "lootDeckBuilt";
      }),
      "Runtime state must log construction of the Global Loot Deck."
    );

    assert(
      lootState.log.some(function findInjectionLog(entry) {
        return entry && entry.type === "dungeonLootInjected";
      }),
      "Runtime state must log blind dungeon Loot Deck injection."
    );

    console.log("Loot Deck bootstrap test passed.");
    console.log(
      `Verified ${EXPECTED_LOOT_INJECTION_COUNT} blind Loot Deck cards injected into a ${lootState.zones.dungeonDeck.length}-card Dungeon Deck and ${lootState.zones.lootDeck.length} cards retained in the Global Loot Deck.`
    );
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  } // end temporary-directory cleanup
} // end main function

try {
  main();
} catch (error) {
  console.error(`Loot Deck bootstrap test failed: ${error.message}`);
  process.exitCode = 1;
} // end top-level execution
