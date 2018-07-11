let store = {
    '==': {
        '*': (a, b) => (a === b)
    },
    '!=': {
        '*': (a, b) => (a !== b)
    },
    '>=': {
        '*': (a, b) => (a >= b)
    },
    '<=': {
        '*': (a, b) => (a <= b)
    },
    '~=': {
        '*': (a, b) => { // contains in array
            if (!Array.isArray(b)) return false;
            return b.includes(a);
        }
    },
    '^=': {
        '*': (a, b) => { // not contains in array
            if (!Array.isArray(b)) return false;
            return !(b.includes(a));
        }
    },
    '?=': {
        '*': (a, b) => { // attribute is absent or equivalent
            if (!a) return true;
            return a === b;
        }
    },
    '=': {
        '*': (a, b) => (a === b)
    },
    '>': {
        '*': (a, b) => (a > b)
    },
    '<': {
        '*': (a, b) => (a < b)
    }
};

function getOperators() {
    return store;
}

function registerOperator(operatorStr, namespace, implementationFn) {
    store[operatorStr] = store[operatorStr] || {};
    store[operatorStr][namespace] = implementationFn;

    // we need to sort the operators from the longest to the shorter ones to avoid interception
    const obj = {};
    Object.entries(store)
        .sort((a, b) => {
            if (a[0].length < b[0].length) {
                return 1;
            }
            if (a[0].length > b[0].length) {
                return -1;
            }

            return 0;
        })
        .forEach(function (data) {
            obj[data[0]] = data[1]
        });
    store = obj;
}

function unregisterOperator(operatorStr, namespace) {
    let container = store[operatorStr];
    delete container[namespace];

    if (Object.keys(container).length === 0) {
        delete store[operatorStr];
    }
}

export {
    getOperators,
    registerOperator,
    unregisterOperator
};