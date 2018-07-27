module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var g;

// This works in non-strict mode
g = function () {
	return this;
}();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1, eval)("this");
} catch (e) {
	// This works if the window reference is available
	if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;

/***/ }),

/***/ "./src/condition.js":
/*!**************************!*\
  !*** ./src/condition.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
function compileCondition(condition) {
    var conditionReg = /([\w\.\'\"\$]+)\s?([<>=!]{1,2})\s?(.+)/; // more stricter than 'target' regexp
    var conditionArray = conditionReg.exec(condition).slice(1, 4);

    conditionArray[0] = conditionArray[0].replace('resource.', '');
    return conditionArray;
}

function createCondition(expr) {
    return new Function('user', 'action', 'env', 'resource', 'return ' + expr + ';');
}

function wrap(namespace, container, value) {
    var key = namespace.substring(0, namespace.indexOf('.'));
    var name = namespace.substring(namespace.indexOf('.') + 1);

    if (namespace.indexOf('\'') === 0 || namespace.indexOf('"') === 0) {
        key = '';
        name = namespace.replace(/[\'\"]/g, '');
    }

    if (name && name.includes('.') && key.length) {
        if (!container[key]) container[key] = {};
        wrap(name, container[key], value);
    } else if (key.length) {
        if (!container[key]) container[key] = {};
        container[key][name] = value;
    } else {
        container[name] = value;
    }

    return container;
}

function wrapNamespaces(obj) {
    for (var key in obj) {
        if (key.includes('.')) {
            wrap(key, obj, obj[key]);
            delete obj[key];
        }
    }

    return obj;
}

function prepareCondition(conditions) {
    var result = {};
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = conditions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var condition = _step.value;

            var tmp = void 0,
                rule = compileCondition(condition);
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
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return wrapNamespaces(result);
}

function calculateCondition(target, source, data) {
    for (var key in source) {
        if (Array.isArray(source[key]) && !source[key].flag) {
            target[key] = [source[key][0]];
            target[key].push(source[key][1](data.user, data.action, data.env, data.resource));
        } else if (typeof source[key] === 'function') {
            target[key] = source[key](data.user, data.action, data.env, data.resource);
        } else if (Array.isArray(source[key])) {
            target[key] = [];
            var result = void 0;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = source[key][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var item = _step2.value;

                    result = item(data.user, data.action, data.env, data.resource);
                    if (result !== null && result !== undefined) {
                        target[key].push(result);
                    }
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        } else {
            target[key] = {};
            calculateCondition(target[key], source[key], data);
        }
    }
    return target;
}

exports.prepareCondition = prepareCondition;
exports.calculateCondition = calculateCondition;

/***/ }),

/***/ "./src/di.js":
/*!*******************!*\
  !*** ./src/di.js ***!
  \*******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.namespace = exports.DI = undefined;

var _external = __webpack_require__(/*! ./external */ "./src/external/index.js");

var _external2 = _interopRequireDefault(_external);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var namespace = 'PolicyLine_DI';

var DI = {
    register: function register(name, fn) {
        global[namespace] = global[namespace] || {};

        if (typeof name === 'function') {
            global[namespace][name.name] = name;
        } else {
            global[namespace][name] = fn;
        }
    },
    unregister: function unregister(name) {
        if (global[namespace] === undefined) {
            return;
        }

        delete global[namespace][typeof name === 'function' ? name.name : name];
    },
    clear: function clear() {
        delete global[namespace];
    },
    loadPresets: function loadPresets() {
        for (var fileName in _external2.default) {
            for (var fnName in _external2.default[fileName]) {
                DI.register(fnName, _external2.default[fileName][fnName]);
            }
        }
    }
};

exports.DI = DI;
exports.namespace = namespace;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./src/expression.js":
/*!***************************!*\
  !*** ./src/expression.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
/* based on https://www.barkweb.co.uk/blog/how-to-build-a-calculator-in-javascript */
var operators = ['AND', 'OR', '(', ')'];
var TYPE = {
    op: 'OP',
    val: 'VAL'
};

function wrapToToken(item) {
    return {
        val: item,
        type: operators.includes(item) ? TYPE.op : TYPE.val
    };
}

function createTokens(expression) {
    var array = expression.split(/\s+|(?=\(|\))|\b/);
    return array.map(wrapToToken);
}

function infixToRPN(tokens) {
    var queue = [];
    var stack = [];
    var precedence = {
        '(': 10,
        'AND': 30,
        'OR': 20
    };

    while (tokens.length) {
        var token = tokens.shift();
        var tkPrec = precedence[token.val] || 0;
        var stPrec = stack.length ? precedence[stack[stack.length - 1].val] : 0;

        if (token.type === TYPE.op && token.val === ')') {
            var op = null;

            while ((op = stack.pop()).val !== '(') {
                queue.push(op);
            }
        } else if (token.type === TYPE.val) {
            queue.push(token);
        } else if (token.type === TYPE.op && (!stack.length || token.val === '(' || tkPrec > stPrec)) {
            stack.push(token);
        } else {
            while (tkPrec <= stPrec) {
                queue.push(stack.pop());
                stPrec = stack.length ? precedence[stack[stack.length - 1].val] : 0;
            }

            stack.push(token);
        }
    }

    while (stack.length) {
        queue.push(stack.pop());
    }

    return queue;
}

function fillTokens(tokens, data) {
    return tokens.map(function (item) {
        if (item.type === TYPE.val) {
            item.res = data[item.val];
            item.val = [item.val];
        }
        return item;
    });
}

function evaluateRPN(tokens) {
    var stack = [];
    var val = void 0;

    while (tokens.length) {
        var token = tokens.shift();

        if (token.type === TYPE.val) {
            stack.push(token);
            continue;
        }

        var rhs = stack.pop();
        var lhs = stack.pop();

        switch (token.val) {
            case 'AND':
                stack.push({
                    type: TYPE.val,
                    val: rhs.res && lhs.res ? lhs.val.concat(rhs.val) : [],
                    res: rhs.res && lhs.res
                });
                break;
            case 'OR':
                val = [];
                if (lhs.res) {
                    val = lhs.val;
                } else if (rhs.res) {
                    val = rhs.val;
                }

                stack.push({
                    type: TYPE.val,
                    val: val,
                    res: rhs.res || lhs.res
                });
                break;
        }
    }

    return stack.pop();
}

exports.createTokens = createTokens;
exports.infixToRPN = infixToRPN;
exports.fillTokens = fillTokens;
exports.evaluateRPN = evaluateRPN;
exports.wrapToToken = wrapToToken;

/***/ }),

/***/ "./src/external/array.js":
/*!*******************************!*\
  !*** ./src/external/array.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    $in: function $in(array, value) {
        return array.includes(value);
    }
};

/***/ }),

/***/ "./src/external/index.js":
/*!*******************************!*\
  !*** ./src/external/index.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _string = __webpack_require__(/*! ./string */ "./src/external/string.js");

var _string2 = _interopRequireDefault(_string);

var _array = __webpack_require__(/*! ./array */ "./src/external/array.js");

var _array2 = _interopRequireDefault(_array);

var _time = __webpack_require__(/*! ./time */ "./src/external/time.js");

var _time2 = _interopRequireDefault(_time);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    String: _string2.default,
    Array: _array2.default,
    Time: _time2.default
};

/***/ }),

/***/ "./src/external/string.js":
/*!********************************!*\
  !*** ./src/external/string.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    $trim: function $trim(str) {
        return str.trim();
    },

    $uppercase: function $uppercase(str) {
        return str.toUpperCase();
    },

    $lowercase: function $lowercase(str) {
        return str.toLowerCase();
    },

    $strToInt: function $strToInt(str) {
        return parseInt(str, 10);
    }
};

/***/ }),

/***/ "./src/external/time.js":
/*!******************************!*\
  !*** ./src/external/time.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _moment = __webpack_require__(/*! moment */ "moment");

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    // "HH:mm a"
    $timeBetween: function $timeBetween(time, start, end) {
        var currentTime = (0, _moment2.default)(time, "HH:mm a");
        var startTime = (0, _moment2.default)(start, "HH:mm a");
        var endTime = (0, _moment2.default)(end, "HH:mm a");

        if (startTime.hour() >= 12 && endTime.hour() <= 12 || endTime.isBefore(startTime)) {
            endTime.add(1, "days"); // handle spanning days endTime

            if (currentTime.hour() <= 12) {
                currentTime.add(1, "days"); // handle spanning days currentTime
            }
        }

        return currentTime.isBetween(startTime, endTime);
    },


    // return moment instance for target or comparison
    $moment: function $moment(date, pattern) {
        if (pattern === 'unix') {
            return _moment2.default.unix(date);
        }
        return (0, _moment2.default)(date, pattern);
    },


    // extract day number from timestamp value in 'week' or 'month'
    $day: function $day(val) {
        var param = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'month';

        var day = _moment2.default.unix(val);
        switch (param) {
            case 'week':
                day = day.day();
                break;
            default:
                day = day.date();
        }
        return day;
    },


    // extract week number from timestamp value in 'month' or 'year'
    $week: function $week(val) {
        var param = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'month';

        var week = _moment2.default.unix(val);
        if (param === 'year') {
            // localized week of the year
            week = week.week();
        } else {
            week = Math.ceil(week.date() / 7);
        }

        return week;
    },


    // extract month number from timestamp value
    $month: function $month(val) {
        return _moment2.default.unix(val).month();
    },


    // extract quarter number from timestamp value
    $quarter: function $quarter(val) {
        return _moment2.default.unix(val).quarter();
    },


    // extract year from timestamp value
    $year: function $year(val) {
        return _moment2.default.unix(val).year();
    },


    // translate data to timestamp UTC value by pattern
    $dataToTimestamp: function $dataToTimestamp(val, pattern) {
        return parseInt((0, _moment2.default)(val, pattern).format('X'), 10);
    }
};

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.settings = exports.DI = exports.Policy = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _target = __webpack_require__(/*! ./target */ "./src/target.js");

var _condition = __webpack_require__(/*! ./condition */ "./src/condition.js");

var _expression = __webpack_require__(/*! ./expression */ "./src/expression.js");

var _utils = __webpack_require__(/*! ./utils */ "./src/utils.js");

var _di = __webpack_require__(/*! ./di */ "./src/di.js");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var property = Symbol();
var calcResult = Symbol();

var Policy = function () {
    _createClass(Policy, [{
        key: '_groupConstructor',
        value: function _groupConstructor(origin) {
            this._expression = (0, _expression.infixToRPN)((0, _expression.createTokens)(origin.expression));

            this._targets = {};
            this._conditions = {};
            for (var key in origin.policies) {
                var _origin$policies$key = origin.policies[key],
                    target = _origin$policies$key.target,
                    algorithm = _origin$policies$key.algorithm,
                    effect = _origin$policies$key.effect,
                    condition = _origin$policies$key.condition;

                this._targets[key] = (0, _target.compilePolicy)(target, algorithm, effect);
                this._conditions[key] = (0, _condition.prepareCondition)(condition || []);
            }
        }
    }, {
        key: '_singleConstructor',
        value: function _singleConstructor(target, algorithm, effect, condition) {
            var uniqID = Math.random().toString(36).substr(2, 9);

            this._expression = [(0, _expression.wrapToToken)(uniqID)];
            this._targets = _defineProperty({}, uniqID, (0, _target.compilePolicy)(target, algorithm, effect));
            this._conditions = _defineProperty({}, uniqID, (0, _condition.prepareCondition)(condition || []));
        }
    }, {
        key: '_mergeConstructor',
        value: function _mergeConstructor(origin, source, operation) {
            this._expression = origin._expression.concat(source._expression, (0, _expression.wrapToToken)(operation));
            this._targets = Object.assign({}, origin._targets, source._targets);
            this._conditions = Object.assign({}, origin._conditions, source._conditions);
        }
    }]);

    function Policy(origin, source, effect) {
        _classCallCheck(this, Policy);

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

    _createClass(Policy, [{
        key: 'check',
        value: function check(user, action, env, resource) {
            var result = {};
            for (var key in this._targets) {
                result[key] = this._targets[key](user, action, env, resource);
            }

            // save data for 'condition'
            this[property] = { user: user, action: action, env: env, resource: resource };
            this[calcResult] = (0, _expression.evaluateRPN)((0, _expression.fillTokens)(this._expression, result));

            return this[calcResult].res;
        }
    }, {
        key: 'condition',
        value: function condition(user, action, env, resource) {
            var _this = this;

            if (!this[calcResult].res) {
                return;
            }

            var data = {
                user: (0, _utils.mergeDeep)(user, this[property].user),
                action: (0, _utils.mergeDeep)(action, this[property].action),
                env: (0, _utils.mergeDeep)(env, this[property].env),
                resource: (0, _utils.mergeDeep)(resource, this[property].resource)
            };
            this[property] = {};

            try {
                var conditions = {},
                    condition = {};
                for (var key in this._conditions) {
                    try {
                        conditions[key] = (0, _condition.calculateCondition)({}, this._conditions[key], data);
                    } catch (error) {
                        // important to close error in calculate condition
                    }
                }

                var array = Object.entries(conditions);
                array.forEach(function (item) {
                    if (_this[calcResult].val.includes(item[0])) {
                        (0, _utils.mergeDeep)(condition, item[1]);
                    }
                });

                data.condition = (0, _utils.mergeDeep)(condition, data.resource);
            } catch (e) {
                data = e;
            }
            this[calcResult] = {};

            return data;
        }
    }, {
        key: 'and',
        value: function and(policy) {
            return new Policy(this, policy, 'AND');
        }
    }, {
        key: 'or',
        value: function or(policy) {
            return new Policy(this, policy, 'OR');
        }
    }]);

    return Policy;
}();

// service DI


_di.DI.loadPresets();

exports.Policy = Policy;
exports.DI = _di.DI;
exports.settings = _target.settings;

/***/ }),

/***/ "./src/target.js":
/*!***********************!*\
  !*** ./src/target.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.settings = exports.compilePolicy = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _di = __webpack_require__(/*! ./di */ "./src/di.js");

var settings = {
    log: false
};

function compileTarget(rule) {
    var ruleReg = /([^<>=!]+)\s?([<>=!]{1,2})\s?(.+)/;
    try {
        var ruleArray = ruleReg.exec(rule);
        if (ruleArray) {
            ruleArray = ruleArray.slice(1, 4);
            if (ruleArray[1] === '=' || ruleArray[1] === '==') {
                ruleArray[1] = '===';
            }
            rule = ruleArray.join('');
        }

        // DI section
        var di = '';
        if (global[_di.namespace] !== undefined) {
            for (var key in global[_di.namespace]) {
                if (rule.includes(key)) {
                    di += 'var ' + key + '=' + _di.namespace + '.' + key + ';';
                }
            }
        }

        // create returning function
        return new Function('user', 'action', 'env', 'resource', 'var _a;' + di + 'try{_a=!!(' + rule + ');}catch(_e){_a=_e};return _a;');
    } catch (e) {
        return new Function('return new Error("in access rule: ' + rule + '");');
    }
}

function compilePolicy() {
    var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var algorithm = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'all';
    var effect = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'deny';

    var flag = !(algorithm === 'any');
    var rules = [];
    var deny = effect === "deny";

    target.forEach(function (rule) {
        rules.push(compileTarget(rule));
    });

    return function (user, action, env, resource) {
        var result = flag;

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = rules[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var rule = _step.value;

                var ruleResult = rule(user, action, env, resource);

                // any case with errors to deny of whole policy
                if ((typeof ruleResult === 'undefined' ? 'undefined' : _typeof(ruleResult)) === 'object') {
                    if (settings.log) {
                        console.error(ruleResult);
                    }
                    return false;
                }

                // using the algorithm
                result = flag ? result && ruleResult : result || ruleResult;
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        return deny ? !result : result;
    };
}

exports.compilePolicy = compilePolicy;
exports.settings = settings;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./src/utils.js":
/*!**********************!*\
  !*** ./src/utils.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function isObject(item) {
    return item && (typeof item === 'undefined' ? 'undefined' : _typeof(item)) === 'object' && !Array.isArray(item) && !(item instanceof RegExp);
}

function mergeDeep(target, source) {
    if (isObject(target) && isObject(source)) {
        for (var key in source) {
            if (isObject(source[key])) {
                if (!target[key]) {
                    target[key] = {};
                }
                mergeDeep(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }
    return target || source;
}

exports.mergeDeep = mergeDeep;

/***/ }),

/***/ "moment":
/*!***********************************************************!*\
  !*** external {"commonjs":"moment","commonjs2":"moment"} ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("moment");

/***/ })

/******/ });
//# sourceMappingURL=policyline.js.map