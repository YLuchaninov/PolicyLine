"use strict";

let expect = require('chai').expect;
let Policy = require('../dist/').Policy;

describe("Operations", function () {
    it(": 'and'", function () {
        let userRules = {
            target: [
                "user.role='admin'",
                "user.location = env.location"
            ],
            effect: "permit",
            algorithm: "all"
        };
        let userPolicy = new Policy(userRules);

        let actionRules = {
            target: [
                "action.name='save'"
            ],
            effect: "permit",
            algorithm: "all"
        };
        let actionPolicy = new Policy(actionRules);

        let totalPolicy = userPolicy.and(actionPolicy);

        let user = {
            role: 'admin',
            location: 'NY'
        };
        let env = {
            location: 'NY'
        };
        let action = {
            name: 'save'
        };

        expect(totalPolicy.check(user, action, env)).to.equal(true);
    });

    it(": 'or'", function () {
        let adminRules = {
            target: [
                "user.role='admin'"
            ],
            effect: "permit",
            algorithm: "all"
        };
        let adminPolicy = new Policy(adminRules);

        let locationRules = {
            target: [
                "user.location = env.location",
                "action.name='save'"
            ],
            effect: "permit",
            algorithm: "all"
        };
        let locationPolicy = new Policy(locationRules);

        let totalPolicy = adminPolicy.or(locationPolicy);

        let user = {
            role: 'user',
            location: 'NY'
        };
        let env = {
            location: 'NY'
        };
        let action = {
            name: 'save'
        };

        expect(totalPolicy.check(user, action, env)).to.equal(true);
    });
});


