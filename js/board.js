document.getElementById("saveTileBtn")
    .addEventListener("click", saveTileEdits);
document.addEventListener("keydown", handleKeyNav);

function handleKeyNav(e) {
    const state = store.getState();
    const key = state.selectedTile;

    if (!key) return;

    const [x, y] = key.split(",").map(Number);

    let newKey = null;

    if (e.key === "ArrowUp") newKey = `${x},${y - 1}`;
    if (e.key === "ArrowDown") newKey = `${x},${y + 1}`;
    if (e.key === "ArrowLeft") newKey = `${x - 1},${y}`;
    if (e.key === "ArrowRight") newKey = `${x + 1},${y}`;

    if (newKey && state.grid.tiles[newKey]) {
        selectTile(newKey);
    }

    if (e.key === "Enter") {
        store.update("ui.editMode", true);
        document.getElementById("tileName").focus();
    }
}
document.addEventListener("DOMContentLoaded", initializeBoard);

function initializeBoard() {
    createGrid(
        store.getState().grid.width,
        store.getState().grid.height
    );

    window.BoardAPI = {
        rebuildGrid
    };

    // Re-render whenever state changes
    store.subscribe(() => {
        renderAllTiles();
    });
} // closes initializeBoard


function createGrid(width, height) {
    const boardGrid = document.getElementById("boardGrid");

    boardGrid.innerHTML = "";

    boardGrid.style.gridTemplateColumns =
        `repeat(${width}, var(--tile-size))`;

    const state = store.getState();

    for (let y = 0; y < height; y++) {

        for (let x = 0; x < width; x++) {

            const key = `${x},${y}`;

            // Create tile in state if it doesn't exist
            if (!state.grid.tiles[key]) {
                state.grid.tiles[key] = {
                    x,
                    y,
                    name: "",
                    type: "",
                    color: "#222222",
                    notes: ""
                };
            }

            const tileEl = document.createElement("div");

            tileEl.className = "boardTile";
            tileEl.dataset.key = key;

            tileEl.addEventListener("click", () => {
                selectTile(key);
            });

            boardGrid.appendChild(tileEl);

            renderTile(key);

        } // closes x loop

    } // closes y loop

} // closes createGrid

function rebuildGrid(width, height) {
    createGrid(width, height);

    const selectedTile = store.getState().selectedTile;

    if (selectedTile) {
        highlightSelectedTile(selectedTile);
    }
}


function renderAllTiles() {
    const state = store.getState();

    Object.keys(state.grid.tiles).forEach(key => {
        renderTile(key);
    });
} // closes renderAllTiles


function renderTile(key) {
    const state = store.getState();

    const tileData = state.grid.tiles[key];
    const tileEl = document.querySelector(`[data-key="${key}"]`);

    if (!tileEl || !tileData) return;

    // Base tile color
    tileEl.style.backgroundColor = tileData.color || "#222222";

    // Get entities on this tile (future-proofing)
    const occupants = Object.values(state.entities)
        .filter(e => e.tileKey === key);

    // Build occupant markers
    const occupantHtml = occupants.map(e => {
        const color = e.color || "white";
        return `<div class="entityMarker" style="background:${color}"></div>`;
    }).join("");

    tileEl.innerHTML = `
        <div class="tileCoordinate">
            ${tileData.x},${tileData.y}
        </div>

        <div class="tileName">
            ${tileData.name || ""}
        </div>

        <div class="tileType">
            ${tileData.type || ""}
        </div>

        <div class="tileOccupants">
            ${occupantHtml}
        </div>
    `;
} //closes render tile

function selectTile(key) {
    const state = store.getState();

    store.update("selectedTile", key);

    const tile = state.grid.tiles[key];

    if (!tile) return;

    document.getElementById("tileName").value = tile.name || "";
    document.getElementById("tileType").value = tile.type || "";
    document.getElementById("tileColor").value = tile.color || "#222222";
    document.getElementById("tileNotes").value = tile.notes || "";

    highlightSelectedTile(key);
} // closes selectTile


function highlightSelectedTile(key) {
    document.querySelectorAll(".boardTile").forEach(tile => {
        tile.classList.remove("tileSelected");
    });

    const el = document.querySelector(`[data-key="${key}"]`);

    if (el) {
        el.classList.add("tileSelected");
    }
} // closes highlightSelectedTile


// Call this when user presses "Save Tile"

function saveTileEdits() {
    const state = store.getState();
    const key = state.selectedTile;

    if (!key) return;

    const tile = state.grid.tiles[key];

    tile.name = document.getElementById("tileName").value;
    tile.type = document.getElementById("tileType").value;
    tile.color = document.getElementById("tileColor").value;
    tile.notes = document.getElementById("tileNotes").value;

    // force update
    store.update("grid.tiles", state.grid.tiles);

    // exit edit mode
    store.update("ui.editMode", false);

    // IMPORTANT: force redraw of THIS tile
    renderTile(key);
} //closes save tile edits