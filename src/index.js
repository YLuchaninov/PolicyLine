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

function mix(target, source) {
    if (typeof target !== 'object' && target !== null) {
        return source;
    }

    return Object.assign(target, source);
}

function compileCondition(condition) {
    let conditionReg = /([^<>=]+)\s?([<>=!]{1,2})\s?(.+)/; // todo change RegExp to more stricter
    let conditionArray = conditionReg.exec(condition).slice(1, 4);

    conditionArray[0] = conditionArray[0].replace('resource.', '');

    return conditionArray;
}

function calculateCondition(expr, data) {
    return (new Function('user', 'action', 'env', 'resource', 'return ' +
        expr + ';'))(data.user, data.action, data.env, data.resource);
}

function wrap(namespace, container, value) {
    let key = namespace.substring(0, namespace.indexOf('.'));
    let name = namespace.substring(namespace.indexOf('.') + 1);

    if (namespace.indexOf('\'') === 0 || namespace.indexOf('"') === 0) {
        key = '';
        name = namespace.replace(/[\'\"]/g,'');
    }

    if (name && name.includes('.') && key.length) {
        if (!container[key])
            container[key] = {};
        wrap(name, container[key], value);
    } else if (key.length) {
        if (!container[key])
            container[key] = {};
        container[key][name] = value;
    } else {
        container[name] = value;
    }

    return container;
}

function wrapNamespaces(obj) {
    for (let key in obj) {
        if (key.includes('.')) {
            wrap(key, obj, obj[key]);
            delete obj[key];
        }
    }

    return obj;
}

function prepareCondition(conditions, data) { // todo move it to construction part for performance(except 'calculate')
    let result = {};
    try {
        for (let condition of conditions) {
            let rule = compileCondition(condition);
            if (rule[1] === '=' || rule[1] === '==') {
                result[rule[0]] = calculateCondition(rule[2], data);
            } else {
                result[rule[0]] = [rule[1], calculateCondition(rule[2], data)];
            }
        }
        result = wrapNamespaces(result);
    } catch (e) {
        return e;
    }
    return result;
}

let property = Symbol();

class Policy {
    _groupConstructor(origin) {
        this._expression = compileGroupExpression(origin);
        this._policies = {};
        for (const key in origin.policies) {
            let {target, algorithm, effect} = origin.policies[key];
            this._policies[key] = compilePolicy(target, algorithm, effect);
        }
        // todo this._condition =
    }

    _singleConstructor(target, algorithm, effect, condition) {
        let uniqID = '_' + Math.random().toString(36).substr(2, 9);
        this._expression = 'data.' + uniqID;
        this._policies = {
            [uniqID]: compilePolicy(target, algorithm, effect)
        };

        // todo
        this._condition = condition;
    }

    _mergeConstructor(origin, source, effect) {
        this._expression = origin._expression + effect + source._expression;
        this._policies = Object.assign({}, origin._policies, source._policies);
        // todo this._condition =
    }

    constructor(origin, source, effect) {
        // todo add 'condition' part

        if ((origin.expression !== undefined) && (origin.policies !== undefined)) {
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
        for (const key in this._policies) {
            result[key] = this._policies[key](user, action, env, resource);
        }

        // save data for 'condition'
        this[property] = {user, action, env, resource};

        return (new Function('data', 'return ' + this._expression + ';'))(result);
    }

    condition(user, action, env, resource) {
        let result = {
            user: mix(user, this[property].user),
            action: mix(action, this[property].action),
            env: mix(env, this[property].env),
            resource: mix(resource, this[property].resource)
        };

        result.condition = this._condition ? prepareCondition(this._condition, result) : undefined;

        // clear private container
        this[property] = {};

        // if error - return error
        return (result.condition instanceof Error) ? result.condition : result;
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