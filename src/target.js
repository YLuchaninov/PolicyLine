import {getOperators, registerOperator, unregisterOperator} from './operator';
import {adapters} from './adapter';

// todo change to more stronger RegExp
const leftRegExp = /\.{1,2}|\w*/;
const rightRegExp = /[^\n]+/;

const quote = '\'';

function throwSemanticError(expr) {
    const msg = `Semantic Error in ${expr}: 
    Expression should be obj.attr[..adapter](operator)value or object.attribute
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
    const adapters = array.slice(1, array.length);
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
        adapters
    };
}

function unwrapNamespace(data, namespace) {
    const path = namespace.split('.');
    let result = data;
    for (let part of path) {
        try {
            result = result[part];
        } catch (e) {
            result = null;
            break;
        }
    }
    return result;
}

function extract(data, operand, context) {
    let tmpContext, value = operand.value;
    if (operand.isDIObj) {
        value = unwrapNamespace(data, value)
    }

    for (let adapter of operand.adapters) {
        if (operand.isDIObj) {
            context[operand.value] = context[operand.value] || {};
            tmpContext = context[operand.value];
        }
        value = adapters[adapter](value, tmpContext);
    }
    return value;
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

function executeExp(data, exp, context) {
    const operators = getOperators();
    const leftOperand = extract(data, exp.left, context);
    const rightOperand = extract(data, exp.right, context);
    let path = '*';

    if (exp.left.isDIObj && typeof operators[exp.operator][exp.left.value] === 'function') {
        path = exp.left.value
    }

    return operators[exp.operator][path](leftOperand, rightOperand);
}

export {
    parseExp,
    executeExp,
    registerOperator,
    unregisterOperator
}