var expect = require('chai').expect;
var should = require("chai").should;
var Policy = require('../dist/').Policy;

// user, action, env, resource
describe("Parsing Policies", function () {
    it("parsing policies: base functional, ==, pure object", function () {
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

    it("parsing policies: object attributes", function () {
        let rules = {
            target: [
                "user.name='Joe'"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let user = {name:'Joe'};

        expect(policy.check(user)).to.equal(true);
    });

    it("parsing policies: inner objects", function () {
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

    it("parsing policies: =", function () {
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

    it("parsing policies: >=", function () {
        let rules = {
            target: [
                "user.value>=3000"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let user = {value:4000};

        expect(policy.check(user)).to.equal(true);
    });

    it("parsing policies: <=", function () {
        let rules = {
            target: [
                "user.value<=3000"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let user = {value:2000};

        expect(policy.check(user)).to.equal(true);
    });

    it("parsing policies: !=", function () {
        let rules = {
            target: [
                "user.value<=3000"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let user = {value:2000};

        expect(policy.check(user)).to.equal(true);
    });

    it("parsing policies: right expression", function () {
        let rules = {
            target: [
                "user.value<=(3000-2000)*env.value"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let user = {value:100};
        let env = {value:10};

        expect(policy.check(user, null, env)).to.equal(true);
    });

    it("parsing policies: left expression", function () {
        let rules = {
            target: [
                "(3000-2000)*env.value>=user.value"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let user = {value:100};
        let env = {value:10};

        expect(policy.check(user, null, env)).to.equal(true);
    });
});