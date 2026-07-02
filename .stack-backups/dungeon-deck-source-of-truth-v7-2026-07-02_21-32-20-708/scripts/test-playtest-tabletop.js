"use strict";

const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const requiredFiles = [
  "playtest.html",
  "css/playtest-tabletop.css",
  "js/playtest-tabletop.js"
]; // end required-files array

for (const relativePath of requiredFiles) {
  const absolutePath = path.join(projectRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Missing required tabletop-renderer file: ${relativePath}`);
  } // end missing-required-file branch
} // end required-file loop

const html = fs.readFileSync(path.join(projectRoot, "playtest.html"), "utf8");
const requiredHtmlReferences = [
  "css/playtest-tabletop.css",
  "js/playtest-tabletop.js",
  "id=\"state-file-input\"",
  "id=\"formation-grid\"",
  "id=\"character-areas\"",
  "id=\"zone-summary\"",
  "id=\"card-details\""
]; // end required-HTML-references array

for (const requiredReference of requiredHtmlReferences) {
  if (!html.includes(requiredReference)) {
    throw new Error(`playtest.html is missing expected reference: ${requiredReference}`);
  } // end missing-HTML-reference branch
} // end required-HTML-reference loop

const renderer = fs.readFileSync(path.join(projectRoot, "js", "playtest-tabletop.js"), "utf8");
const requiredRendererReferences = [
  "./generated/card-catalog.json",
  "./playtest-saves/scenario.solo-warrior-goblin-warrens-smoke-test.initial.json",
  "renderFormation",
  "renderCharacterAreas",
  "renderZones",
  "renderCardDetails"
]; // end required-renderer-references array

for (const requiredReference of requiredRendererReferences) {
  if (!renderer.includes(requiredReference)) {
    throw new Error(`playtest-tabletop.js is missing expected behavior marker: ${requiredReference}`);
  } // end missing-renderer-reference branch
} // end required-renderer-reference loop

console.log("Playtest tabletop renderer check passed.");
