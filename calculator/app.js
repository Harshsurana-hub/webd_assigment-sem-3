const displayScreen = document.querySelector(".display");
const numberButtons = document.querySelectorAll(".boxy");
const operatorButtons = document.querySelectorAll(".boxy2");
const equalsButton = document.querySelector(".equal");

let firstNumberString = "";
let secondNumberString = "";
let selectedOperator = "";
let isOperatorSelected = false;
let hasOperatorBeenSet = false;

displayScreen.innerText = "";

numberButtons.forEach(button => {
    button.addEventListener("click", () => {
        if (!isOperatorSelected) {
            firstNumberString += button.innerText;
            displayScreen.innerText += button.innerText;
        } else {
            secondNumberString += button.innerText;
            displayScreen.innerText += button.innerText;
        }
    });
});

operatorButtons.forEach(operatorButton => {
    operatorButton.addEventListener("click", () => {
        if (!hasOperatorBeenSet) {
            isOperatorSelected = true;
            selectedOperator += operatorButton.innerText;
            displayScreen.innerText += operatorButton.innerText;
            hasOperatorBeenSet = true;
        }
    });
});

equalsButton.addEventListener("click", () => {
    let firstNumber = parseFloat(firstNumberString);
    let secondNumber = parseFloat(secondNumberString);
    let calculationResult = calculateResult(selectedOperator, firstNumber, secondNumber);
    
    displayScreen.innerText = calculationResult;
    
    hasOperatorBeenSet = false;
    isOperatorSelected = false;
    firstNumberString = "";
    secondNumberString = "";
    selectedOperator = "";
});

function calculateResult(operator, num1, num2) {
    if (operator === "+") {
        return num1 + num2;
    } else if (operator === "-") {
        return num1 - num2;
    } else if (operator === "*") {
        return num1 * num2;
    } else if (operator === "/") {
        return num1 / num2;
    }
}