"use strict";

let expect = require('chai').expect;
let Policy = require('../dist/').Policy;

describe("Policy Group", function () {
    it(": group expression", function () {

        let policyGroup = { // all algorithms set in 'all' by default
            expression: '(user AND location)OR(admin OR super_admin)',
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
                        "user.role='admin'"
                    ],
                    effect: "permit"
                }

            }
        };
        let policy = new Policy(policyGroup);

        let user = {role: 'admin'};

        expect(policy.check(user)).to.equal(true);
    });
});