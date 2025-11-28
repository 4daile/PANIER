console.log("hello worlds")
let myButton = document.querySelector(".open");
myButton.addEventListener("click", function() {
    openPanneau();
})

function openPanneau(){
    console.log("openPanneau")
    const panneau = document.getElementsByClassName("panneau");
    if (panneau > 0) {
        console.log("panneau trouvé")
    } else {
        console.log(":(((")
    }
}
