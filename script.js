/**
 * Calculator Web Application
 * Clean, modern, beginner-friendly JavaScript implementation.
 */

class Calculator {
  constructor(previousOperandTextElement, currentOperandTextElement) {
    this.previousOperandTextElement = previousOperandTextElement;
    this.currentOperandTextElement = currentOperandTextElement;
    this.clear();
  }

  /**
   * Resets calculator to its initial state.
   */
  clear() {
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = undefined;
    this.shouldResetScreen = false;
    this.isError = false;
  }

  /**
   * Deletes the last digit/character from current operand.
   */
  delete() {
    if (this.isError) {
      this.clear();
      return;
    }
    if (this.shouldResetScreen) {
      return;
    }
    if (this.currentOperand === '0' || this.currentOperand === '') {
      return;
    }

    if (this.currentOperand.length === 1 || (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))) {
      this.currentOperand = '0';
    } else {
      this.currentOperand = this.currentOperand.slice(0, -1);
    }
  }

  /**
   * Toggles positive / negative sign.
   */
  toggleSign() {
    if (this.isError) {
      this.clear();
      return;
    }
    if (this.currentOperand === '0' || this.currentOperand === '') {
      return;
    }

    if (this.currentOperand.startsWith('-')) {
      this.currentOperand = this.currentOperand.slice(1);
    } else {
      this.currentOperand = '-' + this.currentOperand;
    }
  }

  /**
   * Appends a number or decimal point to the current operand.
   */
  appendNumber(number) {
    if (this.isError) {
      this.clear();
    }

    if (this.shouldResetScreen) {
      this.currentOperand = '';
      this.shouldResetScreen = false;
    }

    // Handle decimal logic
    if (number === '.') {
      if (this.currentOperand === '' || this.currentOperand === undefined) {
        this.currentOperand = '0.';
        return;
      }
      if (this.currentOperand.includes('.')) {
        return; // Prevent multiple decimal points
      }
      this.currentOperand += '.';
      return;
    }

    // Prevent excessive leading zeros
    if (this.currentOperand === '0' && number !== '.') {
      this.currentOperand = number.toString();
    } else {
      this.currentOperand += number.toString();
    }
  }

  /**
   * Selects an operator (+, -, ×, ÷).
   */
  chooseOperation(operation) {
    if (this.isError) {
      this.clear();
    }

    if (this.currentOperand === '' && this.previousOperand === '') {
      return;
    }

    // If operator clicked without entering a new number, just change the operation
    if (this.currentOperand === '' && this.previousOperand !== '') {
      this.operation = operation;
      return;
    }

    if (this.previousOperand !== '') {
      this.compute();
      if (this.isError) {
        return;
      }
    }

    this.operation = operation;
    this.previousOperand = this.currentOperand;
    this.currentOperand = '';
    this.shouldResetScreen = false;
  }

  /**
   * Performs the mathematical calculation.
   */
  compute() {
    if (this.operation == null || this.previousOperand === '' || this.currentOperand === '') {
      return;
    }

    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);

    if (isNaN(prev) || isNaN(current)) {
      return;
    }

    let computation;
    switch (this.operation) {
      case '+':
        computation = prev + current;
        break;
      case '-':
        computation = prev - current;
        break;
      case '×':
      case '*':
        computation = prev * current;
        break;
      case '÷':
      case '/':
        if (current === 0) {
          this.currentOperand = 'Cannot divide by zero';
          this.previousOperand = '';
          this.operation = undefined;
          this.isError = true;
          this.shouldResetScreen = true;
          return;
        }
        computation = prev / current;
        break;
      default:
        return;
    }

    // Rounding to fix JavaScript floating point inaccuracy issues (e.g. 0.1 + 0.2 = 0.30000000000000004)
    computation = this.roundResult(computation);

    this.currentOperand = computation.toString();
    this.operation = undefined;
    this.previousOperand = '';
    this.shouldResetScreen = true;
    this.isError = false;
  }

  /**
   * Rounds floating-point numbers accurately up to 10 decimal places.
   */
  roundResult(number) {
    if (Number.isInteger(number)) {
      return number;
    }
    return parseFloat(number.toFixed(10));
  }

  /**
   * Formats a display number with localized commas for large figures.
   */
  formatDisplayNumber(numberStr) {
    if (this.isError || numberStr === 'Cannot divide by zero') {
      return numberStr;
    }

    const stringNumber = numberStr.toString();
    if (stringNumber === '') return '';

    const isNegative = stringNumber.startsWith('-');
    const cleanString = isNegative ? stringNumber.slice(1) : stringNumber;

    const parts = cleanString.split('.');
    const integerDigits = parseFloat(parts[0]);
    const decimalDigits = parts[1];

    let integerDisplay;
    if (isNaN(integerDigits)) {
      integerDisplay = '0';
    } else {
      integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
    }

    let formatted = isNegative ? `-${integerDisplay}` : integerDisplay;

    if (decimalDigits != null) {
      formatted = `${formatted}.${decimalDigits}`;
    }

    return formatted;
  }

  /**
   * Updates HTML display elements.
   */
  updateDisplay() {
    if (this.isError) {
      this.currentOperandTextElement.innerText = this.currentOperand;
      this.previousOperandTextElement.innerText = '';
      return;
    }

    this.currentOperandTextElement.innerText = this.formatDisplayNumber(this.currentOperand);

    if (this.operation != null && this.previousOperand !== '') {
      this.previousOperandTextElement.innerText = `${this.formatDisplayNumber(this.previousOperand)} ${this.operation}`;
    } else {
      this.previousOperandTextElement.innerText = '';
    }
  }
}

// Attach event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const previousOperandTextElement = document.getElementById('previous-operand');
  const currentOperandTextElement = document.getElementById('current-operand');

  const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);
  calculator.updateDisplay();

  // Expose calculator on window for programmatic verification and testing
  window.calculatorInstance = calculator;

  // Number buttons
  document.querySelectorAll('[data-number]').forEach((button) => {
    button.addEventListener('click', () => {
      calculator.appendNumber(button.dataset.number);
      calculator.updateDisplay();
    });
  });

  // Operator buttons
  document.querySelectorAll('[data-operator]').forEach((button) => {
    button.addEventListener('click', () => {
      calculator.chooseOperation(button.dataset.operator);
      calculator.updateDisplay();
    });
  });

  // Action buttons
  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      if (action === 'clear') {
        calculator.clear();
      } else if (action === 'delete') {
        calculator.delete();
      } else if (action === 'negate') {
        calculator.toggleSign();
      } else if (action === 'decimal') {
        calculator.appendNumber('.');
      } else if (action === 'equals') {
        calculator.compute();
      }
      calculator.updateDisplay();
    });
  });

  // Keyboard navigation and typing support
  window.addEventListener('keydown', (e) => {
    let keyHandled = false;

    if ((e.key >= '0' && e.key <= '9')) {
      calculator.appendNumber(e.key);
      highlightButton(`[data-number="${e.key}"]`);
      keyHandled = true;
    } else if (e.key === '.') {
      calculator.appendNumber('.');
      highlightButton('#btn-decimal');
      keyHandled = true;
    } else if (e.key === '+' || e.key === '-') {
      calculator.chooseOperation(e.key);
      highlightButton(`[data-operator="${e.key}"]`);
      keyHandled = true;
    } else if (e.key === '*') {
      calculator.chooseOperation('×');
      highlightButton('#btn-multiply');
      keyHandled = true;
    } else if (e.key === '/') {
      e.preventDefault(); // Prevent browser search shortcut
      calculator.chooseOperation('÷');
      highlightButton('#btn-divide');
      keyHandled = true;
    } else if (e.key === 'Enter' || e.key === '=') {
      e.preventDefault();
      calculator.compute();
      highlightButton('#btn-equals');
      keyHandled = true;
    } else if (e.key === 'Backspace') {
      calculator.delete();
      highlightButton('#btn-delete');
      keyHandled = true;
    } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
      calculator.clear();
      highlightButton('#btn-clear');
      keyHandled = true;
    }

    if (keyHandled) {
      calculator.updateDisplay();
    }
  });

  function highlightButton(selector) {
    const btn = document.querySelector(selector);
    if (btn) {
      btn.classList.add('active-key');
      setTimeout(() => {
        btn.classList.remove('active-key');
      }, 150);
    }
  }
});
