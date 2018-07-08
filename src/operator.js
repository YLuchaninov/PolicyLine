// todo: add mechanism for adding new operators and override existing for specific cases(attributes, like 'user.location'
// or override by wildcard '*')

const OperatorsMap = {
    '=': (a, b) => (a === b),
    '==': (a, b) => (a === b),
    '!=': (a, b) => (a !== b),
    '>': (a, b) => (a > b),
    '<': (a, b) => (a < b),
    '>=': (a, b) => (a >= b),
    '<=': (a, b) => (a <= b),
    '~=': (a, b) => { // contains in array
        if (!Array.isArray(b)) return false;
        return b.includes(a);
    },
    '^=': (a, b) => { // not contains in array
        if (!Array.isArray(b)) return false;
        return !(b.includes(a));
    },
    '?=': (a, b) => { // attribute is absent or equivalent
        if (!a) return true;
        return a === b;
    }
};

// todo: add the next:
// 1) arrays intersection
// 2) arrays not intersection

export default OperatorsMap;