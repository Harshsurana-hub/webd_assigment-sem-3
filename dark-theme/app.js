const bodyElement = document.querySelector("body");
const themeToggleButton = document.querySelector(".button2");
let isDarkMode = false;

themeToggleButton.addEventListener("click", () => {
    if (!isDarkMode) {
        bodyElement.style.backgroundColor = "Black";
        isDarkMode = true;
    } else {
        bodyElement.style.backgroundColor = "White";
        isDarkMode = false;
    }
});