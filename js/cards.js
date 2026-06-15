const DEFAULT_CARD_IMAGE = "assets/images/default.png";

function createCardElement(cardData, options = {}) {
	const card = normalizeCardData(cardData);

	const root = document.createElement("article");
	root.className = options.className || "gameCard";
	root.dataset.cardId = card.id;
	root.dataset.compact = options.compact ? "true" : "false";

	if (options.draggable) {
		root.draggable = true;
	}

	const header = document.createElement("div");
	header.className = "gameCardHeader";
	header.textContent = card.header;

	const topText = document.createElement("div");
	topText.className = "gameCardTopText";
	topText.textContent = card.topText;

	const imageWrap = document.createElement("div");
	imageWrap.className = "gameCardImageWrap";

	const image = document.createElement("img");
	image.className = "gameCardImage";
	image.alt = card.header;
	image.src = card.image;
	image.draggable = false;
	image.setAttribute("draggable", "false");
	image.addEventListener("error", () => {
		if (image.src.endsWith(DEFAULT_CARD_IMAGE)) return;
		image.src = DEFAULT_CARD_IMAGE;
	});

	const body = document.createElement("div");
	body.className = "gameCardBody";
	body.textContent = card.body;

	imageWrap.appendChild(image);
	root.appendChild(header);
	root.appendChild(topText);
	root.appendChild(imageWrap);
	root.appendChild(body);

	return root;
}

function normalizeCardData(cardData) {
	const raw = cardData || {};

	return {
		id: raw.id || raw.instanceId || buildCardId(),
		header: raw.header || raw.name || "Untitled Card",
		topText: raw.topText || "",
		image: resolveCardImage(raw.image),
		body: raw.body || raw.bodyText || ""
	};
}

function resolveCardImage(imagePath) {
	const path = String(imagePath || "").trim();

	if (!path) return DEFAULT_CARD_IMAGE;

	if (!/\.(png|jpg|jpeg)$/i.test(path)) {
		return DEFAULT_CARD_IMAGE;
	}

	return path;
}

function createCardRecord(fields) {
	const normalized = normalizeCardData(fields);

	return {
		id: normalized.id,
		header: normalized.header,
		topText: normalized.topText,
		image: normalized.image,
		body: normalized.body,
		createdAt: Date.now()
	};
}

function buildCardId() {
	return `card_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

window.CardComponent = {
	DEFAULT_CARD_IMAGE,
	createCardElement,
	createCardRecord,
	normalizeCardData,
	buildCardId
};
