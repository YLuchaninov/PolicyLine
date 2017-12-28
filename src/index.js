const namespace = 'abac_di';

function parseRule(rule) {
    let ruleReg = /([\d\w\.]+)\s?([<>=!]{1,2})\s?(.+)/; //todo change regexp for $fnName as a start part of expression
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
                    di += key + '=' + namespace + '.' + key + ';';
                }
            }
        }

        // create returning function
        return new Function('user', 'action', 'env', 'resource',
            'var _a;' + di + 'try{_a=!!(' + rule + ');}catch(_e){_a=_e};return _a');
    } catch (e) {
        return new Function('return new Error("in access rule: ' + rule + '");');
    }
}

function registerFunction(name, fn) {
    if (global[namespace] === undefined) {
        global[namespace] = {};
    }

    global[namespace][name] = fn;
}

function cleanRegistration() {
    global[namespace] = undefined;
}

function createTargetPolicy(target, algorithm = 'all', effect = 'deny') {
    let rules = [];
    for (let i = 0; i < target.length; i++) {
        rules[i] = parseRule(target[i]);
    }

    return function (user, action, env, resource) {
        let flag = !(algorithm === 'any');
        let result = flag;
        for (let i = 0; i < target.length; i++) {
            let ruleResult = rules[i](user, action, env, resource);

            // any case with errors to deny of whole policy
            if (typeof ruleResult === 'object') {
                console.error(ruleResult);
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
        if (policy === undefined && effect === undefined) {
            // create new policy
            let {target, algorithm, effect} = origin;
            this.check = createTargetPolicy(target, algorithm, effect);
        } else {
            // create new policy from two 'check' methods & operation
            this.check = function (user, action, env, resource) { // todo refactor for avoid of closer
                let a = origin(user, action, env, resource);
                let b = policy(user, action, env, resource);
                return (effect === '||') ? (a || b) : (a && b);
            };
        }
    }

    add(policy) {
        return new Policy(this.check, policy.check, '&&');
    }

    or(policy) {
        return new Policy(this.check, policy.check, '||');
    }
}

export {
    createTargetPolicy,
    Policy,
    parseRule,
    registerFunction,
    cleanRegistration
}