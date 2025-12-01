console.log("hello worlds")

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


// ______________________________
// LOADING BASKET 
// ______________________________

window.addEventListener("load", function() {
    positionItemsRandomly();
});


// ———————————————————————————————
// POSITIONNEMENT ALÉATOIRE DES ITEMS = NUAGE VIEW
// _______________________________

let nuageButton = document.getElementById("nuage");
nuageButton.addEventListener("click", positionItemsRandomly);

function positionItemsRandomly() {

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


