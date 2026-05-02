// ============================================================
// BASKETSTYLE.JS — Vue et navigation pour PANIER
// Gère : nuage, liste, boîte, print, à propos, recherche
// ============================================================

console.log("basketstyle.js chargé");

// ──────────────────────────────────────────
// UTILITAIRES DOM
// ──────────────────────────────────────────

function getItems() {
    try {
        return JSON.parse(localStorage.getItem("basketItems")) || [];
    } catch { return []; }
}

// ──────────────────────────────────────────
// VIDER LE PANIER
// ──────────────────────────────────────────

let DeleteButton = document.querySelector(".delete");
if (DeleteButton) {
    DeleteButton.addEventListener("click", function () {
        if (confirm("Vider tout le panier ? Cette action est irréversible.")) {
            localStorage.removeItem("basketItems");
            location.reload();
        }
    });
}

// ──────────────────────────────────────────
// COMPTEUR DE FRAGMENTS
// ──────────────────────────────────────────

function updateFragmentCounter() {
    const counter = document.getElementById("fragment-count");
    if (!counter) return;
    const items = getItems();
    counter.textContent = items.length;
}

// ──────────────────────────────────────────
// NAVIGATION — switcher central
// Masque tout, affiche la bonne vue
// ──────────────────────────────────────────

function hideAllViews() {
    const container = document.getElementById("items-container");
    container.style.display   = "none";
    container.innerHTML       = "";
    container.style.position  = "";
    container.style.height    = "";
    container.style.minHeight = "";
    container.style.overflow  = "";
    container.className       = "";

    document.getElementById("view-print").style.display = "none";
    document.getElementById("view-about").style.display = "none";
}

function setActiveNav(viewName) {
    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.view === viewName);
    });
}

// ──────────────────────────────────────────
// VUE NUAGE — positionnement aléatoire, scrollable
// ──────────────────────────────────────────

let nuageButton = document.getElementById("nuage");
if (nuageButton) nuageButton.addEventListener("click", positionItemsRandomly);

window.addEventListener("load", function () {
    positionItemsRandomly();
});

function positionItemsRandomly() {
    clearSearch();
    hideAllViews();
    setActiveNav("nuage");

    const itemsContainer = document.getElementById("items-container");
    itemsContainer.style.display   = "block";
    itemsContainer.style.position  = "relative";
    itemsContainer.style.overflowY = "auto";
    itemsContainer.style.overflowX = "hidden";

    reloadFragmentsIntoDOM();

    const items       = Array.from(document.querySelectorAll(".basket-item"));
    const ITEM_W      = 250;
    const ITEM_H_EST  = 140;
    const GAP         = 16;
    const containerW  = itemsContainer.clientWidth || 800;
    const cols        = Math.max(1, Math.floor(containerW / (ITEM_W + GAP)));
    const rows        = Math.ceil(items.length / cols);
    const totalH      = Math.max(rows * (ITEM_H_EST + GAP) + 80, window.innerHeight * 0.7);

    itemsContainer.style.height    = totalH + "px";
    itemsContainer.style.minHeight = "calc(100vh - 150px)";

    items.forEach((item, i) => {
        const col    = i % cols;
        const row    = Math.floor(i / cols);
        const baseX  = col * (ITEM_W + GAP) + GAP;
        const baseY  = row * (ITEM_H_EST + GAP) + GAP;
        const jitterX = (Math.random() - 0.5) * 40;
        const jitterY = (Math.random() - 0.5) * 30;
        const x = Math.max(0, Math.min(baseX + jitterX, containerW - ITEM_W - GAP));
        const y = Math.max(0, baseY + jitterY);

        item.style.position = "absolute";
        item.style.left     = x + "px";
        item.style.top      = y + "px";
    });
}

// ──────────────────────────────────────────
// VUE LISTE — colonnes masonry, plus récent en premier
// ──────────────────────────────────────────

let chronoButton = document.getElementById("chrono");
if (chronoButton) chronoButton.addEventListener("click", arrangeItemsChronologically);

function arrangeItemsChronologically() {
    clearSearch();
    hideAllViews();
    setActiveNav("chrono");

    const itemsContainer = document.getElementById("items-container");
    itemsContainer.style.display = "block";

    reloadFragmentsIntoDOM();

    // Trier par date : plus récent en premier
    const allItems = Array.from(document.querySelectorAll(".basket-item"));
    allItems.sort((a, b) => {
        const dateA = new Date(a.querySelector(".item-date")?.textContent || 0);
        const dateB = new Date(b.querySelector(".item-date")?.textContent || 0);
        return dateB - dateA;
    });

    // Wrapper interne pour les colonnes
    // (évite tout conflit avec les styles inline d'items-container)
    const wrapper = document.createElement("div");
    wrapper.className = "chrono-wrapper";

    allItems.forEach(item => {
        item.style.position = "static";
        item.style.left     = "";
        item.style.top      = "";
        wrapper.appendChild(item);
    });

    itemsContainer.appendChild(wrapper);
}

// ──────────────────────────────────────────
// VUE BOÎTE — déléguée à boxView.js
// ──────────────────────────────────────────

let boxButton = document.getElementById("box");
// boxView.js ajoute son propre listener sur #box.
// On surcharge ici pour passer d'abord par hideAllViews().
if (boxButton) {
    // On retire l'ancien listener de boxView.js en clonant le nœud
    const newBoxButton = boxButton.cloneNode(true);
    boxButton.parentNode.replaceChild(newBoxButton, boxButton);

    newBoxButton.addEventListener("click", function () {
        clearSearch();
        hideAllViews();
        setActiveNav("box");
        const itemsContainer = document.getElementById("items-container");
        itemsContainer.style.display = "block";
        if (typeof arrangeItemsByBox === "function") arrangeItemsByBox();
    });
}

// ──────────────────────────────────────────
// VUE PRINT — Imprimante thermique 57.5mm
// ──────────────────────────────────────────

let printButton = document.getElementById("print-btn");
if (printButton) {
    printButton.addEventListener("click", generateThermalPrint);
}

function generateThermalPrint() {
    clearSearch();
    hideAllViews();
    setActiveNav("print");

    const viewPrint = document.getElementById("view-print");
    viewPrint.style.display = "block";
    viewPrint.innerHTML = ""; // Réinitialise
    
    // Récupère les fragments
    const items = getItems();
    
    // Conteneur thermique
    const thermalContainer = document.createElement("div");
    thermalContainer.className = "thermal-container";
    
    // En-tête
    const header = document.createElement("div");
    header.className = "thermal-header";
    header.innerHTML = `
        <h2>PANIER</h2>
        <p>mes fragments collectés</p>
        <p class="thermal-date">${new Date().toLocaleDateString('fr-FR')}</p>
    `;
    thermalContainer.appendChild(header);
    
    // Fragments
    if (items.length === 0) {
        const empty = document.createElement("p");
        empty.className = "thermal-empty";
        empty.textContent = "Aucun fragment à imprimer";
        thermalContainer.appendChild(empty);
    } else {
        items.forEach((item, index) => {
            const fragment = document.createElement("div");
            fragment.className = "thermal-fragment";
            fragment.innerHTML = `
                <div class="thermal-text">${item.selection}</div>
                <div class="thermal-meta">
                    <span class="thermal-date">${new Date(item.date).toLocaleDateString('fr-FR')}</span>
                    <span class="thermal-url">${item.url}</span>
                </div>
                <div class="thermal-separator"></div>
            `;
            thermalContainer.appendChild(fragment);
        });
    }
    
    // Pied de page
    const footer = document.createElement("div");
    footer.className = "thermal-footer";
    footer.innerHTML = `<p>${items.length} fragment${items.length !== 1 ? 's' : ''} collecté${items.length !== 1 ? 's' : ''}</p>`;
    thermalContainer.appendChild(footer);
    
    viewPrint.appendChild(thermalContainer);
    
    // Ajout des boutons d'action
    addThermalActions(viewPrint, items);
    
    window.scrollTo(0, 0);
}

function addThermalActions(viewPrint, items) {
    const actions = document.createElement("div");
    actions.className = "thermal-actions";
    
    const printBtn = document.createElement("button");
    printBtn.className = "action-btn action-btn--print";
    printBtn.textContent = "Imprimer";
    printBtn.addEventListener("click", function () {
        window.print();
    });
    
    const downloadBtn = document.createElement("button");
    downloadBtn.className = "action-btn action-btn--download";
    downloadBtn.textContent = "Télécharger PDF";
    downloadBtn.addEventListener("click", function () {
        // À implémenter: convertir en PDF si nécessaire
        alert("Fonctionnalité PDF bientôt disponible");
    });
    
    actions.appendChild(printBtn);
    actions.appendChild(downloadBtn);
    viewPrint.appendChild(actions);
}

// ──────────────────────────────────────────
// VUE À PROPOS
// ──────────────────────────────────────────

let aboutButton = document.getElementById("about-btn");
if (aboutButton) {
    aboutButton.addEventListener("click", function () {
        clearSearch();
        hideAllViews();
        setActiveNav("about");
        document.getElementById("view-about").style.display = "block";
        updateFragmentCounter();
        window.scrollTo(0, 0);
    });
}

// ──────────────────────────────────────────
// RECHERCHE
// ──────────────────────────────────────────

let searchButtonEl    = document.getElementById("search-button");
let searchInputEl     = document.getElementById("search-input");
let searchTagsBar     = document.getElementById("search-tags-bar");
let currentSearchQuery = null;

if (searchButtonEl) searchButtonEl.addEventListener("click", searchItems);
if (searchInputEl)  searchInputEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter") searchItems();
});

function searchItems() {
    const query = searchInputEl ? searchInputEl.value.trim().toLowerCase() : "";
    if (query === "") { clearSearch(); return; }

    currentSearchQuery = query;

    // On passe en vue liste pour la recherche
    arrangeItemsChronologically();

    const queryWords = query.split(/\s+/).filter(w => w.length > 0);
    renderSearchTags(queryWords);

    document.querySelectorAll(".basket-item").forEach(item => {
        const textContent = item.textContent.toLowerCase();
        const allFound    = queryWords.every(w => textContent.includes(w));

        item.style.display = allFound ? "" : "none";

        if (allFound) {
            const p = item.querySelector("p");
            if (!p) return;
            let html = p.textContent;
            queryWords.forEach(word => {
                const re = new RegExp(`(${escapeRegex(word)})`, "gi");
                html = html.replace(re, "<mark>$1</mark>");
            });
            p.innerHTML = html;
        }
    });
}

function renderSearchTags(words) {
    if (!searchTagsBar) return;
    searchTagsBar.innerHTML = "";
    words.forEach(word => {
        const tag = document.createElement("span");
        tag.className = "search-tag";
        tag.innerHTML = `${word} <button class="tag-close" data-word="${word}">✕</button>`;
        tag.querySelector(".tag-close").addEventListener("click", clearSearch);
        searchTagsBar.appendChild(tag);
    });
}

function clearSearch() {
    if (searchInputEl)  searchInputEl.value = "";
    if (searchTagsBar)  searchTagsBar.innerHTML = "";
    currentSearchQuery = null;
}

function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function showAllItems() {
    document.querySelectorAll(".basket-item").forEach(item => {
        item.style.display = "";
        item.querySelectorAll("mark").forEach(m => m.replaceWith(m.textContent));
    });
}