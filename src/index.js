import {parseExp, executeExp} from './target';

let _property = Symbol(); // inner property name

class Policy {

    // static merge(expression, policies) {
    //     // todo
    // }

    /**
     * Create a Policy object by JSON rules.
     * @param {object} jsonPolicy - Plain javascript object, which contain policy rules in JSON like structure.
     */
    constructor(jsonPolicy) {
        // create hidden container for save any instance date
        this[_property] = {
            effect: jsonPolicy.effect !== 'deny',
            target: []
        };

        // construction part
        // if (jsonPolicy.expression) {
        //     // todo
        //     console.error('not implemented!');
        // } else {
        // todo
        for (let expStr of jsonPolicy.target) {
            this[_property].target.push(parseExp(expStr));
        }
        // }
    }

    /**
     * Check params object by policy rules, which was setted in constructor.
     * @param {object} param - Object should contain four objects as attributes:
     * `user`, `action`, `env`, `resource`
     *
     * @returns {boolean} `true` in permit case, `false` in deny case.
     */
    check(data) {
        const context = {}; // todo make context

        let result = true;
        for (let targetExp of this[_property].target) {
            result = result && executeExp(data, targetExp, context);
            if (!result) break;
        }
        return this[_property].effect ? result : !result;
    }

    // /**
    //  * Function return object with condition.
    //  * @param {object} adapter - Adapter, by default - for JSONB
    //  * @returns {object}
    //  */
    // getConditions(adapter) {
    //     return null;
    // }
    //
    // getUsers({user, action, env, resource}) {
    //     return null;
    // }

}

export {
    Policy
}