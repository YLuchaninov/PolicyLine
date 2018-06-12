import {namespace} from "./di";

const settings = {
    log: false
};

function compileTarget(rule) {
    let ruleReg = /([^<>=]+)\s?([<>=!]{1,2})\s?(.+)/;
    try {
        let ruleArray = ruleReg.exec(rule);
        if (ruleArray) {
            ruleArray = ruleArray.slice(1, 4);
            if (ruleArray[1] === '=' || ruleArray[1] === '==') {
                ruleArray[1] = '==='
            }
            rule = ruleArray.join('');
        }

        // DI section
        let di = '';
        if (global[namespace] !== undefined) {
            for (const key in global[namespace]) {
                if (rule.includes(key)) {
                    di += 'var ' + key + '=' + namespace + '.' + key + ';';
                }
            }
        }

        // create returning function
        return new Function('user', 'action', 'env', 'resource',
            'var _a;' + di + 'try{_a=!!(' + rule + ');}catch(_e){_a=_e};return _a;');
    } catch (e) {
        return new Function('return new Error("in access rule: ' + rule + '");');
    }
}

function compilePolicy(target = [], algorithm = 'all', effect = 'deny') {
    let flag = !(algorithm === 'any');
    let rules = [];
    let deny = effect === "deny";

    target.forEach((rule) => {
        rules.push(compileTarget(rule));
    });

    return function (user, action, env, resource) {
        let result = flag;

        for (let rule of rules) {
            let ruleResult = rule(user, action, env, resource);

            // any case with errors to deny of whole policy
            if (typeof ruleResult === 'object') {
                if (settings.log) {
                    console.error(ruleResult);
                }
                return false;
            }

            // using the algorithm
            result = flag ? (result && ruleResult) : (result || ruleResult);
        }

        return deny ? !result : result;
    }
}

export {compilePolicy, settings};