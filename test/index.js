var expect = require('chai').expect;
var should = require("chai").should;
var Policy = require('../dist/').Policy;

describe("iTemplate Tests", function () {
    beforeEach(function () {
    });

    afterEach(function () {
    });

    it("just a draft", function () {
        let rules = {
            target: [
                "user.total<=3000",
                "user.role='admin'"
            ],
            effect: "permit",
            algorithm: "all"
        };

        let policy = new Policy(rules);

        // validation date
        let user = {
            total: 2500,
            role: "admin"
        };

        let user2 = {
            total: 4500,
            role: "admin"
        };

        let user3 = {
            total: 3000,
            role: "super_admin"
        };


        expect(policy.check(user)).to.equal(true);
        expect(policy.check(user2)).to.equal(false);
        expect(policy.check(user3)).to.equal(false);
    });
});