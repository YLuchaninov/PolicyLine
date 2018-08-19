import {parseExp, executeExp, Operator, Mutator} from './target';
import {prepareCollection} from './shared';
import Adapter from './adapter';

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
    const context = {}, results = [];

    obj[_property][property].forEach((expr) => {
        results.push(prepareCollection(data, expr, context, resourceName));
    });

    return obj.adapter(results);
}

function prepareForNext(obj, _exp, propName, resourceName, callback) {
    const operators = Operator.list, exp = JSON.parse(JSON.stringify(_exp));
    let tempObj;

    if (checkOperand(exp.left, resourceName)) {
        obj[_property][propName].push(exp);
    } else if (checkOperand(exp.right, resourceName)) {
        tempObj = exp.right;
        exp.right = exp.left;
        exp.left = tempObj;
        if (operators[exp.operator].reverse) {
            exp.operator = operators[exp.operator].reverse;
        }

        obj[_property][propName].push(exp);
    } else if (callback) {
        callback(exp);
    }
}

class Policy {

    constructor(jsonPolicy) {
        this.adapter = Adapter.MongoJSONb;

        this[_property] = {
            effect: jsonPolicy.effect !== DENY,
            target: [],
            condition: [],
            watcher: [],
            lastData: null
        };

        jsonPolicy.target
            .map(expStr => parseExp(expStr))
            .forEach((_exp) => {
                prepareForNext(this, _exp, WATCHER, USER);
                prepareForNext(this, _exp, CONDITION, RESOURCE, (exp) => {
                    this[_property].target.push(exp);
                });
            });
    }

    check(data) {
        const context = {}, results = {};
        let key, tmp, result = true;

        // execute expressions(targets)
        for (let targetExp of this[_property].target) {
            // generate unique random key
            key = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);

            tmp = executeExp(data, targetExp, context, key);
            if (typeof tmp === BOOL) {
                results[key] = tmp;
            } else {
                Object.assign(results, tmp);
            }
        }

        // calculate final result
        Object.values(results).forEach((value) => {
            result = result && value;
        });

        // apply effect to result & return
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