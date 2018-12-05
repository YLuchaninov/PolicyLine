import Mutator from "./mutator";

const unwrapNamespace = (data, namespace) => {
  const path = namespace.split('.');
  let result = data;
  for (let part of path) {
    try {
      result = result[part];
    } catch (e) {
      result = null;
      break;
    }
  }
  return result;
};

const extract = (data, operand, context) => {
  let value = operand.value;
  if (operand.isDIObj) {
    value = unwrapNamespace(data, value)
  }

  operand.mutators.forEach((mutator) => {
    let tmpContext, fn;
    if (operand.isDIObj) {
      context[operand.value] = context[operand.value] || {};
      tmpContext = context[operand.value];
    }

    fn = Mutator.list[mutator];
    if (fn && typeof fn !== 'function') {
      fn = fn[Mutator.prefix];
    }

    value = fn ? fn(value, tmpContext) : value;
  });

  return value;
};

const prepareCollection = (inputData, exp, context, resourceName) => {
  const leftOperand = extract(inputData, exp.left, context, null);
  const rightOperand = extract(inputData, exp.right, context, null);
  let resource = leftOperand === null ? exp.left.value : leftOperand;

  return {
    attribute: resource.replace(resourceName, ''),
    value: rightOperand === null ? exp.right.value : rightOperand,
    operator: exp.operator,
    mutators: exp.left.mutators
  };
};

export {
  extract,
  prepareCollection
}