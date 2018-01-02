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
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
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
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.settings = exports.DI = exports.Policy = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _index = __webpack_require__(2);

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var namespace = 'abac_di';

var settings = {
    log: true
};

function compileRule(rule) {
    var ruleReg = /([^<>=]+)\s?([<>=!]{1,2})\s?(.+)/;
    try {
        var ruleArray = ruleReg.exec(rule).slice(1, 4);
        if (ruleArray[1] === '=' || ruleArray[1] === '==') {
            ruleArray[1] = '===';
        }
        rule = ruleArray.join('');

        // DI section
        var di = '';
        if (global[namespace] !== undefined) {
            for (var key in global[namespace]) {
                if (rule.includes(key)) {
                    di += 'var ' + key + '=' + namespace + '.' + key + ';';
                }
            }
        }

        // create returning function
        return new Function('user', 'action', 'env', 'resource', 'var _a;' + di + 'try{_a=!!(' + rule + ');}catch(_e){_a=_e};return _a;');
    } catch (e) {
        return new Function('return new Error("in access rule: ' + rule + '");');
    }
}

var DI = {
    register: function register(name, fn) {
        if (global[namespace] === undefined) {
            global[namespace] = {};
        }

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
        for (var fileName in _index2.default) {
            for (var fnName in _index2.default[fileName]) {
                DI.register(fnName, _index2.default[fileName][fnName]);
            }
        }
    }
};

function compilePolicy() {
    var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var algorithm = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'all';
    var effect = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'deny';

    var flag = !(algorithm === 'any');
    var rules = [];
    var deny = effect === "deny";

    target.forEach(function (rule) {
        rules.push(compileRule(rule));
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

function compileGroupExpression(origin) {
    var re = void 0,
        expr = origin.expression;

    for (var key in origin.policies) {
        re = new RegExp('\\b' + key + '\\b', "g");
        expr = expr.replace(re, 'data.' + key);
    }

    return expr.replace(/\bAND\b/g, '&&').replace(/\bOR\b/g, '||');
}

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
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = conditions[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var condition = _step2.value;

            var rule = compileCondition(condition);
            if (rule[1] === '=' || rule[1] === '==') {
                result[rule[0]] = createCondition(rule[2]);
            } else {
                result[rule[0]] = [rule[1], createCondition(rule[2])];
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

    return wrapNamespaces(result);
}

function calculateCondition(target, source, data) {
    for (var key in source) {
        if (Array.isArray(source[key])) {
            target[key] = [source[key][0]];
            target[key].push(source[key][1](data.user, data.action, data.env, data.resource));
        } else if (typeof source[key] === 'function') {
            target[key] = source[key](data.user, data.action, data.env, data.resource);
        } else {
            target[key] = {};
            calculateCondition(target[key], source[key], data);
        }
    }
    return target;
}

function isObject(item) {
    return item && (typeof item === 'undefined' ? 'undefined' : _typeof(item)) === 'object' && !Array.isArray(item) && item !== null;
}

function mergeDeep(target, source) {
    if (isObject(target) && isObject(source)) {
        for (var key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, _defineProperty({}, key, {}));
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, _defineProperty({}, key, source[key]));
            }
        }
    }
    return target || source;
}

var property = Symbol();

var Policy = function () {
    _createClass(Policy, [{
        key: '_groupConstructor',
        value: function _groupConstructor(origin) {
            this._expression = compileGroupExpression(origin);
            this._policies = {};
            for (var key in origin.policies) {
                var _origin$policies$key = origin.policies[key],
                    target = _origin$policies$key.target,
                    algorithm = _origin$policies$key.algorithm,
                    effect = _origin$policies$key.effect;

                this._policies[key] = compilePolicy(target, algorithm, effect);
            }
            this._condition = prepareCondition(origin.condition || []);
        }
    }, {
        key: '_singleConstructor',
        value: function _singleConstructor(target, algorithm, effect, condition) {
            var uniqID = '_' + Math.random().toString(36).substr(2, 9);
            this._expression = 'data.' + uniqID;
            this._policies = _defineProperty({}, uniqID, compilePolicy(target, algorithm, effect));
            this._condition = prepareCondition(condition || []);
        }
    }, {
        key: '_mergeConstructor',
        value: function _mergeConstructor(origin, source, effect) {
            this._expression = origin._expression + effect + source._expression;
            this._policies = Object.assign({}, origin._policies, source._policies);
            var tmp = mergeDeep({}, origin._condition);
            this._condition = mergeDeep(tmp, source._condition);
        }
    }]);

    function Policy(origin, source, effect) {
        _classCallCheck(this, Policy);

        if (origin.expression !== undefined && origin.policies !== undefined) {
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
            for (var key in this._policies) {
                result[key] = this._policies[key](user, action, env, resource);
            }

            // save data for 'condition'
            this[property] = { user: user, action: action, env: env, resource: resource };

            return new Function('data', 'return ' + this._expression + ';')(result);
        }
    }, {
        key: 'condition',
        value: function condition(user, action, env, resource) {
            var result = {
                user: mergeDeep(user, this[property].user),
                action: mergeDeep(action, this[property].action),
                env: mergeDeep(env, this[property].env),
                resource: mergeDeep(resource, this[property].resource)
            };
            this[property] = {};

            try {
                result.condition = calculateCondition({}, this._condition, result);
            } catch (e) {
                result = e;
            }

            return result;
        }
    }, {
        key: 'and',
        value: function and(policy) {
            return new Policy(this, policy, '&&');
        }
    }, {
        key: 'or',
        value: function or(policy) {
            return new Policy(this, policy, '||');
        }
    }]);

    return Policy;
}();

// static methods


Policy.compilePolicy = compilePolicy;
Policy.compileRule = compileRule;

// service DI
DI.loadPresets();

exports.Policy = Policy;
exports.DI = DI;
exports.settings = settings;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 1 */
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
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _string = __webpack_require__(3);

var _string2 = _interopRequireDefault(_string);

var _location = __webpack_require__(4);

var _location2 = _interopRequireDefault(_location);

var _time = __webpack_require__(5);

var _time2 = _interopRequireDefault(_time);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    String: _string2.default,
    Location: _location2.default,
    Time: _time2.default
};

/***/ }),
/* 3 */
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
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {};

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _moment = __webpack_require__(6);

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
/* 6 */
/***/ (function(module, exports) {

module.exports = require("moment");

/***/ })
/******/ ]);
//# sourceMappingURL=policyline.js.map