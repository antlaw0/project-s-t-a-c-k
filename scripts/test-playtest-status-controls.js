"use strict";

const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const requiredFiles = [
  "playtest.html",
  "css/playtest-tabletop.css",
  "js/playtest-tabletop.js",
  "scripts/create-playtest-state.js",
  "scripts/test-playtest-state.js",
  "docs/Playtest_Status_Row_Controls_v0.1.md"
]; // end required-files array

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  } // end assertion guard
} // end assert function

for (const relativePath of requiredFiles) {
  assert(fs.existsSync(path.join(projectRoot, relativePath)), `Missing Status Row controls file: ${relativePath}`);
} // end required-files loop

const html = fs.readFileSync(path.join(projectRoot, "playtest.html"), "utf8");
const requiredHtmlReferences = [
  "id=\"draw-status-card-button\"",
  "id=\"status-draw-summary\"",
  "Status Deck"
]; // end required-html-references array

for (const requiredReference of requiredHtmlReferences) {
  assert(html.includes(requiredReference), `playtest.html is missing Status Row control reference: ${requiredReference}`);
} // end required-html-reference loop

const renderer = fs.readFileSync(path.join(projectRoot, "js", "playtest-tabletop.js"), "utf8");
const requiredRendererReferences = [
  "DEFAULT_STATUS_ROW_SLOT_COUNT = 5",
  "normalizeStatusRow",
  "statusDeck",
  "statusRevealArea",
  "statusDiscardPile",
  "drawStatusCard",
  "placeRevealedNegativeStatus",
  "discardNegativeStatusFromRow",
  "discardNegativeStatusesFromDefeatedEntity",
  "moveSkillAttachmentToOwnerStatusRow",
  "returnStatusCardToSkillAttachment",
  "definitionMovesToOwnerStatusRow",
  "This status does not stack",
  "Status Row has no open space"
]; // end required-renderer-references array

for (const requiredReference of requiredRendererReferences) {
  assert(renderer.includes(requiredReference), `playtest-tabletop.js is missing expected Status Row behavior: ${requiredReference}`);
} // end required-renderer-reference loop

const stateGenerator = fs.readFileSync(path.join(projectRoot, "scripts", "create-playtest-state.js"), "utf8");
assert(stateGenerator.includes("getActiveNegativeStatusDefinitions"), "Runtime-state generator does not create a shared Status Deck.");
assert(stateGenerator.includes("statusDiscardPile"), "Runtime-state generator does not initialize a Status Discard Pile.");

console.log("Playtest Status Row controls check passed.");
