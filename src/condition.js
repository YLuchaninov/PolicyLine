import {getOperators, registerOperator, unregisterOperator} from './operator';
import {getMutators, prefix, postfix, registerMutator, unregisterMutator} from './mutator';

// todo move to utils
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

// todo move to utils
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

        fn = getMutators()[mutator];
        if (fn && typeof fn !== 'function') {
            fn = fn[prefix];
        }

        value = fn ? fn(value, tmpContext) : value;
    }
    return value;
}

function composeCondition(inputData, exp, context, key) {
    // const operators = getOperators();
    const leftOperand = extract(inputData, exp.left, context, key);
    const rightOperand = extract(inputData, exp.right, context, key);
    // let path = '*';
    //
    // if (exp.left.isDIObj && typeof operators[exp.operator][exp.left.value] === 'function') {
    //     path = exp.left.value;
    // } else if (exp.right.isDIObj && typeof operators[exp.operator][exp.right.value] === 'function') {
    //     path = exp.right.value;
    // }

    // let result = operators[exp.operator][path](leftOperand, rightOperand);
    //
    let data = {
        leftValue: leftOperand === null ? exp.left.value : leftOperand,
        rightValue: rightOperand === null ? exp.right.value : rightOperand,
    };

    console.log(data);

    // postfixApply(exp.left, data, context, key);
    // postfixApply(exp.right, data, context, key);

    // return data.result;
}

export {
    composeCondition
}