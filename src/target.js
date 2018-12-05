import Operator from './operator';
import Mutator from './mutator';
import {extract} from './shared';

const leftRegExp = /^[a-zA-Z]+\.[a-zA-Z]+(?:\.\.[a-zA-Z]+)*/;
const rightRegExp = /[^\n]+/;

const quote = '\'';

const throwSemanticError = expr => {
  const msg = `Semantic Error in ${expr}: 
    Expression should be obj.attr[..mutator](operator)value or object.attribute
    (user.role~=['admin','user'] , resource.location..radius=100)`;
  throw new Error(msg);
};

const isObjWithAttr = str => {
  return str.includes('.')
    && (str.indexOf('user.') === 0
      || str.indexOf('env.') === 0
      || str.indexOf('action.') === 0
      || str.indexOf('resource.') === 0);
};

const unwrapString = str => {
  if (str[0] === quote && str[str.length - 1] === quote) {
    str = '"' + str.substr(1, str.length - 2) + '"';
  }
  return str;
};

const parseOperand = operandStr => {
  const array = operandStr.split('..');
  const _mutators = array.slice(1, array.length);
  const isDIObj = isObjWithAttr(array[0]);
  let value;

  try {
    value = isDIObj ? array[0] : JSON.parse(unwrapString(array[0]));
  } catch (e) {
    const msg = `Parsing Error: \n\t JSON.parse( ${array[0]} ) in expression`;
    throw new Error(msg);
  }

  return {
    isDIObj,
    value,
    mutators: _mutators
  };
};

const parseExp = expStr => {
  const operators = Operator.list;
  let operator, parts;
  for (operator in operators) {
    parts = expStr.split(operator);
    if (parts.length === 2) break;
  }

  if ((parts.length !== 2)
    || (!leftRegExp.test(parts[0]))
    || (!rightRegExp.test(parts[1]))) throwSemanticError(expStr);

  return {
    origin: expStr,
    left: parseOperand(parts[0]),
    operator,
    right: parseOperand(parts[1]),
  }
};

const postfixApply = (operand, data, context, key) => {
  operand.mutators.forEach((mutator) => {
    const expr = Mutator.list[mutator];
    if (operand.isDIObj && typeof expr === 'object' && expr[Mutator.postfix]) {
      data.result = expr[Mutator.postfix](data, context[operand.value], key);
    }
  });
};

const executeExp = (inputData, exp, context, key, filterTarget) => {
  const operators = Operator.list;
  const leftOperand = extract(inputData, exp.left, context);
  const rightOperand = extract(inputData, exp.right, context);

  // get correct path to operator implementation
  let path = '*';
  if (exp.left.isDIObj && typeof operators[exp.operator][exp.left.value] === 'function') {
    path = exp.left.value;
  } else if (exp.right.isDIObj && typeof operators[exp.operator][exp.right.value] === 'function') {
    path = exp.right.value;
  }

  const result = operators[exp.operator][path](leftOperand, rightOperand);

  const data = {
    leftIsData: !exp.left.isDIObj,
    rightIsData: !exp.right.isDIObj,
    leftValue: leftOperand,
    rightValue: rightOperand,
    result
  };

  if (filterTarget
      && ((exp.left.isDIObj && exp.left.value.indexOf(filterTarget) === 0)
      || (exp.right.isDIObj && exp.right.value.indexOf(filterTarget) === 0))
  ) {
    return {
      flag: true
    }
  }

  postfixApply(exp.left, data, context, key);
  postfixApply(exp.right, data, context, key);

  return data.result;
};

export {
  parseExp,
  executeExp,
  Operator,
  Mutator,
}