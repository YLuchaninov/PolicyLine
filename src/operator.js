let operators = {
  '==': {
    '*': (a, b) => (a === b)
  },
  '!=': {
    '*': (a, b) => (a !== b)
  },
  '>=': {
    '*': (a, b) => (a >= b),
    reverse: '<='
  },
  '<=': {
    '*': (a, b) => (a <= b),
    reverse: '>='
  },
  '~=': {
    // contains in array
    '*': (a, b) => Array.isArray(b) && b.includes(a),
    reverse: '~!'
  },
  '~!': {
    // contains in array
    '*': (b, a) => Array.isArray(b) && b.includes(a),
    reverse: '~='
  },
  '^=': {
    // not contains in array
    '*': (a, b) => Array.isArray(b) && !b.includes(a),
    reverse: '^!'
  },
  '^!': {
    // not contains in array
    '*': (b, a) => Array.isArray(b) && !b.includes(a),
    reverse: '^='
  },
  '?=': {
    // attribute is absent or equivalent
    '*': (a, b) => !a || a === b,
    reverse: '?!'
  },
  '?!': {
    // attribute is absent or equivalent
    '*': (b, a) => !a || a === b,
    reverse: '?='
  },
  '=': {
    '*': (a, b) => a === b
  },
  '>': {
    '*': (a, b) => a > b,
    reverse: '<'
  },
  '<': {
    '*': (a, b) => a < b,
    reverse: '>'
  }
};

const register = ({name, namespace, implement, reverse}) => {
  operators[name] = operators[name] || {};
  operators[name][namespace] = implement;
  if (namespace === '*' && reverse) {
    operators[name][namespace].reverse = reverse;
  }

  // we need to sort the operators from the longest to the shorter ones to avoid interception
  const obj = {};
  Object.entries(operators)
    .sort((a, b) => {
      if (a[0].length < b[0].length) {
        return 1;
      }
      if (a[0].length > b[0].length) {
        return -1;
      }

      return 0;
    })
    .forEach(data => {
      obj[data[0]] = data[1]
    });
  operators = obj;
};

const unregister = ({name, namespace}) => {
  let container = operators[name];
  delete container[namespace];

  if (Object.keys(container).length === 0) {
    delete operators[name];
  }
};

export default {
  register,
  unregister,
  get list() {
    return operators;
  }
};