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

    return obj.adapter.proceed(targetResults);
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

function policyConstructor(policy) {
    let key = Math.random().toString(36).substr(2, 9);
    this[_property] = {
        expression: [wrapToToken(key)],
        target: {[key]: []},
        filterTarget: {[key]: []},
    };

    policyParse(policy, key, this);
}

function groupConstructor(jsonPolicy) {
    this[_property] = {
        expression: infixToRPN(createTokens(jsonPolicy.expression)),
        target: {},
        filterTarget: {},
    };

    Object.keys(jsonPolicy.policies).forEach((key) => {
        const policy = jsonPolicy.policies[key];
        this[_property].target[key] = [];
        this[_property].filterTarget[key] = [];

        policyParse(policy, key, this);
    });
}

function prepareFor(propName, key, context, _exp) {
    const operators = Operator.list;
    const exp = JSON.parse(JSON.stringify(_exp));
    const resourceName = propName === WATCHER ? USER : RESOURCE;

    /*
        We have a restriction; we cannot have a prepared property on both sides of the expression.
        This contradicts the logic of computation - it makes no sense to compare
        two different attributes of the same object.
     */
    if (checkOperand(exp.left, resourceName)) { // fill if expression in left side
        context[_property][propName][key].push(exp);
    } else if (checkOperand(exp.right, resourceName)) { // turn over expression
        let tempObj = exp.right;
        exp.right = exp.left;
        exp.left = tempObj;
        if (operators[exp.operator].reverse) {
            exp.operator = operators[exp.operator].reverse;
        }

        context[_property][propName][key].push(exp);
    }
}

function policyParse(policy, key, context) {
  policy.target
        .map(expStr => parseExp(expStr))
        .forEach((_exp) => {
            context[_property].target[key].push(_exp);
        });
}

function attributeCheck(obj) {
    const attrs = ['user', 'resource', 'action', 'env'];
    if (typeof obj === 'object') {
        Object.keys(obj).forEach((attr) => {
            const index = attrs.indexOf(attr);
            if (index > -1) {
                attrs.splice(index, 1);
            }
        });
    }
    return attrs;
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

    check(data) {
        // guard part
        const missingAttrs = attributeCheck(data);
        if (missingAttrs.length > 1) {
            throw new Error(data.toString() + 'should contain any more than two attributes from: "user", "action", "resource" or "env"');
        }

        const filterTarget = missingAttrs[0];

        // clear storage
        Object.keys(this[_property].target).forEach((key) => {
            this[_property].filterTarget[key] = [];
        });

        const resultCollection = {};

        Object.keys(this[_property].target).forEach((policyKey) => {
            const context = {}, targetResults = {};

            resultCollection[policyKey] = true;

            // calculate separate rules for one policy
            this[_property].target[policyKey].forEach((targetExp) => {
                // generate unique random key
                const key = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                const tmp = executeExp(data, targetExp, context, key, filterTarget);

                if (typeof tmp === BOOL) {
                    targetResults[key] = tmp;
                } else if (typeof tmp === 'object' && tmp.flag) {
                  // prepareFor(WATCHER, policyKey, this, targetExp);
                  // prepareFor(CONDITION, policyKey, this, targetExp);
                } else {
                    Object.assign(targetResults, tmp);
                }
            });

            // calculate final result for single policy
            Object.values(targetResults).forEach((value) => {
                resultCollection[policyKey] = resultCollection[policyKey] && value;
            });
        });

        /* fill data for future using */
        this[_calcResult] = evaluateRPN(fillTokens(this[_property].expression, resultCollection));

        // apply effect to bool result
        const result = this[_property].effect ? this[_calcResult].res : !this[_calcResult].res;

        // save data for next `getConditions` methods
        this[_property].lastData = result ? data : undefined;
        /**/

        return result;
    }

    setAdapter(adapter) {
        this.adapter = adapter;
    }

    getConditions() {
        // if ((this[_property].effect ? this[_calcResult].res : !this[_calcResult].res) === false)
        //     return undefined;
        //
        // const resource = this[_property].lastData.resource;
        // this[_property].lastData.resource = null;
        //
        // const rules = aggregateResult(this, CONDITION, this[_property].lastData);
        //
        // const result = {};
        // Object.entries(rules).forEach((item) => {
        //     if (this[_calcResult].val.includes(item[0])) {
        //         mergeDeep(result, item[1]);
        //     }
        // });
        //
        // this[_calcResult] = {};
        // this[_property].lastData = undefined;
        //
        // return mergeDeep(result, resource);
    }

    getWatchers(data) {
        // if (data) { // remove external dependency on data.user
        //     delete data.user;
        // }
        //
        // const rules = aggregateResult(this, WATCHER, data);
        // const result = processRPN(fillTokens(this[_property].expression, rules), this.adapter);
        // return result ? this.adapter.optimize(result.res) : undefined;
    }
}

export {
    Policy,
    Operator,
    Mutator,
    Adapter
}