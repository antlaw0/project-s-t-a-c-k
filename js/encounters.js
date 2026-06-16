const ENCOUNTER_COLUMNS = 10;
const ENCOUNTER_ROWS = 2;
const ENCOUNTER_TOTAL_SLOTS = ENCOUNTER_COLUMNS * ENCOUNTER_ROWS;
const ENCOUNTER_DECK_SLOT_INDEX = 0;
const CARD_DRAG_TYPE = "application/x-projectstack-card-move";

document.addEventListener("DOMContentLoaded", initializeEncounterTab);

function initializeEncounterTab() {
	bindEncounterControls();

	document.addEventListener("game:new", () => {
		resetToDefaultEncounters();
	});

	store.subscribe(() => {
		renderEncounterTab();
	});

	ensureDefaultEncounters();
	renderEncounterTab();
}

function bindEncounterControls() {
	const addBtn = document.getElementById("addEncounterBtn");
	const deleteBtn = document.getElementById("deleteEncounterBtn");
	const nameInput = document.getElementById("encounterNameInput");
	const deckIdInput = document.getElementById("encounterDeckIdInput");
	const loadDeckBtn = document.getElementById("loadEncounterDeckBtn");
	const deckSelect = document.getElementById("encounterDeckSelect");
	const useSelectedDeckBtn = document.getElementById("useSelectedDeckBtn");
	const shuffleBtn = document.getElementById("shuffleEncounterDeckBtn");

	if (addBtn) {
		addBtn.addEventListener("click", addEncounter);
	}

	if (deleteBtn) {
		deleteBtn.addEventListener("click", deleteActiveEncounter);
	}

	if (nameInput) {
		nameInput.addEventListener("input", event => {
			updateEncounterName(event.target.value);
		});
	}

	if (deckIdInput) {
		deckIdInput.addEventListener("keydown", event => {
			if (event.key !== "Enter") return;
			event.preventDefault();
			applyDeckIdFromInput();
		});
	}

	if (loadDeckBtn) {
		loadDeckBtn.addEventListener("click", applyDeckIdFromInput);
	}

	if (deckSelect) {
		deckSelect.addEventListener("change", () => {
			if (!deckIdInput) return;
			deckIdInput.value = deckSelect.value;
		});
	}

	if (useSelectedDeckBtn) {
		useSelectedDeckBtn.addEventListener("click", () => {
			if (!deckSelect) return;
			loadDeckForActiveEncounter(deckSelect.value);
		});
	}

	if (shuffleBtn) {
		shuffleBtn.addEventListener("click", shuffleActiveEncounterDeck);
	}
}

function renderEncounterTab() {
	const tabSet = document.getElementById("encounterTabSet");
	const grid = document.getElementById("encounterGrid");
	const nameInput = document.getElementById("encounterNameInput");
	const deckIdInput = document.getElementById("encounterDeckIdInput");
	const deckSelect = document.getElementById("encounterDeckSelect");

	if (!tabSet || !grid || !nameInput || !deckIdInput || !deckSelect) return;

	const encounters = getOrderedEncounters();
	const activeEncounterId = getActiveEncounterId(encounters);
	const activeEncounter = activeEncounterId ? getEncounterById(activeEncounterId) : null;

	renderEncounterTabButtons(tabSet, encounters, activeEncounterId);
	renderDeckSelect(deckSelect, activeEncounter ? activeEncounter.deckId : "");

	nameInput.value = activeEncounter ? activeEncounter.name : "";
	nameInput.disabled = !activeEncounter;

	deckIdInput.value = activeEncounter ? (activeEncounter.deckId || "") : "";
	deckIdInput.disabled = !activeEncounter;

	renderEncounterGrid(grid, activeEncounter);
}

function renderEncounterTabButtons(container, encounters, activeEncounterId) {
	container.innerHTML = "";

	encounters.forEach(encounter => {
		const button = document.createElement("button");
		button.type = "button";
		button.className = "encounterTabButton";
		button.textContent = encounter.name;
		button.classList.toggle("active", encounter.id === activeEncounterId);
		button.setAttribute("aria-selected", encounter.id === activeEncounterId ? "true" : "false");
		button.addEventListener("click", () => {
			setActiveEncounterId(encounter.id);
		});

		container.appendChild(button);
	});
}

function renderDeckSelect(select, activeDeckId) {
	const deckIds = getAvailableDeckIds();

	select.innerHTML = "";

	if (!deckIds.length) {
		const option = document.createElement("option");
		option.value = "";
		option.textContent = "No deckId cards found";
		select.appendChild(option);
		select.disabled = true;
		return;
	}

	deckIds.forEach(deckId => {
		const option = document.createElement("option");
		option.value = deckId;
		option.textContent = deckId;
		option.selected = deckId === activeDeckId;
		select.appendChild(option);
	});

	select.disabled = false;
}

function renderEncounterGrid(grid, encounter) {
	grid.innerHTML = "";

	grid.appendChild(buildEncounterRowTable(encounter, 0, "Enemy Back Line"));
	grid.appendChild(buildEncounterRowTable(encounter, 1, "Enemy Front Line"));
}

function buildEncounterRowTable(encounter, rowIndex, tableName) {
	const wrap = document.createElement("div");
	wrap.className = "encounterGridRow";

	const table = document.createElement("table");
	table.className = "cardGridTable";
	table.setAttribute("aria-label", tableName);

	

	const tbody = document.createElement("tbody");
	const row = document.createElement("tr");

	for (let colIndex = 0; colIndex < ENCOUNTER_COLUMNS; colIndex++) {
		const slotIndex = (rowIndex * ENCOUNTER_COLUMNS) + colIndex;
		row.appendChild(buildEncounterSlot(encounter, slotIndex));
	}

	tbody.appendChild(row);
	table.appendChild(tbody);
	wrap.appendChild(table);

	return wrap;
}

function buildEncounterSlot(encounter, slotIndex) {
	const slot = document.createElement("td");
	slot.className = "encounterSlot";
	slot.dataset.slotIndex = String(slotIndex);

	const cardState = encounter && Array.isArray(encounter.slots) ? encounter.slots[slotIndex] : null;
	const accessibleName = getEncounterSlotAccessibleName(slotIndex, cardState, encounter);

	slot.setAttribute("aria-label", accessibleName);

	const spokenText = document.createElement("span");
	spokenText.className = "srOnly";
	spokenText.textContent = accessibleName;
	slot.appendChild(spokenText);

	if (slotIndex === ENCOUNTER_DECK_SLOT_INDEX) {
		slot.classList.add("encounterDeckSlot");
		renderDeckSlotContent(slot, encounter);
		return slot;
	}

	slot.addEventListener("dragover", handleEncounterSlotDragOver);
	slot.addEventListener("dragleave", handleEncounterSlotDragLeave);
	slot.addEventListener("drop", handleEncounterSlotDrop);
	slot.addEventListener("pointerup", handleEncounterSlotPointerUp);

	if (cardState) {
		const cardEl = buildEncounterCard(cardState);
		cardEl.draggable = true;
		cardEl.setAttribute("draggable", "true");
		
		cardEl.dataset.slotIndex = String(slotIndex);
		cardEl.dataset.encounterId = encounter?.id || "";
		cardEl.addEventListener("dragover", handleEncounterSlotDragOver);
		cardEl.addEventListener("dragleave", handleEncounterSlotDragLeave);
		cardEl.addEventListener("drop", handleEncounterSlotDrop);
		cardEl.addEventListener("click", handleEncounterCardDamageControlClick);
		cardEl.addEventListener("pointerdown", handleEncounterCardDamageControlPointerDown);
		cardEl.addEventListener("pointerdown", handleEncounterCardPointerDown);
		cardEl.addEventListener("dragstart", handleEncounterCardDragStart);
		cardEl.addEventListener("dragend", clearEncounterDragState);
		cardEl.addEventListener("dblclick", () => {
			toggleEncounterCardFace(slotIndex);
		});
		slot.appendChild(cardEl);
	}

	return slot;
}

function renderDeckSlotContent(slot, encounter) {
	const face = document.createElement("div");
	face.className = "encounterDeckFace";

	const title = document.createElement("strong");
	title.textContent = "Dungeon Deck";

	const deckId = encounter && encounter.deckId ? encounter.deckId : "none";
	const remaining = encounter && Array.isArray(encounter.deckOrder) ? encounter.deckOrder.length : 0;

	const lineDeck = document.createElement("span");
	lineDeck.textContent = `Deck ID: ${deckId}`;

	const lineRemaining = document.createElement("span");
	lineRemaining.textContent = `Remaining: ${remaining}`;

	face.appendChild(title);
	face.appendChild(lineDeck);
	face.appendChild(lineRemaining);

	slot.addEventListener("click", drawTopCardFromActiveEncounterDeck);
	slot.appendChild(face);
}

function buildEncounterCard(cardState) {
	const cardRecord = getCardById(cardState.cardId);
	const isEnemyCard = isEnemyCardRecord(cardRecord);
	const cardData = cardRecord || {
		id: cardState.cardId,
		header: cardState.cardId,
		topText: "",
		image: "assets/images/default.png",
		body: "",
		backText: ""
	};

	if (!cardState.faceDown) {
		const front = window.CardComponent.createCardElement(cardData, {
			className: "encounterCard gameCard",
			compact: true,
			draggable: false
		});

		if (isEnemyCard) {
			const imageWrap = front.querySelector(".gameCardImageWrap");
			if (imageWrap) {
				const damageOverlay = buildEnemyDamageOverlay(cardState.damage || 0);
				imageWrap.appendChild(damageOverlay);
			}
		}

		return front;
	}

	const back = document.createElement("article");
	back.className = "encounterCard faceDown";

	const title = document.createElement("div");
	title.className = "encounterCardBackTitle";
	title.textContent = cardData.header || "Card Back";

	const body = document.createElement("div");
	body.className = "encounterCardBackText";
	body.textContent = cardData.backText || "Face Down";

	back.appendChild(title);
	back.appendChild(body);
	return back;
}

function buildEnemyDamageOverlay(damage) {
	const overlay = document.createElement("div");
	overlay.className = "enemyDamageOverlay";

	const label = document.createElement("span");
	label.className = "enemyDamageLabel";
	label.textContent = `DMG: ${Math.max(0, Number(damage) || 0)}`;

	const decrementBtn = document.createElement("button");
	decrementBtn.type = "button";
	decrementBtn.className = "enemyDamageBtn";
	decrementBtn.dataset.damageDelta = "-1";
	decrementBtn.setAttribute("aria-label", "Decrease enemy damage");
	decrementBtn.textContent = "-";

	const incrementBtn = document.createElement("button");
	incrementBtn.type = "button";
	incrementBtn.className = "enemyDamageBtn";
	incrementBtn.dataset.damageDelta = "1";
	incrementBtn.setAttribute("aria-label", "Increase enemy damage");
	incrementBtn.textContent = "+";

	overlay.appendChild(label);
	overlay.appendChild(decrementBtn);
	overlay.appendChild(incrementBtn);

	return overlay;
}

function isEnemyCardRecord(cardRecord) {
	const type = String(cardRecord?.type || cardRecord?.cardType || "").trim().toLowerCase();
	return type === "enemy";
}

function getEncounterSlotAccessibleName(slotIndex, cardState, encounter) {
	if (slotIndex === ENCOUNTER_DECK_SLOT_INDEX) {
		return "Dungeon Deck";
	}

	if (!cardState) return "Empty";

	const cardRecord = getCardById(cardState.cardId);
	const header = String(cardRecord?.header || "").trim();
	if (header) return header;

	const name = String(cardRecord?.name || "").trim();
	if (name) return name;

	const cardId = String(cardState.cardId || cardState.instanceId || "").trim();
	if (cardId) return cardId;

	const encounterName = String(encounter?.name || "").trim();
	if (encounterName) return encounterName;

	return "Card";
}

function handleEncounterCardDragStart(event) {
	const cardEl = event.currentTarget;
	const sourceEncounterId = cardEl.dataset.encounterId;
	const sourceSlotIndex = Number(cardEl.dataset.slotIndex);
	const payload = buildEncounterDragPayload(sourceEncounterId, sourceSlotIndex);
	window.__projectStackCardDragPayload = payload;

	event.dataTransfer.setData(CARD_DRAG_TYPE, JSON.stringify(payload));
	event.dataTransfer.setData("application/x-projectstack-player-card", JSON.stringify(payload));
	event.dataTransfer.setData("text/plain", JSON.stringify(payload));
	event.dataTransfer.effectAllowed = "move";

	cardEl.classList.add("dragging");
}

function handleEncounterCardPointerDown(event) {
	if (event.target.closest(".enemyDamageOverlay")) return;
	if (event.button !== 0) return;

	const cardEl = event.currentTarget;
	const sourceEncounterId = cardEl.dataset.encounterId;
	const sourceSlotIndex = Number(cardEl.dataset.slotIndex);
	const payload = buildEncounterDragPayload(sourceEncounterId, sourceSlotIndex);

	window.__projectStackCardDragPayload = payload;
	cardEl.classList.add("dragging");
}

function handleEncounterCardDamageControlClick(event) {
	const control = event.target.closest(".enemyDamageBtn");
	if (!control) return;

	event.preventDefault();
	event.stopPropagation();

	const cardEl = event.currentTarget;
	const encounterId = cardEl.dataset.encounterId;
	const slotIndex = Number(cardEl.dataset.slotIndex);
	const delta = Number(control.dataset.damageDelta || 0);

	if (!encounterId || Number.isNaN(slotIndex) || !delta) return;

	adjustEncounterCardDamage(encounterId, slotIndex, delta);
}

function handleEncounterCardDamageControlPointerDown(event) {
	if (!event.target.closest(".enemyDamageBtn")) return;
	event.preventDefault();
	event.stopPropagation();
}

function buildEncounterSlot(encounter, slotIndex) {
    const slot = document.createElement("td");
    slot.className = "encounterSlot";
    slot.dataset.slotIndex = String(slotIndex);

    const cardState = encounter && Array.isArray(encounter.slots)
        ? encounter.slots[slotIndex]
        : null;

    if (slotIndex === ENCOUNTER_DECK_SLOT_INDEX) {
        slot.setAttribute("aria-label", "Dungeon Deck");
        slot.classList.add("encounterDeckSlot");
        renderDeckSlotContent(slot, encounter);
        return slot;
    }

    slot.addEventListener("dragover", handleEncounterSlotDragOver);
    slot.addEventListener("dragleave", handleEncounterSlotDragLeave);
    slot.addEventListener("drop", handleEncounterSlotDrop);
    slot.addEventListener("pointerup", handleEncounterSlotPointerUp);

    if (!cardState) {
        slot.setAttribute("aria-label", "Empty");
        return slot;
    }

    const cardRecord = getCardById(cardState.cardId);

    const cardName = cardRecord?.header || "Card";
    const cardTopText = cardRecord?.topText || "";
    const cardBody = cardRecord?.body || "";

    const accessibleText = [
        cardName,
        cardTopText,
        cardBody
    ]
        .filter(Boolean)
        .join(". ");

    slot.setAttribute("aria-label", accessibleText);

    const srText = document.createElement("div");
    srText.className = "srOnly";
    srText.textContent = accessibleText;
    slot.appendChild(srText);

    const cardEl = buildEncounterCard(cardState);

    cardEl.draggable = true;
    cardEl.setAttribute("draggable", "true");

    // IMPORTANT:
    // REMOVED aria-hidden="true"

    cardEl.dataset.slotIndex = String(slotIndex);
    cardEl.dataset.encounterId = encounter?.id || "";

    cardEl.addEventListener("dragover", handleEncounterSlotDragOver);
    cardEl.addEventListener("dragleave", handleEncounterSlotDragLeave);
    cardEl.addEventListener("drop", handleEncounterSlotDrop);
    cardEl.addEventListener("click", handleEncounterCardDamageControlClick);
    cardEl.addEventListener("pointerdown", handleEncounterCardDamageControlPointerDown);
    cardEl.addEventListener("pointerdown", handleEncounterCardPointerDown);
    cardEl.addEventListener("dragstart", handleEncounterCardDragStart);
    cardEl.addEventListener("dragend", clearEncounterDragState);

    cardEl.addEventListener("dblclick", () => {
        toggleEncounterCardFace(slotIndex);
    });

    slot.appendChild(cardEl);

    return slot;
}
function clearEncounterDragState() {
	document.querySelectorAll(".encounterCard.dragging").forEach(card => {
		card.classList.remove("dragging");
	});

	window.__projectStackCardDragPayload = null;

	document.querySelectorAll(".encounterSlot.dragOver").forEach(slot => {
		slot.classList.remove("dragOver");
	});
}

function handleEncounterSlotDragOver(event) {
	event.preventDefault();
	const slot = event.currentTarget.closest(".encounterSlot") || event.currentTarget;
	slot.classList.add("dragOver");
}

function handleEncounterSlotDragLeave(event) {
	const slot = event.currentTarget.closest(".encounterSlot") || event.currentTarget;
	slot.classList.remove("dragOver");
}

function handleEncounterSlotDrop(event) {
	event.preventDefault();

	const targetSlot = event.currentTarget.closest(".encounterSlot") || event.currentTarget;
	targetSlot.classList.remove("dragOver");

	const targetSlotIndex = Number(targetSlot.dataset.slotIndex);
	if (Number.isNaN(targetSlotIndex) || targetSlotIndex === ENCOUNTER_DECK_SLOT_INDEX) return;

	const payloadRaw = event.dataTransfer.getData(CARD_DRAG_TYPE)
		|| event.dataTransfer.getData("application/x-projectstack-card-move")
		|| event.dataTransfer.getData("application/x-projectstack-player-card")
		|| event.dataTransfer.getData("text/plain")
		|| "";

	const globalFallback = window.__projectStackCardDragPayload || null;

	let payload;

	if (payloadRaw) {
		try {
			payload = JSON.parse(payloadRaw);
		} catch (error) {
			payload = null;
		}
	}

	if (!payload && globalFallback) {
		payload = globalFallback;
	}

	if (!payload) return;

	processDropToEncounterSlot(payload, targetSlotIndex);
}

function handleEncounterSlotPointerUp(event) {
	const payload = window.__projectStackCardDragPayload || null;
	if (!payload) return;

	const targetSlot = event.currentTarget.closest(".encounterSlot") || event.currentTarget;
	const targetSlotIndex = Number(targetSlot.dataset.slotIndex);

	if (Number.isNaN(targetSlotIndex) || targetSlotIndex === ENCOUNTER_DECK_SLOT_INDEX) {
		clearEncounterDragState();
		return;
	}

	processDropToEncounterSlot(payload, targetSlotIndex);
	clearEncounterDragState();
}

function processDropToEncounterSlot(payload, targetSlotIndex) {

	const sourceContext = payload.sourceContext;
	const sourceSlotIndex = Number(payload.sourceSlotIndex);
	if (Number.isNaN(sourceSlotIndex)) return;

	const state = store.getState();
	const targetEncounterId = state.ui?.activeEncounterId;
	if (!targetEncounterId) return;

	if (sourceContext === "encounter") {
		const sourceEncounterId = payload.sourceEncounterId;
		if (!sourceEncounterId) return;
		swapOrMoveEncounterCards(sourceEncounterId, sourceSlotIndex, targetEncounterId, targetSlotIndex);
		return;
	}

	if (sourceContext === "player") {
		const sourcePlayerId = payload.sourcePlayerId;
		if (!sourcePlayerId) return;
		movePlayerCardToEncounter(sourcePlayerId, sourceSlotIndex, targetEncounterId, targetSlotIndex);
	}
}

function adjustEncounterCardDamage(encounterId, slotIndex, delta) {
	const state = store.getState();
	const encounters = { ...(state.encounters || {}) };
	const encounter = encounters[encounterId];

	if (!encounter) return;
	if (slotIndex <= ENCOUNTER_DECK_SLOT_INDEX || slotIndex >= ENCOUNTER_TOTAL_SLOTS) return;

	const slots = Array.isArray(encounter.slots) ? [...encounter.slots] : createEncounterSlots();
	const cardState = slots[slotIndex];
	if (!cardState) return;

	const currentDamage = Math.max(0, Number(cardState.damage) || 0);
	const nextDamage = Math.max(0, currentDamage + delta);

	slots[slotIndex] = {
		...cardState,
		damage: nextDamage
	};

	encounters[encounterId] = {
		...encounter,
		slots
	};

	store.update("encounters", encounters);
}

function swapOrMoveEncounterCards(sourceEncounterId, sourceSlotIndex, targetEncounterId, targetSlotIndex) {
	const state = store.getState();
	const encounters = { ...(state.encounters || {}) };
	const sourceEncounter = encounters[sourceEncounterId];
	const targetEncounter = encounters[targetEncounterId];

	if (!sourceEncounter || !targetEncounter) return;
	if (sourceSlotIndex <= ENCOUNTER_DECK_SLOT_INDEX || sourceSlotIndex >= ENCOUNTER_TOTAL_SLOTS) return;
	if (targetSlotIndex <= ENCOUNTER_DECK_SLOT_INDEX || targetSlotIndex >= ENCOUNTER_TOTAL_SLOTS) return;

	if (sourceEncounterId === targetEncounterId) {
		const slots = Array.isArray(sourceEncounter.slots) ? [...sourceEncounter.slots] : createEncounterSlots();
		const sourceCard = slots[sourceSlotIndex];
		if (!sourceCard) return;

		slots[sourceSlotIndex] = slots[targetSlotIndex] || null;
		slots[targetSlotIndex] = sourceCard;

		encounters[sourceEncounterId] = {
			...sourceEncounter,
			slots
		};

		store.update("encounters", encounters);
		return;
	}

	const sourceSlots = Array.isArray(sourceEncounter.slots) ? [...sourceEncounter.slots] : createEncounterSlots();
	const targetSlots = Array.isArray(targetEncounter.slots) ? [...targetEncounter.slots] : createEncounterSlots();
	const sourceCard = sourceSlots[sourceSlotIndex];
	if (!sourceCard) return;

	sourceSlots[sourceSlotIndex] = targetSlots[targetSlotIndex] || null;
	targetSlots[targetSlotIndex] = sourceCard;

	encounters[sourceEncounterId] = {
		...sourceEncounter,
		slots: sourceSlots
	};

	encounters[targetEncounterId] = {
		...targetEncounter,
		slots: targetSlots
	};

	store.update("encounters", encounters);
}

function movePlayerCardToEncounter(sourcePlayerId, sourceSlotIndex, targetEncounterId, targetSlotIndex) {
	const state = store.getState();
	const players = { ...(state.players || {}) };
	const encounters = { ...(state.encounters || {}) };

	const sourcePlayer = players[sourcePlayerId];
	const targetEncounter = encounters[targetEncounterId];

	if (!sourcePlayer || !targetEncounter) return;
	if (sourceSlotIndex < 0 || sourceSlotIndex >= (sourcePlayer.slots?.length || 0)) return;
	if (targetSlotIndex <= ENCOUNTER_DECK_SLOT_INDEX || targetSlotIndex >= ENCOUNTER_TOTAL_SLOTS) return;

	const sourceSlots = [...sourcePlayer.slots];
	const targetSlots = Array.isArray(targetEncounter.slots) ? [...targetEncounter.slots] : createEncounterSlots();

	const sourceCard = sourceSlots[sourceSlotIndex];
	if (!sourceCard) return;

	const targetCard = targetSlots[targetSlotIndex] || null;
	targetSlots[targetSlotIndex] = {
		instanceId: `enc_card_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
		cardId: sourceCard.id || sourceCard.instanceId || "card_unknown",
		faceDown: false
	};

	sourceSlots[sourceSlotIndex] = targetCard ? normalizeEncounterCardToPlayerCard(targetCard) : null;

	players[sourcePlayerId] = {
		...sourcePlayer,
		slots: sourceSlots
	};

	encounters[targetEncounterId] = {
		...targetEncounter,
		slots: targetSlots
	};

	store.setState({
		...state,
		players,
		encounters
	});
}

function normalizeEncounterCardToPlayerCard(encounterCard) {
	const cardRecord = getCardById(encounterCard.cardId);
	const card = cardRecord || {
		id: encounterCard.cardId || encounterCard.instanceId || window.CardComponent.buildCardId(),
		header: encounterCard.cardId || "Card",
		topText: "",
		image: window.CardComponent.DEFAULT_CARD_IMAGE,
		body: ""
	};

	return {
		instanceId: card.instanceId || `card_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
		id: card.id,
		header: card.header,
		topText: card.topText,
		image: card.image,
		body: card.body,
		name: card.name || card.header
	};
}

function drawTopCardFromActiveEncounterDeck() {
	const state = store.getState();
	const encounters = { ...state.encounters };
	const activeId = state.ui?.activeEncounterId;
	const encounter = encounters[activeId];

	if (!encounter) return;
	if (!Array.isArray(encounter.deckOrder) || !encounter.deckOrder.length) {
		alert("No cards remain in the active dungeon deck.");
		return;
	}

	const slots = Array.isArray(encounter.slots)
		? [...encounter.slots]
		: createEncounterSlots();

	let targetSlot = -1;
	for (let i = 1; i < ENCOUNTER_TOTAL_SLOTS; i++) {
		if (!slots[i]) {
			targetSlot = i;
			break;
		}
	}

	if (targetSlot === -1) {
		alert("Encounter grid is full.");
		return;
	}

	const deckOrder = [...encounter.deckOrder];
	const topCardId = deckOrder.shift();

	slots[targetSlot] = {
		instanceId: `enc_card_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
		cardId: topCardId,
		faceDown: true
	};

	encounters[activeId] = {
		...encounter,
		deckOrder,
		slots
	};

	store.update("encounters", encounters);
}

function toggleEncounterCardFace(slotIndex) {
	const state = store.getState();
	const encounters = { ...state.encounters };
	const activeId = state.ui?.activeEncounterId;
	const encounter = encounters[activeId];

	if (!encounter || slotIndex <= 0) return;

	const slots = Array.isArray(encounter.slots) ? [...encounter.slots] : createEncounterSlots();
	const cardState = slots[slotIndex];

	if (!cardState) return;

	slots[slotIndex] = {
		...cardState,
		faceDown: !cardState.faceDown
	};

	encounters[activeId] = {
		...encounter,
		slots
	};

	store.update("encounters", encounters);
}

function shuffleActiveEncounterDeck() {
	const state = store.getState();
	const encounters = { ...state.encounters };
	const activeId = state.ui?.activeEncounterId;
	const encounter = encounters[activeId];

	if (!encounter) return;
	if (!Array.isArray(encounter.deckOrder) || !encounter.deckOrder.length) {
		alert("No cards available to shuffle for this encounter deck.");
		return;
	}

	const deckOrder = [...encounter.deckOrder];
	shuffleInPlace(deckOrder);

	encounters[activeId] = {
		...encounter,
		deckOrder
	};

	store.update("encounters", encounters);
}

function applyDeckIdFromInput() {
	const deckInput = document.getElementById("encounterDeckIdInput");
	if (!deckInput) return;
	loadDeckForActiveEncounter(deckInput.value);
}

function loadDeckForActiveEncounter(rawDeckId) {
	const deckId = String(rawDeckId || "").trim();
	const state = store.getState();
	const activeId = state.ui?.activeEncounterId;

	if (!activeId) return;

	if (!deckId) {
		alert("Enter a deck id.");
		return;
	}

	const cardIds = getCardIdsForDeckId(deckId);

	if (!cardIds.length) {
		alert(`No cards found with deckId \"${deckId}\".`);
		return;
	}

	const encounters = { ...state.encounters };
	const encounter = encounters[activeId];

	if (!encounter) return;

	encounters[activeId] = {
		...encounter,
		deckId,
		deckOrder: [...cardIds],
		slots: createEncounterSlots()
	};

	store.update("encounters", encounters);
}

function addEncounter() {
	const state = store.getState();
	const encounters = { ...state.encounters };
	const nextNumber = getNextEncounterNumber(encounters);
	const id = `encounter_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

	encounters[id] = {
		id,
		number: nextNumber,
		name: `Encounter ${nextNumber}`,
		deckId: "",
		deckOrder: [],
		slots: createEncounterSlots()
	};

	store.update("encounters", encounters);
	setActiveEncounterId(id);
}

function deleteActiveEncounter() {
	const state = store.getState();
	const encounters = { ...state.encounters };
	const ids = Object.keys(encounters);

	if (ids.length <= 1) {
		alert("At least one encounter must remain.");
		return;
	}

	const activeId = state.ui?.activeEncounterId;
	if (!activeId || !encounters[activeId]) return;

	delete encounters[activeId];
	store.update("encounters", encounters);

	const ordered = Object.values(encounters).sort((a, b) => (Number(a.number) || 0) - (Number(b.number) || 0));
	if (ordered.length) {
		setActiveEncounterId(ordered[0].id);
	}
}

function updateEncounterName(rawName) {
	const state = store.getState();
	const activeId = state.ui?.activeEncounterId;
	if (!activeId) return;

	const encounters = { ...state.encounters };
	const encounter = encounters[activeId];
	if (!encounter) return;

	const name = String(rawName || "").trim();

	encounters[activeId] = {
		...encounter,
		name: name || encounter.name
	};

	store.update("encounters", encounters);
}

function ensureDefaultEncounters() {
	const state = store.getState();
	const encounters = state.encounters || {};
	const hasAny = Object.keys(encounters).length > 0;

	if (!hasAny) {
		resetToDefaultEncounters();
		return;
	}

	const ordered = getOrderedEncounters();
	if (!state.ui?.activeEncounterId || !encounters[state.ui.activeEncounterId]) {
		setActiveEncounterId(ordered.length ? ordered[0].id : null);
	}
}

function resetToDefaultEncounters() {
	const defaultEncounters = buildDefaultEncounters();
	store.update("encounters", defaultEncounters);
	setActiveEncounterId("encounter_1");
}

function buildDefaultEncounters() {
	return {
		encounter_1: {
			id: "encounter_1",
			number: 1,
			name: "Encounter 1",
			deckId: "",
			deckOrder: [],
			slots: createEncounterSlots()
		}
	};
}

function setActiveEncounterId(encounterId) {
	store.update("ui.activeEncounterId", encounterId || null);
}

function getOrderedEncounters() {
	const state = store.getState();
	return Object.values(state.encounters || {}).sort((a, b) => {
		return (Number(a.number) || 0) - (Number(b.number) || 0);
	});
}

function getActiveEncounterId(encounters) {
	const state = store.getState();
	const preferred = state.ui?.activeEncounterId;

	if (preferred && encounters.some(encounter => encounter.id === preferred)) {
		return preferred;
	}

	return encounters.length ? encounters[0].id : null;
}

function getEncounterById(encounterId) {
	const state = store.getState();
	return state.encounters?.[encounterId] || null;
}

function getCardById(cardId) {
	const state = store.getState();
	return state.cards?.[cardId] || null;
}

function createEncounterSlots() {
	return Array.from({ length: ENCOUNTER_TOTAL_SLOTS }, () => null);
}

function getAvailableDeckIds() {
	const state = store.getState();
	const cards = Object.values(state.cards || {});
	const seen = new Set();

	cards.forEach(card => {
		const deckId = String(card.deckId || "").trim();
		if (!deckId) return;
		seen.add(deckId);
	});

	return Array.from(seen).sort((a, b) => a.localeCompare(b));
}

function getCardIdsForDeckId(deckId) {
	const target = String(deckId || "").trim();
	if (!target) return [];

	const state = store.getState();
	const cards = Object.values(state.cards || {});

	return cards
		.filter(card => String(card.deckId || "").trim() === target)
		.sort((a, b) => {
			const byCreatedAt = (a.createdAt || 0) - (b.createdAt || 0);
			if (byCreatedAt !== 0) return byCreatedAt;
			return String(a.id || "").localeCompare(String(b.id || ""));
		})
		.map(card => card.id);
}

function getNextEncounterNumber(encounters) {
	const all = Object.values(encounters || {});
	if (!all.length) return 1;

	let maxNumber = 0;
	all.forEach(encounter => {
		const parsed = Number(encounter.number);
		if (!Number.isNaN(parsed) && parsed > maxNumber) {
			maxNumber = parsed;
		}
	});

	return maxNumber + 1;
}

function shuffleInPlace(items) {
	for (let i = items.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const temp = items[i];
		items[i] = items[j];
		items[j] = temp;
	}
}
