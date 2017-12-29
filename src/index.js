const namespace = 'abac_di';

const settings = {
    log: true
};

function parseRule(rule) {
    let ruleReg = /([^<>=]+)\s?([<>=!]{1,2})\s?(.+)/;
    try {
        let ruleArray = ruleReg.exec(rule).slice(1, 4);
        if (ruleArray[1] === '=' || ruleArray[1] === '==') {
            ruleArray[1] = '==='
        }
        rule = ruleArray.join('');

        // DI section
        let di = '';
        if (global[namespace] !== undefined) {
            for (const key of Object.keys(global[namespace])) {
                if (rule.includes(key)) {
                    di += 'var ' + key + '=' + namespace + '.' + key + ';';
                }
            }
        }

        // create returning function
        return new Function('user', 'action', 'env', 'resource',
            'var _a;' + di + 'try{_a=!!(' + rule + ');}catch(_e){_a=_e};return _a;');
    } catch (e) {
        return new Function('return new Error("in access rule: ' + rule + '");');
    }
}

let DI = {
    register(name, fn) {
        if (global[namespace] === undefined) {
            global[namespace] = {};
        }

        if (typeof name === 'function') {
            global[namespace][name.name] = name;
        } else {
            global[namespace][name] = fn;
        }
    },

    unregister(name) {
        if (global[namespace] === undefined) {
            return;
        }

        delete global[namespace][(typeof name === 'function') ? name.name : name];
    },

    clear() {
        delete global[namespace];
    }
};

// todo refactoring
function createTargetPolicy(target, algorithm = 'all', effect = 'deny') {
    let flag = !(algorithm === 'any');
    let rules = [];
    for (let i = 0; i < target.length; i++) {
        rules[i] = parseRule(target[i]);
    }

    return function (user, action, env, resource) {
        let result = flag;

        for (let i = 0; i < target.length; i++) {
            let ruleResult = rules[i](user, action, env, resource);

            // any case with errors to deny of whole policy
            if (typeof ruleResult === 'object') {
                if (settings.log) {
                    console.error(ruleResult);
                }
                return false;
            }

            // using the algorithm
            result = flag ? (result && ruleResult) : (result || ruleResult);
        }

        return (effect === "deny") ? !result : result;
    }
}

class Policy {
    constructor(origin, policy, effect) {
        this._expression = '';
        this._policies = {};

        // constructor part
        if (policy === undefined && effect === undefined) {
            let uniqID = '_' + Math.random().toString(36).substr(2, 9);
            this._expression += 'data.' + uniqID;
            this._policies[uniqID] = createTargetPolicy(origin.target, origin.algorithm, origin.effect);
        } else {
            // create new policy from existing two
            this._expression = origin._expression + effect + policy._expression;
            Object.assign(this._policies, origin._policies, policy._policies);
        }
    }

    check(user, action, env, resource) {
        let result = {};
        for (let key of Object.keys(this._policies)) {
            result[key] = this._policies[key](user, action, env, resource);
        }

        return (new Function('data', 'return ' + this._expression + ';'))(result);
    }

    and(policy) {
        return new Policy(this, policy, '&&');
    }

    or(policy) {
        return new Policy(this, policy, '||');
    }
}

// static methods
Policy.createTargetPolicy = createTargetPolicy;
Policy.parseRule = parseRule;

export {
    Policy,
    DI,
    settings
}