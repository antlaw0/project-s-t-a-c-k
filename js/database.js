let cardPickerState = {
	isOpen: false,
	selectedCardId: null,
	searchTerm: "",
	lastFocusedElement: null
};

document.addEventListener("DOMContentLoaded", initializeDatabaseTab);

function initializeDatabaseTab() {
	const createCardBtn = document.getElementById("createCardBtn");

	if (createCardBtn) {
		createCardBtn.addEventListener("click", createDatabaseCard);
	}

	wireCardPickerModal();
	loadCardsFromDbJson();

	store.subscribe(() => {
		renderCardLibrary();
		if (cardPickerState.isOpen) {
			populatePlayerSelect();
			renderCardSearchResults();
		}
	});

	renderCardLibrary();
}

function createDatabaseCard() {
	const headerInput = document.getElementById("cardHeaderInput");
	const topTextInput = document.getElementById("cardTopTextInput");
	const imageInput = document.getElementById("cardImageInput");
	const bodyInput = document.getElementById("cardBodyInput");

	if (!headerInput || !topTextInput || !imageInput || !bodyInput) return;

	const rawImage = imageInput.value.trim();
	const card = window.CardComponent.createCardRecord({
		header: headerInput.value.trim(),
		topText: topTextInput.value.trim(),
		image: rawImage || window.CardComponent.DEFAULT_CARD_IMAGE,
		body: bodyInput.value
	});

	insertCardsIntoStore([card]);
	resetCardForm();
}

function resetCardForm() {
	const headerInput = document.getElementById("cardHeaderInput");
	const topTextInput = document.getElementById("cardTopTextInput");
	const imageInput = document.getElementById("cardImageInput");
	const bodyInput = document.getElementById("cardBodyInput");

	if (headerInput) headerInput.value = "";
	if (topTextInput) topTextInput.value = "";
	if (imageInput) imageInput.value = "";
	if (bodyInput) bodyInput.value = "";
}

function renderCardLibrary() {
	const libraryGrid = document.getElementById("cardLibraryGrid");
	const emptyNote = document.getElementById("cardLibraryEmptyNote");

	if (!libraryGrid || !emptyNote || !window.CardComponent) return;

	const cards = getAllCardsSorted();

	libraryGrid.innerHTML = "";
	emptyNote.style.display = cards.length ? "none" : "block";

	cards.forEach(card => {
		const wrap = document.createElement("article");
		wrap.className = "libraryCardWrap";

		const cardEl = window.CardComponent.createCardElement(card);

		const meta = document.createElement("div");
		meta.className = "libraryCardMeta";
		meta.textContent = `ID: ${card.id}`;

		wrap.appendChild(cardEl);
		wrap.appendChild(meta);
		libraryGrid.appendChild(wrap);
	});
}

function getAllCardsSorted() {
	const state = store.getState();

	return Object.values(state.cards || {}).sort((a, b) => {
		return (b.createdAt || 0) - (a.createdAt || 0);
	});
}

function insertCardsIntoStore(cardsToInsert) {
	const state = store.getState();
	const cards = { ...state.cards };

	cardsToInsert.forEach(card => {
		if (!card || !card.id) return;
		cards[card.id] = card;
	});

	store.update("cards", cards);
}

async function loadCardsFromDbJson() {
	try {
		const response = await fetch("./db.json", { cache: "no-store" });

		if (!response.ok) return;

		const data = await response.json();
		const sourceCards = Array.isArray(data.cards) ? data.cards : [];

		if (!sourceCards.length) return;

		const state = store.getState();
		const existing = state.cards || {};

		const mapped = sourceCards
			.map(mapDbJsonCardToRecord)
			.filter(card => card && !existing[card.id]);

		if (!mapped.length) return;

		insertCardsIntoStore(mapped);
	} catch (error) {
		console.error("Failed loading db.json", error);
	}
}

function mapDbJsonCardToRecord(source) {
	if (!source) return null;

	const name = String(source.name || "").trim();
	const header = name || String(source.header || "Untitled Card").trim();
	const topText = String(source.header || source.type || "").trim();
	const image = resolveDbImagePath(source.image);

	return window.CardComponent.createCardRecord({
		id: source.id || window.CardComponent.buildCardId(),
		header,
		topText,
		image,
		body: String(source.body || "")
	});
}

function resolveDbImagePath(imageValue) {
	const raw = String(imageValue || "").trim();

	if (!raw) return window.CardComponent.DEFAULT_CARD_IMAGE;

	if (raw.includes("/") || raw.includes("\\")) {
		return raw;
	}

	return `assets/images/${raw}`;
}

function wireCardPickerModal() {
	const overlay = document.getElementById("cardPickerModalOverlay");
	const searchInput = document.getElementById("cardSearchInput");
	const submitBtn = document.getElementById("cardPickerSubmitBtn");
	const cancelBtn = document.getElementById("cardPickerCancelBtn");
	const closeBtn = document.getElementById("cardPickerCloseBtn");

	if (!overlay || !searchInput || !submitBtn || !cancelBtn || !closeBtn) return;

	document.addEventListener("keydown", event => {
		if (event.key === "F3") {
			event.preventDefault();
			toggleCardPicker(true);
			return;
		}

		if (event.key === "Escape" && cardPickerState.isOpen) {
			event.preventDefault();
			toggleCardPicker(false);
			return;
		}

		if (event.key === "Tab" && cardPickerState.isOpen) {
			trapModalFocus(event);
		}
	});

	searchInput.addEventListener("input", event => {
		cardPickerState.searchTerm = event.target.value;
		renderCardSearchResults();
	});

	searchInput.addEventListener("keydown", event => {
		if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Enter") {
			return;
		}

		handleSearchInputKeys(event);
	});

	submitBtn.addEventListener("click", submitCardPickerSelection);
	cancelBtn.addEventListener("click", () => toggleCardPicker(false));
	closeBtn.addEventListener("click", () => toggleCardPicker(false));

	overlay.addEventListener("click", event => {
		if (event.target === overlay) {
			toggleCardPicker(false);
		}
	});
}

function toggleCardPicker(open) {
	const overlay = document.getElementById("cardPickerModalOverlay");
	const searchInput = document.getElementById("cardSearchInput");

	if (!overlay || !searchInput) return;

	if (open) {
		cardPickerState.isOpen = true;
		cardPickerState.lastFocusedElement = document.activeElement;
		cardPickerState.selectedCardId = null;
		cardPickerState.searchTerm = "";

		overlay.hidden = false;
		clearCardPickerStatus();
		searchInput.value = "";

		populatePlayerSelect();
		renderCardSearchResults();

		searchInput.focus();
		return;
	}

	cardPickerState.isOpen = false;
	overlay.hidden = true;

	if (cardPickerState.lastFocusedElement && typeof cardPickerState.lastFocusedElement.focus === "function") {
		cardPickerState.lastFocusedElement.focus();
	}
}

function renderCardSearchResults() {
	const resultsEl = document.getElementById("cardSearchResults");

	if (!resultsEl) return;

	const matches = getMatchingCards(cardPickerState.searchTerm);
	resultsEl.innerHTML = "";

	if (!matches.length) {
		const empty = document.createElement("div");
		empty.className = "libraryCardMeta";
		empty.textContent = "No cards match this search.";
		resultsEl.appendChild(empty);
		return;
	}

	matches.forEach((card, index) => {
		const option = document.createElement("button");
		option.type = "button";
		option.className = "cardSearchOption";
		option.role = "option";
		option.dataset.cardId = card.id;
		option.dataset.index = String(index);
		option.setAttribute("aria-selected", String(card.id === cardPickerState.selectedCardId));

		const primary = document.createElement("div");
		primary.className = "cardSearchPrimary";
		primary.textContent = card.header;

		const secondary = document.createElement("div");
		secondary.className = "cardSearchSecondary";
		secondary.textContent = `${card.topText || "No top text"} | ${card.id}`;

		option.appendChild(primary);
		option.appendChild(secondary);

		option.addEventListener("click", () => {
			cardPickerState.selectedCardId = card.id;
			renderCardSearchResults();
			setCardPickerStatus(`Selected card: ${card.header}`);
		});

		resultsEl.appendChild(option);
	});
}

function getMatchingCards(searchTerm) {
	const term = String(searchTerm || "").trim().toLowerCase();
	const cards = getAllCardsSorted();

	if (!term) {
		return cards.slice(0, 30);
	}

	return cards.filter(card => {
		const haystack = [
			card.id,
			card.header,
			card.topText,
			card.body
		].join(" ").toLowerCase();

		return haystack.includes(term);
	}).slice(0, 30);
}

function handleSearchInputKeys(event) {
	const options = Array.from(document.querySelectorAll(".cardSearchOption"));

	if (!options.length) return;

	const selectedIndex = options.findIndex(option => {
		return option.dataset.cardId === cardPickerState.selectedCardId;
	});

	if (event.key === "Enter") {
		event.preventDefault();

		if (selectedIndex >= 0) {
			options[selectedIndex].click();
			return;
		}

		options[0].click();
		return;
	}

	event.preventDefault();

	let nextIndex = 0;

	if (event.key === "ArrowDown") {
		nextIndex = selectedIndex < 0 ? 0 : Math.min(selectedIndex + 1, options.length - 1);
	}

	if (event.key === "ArrowUp") {
		nextIndex = selectedIndex <= 0 ? 0 : selectedIndex - 1;
	}

	const nextOption = options[nextIndex];
	if (!nextOption) return;

	nextOption.focus();
	nextOption.click();
}

function populatePlayerSelect() {
	const select = document.getElementById("cardTargetPlayerSelect");

	if (!select) return;

	const state = store.getState();
	const players = Object.values(state.players || {}).sort((a, b) => {
		return (Number(a.number) || 0) - (Number(b.number) || 0);
	});

	select.innerHTML = "";

	if (!players.length) {
		const option = document.createElement("option");
		option.value = "";
		option.textContent = "No players available";
		select.appendChild(option);
		select.disabled = true;
		return;
	}

	players.forEach(player => {
		const option = document.createElement("option");
		option.value = player.id;
		option.textContent = player.name;
		select.appendChild(option);
	});

	select.disabled = false;
}

function submitCardPickerSelection() {
	const state = store.getState();
	const cards = state.cards || {};
	const selectedCard = cards[cardPickerState.selectedCardId];
	const targetPlayerSelect = document.getElementById("cardTargetPlayerSelect");

	if (!selectedCard) {
		setCardPickerStatus("Select a card before submitting.");
		return;
	}

	if (!targetPlayerSelect || !targetPlayerSelect.value) {
		setCardPickerStatus("Select a target player before submitting.");
		return;
	}

	if (!window.PlayersAPI || typeof window.PlayersAPI.addCardToPlayer !== "function") {
		setCardPickerStatus("Players system is not available.");
		return;
	}

	const success = window.PlayersAPI.addCardToPlayer(targetPlayerSelect.value, selectedCard);

	if (!success) {
		setCardPickerStatus("Unable to add card. The target player inventory may be full.");
		return;
	}

	setCardPickerStatus(`Card sent: ${selectedCard.header}`);
	toggleCardPicker(false);
}

function setCardPickerStatus(message) {
	const statusEl = document.getElementById("cardPickerStatus");
	if (!statusEl) return;
	statusEl.textContent = message;
}

function clearCardPickerStatus() {
	setCardPickerStatus("");
}

function trapModalFocus(event) {
	const modal = document.getElementById("cardPickerModal");
	if (!modal) return;

	const selectors = [
		"button:not([disabled])",
		"input:not([disabled])",
		"select:not([disabled])",
		"textarea:not([disabled])",
		"[tabindex]:not([tabindex='-1'])"
	];

	const focusable = Array.from(modal.querySelectorAll(selectors.join(",")));
	if (!focusable.length) return;

	const first = focusable[0];
	const last = focusable[focusable.length - 1];
	const active = document.activeElement;

	if (event.shiftKey && active === first) {
		event.preventDefault();
		last.focus();
		return;
	}

	if (!event.shiftKey && active === last) {
		event.preventDefault();
		first.focus();
	}
}