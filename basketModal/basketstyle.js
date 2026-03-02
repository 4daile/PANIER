// _____________________________
// BUTTONS :D
// _____________________________

console.log("hello worlds")

let DeleteButton = document.querySelector(".delete"); 
DeleteButton.addEventListener("click", function() {
    clearBasket();
})

let myButton = document.querySelector(".open");
myButton.addEventListener("click", function() {
    openPanneau();
})

let closeButton = document.querySelector(".close");
closeButton.addEventListener("click", function() {
    closePanneau();
})

function openPanneau(){
    document.querySelector(".panneau").classList.add("active")
    //console.log("panneau")
    //console.log("active")
}

function closePanneau(){
    document.querySelector(".panneau").classList.remove("active")
}

function clearBasket() {
    localStorage.removeItem("basketItems");
    updateFragmentCounter();
    location.reload();
}

function showAllItems() {
    document.querySelectorAll(".basket-item").forEach(item => {
        item.style.display = "";
    // Supprime le surlignage en remettant le texte brut
        item.querySelectorAll("mark").forEach(mark => {
            mark.replaceWith(mark.textContent);
        });
    });
}

// ______________________________
// LOADING BASKET 
// ______________________________

window.addEventListener("load", function() {
    positionItemsRandomly();
});

let isNuageView = true; // pour savoir dans quelle vue on est

window.addEventListener("load", function() {
    positionItemsRandomly();
    //initDragDropObjects();
    //initDragDropItems();
    //loadObjectPositions();
    
});

// ______________________________
// COMPTEUR DE FRAGMENTS
// ______________________________

function updateFragmentCounter() {
    const items = document.querySelectorAll(".basket-item");
    const count = items.length;
    const maxFragments = 500; // limite max pour la jauge (tu peux ajuster)
    
    // Met à jour le texte
    const counterText = document.getElementById("fragment-count");
    if (counterText) {
        counterText.textContent = count;
    }
}



// ______________________________
// DRAG AND DROP POUR LES ITEMS (seulement en vue nuage)
// ______________________________
/*
function initDragDropItems() {
    const items = document.querySelectorAll(".basket-item");
    
    items.forEach((item, index) => {
        let isDragging = false;
        let offsetX, offsetY;
        
        item.addEventListener("mousedown", function(e) {
            if (!isNuageView) return; // drag seulement en vue nuage
            
            isDragging = true;
            item.classList.add("dragging");
            
            const rect = item.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            
            e.preventDefault();
        });
        
        document.addEventListener("mousemove", function(e) {
            if (!isDragging) return;
            
            const container = document.getElementById("items-container");
            const containerRect = container.getBoundingClientRect();
            
            const x = e.clientX - containerRect.left - offsetX;
            const y = e.clientY - containerRect.top - offsetY;
            
            item.style.left = `${x}px`;
            item.style.top = `${y}px`;
        });
        
        document.addEventListener("mouseup", function() {
            if (isDragging) {
                isDragging = false;
                item.classList.remove("dragging");
                
                // Sauvegarde la position de l'item
                const position = {
                    left: item.style.left,
                    top: item.style.top
                };
                localStorage.setItem(`item-${index}-position`, JSON.stringify(position));
            }
        });
    });
}*/

// ———————————————————————————————
// POSITIONNEMENT ALÉATOIRE DES ITEMS = NUAGE VIEW
// _______________________________

let nuageButton = document.getElementById("nuage");
nuageButton.addEventListener("click", positionItemsRandomly);

function positionItemsRandomly() {
    showAllItems();
    const itemsContainer = document.getElementById("items-container");
    const items = document.querySelectorAll(".basket-item");

    // s'assure que le conteneur permet le placement libre
    itemsContainer.style.position = "relative";

    items.forEach(item => {

        item.style.position = "absolute";

        const containerWidth = itemsContainer.clientWidth;
        const containerHeight = itemsContainer.clientHeight;

        const itemWidth = item.offsetWidth || 200;
        const itemHeight = item.offsetHeight || 100;

        const x = Math.random() * Math.max(0, containerWidth - itemWidth);
        const y = Math.random() * Math.max(0, containerHeight - itemHeight);

        item.style.left = `${Math.round(x)}px`;
        item.style.top = `${Math.round(y)}px`;
    });
}

// ______________________
// COLLECTION VIEW BUTTON = CHRONOLOGICAL ORDER 
// ______________________

let chronoButton = document.getElementById("chrono");
chronoButton.addEventListener("click", arrangeItemsChronologically);

function arrangeItemsChronologically() {
    showAllItems();
    const itemsContainer = document.getElementById("items-container");
    const items = Array.from(document.querySelectorAll(".basket-item"));
    itemsContainer.style.position = "static"; // réinitialise le positionnement du conteneur
    itemsContainer.style.display = "flex";
    itemsContainer.style.flexDirection = "row";
    itemsContainer.style.alignItems = "flex-start";
    itemsContainer.style.flexWrap = "wrap"; 
    itemsContainer.style.justifyContent = "flex-start";
    itemsContainer.style.gap = "10px";
 //   itemsContainer.style.padding = "10px";
    itemsContainer.innerHTML = ""; // vide le conteneur avant de réajouter les items

    // trie les items par dates 

    items.sort((a, b) => {
        const dateA = new Date(a.querySelector("p:nth-child(2)").textContent);
        const dateB = new Date(b.querySelector("p:nth-child(2)").textContent);
        return dateB - dateA;
    });

    items.forEach(item => {
        item.style.position = "static";
        itemsContainer.appendChild(item);
    });
}

// _____________________________
// RECHERCHE DANS LE PANIER (RESEARCH BAR)
// _____________________________

// ______________________________
// RECHERCHE
// ______________________________

let searchButton = document.getElementById("search-button");
let searchInput = document.getElementById("search-input");

searchButton.addEventListener("click", function() {
    searchItems();
});

// Bonus : recherche aussi en appuyant sur Entrée
searchInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter") searchItems();
});

function searchItems() {
    const query = searchInput.value.trim().toLowerCase();
    const items = document.querySelectorAll(".basket-item");

    // Si la recherche est vide, on réaffiche tout et on remet la vue normale
    if (query === "") {
        items.forEach(item => item.style.display = "");
        positionItemsRandomly(); // retour vue nuage
        return;
    }

    // Passe en vue liste avant d'afficher les résultats
    arrangeItemsChronologically();

    // Filtre les items
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(query)) {
            item.style.display = ""; // visible
        } else {
            item.style.display = "none"; // caché
        }
        const originalText = item.querySelector("p").textContent;
        const highlighted = originalText.replace(
        new RegExp(query, "gi"), 
        match => `<mark>${match}</mark>`
        );
        item.querySelector("p").innerHTML = highlighted;
     });

    // Dans ta boucle forEach, après avoir vérifié que l'item est visible :

}