#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const repositoryRoot = path.resolve(__dirname, "..");
const cardsRoot = path.join(repositoryRoot, "data", "cards");
const artCatalogPath = path.join(repositoryRoot, "data", "assets", "art-assets.json");
const errors = [];
const idPattern = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const cardTypePattern = /^[a-z][A-Za-z0-9]*$/;
const allowedCardFields = new Set([
  "id",
  "active",
  "count",
  "cardType",
  "name",
  "revision",
  "moduleId",
  "artId",
  "printTemplate",
  "tags",
  "rulesText",
  "data",
  "source"
]);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
} // closes isPlainObject

function addError(filePath, message) {
  const relativePath = path.relative(repositoryRoot, filePath) || filePath;
  errors.push(`${relativePath}: ${message}`);
} // closes addError

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    addError(filePath, `invalid JSON: ${error.message}`);
    return null;
  } // closes try/catch in readJson
} // closes readJson

function findJsonFiles(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    return [];
  } // closes missing-directory condition

  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...findJsonFiles(entryPath));
      continue;
    } // closes directory condition

    if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(entryPath);
    } // closes JSON-file condition
  } // closes directory-entry loop

  return files.sort();
} // closes findJsonFiles

function loadArtAssetIds() {
  if (!fs.existsSync(artCatalogPath)) {
    addError(artCatalogPath, "missing artwork asset catalog.");
    return new Set();
  } // closes missing-art-catalog condition

  const catalog = readJson(artCatalogPath);

  if (!isPlainObject(catalog) || !Array.isArray(catalog.assets)) {
    addError(artCatalogPath, "must contain an assets array.");
    return new Set();
  } // closes invalid-art-catalog condition

  const assetIds = new Set();

  for (const asset of catalog.assets) {
    if (!isPlainObject(asset)) {
      addError(artCatalogPath, "each asset must be an object.");
      continue;
    } // closes invalid-art-asset condition

    if (typeof asset.id !== "string" || !idPattern.test(asset.id)) {
      addError(artCatalogPath, "each asset needs a valid id.");
      continue;
    } // closes invalid-art-id condition

    if (assetIds.has(asset.id)) {
      addError(artCatalogPath, `duplicate artwork id \"${asset.id}\".`);
      continue;
    } // closes duplicate-art-id condition

    if (typeof asset.filePath !== "string" || asset.filePath.trim() === "") {
      addError(artCatalogPath, `artwork \"${asset.id}\" needs a filePath.`);
      continue;
    } // closes missing-art-path condition

    const artworkPath = path.join(repositoryRoot, asset.filePath);

    if (!fs.existsSync(artworkPath)) {
      addError(artCatalogPath, `artwork \"${asset.id}\" points to a missing file: ${asset.filePath}`);
    } // closes missing-artwork-file condition

    assetIds.add(asset.id);
  } // closes art-asset loop

  return assetIds;
} // closes loadArtAssetIds

function validateSource(filePath, source) {
  if (source === undefined) {
    return;
  } // closes missing-source condition

  if (!isPlainObject(source)) {
    addError(filePath, "source must be an object when provided.");
    return;
  } // closes invalid-source condition

  const allowedSourceFields = new Set([
    "sourceFile",
    "sourceSection",
    "verifiedAgainstRulebook",
    "notes"
  ]);

  for (const fieldName of Object.keys(source)) {
    if (!allowedSourceFields.has(fieldName)) {
      addError(filePath, `source has an unsupported field: \"${fieldName}\".`);
    } // closes unsupported-source-field condition
  } // closes source-field loop

  for (const fieldName of ["sourceFile", "sourceSection", "notes"]) {
    if (source[fieldName] !== undefined && typeof source[fieldName] !== "string") {
      addError(filePath, `source.${fieldName} must be a string when provided.`);
    } // closes source-string-field condition
  } // closes source-string-field loop

  if (
    source.verifiedAgainstRulebook !== undefined &&
    typeof source.verifiedAgainstRulebook !== "boolean"
  ) {
    addError(filePath, "source.verifiedAgainstRulebook must be a boolean when provided.");
  } // closes verified-against-rulebook condition
} // closes validateSource

function validateCard(filePath, card, knownArtIds, seenCardIds) {
  if (!isPlainObject(card)) {
    addError(filePath, "card definition must be an object.");
    return;
  } // closes invalid-card-object condition

  for (const fieldName of Object.keys(card)) {
    if (!allowedCardFields.has(fieldName)) {
      addError(filePath, `unsupported top-level field: \"${fieldName}\".`);
    } // closes unsupported-card-field condition
  } // closes card-field loop

  const requiredFields = [
    "id",
    "active",
    "count",
    "cardType",
    "name",
    "revision",
    "artId",
    "printTemplate",
    "tags",
    "rulesText",
    "data"
  ];

  for (const fieldName of requiredFields) {
    if (!(fieldName in card)) {
      addError(filePath, `missing required field: \"${fieldName}\".`);
    } // closes missing-required-field condition
  } // closes required-field loop

  if (typeof card.id !== "string" || !idPattern.test(card.id)) {
    addError(filePath, "id must use lowercase letters, digits, dots, and hyphens only.");
  } else if (seenCardIds.has(card.id)) {
    addError(filePath, `duplicate card id \"${card.id}\"; first defined in ${path.relative(repositoryRoot, seenCardIds.get(card.id))}.`);
  } else {
    seenCardIds.set(card.id, filePath);
  } // closes id-validation branch

  if (typeof card.active !== "boolean") {
    addError(filePath, "active must be true or false.");
  } // closes active-type condition

  if (!Number.isInteger(card.count) || card.count < 0) {
    addError(filePath, "count must be a non-negative integer.");
  } // closes count-type condition

  if (card.active === true && card.count < 1) {
    addError(filePath, "an active card must have count of at least 1.");
  } // closes active-count condition

  if (typeof card.cardType !== "string" || !cardTypePattern.test(card.cardType)) {
    addError(filePath, "cardType must begin with a lowercase letter and contain only letters and digits.");
  } // closes card-type condition

  if (typeof card.name !== "string" || card.name.trim() === "") {
    addError(filePath, "name must be a non-empty string.");
  } // closes name condition

  if (!Number.isInteger(card.revision) || card.revision < 1) {
    addError(filePath, "revision must be an integer of at least 1.");
  } // closes revision condition

  if (card.moduleId !== undefined && (typeof card.moduleId !== "string" || !idPattern.test(card.moduleId))) {
    addError(filePath, "moduleId must use lowercase letters, digits, dots, and hyphens when provided.");
  } // closes module-id condition

  if (typeof card.artId !== "string" || !idPattern.test(card.artId)) {
    addError(filePath, "artId must use lowercase letters, digits, dots, and hyphens only.");
  } else if (!knownArtIds.has(card.artId)) {
    addError(filePath, `artId \"${card.artId}\" is not registered in data/assets/art-assets.json.`);
  } // closes art-id validation branch

  if (typeof card.printTemplate !== "string" || card.printTemplate.trim() === "") {
    addError(filePath, "printTemplate must be a non-empty string.");
  } // closes print-template condition

  if (!Array.isArray(card.tags) || card.tags.length === 0) {
    addError(filePath, "tags must be a non-empty array.");
  } else {
    const seenTags = new Set();

    for (const tag of card.tags) {
      if (typeof tag !== "string" || !idPattern.test(tag)) {
        addError(filePath, "each tag must use lowercase letters, digits, dots, and hyphens only.");
        continue;
      } // closes invalid-tag condition

      if (seenTags.has(tag)) {
        addError(filePath, `tags must not repeat \"${tag}\".`);
      } // closes duplicate-tag condition

      seenTags.add(tag);
    } // closes tag loop
  } // closes tag-array branch

  if (typeof card.rulesText !== "string" || card.rulesText.trim() === "") {
    addError(filePath, "rulesText must be a non-empty string.");
  } // closes rules-text condition

  if (!isPlainObject(card.data)) {
    addError(filePath, "data must be an object.");
  } // closes data-object condition

  validateSource(filePath, card.source);
} // closes validateCard

function main() {
  const knownArtIds = loadArtAssetIds();
  const cardFiles = findJsonFiles(cardsRoot);
  const seenCardIds = new Map();

  if (cardFiles.length === 0) {
    addError(cardsRoot, "no card definition JSON files were found.");
  } // closes no-card-files condition

  for (const cardFilePath of cardFiles) {
    const card = readJson(cardFilePath);

    if (card !== null) {
      validateCard(cardFilePath, card, knownArtIds, seenCardIds);
    } // closes parsed-card condition
  } // closes card-file loop

  if (errors.length > 0) {
    console.error(`Card validation failed with ${errors.length} error${errors.length === 1 ? "" : "s"}:`);

    for (const error of errors) {
      console.error(`- ${error}`);
    } // closes error-output loop

    process.exitCode = 1;
    return;
  } // closes validation-error condition

  console.log(`Card validation passed: ${cardFiles.length} card definition${cardFiles.length === 1 ? "" : "s"} checked.`);
} // closes main

main();
