document.addEventListener("DOMContentLoaded", initializeTabs);

function initializeTabs() {
	const tabButtons = document.querySelectorAll(".tabButton");
	const newGameBtn = document.getElementById("newGameBtn");

	tabButtons.forEach(button => {
		button.addEventListener("click", () => {
			const tabId = button.dataset.tab;

			if (!tabId) return;

			activateTab(tabId);
		});
	});

	if (newGameBtn) {
		newGameBtn.addEventListener("click", () => {
			document.dispatchEvent(new CustomEvent("game:new"));
		});
	}
}

function activateTab(tabId) {
	const tabButtons = document.querySelectorAll(".tabButton");
	const tabPanels = document.querySelectorAll(".tabPanel");

	tabButtons.forEach(button => {
		const isActive = button.dataset.tab === tabId;
		button.classList.toggle("active", isActive);
	});

	tabPanels.forEach(panel => {
		panel.classList.toggle("active", panel.id === tabId);
	});
}