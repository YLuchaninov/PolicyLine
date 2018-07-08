"use strict";

let expect = require('chai').expect;
let Policy = require('../dist/policyline.min').Policy;

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

    it(": 'chain'", function () {
        let rulesA = {
            target: [
                "user.role='admin'"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let rulesB = {
            target: [
                "user.location = env.location"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let rulesC = {
            target: [
                "action.name='save'"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policyA = new Policy(rulesA);
        let policyB = new Policy(rulesB);
        let policyC = new Policy(rulesC);

        let totalPolicy = policyA.and(policyB).and(policyC);

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

    it(": 'compose'", function () {
        let adminRules = {
            target: [
                "user.role = 'admin'"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let userRules = {
            target: [
                "user.role='user'"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let locationRules = {
            target: [
                "user.location=resource.location"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let adminPolicy = new Policy(adminRules);
        let userPolicy = new Policy(userRules);
        let locationPolicy = new Policy(locationRules);

        let totalPolicy = adminPolicy.or(userPolicy.and(locationPolicy));

        let user = {
            role: 'user',
            location: 'NY'
        };
        let resource = {
            location: 'NY'
        };

        expect(totalPolicy.check(user, null, null, resource)).to.equal(true);
    });
});


