let expect = require('chai').expect;
let ABAC = require('../dist/policyline.min');

let Policy = ABAC.Policy;

describe("Target Checking", function () {
    it(": string equivalent", function () {
        let rules = {
            target: [
                'user.name="Joe"',
                "user.name=\"Joe\"",
                "user.name='Joe'",

                'action.type="test"',

                'env.department.type="R&D"',

                'resource.value="GHT"'
            ]
        };

        let policy = new Policy(rules);
        let data = {
            user: {
                name: 'Joe'
            },
            action: {
                type: "test"
            },
            env: {
                department: {
                    type: "R&D"
                }
            },
            resource: {
                value: "GHT"
            }
        };

        expect(policy.check(data)).to.equal(true);
    });
});