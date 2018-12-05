import {parseExp, executeExp, Operator, Mutator} from './target';
import {prepareCollection} from './shared';
import Adapter from './adapter';
import {
  processRPN,
  createTokens,
  infixToRPN,
  fillTokens,
  evaluateRPN,
  wrapToToken,
  TYPE
} from './expression';
import {mergeDeep} from "./utils";

const _property = Symbol(); // inner property name
const _calcResult = Symbol();
const USER = 'user.';
const RESOURCE = 'resource.';
const ENV = 'env.';
const ACTION = 'action.';
const CONDITION = 'condition';
const WATCHER = 'watcher';
const BOOL = 'boolean';
const DENY = 'deny';

const checkOperand = (oper, objStr) => {
  return oper.isDIObj && oper.value.indexOf && oper.value.indexOf(objStr) === 0;
};

const collectResult = (obj, data, key, resourceName) => {
  const context = {}, targetResults = [];

  obj[_property].filterTarget[key].forEach((expr) => {
    targetResults.push(prepareCollection(data, expr, context, resourceName));
  });

  return obj.adapter.proceed(targetResults);
};

const aggregateResult = (policy, type, data) => {
  const rules = {},
        resource = type === CONDITION ? RESOURCE : USER;
  Object.keys(policy[_property].filterTarget).forEach((key) => {
    try {
      rules[key] = collectResult(policy, data, key, resource);
      if (dependencyGuard(rules[key])) {
        rules[key] = undefined;
      }
    } catch (error) {
      // important to close error in calculate result
    }
  });

  return rules;
};

const dependencyGuard = obj  => {
  let flag = false;
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'string' && (
      obj[key].indexOf(USER) === 0 ||
      obj[key].indexOf(RESOURCE) === 0 ||
      obj[key].indexOf(ENV) === 0 ||
      obj[key].indexOf(ACTION) === 0
    )) {
      flag = true;
    } else if (typeof obj[key] === 'object') {
      flag = dependencyGuard(obj[key]);
    }
  });

  return flag;
};

const policyConstructor = function policyConstructor(policy) {
  let key = Math.random().toString(36).substr(2, 9);
  this[_property] = {
    expression: [wrapToToken(key)],
    target: {[key]: []},
    filterTarget: {[key]: []},
  };

  policyParse(policy, key, this);
};

const groupConstructor = function groupConstructor(jsonPolicy) {
  this[_property] = {
    expression: infixToRPN(createTokens(jsonPolicy.expression)),
    target: {},
    filterTarget: {},
  };

  Object.keys(jsonPolicy.policies).forEach((key) => {
    const policy = jsonPolicy.policies[key];
    this[_property].target[key] = [];
    this[_property].filterTarget[key] = [];

    policyParse(policy, key, this);
  });
};

const prepareFor = (propName, key, context, _exp) => {
  const operators = Operator.list;
  const exp = JSON.parse(JSON.stringify(_exp));
  const resourceName = propName === WATCHER ? USER : RESOURCE;

  /*
      We have a restriction; we cannot have a prepared property on both sides of the expression.
      This contradicts the logic of computation - it makes no sense to compare
      two different attributes of the same object.
   */
  if (checkOperand(exp.left, resourceName)) { // fill if expression in left side
    context[_property].filterTarget[key].push(exp);
  } else if (checkOperand(exp.right, resourceName)) { // turn over expression
    let tempObj = exp.right;
    exp.right = exp.left;
    exp.left = tempObj;
    if (operators[exp.operator].reverse) {
      exp.operator = operators[exp.operator].reverse;
    }

    context[_property].filterTarget[key].push(exp);
  }
};

const policyParse = (policy, key, context) => {
  policy.target
    .map(expStr => parseExp(expStr))
    .forEach((_exp) => {
      context[_property].target[key].push(_exp);
    });
};

const attributeCheck = obj => {
  const attrs = ['user', 'resource', 'action', 'env'];
  if (typeof obj === 'object') {
    Object.keys(obj).forEach((attr) => {
      const index = attrs.indexOf(attr);
      if (index > -1) {
        attrs.splice(index, 1);
      }
    });
  }
  return attrs;
};

class Policy {

  toString() {
    return this.rules;
  }

  constructor(jsonPolicy) {
    this.rules = JSON.stringify(jsonPolicy, null, 2);
    this.adapter = Adapter.MongoJSONb;

    if (jsonPolicy.hasOwnProperty('target')) {
      policyConstructor.call(this, jsonPolicy);
    } else {
      groupConstructor.call(this, jsonPolicy);
    }

    this[_property].effect = jsonPolicy.effect !== DENY;
    this[_property].lastData = null;
  }

  check(data) {
    // guard part
    const missingAttrs = attributeCheck(data);
    if (missingAttrs.length > 1) {
      throw new Error(data ? data.toString() : 'empty object' + ' should contain any more than two attributes from: "user", "action", "resource" or "env"');
    }

    this[_calcResult] = {};
    this[_property].lastData = undefined;

    const filterTarget = missingAttrs[0];
    this[_property].filterType = filterTarget === 'user' ? WATCHER : CONDITION;

    // clear storage
    Object.keys(this[_property].target).forEach((key) => {
      this[_property].filterTarget[key] = [];
    });

    const resultCollection = {};

    Object.keys(this[_property].target).forEach((policyKey) => {
      const context = {}, targetResults = {};

      resultCollection[policyKey] = true;

      // calculate separate rules for one policy
      this[_property].target[policyKey].forEach((targetExp) => {
        // generate unique random key
        const key = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        const tmp = executeExp(data, targetExp, context, key, filterTarget);

        if (typeof tmp === BOOL) {
          targetResults[key] = tmp;
        } else if (typeof tmp === 'object' && tmp.flag) {

          prepareFor(this[_property].filterType, policyKey, this, targetExp);
        } else {
          Object.assign(targetResults, tmp);
        }
      });

      // calculate final result for single policy
      Object.values(targetResults).forEach((value) => {
        resultCollection[policyKey] = resultCollection[policyKey] && value;
      });
    });

    /* fill data for future using */
    const tokens = fillTokens(this[_property].expression, resultCollection);
    this[_property].tokens = JSON.parse(JSON.stringify(tokens));
    this[_calcResult] = evaluateRPN(tokens);

    // apply effect to bool result
    const result = this[_property].effect ? this[_calcResult].res : !this[_calcResult].res;

    // save data for next `getConditions` methods
    this[_property].lastData = result ? data : undefined;
    /**/

    return result;
  }

  setAdapter(adapter) {
    this.adapter = adapter;
  }

  getConditions(mixin) {
    if ((this[_property].effect ? this[_calcResult].res : !this[_calcResult].res) === false)
      return undefined;

    const rules = aggregateResult(this, this[_property].filterType, this[_property].lastData);

    let result;
    if (this[_property].filterType === WATCHER) {
      // apply results of `check` method
      this[_property].tokens.forEach((token) => {
        if (token.type === TYPE.val && token.res === false) {
          rules[token.val[0]] = undefined;
        }
      });

      result = processRPN(fillTokens(this[_property].expression, rules), this.adapter);
      result = result ? this.adapter.optimize(result.res) : undefined;
    } else {
      result = {};
      Object.entries(rules).forEach(item => {
        if (this[_calcResult].val.includes(item[0])) {
          mergeDeep(result, item[1]);
        }
      });
    }

    return mergeDeep(result, mixin);
  }
}

export {
  Policy,
  Operator,
  Mutator,
  Adapter
}