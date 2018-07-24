import {extract} from './shared';


function prepareCondition(inputData, exp, context, key) {
    const leftOperand = extract(inputData, exp.left, context, key);
    const rightOperand = extract(inputData, exp.right, context, key);

    // todo add mutators
    return {
        left: leftOperand === null ? exp.left.value : leftOperand,
        right: rightOperand === null ? exp.right.value : rightOperand,
        operator: exp.operator
    };
}

export {
    prepareCondition
}