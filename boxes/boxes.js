// ============================================================
// BOXES.JS — Gestion des boîtes pour l'extension PANIER
// ============================================================
// Dépendances : aucune (vanilla JS, localStorage uniquement)
// À inclure dans basketModal.html ET handModal.html
// ============================================================

// ----------------------------
// PALETTE DE COULEURS PAR DÉFAUT
// ----------------------------
// Utilisée si l'utilisateur ne choisit pas de couleur ni d'image de couverture

const BOX_COLORS = [
    "#C9B59C",
    "#CDCC88",
    "#84994F",
    "#703B3B",
    "#E1B3BA",
    "#afc669",
    "#d8dfa3",
];

function getRandomColor() {
    return BOX_COLORS[Math.floor(Math.random() * BOX_COLORS.length)];
}


// ============================================================
// CRUD — BOÎTES
// ============================================================

// ----------------------------
// Lire toutes les boîtes
// ----------------------------

function getBoxes() {
    const stored = localStorage.getItem("boxes");
    return stored ? JSON.parse(stored) : [];
}

// ----------------------------
// Sauvegarder toutes les boîtes (usage interne)
// ----------------------------

function saveBoxes(boxes) {
    localStorage.setItem("boxes", JSON.stringify(boxes));
}

// ----------------------------
// Créer une nouvelle boîte
// ----------------------------
// Paramètres :
//   name        (string, obligatoire) — nom de la boîte
//   description (string, optionnel)   — texte libre
//   color       (string, optionnel)   — couleur hex, sinon aléatoire
//   cover       (string, optionnel)   — image en base64 (via FileReader)
//
// Retourne l'objet boîte créé

function createBox(name, description = "", color = null, cover = null) {
    if (!name || name.trim() === "") {
        console.warn("createBox : le nom est obligatoire.");
        return null;
    }

    const newBox = {
        id:          crypto.randomUUID(),   // identifiant unique
        name:        name.trim(),
        description: description.trim(),
        color:       color || getRandomColor(),
        cover:       cover,                 // base64 string ou null
        favorite:    false,
        createdAt:   new Date().toISOString(),
    };

    const boxes = getBoxes();
    boxes.push(newBox);
    saveBoxes(boxes);

    console.log("Boîte créée :", newBox);
    return newBox;
}

// ----------------------------
// Lire une boîte par son ID
// ----------------------------

function getBoxById(id) {
    return getBoxes().find(box => box.id === id) || null;
}

// ----------------------------
// Modifier une boîte existante
// ----------------------------
// Paramètres :
//   id      (string) — ID de la boîte à modifier
//   updates (object) — champs à mettre à jour, ex: { name: "...", color: "..." }
//
// Retourne la boîte modifiée, ou null si introuvable

function updateBox(id, updates) {
    const boxes = getBoxes();
    const index = boxes.findIndex(box => box.id === id);

    if (index === -1) {
        console.warn("updateBox : boîte introuvable pour l'id", id);
        return null;
    }

    // On fusionne les champs, sans écraser l'id ni la date de création
    boxes[index] = {
        ...boxes[index],
        ...updates,
        id:        boxes[index].id,
        createdAt: boxes[index].createdAt,
    };

    saveBoxes(boxes);
    console.log("Boîte modifiée :", boxes[index]);
    return boxes[index];
}

// ----------------------------
// Supprimer une boîte
// ----------------------------
// Par défaut, les fragments liés à cette boîte ne sont PAS supprimés :
// leur boxId devient null (ils retournent dans le panier général).
// Pour supprimer aussi les fragments, passer deleteFragments = true.

function deleteBox(id, deleteFragments = false) {
    const boxes = getBoxes();
    const filtered = boxes.filter(box => box.id !== id);

    if (filtered.length === boxes.length) {
        console.warn("deleteBox : boîte introuvable pour l'id", id);
        return false;
    }

    saveBoxes(filtered);

    // Mise à jour des fragments liés
    const items = getBasketItems();
    const updatedItems = items.map(item => {
        const ids = item.boxIds || [];
        if (!ids.includes(id)) return item;
        if (deleteFragments) return null;
        return { ...item, boxIds: ids.filter(bid => bid !== id) }; // on détache
    }).filter(Boolean);

    saveBasketItems(updatedItems);

    console.log(`Boîte ${id} supprimée. Fragments ${deleteFragments ? "supprimés" : "détachés"}.`);
    return true;
}

// ----------------------------
// Mettre en favori / retirer des favoris
// ----------------------------

function toggleFavoriteBox(id) {
    const box = getBoxById(id);
    if (!box) return null;
    return updateBox(id, { favorite: !box.favorite });
}


// ============================================================
// CRUD — FRAGMENTS (helpers pour boxes.js)
// ============================================================
// Ces fonctions centralisent la lecture/écriture des fragments
// pour éviter de dupliquer la logique dans plusieurs fichiers.

function getBasketItems() {
    const stored = localStorage.getItem("basketItems");
    return stored ? JSON.parse(stored) : [];
}

function saveBasketItems(items) {
    localStorage.setItem("basketItems", JSON.stringify(items));
}

// ----------------------------
// Recréer les .basket-item dans le DOM depuis localStorage
// ----------------------------
// Appelée par positionItemsRandomly() et arrangeItemsChronologically()
// pour reconstruire le DOM quand on revient de la vue boîte.

function reloadFragmentsIntoDOM() {
    const itemsContainer = document.getElementById("items-container");
    if (!itemsContainer) return;
    itemsContainer.innerHTML = "";

    const items = getBasketItems();
    items.forEach(item => {
        const el = document.createElement("div");
        el.classList.add("basket-item");
        el.innerHTML = `
            <p>${item.selection}</p>
            <p>${new Date(item.date).toLocaleDateString("fr-FR")}</p>
            <p><a href="${item.url}" target="_blank">${item.url}</a></p>
        `;
        itemsContainer.appendChild(el);
    });
}

// ----------------------------
// Lier un fragment à une (ou plusieurs) boîte(s)
// ----------------------------
// fragmentIndex : position dans basketItems
// boxId         : ID de la boîte à ajouter
// Si la boîte est déjà dans boxIds, on ne la duplique pas.

function assignFragmentToBox(fragmentIndex, boxId) {
    const items = getBasketItems();

    if (fragmentIndex < 0 || fragmentIndex >= items.length) {
        console.warn("assignFragmentToBox : index invalide", fragmentIndex);
        return false;
    }

    const item = items[fragmentIndex];
    const ids  = item.boxIds || [];
    if (!ids.includes(boxId)) {
        item.boxIds = [...ids, boxId];
    }
    saveBasketItems(items);
    return true;
}

// ----------------------------
// Retirer un fragment d'une boîte
// ----------------------------

function removeFragmentFromBox(fragmentIndex, boxId) {
    const items = getBasketItems();

    if (fragmentIndex < 0 || fragmentIndex >= items.length) return false;

    const item  = items[fragmentIndex];
    item.boxIds = (item.boxIds || []).filter(id => id !== boxId);
    saveBasketItems(items);
    return true;
}

// ----------------------------
// Récupérer tous les fragments d'une boîte
// ----------------------------

function getFragmentsByBox(boxId) {
    return getBasketItems().filter(item => (item.boxIds || []).includes(boxId));
}

// ----------------------------
// Récupérer les fragments sans boîte
// ----------------------------

function getUnboxedFragments() {
    return getBasketItems().filter(item => !item.boxIds || item.boxIds.length === 0);
}


// ============================================================
// UTILITAIRES D'AFFICHAGE
// ============================================================

// ----------------------------
// Compter les fragments d'une boîte
// ----------------------------

function countFragmentsByBox(boxId) {
    return getFragmentsByBox(boxId).length;
}

// ----------------------------
// Trier les boîtes (favoris en premier, puis par date)
// ----------------------------

function getSortedBoxes() {
    return getBoxes().sort((a, b) => {
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
}


// ============================================================
// GESTION DE L'IMAGE DE COUVERTURE
// ============================================================
// À appeler sur un <input type="file"> dans ta modale de création.
// Convertit l'image en base64 pour la stocker dans localStorage.
//
// Exemple d'utilisation :
//   const input = document.getElementById("cover-input");
//   input.addEventListener("change", function() {
//       readCoverImage(this, function(base64) {
//           console.log("Image prête :", base64.substring(0, 30) + "...");
//           // stocke base64 dans ta variable locale avant createBox()
//       });
//   });

function readCoverImage(inputElement, callback) {
    const file = inputElement.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        callback(e.target.result); // e.target.result = base64 string
    };
    reader.readAsDataURL(file);
}


// ============================================================
// DONNÉES DE TEST — à supprimer quand tout fonctionne
// ============================================================
// Appelle initTestData() dans la console du navigateur pour
// peupler localStorage avec des boîtes et fragments de test.

function initTestData() {
    // Nettoie tout
    localStorage.removeItem("boxes");
    localStorage.removeItem("basketItems");

    // Crée 3 boîtes
    const b1 = createBox("Articles random",  "Des articles trouvés au hasard", "#C9B59C");
    const b2 = createBox("mémoire",          "Recherches pour mon mémoire",    "#84994F");
    const b3 = createBox("blablabla",        "",                                null); // couleur aléatoire

    // Crée quelques fragments liés aux boîtes
    const items = [
        { selection: "Le design est une forme de langage.", url: "https://example.com", date: new Date().toISOString(), boxIds: [b1.id] },
        { selection: "La mémoire est une reconstruction.", url: "https://example.com/2", date: new Date().toISOString(), boxIds: [b2.id] },
        { selection: "Fragment dans deux boîtes.", url: "https://example.com/3", date: new Date().toISOString(), boxIds: [b1.id, b3.id] },
        { selection: "Fragment sans boîte.", url: "https://example.com/4", date: new Date().toISOString(), boxIds: [] },
    ];
    saveBasketItems(items);

    console.log("Données de test initialisées ✓");
    console.log("Boîtes :", getBoxes());
    console.log("Fragments :", getBasketItems());
}