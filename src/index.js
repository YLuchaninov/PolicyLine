import {parseExp, executeExp, Operator, Mutator} from './target';
import {prepareCollection} from './shared';
import Adapter from './adapter';
import {
    processRPN,
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
const ENV = 'env.';
const ACTION = 'action.';
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
    const rules = {}, resource = type === CONDITION ? RESOURCE : USER;

    Object.keys(policy[_property][type]).forEach((key) => {
        try {
            rules[key] = collectResult(policy, data, type, key, resource);

            if (dependencyGuard(rules[key])) {
                rules[key] = undefined;
            }
        } catch (error) {
            // important to close error in calculate result
        }
    });

    return rules;
}

function dependencyGuard(obj) {
    let flag = false;
    Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === 'string' && (
            obj[key].indexOf(USER) === 0 ||
            obj[key].indexOf(RESOURCE) === 0 ||
            obj[key].indexOf(ENV) === 0 ||
            obj[key].indexOf(ACTION) === 0
        )) {
            flag = true;
        } else if (typeof obj[key] === 'object') {
            flag = dependencyGuard(obj[key]);
        }
    });

    return flag;
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

        const rules = aggregateResult(this, CONDITION, this[_property].lastData);

        const result = {};
        Object.entries(rules).forEach((item) => {
            if (this[_calcResult].val.includes(item[0])) {
                mergeDeep(result, item[1]);
            }
        });

        this[_calcResult] = {};
        this[_property].lastData = undefined;

        return mergeDeep(result, data.resource);
    }

    getWatchers(data) {
        if (data) { // remove external dependency on data.user
            delete data.user;
        }

        const rules = aggregateResult(this, WATCHER, data);
        const result = processRPN(fillTokens(this[_property].expression, rules));
        return result ? result.res : undefined;
    }
}

export {
    Policy,
    Operator,
    Mutator,
    Adapter
}