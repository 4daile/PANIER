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


// ———————————————————————————————
// POSITIONNEMENT ALÉATOIRE DES ITEMS = NUAGE VIEW
// ———————————————————————————————

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




