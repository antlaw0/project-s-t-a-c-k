// Temporary file with the corrected renderCardSearchResults function

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

	let selectedButton = null;

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

		// Handle arrow keys and Enter within search results
		option.addEventListener("keydown", event => {
			if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter") {
				handleSearchOptionKeys(event);
			}
		});

		resultsEl.appendChild(option);

		// Track the selected button to focus it after all buttons are created
		if (card.id === cardPickerState.selectedCardId) {
			selectedButton = option;
		}
	});

	// Restore focus to the selected button
	if (selectedButton) {
		selectedButton.focus();
	}
}
