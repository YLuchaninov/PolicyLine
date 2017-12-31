import files from './DI/index';

const namespace = 'abac_di';

const settings = {
    log: true
};

function compileRule(rule) {
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
            for (const key in global[namespace]) {
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
    },

    loadPresets() {
        for (const fileName in files) {
            for (const fnName in files[fileName]) {
                DI.register(fnName, files[fileName][fnName]);
            }
        }
    }
};

function compilePolicy(target = [], algorithm = 'all', effect = 'deny') {
    let flag = !(algorithm === 'any');
    let rules = [];
    let deny = effect === "deny";

    target.forEach((rule) => {
        rules.push(compileRule(rule));
    });

    return function (user, action, env, resource) {
        let result = flag;

        for (let rule of rules) {
            let ruleResult = rule(user, action, env, resource);

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

        return deny ? !result : result;
    }
}

function compileGroupExpression(origin) {
    let re, expr = origin.expression;

    for (const key in origin.policies) {
        re = new RegExp('\\b' + key + '\\b', "g");
        expr = expr.replace(re, 'data.' + key);
    }

    return expr
        .replace(/\bAND\b/g, '&&')
        .replace(/\bOR\b/g, '||');
}

class Policy {
    _groupConstructor(origin) {
        this._expression = compileGroupExpression(origin);
        this._policies = {};
        for (const key in origin.policies) {
            let {target, algorithm, effect} = origin.policies[key];
            this._policies[key] = compilePolicy(target, algorithm, effect);
        }
    }

    _singleConstructor(target, algorithm, effect) {
        let uniqID = '_' + Math.random().toString(36).substr(2, 9);
        this._expression = 'data.' + uniqID;
        this._policies = {
            [uniqID]: compilePolicy(target, algorithm, effect)
        };
    }

    _mergeConstructor(origin, source, effect) {
        this._expression = origin._expression + effect + source._expression;
        this._policies = {};
        Object.assign(this._policies, origin._policies, source._policies);
    }


    constructor(origin, source, effect) {
        if ((origin.expression !== undefined) && (origin.policies !== undefined)) {
            this._groupConstructor(origin);
        } else if (source === undefined && effect === undefined) {
            this._singleConstructor(origin.target, origin.algorithm, origin.effect);
        } else {
            this._mergeConstructor(origin, source, effect);
        }
    }

    check(user, action, env, resource) {
        let result = {};
        for (const key in this._policies) {
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
Policy.compilePolicy = compilePolicy;
Policy.compileRule = compileRule;

// service DI
DI.loadPresets();

export {
    Policy,
    DI,
    settings
}