import {getOperators, registerOperator, unregisterOperator} from './operator';
import {getMutators, postfix, registerMutator, unregisterMutator} from './mutator';
import {extract} from './shared';

const leftRegExp = /^[a-zA-Z]+\.[a-zA-Z]+(?:\.\.[a-zA-Z]+)*/;
const rightRegExp = /[^\n]+/;

const quote = '\'';

function throwSemanticError(expr) {
    const msg = `Semantic Error in ${expr}: 
    Expression should be obj.attr[..mutator](operator)value or object.attribute
    (user.role~=['admin','user'] , resource.location..radius=100)`;
    throw new Error(msg);
}

function isObjWithAttr(str) {
    return str.includes('.')
        && (str.indexOf('user.') === 0
            || str.indexOf('env.') === 0
            || str.indexOf('action.') === 0
            || str.indexOf('resource.') === 0);
}

function unwrapString(str) {
    if (str[0] === quote && str[str.length - 1] === quote) {
        str = '"' + str.substr(1, str.length - 2) + '"';
    }
    return str;
}

function parseOperand(operandStr) {
    const array = operandStr.split('..');
    const _mutators = array.slice(1, array.length);
    const isDIObj = isObjWithAttr(array[0]);
    let value;

    try {
        value = isDIObj ? array[0] : JSON.parse(unwrapString(array[0]));
    } catch (e) {
        const msg = `Parsing Error: \n\t unknown object - ${array[0]} in expression`;
        throw new Error(msg);
    }

    return {
        isDIObj,
        value,
        mutators: _mutators
    };
}

function parseExp(expStr) {
    const operators = getOperators();
    let operator, parts;
    for (operator in operators) {
        parts = expStr.split(operator);
        if (parts.length === 2) break;
    }

    if ((parts.length !== 2)
        || (!leftRegExp.test(parts[0]))
        || (!rightRegExp.test(parts[1]))) throwSemanticError(expStr);

    return {
        origin: expStr,
        left: parseOperand(parts[0]),
        operator,
        right: parseOperand(parts[1]),
    }
}

function postfixApply(operand, data, context, key) {
    const _mutators = getMutators();

    for (let mutator of operand.mutators) {
        if (operand.isDIObj && typeof _mutators[mutator] === 'object' && _mutators[mutator][postfix]) {
            data.result = _mutators[mutator][postfix](data, context[operand.value], key);
        }
    }
}

function executeExp(inputData, exp, context, key) {
    const operators = getOperators();
    const leftOperand = extract(inputData, exp.left, context, key);
    const rightOperand = extract(inputData, exp.right, context, key);
    let path = '*';

    if (exp.left.isDIObj && typeof operators[exp.operator][exp.left.value] === 'function') {
        path = exp.left.value;
    } else if (exp.right.isDIObj && typeof operators[exp.operator][exp.right.value] === 'function') {
        path = exp.right.value;
    }

    let result = operators[exp.operator][path](leftOperand, rightOperand);

    let data = {
        leftIsData: !exp.left.isDIObj,
        rightIsData: !exp.right.isDIObj,
        leftValue: leftOperand,
        rightValue: rightOperand,
        result
    };

    postfixApply(exp.left, data, context, key);
    postfixApply(exp.right, data, context, key);

    return data.result;
}

export {
    parseExp,
    executeExp,
    registerOperator,
    unregisterOperator,
    registerMutator,
    unregisterMutator,
    getOperators
}