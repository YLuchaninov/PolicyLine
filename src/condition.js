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

const OperatorMap = {
    '=': '$eq',	//Matches values that are equal to a specified value.
    '==': '$eq', //Matches values that are equal to a specified value.
    '!=': '$ne', //Matches all values that are not equal to a specified value.
    '>=': '$gte', //Matches values that are greater than or equal to a specified value.
    '>': '$gt',	//Matches values that are greater than a specified value.
    '<=': '$lte', //Matches values that are less than or equal to a specified value.
    '<': '$lt',	//Matches values that are less than a specified value.
    '~=': '$in', //Matches any of the values specified in an array.
    '^=': '$nin', //Matches none of the values specified in an array.
};

const MutatorMap = {
    'or': () => {
    },
    'radius': () => {
    },
    'inArea': () => {
    }
};

const Adapter = {
    MongoJSONb: rules => {
        const result = {};
        let attribute;
        for (let rule of rules) {
            attribute = rule.resource.replace('resource.', '');
            if (result[attribute]) {
                result[attribute][OperatorMap[rule.operator]] = rule.value;
            } else {
                if (rule.operator === '=') {
                    result[attribute] = rule.value;
                } else {
                    result[attribute] = {
                        [OperatorMap[rule.operator]]: rule.value
                    }
                }
            }
        }

        return result;
    },
};

export {
    Adapter,
    prepareCondition
}