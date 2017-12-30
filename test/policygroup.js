"use strict";

let expect = require('chai').expect;
let Policy = require('../dist/').Policy;

describe("Policy Group", function () {
    it(": base functionality", function () {

        let policyGroup = { // all algorithms set in 'all' by default
            expression: '(data.user&&data.location)||data.admin', // todo
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
                }
            }
        };
        let policy = new Policy(policyGroup);

        let user = {role: 'admin'};

        expect(policy.check(user)).to.equal(true);
    });
});