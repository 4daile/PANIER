// ============================================================
// BOXVIEW.JS — Vue boîtes pour PANIER
// ============================================================
// À inclure dans basketModal.html APRÈS boxes.js et basketstyle.js
// <script src="boxes.js"></script>
// <script src="basketstyle.js"></script>
// <script src="boxview.js"></script>
// ============================================================


// ______________________________
// ÉTAT DE NAVIGATION
// ______________________________
// Garde en mémoire si on est dans une boîte ou dans la vue grille

let currentBoxId = null; // null = vue grille, string = vue détail d'une boîte


// ______________________________
// BOUTON BOÎTE
// ______________________________

let boxButton = document.getElementById("box");
boxButton.addEventListener("click", function () {
    currentBoxId = null;
    arrangeItemsByBox();
});


// ______________________________
// RECHARGEMENT DES FRAGMENTS DEPUIS LE LOCALSTORAGE
// ______________________________
// Quand on revient de la vue boîte vers nuage ou liste,
// le container a été vidé par showBoxDetail().
// Cette fonction recrée tous les .basket-item dans le DOM
// avant que positionItemsRandomly() ou arrangeItemsChronologically()
// ne les manipulent.

function reloadFragmentsIntoDOM() {
    const itemsContainer = document.getElementById("items-container");
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


// ______________________________
// VUE GRILLE — toutes les boîtes
// ______________________________

function arrangeItemsByBox() {
    const itemsContainer = document.getElementById("items-container");

    // Réinitialise le conteneur
    itemsContainer.innerHTML = "";
    itemsContainer.style.position = "static";
    itemsContainer.style.display = "grid";
    itemsContainer.style.gridTemplateColumns = "repeat(auto-fill, minmax(220px, 1fr))";
    itemsContainer.style.gap = "20px";
    itemsContainer.style.padding = "40px";
    itemsContainer.style.alignItems = "start";

    const boxes = getSortedBoxes(); // favoris en premier, puis par date

    if (boxes.length === 0) {
        itemsContainer.innerHTML = `<p class="empty-message">Aucune boîte pour l'instant.</p>`;
        return;
    }

    boxes.forEach(box => {
        const card = createBoxCard(box);
        itemsContainer.appendChild(card);
    });
}


// ______________________________
// CARTE D'UNE BOÎTE
// ______________________________

function createBoxCard(box) {
    const count = countFragmentsByBox(box.id);
    const date  = new Date(box.createdAt).toLocaleDateString("fr-FR", {
        day: "2-digit", month: "long", year: "numeric"
    });

    const card = document.createElement("div");
    card.classList.add("box-card");
    card.dataset.boxId = box.id;

    // Visuel : image de couverture ou couleur
    const cover = document.createElement("div");
    cover.classList.add("box-cover");
    if (box.cover) {
        cover.style.backgroundImage = `url(${box.cover})`;
        cover.style.backgroundSize  = "cover";
        cover.style.backgroundPosition = "center";
    } else {
        cover.style.backgroundColor = box.color;
    }

    // Étoile favori
    if (box.favorite) {
        const star = document.createElement("span");
        star.classList.add("box-favorite-star");
        star.textContent = "★";
        cover.appendChild(star);
    }

    // Infos texte
    const info = document.createElement("div");
    info.classList.add("box-info");
    info.innerHTML = `
        <strong class="box-name">${box.name}</strong>
        <span class="box-meta">${count} fragment${count !== 1 ? "s" : ""}</span>
        <span class="box-meta">${date}</span>
    `;

    card.appendChild(cover);
    card.appendChild(info);

    // Clic → vue détail
    card.addEventListener("click", function () {
        currentBoxId = box.id;
        showBoxDetail(box.id);
    });

    return card;
}


// ______________________________
// VUE DÉTAIL — fragments d'une boîte
// ______________________________

function showBoxDetail(boxId) {
    const box       = getBoxById(boxId);
    const fragments = getFragmentsByBox(boxId);
    const itemsContainer = document.getElementById("items-container");

    // Réinitialise le conteneur
    itemsContainer.innerHTML = "";
    itemsContainer.style.position = "static";
    itemsContainer.style.display  = "block";
    itemsContainer.style.padding  = "40px";

    // — En-tête de la boîte —
    const header = document.createElement("div");
    header.classList.add("box-detail-header");

    // Bouton retour
    const backBtn = document.createElement("button");
    backBtn.classList.add("box-back-btn");
    backBtn.textContent = "← retour";
    backBtn.addEventListener("click", function () {
        currentBoxId = null;
        arrangeItemsByBox();
    });

    // Titre + meta
    const titleBlock = document.createElement("div");
    titleBlock.classList.add("box-detail-title-block");

    const count = countFragmentsByBox(boxId);
    const date  = new Date(box.createdAt).toLocaleDateString("fr-FR", {
        day: "2-digit", month: "long", year: "numeric"
    });

    titleBlock.innerHTML = `
        <h2 class="box-detail-name">${box.name}</h2>
        ${box.description ? `<p class="box-detail-desc">${box.description}</p>` : ""}
        <span class="box-meta">${count} fragment${count !== 1 ? "s" : ""} · ${date}</span>
    `;

    // Actions (modifier + supprimer)
    const actions = document.createElement("div");
    actions.classList.add("box-detail-actions");

    const editBtn = document.createElement("button");
    editBtn.classList.add("box-action-btn");
    editBtn.textContent = "modifier";
    editBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        openEditBoxModal(boxId);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("box-action-btn", "box-action-btn--delete");
    deleteBtn.textContent = "supprimer";
    deleteBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (confirm(`Supprimer la boîte "${box.name}" ? Les fragments seront conservés dans le panier.`)) {
            deleteBox(boxId);
            currentBoxId = null;
            arrangeItemsByBox();
        }
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    header.appendChild(backBtn);
    header.appendChild(titleBlock);
    header.appendChild(actions);
    itemsContainer.appendChild(header);

    // — Image de couverture —
    if (box.cover) {
        const coverImg = document.createElement("div");
        coverImg.classList.add("box-detail-cover");
        coverImg.style.backgroundImage    = `url(${box.cover})`;
        coverImg.style.backgroundSize     = "cover";
        coverImg.style.backgroundPosition = "center";
        itemsContainer.appendChild(coverImg);
    }

    // — Fragments —
    const fragmentsGrid = document.createElement("div");
    fragmentsGrid.classList.add("box-fragments-grid");

    if (fragments.length === 0) {
        fragmentsGrid.innerHTML = `<p class="empty-message">Cette boîte est vide.</p>`;
    } else {
        fragments.forEach(fragment => {
            const card = document.createElement("div");
            card.classList.add("basket-item");
            card.innerHTML = `
                <p>${fragment.selection}</p>
                <p>${new Date(fragment.date).toLocaleDateString("fr-FR")}</p>
                <p><a href="${fragment.url}" target="_blank">${fragment.url}</a></p>
            `;
            fragmentsGrid.appendChild(card);
        });
    }

    itemsContainer.appendChild(fragmentsGrid);
}


// ______________________________
// MODALE MODIFIER UNE BOÎTE
// ______________________________
// Pour l'instant elle est générée dynamiquement en JS.
// Tu pourras la remplacer par une vraie modale HTML plus tard.

function openEditBoxModal(boxId) {
    const box = getBoxById(boxId);
    if (!box) return;

    // Supprime une éventuelle modale déjà ouverte
    const existing = document.getElementById("edit-box-modal");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "edit-box-modal";
    overlay.classList.add("modal-overlay");

    overlay.innerHTML = `
        <div class="modal-box">
            <h3 class="modal-title">Modifier</h3>
            <hr class="modal-sep">

            <label class="modal-label">Titre</label>
            <input class="modal-input" id="edit-box-name" type="text" value="${box.name}" />

            <label class="modal-label">Description</label>
            <textarea class="modal-textarea" id="edit-box-desc">${box.description}</textarea>

            <label class="modal-label">Image de couverture</label>
            <input class="modal-input" id="edit-box-cover" type="file" accept="image/*" />

            <label class="modal-label">Couleur</label>
            <div class="modal-colors" id="edit-box-colors">
                ${BOX_COLORS.map(c => `
                    <span class="color-dot ${box.color === c ? "selected" : ""}"
                          style="background:${c}"
                          data-color="${c}"></span>
                `).join("")}
            </div>

            <hr class="modal-sep">
            <div class="modal-footer">
                <button class="modal-btn modal-btn--delete" id="edit-box-delete">supprimer la boîte</button>
                <span class="modal-warning">attention ! action irréversible</span>
            </div>
            <div class="modal-footer modal-footer--right">
                <button class="modal-btn modal-btn--cancel" id="edit-box-cancel">annuler</button>
                <button class="modal-btn modal-btn--save" id="edit-box-save">enregistrer</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // ⚠️ On utilise overlay.querySelector() et non document.getElementById()
    // pour être sûr que les éléments sont bien dans cette modale-ci.

    // Sélection de couleur
    let selectedColor = box.color;
    overlay.querySelectorAll(".color-dot").forEach(dot => {
        dot.addEventListener("click", function () {
            overlay.querySelectorAll(".color-dot").forEach(d => d.classList.remove("selected"));
            this.classList.add("selected");
            selectedColor = this.dataset.color;
        });
    });

    // Image de couverture
let newCover = box.cover;

// Aperçu de l'image actuelle
const preview = document.createElement("div");
preview.id = "cover-preview";
preview.style.cssText = `
    width: 100%; height: 80px;
    background-size: cover; background-position: center;
    border-radius: 2px; margin-bottom: 8px;
    background-color: ${box.color};
`;
if (box.cover) preview.style.backgroundImage = `url(${box.cover})`;

// Insère l'aperçu avant l'input file
const fileInput = overlay.querySelector("#edit-box-cover");
fileInput.parentNode.insertBefore(preview, fileInput);

fileInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        newCover = e.target.result;
        preview.style.backgroundImage = `url(${newCover})`;
        preview.style.backgroundColor = "";
        console.log("Image chargée ✓", newCover.substring(0, 40));
    };
    reader.onerror = function() {
        console.error("Erreur lecture fichier");
    };
    reader.readAsDataURL(file);
});

    // Annuler
    overlay.querySelector("#edit-box-cancel").addEventListener("click", function () {
        overlay.remove();
    });

    // Enregistrer
    overlay.querySelector("#edit-box-save").addEventListener("click", function () {
        const newName = overlay.querySelector("#edit-box-name").value.trim();
        const newDesc = overlay.querySelector("#edit-box-desc").value.trim();
        if (!newName) { alert("Le nom est obligatoire."); return; }

        updateBox(boxId, {
            name:        newName,
            description: newDesc,
            color:       selectedColor,
            cover:       newCover,
        });

        overlay.remove();
        showBoxDetail(boxId); // rafraîchit la vue
    });

    // Supprimer
    overlay.querySelector("#edit-box-delete").addEventListener("click", function () {
        if (confirm(`Supprimer la boîte "${box.name}" ? Les fragments seront conservés dans le panier.`)) {
            deleteBox(boxId);
            overlay.remove();
            currentBoxId = null;
            arrangeItemsByBox();
        }
    });

    // Clic en dehors = ferme
    overlay.addEventListener("click", function (e) {
        if (e.target === overlay) overlay.remove();
    });
}