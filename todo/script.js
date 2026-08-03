const userInputField = document.querySelector(".text");
const wordListContainer = document.querySelector(".list");
const addWordButton = document.querySelector(".button");

addWordButton.addEventListener("click", () => {
    const newWordHeader = document.createElement("h1");
    newWordHeader.innerHTML = userInputField.value;
    wordListContainer.append(newWordHeader);
});