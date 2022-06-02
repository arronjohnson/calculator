const DISPLAY_SHRINK_LENGTH = 8;
const FONT_SIZE_SMALLER = "2.5rem";
const NUMBER_MIN = -999999999;
const NUMBER_MAX = 999999999;
const OPERAND_MAX_LENGTH = 9;

const calculator = document.querySelector(".calculator");

let previousOperand = "";
let currentOperand = "";
let cache = null;
let operator = null;
let operatorActive;

/* OPERATIONS */
const add = () => previousOperand + currentOperand;
const subtract = () => previousOperand - currentOperand;
const multiply = () => previousOperand * currentOperand;
const divide = () => previousOperand / currentOperand;

function parseOperands() {
  previousOperand = parseInt(previousOperand);
  currentOperand = parseInt(currentOperand);
}

function pushOperands() {
  if (currentOperand === "") return; // don't lose operands
  previousOperand = currentOperand;
  currentOperand = "";
}

function compute() {
  parseOperands();
  switch (operator) {
    case "+":
      return add();
    case "-":
      return subtract();
    case "×":
      return multiply();
    case "÷":
      if (currentOperand == 0) {
        // don't let the calculator break when dividing by 0
        alert("Are you trying to create a black hole?");
        return 0;
      }
      return divide();
    default:
      return 0;
  }
}

function round(num) {
  return Math.round(num * 100) / 100;
}

function sanitizeOutput() {
  currentOperand = round(currentOperand);
  if (currentOperand > NUMBER_MAX) {
    currentOperand = NUMBER_MAX;
  } else if (currentOperand < NUMBER_MIN) {
    currentOperand = NUMBER_MIN;
  }
}

function operate() {
  if (currentOperand === "" || operator === null) return;
  if (previousOperand === "") {
    // prevent NaN if user doesn't enter an operand first
    previousOperand = 0;
  }
  currentOperand = compute(previousOperand, currentOperand);
  sanitizeOutput();
  updateDisplay();
}

/* DISPLAY */
const display = calculator.querySelector(".display");

function shrinkText() {
  if (display.textContent.length > DISPLAY_SHRINK_LENGTH) {
    display.style.fontSize = FONT_SIZE_SMALLER;
  } else {
    display.removeAttribute("style");
  }
}

function updateDisplay() {
  // always display something
  let newValue = currentOperand === "" ? 0 : currentOperand;
  // add comma separators
  display.textContent = Number(newValue).toLocaleString();
  shrinkText();
}

/* SPECIAL */
const clearButton = document.getElementById("clear");
clearButton.onclick = clear;

function clear() {
  deactivateButtons();
  previousOperand = "";
  currentOperand = "";
  cache = null;
  operator = null;
  updateDisplay();
}

const deleteButton = document.getElementById("delete");
deleteButton.onclick = deleteLastDigit;

function deleteLastDigit() {
  if (currentOperand.length < 2) return;
  currentOperand = currentOperand.toString().slice(0, -1);
  updateDisplay();
}

/* OPERATORS */
const equalsButton = document.getElementById("equals");
equalsButton.onclick = equals;

function handleCache() {
  if (!cache) {
    // don't chain when the users hits equals followed by an operator
    if (currentOperand !== "") {
      cache = [currentOperand, operator];
    }
    return;
  }
  pushOperands();
  operator = cache[1];
  if (currentOperand === "") {
    currentOperand = cache[0];
  }
}

function equals() {
  if (operatorActive) {
    // chain current operand if operator was pressed immediately prior to equals
    currentOperand = previousOperand;
  }
  deactivateButtons();
  handleCache();
  operate();
  operator = null;
  pushOperands();
}

const operatorButtons = calculator.querySelectorAll(".operator");
operatorButtons.forEach((button) => {
  button.onclick = () => {
    deactivateButtons();
    button.classList.add("active");
    operatorActive = true;
    setOperator(button.textContent);
  };
});

function deactivateButtons() {
  if (!operatorActive) return;
  operatorButtons.forEach((button) => button.classList.remove("active"));
  operatorActive = null;
}

function setOperator(newOperator) {
  cache = null;
  if (operator) {
    operate(previousOperand, currentOperand);
  }
  operator = newOperator;
  pushOperands();
}

/* DIGITS */
const digitButtons = calculator.querySelectorAll(".digit");
digitButtons.forEach(
  (button) => (button.onclick = () => appendDigit(button.textContent))
);

function appendDigit(number) {
  deactivateButtons();
  // don't allow consecutive zeroes
  if (currentOperand === "0" && number == 0) return;
  // maximum limit to number of visible characters
  if (currentOperand.length === OPERAND_MAX_LENGTH) return;
  // overwrite zero if it's the starting number
  if (currentOperand == 0) {
    currentOperand = number.toString();
  } else {
    currentOperand += number;
  }
  updateDisplay();
}
