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
  previousOperand = parseFloat(previousOperand);
  currentOperand = parseFloat(currentOperand);
}

function pushOperands() {
  if (currentOperand === "") return; // don't lose operands
  previousOperand = currentOperand;
  currentOperand = "";
}

function compute() {
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
  parseOperands();
  currentOperand = compute();
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

function addCommaSeparators(str) {
  return str.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

function updateDisplay() {
  // always display something
  let newValue = currentOperand === "" ? 0 : currentOperand;
  display.textContent = addCommaSeparators(newValue.toString());
  shrinkText();
}

/* SPECIAL */
const clearButton = document.getElementById("clear");
clearButton.onclick = clear;

function clear() {
  disableOperatorHighlight();
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
  disableOperatorHighlight();
  handleCache();
  operate();
  operator = null;
  pushOperands();
}

const operatorButtons = calculator.querySelectorAll(".operator");
operatorButtons.forEach((button) => {
  button.onclick = () => {
    disableOperatorHighlight();
    button.classList.add("active");
    operatorActive = true;
    setOperator(button.textContent);
  };
});

function disableOperatorHighlight() {
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

function isEmpty(operand) {
  return operand === "" || operand === 0;
}

function appendDigit(number) {
  disableOperatorHighlight();
  // don't allow consecutive zeroes
  if (currentOperand === "0" && number == 0) return;
  if (currentOperand.replace(".", "").length === OPERAND_MAX_LENGTH) return;
  // overwrite zero if it's the starting number
  if (isEmpty(currentOperand)) {
    currentOperand = number.toString();
  } else {
    currentOperand += number;
  }
  updateDisplay();
}

const decimalButton = document.getElementById("decimal");
decimalButton.onclick = appendDecimal;

function appendDecimal() {
  disableOperatorHighlight();
  if (currentOperand.length > OPERAND_MAX_LENGTH - 1) return;
  if (currentOperand.includes(".")) return;
  if (isEmpty(currentOperand)) {
    currentOperand = "0.";
  } else {
    currentOperand += ".";
  }
  updateDisplay();
}
