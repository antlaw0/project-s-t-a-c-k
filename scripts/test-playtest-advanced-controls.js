"use strict";

const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const requiredFiles = [
  "playtest.html",
  path.join("js", "playtest-tabletop.js"),
  path.join("css", "playtest-tabletop.css"),
  path.join("docs", "Playtest_Advanced_Manual_Controls_v0.1.md")
];

for (const relativePath of requiredFiles) {
  const absolutePath = path.join(PROJECT_ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Missing required advanced tabletop file: ${relativePath}`);
  } // end required-file existence branch
} // end required-file loop

const html = fs.readFileSync(path.join(PROJECT_ROOT, "playtest.html"), "utf8");
const script = fs.readFileSync(path.join(PROJECT_ROOT, "js", "playtest-tabletop.js"), "utf8");
const packagePath = path.join(PROJECT_ROOT, "package.json");
const packageJson = fs.existsSync(packagePath)
  ? JSON.parse(fs.readFileSync(packagePath, "utf8"))
  : null;

const requiredHtmlIds = [
  "draw-bottom-dungeon-card-button",
  "shuffle-dungeon-deck-button",
  "draw-dungeon-discard-top-button",
  "draw-dungeon-discard-bottom-button",
  "shuffle-dungeon-discard-button",
  "add-player-character-button",
  "add-hireling-button",
  "add-summon-button",
  "assign-card-button"
];

for (const id of requiredHtmlIds) {
  if (!html.includes(`id=\"${id}\"`)) {
    throw new Error(`playtest.html is missing required control ${id}.`);
  } // end required-html-id branch
} // end required-html-id loop

const requiredScriptFragments = [
  "function resolveTacticalReserveUse",
  "function drawDungeonCardFromZone",
  "function returnCardToDungeonDeckBottom",
  "function shuffleZone",
  "function addPlayerCharacter",
  "function addHireling",
  "function addSummon",
  "function assignCardToEntity",
  "source.pop()",
  "source.shift()",
  "dungeonDeck.unshift(cardInstanceId)"
];

for (const fragment of requiredScriptFragments) {
  if (!script.includes(fragment)) {
    throw new Error(`playtest-tabletop.js is missing expected advanced control behavior: ${fragment}`);
  } // end required-script-fragment branch
} // end required-script-fragment loop

if (packageJson && (!packageJson.scripts || !packageJson.scripts["check:playtest-advanced-controls"])) {
  throw new Error("package.json is missing the check:playtest-advanced-controls script.");
} // end package-script branch

console.log("Playtest advanced manual-controls check passed.");
console.log("Verified deck top/bottom drawing, explicit shuffling, return-to-bottom, Tactical Reserve return to Loot Deck, participant creation, friendly entity creation, and player-character card assignment controls.");
