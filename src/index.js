import {compilePolicy, settings} from './target';
import {prepareCondition, calculateCondition} from './condition';
import {
    createTokens,
    infixToRPN,
    fillTokens,
    evaluateRPN,
    wrapToToken
} from './expression';
import {mergeDeep} from './utils';
import {DI} from "./di";

let property = Symbol();
let calcResult = Symbol();

class Policy {
    _groupConstructor(origin) {
        this._expression = infixToRPN(createTokens(origin.expression));

        this._targets = {};
        this._conditions = {};
        for (const key in origin.policies) {
            let {target, algorithm, effect, condition} = origin.policies[key];
            this._targets[key] = compilePolicy(target, algorithm, effect);
            this._conditions[key] = prepareCondition(condition || []);
        }
    }

    _singleConstructor(target, algorithm, effect, condition) {
        let uniqID = Math.random().toString(36).substr(2, 9);

        this._expression = [wrapToToken(uniqID)];
        this._targets = {
            [uniqID]: compilePolicy(target, algorithm, effect)
        };
        this._conditions = {
            [uniqID]: prepareCondition(condition || [])
        };
    }

    _mergeConstructor(origin, source, operation) {
        this._expression = origin._expression.concat(source._expression, wrapToToken(operation));
        this._targets = Object.assign({}, origin._targets, source._targets);
        this._conditions = Object.assign({}, origin._conditions, source._conditions);
    }

    constructor(origin, source, effect) {
        if (origin.policies !== undefined) {
            this._groupConstructor(origin);
        } else if (source === undefined && effect === undefined) {
            this._singleConstructor(origin.target, origin.algorithm, origin.effect, origin.condition);
        } else {
            this._mergeConstructor(origin, source, effect);
        }

        // private container for 'condition' part
        this[property] = {};
    }

    check(user, action, env, resource) {
        let result = {};
        for (const key in this._targets) {
            result[key] = this._targets[key](user, action, env, resource);
        }

        // save data for 'condition'
        this[property] = {user, action, env, resource};
        this[calcResult] = evaluateRPN(fillTokens(this._expression, result));

        return this[calcResult].res;
    }

    condition(user, action, env, resource) {
        if (!this[calcResult].res) {
            return;
        }

        let data = {
            user: mergeDeep(user, this[property].user),
            action: mergeDeep(action, this[property].action),
            env: mergeDeep(env, this[property].env),
            resource: mergeDeep(resource, this[property].resource)
        };
        this[property] = {};

        try {
            let conditions = {}, condition = {};
            for (const key in this._conditions) {
                conditions[key] = calculateCondition({}, this._conditions[key], data);
            }

            let array = Object.entries(conditions);
            array.forEach((item) => {
                if (this[calcResult].val.includes(item[0])) {
                    mergeDeep(condition, item[1]);
                }
            });

            data.condition = mergeDeep(condition, data.resource);
        } catch (e) {
            data = e;
        }
        this[calcResult] = {};

        return data;
    }

    and(policy) {
        return new Policy(this, policy, 'AND');
    }

    or(policy) {
        return new Policy(this, policy, 'OR');
    }
}

// service DI
DI.loadPresets();

export {
    Policy,
    DI,
    settings
}