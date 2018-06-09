import files from './DI/index';

const namespace = 'abac_di';

const settings = {
    log: true
};

function compileRule(rule) {
    let ruleReg = /([^<>=]+)\s?([<>=!]{1,2})\s?(.+)/;
    try {
        let ruleArray = ruleReg.exec(rule);
        if (ruleArray) {
            ruleArray = ruleArray.slice(1, 4);
            if (ruleArray[1] === '=' || ruleArray[1] === '==') {
                ruleArray[1] = '==='
            }
            rule = ruleArray.join('');
        }

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

function compileCondition(condition) {
    let conditionReg = /([\w\.\'\"\$]+)\s?([<>=!]{1,2})\s?(.+)/; // more stricter than 'target' regexp
    let conditionArray = conditionReg.exec(condition).slice(1, 4);

    conditionArray[0] = conditionArray[0].replace('resource.', '');
    return conditionArray;
}

function createCondition(expr) {
    return new Function('user', 'action', 'env', 'resource', 'return ' + expr + ';');
}

function wrap(namespace, container, value) {
    let key = namespace.substring(0, namespace.indexOf('.'));
    let name = namespace.substring(namespace.indexOf('.') + 1);

    if (namespace.indexOf('\'') === 0 || namespace.indexOf('"') === 0) {
        key = '';
        name = namespace.replace(/[\'\"]/g, '');
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

function prepareCondition(conditions) {
    let result = {};
    for (let condition of conditions) {
        let rule = compileCondition(condition);
        if (rule[1] === '=' || rule[1] === '==') {
            result[rule[0]] = createCondition(rule[2]);
        } else {
            result[rule[0]] = [rule[1], createCondition(rule[2])];
        }
    }
    return wrapNamespaces(result);
}

function calculateCondition(target, source, data) { // todo .user
    for (let key in source) {
        if (Array.isArray(source[key])) {
            target[key] = [source[key][0]];
            target[key].push(source[key][1](data.user, data.action, data.env, data.resource));
        } else if (typeof source[key] === 'function') {
            target[key] = source[key](data.user, data.action, data.env, data.resource)
        } else {
            target[key] = {};
            calculateCondition(target[key], source[key], data);
        }
    }
    return target;
}

function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item) && item !== null && !(item instanceof RegExp));
}

function mergeDeep(target, source) {
    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, {[key]: {}});
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, {[key]: source[key]});
            }
        }
    }
    return target || source;
}

let property = Symbol();
let calcResult = Symbol();

class Policy {
    _groupConstructor(origin) {
        this._expression = compileGroupExpression(origin);
        this._targets = {};
        this._conditions = {};
        for (const key in origin.policies) {
            let {target, algorithm, effect, condition} = origin.policies[key];
            this._targets[key] = compilePolicy(target, algorithm, effect);
            this._conditions[key] = prepareCondition(condition || []);
        }
    }

    _singleConstructor(target, algorithm, effect, condition) {
        let uniqID = '_' + Math.random().toString(36).substr(2, 9);
        this._expression = 'data.' + uniqID;
        this._targets = {
            [uniqID]: compilePolicy(target, algorithm, effect)
        };
        this._conditions = {
            [uniqID]: prepareCondition(condition || [])
        };
    }

    _mergeConstructor(origin, source, effect) {
        this._expression = origin._expression + effect + source._expression;
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
        this[calcResult] = result;

        return (new Function('data', 'return ' + this._expression + ';'))(result);
    }

    condition(user, action, env, resource) {
        let data = {
            user: mergeDeep(user, this[property].user),
            action: mergeDeep(action, this[property].action),
            env: mergeDeep(env, this[property].env),
            resource: mergeDeep(resource, this[property].resource)
        };
        this[property] = {};

        try {
            let conditions = {};
            for (const key in this._conditions) {
                conditions[key] = calculateCondition({}, this._conditions[key], data);
            }

            // todo ///////////////////
            let array = Object.values(conditions);
            let condition = {};

            array.forEach((item) => {
                mergeDeep(condition, item);
            });

            this[calcResult] = {};
            /////////////////////////////////////////

            data.condition = mergeDeep(condition, data.resource);
        } catch (e) {
            data = e;
        }

        return data;
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