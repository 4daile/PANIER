let basketItems;
//items-container

window.onload = async function () {
	// update basketItems
	await getOrInitBasketItems();

	const itemsContainer = document.getElementById("items-container");
	console.log("items-container")
	
	if (basketItems.length === 0) {
		itemsContainer.innerHTML = "<p>Le panier est vide.</p>";
	} else {
		basketItems.forEach((item, index) => {
			const itemDiv = document.createElement("div");
			itemDiv.className = "basket-item";
			itemDiv.innerHTML = `
   				 <p>${item.selection}</p>
    			<p style="font-size:12px; color:#84994F;">${item.date}</p>
    			<p style="font-size:12px; color:#84994F;">${item.url}</p>
			`;
			itemsContainer.appendChild(itemDiv);
		});
	}
}

const containerWidth = itemsContainer.offsetWidth;
const containerHeight = itemsContainer.offsetHeight;

const x = Math.random() * (containerWidth - 250);
const y = Math.random() * (containerHeight - 120);

itemDiv.style.left = `${x}px`;
itemDiv.style.top = `${y}px`;

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
