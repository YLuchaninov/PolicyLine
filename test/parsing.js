"use strict";

let expect = require('chai').expect;
let Policy = require('../dist/policyline.min').Policy;

// user, action, env, resource
describe("Parsing", function () {
    it(": base functional, ==, pure object", function () {
        let rules = {
            target: [
                "user=='Joe'"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let user = 'Joe';

        expect(policy.check(user)).to.equal(true);
    });

    it(": object attributes", function () {
        let rules = {
            target: [
                "user.name='Joe'"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let user = {name: 'Joe'};

        expect(policy.check(user)).to.equal(true);
    });

    it(": inner objects", function () {
        let rules = {
            target: [
                "user.group.location='NY'"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let user = {group: {location: 'NY'}};

        expect(policy.check(user)).to.equal(true);
    });

    it(": =", function () {
        let rules = {
            target: [
                "user='Joe'"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let user = 'Joe';

        expect(policy.check(user)).to.equal(true);
    });

    it(": >=", function () {
        let rules = {
            target: [
                "user.value>=3000"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let user = {value: 4000};

        expect(policy.check(user)).to.equal(true);
    });

    it(": <=", function () {
        let rules = {
            target: [
                "user.value<=3000"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let user = {value: 2000};

        expect(policy.check(user)).to.equal(true);
    });

    it(": !=", function () {
        let rules = {
            target: [
                "user.value<=3000"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let user = {value: 2000};

        expect(policy.check(user)).to.equal(true);
    });

    it(": right expression", function () {
        let rules = {
            target: [
                "user.value<=(3000-2000)*env.value"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let user = {value: 100};
        let env = {value: 10};

        expect(policy.check(user, null, env)).to.equal(true);
    });

    it(": left expression", function () {
        let rules = {
            target: [
                "(3000-2000)*env.value>=user.value"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let user = {value: 100};
        let env = {value: 10};

        expect(policy.check(user, null, env)).to.equal(true);
    });

    it(": exception handling", function () {
        let rules = {
            target: [
                "(3000-2000)*env.valueuser.value"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let user = {value: 100};
        let env = {value: 10};

        expect(policy.check(user, null, env)).to.equal(false);
    });

    it(": empty target - permit", function () {
        let rules = {
            target: [
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let user = {value: 100};
        let env = {value: 10};

        expect(policy.check(user, null, env)).to.equal(true);
    });

    it(": empty target - deny", function () {
        let rules = {
            target: [
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let user = {value: 100};
        let env = {value: 10};

        expect(policy.check(user, null, env)).to.equal(true);
    });
});

