 // MODEL (Модель)
class CalculatorModel {
    constructor() {
        this.currentOperand = localStorage.getItem('calc_current') || '0';
        this.previousOperand = localStorage.getItem('calc_previous') || '';
        this.operation = localStorage.getItem('calc_operation') || undefined;
    }

    _commit() {
        localStorage.setItem('calc_current', this.currentOperand);
        localStorage.setItem('calc_previous', this.previousOperand);
        localStorage.setItem('calc_operation', this.operation || '');
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this._commit();
    }

    delete() {
        if (this.currentOperand === '0') return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '') this.currentOperand = '0';
        this._commit();
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
        this._commit();
    }

    chooseOperation(operation) {
        if (this.currentOperand === '0' && this.previousOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '0';
        this._commit();
    }

    _parseInput(str) {
        if (/[A-F]/.test(str)) {
            return parseInt(str, 16);
        }
        return parseFloat(str);
    }

    // Унарна операція NOT (інверсія бітів)
    applyNot() {
        if (this.currentOperand === '') return;
        let current = this._parseInput(this.currentOperand);
        if (isNaN(current)) return;
        this.currentOperand = (~current).toString();
        this._commit();
    }

    // Обчислення відсотка
    applyPercent() {
        if (this.currentOperand === '') return;
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;
        this.currentOperand = (current / 100).toString();
        this._commit();
    }

    compute() {
        let computation;
        const prev = this._parseInput(this.previousOperand);
        const current = this._parseInput(this.currentOperand);

        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            // Звичайні операції
            case '+': computation = prev + current; break;
            case '-': computation = prev - current; break;
            case '×': computation = prev * current; break;
            case '÷': computation = current === 0 ? 'Помилка' : prev / current; break;

            // Операції для програміста
            case 'MOD': computation = prev % current; break;
            case 'AND': computation = prev & current; break;
            case 'OR': computation = prev | current; break;
            case 'XOR': computation = prev ^ current; break;
            case '<<': computation = prev << current; break;
            case '>>': computation = prev >> current; break;
            default: return;
        }

        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this._commit();
    }
}


 // VIEW (Представлення)
class CalculatorView {
    constructor() {
        this.previousOperandTextElement = document.getElementById('previous-operand');
        this.currentOperandTextElement = document.getElementById('current-operand');

        // Поля для систем числення (режим програміста)
        this.hexDisplay = document.getElementById('val-hex');
        this.decDisplay = document.getElementById('val-dec');
        this.octDisplay = document.getElementById('val-oct');
        this.binDisplay = document.getElementById('val-bin');

        this.numberButtons = document.querySelectorAll('[data-number]');
        this.operationButtons = document.querySelectorAll('[data-operation]');
        this.percentButton = document.querySelector('[data-action="percent"]');

        // Кнопки дій
        this.clearButtons = document.querySelectorAll('[data-action="clear"]');
        this.deleteButtons = document.querySelectorAll('[data-action="delete"]');
        this.computeButtons = document.querySelectorAll('[data-action="compute"]');
        this.notButton = document.querySelector('[data-action="not"]');
    }

    updateDisplay(currentOperand, previousOperand, operation) {
        this.currentOperandTextElement.innerText = currentOperand;

        if (operation != null && operation !== '') {
            this.previousOperandTextElement.innerText = `${previousOperand} ${operation}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }

        if (this.hexDisplay && currentOperand !== 'Помилка') {
            let num = parseInt(currentOperand, 10);
            if (!isNaN(num)) {
                this.hexDisplay.innerText = (num >>> 0).toString(16).toUpperCase();
                this.decDisplay.innerText = num.toString(10);
                this.octDisplay.innerText = (num >>> 0).toString(8);
                let binStr = (num >>> 0).toString(2);
                this.binDisplay.innerText = binStr.match(/.{1,4}/g)?.join(' ') || binStr;
            }
        }
    }

    bindAppendNumber(handler) {
        this.numberButtons.forEach(button => {
            button.addEventListener('click', () => handler(button.innerText));
        });
    }

    bindChooseOperation(handler) {
        this.operationButtons.forEach(button => {
            button.addEventListener('click', () => handler(button.getAttribute('data-operation')));
        });
    }

    bindPercent(handler) {
        if (this.percentButton) {
            this.percentButton.addEventListener('click', handler);
        }
    }

    bindClear(handler) {
        this.clearButtons.forEach(button => button.addEventListener('click', handler));
    }

    bindDelete(handler) {
        this.deleteButtons.forEach(button => button.addEventListener('click', handler));
    }

    bindCompute(handler) {
        this.computeButtons.forEach(button => button.addEventListener('click', handler));
    }

    bindNot(handler) {
        if (this.notButton) this.notButton.addEventListener('click', handler);
    }
}

 // CONTROLLER (Контролер)
class CalculatorController {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.view.bindAppendNumber(this.handleAppendNumber);
        this.view.bindChooseOperation(this.handleChooseOperation);
        this.view.bindPercent(this.handlePercent);
        this.view.bindClear(this.handleClear);
        this.view.bindDelete(this.handleDelete);
        this.view.bindCompute(this.handleCompute);
        this.view.bindNot(this.handleNot);

        this.updateView();
    }

    handleAppendNumber = (number) => {
        this.model.appendNumber(number);
        this.updateView();
    }

    handleChooseOperation = (operation) => {
        this.model.chooseOperation(operation);
        this.updateView();
    }

    handlePercent = () => {
        this.model.applyPercent();
        this.updateView();
    }

    handleClear = () => {
        this.model.clear();
        this.updateView();
    }

    handleDelete = () => {
        this.model.delete();
        this.updateView();
    }

    handleCompute = () => {
        this.model.compute();
        this.updateView();
    }

    handleNot = () => {
        this.model.applyNot();
        this.updateView();
    }

    updateView() {
        this.view.updateDisplay(
            this.model.currentOperand,
            this.model.previousOperand,
            this.model.operation
        );
    }
}

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    const app = new CalculatorController(new CalculatorModel(), new CalculatorView());
});