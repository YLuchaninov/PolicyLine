"use strict";

let expect = require('chai').expect;
let Policy = require('../dist/policyline.min').Policy;

describe("Algorithms", function () {
    it(": 'all'", function () {
        let rules = {
            target: [
                "user.role='admin'",
                "user.location = env.location",
                "action.name='save'"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
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

        expect(policy.check(user, action, env)).to.equal(true);
    });

    it(": negative 'all'", function () {
        let rules = {
            target: [
                "user.role='admin'",
                "user.location = env.location",
                "action.name='save'"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let user = {
            role: 'admin',
            location: 'NY'
        };
        let env = {
            location: 'SF'
        };
        let action = {
            name: 'save'
        };

        expect(policy.check(user, action, env)).to.equal(false);
    });

    it(": 'any'", function () {
        let rules = {
            target: [
                "user.role='user'",
                "user.location = env.location",
                "action.name='see'"
            ],
            effect: "permit",
            algorithm: "any"
        };

        let policy = new Policy(rules);
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

        expect(policy.check(user, action, env)).to.equal(true);
    });

    it(": negative 'any'", function () {
        let rules = {
            target: [
                "user.role='user'",
                "user.location = env.location",
                "action.name='see'"
            ],
            effect: "permit",
            algorithm: "any"
        };

        let policy = new Policy(rules);
        let user = {
            role: 'admin',
            location: 'NY'
        };
        let env = {
            location: 'SF'
        };
        let action = {
            name: 'save'
        };

        expect(policy.check(user, action, env)).to.equal(false);
    });
});