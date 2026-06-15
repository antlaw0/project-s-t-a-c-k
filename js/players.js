const PLAYER_COLUMNS = 10;
const PLAYER_SPECIAL_ROWS = 3;
const PLAYER_INVENTORY_ROWS = 10;
const PLAYER_SPECIAL_SLOTS = PLAYER_COLUMNS * PLAYER_SPECIAL_ROWS;
const PLAYER_TOTAL_SLOTS = PLAYER_SPECIAL_SLOTS + (PLAYER_COLUMNS * PLAYER_INVENTORY_ROWS);
const PLAYER_INVENTORY_START = PLAYER_SPECIAL_SLOTS;
const PLAYER_DRAG_TYPE = "application/x-projectstack-player-card";

document.addEventListener("DOMContentLoaded", initializePlayersTab);

function initializePlayersTab() {
	const addPlayerBtn = document.getElementById("addPlayerBtn");

	if (addPlayerBtn) {
		addPlayerBtn.addEventListener("click", addPlayer);
	}

	// Hook for other systems to award cards to players.
	window.PlayersAPI = {
		addPlayer,
		removePlayer,
		addCardToPlayer,
		addCardToFirstPlayer,
		resetToDefaultPlayers
	};

	document.addEventListener("game:new", () => {
		resetToDefaultPlayers();
	});

	document.addEventListener("players:addCard", event => {
		const detail = event.detail || {};
		const playerId = detail.playerId;
		const card = detail.card || detail.cardData;

		if (!card) return;

		if (playerId) {
			addCardToPlayer(playerId, card);
			return;
		}

		addCardToFirstPlayer(card);
	});

	store.subscribe(() => {
		renderPlayersTab();
	});

	ensureDefaultPlayers();
	renderPlayersTab();
}

function renderPlayersTab() {
	const playersArea = document.getElementById("playersArea");
	const emptyNote = document.getElementById("playersEmptyNote");

	if (!playersArea || !emptyNote) return;

	const players = getOrderedPlayers();

	emptyNote.style.display = players.length ? "none" : "block";

	playersArea.innerHTML = "";

	players.forEach(player => {
		playersArea.appendChild(buildPlayerPanel(player));
	});
}

function buildPlayerPanel(player) {
	const panel = document.createElement("article");
	panel.className = "playerPanel";
	panel.dataset.playerId = player.id;

	const header = document.createElement("header");
	header.className = "playerPanelHeader";

	const title = document.createElement("h3");
	title.textContent = player.name;

	const removeBtn = document.createElement("button");
	removeBtn.type = "button";
	removeBtn.className = "removePlayerBtn";
	removeBtn.textContent = "Remove Player";
	removeBtn.addEventListener("click", () => {
		removePlayer(player.id);
	});

	header.appendChild(title);
	header.appendChild(removeBtn);

	const specialGrid = buildGrid(player, 0, PLAYER_SPECIAL_SLOTS, "special");
	const inventoryGrid = buildGrid(player, PLAYER_INVENTORY_START, PLAYER_TOTAL_SLOTS, "inventory");

	panel.appendChild(header);
	panel.appendChild(specialGrid);
	panel.appendChild(inventoryGrid);

	return panel;
}

function buildGrid(player, startIndex, endIndex, gridType) {
	const gridEl = document.createElement("div");
	gridEl.className = `playerGrid ${gridType}`;

	for (let slotIndex = startIndex; slotIndex < endIndex; slotIndex++) {
		const slotCard = player.slots[slotIndex] || null;
		gridEl.appendChild(buildSlot(player.id, slotIndex, slotCard, gridType));
	}

	return gridEl;
}

function buildSlot(playerId, slotIndex, card, gridType) {
	const slot = document.createElement("div");

	slot.className = `playerSlot ${gridType}`;
	slot.dataset.playerId = playerId;
	slot.dataset.slotIndex = String(slotIndex);

	slot.addEventListener("dragover", handleSlotDragOver);
	slot.addEventListener("dragleave", handleSlotDragLeave);
	slot.addEventListener("drop", handleSlotDrop);

	if (!card) {
		return slot;
	}

	const cardEl = window.CardComponent.createCardElement(card, {
		className: "playerCard gameCard",
		compact: true,
		draggable: true
	});
	cardEl.dataset.playerId = playerId;
	cardEl.dataset.slotIndex = String(slotIndex);
	cardEl.dataset.cardInstanceId = card.instanceId || "";

	cardEl.addEventListener("dragstart", handleCardDragStart);
	cardEl.addEventListener("dragend", clearDragState);

	slot.appendChild(cardEl);

	return slot;
}

function handleCardDragStart(event) {
	const cardEl = event.currentTarget;
	const sourcePlayerId = cardEl.dataset.playerId;
	const sourceSlotIndex = Number(cardEl.dataset.slotIndex);

	const payload = {
		sourcePlayerId,
		sourceSlotIndex
	};

	event.dataTransfer.setData(PLAYER_DRAG_TYPE, JSON.stringify(payload));
	event.dataTransfer.effectAllowed = "move";

	cardEl.classList.add("dragging");
}

function handleSlotDragOver(event) {
	event.preventDefault();
	event.currentTarget.classList.add("dragOver");
}

function handleSlotDragLeave(event) {
	event.currentTarget.classList.remove("dragOver");
}

function handleSlotDrop(event) {
	event.preventDefault();

	const targetSlot = event.currentTarget;

	targetSlot.classList.remove("dragOver");

	const targetPlayerId = targetSlot.dataset.playerId;
	const targetSlotIndex = Number(targetSlot.dataset.slotIndex);

	const payloadRaw = event.dataTransfer.getData(PLAYER_DRAG_TYPE);

	if (!payloadRaw) return;

	let payload;

	try {
		payload = JSON.parse(payloadRaw);
	} catch (error) {
		return;
	}

	const sourcePlayerId = payload.sourcePlayerId;
	const sourceSlotIndex = Number(payload.sourceSlotIndex);

	if (!sourcePlayerId || Number.isNaN(sourceSlotIndex) || Number.isNaN(targetSlotIndex)) {
		return;
	}

	swapOrMoveCards(sourcePlayerId, sourceSlotIndex, targetPlayerId, targetSlotIndex);
}

function clearDragState() {
	document.querySelectorAll(".playerCard.dragging").forEach(card => {
		card.classList.remove("dragging");
	});

	document.querySelectorAll(".playerSlot.dragOver").forEach(slot => {
		slot.classList.remove("dragOver");
	});
}

function swapOrMoveCards(sourcePlayerId, sourceSlotIndex, targetPlayerId, targetSlotIndex) {
	const state = store.getState();
	const players = { ...state.players };

	const sourcePlayer = players[sourcePlayerId];
	const targetPlayer = players[targetPlayerId];

	if (!sourcePlayer || !targetPlayer) return;

	if (sourceSlotIndex < 0 || sourceSlotIndex >= PLAYER_TOTAL_SLOTS) return;
	if (targetSlotIndex < 0 || targetSlotIndex >= PLAYER_TOTAL_SLOTS) return;

	if (sourcePlayerId === targetPlayerId) {
		const slots = [...sourcePlayer.slots];
		const sourceCard = slots[sourceSlotIndex];

		if (!sourceCard) return;

		slots[sourceSlotIndex] = slots[targetSlotIndex] || null;
		slots[targetSlotIndex] = sourceCard;

		players[sourcePlayerId] = {
			...sourcePlayer,
			slots
		};

		store.update("players", players);
		return;
	}

	const sourceSlots = [...sourcePlayer.slots];
	const targetSlots = [...targetPlayer.slots];
	const sourceCard = sourceSlots[sourceSlotIndex];

	if (!sourceCard) return;

	sourceSlots[sourceSlotIndex] = targetSlots[targetSlotIndex] || null;
	targetSlots[targetSlotIndex] = sourceCard;

	players[sourcePlayerId] = {
		...sourcePlayer,
		slots: sourceSlots
	};

	players[targetPlayerId] = {
		...targetPlayer,
		slots: targetSlots
	};

	store.update("players", players);
}

function addPlayer() {
	const state = store.getState();
	const players = { ...state.players };

	const nextNumber = getNextPlayerNumber(players);
	const playerId = `player_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

	players[playerId] = {
		id: playerId,
		number: nextNumber,
		name: `Player ${nextNumber}`,
		slots: createEmptyPlayerSlots()
	};

	store.update("players", players);
}

function removePlayer(playerId) {
	const state = store.getState();
	const players = { ...state.players };

	if (!players[playerId]) return;

	delete players[playerId];
	store.update("players", players);
}

function addCardToPlayer(playerId, cardData) {
	const state = store.getState();
	const players = { ...state.players };
	const player = players[playerId];

	if (!player) return false;

	const slots = [...player.slots];

	let targetSlotIndex = -1;

	for (let i = PLAYER_INVENTORY_START; i < PLAYER_TOTAL_SLOTS; i++) {
		if (!slots[i]) {
			targetSlotIndex = i;
			break;
		}
	}

	if (targetSlotIndex === -1) return false;

	slots[targetSlotIndex] = normalizeCardInstance(cardData);

	players[playerId] = {
		...player,
		slots
	};

	store.update("players", players);
	return true;
}

function addCardToFirstPlayer(cardData) {
	const players = getOrderedPlayers();

	if (!players.length) return false;

	return addCardToPlayer(players[0].id, cardData);
}

function normalizeCardInstance(cardData) {
	const data = cardData || {};
	const normalized = window.CardComponent
		? window.CardComponent.normalizeCardData(data)
		: {
			id: data.id || data.instanceId,
			header: data.header || data.name || data.title || data.templateId || "Card",
			topText: data.topText || "",
			image: data.image || "assets/images/default.png",
			body: data.body || data.bodyText || ""
		};

	return {
		...data,
		instanceId: data.instanceId || normalized.id || `card_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
		id: normalized.id,
		header: normalized.header,
		topText: normalized.topText,
		image: normalized.image,
		body: normalized.body,
		name: data.name || normalized.header
	};
}

function getOrderedPlayers() {
	const state = store.getState();

	return Object.values(state.players || {}).sort((a, b) => {
		const aNumber = Number(a.number) || 0;
		const bNumber = Number(b.number) || 0;

		return aNumber - bNumber;
	});
}

function getNextPlayerNumber(players) {
	const values = Object.values(players || {});

	if (!values.length) return 1;

	let maxNumber = 0;

	values.forEach(player => {
		const number = Number(player.number);

		if (!Number.isNaN(number) && number > maxNumber) {
			maxNumber = number;
			return;
		}

		const match = String(player.name || "").match(/player\s+(\d+)/i);

		if (!match) return;

		const parsed = Number(match[1]);

		if (!Number.isNaN(parsed) && parsed > maxNumber) {
			maxNumber = parsed;
		}
	});

	return maxNumber + 1;
}

function createEmptyPlayerSlots() {
	return Array.from({ length: PLAYER_TOTAL_SLOTS }, () => null);
}

function ensureDefaultPlayers() {
	const state = store.getState();
	const playerCount = Object.keys(state.players || {}).length;

	if (playerCount > 0) return;

	resetToDefaultPlayers();
}

function resetToDefaultPlayers() {
	store.update("players", buildDefaultPlayers());
}

function buildDefaultPlayers() {
	return {
		player_1: {
			id: "player_1",
			number: 1,
			name: "Player 1",
			slots: createEmptyPlayerSlots()
		},
		player_2: {
			id: "player_2",
			number: 2,
			name: "Player 2",
			slots: createEmptyPlayerSlots()
		}
	};
}