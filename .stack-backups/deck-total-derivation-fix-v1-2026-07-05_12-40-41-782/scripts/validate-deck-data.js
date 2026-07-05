#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const repositoryRoot = path.resolve(__dirname, "..");
const cardsRoot = path.join(repositoryRoot, "data", "cards");
const decksRoot = path.join(repositoryRoot, "data", "decks");
const errors = [];
const idPattern = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const typePattern = /^[a-z][A-Za-z0-9]*$/;
const allowedDeckFields = new Set([
  "id",
  "active",
  "deckType",
  "name",
  "revision",
  "moduleId",
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

  const files = [];

  for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
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

function loadCardsById() {
  const cardsById = new Map();
  const cardFiles = findJsonFiles(cardsRoot);

  for (const cardFilePath of cardFiles) {
    const card = readJson(cardFilePath);

    if (!isPlainObject(card) || typeof card.id !== "string" || !idPattern.test(card.id)) {
      continue;
    } // closes invalid-card-record condition

    if (cardsById.has(card.id)) {
      addError(
        cardFilePath,
        `duplicate card id \"${card.id}\" while loading card references; first defined in ${path.relative(repositoryRoot, cardsById.get(card.id).filePath)}.`
      );
      continue;
    } // closes duplicate-card-id condition

    cardsById.set(card.id, {
      filePath: cardFilePath,
      active: card.active,
      count: card.count
    });
  } // closes card-file loop

  return cardsById;
} // closes loadCardsById

function validateTags(filePath, tags) {
  if (!Array.isArray(tags) || tags.length === 0) {
    addError(filePath, "tags must be a non-empty array.");
    return;
  } // closes invalid-tags-array condition

  const seenTags = new Set();

  for (const tag of tags) {
    if (typeof tag !== "string" || !idPattern.test(tag)) {
      addError(filePath, "each tag must use lowercase letters, digits, dots, and hyphens only.");
      continue;
    } // closes invalid-tag condition

    if (seenTags.has(tag)) {
      addError(filePath, `tags must not repeat \"${tag}\".`);
    } // closes duplicate-tag condition

    seenTags.add(tag);
  } // closes tag loop
} // closes validateTags

function validateDeckEntries(filePath, deck, cardsById) {
  if (!isPlainObject(deck.data)) {
    addError(filePath, "data must be an object.");
    return;
  } // closes invalid-deck-data condition

  const entries = deck.data.cardEntries;

  if (!Array.isArray(entries) || entries.length === 0) {
    addError(filePath, "data.cardEntries must be a non-empty array.");
    return;
  } // closes invalid-card-entries condition

  const seenCardIds = new Set();
  let actualTotal = 0;

  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const entryLabel = `data.cardEntries[${index}]`;

    if (!isPlainObject(entry)) {
      addError(filePath, `${entryLabel} must be an object.`);
      continue;
    } // closes invalid-entry-object condition

    const entryFields = Object.keys(entry);

    for (const fieldName of entryFields) {
      if (fieldName !== "cardId" && fieldName !== "quantity") {
        addError(filePath, `${entryLabel} has an unsupported field: \"${fieldName}\".`);
      } // closes unsupported-entry-field condition
    } // closes entry-field loop

    if (typeof entry.cardId !== "string" || !idPattern.test(entry.cardId)) {
      addError(filePath, `${entryLabel}.cardId must use lowercase letters, digits, dots, and hyphens only.`);
      continue;
    } // closes invalid-entry-card-id condition

    if (!Number.isInteger(entry.quantity) || entry.quantity < 1) {
      addError(filePath, `${entryLabel}.quantity must be an integer of at least 1.`);
      continue;
    } // closes invalid-entry-quantity condition

    if (seenCardIds.has(entry.cardId)) {
      addError(filePath, `${entryLabel}.cardId duplicates \"${entry.cardId}\". Combine quantities into one entry.`);
      continue;
    } // closes duplicate-deck-card condition

    seenCardIds.add(entry.cardId);
    actualTotal += entry.quantity;

    const referencedCard = cardsById.get(entry.cardId);

    if (!referencedCard) {
      addError(filePath, `${entryLabel}.cardId references a card that does not exist: \"${entry.cardId}\".`);
      continue;
    } // closes missing-referenced-card condition

    if (deck.active === true && referencedCard.active !== true) {
      addError(filePath, `${entryLabel}.cardId references inactive card \"${entry.cardId}\" from an active deck.`);
    } // closes inactive-referenced-card condition

    if (Number.isInteger(referencedCard.count) && entry.quantity > referencedCard.count) {
      addError(
        filePath,
        `${entryLabel}.quantity (${entry.quantity}) exceeds card count (${referencedCard.count}) for \"${entry.cardId}\".`
      );
    } // closes deck-quantity-exceeds-card-count condition
  } // closes deck-entry loop

  if (!Number.isInteger(deck.data.totalCardCount) || deck.data.totalCardCount < 1) {
    addError(filePath, "data.totalCardCount must be an integer of at least 1.");
    return;
  } // closes invalid-total-card-count condition

  if (actualTotal !== deck.data.totalCardCount) {
    addError(
      filePath,
      `data.totalCardCount is ${deck.data.totalCardCount}, but cardEntries add up to ${actualTotal}.`
    );
  } // closes mismatched-total-card-count condition
} // closes validateDeckEntries

function validateDeck(filePath, deck, cardsById, seenDeckIds) {
  if (!isPlainObject(deck)) {
    addError(filePath, "deck definition must be an object.");
    return;
  } // closes invalid-deck-object condition

  for (const fieldName of Object.keys(deck)) {
    if (!allowedDeckFields.has(fieldName)) {
      addError(filePath, `unsupported top-level field: \"${fieldName}\".`);
    } // closes unsupported-deck-field condition
  } // closes deck-field loop

  const requiredFields = [
    "id",
    "active",
    "deckType",
    "name",
    "revision",
    "tags",
    "rulesText",
    "data"
  ];

  for (const fieldName of requiredFields) {
    if (!(fieldName in deck)) {
      addError(filePath, `missing required field: \"${fieldName}\".`);
    } // closes missing-required-field condition
  } // closes required-field loop

  if (typeof deck.id !== "string" || !idPattern.test(deck.id)) {
    addError(filePath, "id must use lowercase letters, digits, dots, and hyphens only.");
  } else if (seenDeckIds.has(deck.id)) {
    addError(filePath, `duplicate deck id \"${deck.id}\"; first defined in ${path.relative(repositoryRoot, seenDeckIds.get(deck.id))}.`);
  } else {
    seenDeckIds.set(deck.id, filePath);
  } // closes deck-id validation branch

  if (typeof deck.active !== "boolean") {
    addError(filePath, "active must be true or false.");
  } // closes deck-active condition

  if (typeof deck.deckType !== "string" || !typePattern.test(deck.deckType)) {
    addError(filePath, "deckType must begin with a lowercase letter and contain only letters and digits.");
  } // closes deck-type condition

  if (typeof deck.name !== "string" || deck.name.trim() === "") {
    addError(filePath, "name must be a non-empty string.");
  } // closes deck-name condition

  if (!Number.isInteger(deck.revision) || deck.revision < 1) {
    addError(filePath, "revision must be an integer of at least 1.");
  } // closes deck-revision condition

  if (deck.moduleId !== undefined && (typeof deck.moduleId !== "string" || !idPattern.test(deck.moduleId))) {
    addError(filePath, "moduleId must use lowercase letters, digits, dots, and hyphens when provided.");
  } // closes deck-module-id condition

  validateTags(filePath, deck.tags);

  if (typeof deck.rulesText !== "string" || deck.rulesText.trim() === "") {
    addError(filePath, "rulesText must be a non-empty string.");
  } // closes deck-rules-text condition

  validateDeckEntries(filePath, deck, cardsById);
  validateSource(filePath, deck.source);
} // closes validateDeck

function main() {
  const cardsById = loadCardsById();
  const deckFiles = findJsonFiles(decksRoot);
  const seenDeckIds = new Map();

  if (deckFiles.length === 0) {
    addError(decksRoot, "no deck definition JSON files were found.");
  } // closes no-deck-files condition

  for (const deckFilePath of deckFiles) {
    const deck = readJson(deckFilePath);

    if (deck !== null) {
      validateDeck(deckFilePath, deck, cardsById, seenDeckIds);
    } // closes parsed-deck condition
  } // closes deck-file loop

  if (errors.length > 0) {
    console.error(`Deck validation failed with ${errors.length} error${errors.length === 1 ? "" : "s"}:`);

    for (const error of errors) {
      console.error(`- ${error}`);
    } // closes error-output loop

    process.exitCode = 1;
    return;
  } // closes validation-error condition

  console.log(`Deck validation passed: ${deckFiles.length} deck definition${deckFiles.length === 1 ? "" : "s"} checked.`);
} // closes main

main();
