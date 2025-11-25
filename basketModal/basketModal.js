let basketItems;
//items-container

window.onload = async function () {
	// update basketItems
	await getOrInitBasketItems();

	const itemsContainer = document.getElementById("items-container");
	
	if (basketItems.length === 0) {
		itemsContainer.innerHTML = "<p>Le panier est vide.</p>";
	} else {
		basketItems.forEach((item, index) => {
			const itemDiv = document.createElement("div");
			itemDiv.className = "basket-item";
			itemDiv.innerHTML = `
				<h3>Élément ${index + 1}</h3>
				<p><strong>URL :</strong> ${item.url}</p>
				<p><strong>Texte sélectionné :</strong> ${item.selection}</p>
				<p><strong>Date :</strong> ${item.date}</p>
			`;
			itemsContainer.appendChild(itemDiv);
		});
	}
}

async function getOrInitBasketItems() {
	const stored = localStorage.getItem("basketItems");
	basketItems = stored ? JSON.parse(stored) : null;

	if (basketItems == null) {
		basketItems = [];
		localStorage.setItem("basketItems", JSON.stringify(basketItems));
		console.log("Valeur initialisée :", basketItems);
	} else {
		console.log("Valeur retrouvée :", basketItems);
	}
}
