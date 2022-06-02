const calculator = document.querySelector(".calculator");

let previousOperand = "";
let currentOperand = "";
let operator = null;

/* OPERATIONS */
const add = () => previousOperand + currentOperand;
const subtract = () => previousOperand - currentOperand;
const multiply = () => previousOperand * currentOperand;
const divide = () => previousOperand / currentOperand;

function parseOperands() {
  previousOperand = parseInt(previousOperand);
  currentOperand = parseInt(currentOperand);
}

function selectOperation() {
  switch (operator) {
    case "+":
      return add();
    case "-":
      return subtract();
    case "×":
      return multiply();
    case "÷":
      return divide();
    default:
      return 0;
  }
}

function operate() {
  if (currentOperand === "" || operator === null) return;
  const temp = currentOperand;
  parseOperands();
  currentOperand = selectOperation();
  previousOperand = temp;
  updateDisplay();
}

/* DISPLAY */
const display = calculator.querySelector(".display");

function updateDisplay() {
  display.textContent = currentOperand === "" ? 0 : currentOperand;
}

/* SPECIAL */
const clearButton = document.getElementById("clear");
clearButton.onclick = clear;

function clear() {
  previousOperand = "";
  currentOperand = "";
  operator = null;
  updateDisplay();
}

/* OPERATORS */
const operatorButtons = calculator.querySelectorAll(".operator");
operatorButtons.forEach(
  (button) => (button.onclick = () => setOperator(button.textContent))
);

function setOperator(newOperator) {
  operator = newOperator;
}

/* DIGITS */
const digitButtons = calculator.querySelectorAll(".digit");
digitButtons.forEach(
  (button) => (button.onclick = () => appendDigit(button.textContent))
);

function appendDigit(number) {
  if (currentOperand === "" && number == 0) return;
  currentOperand += number;
  updateDisplay();
}
