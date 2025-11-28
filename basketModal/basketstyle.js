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


