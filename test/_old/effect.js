"use strict";

let expect = require('chai').expect;
let Policy = require('../dist/policyline.min').Policy;

describe("Effects", function () {
    it(": permit", function () {
        let rules = {
            target: [
                "user.name='Joe'"
            ],
            algorithm: "all",
            effect: "permit"
        };

        let policy = new Policy(rules);
        let user = {name: 'Joe'};

        expect(policy.check(user)).to.equal(true);
    });

    it(": negative permit with 'all' algorithm (all rules aren't true)", function () {
        let rules = {
            target: [
                "user.firstName='John'",
                "user.lastName='Doe'"
            ],
            algorithm: "all",
            effect: "permit"
        };

        let policy = new Policy(rules);
        let user = {
            firstName: 'Joe',
            lastName: 'Doe'
        };

        expect(policy.check(user)).to.equal(false);
    });

    it(": permit with 'any' algorithm (one rule is false)", function () {
        let rules = {
            target: [
                "user.firstName='John'",
                "user.lastName='Doe'"
            ],
            algorithm: "any",
            effect: "permit"
        };

        let policy = new Policy(rules);
        let user = {
            firstName: 'Joe',
            lastName: 'Doe'
        };

        expect(policy.check(user)).to.equal(true);
    });

    it(": deny", function () {
        let rules = {
            target: [
                "user.name='Joe'"
            ],
            algorithm: "all",
            effect: "deny"
        };

        let policy = new Policy(rules);
        let user = {name: 'Joe'};

        expect(policy.check(user)).to.equal(false);
    });

    it(": negative deny with 'all' algorithm (all rules aren't true)", function () {
        let rules = {
            target: [
                "user.firstName='John'",
                "user.lastName='Doe'"
            ],
            algorithm: "all",
            effect: "deny"
        };

        let policy = new Policy(rules);
        let user = {
            firstName: 'Joe',
            lastName: 'Doe'
        };

        expect(policy.check(user)).to.equal(true);
    });

    it(": deny with 'any' algorithm (one rule is false)", function () {
        let rules = {
            target: [
                "user.firstName='John'",
                "user.lastName='Doe'"
            ],
            algorithm: "any",
            effect: "deny"
        };

        let policy = new Policy(rules);
        let user = {
            firstName: 'Joe',
            lastName: 'Doe'
        };

        expect(policy.check(user)).to.equal(false);
    });

    it(": deny by any exception(permit required)", function () {
        let rules = {
            target: [
                "user.name'Joe'" // exception
            ],
            algorithm: "all",
            effect: "permit"
        };

        let policy = new Policy(rules);
        let user = {name: 'test_Joe'};

        expect(policy.check(user)).to.equal(false);
    });

    it(": deny by any exception(deny required)", function () {
        let rules = {
            target: [
                "user.name'Joe'" // exception
            ],
            algorithm: "all",
            effect: "deny"
        };

        let policy = new Policy(rules);
        let user = {name: 'test_Joe'};

        expect(policy.check(user)).to.equal(false);
    });
});