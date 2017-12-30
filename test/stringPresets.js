"use strict";

let expect = require('chai').expect;
let Policy = require('../dist/').Policy;

describe("String service functions", function () {
    it(": $trim", function () {
        let rules = {
            target: [
                "$trim(user.name)='Joe'"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let user = {name: '  Joe '};

        expect(policy.check(user)).to.equal(true);
    });

    it(": $uppercase", function () {
        let rules = {
            target: [
                "user.name=$uppercase('Joe')"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let user = {name: 'JOE'};

        expect(policy.check(user)).to.equal(true);
    });

    it(": $trim", function () {
        let rules = {
            target: [
                "user.name=$lowercase('Joe')"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);
        let user = {name: 'joe'};

        expect(policy.check(user)).to.equal(true);
    });
});