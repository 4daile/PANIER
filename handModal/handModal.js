const params = new URLSearchParams(window.location.search);
const data = params.get("data");

let basketItems;
let parsedData;

if (data) {
	let urlElement = document.getElementById("page-url");
	let selectionElement = document.getElementById("selected-text");
	let dateElement = document.getElementById("date");

	parsedData = JSON.parse(decodeURIComponent(data));

	urlElement.value = parsedData.url;
	selectionElement.value = parsedData.selection;
	dateElement.value = parsedData.date;
}

window.onload = async function () {
    // update basketItems
    await getOrInitBasketItems();
    
	// if clicked on add to basket button
	const addToBasketButton = document.getElementById("add-to-basket");
	addToBasketButton.addEventListener("click", () => {
        basketItems.push(parsedData);
		localStorage.setItem("basketItems", JSON.stringify(basketItems));
		console.log("Valeur sauvegardée !");
		window.close();
	});

    // if click on cancel close the page
	const cancelButton = document.getElementById("cancel-button");
	cancelButton.addEventListener("click", () => {
		window.close();
	});
};

console.log("Affichage du modal");

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
