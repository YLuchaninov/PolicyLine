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
import {mergeDeep} from "./utils";

const _property = Symbol(); // inner property name
const _calcResult = Symbol();
const USER = 'user.';
const RESOURCE = 'resource.';
const CONDITION = 'condition';
const WATCHER = 'watcher';
const BOOL = 'boolean';
const DENY = 'deny';

function checkOperand(oper, objStr) {
    return oper.isDIObj && oper.value.indexOf && oper.value.indexOf(objStr) === 0;
}

function collectResult(obj, data, property, key, resourceName) {
    const context = {}, targetResults = [];

    obj[_property][property][key].forEach((expr) => {
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
}

function aggregateResult(policy, type, data) {
    const rules = {}, result = {}, resource = type === CONDITION ? RESOURCE : USER;

    Object.keys(policy[_property][type]).forEach((key) => {
        try {
            rules[key] = collectResult(policy, data, type, key, resource);
        } catch (error) {
            // important to close error in calculate result
        }
    });

    let array = Object.entries(rules);
    array.forEach((item) => {
        if (policy[_calcResult].val.includes(item[0])) {
            mergeDeep(result, item[1]);
        }
    });

    return result;
}

function groupConstructor(jsonPolicy) {
    this[_property] = {
        expression: infixToRPN(createTokens(jsonPolicy.expression)),
        target: {},
        condition: {},
        watcher: {},
    };

    Object.keys(jsonPolicy.policies).forEach((key) => {
        const policy = jsonPolicy.policies[key];
        this[_property].target[key] = [];
        this[_property].condition[key] = [];
        this[_property].watcher[key] = [];

        policy.target
            .map(expStr => parseExp(expStr))
            .forEach((_exp) => {
                // collect watchers
                prepareForNext(this, key, _exp, WATCHER, USER);

                // collect conditions, if it is not a condition, paste it to target array
                prepareForNext(this, key, _exp, CONDITION, RESOURCE, (exp) => {
                    this[_property].target[key].push(exp);
                });
            });
    });
}

class Policy {

    constructor(jsonPolicy) {
        this.adapter = Adapter.MongoJSONb;

        if (jsonPolicy.hasOwnProperty('target')) {
            policyConstructor.call(this, jsonPolicy);
        } else {
            groupConstructor.call(this, jsonPolicy);
        }
        this[_property].effect = jsonPolicy.effect !== DENY;
        this[_property].lastData = null;
    }

    check(data = {}) {
        const resultCollection = {};

        Object.keys(this[_property].target).forEach((policyKey) => {
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
        });

        this[_calcResult] = evaluateRPN(fillTokens(this[_property].expression, resultCollection));

        // apply effect to bool result
        const result = this[_property].effect ? this[_calcResult].res : !this[_calcResult].res;

        // save data for next `getConditions` methods
        this[_property].lastData = result ? data : undefined;

        return result;
    }

    setAdapter(adapter) {
        this.adapter = adapter;
    }

    getConditions(currentData) {
        if ((this[_property].effect ? this[_calcResult].res : !this[_calcResult].res) === false)
            return undefined;

        currentData = currentData || {};

        const data = {
            user: mergeDeep(currentData.user, this[_property].lastData.user),
            action: mergeDeep(currentData.action, this[_property].lastData.action),
            env: mergeDeep(currentData.env, this[_property].lastData.env),
            resource: mergeDeep(currentData.resource, this[_property].lastData.resource)
        };

        const result = mergeDeep(aggregateResult(this, CONDITION, this[_property].lastData), data.resource);

        this[_calcResult] = {};
        this[_property].lastData = undefined;

        return result;
    }

    getWatchers(data) {
        this.check(data);

        const result = aggregateResult(this, WATCHER, data);

        this[_calcResult] = {};
        this[_property].lastData = undefined;

        return result;
    }
}

export {
    Policy,
    Operator,
    Mutator,
    Adapter
}