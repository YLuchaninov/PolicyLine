let expect = require('chai').expect;
let ABAC = require('../dist/policyline.min');

let Policy = ABAC.Policy;

describe("Conditions Checking", function () {
    it(": temporary test", function () {
        let rules = {
            target: [
                'user.location==resource.location',
                'resource.type=="inner"'
            ]
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                location: [49.9935, 36.2304]
            }
        };

        expect(policy.check(data)).to.equal(true);
        console.log(policy.getConditions(null));
    });
});