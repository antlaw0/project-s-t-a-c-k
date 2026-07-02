[CmdletBinding()]
param(
    [Parameter()]
    [string]$ProjectRoot = $PSScriptRoot
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Utf8NoBomFile {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$Content
    ) # end parameter block

    $parentDirectory = Split-Path -Parent $Path
    if (-not (Test-Path -LiteralPath $parentDirectory)) {
        New-Item -ItemType Directory -Path $parentDirectory -Force | Out-Null
    } # end parent-directory creation guard

    $utf8WithoutBom = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText($Path, $Content, $utf8WithoutBom)
} # end Write-Utf8NoBomFile function

function Copy-BackupFile {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$SourcePath,

        [Parameter(Mandatory = $true)]
        [string]$ProjectRootPath,

        [Parameter(Mandatory = $true)]
        [string]$BackupRoot
    ) # end parameter block

    if (-not (Test-Path -LiteralPath $SourcePath)) {
        return
    } # end missing-source-file guard

    $normalizedProjectRoot = [System.IO.Path]::GetFullPath($ProjectRootPath).TrimEnd("\", "/")
    $normalizedSourcePath = [System.IO.Path]::GetFullPath($SourcePath)

    if (-not $normalizedSourcePath.StartsWith($normalizedProjectRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Cannot back up a file outside the project root: $SourcePath"
    } # end project-root containment guard

    $relativePath = $normalizedSourcePath.Substring($normalizedProjectRoot.Length).TrimStart("\", "/")
    $backupPath = Join-Path $BackupRoot $relativePath
    $backupParent = Split-Path -Parent $backupPath
    New-Item -ItemType Directory -Path $backupParent -Force | Out-Null
    Copy-Item -LiteralPath $SourcePath -Destination $backupPath -Force
} # end Copy-BackupFile function

function Replace-ExactlyOnce {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$Text,

        [Parameter(Mandatory = $true)]
        [string]$OldText,

        [Parameter(Mandatory = $true)]
        [string]$NewText,

        [Parameter(Mandatory = $true)]
        [string]$Description
    ) # end parameter block

    $firstIndex = $Text.IndexOf($OldText, [System.StringComparison]::Ordinal)
    if ($firstIndex -lt 0) {
        throw "Could not find the expected $Description marker. No change was made for that marker."
    } # end missing-marker guard

    $secondIndex = $Text.IndexOf(
        $OldText,
        $firstIndex + $OldText.Length,
        [System.StringComparison]::Ordinal
    )

    if ($secondIndex -ge 0) {
        throw "Found more than one $Description marker. Refusing to guess which one to replace."
    } # end duplicate-marker guard

    return (
        $Text.Substring(0, $firstIndex) +
        $NewText +
        $Text.Substring($firstIndex + $OldText.Length)
    )
} # end Replace-ExactlyOnce function

function Invoke-NpmScript {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$ScriptName
    ) # end parameter block

    Write-Host ""
    Write-Host "Running: npm run $ScriptName" -ForegroundColor Cyan
    & npm run $ScriptName
    if ($LASTEXITCODE -ne 0) {
        throw "npm run $ScriptName failed with exit code $LASTEXITCODE."
    } # end npm-exit-code guard
} # end Invoke-NpmScript function

if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot "package.json"))) {
    throw "Project root was not found or is missing package.json: $ProjectRoot"
} # end project-root validation guard

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Join-Path ([System.IO.Path]::GetTempPath()) "ProjectSTACK-DeckSourceOfTruth-$timestamp"

$serverPath = Join-Path $ProjectRoot "server.js"
$playtestScriptPath = Join-Path $ProjectRoot "js\playtest-tabletop.js"
$playtestHtmlPath = Join-Path $ProjectRoot "playtest.html"
$packagePath = Join-Path $ProjectRoot "package.json"
$lootGeneratorPath = Join-Path $ProjectRoot "scripts\create-loot-playtest-state.js"
$playtestStateTestPath = Join-Path $ProjectRoot "scripts\test-playtest-state.js"
$playtestUiTestPath = Join-Path $ProjectRoot "scripts\test-playtest-tabletop.js"
$freshApiTestPath = Join-Path $ProjectRoot "scripts\test-fresh-playtest-api.js"

$oldDeckPath = Join-Path $ProjectRoot "data\decks\goblin-warrens-catalog-smoke-test.json"
$newDeckDirectory = Join-Path $ProjectRoot "data\decks\dungeon"
$newDeckPath = Join-Path $newDeckDirectory "goblin-warrens-catalog-smoke-test.json"

$requiredPaths = @(
    $serverPath,
    $playtestScriptPath,
    $playtestHtmlPath,
    $packagePath,
    $lootGeneratorPath,
    $playtestStateTestPath,
    $playtestUiTestPath
)

foreach ($requiredPath in $requiredPaths) {
    if (-not (Test-Path -LiteralPath $requiredPath)) {
        throw "Required project file is missing: $requiredPath"
    } # end required-file validation guard
} # end required-path loop

New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
foreach ($pathToBackup in $requiredPaths + @($oldDeckPath, $newDeckPath, $freshApiTestPath)) {
    Copy-BackupFile -SourcePath $pathToBackup -ProjectRootPath $ProjectRoot -BackupRoot $backupRoot
} # end backup-file loop

Write-Host "Backups created at: $backupRoot" -ForegroundColor DarkGray

$deckJson = @'
{
  "id": "deck.goblin-warrens-catalog-smoke-test",
  "active": true,
  "deckType": "dungeon",
  "name": "Goblin Warrens Catalog Coverage Test",
  "revision": 4,
  "moduleId": "core-alpha",
  "tags": [
    "deck",
    "dungeon",
    "goblin-warrens",
    "smoke-test",
    "catalog-validation",
    "catalog-coverage"
  ],
  "rulesText": "A Goblin Warrens dungeon deck for catalog coverage and early manual playtesting. The deck definition is the source of truth for its 32 base cards. The selected scenario may separately inject Loot Deck cards during fresh-state setup.",
  "data": {
    "dungeonTheme": "goblin-warrens",
    "intendedUse": "catalogCoverageTest",
    "setup": {
      "shuffleBeforePlay": true,
      "drawZone": "dungeonDeck",
      "discardZone": "dungeonDiscardPile",
      "lootZone": "dungeonLootArea"
    },
    "cardEntries": [
      {
        "cardId": "enemy.goblin-archer",
        "quantity": 4
      },
      {
        "cardId": "enemy.goblin-bombardier",
        "quantity": 1
      },
      {
        "cardId": "enemy.goblin-bully",
        "quantity": 2
      },
      {
        "cardId": "enemy.goblin-cutthroat",
        "quantity": 2
      },
      {
        "cardId": "enemy.goblin-hexer",
        "quantity": 1
      },
      {
        "cardId": "enemy.goblin-raider",
        "quantity": 4
      },
      {
        "cardId": "enemy.goblin-skirmisher",
        "quantity": 3
      },
      {
        "cardId": "enemy.goblin-slinger",
        "quantity": 3
      },
      {
        "cardId": "enemy.goblin-sneak",
        "quantity": 2
      },
      {
        "cardId": "enemy.goblin-spearman",
        "quantity": 3
      },
      {
        "cardId": "enemy.goblin-worg-rider",
        "quantity": 1
      },
      {
        "cardId": "enemy.goblin-worg",
        "quantity": 2
      },
      {
        "cardId": "dungeon.goblin-warrens.tripwire",
        "quantity": 2
      },
      {
        "cardId": "dungeon.goblin-warrens.goblin-alarm",
        "quantity": 2
      }
    ],
    "totalCardCount": 32,
    "knownLimitations": [
      "This deck is intended for catalog coverage and rough early playtesting, not final encounter balance.",
      "The deck has no dedicated boss, objective, room, reward, or completion-condition cards yet.",
      "Goblin Alarm can reveal cards from the bottom of the Dungeon Deck and deploy the first matching Goblin enemy it finds.",
      "The Solo Warrior Goblin Warrens scenario separately injects eight randomly drawn eligible Loot Deck cards during fresh-state setup."
    ]
  },
  "source": {
    "verifiedAgainstRulebook": false,
    "notes": "Revision 4 defines the complete current active Goblin roster at each definition's catalog count. This base deck contains 28 enemy instances, 2 Tripwires, and 2 Goblin Alarms. Scenario-level Loot Deck injection is intentionally not recorded here."
  }
}
'@

New-Item -ItemType Directory -Path $newDeckDirectory -Force | Out-Null
Write-Utf8NoBomFile -Path $newDeckPath -Content ($deckJson + [Environment]::NewLine)

if ((Test-Path -LiteralPath $oldDeckPath) -and ($oldDeckPath -ne $newDeckPath)) {
    Remove-Item -LiteralPath $oldDeckPath -Force
} # end old-deck-file removal guard

$serverText = Get-Content -LiteralPath $serverPath -Raw

$serverText = Replace-ExactlyOnce `
    -Text $serverText `
    -OldText 'const path = require("path");' `
    -NewText @'
const path = require("path");
const os = require("os");
const { buildLootDeckState } = require("./scripts/create-loot-playtest-state");
'@ `
    -Description "server import"

$serverText = Replace-ExactlyOnce `
    -Text $serverText `
    -OldText 'const SAVES_DIR = path.join(ROOT_DIR, "saves");' `
    -NewText @'
const SAVES_DIR = path.join(ROOT_DIR, "saves");
const DEFAULT_PLAYTEST_SCENARIO_ID = "scenario.solo-warrior-goblin-warrens-smoke-test";
'@ `
    -Description "server constant"

$freshStateApiCode = @'
function createFreshPlaytestState(scenarioId, seed) {
  const requestedScenarioId = String(scenarioId || "").trim();

  if (!/^scenario\.[A-Za-z0-9._-]+$/.test(requestedScenarioId)) {
    throw new Error("A valid scenario id is required.");
  } // end scenario-id validation

  const requestedSeed = String(seed || "").trim();
  if (!requestedSeed || requestedSeed.length > 160) {
    throw new Error("A valid fresh-state seed is required.");
  } // end seed validation

  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "project-stack-fresh-playtest-"));
  const outputPath = path.join(temporaryDirectory, "runtime-state.json");
  const originalArguments = [
    "--scenario",
    requestedScenarioId,
    "--seed",
    requestedSeed,
    "--out",
    outputPath
  ];

  try {
    buildLootDeckState({
      scenarioId: requestedScenarioId,
      outputPath,
      originalArguments
    }); // end buildLootDeckState call

    return JSON.parse(fs.readFileSync(outputPath, "utf8"));
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  } // end temporary-state cleanup
} // end createFreshPlaytestState function

function handleFreshPlaytestStateApi(req, res, requestUrl) {
  if (requestUrl.pathname !== "/api/playtest-state/new") {
    return false;
  } // end unrelated-route guard

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    sendJson(res, 405, { error: "Method Not Allowed" });
    return true;
  } // end method validation

  const scenarioId = requestUrl.searchParams.get("scenario") || DEFAULT_PLAYTEST_SCENARIO_ID;
  const seed = requestUrl.searchParams.get("seed") || [
    "fresh",
    Date.now(),
    process.pid,
    Math.random().toString(36).slice(2)
  ].join("-");

  try {
    const state = createFreshPlaytestState(scenarioId, seed);
    res.setHeader("Cache-Control", "no-store");
    sendJson(res, 200, state);
  } catch (error) {
    sendJson(res, 500, {
      error: error && error.message ? error.message : "Failed to create a fresh playtest state."
    });
  } // end fresh-state API request handling

  return true;
} // end handleFreshPlaytestStateApi function

'@

$serverText = Replace-ExactlyOnce `
    -Text $serverText `
    -OldText 'function handleSaveApi(req, res, requestUrl) {' `
    -NewText ($freshStateApiCode + 'function handleSaveApi(req, res, requestUrl) {') `
    -Description "fresh-state API insertion point"

$serverText = Replace-ExactlyOnce `
    -Text $serverText `
    -OldText @'
  const requestUrl = new URL(req.url, `http://${HOST}:${PORT}`);

  if (requestUrl.pathname.startsWith("/api/saves/")) {
'@ `
    -NewText @'
  const requestUrl = new URL(req.url, `http://${HOST}:${PORT}`);

  if (handleFreshPlaytestStateApi(req, res, requestUrl)) {
    return;
  } // end fresh-state API route branch

  if (requestUrl.pathname.startsWith("/api/saves/")) {
'@ `
    -Description "fresh-state API route"

Write-Utf8NoBomFile -Path $serverPath -Content $serverText

$lootGeneratorText = Get-Content -LiteralPath $lootGeneratorPath -Raw
$lootGeneratorText = Replace-ExactlyOnce `
    -Text $lootGeneratorText `
    -OldText @'
try {
  main();

} catch (error) {
  console.error(`Loot Deck state creation failed: ${error.message}`);

  process.exitCode = 1;

} // end top-level execution
'@ `
    -NewText @'
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`Loot Deck state creation failed: ${error.message}`);
    process.exitCode = 1;
  } // end command-line execution error handler
} // end command-line execution guard

module.exports = {
  buildLootDeckState
}; // end module exports
'@ `
    -Description "loot-generator command-line entry point"

Write-Utf8NoBomFile -Path $lootGeneratorPath -Content $lootGeneratorText

$playtestScriptText = Get-Content -LiteralPath $playtestScriptPath -Raw
$playtestScriptText = Replace-ExactlyOnce `
    -Text $playtestScriptText `
    -OldText 'const DEFAULT_STATE_URL = "./playtest-saves/scenario.solo-warrior-goblin-warrens-smoke-test.initial.json";' `
    -NewText 'const DEFAULT_STATE_URL = "/api/playtest-state/new?scenario=scenario.solo-warrior-goblin-warrens-smoke-test";' `
    -Description "static initial-state URL"

Write-Utf8NoBomFile -Path $playtestScriptPath -Content $playtestScriptText

$playtestHtmlText = Get-Content -LiteralPath $playtestHtmlPath -Raw
$playtestHtmlText = Replace-ExactlyOnce `
    -Text $playtestHtmlText `
    -OldText '<button id="load-local-state-button" type="button">Load local initial state</button>' `
    -NewText '<button id="load-local-state-button" type="button">Start fresh Goblin Warrens scenario</button>' `
    -Description "fresh-state button label"

$playtestHtmlText = Replace-ExactlyOnce `
    -Text $playtestHtmlText `
    -OldText '<label class="file-input-label" for="state-file-input">Or choose a runtime-state JSON file</label>' `
    -NewText @'
<p class="loader-hint">Starting a fresh scenario builds a new runtime state from the active scenario, the referenced Dungeon Deck definition, and that scenario's separate Loot Deck injection rule. It does not reuse a generated state file.</p>
<label class="file-input-label" for="state-file-input">Or choose a saved runtime-state JSON file</label>
'@ `
    -Description "fresh-state architecture note"

Write-Utf8NoBomFile -Path $playtestHtmlPath -Content $playtestHtmlText

$playtestUiTestText = Get-Content -LiteralPath $playtestUiTestPath -Raw
$playtestUiTestText = Replace-ExactlyOnce `
    -Text $playtestUiTestText `
    -OldText '"./playtest-saves/scenario.solo-warrior-goblin-warrens-smoke-test.initial.json",' `
    -NewText '"/api/playtest-state/new?scenario=scenario.solo-warrior-goblin-warrens-smoke-test",' `
    -Description "old static-state UI test marker"

Write-Utf8NoBomFile -Path $playtestUiTestPath -Content $playtestUiTestText

$playtestStateTest = @'
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
} // end assert function

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
} // end readJsonFile function

function listJsonFilesRecursively(directoryPath) {
  const filePaths = [];
  const pendingDirectories = [directoryPath];

  while (pendingDirectories.length > 0) {
    const currentDirectory = pendingDirectories.pop();

    for (const entry of fs.readdirSync(currentDirectory, { withFileTypes: true })) {
      const entryPath = path.join(currentDirectory, entry.name);

      if (entry.isDirectory()) {
        pendingDirectories.push(entryPath);
        continue;
      } // end nested-directory branch

      if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) {
        filePaths.push(entryPath);
      } // end JSON-file branch
    } // end directory-entry loop
  } // end pending-directory loop

  return filePaths.sort();
} // end listJsonFilesRecursively function

function loadDefinitionsById(directoryPath) {
  const definitionsById = new Map();

  for (const filePath of listJsonFilesRecursively(directoryPath)) {
    const definition = readJsonFile(filePath);

    if (!definition || typeof definition.id !== "string" || !definition.id) {
      throw new Error(`Definition file is missing an id: ${filePath}`);
    } // end definition-id validation

    if (definitionsById.has(definition.id)) {
      throw new Error(`Duplicate definition id found: ${definition.id}`);
    } // end duplicate-definition validation

    definitionsById.set(definition.id, definition);
  } // end definition-file loop

  return definitionsById;
} // end loadDefinitionsById function

function expectedNegativeStatusCardCount(cardDefinitionsById) {
  let total = 0;

  for (const definition of cardDefinitionsById.values()) {
    if (
      definition.active === true &&
      definition.cardType === "status" &&
      definition.data &&
      definition.data.statusCategory === "negative"
    ) {
      total += definition.count;
    } // end negative-status-card branch
  } // end card-definition loop

  return total;
} // end expectedNegativeStatusCardCount function

function expectedScenarioSetupCardCount(scenario) {
  const participants = Array.isArray(scenario.data && scenario.data.participants)
    ? scenario.data.participants
    : [];

  let total = 0;

  for (const participant of participants) {
    const characterSetups = Array.isArray(participant.controlledCharacterSetups)
      ? participant.controlledCharacterSetups
      : [];

    for (const characterSetup of characterSetups) {
      total += 1;
      total += Array.isArray(characterSetup.equipment) ? characterSetup.equipment.length : 0;
      total += Array.isArray(characterSetup.tacticalReserve) ? characterSetup.tacticalReserve.length : 0;

      const skills = Array.isArray(characterSetup.skills) ? characterSetup.skills : [];
      for (const skillSetup of skills) {
        total += 1;
        total += Array.isArray(skillSetup.attachedAbilityCardIds)
          ? skillSetup.attachedAbilityCardIds.length
          : 0;
      } // end skill-setup loop
    } // end character-setup loop
  } // end participant loop

  return total;
} // end expectedScenarioSetupCardCount function

function expectedDungeonDeckCardCount(deckDefinition) {
  const cardEntries = Array.isArray(deckDefinition.data && deckDefinition.data.cardEntries)
    ? deckDefinition.data.cardEntries
    : [];

  return cardEntries.reduce(function addEntryQuantity(total, entry) {
    return total + entry.quantity;
  }, 0);
} // end expectedDungeonDeckCardCount function

function main() {
  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "project-stack-state-test-"));
  const outputPath = path.join(temporaryDirectory, "runtime-state.json");

  const cardDefinitionsById = loadDefinitionsById(path.join(PROJECT_ROOT, "data", "cards"));
  const deckDefinitionsById = loadDefinitionsById(path.join(PROJECT_ROOT, "data", "decks"));
  const scenarioDefinitionsById = loadDefinitionsById(path.join(PROJECT_ROOT, "data", "scenarios"));
  const scenario = scenarioDefinitionsById.get(TEST_SCENARIO_ID);

  assert(scenario, `Scenario ${TEST_SCENARIO_ID} was not found.`);
  const deckDefinition = deckDefinitionsById.get(scenario.data.dungeonSetup.deckId);
  assert(deckDefinition, `Scenario references missing deck ${scenario.data.dungeonSetup.deckId}.`);

  const statusDeckCardCount = expectedNegativeStatusCardCount(cardDefinitionsById);
  const baseDeckCardCount = expectedDungeonDeckCardCount(deckDefinition);
  const setupCardCount = expectedScenarioSetupCardCount(scenario);
  const expectedCardInstanceCount = setupCardCount + baseDeckCardCount + statusDeckCardCount;

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
  ); // end state-generator process call

  try {
    assert(
      commandResult.status === 0,
      `State generator exited with code ${commandResult.status}.\n${commandResult.stderr}`
    );

    assert(fs.existsSync(outputPath), "State generator did not create its output file.");

    const state = readJsonFile(outputPath);
    const entityIds = Object.keys(state.entities);
    const cardInstanceIds = Object.keys(state.cardInstances);

    assert(state.scenarioId === TEST_SCENARIO_ID, "State scenarioId does not match the requested scenario.");
    assert(state.seed === TEST_SEED, "State seed does not match the requested seed.");
    assert(entityIds.length === 1, `Expected 1 player entity but found ${entityIds.length}.`);
    assert(
      state.zones.playerFormation.frontRow.filter(Boolean).length === 1,
      "Expected one entity in the Player Front Row."
    );
    assert(
      state.zones.dungeonDeck.length === baseDeckCardCount,
      `Expected ${baseDeckCardCount} Dungeon Deck cards from ${deckDefinition.id} but found ${state.zones.dungeonDeck.length}.`
    );
    assert(
      state.zones.statusDeck.length === statusDeckCardCount,
      `Expected ${statusDeckCardCount} Status Deck cards but found ${state.zones.statusDeck.length}.`
    );
    assert(state.zones.statusRevealArea.length === 0, "Status Reveal Area should start empty.");
    assert(state.zones.statusDiscardPile.length === 0, "Status Discard Pile should start empty.");
    assert(
      cardInstanceIds.length === expectedCardInstanceCount,
      `Expected ${expectedCardInstanceCount} runtime card instances but found ${cardInstanceIds.length}.`
    );
    assert(
      state.zones.dungeonDeck.every((instanceId) => state.cardInstances[instanceId].faceUp === false),
      "Every Dungeon Deck card should start face down."
    );
    assert(
      state.zones.statusDeck.every((instanceId) => state.cardInstances[instanceId].faceUp === false),
      "Every Status Deck card should start face down."
    );

    console.log("Playtest-state generator test passed.");
    console.log(
      `Verified scenario ${TEST_SCENARIO_ID}, ${expectedCardInstanceCount} card instances, a ${baseDeckCardCount}-card Dungeon Deck from ${deckDefinition.id}, and a ${statusDeckCardCount}-card shared Status Deck.`
    );
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  } // end temporary-directory cleanup
} // end main function

try {
  main();
} catch (error) {
  console.error(`Playtest-state generator test failed: ${error.message}`);
  process.exitCode = 1;
} // end top-level execution
'@

Write-Utf8NoBomFile -Path $playtestStateTestPath -Content ($playtestStateTest + [Environment]::NewLine)

$freshApiTest = @'
"use strict";

const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const SCENARIO_ID = "scenario.solo-warrior-goblin-warrens-smoke-test";
const TEST_SEED = "fresh-api-source-of-truth-test";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  } // end assertion failure guard
} // end assert function

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
} // end readJsonFile function

function listJsonFilesRecursively(directoryPath) {
  const filePaths = [];
  const pendingDirectories = [directoryPath];

  while (pendingDirectories.length > 0) {
    const currentDirectory = pendingDirectories.pop();

    for (const entry of fs.readdirSync(currentDirectory, { withFileTypes: true })) {
      const entryPath = path.join(currentDirectory, entry.name);

      if (entry.isDirectory()) {
        pendingDirectories.push(entryPath);
        continue;
      } // end nested-directory branch

      if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) {
        filePaths.push(entryPath);
      } // end JSON-file branch
    } // end directory-entry loop
  } // end pending-directory loop

  return filePaths.sort();
} // end listJsonFilesRecursively function

function loadDefinitionsById(directoryPath) {
  const definitionsById = new Map();

  for (const filePath of listJsonFilesRecursively(directoryPath)) {
    const definition = readJsonFile(filePath);
    definitionsById.set(definition.id, definition);
  } // end definition-file loop

  return definitionsById;
} // end loadDefinitionsById function

function calculateDeckEntryCount(deckDefinition) {
  const cardEntries = Array.isArray(deckDefinition.data && deckDefinition.data.cardEntries)
    ? deckDefinition.data.cardEntries
    : [];

  return cardEntries.reduce(function addEntryQuantity(total, entry) {
    return total + entry.quantity;
  }, 0);
} // end calculateDeckEntryCount function

function wait(milliseconds) {
  return new Promise(function waitForTimeout(resolve) {
    setTimeout(resolve, milliseconds);
  }); // end timeout promise
} // end wait function

async function requestFreshState(url) {
  let lastError = null;

  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      } // end unsuccessful-response guard

      return {
        state: await response.json(),
        cacheControl: response.headers.get("cache-control") || ""
      };
    } catch (error) {
      lastError = error;
      await wait(100);
    } // end fresh-state request attempt
  } // end request-attempt loop

  throw lastError || new Error("The fresh-state API did not become available.");
} // end requestFreshState function

function waitForChildExit(childProcessHandle) {
  return new Promise(function waitForExit(resolve) {
    if (childProcessHandle.exitCode !== null) {
      resolve();
      return;
    } // end already-exited branch

    childProcessHandle.once("exit", resolve);
  }); // end child-exit promise
} // end waitForChildExit function

async function main() {
  const scenarioDefinitionsById = loadDefinitionsById(path.join(PROJECT_ROOT, "data", "scenarios"));
  const deckDefinitionsById = loadDefinitionsById(path.join(PROJECT_ROOT, "data", "decks"));
  const scenario = scenarioDefinitionsById.get(SCENARIO_ID);

  assert(scenario, `Scenario ${SCENARIO_ID} was not found.`);

  const deckDefinition = deckDefinitionsById.get(scenario.data.dungeonSetup.deckId);
  assert(deckDefinition, `Scenario references missing deck ${scenario.data.dungeonSetup.deckId}.`);

  const baseDeckCount = calculateDeckEntryCount(deckDefinition);
  const lootInjectionCount = scenario.data.dungeonSetup.lootInjectionCount;
  const expectedDungeonDeckCount = baseDeckCount + lootInjectionCount;
  const port = 32000 + Math.floor(Math.random() * 1000);

  const server = childProcess.spawn(process.execPath, ["server.js"], {
    cwd: PROJECT_ROOT,
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: String(port)
    },
    stdio: ["ignore", "pipe", "pipe"]
  }); // end local-server process creation

  let serverOutput = "";
  server.stdout.on("data", function recordServerOutput(chunk) {
    serverOutput += chunk.toString();
  }); // end standard-output listener
  server.stderr.on("data", function recordServerError(chunk) {
    serverOutput += chunk.toString();
  }); // end standard-error listener

  try {
    const apiUrl = `http://127.0.0.1:${port}/api/playtest-state/new?scenario=${encodeURIComponent(SCENARIO_ID)}&seed=${encodeURIComponent(TEST_SEED)}`;
    const response = await requestFreshState(apiUrl);
    const state = response.state;

    assert(
      response.cacheControl.includes("no-store"),
      "Fresh-state API responses must disable caching."
    );
    assert(state.scenarioId === SCENARIO_ID, "Fresh-state API returned the wrong scenario.");
    assert(state.seed === TEST_SEED, "Fresh-state API did not preserve the requested seed.");
    assert(
      state.zones.dungeonDeck.length === expectedDungeonDeckCount,
      `Expected ${expectedDungeonDeckCount} Dungeon Deck cards but found ${state.zones.dungeonDeck.length}.`
    );
    assert(
      state.dungeonLootInjection && state.dungeonLootInjection.count === lootInjectionCount,
      `Expected ${lootInjectionCount} scenario Loot Deck injections.`
    );

    const baseInstanceIds = state.zones.dungeonDeck.filter(function excludeInjectedLoot(instanceId) {
      return state.cardInstances[instanceId].dungeonLootInjection !== true;
    }); // end injected-loot filter

    const actualBaseCountByDefinitionId = new Map();
    for (const instanceId of baseInstanceIds) {
      const definitionId = state.cardInstances[instanceId].definitionId;
      actualBaseCountByDefinitionId.set(
        definitionId,
        (actualBaseCountByDefinitionId.get(definitionId) || 0) + 1
      );
    } // end base-dungeon-instance loop

    for (const entry of deckDefinition.data.cardEntries) {
      assert(
        actualBaseCountByDefinitionId.get(entry.cardId) === entry.quantity,
        `Fresh-state API did not use ${deckDefinition.id} as the base deck source for ${entry.cardId}.`
      );
    } // end deck-entry verification loop

    console.log("Fresh playtest-state API test passed.");
    console.log(
      `Verified ${deckDefinition.id} as the ${baseDeckCount}-card base deck plus ${lootInjectionCount} scenario Loot Deck cards for ${expectedDungeonDeckCount} total Dungeon Deck cards.`
    );
  } finally {
    if (server.exitCode === null) {
      server.kill();
      await waitForChildExit(server);
    } // end local-server cleanup branch
  } // end fresh-state API test cleanup
} // end main function

main().catch(function reportFailure(error) {
  console.error(`Fresh playtest-state API test failed: ${error.message}`);
  process.exitCode = 1;
}); // end top-level execution
'@

Write-Utf8NoBomFile -Path $freshApiTestPath -Content ($freshApiTest + [Environment]::NewLine)

$package = Get-Content -LiteralPath $packagePath -Raw | ConvertFrom-Json
if ($null -eq $package.scripts) {
    throw "package.json does not contain a scripts object."
} # end package-script validation

$package.scripts | Add-Member -NotePropertyName "test:fresh-playtest-api" -NotePropertyValue "node scripts/test-fresh-playtest-api.js" -Force
$package.scripts | Add-Member -NotePropertyName "build:playtest" -NotePropertyValue "npm run validate:data && npm run build:catalog && npm run test:catalog-build && npm run test:playtest-state && npm run test:loot-playtest-state && npm run test:fresh-playtest-api && npm run check:playtest-ui" -Force
$packageJson = $package | ConvertTo-Json -Depth 100
Write-Utf8NoBomFile -Path $packagePath -Content ($packageJson + [Environment]::NewLine)

Push-Location -LiteralPath $ProjectRoot
try {
    Invoke-NpmScript -ScriptName "build:playtest"
} finally {
    Pop-Location
} # end project-command scope

Write-Host ""
Write-Host "Success: the fresh Playtest button now creates a runtime state from source definitions." -ForegroundColor Green
Write-Host "Base deck source: data\decks\dungeon\goblin-warrens-catalog-smoke-test.json (32 cards)." -ForegroundColor Green
Write-Host "Scenario addition: data\scenarios\solo-warrior-goblin-warrens-smoke-test.json (8 Loot Deck cards)." -ForegroundColor Green
Write-Host "Expected fresh Dungeon Deck count: 40 cards." -ForegroundColor Green
Write-Host "Restart npm start, reload playtest.html, then activate Start fresh Goblin Warrens scenario." -ForegroundColor Green
Write-Host "The former static generated save is no longer used by that button." -ForegroundColor Green
