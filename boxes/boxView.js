// ============================================================
// BOXVIEW.JS — Vue boîtes pour PANIER
// Zéro style inline — tout est dans boxView.css
// ============================================================

let currentBoxId = null;

// ______________________________
// BOUTON BOÎTE — gérée par basketstyle.js
// (auto-listener retiré pour éviter les doublons)
// ______________________________

// ______________________________
// RECHARGEMENT DES FRAGMENTS
// ______________________________

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
    itemsContainer.innerHTML = "";
    itemsContainer.className = "container--grid"; // ← classe CSS, pas de style inline

    const boxes = getSortedBoxes();

    if (boxes.length === 0) {
        itemsContainer.innerHTML = `<p class="empty-message">Aucune boîte pour l'instant.</p>`;
        return;
    }

    boxes.forEach(box => itemsContainer.appendChild(createBoxCard(box)));
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

    // Visuel — classe de base + variante selon cover ou couleur
    const cover = document.createElement("div");
    cover.classList.add("box-cover");

    if (box.cover) {
        cover.classList.add("box-cover--image");
        cover.style.backgroundImage = `url(${box.cover})`; // seul style inline inévitable (url dynamique)
    } else {
        cover.classList.add("box-cover--color");
        cover.style.backgroundColor = box.color; // seul style inline inévitable (couleur dynamique)
    }

    if (box.favorite) {
        const star = document.createElement("span");
        star.classList.add("box-favorite-star");
        star.textContent = "★";
        cover.appendChild(star);
    }

    const info = document.createElement("div");
    info.classList.add("box-info");
    info.innerHTML = `
        <strong class="box-name">${box.name}</strong>
        <span class="box-meta">${count} fragment${count !== 1 ? "s" : ""}</span>
        <span class="box-meta">${date}</span>
    `;

    card.appendChild(cover);
    card.appendChild(info);

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

    itemsContainer.innerHTML = "";
    itemsContainer.className = "container--detail"; // ← classe CSS, pas de style inline

    // — Bouton retour —
    const backBtn = document.createElement("button");
    backBtn.classList.add("box-back-btn");
    backBtn.textContent = "← retour";
    backBtn.addEventListener("click", function () {
        currentBoxId = null;
        arrangeItemsByBox();
    });
    itemsContainer.appendChild(backBtn);

    // — Layout côte à côte —
    const topRow = document.createElement("div");
    topRow.classList.add("box-detail-top-row");

    // Visuel (image ou carré coloré)
    const visual = document.createElement("div");
    visual.classList.add("box-detail-visual");

    if (box.cover) {
        visual.classList.add("box-detail-visual--image");
        visual.style.backgroundImage = `url(${box.cover})`; // url dynamique = inévitable
    } else {
        visual.classList.add("box-detail-visual--color");
        visual.style.backgroundColor = box.color; // couleur dynamique = inévitable
    }

    // Bloc infos
    const count = countFragmentsByBox(boxId);
    const date  = new Date(box.createdAt).toLocaleDateString("fr-FR", {
        day: "2-digit", month: "long", year: "numeric"
    });

    const infoBlock = document.createElement("div");
    infoBlock.classList.add("box-detail-info-block");
    infoBlock.innerHTML = `
        <h2 class="box-detail-name">${box.name}</h2>
        ${box.description ? `<p class="box-detail-desc">${box.description}</p>` : ""}
        <span class="box-meta">${count} fragment${count !== 1 ? "s" : ""} · ${date}</span>
    `;

    // Boutons actions
    const actions = document.createElement("div");
    actions.classList.add("box-detail-actions");

    const editBtn = document.createElement("button");
    editBtn.classList.add("box-action-btn");
    editBtn.textContent = "modifier";
    editBtn.addEventListener("click", e => { e.stopPropagation(); openEditBoxModal(boxId); });

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
    infoBlock.appendChild(actions);
    topRow.appendChild(visual);
    topRow.appendChild(infoBlock);
    itemsContainer.appendChild(topRow);

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

function openEditBoxModal(boxId) {
    const box = getBoxById(boxId);
    if (!box) return;

    const existing = document.getElementById("edit-box-modal");
    if (existing) existing.remove();

    const overlay = document.createElement("dialog");
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
            <div id="cover-preview" class="cover-preview ${box.cover ? "cover-preview--image" : "cover-preview--color"}"></div>
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
    overlay.showModal();

    // Applique les valeurs dynamiques sur l'aperçu
    const preview = overlay.querySelector("#cover-preview");
    if (box.cover) {
        preview.style.backgroundImage = `url(${box.cover})`;
    } else {
        preview.style.backgroundColor = box.color;
    }

    // Sélection couleur
    let selectedColor = box.color;
    overlay.querySelectorAll(".color-dot").forEach(dot => {
        dot.addEventListener("click", function () {
            overlay.querySelectorAll(".color-dot").forEach(d => d.classList.remove("selected"));
            this.classList.add("selected");
            selectedColor = this.dataset.color;
            if (!newCover) {
                preview.style.backgroundColor = selectedColor;
                preview.style.backgroundImage = "";
            }
        });
    });

    // Image de couverture
    let newCover = box.cover || null;
    overlay.querySelector("#edit-box-cover").addEventListener("change", function () {
        const file = this.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            newCover = e.target.result;
            preview.style.backgroundImage = `url(${newCover})`;
            preview.style.backgroundColor = "";
        };
        reader.readAsDataURL(file);
    });

    overlay.querySelector("#edit-box-cancel").addEventListener("click", () => overlay.close());

    overlay.querySelector("#edit-box-save").addEventListener("click", function () {
        const newName = overlay.querySelector("#edit-box-name").value.trim();
        const newDesc = overlay.querySelector("#edit-box-desc").value.trim();
        if (!newName) { alert("Le nom est obligatoire."); return; }
        updateBox(boxId, { name: newName, description: newDesc, color: selectedColor, cover: newCover });
        overlay.close();
        showBoxDetail(boxId);
    });

    overlay.querySelector("#edit-box-delete").addEventListener("click", function () {
        if (confirm(`Supprimer la boîte "${box.name}" ?`)) {
            deleteBox(boxId);
            overlay.close();
            currentBoxId = null;
            arrangeItemsByBox();
        }
    });

    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.close(); });
    overlay.addEventListener("close", () => overlay.remove());
}