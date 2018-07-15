import {getOperators, registerOperator, unregisterOperator} from './operator';
import {mutators, prefix, postfix} from './mutator';

// todo change to more stronger RegExp
const leftRegExp = /\.{1,2}|\w*/;
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
    const mutators = array.slice(1, array.length);
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
        mutators
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
    let tmpContext, fn, value = operand.value;
    if (operand.isDIObj) {
        value = unwrapNamespace(data, value)
    }

    for (let mutator of operand.mutators) {
        if (operand.isDIObj) {
            context[operand.value] = context[operand.value] || {};
            tmpContext = context[operand.value];
        }

        fn = mutators[mutator];
        if (typeof fn !== 'function') {
            fn = fn[prefix];
        }

        value = fn(value, tmpContext);
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

function postfixApply(operand, data, context, key){
    for (let mutator of operand.mutators) {
        if (operand.isDIObj && typeof mutators[mutator] === 'object') {
            data.result = mutators[mutator][postfix](data, context[operand.value], key);
        }
    }
}

function executeExp(inputData, exp, context, key) {
    const operators = getOperators();
    const leftOperand = extract(inputData, exp.left, context, key);
    const rightOperand = extract(inputData, exp.right, context, key);
    let path = '*';

    if (exp.left.isDIObj && typeof operators[exp.operator][exp.left.value] === 'function') {
        path = exp.left.value
    }

    let result = operators[exp.operator][path](leftOperand, rightOperand);

    let data = {
        leftValue: exp.left.value,
        rightValue: exp.right.value,
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
    unregisterOperator
}