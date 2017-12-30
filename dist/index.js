(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["policyline"] = factory();
	else
		root["policyline"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = Object.keys(global[namespace])[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var key = _step.value;

                    if (rule.includes(key)) {
                        di += 'var ' + key + '=' + namespace + '.' + key + ';';
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
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = Object.keys(_index2.default)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var di_package = _step2.value;
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = Object.keys(_index2.default[di_package])[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var fnName = _step3.value;

                        DI.register(fnName, _index2.default[di_package][fnName]);
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
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
    }
};

// todo refactoring
function compilePolicy() {
    var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var algorithm = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'all';
    var effect = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'deny';

    var flag = !(algorithm === 'any');
    var rules = [];
    for (var i = 0; i < target.length; i++) {
        rules[i] = compileRule(target[i]);
    }

    return function (user, action, env, resource) {
        var result = flag;

        for (var _i = 0; _i < target.length; _i++) {
            var ruleResult = rules[_i](user, action, env, resource);

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

        return effect === "deny" ? !result : result;
    };
}

function compileGroupExpression(origin) {
    var re = void 0,
        expr = origin.expression;

    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
        for (var _iterator4 = Object.keys(origin.policies)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var key = _step4.value;

            re = new RegExp('\\b' + key + '\\b', "g");
            expr = expr.replace(re, 'data.' + key);
        }
    } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
            }
        } finally {
            if (_didIteratorError4) {
                throw _iteratorError4;
            }
        }
    }

    return expr.replace(/\bAND\b/g, '&&').replace(/\bOR\b/g, '||');
}

var Policy = function () {
    _createClass(Policy, [{
        key: '_groupConstructor',
        value: function _groupConstructor(origin) {
            this._expression = compileGroupExpression(origin);
            this._policies = {};
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = Object.keys(origin.policies)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var key = _step5.value;
                    var _origin$policies$key = origin.policies[key],
                        target = _origin$policies$key.target,
                        algorithm = _origin$policies$key.algorithm,
                        effect = _origin$policies$key.effect;

                    this._policies[key] = compilePolicy(target, algorithm, effect);
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }
        }
    }, {
        key: '_singleConstructor',
        value: function _singleConstructor(target, algorithm, effect) {
            var uniqID = '_' + Math.random().toString(36).substr(2, 9);
            this._expression = 'data.' + uniqID;
            this._policies = _defineProperty({}, uniqID, compilePolicy(target, algorithm, effect));
        }
    }, {
        key: '_mergeConstructor',
        value: function _mergeConstructor(origin, source, effect) {
            this._expression = origin._expression + effect + source._expression;
            this._policies = {};
            Object.assign(this._policies, origin._policies, source._policies);
        }
    }]);

    function Policy(origin, source, effect) {
        _classCallCheck(this, Policy);

        if (origin.expression !== undefined && origin.policies !== undefined) {
            this._groupConstructor(origin);
        } else if (source === undefined && effect === undefined) {
            this._singleConstructor(origin.target, origin.algorithm, origin.effect);
        } else {
            this._mergeConstructor(origin, source, effect);
        }
    }

    _createClass(Policy, [{
        key: 'check',
        value: function check(user, action, env, resource) {
            var result = {};
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = Object.keys(this._policies)[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var key = _step6.value;

                    result[key] = this._policies[key](user, action, env, resource);
                }
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
                        _iterator6.return();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
                    }
                }
            }

            return new Function('data', 'return ' + this._expression + ';')(result);
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
exports.default = {};

/***/ })
/******/ ]);
});
//# sourceMappingURL=index.js.map