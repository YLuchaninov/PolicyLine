let expect = require('chai').expect;
let PolicyLine = require('../dist/policyline.min');

let Policy = PolicyLine.Policy;

describe("Policy Group", function () {
    it(": group expression", function () {

        let policyGroup = { // all algorithms set in 'all' by default
            expression: '(admin OR super_admin)OR(user AND location)',
            policies: {
                user: {
                    target: [
                        "user.role='user'"
                    ],
                    effect: "permit"
                },
                location: {
                    target: [
                        "user.location=env.location"
                    ],
                    effect: "permit"
                },
                admin: {
                    target: [
                        "user.role='admin'"
                    ],
                    effect: "permit"
                },
                super_admin: {
                    target: [
                        "user.role='super_admin'"
                    ],
                    effect: "permit"
                }

            }
        };
        let policy = new Policy(policyGroup);

        let data = {
            user: {role: 'admin', location: 'LA'},
            env: {location: 'NY'},
            action: {},
            resource: {},
        };

        expect(policy.check(data)).to.equal(true);
    });

    // todo watchers policy group testing
});