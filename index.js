// ajout un élément de menu contextuel (menu clic-droit)
chrome.contextMenus.create({
	id: "ceuillir",
	title: "Ceuillir",
	contexts: ["all"],
});

// s'excécute lors du clic sur un élément de menu contextuel

// ajout un élément de menu contextuel (menu clic-droit)
chrome.contextMenus.create({
	id: "panier",
	title: "Afficher le panier",
	contexts: ["all"],
});

// s'excécute lors du clic sur un élément de menu contextuel
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
		console.log(info);
	// 	//exemple d'objet retourné
	// 	// {
	// 	//     "editable": false,
	// 	//     "frameId": 0,
	// 	//     "frameUrl": "https://fr.wikipedia.org/wiki/Wikip%C3%A9dia:Accueil_principal",
	// 	//     "menuItemId": "selection",
	// 	//     "pageUrl": "https://fr.wikipedia.org/wiki/Wikip%C3%A9dia:Accueil_principal",
	// 	//     "selectionText": "Wikipédia est un projet d’encyclopédie collective en ligne, universelle, multilingue et fonctionnant sur le principe du wiki. Ce projet vise à offrir un contenu librement réutilisable, objectif et vérifiable, que chacun peut modifier et améliorer."
	// 	// }

	// reconnaitre les id des éléments de menu
	if (info.menuItemId === "panier") {
		chrome.windows.create({
			url: chrome.runtime.getURL("basketModal/basketModal.html"),
			type: "popup",
			width: 400,
			height: 600,
		});
	}

	if (info.menuItemId === "ceuillir") {
		console.log("Affichage du modal");
		console.log(info.pageUrl);
		console.log(info.selectionText);
		
		let data = {
			url: info.pageUrl,
			selection: info.selectionText,
			date: new Date().toISOString(),
		}

		data = encodeURIComponent(JSON.stringify(data));

		chrome.windows.create({
			url: chrome.runtime.getURL("handModal/handModal.html?data=" + data),
			type: "popup",
			width: 400,
			height: 600,
		});
	}
});
