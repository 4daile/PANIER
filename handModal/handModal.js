// ============================================================
// HANDMODAL.JS — Modal de cueillette avec sélection de boîtes
// ============================================================

const params = new URLSearchParams(window.location.search);
const data   = params.get("data");

let basketItems;
let parsedData;

if (data) {
    parsedData = JSON.parse(decodeURIComponent(data));

    document.getElementById("page-url").value      = parsedData.url;
    document.getElementById("selected-text").value = parsedData.selection;
    document.getElementById("date").value          = parsedData.date;
}

// ______________________________
// ÉTAT — boîtes sélectionnées
// ______________________________

let selectedBoxIds = []; // tableau des IDs cochés par l'utilisateur


// ______________________________
// INIT AU CHARGEMENT
// ______________________________

window.onload = async function () {
    await getOrInitBasketItems();
    renderBoxList();

    // — Bouton Ajouter au panier —
    document.getElementById("add-to-basket").addEventListener("click", () => {
        const newFragment = {
            ...parsedData,
            boxIds: selectedBoxIds, // tableau, peut être vide
        };
        basketItems.push(newFragment);
        localStorage.setItem("basketItems", JSON.stringify(basketItems));
        console.log("Fragment enregistré :", newFragment);
        window.close();
    });

    // — Bouton Annuler —
    document.getElementById("cancel-button").addEventListener("click", () => {
        window.close();
    });
};


// ______________________________
// AFFICHAGE DE LA LISTE DES BOÎTES
// ______________________________

function renderBoxList() {
    const boxes     = getBoxes(); // depuis boxes.js
    const container = document.getElementById("box-list");
    container.innerHTML = "";

    if (boxes.length === 0) {
        // Pas encore de boîtes — on affiche juste le bouton créer
        document.getElementById("box-section-title").textContent = "Enregistrer dans une boîte";
        return;
    }

    boxes.forEach(box => {
        const row = document.createElement("label");
        row.classList.add("box-row");

        const checkbox = document.createElement("input");
        checkbox.type  = "checkbox";
        checkbox.value = box.id;
        checkbox.classList.add("box-checkbox");

        // Pré-coche si déjà sélectionné (utile si on rouvre la modale)
        if (selectedBoxIds.includes(box.id)) checkbox.checked = true;

        checkbox.addEventListener("change", function () {
            if (this.checked) {
                selectedBoxIds.push(box.id);
            } else {
                selectedBoxIds = selectedBoxIds.filter(id => id !== box.id);
            }
        });

        // Pastille de couleur
        const dot = document.createElement("span");
        dot.classList.add("box-color-dot");
        dot.style.backgroundColor = box.color;

        const name = document.createElement("span");
        name.classList.add("box-row-name");
        name.textContent = box.name;

        row.appendChild(checkbox);
        row.appendChild(dot);
        row.appendChild(name);
        container.appendChild(row);
    });
}


// ______________________________
// CRÉATION INLINE D'UNE NOUVELLE BOÎTE
// ______________________________

document.getElementById("create-box-btn").addEventListener("click", function () {
    toggleNewBoxInput(true);
});

document.getElementById("new-box-cancel").addEventListener("click", function () {
    toggleNewBoxInput(false);
});

document.getElementById("new-box-confirm").addEventListener("click", function () {
    const name = document.getElementById("new-box-name").value.trim();
    if (!name) return;

    const newBox = createBox(name); // depuis boxes.js — couleur aléatoire
    selectedBoxIds.push(newBox.id); // on la coche automatiquement

    toggleNewBoxInput(false);
    renderBoxList();

    // Re-coche la nouvelle boîte dans la liste fraîchement rendue
    const checkbox = document.querySelector(`.box-checkbox[value="${newBox.id}"]`);
    if (checkbox) checkbox.checked = true;
});

// Validation au clavier dans le champ
document.getElementById("new-box-name").addEventListener("keydown", function (e) {
    if (e.key === "Enter")  document.getElementById("new-box-confirm").click();
    if (e.key === "Escape") toggleNewBoxInput(false);
});

function toggleNewBoxInput(show) {
    const form = document.getElementById("new-box-form");
    const btn  = document.getElementById("create-box-btn");
    form.style.display = show ? "flex" : "none";
    btn.style.display  = show ? "none" : "flex";
    if (show) document.getElementById("new-box-name").focus();
    else document.getElementById("new-box-name").value = "";
}


// ______________________________
// INIT LOCALSTORAGE
// ______________________________

async function getOrInitBasketItems() {
    const stored = localStorage.getItem("basketItems");
    basketItems  = stored ? JSON.parse(stored) : [];

    if (!stored) {
        localStorage.setItem("basketItems", JSON.stringify(basketItems));
        console.log("basketItems initialisé.");
    } else {
        console.log("basketItems récupéré :", basketItems);
    }
}