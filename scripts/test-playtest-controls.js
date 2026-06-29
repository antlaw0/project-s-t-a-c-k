"use strict";

const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const requiredFiles = [
  "playtest.html",
  "css/playtest-tabletop.css",
  "js/playtest-tabletop.js",
  "docs/Playtest_Manual_Controls_v0.1.md"
]; // end required-files array

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  } // end assertion guard
} // end assert function

for (const relativePath of requiredFiles) {
  assert(fs.existsSync(path.join(projectRoot, relativePath)), `Missing manual-controls file: ${relativePath}`);
} // end required-files loop

const html = fs.readFileSync(path.join(projectRoot, "playtest.html"), "utf8");
const requiredHtmlReferences = [
  "id=\"draw-dungeon-card-button\"",
  "id=\"party-currency-value\"",
  "id=\"party-currency-input\"",
  "id=\"download-state-button\"",
  "id=\"manual-control-status\""
]; // end required-html-references array

for (const requiredReference of requiredHtmlReferences) {
  assert(html.includes(requiredReference), `playtest.html is missing manual-controls reference: ${requiredReference}`);
} // end required-html-references loop

const renderer = fs.readFileSync(path.join(projectRoot, "js", "playtest-tabletop.js"), "utf8");
const requiredRendererReferences = [
  "dungeonRevealArea",
  "drawDungeonCard",
  "deployRevealedEnemy",
  "discardRevealedDungeonCard",
  "defeatEnemyEntity",
  "changeEntityCounter",
  "setPartyCurrency",
  "downloadCurrentState",
  "isFriendlyEntity",
  "Draw top Dungeon Card"
]; // end required-renderer-references array

for (const requiredReference of requiredRendererReferences) {
  assert(renderer.includes(requiredReference), `playtest-tabletop.js is missing expected manual-control behavior: ${requiredReference}`);
} // end required-renderer-references loop

assert(renderer.includes("cardType !== \"enemy\""), "Enemy deployment guard is missing.");
assert(renderer.includes("definition.cardType === \"enemy\""), "Enemy reveal actions are missing.");
assert(renderer.includes("Resolve, deploy, or discard"), "Draw lock for an unresolved card is missing.");

console.log("Playtest manual-controls check passed.");
