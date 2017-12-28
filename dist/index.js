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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var namespace = 'abac_di';

var settings = {
    log: true
};

function parseRule(rule) {
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
                        di += key + '=' + namespace + '.' + key + ';';
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
        return new Function('user', 'action', 'env', 'resource', 'var _a;' + di + 'try{_a=!!(' + rule + ');}catch(_e){_a=_e};return _a');
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
    }
};

function createTargetPolicy(target) {
    var algorithm = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'all';
    var effect = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'deny';

    var rules = [];
    for (var i = 0; i < target.length; i++) {
        rules[i] = parseRule(target[i]);
    }

    return function (user, action, env, resource) {
        var flag = !(algorithm === 'any');
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

var Policy = function () {
    function Policy(origin, policy, effect) {
        _classCallCheck(this, Policy);

        if (policy === undefined && effect === undefined) {
            this.check = createTargetPolicy(origin.target, origin.algorithm, origin.effect);
        } else {
            // create new policy from two 'check' methods & operation
            this.check = function (user, action, env, resource) {
                // todo refactor for avoid of closer
                var a = origin(user, action, env, resource);
                var b = policy(user, action, env, resource);
                return effect === '||' ? a || b : a && b;
            };
        }
    }

    _createClass(Policy, [{
        key: 'add',
        value: function add(policy) {
            return new Policy(this.check, policy.check, '&&');
        }
    }, {
        key: 'or',
        value: function or(policy) {
            return new Policy(this.check, policy.check, '||');
        }
    }]);

    return Policy;
}();

// static methods


Policy.createTargetPolicy = createTargetPolicy;
Policy.parseRule = parseRule;

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

/***/ })
/******/ ]);
});
//# sourceMappingURL=index.js.map