import {extract} from './shared';


function prepareCondition(inputData, exp, context) {
    const leftOperand = extract(inputData, exp.left, context, null);
    const rightOperand = extract(inputData, exp.right, context, null);

    return {
        resource: leftOperand === null ? exp.left.value : leftOperand,
        value: rightOperand === null ? exp.right.value : rightOperand,
        operator: exp.operator,
        mutators: exp.left.mutators
    };
}

const Adapter = {
    MongoJSONb: a => a,
};

export {
    Adapter,
    prepareCondition
}