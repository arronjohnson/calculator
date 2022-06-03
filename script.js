const NUMBER_MIN = -999999999;
const NUMBER_MAX = 999999999;
const OPERAND_MAX_LENGTH = 8;

const allButtons = document.querySelectorAll("button");
const calculator = document.querySelector(".calculator");
const clearButton = document.getElementById("clear");
const decimalButton = document.getElementById("decimal");
const deleteButton = document.getElementById("delete");
const digitButtons = calculator.querySelectorAll(".digit");
const display = calculator.querySelector(".display");
const divideButton = document.getElementById("divide");
const equalsButton = document.getElementById("equals");
const minusButton = document.getElementById("minus");
const multiplyButton = document.getElementById("multiply");
const percentButton = document.getElementById("percent");
const plusButton = document.getElementById("plus");
const operatorButtons = calculator.querySelectorAll(".operator");

let previousOperand = "";
let currentOperand = "";
let cache = null;
let operator = null;
let operatorActive;

/* EVENT LISTENERS */
const addHighlight = (button) => button.classList.add("pressed");
const removeHighlight = (button) => button.classList.remove("pressed");

clearButton.addEventListener("click", clear);
decimalButton.addEventListener("click", appendDecimal);
deleteButton.addEventListener("click", deleteLastDigit);
document.addEventListener("keydown", (e) => keyboardInput(e.key));
equalsButton.addEventListener("click", equals);
percentButton.addEventListener("click", calculatePercent);

// simulate hover behavior on touch devices
allButtons.forEach((button) => {
  if (!button.classList.contains("operator")) {
    button.addEventListener("touchstart", () => addHighlight(button));
    button.addEventListener("touchend", () =>
      setTimeout(() => removeHighlight(button), 100)
    );
  }
});

digitButtons.forEach((button) =>
  button.addEventListener("click", () => appendDigit(button.textContent))
);

operatorButtons.forEach((button) =>
  button.addEventListener("click", () => operatorPressed(button))
);

/* KEYBOARD */
function keyboardInput(key) {
  if (key >= 0 && key <= 9) {
    return appendDigit(key);
  }

  // prettier-ignore
  switch (key) {
    case "Escape": return clear();
    case "Backspace": return deleteLastDigit();
    case "%": return calculatePercent();
    case "/": return operatorPressed(divideButton);
    case "*": return operatorPressed(multiplyButton);
    case "-": return operatorPressed(minusButton);
    case "+": return operatorPressed(plusButton);
    case "=":
    case "Enter": return equals();
    default: return;
  }
}

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
  currentOperand = Math.max(NUMBER_MIN, currentOperand);
  currentOperand = Math.min(NUMBER_MAX, currentOperand);
  currentOperand = round(currentOperand).toString();
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

/* DISPLAY */
function shrinkText() {
  if (display.textContent.length > OPERAND_MAX_LENGTH) {
    display.classList.add("shrink");
  } else {
    display.classList.remove("shrink");
  }
}

function addCommaSeparators(str) {
  let decimals = "";
  const decimalIndex = str.indexOf(".");
  if (decimalIndex > 0) {
    decimals = str.slice(decimalIndex);
  }
  return parseInt(str).toLocaleString("en-GB") + decimals;
}

function updateDisplay() {
  // always display something
  let newValue = currentOperand === "" ? "0" : currentOperand;
  display.textContent = addCommaSeparators(newValue);
  shrinkText();
  // don't toggle the clear text if we just cleared
  if (newValue !== "0") {
    toggleClearDisplay();
  }
}

/* SPECIAL */
function toggleClearDisplay() {
  clearButton.textContent = "C";
}

function clear() {
  clearButton.textContent = "AC";
  disableOperatorHighlight();
  previousOperand = "";
  currentOperand = "";
  cache = null;
  operator = null;
  updateDisplay();
}

function deleteLastDigit() {
  if (currentOperand.length < 2) return;
  currentOperand = currentOperand.slice(0, -1);
  updateDisplay();
}

function calculatePercent() {
  if (isEmpty(currentOperand)) {
    currentOperand = previousOperand;
  }
  if (operator === "+" || operator === "-") {
    currentOperand = (previousOperand / 100) * currentOperand;
  } else {
    currentOperand = currentOperand / 100;
  }
  sanitizeOutput();
  updateDisplay();
}

/* OPERATORS */
function operatorPressed(button) {
  disableOperatorHighlight();
  button.classList.add("active");
  operatorActive = true;
  setOperator(button.textContent);
}

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
function isEmpty(str) {
  return str === "" || str === 0 || str == "0";
}

function appendDigit(number) {
  disableOperatorHighlight();
  // don't allow consecutive zeroes
  if (currentOperand === "0" && number === 0) return;
  if (currentOperand.replace(".", "").length > OPERAND_MAX_LENGTH) return;
  // overwrite zero if it's the starting number
  if (isEmpty(currentOperand)) {
    currentOperand = number.toString();
  } else {
    currentOperand += number;
  }
  updateDisplay();
}

function appendDecimal() {
  disableOperatorHighlight();
  if (currentOperand.length > OPERAND_MAX_LENGTH) return;
  if (currentOperand.includes(".")) return;
  if (isEmpty(currentOperand)) {
    currentOperand = "0.";
  } else {
    currentOperand += ".";
  }
  updateDisplay();
}
