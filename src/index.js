import {parseExp, executeExp, Operator, Mutator} from './target';
import {prepareCollection} from './shared';
import Adapter from './adapter';
import {
    createTokens,
    infixToRPN,
    fillTokens,
    evaluateRPN,
    wrapToToken
} from './expression';

const _property = Symbol(); // inner property name
const USER = 'user.';
const RESOURCE = 'resource.';
const CONDITION = 'condition';
const WATCHER = 'watcher';
const BOOL = 'boolean';
const DENY = 'deny';

function checkOperand(oper, objStr) {
    return oper.isDIObj && oper.value.indexOf && oper.value.indexOf(objStr) === 0;
}

function collectResult(obj, data, property, resourceName) {
    const context = {}, targetResults = [];

    obj[_property][property].forEach((expr) => {
        targetResults.push(prepareCollection(data, expr, context, resourceName));
    });

    return obj.adapter(targetResults);
}

function prepareForNext(obj, uniqID, _exp, propName, resourceName, callback) {
    const operators = Operator.list, exp = JSON.parse(JSON.stringify(_exp));
    let tempObj;

    if (checkOperand(exp.left, resourceName)) {
        obj[_property][propName][uniqID].push(exp);
    } else if (checkOperand(exp.right, resourceName)) {
        tempObj = exp.right;
        exp.right = exp.left;
        exp.left = tempObj;
        if (operators[exp.operator].reverse) {
            exp.operator = operators[exp.operator].reverse;
        }

        obj[_property][propName][uniqID].push(exp);
    } else if (callback) {
        callback(exp);
    }
}

function policyConstructor(jsonPolicy) {
    let uniqID = Math.random().toString(36).substr(2, 9);
    this[_property] = {
        expression: [wrapToToken(uniqID)],
        target: {[uniqID]: []},
        condition: {[uniqID]: []},
        watcher: {[uniqID]: []},
    };

    jsonPolicy.target
        .map(expStr => parseExp(expStr))
        .forEach((_exp) => {
            // collect watchers
            prepareForNext(this, uniqID, _exp, WATCHER, USER);

            // collect conditions, if it is not a condition, paste it to target array
            prepareForNext(this, uniqID, _exp, CONDITION, RESOURCE, (exp) => {
                this[_property].target[uniqID].push(exp);
            });
        });

    return uniqID;
}

function groupConstructor(jsonPolicy) {
}

class Policy {

    constructor(jsonPolicy) {
        this.adapter = Adapter.MongoJSONb;

        if (jsonPolicy.hasOwnProperty('target')) {
            policyConstructor.call(this, jsonPolicy);
        } else {
            groupConstructor(jsonPolicy);

        }
        this[_property].effect = jsonPolicy.effect !== DENY;
        this[_property].lastData = null;
    }

    check(data) {
        const resultCollection = {};

        for (const policyKey in this[_property].target) {
            const context = {}, targetResults = {};

            resultCollection[policyKey] = true;

            this[_property].target[policyKey].forEach((targetExp) => {
                // generate unique random key
                const key = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                const tmp = executeExp(data, targetExp, context, key);

                if (typeof tmp === BOOL) {
                    targetResults[key] = tmp;
                } else {
                    Object.assign(targetResults, tmp);
                }
            });

            // calculate final result
            Object.values(targetResults).forEach((value) => {
                resultCollection[policyKey] = resultCollection[policyKey] && value;
            });
        }

        let result = evaluateRPN(fillTokens(this[_property].expression, resultCollection)).res;

        // apply effect to bool result
        result = this[_property].effect ? result : !result;

        // save data for next `getConditions` methods
        this[_property].lastData = result ? data : undefined;

        return result;
    }

    setAdapter(adapter) {
        this.adapter = adapter;
    }

    getConditions() {
        if (this[_property].lastData === undefined)
            return undefined;

        return collectResult(this, this[_property].lastData, CONDITION, RESOURCE);
    }

    getWatchers(data) {
        return collectResult(this, data, WATCHER, USER);
    }
}

export {
    Policy,
    Operator,
    Mutator,
    Adapter
}