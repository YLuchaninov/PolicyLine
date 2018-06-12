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
        let tmp, rule = compileCondition(condition);
        if (rule[1] === '=' || rule[1] === '==') {
            tmp = createCondition(rule[2]);
        } else {
            tmp = [rule[1], createCondition(rule[2])];
        }

        if (result[rule[0]] === undefined) {
            result[rule[0]] = tmp;
        } else {
            if (!Array.isArray(result[rule[0]])) {
                result[rule[0]] = [result[rule[0]]];
                result[rule[0]].flag = true; // notification flag
            }
            result[rule[0]].push(tmp);
        }
    }
    return wrapNamespaces(result);
}

function calculateCondition(target, source, data) {
    for (let key in source) {
        if (Array.isArray(source[key]) && !source[key].flag) {
            target[key] = [source[key][0]];
            target[key].push(source[key][1](data.user, data.action, data.env, data.resource));
        } else if (typeof source[key] === 'function') {
            target[key] = source[key](data.user, data.action, data.env, data.resource);
        } else if (Array.isArray(source[key])) {
            target[key] = [];
            for (let item of source[key]) {
                target[key].push(item(data.user, data.action, data.env, data.resource));
            }
        } else {
            target[key] = {};
            calculateCondition(target[key], source[key], data);
        }
    }
    return target;
}

export {
    prepareCondition,
    calculateCondition
}