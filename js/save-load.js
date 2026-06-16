(function () {
	const SAVE_API_ROOT = "/api/saves/";

	document.addEventListener("DOMContentLoaded", initializeSaveLoadControls);

	function initializeSaveLoadControls() {
		const gameNameInput = document.getElementById("gameName");
		const saveBtn = document.getElementById("saveGameBtn");
		const loadBtn = document.getElementById("loadGameBtn");
		const exportBtn = document.getElementById("exportGameBtn");
		const importBtn = document.getElementById("importGameBtn");

		if (!gameNameInput || !saveBtn || !loadBtn) return;

		gameNameInput.value = store.getState().gameName || "New Adventure";

		gameNameInput.addEventListener("input", event => {
			store.update("gameName", event.target.value);
		});

		store.subscribe(state => {
			const nextName = state.gameName || "";

			if (gameNameInput.value !== nextName) {
				gameNameInput.value = nextName;
			}
		});

		saveBtn.addEventListener("click", () => {
			void saveCurrentGame();
		});

		loadBtn.addEventListener("click", () => {
			void loadCurrentGame();
		});

		if (exportBtn) {
			exportBtn.addEventListener("click", () => {
				const gameName = getRequestedGameName();
				const payload = buildSaveSnapshot(store.getState());
				downloadSnapshot(payload, gameName);
			});
		}

		if (importBtn) {
			importBtn.addEventListener("click", () => {
				void importSnapshotFromFile();
			});
		}
	}

	async function saveCurrentGame() {
		const state = store.getState();
		const gameName = getRequestedGameName();

		if (!gameName) {
			alert("Enter a game name before saving.");
			return;
		}

		const payload = {
			gameName,
			snapshot: buildSaveSnapshot(state)
		};

		try {
			const response = await fetch(`${SAVE_API_ROOT}${encodeURIComponent(gameName)}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(payload)
			});

			const result = await response.json().catch(() => ({}));

			if (!response.ok) {
				if (shouldFallbackToFileSave(response.status)) {
					downloadSnapshot(payload.snapshot, gameName);
					alert(`Server save is unavailable. Downloaded ${buildSaveFileName(gameName)} instead.`);
					return;
				}

				throw new Error(result.error || "Failed to save game.");
			}

			alert(`Saved ${result.fileName || `${gameName}.json`}.`);
		} catch (error) {
			console.error("Failed saving game", error);

			if (isNetworkLikeFailure(error)) {
				downloadSnapshot(payload.snapshot, gameName);
				alert(`Server save is unavailable. Downloaded ${buildSaveFileName(gameName)} instead.`);
				return;
			}

			alert(error.message || "Failed to save game.");
		}
	}

	async function loadCurrentGame() {
		const gameName = getRequestedGameName();

		if (!gameName) {
			alert("Enter a game name before loading.");
			return;
		}

		try {
			const response = await fetch(`${SAVE_API_ROOT}${encodeURIComponent(gameName)}`, {
				cache: "no-store"
			});

			const result = await response.json().catch(() => ({}));

			if (!response.ok) {
				if (shouldFallbackToFileLoad(response.status)) {
					await importSnapshotFromFile();
					return;
				}

				throw new Error(result.error || "Failed to load game.");
			}

			const nextState = hydrateSaveSnapshot(result.snapshot || {});
			applyLoadedSnapshot(nextState);

			alert(`Loaded ${result.fileName || `${gameName}.json`}.`);
		} catch (error) {
			console.error("Failed loading game", error);

			if (isNetworkLikeFailure(error)) {
				await importSnapshotFromFile();
				return;
			}

			alert(error.message || "Failed to load game.");
		}
	}

	function shouldFallbackToFileSave(statusCode) {
		return statusCode === 404 || statusCode === 405 || statusCode === 501;
	}

	function shouldFallbackToFileLoad(statusCode) {
		return statusCode === 404 || statusCode === 405 || statusCode === 501;
	}

	function isNetworkLikeFailure(error) {
		if (!error) return false;
		return error instanceof TypeError;
	}

	function buildSaveFileName(gameName) {
		const safeName = String(gameName || "New Adventure")
			.trim()
			.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
			.replace(/\s+/g, " ")
			.slice(0, 120)
			.trim();

		return `${safeName || "New Adventure"}.json`;
	}

	function downloadSnapshot(snapshot, gameName) {
		const blob = new Blob([
			JSON.stringify(snapshot, null, 2)
		], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");

		link.href = url;
		link.download = buildSaveFileName(gameName);
		link.style.display = "none";

		document.body.appendChild(link);
		link.click();
		link.remove();

		setTimeout(() => {
			URL.revokeObjectURL(url);
		}, 0);
	}

	async function importSnapshotFromFile() {
		const file = await pickSaveFile();

		if (!file) return;

		try {
			const rawText = await file.text();
			const parsed = JSON.parse(rawText);
			const nextState = hydrateSaveSnapshot(parsed);

			applyLoadedSnapshot(nextState);
			alert(`Loaded ${file.name}.`);
		} catch (error) {
			console.error("Failed importing save file", error);
			alert("Selected file is not a valid save JSON.");
		}
	}

	function pickSaveFile() {
		return new Promise(resolve => {
			const input = document.createElement("input");
			input.type = "file";
			input.accept = ".json,application/json";
			input.style.display = "none";

			input.addEventListener("change", () => {
				const file = input.files && input.files[0] ? input.files[0] : null;
				input.remove();
				resolve(file);
			}, { once: true });

			document.body.appendChild(input);
			input.click();
		});
	}

	function applyLoadedSnapshot(nextState) {
		store.setState(nextState);

		if (window.BoardAPI && typeof window.BoardAPI.rebuildGrid === "function") {
			window.BoardAPI.rebuildGrid(nextState.grid.width, nextState.grid.height);
		}
	}

	function getRequestedGameName() {
		const input = document.getElementById("gameName");
		const rawName = input ? input.value : store.getState().gameName;
		return String(rawName || "").trim();
	}

	function buildSaveSnapshot(state) {
		const sourceState = state || store.getState();

		return {
			version: 1,
			savedAt: new Date().toISOString(),
			gameName: String(sourceState.gameName || "New Adventure"),
			grid: structuredClone(sourceState.grid || { width: 20, height: 20, tiles: {} }),
			selectedTile: sourceState.selectedTile || null,
			entities: structuredClone(sourceState.entities || {}),
			decks: structuredClone(sourceState.decks || {}),
			cards: structuredClone(sourceState.cards || {}),
			players: serializePlayers(sourceState.players || {}),
			encounters: serializeEncounters(sourceState.encounters || {}),
			ui: structuredClone(sourceState.ui || {})
		};
	}

	function serializePlayers(players) {
		const serialized = {};

		Object.entries(players).forEach(([playerId, player]) => {
			serialized[playerId] = {
				id: player.id || playerId,
				number: Number(player.number) || 0,
				name: String(player.name || playerId),
				damage: Math.max(0, Number(player.damage) || 0),
				currency: Math.max(0, Number(player.currency) || 0),
				heat: Math.max(0, Number(player.heat) || 0),
				slots: Array.isArray(player.slots)
					? player.slots.map(serializePlayerSlot)
					: []
			};
		});

		return serialized;
	}

	function serializePlayerSlot(card) {
		if (!card) return null;

		return {
			cardId: String(card.id || card.cardId || card.instanceId || ""),
			instanceId: card.instanceId || null
		};
	}

	function serializeEncounters(encounters) {
		const serialized = {};

		Object.entries(encounters).forEach(([encounterId, encounter]) => {
			serialized[encounterId] = {
				id: encounter.id || encounterId,
				number: Number(encounter.number) || 0,
				name: String(encounter.name || encounterId),
				deckId: String(encounter.deckId || ""),
				deckOrder: Array.isArray(encounter.deckOrder)
					? encounter.deckOrder.map(cardId => String(cardId || "")).filter(Boolean)
					: [],
				slots: Array.isArray(encounter.slots)
					? encounter.slots.map(serializeEncounterSlot)
					: []
			};
		});

		return serialized;
	}

	function serializeEncounterSlot(cardState) {
		if (!cardState) return null;

		return {
			cardId: String(cardState.cardId || cardState.id || cardState.instanceId || ""),
			instanceId: cardState.instanceId || null,
			faceDown: Boolean(cardState.faceDown),
			damage: Math.max(0, Number(cardState.damage) || 0)
		};
	}

	function hydrateSaveSnapshot(snapshot) {
		const currentState = store.getState();
		const savedCards = snapshot && typeof snapshot.cards === "object" && snapshot.cards
			? structuredClone(snapshot.cards)
			: {};
		const cards = {
			...(currentState.cards || {}),
			...savedCards
		};

		const hydratedPlayers = hydratePlayers(snapshot.players || {}, cards);
		const hydratedEncounters = hydrateEncounters(snapshot.encounters || {});

		return {
			gameName: String(snapshot.gameName || currentState.gameName || "New Adventure"),
			grid: hydrateGrid(snapshot.grid),
			selectedTile: snapshot.selectedTile || null,
			entities: structuredClone(snapshot.entities || {}),
			players: hydratedPlayers,
			decks: structuredClone(snapshot.decks || {}),
			cards,
			encounters: hydratedEncounters,
			ui: hydrateUi(snapshot.ui, hydratedEncounters, currentState.ui)
		};
	}

	function hydrateGrid(grid) {
		const sourceGrid = grid || {};
		const width = Math.max(1, Number(sourceGrid.width) || 20);
		const height = Math.max(1, Number(sourceGrid.height) || 20);
		const sourceTiles = sourceGrid.tiles && typeof sourceGrid.tiles === "object"
			? sourceGrid.tiles
			: {};

		return {
			width,
			height,
			tiles: structuredClone(sourceTiles)
		};
	}

	function hydratePlayers(players, cardsIndex) {
		const hydrated = {};

		Object.entries(players || {}).forEach(([playerId, player]) => {
			hydrated[playerId] = {
				id: player.id || playerId,
				number: Number(player.number) || 0,
				name: String(player.name || playerId),
				damage: Math.max(0, Number(player.damage) || 0),
				currency: Math.max(0, Number(player.currency) || 0),
				heat: Math.max(0, Number(player.heat) || 0),
				slots: Array.isArray(player.slots)
					? player.slots.map(slot => hydratePlayerSlot(slot, cardsIndex))
					: []
			};
		});

		return hydrated;
	}

	function hydratePlayerSlot(slot, cardsIndex) {
		if (!slot) return null;

		if (slot.id || slot.header || slot.name) {
			return normalizeCardRecord(slot, slot.instanceId);
		}

		const cardId = String(slot.cardId || slot.id || slot.instanceId || "").trim();
		const baseCard = cardsIndex[cardId] || { id: cardId, header: cardId || "Card" };
		return normalizeCardRecord(baseCard, slot.instanceId);
	}

	function normalizeCardRecord(cardRecord, preferredInstanceId) {
		const data = cardRecord || {};
		const header = String(data.header || data.name || data.title || data.id || "Card");
		const id = String(data.id || data.cardId || preferredInstanceId || header);

		return {
			...data,
			instanceId: preferredInstanceId || data.instanceId || `card_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
			id,
			header,
			topText: String(data.topText || ""),
			image: data.image || "assets/images/default.png",
			body: String(data.body || data.bodyText || ""),
			name: String(data.name || header)
		};
	}

	function hydrateEncounters(encounters) {
		const hydrated = {};

		Object.entries(encounters || {}).forEach(([encounterId, encounter]) => {
			hydrated[encounterId] = {
				id: encounter.id || encounterId,
				number: Number(encounter.number) || 0,
				name: String(encounter.name || encounterId),
				deckId: String(encounter.deckId || ""),
				deckOrder: Array.isArray(encounter.deckOrder)
					? encounter.deckOrder.map(cardId => String(cardId || "")).filter(Boolean)
					: [],
				slots: Array.isArray(encounter.slots)
					? encounter.slots.map(hydrateEncounterSlot)
					: []
			};
		});

		return hydrated;
	}

	function hydrateEncounterSlot(slot) {
		if (!slot) return null;

		const cardId = String(slot.cardId || slot.id || slot.instanceId || "").trim();

		return {
			instanceId: slot.instanceId || `enc_card_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
			cardId,
			faceDown: Boolean(slot.faceDown),
			damage: Math.max(0, Number(slot.damage) || 0)
		};
	}

	function hydrateUi(ui, encounters, fallbackUi) {
		const sourceUi = ui && typeof ui === "object" ? ui : {};
		const encounterIds = Object.keys(encounters || {});
		const requestedActiveEncounterId = sourceUi.activeEncounterId;
		const activeEncounterId = encounterIds.includes(requestedActiveEncounterId)
			? requestedActiveEncounterId
			: (encounterIds[0] || null);

		return {
			activeEncounterId,
			selectedEntity: sourceUi.selectedEntity || fallbackUi?.selectedEntity || null,
			editMode: Boolean(sourceUi.editMode)
		};
	}
})();